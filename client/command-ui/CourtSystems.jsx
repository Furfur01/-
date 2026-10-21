import React,{useState} from 'react';
import {Search,Orbit,ArrowRight,ArrowLeft,Package,Hammer,ListChecks,AlertTriangle,Globe2,Moon,Box,Diamond,Droplets} from 'lucide-react';
import {Empty,compact,planetArt} from './shared.jsx';

const resources=[['金属',Box],['晶体',Diamond],['气体',Droplets]];
export const systemTitle=s=>'恒星系 '+s.position.join(' : ');

export function ResourceBars({values,capacity,rate}){
 return <div className="court-res-bars">{resources.map(([name,Icon],i)=>{const fill=capacity?.[i]>0?Math.min(1,values[i]/capacity[i]):0;return <div key={name} className={fill>=.9?'full':''} title={`${name} ${compact(values[i])}${capacity?.[i]?' / '+compact(capacity[i]):''}`}><Icon size={12}/><i><b style={{width:fill*100+'%'}}/></i><span>{compact(values[i])}</span><small className={rate[i]<0?'danger':''}>{rate[i]>=0?'+':''}{compact(rate[i])}</small></div>;})}</div>;
}

// Orbit slot 1–15 maps to ring radius; 16 is the outer belt.
export function OrbitDiagram({planets,size=150}){
 const c=size/2,r=slot=>14+(Math.min(16,slot)/16)*(c-16),slots=[...new Set(planets.map(p=>p.position[2]))];
 return <svg className="court-orbit" viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
  <defs><radialGradient id="court-star"><stop offset="0" stopColor="#fff3cf"/><stop offset=".4" stopColor="#dfb978"/><stop offset="1" stopColor="#dfb978" stopOpacity="0"/></radialGradient></defs>
  {slots.map(s=><circle key={s} className="court-orbit-ring" cx={c} cy={c} r={r(s)}/>)}
  <circle cx={c} cy={c} r={13} fill="url(#court-star)"/>
  {planets.map(p=>{const slot=p.position[2],a=slot*2.4+(p.moon?.5:0),rr=r(slot)+(p.moon?8:0),x=c+rr*Math.cos(a),y=c+rr*Math.sin(a),d=p.moon?9:15;return <image key={p.id} href={planetArt(p)} x={x-d/2} y={y-d/2} width={d} height={d}/>;})}
 </svg>;
}

export function SystemNavigation({systems,system,onSelect,busy}) {
 return <nav className="court-system-navigation" aria-label="星系管理导航">
  <button className="text-button" disabled={busy} onClick={()=>onSelect('')}><ArrowLeft size={16}/>全部星系</button>
  <div className="court-system-chips" role="group" aria-label="切换管理星系">{systems.map(s=><button key={s.key} className={s.key===system.key?'active':''} aria-pressed={s.key===system.key} disabled={busy} onClick={()=>onSelect(s.key)}><Orbit size={13}/>{s.position.join(':')}{s.attention>0&&<i className="dot"/>}</button>)}</div>
  <span className="court-nav-counts"><Globe2 size={14}/>{system.totals.colonies}<Moon size={14}/>{system.totals.moons}</span>
 </nav>;
}

export default function CourtSystems({systems,onSelect,openLogistics}) {
 const [search,setSearch]=useState(''),[attention,setAttention]=useState(false);
 const query=search.trim().toLowerCase().replaceAll('：',':').replace(/\s*:\s*/g,':');
 const rows=systems.filter(s=>(!attention||s.attention)&&`${systemTitle(s).replace(/\s*:\s*/g,':')} ${s.key} ${s.planets.map(p=>p.name+' '+p.position.join(':')).join(' ')}`.toLowerCase().includes(query));
 const sum=key=>systems.reduce((n,s)=>n+s.totals[key],0),alerts=systems.reduce((n,s)=>n+s.attention,0);
 return <div className="court-systems screen-enter">
  <div className="court-systems-heading">
   <div className="court-stat"><Orbit size={20}/><b>{systems.length}</b><span>星系</span></div>
   <div className="court-stat"><Globe2 size={20}/><b>{sum('colonies')}</b><span>行星</span></div>
   <div className="court-stat"><Moon size={20}/><b>{sum('moons')}</b><span>月球</span></div>
   <div className="court-stat"><Hammer size={20}/><b>{sum('building')}</b><span>施工</span></div>
   <div className={'court-stat '+(alerts?'warn':'')}><AlertTriangle size={20}/><b>{alerts}</b><span>待处理</span></div>
  </div>
  <div className="court-systems-toolbar"><div className="court-filters" role="group" aria-label="星系筛选"><button className={!attention?'active':''} aria-pressed={!attention} onClick={()=>setAttention(false)}><Orbit size={14}/>全部</button><button className={attention?'active':''} aria-pressed={attention} onClick={()=>setAttention(true)}><AlertTriangle size={14}/>{systems.filter(s=>s.attention).length}</button></div><label className="search"><Search size={16}/><input type="search" aria-label="搜索星系" placeholder="坐标或基地名称" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
  <div className="court-system-grid">{rows.map(s=><article className={'court-system-card glass '+(s.attention?'attention':'')} key={s.key} aria-label={systemTitle(s)} data-system={s.key}>
   <button className="court-system-hit" onClick={()=>onSelect(s.key)} aria-label={`管理${systemTitle(s)}`}>
    <OrbitDiagram planets={s.planets}/>
    <div className="court-system-info">
     <header><h3>{s.position.join(' : ')}</h3>{s.home&&<span className="court-home-badge">◆ 母星</span>}</header>
     <div className="court-badges"><span title="行星"><Globe2 size={13}/>{s.totals.colonies}</span><span title="月球"><Moon size={13}/>{s.totals.moons}</span><span title="正在建设" className={s.totals.building?'mint':''}><Hammer size={13}/>{s.totals.building}</span><span title="待建目标"><ListChecks size={13}/>{s.totals.goals}</span>{s.attention>0&&<span title="需要处理" className="warning"><AlertTriangle size={13}/>{s.attention}</span>}</div>
     <ResourceBars values={s.totals.resources} capacity={s.totals.capacity} rate={s.totals.rate}/>
    </div>
    <ArrowRight className="court-system-go" size={18}/>
   </button>
   <footer className="court-system-logistics"><Package size={14} className={s.logistics?.level===1?'mint':s.logistics?.queue?'amber':'muted'}/><span>{s.logistics?.level===1?'共享仓储':s.logistics?.queue?'物流建设中':'独立仓储'}</span>{s.logistics&&<button className="text-button" onClick={()=>openLogistics(s.position)} aria-label={`管理${systemTitle(s)}物流`}>物流<ArrowRight size={13}/></button>}</footer>
  </article>)}</div>
  {!rows.length&&<Empty>{systems.length?'没有匹配的星系':'暂无本方基地'}</Empty>}
 </div>;
}
