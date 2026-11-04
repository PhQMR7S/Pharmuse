import {createClient} from '@supabase/supabase-js';
export async function authorize(request:Request,admin=false){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return {error:'Service not configured',status:503} as const;
 const token=request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return {error:'Authentication required',status:401} as const;
 const db=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
 const {data,error}=await db.auth.getUser(token);
 if(error||!data.user)return {error:'Invalid session',status:401} as const;
 if(admin){const {data:role,error:roleError}=await db.from('staff').select('user_id').eq('user_id',data.user.id).maybeSingle();if(roleError||!role)return {error:'Administrator access required',status:403} as const;}
 return {db,user:data.user} as const;
}
