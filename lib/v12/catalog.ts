import {engineLessons} from '../engine/catalog';
import type {BankItem,ClinicalCase} from './core';
// Reuses explicitly draft, source-linked questions. No fabricated ministerial provenance.
export const previewBank:BankItem[]=engineLessons.flatMap(lesson=>lesson.steps.flatMap(step=>('question' in step?[step.question]:step.kind==='final'?step.questions:[]).map(question=>({id:question.id,topic:lesson.id,stage:'foundation',difficulty:'beginner' as const,question}))));
// Scientific cases must be independently reviewed before ingestion.
export const clinicalCases:ClinicalCase[]=[];
