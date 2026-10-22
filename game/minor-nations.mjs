import plan from './galactic-territory-plan.json' with {type:'json'};
import {claimSystem} from './sovereignty.mjs';
import {plannedNpcs} from './npc-types.mjs';
import {strategicKeys} from './strategic-resources.mjs';

export const MINOR_NATIONS_VERSION=1;
export const starbayId='nation:starbay';

// An explicit, one-time concession from the pictured reserve, not AI expansion.
// Never transfer existing worlds or claim a system with an inbound colony ship.
export function migrateMinorNations(w,createColony,at=w.at){
 if(w.minorNations?.version>=MINOR_NATIONS_VERSION)return;
 for(const p of Object.values(w.players).filter(p=>!p.bot))if(w.planets[p.home]?.owner!==p.id)throw Error('账号母星归属异常，停止小国领地迁移');
 const blocked=new Set(Object.values(w.planets).filter(p=>p.owner&&p.position[0]===1).map(p=>p.position[1]));
 for(const m of w.missions)if(m.task==='colonize'&&m.phase==='outbound'&&m.position[0]===1)blocked.add(m.position[1]);
 const sites=plan.starbay.systems.filter(s=>!blocked.has(s)&&!w.sovereignty.claims['1:'+s]).map(system=>{
  const occupied=new Set([...Object.values(w.planets).filter(p=>!p.moon&&p.position[0]===1&&p.position[1]===system).map(p=>p.position[2]),...plannedNpcs(w,1,system).map(p=>p.slot)]);
  const deposit=w.strategic.deposits.find(d=>d.position[0]===1&&d.position[1]===system&&!occupied.has(d.position[2]));
  const slot=deposit?.position[2]||[8,7,6,9,10,11,12,13,14,15,1,2,3,4,5].find(n=>!occupied.has(n));
  return slot?{system,slot}:null;
 }).filter(Boolean);
 if(!sites.length){w.minorNations={version:MINOR_NATIONS_VERSION,createdAt:at,systems:[]};return;}
 const capital=sites.find(s=>s.system===plan.starbay.capital)||sites[0],home=`${starbayId}:${capital.system}`;
 const owner={id:starbayId,name:'星湾共和国',bot:true,home,realm:{id:'realm:starbay',name:'星湾共和国',color:'#c7a1dc'},tech:{Astrophysics_Tech:Math.max(1,Math.ceil((sites.length-1)/10)),Weapons_Tech:12,Shielding_Tech:12,Strength_Tech:12,Computer_Tech:10,Energy_Tech:12,Combustion_Drive:8,Impulse_Drive:6,Hyperspace_Drive:5},researchQueue:null,reports:[],alliance:null,strategicResources:Object.fromEntries(strategicKeys.map(k=>[k,0]))};
 const allocated=new Set(sites.map(s=>s.system));
 w.players[owner.id]=owner;
 w.grandPowers.reserve=w.grandPowers.reserve.filter(s=>!allocated.has(s));
 w.sovereignty.safeSystems=w.sovereignty.safeSystems.filter(s=>!allocated.has(s));
 for(const {system,slot}of sites){
  const id=`${starbayId}:${system}`,position=[1,system,slot],isCapital=id===home;
  w.planets[id]=createColony(owner.id,isCapital?'星湾议会星':`星湾共和国 · ${system}`,position,{id,resources:[600000,400000,200000],ships:{Cruiser:isCapital?120:24,Battleship:isCapital?60:12,Large_Cargo_Ship:10,Recycler:6},defense:{Rocket_Launcher:40,Light_Laser:20,MK2_Cannon:8}});
  claimSystem(w,owner,position,at);
  const deposit=w.strategic.deposits.find(d=>d.position.join(':')===position.join(':'));
  if(deposit)w.strategic.mines[deposit.id]={planet:id,owner:owner.id,createdAt:at};
 }
 w.minorNations={version:MINOR_NATIONS_VERSION,createdAt:at,leader:owner.id,systems:[...allocated]};
}
