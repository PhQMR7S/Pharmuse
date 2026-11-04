export type Progress={completed:string[];xp:number};
export const initialProgress:Progress={completed:[],xp:0};
export function completeLesson(progress:Progress,id:string,correct:boolean):Progress{if(!correct||progress.completed.includes(id))return progress;return {completed:[...progress.completed,id],xp:progress.xp+20}}
export function readProgress():Progress{try{const raw=localStorage.getItem('pharmuse-next-v1');if(!raw)return initialProgress;const parsed:unknown=JSON.parse(raw);if(!parsed||typeof parsed!=='object')return initialProgress;const p=parsed as Record<string,unknown>;return {completed:Array.isArray(p.completed)?p.completed.filter((v):v is string=>typeof v==='string'):[],xp:typeof p.xp==='number'&&Number.isFinite(p.xp)&&p.xp>=0?p.xp:0}}catch{return initialProgress}}
export function saveProgress(progress:Progress){try{localStorage.setItem('pharmuse-next-v1',JSON.stringify(progress))}catch{/* private browsing may disallow persistence */}}
