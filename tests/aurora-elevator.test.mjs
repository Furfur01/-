import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const folder = new URL('../opendesign/mockups/planet-construction-review/', import.meta.url);
const original = fs.readFileSync(new URL('reference/aurora-original.html', folder), 'utf8');
const elevator = fs.readFileSync(new URL('aurora-elevator.js', folder), 'utf8');
const math = original.slice(original.indexOf('const PI='), original.indexOf('const districtSpecs='));
const models = original.slice(original.indexOf('function platform('), original.indexOf('function model('));

function fixture(state = 'active') {
 const ctx = vm.createContext({ state });
 vm.runInContext(`${math}\n${models}\n
 const gl={LINES:1};let uploads=0;let draws=[];
 function upload(a,mode=4){uploads++;return {source:a,count:a.length/STRIDE,mode};}
 function draw(geo,m=ident(),opacity=1,state=0,clip=1e5){draws.push({geo,m,opacity,state,clip});}
 ${elevator}
 const up=norm([.4,-.62,.71]);
 const b={state,progress:.56,scale:2.7,m:mm(frame(up,mul(up,16.4)),trs([0,0,0],[0,0,0],[2.7,2.7,2.7]))};
 const e=createSpaceElevator(b);
 globalThis.api={e,b,drawSpaceElevator,updateSpaceElevator,createSpaceElevator,elevatorTerminalModel,shipyardLogisticsModel,elevatorBounds,pt,up,
 get uploads(){return uploads},get draws(){return draws},clear(){draws=[]}};
 `, ctx);
 return ctx.api;
}

function near(a,b,epsilon=1e-8){assert(Math.abs(a-b)<epsilon, `${a} ≉ ${b}`);}

test('ground terminal and shipment depot retain the miniature palette, scale and finite geometry', () => {
 const api=fixture();
 for(const make of [api.elevatorTerminalModel,api.shipyardLogisticsModel]){
  const source=make(),bounds=api.elevatorBounds(source);
  assert(source.length>10000, 'recognizable layered industrial detail');
  assert(source.every(Number.isFinite));
  assert.equal(source.length%33,0);
  assert(bounds.min[1]>=0);
  assert(bounds.max[1]<1.8);
  assert(bounds.max[0]-bounds.min[0]<1.9);
 }
});

test('orbital dock is a broad open framework fixed above its twin ground rails', () => {
 const {e}=fixture();
 assert(e.stationBounds.min[1]>4.7);
 assert(e.stationBounds.max[0]-e.stationBounds.min[0]>4.0);
 assert(e.stationBounds.max[2]-e.stationBounds.min[2]>3.0);
 assert(e.stationBounds.max[1]-e.stationBounds.min[1]>1.8);
 assert(e.source.every(Number.isFinite));
 assert(e.source.length/11>7000);
 assert.equal(e.cableEndpoints.length,2);
 for(const c of e.cableEndpoints){
  near(c.bottom[1],1.37);near(c.top[1],4.84);
  near(c.bottom[0],c.top[0]);near(c.bottom[2],c.top[2]);
 }
 // The central bay must remain visibly open; solid station triangles must not
 // fill the ship volume between the two spines or cover the forward aperture.
 for(let i=0;i<e.source.length;i+=33){
  const x=(e.source[i]+e.source[i+11]+e.source[i+22])/3;
  const y=(e.source[i+1]+e.source[i+12]+e.source[i+23])/3;
  const z=(e.source[i+2]+e.source[i+13]+e.source[i+24])/3;
  assert(!(Math.abs(x)<.50&&y>5.43&&y<6.15&&z>-.9&&z<.9), 'ship volume is unobstructed');
 }
});

test('cables, station and cabins share the same spherical building frame', () => {
 const api=fixture(),{e,up}=api;
 for(const c of e.cables){
  const d=c.top.map((v,i)=>v-c.bottom[i]),length=Math.hypot(...d);
  near(length,(e.upperHeight-e.lowerHeight)*2.7);
  for(let j=0;j<3;j++)near(d[j]/length,up[j]);
 }
 const expected=api.pt(api.b.m,e.stationCenter);
 expected.forEach((x,j)=>near(x,e.stationCenterWorld[j]));
});

test('two shadow/color passes advance one clock and never allocate GPU resources', () => {
 const api=fixture(),count=api.uploads;
 assert.equal(api.createSpaceElevator(api.b),api.e,'per-building cache is reused');
 api.drawSpaceElevator(api.e,0,true);api.drawSpaceElevator(api.e,0,false);
 api.drawSpaceElevator(api.e,3,true);api.drawSpaceElevator(api.e,3,false);
 near(api.e.clock,3);
 for(let t=4;t<40;t++){
  api.drawSpaceElevator(api.e,t,true);api.drawSpaceElevator(api.e,t,false);
  assert(api.draws.every(d=>d.m.every(Number.isFinite)));
  api.clear();
 }
 assert.equal(api.uploads,count);
});

test('pause/full freeze in place, low power slows continuously and upgrade keeps service running', () => {
 const api=fixture(),{e,b}=api;
 api.updateSpaceElevator(e,0);api.updateSpaceElevator(e,10);near(e.clock,10);
 const paused=JSON.stringify(e.snapshot().cabins);
 b.state='paused';api.updateSpaceElevator(e,12);near(e.clock,10);
 const position=JSON.stringify(e.actors.map(a=>a.position));
 api.updateSpaceElevator(e,17);near(e.clock,10);
 assert.equal(JSON.stringify(e.actors.map(a=>a.position)),position);
 assert(e.arms.every(a=>!a.welding));
 b.state='full';api.updateSpaceElevator(e,20);near(e.clock,10);
 b.state='lowpower';api.updateSpaceElevator(e,30);near(e.clock,13.5);
 b.state='upgrade';api.updateSpaceElevator(e,40);near(e.clock,20.5);
 b.state='active';api.updateSpaceElevator(e,42);near(e.clock,22.5);
 api.updateSpaceElevator(e,42);near(e.clock,22.5);
 assert.notEqual(JSON.stringify(e.snapshot().cabins),paused);
});

test('lift cabins complete opposite, continuous rail-bound journeys with visible cargo', () => {
 const api=fixture(),{e}=api,phases=new Set(),cargo=new Set(),previous=[null,null];
 api.updateSpaceElevator(e,0);
 for(let t=0;t<=44;t+=.05){
  api.updateSpaceElevator(e,t);
  for(let i=0;i<2;i++){
   const a=e.actors[i];near(a.position[0],a.lane);near(a.position[2],0);
   assert(a.position[1]-.245>e.lowerHeight);
   assert(a.position[1]+.245<e.upperHeight);
   if(previous[i]!==null)assert(Math.abs(a.position[1]-previous[i])<.04,'no cabin teleport');
   previous[i]=a.position[1];phases.add(a.phase);cargo.add(a.cargo);
  }
 }
 for(const phase of ['地面装载','上行运料','轨道卸料','下行返回'])assert(phases.has(phase));
 assert.deepEqual([...cargo].sort(),[0,1]);
});

test('ship assembly and welding remain inside the orbiting bay', () => {
 const api=fixture(),{e}=api;
 api.updateSpaceElevator(e,0);const initial=e.buildProgress;
 api.updateSpaceElevator(e,35);assert(e.buildProgress>initial);
 for(const mesh of [e.keel,...e.panels]){
  const bounds=api.elevatorBounds(mesh.source);
  assert(bounds.min[1]>5.4);
  assert(bounds.max[1]<6.2);
  assert(bounds.min[0]>-.6&&bounds.max[0]<.6);
 }
 for(const a of e.arms){
  assert(a.tip[1]>5.7&&a.tip[1]<6.0);
  assert(Math.abs(a.tip[0])<=.30&&Math.abs(a.tip[2])<1.2);
  assert(e.buildProgress>(a.panelIndex+.65)/6,'weld only on fitted panels');
 }
 api.updateSpaceElevator(e,200);near(e.buildProgress,.94);
 assert.equal(e.phase,'总装检查');
});

test('unbuilt and construction states never show active lifts or a ship under construction', () => {
 const api=fixture('unbuilt'),{e,b}=api;
 api.drawSpaceElevator(e,0,true);assert.equal(api.draws.length,0);
 api.drawSpaceElevator(e,1,false);assert.equal(api.draws.length,1);assert.equal(api.draws[0].geo,e.wire);
 api.clear();b.state='construction';api.drawSpaceElevator(e,4,false);
 assert.equal(api.draws.length,2);
 assert.equal(api.draws[0].geo,e.geo);
 assert(api.draws[0].clip<e.bounds.max[1]);
 assert.equal(e.clock,0);
});
