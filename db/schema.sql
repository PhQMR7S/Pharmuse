-- DESIGN BLUEPRINT ONLY. Not applied: independent free Supabase project could not be created.
-- Apply to a fresh isolated project only after SQL review and integration tests.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.staff (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','reviewer'))
);
alter table public.staff enable row level security;
create policy staff_self_read on public.staff for select to authenticated using ((select auth.uid())=user_id);
grant select on public.staff to authenticated;
-- Staff provisioning is a trusted database administrator operation, never self-service.

create table public.sources (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 500),
 drive_file_id text, category text not null,
 rights_status text not null default 'pending' check(rights_status in ('pending','cleared','restricted')),
 review_status text not null default 'pending' check(review_status in ('pending','approved','rejected')),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 check(review_status<>'approved' or (reviewed_by is not null and reviewed_at is not null))
);
alter table public.sources enable row level security;
create policy staff_sources_read on public.sources for select to authenticated using (exists(select 1 from public.staff where user_id=(select auth.uid())));
create policy staff_sources_insert on public.sources for insert to authenticated with check(exists(select 1 from public.staff where user_id=(select auth.uid())));
create policy staff_sources_update on public.sources for update to authenticated using(exists(select 1 from public.staff where user_id=(select auth.uid()))) with check(exists(select 1 from public.staff where user_id=(select auth.uid())));
grant select,insert,update on public.sources to authenticated;

create table public.units (
 id text primary key, position int not null unique check(position>=0), title jsonb not null
);
create table public.lessons (
 id text primary key, unit_id text not null references public.units(id), position int not null check(position>=0),
 title jsonb not null, content jsonb not null, source_id uuid not null references public.sources(id),
 source_pages text not null check(length(source_pages)>0), status text not null default 'draft' check(status in ('draft','review','published')),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 unique(unit_id,position), check(status<>'published' or (reviewed_by is not null and reviewed_at is not null))
);
alter table public.units enable row level security;
alter table public.lessons enable row level security;
create policy units_read on public.units for select to anon,authenticated using(true);
create policy lessons_read on public.lessons for select to anon,authenticated using(status='published');
create policy staff_lessons_read on public.lessons for select to authenticated using(exists(select 1 from public.staff where user_id=(select auth.uid())));
create policy staff_lessons_write on public.lessons for all to authenticated using(exists(select 1 from public.staff where user_id=(select auth.uid()))) with check(exists(select 1 from public.staff where user_id=(select auth.uid())));
grant select on public.units,public.lessons to anon,authenticated;
grant insert,update,delete on public.lessons to authenticated;

create table private.questions (
 id uuid primary key default gen_random_uuid(), lesson_id text not null references public.lessons(id) on delete cascade,
 prompt jsonb not null, options jsonb not null, correct_index int not null check(correct_index>=0), explanation jsonb not null,
 check(jsonb_typeof(options)='array'), check(correct_index<jsonb_array_length(options))
);
-- Answer keys must never be returned by public SELECT or embedded in the production client.
create table public.attempts (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 question_id uuid not null references private.questions(id), correct boolean not null,
 created_at timestamptz not null default now()
);
create table public.completions (
 user_id uuid not null references auth.users(id) on delete cascade, lesson_id text not null references public.lessons(id),
 completed_at timestamptz not null default now(), primary key(user_id,lesson_id)
);
create table public.reviews (
 user_id uuid not null references auth.users(id) on delete cascade, lesson_id text not null references public.lessons(id),
 repetitions int not null default 0 check(repetitions>=0), interval_days int not null default 0 check(interval_days between 0 and 60),
 due_at timestamptz not null default now(), primary key(user_id,lesson_id)
);
alter table public.attempts enable row level security;
alter table public.completions enable row level security;
alter table public.reviews enable row level security;
create policy attempts_self on public.attempts for select to authenticated using(user_id=(select auth.uid()));
create policy completions_self on public.completions for select to authenticated using(user_id=(select auth.uid()));
create policy reviews_self on public.reviews for select to authenticated using(user_id=(select auth.uid()));
grant select on public.attempts,public.completions,public.reviews to authenticated;
-- No direct INSERT/UPDATE grants: scoring happens only in trusted functions.
create index attempts_user_time on public.attempts(user_id,created_at desc);
create index reviews_user_due on public.reviews(user_id,due_at);
create index lessons_unit on public.lessons(unit_id,position);

create function private.guard_publication() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='published' and not exists(select 1 from public.sources s where s.id=new.source_id and s.review_status='approved' and s.rights_status='cleared') then
  raise exception 'Source approval and reuse clearance required';
 end if;
 return new;
end;$$;
revoke all on function private.guard_publication() from public,anon,authenticated;
create trigger require_approved_source before insert or update on public.lessons for each row execute function private.guard_publication();

-- A thin authenticated RPC wrapper calls an internal privileged operation. Caller ownership,
-- published content, answer bounds and attempt idempotency are enforced.
create function private.submit_answer(p_attempt uuid,p_question uuid,p_answer int) returns jsonb
language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); q private.questions; l public.lessons; previous public.attempts; r public.reviews; ok boolean; n int; days int;
begin
 if uid is null then raise exception 'Authentication required'; end if;
 -- Serialize submissions per user; prevents cross-tab replay races.
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into previous from public.attempts where id=p_attempt;
 if found then
  if previous.user_id<>uid or previous.question_id<>p_question then raise exception 'Attempt id conflict'; end if;
  return jsonb_build_object('correct',previous.correct,'replayed',true);
 end if;
 select * into q from private.questions where id=p_question;
 if not found then raise exception 'Unknown question'; end if;
 select * into l from public.lessons where id=q.lesson_id and status='published';
 if not found then raise exception 'Lesson unavailable'; end if;
 -- V1.1: prerequisite order is a recommendation, never an access restriction.
 if p_answer is null or p_answer<0 or p_answer>=jsonb_array_length(q.options) then raise exception 'Invalid answer'; end if;
 ok:=p_answer=q.correct_index;
 insert into public.attempts(id,user_id,question_id,correct) values(p_attempt,uid,p_question,ok);
 select * into r from public.reviews where user_id=uid and lesson_id=l.id;
 -- Correct replays before due date do not extend spaced review or award new rewards.
 if not ok or r.user_id is null or r.due_at<=now() then
  n:=case when ok then coalesce(r.repetitions,0)+1 else 0 end;
  days:=case when not ok then 0 when n=1 then 1 when n=2 then 3 else least(60,coalesce(r.interval_days,3)*2) end;
  insert into public.reviews(user_id,lesson_id,repetitions,interval_days,due_at) values(uid,l.id,n,days,now()+make_interval(days=>days))
  on conflict(user_id,lesson_id) do update set repetitions=excluded.repetitions,interval_days=excluded.interval_days,due_at=excluded.due_at;
 end if;
 if ok and not exists(select 1 from private.questions other where other.lesson_id=l.id and not exists(select 1 from public.attempts a where a.user_id=uid and a.question_id=other.id and a.correct)) then
  insert into public.completions(user_id,lesson_id) values(uid,l.id) on conflict do nothing;
 end if;
 return jsonb_build_object('correct',ok,'explanation',q.explanation,'xp',(select count(*)*20 from public.completions where user_id=uid));
end;$$;
revoke all on function private.submit_answer(uuid,uuid,int) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.submit_answer(uuid,uuid,int) to authenticated;
create function public.submit_answer(p_attempt uuid,p_question uuid,p_answer int) returns jsonb language sql security invoker set search_path='' as $$ select private.submit_answer(p_attempt,p_question,p_answer) $$;
revoke all on function public.submit_answer(uuid,uuid,int) from public,anon;
grant execute on function public.submit_answer(uuid,uuid,int) to authenticated;
