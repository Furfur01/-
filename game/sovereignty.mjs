import {systemCoordinates} from './star-positions.mjs';
import {factions} from './factions.mjs';
import territoryPlan from './galactic-territory-plan.json' with {type:'json'};

export const SOVEREIGNTY_VERSION=1;
export const colonyLimit=player=>1+10*Math.max(0,Math.floor(player.tech.Astrophysics_Tech||0));
export const systemKey=position=>position.slice(0,2).join(':');
const stars=systemCoordinates(),byId=new Map(stars.map(s=>[s.id,s]));
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
export function polity(world,owner){
  const player=world.players[owner];if(!player)return null;
  const faction=player.bot&&factions.find(f=>f.id===player.commander?.factionId);
  return faction?{id:'faction:'+faction.id,name:faction.name,color:faction.color}:
    player.realm?{...player.realm}:{id:player.id,name:player.cityState?.name||player.name,color:player.bot?'#b6bea1':'#67d9c3'};
}
export function systemPolities(world){
  const result=new Map();
  for(const p of Object.values(world.planets))if(p.owner&&!p.npc&&!p.moon){const key=systemKey(p.position),owner=polity(world,p.owner);if(!result.has(key))result.set(key,new Map());result.get(key).set(owner.id,owner);}
  return result;
}
export function systemTerritory(world,position,territories=systemPolities(world)){
  const claim=world.sovereignty?.claims[systemKey(position)],members=[...(territories.get(systemKey(position))?.values()||[])];
  const owner=members[0]||(claim&&polity(world,claim.founder)),warZone=members.length>1;
  return {systemOwner:warZone?null:owner?.id||null,systemOwnerName:warZone?'交战区 · '+members.map(p=>p.name).join(' / '):owner?.name||'',systemColor:warZone?'#e5a771':owner?.color||null,systemPolities:members,warZone};
}
export function canColonizeSystem(world,player,position){
  const reserved=position[0]===1&&world.grandPowers?.reserve.includes(position[1]);
  if(player.bot&&reserved)return false;
  const owner=world.sovereignty?.claims[systemKey(position)]?.owner,own=polity(world,player.id)?.id;
  if(!owner||owner===own)return true;
  if(reserved||position[0]!==1)return false;
  // The original territorial frontier stays fixed: an outpost cannot leapfrog
  // through a rival's interior by opening another successive border.
  if(!(territoryPlan.neighbors[position[1]]||[]).some(s=>world.sovereignty.claims['1:'+s]?.owner===own))return false;
  const local=Object.values(world.planets).filter(p=>!p.moon&&p.owner&&systemKey(p.position)===systemKey(position));
  if(local.some(p=>world.players[p.owner]?.home===p.id))return false;
  if(player.bot&&local.some(p=>!world.players[p.owner]?.bot))return false;
  return true;
}
export function attackRestriction(world,target,territories){
  if(target?.devastation)return "死寂行星永久不可殖民或攻击";
  if(!target?.owner||target.npc)return '';
  const home=world.players[target.owner]?.home;
  if(target.id===home||target.parent===home)return '母星及其卫星受保护，暂不允许斩首';
  if(target.position[0]===1&&world.grandPowers?.reserve.includes(target.position[1]))return '玩家自留星区禁止帝国战争';
  return systemTerritory(world,target.position,territories).warZone?'':'暂时只能攻击多势力共处的交战区星球';
}
export function claimSystem(world,player,position,at=world.at){
  world.sovereignty??={version:SOVEREIGNTY_VERSION,claims:{},safeSystems:[]};
  if(!canColonizeSystem(world,player,position))throw Error('只能在本方星域、无主星域或相邻边境殖民；母星与玩家自留区受保护');
  world.sovereignty.claims[systemKey(position)]??={owner:polity(world,player.id).id,founder:player.id,at};
}
export function nearestSystems(position,count=40){
  const center=byId.get(position[1])?.position||byId.get(16).position;
  return [...stars].sort((a,b)=>distance(a.position,center)-distance(b.position,center)||a.id-b.id).slice(0,count).map(s=>s.id);
}

// Moves existing entities, never re-seeds their resources, fleets or identities.
// Historical reports/replays retain their original coordinates. Live routes follow IDs.
export function movePlanet(world,p,position){
  const old=[...p.position];p.position=[...position];
  const related=[p,...Object.values(world.planets).filter(q=>q.parent===p.id)];
  for(const q of related){q.position=[...position];for(const m of world.missions){
    if(m.target===q.id)m.position=[...position];
    if(m.from===q.id&&m.fromPosition)m.fromPosition=[...position];
    if(m.target===q.id&&m.originPosition?.join(':')===old.join(':'))m.originPosition=[...position];
  }}
}

export function migrateSovereignty(world,createColony){
  if(world.sovereignty?.version>=SOVEREIGNTY_VERSION)return;
  const humans=Object.values(world.players).filter(p=>!p.bot),humanWorlds=Object.values(world.planets).filter(p=>!p.moon&&world.players[p.owner]&&!world.players[p.owner].bot);
  const anchor=world.planets[humans[0]?.home]?.position||[1,16,7],center=byId.get(anchor[1])?.position||byId.get(16).position;
  const safe=new Set(humans.length?humans.flatMap(p=>nearestSystems(world.planets[p.home]?.position||anchor)):nearestSystems(anchor));
  for(const p of humanWorlds)if(p.position[0]===1)safe.add(p.position[1]);
  world.sovereignty={version:SOVEREIGNTY_VERSION,claims:{},safeSystems:[...safe].sort((a,b)=>a-b),anchor:[...anchor]};
  // No automatic resolution is allowed to move or delete a human colony.
  for(const p of humanWorlds)claimSystem(world,world.players[p.owner],p.position);
  const reserved=new Set(world.missions.filter(m=>m.task==='colonize'&&m.phase==='outbound').map(m=>systemKey(m.position)));
  const used=new Set([...Object.keys(world.sovereignty.claims),...reserved]);
  const available=stars.filter(s=>!safe.has(s.id));
  const opposite=available.filter(s=>s.position[0]*center[0]+s.position[2]*center[2]<0);
  const far=[...opposite].sort((a,b)=>distance(b.position,center)-distance(a.position,center));
  const iron=far[0]||available.at(-1),dawn=[...opposite].sort((a,b)=>distance(b.position,iron.position)-distance(a.position,iron.position))[0]||available[0];
  const frontier=[...available].sort((a,b)=>distance(a.position,center)-distance(b.position,center))[12]||available[0];
  const hubs={frontier:frontier.position,iron:iron.position,dawn:dawn.position};
  const chooseSystem=(point,farOnly=false)=>{
    const s=[...(farOnly?opposite:available)].filter(s=>!used.has('1:'+s.id)).sort((a,b)=>distance(a.position,point)-distance(b.position,point)||a.id-b.id)[0];
    if(!s)throw Error('没有足够的空星系安置电脑势力');used.add('1:'+s.id);return s.id;
  };
  const legacy=[['边境自由港',3,'自由港商盟','#8fc7a7'],['猎户要塞',5,'猎户防卫同盟','#d9aa73'],['天鹅座',12,'天鹅座共同体','#94b8e5']];
  for(const [name,slot,realmName,color]of legacy){
    const p=Object.values(world.planets).find(p=>!p.moon&&p.name===name&&p.position.join(':')===`1:16:${slot}`&&world.players[p.owner]?.bot&&world.players[p.owner]?.home===p.id&&!world.players[p.owner]?.commander);
    if(p)world.players[p.owner].realm={id:'realm:'+p.owner,name:realmName,color};
  }
  for(const player of Object.values(world.players).filter(p=>p.bot)){
    const planets=Object.values(world.planets).filter(p=>p.owner===player.id&&!p.moon);
    const region=player.commander?.region,hub=hubs[region]||[center[2],0,-center[0]],oldSystems=new Map();
    for(const p of planets){
      const key=systemKey(p.position);if(!oldSystems.has(key))oldSystems.set(key,chooseSystem(hub,['iron','dawn'].includes(region)));
      const system=oldSystems.get(key),occupied=new Set(Object.values(world.planets).filter(q=>q.id!==p.id&&!q.moon&&q.position[0]===1&&q.position[1]===system).map(q=>q.position[2]));
      const slot=[p.position[2],...Array.from({length:15},(_,i)=>i+1)].find(n=>!occupied.has(n));
      if(!slot)throw Error('目标星系没有空轨道安置电脑势力');
      movePlanet(world,p,[1,system,slot]);
      claimSystem(world,player,p.position);
    }
    if(player.commander&&world.planets[player.home])player.commander.position=[...world.planets[player.home].position];
  }
  // Existing generals now have actual multi-system holdings in the visible galaxy.
  for(const region of ['iron','dawn']){
    const player=Object.values(world.players).find(p=>p.bot&&p.commander?.region===region&&p.commander.title==='大将军');
    if(!player||!createColony)continue;
    for(let i=1;i<=12;i++){
      const system=chooseSystem(hubs[region],true),occupied=new Set(Object.values(world.planets).filter(p=>!p.moon&&p.position[0]===1&&p.position[1]===system).map(p=>p.position[2]));
      const slot=[8,...Array.from({length:15},(_,i)=>i+1)].find(n=>!occupied.has(n));
      if(!slot)throw Error('目标星系没有空轨道安置电脑殖民地');
      const position=[1,system,slot],id=`realm:${region}:colony:${i}`;
      const p=createColony(player.id,`${region==='iron'?'赤铁':'曙光'}领地 ${i}`,position,{id,ships:{Cruiser:20,Battleship:10},defense:{Rocket_Launcher:20,Light_Laser:10},resources:[120000,75000,35000]});
      world.planets[id]=p;claimSystem(world,player,position);
    }
  }
}
