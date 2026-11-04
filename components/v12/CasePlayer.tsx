'use client';
import {useState} from 'react';
import QuestionView from '../learning/QuestionView';
import {validAnswer} from '@/lib/engine/core';
import {startCase,advanceCase,type ClinicalCase} from '@/lib/v12/core';
import type {Answer} from '@/lib/engine/model';
export default function CasePlayer({content,ar}:{content:ClinicalCase;ar:boolean}){
 const [session,setSession]=useState(()=>startCase(content)),[answer,setAnswer]=useState<Answer>(),[checked,setChecked]=useState(false);
 const step=content.stages[session.cursor];if(!step)return null;const label=(x:{en:string;ar:string})=>ar?x.ar:x.en;
 return <section className="panel"><h2>{label(content.title)}</h2><p>{session.cursor+1}/{content.stages.length}</p><h3>{label(step.title)}</h3><p>{label(step.body)}</p>{step.question&&<QuestionView question={step.question} answer={answer} onChange={setAnswer} disabled={checked} feedback={checked} ar={ar}/>}{session.completed?<p role="status">{ar?'اكتملت مراجعة الحالة محلياً، دون نقاط XP.':'Case completed locally, without XP.'}</p>:step.question&&!checked?<button className="primary" disabled={!validAnswer(step.question,answer)} onClick={()=>setChecked(true)}>{ar?'تحقق من القرار':'Check decision'}</button>:<button className="primary" onClick={()=>{const next=advanceCase(content,session,answer);setSession(next);if(!next.completed){setAnswer(undefined);setChecked(false)}}}>{ar?'تابع':'Continue'}</button>}</section>
}
