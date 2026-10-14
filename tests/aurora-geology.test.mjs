import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const folder=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
const reference=fs.readFileSync(new URL('reference/aurora-original.html',folder),'utf8');
const source=fs.readFileSync(new URL('aurora-geology.js',folder),'utf8');
const math=reference.slice(reference.indexOf('const PI='),reference.indexOf('const districtSpecs='));
const buildings=reference.slice(reference.indexOf('function platform('),reference.indexOf('function model('));
const crystals=reference.slice(reference.indexOf('function crystal('),reference.indexOf('function createPlanet('));

function fixture(offset=0){
 const ctx=vm.createContext({offset});
 vm.runInContext(`${math}\n${buildings}\n${crystals}
 function localHeight(d,x,z){return SITE*(offset+.11*x-.085*z+.025*Math.sin(x*1.7+z));}
 const radii=[];const originalCyl=cyl;cyl=function(a,p,r,...rest){radii.push(r);return originalCyl(a,p,r,...rest);};
 ${source}
 globalThis.api={districtGeology,auroraGeologyFeatures,auroraGeologyGround,auroraGeologyRibbon,auroraGeologyClearance,localHeight,SITE,radii};`,ctx);
 return ctx.api;
}

test('mineral scenery is deterministic, finite and contains no large circular plinths',()=>{
 const api=fixture();
 for(const type of ['metal','crystal','gas']){
  api.radii.length=0;
  const a=api.districtGeology({type}),b=api.districtGeology({type});
  assert.equal(a.length%33,0);assert(a.length>3000);assert(a.every(Number.isFinite));
  assert.deepEqual(a,b);
  assert(api.radii.every(r=>r<=.15),`${type}: no cylindrical pool/pad`);
 }
});

test('every scenic vertex follows an elevated terrain datum instead of a fixed pad height',()=>{
 const low=fixture(),high=fixture(1.75);
 for(const type of ['metal','crystal','gas']){
  const a=low.districtGeology({type}),b=high.districtGeology({type});
  assert.equal(a.length,b.length);
  for(let i=0;i<a.length;i+=11){
   assert(Math.abs(a[i]-b[i])<1e-9);assert(Math.abs(a[i+2]-b[i+2])<1e-9);
   assert(Math.abs(b[i+1]-a[i+1]-1.75)<1e-8,`${type} vertex ${i/11} tracks the ground`);
  }
 }
});

test('wet ribbons drape continuously across sloped terrain with upward normals',()=>{
 const api=fixture(),d={type:'gas'},a=[];
 api.auroraGeologyRibbon(a,d,[[-2,-1],[-1,-1.5],[0,-1.2],[1,-1.8]],[.12,.30,.17,.06],[.2,.5,.4],.018);
 for(let i=0;i<a.length;i+=11){
  assert(Math.abs(a[i+1]-api.localHeight(d,a[i],a[i+2])/api.SITE-.036)<1e-9);
  assert(a[i+4]>.90,'thin ground drape, no vertical retaining wall');
 }
});

test('wet ribbons subdivide in both directions before sampling the actual surface',()=>{
 const api=fixture(),d={type:'gas'},a=[];
 const points=[[-2,-1],[-1,-1.5],[0,-1.2],[1,-1.8]];
 const pairs=api.auroraGeologyRibbon(a,d,points,[.12,.30,.17,.06],[.2,.5,.4],.009);
 assert.equal(pairs.length,points.length,'return contract remains one edge pair per authored point');
 assert(a.length/11>300,'surface uses a 2D grid, not endpoint-only quads');
 assert(a.every(Number.isFinite));
 for(let i=0;i<a.length;i+=66){
  // quad emits p,q,r,p,r,s. Both grid axes are at most .10 local units;
  // triangle diagonals may span sqrt(2) times this distance.
  for(const [p,q] of [[i,i+11],[i+11,i+22],[i+22,i+55],[i+55,i]]){
   const distance=Math.hypot(a[p]-a[q],a[p+2]-a[q+2]);
   assert(distance<=.100001,`surface grid edge ${distance} exceeds sampling interval`);
  }
  for(const j of [i,i+11,i+22,i+55]){
   const clearance=a[j+1]-api.localHeight(d,a[j],a[j+2])/api.SITE;
   assert(Math.abs(clearance-.027)<1e-9,'base wetland coat remains thin and clear of terrain');
  }
 }
});

test('metal benches form an open hillside and taper into the ground at both ends',()=>{
 const api=fixture(),d={type:'metal'},a=api.districtGeology(d);
 const count=8*7*6;let low=Infinity,high=-Infinity;
 for(let i=0;i<count*11;i+=11){
  assert(a[i+2]<-.57,'loading-facing side remains entirely open');
  const above=a[i+1]-api.localHeight(d,a[i],a[i+2])/api.SITE;
  low=Math.min(low,above);high=Math.max(high,above);
  assert(above<.63&&above>-.04);
  assert(a[i+4]>0,'all quarry surfaces face out of the hillside');
 }
 assert(low<0,'outer edge sinks into surrounding terrain');
 assert(high>.55,'layered faces remain visible');
 assert(!api.auroraGeologyClearance(d,-1.1,.7,0),'truck loading access stays open');
});

test('tree clearance follows outcrops and channels, allowing vegetation between work areas',()=>{
 const api=fixture();
 assert(api.auroraGeologyClearance({type:'metal'},-2.2,-1.7));
 assert(api.auroraGeologyClearance({type:'crystal'},-2.12,-2.14));
 assert(api.auroraGeologyClearance({type:'gas'},-.30,-2.35));
 for(const type of ['metal','crystal','gas']){
  const d={type};
  assert(!api.auroraGeologyClearance(d,0,0));
  assert(!api.auroraGeologyClearance(d,2.0,1.0));
  let sampled=0,blocked=0;
  for(let x=-3.5;x<3.5;x+=.1)for(let z=-3.5;z<3.5;z+=.1){sampled++;if(api.auroraGeologyClearance(d,x,z))blocked++;}
  assert(blocked/sampled<.42,`${type}: plants are not excluded from a whole district disk`);
 }
 assert(!api.auroraGeologyClearance({type:'research'},0,0));
});
