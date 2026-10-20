import * as THREE from 'three';
import {createOriginalIndustry,createOriginalSpaceport} from './continuum-assets/industry-original.js';
import {createContinuumOrbitalYard} from './continuum-orbital-yard.js';
import {installColonyNightMaterials,createColonyLightPools} from './colony-night-lighting.js';

/** Pixel-width navigation traces preserve the height of the real cable routes
 * after their steel ribbons become smaller than a pixel. These remain ordinary
 * depth-tested world geometry, hidden by the planet and nearby structures. */
function createElevatorGuidance(asset){
  const group=new THREE.Group();group.name='TETHER / cable navigation outlines';
  const lines=[],points=[],colors=[];
  const cool=new THREE.Color(0xa3c4ce),warm=new THREE.Color(0xe4c18b);
  for(const {bottom,top} of asset.cableAnchors.slice(-4)){
    lines.push(...bottom,...top);
    for(let i=0;i<=9;i++){
      const t=i/9;points.push(...bottom.map((v,k)=>v+(top[k]-v)*t));
      colors.push(...(i===0||i===9?warm:cool).toArray());
    }
  }
  const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(lines,3));lineGeometry.computeBoundingSphere();
  const lineMaterial=new THREE.LineBasicMaterial({color:0x9aafb6,linewidth:1,transparent:true,opacity:.35,depthTest:true,depthWrite:false,toneMapped:false});
  const outline=new THREE.LineSegments(lineGeometry,lineMaterial);outline.name='Four retained main cable routes / distance outline';
  const pointGeometry=new THREE.BufferGeometry();pointGeometry.setAttribute('position',new THREE.Float32BufferAttribute(points,3));pointGeometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));pointGeometry.computeBoundingSphere();
  const pointMaterial=new THREE.PointsMaterial({vertexColors:true,size:1.8,sizeAttenuation:false,transparent:true,opacity:.55,depthTest:true,depthWrite:false,toneMapped:false});
  const beacons=new THREE.Points(pointGeometry,pointMaterial);beacons.name='Cable navigation beacons / eight intermediate stations and endpoints';
  group.add(outline,beacons);asset.root.add(group);let disposed=false;
  return {root:group,outline,beacons,
    update(visible,nightStrength){group.visible=visible;const n=Math.max(0,Math.min(1,nightStrength||0));lineMaterial.opacity=.35+n*.30;pointMaterial.opacity=.55+n*.25;},
    dispose(){if(disposed)return;disposed=true;group.removeFromParent();lineGeometry.dispose();lineMaterial.dispose();pointGeometry.dispose();pointMaterial.dispose();}
  };
}

/** Adapt the user's full factory contracts to the existing game visual state. */
export function createContinuumIndustry(id,{seed=17,gas=false,stationHeight=240}={}){
  const elevator=id==='Shipyard',type={Metal_Mine:'metal',Crystal_Mine:'crystal',Gas_Mine:'gas'}[id];
  const asset=elevator?createOriginalSpaceport({THREE,seed,stationHeight}):createOriginalIndustry({THREE,seed,type:gas?'gas':type,floating:gas});
  const root=asset.root;root.userData.buildingId=id;root.userData.artStatus='user-supplied-CONTINUUM';
  // Ground and orbital regions share original materials. Clone only the orbital
  // instances so the station can remain sunlit above the planet's night side.
  const orbitalObjects=new Set(),orbitalMaterials=new Map();
  if(elevator){
    for(const key of ['station','orbitalEdges','shipAssembly'])asset.groups[key].traverse(o=>orbitalObjects.add(o));
    for(const key of ['effects','silhouette'])asset.groups[key].traverse(o=>{
      if(o.geometry&&!o.geometry.boundingBox)o.geometry.computeBoundingBox();
      if(/Station lamp|City orbital/.test(o.name)||o.geometry?.boundingBox?.min.y>stationHeight*.8)o.traverse(child=>orbitalObjects.add(child));
    });
    for(const object of orbitalObjects)if(object.material){
      const clone=material=>{if(!orbitalMaterials.has(material))orbitalMaterials.set(material,material.clone());return orbitalMaterials.get(material);};
      object.material=Array.isArray(object.material)?object.material.map(clone):clone(object.material);
    }
  }
  const materialScope=orbital=>({userData:{},traverse(visit){root.traverse(o=>{if(orbitalObjects.has(o)===orbital)visit(o);});}});
  const groundLighting=installColonyNightMaterials({THREE,root:materialScope(false),palette:elevator?{glass:3233386}:undefined});
  const stationLighting=elevator?installColonyNightMaterials({THREE,root:materialScope(true),palette:{glass:3233386}}):null;
  const shipyard=elevator?createContinuumOrbitalYard({stationHeight}):null;
  const shipyardLighting=shipyard?installColonyNightMaterials({THREE,root:shipyard.root}):null;
  if(shipyard)root.add(shipyard.root);
  const groundPools=elevator?createColonyLightPools({THREE,parent:root,pools:[[-20,.055,7,3,3],[20,.055,7,3,3],[-12,.055,13,3,3],[12,.055,13,3,3],[0,.055,17,4,3],[-24,.055,-11,3,3],[24,.055,-11,3,3]]}):null;
  const cableGuidance=elevator?createElevatorGuidance(asset):null;
  // The supplied factory has one LOD switch for the whole height. Classify its
  // retained coarse objects once so ground and orbital camera ranges can choose
  // independently without rebuilding or duplicating any source geometry.
  const silhouetteRegions=new Map();
  if(elevator)for(const object of asset.groups.silhouette.children){
    const name=object.name.toLowerCase();let region;
    if(name.includes('ground'))region='ground';
    else if(name.includes('cable'))region='cable';
    else if(name.includes('orbital'))region='station';
    else if(!name.includes('carriage')&&!name.includes('carrier')){
      if(object.geometry&&!object.geometry.boundingBox)object.geometry.computeBoundingBox();
      const box=object.geometry?.boundingBox;
      if(box)region=box.min.y>stationHeight*.8?'station':box.max.y-box.min.y>stationHeight*.5?'cable':'ground';
    }
    if(region)silhouetteRegions.set(object,region);
  }
  let orbitalBounds;
  if(shipyard){const box=new THREE.Box3(new THREE.Vector3(...shipyard.bounds.min),new THREE.Vector3(...shipyard.bounds.max));for(const key of ['station','orbitalEdges','shipAssembly']){const b=asset.groupBounds[key];if(b)box.union(new THREE.Box3(new THREE.Vector3(...b.min),new THREE.Vector3(...b.max)));}orbitalBounds={min:box.min.toArray(),max:box.max.toArray()};}
  // Keep the original model's own groups/LOD; the adapter introduces no renderer.
  let last='',disposed=false,construction=1;
  const effects=new THREE.Group();effects.name='adapter-empty-effects';
  const model={root,near:root,effects,asset,shipyard,orbitalBounds,cableGuidance,nightLighting:{ground:groundLighting,station:stationLighting,shipyard:shipyardLighting},
    setState(state){const visual={running:state.rate>0,activity:state.rate,construction:state.state==='construction'?state.progress:state.state==='unbuilt'?0:1,storageFill:state.storageFill??.6,assemblyProgress:state.queueProgress||0,showDemoShip:!!state.queue};const key=JSON.stringify(visual);if(key!==last){asset.setVisualState(visual);shipyard?.setState(visual);construction=visual.construction;last=key;}},
    update(dt,{detail=true,groundDetail=detail,stationDetail=detail,visible=true,stationVisible=true,cableVisible=true,cableOverview=true,nightStrength=0,stationNightStrength=nightStrength}={}){
      root.visible=visible||elevator&&(stationVisible||cableVisible);
      if(elevator){
        const groundNear=groundDetail&&visible,stationNear=stationDetail&&stationVisible,anyNear=groundNear||stationNear;
        asset.update(dt,{groundVisible:anyNear?groundNear:visible,stationVisible:anyNear?stationNear:stationVisible,cableVisible,detail:anyNear?'near':'far',animate:root.visible&&anyNear});
        if(!groundNear)asset.groups.edgeTerrain.visible=false;
        if(anyNear){
          for(const key of ['groundPort','roads','perimeter','edgeTerrain'])asset.groups[key].visible=groundNear;
          for(const key of ['station','orbitalEdges','shipAssembly'])asset.groups[key].visible=stationNear;
          const groundFar=visible&&!groundNear,stationFar=stationVisible&&!stationNear;
          asset.groups.silhouette.visible=groundFar||stationFar;
          for(const [object,region] of silhouetteRegions){
            if(region==='ground')object.visible=groundFar;
            if(region==='station')object.visible=stationFar&&(object.name.startsWith('Repeated terminal')?construction>=.42:true);
          }
          // Source cabin matrices keep their original region visibility, and
          // source coarse cable/carriage objects remain off while near is active.
          for(const object of asset.groups.effects.children){
            const orbital=orbitalObjects.has(object);
            object.visible=construction>=.73&&(orbital?stationNear:groundNear);
          }
        }
      }
      else asset.update(dt,{visible,detail:detail?'near':'far',animate:visible&&detail});
      groundLighting.update(nightStrength);stationLighting?.update(stationNightStrength);shipyardLighting?.update(stationNightStrength);
      shipyard?.update(dt,{visible:stationVisible,detail:stationDetail,nightStrength:stationNightStrength});groundPools?.update(nightStrength,visible&&groundDetail);
      cableGuidance?.update(cableVisible&&cableOverview&&construction>=.45,(nightStrength+stationNightStrength)*.5);
    },
    dispose(){if(disposed)return;disposed=true;groundLighting.dispose();stationLighting?.dispose();shipyardLighting?.dispose();groundPools?.dispose();shipyard?.dispose();cableGuidance?.dispose();asset.dispose();for(const material of orbitalMaterials.values())material.dispose();orbitalMaterials.clear();}
  };return model;
}
