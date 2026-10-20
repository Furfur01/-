import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createCampus} from './campus/scene.js';
import {createBuilding} from './campus/models.js';
import {floatingPlatforms} from './campus/space-environment.js';
import {builder,materials as campusMaterials,chamfer} from './campus/primitives.js';
import {capsule,hangar,dockingCollar} from './campus/space-parts.js';
import {DISTRICT_VERSION,districtKind,districtDimensions,districtPlots,districtPlan,districtHeightField,districtConstructionOrder,districtNeighborhoods} from './aurora-district-layout.js';
import {createColonyLightPools} from './colony-night-lighting.js';

function coloredGeometry(mesh){
  const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();g.applyMatrix4(mesh.matrixWorld);
  for(const key of Object.keys(g.attributes))if(!['position','normal'].includes(key))g.deleteAttribute(key);
  const c=mesh.material.color||new THREE.Color(0xffffff),color=new Float32Array(g.attributes.position.count*3);for(let i=0;i<color.length;i+=3)color.set([c.r,c.g,c.b],i);g.setAttribute('color',new THREE.BufferAttribute(color,3));return g;
}
function mergeColored(root){root.updateMatrixWorld(true);const gs=[];root.traverse(o=>{if(o.isMesh)gs.push(coloredGeometry(o));});const out=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());return out;}
export function createDistrictResources(){
  const source=new THREE.Group(),mats=campusMaterials(),g=builder(source,mats);
  g.box([0,.4,0],[1.05,.45,2.2],'roof');g.box([0,.85,-.7],[1.05,.7,.8],'white');g.box([0,.9,-1.12],[.8,.35,.06],'glass');g.box([0,.85,.4],[1,.6,1.25],'teal');
  for(const x of[-.57,.57])for(const z of[-.7,.7])g.cylinder([x,.3,z],.28,.18,'dark',[0,0,Math.PI/2]);g.finish();const truck=mergeColored(source);source.traverse(o=>o.geometry?.dispose());Object.values(mats).forEach(m=>m.dispose());
  let disposed=false;return {truck,overviews:new Map(),dispose(){if(disposed)return;disposed=true;truck.dispose();for(const item of this.overviews.values())item.geometry.dispose();this.overviews.clear();}};
}
function nightMaterials(mats){
  const uniform={value:0},base=new Map();
  for(const m of new Set(Object.values(mats))){base.set(m,m.emissiveIntensity||0);m.onBeforeCompile=shader=>{shader.uniforms.uCampusNight=uniform;shader.fragmentShader='uniform float uCampusNight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;','vec3 outgoingLight = (totalDiffuse + totalSpecular) * mix(1.0,0.14,uCampusNight) + totalEmissiveRadiance + diffuseColor.rgb * vec3(.035,.055,.08) * uCampusNight;');};m.customProgramCacheKey=()=> 'aurora-approved-campus-night-1';}
  return strength=>{uniform.value=strength;for(const [m,v]of base)m.emissiveIntensity=v+(m.emissive?.getHex()?strength*.8:0);};
}
function overviewTemplate(id,gas,resources){
  const key=`${id}/${gas}`;if(resources.overviews.has(key))return resources.overviews.get(key);
  const p=districtPlan(id),field=districtHeightField(id,{gas}),order=districtConstructionOrder(id),mats=campusMaterials(),stages=[],gs=[];
  if(gas){const platforms=new THREE.Group(),courts=p.zones.filter(z=>p.buildings.some(b=>b.zone===z.id)).map(z=>[...z.bounds]);floatingPlatforms(platforms,{courts},mats,{clouds:false});gs.push(mergeColored(platforms));platforms.traverse(o=>o.geometry?.dispose());}
  for(const nodeId of order){const b=p.buildings.find(b=>b.id===nodeId);let model;
    if(b.role!=='support')model=createBuilding(b,p,mats);
    else{model=new THREE.Group();const g=builder(model,mats);capsule(g,0,0,b.w*.96,b.d*.96,b.h,{glass:true});g.finish();}
    model.position.set(b.x-80,field.pads.find(n=>n.id===b.id).level+.08,b.y-70);gs.push(mergeColored(model));stages.push(gs.reduce((sum,g)=>sum+g.attributes.position.count,0));model.traverse(o=>o.geometry?.dispose());
  }
  const geometry=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());Object.values(mats).forEach(m=>m.dispose());geometry.computeBoundingBox();geometry.computeBoundingSphere();const data={geometry,stages};resources.overviews.set(key,data);return data;
}
export function createDistrictOverview(id,{resources,gas=false}={}){
  const owned=!resources;resources||=createDistrictResources();const {geometry,stages}=overviewTemplate(id,gas,resources);
  // A private draw range allows each planet to construct at its own pace; attributes are shared.
  const geo=new THREE.BufferGeometry();for(const [key,a]of Object.entries(geometry.attributes))geo.setAttribute(key,a);geo.boundingBox=geometry.boundingBox;geo.boundingSphere=geometry.boundingSphere;
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.04,flatShading:true}),mesh=new THREE.Mesh(geo,material),root=new THREE.Group();root.name=`aurora-overview/${id}`;root.userData.buildingId=id;root.add(mesh);const setNight=nightMaterials({material});let disposed=false;
  return {root,mesh,stats:{buildingCount:stages.length},setState(s){const count=s.state==='unbuilt'?0:s.state==='construction'?Math.ceil(Math.max(0,Math.min(1,s.progress))*stages.length):stages.length;geo.setDrawRange(0,count?stages[count-1]:0);},setNight,dispose(){if(disposed)return;disposed=true;geo.dispose();material.dispose();root.clear();if(owned)resources.dispose();}};
}
function batchCampus(campus,order){
  const buckets=new Map(),stageMap=new Map(order.map((id,i)=>[id,i+1])),moving=new Set();
  for(const a of campus.actuators)a.object.traverse(o=>moving.add(o));campus.dynamic.traverse(o=>moving.add(o));
  campus.root.updateMatrixWorld(true);const original=[];
  campus.root.traverse(o=>{
    if(!o.isMesh||moving.has(o))return;
    let ancestor=o,stage=0;while(ancestor&&ancestor!==campus.root){if(ancestor.userData.building){stage=stageMap.get(ancestor.userData.building.id);break;}ancestor=ancestor.parent;}
    const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);for(const a of Object.keys(geometry.attributes))if(!['position','normal'].includes(a))geometry.deleteAttribute(a);
    if(!buckets.has(o.material))buckets.set(o.material,[]);buckets.get(o.material).push({geometry,stage});original.push(o);
  });
  const batches=[];
  for(const [material,parts]of buckets){parts.sort((a,b)=>a.stage-b.stage);const geometry=mergeGeometries(parts.map(p=>p.geometry),false),stages=[];let count=0;for(const p of parts){count+=p.geometry.attributes.position.count;stages.push({stage:p.stage,count});p.geometry.dispose();}geometry.computeBoundingBox();geometry.computeBoundingSphere();const mesh=new THREE.Mesh(geometry,material);mesh.name='campus-batch/'+material.uuid;mesh.castShadow=true;mesh.receiveShadow=true;campus.root.add(mesh);batches.push({mesh,stages});}
  for(const o of original){o.removeFromParent();o.geometry.dispose();}return batches;
}
function orbitalTerminal(station,cable,mats,height,baseLevel){
  const g=builder(station,mats),c=builder(cable,mats),z=-6;
  g.extrude(chamfer(0,z,26,25,5),1.4,height,'roof');capsule(g,0,z,17,16,7); // Build the terminal independently of the ground headquarters.
  // Move the capsule geometry to orbital altitude before merging the station.
  // Other terminal members are explicitly in orbital coordinates.
  for(const x of[-22,22]){
    g.box([x/2,height+.8,z],[22,.8,2],'ivory');for(const dz of[-10,10]){
      g.box([x,height+.7,z+dz],[13,1.2,15],'roof');for(const dx of[-5.6,5.6]){g.box([x+dx,height+4.8,z+dz],[.6,7,14],'ivory');g.box([x+dx,height+8.4,z+dz],[1,.4,15],'gold');}
      g.box([x,height+1.5,z+dz],[9,.3,12],'concrete');g.box([x,height+8.4,z+dz],[12,.35,.65],'ivory');
    }
  }
  // The central pressure hull is authored locally, unlike the surrounding berth geometry.
  g.finish();for(const mesh of station.children){const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++)if(a.getY(i)<20)a.setY(i,a.getY(i)+height+1.4);a.needsUpdate=true;mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();}
  for(const x of[-1.2,1.2])c.beam([x,baseLevel+39,z],[x,height,z],.16,'ivory');c.finish();
}
export function createAuroraDistrict(id,{resources,gas=false,biome='terrestrial',stationHeight=1040}={}){
  const owned=!resources;resources||=createDistrictResources();
  const campus=createCampus(id,{review:false,gas,biome,renderGround:false}),root=new THREE.Group(),near=campus.root,far=new THREE.Group(),effects=new THREE.Group(),station=new THREE.Group(),cable=new THREE.Group();
  root.name=`aurora-district/${id}`;root.userData={buildingId:id,artStatus:DISTRICT_VERSION};for(const [name,o]of Object.entries({near,far,effects,station,cable})){o.name=name;root.add(o);}
  const p=campus.plan,plots=districtPlots(id),order=districtConstructionOrder(id),batches=batchCampus(campus,order),size=districtDimensions(id),setNight=nightMaterials(campus.mats);
  const trucks=new THREE.InstancedMesh(resources.truck,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}),campus.movers.length),temp=new THREE.Object3D();trucks.name='working-logistics';effects.add(trucks);trucks.frustumCulled=false;
  for(const m of campus.movers){m.model.traverse(o=>o.geometry?.dispose());m.model.clear();}
  const lines=[];for(const nodeId of order){const b=p.buildings.find(b=>b.id===nodeId),y=campus.terrain.pads.find(n=>n.id===b.id).level,w=b.w/2+.2,d=b.d/2+.2,h=b.h+.3,cs=[[-w,-d],[w,-d],[w,d],[-w,d]].map(([x,z])=>[b.x-80+x,b.y-70+z]);for(let i=0;i<4;i++){const a=cs[i],b=cs[(i+1)%4];lines.push(a[0],y,a[1],b[0],y,b[1],a[0],y,a[1],a[0],y+h,a[1],a[0],y+h,a[1],b[0],y+h,b[1]);}}
  const scaffold=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(lines,3)),new THREE.LineBasicMaterial({color:0xe9a82d}));scaffold.name='construction-scaffolds';root.add(scaffold);
  const pools=districtNeighborhoods(id).map(n=>[n.x,campus.terrain.surfaceHeight(n.x+80,n.z+70)+.3,n.z,Math.min(8,n.width*.35),Math.min(8,n.depth*.35)]),lightPools=createColonyLightPools({THREE,parent:root,pools});lightPools.mesh.name='aurora-night-plazas';
  let stationMats=null,stationNight=null,assembly=null;
  if(id==='Shipyard'){
    stationMats=campusMaterials();orbitalTerminal(station,cable,stationMats,stationHeight,campus.terrain.pads.find(b=>b.id==='base').level);stationNight=nightMaterials(stationMats);
    assembly=new THREE.Group();assembly.name='ship-production-keel';const a=builder(assembly,stationMats);a.extrude(chamfer(0,0,6,12,2),1.7,0,'ivory');a.box([0,2,2],[3,.6,4],'glass');a.box([0,.8,-1],[12,.4,4],'roof');a.finish();assembly.position.set(-22,stationHeight+1.7,-16);station.add(assembly);
  }
  let state={state:'unbuilt',rate:0,progress:0},elapsed=0,disposed=false,builtCount=0,lastProgress=-1;
  const stats={version:DISTRICT_VERSION,buildingCount:plots.length,footprint:[size.width,size.depth],maxPrimaryHeight:Math.max(...p.buildings.filter(b=>b.role==='primary').map(b=>b.h)),maxOrdinaryHeight:Math.max(...p.buildings.filter(b=>b.role==='support').map(b=>b.h)),batches:batches.length,kind:districtKind(id),constructionOrder:order,gas,source:'approved-campus'};root.userData.district=stats;
  return {root,near,far,effects,station,cable,stats,plots,footprint:stats.footprint,anchors:{ground:[0,0,0],view:[...size.center.slice(0,1),size.maxHeight*.4,size.center[1]],station:id==='Shipyard'?[0,stationHeight,-6]:null},
    setState(next){state={...next};root.userData.state=state;const progress=state.state==='unbuilt'?0:state.state==='construction'?Math.max(0,Math.min(1,state.progress)):1;
      if(progress!==lastProgress){builtCount=Math.ceil(progress*order.length);for(const {mesh,stages}of batches){const n=stages.filter(s=>s.stage<=builtCount).at(-1)?.count||0;mesh.geometry.setDrawRange(0,n);}lastProgress=progress;stats.constructedCount=builtCount;}
    },
    update(dt,{detail=true,visible=true,stationVisible=false,cableVisible=stationVisible,nightStrength=0,stationNightStrength=nightStrength}={}){
      if(disposed)return;const built=state.state!=='unbuilt',complete=built&&state.state!=='construction';root.visible=visible||stationVisible||cableVisible;
      near.visible=visible&&built;far.visible=false;station.visible=stationVisible&&complete;cable.visible=cableVisible&&built;effects.visible=visible&&detail&&complete&&state.rate>0;
      scaffold.visible=visible&&detail&&['unbuilt','construction','upgrade'].includes(state.state);scaffold.geometry.setDrawRange(state.state==='upgrade'?0:builtCount*24,(state.state==='upgrade'?order.length:order.length-builtCount)*24);
      setNight(nightStrength);stationNight?.(stationNightStrength);lightPools.update(nightStrength,visible&&built);if(assembly){assembly.visible=!!state.queue&&complete;assembly.scale.z=.25+.75*(state.queueProgress||0);}
      for(const a of campus.actuators){let o=a.object;while(o&&!o.userData.building)o=o.parent;const index=order.indexOf(o?.userData.building?.id);a.object.visible=index<0||index<builtCount;}
      if(effects.visible){elapsed+=Math.max(0,Math.min(.1,dt))*state.rate;campus.update(elapsed);campus.movers.forEach((m,i)=>{temp.position.copy(m.model.position);temp.rotation.copy(m.model.rotation);temp.scale.set(1,1,1);temp.updateMatrix();trucks.setMatrixAt(i,temp.matrix);});trucks.instanceMatrix.needsUpdate=true;}
    },
    dispose(){if(disposed)return;disposed=true;campus.dispose();trucks.dispose();trucks.material.dispose();lightPools.dispose();scaffold.geometry.dispose();scaffold.material.dispose();for(const group of[station,cable])group.traverse(o=>o.geometry?.dispose());if(stationMats)Object.values(stationMats).forEach(m=>m.dispose());root.clear();if(owned)resources.dispose();}
  };
}
