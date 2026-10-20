import {npcType} from './npc-types.mjs';

export const NPC_DAY_MS=86400000;
const offset=8*3600000;
export const npcDay=at=>Math.floor((at+offset)/NPC_DAY_MS);
export const npcDayStart=day=>day*NPC_DAY_MS-offset;
export const nextNpcRefresh=at=>npcDayStart(npcDay(at)+1);

export function refreshNpcCamp(world,p,at){
  const type=npcType(p),day=npcDay(at);
  if(!type||p.owner||(p.npcRefreshDay??-Infinity)>=day)return false;
  p.npcRefreshDay??=day-1;p.npcRefreshedAt??=0;
  // A battle owns its defenders until settlement. Never add a second fleet or
  // replace the loot pool halfway through combat.
  if(Object.values(world.battles||{}).some(b=>b.target===p.id&&b.status==='active'))return false;
  p.ships={...type.ships};p.defense={...type.defense};p.resources=[...type.resources];
  p.npcRefreshDay=day;p.npcRefreshedAt=at;
  return true;
}
export function refreshNpcCamps(world,at){
  for(const p of Object.values(world.planets))refreshNpcCamp(world,p,at);
  world.npcDailyDay=npcDay(at);
}
export function migrateNpcDaily(world){
  if(world.npcDailyVersion>=1)return;
  refreshNpcCamps(world,world.at);
  world.npcDailyVersion=1;
}

// Remove only defenses proved to be repairs from the latest full-clear victory.
// Historical reports remain an accurate record of the old settlement rules.
export function migrateNpcDefenseRepairs(world){
  if(world.npcDefenseRepairVersion>=1)return;
  const latest=new Map(),battles=Object.values(world.battles||{});
  for(const player of Object.values(world.players))for(const r of player.reports||[]){
    if(r.type!=='battle'||r.trial||r.defending||!r.targetId)continue;
    if(!latest.has(r.targetId)||r.at>latest.get(r.targetId).at)latest.set(r.targetId,r);
  }
  for(const p of Object.values(world.planets)){
    if(!npcType(p)||p.owner)continue;
    const r=latest.get(p.id);
    if(!r||r.winner!=='attacker'||!Number.isInteger(r.npcRefreshDay)||r.npcRefreshDay!==p.npcRefreshDay||r.at<p.npcRefreshedAt)continue;
    if(!r.survivors?.defender||Object.values(r.survivors.defender).some(n=>n>0)||Object.values(p.ships).some(n=>n>0))continue;
    if(battles.some(b=>b.target===p.id&&(b.status==='active'||b.start>r.at)))continue;
    if(!Object.entries(p.defense).every(([id,n])=>n<=(r.repair?.[id]||0)))continue;
    p.defense={};
  }
  world.npcDefenseRepairVersion=1;
}
