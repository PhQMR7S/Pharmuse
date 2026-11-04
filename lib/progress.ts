export type Progress={completed:string[];xp:number};
export const initialProgress:Progress={completed:[],xp:0};
const STORAGE_KEY='pharmuse-next-v1';
export function completeLesson(progress:Progress,id:string,correct:boolean):Progress{
 if(!correct||progress.completed.includes(id))return progress;
 const completed=[...progress.completed,id];
 return {completed,xp:completed.length*20};
}
export function readProgress():Progress{
 try{
  const raw=localStorage.getItem(STORAGE_KEY);
  if(!raw)return initialProgress;
  const parsed:unknown=JSON.parse(raw);
  if(!parsed||typeof parsed!=='object')return initialProgress;
  const p=parsed as Record<string,unknown>;
  const completed=Array.isArray(p.completed)?[...new Set(p.completed.filter((v):v is string=>typeof v==='string'&&v.length>0))]:[];
  // XP is derived from unique completed lessons; it is not an independently trusted stored balance.
  return {completed,xp:completed.length*20};
 }catch{return initialProgress}
}
export function saveProgress(progress:Progress){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify({completed:[...new Set(progress.completed)],xp:progress.completed.length*20}))}catch{}
}
