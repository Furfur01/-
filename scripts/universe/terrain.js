// Pure data only: shared by the world, geometry worker and CPU acceptance tests.
import {createPlanetProfile,sampleSurface} from './planet-profile.js';
import {createTerrainField} from './continuous-planets/fields.js';
import {createFacetedField} from './continuous-planets/faceted-field.js';
import {CAPITAL_VERSION,CAPITAL_SIZE,CAPITAL_DISTRICTS,CAPITAL_BY_ID,COLONY_INDUSTRY,COLONY_ROADS} from './capital-layout.js';
import {continuumMineHeight} from './continuum-grade.js';
import {DISTRICT_VERSION,makeDistrictSites,gradeDistrict} from './aurora-district-layout.js';
export const CONTINUOUS_PLANET_VERSION = 'four-worlds-aurora-3';
export const GAS_PLATFORM_HEIGHT = .080;
export const GAS_CLOUD_TOP = .025;
export {sampleSurface} from './planet-profile.js';
export const WORLD_RADIUS_MULTIPLIER = 100;
export const LEGACY_TERRAIN_RADIUS = 16;
export const LEGACY_SITE_RADIUS = 2.7;
// AABB of the old production AURORA model('research'), before its 2.7 district
// transform. Recomputed from that archived CPU geometry by the acceptance test.
export const LEGACY_ORDINARY_MESH = Object.freeze({model:'research',vertices:6480,min:[-.982,-.245,-.6146],max:[.982,1.502,.92],size:[1.964,1.747,1.5346],districtScale:2.7});
export const INDUSTRIAL_IDS = ['Metal_Mine','Crystal_Mine','Gas_Mine','Solar_Plant','Metal_Storage','Crystal_Storage','Gas_Storage','Robotics_Facility','Shipyard','Research_Lab','Radar_Facility','Fusion_Reactor','Nanite_Factory','Alliance_Depot','Moon_Base','Wormhole_Generator','Command_Center','The_EU_X_Radar','Terraformer','Missile_Silo','Flagship_Center'];
export const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
const smooth = n => { n = clamp(n); return n*n*(3-2*n); };
export function hashSeed(value) { let n=2166136261; for (const c of String(value ?? 'planet')) n=Math.imul(n^c.charCodeAt(0),16777619); return n>>>0; }
export function normalize(v) { const r=Math.hypot(...v)||1; return v.map(x=>x/r); }
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function tangentFrame(direction) { const normal=normalize(direction),right=normalize(cross(Math.abs(normal[1])>.94?[1,0,0]:[0,1,0],normal)); return {normal,right,forward:normalize(cross(normal,right))}; }
export function industrialUnit(radius) { return radius/WORLD_RADIUS_MULTIPLIER/LEGACY_TERRAIN_RADIUS; }
export function scaleEvidence(radius) { const unit=industrialUnit(radius),oldRadius=radius/WORLD_RADIUS_MULTIPLIER,siteRadius=LEGACY_SITE_RADIUS*unit,meshUnit=LEGACY_ORDINARY_MESH.districtScale*unit,meshSize=LEGACY_ORDINARY_MESH.size.map(v=>v*meshUnit),meshSpan=Math.max(...meshSize); return {oldPlanetRadius:oldRadius,planetRadius:radius,ordinaryUnit:unit,siteRadius,oldPlanetToSiteRatio:LEGACY_TERRAIN_RADIUS/LEGACY_SITE_RADIUS,planetToSiteRatio:radius/siteRadius,ordinaryMesh:{...LEGACY_ORDINARY_MESH,oldWorldUnit:meshUnit,newWorldUnit:meshUnit,oldWorldSize:meshSize,newWorldSize:[...meshSize],oldPlanetToMeshSpan:oldRadius/meshSpan,planetToMeshSpan:radius/meshSpan},ratioGain:Number((radius/oldRadius).toFixed(9))}; }
function lattice(x,y,z,seed) { let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(z|0,2147483647)^seed;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295; }
function noise(x,y,z,seed) { const a=Math.floor(x),b=Math.floor(y),c=Math.floor(z),u=smooth(x-a),v=smooth(y-b),w=smooth(z-c),mix=(x,y,t)=>x+(y-x)*t; return mix(mix(mix(lattice(a,b,c,seed),lattice(a+1,b,c,seed),u),mix(lattice(a,b+1,c,seed),lattice(a+1,b+1,c,seed),u),v),mix(mix(lattice(a,b,c+1,seed),lattice(a+1,b,c+1,seed),u),mix(lattice(a,b+1,c+1,seed),lattice(a+1,b+1,c+1,seed),u),v),w); }
export function legacyPlacementHeight(direction,config) {
  if(config.biome==='gas')return 0;
  const n=normalize(direction),seed=typeof config.seed==='number'?config.seed:hashSeed(config.seed??config.key),radius=config.radius;
  let value=0,amp=.5,f=3.2;for(let i=0;i<5;i++){value+=(noise(n[0]*f+3.1,n[1]*f-4.2,n[2]*f+1.7,seed)-.5)*amp;f*=2.07;amp*=.5;}
  // Keep the arrival/combat cap on the authoritative server's spherical surface.
  const combat=smooth((.992-n[1])/.012);
  return value*radius*(config.moon?.009:.012)*combat;
}
const profiles=new WeakMap();
const continuousFields=new WeakMap(),gradedFields=new WeakMap();
export function continuousBaseField(config){
  if(config.generation!==CONTINUOUS_PLANET_VERSION||config.moon||config.biome==='gas')return null;
  let field=continuousFields.get(config);
  if(!field){field=createFacetedField(createTerrainField(config.biome,config.appearanceSeed));continuousFields.set(config,field);}
  return field;
}
// The engine's existing placement seed is deliberately independent of the new
// appearance identity. Ownership/name changes cannot relocate buildings or geology.
export function makeContinuousConfig(body,ids=INDUSTRIAL_IDS,{capital=false}={}){
  const key=body.coordinates?.join(':')??body.key??body.id??'planet';
  const config={radius:body.radius,biome:body.biome||'terrestrial',key,
    seed:hashSeed(body.seed??body.key??body.id),generation:CONTINUOUS_PLANET_VERSION,
    appearanceSeed:body.seed??`${CONTINUOUS_PLANET_VERSION}/${key}/${body.biome||'terrestrial'}`};
  config.sites=makeSurfaceLayout(config,ids);
  config.districtVersion=DISTRICT_VERSION;
  config.requestKey=`${config.generation}/${key}/${config.biome}/${config.radius}/${config.appearanceSeed}/${[...ids].sort().join(',')}/${DISTRICT_VERSION}`;
  return config;
}
export function createContinuousTerrainField(config){
  let field=gradedFields.get(config);if(field)return field;
  const base=continuousBaseField(config);if(!base)return null;
  field={...base,minHeight:Math.min(0,base.minHeight),maxHeight:Math.max(base.maxHeight,...(config.sites||[]).map(s=>s.height/config.radius+.032)),
    height:(x,y,z)=>terrainHeight([x,y,z],config)/config.radius,
    sample(x,y,z){
      const n=normalize([x,y,z]),s=base.sample(...n),height=terrainHeight(n,config)/config.radius;
      let district=null;for(const site of config.sites||[]){const g=site.district?gradeDistrict(n,site,config.radius,s.height*config.radius):null;if(g&&(!district||g.weight>district.weight))district={...g,site};}
      const clear=!!district?.developed;
      const combat=n[1]>.992;
      const mineral=district?.mineral||0;
      const color=district?.weight>.05&&height>0&&s.height<.0002?(config.biome==='terrestrial'?[.075,.22,.052]:s.color):s.color;
      return {...s,height,color,crystal:combat?0:mineral|| (clear?0:s.crystal),lava:clear||combat?0:s.lava,
        liquidHeight:height> (config.biome==='mercury'?-.016:0)||combat?null:s.liquidHeight,decorationBlocked:(clear&&!mineral)||combat};
    },
    detailScale(d,a){
      if((config.sites||[]).some(s=>dot(d,s.normal)>Math.cos(a+s.footprint*3/config.radius)))return Math.max(12,base.detailScale?.(d,a)||1);
      return base.detailScale?.(d,a)??base.lodErrorScale??1;
    }
  };
  gradedFields.set(config,field);return field;
}
export function terrainProfile(config){if(config.moon||config.biome==='moon')return null;if(config.profile)return config.profile;let p=profiles.get(config);if(!p){p=createPlanetProfile({key:config.key??config.seed??'planet',biome:config.biome||'terrestrial'});profiles.set(config,p);}return p;}
export function baseHeight(direction,config){if(config.generation===CONTINUOUS_PLANET_VERSION)return (continuousBaseField(config)?.height(...normalize(direction))||0)*config.radius;const p=terrainProfile(config);return p?sampleSurface(direction,p).height*config.radius:legacyPlacementHeight(direction,config);}
export function liquidHeight(config){if(config.generation===CONTINUOUS_PLANET_VERSION)return config.biome==='terrestrial'?0:config.biome==='mercury'?-.016*config.radius:-Infinity;const p=terrainProfile(config);return p?.seaLevel==null?-Infinity:p.seaLevel*config.radius;}
export function cameraSurfaceHeight(direction,config){if(config.generation===CONTINUOUS_PLANET_VERSION&&config.biome==='gas')return GAS_CLOUD_TOP*config.radius;return Math.max(terrainHeight(direction,config),liquidHeight(config));}
export function makeSurfaceLayout(config,ids=INDUSTRIAL_IDS) {
  const seed=typeof config.seed==='number'?config.seed:hashSeed(config.seed??config.key),unit=industrialUnit(config.radius);
  if(config.generation===CONTINUOUS_PLANET_VERSION&&!config.moon)return makeDistrictSites(config,n=>baseHeight(n,config),unit).filter(s=>ids.includes(s.id));
  return ids.map(id=>{
    const known=INDUSTRIAL_IDS.indexOf(id),index=known<0?20+hashSeed(id)%10000:known,angle=index*Math.PI*(3-Math.sqrt(5))+(seed%997)/997*Math.PI*2,y=1-2*((index*.61803398875+.025)%1),r=Math.sqrt(Math.max(0,1-y*y));
    let normal=[Math.cos(angle)*r,y,Math.sin(angle)*r];
    // Select the gentlest of deterministic nearby candidates, not an arbitrary raised disc.
    let best=Infinity;const frame=tangentFrame(normal);
    for(let j=0;j<7;j++){const a=j*2.3999632,offset=j?0.008:0,candidate=normalize(normal.map((v,k)=>v+offset*(frame.right[k]*Math.cos(a)+frame.forward[k]*Math.sin(a)))),h=legacyPlacementHeight(candidate,config);let slope=0;for(const sign of[-1,1]){const q=normalize(candidate.map((v,k)=>v+frame.right[k]*sign*.001));slope+=Math.abs(legacyPlacementHeight(q,config)-h);}if(slope<best){best=slope;frame.chosen=candidate;}}
    normal=frame.chosen;const height=config.biome==='gas'?config.radius*(config.generation===CONTINUOUS_PLANET_VERSION?GAS_PLATFORM_HEIGHT:.003):Math.max(baseHeight(normal,config),liquidHeight(config)+unit*.7);
    return {id,normal,height,unit,footprint:unit*(id==='Shipyard'?9:6),position:normal.map(v=>v*(config.radius+height)),heading:(hashSeed(id)%360)*Math.PI/180};
  });
}
export function terrainHeight(direction,config) {
  const n=normalize(direction);let h=baseHeight(n,config);
  if(config.generation===CONTINUOUS_PLANET_VERSION){
    if(config.biome!=='gas')for(const site of config.sites||[]){const grade=gradeDistrict(n,site,config.radius,h);if(grade)h=grade.height;}
    return h*smooth((.992-n[1])/.012)||0;
  }
  for(const site of config.sites||[]){if(config.biome==='gas')break;if(site.capitalModule||site.colonyIndustry)continue;const cosine=dot(n,site.normal),r=site.footprint*1.3;if(cosine<Math.cos(r*1.7/config.radius))continue;const distance=Math.acos(clamp(cosine,-1,1))*config.radius;if(distance<r*1.7){h+=(site.height-h)*(1-smooth((distance-r)/(r*.7)));if(site.id==='Metal_Mine'||site.id==='Crystal_Mine'){const frame=tangentFrame(site.normal),a=dot(n,frame.right)*config.radius,b=dot(n,frame.forward)*config.radius,x=a*Math.cos(site.heading)+b*Math.sin(site.heading),z=a*Math.sin(site.heading)-b*Math.cos(site.heading),d=Math.hypot(x+1.45*site.unit,z+.15*site.unit)/site.unit;h-=site.unit*.085*clamp(Math.floor((1.42-d)/.2)+1,0,5);}}}
  const city=capitalGrade(n,config);if(city&&config.biome!=='gas'){
    h+=(city.height-h)*city.weight;
    // Original asset terrain is the visible top layer. Recess the planet skin
    // slightly to avoid coplanar flicker; excavate the original mine and its ramp.
    const u=config.capital.unit,d=COLONY_INDUSTRY.Metal_Mine;
    h-=.035*u*city.weight;
    h+=continuumMineHeight(city.x/u-d.x,city.z/u-d.z)*u;
  }
  // The authoritative battle's environment center maps to the +Y pole. Apply
  // this after grading/excavation too, so an industrial pad cannot raise it.
  return h*smooth((.992-n[1])/.012)||0;
}
// A tangent construction plane, with a soft rectangular earthwork shoulder.
// The mesh, CPU queries and Worker all consume this exact function.
export function capitalGrade(direction,config){
  const c=config.capital;if(!c)return null;const n=normalize(direction),cosine=dot(n,c.normal);if(cosine<.96)return null;
  const radial=(config.radius+c.height)/cosine,point=n.map(v=>v*radial),x=dot(point,c.right),z=dot(point,c.forward),edge=Math.max(Math.abs(x)-c.width/2,Math.abs(z)-c.depth/2);
  let weight=1-smooth((edge-c.unit*3)/(c.unit*15));
  for(const d of Object.values(COLONY_INDUSTRY)){const e=Math.max(Math.abs(x-d.x*c.unit)-d.width*c.unit/2,Math.abs(z-d.z*c.unit)-d.depth*c.unit/2);weight=Math.max(weight,1-smooth((e-c.unit*2)/(c.unit*8)));}
  for(const route of COLONY_ROADS)for(let i=1;i<route.length;i++){
    const a=route[i-1],b=route[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x/c.unit-a[0])*dx+(z/c.unit-a[1])*dz)/(dx*dx+dz*dz)),distance=Math.hypot(x/c.unit-a[0]-t*dx,z/c.unit-a[1]-t*dz);
    weight=Math.max(weight,1-smooth((distance-2)/5));
  }
  return weight>0?{height:radial-config.radius,weight,x,z}:null;
}
export function surfacePoint(direction,config) { const n=normalize(direction),r=config.radius+terrainHeight(n,config);return n.map(v=>v*r); }
export function surfaceNormal(direction,config){const f=tangentFrame(direction),p=surfacePoint(f.normal,config),e=.00004,a=surfacePoint(f.normal.map((v,k)=>v+f.right[k]*e),config),b=surfacePoint(f.normal.map((v,k)=>v+f.forward[k]*e),config);return normalize(cross(a.map((v,k)=>v-p[k]),b.map((v,k)=>v-p[k])));}
function finish(positions,indices) {
  const normals=new Float32Array(positions.length);
  for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3,ab=[positions[b]-positions[a],positions[b+1]-positions[a+1],positions[b+2]-positions[a+2]],ac=[positions[c]-positions[a],positions[c+1]-positions[a+1],positions[c+2]-positions[a+2]],n=cross(ab,ac);for(const j of[a,b,c])for(let k=0;k<3;k++)normals[j+k]+=n[k];}
  for(let i=0;i<normals.length;i+=3){const n=normalize([normals[i],normals[i+1],normals[i+2]]);normals.set(n,i);}
  return {positions:new Float32Array(positions),normals,indices:new Uint32Array(indices)};
}
function* globalJob(config,segments=64,rings=40) {
  const positions=[],indices=[];
  for(let y=0;y<=rings;y++){const lat=Math.PI*y/rings;for(let x=0;x<=segments;x++){const lon=x/segments*Math.PI*2;positions.push(...surfacePoint([Math.sin(lat)*Math.cos(lon),Math.cos(lat),Math.sin(lat)*Math.sin(lon)],config));}yield;}
  for(let y=0;y<rings;y++)for(let x=0;x<segments;x++){const a=y*(segments+1)+x,b=a+segments+1;indices.push(a,b+1,b,a,a+1,b+1);}
  return yield* finishJob(positions,indices,config);
}
function* patchJob(config,direction,{segments=48,extent=config.radius*.075}={}) {
  const frame=tangentFrame(direction),positions=[],indices=[],edge=[],n=segments+1;
  // Cubic spacing concentrates vertices near the industrial plot without a dense whole planet.
  const coordinate=i=>{const t=i/segments*2-1;return (t*.12+t*t*t*.88)*extent;};
  for(let y=0;y<=segments;y++){for(let x=0;x<=segments;x++){const u=coordinate(x),v=coordinate(y),d=normalize(frame.normal.map((a,k)=>a+(frame.right[k]*u+frame.forward[k]*v)/config.radius));positions.push(...surfacePoint(d,config));}yield;}
  for(let y=0;y<segments;y++)for(let x=0;x<segments;x++){const a=y*n+x;indices.push(a,a+1,a+n,a+1,a+n+1,a+n);}
  // A vertical skirt must not tilt the top surface's shared edge normals into
  // a dark wall. Preserve the top normals before adding the seam closure.
  const topNormals=finish(positions,indices).normals;
  for(let x=0;x<=segments;x++)edge.push(x);for(let y=1;y<=segments;y++)edge.push(y*n+segments);for(let x=segments-1;x>=0;x--)edge.push(segments*n+x);for(let y=segments-1;y>0;y--)edge.push(y*n);
  const skirtStart=positions.length/3,depth=config.radius*.006;
  for(const i of edge){const p=positions.slice(i*3,i*3+3),r=Math.hypot(...p);positions.push(...p.map(v=>v*(r-depth)/r));}
  for(let i=0;i<edge.length;i++){const j=(i+1)%edge.length;indices.push(edge[i],skirtStart+i,edge[j],edge[j],skirtStart+i,skirtStart+j);}
  const data=yield* finishJob(positions,indices,config,n*n);if(config.moon||config.biome==='moon')data.normals.set(topNormals);
  return {...data,direction:[...frame.normal],extent,mainVertexCount:n*n};
}
function* finishJob(positions,indices,config,count=positions.length/3){
  const data=finish(positions,indices),p=terrainProfile(config),terrainData=new Float32Array(positions.length/3*4),landform=new Float32Array(positions.length);
  for(let i=0;i<positions.length;i+=3){
    const d=positions.slice(i,i+3),n=normalize(d);
    if(p&&p.biome!=='gas'){
      const s=sampleSurface(n,p);let clear=1;
      for(const site of config.sites||[])if(dot(n,site.normal)>Math.cos(site.footprint*1.8/config.radius)){clear=0;break;}
      terrainData.set([s.moisture,s.heat*clear,s.crystal*clear,s.ice],i/3*4);landform.set(s.weights,i);
      if(i<count*3)data.normals.set(surfaceNormal(n,config),i);
    }
    if(i%192===0)yield;
  }
  return {...data,terrainData,landform};
}
export function createTerrainBuildJob({kind='global',config,direction,options={}}){return kind==='global'?globalJob(config,options.segments??64,options.rings??40):patchJob(config,direction,options);}
const complete=job=>{let result;do{result=job.next();}while(!result.done);return result.value;};
export function buildGlobalTerrain(config,segments=64,rings=40){return complete(globalJob(config,segments,rings));}
export function buildTerrainPatch(config,direction,options){return complete(patchJob(config,direction,options));}
// Sample the actual coarse triangles (not a second height function) for LOD morphs.
export function coarsePositions(positions,source,segments,rings){const out=new Float32Array(positions.length);for(let i=0;i<positions.length;i+=3){const n=normalize(Array.from(positions.slice(i,i+3))),u=((Math.atan2(n[2],n[0])/(2*Math.PI)+1)%1)*segments,v=Math.acos(clamp(n[1],-1,1))/Math.PI*rings,x=Math.min(segments-1,Math.floor(u)),y=Math.min(rings-1,Math.floor(v)),fx=u-x,fy=v-y,a=y*(segments+1)+x,b=a+segments+1;const vertices=fx>=fy?[a,a+1,b+1]:[a,b+1,b],weights=fx>=fy?[1-fx,fx-fy,fy]:[1-fy,fx,fy-fx];for(let k=0;k<3;k++)out[i+k]=vertices.reduce((s,index,j)=>s+source[index*3+k]*weights[j],0);}return out;}

