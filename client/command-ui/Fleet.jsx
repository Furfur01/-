import React,{useEffect,useRef,useState} from 'react';
import {ArrowRight,ArrowLeft,ArrowUpRight,Navigation,Ship,Clock3,Fuel,Box,TriangleAlert,Undo2,MapPin,Eye,X,ChevronDown,ChevronUp,Crosshair,ScanEye,Orbit,Pickaxe,Recycle,Rocket,Shield,Send} from 'lucide-react';
import {Section,Pill,Progress,Resources,Empty,number,compact,duration,remaining,stock,label,asset,planetArt} from './shared.jsx';
import {fleetColors,fleetMapChoice} from './fleet-map.mjs';
import {quoteFleet,dispatchTarget,fleetIssues,sum} from './p1-data.mjs';
import {ZonePicker,RepeatPicker,ExpeditionSummary,useEscortAssessment} from './Expedition.jsx';
import {expeditionZones} from '../../game/expedition-rules.mjs';

const names=['金属','晶体','气体'],phaseNames={outbound:'航行中',return:'返航中',holding:'作业中',engaged:'交战中',waiting:'等待交战'};
function Route({p,target,position,progress=0,returning=false}){return <div className={'ui-fleet-route '+(returning?'returning':'')}><div><img src={planetArt(p)} alt=""/><b>{p?.name||'未知星球'}</b><small>{p?.position?.join(' : ')||'坐标未公开'}</small></div><div className="ui-route-line"><span>{returning?'返回出发星球':'单程航线'}</span><i/><Ship size={23} style={{left:`${10+(returning?1-Math.min(1,progress):Math.min(1,progress))*75}%`}}/><small>航线示意 · 非距离比例</small></div><div><img src={planetArt(target)} alt=""/><b>{target?.name||'指定坐标'}</b><small>{(target?.position||position)?.join(' : ')||'— : — : —'}</small></div></div>;}
function Missions({api,act,helpers,onNew,onTask}){
 const [filter,setFilter]=useState(helpers.initialFilter==='incoming'?'incoming':'all'),[selected,setSelected]=useState(null),[pending,setPending]=useState(false),[error,setError]=useState('');
 const rows=api.state.missions.filter(m=>filter==='incoming'?m.inbound:filter==='return'?m.phase==='return':filter==='battle'?['engaged','waiting'].includes(m.phase):true),m=rows.find(m=>m.id===selected)||rows[0];
 const p=m&&(m.inbound?{name:'外来舰队',position:m.fromPosition}:api.state.planets.find(p=>p.id===m.from)),target=m&&(api.state.map.find(p=>p.id===m.target)||api.state.map.find(p=>!p.moon&&p.position.join(':')===m.position.join(':'))),progress=m?(api.now-m.start)/Math.max(1,m.end-m.start):0;
 useEffect(()=>{onTask(m?.task||'transport');},[m?.task,onTask]);
 const follow=async()=>{setPending(true);setError('');try{await helpers.followFleet?.(m.id);}catch(e){setError(e.message||'无法跟随舰队');}finally{setPending(false);}};
 return <div className="ui-missions"><aside className="ui-mission-catalog panel"><Section aside={<button className="text-button" onClick={onNew}>新建派遣<ArrowUpRight size={15}/></button>}>航行任务</Section><div className="ui-fleet-tabs">{[['all','全部'],['incoming','来袭'],['return','返航'],['battle','交战']].map(([id,name])=><button key={id} className={filter===id?'active':''} onClick={()=>{setFilter(id);setSelected(null);}}>{name}</button>)}</div><div className="ui-mission-list">{rows.map(x=><button className={'ui-mission-card '+(x.id===m?.id?'selected':'')} style={{'--mission-color':fleetColors[x.task]}} key={x.id} onClick={()=>setSelected(x.id)}><div><Pill tone={x.inbound?'red':x.phase==='return'?'amber':'mint'}>{x.inbound?'外来舰队':api.catalog.missionNames[x.task]}</Pill><small>{phaseNames[x.phase]||x.phase}</small></div><h3>{api.state.planets.find(p=>p.id===x.from)?.name||(x.fromPosition?'['+x.fromPosition.join(':')+']':'未知起点')}<ArrowRight size={14}/>{x.task==='explore'?'银心黑洞':'['+x.position.join(':')+']'}</h3><p>{x.inbound?'编队信息未公开':number(sum(x.ships))+' 艘舰船'}<span>{x.phase==='engaged'?'交战进行中':remaining(x.end,api.now)}</span></p><Progress value={(api.now-x.start)/Math.max(1,x.end-x.start)} green={!x.inbound}/></button>)}{!rows.length&&<Empty>当前没有此类航行任务。</Empty>}</div></aside><section className="ui-mission-focus panel">{m?<><div className="ui-fleet-focus-heading"><div><small>{m.inbound?'INBOUND SIGNAL':'FLEET OPERATIONS'}</small><h2>{m.inbound?'外来舰队预警':api.catalog.missionNames[m.task]}</h2></div><Pill tone={m.inbound?'red':'mint'}>{phaseNames[m.phase]||m.phase}</Pill></div><Route p={p} target={m.task==='explore'?{name:'银心黑洞',position:m.position}:target} position={m.position} progress={progress} returning={m.phase==='return'}/><div className="ui-flight-metrics"><div><Clock3 size={18}/><span>{m.phase==='holding'?'作业剩余':m.phase==='return'?'返航剩余':'抵达剩余'}</span><b>{m.phase==='engaged'?'交战进行中':remaining(m.end,api.now)}</b></div><div><Navigation size={18}/><span>任务</span><b>{api.catalog.missionNames[m.task]}</b></div></div>{m.repeat&&<div className="ui-expedition-progress"><b>{expeditionZones[m.zone||'outer'].name} · 第 {m.repeat.round} / {m.repeat.total} 轮</b><p>{m.repeat.stopReason?`返港后停止：${m.repeat.stopReason}`:m.repeat.round<m.repeat.total?'按原编队连跑；战损或撤退后停航':'本轮返港后结束'}</p>{!m.repeat.stopReason&&m.repeat.round<m.repeat.total&&<button className="secondary" disabled={api.busy||pending} onClick={()=>act({type:'stopExpedition',id:m.id},'本轮返港后停止')}>本轮后停止</button>}</div>}<Section>编队组成</Section>{m.ships?<div className="ui-mission-ships">{Object.entries(m.ships).filter(([,n])=>n>0).map(([id,n])=><div key={id}><img src={asset('units',id)} alt=""/><span>{label(api,id)}<b>× {number(n)}</b></span></div>)}</div>:<p className="note">当前预警未公开舰型和数量。可前往星图查看目标附近的动态。</p>}{m.cargo&&<><Section>装载物资</Section><Resources values={m.cargo} small/></>}{m.darkMatter>0&&<p className="note">已装载暗物质 {number(m.darkMatter)} · 返航后存入帝国账户</p>}{m.inbound?<p className="note warning"><TriangleAlert size={16}/>请结合任务类型判断来意，运输与驻扎也会显示为外来舰队。</p>:<div className="ui-mission-actions">{!(m.phase==='holding'&&['explore','mine'].includes(m.task))&&<button className="primary" disabled={pending} onClick={follow}><Eye size={17}/>{m.phase==='engaged'?'跟随战斗':'跟随舰队'}</button>}{['outbound','holding','waiting'].includes(m.phase)&&<button className="secondary" disabled={api.busy||pending} onClick={async()=>{setPending(true);try{await act({type:'recall',planet:api.planet.id,id:m.id},'舰队正在返航');}finally{setPending(false);}}}><Undo2 size={16}/>召回舰队</button>}</div>}{m.phase==='holding'&&<p className="note">{m.task==='explore'?'探索结果在作业完成后生成，所得资源随舰队返航后入账。':m.task==='mine'?'采矿完成后携带资源返航；提前召回将中止本次作业。':'舰队正在目标区域执行任务。'}</p>}{error&&<p className="note danger">{error}</p>}</>:<Empty>选择任务查看航线与编队。</Empty>}</section></div>;
}

const taskLabels={explore:'探险',mine:'采矿',destroyMoon:'毁月'};
const taskIcons={attack:Crosshair,transport:Box,deploy:Shield,colonize:Orbit,explore:Navigation,mine:Pickaxe,recycle:Recycle,spy:ScanEye,destroyMoon:Rocket};

export default function Fleet({api,act,navigate,helpers={}}){
 const p=api.planet;
 const [tab,setTab]=useState(['flights','incoming'].includes(helpers.initialFilter)?'missions':'dispatch');
 const [missionTask,setMissionTask]=useState('transport');
 const [step,setStep]=useState(1),[pick,setPick]=useState('to'),[collapsed,setCollapsed]=useState(false),[pending,setPending]=useState(false),[error,setError]=useState('');
 const lock=useRef(false),source=useRef(p.id);
 const [draft,setDraft]=useState(()=>({task:'attack',target:'',speed:100,holdHours:1,zone:'outer',rounds:1,destinationSet:false,...helpers.dispatchDraft,position:[...(helpers.dispatchDraft?.position||[1,p.position[1],1])],ships:{...helpers.dispatchDraft?.ships},cargo:[...(helpers.dispatchDraft?.cargo||[0,0,0])]}));
 const update=patch=>{
  setError('');
  setDraft(previous=>{
   const next={...previous,...patch};
   if(helpers.dispatchDraft)Object.assign(helpers.dispatchDraft,next,{position:[...next.position],ships:{...next.ships},cargo:[...next.cargo]});
   return next;
  });
 };
 const busy=api.busy||pending;
 const quote=quoteFleet(api,p,draft),knownTarget=dispatchTarget(api,draft),target=knownTarget?.id?knownTarget:draft.destination||knownTarget;
 const destination=draft.task==='explore'?{name:'银心 · '+expeditionZones[draft.zone].name,position:draft.position}:draft.task==='mine'&&draft.destinationSet?{name:'小行星带',position:draft.position}:target;
 const issues=fleetIssues(api,p,draft,quote);
 if(!draft.destinationSet)issues.unshift('请在星图中选择目的地');
 const assessment=useEscortAssessment(api,draft);
 if(draft.task==='explore'&&draft.rounds>1&&!assessment?.safe)issues.push(assessment?.error||(!assessment?'正在评估护航，完成后可连跑':'护航不足，请补充护航或改为单次派遣'));
 const ships=Object.entries(p.ships).filter(([id,n])=>n>0&&id!=='Solar_Satellite'&&api.catalog.units[id]?.fleetAvailable!==false&&api.catalog.units[id]?.type!=='defense');
 const own=api.state.missions.filter(m=>!m.inbound),cargo=['transport','deploy','colonize'].includes(draft.task)?draft.cargo:[0,0,0];
 const color=fleetColors[tab==='missions'?missionTask:draft.task],TaskIcon=taskIcons[draft.task],saved=p.expeditionPreset;

 // Map clicks never change the operating colony while choosing an arrival planet.
 useEffect(()=>helpers.subscribeFleetPick?.(point=>{
  if(tab!=='dispatch'||busy)return;
  const choice=fleetMapChoice(api,p,draft,pick,point);
  if(choice.error){setError(choice.error);return;}
  if(choice.departure){source.current=choice.departure;helpers.selectDeparture(choice.departure);setPick('to');}
  update(choice.patch);setStep(1);setCollapsed(false);
 }),[api,p,draft,pick,tab,busy,helpers.subscribeFleetPick,helpers.selectDeparture]);
 useEffect(()=>{
  if(source.current===p.id)return;
  source.current=p.id;update({ships:{},cargo:[0,0,0],...(draft.task==='explore'?{position:[1,p.position[1],16]}:{})});setStep(1);
 },[p.id]);
 useEffect(()=>{
  helpers.setFleetMap?.(tab==='dispatch'?{from:p.id,target:draft.target,position:draft.position,task:draft.task,destinationSet:draft.destinationSet,pick}:null);
 },[p.id,draft,tab,pick,helpers.setFleetMap]);
 useEffect(()=>()=>helpers.setFleetMap?.(null),[helpers.setFleetMap]);

 const chooseTask=task=>{
  const special=['explore','mine'].includes(task),wasSpecial=['explore','mine'].includes(draft.task);
  update({task,cargo:[0,0,0],...(special||wasSpecial?{target:'',destination:null,destinationSet:task==='explore',position:[1,p.position[1],special?16:1]}:{})});
  setPick('to');
  if(task==='explore')helpers.locateFleetPoint?.('core');
 };
 const selectEndpoint=endpoint=>{setPick(endpoint);setStep(1);setError('');if(innerWidth<=700)setCollapsed(true);};
 const savedPlan=()=>({...draft,...saved,task:'explore',target:'',destination:null,destinationSet:true,ships:{...saved.ships},position:[...saved.position],cargo:[0,0,0]});
 const submit=async(plan=draft)=>{
  if(lock.current||busy)return;
  update(plan);setStep(3);
  const initial=fleetIssues(api,p,plan);
  if(!plan.destinationSet)initial.unshift('请在星图中选择目的地');
  if(initial.length){setError(initial[0]);return;}
  const playerId=api.state.player.id;
  lock.current=true;setPending(true);setError('');
  try{
   await helpers.prepareDeparture?.();
   if(api.state.player.id!==playerId||api.planet.id!==p.id)throw Error('出发账号或星球已变化，请重新确认派遣');
   const latest=fleetIssues(api,api.planet,plan);
   if(latest.length)throw Error(latest[0]);
   const {task,target,position,ships,speed,holdHours,zone,rounds}=plan;
   const ok=await act({type:'dispatch',planet:p.id,task,target,position,ships,speed,holdHours,zone,rounds,cargo:['transport','deploy','colonize'].includes(task)?plan.cargo:[0,0,0]},'舰队已出发');
   if(ok){update({ships:{},cargo:[0,0,0]});setTab('missions');setStep(1);setCollapsed(false);}
   else setError(api.error||'派遣失败，请重试');
  }catch(e){setError(e.message||'舰队准备失败，请重试');}
  finally{lock.current=false;setPending(false);}
 };
 const newDispatch=()=>{setTab('dispatch');setStep(1);setPick('to');setError('');};
 return <div className={'ui-fleet-map'+(collapsed?' is-collapsed':'')} style={{'--fleet-accent':color}}>
  {tab==='dispatch'&&<div className="ui-fleet-map-hint" role="status"><span className="fleet-light"/><div><b>{pick==='from'?'点选出发星球':draft.task==='explore'?'点选银心探索区域':draft.task==='mine'?'点选小行星带':'点选到达星球'}</b><small>{pick==='from'?'只能从自己的星球或月球出发':'双击恒星进入星系 · 拖动与缩放查看航线'}</small></div></div>}
  <section className="ui-fleet-console" aria-label="星图舰队操作">
   <header className="ui-fleet-console-heading"><div><span className="eyebrow">FLEET / STAR CHART</span><h1><span className="fleet-light"/>舰队行动</h1></div><button className="icon-button fleet-collapse" aria-label={collapsed?'展开舰队面板':'收起舰队面板'} aria-expanded={!collapsed} onClick={()=>setCollapsed(v=>!v)}>{collapsed?<ChevronUp size={18}/>:<ChevronDown size={18}/>}</button><button className="icon-button" aria-label="关闭舰队面板" onClick={helpers.closeFleet}><X size={19}/></button></header>
   <nav className="ui-fleet-console-tabs" aria-label="舰队面板"><button className={tab==='dispatch'?'active':''} onClick={()=>setTab('dispatch')}><Navigation size={16}/>派遣</button><button className={tab==='missions'?'active':''} onClick={()=>setTab('missions')}><Clock3 size={16}/>航行任务 <span>{api.state.missions.length}</span></button><small>名额 {own.length} / {1+(api.state.player.tech.Computer_Tech||0)}</small></nav>
   {tab==='missions'?<div className="ui-fleet-console-scroll"><Missions api={api} act={act} helpers={helpers} onNew={newDispatch} onTask={setMissionTask}/></div>:<>
    <div className="ui-fleet-endpoints">
     {[[p,'from','出发'],[draft.destinationSet?destination:null,'to','到达']].map(([body,id,title])=><button key={id} className={pick===id?'active':''} aria-pressed={pick===id} disabled={busy} onClick={()=>selectEndpoint(id)}><span className="ui-endpoint-label"><i/>{title}</span><b>{body?.name||'在星图中点选'}</b><small>{body?.position?.join(' : ')||'尚未选择目的地'}</small><Crosshair size={14}/></button>)}
    </div>
    <nav className="ui-fleet-stepper" aria-label="派遣步骤">{['航线','编队','出发'].map((name,i)=><button key={name} disabled={busy} className={step===i+1?'active':''} aria-current={step===i+1?'step':undefined} onClick={()=>setStep(i+1)}><span>{i+1}</span>{name}</button>)}</nav>
    <div className="ui-fleet-console-scroll">
     {error&&<p className="note danger" role="alert">{error}</p>}
     <fieldset className="ui-fleet-fields" disabled={busy}>
     {step===1?<>
      <Section>行动类型</Section><div className="ui-map-task-picker">{Object.entries(api.catalog.missionNames).map(([id,name])=>{const Icon=taskIcons[id];return <button key={id} className={draft.task===id?'active':''} style={{'--task-color':fleetColors[id]}} title={name} aria-label={name} aria-pressed={draft.task===id} onClick={()=>chooseTask(id)}><Icon size={17}/><span>{taskLabels[id]||name}</span><i/></button>;})}</div>
      <div className="ui-fleet-action-caption"><TaskIcon size={18}/><span>{api.catalog.missionNames[draft.task]}<small>{draft.destinationSet?'航线已选定，可继续配置编队':'在星图中点选到达位置'}</small></span><button className="text-button" onClick={()=>helpers.locateFleetPoint?.(pick==='from'?p.id:draft.task==='explore'?'core':draft.destinationSet?(draft.target||draft.position.join(':')):p.id)}><MapPin size={14}/>定位</button></div>
      {draft.task==='colonize'&&<p className="note">殖民地 {api.state.player.colonyCount} / {api.state.player.colonyLimit} · 在途预留 {api.state.player.colonyReserved}。首次成功殖民取得恒星系归属；其他势力星域无法殖民。</p>}
      {draft.task==='explore'&&<ZonePicker api={api} draft={draft} update={patch=>{update(patch);helpers.locateFleetPoint?.('core',patch.zone);}}/>}
      {saved&&<div className="ui-map-preset"><span><b>已保存银心编队</b><small>{expeditionZones[saved.zone].name} · {number(sum(saved.ships))} 艘 · {saved.rounds} 轮</small></span><button className="text-button" onClick={()=>{update(savedPlan());setStep(2);}}>载入</button><button className="text-button" onClick={()=>submit(savedPlan())}>出发<ArrowUpRight size={14}/></button></div>}
     </>:step===2?<>
      <Section aside={<div><button className="text-button" onClick={()=>update({ships:Object.fromEntries(ships)})}>全选</button><button className="text-button" onClick={()=>update({ships:{}})}>清空</button></div>}>驻港舰船</Section>
      <div className="ui-map-ship-pick">{ships.map(([id,n])=><div className={(draft.ships[id]||0)>0?'selected':''} key={id}><img src={asset('units',id)} alt=""/><label htmlFor={'fleet-count-'+id}><b>{label(api,id)}</b><small>驻港 {number(n)}</small></label><input id={'fleet-count-'+id} type="number" min="0" max={n} value={draft.ships[id]||0} aria-label={`${label(api,id)}派遣数量`} onChange={e=>update({ships:{...draft.ships,[id]:Math.max(0,Math.min(n,Math.floor(Number(e.target.value)||0)))}})}/><button className="text-button" onClick={()=>update({ships:{...draft.ships,[id]:n}})}>全部</button></div>)}</div>
      {!ships.length&&<Empty>此处没有可派遣舰船。<button className="text-button" onClick={()=>navigate('shipyard')}>前往造舰<ArrowUpRight size={15}/></button></Empty>}
      <button className="text-button" onClick={()=>navigate('missiles')}>星际导弹<ArrowUpRight size={15}/></button>
     </>:<>
      <Section>航行速度</Section><div className="ui-speed-picker">{[100,75,50,25,10].map(n=><button key={n} className={draft.speed===n?'active':''} onClick={()=>update({speed:n})}>{n}%</button>)}</div>
      {draft.task==='mine'&&<><Section>采矿时长</Section><div className="ui-speed-picker">{[1,2,3,4].map(n=><button key={n} className={draft.holdHours===n?'active':''} onClick={()=>update({holdHours:n})}>{n*30} 分钟</button>)}</div></>}
      {draft.task==='explore'&&<RepeatPicker draft={draft} update={update}/>}
      {['transport','deploy','colonize'].includes(draft.task)&&<><Section aside={`货舱 ${compact(quote.capacity)}`}>装载物资</Section><div className="ui-cargo-fields">{names.map((n,i)=><label className="field-label" key={n}>{n}<input type="number" min="0" aria-label={`装载${n}`} value={draft.cargo[i]} onChange={e=>update({cargo:draft.cargo.map((v,j)=>i===j?Math.max(0,Math.floor(Number(e.target.value)||0)):v)})}/><small>可用 {compact(stock(p)[i])}</small></label>)}</div><div className="ui-map-load"><span>装载 {compact(sum(cargo))} / {compact(quote.capacity)}</span><Progress value={sum(cargo)/Math.max(1,quote.capacity)} green/></div></>}
      <div className="ui-map-review"><TaskIcon size={20}/><p>从 <b>{p.name}</b> 派出 <b>{number(quote.count)} 艘</b>，前往 <b>{draft.destinationSet?destination?.name||'选定位置':'未选目的地'}</b> 执行<b>{api.catalog.missionNames[draft.task]}</b>。</p></div>
      {issues.length>0&&<ul className="ui-fleet-issues">{issues.map(issue=><li key={issue}>{issue}</li>)}</ul>}
      {draft.task==='transport'&&p.storage?.shared&&target?.owner===api.state.player.id&&target.position[1]===p.position[1]&&<p className="note">同恒星系库存已共享，日常建设可直接使用全系资源。</p>}
     </>}
     {['explore','mine'].includes(draft.task)&&step>=2&&<ExpeditionSummary api={api} draft={draft} assessment={assessment}/>}
     {draft.task==='explore'&&step>=2&&<button className="text-button ui-save-expedition" disabled={!quote.count} onClick={()=>act({type:'saveExpeditionPreset',planet:p.id,ships:draft.ships,zone:draft.zone,rounds:draft.rounds,speed:draft.speed,position:draft.position},'银心编队已保存')}>保存当前探险编队</button>}
     </fieldset>
    </div>
    <footer className="ui-fleet-console-footer"><div className="ui-map-estimate"><div><span><Ship size={13}/>舰船</span><b>{number(quote.count)} <small>艘</small></b></div><div><span><Clock3 size={13}/>单程</span><b>{quote.count&&draft.destinationSet?duration(quote.seconds):'—'}</b></div><div><span><Fuel size={13}/>燃料</span><b>{quote.count&&draft.destinationSet?compact(quote.fuel):'—'} <small>气体</small></b></div></div>
     {['explore','mine'].includes(draft.task)&&quote.count>0&&<p className="ui-map-round">整轮 {duration(quote.seconds*2+(draft.task==='explore'?expeditionZones[draft.zone].seconds:draft.holdHours*api.catalog.rules.explorationHourSeconds))} · 包含往返与作业</p>}
     <div className="ui-map-step-actions">{step>1?<button className="text-button" disabled={busy} onClick={()=>setStep(n=>n-1)}><ArrowLeft size={15}/>上一步</button>:<small>星图选点 · 随时可改</small>}{step<3?<button className="primary" disabled={busy||(step===1&&!draft.destinationSet)} onClick={()=>setStep(n=>n+1)}>{step===1?'配置编队':'装载与出发'}<ArrowRight size={16}/></button>:<button className="primary" disabled={busy||issues.length>0} onClick={()=>submit()}><Send size={16}/>{pending?'准备舰队…':api.busy?'正在提交':'确认派遣'}</button>}</div>
    </footer>
   </>}
  </section>
 </div>;
}