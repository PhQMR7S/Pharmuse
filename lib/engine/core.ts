import {DAY,INITIAL_ENGINE,type Answer,type EngineLesson,type EngineState,type Level,type Question,type Session} from './model';
export const contentQuestions=(lesson:EngineLesson)=>lesson.steps.flatMap(s=>s.kind==='final'?s.questions:s.kind==='checkpoint'||s.kind==='apply'?[s.question]:[]);
export function validAnswer(q:Question,a:unknown):a is Answer{
 if(q.kind==='choice'||q.kind==='hotspot')return typeof a==='string'&&q.options.some(o=>o.id===a);
 if(q.kind==='order')return Array.isArray(a)&&a.length===q.options.length&&a.every(x=>typeof x==='string'&&q.options.some(o=>o.id===x))&&new Set(a).size===a.length;
 return !!a&&typeof a==='object'&&!Array.isArray(a)&&Object.keys(a).length===q.left.length&&q.left.every(o=>typeof (a as Record<string,unknown>)[o.id]==='string'&&q.right.some(r=>r.id===(a as Record<string,string>)[o.id]))&&new Set(Object.values(a)).size===q.right.length;
}
export function editableAnswer(q:Question,a:unknown):a is Answer{
 if(q.kind==='choice'||q.kind==='hotspot')return validAnswer(q,a);
 if(q.kind==='order')return Array.isArray(a)&&a.length<=q.options.length&&new Set(a).size===a.length&&a.every(x=>typeof x==='string'&&q.options.some(o=>o.id===x));
 return !!a&&typeof a==='object'&&!Array.isArray(a)&&Object.entries(a).every(([key,val])=>q.left.some(o=>o.id===key)&&(val===''||q.right.some(o=>o.id===val)));
}
export function grade(q:Question,a:unknown):boolean{
 if(!validAnswer(q,a))return false;
 if(q.kind==='order')return (a as string[]).every((x,i)=>x===q.answer[i]);
 if(q.kind==='matching')return q.left.every(o=>(a as Record<string,string>)[o.id]===q.answer[o.id]);
 return a===q.answer;
}
export function assessLevel(samples:boolean[],fallback:Level):Level{
 if(samples.length<4)return fallback;
 const recent=samples.slice(-6),rate=recent.filter(Boolean).length/recent.length;
 return rate<.5?'beginner':rate>=.85?'advanced':'intermediate';
}
export function mastery(state:EngineState,id:string){const p=state.progress[id];if(!p?.completedAt)return 'not-completed';if(p.bestScore>=85&&p.retainedReviews>=2)return 'mastered';if(p.bestScore>=70)return 'proficient';return 'completed'}
export function lessonAccess(lesson:EngineLesson,options:{editorialPreview:boolean;entitled:boolean;approvedSources?:string[]}){
 if(!options.entitled)return {allowed:false,reason:'entitlement'} as const;
 if((lesson.status!=='published'||validatePublication(lesson,options.approvedSources).length>0)&&!options.editorialPreview)return {allowed:false,reason:'scientific-review'} as const;
 return {allowed:true,reason:lesson.status==='published'&&validatePublication(lesson,options.approvedSources).length===0?'published':'editorial-preview'} as const;
}
export function recommendation(state:EngineState,lessons:EngineLesson[]){return [...lessons].sort((a,b)=>a.position-b.position).find(l=>mastery(state,l.id)==='not-completed'||mastery(state,l.id)==='completed')??lessons.find(l=>mastery(state,l.id)!=='mastered')??lessons[0]}
export function openSession(state:EngineState,lesson:EngineLesson,id:string,now=Date.now(),mode:'learn'|'review'='learn',restart=false):EngineState{
 const old=state.sessions[lesson.id];
 if(state.results.some(r=>r.sessionId===id)||Object.values(state.sessions).some(s=>s.id===id&&s.lessonId!==lesson.id))return state;
 const session:Session=!restart&&old&&old.contentVersion===lesson.version&&!old.finished&&old.mode===mode?old:{id,lessonId:lesson.id,contentVersion:lesson.version,mode,cursor:0,visited:[lesson.steps[0].id],responses:{},checked:[],examSubmitted:false,finished:false,retentionEligible:mode==='review'&&!!state.progress[lesson.id]?.completedAt&&now>=state.progress[lesson.id].dueAt&&now>=(state.progress[lesson.id].retentionDueAt??Infinity),startedAt:now,updatedAt:now};
 return {...state,selectedLessonId:lesson.id,sessions:{...state.sessions,[lesson.id]:session}};
}
export function respond(state:EngineState,lesson:EngineLesson,q:Question,answer:Answer,now=Date.now()):EngineState{
 const s=state.sessions[lesson.id];if(!s||s.finished||!editableAnswer(q,answer))return state;
 const step=lesson.steps[s.cursor];const final=step.kind==='final';
 if(final&&(!step.questions.some(x=>x.id===q.id)||s.examSubmitted))return state;
 if(!final&&(!(step.kind==='checkpoint'||step.kind==='apply')||step.question.id!==q.id||s.checked.includes(q.id)))return state;
 return {...state,sessions:{...state.sessions,[lesson.id]:{...s,responses:{...s.responses,[q.id]:answer},updatedAt:now}}};
}
export function checkCheckpoint(state:EngineState,lesson:EngineLesson,now=Date.now()):EngineState{
 const s=state.sessions[lesson.id],step=s&&lesson.steps[s.cursor];
 if(!s||s.finished||!step||(step.kind!=='checkpoint'&&step.kind!=='apply')||s.checked.includes(step.question.id)||!validAnswer(step.question,s.responses[step.question.id]))return state;
 const correct=grade(step.question,s.responses[step.question.id]);
 const performance=[...state.performance,{sessionId:s.id,questionId:step.question.id,correct,at:now}].slice(-100);
 const old=state.progress[lesson.id];
 return {...state,performance,level:assessLevel(performance.map(x=>x.correct),state.level),progress:correct?state.progress:{...state.progress,[lesson.id]:{bestScore:old?.bestScore??0,lastScore:old?.lastScore??0,retainedReviews:old?.retainedReviews??0,dueAt:now,reviewInterval:0,retentionDueAt:old?.retentionDueAt??now+DAY,...(old?.completedAt?{completedAt:old.completedAt}:{})}},sessions:{...state.sessions,[lesson.id]:{...s,checked:[...s.checked,step.question.id],updatedAt:now}}};
}
export function submitExam(state:EngineState,lesson:EngineLesson,now=Date.now()):EngineState{
 const s=state.sessions[lesson.id],step=s&&lesson.steps[s.cursor];
 if(!s||s.finished||!step||step.kind!=='final'||s.examSubmitted||!step.questions.every(q=>validAnswer(q,s.responses[q.id])))return state;
 // One immutable outcome per session; hints and feedback are withheld until this point.
 const score=Math.round(step.questions.filter(q=>grade(q,s.responses[q.id])).length/step.questions.length*100);
 const old=state.progress[lesson.id],due=!!old&&old.dueAt<=now&&now-s.startedAt>=0;
 const retentionCredit=s.mode==='review'&&s.retentionEligible&&!!old?.completedAt&&score>=85;
 const retainedReviews=retentionCredit?(old?.retainedReviews??0)+1:score<85?0:old?.retainedReviews??0;
 const advanceSchedule=!old?.completedAt||due;
 const interval=score<70?0:retentionCredit?Math.min(60,Math.max(1,old?.reviewInterval??1)*3):1;
 const progress={...state.progress,[lesson.id]:{...old,bestScore:Math.max(old?.bestScore??0,score),lastScore:score,retainedReviews,retentionDueAt:advanceSchedule?now+Math.max(1,interval)*DAY:old.retentionDueAt,dueAt:advanceSchedule?now+interval*DAY:old.dueAt,reviewInterval:advanceSchedule?interval:old.reviewInterval}};
 return {...state,progress,results:[...state.results,{sessionId:s.id,lessonId:lesson.id,score,at:now,mode:s.mode,retentionCredit,answers:Object.fromEntries(step.questions.map(q=>[q.id,s.responses[q.id]])),correctQuestionIds:step.questions.filter(q=>grade(q,s.responses[q.id])).map(q=>q.id)}].slice(-200),sessions:{...state.sessions,[lesson.id]:{...s,examSubmitted:true,updatedAt:now}}};
}
export function advance(state:EngineState,lesson:EngineLesson,now=Date.now()):EngineState{
 const s=state.sessions[lesson.id];if(!s||s.finished||s.contentVersion!==lesson.version)return state;
 const step=lesson.steps[s.cursor];
 if((step.kind==='checkpoint'||step.kind==='apply')&&!s.checked.includes(step.question.id))return state;
 if(step.kind==='final'&&!s.examSubmitted)return state;
 if(s.cursor===lesson.steps.length-1){
  const questions=lesson.steps.flatMap(x=>x.kind==='checkpoint'||x.kind==='apply'?[x.question.id]:[]);
  if(!s.examSubmitted||!questions.every(id=>s.checked.includes(id))||lesson.steps.some(x=>!s.visited.includes(x.id)))return state;
  const old=state.progress[lesson.id];if(!old)return state;
  const rewarded=old.lastScore>=70&&!state.rewarded.includes(lesson.id)?[...state.rewarded,lesson.id]:state.rewarded;
  return {...state,rewarded,progress:{...state.progress,[lesson.id]:{...old,completedAt:old.completedAt??now}},sessions:{...state.sessions,[lesson.id]:{...s,finished:true,updatedAt:now}}};
 }
 const cursor=s.cursor+1;return {...state,sessions:{...state.sessions,[lesson.id]:{...s,cursor,visited:[...new Set([...s.visited,lesson.steps[cursor].id])],updatedAt:now}}};
}
export function back(state:EngineState,lesson:EngineLesson){const s=state.sessions[lesson.id];if(!s||s.cursor===0||s.finished||(lesson.steps[s.cursor].kind==='final'&&!s.examSubmitted))return state;return {...state,sessions:{...state.sessions,[lesson.id]:{...s,cursor:s.cursor-1}}}}
export function engineXP(state:EngineState){return state.rewarded.length*20}
export function hydrateEngine(input:unknown,lessons:EngineLesson[]):EngineState{
 // Local records are never treated as server-authoritative; reject malformed state and stale sessions.
 if(!input||typeof input!=='object'||(input as EngineState).version!==11)return {...INITIAL_ENGINE};
 try{
 const v=input as EngineState;const ids=new Set(lessons.map(l=>l.id));
 const sessions:EngineState['sessions']={};
 for(const [id,s] of Object.entries(v.sessions??{})){
  const l=lessons.find(x=>x.id===id);if(!l||!s||s.lessonId!==id||s.contentVersion!==l.version||!Number.isInteger(s.cursor)||s.cursor<0||s.cursor>=l.steps.length||typeof s.id!=='string'||!['learn','review'].includes(s.mode)||!Number.isFinite(s.startedAt)||!Number.isFinite(s.updatedAt))continue;
  const qs=contentQuestions(l);const responses=Object.fromEntries(Object.entries(s.responses??{}).filter(([qid,a])=>{const q=qs.find(x=>x.id===qid);return q&&editableAnswer(q,a)}));
  sessions[id]={...s,responses,visited:Array.isArray(s.visited)?s.visited.filter(x=>l.steps.some(step=>step.id===x)):[],checked:Array.isArray(s.checked)?s.checked.filter(x=>qs.some(q=>q.id===x)&&responses[x]!==undefined):[],examSubmitted:s.examSubmitted===true,finished:s.finished===true,retentionEligible:s.retentionEligible===true};
 }
 const progress=Object.fromEntries(Object.entries(v.progress??{}).filter(([id,p])=>ids.has(id)&&p&&Number.isFinite(p.bestScore)&&p.bestScore>=0&&p.bestScore<=100&&Number.isFinite(p.lastScore)&&p.lastScore>=0&&p.lastScore<=100&&Number.isFinite(p.dueAt)&&Number.isInteger(p.retainedReviews)&&p.retainedReviews>=0&&Number.isInteger(p.reviewInterval)&&p.reviewInterval>=0&&p.reviewInterval<=60&&Number.isFinite(p.retentionDueAt)&&(!p.completedAt||Number.isFinite(p.completedAt))));
 const results=Array.isArray(v.results)?v.results.filter(r=>r&&ids.has(r.lessonId)&&typeof r.sessionId==='string'&&Number.isFinite(r.score)&&r.score>=0&&r.score<=100&&Number.isFinite(r.at)&&['learn','review'].includes(r.mode)).slice(-200):[];
 const performance=Array.isArray(v.performance)?v.performance.filter(p=>p&&typeof p.sessionId==='string'&&typeof p.questionId==='string'&&typeof p.correct==='boolean').slice(-100):[];
 return {...INITIAL_ENGINE,sessions,progress,results,performance,rewarded:[...new Set(Array.isArray(v.rewarded)?v.rewarded.filter(id=>ids.has(id)&&progress[id]?.completedAt&&progress[id].bestScore>=70):[])],level:['beginner','intermediate','advanced'].includes(v.level)?v.level:'beginner',explanation:['auto','simple','detailed','clinical'].includes(v.explanation)?v.explanation:'auto',navigation:v.navigation==='explore'?'explore':'guided',selectedLessonId:ids.has(v.selectedLessonId??'')?v.selectedLessonId:undefined};
 }catch{return {...INITIAL_ENGINE}}
}
export function validatePublication(lesson:EngineLesson,approvedSources:readonly string[]=[]){
 const issues:string[]=[];if(!lesson.reviewedBy||!lesson.reviewedAt)issues.push('Scientific sign-off missing');
 if(lesson.steps.length<8||lesson.steps.length>12)issues.push('Expected 8–12 steps');
 const seen=new Set<string>();for(const q of contentQuestions(lesson)){if(seen.has(q.id))issues.push('Duplicate question id');seen.add(q.id);if(!q.reviewedBy||!q.reviewedAt)issues.push('Question approval missing: '+q.id);if(!q.prompt.en||!q.prompt.ar||!q.explanation.en||!q.explanation.ar||!q.citations.length)issues.push('Question localization/source missing: '+q.id)}
 for(const step of lesson.steps)if(!step.citations.length||!step.title.en||!step.title.ar)issues.push('Step localization/source missing: '+step.id);
 for(const ref of [...lesson.steps.flatMap(s=>s.citations),...contentQuestions(lesson).flatMap(q=>q.citations)])if(!approvedSources.includes(ref.sourceId))issues.push('Source clearance missing: '+ref.sourceId);
 if(!lesson.steps.some(s=>s.kind==='final'))issues.push('Final exam missing');return issues;
}

export function todayCompletions(state:EngineState,now=new Date()){
 const start=new Date(now);start.setHours(0,0,0,0);
 return Object.values(state.progress).filter(p=>p.completedAt&&p.completedAt>=start.getTime()&&p.completedAt<=now.getTime()).length;
}
