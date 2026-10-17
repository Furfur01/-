import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,act,advance,snapshot,migrateWorld,costAt} from '../game/engine.mjs';
import {buildings} from '../game/catalog.mjs';
import {templatePreview,templateItems,planOf,PLAN_LIMIT} from '../game/construction-plans.mjs';
const T=1800000000000;
function fixture(){
  const world=createWorld(T),player=createPlayer(world,'王庭验收',T,()=>.5),p=world.planets[player.home];
  world.players={[player.id]:player};world.planets={[p.id]:p};
  p.resources=[1e8,1e8,1e8];p.fields=1000;
  return {world,player,p};
}
const edit=(f,payload)=>act(f.world,f.player,{type:'plan',planet:f.p.id,revision:planOf(f.p).revision,...payload},f.world.at);
const status=f=>snapshot(f.world,f.player).planets.find(p=>p.id===f.p.id).planStatus;
const applyIncrement=(f,mode='append',template='resource')=>{
  const request={planets:[f.p.id],template,mode,growth:'incremental'},previews=templatePreview(f.world,f.player,request);
  act(f.world,f.player,{type:'applyTemplate',...request,revisions:Object.fromEntries(previews.map(p=>[p.planet,p.revision])),bases:Object.fromEntries(previews.map(p=>[p.planet,p.basis]))},f.world.at);
  return previews[0];
};
test('a target advances sequentially offline, charges only started levels, and survives reload',()=>{
  const f=fixture(),before=[...f.p.resources];edit(f,{mode:'add',id:'Metal_Mine',level:3});
  assert.equal(f.p.buildQueue.level,1);
  assert.deepEqual(f.p.resources,before.map((v,i)=>v-costAt(buildings.Metal_Mine,1)[i]));
  const loaded=migrateWorld(JSON.parse(JSON.stringify(f.world))),p=loaded.planets[f.p.id];
  advance(loaded,T+86400000);assert.equal(p.buildings.Metal_Mine,3);assert.equal(p.buildQueue,null);assert.equal(p.constructionPlan.items.length,0);
  const sum=[1,2,3].reduce((s,n)=>s+costAt(buildings.Metal_Mine,n)[2],0);assert.equal(p.resources[2],before[2]-sum);
});
test('pause, reorder, remove, and target edits preserve paid construction',()=>{
  const f=fixture();edit(f,{mode:'pause',paused:true});edit(f,{mode:'add',id:'Metal_Mine',level:2});edit(f,{mode:'add',id:'Solar_Plant',level:3});
  assert.equal(f.p.buildQueue,null);edit(f,{mode:'move',index:1,direction:-1});edit(f,{mode:'level',index:0,level:2});
  edit(f,{mode:'remove',index:1});edit(f,{mode:'pause',paused:false});assert.equal(f.p.buildQueue.id,'Solar_Plant');
  const running=structuredClone(f.p.buildQueue);edit(f,{mode:'pause',paused:true});edit(f,{mode:'clear'});
  assert.deepEqual(f.p.buildQueue,running);advance(f.world,running.end+10000);assert.equal(f.p.buildings.Solar_Plant,1);assert.equal(f.p.buildQueue,null);
});
test('resource waiting wakes at affordability time even in a single offline advance',()=>{
  const f=fixture();f.p.resources=[0,0,0];edit(f,{mode:'add',id:'Metal_Mine',level:1});assert.equal(f.p.buildQueue,null);
  const s=status(f);assert.equal(s.state,'waiting');assert.ok(s.wake>T);
  advance(f.world,s.wake);assert.equal(f.p.buildQueue.start,s.wake);const end=f.p.buildQueue.end;
  advance(f.world,end);assert.equal(f.p.buildings.Metal_Mine,1);
  const other=fixture();other.p.resources=[0,0,0];edit(other,{mode:'add',id:'Metal_Mine',level:1});advance(other.world,end);
  assert.equal(other.p.buildings.Metal_Mine,1);assert.deepEqual(other.p.resources,f.p.resources);
});
test('missing imports and prerequisites produce explicit blockers without skipping',()=>{
  const f=fixture();f.p.biome='mercury';f.p.resources=[1000,1000,0];edit(f,{mode:'add',id:'Robotics_Facility',level:1});
  assert.match(status(f).reason,/需要补给/);assert.equal(status(f).wake,null);
  f.p.resources=[1e8,1e8,1e8];advance(f.world,T+1);assert.equal(f.p.buildQueue.id,'Robotics_Facility');
  const g=fixture();edit(g,{mode:'add',id:'Shipyard',level:1});assert.match(status(g).reason,/机器人工厂 2级/);assert.equal(g.p.buildQueue,null);
});
test('cancelling construction refunds it and pauses the plan so it cannot restart',()=>{
  const f=fixture(),balance=[...f.p.resources];edit(f,{mode:'add',id:'Metal_Mine',level:2});
  act(f.world,f.player,{type:'cancel',planet:f.p.id,kind:'build'},T);assert.deepEqual(f.p.resources,balance);
  assert.equal(f.p.constructionPlan.paused,true);advance(f.world,T+86400000);assert.equal(f.p.buildQueue,null);assert.equal(f.p.buildings.Metal_Mine,undefined);
});
test('batch previews are read-only, append is idempotent and specialized resources differ',()=>{
  const f=fixture(),gas={...structuredClone(f.p),id:'gas',biome:'gas',name:'气体星'};f.world.planets.gas=gas;
  const request={planets:[f.p.id,'gas'],template:'resource',mode:'append'},before=JSON.stringify(f.world);
  const preview=templatePreview(f.world,f.player,request);assert.equal(JSON.stringify(f.world),before);
  assert.equal(Math.max(...preview[1].items.filter(x=>x.id==='Gas_Mine').map(x=>x.level)),12);
  assert.equal(Math.max(...preview[1].items.filter(x=>x.id==='Metal_Mine').map(x=>x.level)),2);
  act(f.world,f.player,{type:'applyTemplate',...request,revisions:Object.fromEntries(preview.map(p=>[p.planet,p.revision]))},T);
  const again=templatePreview(f.world,f.player,request);assert.equal(again[0].added,0);assert.equal(again[1].added,0);
});
test('fresh terrestrial template starts basic production before gas-consuming infrastructure',()=>{
  const f=fixture();f.p.resources=[500,500,0];const items=templateItems(f.p,'resource');
  assert.ok(items.findIndex(x=>x.id==='Gas_Mine')<items.findIndex(x=>x.id==='Robotics_Facility'));
  const preview=templatePreview(f.world,f.player,{planets:[f.p.id],template:'resource',mode:'replace'});
  act(f.world,f.player,{type:'applyTemplate',planets:[f.p.id],template:'resource',mode:'replace',revisions:{[f.p.id]:preview[0].revision}},T);
  advance(f.world,T+86400000);assert.ok(f.p.buildings.Gas_Mine>0);
});

test('fresh specialized templates bootstrap the primary mine without imported gas',()=>{
  for(const biome of ['mercury','mars','gas']){
    const f=fixture();f.p.biome=biome;f.p.resources=[500,500,0];
    const request={planets:[f.p.id],template:'resource',mode:'replace'};
    act(f.world,f.player,{type:'applyTemplate',...request,revisions:{[f.p.id]:0}},T);
    advance(f.world,T+86400000);
    assert.ok(f.p.buildings[['Metal_Mine','Crystal_Mine','Gas_Mine'][['mercury','mars','gas'].indexOf(biome)]]>0,biome);
  }
});

test('legacy gas bootstrap migration preserves balance and pause state, then can start gas production',()=>{
  const f=fixture();f.p.biome='gas';f.p.buildings={Metal_Mine:1};f.p.resources=[440,485,0];
  f.p.constructionPlan={template:'resource',paused:true,revision:7,items:[{id:'Robotics_Facility',level:1},{id:'Crystal_Mine',level:1},{id:'Solar_Plant',level:1},{id:'Gas_Mine',level:1},{id:'Gas_Mine',level:2}]};
  const balance=[...f.p.resources];migrateWorld(f.world);
  assert.deepEqual(f.p.resources,balance);assert.equal(f.p.constructionPlan.paused,true);
  assert.equal(f.p.constructionPlan.revision,8);
  assert.deepEqual(f.p.constructionPlan.items.slice(0,2),[{id:'Solar_Plant',level:2},{id:'Gas_Mine',level:1}]);
  assert.ok(f.p.constructionPlan.items.some(x=>x.id==='Gas_Mine'&&x.level===2));
  const saved=JSON.stringify(f.world);migrateWorld(f.world);assert.equal(JSON.stringify(f.world),saved);
  edit(f,{mode:'pause',paused:false});advance(f.world,T+86400000);
  assert.ok(f.p.buildings.Gas_Mine>=1);assert.ok(f.p.resources[2]>0);
});
test('replacement preserves a running job and a paused plan',()=>{
  const f=fixture();edit(f,{mode:'add',id:'Metal_Mine',level:2});edit(f,{mode:'pause',paused:true});const q=structuredClone(f.p.buildQueue);
  const request={planets:[f.p.id],template:'research',mode:'replace'},preview=templatePreview(f.world,f.player,request);
  act(f.world,f.player,{type:'applyTemplate',...request,revisions:{[f.p.id]:preview[0].revision}},T);
  assert.deepEqual(f.p.buildQueue,q);assert.equal(f.p.constructionPlan.paused,true);
});
test('validation and ownership are enforced, including atomic batch rejection',()=>{
  const f=fixture();edit(f,{mode:'pause',paused:true});
  for(const payload of [{mode:'add',id:'__proto__',level:1},{mode:'add',id:'Metal_Storage',level:1},{mode:'add',id:'Metal_Mine',level:51},{mode:'add',id:'Metal_Mine',level:1.2},{mode:'move',index:0,direction:1}])assert.throws(()=>edit(f,payload));
  assert.throws(()=>act(f.world,f.player,{type:'plan',planet:f.p.id,revision:-1,mode:'clear'},T),/已更新/);
  const enemy={...structuredClone(f.p),id:'enemy',owner:'enemy'},moon={...structuredClone(f.p),id:'moon',moon:true};f.world.planets.enemy=enemy;f.world.planets.moon=moon;
  assert.throws(()=>act(f.world,f.player,{type:'plan',planet:'enemy',revision:0,mode:'clear'},T),/无法操作/);
  for(const planets of [[f.p.id,'enemy'],[f.p.id,'moon'],[f.p.id,f.p.id]])assert.throws(()=>templatePreview(f.world,f.player,{planets,template:'resource',mode:'append'}));
  const other={...structuredClone(f.p),id:'other'};f.world.planets.other=other;const before=JSON.stringify(f.p.constructionPlan);
  assert.throws(()=>act(f.world,f.player,{type:'applyTemplate',planets:[f.p.id,'other'],template:'resource',mode:'replace',revisions:{[f.p.id]:1,other:-1}},T),/重新预览/);
  assert.equal(JSON.stringify(f.p.constructionPlan),before);
  f.p.constructionPlan.items=Array.from({length:PLAN_LIMIT},()=>({id:'Metal_Mine',level:1}));assert.throws(()=>edit(f,{mode:'add',id:'Solar_Plant',level:1}),/最多/);
});
test('space limits stop a plan without paying, and old saves remain opt-in',()=>{
  const f=fixture(),before=structuredClone(f.p);advance(f.world,T);assert.equal(f.p.constructionPlan,undefined);assert.deepEqual(f.p,before);
  f.p.fields=1;const money=[...f.p.resources];edit(f,{mode:'add',id:'Metal_Mine',level:1});assert.match(status(f).reason,/建筑空间/);assert.deepEqual(f.p.resources,money);
});
test('manual construction can precede a paused plan without changing its goals',()=>{
  const f=fixture();edit(f,{mode:'pause',paused:true});edit(f,{mode:'add',id:'Solar_Plant',level:2});
  act(f.world,f.player,{type:'build',planet:f.p.id,id:'Metal_Mine'},T);advance(f.world,f.p.buildQueue.end);
  assert.equal(f.p.buildings.Metal_Mine,1);assert.equal(f.p.buildQueue,null);assert.equal(f.p.constructionPlan.items[0].id,'Solar_Plant');
});
test('all four templates finish on every planetary biome and mark only the home as court',()=>{
  for(const biome of ['terrestrial','mercury','mars','gas'])for(const template of ['resource','industry','research','frontier']){
    const f=fixture();f.p.biome=biome;
    const request={planets:[f.p.id],template,mode:'replace'},preview=templatePreview(f.world,f.player,request);
    act(f.world,f.player,{type:'applyTemplate',...request,revisions:{[f.p.id]:0}},T);
    advance(f.world,T+365*86400000);
    assert.equal(f.p.buildQueue,null,biome+' '+template);
    assert.equal(f.p.constructionPlan.items.length,0,biome+' '+template);
    for(const goal of preview[0].items)assert.ok(f.p.buildings[goal.id]>=goal.level);
    const other={...structuredClone(f.p),id:'colony'};f.world.planets.colony=other;
    const planets=snapshot(f.world,f.player).planets;
    assert.equal(planets.find(p=>p.id===f.p.id).imperialCourt,true);
    assert.equal(planets.find(p=>p.id==='colony').imperialCourt,false);
  }
});
test('incremental resource plans continue beyond finished goals, then stop and support another round',()=>{
  const f=fixture();Object.assign(f.p.buildings,{Metal_Mine:12,Crystal_Mine:12,Gas_Mine:12,Robotics_Facility:4,Solar_Plant:30});
  const preview=applyIncrement(f);
  for(const id of ['Metal_Mine','Crystal_Mine','Gas_Mine'])assert.equal(Math.max(...preview.items.filter(x=>x.id===id).map(x=>x.level)),17);
  advance(f.world,T+365*86400000);
  assert.equal(f.p.buildings.Metal_Mine,17);assert.equal(f.p.buildings.Robotics_Facility,6);assert.equal(f.p.buildQueue,null);assert.deepEqual(f.p.constructionPlan.items,[]);
  const again=applyIncrement(f);assert.equal(Math.max(...again.items.filter(x=>x.id==='Metal_Mine').map(x=>x.level)),22);
});
test('incremental append includes running and planned levels; replace excludes pending goals',()=>{
  const f=fixture();f.p.buildings.Metal_Mine=12;f.p.buildings.Solar_Plant=40;edit(f,{mode:'add',id:'Metal_Mine',level:20});edit(f,{mode:'pause',paused:true});
  assert.equal(f.p.buildQueue.level,13);
  const running=structuredClone(f.p.buildQueue),balance=[...f.p.resources];
  const max=(items,id)=>Math.max(...items.filter(x=>x.id===id).map(x=>x.level));
  assert.equal(max(templateItems(f.p,'resource','replace','incremental'),'Metal_Mine'),18);
  assert.equal(max(templateItems(f.p,'resource','append','incremental'),'Metal_Mine'),25);
  applyIncrement(f);assert.deepEqual(f.p.buildQueue,running);assert.deepEqual(f.p.resources,balance);assert.equal(f.p.constructionPlan.paused,true);
  assert.equal(max(f.p.constructionPlan.items,'Metal_Mine'),25);
});
test('incremental templates follow role and native resources and are read-only during preview',()=>{
  const f=fixture();f.p.biome='gas';Object.assign(f.p.buildings,{Metal_Mine:6,Crystal_Mine:6,Gas_Mine:12,Robotics_Facility:6,Shipyard:8,Research_Lab:8,Radar_Facility:3,Missile_Silo:2,Solar_Plant:30});
  const before=JSON.stringify(f.world);
  const goal=(role,id)=>Math.max(...templateItems(f.p,role,'append','incremental').filter(x=>x.id===id).map(x=>x.level));
  assert.equal(goal('resource','Gas_Mine'),17);assert.equal(goal('resource','Metal_Mine'),8);
  assert.equal(goal('industry','Shipyard'),13);assert.equal(goal('industry','Gas_Mine'),14);
  assert.equal(goal('research','Research_Lab'),13);assert.equal(goal('frontier','Radar_Facility'),8);
  assert.equal(JSON.stringify(f.world),before);
});
test('incremental apply rejects stale building bases atomically and invalid growth modes',()=>{
  const f=fixture();edit(f,{mode:'pause',paused:true});
  const request={planets:[f.p.id],template:'resource',mode:'append',growth:'incremental'},preview=templatePreview(f.world,f.player,request)[0];
  const action={type:'applyTemplate',...request,revisions:{[f.p.id]:preview.revision},bases:{[f.p.id]:preview.basis}};
  act(f.world,f.player,{type:'build',planet:f.p.id,id:'Metal_Mine'},T);
  assert.throws(()=>act(f.world,f.player,action,T),/重新预览增量计划/);assert.deepEqual(f.p.constructionPlan.items,[]);
  for(const growth of [null,'unknown',{},[]])assert.throws(()=>templatePreview(f.world,f.player,{...request,growth}),/计划类型无效/);
});
test('incremental planning respects safe grade bounds and explains impossible solar requirements',()=>{
  const f=fixture();Object.assign(f.p.buildings,{Metal_Mine:49,Crystal_Mine:49,Gas_Mine:49,Solar_Plant:50,Robotics_Facility:40});
  assert.throws(()=>templateItems(f.p,'resource','append','incremental'),/太阳能电站超过/);
  f.p.biome='mercury';const items=templateItems(f.p,'resource','append','incremental');
  assert.ok(items.every(x=>x.level<=50&&costAt(buildings[x.id],x.level).every(Number.isSafeInteger)));
  assert.equal(Math.max(...items.filter(x=>x.id==='Metal_Mine').map(x=>x.level)),50);
});
