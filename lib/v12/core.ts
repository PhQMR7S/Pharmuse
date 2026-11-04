import type {Answer,Bilingual,Question} from '../engine/model';
import {grade,validAnswer} from '../engine/core';
import {canStartV12,type V11Acceptance} from '../engine/release';
export type Review={reviewer:string;reviewedAt:string;sourceVerified:boolean};
export type BankItem={id:string;topic:string;stage:string;difficulty:'beginner'|'intermediate'|'advanced';question:Question;review?:Review;ministerial?:{year:number;round:string;authority:string;sourceUrl:string;verified:boolean}};
export type Attempt={id:string;itemId:string;correct:boolean;answer:Answer;at:number};
export type BankState={version:12;saved:string[];attempts:Attempt[]};
export const emptyBank=():BankState=>({version:12,saved:[],attempts:[]});
export type Filter={topic?:string;stage?:string;difficulty?:string;year?:string;round?:string;mode?:'all'|'wrong'|'saved'|'unsolved';ministerial?:boolean};
export function released(item:BankItem,gates:V11Acceptance){return canStartV12(gates)&&!!item.review?.reviewer.trim()&&Number.isFinite(Date.parse(item.review.reviewedAt))&&item.review.sourceVerified&&item.question.citations.length>0&&!!item.question.reviewedBy?.trim()&&Number.isFinite(Date.parse(item.question.reviewedAt??''))&&(!item.ministerial||(item.ministerial.verified&&/^https:\/\//.test(item.ministerial.sourceUrl)&&!!item.ministerial.authority.trim()&&Number.isInteger(item.ministerial.year)&&item.ministerial.year>=1900&&!!item.ministerial.round.trim()))}
export function filterBank(items:BankItem[],state:BankState,f:Filter){return items.filter(x=>{
 const last=[...state.attempts].reverse().find(a=>a.itemId===x.id);
 return (!f.ministerial||!!x.ministerial?.verified)&&(!f.topic||x.topic===f.topic)&&(!f.stage||x.stage===f.stage)&&(!f.difficulty||x.difficulty===f.difficulty)&&(!f.year||String(x.ministerial?.year)===f.year)&&(!f.round||x.ministerial?.round===f.round)&&(!(f.mode==='wrong')||last?.correct===false)&&(!(f.mode==='saved')||state.saved.includes(x.id))&&(!(f.mode==='unsolved')||!last);
})}
export function recordAttempt(state:BankState,item:BankItem,answer:Answer,id:string,at:number):BankState{
 if(!id.trim()||!Number.isFinite(at)||at<0||!validAnswer(item.question,answer)||state.attempts.some(x=>x.id===id))return state;
 return {...state,attempts:[...state.attempts,{id,itemId:item.id,answer:structuredClone(answer),correct:grade(item.question,answer),at}]};
}
export function toggleSaved(state:BankState,id:string):BankState{return {...state,saved:state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id]}}
export function hydrateBank(raw:unknown,items:BankItem[]):BankState{
 if(!raw||typeof raw!=='object')return emptyBank();const x=raw as BankState;if(x.version!==12||!Array.isArray(x.saved)||!Array.isArray(x.attempts))return emptyBank();
 let s=emptyBank();s.saved=[...new Set(x.saved.filter(id=>typeof id==='string'&&items.some(i=>i.id===id)))];
 for(const a of x.attempts){if(!a||typeof a!=='object')continue;const i=items.find(i=>i.id===a.itemId);if(i&&typeof a.id==='string')s=recordAttempt(s,i,a.answer,a.id,a.at)}return s;
}
export type CaseStage={id:string;kind:'patient'|'investigations'|'decision'|'interpretation';title:Bilingual;body:Bilingual;question?:Question};
export type ClinicalCase={id:string;title:Bilingual;stages:CaseStage[];review?:Review};
export type CaseSession={caseId:string;cursor:number;answers:Record<string,Answer>;checked:string[];completed:boolean};
export function startCase(c:ClinicalCase):CaseSession{return {caseId:c.id,cursor:0,answers:{},checked:[],completed:false}}
export function advanceCase(c:ClinicalCase,s:CaseSession,answer?:Answer):CaseSession{
 if(s.caseId!==c.id||s.completed||!Number.isInteger(s.cursor)||s.cursor<0||c.stages.slice(0,s.cursor).some(step=>!s.checked.includes(step.id)))return s;const step=c.stages[s.cursor];if(!step||(step.question&&!validAnswer(step.question,answer)))return s;
 return {...s,answers:step.question?{...s.answers,[step.id]:structuredClone(answer!)}:s.answers,checked:[...new Set([...s.checked,step.id])],cursor:Math.min(s.cursor+1,c.stages.length-1),completed:s.cursor===c.stages.length-1};
}
export function bankStats(state:BankState,items:BankItem[]){const latest=items.map(i=>[...state.attempts].reverse().find(a=>a.itemId===i.id)).filter((a):a is Attempt=>!!a);return {answered:latest.length,correct:latest.filter(a=>a.correct).length,total:items.length};}
export type BankExam={id:string;itemIds:string[];answers:Record<string,Answer>;submittedAt?:number;score?:number};
export function createExam(id:string,items:BankItem[]):BankExam{return {id,itemIds:[...new Set(items.map(i=>i.id))],answers:{}}}
export function answerExam(exam:BankExam,items:BankItem[],itemId:string,answer:Answer):BankExam{const item=items.find(i=>i.id===itemId);if(exam.submittedAt!==undefined||!exam.itemIds.includes(itemId)||!item||!validAnswer(item.question,answer))return exam;return {...exam,answers:{...exam.answers,[itemId]:structuredClone(answer)}}}
export function submitExam(exam:BankExam,items:BankItem[],at:number):BankExam{
 if(exam.submittedAt!==undefined||!Number.isFinite(at)||at<0||!exam.itemIds.length)return exam;
 const selected=exam.itemIds.map(id=>items.find(i=>i.id===id));if(selected.some(i=>!i||!validAnswer(i.question,exam.answers[i.id])))return exam;
 return {...exam,submittedAt:at,score:Math.round(selected.filter(i=>i&&grade(i.question,exam.answers[i.id])).length/selected.length*100)};
}
