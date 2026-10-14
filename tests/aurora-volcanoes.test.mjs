import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const base=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
const read=name=>readFileSync(new URL(name,base),'utf8');
function environment(){
 const runtime=read('aurora-runtime.js');
 let head=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('const canvas='));
 for(const part of ['biomes','terrain','volcanoes']){
  const marker=`/*__AURORA_${part.toUpperCase()}__*/`;
  if(head.includes(marker))head=head.replace(marker,()=>read(`aurora-${part}.js`));
  else if(part==='volcanoes')head+=`\n${read('aurora-volcanoes.js')}`;
 }
 const routes=runtime.slice(runtime.indexOf('function samplePath('),runtime.indexOf('// District scenery'));
 return vm.runInNewContext(`(()=>{
  const options={biome:'mercury'},window={__AURORA_CONFIG:options};
  ${head}\n${routes}
  let uploadCount=0;const draws=[];function upload(a){uploadCount++;return {count:a.length/STRIDE,data:a};}
  function draw(g,m,opacity){draws.push({g,m,opacity});}const gl={depthMask(){}};
  return {auroraVolcanoBuild,auroraVolcanoDraw,auroraVolcanoPoint,auroraBiomeEffects,auroraBiomeWorkBlend,terrain,pt,norm,dot,R,districts,draws,get uploadCount(){return uploadCount;}};
 })()`);
}

test('volcanoes occupy real dry unbuilt terrain and their wide aprons contact the surface',()=>{
 const e=environment(),mesh=[];e.auroraVolcanoBuild(mesh);
 const volcanoes=e.auroraBiomeEffects.volcanoes;
 console.log('Sculpted volcanoes:',volcanoes.map(v=>({radius:v.radius,height:v.height,normal:v.n})));
 assert(volcanoes.length>=5&&volcanoes.length<=7,'a handful of substantial distinct volcanoes covers the globe');
 assert(new Set(volcanoes.map(v=>v.height)).size>=3,'hero and secondary heights remain distinct');
 assert(mesh.length>100000&&mesh.every(Number.isFinite));
 for(const v of volcanoes){
  assert(v.radius/v.height>.70,'broad mountain base instead of a pointed chimney');
  for(const p of v.footings){
   const n=e.norm(p),error=Math.hypot(...p)-e.R-e.terrain(n);
   assert(error<0&&error>-.09,`buried apron contact ${error}`);
   assert(e.auroraBiomeWorkBlend(n).blend<.03,'no apron crosses a fixed worksite');
  }
  for(let ring=0;ring<=4;ring++)for(let k=0;k<24;k++){
   const a=k/24*Math.PI*2,r=v.radius*1.28*ring/4,n=e.norm(e.pt(v.m,[Math.cos(a)*r,0,Math.sin(a)*r]));
   assert(e.auroraBiomeWorkBlend(n).blend<=.025);assert(e.terrain(n)>=-.3);
  }
 }
});

test('broken rim has real depth and molten streams branch across the mountain',()=>{
 const e=environment(),mesh=[];e.auroraVolcanoBuild(mesh);
 for(const v of e.auroraBiomeEffects.volcanoes){
  const center=e.auroraVolcanoPoint(v,0,0)[1],rim=Array.from({length:80},(_,i)=>e.auroraVolcanoPoint(v,.225,i/80*Math.PI*2)[1]);
  assert(Math.max(...rim)-center>v.height*.20,'crater has a dark inner wall');
  assert(Math.max(...rim)-Math.min(...rim)>v.height*.12,'rim includes large broken notches');
  assert.equal(v.lavaArms,8);assert.equal(v.lavaBranches,4);
 }
 let rock=0,lava=0;for(let i=10;i<mesh.length;i+=11){if(mesh[i]===2)lava++;else rock++;}
 assert(rock>lava*.4,'visible dark mountain remains between the narrow lava paths');
});

test('eruptions animate deterministically without allocating or uploading geometry',()=>{
 const e=environment(),mesh=[];e.auroraVolcanoBuild(mesh);const uploaded=e.uploadCount;
 e.auroraVolcanoDraw(0,false);const before=e.draws.map(d=>Array.from(d.m));
 e.draws.length=0;e.auroraVolcanoDraw(8,false);const after=e.draws.map(d=>Array.from(d.m));
 assert.notDeepEqual(before,after);assert.equal(e.uploadCount,uploaded);
 for(const d of e.draws){assert(d.m.every(Number.isFinite));assert(d.opacity>=0&&d.opacity<=1);}
 e.draws.length=0;e.auroraVolcanoDraw(8,false);assert.deepEqual(e.draws.map(d=>Array.from(d.m)),after);
 e.draws.length=0;e.auroraVolcanoDraw(8,true);assert.equal(e.draws.length,0);
});
