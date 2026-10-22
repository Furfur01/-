import {randomUUID} from 'node:crypto';
import {battle} from './combat.mjs';
import {units} from './catalog.mjs';
import {majorIds,fleetPower,seedFrontierColonies} from './grand-powers.mjs';
import {polity,systemTerritory,systemPolities,attackRestriction} from './sovereignty.mjs';
import {navigationQuote} from './fleet-navigation.mjs';
import {availableResources,spendResources,depositResources} from './system-logistics.mjs';
import {survivingBase,devastationReport} from './desolation.mjs';

export const FACTION_WARS_VERSION=2;
export const WAR_INTERVAL=6*3600000;
const region=(w,id)=>w.players[id]?.bot&&w.players[id]?.commander?.factionId;
const major=(w,id)=>majorIds.includes(region(w,id));
const merge=(a,b)=>{for(const [id,n]of Object.entries(b))a[id]=(a[id]||0)+n;};
export const activeFactionWar=(w,target)=>w.factionWars?.battles.find(b=>b.status==='active'&&b.target===target);
export function migrateFactionWars(w,createColony,at=w.at){
 if(w.factionWars?.version>=FACTION_WARS_VERSION)return;
 const previous=w.factionWars;
 // Unfinished old invasion orders are withdrawn, not resolved as conquests.
 for(const b of previous?.battles||[])if(b.status==='active'){
  merge(w.planets[b.from].ships,b.result.initial.attacker);
  for(const [id,n]of Object.entries(b.result.initial.defender))merge(units[id].type==='defense'?w.planets[b.target].defense:w.planets[b.target].ships,{[id]:n});
  depositResources(w,w.planets[b.from],[0,0,b.fuel]);b.status='cancelled';b.conquered=false;
 }
 w.factionWars={version:FACTION_WARS_VERSION,next:at+WAR_INTERVAL,turn:previous?.turn||0,battles:previous?.battles||[],outposts:seedFrontierColonies(w,createColony,at)};
}
function protectedSystem(w,p){
 return p.position[0]!==1||w.grandPowers.reserve.includes(p.position[1])||Object.values(w.planets).some(q=>q.position[0]===1&&q.position[1]===p.position[1]&&q.owner&&!major(w,q.owner))||w.missions.some(m=>!w.players[m.owner]?.bot&&m.task==='colonize'&&m.phase==='outbound'&&m.position[1]===p.position[1]);
}
export function startFactionWar(w,now){
 const state=w.factionWars,side=majorIds[state.turn++%majorIds.length];state.next=now+WAR_INTERVAL;
 const busy=new Set(state.battles.filter(b=>b.status==='active').flatMap(b=>[b.from,b.target]));
 for(const b of Object.values(w.battles||{}))if(b.status==='active')busy.add(b.target);
 for(const m of w.missions){busy.add(m.target);busy.add(m.from);}
 const territories=systemPolities(w);
 const planets=Object.values(w.planets).filter(p=>!p.moon&&major(w,p.owner)&&!protectedSystem(w,p)&&!busy.has(p.id)&&!attackRestriction(w,p,territories));
 const homes=new Set(Object.values(w.players).map(p=>p.home)),pairs=[];
 for(const from of planets.filter(p=>region(w,p.owner)===side)){
  const ships=Object.fromEntries(Object.entries(from.ships).filter(([id])=>units[id]?.type!=='defense'&&units[id]?.attack>0&&units[id]?.speed>0&&units[id]?.fleetAvailable!==false).map(([id,n])=>[id,Math.floor(n*.65)]).filter(([,n])=>n));
  if(!Object.keys(ships).length)continue;
  const owner=w.players[from.owner];
  for(const target of planets.filter(p=>region(w,p.owner)!==side&&!homes.has(p.id)&&from.position[1]===p.position[1])){
   const quote=navigationQuote(units,owner.tech,from.position,ships,target.position),fuel=quote.fuel*2;
   if(availableResources(w,from)[2]<fuel)continue;
   pairs.push({from,target,ships,fuel,score:fleetPower(ships,owner.tech)/Math.max(1,fleetPower({...target.ships,...target.defense},w.players[target.owner].tech))});
  }
 }
 const chosen=pairs.sort((a,b)=>b.score-a.score||a.from.id.localeCompare(b.from.id))[0];if(!chosen)return null;
 const {from,target,ships,fuel}=chosen,defenders={...target.ships};
 for(const [id,n]of Object.entries(target.defense))if(!units[id].missile)defenders[id]=(defenders[id]||0)+n;
 const seed=Math.floor(now/1000)^state.turn,result=battle(ships,defenders,w.players[from.owner].tech,w.players[target.owner].tech,seed);
 spendResources(w,from,[0,0,fuel]);for(const [id,n]of Object.entries(ships))from.ships[id]-=n;
 target.ships={};for(const id of Object.keys(target.defense))if(!units[id].missile)delete target.defense[id];
 const b={id:randomUUID(),status:'active',from:from.id,target:target.id,attacker:from.owner,defender:target.owner,attackerName:polity(w,from.owner).name,defenderName:polity(w,target.owner).name,targetName:target.name,position:[...target.position],start:now,end:now+Math.max(1,result.duration)*1000,result,fuel};
 state.battles.push(b);return b;
}
export function finishFactionWar(w,b){
 if(b.status!=='active')return;
 const target=w.planets[b.target],source=w.planets[b.from],r=b.result;
 for(const [id,n]of Object.entries(r.survivors.defender))merge(units[id].type==='defense'?target.defense:target.ships,{[id]:n});
 for(const [id,n]of Object.entries(r.losses.defender))if(units[id].type==='defense')merge(target.defense,{[id]:Math.floor(n*.7)});
 const returnBase=source.owner===b.attacker&&!source.devastation?source:survivingBase(w,b.attacker,b.position);
 if(returnBase)merge(returnBase.ships,r.survivors.attacker);
 else devastationReport(w,b.attacker,b.end,'战后舰队失去返航基地','本方全部基地已丧失，战后舰队损失。');
 target.debris=target.debris.map((n,i)=>n+r.debris[i]);
 b.status='finished';b.conquered=false;
 // Only compact numerical reports are retained. No spatial ships, frames,
 // projectiles, WebGL or background rendering is created by this scheduler.
 const finished=w.factionWars.battles.filter(x=>x.status==='finished');
 if(finished.length>100){const remove=new Set(finished.slice(0,finished.length-100).map(x=>x.id));w.factionWars.battles=w.factionWars.battles.filter(x=>!remove.has(x.id));}
}
export function factionWarSnapshot(w){
 if(!w.factionWars)return null;
 const territories=systemPolities(w),zones=[...territories].filter(([,owners])=>owners.size>1).map(([key])=>{const position=key.split(':').map(Number);return {position,...systemTerritory(w,position,territories)};});
 return {next:w.factionWars.next,zones,battles:w.factionWars.battles.slice().reverse().map(b=>({id:b.id,status:b.status,from:b.from,target:b.target,attackerName:b.attackerName,defenderName:b.defenderName,targetName:b.targetName,position:b.position,start:b.start,end:b.end,conquered:!!b.conquered,winner:b.status==='finished'?b.result.winner:null,debris:b.status==='finished'?b.result.debris:null,remainingDebris:w.planets[b.target]?.debris||[0,0,0]}))};
}
