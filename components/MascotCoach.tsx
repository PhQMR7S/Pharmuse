'use client';
import CapsuleMascot,{type Mood} from './CapsuleMascot';
type Props={mood:Mood;language:'en'|'ar';compact?:boolean};
const copy:Record<Mood,{en:string;ar:string}>={
happy:{en:"Hey, future pharmacist! Ready for a tiny dose of genius?",ar:"هلا بصيدلي المستقبل! جاهز لجرعة ذكاء صغيرة؟"},
thinking:{en:"Pilly says: think of the mechanism, not just the name!",ar:"بيلّي يكلك: فكّر بآلية العمل، مو بس بالاسم!"},
celebrate:{en:"Boom! Correct! Even my headphones are celebrating!",ar:"يا سلام! إجابة صحيحة! حتى سماعاتي تحتفل وياك!"},
encourage:{en:"Almost! Every great pharmacist learns from a retry.",ar:"قريب! كل صيدلي شاطر يتعلم من المحاولة الثانية."}
};
export default function MascotCoach({mood,language,compact=false}:Props){
const message=copy[mood][language];return <div className={'mascot-coach '+(compact?'mascot-coach-compact':'')} role="status" aria-live="polite"><CapsuleMascot mood={mood} size={compact?72:110}/><div className="mascot-coach-message"><span className="coach-name">💊 Pilly · QMR7S</span><p>{message}</p></div></div>
}
