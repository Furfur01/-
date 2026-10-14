import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const runtime=readFileSync(new URL('../opendesign/mockups/planet-construction-review/aurora-runtime.js',import.meta.url),'utf8');
const math=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('// Every vertex'));
const districts=runtime.slice(runtime.indexOf('const districtSpecs='),runtime.indexOf('/*__AURORA_TERRAIN__*/'));
const camera=runtime.slice(runtime.indexOf('let W='),runtime.indexOf('const stateNames='));
const functions=runtime.slice(runtime.indexOf('function updateCamera('),runtime.indexOf('function coords('));
function fixture(width=1440){
 const node={classList:{toggle(){},remove(){},add(){}},style:{},textContent:''};
 const ctx=vm.createContext({innerWidth:width,innerHeight:900,document:{body:node},node});
 vm.runInContext(`${math}\n${districts}\n${camera}\n
 const $=()=>node;function gameNotifySelection(){}function updatePanel(){}function updateJumpState(){}
 const auroraBiome='mercury',auroraBiomeEffects={volcanoes:[{n:[0,.95,.3122498999]}]};
 const buildings=districts.map(d=>{const b={id:d.id,type:d.type,d,n:d.n,pos:mul(d.n,R+PAD)};d.buildings=[b];return b;});
 ${functions}
 globalThis.api={buildings,focusBuilding,focusDistrict,focusElevator,focusEnvironment,overview,
 set(p){Object.assign(camera,p);Object.assign(targetCamera,p);updateCamera(0)},
 target(p){Object.assign(targetCamera,p)},tick:updateCamera,
 get pose(){return {camera:{...camera},eye:[...eye],right:[...camRight],up:[...camUp],forward:[...camForward],vp:[...VP]}}};`,ctx);
 return ctx.api;
}
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const norm=a=>Math.hypot(...a);
function basis(p){
 assert([...p.eye,...p.right,...p.up,...p.forward,...p.vp].every(Number.isFinite),'finite camera matrix');
 for(const axis of [p.right,p.up,p.forward])assert(Math.abs(norm(axis)-1)<1e-9,'normalized camera axis');
 assert(Math.abs(dot(p.right,p.up))<1e-9);
 assert(Math.abs(dot(p.right,p.forward))<1e-9);
 assert(Math.abs(dot(p.up,p.forward))<1e-9);
 assert(norm(p.eye)>19,'camera remains outside the planet');
 const east=[Math.cos(p.camera.yaw),0,-Math.sin(p.camera.yaw)];
 assert(dot(p.right,east)>.88,'screen east must not reverse at a world-up singularity');
}
function advance(api,frames=180){
 let previous=api.pose;
 for(let i=0;i<frames;i++){
  api.tick(1/60);const next=api.pose;basis(next);
  for(const axis of ['right','up','forward'])assert(dot(previous[axis],next[axis])>.89,`${axis} has no abrupt reversal in frame ${i}`);
  previous=next;
 }
 return previous;
}

test('southern building closeups retain east/right while zooming through the old world-up singularity',()=>{
 const api=fixture();
 for(const building of api.buildings.filter(b=>b.n[1]<-.6&&b.type!=='spaceport')){
  api.set({yaw:Math.atan2(building.n[0],building.n[2]),pitch:Math.asin(building.n[1]),dist:61,elevation:0});
  const initial=api.pose.right;api.focusBuilding(building);
  const close=advance(api);
  assert(dot(initial,close.right)>.99,`no 180° inversion at ${building.id}`);
  assert(dot(building.n,close.up)>.35,'surface structures point toward the top of the image');
 }
});

test('all 14 building-to-building routes keep a continuous orthonormal camera outside the planet',()=>{
 const api=fixture();
 for(const start of api.buildings)for(const finish of api.buildings){
  api.set({yaw:Math.atan2(start.n[0],start.n[2]),pitch:Math.asin(start.n[1]),dist:30,elevation:0});
  api.focusBuilding(finish);advance(api,130);
 }
});

test('ground, full elevator and orbital dock views never exchange camera sides or cross their look target',()=>{
 const api=fixture(),elevator=api.buildings.find(b=>b.type==='spaceport');
 api.set({yaw:Math.atan2(elevator.n[0],elevator.n[2]),pitch:Math.asin(elevator.n[1]),dist:30,elevation:0});
 for(const mode of ['full','station','ground','station','full']){
  api.focusElevator(mode);advance(api);
  const pose=api.pose;
  assert(dot(pose.up,elevator.n)>.3,'terminal and station retain the same local vertical');
 }
 api.target({dist:19});const close=advance(api);
 assert(dot(close.eye,elevator.n)>16.36+close.camera.elevation+4.4,'zoom cannot move the camera through the elevated look target');
 api.focusBuilding(api.buildings.at(-1));advance(api);
 api.focusEnvironment();advance(api);
 api.overview();advance(api);
});

test('exact poles, mobile closeups, longitude seams and extreme zoom retain a valid frame',()=>{
 for(const width of [390,1440]){
  const api=fixture(width);
  for(const pitch of [-Math.PI/2,-1.53,0,1.53,Math.PI/2])for(const elevation of [0,.5,1,2,8,15.12])for(const dist of [19,30,41,61,109]){
   api.set({yaw:3.13,pitch,dist,elevation});basis(api.pose);
   api.target({yaw:-3.13});advance(api,3);
  }
  for(const building of api.buildings){api.focusBuilding(building);advance(api,120);}
 }
});
