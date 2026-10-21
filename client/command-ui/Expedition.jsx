import React,{useEffect,useState} from 'react';
import {Section,Resources,number,compact,label} from './shared.jsx';
import {expeditionZones,expeditionRounds,resourceBase,miningCargo} from '../../game/expedition-rules.mjs';

export function useEscortAssessment(api,draft){
  const [result,setResult]=useState(null);
  const key=JSON.stringify({ships:draft.ships,zone:draft.zone||'outer',tech:api.state.player.tech,active:draft.task==='explore'});
  useEffect(()=>{
    let active=true;
    setResult(null);
    if(draft.task!=='explore'||!Object.values(draft.ships).some(n=>n>0))return;
    const timer=setTimeout(async()=>{
      try{const data=await api.previewExpedition({ships:draft.ships,zone:draft.zone||'outer'});if(active)setResult({key,...data});}
      catch(error){if(active)setResult({key,error:error.message});}
    },300);
    return ()=>{active=false;clearTimeout(timer);};
  },[key]);
  return result?.key===key?result:null;
}

export function ZonePicker({api,draft,update}){
  return <><Section aside="固定海盗 · 每轮独立 20% 遭遇">探索地点</Section><div className="ui-expedition-zones">{Object.values(expeditionZones).map(z=><button key={z.id} className={draft.zone===z.id?'active':''} disabled={(api.state.player.tech.Astrophysics_Tech||0)<z.level} onClick={()=>update({zone:z.id})}><b>{z.name}</b><span>{z.seconds/60} 分钟 · 天体物理 {z.level} 级</span><small>资源基数上限 {compact(z.cap)}</small></button>)}</div><p className="note">越靠近中心，引力越强，探索耗时越长；往返另算。运输船装货，回收舰捞取海盗残骸，战斗舰负责护航。</p></>;
}

export function RepeatPicker({draft,update}){
  return <><Section>本次探险轮数</Section><div className="ui-speed-picker">{expeditionRounds.map(n=><button key={n} className={draft.rounds===n?'active':''} onClick={()=>update({rounds:n})}>{n===1?'单次':`${n} 轮`}</button>)}</div><p className="note">连跑按原编队出发；出现任何战损或撤退即停。发现的船留港，不补船、不扩大编队。</p></>;
}

export function ExpeditionSummary({api,draft,assessment}){
  if(draft.task==='mine')return <><Section>采矿收获</Section><Resources values={miningCargo(draft.ships.Recycler||0,draft.holdHours,api.catalog.units)} small/><p className="note">每 30 分钟采出回收舰货舱的 5%，金属 / 晶体为 7 : 3。无海盗、暗物质或舰船奖励。</p></>;
  if(draft.task!=='explore')return null;
  const zone=expeditionZones[draft.zone||'outer'],base=resourceBase(draft.ships,api.catalog.units,zone.id);
  return <div className="ui-expedition-summary"><Section>{zone.name}海盗 · 固定强度</Section><p>{Object.entries(zone.pirates).map(([id,n])=>`${label(api,id)} × ${n}`).join('、')}</p><p className="muted">武器 / 护盾 / 装甲科技均为 {zone.tech} 级</p><p className={assessment?.safe?'mint':'amber'} role="status">{assessment?.error||assessment?.reason||(Object.values(draft.ships).some(n=>n>0)?'正在评估护航…':'选定编队后评估护航')}</p>{assessment?.safe&&Object.keys(assessment.losses).length>0&&<p>预计损失：{Object.entries(assessment.losses).map(([id,n])=>`${label(api,id)} × ${n}`).join('、')}</p>}<Section>每轮发现</Section><dl><dt>60% 资源</dt><dd>金属 {number(Math.floor(base*.5))}–{number(Math.floor(base))}<br/>晶体 ×0.6 · 气体 ×0.8<br/>三者等概率，按剩余货舱装载</dd><dt>20% 舰船</dt><dd>已携带且已解锁的普通舰型 ×2–5%<br/>不足整艘折材料，超出货舱舍弃</dd><dt>15% 暗物质</dt><dd>{zone.darkMatter.join('–')}</dd><dt>5% 空手</dt><dd>正常返航</dd></dl><p>海盗另行抽取；获胜保留奖励，有回收舰还能捞取敌方残骸。护航不足则撤离，无本轮收获。</p></div>;
}
