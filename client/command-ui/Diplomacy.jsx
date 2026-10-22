import FactionWars from './FactionWars.jsx';
import React,{useState,useRef,useEffect} from 'react';
import {ArrowLeftRight,MapPin,Pickaxe,Radio,ShieldCheck} from 'lucide-react';
import {Resources,Section,Pill,number,stock} from './shared.jsx';

const blank=()=>Array(9).fill(0);
export default function Diplomacy({api,act,navigate,helpers={}}){
 const d=api.state.diplomacy,p=api.planet;
 const [tab,setTab]=useState('talk'),[selected,setSelected]=useState(helpers.tradePartner||d?.partners.find(p=>p.leader==='艾琳')?.id||''),[resource,setResource]=useState('all');
 const talkRef=useRef(null);
 useEffect(()=>{if(d?.offer)talkRef.current?.scrollIntoView({block:'start',behavior:'smooth'});},[d?.offer?.id]);
 const [give,setGive]=useState(blank),[take,setTake]=useState(blank),[error,setError]=useState('');
 if(!d)return <p className="note">战略资源尚未载入，请保存后通过启动器重启后台。</p>;
 const partner=d.partners.find(x=>x.id===selected)||d.partners[0],inventory=[...stock(p),...d.keys.slice(3).map(k=>d.inventory[k]||0)];
 const offer=d.offer?.partner===partner?.id&&d.offer?.planet===p.id?d.offer:null;
 const embargo=partner?.embargoUntil>api.now,expired=offer&&offer.expires<=api.now;
 const update=(setter,other,i,value)=>{setter(v=>v.map((n,j)=>j===i?value:n));if(value)other(v=>v.map((n,j)=>j===i?0:n));};
 const choose=id=>{setSelected(id);setGive(blank());setTake(blank());setError('');};
 const run=async(payload,message)=>{setError('');const ok=await act({planet:p.id,...payload},message);if(!ok)setError(api.error||'操作未完成，请重试');return ok;};
 const valid=give.some(n=>n>0)&&take.some(n=>n>0)&&give.every((n,i)=>Number.isSafeInteger(n)&&n>=0&&n<=inventory[i])&&take.every((n,i)=>Number.isSafeInteger(n)&&n>=0&&n<=partner.sale[i]);
 const describe=v=>v.map((n,i)=>n?<li key={i}><span>{d.names[i]}</span><b>{number(n)}</b></li>:null);
 return <div className="diplomacy-screen">
  <div className="diplomacy-intro"><div><span className="eyebrow">DIPLOMACY / STRATEGIC RESOURCES</span><h2>用你的富余，换取远方的特产。</h2><p>与文明和城邦直接交涉。战略资源全帝国共享，基础物资在「{p.name}」交割。</p></div><Pill><ShieldCheck size={16}/>安全发展 · 大势力不主动攻打玩家</Pill></div>
  {api.state.grandPowers&&<details className="grand-power-brief panel"><summary>四大强权 · 查看疆域与科技</summary><p>这些文明已有成熟的星际工业与战略舰队。维持贸易、积累实力；它们只在多势力交战区互相消耗，不攻占、不斩首，不主动进攻玩家。表中为首都统帅科技。</p><div className="grand-power-table"><table><thead><tr><th>势力</th><th>星系 / 殖民地</th><th>天体物理</th><th>武器 / 护盾 / 舰体</th><th>驻军战力指数</th></tr></thead><tbody>{api.state.grandPowers.regions.map(r=><tr key={r.id}><th>{r.name}</th><td>{r.systems} / {r.colonies}</td><td>{r.astrophysics}</td><td>{r.combatTech.join(' / ')}</td><td>{number(r.power)}</td></tr>)}</tbody></table></div><p>指数合计舰体、护盾和火力，不代表实际战斗胜率。自留星区内已有的小势力继续保留。</p></details>}
  <div className="strategic-stock">{Object.entries(d.resources).map(([id,r])=><button key={id} className={resource===id?'selected':''} onClick={()=>{setResource(id);setTab('deposits');}}><span>{r.name}</span><b>{number(d.inventory[id])}<small> / {d.rules.capacity}</small></b><small>{api.catalog.units[r.ship].name} · 单舰 {r.amount}</small></button>)}</div>
  <nav className="diplomacy-tabs" aria-label="外交工作区"><button onClick={()=>navigate('market')}><ArrowLeftRight size={16}/>银河商城 ↗</button><button aria-pressed={tab==='talk'} onClick={()=>setTab('talk')}><Radio size={16}/>文明与城邦</button><button aria-pressed={tab==='deposits'} onClick={()=>setTab('deposits')}><Pickaxe size={16}/>资源产区</button><button aria-pressed={tab==='frontier'} onClick={()=>setTab('frontier')}>边境战事</button></nav>
  {tab==='frontier'&&<FactionWars api={api} helpers={helpers}/>}
  {error&&<p role="alert" className="note danger">{error}</p>}
  {tab==='talk'&&partner&&<div className="diplomacy-layout">
   <aside className="diplomacy-partners panel"><Section>直接联系</Section>{[...d.partners].sort((a,b)=>Number(b.kind==='城邦')-Number(a.kind==='城邦')).map(other=><button key={other.id} aria-pressed={partner.id===other.id} onClick={()=>choose(other.id)}><span><b>{other.name}</b><small>{other.leader} · {other.kind} · {other.territory} 星系</small></span><span className="diplomacy-specialty">{[...new Set(other.specialties)].map(k=>d.resources[k].name).join(' / ')||'基础物资'}</span></button>)}</aside>
   <section ref={talkRef} className="diplomacy-talk panel">
    <header><div><Pill tone="neutral">{partner.kind}</Pill><h2>{partner.name}</h2><p>{partner.leader} · {partner.bio}</p></div><button className="text-button" onClick={()=>helpers.locateResource?.(partner.position)}><MapPin size={16}/>定位</button></header>
    <div className="diplomacy-voice"><Radio size={20}/><div><b>{partner.leader}</b><p>{embargo?'近期的攻击使我们暂停贸易。停火满 24 小时后再谈。':offer&&!expired?offer.message:partner.needs.length?`我们目前需要${partner.needs.join('、')}。你想交换什么？`:'我们的仓库有一些余量。说说你的提案。'}</p></div></div>
    <div className="diplomacy-terms"><span>关系：{embargo?'暂停贸易':partner.trust>=5?'友好':partner.trust?'熟悉':'中立'}</span><span>现货交割 · 报价保留 5 分钟</span></div>
    {offer?<div className="trade-offer"><Section>{offer.counter?'对方还价':'待确认提案'}</Section><div className="trade-summary"><section><h3>我方提供</h3><ul>{describe(offer.give)}</ul></section><ArrowLeftRight size={22}/><section><h3>对方提供</h3><ul>{describe(offer.take)}</ul></section></div><p>{expired?'报价已过期，请重新提案。':`确认后一次性交割；基础资源交付至${p.name}。`}</p><div className="trade-actions"><button className="secondary" disabled={api.busy} onClick={async()=>{if(await run({type:'trade',mode:'cancel'},'已返回谈判')){setGive(offer.give);setTake(offer.take);}}}>返回还价</button><button className="primary" disabled={api.busy||embargo||expired||offer.give.some((n,i)=>n>inventory[i])||offer.take.some((n,i)=>n>partner.sale[i])} onClick={()=>run({type:'trade',mode:'accept',offer:offer.id},'交易完成，物资已入库')}>{offer.give.some((n,i)=>n>inventory[i])?'库存不足，返回调整':'接受并交割'}</button></div></div>:<form onSubmit={e=>{e.preventDefault();if(valid)run({type:'trade',mode:'propose',partner:partner.id,give,take},'对方已回复提案');}}>
     <div className="trade-grid"><div className="trade-grid-head"><span>物资</span><span>我方提供 / 库存</span><span>请求对方 / 可售</span></div>{d.names.map((name,i)=><div className="trade-row" key={name}><span>{name}</span><label><input aria-label={`提供${name}`} type="number" min="0" max={Math.floor(inventory[i])} step="1" value={give[i]||''} placeholder="0" onChange={e=>update(setGive,setTake,i,Number(e.target.value))}/><small>库存 {number(inventory[i])}</small></label><label><input aria-label={`请求${name}`} type="number" min="0" max={partner.sale[i]} step="1" value={take[i]||''} placeholder="0" onChange={e=>update(setTake,setGive,i,Number(e.target.value))}/><small>可售 {number(partner.sale[i])}</small></label></div>)}</div>
     <div className="trade-actions"><p>可售量已扣除对方自用储备。可以混合交换多种物资。</p><button className="primary" disabled={api.busy||!valid||embargo}>提出交换 <ArrowLeftRight size={16}/></button></div>
    </form>}
   </section>
  </div>}
  {tab==='deposits'&&<section className="panel resource-atlas"><div className="resource-atlas-heading"><div><h2>固定矿藏 · 星座特产</h2><p>殖民矿点所在行星后建设开采站，每小时产出 {d.rules.rate} 单位。达到 {d.rules.capacity} 后停产；交易所得超额库存保留。</p></div><label>筛选资源<select aria-label="筛选战略资源" value={resource} onChange={e=>setResource(e.target.value)}><option value="all">全部资源</option>{Object.entries(d.resources).map(([id,r])=><option key={id} value={id}>{r.name}</option>)}</select></label></div>
   <Section>开采站建设费用 · 从矿点所在行星扣除</Section><Resources values={d.rules.mineCost}/>
   <div className="deposit-list">{d.deposits.filter(x=>resource==='all'||x.resource===resource).map(x=>{const mine=x.owner===api.state.player.id,host=api.state.planets.find(p=>p.id===x.planet),contact=d.partners.find(p=>p.id===x.owner),affordable=host&&d.rules.mineCost.every((n,i)=>stock(host)[i]>=n);return <article key={x.id}><div><h3>{d.resources[x.resource].name}<Pill tone={x.active?'mint':'neutral'}>{x.active?'开采中':'未开发'}</Pill></h3><p>{x.constellationName} · {x.position.join(' : ')}</p><small>{x.ownerName||x.territoryName}</small></div><div className="deposit-actions">{mine?<button className="primary" disabled={api.busy||x.active||!affordable} onClick={()=>run({type:'strategicMine',planet:x.planet},'开采站已启动')}>{x.active?`+${d.rules.rate} / 小时`:affordable?'建设开采站':'本地资源不足'}</button>:contact?<button className="primary" onClick={()=>{choose(contact.id);setTab('talk');}}>联系{contact.leader}</button>:null}<button className="secondary" onClick={()=>helpers.locateResource?.(x.position)}><MapPin size={15}/>定位矿点</button></div></article>;})}</div>
  </section>}
 </div>;
}
