import {authorize} from '@/lib/server/access';
export async function GET(request:Request){
 const auth=await authorize(request);if('error' in auth)return Response.json({error:auth.error},{status:auth.status});
 const results=await Promise.all([auth.db.from('completions').select('lesson_id,completed_at').eq('user_id',auth.user.id),auth.db.from('reviews').select('lesson_id,due_at,interval_days,repetitions').eq('user_id',auth.user.id),auth.db.from('attempts').select('id,question_id,correct,created_at').eq('user_id',auth.user.id).order('created_at',{ascending:false}).limit(500)]);
 if(results.some(x=>x.error))return Response.json({error:'Progress unavailable'},{status:503});
 return Response.json({completed:results[0].data,xp:(results[0].data?.length??0)*20,reviews:results[1].data,attempts:results[2].data},{headers:{'Cache-Control':'private, no-store'}});
}
