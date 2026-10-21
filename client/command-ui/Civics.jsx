import React,{useState} from 'react';
import {Landmark,ArrowRight,Network,HeartHandshake,Orbit,Lock,Check,Box,Diamond,Droplets,FlaskConical,Timer} from 'lucide-react';
import {civicTracks,civicPolicies,civicPolicy,civicState,CIVIC_COOLDOWN} from '../../game/civics.mjs';
import {Resources,stock,remaining,Dialog,Pill} from './shared.jsx';

const icons={administration:Network,welfare:HeartHandshake,commerce:Orbit};
const effectRows=[['金属',Box],['晶体',Diamond],['气体',Droplets],['研究',FlaskConical]];
const C=200,rings={1:[74,118],2:[126,172]};
const percent=n=>`${n>0?'+':''}${Math.round(n*100)}%`;
const polar=(r,deg)=>{const a=(deg-90)*Math.PI/180;return [C+r*Math.cos(a),C+r*Math.sin(a)];};
function arc(r0,r1,a0,a1){const [x0,y0]=polar(r1,a0),[x1,y1]=polar(r1,a1),[x2,y2]=polar(r0,a1),[x3,y3]=polar(r0,a0),large=a1-a0>180?1:0;return `M${x0} ${y0}A${r1} ${r1} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${large} 0 ${x3} ${y3}Z`;}
const sector=policy=>{const i=civicTracks.findIndex(t=>t.id===policy.track);return [i*120+3,i*120+117];};

export function EffectBars({policy}){
 const values=policy?[...policy.production,policy.research]:[0,0,0,0];
 return <div className="civic-bars">{effectRows.map(([name,Icon],i)=>{const n=values[i],w=Math.min(1,Math.abs(n)/.3)*50;return <div key={name} className={n>0?'up':n<0?'down':'flat'}><Icon size={14}/><span>{name}</span><i><b style={{width:w+'%',[n<0?'right':'left']:'50%'}}/></i><em>{n?percent(n):'—'}</em></div>;})}</div>;
}

export default function Civics({api,act}){
 const state=civicState(api.state.player),active=civicPolicy(state.active),[confirm,setConfirm]=useState(null),cooling=api.now<state.nextChangeAt;
 const [selectedId,setSelectedId]=useState(state.active||civicPolicies[0].id);
 const selected=civicPolicy(selectedId),unlocked=state.unlocked.includes(selected.id),locked=selected.requires&&!state.unlocked.includes(selected.requires),poor=selected.cost.some((n,i)=>n>stock(api.planet)[i]);
 const status=p=>state.active===p.id?'生效中':state.unlocked.includes(p.id)?'已解锁':p.requires&&!state.unlocked.includes(p.requires)?'需要前置':'可解锁';
 const cool=cooling?Math.min(1,(state.nextChangeAt-api.now)/CIVIC_COOLDOWN):0,ring=2*Math.PI*58,ActiveIcon=active?icons[active.track]:Landmark;
 const submit=async()=>{if(await act({type:'civic',planet:api.planet.id,mode:'adopt',id:confirm.id},'施政方针已更新'))setConfirm(null);};
 const SelectedIcon=icons[selected.track];
 return <div className="civic-screen">
  <section className="civic-dome glass">
   <header className="civic-dome-head"><span className="eyebrow">CIVIC DOME</span><b>{state.unlocked.length}<small> / {civicPolicies.length}</small></b></header>
   <svg className="civic-dial" viewBox="0 0 400 400" role="group" aria-label="市政方针">
    <defs><radialGradient id="civic-core"><stop offset="0" stopColor="#a6dbc6" stopOpacity=".28"/><stop offset="1" stopColor="#a6dbc6" stopOpacity="0"/></radialGradient></defs>
    {[60,122,180,194].map(r=><circle key={r} className="civic-guide" cx={C} cy={C} r={r}/>)}
    {civicTracks.map((t,i)=>{const [x,y]=polar(190,i*120);const [lx,ly]=polar(186,i*120+60);return <g key={t.id}><line className="civic-guide" x1={C} y1={C} x2={x} y2={y}/><text className="civic-track-label" x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">{t.name}</text></g>;})}
    {civicPolicies.map(p=>{const [a0,a1]=sector(p),[r0,r1]=rings[p.tier],s=status(p),Icon=icons[p.track],[ix,iy]=polar((r0+r1)/2,(a0+a1)/2);
     return <g key={p.id} className={`civic-arc ${s==='需要前置'?'locked':s==='生效中'?'active':s==='已解锁'?'unlocked':'open'} ${selected.id===p.id?'selected':''}`} role="button" tabIndex={0} aria-pressed={selected.id===p.id} aria-label={`${p.name}，${s}`} onClick={()=>setSelectedId(p.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelectedId(p.id);}}}>
      <path d={arc(r0,r1,a0,a1)}/><Icon x={ix-11} y={iy-17} width={22} height={22}/><text x={ix} y={iy+16} textAnchor="middle">{p.tier===1?'I':'II'}</text>{s==='需要前置'&&<Lock x={ix+12} y={iy-20} width={11} height={11}/>}
     </g>;})}
    <circle cx={C} cy={C} r={56} fill="url(#civic-core)"/>
    <circle className="civic-cool-track" cx={C} cy={C} r={58}/>
    {cooling&&<circle className="civic-cool" cx={C} cy={C} r={58} strokeDasharray={ring} strokeDashoffset={ring*(1-cool)} transform={`rotate(-90 ${C} ${C})`}/>}
    <ActiveIcon className={'civic-core-icon '+(active?'on':'')} x={C-18} y={C-30} width={36} height={36}/>
    <text className="civic-core-name" x={C} y={C+22} textAnchor="middle">{active?.name||'常态治理'}</text>
   </svg>
   <footer className="civic-active-strip"><EffectBars policy={active}/><div className="civic-cooldown">{cooling?<><Timer size={14}/>{remaining(state.nextChangeAt,api.now)}</>:<><Check size={14}/>可调整</>}{active&&<button className="secondary" disabled={api.busy||cooling} onClick={()=>setConfirm({id:null,name:'常态治理'})}>恢复常态</button>}</div></footer>
  </section>
  <aside className="civic-card glass">
   <div className="civic-card-title"><span className={'civic-emblem '+selected.track}><SelectedIcon size={28}/></span><div><Pill tone={state.active===selected.id?'mint':locked?'neutral':unlocked?'mint':'amber'}>{status(selected)}</Pill><h2>{selected.name}</h2><small>{civicTracks.find(t=>t.id===selected.track)?.name} · {selected.tier===1?'I':'II'}</small></div></div>
   <p className="civic-line">{selected.description}</p>
   <EffectBars policy={selected}/>
   {selected.requires&&<button className={'civic-chain '+(locked?'locked':'')} onClick={()=>setSelectedId(selected.requires)}>{locked?<Lock size={13}/>:<Check size={13}/>}{civicPolicy(selected.requires).name}<ArrowRight size={13}/></button>}
   {civicPolicies.filter(p=>p.requires===selected.id).map(p=><button key={p.id} className="civic-chain next" onClick={()=>setSelectedId(p.id)}><ArrowRight size={13}/>{p.name}</button>)}
   <footer>{!unlocked&&<Resources values={selected.cost} available={stock(api.planet)} small/>}<button className="primary full" disabled={api.busy||state.active===selected.id||(unlocked?cooling:locked||poor)} onClick={()=>unlocked?setConfirm(selected):act({type:'civic',planet:api.planet.id,mode:'unlock',id:selected.id},'市政方案已解锁，可选择启用')}>{state.active===selected.id?'正在施行':unlocked?cooling?'调整冷却中':'启用方针':locked?'前置未解锁':poor?'资源不足':'解锁方案'}<ArrowRight size={16}/></button></footer>
  </aside>
  {confirm&&<Dialog title={`启用「${confirm.name}」`} onClose={()=>setConfirm(null)}><div className="civic-swap"><span>{active?.name||'常态治理'}</span><ArrowRight size={16}/><b>{confirm.name}</b></div><EffectBars policy={confirm.id?confirm:null}/><p className="civic-line"><Timer size={13}/> 生效后冷却 10 分钟</p><div className="dialog-actions"><button className="secondary" onClick={()=>setConfirm(null)}>返回</button><button className="primary" disabled={api.busy||cooling} onClick={submit}>确认施行</button></div></Dialog>}
 </div>;
}
