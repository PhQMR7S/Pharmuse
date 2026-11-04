export type Bilingual = {en:string;ar:string};
export type Level = 'beginner'|'intermediate'|'advanced';
export type ExplanationMode = 'auto'|'simple'|'detailed'|'clinical';
export type Citation = {sourceId:string;locator:string};
export type Option = {id:string;label:Bilingual};
export type Answer = string|string[]|Record<string,string>;
export type Question = {id:string;prompt:Bilingual;explanation:Bilingual;hint:Bilingual;citations:Citation[];reviewedBy?:string;reviewedAt?:string} & (
 {kind:'choice';options:Option[];answer:string}|
 {kind:'order';options:Option[];answer:string[]}|
 {kind:'matching';left:Option[];right:Option[];answer:Record<string,string>}|
 {kind:'hotspot';diagram:'receptor';options:Option[];answer:string}
);
export type CopyVariants={simple:Bilingual;detailed:Bilingual;clinical:Bilingual};
export type LessonStep = {id:string;title:Bilingual;citations:Citation[]} & (
 {kind:'hook'|'explain'|'mechanism'|'summary';copy:CopyVariants;diagram?:'receptor'|'adme'}|
 {kind:'checkpoint'|'apply';question:Question}|
 {kind:'final';questions:Question[]}
);
export type EngineLesson={id:string;version:number;unitId:string;position:number;title:Bilingual;objectives:Bilingual[];glossary:{term:string;meaning:Bilingual}[];status:'draft'|'published';reviewedBy?:string;reviewedAt?:string;steps:LessonStep[]};
export type Session={id:string;lessonId:string;contentVersion:number;mode:'learn'|'review';cursor:number;visited:string[];responses:Record<string,Answer>;checked:string[];examSubmitted:boolean;finished:boolean;retentionEligible:boolean;startedAt:number;updatedAt:number};
export type Result={sessionId:string;lessonId:string;score:number;at:number;mode:'learn'|'review';retentionCredit:boolean;answers:Record<string,Answer>;correctQuestionIds:string[]};
export type EngineProgress={completedAt?:number;bestScore:number;lastScore:number;retainedReviews:number;dueAt:number;reviewInterval:number;retentionDueAt:number};
export type Performance={sessionId:string;questionId:string;correct:boolean};
export type EngineState={version:11;sessions:Record<string,Session>;progress:Record<string,EngineProgress>;results:Result[];performance:Performance[];rewarded:string[];level:Level;explanation:ExplanationMode;navigation:'guided'|'explore';selectedLessonId?:string};
export const DAY=86400000;
export const INITIAL_ENGINE:EngineState={version:11,sessions:{},progress:{},results:[],performance:[],rewarded:[],level:'beginner',explanation:'auto',navigation:'guided'};
