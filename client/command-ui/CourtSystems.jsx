import React,{useState} from 'react';
import {Search,Orbit,ArrowRight,ArrowLeft,Package} from 'lucide-react';
import {Pill,Empty,compact,planetArt} from './shared.jsx';

const names=['金属','晶体','气体'];
export const systemTitle=s=>'恒星系 '+s.position.join(' : ');
const logisticsStatus=s=>s.logistics?.level===1?'共享仓储已接通':s.logistics?.queue?'物流中心建设中':'独立仓储';

export function SystemNavigation({systems,system,onSelect,busy}) {
  return <nav className="court-system-navigation" aria-label="星系管理导航">
    <button className="text-button" disabled={busy} onClick={()=>onSelect('')}><ArrowLeft size={16}/>全部星系</button>
    <label className="field-label">当前管理星系<select aria-label="切换管理星系" value={system.key} disabled={busy} onChange={e=>onSelect(e.target.value)}>{systems.map(s=><option key={s.key} value={s.key}>{systemTitle(s)}{s.home?' · 母星所在':''}</option>)}</select></label>
    <span>本系 {system.totals.colonies} 颗行星 · {system.totals.moons} 座月球基地</span>
  </nav>;
}

export default function CourtSystems({systems,onSelect,openLogistics}) {
  const [search,setSearch]=useState(''),[attention,setAttention]=useState(false);
  const query=search.trim().toLowerCase().replaceAll('：',':').replace(/\s*:\s*/g,':');
  const rows=systems.filter(s=>(!attention||s.attention)&&`${systemTitle(s).replace(/\s*:\s*/g,':')} ${s.key} ${s.planets.map(p=>p.name+' '+p.position.join(':')).join(' ')}`.toLowerCase().includes(query));
  return <div className="court-systems screen-enter">
    <div className="court-systems-heading"><div><span className="eyebrow">EMPIRE / STAR SYSTEMS</span><h2>按星系统筹帝国</h2><p>选择星系，管理本系建设、发展计划与物流。</p></div><span className="court-system-count"><b>{systems.length}</b> 个星系</span></div>
    <div className="court-systems-toolbar"><div className="court-filters" role="group" aria-label="星系筛选"><button className={!attention?'active':''} aria-pressed={!attention} onClick={()=>setAttention(false)}>全部星系</button><button className={attention?'active':''} aria-pressed={attention} onClick={()=>setAttention(true)}>需要处理 · {systems.filter(s=>s.attention).length}</button></div><label className="search"><Search size={16}/><input type="search" aria-label="搜索星系" placeholder="星系坐标或基地名称" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
    <div className="court-system-grid">{rows.map(s=><article className="court-system-card panel" key={s.key} aria-label={systemTitle(s)} data-system={s.key}>
      <header><span className="court-system-orbit"><Orbit size={27}/></span><div><h3>{systemTitle(s)}</h3><p>{s.totals.colonies} 颗行星 · {s.totals.moons} 座月球基地</p></div>{s.home&&<Pill>母星所在</Pill>}</header>
      <button className="primary" onClick={()=>onSelect(s.key)} aria-label={`管理${systemTitle(s)}`}>管理本星系<ArrowRight size={16}/></button>
      <div className="court-system-members">{s.planets.slice(0,4).map(p=><span key={p.id}><img src={planetArt(p)} alt=""/>{p.name}</span>)}{s.planets.length>4&&<span className="muted">另 {s.planets.length-4} 处基地</span>}</div>
      <div className="court-system-resource-heading"><span>全系库存</span><span>净产量 / 小时</span></div>
      <dl className="court-system-resources">{names.map((name,i)=><div key={name}><dt>{name}</dt><dd>{compact(s.totals.resources[i])}</dd><dd className={s.totals.rate[i]<0?'danger':'mint'}>{s.totals.rate[i]>=0?'+':''}{compact(s.totals.rate[i])}</dd></div>)}</dl>
      <div className="court-system-progress"><span><b>{s.totals.building}</b> 正在建设</span><span><b>{s.totals.goals}</b> 待建目标</span><span className={s.attention?'warning':'mint'}>{s.attention?`${s.attention} 处需要处理`:'运行正常'}</span></div>
      <div className="court-system-logistics"><Package size={14}/><span>{logisticsStatus(s)}</span>{s.logistics&&<button className="text-button" onClick={()=>openLogistics(s.position)} aria-label={`管理${systemTitle(s)}物流`}>管理物流<ArrowRight size={14}/></button>}</div>
    </article>)}</div>
    {!rows.length&&<Empty>{systems.length?'没有符合条件的星系。试试其他坐标或基地名称。':'暂无本方基地。建立殖民地后即可按星系管理。'}</Empty>}
  </div>;
}
