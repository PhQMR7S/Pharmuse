export type LearningState = {version:2; completed:string[]; xp:number; reviews:Review[]; attempts:Attempt[]; dailyGoal:number};
export type Review = {id:string;dueAt:number;interval:number;repetitions:number};
export type Attempt = {id:string;lessonId:string;correct:boolean;at:number};
export const LESSON_IDS=['receptors','adme','beta'];
export const emptyState:LearningState={version:2,completed:[],xp:0,reviews:[],attempts:[],dailyGoal:1};
const DAY=86400000;
export function sanitizeState(value:unknown):LearningState{
 if(!value||typeof value!=='object')return {...emptyState};
 const v=value as Partial<LearningState>;
 const completed=[...new Set(Array.isArray(v.completed)?v.completed.filter(x=>LESSON_IDS.includes(x)):[])];
 const reviews=Array.isArray(v.reviews)?v.reviews.filter(x=>x&&LESSON_IDS.includes(x.id)&&Number.isFinite(x.dueAt)&&Number.isInteger(x.interval)&&x.interval>=0&&x.interval<=60&&Number.isInteger(x.repetitions)&&x.repetitions>=0):[];
 const attempts=Array.isArray(v.attempts)?v.attempts.filter(x=>x&&typeof x.id==='string'&&LESSON_IDS.includes(x.lessonId)&&typeof x.correct==='boolean'&&Number.isFinite(x.at)).slice(-500):[];
 return {version:2,completed,xp:completed.length*20,reviews:[...new Map(reviews.map(x=>[x.id,x])).values()],attempts:[...new Map(attempts.map(x=>[x.id,x])).values()],dailyGoal:[1,2,3].includes(v.dailyGoal??0)?v.dailyGoal!:1};
}
export function recordAttempt(state:LearningState,attempt:Attempt):LearningState{
 if(!LESSON_IDS.includes(attempt.lessonId)||!Number.isFinite(attempt.at)||state.attempts.some(x=>x.id===attempt.id))return state;
 const old=state.reviews.find(x=>x.id===attempt.lessonId);
 const repetitions=attempt.correct?(old?.repetitions??0)+1:0;
 const interval=attempt.correct?(repetitions===1?1:repetitions===2?3:Math.min(60,(old?.interval??3)*2)):0;
 return {...state,attempts:[...state.attempts,attempt].slice(-500),reviews:[...state.reviews.filter(x=>x.id!==attempt.lessonId),{id:attempt.lessonId,dueAt:attempt.at+interval*DAY,interval,repetitions}]};
}
export function finishLesson(state:LearningState,id:string):LearningState{
 if(!LESSON_IDS.includes(id)||state.completed.includes(id)||!state.attempts.some(x=>x.lessonId===id&&x.correct))return state;
 const index=LESSON_IDS.indexOf(id);if(index>0&&!state.completed.includes(LESSON_IDS[index-1]))return state;
 const completed=[...state.completed,id];return {...state,completed,xp:completed.length*20};
}
export function dueReviews(state:LearningState,now=Date.now()){return state.reviews.filter(x=>x.dueAt<=now)}
export function accuracy(state:LearningState){return state.attempts.length?Math.round(state.attempts.filter(x=>x.correct).length/state.attempts.length*100):0}
export function todayCount(state:LearningState,now=new Date()){const start=new Date(now);start.setHours(0,0,0,0);return new Set(state.attempts.filter(x=>x.correct&&x.at>=start.getTime()).map(x=>x.lessonId)).size}
