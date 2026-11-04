import {authorize} from '@/lib/server/access';
export async function GET(request:Request){
 const auth=await authorize(request,true);
 if('error' in auth)return Response.json({error:auth.error},{status:auth.status});
 const {data,error}=await auth.db.from('sources').select('id,title,category,review_status,rights_status,reviewed_at').order('title').limit(200);
 if(error)return Response.json({error:'Source inventory unavailable'},{status:503});
 return Response.json({inventory:data},{headers:{'Cache-Control':'private, no-store'}});
}
