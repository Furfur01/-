import {createConstructionCoverage} from './construction-coverage.js';
import {createCampusTerrainPatch} from './campus-terrain-patch.js';
import * as THREE from 'three';
import {INDUSTRIAL_IDS,makeContinuousConfig,createContinuousTerrainField,terrainHeight,cameraSurfaceHeight,surfaceNormal,industrialUnit,scaleEvidence,tangentFrame,clamp,capitalGrade,CONTINUOUS_PLANET_VERSION} from './terrain.js';
import {qualityName} from './planet-profile.js';
import {createPlanetAsset} from './continuous-planets/createPlanetAsset.js';
import {createTerrainMaterial,createLiquidMaterial} from './continuous-planets/materials.js';
import {SharedPlanetTilePool} from './continuous-worker-pool.js';
import {buildingState} from './industrial-models.js';
import {createAuroraDistrict,createDistrictResources,createDistrictOverview} from './aurora-district-model.js';
import {DISTRICT_VERSION,districtPlan,districtDimensions,districtHeightField} from './aurora-district-layout.js';
import {COLONY_ELEVATOR_HEIGHT_RATIO,colonyNightStrength,orbitalNightStrength,planetOccludesPoint} from './colony-visuals.js';

const tuple=v=>Array.isArray(v)?v:v?.toArray?.()||[0,0,0];
const styleNames={terrestrial:'大陆山海',mercury:'黑曜熔脉',mars:'赤色晶原',gas:'风暴云海'};

// A tiny immediate globe covers the interval before the first Worker roots are
// available. Distant bodies use it without scheduling hundreds of terrain tiles.
function createProxy(field,type,radius,coverage){
  const geometry=new THREE.SphereGeometry(radius,16,10),p=geometry.attributes.position;
  const color=new Float32Array(p.count*3),hints=new Float32Array(p.count*2),liquidHints=new Float32Array(p.count*2),liquidPosition=new Float32Array(p.count*3);
  const d=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
    d.fromBufferAttribute(p,i).normalize();const s=field.sample(d.x,d.y,d.z);
    p.setXYZ(i,d.x*radius*(1+s.height),d.y*radius*(1+s.height),d.z*radius*(1+s.height));
    color.set(s.color,i*3);hints.set([s.lava||0,s.crystal||0],i*2);
    liquidHints.set([type==='mercury'?s.lava||0:1,Math.max(0,(s.liquidHeight??0)-s.height)],i*2);
    liquidPosition.set(d.clone().multiplyScalar(radius*(type==='mercury'?.984002:1.000002)).toArray(),i*3);
  }
  geometry.computeVertexNormals();geometry.computeBoundingSphere();
  geometry.setAttribute('color',new THREE.BufferAttribute(color,3));
  geometry.setAttribute('aHints',new THREE.BufferAttribute(hints,2));
  geometry.setAttribute('aCoarse',p.clone());geometry.setAttribute('aCoarseNormal',geometry.attributes.normal.clone());
  geometry.setAttribute('aEdge',new THREE.BufferAttribute(new Float32Array(p.count*4),4));
  const material=createTerrainMaterial(THREE,type,radius,coverage),mesh=new THREE.Mesh(geometry,material);mesh.name='global-terrain';
  const root=new THREE.Group();root.name='distant-planet';root.add(mesh);
  let liquid;
  if(type==='terrestrial'||type==='mercury'){
    const g=geometry.clone();g.setAttribute('position',new THREE.BufferAttribute(liquidPosition,3));g.setAttribute('aCoarse',g.attributes.position.clone());g.setAttribute('aHints',new THREE.BufferAttribute(liquidHints,2));g.computeBoundingSphere();
    liquid=new THREE.Mesh(g,createLiquidMaterial(THREE,type,radius,coverage));liquid.name='distant-liquid';root.add(liquid);
  }
  const materials=[material,...(liquid?[liquid.material]:[])];
  return {root,update(eye,sun,time){for(const m of materials){m.uniforms.uEye.value.copy(eye);m.uniforms.uSun.value.copy(sun);m.uniforms.uTime.value=time;}},dispose(){geometry.dispose();material.dispose();liquid?.geometry.dispose();liquid?.material.dispose();root.clear();}};
}

export function createContinuousPlanetSurface(body,{catalog={},workerURL='/opendesign/mockups/galactic-command/terrain-worker.js',quality='standard',capital=false}={}){
  if(!(body.radius>0))throw new RangeError('Planet radius must be positive');
  const ids=[...new Set([...INDUSTRIAL_IDS,...Object.keys(catalog.buildings||{})])],config=makeContinuousConfig(body,ids,{capital});
  const field=createContinuousTerrainField(config),unit=industrialUnit(body.radius),pool=field?new SharedPlanetTilePool(field,config,workerURL):null;
  let currentQuality=qualityName(quality);
  const coverage=createConstructionCoverage(THREE,config);
  const asset=createPlanetAsset({THREE,type:config.biome,seed:config.appearanceSeed,radius:body.radius,quality:currentQuality,field,pool,coverage});
  const root=new THREE.Group();root.name=`planet/${body.key??body.id}`;root.add(asset.root);
  const proxy=field?createProxy(field,config.biome,body.radius,coverage):null;if(proxy){root.add(proxy.root);asset.setVisible(false);}
  const appearance=Object.freeze({version:CONTINUOUS_PLANET_VERSION,engine:'continuous-cube-sphere',key:config.key,biome:config.biome,
    seed:config.appearanceSeed,style:config.biome,styleName:styleNames[config.biome],
    landmarks:Object.freeze(asset.landmarks.map(l=>Object.freeze({...l,center:Object.freeze([...l.direction]),direction:Object.freeze([...l.direction])}))),
    ...(config.biome==='gas'?{weather:Object.freeze({storms:Object.freeze(asset.landmarks.map(l=>Object.freeze({center:Object.freeze([...l.direction])})))})}:{})});
  const sites=new Map(config.sites.map(s=>[s.id,s])),models=new Map(),overviews=new Map();
  const localEye=new THREE.Vector3(),sunLocal=new THREE.Vector3(),scratch=new THREE.Vector3(),viewDirection=new THREE.Vector3();
  const inverse=new THREE.Matrix4(),projection=new THREE.Matrix4(),frustum=new THREE.Frustum(),sphere=new THREE.Sphere();
  let resources=null,disposed=false,visible=true,clock=null,serial=0,lastPlanet=null,lastSelected=null,lastCatalog=catalog;
  const stats={version:'three-continuous-world-4',artStatus:DISTRICT_VERSION,appearance,quality:currentQuality,scale:scaleEvidence(body.radius),
    buildings:[],modelCacheLimit:4,cachedModels:0,overviewModels:0,visibleBuildings:0,animatedBuildings:0,distributedSites:config.sites.length,
    terrain:{cached:0,pending:0,globalReady:!field},weather:null};
  const alias=id=>({Metal_Storage:'Metal_Mine',Crystal_Storage:'Crystal_Mine',Gas_Storage:'Gas_Mine'}[id]||id);
  function target(id){
    const site=sites.get(alias(id));if(!site)return null;
    const normal=[...site.normal],cameraOffset=normal.map((v,k)=>v*.75+site.right[k]*.6-site.forward[k]*.75);
    const t={id:site.id,position:site.position.map((v,k)=>v+normal[k]*unit*1.2),basePosition:[...site.position],normal,
      radius:unit*Math.max(site.size.width,site.size.depth,site.size.maxHeight)*.49,footprint:site.footprint,cameraOffset};
    const center=site.size.center,y=districtHeightField(site.id,{gas:config.biome==='gas'}).surfaceHeight(center[0]+80,center[1]+70)+site.size.maxHeight*.35;
    t.position=site.position.map((v,k)=>v+unit*(site.right[k]*center[0]-site.forward[k]*center[1]+normal[k]*y));
    if(site.id==='Shipyard'){
      const height=body.radius*COLONY_ELEVATOR_HEIGHT_RATIO;
      t.station=normal.map((v,k)=>site.position[k]+v*height+site.forward[k]*6*unit);t.stationRadius=unit*38;t.shipyard=[...t.station];t.shipyardRadius=unit*38;
      t.overview=normal.map((v,k)=>site.position[k]+v*height*.5);t.overviewRadius=height*.39;
      t.overviewCameraOffset=normal.map((v,k)=>v*.10+site.right[k]*.75-site.forward[k]*.66);
    }return t;
  }
  function place(object,site){
    object.position.fromArray(site.position);
    object.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(...site.right),new THREE.Vector3(...site.normal),new THREE.Vector3(...site.forward).negate()));
    object.scale.setScalar(unit);root.add(object);
  }
  function overview(site){
    let model=overviews.get(site.id);if(model)return model;
    resources||=createDistrictResources();model=createDistrictOverview(site.id,{resources,gas:config.biome==='gas'});place(model.root,site);overviews.set(site.id,model);return model;
  }
  function ensureModel(site,retained){
    let entry=models.get(site.id);if(entry){entry.age=serial;return entry;}
    while(models.size>=stats.modelCacheLimit){
      const victim=[...models.values()].filter(e=>!retained.has(e.site.id)).sort((a,b)=>a.age-b.age)[0];if(!victim)return null;
      root.remove(victim.model.root);victim.model.dispose();victim.patch?.dispose();models.delete(victim.site.id);
    }
    resources||=createDistrictResources();const model=createAuroraDistrict(site.id,{resources,biome:config.biome,gas:config.biome==='gas',stationHeight:body.radius*COLONY_ELEVATOR_HEIGHT_RATIO/unit,
      groundHeight(x,z){const p=site.position.map((v,k)=>v+unit*(site.right[k]*x-site.forward[k]*z)),r=Math.hypot(...p),n=p.map(v=>v/r),h=terrainHeight(n,config);return ((body.radius+h)*n.reduce((sum,v,k)=>sum+v*site.normal[k],0)-body.radius-site.height)/unit;}});
    place(model.root,site);const patch=field?createCampusTerrainPatch(site,field,config):null;if(patch)root.add(patch.mesh);entry={site,model,patch,age:serial};models.set(site.id,entry);return entry;
  }
  const surface={root,stats,buildingTarget:target,
    heightAt:d=>terrainHeight(tuple(d),config),normalAt:d=>surfaceNormal(tuple(d),config),
    cameraHeightAt:d=>Math.max(cameraSurfaceHeight(tuple(d),config),asset.navigationHeight(d)??-Infinity),
    setQuality(value){if(disposed)return;currentQuality=qualityName(value);stats.quality=currentQuality;asset.setQuality(currentQuality);},
    setVisible(value){if(disposed||visible===Boolean(value))return;visible=Boolean(value);root.visible=visible;if(!visible){asset.setVisible(false);clock=null;stats.terrain.pending=0;}},
    update({time=0,weatherTime=time,eye,origin=[0,0,0],camera,planet,catalog=lastCatalog,selectedBuilding,light,now=Date.now(),viewportHeight=900,detailEnabled=true}={}){
      if(disposed||!visible)return;serial++;lastPlanet=planet||null;lastCatalog=catalog||{};lastSelected=selectedBuilding?alias(typeof selectedBuilding==='string'?selectedBuilding:selectedBuilding.id):null;
      const dt=clock===null?0:clamp(time-clock,0,.1);clock=time;root.updateWorldMatrix(true,false);inverse.copy(root.matrixWorld).invert();
      if(eye)localEye.fromArray(tuple(eye)).sub(scratch.fromArray(tuple(origin)));else localEye.copy(camera?.position||scratch.set(0,0,body.radius*4));
      localEye.applyMatrix4(inverse);sunLocal.fromArray(tuple(light||body.sunDirection||[-.55,.42,-.72])).transformDirection(inverse);
      if(camera){camera.updateMatrixWorld();camera.getWorldDirection(viewDirection).transformDirection(inverse);projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);}
      const focal=viewportHeight/(2*Math.tan((camera?.fov||50)*Math.PI/360)),projectedRadius=body.radius*focal/Math.max(body.radius*.01,localEye.length());
      const detailed=!field||(detailEnabled&&projectedRadius>40);asset.setVisible(detailed);asset.setLighting({directionLocal:sunLocal});
      if(detailed)asset.update({dt,time,weatherTime,eyeLocal:localEye,verticalFovRadians:(camera?.fov||50)*Math.PI/180,viewportHeightPixels:viewportHeight,viewDirectionLocal:camera?viewDirection:null,aspectRatio:camera?.aspect||1.6});
      const lod=asset.getStats();if(proxy){proxy.root.visible=!detailed||!lod.ready;proxy.update(localEye,sunLocal,time);}
      stats.terrain={...lod,cached:0,maxPatches:0,pending:lod.pendingJobs||0,globalReady:!field||!!lod.ready,queue:pool?.stats||null,distant:!detailed};
      stats.weather=config.biome==='gas'?{volumeSteps:lod.volumeSteps,volumeDetail:lod.volumeDetail,cloudTop:lod.nominalCloudTop,solidSurface:false}:null;
      stats.crystals=lod.decorations?.majorCrystals||0;stats.buildings=[];stats.visibleBuildings=0;stats.animatedBuildings=0;stats.capital=null;
      for(const entry of models.values()){entry.model.root.visible=false;if(entry.patch)entry.patch.mesh.visible=false;}for(const entry of overviews.values())entry.root.visible=false;
      const candidates=[];
      if(planet)for(const site of config.sites){
        if(lastCatalog.buildings?.[site.id]?.moon)continue;
        const state=buildingState(planet,site.id,lastCatalog,now),distance=localEye.distanceTo(scratch.fromArray(site.position)),selected=site.id===lastSelected;
        if(state.state==='unbuilt'&&!selected)continue;
        const pixels=site.footprint*2*focal/Math.max(unit,distance);
        let inView=pixels>.7&&!planetOccludesPoint(localEye.toArray(),site.position,body.radius);
        if(inView&&camera){sphere.center.fromArray(site.position);root.localToWorld(sphere.center);sphere.radius=site.footprint*1.3;inView=frustum.intersectsSphere(sphere);}
        let stationVisible=false,cableVisible=false,stationPixels=0;
        if(site.id==='Shipyard'){
          const t=target(site.id);stationPixels=unit*48*focal/Math.max(unit,localEye.distanceTo(scratch.fromArray(t.station)));
          stationVisible=stationPixels>.7&&!planetOccludesPoint(localEye.toArray(),t.station,body.radius);
          if(stationVisible&&camera){sphere.center.fromArray(t.station);root.localToWorld(sphere.center);sphere.radius=unit*26;stationVisible=frustum.intersectsSphere(sphere);}
          cableVisible=inView||stationVisible;
          if(!cableVisible&&!planetOccludesPoint(localEye.toArray(),t.overview,body.radius)){sphere.center.fromArray(t.overview);root.localToWorld(sphere.center);sphere.radius=body.radius*COLONY_ELEVATOR_HEIGHT_RATIO*.51;cableVisible=!camera||frustum.intersectsSphere(sphere);}
        }
        if(inView||selected||stationVisible||cableVisible)candidates.push({site,state,distance,pixels,inView,selected,stationVisible,cableVisible,stationPixels});
      }
      candidates.sort((a,b)=>Number(b.selected)-Number(a.selected)||Number(b.stationVisible)-Number(a.stationVisible)||a.distance-b.distance);
      const threshold=currentQuality==='low'?360:currentQuality==='high'?110:180;
      const fine=candidates.filter(e=>e.selected||e.pixels>threshold||e.stationVisible||e.cableVisible).slice(0,stats.modelCacheLimit),retained=new Set(fine.map(e=>e.site.id));
      const groundSites=[];
      for(const item of candidates){
        const {site,state,inView,pixels,stationVisible,cableVisible,stationPixels}=item,nightStrength=colonyNightStrength(site.normal,sunLocal.toArray());
        const full=retained.has(site.id)?ensureModel(site,retained):null,coarse=overview(site);
        coarse.setState(state);coarse.setNight(nightStrength);coarse.root.visible=inView&&!full;
        if(full){full.model.setState(state);full.model.update(dt,{visible:inView,detail:true,stationVisible,cableVisible,nightStrength,stationNightStrength:site.id==='Shipyard'?orbitalNightStrength(target(site.id).station,sunLocal.toArray(),body.radius):0});}
        if(full?.patch&&inView){full.patch.mesh.visible=true;groundSites.push(site);full.patch.update({renderedHeight:d=>asset.renderedHeight(d),eye:localEye,sun:sunLocal,time});}
        if(inView)stats.visibleBuildings++;if(full&&inView&&state.rate>0)stats.animatedBuildings++;
        stats.buildings.push({id:site.id,state:state.state,level:state.level,rate:state.rate,progress:state.progress,position:[...site.position],
          visible:inView,pixels,stationVisible,cableVisible,stationPixels,groundDetail:!!full,buildingCount:districtPlan(site.id).buildings.length,nightStrength});
      }
      coverage.update(false,[]);coverage.setCampuses(groundSites);asset.setFacilityClearance(candidates.map(e=>e.site));stats.cachedModels=models.size;stats.overviewModels=overviews.size;stats.terrain.campusPatches=groundSites.length;
    },
    pick(raycaster){
      if(!lastPlanet||disposed)return null;root.updateMatrixWorld(true);const objects=[];
      for(const {model}of models.values())if(model.root.visible)model.root.traverseVisible(o=>{if(o.isMesh)objects.push(o);});
      for(const model of overviews.values())if(model.root.visible)objects.push(model.mesh);
      const hit=raycaster.intersectObjects(objects,false)[0];if(!hit)return null;let node=hit.object;while(node&&!node.userData.buildingId)node=node.parent;
      return node?{id:node.userData.buildingId,buildingId:node.userData.buildingId,point:hit.point.toArray(),distance:hit.distance,target:target(node.userData.buildingId)}:null;
    },
    dispose(){if(disposed)return;disposed=true;asset.dispose();proxy?.dispose();for(const e of models.values()){e.model.dispose();e.patch?.dispose();}for(const m of overviews.values())m.dispose();models.clear();overviews.clear();resources?.dispose();root.clear();}
  };return surface;
}
