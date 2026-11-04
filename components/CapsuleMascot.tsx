'use client';
import {useState} from 'react';
export type Mood='happy'|'thinking'|'celebrate'|'encourage';
export default function CapsuleMascot({mood='happy',size=170}:{mood?:Mood;size?:number}){
 const [waving,setWaving]=useState(false);const happy=mood==='celebrate'||waving;
 return <button className="pilly-button" type="button" aria-label="QMR7S capsule mascot — wave hello" onClick={()=>setWaving(x=>!x)} style={{width:size,maxWidth:'100%',border:0,background:'transparent',padding:0,cursor:'pointer'}} title="Say hello to Pilly!">
 <svg viewBox="0 0 260 360" width="100%" role="img" aria-label="Blue and orange capsule mascot with headset, glasses, gloves and trainers">
 <defs><linearGradient id="qblue" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#a4f4ff"/><stop offset=".42" stopColor="#17b4f2"/><stop offset="1" stopColor="#1660c8"/></linearGradient><linearGradient id="qorange" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#ffbd58"/><stop offset=".55" stopColor="#ff7a24"/><stop offset="1" stopColor="#dc4c18"/></linearGradient><linearGradient id="qglass" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#ddfbff" stopOpacity=".75"/><stop offset="1" stopColor="#7fd9ff" stopOpacity=".15"/></linearGradient></defs>
 <ellipse cx="130" cy="344" rx="80" ry="8" fill="#4d4e94" opacity=".13"/>
 <g fill="none" stroke="#f1782e" strokeWidth="12" strokeLinecap="round"><path d="M65 184 Q36 214 20 180"/><path d={happy?'M195 180 Q235 158 240 105':'M195 180 Q231 175 237 136'}/><path d="M111 281 Q105 309 88 321"/><path d="M159 281 Q171 306 189 321"/></g>
 <g fill="#f6f8ff" stroke="#7e94ba" strokeWidth="3"><path d="M12 171 Q-1 155 13 150 L27 161 L31 178 L19 187Z"/><path d="M226 121 Q218 110 225 102 L234 110 L240 96 Q245 92 248 100 L248 119 L255 111 Q262 113 256 128 L243 145 L230 142Z"/></g>
 <g><path d="M66 320 Q85 310 104 321 L108 340 Q86 353 62 341Z" fill="#168bd4" stroke="#385ba4" strokeWidth="4"/><path d="M170 322 Q190 311 204 324 L211 341 Q187 354 168 341Z" fill="#168bd4" stroke="#385ba4" strokeWidth="4"/><path d="M68 328 L101 329 M174 329 L202 331" stroke="#fff" strokeWidth="5" strokeLinecap="round"/></g>
 <rect x="66" y="35" width="130" height="248" rx="65" fill="url(#qblue)" stroke="#2674ba" strokeWidth="5"/>
 <path d="M66 154 H196 V218 Q196 283 131 283 Q66 283 66 218Z" fill="url(#qorange)"/><path d="M66 154 H196" stroke="#eb8c44" strokeWidth="4"/>
 <path d="M81 76 Q88 50 112 47" stroke="#fff" strokeOpacity=".7" strokeWidth="9" fill="none" strokeLinecap="round"/>
 <path d="M62 101 Q59 10 131 10 Q206 10 201 104" fill="none" stroke="#165ba8" strokeWidth="11" strokeLinecap="round"/><path d="M63 100 Q62 18 131 18 Q199 18 201 101" fill="none" stroke="#57c6f7" strokeWidth="5"/>
 <rect x="52" y="91" width="22" height="57" rx="11" fill="#2684d5" stroke="#17589f" strokeWidth="4"/><rect x="192" y="91" width="23" height="57" rx="11" fill="#2684d5" stroke="#17589f" strokeWidth="4"/>
 <rect x="78" y="88" width="108" height="65" rx="20" fill="url(#qglass)" stroke="#7de6ff" strokeWidth="5"/><path d="M131 89 V153" stroke="#7de6ff" strokeWidth="3"/>
 <path d="M86 78 Q99 64 111 78 M149 78 Q163 65 176 78" stroke="#1b4786" strokeWidth="7" fill="none" strokeLinecap="round"/>
 <ellipse cx="106" cy="117" rx="19" ry="24" fill="#fff"/><ellipse cx="157" cy="117" rx="19" ry="24" fill="#fff"/><ellipse cx="110" cy="119" rx="10" ry="16" fill="#2278bc"/><ellipse cx="155" cy="119" rx="10" ry="16" fill="#2278bc"/><circle cx="113" cy="113" r="4" fill="#fff"/><circle cx="158" cy="113" r="4" fill="#fff"/>
 <path d={mood==='thinking'?'M115 168 Q134 164 147 168':happy?'M106 165 Q133 209 160 165Z':'M107 164 Q133 199 160 164Z'} fill={mood==='thinking'?'none':'#6e1933'} stroke="#76334b" strokeWidth="4" strokeLinejoin="round"/>
 <path d="M211 138 Q220 159 180 165" stroke="#174b90" strokeWidth="5" fill="none" strokeLinecap="round"/><ellipse cx="180" cy="165" rx="12" ry="7" fill="#194c8f"/>
 <path d="M116 209 Q128 197 140 209 L152 199 L162 211 L142 229 L128 219 L118 225Z" fill="#a7f5ff" stroke="#fff" strokeWidth="2"/>
 <text x="131" y="255" textAnchor="middle" fill="white" stroke="#2762a7" strokeWidth=".7" fontWeight="900" fontSize="26" letterSpacing="-1">QMR7S</text>
 <path d="M222 44 l5 -12 5 12 12 5 -12 5 -5 12 -5 -12 -12 -5Z" fill="#ffca43"/>
 </svg></button>
}
