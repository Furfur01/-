import plan from './galactic-territory-plan.json' with {type:'json'};
import {tech,buildings,units} from './catalog.mjs';
import {factions} from './factions.mjs';
import {polity,claimSystem,colonyLimit,canColonizeSystem} from './sovereignty.mjs';
import {plannedNpcs} from './npc-types.mjs';
import {strategicKeys} from './strategic-resources.mjs';
import {usedBuildingFields} from './resource-complexes.mjs';

export const GRAND_POWERS_VERSION=1;
export const majorIds=['iron','dawn','zenith','obsidian'];
const profiles={
 iron:{technology:60,capitalTechnology:80},dawn:{technology:70,capitalTechnology:90},
 zenith:{technology:80,capitalTechnology:100,name:'塞维安',home:'天穹中枢',bio:'掌握成熟的星际工业与超空间工程，以庞大疆域和重装舰队维持秩序。'},
 obsidian:{technology:90,capitalTechnology:110,name:'维斯珀',home:'玄冕王庭',bio:'统治古老星区的高度发达帝国，主力舰队与战略武器远超边境文明。'}
};
const garrison={Battleship:80,Destroyer:40,Interceptor:48,Titanenergetic_Frigate:64,Devourer_Interceptor:24,Iron_Behemoth:16,Reaper:16,Annihilator:8};
const combatKeys=['Weapons_Tech','Shielding_Tech','Strength_Tech'];
export const fleetPower=(ships,technology)=>Object.entries(ships).reduce((sum,[id,n])=>{
 const u=units[id];return !u||u.missile?sum:sum+n*(u.attack*(1+(technology.Weapons_Tech||0)*.1)+u.shield*(1+(technology.Shielding_Tech||0)*.1)+u.strength*(1+(technology.Strength_Tech||0)*.1));
},0);
function openSlot(w,system){
 const occupied=new Set([...Object.values(w.planets).filter(p=>!p.moon&&p.position[0]===1&&p.position[1]===system).map(p=>p.position[2]),...w.missions.filter(m=>m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===1&&m.position[1]===system).map(m=>m.position[2]),...plannedNpcs(w,1,system).map(p=>p.slot)]);
 const deposit=w.strategic.deposits.find(d=>d.position[1]===system&&!occupied.has(d.position[2]));
 return deposit?.position[2]||[8,7,6,9,10,11,12,13,14,15,1,2,3,4,5].find(slot=>!occupied.has(slot));
}
function developColony(p,owner,baseline,capital=false){
 const targetRatio=capital?1000:100,scale=Math.max(capital?3:1,Math.ceil(baseline*targetRatio/fleetPower(garrison,owner.tech)));
 for(const [id,n]of Object.entries(garrison))p.ships[id]=(p.ships[id]||0)+n*scale;
 for(const [id,n]of Object.entries({Plasma_Cannon:60,MK2_Cannon:80,Large_Shield_Dome:1}))p.defense[id]=(p.defense[id]||0)+n;
 const industry={Metal_Mine:30,Crystal_Mine:28,Gas_Mine:26,Solar_Plant:36,Metal_Storage:20,Crystal_Storage:20,Gas_Storage:20,Robotics_Facility:20,Nanite_Factory:4,Shipyard:20,Research_Lab:24,Radar_Facility:20};
 for(const [id,n]of Object.entries(industry))if(buildings[id])p.buildings[id]=Math.max(p.buildings[id]||0,n);
 const occupied=usedBuildingFields(p)-(p.buildings.Terraformer||0);
 p.buildings.Terraformer=Math.max(p.buildings.Terraformer||0,Math.ceil(Math.max(0,occupied-p.fields)/4));
}
// One-time world setup: one reciprocal outpost per adjoining pair of empires.
// No existing world moves or changes hands; no recurring population or repair.
export function seedFrontierColonies(w,createColony,at){
 const homes=new Set(Object.values(w.players).map(p=>p.home));
 const systems=new Set(),outposts=[];
 const bases=Object.values(w.planets).filter(p=>!p.moon&&!homes.has(p.id)&&majorIds.includes(w.players[p.owner]?.commander?.factionId)&&!w.grandPowers.reserve.includes(p.position[1]));
 for(const region of majorIds)for(const rival of majorIds.filter(id=>id!==region)){
  const owner=w.players[w.grandPowers.regions.find(r=>r.id===region).leader];
  if(Object.values(w.planets).filter(p=>!p.moon&&p.owner===owner.id).length>=colonyLimit(owner))continue;
  const target=bases.find(p=>w.players[p.owner]?.commander?.factionId===rival&&!systems.has(p.position[1])&&canColonizeSystem(w,owner,p.position)&&
   !w.missions.some(m=>m.position?.slice(0,2).join(':')===p.position.slice(0,2).join(':'))&&!Object.values(w.battles||{}).some(b=>b.status==='active'&&b.target===p.id)&&openSlot(w,p.position[1]));
  if(!target)continue;
  const system=target.position[1],id=`grand:frontier:${region}:${system}`,position=[1,system,openSlot(w,system)];
  const p=createColony(owner.id,`${polity(w,owner.id).name} · 边境 ${system}`,position,{id,ships:{},defense:{},resources:[30000000,20000000,10000000]});
  developColony(p,owner,w.grandPowers.baselinePower);w.planets[id]=p;claimSystem(w,owner,position,at);
  const deposit=w.strategic.deposits.find(d=>d.position.join(':')===position.join(':'));if(deposit)w.strategic.mines[deposit.id]={planet:id,owner:owner.id,createdAt:at};
  systems.add(system);outposts.push(id);
 }
 return outposts;
}
export function migrateGrandPowers(w,createColony,activateAt=w.at){
 if(w.grandPowers?.version>=GRAND_POWERS_VERSION)return;
 const humans=Object.values(w.players).filter(p=>!p.bot),humanIds=new Set(humans.map(p=>p.id));
 for(const p of humans)if(w.planets[p.home]?.owner!==p.id)throw Error('账号母星归属异常，停止大势力迁移');
 const reserved=new Set(plan.reservedSystems);
 for(const p of Object.values(w.planets))if(humanIds.has(p.owner)&&p.position[0]===1)reserved.add(p.position[1]);
 for(const m of w.missions)if(humanIds.has(m.owner)&&m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===1)reserved.add(m.position[1]);
 // The reserve protects unclaimed expansion space, never evicts an existing small polity.
 w.sovereignty.safeSystems=[...reserved].sort((a,b)=>a-b);
 const baseline=Math.max(1,...humans.map(p=>Object.values(w.planets).filter(q=>q.owner===p.id).reduce((s,q)=>s+fleetPower({...q.ships,...q.defense},p.tech),0)+w.missions.filter(m=>m.owner===p.id).reduce((s,m)=>s+fleetPower(m.ships||{},p.tech),0)));
 const humanTech=Object.fromEntries(Object.keys(tech).map(k=>[k,Math.max(0,...humans.map(p=>p.tech[k]||0))]));
 const leaders={};
 for(const region of majorIds){
  let leader=Object.values(w.players).find(p=>p.bot&&p.commander?.factionId===region&&p.commander.title==='大将军');
  if(!leader){
   const candidates=[plan.capitals[region],...plan.regions[region]],system=candidates.find(s=>!reserved.has(s)&&!w.sovereignty.claims[`1:${s}`]&&!Object.values(w.planets).some(p=>p.owner&&p.position[0]===1&&p.position[1]===s)&&openSlot(w,s));
   if(!system)throw Error('没有空闲星系安置新增大势力，保留原存档');
   const id=`commander:${region}:sovereign`,home=`${id}:home`,profile=profiles[region],position=[1,system,openSlot(w,system)];
   leader={id,name:profile.name,bot:true,home,tech:{},researchQueue:null,reports:[],alliance:null,strategicResources:Object.fromEntries(strategicKeys.map(k=>[k,0])),commander:{id:'sovereign',region,factionId:region,title:'大将军',home:profile.home,position:[...position],bio:profile.bio,superior:null}};
   w.players[id]=leader;w.planets[home]=createColony(id,profile.home,position,{id:home,ships:{},defense:{},resources:[100000000,75000000,50000000]});claimSystem(w,leader,position,activateAt);
  }
  leaders[region]=leader;
 }
 // Every remaining unclaimed system receives a real colony, not just a painted border.
 for(const region of majorIds){
  const leader=leaders[region],name=factions.find(f=>f.id===region).name;
  for(const system of plan.regions[region]){
   if(reserved.has(system)||w.sovereignty.claims[`1:${system}`])continue;
   const existing=Object.values(w.planets).find(p=>p.owner&&!p.moon&&p.position[0]===1&&p.position[1]===system);
   if(existing){claimSystem(w,w.players[existing.owner],existing.position,activateAt);continue;}
   const slot=openSlot(w,system);if(!slot)throw Error(`星系 ${system} 没有可用轨道，停止领地迁移`);
   const id=`grand:${region}:${system}`,p=createColony(leader.id,`${name} · ${system}`, [1,system,slot],{id,ships:{},defense:{},resources:[30000000,20000000,10000000]});
   w.planets[id]=p;claimSystem(w,leader,p.position,activateAt);
   const d=w.strategic.deposits.find(d=>d.position.join(':')===p.position.join(':'));if(d)w.strategic.mines[d.id]={planet:id,owner:leader.id,createdAt:activateAt};
  }
 }
 const records=[];
 for(const region of majorIds){
  const profile=profiles[region],leader=leaders[region];
  for(const owner of Object.values(w.players).filter(p=>p.bot&&p.commander?.factionId===region)){
   const level=owner.id===leader.id?profile.capitalTechnology:profile.technology;
   for(const [k,t]of Object.entries(tech))if(!t.playerOnly)owner.tech[k]=Math.max(owner.tech[k]||0,t.maxLevel??Math.max(40,humanTech[k]+20));
   for(const k of combatKeys)owner.tech[k]=Math.max(owner.tech[k],level,humanTech[k]+50);
   const colonies=Object.values(w.planets).filter(p=>p.owner===owner.id&&!p.moon);
   owner.tech.Astrophysics_Tech=Math.max(owner.tech.Astrophysics_Tech||0,60,Math.ceil((colonies.length-1)/10));
   for(const p of colonies){
    developColony(p,owner,baseline,p.id===leader.home);
   }
   if(colonies.length>colonyLimit(owner))throw Error('大势力殖民数量超过天体物理容量');
  }
  const owners=Object.values(w.players).filter(p=>p.commander?.factionId===region).map(p=>p.id),colonies=Object.values(w.planets).filter(p=>owners.includes(p.owner)&&!p.moon);
  records.push({id:region,leader:leader.id,systems:Object.entries(w.sovereignty.claims).filter(([key,c])=>key.startsWith('1:')&&c.owner===polity(w,leader.id).id).map(([key])=>Number(key.split(':')[1])),colonies:colonies.length});
 }
 w.grandPowers={version:GRAND_POWERS_VERSION,createdAt:activateAt,reserve:[...reserved].sort((a,b)=>a-b),baselinePower:baseline,normalRatio:100,capitalRatio:1000,regions:records};
}
export function grandPowerSnapshot(w,player){
 if(!w.grandPowers)return null;
 return {reserve:w.grandPowers.reserve,normalRatio:w.grandPowers.normalRatio,capitalRatio:w.grandPowers.capitalRatio,createdAt:w.grandPowers.createdAt,
  regions:w.grandPowers.regions.map(r=>{const leader=w.players[r.leader],owners=Object.values(w.players).filter(p=>p.commander?.factionId===r.id),owned=new Set(owners.map(p=>p.id)),colonies=Object.values(w.planets).filter(p=>owned.has(p.owner)&&!p.moon);return {id:r.id,name:factions.find(f=>f.id===r.id).name,leader:leader.name,systems:new Set(colonies.map(p=>p.position.slice(0,2).join(':'))).size,colonies:colonies.length,astrophysics:leader.tech.Astrophysics_Tech,combatTech:combatKeys.map(k=>leader.tech[k]),power:Math.round(colonies.reduce((s,p)=>s+fleetPower({...p.ships,...p.defense},w.players[p.owner].tech),0))};}),
  playerPower:Math.round(Object.values(w.planets).filter(p=>p.owner===player.id).reduce((s,p)=>s+fleetPower({...p.ships,...p.defense},player.tech),0))};
}
