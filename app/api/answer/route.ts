import {authorize} from '@/lib/server/access';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(request:Request){
 const auth=await authorize(request);if('error' in auth)return Response.json({error:auth.error},{status:auth.status});
 if(Number(request.headers.get('content-length')??0)>4096)return Response.json({error:'Payload too large'},{status:413});
 let body;try{body=await request.json()}catch{return Response.json({error:'Invalid JSON'},{status:400})}
 if(!body||!uuid.test(body.attemptId)||!uuid.test(body.questionId)||!Number.isInteger(body.answer)||body.answer<0||body.answer>20)return Response.json({error:'Invalid answer payload'},{status:400});
 const {data,error}=await auth.db.rpc('submit_answer',{p_attempt:body.attemptId,p_question:body.questionId,p_answer:body.answer});
 if(error)return Response.json({error:'Answer could not be accepted'},{status:422});
 return Response.json(data,{headers:{'Cache-Control':'private, no-store'}});
}
