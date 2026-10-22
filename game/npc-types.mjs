import {movePlanet} from './sovereignty.mjs';
// One authored identity/strength table for seeding, public maps and rendering.
// Index retains the existing persistent npc:g:s:1..4 identities.
export const NPC_SYSTEM_VERSION=2;
export const npcTypes=[
  {id:'outpost',index:1,name:'废弃前哨',skin:18,level:2,threat:'轻度',color:'#d4c8b1',symbol:'裂',slot:1,patrols:3,ships:{Light_Fighter:14,Heavy_Fighter:3},defense:{Rocket_Launcher:3},resources:[250000,125000,50000]},
  {id:'garrison',index:2,name:'赤铁守备站',skin:20,level:3,threat:'中度',color:'#f36350',symbol:'堡',slot:2,patrols:4,ships:{Light_Fighter:30,Heavy_Fighter:8,Cruiser:3},defense:{Rocket_Launcher:10,Light_Laser:6},resources:[1250000,625000,250000]},
  {id:'charon',index:3,name:'卡戎舰队',skin:19,level:4,threat:'重度',color:'#c18aff',symbol:'芒',slot:4,patrols:5,ships:{Light_Fighter:80,Heavy_Fighter:25,Cruiser:12,Battleship:5},defense:{Rocket_Launcher:25,Heavy_Laser:10},resources:[6250000,3125000,1250000]},
  {id:'cargo',index:4,name:'遗落货仓',skin:28,level:1,threat:'低危',color:'#aabed5',symbol:'仓',slot:6,patrols:2,ships:{Light_Fighter:4,Cargo_Ship:5},defense:{},resources:[50000,25000,10000]},
  {id:'fracture',index:5,name:'苍穹裂隙',skin:34,level:5,threat:'极危',color:'#45c9ff',symbol:'环',slot:9,patrols:7,ships:{Light_Fighter:160,Heavy_Fighter:60,Cruiser:30,Battleship:12,Dreadnought:4,Destroyer:2},defense:{Rocket_Launcher:50,Heavy_Laser:20,Plasma_Cannon:2},resources:[31250000,15625000,6250000]},
];
export function npcType(p){
  if(!p?.npc||p.moon)return null;
  const index=Number(/^npc:\d+:\d+:([1-5])$/.exec(p.id)?.[1]);
  return npcTypes.find(t=>t.id===p.npcType)||npcTypes.find(t=>t.index===index)||npcTypes.find(t=>t.name===p.name)||null;
}
export function npcPublic(p){const t=npcType(p);return t?{npcType:t.id,npcLevel:t.level,npcThreat:t.threat,npcColor:t.color,npcSymbol:t.symbol,npcPatrols:t.patrols,npcSkin:t.skin,npcDailyResources:[...t.resources]}:{};}
// Correct the former sovereignty migration using persistent IDs, never names.
// Move the existing entity back; defeated fleets and looted resources stay intact.
export function restoreSystemCamps(world,originalPositions={}){
  if(world.npcDistributionVersion>=1&&!Object.keys(originalPositions).length)return;
  const returning=Object.values(world.planets).filter(p=>p.npc&&!p.moon).flatMap(p=>{
    const match=/^npc:(\d+):(\d+):([1-5])$/.exec(p.id);
    const original=originalPositions[p.id];
    if(!match&&!original)return [];
    const [galaxy,system]=original||match.slice(1,3).map(Number),type=npcType(p);
    return p.position[0]===galaxy&&p.position[1]===system?[]:[{p,galaxy,system,slot:original?.[2]||type?.slot||1}];
  });
  const ids=new Set(returning.map(({p})=>p.id)),occupied=new Set(Object.values(world.planets).filter(p=>!p.moon&&!ids.has(p.id)).map(p=>p.position.join(':')));
  for(const m of world.missions||[])if(m.task==='colonize'&&m.phase==='outbound')occupied.add(m.position.join(':'));
  const moves=returning.map(({p,galaxy,system,slot:preferred})=>{
    const slot=[preferred,...Array.from({length:15},(_,i)=>i+1)].find(n=>!occupied.has(`${galaxy}:${system}:${n}`));
    if(!slot)throw Error(`星系 ${galaxy}:${system} 没有空轨道恢复野怪据点`);
    const position=[galaxy,system,slot];occupied.add(position.join(':'));return {p,position};
  });
  for(const {p,position}of moves)movePlanet(world,p,position);
  world.npcDistributionVersion=1;
}
// Used by both the pure directory projection and the mutating initializer.
export function plannedNpcs(world,galaxy,system,local){
  const marker=world.npcSystems?.[`${galaxy}:${system}`];
  if(Number(marker)>=NPC_SYSTEM_VERSION)return [];
  local??=Object.values(world.planets||{}).filter(p=>p.position[0]===galaxy&&p.position[1]===system);
  const existing=local.filter(p=>p.npc&&!p.moon);
  const fresh=!marker&&!existing.length,types=fresh?npcTypes:npcTypes.filter(t=>t.index===5&&!existing.some(p=>npcType(p)?.id===t.id));
  const occupied=new Set(local.map(p=>p.position[2]));
  // Fixed strategic deposits remain colonizable even when another new colony
  // displaces an uninitialized camp from its preferred orbit.
  for(const d of world.strategic?.deposits||[])if(d.position[0]===galaxy&&d.position[1]===system)occupied.add(d.position[2]);
  for(const m of world.missions||[])if(m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===galaxy&&m.position[1]===system)occupied.add(m.position[2]);
  const result=[];for(const type of types){const slot=[type.slot,...Array.from({length:15},(_,i)=>i+1)].find(n=>!occupied.has(n));if(slot===undefined)break;occupied.add(slot);result.push({type,slot,id:`npc:${galaxy}:${system}:${type.index}`});}return result;
}
