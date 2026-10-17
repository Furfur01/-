import React,{useEffect,useState} from 'react';
import {Search,ArrowUpRight,Plus,Minus,ChevronRight,Clock3,Layers3,GitCompareArrows,X,Shield,Swords,Box} from 'lucide-react';
import Stage from './Stage.jsx';
import {number,clock,asset,shipCapacity,shipBlockReason} from './data.mjs';
import {Resources,Requirements,SectionLabel} from './common.jsx';

export default function Shipyard({data,view,onSelect,onBuild,onResearch}){
 const {ships,roles,requirements,buildSeconds,techById,planet}=data;
 const ship=ships.find(s=>s.id===view.selectedShip)||ships[2];
 const [category,setCategory]=useState(ship.type),[query,setQuery]=useState(''),[count,setCount]=useState(1),[compare,setCompare]=useState(false);
 useEffect(()=>{setCategory(ship.type);},[ship.type]);
 const req=requirements(ship,view.levels),unmet=req.filter(r=>r.current<r.level),cost=ship.cost.map(n=>n*count),each=buildSeconds(ship);
 const max=shipCapacity(ship,data),unit=ship.type==='defense'?(ship.missile?'枚':'座'):'艘';
 const available=ships.filter(s=>s.type===category&&s.name.includes(query));
 const reason=shipBlockReason(ship,count,data,view.busy);
 const select=id=>{onSelect(id);setCount(1);};
 return <div className="shipyard-screen screen-enter">
  <aside className="fleet-catalog panel">
   <div className="catalog-heading"><span className="eyebrow">FLEET BLUEPRINTS</span><h2>舰船蓝图 <small>{ships.length}</small></h2></div>
   <div className="segmented">{[['combat','战斗舰船'],['civilian','民用舰船'],['defense','行星防御']].map(([id,name])=><button key={id} className={category===id?'active':''} onClick={()=>{setCategory(id);setQuery('');select(ships.find(s=>s.type===id).id);}}>{name}</button>)}</div>
   <label className="search-field"><Search size={15}/><input aria-label="搜索舰型" placeholder="搜索舰型" value={query} onChange={e=>setQuery(e.target.value)}/></label>
   <div className="fleet-list">{available.map((s,i)=>{const locked=requirements(s,view.levels).some(r=>r.current<r.level);return <button className={`fleet-card ${s.id===ship.id?'selected':''}`} key={s.id} onClick={()=>select(s.id)} aria-pressed={s.id===ship.id}><span className="fleet-number">{String(i+1).padStart(2,'0')}</span><img src={asset('ships',s.id)} alt=""/><span className="fleet-copy"><b>{s.name}</b><small>{roles[s.id][0]}</small><em>{locked?'条件未满足':`${s.type==='defense'?'已部署':'驻港'} ${view.owned[s.id]||0} ${s.type==='defense'?(s.missile?'枚':'座'):'艘'}`}</em></span>{s.id===ship.id&&<ChevronRight className="fleet-arrow" size={16}/>}</button>;})}{!available.length&&<div className="empty-state">未找到舰型<button onClick={()=>setQuery('')}>清除搜索</button></div>}</div>
   <button className="catalog-compare" onClick={()=>setCompare(true)}><GitCompareArrows size={16}/>舰型性能对照<ArrowUpRight size={15}/></button>
  </aside>
  <section className="ship-main">
   <div className="ship-heading"><div><span className="eyebrow">{roles[ship.id][1]}</span><h1>{ship.name}</h1><p>{roles[ship.id][0]}</p></div><span className="available-badge"><i></i>{unmet.length?'蓝图已收录':'蓝图可生产'}</span></div>
   <Stage id={ship.id} name={ship.name} planet={planet} grounded={ship.type==='defense'} staticArt={!!ship.missile}/>
   <div className="ship-stats">{[['攻击',ship.attack,Swords,2000],['舰体',ship.strength,Shield,11000],['护盾',ship.shield,Layers3,500]].map(([label,value,Icon,ceil])=><div key={label}><div><Icon size={17}/><span>{label}</span><strong>{number(value)}</strong></div><div className="stat-track"><i style={{width:`${Math.min(100,value/ceil*100)}%`}}></i></div></div>)}</div>
   <div className="ship-caption"><span>基础参数 · 科技加成前</span>{ship.type!=='defense'&&<span><Box size={13}/>货舱 {number(ship.cargo)}<i></i>航速 {number(ship.speed)}</span>}</div>
  </section>
  <aside className="production-panel panel"><div className="production-detail-body">
   <SectionLabel aside="ORBITAL FABRICATION">生产配置</SectionLabel>
   <h2>{ship.name}<span>× {count||0}</span></h2><p className="ship-description">{roles[ship.id][2]}</p>

   <div className="production-quantity"><SectionLabel aside={`最多可造 ${max} ${unit}`}>建造数量</SectionLabel><div className="stepper"><button aria-label="减少建造数量" onClick={()=>setCount(n=>Math.max(1,n-1))} disabled={count<=1}><Minus size={16}/></button><input type="number" aria-label="建造数量" min="1" max="10000" value={count} onChange={e=>setCount(e.target.value===''?'':Math.max(1,Math.min(10000,Math.floor(+e.target.value))))}/><button aria-label="增加建造数量" onClick={()=>setCount(n=>Math.min(10000,Number(n)+1))}><Plus size={16}/></button><span>{unit}</span></div><div className="quick-count">{[1,5,10,25].map(n=><button className={count===n?'active':''} key={n} onClick={()=>setCount(n)}>{n}</button>)}<button disabled={!max} onClick={()=>setCount(max)}>最大</button></div></div>
   <SectionLabel aside={`单${unit}费用`}>建造成本</SectionLabel><Resources values={ship.cost}/>
   {ship.parts&&<p className="ship-description">外星部件 {data.player.parts||0} / {ship.parts*count}</p>}<SectionLabel>设施与科技</SectionLabel><Requirements items={req} onSelect={{ids:Object.keys(techById),click:onResearch}}/>
   </div><div className="production-summary"><SectionLabel>本批次合计</SectionLabel><Resources compact values={cost} available={view.resources}/><div className="time-total"><Clock3 size={16}/><span>预计工期</span><strong>{clock(each*count)}</strong></div><button className="primary-action" disabled={!!reason} onClick={()=>onBuild(ship,count)}><Plus size={18}/>{reason||'加入建造队列'}<ArrowUpRight size={18}/></button><small className="action-note">本星船坞 · {view.queue.length} / 8 批次</small></div>
  </aside>
  <section className="queue-dock panel"><div className="queue-heading"><div><span className="eyebrow">PRODUCTION LINE</span><h3>建造队列 <small>{view.queue.length} / 8</small></h3></div><span><i className="live-dot"></i>{view.queue.length?'生产中 · 投产后不可取消':'船坞空闲'}</span></div><div className="queue-cards">{view.queue.map((q,i)=>{const s=data.catalog.units[q.id],progress=i===0?Math.min(100,(q.elapsed/q.each)*100):0;return <article className={`queue-card ${i===0?'working':''}`} key={q.key}><span className="queue-index">{String(i+1).padStart(2,'0')}</span><img src={asset('ships',q.id)} alt=""/><div><h4>{s.name}<b>× {q.remaining}</b></h4><p>{i===0?'正在组装':'等待生产'}<span>{clock(Math.max(0,(q.end+(q.remaining-1)*q.each*1000-view.now)/1000))}</span></p><div className="progress-track"><i style={{width:`${progress}%`}}></i></div></div></article>;})}{!view.queue.length&&<div className="queue-empty">选择一份蓝图，开始第一批舰船生产。</div>}</div></section>
  {compare&&<div className="modal-backdrop" onClick={()=>setCompare(false)}><section className="compare-dialog" role="dialog" aria-modal="true" aria-labelledby="compare-title" onClick={e=>e.stopPropagation()}><div className="dialog-heading"><div><span className="eyebrow">FLEET COMPARISON</span><h2 id="compare-title">选择适合任务的舰船</h2></div><button aria-label="关闭性能对照" onClick={()=>setCompare(false)}><X size={22}/></button></div><div className="compare-table-wrap"><table><thead><tr><th>舰型</th><th>攻击</th><th>舰体</th><th>护盾</th><th>货舱</th><th>航速</th></tr></thead><tbody>{ships.filter(s=>s.type===category).map(s=><tr key={s.id} className={s.id===ship.id?'selected':''}><th><button onClick={()=>{select(s.id);setCompare(false);}}><img src={asset('ships',s.id)} alt=""/>{s.name}</button></th>{['attack','strength','shield','cargo','speed'].map(k=><td key={k}>{number(s[k])}</td>)}</tr>)}</tbody></table></div><p>基础目录参数；科技加成和实际航行任务会影响最终表现。</p></section></div>}
 </div>;
}
