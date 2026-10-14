import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {flightScenes,nearestHullPoint,addShieldHit,targetShieldCapacity} from '../game/flight-scenes.mjs';
import {gargantuaFragment} from '../scripts/gargantua-background.mjs';

test('five distinct scenes have stable URL IDs and names',()=>{
  assert.deepEqual(flightScenes.map(s=>s.kind),[0,1,2,3,4]);
  assert.equal(new Set(flightScenes.map(s=>s.id)).size,5);
  assert.ok(flightScenes.every(s=>s.name&&s.subtitle));
});

test('shield contacts use the struck mesh surface, not the center of its bounding sphere',()=>{
  const vertices=new Float32Array(52);vertices.set([100,0,0]);vertices.set([-2,1,3],13);vertices.set([2,1,3],26);vertices.set([0,2,0],39);
  assert.deepEqual(nearestHullPoint(vertices,{offset:13,floatCount:39},[2.1,1,3]),[2,1,3]);
});

test('shield hit history is bounded, preserves local contact, and switches color at low charge',()=>{
  const hits=[],point=[3,2,1];addShieldHit(hits,point,1,5,0);assert.equal(hits.length,0);
  for(let i=0;i<5;i++)addShieldHit(hits,point,i,i*10,20);
  assert.equal(hits.length,3);assert.equal(hits[0].time,2);assert.ok(hits.every(h=>h.weak&&h.power<=1));
  point[0]=99;assert.equal(hits[0].point[0],3);
  addShieldHit(hits,[1,0,0],6,2.5,100);assert.equal(hits.at(-1).weak,false);
});

test('ships without active shields cannot generate a shield hit',()=>{
  for(const charge of [0,-1,undefined,null,NaN]){const hits=[];addShieldHit(hits,[0,0,0],1,5,charge);assert.equal(hits.length,0);}
  assert.equal(targetShieldCapacity([100,0]),0);assert.equal(targetShieldCapacity([100,null]),0);
  assert.equal(targetShieldCapacity([300,100]),25);
});

test('live target damage stops shield effects after its shield is depleted, not after hull death',()=>{
  const source=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/hangar.js',import.meta.url),'utf8'),start=source.indexOf('  function damageTarget('),end=source.indexOf('function slewJoint(',start);
  let flashes=0;const target={hp:100,shield:1,maxShield:1,kind:0,pos:[0,0,0],scale:1};
  const c=vm.createContext({target,state:{flight:{turretMode:'auto',profile:{visual:{}}}},renderer:{weaponImpact(){},shieldImpact:()=>flashes++},M:{compose:()=>[]}});
  vm.runInContext(source.slice(start,end),c);
  vm.runInContext('damageTarget(target,.6,[0,0,0]);damageTarget(target,.6,[0,0,0]);damageTarget(target,.6,[0,0,0]);',c);
  assert.equal(flashes,2);assert.equal(target.shield,0);assert.ok(target.hp>98);
  vm.runInContext('damageTarget(target,.6,[0,0,0])',c);assert.equal(flashes,2);
});

test('Gargantua retains the supplied lensing and disk shader with the flight camera adapter',()=>{
  const original=fs.readFileSync(new URL('../models/reference/gargantua-user/gargantua.html',import.meta.url),'utf8');
  for(const [from,to] of [['  vec3 diskColor(','  void main(){'],['    for(int i=0;i<STEPS;i++){','    fragColor=vec4(col,1.);']]){
    const a=original.indexOf(from),b=original.indexOf(to,a);assert.ok(a>=0&&b>a);assert.ok(gargantuaFragment.includes(original.slice(a,b)));
  }
  assert.ok(gargantuaFragment.includes('uViewForward'));assert.ok(gargantuaFragment.includes('#define STEPS 126'));
});

test('flight loader requests scripts, metadata and geometry with the same build version',async()=>{
  const urls=[],source=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/flight-loader.js',import.meta.url),'utf8');
  const c=vm.createContext({URL,Float32Array,window:{},document:{currentScript:{src:'http://127.0.0.1/flight-loader.js?v=new-build'},createElement:()=>({}),body:{append:s=>{urls.push(s.src);s.onload();}}},fetch:async url=>{urls.push(url);return {ok:true,json:async()=>({ships:[]}),arrayBuffer:async()=>new ArrayBuffer(0)};}});
  await vm.runInContext(source,c);
  assert.deepEqual(urls,['flight-fleet.json?v=new-build','flight-fleet.bin?v=new-build','ship-renderer.js?v=new-build','flight-runtime.js?v=new-build']);
});

test('changing maps preserves combat state and invalid URL selections fall back safely',()=>{
  const source=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/hangar.js',import.meta.url),'utf8');
  const start=source.indexOf('  const FLIGHT_SCENES='),end=source.indexOf('  function testShield()',start);
  const state={flight:{shield:62,missileStock:8,targets:[{hp:34}],pos:[1,2,3]}},before=structuredClone(state.flight),nodes={},urls=[];
  const c=vm.createContext({state,URL,location:{href:'http://127.0.0.1/hangar.html?ship=Destroyer'},history:{replaceState:(_,__,url)=>urls.push(String(url))},$:id=>nodes[id]??=( {}),notice:()=>{},deathSelection:()=>{}});
  vm.runInContext(source.slice(start,end),c);
  for(const scene of flightScenes){c.id=scene.id;vm.runInContext('selectScene(id)',c);assert.equal(state.sceneIndex,scene.kind);assert.equal(nodes['#scene-select'].value,scene.id);assert.ok(urls.at(-1).includes('ship=Destroyer'));assert.ok(urls.at(-1).includes('map='+scene.id));}
  vm.runInContext("selectScene('<script>')",c);assert.equal(state.sceneIndex,0);assert.deepEqual(state.flight,before);
});
