import {megaKey,megastructureCatalog} from './megastructure-rules.mjs';
import {megaRequiredTech} from './megastructure-technologies.mjs';
import {stellarType} from './stellar-types.mjs';

export const GRAND_POWER_MEGASTRUCTURES_VERSION=2;

// One-time established-civilization infrastructure, never a player subsidy or
// a recurring refill. Existing colonies, inventories and paid work stay put.
export function migrateGrandPowerMegastructures(world,at=world.at){
 if(world.grandPowerMegastructures?.version>=GRAND_POWER_MEGASTRUCTURES_VERSION)return;
 const previous=world.grandPowerMegastructures,records=[];
 const raise=(record,level)=>{record.level=Math.max(record.level||0,level);return record;};
 const systemAt=p=>{
  const key=megaKey(p),system=world.megastructures.systems[key]??={owner:p.owner,position:p.position.slice(0,2),host:p.id,structures:{},shipQueue:[]};
  world.logisticsCenters??={};
  raise(world.logisticsCenters[key]??={owner:p.owner,position:p.position.slice(0,2),level:0,queue:null},1);
  return system;
 };
 const install=(system,id,level)=>raise(system.structures[id]??={level:0,queue:null},level);
 for(const region of world.grandPowers?.regions||[]){
  const leader=world.players[region.leader],capital=world.planets[leader?.home];
  if(!leader?.bot||capital?.owner!==leader.id||capital.moon||capital.position[0]!==1)continue;
  const colonies=Object.values(world.planets).filter(p=>p.owner===leader.id&&!p.moon&&p.position[0]===1);
  const roots=new Map([[capital.position[1],capital]]);
  for(const p of colonies.sort((a,b)=>a.position[1]-b.position[1]||a.id.localeCompare(b.id)))if(!roots.has(p.position[1]))roots.set(p.position[1],p);
  // Spread the ordinary network through the existing territory, while keeping
  // rare stellar resources accessible. No new colony or ownership is created.
  const priority=p=>p.id===capital.id?-1:({magnetar:0,white:1})[stellarType(p.position[1]).id]??2;
  const spread=p=>(p.position[1]*73)%499;
  const selected=[...roots.values()].sort((a,b)=>priority(a)-priority(b)||spread(a)-spread(b)).slice(0,Math.min(roots.size,Math.max(2,Math.ceil(roots.size*.8))));
  const heavy=[capital,...selected.filter(p=>p.id!==capital.id).sort((a,b)=>Number(['white','magnetar'].includes(stellarType(a.position[1]).id))-Number(['white','magnetar'].includes(stellarType(b.position[1]).id))||spread(a)-spread(b))].slice(0,Math.ceil(selected.length*.12));
  for(const [index,p]of selected.entries()){
   const system=systemAt(p),star=stellarType(p.position[1]).id,tier=index===0||index%10===0?3:index%3===0?2:1;
   install(system,'gate',1);install(system,'dyson',tier);install(system,'industry',tier);
   if(star!=='main'||index%3===0||heavy.includes(p))install(system,'extractor',star==='magnetar'?3:star==='white'?Math.max(2,tier):tier);
   if(index%4===0)raise(p.orbitalHabitat??={level:0,queue:null},tier);
   system.grandPowerPreset={version:GRAND_POWER_MEGASTRUCTURES_VERSION,source:'established-network',...(system.grandPowerPreset?.nativeIndustryOrigin||system.inheritedNativeIndustry?{nativeIndustryOrigin:system.grandPowerPreset?.nativeIndustryOrigin||system.inheritedNativeIndustry}:{})};
   // Full-scale newly authorized infrastructure produces at its actual level;
   // already-paid batches retain the per-unit time stored in their queue.
   delete system.inheritedNativeIndustry;
  }
  for(const [index,p]of heavy.entries()){
   const system=systemAt(p),level=index===0?3:index%2?2:1;
   install(system,'shipyard',level);install(system,'extractor',Math.max(level,system.structures.shipyard.level));
  }
  const existingListener=Object.values(world.megastructures.systems).find(s=>s.owner===leader.id&&(s.structures.listener?.level||s.structures.listener?.queue));
  const listener=existingListener||systemAt(selected[1]||capital);install(listener,'listener',3);
  // Existing v1 facilities outside the expanded preset also retain their level,
  // position and orders. Only these NPC leaders receive missing research.
  const grant=(id,level,star)=>{for(const [key,required]of megaRequiredTech(id,level,star))leader.tech[key]=Math.max(leader.tech[key]||0,required);};
  for(const system of Object.values(world.megastructures.systems))if(system.owner===leader.id)for(const [id,s]of Object.entries(system.structures))if(s.level>0&&megastructureCatalog[id])grant(id,s.level,stellarType(system.position[1]).id);
  for(const p of colonies)if(p.orbitalHabitat?.level)grant('habitat',p.orbitalHabitat.level);
  records.push({id:region.id,leader:leader.id,capital:capital.id,ownedSystems:roots.size,systems:selected.map(p=>p.position[1]),shipyardSystems:heavy.map(p=>p.position[1]),listenerSystem:[...listener.position]});
 }
 world.grandPowerMegastructures={version:GRAND_POWER_MEGASTRUCTURES_VERSION,createdAt:previous?.createdAt??at,updatedAt:at,regions:records};
}
