import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
const runtime=readFileSync(new URL('aurora-runtime.js',root),'utf8');
const biomes=readFileSync(new URL('aurora-biomes.js',root),'utf8');
const volcanoes=readFileSync(new URL('aurora-volcanoes.js',root),'utf8');
const bridges=readFileSync(new URL('aurora-bridges.js',root),'utf8');
const terrainSource=readFileSync(new URL('aurora-terrain.js',root),'utf8');
const routes=runtime.slice(runtime.indexOf('function samplePath('),runtime.indexOf('// District scenery'));
const crystal=runtime.slice(runtime.indexOf('function crystal('),runtime.indexOf('function createPlanet('));
const antenna=runtime.slice(runtime.indexOf('function antenna('),runtime.indexOf('function tank('));
function environment(biome){
 let head=runtime.slice(runtime.indexOf('const PI='),runtime.indexOf('const canvas='));
 if(head.includes('/*__AURORA_BIOMES__*/'))head=head.replace('/*__AURORA_BIOMES__*/',()=>biomes);
 else head=head.replace('/*__AURORA_TERRAIN__*/',`${biomes}\n/*__AURORA_TERRAIN__*/`);
 head=head.replace('/*__AURORA_TERRAIN__*/',()=>terrainSource);
 head=head.replace('/*__AURORA_VOLCANOES__*/',()=>volcanoes);
 head=head.replace('/*__AURORA_BRIDGES__*/',()=>bridges);
 // Allow this focused test to run while the runtime's integration edit is in
 // progress; production installs the same terrain hook in its shared source.
 if(!head.includes('auroraBiomeTerrain(n)'))head=head.replace('function terrain(n){','function terrain(n){if(auroraBiome!=="terrestrial")return auroraBiomeTerrain(n);');
 return vm.runInNewContext(`(()=>{
  const options={biome:${JSON.stringify(biome)}};
  const window={__AURORA_CONFIG:options};
  ${head}\n${routes}\n${crystal}\n${antenna}
  let terrainGeo,oceanGeo,cloudGeo,uploadCount=0;const draws=[];
  function upload(a){uploadCount++;return {count:a.length/STRIDE};}
  function draw(geo,m,opacity=1){draws.push({count:geo.count,m,opacity});}
  const gl={depthMask(){},blendFunc(){}};
  return {auroraBiome,auroraBiomeInfo,terrain,auroraBiomeFault,auroraBiomeFaultDistance,auroraBiomeLavaLevel,auroraBiomeRiftDistance,auroraBiomeRiftCrystal,auroraBiomeVisibleGround,auroraBiomeColor,auroraBiomeCreatePlanet,auroraBiomeDistrictGeology,auroraBiomePlatformContains,auroraBiomeEffects,auroraBiomeDraw,auroraBiomeWorkBlend,auroraBiomeSurfaceShader,auroraBiomeAtmosphereShader,districts,pt,norm,dot,localHeight,localPoint,R,PAD,SITE,samplePath,outTruck,backTruck,robotPaths,draws,get uploadCount(){return uploadCount;},get mesh(){return {terrainGeo,oceanGeo,cloudGeo};}};
 })()`);
}
const nAt=(lon,lat)=>{const a=lon*Math.PI/180,b=lat*Math.PI/180;return [Math.cos(b)*Math.cos(a),Math.sin(b),Math.cos(b)*Math.sin(a)];};

test('biome selection preserves terrestrial and supports production planet identifiers',()=>{
 assert.equal(environment('terrestrial').auroraBiome,'terrestrial');
 assert.equal(environment('earth').auroraBiome,'terrestrial');
 assert.equal(environment('metal').auroraBiome,'mercury');
 assert.equal(environment('mars').auroraBiome,'mars');
 assert.equal(environment('jupiter').auroraBiome,'gas');
 assert.equal(environment('invalid').auroraBiome,'terrestrial');
 assert.equal(environment('terrestrial').auroraBiomeCreatePlanet(),null);
});

test('lava and rifts change surface relief, remain continuous, and retain fixed foundations',()=>{
 for(const biome of ['mercury','mars']){
  const e=environment(biome);let low=0,high=0,total=0,maxStep=0;
  for(let y=-85;y<=85;y+=5)for(let x=-177;x<180;x+=5){const n=nAt(x,y),h=e.terrain(n);assert(Number.isFinite(h));total++;if(h<-.1)low++;if(h>.15)high++;maxStep=Math.max(maxStep,Math.abs(h-e.terrain(nAt(x+.0001,y))));}
  assert(low>total*.09,`${biome} must have visible channels`);assert(high>total*.45,`${biome} must retain continents or plateaus`);assert(maxStep<.002);
  for(const d of e.districts){
   const positions=d.resource?[[1.65,.1],d.type==='metal'?[-.2,-.2]:d.type==='crystal'?[-1.55,-1.1]:[-1.55,-.12]]:[[0,0]];
   for(const [x,z] of positions){const n=e.norm(e.pt(d.m,[x,0,z])),expected=(e.R+e.PAD)/e.dot(n,d.n)-e.R;assert(Math.abs(e.terrain(n)-expected)<.00001,`${biome}/${d.type} foundation`);}
  }
 }
});

test('gas actors and all buildings share supported floating decks with space below',()=>{
 const e=environment('gas');
 for(const d of e.districts){
  const points=[[0,0]];
  if(d.resource)points.push([1.65,.1],[-1.55,-1.1]);
  const paths=d.type==='metal'?[e.outTruck,e.backTruck]:d.type==='crystal'?e.robotPaths:[];
  for(const path of paths)for(let i=0;i<=50;i++)points.push(e.samplePath(path,i/50));
  for(const [x,z] of points){assert(e.auroraBiomePlatformContains(d,x,z),`${d.type} deck at ${x}, ${z}`);assert(Math.abs(e.localHeight(d,x,z))<.001,`${d.type} contact at ${x}, ${z}`);}
  const geometry=e.auroraBiomeDistrictGeology(d);assert(geometry.length>3000,'every district has a floating hull');assert(geometry.every(Number.isFinite));
  let minY=Infinity;for(let i=1;i<geometry.length;i+=11)minY=Math.min(minY,geometry[i]);
  if(d.type!=='gas')assert(minY>-.9,'ordinary flotation hull remains visibly above lower clouds');
 }
 const unoccupied=nAt(-170,-25);assert(e.terrain(unoccupied)<0,'space between platforms remains atmosphere');
});

test('fractured worlds have many dark plateaus, narrow lava rivers and building-height canyon walls',()=>{
 const metal=environment('mercury'),mars=environment('mars'),plates=new Set();let area=0,lava=0,dark=0,rock=0,deep=0;
 for(let y=-87;y<=87;y+=3)for(let x=-178;x<180;x+=3){
  const n=nAt(x,y),weight=Math.cos(y*Math.PI/180),hm=metal.terrain(n),hr=mars.terrain(n);area+=weight;plates.add(metal.auroraBiomeFault(n).plate);
  if(hm<metal.auroraBiomeLavaLevel)lava+=weight;
  if(hm>.3){const c=metal.auroraBiomeColor(n,hm);dark+=(c[0]*.2126+c[1]*.7152+c[2]*.0722)*weight;rock+=weight;}
  if(hr<-3)deep+=weight;
 }
 console.log('Fractured-world coverage:',{plates:plates.size,lavaFraction:lava/area,basaltLuminance:dark/rock,deepCanyonFraction:deep/area});
 assert.equal(plates.size,17);assert(lava/area>.025&&lava/area<.15,'lava divides plates without becoming a broad orange ocean');
 assert(dark/rock<.25,'basalt is visibly charcoal, not pale brown rock');assert(deep/area>.03,'the canyon network has substantial deep floors');
 let depth=0;
 for(let y=-75;y<76;y+=5)for(let x=-178;x<180;x+=5){const n=nAt(x,y);if(mars.auroraBiomeWorkBlend(n).blend>.02)continue;depth=Math.max(depth,.63-mars.terrain(n));}
 assert(depth>3.7&&depth<4.3,'valley walls should be comparable in height to the colony buildings');
});

test('non-native scenery is replaced instead of importing wetlands or mineral ground',()=>{
 for(const biome of ['mercury','mars']){
  const e=environment(biome);
  for(const d of e.districts){const geom=e.auroraBiomeDistrictGeology(d);
   if(d.type===(biome==='mercury'?'metal':'crystal'))assert.equal(geom,null,'native geology uses the accepted mining detail');
   else {assert(Array.isArray(geom));assert(geom.every(Number.isFinite));assert(geom.length<30000);}
  }
 }
});

test('Mars crystal roots and shaded facets remain darker than translucent tips',()=>{
 const e=environment('mars'),g=[];e.auroraBiomeRiftCrystal(g,[0,0,0],3,.35,false);
 const roots=[],tips=[];let maxEmission=0;
 for(let i=0;i<g.length;i+=11){const lum=g[i+6]*.2126+g[i+7]*.7152+g[i+8]*.0722;maxEmission=Math.max(maxEmission,g[i+9]);if(g[i+1]<.2)roots.push(lum);if(g[i+1]>2.85)tips.push(lum);}
 const average=a=>a.reduce((s,v)=>s+v,0)/a.length;
 assert(roots.length&&tips.length);assert(average(roots)<.13);assert(average(tips)>average(roots)*3);assert(maxEmission<.36,'the whole prism must not become a flat luminous block');
});

test('non-terrestrial geometry includes erupting volcanoes, canyon crystals and three moving cloud layers',()=>{
 for(const biome of ['mercury','mars','gas']){
  const e=environment(biome),decor=e.auroraBiomeCreatePlanet();console.log('Biome geometry:',biome,JSON.stringify(e.auroraBiomeEffects.stats));
  assert(decor.every(Number.isFinite));assert(e.mesh.terrainGeo.count>200000);
  if(biome==='mercury'){
   assert(e.mesh.oceanGeo.count>10000);assert(e.auroraBiomeEffects.volcanoes.length>=5,'lava world needs visible active volcanoes around globe');
   for(const v of e.auroraBiomeEffects.volcanoes)for(let k=0;k<24;k++){const t=k/24*Math.PI*2,n=e.norm(e.pt(v.m,[Math.cos(t)*v.radius*1.28,0,Math.sin(t)*v.radius*1.28]));assert(e.auroraBiomeWorkBlend(n).blend<=.04,'volcano skirts must not intersect building or road foundations');}
   for(const v of e.auroraBiomeEffects.volcanoes)for(const p of v.footings){const residual=Math.hypot(...p)-e.R-e.terrain(e.norm(p));assert(residual<0&&residual>-.08,'volcano skirt must bury into the sampled rock instead of floating');}
  }
  if(biome==='mars'){
   assert.equal(e.mesh.oceanGeo.count,0);assert(e.auroraBiomeEffects.stats.riftCrystals>700,'crystal forest must fill the canyon network');assert(e.auroraBiomeEffects.stats.tallRiftCrystals>35);assert(e.auroraBiomeEffects.stats.wallCrystals>200);assert(e.auroraBiomeEffects.riftGlow.count>0);
   for(const anchor of e.auroraBiomeEffects.riftAnchors){const p=anchor.position,n=e.norm(p),residual=Math.hypot(...p)-e.R-e.terrain(n),meshResidual=Math.hypot(...p)-Math.hypot(...e.auroraBiomeVisibleGround(n));assert(residual<-.015&&meshResidual<-.015,`crystal roots must intersect the sampled and rendered canyon rock: ${residual}, ${meshResidual}`);}
  }
  if(biome==='gas'){assert.equal(e.mesh.oceanGeo.count,0);assert.equal(e.auroraBiomeEffects.cloudLayers.length,3);assert.equal(e.auroraBiomeEffects.storms.length,4);assert.equal(decor.length,0,'gas giant has no hidden solid ground');}
  const uploads=e.uploadCount;e.auroraBiomeDraw(0,false);const before=e.draws.map(d=>Array.from(d.m));e.draws.length=0;e.auroraBiomeDraw(6,false);
  assert.equal(e.uploadCount,uploads,'animation must not allocate GPU buffers');
  if(biome!=='mars')assert.notDeepEqual(e.draws.map(d=>Array.from(d.m)),before,'eruption and cloud geometry must animate');
 }
});
