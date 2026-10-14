import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {publicCatalog as catalog} from '../../../game/catalog.mjs';
import './mass-battle.js';

const {Simulation,geometry}=globalThis.MassBattle;
const invariant=sim=>{
  const ids=new Set();
  for(let side=0;side<2;side++)for(let slot=0;slot<sim.alive[side].length;slot++){
    const id=sim.alive[side][slot];
    assert(!ids.has(id));ids.add(id);assert.equal(sim.side[id],side);assert.equal(sim.slot[id],slot);assert(sim.hp[id]>0);
  }
  for(let id=0;id<sim.total;id++){assert(Number.isFinite(sim.hp[id]));assert.equal(sim.hp[id]>0,ids.has(id));assert(sim.shield[id]>=0);}
};
for(const size of [100,1000,10000,20000]){
  const start=performance.now(),sim=new Simulation(catalog,{size}),setup=performance.now()-start;
  assert.equal(sim.total,size);assert.equal(sim.groups.reduce((n,a)=>n+a.length,0),size);invariant(sim);
  const timings=[];
  for(let i=0;i<480&&!sim.finished;i++){const before=performance.now();sim.step();timings.push(performance.now()-before);assert(sim.visualShots.length<=48);if(i%24===0)invariant(sim);}
  invariant(sim);assert(sim.finished);timings.sort((a,b)=>a-b);
  console.log(JSON.stringify({size,setupMs:+setup.toFixed(2),steps:timings.length,meanStepMs:+(timings.reduce((a,b)=>a+b,0)/timings.length).toFixed(3),p95StepMs:+timings[Math.floor(timings.length*.95)].toFixed(3),alive:sim.alive.map(a=>a.length),winner:sim.winner}));
}
const a=new Simulation(catalog,{size:1000,seed:42}),b=new Simulation(catalog,{size:1000,seed:42});
for(let i=0;i<480;i++){a.step();b.step();}
assert.deepEqual(a.survivors(),b.survivors());assert.deepEqual(a.hp,b.hp);assert.equal(a.winner,b.winner);
const roster={Light_Fighter:7,Destroyer:2},before=JSON.stringify(roster);
const custom=new Simulation(catalog,{attacker:roster,defender:{Heavy_Fighter:3},technology:{attacker:{Weapons_Tech:4,Strength_Tech:2,Shielding_Tech:3}}});
assert.equal(custom.total,12);assert.equal(custom.hp[0],480);assert.equal(custom.attack[0],70);assert.equal(custom.shield[0],13);custom.step();assert.equal(JSON.stringify(roster),before);
assert.throws(()=>new Simulation(catalog,{size:20001}));
assert.throws(()=>new Simulation(catalog,{attacker:{Unknown:1},defender:{Light_Fighter:1}}));
assert.throws(()=>new Simulation(catalog,{attacker:{Light_Fighter:-1}}));
assert.throws(()=>new Simulation(catalog,{attacker:{Light_Fighter:1.5}}));
assert.throws(()=>new Simulation(catalog,{technology:{attacker:{Weapons_Tech:NaN}}}));
assert.throws(()=>new Simulation(catalog,{technology:{attacker:{Weapons_Tech:Number.MAX_VALUE}}}));
assert.throws(()=>new Simulation(catalog,{attacker:{Light_Fighter:20000},defender:{Light_Fighter:1}}));
const report={initial:{attacker:{Light_Fighter:10},defender:{Heavy_Fighter:10}},seed:7,rounds:[{time:1,after:{attacker:{Light_Fighter:5},defender:{Heavy_Fighter:8}}}],duration:2,survivors:{attacker:{},defender:{Heavy_Fighter:7}},winner:'defender'};
const replay=new Simulation(catalog,{report}),original=JSON.stringify(report);
for(let i=0;i<4;i++)replay.step();assert.deepEqual(replay.alive.map(a=>a.length),[5,8]);
for(let i=0;i<4;i++)replay.step();assert.deepEqual(replay.survivors(),report.survivors);assert.equal(replay.winner,'defender');assert.equal(JSON.stringify(report),original);
assert.throws(()=>new Simulation(catalog,{report:{...report,survivors:{attacker:{Light_Fighter:100},defender:{}}}}));
const legacy=structuredClone(report);delete legacy.duration;delete legacy.rounds[0].time;
const legacyReplay=new Simulation(catalog,{report:legacy});assert(legacyReplay.inferredTiming);assert.equal(legacyReplay.report.duration,6);
for(let i=0;i<24;i++)legacyReplay.step();assert.deepEqual(legacyReplay.survivors(),legacy.survivors);assert.equal(legacyReplay.winner,legacy.winner);assert.equal(legacy.duration,undefined);assert.equal(legacy.rounds[0].time,undefined);
for(let kind=0;kind<4;kind++){const data=geometry(kind);assert.equal(data.length%21,0);assert([...data].every(Number.isFinite));}

// A recording WebGL context verifies every submitted instance and actual call accounting.
const constants=['VERTEX_SHADER','FRAGMENT_SHADER','COMPILE_STATUS','LINK_STATUS','ARRAY_BUFFER','STATIC_DRAW','DYNAMIC_DRAW','DEPTH_TEST','COLOR_BUFFER_BIT','DEPTH_BUFFER_BIT','FLOAT','POINTS','TRIANGLES','LINES'];
let handle=0,drawCalls=0,drawn=0;
const gl=Object.fromEntries(constants.map((key,i)=>[key,i+1]));
for(const key of ['createShader','createProgram','createBuffer'])gl[key]=()=>({id:handle++});
for(const key of ['shaderSource','compileShader','attachShader','linkProgram','deleteShader','bindBuffer','bufferData','enable','clearColor','uniformMatrix4fv','uniform1f','enableVertexAttribArray','vertexAttribPointer','vertexAttrib4fv','disableVertexAttribArray','clear','viewport'])gl[key]=()=>{};
gl.getShaderParameter=gl.getProgramParameter=()=>true;gl.getUniformLocation=(_p,name)=>name;gl.useProgram=()=>{};
gl.getAttribLocation=(_p,name)=>({aPosition:0,aNormal:1,aMaterial:2,aOffset:3,aInfo:4,aColor:1}[name]);
gl.drawArrays=()=>{drawCalls++;};
const view=new globalThis.MassBattle({},catalog);view.gl=gl;view.canvas={width:1200,height:750};view.extension={vertexAttribDivisorANGLE(){},drawArraysInstancedANGLE(_mode,_offset,_vertices,count){drawCalls++;drawn+=count;}};
view.initGL();view.sim=new Simulation(catalog,{size:20000});view.distance=view.sim.extent*4;view.uploadInstances();view.render();
assert.equal(drawn,20000);assert.equal(view.metrics.instances,20000);assert.equal(view.metrics.drawCalls,drawCalls);assert.equal(drawCalls,5);
for(let i=0;i<20;i++)view.sim.step();view.uploadInstances();drawn=drawCalls=0;view.render();assert.equal(drawn,view.sim.alive[0].length+view.sim.alive[1].length);assert.equal(view.metrics.drawCalls,drawCalls);
view.extension=null;view.sim=new Simulation(catalog,{size:1000});view.uploadInstances();drawCalls=0;view.render();assert.equal(view.metrics.instances,1000);assert.equal(drawCalls,1001);assert.equal(view.metrics.drawCalls,drawCalls);
console.log('PASS: deterministic combat, HP/slot invariants, catalog stats/technology, report outcomes, input validation, geometry, exact 20,000 GPU instance submissions (5 draw calls; recording context, not a GPU FPS benchmark).');
