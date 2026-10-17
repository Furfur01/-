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
