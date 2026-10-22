import {randomUUID} from 'node:crypto';
import {deadWorldNames} from './arsenal-rules.mjs';
import galaxyLayout from '../opendesign/mockups/planet-construction-review/galaxy-layout.json' with {type:'json'};

const stars=new Map(galaxyLayout.systems.map(s=>[s.id,s.position]));
const activeBase=(p,owner)=>p&&p.owner===owner&&!p.devastation&&!p.moon;
export function survivingBase(w,owner,position){
 const origin=stars.get(position?.[1])||[0,0,0];
 return Object.values(w.planets).filter(p=>activeBase(p,owner)).sort((a,b)=>{
  const metric=p=>{const s=stars.get(p.position[1]);return Math.hypot(s[0]-origin[0],s[2]-origin[2]);};
  return metric(a)-metric(b)||a.id.localeCompare(b.id);
 })[0];
}
export function devastationReport(w,owner,at,title,body){
 const p=w.players[owner];if(!p)return;
 p.reports.unshift({id:randomUUID(),type:'fleet',at,read:false,title,body});p.reports=p.reports.slice(0,100);
}
export function handleDeadMission(w,m,now){
 const home=w.planets[m.from],target=w.planets[m.target]||(m.task==='colonize'?Object.values(w.planets).find(p=>!p.moon&&p.position.join(':')===m.position.join(':')):null);
 if(m.phase==='return'&&(!home||home.devastation||home.owner!==m.owner)){
  const next=survivingBase(w,m.owner,m.position);
  if(!next){devastationReport(w,m.owner,now,'舰队失去所有返航基地','全部本方基地已丧失，舰队及货物损失。');w.missions=w.missions.filter(x=>x!==m);return true;}
  m.from=next.id;m.fromPosition=[...next.position];m.start=now;m.end=now+Math.max(1000,m.travel||1000);
  devastationReport(w,m.owner,now,'舰队改道返航',`原基地已毁或失去控制，改道至 ${next.name}。`);return true;
 }
 if(m.phase!=='return'&&target?.devastation){
  m.phase='return';m.start=now;m.end=now+Math.max(1000,m.travel||1000);delete m.battleId;
  if(m.repeat)m.repeat.stopReason='目标已成为死寂行星';
  devastationReport(w,m.owner,now,'目标已毁，舰队返航','目标永久不可殖民，舰队保留船只和未交付货物，停止原作业。');return true;
 }
 return false;
}
export function devastateWorld(w,target,strike){
 const now=strike.end,affected=[target,...Object.values(w.planets).filter(p=>p.parent===target.id)],ids=new Set(affected.map(p=>p.id)),owners=new Set(affected.map(p=>p.owner).filter(Boolean));
 const losses={planets:affected.map(p=>({id:p.id,name:p.name,owner:p.owner})),ships:{},defense:{},resources:[0,0,0]};
 const count=(out,values)=>{for(const [id,n]of Object.entries(values||{}))out[id]=(out[id]||0)+n;};
 for(const b of Object.values(w.battles||{}))if(b.status==='active'&&ids.has(b.target)){
  for(const ship of b.ships){if(ship.hp>0)count(losses.ships,{[ship.type]:1});ship.hp=0;ship.shield=0;}
  b.status='finished';b.finishedAt=now;b.settled=true;b.winner='draw';b.termination='stellar-strike';
  b.projectiles=[];b.controls={};b.specialBlasts=[];
  // Battle checkpoints use tick + eventSeq as their immutable generation.
  // A strategic hit must not reuse the last active checkpoint's filename.
  b.events.push({seq:++b.eventSeq,tick:b.tick,type:'end',winner:'draw',reason:'stellar-strike',strikeId:strike.id});
 }
 for(const b of w.factionWars?.battles||[])if(b.status==='active'&&ids.has(b.target)){
  count(losses.ships,b.result.initial.attacker);count(losses.ships,b.result.initial.defender);
  b.status='cancelled';b.end=now;b.conquered=false;b.termination='stellar-strike';
 }
 for(const m of w.missions)if(ids.has(m.target)&&['engaged','waiting','holding'].includes(m.phase)){
  if(m.phase!=='engaged')count(losses.ships,m.ships);
  devastationReport(w,m.owner,now,'舰队毁于恒星武器打击',`驻留 ${target.name} 战场的舰队与货物已损失。`);
 }
 w.missions=w.missions.filter(m=>!(ids.has(m.target)&&['engaged','waiting','holding'].includes(m.phase)));
 for(const p of affected){
  count(losses.ships,p.ships);count(losses.defense,p.defense);p.resources.forEach((n,i)=>losses.resources[i]+=n);
  p.devastation={kind:strike.kind,at:now,strikeId:strike.id,attacker:strike.owner,formerOwner:p.owner,name:deadWorldNames[strike.kind]};
  p.owner=null;p.npc=false;p.resources=[0,0,0];p.buildings={};p.ships={};p.defense={};p.debris=[0,0,0];
  p.buildQueue=null;p.shipQueue=[];p.flagshipQueue=[];p.defenseQueue=[];p.orbitalHabitat=null;p.constructionPlan=null;
  delete p.expeditionPreset;delete p.layout;
 }
 for(const player of Object.values(w.players))if(ids.has(player.researchQueue?.planet))player.researchQueue=null;
 for(const [id,mine]of Object.entries(w.strategic?.mines||{}))if(ids.has(mine.planet))delete w.strategic.mines[id];
 for(const owner of owners){
  const player=w.players[owner];if(!player||!ids.has(player.home))continue;
  const next=survivingBase(w,owner,target.position);
  if(next){player.home=next.id;if(player.commander)player.commander.position=[...next.position];}
  else{player.defeatedAt=now;player.researchQueue=null;}
 }
 for(const s of Object.values(w.megastructures?.systems||{}))if(ids.has(s.host)){
  const next=Object.values(w.planets).find(p=>activeBase(p,s.owner)&&p.position.slice(0,2).join(':')===s.position.join(':'));
  if(next){s.host=next.id;for(const q of s.shipQueue||[])if(ids.has(q.planet))q.planet=next.id;for(const f of Object.values(s.structures))if(ids.has(f.queue?.planet))f.queue.planet=next.id;}
 }
 // Escrow is held by the exchange, not copied from the ruined planet's store.
 for(const o of w.market?.orders||[])if(['open','accepted'].includes(o.status)&&w.players[o.owner]?.defeatedAt){o.status='suspended';o.closedAt=now;o.closureReason='委托文明已失去所有基地，托管保留';}
 return losses;
}
