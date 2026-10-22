import Arsenal from './Arsenal.jsx';
import React,{useEffect,useRef,useState} from 'react';
import {Orbit,Network,Sun,Zap,Factory,RadioTower,Pickaxe,Building2,ArrowRight,ArrowUpRight,Clock3,MapPin,Ship,Check} from 'lucide-react';
import {Resources,Requirements,Progress,Pill,Section,Dialog,number,duration,remaining,asset,stock} from './shared.jsx';
import {Blank,ActionLink,ResourceBars} from './secondary-kit.jsx';

const types=[
 ['gate','星门',Network,'连接本方星门，共享跨星系仓储并即时转移舰队。'],
 ['dyson','戴森云 / 戴森球',Sun,'为本恒星系每颗本方行星分别提供大量电力。'],
 ['extractor','恒星资源提取器',Zap,'提取恒星资源，并为同系巨构船坞提供专用能源。'],
 ['shipyard','巨构船坞',Factory,'使用全系资源建造进阶舰船；星门接通后可调用联网库存。'],
 ['listener','深空监听阵列',RadioTower,'每个文明只能拥有一座。升级扩展飞行舰队的监听范围。'],
 ['industry','小行星工业带',Pickaxe,'持续生产金属与晶体，产物进入共享仓储，满仓停产。'],
 ['habitat','环轨居住带',Building2,'消耗行星电力，扩展所属行星的实际建造空间。']
];
export function focusMegastructure(system,id,planet,{key,owner,showRange=id==='listener'}={}){
 window.dispatchEvent(new CustomEvent('empire:focus-megastructure',{detail:{system:[...system],id,planet,key,owner,showRange}}));
}
const sameSystem=(p,position)=>p.position[0]===position[0]&&p.position[1]===position[1];

function Engineering({api,act,navigate,system,all,selected,setSelected,openLogistics}){
 const [planetId,setPlanetId]=useState(''),[cancel,setCancel]=useState(false);
 const planets=api.state.planets.filter(p=>!p.moon&&sameSystem(p,system.position));
 const planet=planets.find(p=>p.id===planetId)||planets.find(p=>p.id===api.planet.id)||planets[0];
 const habitat=all.habitats.find(h=>h.planet===planet?.id)?.structure;
 const structures={...system.structures,habitat},item=structures[selected],meta=types.find(t=>t[0]===selected),Icon=meta[2];
 useEffect(()=>setCancel(false),[system.key,selected,planet?.id]);
 if(!item)return <Blank icon={Factory} title="工程信息尚未就绪">刷新游戏状态后重试。</Blank>;
 const host=selected==='habitat'?planet:api.state.planets.find(p=>p.id===system.host),queue=item.queue,atMax=item.level>=item.maxLevel;
 const resources=host?stock(host):system.resources;
 const locate=()=>focusMegastructure(system.position,selected,host?.id,{key:system.key,owner:api.state.player.id});
 const preview=()=>window.dispatchEvent(new CustomEvent('empire:preview-megastructure',{detail:{system:[...system.position],id:selected,planet:host.id,key:system.key,owner:api.state.player.id}}));
 return <div className="mega-engineering">
  <nav className="panel mega-catalog" aria-label="巨构设施">{types.map(([id,name,TypeIcon])=>{const s=structures[id];return <button key={id} className={id===selected?'selected':''} onClick={()=>setSelected(id)} aria-pressed={id===selected}><TypeIcon size={20}/><span><b>{name}</b><small>{s?.queue?'升级 / 建设中':s?.level?`Lv ${s.level} / ${s.maxLevel}`:'未建设'}</small></span>{id===selected&&<ArrowRight size={15}/>}</button>;})}</nav>
  <section className="panel mega-detail">
   <div className="mega-facility-heading"><span className={'mega-emblem '+(item.level?'active':'')}><Icon size={48}/></span><div><span className="sec-eyebrow">STELLAR ENGINEERING</span><h2>{item.name}</h2><Pill tone={item.level?'mint':'neutral'}>{item.level?`运行等级 ${item.level}`:'未建设'}</Pill></div></div>
   <p className="mega-description">{meta[3]}</p>
   {selected==='habitat'&&<label className="sec-field">所属行星<select value={planet?.id||''} onChange={e=>setPlanetId(e.target.value)}>{planets.map(p=><option key={p.id} value={p.id}>{p.name} · {p.usedFields} / {p.fields} 方圆</option>)}</select></label>}
   <div className="mega-effects"><Section>{item.level?'当前效能':'建成后效能'}</Section><p>{item.level?item.effect:item.nextEffect}</p>{item.level>0&&!atMax&&<><Section>下一级效能</Section><p>{item.nextEffect}</p></>}</div>
   {selected==='extractor'&&<div className="mega-materials"><span><b>白矮星物质</b><strong>{number(all.materials.whiteDwarf)}</strong></span><span><b>磁星物质</b><strong>{number(all.materials.magnetar)}</strong></span></div>}
   {selected==='shipyard'&&<div className="mega-shipyard-state"><Section>生产线</Section><div className="sec-key-value"><span>批次</span><b>{system.shipyard.queue.length} / 8</b></div><div className="sec-key-value"><span>工业供能</span><b>{system.shipyard.level?(system.shipyard.powered?'供能正常':'供能不足 · 生产暂停'):'等待船坞建成'}</b></div><button className="secondary" onClick={()=>{api.setPlanet(system.shipyard.host||system.host);navigate('shipyard');}}>打开舰船蓝图<ArrowUpRight size={16}/></button></div>}
   {item.level>0&&<button className="secondary mega-observe" onClick={locate}><MapPin size={16}/>{selected==='listener'?'查看监听范围':'观察巨构'}</button>}
  </section>
  <aside className="panel mega-build">
   <Section aside={atMax?'MAX':`Lv ${item.level} → ${item.level+1}`}>{queue?'工程进行中':atMax?'工程已完成':item.level?'扩建工程':'启动工程'}</Section>
   {queue?<><h3>{item.name} · Lv {queue.level}</h3><div className="sec-key-value"><span><Clock3 size={15}/>剩余工期</span><b>{remaining(queue.end,api.now)}</b></div><Progress value={(api.now-queue.start)/(queue.end-queue.start)}/><p className="sec-fineprint">{item.level?'扩建期间，原等级设施继续运行。':'建设完成后启用设施。'}</p><button className="secondary full" disabled={api.busy} onClick={()=>setCancel(true)}>取消本次工程</button></>:atMax?<div className="mega-complete"><Check size={30}/><h3>已达最高等级</h3><p>{item.effect}</p></div>:<><h3>{item.level?'升级至':'建设'} Lv {item.level+1}</h3><Resources values={item.cost} available={resources}/><div className="sec-key-value"><span><Clock3 size={15}/>工期</span><b>{duration(item.seconds)}</b></div><p className="mega-host">出资基地 <b>{host?.name}</b></p><button className="primary full" disabled={api.busy} onClick={preview}><MapPin size={16}/>{api.busy?'正在提交':'星图预览建造'}<ArrowUpRight size={16}/></button>{item.reason&&<p className="sec-fineprint warning">{item.reason}</p>}</>}
   {!atMax&&!queue&&<div className="mega-tech-requirements"><Section aside={selected==='extractor'?system.starType.name:undefined}>目标等级科技条件</Section><Requirements items={(item.requirements||[]).map(r=>({id:r.id,name:r.name,current:r.current,level:r.required}))}/><button className="text-button" onClick={()=>navigate('research')}>前往科技树<ArrowUpRight size={15}/></button></div>}
   <button className="text-button" onClick={openLogistics}><Network size={15}/>管理物流与共享仓储</button>
  </aside>
  {cancel&&queue&&<Dialog title={`取消${item.name}工程`} onClose={()=>setCancel(false)}><p className="mega-description">退回本次工程已支付的资源。{item.level>0?'保留当前设施等级。':''}</p><Resources values={queue.cost}/><div className="dialog-actions"><button className="secondary" onClick={()=>setCancel(false)}>继续施工</button><button className="primary" disabled={api.busy} onClick={async()=>{if(await act({type:'megastructure',mode:'cancel',id:selected,planet:queue.planet},'工程已取消，资源已退回'))setCancel(false);}}>确认取消</button></div></Dialog>}
 </div>;
}

function GateNetwork({api,act,all,system}){
 const connected=all.systems.filter(s=>s.networked),bases=api.state.planets.filter(p=>connected.some(s=>sameSystem(p,s.position)));
 const [fromId,setFromId]=useState(''),[targetId,setTargetId]=useState(''),[ships,setShips]=useState({}),[confirm,setConfirm]=useState(false);
 const from=bases.find(p=>p.id===fromId)||bases.find(p=>p.id===api.planet.id)||bases.find(p=>sameSystem(p,system.position))||bases[0];
 const targets=bases.filter(p=>p.id!==from?.id),target=targets.find(p=>p.id===targetId)||targets[0];
 const rows=from?Object.entries(from.ships).filter(([id,n])=>n>0&&id!=='Solar_Satellite'&&api.catalog.units[id]?.type!=='defense'&&api.catalog.units[id]?.fleetAvailable!==false):[];
 const selection=Object.fromEntries(rows.map(([id,n])=>[id,Math.max(0,Math.min(n,Math.floor(Number(ships[id])||0)))]).filter(([,n])=>n>0)),count=Object.values(selection).reduce((n,v)=>n+v,0);
 useEffect(()=>{setShips({});setConfirm(false);},[from?.id]);
 if(connected.length<2)return <Blank icon={Network} title="建设第二座星门，连接远方恒星系">已有 {connected.length} 个恒星系接入星门。两个不同恒星系的星门建成后，即可即时调舰并共享资源。</Blank>;
 return <div className="mega-gate-layout"><section className="panel"><div className="sec-panel-heading"><div><span className="sec-eyebrow">CONNECTED SYSTEMS</span><h3>星门网络</h3></div><Pill>{connected.length} 个恒星系</Pill></div><p className="mega-description">联网基地共用仓储。舰队转移即时到达，不消耗气体，也没有冷却。</p><div className="mega-network-list">{connected.map(s=><button key={s.key} onClick={()=>focusMegastructure(s.position,'gate',s.host,{key:s.key,owner:api.state.player.id})}><Network size={18}/><span><b>{s.name}</b><small>{s.position.join(' : ')} · {s.members.length} 处基地</small></span><MapPin size={15}/></button>)}</div></section><section className="panel"><Section>舰队转移</Section><div className="mega-route-inputs"><label className="sec-field">出发基地<select value={from?.id||''} onChange={e=>setFromId(e.target.value)}>{bases.map(p=><option key={p.id} value={p.id}>{p.name} [{p.position.join(':')}]</option>)}</select></label><ArrowRight size={20}/><label className="sec-field">抵达基地<select value={target?.id||''} onChange={e=>setTargetId(e.target.value)}>{targets.map(p=><option key={p.id} value={p.id}>{p.name} [{p.position.join(':')}]</option>)}</select></label></div><div className="mega-transfer-toolbar"><span>{number(count)} / 20,000 艘</span><button className="text-button" onClick={()=>{let left=20000;setShips(Object.fromEntries(rows.map(([id,n])=>{const take=Math.min(left,n);left-=take;return[id,take];})));}}>选满编队</button><button className="text-button" onClick={()=>setShips({})}>清空</button></div><div className="mega-transfer-ships">{rows.map(([id,n])=><label key={id}><img src={asset('units',id)} alt=""/><span><b>{api.catalog.units[id].name}</b><small>驻港 {number(n)}</small></span><input type="number" min="0" max={Math.min(n,20000)} step="1" aria-label={`${api.catalog.units[id].name}转移数量`} value={ships[id]??0} onChange={e=>setShips(v=>({...v,[id]:e.target.value===''?'':Math.max(0,Math.min(n,20000,Math.floor(Number(e.target.value)||0)))}))}/></label>)}{!rows.length&&<Blank icon={Ship} title="当前基地没有可转移舰船"/>}</div><button className="primary full" disabled={api.busy||!target||count<1||count>20000} onClick={()=>setConfirm(true)}>即时转移 · {number(count)} 艘<ArrowRight size={16}/></button></section>{confirm&&from&&target&&<Dialog title="确认星门转移" onClose={()=>setConfirm(false)}><p className="mega-description">将 {number(count)} 艘舰船从「{from.name}」转移至「{target.name}」。即时到达，气体消耗为 0。</p><div className="mega-confirm-ships">{Object.entries(selection).map(([id,n])=><p key={id}><span>{api.catalog.units[id].name}</span><b>{number(n)}</b></p>)}</div><div className="dialog-actions"><button className="secondary" onClick={()=>setConfirm(false)}>返回编组</button><button className="primary" disabled={api.busy} onClick={async()=>{if(await act({type:'stargate',planet:from.id,target:target.id,ships:selection},'舰队已通过星门抵达')){setConfirm(false);setShips({});}}}>确认转移</button></div></Dialog>}</div>;
}

function CivilizationWonders({api,publicData,observed}){
 const systems=(publicData?.systems||[]).filter(s=>s.owner!==api.state.player.id);
 const habitats=(publicData?.habitats||[]).filter(h=>h.owner!==api.state.player.id);
 const score=s=>(s.structures.shipyard?.level===3?10:0)+(s.structures.listener?.level===3?10:0)+Object.values(s.structures).filter(v=>v.level>0).length;
 const ordered=[...systems].sort((a,b)=>a.ownerName.localeCompare(b.ownerName,'zh-CN')||score(b)-score(a)||a.position[1]-b.position[1]);
 const [key,setKey]=useState(observed?.key||''),[facility,setFacility]=useState(observed?.id||'shipyard'),[planetId,setPlanetId]=useState(observed?.planet||'');
 const systemList=useRef(null);
 useEffect(()=>{if(!observed)return;setKey(observed.key);setFacility(observed.id);setPlanetId(observed.planet||'');},[observed?.key,observed?.id,observed?.planet]);
 const system=ordered.find(s=>s.key===key)||[...ordered].sort((a,b)=>score(b)-score(a))[0];
 useEffect(()=>{systemList.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({block:'nearest'});},[system?.key]);
 if(!system)return <Blank icon={Orbit} title="暂无公开的文明奇观"/>;
 const groups=new Map();for(const s of ordered){if(!groups.has(s.owner))groups.set(s.owner,{name:s.ownerName,systems:[]});groups.get(s.owner).systems.push(s);}
 const localHabitats=habitats.filter(h=>h.owner===system.owner&&sameSystem(h,system.position));
 const structures=[...types.filter(([id])=>id!=='habitat').map(([id])=>system.structures[id]).filter(s=>s?.level>0).map(s=>({...s,planet:system.host})),...localHabitats.map(h=>({...h.structure,planet:h.planet,planetName:h.name}))];
 const selected=structures.find(s=>s.id===facility&&(s.id!=='habitat'||!planetId||s.planet===planetId))||structures[0];
 const observe=s=>focusMegastructure(system.position,s.id,s.planet,{key:system.key,owner:system.owner,showRange:false});
 const selectSystem=s=>{setKey(s.key);setFacility(s.structures.shipyard?.level?'shipyard':Object.keys(s.structures).find(id=>s.structures[id].level>0));setPlanetId('');};
 return <div className="mega-wonders"><aside className="panel mega-civilizations" aria-label="文明奇观目录"><label className="sec-field">所属文明<select value={system.owner} onChange={e=>selectSystem(groups.get(e.target.value).systems[0])}>{[...groups].map(([owner,group])=><option key={owner} value={owner}>{group.name} · {group.systems.length} 个星系</option>)}</select></label><Section aside={`${groups.get(system.owner).systems.length} 个`}>恒星系</Section><section className="mega-public-systems" ref={systemList}>{groups.get(system.owner).systems.map(s=><button key={s.key} className={s.key===system.key?'selected':''} aria-pressed={s.key===system.key} onClick={()=>selectSystem(s)}><Orbit size={18}/><span><b>{s.position.join(' : ')}</b><small>{s.structures.listener?.level===3?'银河监听站':s.structures.shipyard?.level>0?`造舰重镇 · Lv ${s.structures.shipyard.level}`:s.structures.extractor?.level>=2?'恒星采集区':'星门节点'}</small></span>{s.key===system.key&&<ArrowRight size={14}/>}</button>)}</section></aside><section className="panel mega-public-facilities"><div className="sec-panel-heading"><div><span className="sec-eyebrow">CIVILIZATION WONDERS</span><h3>{system.ownerName}<small>{system.position.join(' : ')}</small></h3></div><Pill tone="neutral">公开设施</Pill></div><div className="mega-public-list">{structures.map(s=>{const Icon=types.find(t=>t[0]===s.id)?.[2]||Orbit,active=selected?.id===s.id&&selected?.planet===s.planet;return <button key={`${s.id}:${s.planet}`} className={active?'selected':''} aria-pressed={active} onClick={()=>{setFacility(s.id);setPlanetId(s.planet);}}><Icon size={23}/><span><b>{s.name}</b><small>{s.planetName||`Lv ${s.level} / ${s.maxLevel}`}</small></span>{s.planetName&&<em>Lv {s.level}</em>}{active&&<Check size={16}/>}</button>;})}</div>{selected&&<div className="mega-public-observe"><div><h3>{selected.name}<small>Lv {selected.level}</small></h3><p>{selected.id==='shipyard'?(system.shipyard?.powered?'工业供能正常':'工业供能未接通'):selected.id==='listener'?'观测阵列实体':selected.id==='habitat'?selected.planetName:system.ownerName+' · '+system.position.join(' : ')}</p></div><button className="primary" onClick={()=>observe(selected)}><MapPin size={17}/>观察巨构<ArrowUpRight size={16}/></button></div>}</section></div>;
}

function Listening({api,all}){
 const listener=all.listener;
 if(!listener)return <Blank icon={RadioTower} title="尚未建设深空监听阵列">在任一所属恒星系建设阵列。每个文明只能拥有一座，3级覆盖整个银河。</Blank>;
 return <section className="panel mega-listening"><div className="sec-panel-heading"><div><span className="sec-eyebrow">DEEP SPACE SIGNALS / 5 SEC</span><h3>实时飞行信号 <small>{listener.contacts.length} 支舰队</small></h3></div><button className="secondary" onClick={()=>focusMegastructure(listener.system,'listener',undefined,{key:all.systems.find(s=>s.position.join(':')===listener.system.join(':'))?.key,owner:api.state.player.id})}><RadioTower size={16}/>查看范围</button></div><p className="mega-description">Lv {listener.level} · {listener.level===3?'全银河覆盖':`半径 ${number(listener.radius)} 地图单位`} · 每5秒更新</p>{listener.contacts.length?<div className="sec-table-wrap"><table className="mega-contact-table"><thead><tr><th>所属文明</th><th>当前位置 / 空间坐标</th><th>航向</th>{listener.level>=2&&<><th>编队</th><th>航线</th><th>抵达剩余</th></>}</tr></thead><tbody>{listener.contacts.map(c=><tr key={c.id}><td>{c.ownerName}</td><td>{c.position.map(n=>Math.round(n)).join(' / ')}</td><td>{c.direction.map(n=>Number(n).toFixed(2)).join(' / ')}</td>{listener.level>=2&&<><td><details><summary>{number(Object.values(c.ships||{}).reduce((n,v)=>n+v,0))} 艘</summary>{Object.entries(c.ships||{}).map(([id,n])=><p key={id}>{api.catalog.units[id]?.name||id} × {number(n)}</p>)}</details></td><td>{c.fromPosition?.join(':')} → {c.targetPosition?.join(':')}<small>{api.catalog.missionNames[c.task]} · {c.phase==='return'?'返航':'航行'}</small></td><td>{remaining(c.end,api.now)}</td></>}</tr>)}</tbody></table></div>:<Blank icon={RadioTower} title="覆盖范围内暂无飞行信号"/>}</section>;
}

export default function Megastructures({api,act,navigate,helpers={}}){
 const all=api.state.megastructures,systems=all?.systems||[],observed=helpers.observedMegastructure,publicData=helpers.publicMegastructures;
 const hasPublic=(publicData?.systems||[]).some(s=>s.owner!==api.state.player.id),hasOwned=systems.some(s=>Object.values(s.structures).some(v=>v.level>0));
 const [systemKey,setSystemKey]=useState(''),[selected,setSelected]=useState(types.some(t=>t[0]===helpers.megastructureId)?helpers.megastructureId:'dyson'),[tab,setTab]=useState(()=>observed?'wonders':helpers.arsenalTarget||['laser','missile','accelerator','antimatterPlant'].includes(helpers.megastructureId)?'arsenal':hasPublic&&!hasOwned&&!helpers.megastructureId?'wonders':'engineering'),[refreshError,setRefreshError]=useState('');
 useEffect(()=>{if(helpers.megastructureId&&!observed){setSelected(types.some(t=>t[0]===helpers.megastructureId)?helpers.megastructureId:'dyson');setTab(['laser','missile','accelerator','antimatterPlant'].includes(helpers.megastructureId)?'arsenal':'engineering');}},[helpers.megastructureId,observed]);
 useEffect(()=>{if(helpers.arsenalTarget)setTab('arsenal');},[helpers.arsenalTarget]);
 useEffect(()=>{if(observed)setTab('wonders');},[observed?.key,observed?.id,observed?.planet]);
 useEffect(()=>{if(tab!=='listening')return;const timer=setInterval(()=>{if(!api.busy)api.refresh().then(()=>setRefreshError('')).catch(e=>setRefreshError(e.message||'监听情报更新失败'));},5000);return()=>clearInterval(timer);},[api,tab]);
 const system=systems.find(s=>s.key===systemKey)||systems.find(s=>s.position.join(':')===(helpers.systemCoord||api.planet.position.slice(0,2)).join(':'))||systems[0];
 const logistics=system&&api.state.logistics.find(s=>s.position.join(':')===system.position.join(':'));
 const openLogistics=()=>helpers.openLogistics(system.position);
 return <div className="sec-screen mega-screen">
  {system&&tab!=='wonders'&&<div className="mega-system-bar"><label className="sec-field">所属恒星系<select value={system.key} onChange={e=>setSystemKey(e.target.value)}>{systems.map(s=><option key={s.key} value={s.key}>{s.name} [{s.position.join(':')}]</option>)}</select></label><div><span>恒星类型</span><b>{system.starType.name}</b></div><div><span>仓储网络</span><b>{system.networked?'星门网络共享':logistics?.level?'同系共享':'本地库存'}</b></div><ActionLink onClick={openLogistics}>恒星系物流</ActionLink></div>}
  <div className="mega-tabs" role="tablist" aria-label="巨构工作区">{[['engineering','工程设施',Factory],['arsenal','恒星武库',Sun],['network','星门调舰',Network],['listening','深空监听',RadioTower],['wonders','文明奇观',Orbit]].map(([id,name,Icon])=><button key={id} role="tab" aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}><Icon size={16}/>{name}</button>)}</div>
  {refreshError&&tab==='listening'&&<p className="note danger" role="alert">{refreshError}</p>}
  {tab==='wonders'?<CivilizationWonders api={api} publicData={publicData} observed={observed}/>:!system?<Blank icon={Orbit} title="暂无可建设巨构的恒星系">建立殖民地后可开展巨构工程；文明奇观可直接浏览。</Blank>:tab==='engineering'?<Engineering api={api} act={act} navigate={navigate} system={system} all={all} selected={selected} setSelected={setSelected} openLogistics={openLogistics}/>:tab==='arsenal'?<Arsenal api={api} act={act} navigate={navigate} system={system} all={all} targetId={helpers.arsenalTarget} facility={helpers.megastructureId}/>:tab==='network'?<GateNetwork api={api} act={act} all={all} system={system}/>:<Listening api={api} all={all}/>}
  {tab==='engineering'&&system&&<section className="panel mega-storage"><Section aside={system.networked?'星门网络':logistics?.level?'本恒星系':'同系库存合计'}>可调配资源</Section><ResourceBars values={system.resources} capacity={system.capacity} rate={system.rate} networked={system.networked}/></section>}
 </div>;
}
