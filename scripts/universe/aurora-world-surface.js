import {createDesolationVisual} from './desolation-visual.js';
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createWorldField} from './aurora-worlds/field.js';
import {createGasProxy} from './aurora-worlds/gas-proxy.js';
import {createWorldTerrain,createWorldFacilities,createWorldLayout,buildingFootprint,localTerrainSampler,FACILITIES,GAS_VARIANTS,MODEL_SCALE,mergeStationary,animateMotions,stableHash,sharedModelGeometries} from './aurora-worlds/source.js';
import {buildingState} from './industrial-models.js';
import {qualityName} from './planet-profile.js';
import {colonyNightStrength,planetOccludesPoint} from './colony-visuals.js';
import {createOrbitalWorkshop,createElevatorConstruction} from './orbital-workshop.js';
import {createDefenseDisplay,defenseDisplayUnit} from './defense-display.js';

export const AURORA_WORLD_VERSION='aurora-worlds-import-20261019';
export const AURORA_PLANET_IDS=Object.freeze(FACILITIES.slice(0,14).map(f=>f.id));
export const AURORA_MOON_IDS=Object.freeze(['Moon_Base','The_EU_X_Radar','Wormhole_Generator','Flagship_Center','Robotics_Facility','Shipyard','Missile_Silo','Metal_Storage','Crystal_Storage','Gas_Storage']);
const stores={Metal_Storage:'Metal_Mine',Crystal_Storage:'Crystal_Mine',Gas_Storage:'Gas_Mine'};
const tuple=v=>Array.isArray(v)?v:v?.toArray?.()||[0,0,0];
const visualStage=level=>Math.min(3,Math.max(1,Math.trunc(level)||1));
const sourceQuality=q=>q==='standard'?'medium':q;
const point=new THREE.Vector3(),quaternion=new THREE.Quaternion();
// The host uses logarithmic depth for interplanetary distances. Keep the supplied
// atmosphere/ring shaders in the same depth space as the standard materials.
function prepareTerrainShaders(root,planetInverse){
 root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){
  if(!m?.isShaderMaterial||m.vertexShader.includes('logdepthbuf_pars_vertex'))continue;
  m.vertexShader='#include <common>\n#include <logdepthbuf_pars_vertex>\n'+m.vertexShader;
  m.vertexShader=m.vertexShader.replace(/}\s*$/, '\n#include <logdepthbuf_vertex>\n}');
  m.fragmentShader='#include <logdepthbuf_pars_fragment>\n'+m.fragmentShader;
  m.fragmentShader=m.fragmentShader.replace(/void main\(\)\s*{/, 'void main() {\n#include <logdepthbuf_fragment>\n');
  m.uniforms.auroraWorldToPlanet=planetInverse;
  m.fragmentShader='uniform mat4 auroraWorldToPlanet;\n'+m.fragmentShader;
  m.fragmentShader=m.fragmentShader.replace('normalize(vNormal)','normalize(mat3(auroraWorldToPlanet)*vNormal)').replace('normalize(cameraPosition - vWorld)','normalize((auroraWorldToPlanet*vec4(cameraPosition-vWorld,0.0)).xyz)');
  m.fragmentShader=m.fragmentShader.replace('float hit = max(0.0, -dot(vWorld, L));','vec3 planetPoint=(auroraWorldToPlanet*vec4(vWorld,1.0)).xyz; float hit = max(0.0, -dot(planetPoint, L));').replace('length(vWorld + L * hit)','length(planetPoint + L * hit)');
 }});
}
function makeProxy(field){
 if(field.type==='gas')return createGasProxy(field);
 // Sample shared vertices once; flat-shaded triangles keep the same silhouette.
 const geometry=new THREE.SphereGeometry(100,20,14),position=geometry.attributes.position,colors=[];
 for(let i=0;i<position.count;i++){
  point.fromBufferAttribute(position,i).normalize();const sample=field.sample(point.x,point.y,point.z);
  point.multiplyScalar(100+Math.max(field.type==='terrestrial'?0.075:-Infinity,sample.height));position.setXYZ(i,point.x,point.y,point.z);
  const c=new THREE.Color().setRGB(...sample.color,THREE.SRGBColorSpace);colors.push(c.r,c.g,c.b);
 }
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true});
 const mesh=new THREE.Mesh(geometry,material);mesh.name='global-terrain';mesh.dispose=()=>{geometry.dispose();material.dispose();};return mesh;
}

// One draw per overview, but its outline, equipment and wings are the actual supplied model.
function bakeOverview(facility){
 const root=facility.root,parts=[],color=new THREE.Color();root.updateWorldMatrix(true,true);
 const inverse=root.matrixWorld.clone().invert();
 root.traverseVisible(o=>{
  if(!o.isMesh||!o.geometry)return;
  let geometry=o.geometry.clone();if(geometry.index){const old=geometry;geometry=old.toNonIndexed();old.dispose();}
  geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));
  for(const name of Object.keys(geometry.attributes))if(!['position','normal'].includes(name))geometry.deleteAttribute(name);
  if(!geometry.attributes.normal)geometry.computeVertexNormals();
  const material=Array.isArray(o.material)?o.material[0]:o.material;
  color.copy(material.color||new THREE.Color(0xffffff));
  const colors=new Float32Array(geometry.attributes.position.count*3);
  for(let i=0;i<colors.length;i+=3)colors.set([color.r,color.g,color.b],i);
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));geometry.clearGroups();parts.push(geometry);
 });
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());
 const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.79,metalness:.06,flatShading:true}));
 mesh.name='aurora-overview/'+facility.id;
 const group=new THREE.Group();group.name='aurora-facility-overview/'+facility.id;
 group.position.copy(root.position);group.quaternion.copy(root.quaternion);group.scale.copy(root.scale);group.add(mesh);
 group.userData={...root.userData,buildingId:facility.id};
 return {root:group,geometry,material:mesh.material};
}

function installState(root){
 const uniforms={night:{value:0},top:{value:1e6},base:{value:new THREE.Vector3()},normal:{value:new THREE.Vector3(0,1,0)},upgrade:{value:0}};
 const materials=new Map();
 root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.isMeshStandardMaterial&&!materials.has(m))materials.set(m,{opacity:m.opacity,transparent:m.transparent,wireframe:m.wireframe});});
 for(const [m]of materials){
  const previous=m.onBeforeCompile,cache=m.customProgramCacheKey.call(m),glass=/glass|blue|cyan/i.test(m.name);
  m.onBeforeCompile=(shader,renderer)=>{
   previous.call(m,shader,renderer);
   Object.assign(shader.uniforms,{auroraNight:uniforms.night,auroraBuildTop:uniforms.top,auroraBuildBase:uniforms.base,auroraBuildUp:uniforms.normal,auroraUpgrade:uniforms.upgrade});
   shader.vertexShader='varying vec3 vAuroraWorld;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvAuroraWorld=(modelMatrix*vec4(transformed,1.0)).xyz;');
   shader.fragmentShader='varying vec3 vAuroraWorld; uniform float auroraNight,auroraBuildTop,auroraUpgrade; uniform vec3 auroraBuildBase,auroraBuildUp;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(dot(vAuroraWorld-auroraBuildBase,auroraBuildUp)>auroraBuildTop)discard;');
   shader.fragmentShader=shader.fragmentShader.replace('vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',`vec3 outgoingLight=(totalDiffuse+totalSpecular)*mix(1.0,0.30,auroraNight)+totalEmissiveRadiance+diffuseColor.rgb*auroraUpgrade*0.10;
   ${glass?'outgoingLight+=vec3(0.16,0.72,0.61)*auroraNight*0.32;':''}`);
  };
  m.customProgramCacheKey=()=>cache+'|aurora-live-state-1|'+glass;
 }
 return {uniforms,update(state,night,maxY){
  uniforms.night.value=night;uniforms.upgrade.value=state.state==='upgrade'?state.progress:0;
  root.getWorldPosition(uniforms.base.value);root.getWorldQuaternion(quaternion);uniforms.normal.value.set(0,1,0).applyQuaternion(quaternion);
  root.getWorldScale(point);uniforms.top.value=state.state==='construction'?maxY*point.y*Math.max(.015,state.progress):1e6;
  const ghost=state.state==='unbuilt';
  for(const [m,original]of materials){const transparent=ghost||original.transparent;if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}m.opacity=ghost?.23:original.opacity;m.wireframe=ghost||original.wireframe;}
  root.userData.buildingState={...state};
 }};
}

export function createAuroraWorldSurface(body,{catalog={},workerURL=true,quality='standard'}={}){
 if(!(body.radius>0))throw new RangeError('Planet radius must be positive');
 const type=body.moon||body.biome==='moon'?'moon':body.biome||'terrestrial';
 const seed=String(body.seed??body.key??body.id??body.coordinates?.join(':')??'planet');
 const field=createWorldField(type,seed),scale=body.radius/field.radius;
 if(type==='gas'){
  field.gasVariant=body.gasVariant||['jupiter','saturn','uranus','neptune'][stableHash(seed+'|gas-variant')%4];
  field.summary=GAS_VARIANTS[field.gasVariant]?.summary||field.summary;
 }
 const root=new THREE.Group(),content=new THREE.Group();root.name='planet/'+(body.key??body.id);content.name='aurora-imported-world';content.scale.setScalar(scale);root.add(content);
 const planetInverse={value:new THREE.Matrix4()};
 const desolation=body.devastation?createDesolationVisual(body.devastation.kind):null;
 const proxy=makeProxy(field);desolation?.apply(proxy);prepareTerrainShaders(proxy,planetInverse);content.add(proxy);
 const ids=type==='moon'?AURORA_MOON_IDS:AURORA_PLANET_IDS;
 const definitions=ids.map(id=>({id,instanceKey:id,name:catalog.buildings?.[id]?.name||FACILITIES.find(f=>f.id===id)?.name||id}));
 const sites=new Map(),fine=new Map(),overviews=new Map(),targets=new Map();
 let layout=null,exclusions=[],terrain=null,disposed=false,visible=true,serial=0,terrainGeneration=0,pending=null,terrainAbort=null,currentQuality=qualityName(quality),lastPlanet=null,lastCatalog=catalog,selected=null,clock=null;
 let defenseDisplay=null,defensePreviewId=null;
 function syncDefenseDisplay(id,visible=false){
  if(!id){defenseDisplay?.dispose();defenseDisplay=null;return;}
  if(defenseDisplay?.root.userData.unitId!==id){defenseDisplay?.dispose();defenseDisplay=createDefenseDisplay(id);root.add(defenseDisplay.root);defenseDisplay.root.userData.buildingId='Missile_Silo';}
  const anchor=target('Missile_Silo')?.defenseDisplay;if(!anchor){defenseDisplay.root.visible=false;return;}
  defenseDisplay.root.position.fromArray(anchor.position);defenseDisplay.root.quaternion.fromArray(anchor.quaternion);defenseDisplay.root.scale.setScalar(anchor.radius);defenseDisplay.root.visible=visible;
 }
 const eyeLocal=new THREE.Vector3(),sunLocal=new THREE.Vector3(),inverse=new THREE.Matrix4(),sphere=new THREE.Sphere(),frustum=new THREE.Frustum(),projection=new THREE.Matrix4();
 const stats={version:AURORA_WORLD_VERSION,artStatus:AURORA_WORLD_VERSION,quality:currentQuality,appearance:{version:AURORA_WORLD_VERSION,key:seed,seed:field.seedInt,biome:type,styleName:field.summary,gasVariant:field.gasVariant},
  buildings:[],modelCacheLimit:4,cachedModels:0,overviewModels:0,visibleBuildings:0,animatedBuildings:0,distributedSites:ids.length,terrain:{globalReady:false,pending:0,worker:false},scale:{planetRadius:body.radius,modelScale:MODEL_SCALE*scale}};
 const alias=id=>type==='moon'?id:stores[id]||id;
 function ensureLayout(){
  if(layout)return;
  layout=createWorldLayout(field,definitions);for(const site of layout)sites.set(site.entry.id,site);
  exclusions=[];
  if(type!=='gas')for(const site of layout){
   if(['Gas_Mine','Flagship_Center'].includes(site.entry.id))continue;
   const sample=localTerrainSampler(field,site.direction,site.quaternion,site.radius);
   for(const contact of buildingFootprint(site.entry.id).contacts){const ground=sample(contact.center[0],contact.center[2],2);exclusions.push({direction:ground.direction.toArray(),angularRadius:(contact.radius*MODEL_SCALE+.38)/(field.radius+ground.sample.height),facilityId:site.entry.id,footprint:contact.name});}
  }
  stats.layout=layout.map(s=>({id:s.entry.id,position:s.direction.clone().multiplyScalar(s.radius).toArray(),heading:s.heading}));
  if(terrain||pending)buildTerrain();
 }
 function buildTerrain(){
  if(disposed)return Promise.resolve();
  terrainAbort?.abort();terrainAbort=new AbortController();const signal=terrainAbort.signal;
  const generation=++terrainGeneration;stats.terrain.pending=1;
  const task=createWorldTerrain(field,{quality:sourceQuality(currentQuality),worker:!!workerURL,exclusions,signal}).then(next=>{
   if(disposed||generation!==terrainGeneration){next.dispose();return;}
   prepareTerrainShaders(next.root,planetInverse);desolation?.apply(next.root);
   terrain?.root.removeFromParent();terrain?.dispose();terrain=next;terrain.root.name='aurora-world-terrain';content.add(terrain.root);proxy.visible=false;
   stats.terrain={...next.stats,globalReady:true,pending:0};
  }).catch(error=>{if(signal.aborted)return;if(!disposed&&generation===terrainGeneration){stats.terrain.pending=0;stats.terrain.error=String(error.message||error);}throw error;});
  pending=task;task.catch(()=>{});return task;
 }
 function disposeEntry(entry){entry.workshop?.dispose();entry.elevatorConstruction?.dispose();entry.facility.root.removeFromParent();entry.assembly.dispose();entry.geometries.forEach(g=>g.dispose());}
 function dropFine(id){const entry=fine.get(id);if(!entry)return;disposeEntry(entry);fine.delete(id);}
 function dropOverview(id){const entry=overviews.get(id);if(!entry)return;entry.root.removeFromParent();entry.geometry.dispose();entry.material.dispose();overviews.delete(id);}
 function makeFull(site,stage){
  const assembly=createWorldFacilities(field,{buildings:[{...site.entry,visualStage:stage}],placements:[{...site,entry:{...site.entry,visualStage:stage}}]}),facility=assembly.facilities[0];
  // Source primitives are CPU templates shared by every factory. GPU-resident
  // moving parts belong to this cache entry, so evicting it cannot affect another.
  const shared=sharedModelGeometries(),copies=new Map();facility.root.traverse(o=>{if(!o.geometry||!shared.has(o.geometry))return;if(!copies.has(o.geometry))copies.set(o.geometry,o.geometry.clone());o.geometry=copies.get(o.geometry);});
  const geometries=new Set();facility.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});
  const dock=facility.model.getObjectByName('Orbital_Dock');
  let workshop=null,elevatorConstruction=null;
  if(dock){
   dock.getObjectByName('Orbital_Berth_1').visible=false;
   workshop=createOrbitalWorkshop();workshop.root.position.set(0,.2,14);dock.add(workshop.root);
   elevatorConstruction=createElevatorConstruction(facility.model,dock.position.y+9.7);
  }else if(site.entry.id==='Flagship_Center'){
   facility.model.getObjectByName('Iron_Behemoth_under_construction').visible=false;
   workshop=createOrbitalWorkshop({openWorkshop:false});facility.model.add(workshop.root);
  }
  workshop?.update({state:{level:0,state:'unbuilt'},now:0,time:0});
  facility.root.updateWorldMatrix(true,true);
  const localBox=new THREE.Box3(),localPoint=new THREE.Vector3(),inv=facility.root.matrixWorld.clone().invert();
  facility.root.traverse(o=>{if(!o.isMesh)return;let p=o,orbital=false;while(p&&p!==facility.root){if(['Orbital_Dock','Twin_Cables','Cable_Carriage'].includes(p.name))orbital=true;p=p.parent;}if(orbital)return;
   const matrix=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld),position=o.geometry.attributes.position;for(let i=0;i<position.count;i++)localBox.expandByPoint(localPoint.fromBufferAttribute(position,i).applyMatrix4(matrix));
  });
  const center=localBox.getCenter(new THREE.Vector3()),dimensions=localBox.getSize(new THREE.Vector3()),normal=site.direction.toArray();
  const target={id:site.entry.id,position:facility.root.localToWorld(center.clone()).multiplyScalar(scale).toArray(),basePosition:facility.position.clone().multiplyScalar(scale).toArray(),normal,
   radius:Math.max(dimensions.x,dimensions.y,dimensions.z)*MODEL_SCALE*scale*.52,footprint:facility.footprintRadius*scale,
   cameraOffset:new THREE.Vector3(.65,.60,.90).applyQuaternion(site.quaternion).toArray()};
  if(site.entry.id==='Missile_Silo'){
   const radius=Math.max(dimensions.x,dimensions.z)*.12;
   const local=new THREE.Vector3(localBox.max.x+radius*1.35,localBox.min.y+.2,center.z);
   const anchor=facility.root.localToWorld(local).multiplyScalar(scale);
   // Follow the actual terrain height, including floating gas-planet platforms.
   const direction=anchor.clone().normalize(),height=field.sample(direction.x,direction.y,direction.z).height*scale;
   anchor.addScaledVector(direction,Math.max(0,body.radius+height+radius*MODEL_SCALE*scale*.12-anchor.length()));
   target.defenseDisplay={position:anchor.toArray(),quaternion:site.quaternion.toArray(),radius:radius*MODEL_SCALE*scale};
  }
  if(dock){
   const box=new THREE.Box3().setFromObject(dock),station=box.getCenter(new THREE.Vector3()),r=box.getSize(new THREE.Vector3()).length()*.5*scale;
   Object.assign(target,{station:station.clone().multiplyScalar(scale).toArray(),stationRadius:r,shipyard:station.clone().multiplyScalar(scale).toArray(),shipyardRadius:r,
    preview:station.clone().multiplyScalar(scale).addScaledVector(site.direction,r+2.5).toArray(),
    overview:facility.position.clone().lerp(station,.5).multiplyScalar(scale).toArray(),overviewRadius:station.distanceTo(facility.position)*scale*.56,
    overviewCameraOffset:new THREE.Vector3(.82,.15,.78).applyQuaternion(site.quaternion).toArray()});
  }
  if(workshop){
   target.construction=workshop.root.localToWorld(new THREE.Vector3(...workshop.center)).multiplyScalar(scale).toArray();
   target.constructionRadius=workshop.radius*MODEL_SCALE*scale;
   target.constructionCameraOffset=new THREE.Vector3(.83,.37,.82).applyQuaternion(site.quaternion).toArray();
  }
  // The build reveal must reach the terminal, not stop at the ground fork.
  const maxY=dock?dock.position.y+9.7:localBox.max.y;
  targets.set(site.entry.id,target);
  const old=overviews.get(site.entry.id);
  if(!old||old.stage!==stage){dropOverview(site.entry.id);const overview=bakeOverview(facility);overview.stage=stage;overview.maxY=maxY;overview.state=installState(overview.root);content.add(overview.root);overviews.set(site.entry.id,overview);}
  for(const geometry of mergeStationary(facility))geometries.add(geometry);
  facility.root.userData.buildingId=facility.id;content.add(facility.root);
  return {assembly,facility,geometries,stage,maxY,workshop,elevatorConstruction,state:installState(facility.root),age:serial,animationTime:0};
 }
 function ensureModel(site,stage,retain){
  let entry=fine.get(site.entry.id);
  if(entry&&entry.stage!==stage){dropFine(site.entry.id);entry=null;}
  if(entry){entry.age=serial;return entry;}
  entry=makeFull(site,stage);
  if(retain){
   while(fine.size>=stats.modelCacheLimit){const victim=[...fine.entries()].filter(([id])=>id!==selected).sort((a,b)=>a[1].age-b[1].age)[0];if(!victim)break;dropFine(victim[0]);}
   fine.set(site.entry.id,entry);return entry;
  }
  disposeEntry(entry);return null;
 }
 function target(id){
  id=alias(id);ensureLayout();const site=sites.get(id);if(!site)return null;
  if(!targets.has(id))ensureModel(site,visualStage(lastPlanet?.buildings?.[id]),false);
  return targets.get(id);
 }
 const surface={root,stats,field,buildingTarget:target,
  get defenseDisplay(){return defenseDisplay;},
  desolation,
  setDefensePreview(id){defensePreviewId=id;syncDefenseDisplay(defenseDisplayUnit(lastPlanet,id,lastCatalog.units),true);return !!defenseDisplay;},
  heightAt(direction){point.fromArray(tuple(direction)).normalize();return field.sample(point.x,point.y,point.z).height*scale;},
  normalAt(direction){return tuple(direction).map((n,i,a)=>n/(Math.hypot(...a)||1));},
  cameraHeightAt(direction){const height=this.heightAt(direction);return type==='gas'?Math.max(height,8*scale):Math.max(type==='terrestrial'?.075*scale:-Infinity,height)+.3*scale;},
  setQuality(value){const next=qualityName(value);if(disposed||next===currentQuality)return pending||Promise.resolve();currentQuality=next;stats.quality=next;return terrain||pending?buildTerrain():Promise.resolve();},
  setVisible(value){visible=!!value;root.visible=visible;if(!visible){clock=null;if(stats.terrain.pending){terrainGeneration++;terrainAbort?.abort();pending=null;stats.terrain.pending=0;}}},
  async ready(){if(lastPlanet)ensureLayout();await (pending||buildTerrain());},
  update({time=0,weatherTime=time,eye,origin=[0,0,0],camera,planet,catalog:nextCatalog=lastCatalog,selectedBuilding,light=body.sunDirection||[-.55,.42,-.72],now=Date.now(),viewportHeight=900,detailEnabled=true}={}){
   if(disposed||!visible)return;
   serial++;if(body.devastation)planet=null;lastPlanet=planet||null;lastCatalog=nextCatalog||{};selected=selectedBuilding?alias(typeof selectedBuilding==='string'?selectedBuilding:selectedBuilding.id):null;
   const dt=clock===null?0:Math.min(.1,Math.max(0,time-clock));clock=time;
   root.updateWorldMatrix(true,true);inverse.copy(root.matrixWorld).invert();planetInverse.value.copy(content.matrixWorld).invert();
   if(eye)eyeLocal.fromArray(tuple(eye)).sub(point.fromArray(tuple(origin)));else eyeLocal.copy(camera?.position||point.set(0,0,body.radius*4));
   eyeLocal.applyMatrix4(inverse);sunLocal.fromArray(tuple(light)).transformDirection(inverse);
   const focal=viewportHeight/(2*Math.tan((camera?.fov||50)*Math.PI/360)),pixels=body.radius*focal/Math.max(1,eyeLocal.length());
   // A system-view planet is only a few pixels wide. Do not run natural-site
   // searches or construct the orbital dock until its facilities can be seen.
   const colonyVisible=!!planet&&(pixels>40||!!selected);
   if(colonyVisible)ensureLayout();
   if((!terrain||terrain.stats.quality!==sourceQuality(currentQuality))&&!pending&&detailEnabled&&pixels>40)buildTerrain();
   proxy.setLight?.(sunLocal);
   if(terrain){terrain.update?.(weatherTime);terrain.setLight?.(sunLocal);stats.weather=type==='gas'?{variant:field.gasVariant,cloudDecks:terrain.stats.cloudDecks,solidSurface:false}:null;}
   if(camera){camera.updateMatrixWorld();projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);}
   for(const entry of fine.values())entry.facility.root.visible=false;for(const entry of overviews.values())entry.root.visible=false;
   if(defenseDisplay)defenseDisplay.root.visible=false;
   const defenseId=defenseDisplayUnit(planet,defensePreviewId,lastCatalog.units);
   if(!defenseId)syncDefenseDisplay(null);
   stats.buildings=[];stats.visibleBuildings=0;stats.animatedBuildings=0;
   const candidates=[];
   if(colonyVisible)for(const site of layout){
    const id=site.entry.id,state=buildingState(planet,id,lastCatalog,now),chosen=id===selected;
    if(state.state==='unbuilt'&&!chosen&&!(id==='Missile_Silo'&&defenseId))continue;
    const position=site.direction.clone().multiplyScalar(site.radius*scale),distance=eyeLocal.distanceTo(position),footprint=buildingFootprint(id).radius*MODEL_SCALE*scale;
    const projected=footprint*focal/Math.max(scale,distance);
    let inView=projected>.7&&!planetOccludesPoint(eyeLocal.toArray(),position.toArray(),body.radius*(type==='gas'?1:.98));
    if(inView&&camera){sphere.center.copy(position);root.localToWorld(sphere.center);sphere.radius=footprint*1.5;inView=frustum.intersectsSphere(sphere);}
    let stationVisible=false,detailProjected=projected;
    if(id==='Shipyard'&&projected>.7){const t=target(id),station=t.station;stationVisible=!planetOccludesPoint(eyeLocal.toArray(),station,body.radius);
     if(stationVisible)detailProjected=Math.max(projected,t.stationRadius*focal/Math.max(scale,eyeLocal.distanceTo(new THREE.Vector3(...station))));}
    if(inView||chosen||stationVisible)candidates.push({site,state,inView,chosen,projected,detailProjected,distance,stationVisible});
   }
   candidates.sort((a,b)=>Number(b.chosen)-Number(a.chosen)||a.distance-b.distance);
   const threshold=currentQuality==='low'?260:currentQuality==='high'?100:160;
   const retained=new Set(candidates.filter(c=>c.chosen||c.detailProjected>threshold).slice(0,stats.modelCacheLimit).map(c=>c.site.entry.id));
   for(const candidate of candidates){
    const {site,state,inView,projected,stationVisible}=candidate,id=site.entry.id,stage=visualStage(state.level);
    let entry=fine.get(id),coarse=overviews.get(id);
    if(!coarse||coarse.stage!==stage||retained.has(id)&&(!entry||entry.stage!==stage))entry=ensureModel(site,stage,retained.has(id));
    coarse=overviews.get(id);entry=retained.has(id)?fine.get(id):null;
    const night=colonyNightStrength(site.direction.toArray(),sunLocal.toArray());
    if(entry){entry.facility.root.visible=inView||stationVisible||candidate.chosen;entry.animationTime+=dt*state.rate;animateMotions(entry.assembly.motions,entry.animationTime);entry.state.update(state,night,entry.maxY);entry.workshop?.update({state,now,time});entry.elevatorConstruction?.update(state,time);if(state.rate>0)stats.animatedBuildings++;}
    coarse.root.visible=!entry&&(inView||stationVisible);coarse.state.update(state,night,coarse.maxY);
    if(id==='Missile_Silo'&&defenseId)syncDefenseDisplay(defenseId,inView||candidate.chosen);
    if(inView)stats.visibleBuildings++;
    stats.buildings.push({id,state:state.state,level:state.level,visualStage:stage,rate:state.rate,progress:state.progress,position:targets.get(id).basePosition,visible:inView,stationVisible,cableVisible:inView||stationVisible,groundDetail:!!entry,nightStrength:night,construction:entry?.workshop?{...entry.workshop.ship.stats}:null});
   }
   stats.cachedModels=fine.size;stats.overviewModels=overviews.size;
  },
  pick(raycaster){
   if(disposed||!lastPlanet)return null;root.updateWorldMatrix(true,true);const meshes=[];
   for(const entry of fine.values())entry.facility.root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
   for(const entry of overviews.values())entry.root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
   defenseDisplay?.root.traverseVisible(o=>{if(o.isMesh)meshes.push(o);});
   const hit=raycaster.intersectObjects(meshes,false)[0];if(!hit)return null;
   const blocker=raycaster.intersectObjects(terrain?terrain.root.children:[proxy],true).find(h=>h.object.userData.terrainSurface||h.object===proxy);
   if(blocker&&blocker.distance<hit.distance-.02*scale)return null;
   let node=hit.object;while(node&&!node.userData.buildingId)node=node.parent;
   return node?{id:node.userData.buildingId,buildingId:node.userData.buildingId,point:hit.point.toArray(),distance:hit.distance,target:target(node.userData.buildingId)}:null;
  },
  dispose(){if(disposed)return;disposed=true;terrainGeneration++;terrainAbort?.abort();terrain?.dispose();defenseDisplay?.dispose();defenseDisplay=null;for(const id of [...fine.keys()])dropFine(id);for(const id of [...overviews.keys()])dropOverview(id);proxy.dispose();root.clear();}
 };
 return surface;
}

// Compile the actual live-state programs without another Scene, camera or renderer.
export function createAuroraWorldPrewarm(){
 const surface=createAuroraWorldSurface({key:'material-prewarm',radius:100,biome:'terrestrial'},{workerURL:null});
 surface.update({planet:{buildings:{Research_Lab:3}},selectedBuilding:'Research_Lab',detailEnabled:false});
 const root=new THREE.Group();root.name='planet-material-prewarm';
 const geometry=new THREE.BoxGeometry(1,1,1),materials=[],seen=new Set();
 geometry.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count*3).fill(1),3));
 surface.root.traverse(o=>{for(const original of Array.isArray(o.material)?o.material:[o.material]){
  if(!original||seen.has(original))continue;seen.add(original);
  const material=original.clone();material.onBeforeCompile=original.onBeforeCompile;material.customProgramCacheKey=original.customProgramCacheKey;materials.push(material);root.add(new THREE.Mesh(geometry,material));
 }});
 surface.dispose();let disposed=false;
 return {root,dispose(){if(disposed)return;disposed=true;geometry.dispose();materials.forEach(m=>m.dispose());root.clear();}};
}

