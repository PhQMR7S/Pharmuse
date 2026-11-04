import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';
export default function ResponsiveQA(){
 if(process.env.VERCEL_ENV!=='preview')notFound();
 return <main style={{padding:24,background:'#ece5f3',minHeight:'100vh'}}><h1 style={{fontSize:20,marginBottom:10}}>Pharmuse · Responsive visual verification</h1><p style={{marginBottom:20}}>Internal QA surface · Actual iframe viewports · Preview deployments only</p><div style={{display:'flex',gap:24,alignItems:'flex-start',flexWrap:'wrap'}}>{[{width:390,height:844,label:'Phone · 390 × 844'},{width:768,height:1024,label:'Tablet · 768 × 1024'}].map(x=><section key={x.width}><h2 style={{fontSize:14,marginBottom:10}}>{x.label}</h2><iframe title={x.label} src="/#learn" style={{width:x.width,height:x.height,border:'1px solid #cbb4dc',borderRadius:16,background:'white'}}/></section>)}</div></main>;
}
