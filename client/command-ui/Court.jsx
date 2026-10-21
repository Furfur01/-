import React,{useEffect,useRef,useState} from 'react';
import {Search,ArrowUpRight,ArrowUp,ArrowDown,Plus,Trash2,Pause,Play,AlertTriangle,Check,RefreshCw,Package,Building2,ShieldAlert,Hammer,ListChecks,Zap,Grid2x2,CheckSquare,Swords,Crosshair,Warehouse,Moon,Pickaxe,Factory,FlaskConical,Radar,LayoutGrid,Construction} from 'lucide-react';
import {Resources,Progress,Pill,Section,Empty,Dialog,number,compact,remaining,label,asset,planetArt} from './shared.jsx';
import {canPlan,planOf,empireSystems,colonyIssues,nextGoalLevel,estimatePlan,templatePayload,previewChanged} from './court-data.mjs';
import CourtSystems,{SystemNavigation,ResourceBars,OrbitDiagram} from './CourtSystems.jsx';

const resourceNames=['金属','晶体','气体'];
const templateCopy={resource:'优势矿产与基础能源',industry:'太空电梯、机器人与综合体',research:'实验室与科研基础设施',frontier:'雷达、太空电梯与行星保障'};
const templateIcons={resource:Pickaxe,industry:Factory,research:FlaskConical,frontier:Radar};
const issueIcons={battle:Swords,threat:Crosshair,plan:Construction,energy:Zap,storage:Warehouse};
const filters=[['all','全部',LayoutGrid],['attention','待处理',AlertTriangle],['idle','闲置',Hammer],['energy','能源',Zap],['storage','仓储',Warehouse],['moon','月球',Moon]];
function Ring({value=0,tone='mint',label,children}){const r=13,c=2*Math.PI*r,v=Math.max(0,Math.min(1,Number.isFinite(value)?value:0));return <span className={'court-ring '+tone} title={label} role="img" aria-label={label}><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r={r}/><circle className="fill" cx="16" cy="16" r={r} strokeDasharray={c} strokeDashoffset={c*(1-v)} transform="rotate(-90 16 16)"/></svg>{children}</span>;}
const growthCopy={resource:'优势矿产再升 5 级，机器人与辅助矿再升 2 级。',industry:'太空电梯再升 5 级，机器人与三类综合体再升 2 级。',research:'实验室再升 5 级，机器人与三类综合体再升 2 级。',frontier:'太空电梯与雷达再升 5 级，机器人、保障中心与综合体再升 2 级。'};
const status=p=>p.moon?'月球设施独立管理':planOf(p).paused?(p.buildQueue?'施工中 · 后续暂停':'计划已暂停'):p.planStatus?.reason||'建设闲置';
const queueKey=q=>q?[q.id,q.level,q.start,q.end].join(':'):'';
const queueProgress=(q,now)=>q?(now-q.start)/Math.max(1,q.end-q.start):0;

function ErrorNote({message,onRefresh,busy}) {
  if(!message)return null;
  return <div className="court-error" role="alert"><AlertTriangle size={16}/><span>{message}</span>{onRefresh&&<button type="button" className="text-button" disabled={busy} onClick={onRefresh}><RefreshCw size={14}/>刷新后重试</button>}</div>;
}

function PlanItem({api,p,item,index,count,busy,update}) {
  const [goal,setGoal]=useState(item.level),definition=api.catalog.buildings[item.id];
  return <li className="plan-item">
    <span className="plan-order">{String(index+1).padStart(2,'0')}</span>
    <img src={asset('buildings',item.id)} alt=""/>
    <div className="plan-item-name"><b>{label(api,item.id,p)}</b><small>当前 Lv {p.buildings[item.id]||0} · 目标 Lv {item.level}</small></div>
    <form className="plan-goal-edit" onSubmit={e=>{e.preventDefault();update({mode:'level',index,level:Number(goal)});}}>
      <label><span>目标等级</span><input type="number" min="1" max={definition?.one?1:50} step="1" required aria-label={`第 ${index+1} 项目标等级`} value={goal} onChange={e=>setGoal(e.target.value)} disabled={busy}/></label>
      <button type="submit" className="text-button" disabled={busy||Number(goal)===item.level}>保存</button>
    </form>
    <div className="plan-item-actions"><button type="button" className="icon-button" disabled={busy||index===0} aria-label={`上移第 ${index+1} 项`} title="上移" onClick={()=>update({mode:'move',index,direction:-1})}><ArrowUp size={17}/></button><button type="button" className="icon-button" disabled={busy||index===count-1} aria-label={`下移第 ${index+1} 项`} title="下移" onClick={()=>update({mode:'move',index,direction:1})}><ArrowDown size={17}/></button><button type="button" className="icon-button" disabled={busy} aria-label={`移除第 ${index+1} 项`} title="移除目标" onClick={()=>update({mode:'remove',index})}><Trash2 size={16}/></button></div>
  </li>;
}

export function Plan({api,planetId,act,onClose,navigate,helpers={}}) {
  const p=api.state.planets.find(x=>x.id===planetId),[id,setId]=useState('Metal_Mine'),[level,setLevel]=useState(()=>p?nextGoalLevel(p,'Metal_Mine'):1),[pending,setPending]=useState(false),[error,setError]=useState(''),[confirmation,setConfirmation]=useState(null),[updated,setUpdated]=useState(false);
  const revision=useRef(p?.constructionPlan?.revision);
  useEffect(()=>{setId('Metal_Mine');setLevel(p?nextGoalLevel(p,'Metal_Mine'):1);setError('');setConfirmation(null);setUpdated(false);revision.current=p?.constructionPlan?.revision;},[planetId]);
  useEffect(()=>{const next=p?.constructionPlan?.revision;if(revision.current!==undefined&&revision.current!==next)setUpdated(true);revision.current=next;},[p?.constructionPlan?.revision]);
  if(!p)return <Dialog title="建设计划" onClose={onClose}><Empty>这处基地已不在当前列表中。</Empty></Dialog>;
  if(!canPlan(p))return <Dialog title={`${p.name} · 基地管理`} onClose={onClose}><p className="note">{p.moon?'月球设施通过月球行动和建筑页面管理，暂不支持自动建设计划。':'建设计划仅支持第 1 银河的本方行星。'}</p><button className="primary" onClick={()=>{onClose();api.setPlanet(p.id);navigate(p.moon?'moon':'buildings');}}>进入{p.moon?'月球行动':'建筑管理'}<ArrowUpRight size={16}/></button></Dialog>;
  const plan=planOf(p),q=p.buildQueue,busy=api.busy||pending,estimate=estimatePlan(p,plan.items,api.catalog.buildings),buildings=Object.values(api.catalog.buildings).filter(b=>api.catalog.surfaceLayout?.slots?.[b.id]);
  const refresh=async()=>{setPending(true);try{const result=await api.refresh();setError(result?'':api.error||'刷新失败，请重试');}catch(cause){setError(cause.message);}finally{setPending(false);}};
  const update=async(payload)=>{
    if(busy)return;
    setPending(true);setError('');setUpdated(false);
    try{const result=await act({type:'plan',planet:p.id,revision:plan.revision,...payload},'建设计划已更新');if(!result)setError(api.error||'计划未更新，请刷新后重试');else setConfirmation(null);}
    catch(cause){setError(cause.message||'计划未更新，请重试');}
    finally{setPending(false);}
  };
  const cancelBuild=async()=>{
    const latest=api.state.planets.find(x=>x.id===p.id)?.buildQueue;
    if(busy||confirmation?.queue!==queueKey(latest)||!latest||latest.end<=api.now){setError('施工已变化，请刷新后确认当前项目');setConfirmation(null);return;}
    setPending(true);setError('');
    try{const result=await act({type:'cancel',kind:'build',planet:p.id},'施工已取消并退费，后续计划已暂停');if(result)setConfirmation(null);else setError(api.error||'施工未取消，请重试');}
    catch(cause){setError(cause.message||'施工未取消，请重试');}
    finally{setPending(false);}
  };
  const confirmChanged=confirmation&&(confirmation.kind==='clear'?confirmation.revision!==plan.revision:confirmation.queue!==queueKey(q)||q?.end<=api.now);
  return <Dialog title={`${p.name} · 建设计划`} onClose={onClose} wide><div className="plan-workspace">
    <div className="plan-intro"><div><Pill tone={plan.paused?'neutral':p.planStatus?.state==='blocked'?'amber':'mint'}>{status(p)}</Pill><p>按目标顺序逐级升级，开工时扣费。</p></div><button className="secondary" disabled={busy} onClick={()=>update({mode:'pause',paused:!plan.paused})}>{plan.paused?<Play size={15}/>:<Pause size={15}/>} {plan.paused?'继续计划':'暂停后续计划'}</button></div>
    {plan.repairNote&&<p className="note">{plan.repairNote}</p>}
    {q?<div className="plan-current"><div><Pill tone="amber">正在施工</Pill><b>{label(api,q.id,p)} → Lv {q.level}</b><span>{remaining(q.end,api.now)}</span></div><Progress value={queueProgress(q,api.now)}/><button className="text-button" disabled={busy||q.end<=api.now} onClick={()=>setConfirmation({kind:'cancel',queue:queueKey(q)})}>取消施工 · 返还资源</button></div>:<p className="note">{p.planStatus?.reason||'当前没有施工项目。'}{p.planStatus?.wake&&<> · 预计 {remaining(p.planStatus.wake,api.now)} 后重新检查</>}</p>}
    <ErrorNote message={error} onRefresh={refresh} busy={busy}/>
    {updated&&<p className="plan-update-note" role="status">已同步服务器上的最新计划。请以当前项目顺序和目标等级为准。</p>}
    <Section aside={`${plan.items.length} / 200 项目标`}>后续建设目标</Section>
    <ol className="plan-items">{plan.items.map((item,index)=><PlanItem key={`${plan.revision}:${index}:${item.id}`} api={api} p={p} item={item} index={index} count={plan.items.length} busy={busy} update={update}/>)}</ol>
    {!plan.items.length&&<Empty>计划为空。添加目标，或在帝国王庭应用发展模板。</Empty>}
    <form className="plan-add" onSubmit={e=>{e.preventDefault();update({mode:'add',id,level:Number(level)});}}><label className="field-label">设施<select aria-label="计划设施" value={id} disabled={busy} onChange={e=>{const next=e.target.value;setId(next);setLevel(api.catalog.buildings[next]?.one?1:nextGoalLevel(p,next));}}>{buildings.map(b=><option value={b.id} key={b.id}>{label(api,b.id,p)} · Lv {p.buildings[b.id]||0}</option>)}</select></label><label className="field-label">目标等级<input aria-label="新增目标等级" type="number" min="1" max={api.catalog.buildings[id]?.one?1:50} step="1" required value={level} disabled={busy} onChange={e=>setLevel(e.target.value)}/></label><button type="submit" className="secondary" disabled={busy||plan.items.length>=200}><Plus size={16}/>加入计划</button></form>
    <div className="plan-estimate"><Section aside={`${estimate.upgrades} 次升级 · 不含当前已付费施工`}>全部待建目标 · 费用估算</Section><Resources values={estimate.cost}/></div>
    <p className="note">暂停只停止后续开工，当前施工继续。缺少资源会等待；前置条件或方圆不足会停止并显示原因。手动计划需要自行安排前置设施。</p>
    {confirmation&&<div className="plan-confirm" role="alert"><strong>{confirmation.kind==='clear'?'清空全部待建目标？':'取消当前施工并暂停后续计划？'}</strong><p>{confirmation.kind==='clear'?`将移除 ${plan.items.length} 项待建目标，当前施工继续；尚未开工的目标没有扣费。`:'当前项目的已支付资源将全额退回可用仓库。后续计划保留并暂停。'}</p>{confirmation.kind==='cancel'&&q&&<Resources values={q.cost||[0,0,0]} small/>}{confirmChanged&&<p className="warning">项目已更新，请关闭本次确认，重新检查计划。</p>}<div><button className="secondary" disabled={busy} onClick={()=>setConfirmation(null)}>保留现状</button><button className="secondary danger" disabled={busy||confirmChanged} onClick={()=>confirmation.kind==='clear'?update({mode:'clear'}):cancelBuild()}>{confirmation.kind==='clear'?'确认清空待建目标':'确认取消并退费'}</button></div></div>}
    <div className="plan-footer"><button className="text-button danger" disabled={busy||!plan.items.length} onClick={()=>setConfirmation({kind:'clear',revision:plan.revision})}><Trash2 size={15}/>清空待建计划</button><button className="text-button" onClick={()=>{onClose();helpers.openPlanet?.(p.id);}}>进入星球<ArrowUpRight size={15}/></button></div>
  </div></Dialog>;
}

export default function Court({api,act,navigate,helpers={}}) {
  const [selectedSystem,setSelectedSystem]=useState(''),systems=empireSystems(api.state),root=useRef(null);
  const system=systems.find(s=>s.key===selectedSystem);
  const select=key=>{setSelectedSystem(key);helpers.openPlan?.(null);};
  useEffect(()=>{if(selectedSystem&&!system)setSelectedSystem('');},[selectedSystem,system?.key]);
  useEffect(()=>{const body=root.current?.closest('.ui-body');if(body)body.scrollTop=0;},[selectedSystem]);
  return <div ref={root}>{system?<SystemManagement key={system.key} api={api} act={act} navigate={navigate} helpers={helpers} system={system} systems={systems} onSelect={select}/>:<CourtSystems systems={systems} onSelect={select} openLogistics={helpers.openLogistics}/>}</div>;
}

function SystemManagement({api,act,navigate,helpers,system,systems,onSelect}) {
  const [search,setSearch]=useState(''),[filter,setFilter]=useState('all'),[selected,setSelected]=useState([]),[template,setTemplate]=useState('resource'),[growth,setGrowth]=useState('fixed'),[mode,setMode]=useState('append'),[preview,setPreview]=useState(null),[previewing,setPreviewing]=useState(false),[applying,setApplying]=useState(false),[error,setError]=useState('');
  const requestId=useRef(0),mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;requestId.current++;};},[]);
  const state=api.state,all=system.planets,eligible=all.filter(canPlan),eligibleKey=eligible.map(p=>p.id).sort().join('|'),templates=state.developmentTemplates||[],totals=system.totals;
  useEffect(()=>{const ids=new Set(eligibleKey.split('|'));setSelected(current=>current.filter(id=>ids.has(id)));},[eligibleKey]);
  const selectedIds=selected.filter(id=>eligible.some(p=>p.id===id));
  const issues=new Map(all.map(p=>[p.id,colonyIssues(state,p)]));
  const warnings=all.flatMap(p=>issues.get(p.id).map(issue=>({...issue,p})));
  const rows=all.filter(p=>{
    const text=`${p.name} ${p.position.join(':')}`.toLowerCase(),items=issues.get(p.id);
    return text.includes(search.trim().toLowerCase())&&(filter==='all'||filter==='attention'&&items.length||filter==='idle'&&!p.buildQueue||filter==='energy'&&items.some(x=>x.type==='energy')||filter==='storage'&&items.some(x=>x.type==='storage')||filter==='moon'&&p.moon);
  }).sort((a,b)=>Number(issues.get(b.id).length>0)-Number(issues.get(a.id).length>0)||a.position.join(':').localeCompare(b.position.join(':'),undefined,{numeric:true})||Number(!!a.moon)-Number(!!b.moon));
  const visibleEligible=rows.filter(canPlan),allSelected=visibleEligible.length>0&&visibleEligible.every(p=>selectedIds.includes(p.id));
  const busy=api.busy||applying,stale=preview&&previewChanged(state,preview);
  const toggle=id=>setSelected(current=>current.includes(id)?current.filter(x=>x!==id):[...current,id]);
  const attend=issue=>{
    if(issue.type==='battle'||issue.type==='threat'){api.setPlanet(issue.p.id);navigate(issue.type==='battle'?'battle':'fleet',issue.type==='threat'?{fleetTab:'incoming'}:{});return;}
    if(issue.type==='plan'){helpers.openPlan?.(issue.p.id);return;}
    if(issue.type==='storage'&&system.logistics) {helpers.openLogistics?.(system.position);return;}
    helpers.openPlanet?.(issue.p.id);
  };
  async function showPreview(request={planets:[...selectedIds],template,growth,mode}) {
    if(previewing||busy)return;
    const token=++requestId.current;setPreviewing(true);setError('');
    try {
      const response=await api.previewPlan(request),next={...request,...response};templatePayload(next);
      if(mounted.current&&token===requestId.current)setPreview(next);
    } catch(cause) {if(mounted.current&&token===requestId.current)setError(cause.message||'无法生成计划，请重试');}
    finally {if(mounted.current&&token===requestId.current)setPreviewing(false);}
  }
  async function applyPreview() {
    if(!preview||busy||previewing||stale)return;
    setApplying(true);setError('');
    try {
      const result=await act(templatePayload(preview),'发展模板已应用，当前施工与暂停状态保留');
      if(mounted.current){if(result)setPreview(null);else setError(api.error||'模板未应用。可重新预览或重试。');}
    } catch(cause) {if(mounted.current)setError(cause.message||'模板未应用，请重试');}
    finally {if(mounted.current)setApplying(false);}
  }
  const retryPreview=async()=>{
    if(previewing||busy)return;
    const request={planets:preview.planets,template:preview.template,growth:preview.growth,mode:preview.mode};
    try {await api.refresh();if(mounted.current)await showPreview(request);}
    catch(cause){if(mounted.current)setError(cause.message||'无法刷新，请重试');}
  };
  const tile=p=>{const alerts=issues.get(p.id),plan=planOf(p),q=p.buildQueue,e=p.economy,storage=p.storage||{resources:p.resources,capacity:e.capacity},ratio=Math.max(0,Math.min(1,e.ratio??1)),fields=p.fields?p.usedFields/p.fields:0,picked=selectedIds.includes(p.id);
    return <article key={p.id} className={'court-colony glass '+(picked?'selected ':'')+(alerts.length?'attention':'')}>
      <header><label className="court-check" title={canPlan(p)?'选择以应用模板':'月球不参与模板'}><input type="checkbox" aria-label={`选择${p.name}应用发展模板`} checked={picked} disabled={!canPlan(p)||busy} onChange={()=>toggle(p.id)}/></label><button className="court-colony-name" onClick={()=>helpers.openPlanet?.(p.id)}><img src={planetArt(p)} alt=""/><span><b>{p.name}{p.id===state.player.home&&<small className="court-capital">◆</small>}</b><small>{p.position.join(':')}{p.moon?' · 月球':''}</small></span></button><Ring value={ratio} tone={ratio<1?'danger':'mint'} label={`能源 ${Math.round(ratio*100)}%`}><Zap size={12}/></Ring></header>
      <ResourceBars values={storage.shared?storage.resources:p.resources} capacity={storage.capacity} rate={e.rate}/>
      <div className="court-fields" title={`方圆 ${p.usedFields} / ${p.fields}`}><Grid2x2 size={12}/><i><b className={fields>=.9?'full':''} style={{width:Math.min(1,fields)*100+'%'}}/></i><span>{p.usedFields}/{p.fields}</span></div>
      <div className="court-build">{q?<><Ring value={queueProgress(q,api.now)} tone="amber" label="施工进度"><Hammer size={12}/></Ring><span><b>{label(api,q.id,p)} <em>Lv {q.level}</em></b><small>{remaining(q.end,api.now)}</small></span></>:<><span className="court-idle"><Hammer size={13}/></span><span><b className="muted">空闲</b>{p.planStatus?.state==='blocked'&&<small className="warning">{p.planStatus.reason}</small>}</span></>}{canPlan(p)&&<span className="court-goal-count" title="待建目标"><ListChecks size={12}/>{plan.items.length}{plan.paused&&<Pause size={11}/>}</span>}</div>
      <footer>{alerts.map(issue=>{const Icon=issueIcons[issue.type]||AlertTriangle;return <button key={issue.type} className={'court-alert '+issue.tone} title={issue.text} aria-label={issue.text} onClick={()=>attend({...issue,p})}><Icon size={14}/></button>;})}<button className="text-button" onClick={()=>canPlan(p)?helpers.openPlan?.(p.id):(api.setPlanet(p.id),navigate('moon'))}>{canPlan(p)?'建设计划':'月球行动'}<ArrowUpRight size={14}/></button></footer>
    </article>;};
  return <div className="court-workspace screen-enter">
    <SystemNavigation systems={systems} system={system} onSelect={onSelect} busy={busy||previewing}/>
    <div className="court-overview glass"><OrbitDiagram planets={all} size={120}/><div className="court-identity"><span className="eyebrow">SYSTEM</span><h2>{system.position.join(' : ')}{system.home&&<small className="court-home-badge">◆ 母星</small>}</h2><div className="court-numbers"><span title="正在建设"><Hammer size={15}/><b>{totals.building}</b><small>/{all.length}</small></span><span title="需要处理" className={warnings.length?'warning':''}><AlertTriangle size={15}/><b>{all.filter(p=>issues.get(p.id).length).length}</b></span><span title="后续目标"><ListChecks size={15}/><b>{number(totals.goals)}</b></span></div></div><div className="court-economy"><ResourceBars values={totals.resources} capacity={totals.capacity} rate={totals.rate}/>{system.logistics&&<button className="text-button" onClick={()=>helpers.openLogistics?.(system.position)}><Package size={14}/>物流<ArrowUpRight size={14}/></button>}</div></div>
    <div className="court-body"><section className="court-colonies">
      <div className="court-toolbar"><div className="court-filters" role="group" aria-label="殖民地筛选">{filters.map(([key,name,Icon])=><button key={key} className={filter===key?'active':''} aria-pressed={filter===key} title={name} onClick={()=>setFilter(key)}><Icon size={14}/><span>{name}</span></button>)}</div><label className="search"><Search size={15}/><input type="search" aria-label="搜索殖民地" placeholder="名称或坐标" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="court-check court-select-all" title="全选可编排行星"><input type="checkbox" aria-label="选择当前可编排计划的行星" checked={allSelected} disabled={!visibleEligible.length||busy} onChange={e=>setSelected(current=>e.target.checked?[...new Set([...current,...visibleEligible.map(p=>p.id)])]:current.filter(id=>!visibleEligible.some(p=>p.id===id)))}/><CheckSquare size={14}/></label></div>
      <div className="court-colony-grid">{rows.map(tile)}</div>{!rows.length&&<Empty>没有符合条件的基地</Empty>}
    </section><aside className="court-template-panel glass"><div className="panel-title"><h2>发展模板</h2><Pill tone={selectedIds.length?'mint':'neutral'}>{selectedIds.length} 颗</Pill></div>
      {!templates.length?<p className="note">建设计划服务尚未就绪，请重启后台</p>:<><div className="court-template-choices" role="group" aria-label="发展模板">{templates.map(t=>{const Icon=templateIcons[t.id]||Building2;return <button className={template===t.id?'selected':''} aria-pressed={template===t.id} disabled={busy} key={t.id} title={templateCopy[t.id]||t.description} onClick={()=>setTemplate(t.id)}><Icon size={22}/><b>{t.name}</b></button>;})}</div>
      <div className="court-segment" role="group" aria-label="发展计划类型"><button className={growth==='fixed'?'active':''} aria-pressed={growth==='fixed'} disabled={busy} onClick={()=>setGrowth('fixed')}>基础目标</button><button className={growth==='incremental'?'active':''} aria-pressed={growth==='incremental'} disabled={busy||!state.planGrowthModes?.includes('incremental')} onClick={()=>setGrowth('incremental')}>增量发展</button></div>
      <div className="court-segment" role="group" aria-label="计划应用方式"><button className={mode==='append'?'active':''} aria-pressed={mode==='append'} disabled={busy} onClick={()=>setMode('append')}><Plus size={13}/>追加</button><button className={mode==='replace'?'active':''} aria-pressed={mode==='replace'} disabled={busy} onClick={()=>setMode('replace')}><RefreshCw size={13}/>替换</button></div>
      <p className="court-template-description">{growth==='incremental'?growthCopy[template]:templateCopy[template]||templates.find(t=>t.id===template)?.description}</p>
      <button className="primary full" disabled={!selectedIds.length||selectedIds.length>200||busy||previewing} onClick={()=>showPreview()}>{previewing?<RefreshCw size={16}/>:<Building2 size={16}/>} {previewing?'正在生成…':'预览计划'}</button>{selectedIds.length>0&&<button className="text-button" disabled={busy} onClick={()=>setSelected([])}>取消选择</button>}</>}
      {!preview&&<ErrorNote message={error}/>}
    </aside></div>
    {preview&&<Dialog title={preview.growth==='incremental'?'增量发展预览':'批量计划预览'} onClose={()=>{if(!applying&&!previewing){setPreview(null);setError('');}}} wide><div className="court-preview-summary"><Pill>{templates.find(t=>t.id===preview.template)?.name||preview.template}</Pill><span>{preview.growth==='fixed'?'基础目标':'增量发展'}</span><span>{preview.mode==='append'?'追加':'替换待建'}</span><span>{preview.planets.length} 颗行星</span><span className="muted">开工时逐次扣费 · 当前施工保留</span></div><div className="court-preview-list">{preview.previews.map((row,i)=><details key={row.planet} open={i===0}><summary><b>{row.name}</b><span>+{row.added} 项 · {row.upgrades} 次升级{row.paused?' · 已暂停':''}</span></summary><Resources values={row.cost} small/><ol className="court-preview-goals">{row.items.length?row.items.map((item,index)=><li key={index}>{label(api,item.id,state.planets.find(p=>p.id===row.planet))}<b>→ Lv {item.level}</b></li>):<li>目标均已达成</li>}</ol></details>)}</div>
      {stale&&<div className="court-error" role="status"><ShieldAlert size={17}/><span>建筑或计划已变化，请重新预览。</span></div>}<ErrorNote message={error}/><div className="dialog-actions"><button className="secondary" disabled={busy||previewing} onClick={retryPreview}><RefreshCw size={15}/>{previewing?'正在更新…':'重新预览'}</button><button className="primary" disabled={busy||previewing||stale} onClick={applyPreview}><Check size={16}/>{applying?'正在应用…':`确认应用到 ${preview.planets.length} 颗行星`}</button></div>
    </Dialog>}
  </div>;
}
