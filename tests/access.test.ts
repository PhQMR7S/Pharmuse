import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET as library} from '../app/api/library/route';
import {GET as progress} from '../app/api/progress/route';
import {POST as answer} from '../app/api/answer/route';
for(const [name,route] of [['library',library],['progress',progress],['answer',answer]] as const){
 test(`${name} fails closed when no dedicated database is configured`,async()=>{
  const oldURL=process.env.NEXT_PUBLIC_SUPABASE_URL,oldKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  try{const response=await route(new Request('https://pharmuse.test/api/'+name));assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'Service not configured'})}
  finally{if(oldURL)process.env.NEXT_PUBLIC_SUPABASE_URL=oldURL;if(oldKey)process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=oldKey}
 });
}
