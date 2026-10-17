import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const base=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
const runtime=fs.readFileSync(new URL('aurora-runtime.js',base),'utf8');
const math=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('/*__AURORA_MOON__*/'));
const navigation=fs.readFileSync(new URL('aurora-navigation.js',base),'utf8');
const scenery=fs.readFileSync(new URL('aurora-decorations.js',base),'utf8');
const api=vm.runInNewContext(`${math}\n${navigation}\n${scenery}\n({geometry:auroraAsteroidGeometry,comet:auroraCometPosition});`);

test('asteroids are small closed rocks in two stable bands, clear of planet orbits',()=>{
 const geometry=api.geometry();assert.deepEqual(geometry,api.geometry());
 assert.equal(geometry.length,2200*24*7);
 for(let i=0;i<2200;i++){
  const start=i*24*7,points=Array.from({length:24},(_,j)=>Array.from(geometry.slice(start+j*7,start+j*7+3)));
  const center=[0,1,2].map(axis=>points.reduce((sum,p)=>sum+p[axis],0)/24),r=Math.hypot(center[0],center[2]);
  assert(i<1650?r>157.5&&r<166.5:r>80&&r<84);
  for(const p of points)assert(Math.hypot(...p.map((v,j)=>v-center[j]))<.24);
 }
});

test('comets move continuously on inclined orbits without crossing the star',()=>{
 for(const system of [1,16,50,499])for(let index=0;index<2;index++)for(let t=0;t<2000;t+=7){
  const p=api.comet(system,t,index),q=api.comet(system,t+.016,index);
  assert(p.every(Number.isFinite));assert(Math.hypot(...p)>12);
  assert(Math.hypot(...p.map((v,j)=>v-q[j]))<.1);
 }
 assert.notDeepEqual(api.comet(16,0),api.comet(50,0));
});
