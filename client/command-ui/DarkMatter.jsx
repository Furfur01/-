import React,{useState} from 'react';
import {ArrowUpRight,Clock3,Diamond,Orbit,Zap} from 'lucide-react';
import {accelerationKinds,accelerationQuote,darkMatterRules} from '../../game/dark-matter.mjs';
import {Dialog,Empty,Pill,Section,label,number,remaining} from './shared.jsx';
import {dateTime} from './secondary-kit.jsx';

export default function DarkMatter({api,act,navigate,children}){
  const [tab,setTab]=useState('accelerate'),[confirm,setConfirm]=useState(null),[error,setError]=useState('');
  const player=api.state.player,p=api.planet,balance=player.darkMatter||0;
  const researchPlanet=api.state.planets.find(x=>x.id===player.researchQueue?.planet);
  const tasks=Object.keys(accelerationKinds).flatMap(kind=>{
    const planet=kind==='research'?researchPlanet:p;
    const quote=planet&&accelerationQuote(planet,player,kind,api.now);
    return quote&&quote.cost>0?[{...quote,planetName:planet.name,name:label(api,quote.id,planet)}]:[];
  });
  const current=confirm&&tasks.find(q=>q.kind===confirm.kind&&q.planet===confirm.planet&&q.queue===confirm.queue);
  const reason=confirm?(!current?'任务已完成或已变化，请重新选择':current.cost>confirm.maxCost?'费用已变化，请重新确认':current.cost>balance?'暗物质不足':''):'';
  const incoming=api.state.missions.filter(m=>!m.inbound).reduce((n,m)=>n+(m.darkMatter||0),0);
  const history=(api.state.reports||[]).filter(r=>r.darkMatterSpent>0||(r.type==='fleet'&&r.darkMatter>0)).slice(0,8);
  const taskDetail=q=>q.level!==undefined?`${q.mode==='downgrade'?'降至':'升至'} Lv ${q.level}`:`本批剩余 ${number(q.count)} 个`;
  async function submit(){
    setError('');
    const ok=await act({type:'accelerate',planet:confirm.planet,kind:confirm.kind,queue:confirm.queue,maxCost:confirm.maxCost},'加速完成');
    if(ok)setConfirm(null);else setError(api.error||'加速未完成，请重试');
  }
  return <div className="dm-screen">
    <section className="dm-overview panel" aria-label="暗物质账户">
      <div className="dm-balance"><Diamond size={31}/><div><span>帝国共享余额</span><strong>{number(balance)}<small>暗物质</small></strong></div>{incoming>0&&<Pill tone="amber">{number(incoming)} 在途 · 返航后入账</Pill>}</div>
      <div className="dm-source"><h2>从银心带回时间</h2><p>派舰队探索银心黑洞，可发现暗物质，返航后入账。先研究天体物理科技，再选择探索区域与护航编队；探险有遭遇海盗和损失舰船的风险。</p><button className="text-button" onClick={()=>navigate('fleet',{explore:true})}><Orbit size={16}/>安排黑洞探险<ArrowUpRight size={14}/></button></div>
    </section>
    <nav className="sec-tabs dm-tabs" aria-label="暗物质用途">{[['accelerate','加速队列'],['supply','物资兑换']].map(([id,title])=><button key={id} className={tab===id?'active':''} aria-pressed={tab===id} onClick={()=>setTab(id)}>{title}</button>)}</nav>
    {tab==='supply'?children:<section className="dm-work">
      <header><h2>完成眼前的工程</h2><p>每 {darkMatterRules.secondsPerUnit/60} 分钟剩余工期消耗 1 暗物质，向上取整。生产仅完成队首当前批次，后续批次提前开工。</p></header>
      <Section aside={p.name}>本星施工与生产 · 帝国研究</Section>
      <div className="dm-task-list">{tasks.map(q=><article className="dm-task panel" key={q.kind+q.queue}>
        <div className="dm-task-name"><span>{accelerationKinds[q.kind]} · {q.planetName}</span><h3>{q.name}<small>{taskDetail(q)}</small></h3></div>
        <div className="dm-task-time"><Clock3 size={16}/><span>{remaining(q.end,api.now)}</span></div>
        <button className="secondary" disabled={api.busy||balance<q.cost} onClick={()=>{setError('');setConfirm({...q,maxCost:q.cost});}}><Zap size={15}/>{number(q.cost)} 暗物质 · {balance<q.cost?'余额不足':'立即完成'}</button>
      </article>)}</div>
      {!tasks.length&&<Empty>当前没有可加速任务。先开始建设、研究或生产，再来缩短等待。</Empty>}
      <div className="dm-links">{[['buildings','建设'],['research','研究'],['shipyard','造舰'],['defense','防务']].map(([id,title])=><button className="text-button" key={id} onClick={()=>navigate(id)}>{title}<ArrowUpRight size={14}/></button>)}</div>
    </section>}
    <section className="dm-history"><Section aside="最近 8 笔 · 来自情报档案">收支记录</Section>{history.length?history.map(r=><div key={r.id}><span>{r.title}<small>{dateTime(r.at)}</small></span><b className={r.darkMatterSpent?'':'mint'}>{r.darkMatterSpent?'− '+number(r.darkMatterSpent):'+ '+number(r.darkMatter)}</b></div>):<p>探险返航、加速或兑换后，收支会显示在这里。</p>}</section>
    {confirm&&<Dialog title="确认暗物质加速" onClose={()=>setConfirm(null)}>
      <p className="note">在「{confirm.planetName}」立即完成{confirm.name}，{taskDetail(current||confirm)}。{['ship','defense','flagship'].includes(confirm.kind)?'后续批次继续按正常工期生产。':confirm.kind==='build'?'已启用的建设计划会照常接续并扣除下一项的资源。':''}</p>
      <div className="sec-key-value"><span>消耗暗物质</span><strong>{number(current?.cost||confirm.maxCost)}</strong></div>
      <div className="sec-key-value"><span>完成后余额</span><b>{reason?'—':number(balance-current.cost)}</b></div>
      {(reason||error)&&<p className="note danger" role="alert">{reason||error}</p>}
      <div className="sec-dialog-actions"><button className="secondary" onClick={()=>setConfirm(null)}>继续等待</button><button className="primary" disabled={api.busy||!!reason} onClick={submit}>消耗 {number(current?.cost||confirm.maxCost)} 暗物质并完成</button></div>
    </Dialog>}
  </div>;
}
