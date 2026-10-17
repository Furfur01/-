import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,ensureSystemNpcs,snapshot,migrateWorld,act,advance} from '../game/engine.mjs';

import {npcTypes,npcPublic,plannedNpcs} from '../game/npc-types.mjs';
import {starMap} from '../game/star-map.mjs';
import {units} from '../game/catalog.mjs';
const T=1800000000000;
const camps=(world,galaxy,system)=>Object.values(world.planets).filter(p=>p.npc&&!p.moon&&p.position[0]===galaxy&&p.position[1]===system);
function fixture(){const world=createWorld(T);world.planets={};world.npcSystems={};world.sovereignty.claims={};world.sovereignty.safeSystems=[];const player=createPlayer(world,'测试星系检查',T,()=>.5);ensureSystemNpcs(world,1,16);return {world,player,home:world.planets[player.home]};}

test('neutral and owned systems both get five distinct persistent NPCs',()=>{
  const {world,player,home}=fixture();
  const initialCount=Object.keys(world.planets).length;
  assert.equal(Object.keys(world.npcSystems).length,1);
  snapshot(world,player,[1,20]);snapshot(world,player,[1,21]);
  for(const [g,s] of [[1,20],[1,21]])assert.equal(camps(world,g,s).length,5);
  assert.equal(camps(world,...home.position).length,5);
  const all=Object.values(world.planets);
  assert.equal(new Set(all.map(p=>p.id)).size,all.length);
  assert.equal(new Set(all.filter(p=>!p.moon).map(p=>p.position.join(':'))).size,all.filter(p=>!p.moon).length);
  const first=camps(world,1,20)[0],other=camps(world,1,21)[0];
  assert.notEqual(first.ships,other.ships);assert.notEqual(first.defense,other.defense);assert.notEqual(first.resources,other.resources);
  const before=JSON.stringify(world);
  snapshot(world,player,[1,21]);snapshot(world,player,[1,20]);assert.equal(JSON.stringify(world),before);
  const restored=migrateWorld(JSON.parse(before));
  assert.deepEqual(snapshot(restored,restored.players[player.id],[1,20]).map,snapshot(world,player,[1,20]).map);
  assert.ok(snapshot(world,player).map.every(p=>!('resources' in p)&&!('ships' in p)));
  assert.equal(Object.keys(world.planets).length,initialCount+15);
});

test('five NPC categories have fixed approved skins and public strength tiers',()=>{
  const {world,player}=fixture();world.biomeSeed=42;
  const skins=new Set();
  for(let system=20;system<25;system++){
    const state=snapshot(world,player,[1,system]),local=camps(world,1,system);
    assert.equal(new Set(local.map(p=>p.npcSkin)).size,5);
    for(const p of local){assert.deepEqual(npcPublic(p),Object.fromEntries(Object.keys(npcPublic(p)).map(k=>[k,p[k]])));skins.add(p.npcSkin);assert.equal(state.map.find(record=>record.id===p.id).npcSkin,p.npcSkin);}
  }
  assert.deepEqual([...skins].sort((a,b)=>a-b),[18,19,20,28,34]);
  const before=JSON.stringify(world);snapshot(world,player,[1,20]);assert.equal(JSON.stringify(world),before);
  const restored=migrateWorld(JSON.parse(before));
  for(let system=20;system<25;system++)assert.deepEqual(camps(restored,1,system),camps(world,1,system));
});

test('unclassified legacy skins are preserved while known camps acquire fixed category metadata',()=>{
  const {world}=fixture(),template=camps(world,1,16)[0],expected=new Map();
  for(let skin=17;skin<=34;skin++)for(const field of ['npcSkin','planet_icon']){
    const index=(skin-17)*2+(field==='planet_icon'?1:0),id=`legacy-skin-${index}`;
    const p={...structuredClone(template),id,name:'旧据点 '+index,position:[8,90+Math.floor(index/15),1+index%15],resources:[index,2,1],ships:{},defense:{},debris:[123,45,0]};
    for(const k of Object.keys(npcPublic(p)))delete p[k];delete p.npcSkin;p[field]=field==='planet_icon'?String(skin):skin;
    if(field==='npcSkin')p.planet_icon=skin===34?17:34;
    world.planets[id]=p;expected.set(id,{skin,before:structuredClone(p)});
  }
  const old=camps(world,1,16);for(const p of old)delete p.npcSkin;
  const originals=old.map(p=>structuredClone(p));migrateWorld(world);
  for(const [id,{skin,before}]of expected)assert.deepEqual(world.planets[id],{...before,npcSkin:skin});
  for(const before of originals){const p=world.planets[before.id];assert.deepEqual(p,{...before,...npcPublic(p)});}
  assert.equal(new Set(old.map(p=>p.npcSkin)).size,5);
  const once=JSON.stringify(world);migrateWorld(world);assert.equal(JSON.stringify(world),once);
});

test('known categories override obsolete random skins while ordinary planets and moons remain unchanged',()=>{
  const {world,player,home}=fixture(),target=camps(world,1,16)[0];
  const moon={...structuredClone(home),id:'skin-test-moon',moon:true,parent:home.id,planet_icon:30};world.planets[moon.id]=moon;
  home.planet_icon=34;const before=structuredClone({home,moon});
  for(const value of [null,{},true,'bad',16,35,18.5]){
    target.npcSkin=value;target.planet_icon=value;snapshot(world,player,[1,16]);assert.equal(target.npcSkin,18);
  }
  assert.deepEqual({home,moon},before);
  const state=snapshot(world,player,[1,16]);assert.equal(state.map.find(p=>p.id===home.id).npcSkin,null);assert.equal(state.map.find(p=>p.id===moon.id).npcSkin,null);
});

test('legacy NPC progress survives first visit and initialization markers prevent respawn',()=>{
  const {world,player}=fixture();delete world.npcSystems;
  const legacy=camps(world,1,16)[0];legacy.ships={};legacy.defense={};legacy.resources=[3,2,1];legacy.debris=[12500,3500,0];
  const before=structuredClone(camps(world,1,16));
  snapshot(world,player,[1,16]);assert.deepEqual(camps(world,1,16),before);
  for(const npc of camps(world,1,16))delete world.planets[npc.id];
  snapshot(world,player,[1,16]);assert.equal(camps(world,1,16).length,0);
  const restored=JSON.parse(JSON.stringify(world));migrateWorld(restored);
  snapshot(restored,restored.players[player.id],[1,16]);assert.equal(camps(restored,1,16).length,0);
});

test('seeding preserves player planets, moons and colony missions already in flight',()=>{
  const {world,player,home}=fixture();home.position=[1,33,1];
  const moon={...structuredClone(home),id:'player-moon',parent:home.id,moon:true};world.planets[moon.id]=moon;
  player.tech.Astrophysics_Tech=2;
  world.missions.push({id:'legacy-colonization',owner:player.id,from:home.id,target:null,task:'colonize',phase:'outbound',position:[1,33,2],ships:{Colony_Ship:1},cargo:[100,0,0],start:T,end:T+20000,travel:20000,seed:1});
  const before=structuredClone({home,moon,mission:world.missions[0]});
  snapshot(world,player,[1,33]);
  assert.deepEqual(home,before.home);assert.deepEqual(moon,before.moon);assert.deepEqual(world.missions[0],before.mission);
  assert.equal(camps(world,1,33).length,5);
  assert.ok(camps(world,1,33).every(p=>!p.moon&&p.position[2]>=3&&p.position[2]<=15));
  advance(world,T+20000);
  const colony=Object.values(world.planets).find(p=>p.position.join(':')==='1:33:2');
  assert.equal(colony.owner,player.id);assert.equal(colony.resources[0],600);assert.equal(world.missions.length,0);
});

test('coordinate-only dispatch discovers real targets and rejects colonizing NPC or mismatched targets',()=>{
  const {world,player,home}=fixture();home.ships={Probe:2,Colony_Ship:1};home.resources=[1e6,1e6,1e6];player.tech={Computer_Tech:5,Astrophysics_Tech:2};
  act(world,player,{type:'dispatch',planet:home.id,ships:{Probe:1},position:[1,20,1],task:'spy'},T);
  const target=world.planets[world.missions[0].target];assert.ok(target.npc);assert.deepEqual(target.position,[1,20,1]);
  assert.throws(()=>act(world,player,{type:'dispatch',planet:home.id,ships:{Colony_Ship:1},position:[1,20,1],task:'colonize'},T),/空闲星球/);
  assert.throws(()=>act(world,player,{type:'dispatch',planet:home.id,ships:{Probe:1},target:target.id,position:[1,22,1],task:'spy'},T),/目标坐标/);
  assert.equal(home.ships.Colony_Ship,1);assert.equal(world.missions.length,1);
});

test('combat changes only the attacked system and revisiting or reloading never restores its loot or fleet',()=>{
  const {world,player,home}=fixture();
  ensureSystemNpcs(world,1,20);ensureSystemNpcs(world,1,21);
  const target=camps(world,1,20)[0],other=camps(world,1,21)[0];other.resources=[1e8,1e8,1e8];
  const otherBefore=structuredClone(other),shipsBefore=structuredClone(target.ships),resourcesBefore=[...target.resources],skinBefore=target.npcSkin;
  home.ships={Dreadnought:50,Large_Cargo_Ship:20};home.resources=[1e8,1e8,1e8];player.tech={Computer_Tech:5};
  act(world,player,{type:'dispatch',planet:home.id,ships:home.ships,position:target.position,target:target.id,task:'attack'},T);
  const mission=world.missions[0];mission.seed=42;advance(world,mission.end);finishCombat(world);
  assert.equal(player.reports[0].winner,'attacker');assert.notDeepEqual(target.ships,shipsBefore);
  assert.ok(target.resources.some((n,i)=>n<resourcesBefore[i]));assert.deepEqual(other,otherBefore);
  assert.equal(target.npcSkin,skinBefore);
  const settled=structuredClone(target);
  snapshot(world,player,[1,21]);snapshot(world,player,[1,20]);assert.deepEqual(target,settled);
  const restored=migrateWorld(JSON.parse(JSON.stringify(world)));
  snapshot(restored,restored.players[player.id],[1,20]);assert.deepEqual(restored.planets[target.id],settled);
});

test('invalid systems are rejected before any targets or initialization markers are changed',()=>{
  const {world}=fixture(),before=JSON.stringify(world);
  for(const [g,s] of [[0,1],[10,1],[1,0],[1,500],[1,2.5],[NaN,1],['1',1]])assert.throws(()=>ensureSystemNpcs(world,g,s),/坐标/);
  assert.equal(JSON.stringify(world),before);
});


function finishCombat(world){let guard=0;while(Object.values(world.battles||{}).some(b=>b.status==='active')&&guard++<601)advance(world,world.at+1000);}


test('version-one upgrade adds only the fifth camp and preserves old combat progress',()=>{
  const {world,player}=fixture();const original=camps(world,1,16);const fifth=original.find(p=>p.npcType==='fracture');delete world.planets[fifth.id];world.npcSystems['1:16']=true;
  const first=original[0];first.ships={};first.defense={};first.resources=[3,2,1];first.debris=[44,55,0];
  for(const p of camps(world,1,16)){for(const k of Object.keys(npcPublic(p)))delete p[k];p.npcSkin=17;}
  const before=structuredClone(camps(world,1,16));const projection=starMap(world).planets.filter(p=>p.npc&&p.position[1]===16);assert.equal(projection.length,5);
  migrateWorld(world);assert.equal(camps(world,1,16).length,5);for(const p of before)assert.deepEqual(world.planets[p.id],{...p,...npcPublic(p)});
  const after=JSON.stringify(world);migrateWorld(world);assert.equal(JSON.stringify(world),after);
  const actual=camps(world,1,16).find(p=>p.npcType==='fracture');const predicted=projection.find(p=>p.npcType==='fracture');assert.deepEqual(actual.position,predicted.position);
  delete world.planets[actual.id];snapshot(world,player,[1,16]);assert(!world.planets[actual.id]);
});

test('tiers strictly increase real defensive strength and loot without leaking current armies',()=>{
  const power=t=>Object.entries({...t.ships,...t.defense}).reduce((sum,[id,n])=>{assert(units[id]);return sum+n*(units[id].attack+units[id].shield+units[id].strength);},0);
  const types=[...npcTypes].sort((a,b)=>a.level-b.level);for(let i=1;i<types.length;i++){assert(power(types[i])>power(types[i-1]));assert(types[i].resources.every((v,k)=>v>types[i-1].resources[k]));}
  const {world,player}=fixture(),state=snapshot(world,player,[1,16]);for(const p of state.map.filter(p=>p.npc)){assert(p.npcType&&p.npcLevel&&p.npcThreat);assert(!('ships'in p));assert(!('defense'in p));}
});

test('fifth camp upgrade respects full systems and reserved colony destinations',()=>{
  const {world}=fixture();const template=camps(world,1,16)[0];for(let slot=1;slot<=14;slot++)world.planets['occupied-'+slot]={...structuredClone(template),id:'occupied-'+slot,npc:false,owner:'me',position:[1,77,slot]};
  world.npcSystems['1:77']=true;world.missions.push({task:'colonize',phase:'outbound',position:[1,77,15]});const before=JSON.stringify(world.planets);assert.deepEqual(plannedNpcs(world,1,77),[]);ensureSystemNpcs(world,1,77);assert.equal(JSON.stringify(world.planets),before);
});
