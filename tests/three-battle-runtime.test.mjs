import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeFleetAssets} from '../scripts/three-flight/assets.js';
import {createLifetime} from '../scripts/three-flight/lifecycle.js';
import {consumeBattleEvents,replayEventCursor} from '../scripts/three-flight/timeline.js';
import {createFlightController} from '../scripts/three-flight/controller.js';

test('fleet merge preserves native model offsets and appends missing hulls with matching layouts', () => {
  const first={id:'a',offset:0,floatCount:13},layout={id:'a',main:[[1,2,3]]};
  const data={ships:[first],layouts:[layout],profiles:[{}, {}, {visual:{radius:1}}]};
  const second={id:'b',name:'B',full:{offset:13,floatCount:26},layout:{id:'b',main:[[8,9,10]]},stats:[1,2,3],length:7,profile:{role:'line',speed:3,turn:.2}};
  const vertices=new Float32Array(13).fill(1),extraVertices=new Float32Array(39).fill(2);
  extraVertices[13]=9;extraVertices[38]=10;
  const {fleet,assets}=mergeFleetAssets(data,vertices,{ships:[{...second,id:'a'},second]},extraVertices);
  assert.deepEqual(fleet.ships.map(s=>s.id),['a','b']);
  assert.equal(fleet.ships[0].offset,0);
  assert.equal(fleet.ships[1].offset,13);
  assert.deepEqual([...fleet.vertices.slice(13)],[...extraVertices.slice(13)]);
  assert.deepEqual(fleet.layouts[1].main,[[8,9,10]]);
  assert.equal(fleet.profiles.at(-1).relativeLength,7);
  assert.equal(data.ships.length,1,'isolated version must not mutate the input model list');
  assert.equal(assets.vertices,extraVertices);
});

test('scene disposal aborts event listeners and cancels every pending timer and animation', () => {
  let id=0,calls=0;
  const timers=new Map(),frames=new Map();
  const host={setTimeout(fn){timers.set(++id,fn);return id;},clearTimeout(id){timers.delete(id);},requestAnimationFrame(fn){frames.set(++id,fn);return id;},cancelAnimationFrame(id){frames.delete(id);}};
  const lifetime=createLifetime(host),target=new EventTarget();
  lifetime.listen(target,'click',()=>calls++);
  lifetime.later(()=>calls++,20);lifetime.scheduleFrame(()=>calls++);
  target.dispatchEvent(new Event('click'));assert.equal(calls,1);
  lifetime.dispose();lifetime.dispose();
  target.dispatchEvent(new Event('click'));
  assert.equal(calls,1);assert.equal(timers.size,0);assert.equal(frames.size,0);
  assert.equal(lifetime.signal.aborted,true);
  assert.equal(lifetime.scheduleFrame(()=>calls++),null);
});

test('overlapping SSE snapshots do not emit events twice, and seeking skips old fire events', () => {
  const emitted=[];
  let cursor=consumeBattleEvents([{seq:1},{seq:2},{seq:2}],0,e=>emitted.push(e.seq));
  cursor=consumeBattleEvents([{seq:1},{seq:2},{seq:3}],cursor,e=>emitted.push(e.seq));
  assert.deepEqual(emitted,[1,2,3]);assert.equal(cursor,3);
  const events=[{tick:10},{tick:20},{tick:20},{tick:30}];
  assert.equal(replayEventCursor(events,20),3);
  assert.equal(replayEventCursor(events,5),0);
  assert.equal(replayEventCursor(events,100),4);
});

function controllerFixture(search='?battle=test') {
  const originalLocation=globalThis.location;
  globalThis.location={search};
  const state={flight:{targets:[],particles:[],profile:{}}};
  const V={sub:(a,b)=>a.map((v,i)=>v-b[i]),length:a=>Math.hypot(...a)};
  const shipMatrix=({pos})=>{const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;m.set(pos,12);return m;};
  const context={state,renderer:{},SHIPS:[{id:'a'}],COMBAT:[{}],LAYOUTS:[{joints:[]}],keys:new Set(),$:()=>null,M:{},V,clamp:(v,min,max)=>Math.max(min,Math.min(max,v)),mix:(a,b,f)=>a+(b-a)*f,shortAngle:a=>a,shipMatrix};
  const controller=createFlightController(context);
  globalThis.location=originalLocation;
  return {controller,state};
}

test('map hull, turrets and effects share the camera sample time throughout a frame',()=>{
 const {controller:c}=controllerFixture();
 c.previous=[[0,0,0,0,.1,.2,100,100,-1,110,0,0,.3,.4,.5]];
 c.rows=[[0,22,6,-4,.9,.8,100,100,-1,110,0,0,1.3,1.4,1.5]];
 c.received=performance.now()-500;c.sampleTime=c.received+100;
 const first=c.row(0);assert.deepEqual(first.slice(1,4),[11,3,-2]);
 assert.equal(first[12],.8);assert.equal(first[14],1);
 c.sampleTime+=50;assert.deepEqual(c.row(0).slice(1,4),[16.5,4.5,-3]);
 c.replay=true;c.replayAlpha=.25;assert.deepEqual(c.row(0).slice(1,4),[5.5,1.5,-1]);
 c.dispose();
});

test('replay controller rejects writes and never claims or releases control', async () => {
  const {controller}=controllerFixture('?replay=record');
  await assert.rejects(controller.request('/api/battles/test/control',{type:'claim'}),/回放只读/);
  controller.controlled=4;
  await controller.setAI(false);await controller.setAI(true);await controller.sendInput();
  controller.dispose();assert.equal(controller.controlled,null);
});

test('release stops input immediately and waits for an in-flight input before releasing authority', async () => {
  const {controller}=controllerFixture(),originalDocument=globalThis.document;
  globalThis.document={hidden:false};
  const requests=[];let finishInput;
  controller.controlled=8;controller.owner='owner';controller.pilotIntent=()=>({throttle:1});controller.syncHeader=()=>{};
  controller.request=async(_url,body)=>{
    requests.push(body.type);
    if(body.type==='input')await new Promise(resolve=>{finishInput=resolve;});
    return {};
  };
  try{
    const input=controller.sendInput(),release=controller.setAI(true);
    assert.equal(controller.controlled,null,'no more input may be queued while release is awaiting acknowledgement');
    await controller.sendInput();assert.deepEqual(requests,['input']);
    controller.receive({ships:[],tick:1,controls:{owner:{shipId:8,seq:1}},events:[]});
    assert.equal(controller.controlled,null,'an old SSE snapshot cannot restore control during release');
    finishInput();await Promise.all([input,release]);
    assert.deepEqual(requests,['input','release']);
    assert.equal(controller.inputLatency,undefined,'obsolete input response cannot change the next control generation');
  }finally{controller.dispose();globalThis.document=originalDocument;}
});

test('fleet instance slots keep authoritative ship IDs across deaths and reinforcements', () => {
  const {controller}=controllerFixture();
  controller.metadata=Array.from({length:3},(_,id)=>({id,type:'a',side:'attacker',owner:'owner',formation:'f',profile:{length:1}}));
  controller.rows=controller.metadata.map(({id})=>[id,id*10,0,0,0,0,100,0,-1,0]);
  controller.previous=controller.rows;controller.replay={};controller.replayAlpha=1;controller.indices=new Map([['a',0]]);controller.owner='owner';controller.fullDetail=false;
  controller.drawLabels=()=>{};controller.buildGroups();
  const draws=[];
  const renderer={height:1080,fov:1,eye:[0,0,10000],shipMeshes:[{count:3}],project:()=>({visible:true}),drawFleetInstances:(key,index,matrices,ids,options)=>draws.push({ids:[...ids],matrices:[...matrices.slice(0,ids.length*16)]})};
  controller.drawFleet(renderer);assert.deepEqual(draws.at(-1).ids,[0,1,2]);
  controller.rows[1][6]=0;draws.length=0;controller.drawFleet(renderer);
  assert.deepEqual(draws.at(-1).ids,[0,2]);assert.equal(draws.at(-1).matrices[16+12],20);
  controller.metadata.push({...controller.metadata[0],id:3});controller.rows.push([3,30,0,0,0,0,100,0,-1,0]);
  controller.buildGroups();draws.length=0;controller.drawFleet(renderer);
  assert.deepEqual(draws.at(-1).ids,[0,2,3]);assert.equal(controller.renderedIds.size,3);
  controller.dispose();
});

test('passive battle viewers never adopt another page control and stale snapshots cannot rewind sequence',async()=>{
 const {controller}=controllerFixture();controller.owner='owner';controller.selected=8;controller.syncHeader=()=>{};
 let sent=0;controller.request=async()=>{sent++;return {};};
 controller.receive({tick:10,ships:[],controls:{owner:{shipId:8,seq:30,clientId:'another-tab'}},events:[]});
 assert.equal(controller.controlled,null);await controller.sendInput();assert.equal(sent,0);
 controller.clientId='my-tab';controller.controlRequested=true;
 controller.receive({tick:12,ships:[],controls:{owner:{shipId:8,seq:40,clientId:'my-tab'}},events:[]});
 assert.equal(controller.controlled,8);assert.equal(controller.seq,40);
 controller.receive({tick:11,ships:[],controls:{},events:[]});assert.equal(controller.controlled,8);
 controller.receive({tick:13,ships:[],controls:{owner:{shipId:8,seq:41,clientId:'another-tab'}},events:[]});assert.equal(controller.controlled,null);
 controller.dispose();
});
