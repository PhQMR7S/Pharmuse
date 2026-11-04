'use client';
import {useState} from 'react';
import QuestionView from '../learning/QuestionView';
import {answerExam,createExam,submitExam,type BankItem,type BankExam as Exam} from '@/lib/v12/core';
import {editableAnswer,validAnswer} from '@/lib/engine/core';
export default function BankExam({items,ar,onClose,onComplete}:{items:BankItem[];ar:boolean;onClose:()=>void;onComplete:(exam:Exam)=>void}){
 const [exam,setExam]=useState<Exam>(()=>createExam(crypto.randomUUID(),items));const submitted=exam.submittedAt!==undefined;
 return <section className="panel"><h2>{ar?'اختبار مستقل':'Independent exam'}</h2><p>{ar?'لا تلميحات أو تصحيح قبل الإرسال. النتيجة محلية ولا تمنح نقاطاً.':'No hints or feedback before submission. Local score; no XP.'}</p>{items.map(item=><QuestionView key={item.id} question={item.question} answer={exam.answers[item.id]} onChange={answer=>{if(!editableAnswer(item.question,answer))return;setExam(current=>validAnswer(item.question,answer)?answerExam(current,items,item.id,answer):{...current,answers:{...current.answers,[item.id]:answer}})}} disabled={submitted} feedback={submitted} ar={ar}/>)}{submitted?<p role="status">{ar?'النتيجة':'Score'}: {exam.score}%</p>:<button className="primary" disabled={!items.length||items.some(i=>!validAnswer(i.question,exam.answers[i.id]))} onClick={()=>{const next=submitExam(exam,items,Date.now());setExam(next);if(next.submittedAt!==undefined)onComplete(next)}}>{ar?'إرسال الاختبار':'Submit exam'}</button>}<button className="secondary" onClick={onClose}>{ar?'إغلاق الاختبار':'Close exam'}</button></section>
}
