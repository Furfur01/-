import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import vm from 'node:vm';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,snapshot as worldSnapshot,duration} from '../game/engine.mjs';
import {starMap} from '../game/star-map.mjs';
import {systemBiomes,planetsBySystem} from '../game/system-biomes.mjs';
import {plannedNpcs} from '../game/npc-types.mjs';
import {createSpatialBattle,addSpatialFleet,recordFrame} from '../game/spatial-battle.mjs';
import {units,tech} from '../game/catalog.mjs';
import {chartRoute,routePoint} from '../scripts/universe/chart-routes.js';
import {fleetColors,fleetMapChoice} from '../client/command-ui/fleet-map.mjs';
import {territoryLabels,footprint,PUBLIC_CORE_RADIUS} from '../scripts/universe/territory-labels.js';
import {strategyData,territoryGeometry} from '../scripts/universe/environment-geometry.js';
import {OUTER_ASTEROID_BELT} from '../scripts/universe/asteroid-layout.js';
import * as THREE from 'three';
import {createMegastructures} from '../scripts/universe/megastructures.js';
import {starRadius,bodyRecords} from '../scripts/universe/spatial.js';
import {logisticsKey,publicLogistics} from '../game/system-logistics.mjs';
import {logisticsPose,logisticsGatePose} from '../scripts/universe/logistics-layout.js';
import {logisticsMembers,createLogisticsVisual} from '../scripts/universe/logistics-visual.js';

test('territory badges use real polity names and owned anchors outside the public core without mutating geography',()=>{
 const world=createWorld(),player=createPlayer(world,'测试_星图标识'),map=starMap(world);
 const layout=JSON.parse(fs.readFileSync(new URL('../opendesign/mockups/planet-construction-review/galaxy-layout.json',import.meta.url)));
 const stars=map.systems.map(s=>({...s,position:layout.systems.find(p=>p.id===s.id).position.map(v=>v*100)}));
 const records=strategyData(stars,map.planets,player.id),data=territoryGeometry(stars,records),before=structuredClone(data),labels=territoryLabels(data,player.id);
 for(const id of ['faction:iron','faction:dawn','faction:zenith','faction:obsidian','realm:starbay'])assert(labels.some(l=>l.id===id));
 assert.equal(new Set(labels.map(l=>l.id)).size,labels.length);
 for(const l of labels){assert(l.name);assert(data.cells.find(c=>c.id===l.system).owners.some(o=>o.id===l.id));for(const p of footprint(l.position,l.width))assert(Math.hypot(p[0],p[2])>PUBLIC_CORE_RADIUS);}
 assert(!labels.some(l=>l.id==='reserved-expansion'||l.id===player.id));assert(!records.some(r=>r.territoryClass==='reserved-expansion'));
 assert.deepEqual(world.grandPowers.reserve,map.systems.filter(s=>s.playerReserve).map(s=>s.id));
 assert.deepEqual(data,before);
});

test('local bridge resumes Local progress without returning its cookie and retains legacy APIs',async()=>{
  const world=createWorld(),local=createPlayer(world,'Local test progress'),browser=createPlayer(world,'Browser test progress');
  world.planets[local.home].buildings.Command_Center=3;
  const battle=createSpatialBattle({id:'00000000-0000-4000-8000-000000000099',target:local.home,attacker:local.id,defender:browser.id,start:world.at});
  addSpatialFleet(battle,{fleet:{Battleship:1},side:'attacker',owner:local.id},units);
  addSpatialFleet(battle,{fleet:{Cruiser:1},side:'defender',owner:browser.id},units);
  recordFrame(battle);battle.status='finished';battle.settled=true;
  world.battles={[battle.id]:battle};
  local.reports=[{id:'release-replay',type:'battle',engine:`spatial-v${battle.version}`,battleId:battle.id,at:world.at}];
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'empire-bridge-'));
  const file=path.join(directory,'universe.json'),session=path.join(directory,'session.json');
  fs.writeFileSync(file,JSON.stringify(world));fs.writeFileSync(session,JSON.stringify({cookie:`empire=${local.id}`}));
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,EMPIRE_SESSION_FILE:session},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;
  let errors='';child.stderr.on('data',chunk=>{errors+=chunk;});
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error(errors);}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('server startup timeout')),10000);timer.unref();})]);
    const headers={Origin:base,'X-Empire-Client':'galactic-command','Content-Type':'application/json',Cookie:`empire=${browser.id}`};
    const beforeProbe=fs.readFileSync(file,'utf8');
    const probe=await fetch(base+'/api/health');
    assert.equal(probe.status,200);assert.equal(probe.headers.get('set-cookie'),null);
    assert.equal(probe.headers.get('cache-control'),'no-store');
    const health=await probe.json();
    assert.equal(health.service,'galaxy-empire');assert.equal(health.status,'running');
    assert.equal(health.pid,child.pid);assert.equal(health.port,port);
    assert.ok(health.uptime>=0);
    assert.equal((await fetch(base+'/api/health',{method:'POST'})).status,405);
    assert.equal(fs.readFileSync(file,'utf8'),beforeProbe);
    for(const route of ['/api/session/local','/api/session/godot'])for(const options of [{},{method:'POST'},{method:'POST',headers:{...headers,Origin:'http://foreign.invalid'}},{method:'POST',headers:{...headers,'X-Empire-Client':'foreign'}},{method:'POST',headers:{...headers,'Sec-Fetch-Site':'cross-site'}}]){
      assert.equal((await fetch(base+route,options)).status,403);
    }
    const result=await fetch(base+'/api/session/local',{method:'POST',headers,body:'{}'});
    assert.equal(result.status,200);
    assert.deepEqual(await result.json(),{source:'local',name:local.name});
    const alias=await fetch(base+'/api/session/godot',{method:'POST',headers});
    assert.equal(alias.status,200);assert.deepEqual(await alias.json(),{source:'local',name:local.name});
    assert.equal(alias.headers.get('set-cookie'),result.headers.get('set-cookie'));
    assert.match(result.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
    const cookie=result.headers.get('set-cookie').split(';')[0];
    const state=await(await fetch(base+'/api/state',{headers:{Cookie:cookie}})).json();
    assert.equal(state.player.name,local.name);assert.equal(state.planets[0].buildings.Command_Center,3);
    const replay=await(await fetch(base+'/api/replay/release-replay',{headers:{Cookie:cookie}})).json();
    assert.equal(replay.version,4);assert.equal(replay.record.metadata.length,2);assert(replay.record.frames.length>0);
    assert.equal((await fetch(base+'/api/replay/release-replay',{headers:{Cookie:`empire=${browser.id}`}})).status,404);
    assert.equal((await fetch(base+'/api/action',{method:'POST',headers:{...headers,Cookie:cookie},body:JSON.stringify({type:'readAll'})})).status,200);
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length);
    // Simulate the embedded browser dropping cookies on every refresh.
    for(let i=0;i<5;i++){const response=await fetch(base+'/api/state',{headers:{'X-Empire-Client':'galactic-command','Sec-Fetch-Site':'same-origin'}});const stable=await response.json();assert.equal(stable.player.id,local.id);assert.equal(stable.player.home,local.home);}
    const stale=await(await fetch(base+'/api/state',{headers})).json();assert.equal(stale.player.id,local.id,'tagged UI keeps disk session even with an obsolete browser cookie');
    const rejected=await fetch(base+'/api/state',{headers:{Origin:'http://foreign.invalid','X-Empire-Client':'galactic-command'}});assert.equal(rejected.status,403);
    await fetch(base+'/api/action',{method:'POST',headers:{...headers,Cookie:undefined},body:JSON.stringify({type:'readAll'})});
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length,'cookie loss must not create new commanders');
    for(const route of ['/api/state','/api/missing','/api/battle-trial','/api/battles/00000000-0000-4000-8000-000000000099','/api/battles/00000000-0000-4000-8000-000000000099/events','/api/replay/missing']){
      const unauthenticated=await fetch(base+route);assert.equal(unauthenticated.status,401);assert.equal(unauthenticated.headers.get('set-cookie'),null);
    }
    await fetch(base+'/api/action',{method:'POST',headers,body:JSON.stringify({type:'readAll'})});
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length,'old battle tabs must not register players on reconnect');
    fs.writeFileSync(session,'{}');
    assert.deepEqual(await(await fetch(base+'/api/session/local',{method:'POST',headers})).json(),{source:'browser',name:browser.name});
    assert.equal(JSON.parse(fs.readFileSync(session)).cookie,`empire=${browser.id}`,'browser recovery must persist the session');
    const resumed=await fetch(base+'/api/session/local',{method:'POST',headers:{Origin:base,'X-Empire-Client':'galactic-command'}});
    assert.deepEqual(await resumed.json(),{source:'local',name:browser.name});
    fs.writeFileSync(session,'{}');
    const ambiguous=await fetch(base+'/api/session/local',{method:'POST',headers:{Origin:base,'X-Empire-Client':'galactic-command'}});
    assert.equal(ambiguous.status,409,'a lost session with multiple accounts requires selecting one, never another account');
    assert.equal(Object.keys(JSON.parse(fs.readFileSync(file)).players).length,Object.keys(world.players).length);
    assert.equal((await fetch(base+'/')).status,200);
    for(const name of ['/data/session.json','/data/universe.json','/godot/data/session.json'])assert.equal((await fetch(base+name)).status,404);
  }finally{
    child.kill();await once(child,'exit');
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(directory,{recursive:true,force:true});
  }
});

function client(fetch){
  const window=new EventTarget(),storage=new Map(),intervals=[];
  vm.runInNewContext(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/api.js',import.meta.url),'utf8'),{
    window,fetch,console,AbortController,CustomEvent,setTimeout,clearTimeout,setInterval:fn=>{intervals.push(fn);return intervals.length;},
    document:{hidden:false,addEventListener(){}},localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)}
  });
  return {api:window.EmpireAPI,intervals};
}
const snapshot=(now=1)=>({now,player:{home:'home'},planets:[{id:'home',name:'新地球'},{id:'colony',name:'霜原'}]});
const response=(data,ok=true)=>({ok,json:async()=>data});

test('combat view uses its live stream, keeps explicit refresh/actions, and resumes empire polling on exit',async()=>{
  const calls=[];
  const {api,intervals}=client(async url=>{calls.push(url);return response(url==='/api/session/local'?{source:'local'}:url==='/api/catalog'?{units:{}}:snapshot());});
  await api.init();calls.length=0;
  api.setCombatView(true);intervals[0]();intervals[0]();assert.deepEqual(calls,[]);
  await api.refresh();assert.deepEqual(calls,['/api/state'],'Battle completion and manual refresh still work');
  await api.action({type:'readAll'});assert.equal(calls.at(-1),'/api/action');
  api.setCombatView(false);await api.refresh();
  assert.equal(calls.filter(url=>url==='/api/state').length,2,'Exit refreshes once; repeated exit notifications do not poll');
  api.setCombatView(false);assert.equal(calls.filter(url=>url==='/api/state').length,2);
  intervals[0]();await api.refresh();assert.equal(calls.filter(url=>url==='/api/state').length,3);
});

test('indexed state projections preserve current colony, reserved orbit and research-network rules',()=>{
  const world=createWorld(),player=createPlayer(world,'测试_星图同步'),home=world.planets[player.home],system=499;
  const local={...structuredClone(home),id:'test-colony',position:[1,system,7],biome:'mars',buildings:{Research_Lab:12}};
  const moon={...structuredClone(local),id:'test-moon',moon:true,parent:local.id,buildings:{Research_Lab:30}};
  world.planets[local.id]=local;world.planets[moon.id]=moon;
  world.missions.push({id:'test-colonize',owner:player.id,task:'colonize',phase:'outbound',position:[1,system,11],colonyBiome:'gas'});
  const groups=planetsBySystem(world),before=structuredClone(world);
  assert.deepEqual(systemBiomes(world,1,system,groups.get('1:'+system)),systemBiomes(world,1,system));
  assert.deepEqual(plannedNpcs(world,1,system,groups.get('1:'+system)),plannedNpcs(world,1,system));
  const directory=starMap(world);assert.deepEqual(world,before,'Public directory must remain read-only');
  assert.equal(directory.planets.find(p=>p.key===`1:${system}:7`).biome,'mars');
  assert.equal(directory.planets.find(p=>p.key===`1:${system}:11`).biome,'gas');
  assert.equal(directory.planets.find(p=>p.key===`moon:${moon.id}`).parent,local.id);
  const item=tech.Energy_Tech;
  player.tech.Intergalactic_Network=0;const solo=duration(item,'tech',home,1,world,player);
  assert.equal(solo,duration(item,'tech',home,1,null,player));
  player.tech.Intergalactic_Network=1;
  assert.equal(duration(item,'tech',home,1,world,player),duration(item,'tech',{...home,buildings:{...home.buildings,Research_Lab:(home.buildings.Research_Lab||0)+12}},1,null,player));
  const state=worldSnapshot(world,player);
  assert.equal(state.planets.find(p=>p.id===home.id).researchOptions.Energy_Tech.seconds,duration(item,'tech',home,(player.tech.Energy_Tech||0)+1,world,player));
  local.biome='mercury';local.name='更新后的测试殖民地';
  const next=worldSnapshot(world,player),nextMap=starMap(world);
  assert.equal(next.map.find(p=>p.id===local.id).biome,'mercury');
  assert.equal(nextMap.planets.find(p=>p.id===local.id).name,local.name,'Projection indexes must not outlive a request');
});

test('public logistics shows existing foreign hubs and only their real public members without leaking management data',()=>{
 const world=createWorld(),player=createPlayer(world,'测试_公开物流'),home=world.planets[player.home],foreign=world.players[world.grandPowers.regions[0].leader];
 const free=Array.from({length:15},(_,i)=>i+1).filter(slot=>!Object.values(world.planets).some(p=>!p.moon&&p.position.join(':')===`${home.position[0]}:${home.position[1]}:${slot}`));
 const colony={...structuredClone(home),id:'test-logistics-colony',name:'测试_接入殖民地',position:[1,home.position[1],free[0]]};
 const moon={...structuredClone(home),id:'test-logistics-moon',name:'测试_公开卫星',moon:true,parent:home.id};
 const rival={...structuredClone(home),id:'test-logistics-rival',name:'测试_同系外国殖民地',owner:foreign.id,position:[1,home.position[1],free[1]]};
 world.planets[colony.id]=colony;world.planets[moon.id]=moon;world.planets[rival.id]=rival;
 const key=logisticsKey(home),otherKey=logisticsKey(rival),secret='test-private-logistics-invoice';
 world.logisticsCenters[key]={owner:player.id,position:home.position.slice(0,2),level:1,resources:[123456,789012,345678],queue:{planet:home.id,start:world.at,end:world.at+60000,cost:[1,2,3],id:secret}};
 world.logisticsCenters[otherKey]={owner:foreign.id,position:rival.position.slice(0,2),level:1};
 const privateBefore=structuredClone(worldSnapshot(world,player).logistics),before=structuredClone(world),map=starMap(world),own=map.logistics.find(c=>c.key===key),other=map.logistics.find(c=>c.key===otherKey);
 assert.deepEqual(world,before);assert.deepEqual(worldSnapshot(world,player).logistics,privateBefore,'own management projection retains balances, queues and moon membership');
 assert.deepEqual(Object.keys(own).sort(),['host','key','level','members','owner','ownerName','position']);
 assert.deepEqual(own.members,[home.id,colony.id,moon.id].sort((a,b)=>a.localeCompare(b)));assert.equal(own.owner,player.id);assert(own.members.includes(own.host));assert(!world.planets[own.host].moon);
 assert.deepEqual(other.members,[rival.id]);assert.equal(other.owner,foreign.id);assert(other.ownerName);
 for(const center of map.logistics){
  assert(world.logisticsCenters[center.key].level>0);assert(center.members.every(id=>map.planets.some(p=>p.id===id&&p.owner===center.owner&&p.position.slice(0,2).join(':')===center.position.join(':'))));
  for(const field of ['resources','capacity','rate','queue','cost','seconds'])assert.equal(field in center,false);
 }
 for(const region of world.grandPowerMegastructures.regions)for(const system of region.systems)assert(map.logistics.some(c=>c.key===`${region.leader}:1:${system}`),'preset gates have a corresponding visible hub');
 assert.equal(JSON.stringify(map.logistics).includes(secret),false);
 const withoutMoon=publicLogistics(world,map.planets.filter(p=>p.id!==moon.id)).find(c=>c.key===key);assert(!withoutMoon.members.includes(moon.id),'membership cannot disclose a body absent from the public map');
 const star={id:home.position[1],position:[10000,0,20000],radius:starRadius(home.position[1])},centers=[own,other],bodies=bodyRecords(map.planets,[star]);
 const poses=centers.map(center=>logisticsPose(center,star,centers));assert.notDeepEqual(poses[0].position,poses[1].position,'two civilizations in one system have separate hubs');
 const renderer=createMegastructures({scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera()});
 try{
  renderer.setState({systems:[star],planets:bodies,logistics:centers,megastructures:{systems:centers.map(center=>({...center,structures:{gate:{level:1}}})),habitats:[]}});
  for(const [i,center]of centers.entries()){
   const pose=poses[i],gate=logisticsGatePose(star,center,centers),record=renderer.focus({system:center.position,id:'gate',owner:center.owner,key:center.key});
   assert.deepEqual(gate.position.map((n,k)=>n-pose.position[k]),[0,1500,-240]);assert.equal(gate.scale,20);assert.deepEqual(record.position,gate.position);assert.equal(record.scale,gate.scale);
   const connected=logisticsMembers(center,bodies);assert.deepEqual(connected.map(p=>p.id).sort(),[...center.members].sort());assert(connected.every(p=>p.owner===center.owner&&p.coordinates[1]===star.id));
   const visual=createLogisticsVisual({detailed:false});
   try{
    visual.setConnections(center,pose,bodies);assert.deepEqual([...visual.members].sort(),[...center.members].sort());assert.equal(visual.routeCount,center.members.length,'published moons retain their parent-planet branch');
    if(center===own){
     const routes=visual.group.getObjectByName('logistics-moon-routes');assert(routes?.isLineSegments2);
     const {instanceStart,instanceEnd}=routes.geometry.attributes;assert(instanceStart.count>0&&instanceEnd.count===instanceStart.count);
     const parent=bodies.find(p=>p.id===home.id),start=new THREE.Vector3().fromBufferAttribute(instanceStart,0).add(new THREE.Vector3(...pose.position)),distance=start.distanceTo(new THREE.Vector3(...parent.position));
     assert(distance>parent.radius&&distance<parent.radius*1.2,'the moon route starts just outside its parent, not at the hub');
    }
   }finally{visual.dispose();}
  }
 }finally{renderer.dispose();}
 world.logisticsCenters[key].level=0;assert(!starMap(world).logistics.some(c=>c.key===key),'unfinished private projects are not public facilities');
});

test('browser adapter ignores stale polls, blocks duplicate actions and exposes failures without rejected promises',async()=>{
  let poll,act,mode='init';const calls=[];
  const {api}=client(async(url,options)=>{
    calls.push({url,options});
    if(url==='/api/session/local')return response({source:'local'});
    if(url==='/api/catalog')return response({buildings:{},units:{}});
    if(url==='/api/action')return new Promise(resolve=>{act=resolve;});
    if(mode==='init')return response(snapshot());
    if(mode==='offline')throw new Error('offline');
    return new Promise(resolve=>{poll=resolve;});
  });
  const changes=[];const stop=api.subscribe(value=>changes.push(value.busy));
  await api.init();assert.equal(api.sessionSource,'local');assert.equal(api.planet.name,'新地球');
  assert.equal(api.setPlanet('colony'),true);assert.equal(api.setPlanet('missing'),false);
  mode='pending';const pending=api.refresh();
  const action=api.action({type:'build',id:'Metal_Mine'});
  assert.equal(api.busy,true);assert.equal(await api.action({type:'build'}),null);
  assert.equal(JSON.parse(calls.find(call=>call.url==='/api/action').options.body).planet,'colony');
  act(response(snapshot(3)));assert.equal((await action).now,3);
  poll(response(snapshot(2)));await pending;
  assert.equal(api.state.now,3);assert.equal(api.busy,false);
  const failed=api.action({type:'build'});act(response({error:'资源不足'},false));
  assert.equal(await failed,null);assert.equal(api.error,'资源不足');
  assert.equal(await api.refresh([0,500]),null);assert.equal(api.error,'星系坐标无效');
  mode='offline';assert.equal(await api.refresh(),null);assert.equal(api.connected,false);
  assert.ok(changes.includes(true));stop();
});

test('initial connection failures remain retryable by polling',async()=>{
  let online=false;
  const {api,intervals}=client(async url=>{
    if(!online)throw new Error('offline');
    return response(url==='/api/session/local'?{source:'local'}:url==='/api/catalog'?{units:{}}:snapshot());
  });
  assert.equal(await api.init(),null);assert.equal(api.loading,false);assert.equal(api.error,'offline');
  online=true;intervals[0]();await api.init();assert.equal(api.state.planets.length,2);assert.equal(api.error,'');
});

test('chart routes use real mission endpoints and clock, and reverse a recall without changing gameplay data',()=>{
  const home={id:'home',coordinates:[1,2,4],position:[125,0,35]},target={id:'target',coordinates:[1,3,7],position:[460,0,190]};
  const n={level:'galaxy',bodies:new Map([['home',home],['1:2:4',home],['target',target],['1:3:7',target]]),systems:[{id:2,position:[120,0,30]},{id:3,position:[450,0,180]}]};
  const mission={id:'route',from:'home',target:'target',position:[1,3,7],task:'transport',phase:'outbound',start:0,end:100000,travel:100000};
  const before=structuredClone(mission),outbound=chartRoute(n,mission,50000);
  assert.deepEqual(outbound.from,n.systems[0].position);assert.deepEqual(outbound.to,n.systems[1].position);assert.equal(outbound.progress,.5);
  const recalled={...mission,phase:'return',start:50000,end:100000,recalledElapsed:50000};
  assert.equal(chartRoute(n,recalled,50000).progress,outbound.progress);
  assert.equal(chartRoute(n,recalled,100000).progress,0);assert.equal(chartRoute(n,recalled,75000).limit,.5);
  assert.deepEqual(routePoint({x:0,y:0},{x:100,y:0},{x:50,y:30},0),{x:0,y:0});
  assert.deepEqual(routePoint({x:0,y:0},{x:100,y:0},{x:50,y:30},1),{x:100,y:0});
  const inbound={...mission,from:null,target:null,fromPosition:[1,2,4],inbound:true,task:'attack'};
  assert.equal(chartRoute(n,inbound,50000).color,'#db8c8c');
  assert.deepEqual(chartRoute(n,{...mission,task:'explore',target:null,position:[1,2,16]},50000).to,[0,0,0]);
  assert.equal(chartRoute(n,{...mission,phase:'engaged'},50000),null);
  for(const level of ['system','planet']){
    const local=chartRoute({...n,level},mission,50000);
    assert.deepEqual(local.from,home.position);assert.deepEqual(local.to,target.position);
    assert.equal(local.bend,.12);assert.equal(local.progress,outbound.progress);
  }
  const moon={id:'moon',coordinates:home.coordinates,position:[126,0,35]};n.bodies.set(moon.id,moon);
  assert.deepEqual(chartRoute({...n,level:'system'},{...mission,target:moon.id,position:moon.coordinates},50000).to,moon.position);
  assert.deepEqual(mission,before);
});

test('fleet map selection keeps arrival separate from the owned departure and clears outgoing cargo on source changes',()=>{
  const home={id:'home',position:[1,2,4]},colony={id:'colony',position:[1,3,7]},moon={id:'moon',position:[1,3,7],moon:true};
  const api={state:{planets:[home,colony,moon]}};
  const draft={task:'transport',ships:{Small_Cargo:5},cargo:[10,20,30],position:[1,2,5],target:''};
  const before=structuredClone({api,draft});
  const arrival=fleetMapChoice(api,home,draft,'to',colony);
  assert.equal(arrival.departure,undefined);assert.equal(arrival.patch.target,'colony');assert.equal(arrival.patch.destinationSet,true);
  assert.equal(fleetMapChoice(api,home,draft,'to',moon).patch.target,'moon','moon id survives the shared coordinates');
  assert.ok(fleetMapChoice(api,home,draft,'from',{id:'foreign',position:[1,3,8]}).error);
  const departure=fleetMapChoice(api,home,draft,'from',colony);
  assert.equal(departure.departure,'colony');assert.deepEqual(departure.patch.ships,{});assert.deepEqual(departure.patch.cargo,[0,0,0]);
  assert.ok(fleetMapChoice(api,home,draft,'to',home).error);
  const empty={name:'未殖民星球',position:[1,5,3],unoccupied:true};
  assert.deepEqual(fleetMapChoice(api,home,{...draft,task:'colonize'},'to',empty).patch.position,empty.position);
  assert.ok(fleetMapChoice(api,home,{...draft,task:'mine'},'to',colony).error);
  assert.deepEqual(fleetMapChoice(api,home,{...draft,task:'explore'},'to',{kind:'core',zone:'inner'}).patch.position,[1,2,16]);
  assert.equal(new Set(Object.values(fleetColors)).size,Object.keys(fleetColors).length);
  assert.deepEqual({api,draft},before);
});

test('stellar extractors meet their actual star surface and stay selectable across model, silhouette and marker views',()=>{
 // Real renderer objects, with no WebGL context, server, save or asset loading.
 // These are broad viewing scales, not exact pixel-threshold specifications.
 for(const id of [5,2,3,37]){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1.5,1,1e14),origin=[1200000,1500,-2300000],radius=starRadius(id),errors=[];
  const key=`test-observer:1:${id}`,system={key,owner:'test-observer',ownerName:'测试_提取器观景',position:[1,id],host:`test-host-${id}`,structures:{extractor:{level:1}}};
  const state={playerId:'test-observer',systems:[{id,position:[...origin],radius}],planets:[],megastructures:{systems:[system],habitats:[]}};
  const unchanged=structuredClone(state),runtime=createMegastructures({scene,camera,onError:error=>errors.push(error)});
  let disposed=false;
  try{
   runtime.setState(state);
   const record=runtime.focus({system:[1,id],id:'extractor'});assert(record);
   runtime.focus({system:[1,id],id:'listener'}); // Clear selection for ordinary LODs.
   const view=(distance,dt=.1)=>{
    const target=new THREE.Vector3(...record.position).sub(new THREE.Vector3(...origin));
    camera.position.copy(target).add(new THREE.Vector3(0,distance*.3,distance));camera.lookAt(target);camera.updateMatrixWorld(true);
    runtime.update({time:1,origin,eye:camera.position.toArray().map((n,i)=>n+origin[i]),height:800,distance,dt});scene.updateMatrixWorld(true);
   };
   view(record.radius*3);
   assert(runtime.stats.detailed>0);assert(runtime.pickTargets.some(r=>r.id===record.id));
   const model=scene.getObjectByName(record.id);assert(model?.visible);
   const star=new THREE.Vector3(),outward=model.getWorldPosition(new THREE.Vector3()).sub(star).normalize();
   const inlet=new THREE.Vector3(-1,0,0).transformDirection(model.matrixWorld);
   assert(inlet.dot(outward)<-.999,'the inlet points toward the actual star, not an unrotated offset');
   let clearance=Infinity,vertices=0;
   model.traverse(object=>{
    if(!object.isMesh||!object.geometry?.attributes.position)return;
    for(let parent=object;parent&&parent!==model;parent=parent.parent)if(parent.userData.effect)return;
    const positions=object.geometry.attributes.position,point=new THREE.Vector3();
    for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld);clearance=Math.min(clearance,point.sub(star).dot(outward)-radius);vertices++;}
   });
   assert(vertices>0);assert(clearance>0,`system ${id} machinery must stay outside its photosphere`);
   const field=model.getObjectByName('stellar-extraction-field'),hotspot=model.getObjectByName('stellar-surface-hotspot'),flow=model.getObjectByName('stellar-matter-inflow');
   assert(field&&hotspot&&flow?.isLineSegments2&&flow.material.isLineMaterial,'extraction uses a surface contact and visible-width open flowing filaments');
   const fieldCenter=field.localToWorld(new THREE.Vector3(-field.userData.starDistance,0,0));
   assert(fieldCenter.distanceTo(star)<radius*.001,'the field and rendered star share a center');
   const contact=new THREE.Vector3().fromBufferAttribute(hotspot.geometry.attributes.position,0).applyMatrix4(hotspot.matrixWorld);
   assert(Math.abs(contact.distanceTo(star)-radius)<radius*.01,'contact geometry follows the real stellar radius');
   const flowVertices=()=>{
    const {instanceStart:start,instanceEnd:end}=flow.geometry.attributes;
    return Array.from({length:flow.geometry.instanceCount},(_,i)=>[start.getX(i),start.getY(i),start.getZ(i),end.getX(i),end.getY(i),end.getZ(i)]).flat();
   };
   const flowBefore=flowVertices();assert(flowBefore.length>0&&flowBefore.every(Number.isFinite));view(record.radius*3,.5);
   const flowAfter=flowVertices();assert(flowAfter.every(Number.isFinite));assert.notDeepEqual(flowAfter,flowBefore,'matter moves instead of remaining a fixed luminous tube');
   view(record.radius*60);assert.equal(runtime.stats.detailed,0);assert(runtime.pickTargets.some(r=>r.id===record.id));assert(scene.getObjectByName(record.id)?.visible);
   view(record.radius*4000);assert(runtime.stats.markers>0);assert(runtime.pickTargets.some(r=>r.key===key&&(r.cluster||r.id===record.id)));assert.equal(runtime.stats.detailed,0);
   runtime.focus({system:[1,id],id:'extractor'});view(record.radius*1e7);
   assert(runtime.pickTargets.some(r=>r.id===record.id));assert(runtime.stats.markers>0);assert.equal(runtime.stats.detailed,0,'selection at galaxy distance must not force the detailed factory');
   assert.deepEqual(state,unchanged);assert.deepEqual(errors,[]);
   const markerGeometry=scene.getObjectByName('megastructure-distant-markers').geometry;let released=false;markerGeometry.addEventListener('dispose',()=>{released=true;});
   runtime.dispose();disposed=true;assert(released);assert.equal(scene.getObjectByName('stellar-megastructures'),undefined);assert.equal(runtime.stats.cached,0);
  }finally{if(!disposed)runtime.dispose();}
 }
});

test('asteroid collectors remain visible and tracked off the belt centre, with phased construction and continuous LOD motion',()=>{
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(55,1.5,1,1e14),origin=[1200000,1500,-2300000];
 const system={key:'test-miner:1:5',owner:'test-miner',position:[1,5],host:'test-miner-home',structures:{industry:{level:1}}};
 const state={playerId:'test-miner',systems:[{id:5,position:origin,radius:900}],planets:[],megastructures:{systems:[system],habitats:[]}},before=structuredClone(state);
 const runtime=createMegastructures({scene,camera});
 try{
  runtime.setState(state);const record=runtime.focus({system:[1,5],id:'industry'});
  assert.deepEqual(record.position,state.systems[0].position,'the complete belt is centred on its star, not the old platform offset');
  const view=(distance,dt,renderOrigin=origin)=>{
   const target=new THREE.Vector3(...runtime.followPosition(record.id)).sub(new THREE.Vector3(...renderOrigin));
   camera.position.copy(target).add(new THREE.Vector3(.37,.53,.76).multiplyScalar(distance));camera.lookAt(target);camera.updateMatrixWorld(true);
   runtime.update({time:1,origin:renderOrigin,eye:camera.position.toArray().map((v,i)=>v+renderOrigin[i]),height:800,distance,dt});scene.updateMatrixWorld(true);
  };
  view(record.focusRadius*3,.1);
  assert.equal(runtime.stats.detailed,1);assert(scene.getObjectByName(record.id)?.visible);
  const collector=scene.getObjectByName('leviathan-collector');assert(collector);
  const actual=collector.localToWorld(new THREE.Vector3(0,0,3)).add(new THREE.Vector3(...origin));
  assert(actual.distanceTo(new THREE.Vector3(...runtime.followPosition(record.id)))<1e-6,'camera follows the actual moving collector');
  const centre=collector.getWorldPosition(new THREE.Vector3());
  assert(Math.abs(Math.hypot(centre.x,centre.z)-OUTER_ASTEROID_BELT.radius*100)<1e-6,'the miner patrols the existing outer asteroid belt');
  const matrix=new THREE.Matrix4(),point=new THREE.Vector3();let rocks=0;
  scene.traverse(object=>{
   if(!object.name.startsWith('sparse-asteroids-'))return;
   for(let i=0;i<object.count;i++){
    object.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix).applyMatrix4(object.matrixWorld);
    assert(Math.abs(Math.hypot(point.x,point.z)-OUTER_ASTEROID_BELT.radius*100)<=OUTER_ASTEROID_BELT.halfWidth*100,'detailed rocks share the scenery belt radius');rocks++;
   }
  });assert.equal(rocks,576);
  const rebased=runtime.followPosition(record.id);view(record.focusRadius*3,0,rebased);
  assert(collector.localToWorld(new THREE.Vector3(0,0,3)).length()<1e-6,'floating-origin camera movement cannot displace the collector');
  assert.deepEqual(runtime.followPosition(record.id),rebased);
  const start=runtime.followPosition(record.id);view(record.focusRadius*3,1);assert.notDeepEqual(runtime.followPosition(record.id),start);
  const position=runtime.followPosition(record.id);view(record.focusRadius*80,0);assert.equal(runtime.stats.detailed,0);assert.deepEqual(runtime.followPosition(record.id),position);
  const distant=scene.getObjectByName('asteroid-industry-distant'),farCollector=distant.getObjectByName('leviathan-collector');
  assert(farCollector.localToWorld(new THREE.Vector3(0,0,3)).add(new THREE.Vector3(...origin)).distanceTo(new THREE.Vector3(...position))<1e-6,'LOD keeps the same world-space orbit');
  distant.traverse(object=>{if(!object.isPoints)return;const points=object.geometry.attributes.position;for(let i=0;i<points.count;i++){point.fromBufferAttribute(points,i).applyMatrix4(object.matrixWorld);assert(Math.abs(Math.hypot(point.x,point.z)-OUTER_ASTEROID_BELT.radius*100)<=OUTER_ASTEROID_BELT.halfWidth*100+.01);}});
  view(record.focusRadius*3,0);assert.equal(runtime.stats.detailed,1);assert.deepEqual(runtime.followPosition(record.id),position);
  const factory=scene.getObjectByName('asteroid_belt');assert(factory);
  // Construction uses actual assemblies, not a flattened finished model.
  const queued=structuredClone(state);queued.megastructures.systems[0].structures.industry={level:0,queue:{start:Date.now(),end:Date.now()+600000}};runtime.setState(queued);view(record.focusRadius*3,0);
  assert(scene.getObjectByName('megastructure-blueprint'));assert.equal(scene.getObjectByName('asteroid_belt').scale.y,1);assert.equal(scene.getObjectByName('collector-flow').visible,false);
  assert.deepEqual(state,before);
 }finally{runtime.dispose();}
 assert.equal(scene.getObjectByName('stellar-megastructures'),undefined);
});
