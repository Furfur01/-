import * as THREE from 'three';
import {createShipModel,disposeShip,modelIds} from '../three-flight/shared-models.js';
import {createErectionFrame} from './construction-frame.js';
import {shipConstructionProgress,shipConstructionPhase} from './ship-construction-state.js';
export {shipConstructionProgress,shipConstructionPhase} from './ship-construction-state.js';

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
export const CONSTRUCTION_SHIPS=new Set(modelIds);
const stages=[
 {id:'structure',start:.08,end:.22},
 {id:'equipment',start:.24,end:.40},
 {id:'hull',start:.46,end:.72},
 {id:'outfitting',start:.76,end:.90},
];

// Use the catalogue's actual assemblies and material roles, never spatial cuts.
// Mixed/legacy baked meshes remain intact; their fitted erection frame precedes
// the original shell rather than inventing arbitrary pieces inside that mesh.
function constructionRole(object,material){
 const names=[];for(let o=object;o;o=o.parent)names.push(o.name);
 const name=names.join('/').toLowerCase(),mat=material.name.toLowerCase();
 if(/weapon_installations|recessed_weapons|low_profile_guns|missile_ports|hardpoint_collimators|point_defense|gun_deck/.test(name))return 'outfitting';
 if(/bridge|command|control_deck|sensor_branch|solar_array|protective_angular_halo/.test(name))return ['steel','side','dark','edge'].includes(mat)?'structure':'outfitting';
 if(['glass','core','red','gold','panel'].includes(mat))return 'outfitting';
 if(['armor','light','ceramic_iridescent'].includes(mat))return 'hull';
 if(/reactor|thruster|embedded_stern_drive|surface_machinery|singularity/.test(name))return 'equipment';
 if(['steel','edge','black'].includes(mat))return 'equipment';
 if(['side','dark'].includes(mat))return 'structure';
 return 'hull';
}

export function createAssemblyHull(id){
 const source=createShipModel(id),template=new THREE.Group();template.name='Construction_Hull/'+id;
 const box=new THREE.Box3().setFromObject(source),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const fit=Math.min(8.2/size.x,4.5/size.y,14/size.z),dimensions=size.clone().multiplyScalar(fit);
 const transform=new THREE.Matrix4().makeRotationY(Math.PI).multiply(new THREE.Matrix4().makeScale(fit,fit,fit)).multiply(new THREE.Matrix4().makeTranslation(-center.x,-center.y,-center.z));
 const layers=stages.map(stage=>{const group=new THREE.Group();group.name='Construction_Layer_'+stage.id;group.userData.role=stage.id;template.add(group);return group;});
 const contacts=stages.map(()=>Array.from({length:12},()=>[null,null])),frameContacts=Array.from({length:12},()=>[null,null]);
 const geometries=new Set(),materials=new Map(),shells=[];
 const matrix=new THREE.Matrix4(),instanceMatrix=new THREE.Matrix4();
 const point=new THREE.Vector3();
 source.updateMatrixWorld(true);
 source.traverseVisible(object=>{
  if(!object.isMesh)return;
  const originals=Array.isArray(object.material)?object.material:[object.material];
  const role=constructionRole(object,originals[0]),index=stages.findIndex(s=>s.id===role);
  const copies=originals.map(original=>{
   const key=original.uuid+'/'+role;
   if(!materials.has(key)){
    const material=original.clone();
    material.userData.constructionBase={opacity:original.opacity,transparent:original.transparent,depthWrite:original.depthWrite,emissiveIntensity:original.emissiveIntensity};
    materials.set(key,material);
   }
   return materials.get(key);
  });
  const count=object.isInstancedMesh?object.count:1;
  for(let n=0;n<count;n++){
   matrix.multiplyMatrices(transform,object.matrixWorld);
   if(object.isInstancedMesh){object.getMatrixAt(n,instanceMatrix);matrix.multiply(instanceMatrix);}
   const geometry=object.geometry.clone().applyMatrix4(matrix);geometries.add(geometry);
   const mesh=new THREE.Mesh(geometry,Array.isArray(object.material)?copies:copies[0]);
   mesh.name='Installed/'+(object.name||id+'_original_hull');mesh.userData.sourcePart=object.name||id;layers[index].add(mesh);
   const pos=geometry.attributes.position;
   for(let v=0;v<pos.count;v++){
    point.fromBufferAttribute(pos,v);
    const station=Math.min(11,Math.floor(clamp(point.z/dimensions.z+.5)*12));
    for(const side of [0,1]){const old=contacts[index][station][side];if(!old||(side?point.x>old.x:point.x<old.x))contacts[index][station][side]=point.clone();}
   }
   if(role==='hull')shells.push(geometry);
  }
 });
 disposeShip(source);
 const {geometry:frameGeometry,memberCount}=createErectionFrame(shells,dimensions);geometries.add(frameGeometry);
 const framePositions=frameGeometry.attributes.position;
 for(let v=0;v<framePositions.count;v++){
  point.fromBufferAttribute(framePositions,v);const station=Math.min(11,Math.floor(clamp(point.z/dimensions.z+.5)*12));
  for(const side of [0,1]){const old=frameContacts[station][side];if(!old||(side?point.x>old.x:point.x<old.x))frameContacts[station][side]=point.clone();}
 }
 const frameMaterial=new THREE.MeshStandardMaterial({color:0x526c78,metalness:.65,roughness:.6});
 const frame=new THREE.Mesh(frameGeometry,frameMaterial);frame.name='Erection_Frame';frame.userData.memberCount=memberCount;template.add(frame);
 template.userData={shipId:id,dimensions:dimensions.toArray()};
 let leases=0;
 function instance(){
  const root=template.clone(true),layers=stages.map(s=>root.getObjectByName('Construction_Layer_'+s.id)),frame=root.getObjectByName('Erection_Frame'),owned=new Map();
  // Per-instance materials isolate commissioning and crossfades from a finished
  // ship leaving the dock. The heavy geometry is still shared across a batch.
  root.traverse(o=>{if(!o.material)return;const clone=m=>{if(!owned.has(m))owned.set(m,m.clone());return owned.get(m);};o.material=Array.isArray(o.material)?o.material.map(clone):clone(o.material);});
  leases++;let disposed=false;
  const result={root,layers,dimensions,clone:instance,contact(side,offset=0){
   const progress=root.userData.progress||0,target=clamp(((progress*2.5)%1)+offset*.3),station=Math.round(target*11);
   const candidates=[];
   for(let layer=layers.length-1;layer>=0;layer--){
    if(!layers[layer].visible||layers[layer].userData.completion<.35)continue;
    for(let i=0;i<12;i++){const p=contacts[layer][i][side>0?1:0];if(p)candidates.push({p,score:Math.abs(i-station)+(layers.length-1-layer)*.8});}
   }
   if(!candidates.length&&frame.visible)for(let i=0;i<12;i++){const p=frameContacts[i][side>0?1:0];if(p)candidates.push({p,score:Math.abs(i-station)});}
   candidates.sort((a,b)=>a.score-b.score);return candidates[0]?.p.clone()||null;
  },update(progress){
   progress=clamp(progress);const power=smooth((progress-.92)/.07);
   layers.forEach((layer,i)=>{
    const stage=stages[i],completion=smooth((progress-stage.start)/(stage.end-stage.start));
    layer.visible=completion>0;layer.userData.completion=completion;
    // Entire functional layers settle in place. No mesh translation, scaling,
    // triangle slicing, longitudinal sweep, or numbered assembly sections.
    layer.traverse(o=>{if(!o.material)return;for(const material of Array.isArray(o.material)?o.material:[o.material]){
     const base=material.userData.constructionBase,transparent=completion<1||base.transparent;
     if(material.transparent!==transparent){material.transparent=transparent;material.needsUpdate=true;}
     material.opacity=base.opacity*completion;material.depthWrite=completion===1&&base.depthWrite;
     if(base.emissiveIntensity!==undefined)material.emissiveIntensity=base.emissiveIntensity*power;
    }});
   });
   const frameOpacity=smooth(progress/.12)*(1-smooth((progress-.46)/.26)),transparent=frameOpacity<1;
   if(frame.material.transparent!==transparent){frame.material.transparent=transparent;frame.material.needsUpdate=true;}
   frame.material.opacity=frameOpacity;frame.material.depthWrite=!transparent;frame.visible=frameOpacity>.002;
   root.userData.progress=progress;root.userData.assembled=layers.filter(l=>l.children.length&&l.userData.completion===1).length;
   root.userData.phase=shipConstructionPhase(progress);root.userData.power=power;
  },dispose(){
   if(disposed)return;disposed=true;root.removeFromParent();root.clear();owned.forEach(m=>m.dispose());
   if(--leases===0){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());frameMaterial.dispose();}
  }};
  result.update(0);return result;
 }
 return instance();
}

export function createShipConstruction(){
 const root=new THREE.Group();root.name='Live_Ship_Construction';
 // Keep this subtree out of the facility's static-geometry merger.
 root.userData.motion={type:'queue-driven'};
 let current=null,outgoing=null,template=null,key=null,end=0,clock=0,disposed=false;
 const stats={active:false,shipId:null,progress:0,phase:'船坞待命',departing:null};
 return {root,stats,contact:(side,offset)=>current?.contact(side,offset),update({queue,now,time=0,enabled=true}){
  const dt=Math.min(.1,Math.max(0,time-clock));clock=time;
  const next=enabled&&CONSTRUCTION_SHIPS.has(queue?.id)?queue:null,nextKey=next?`${next.id}/${next.end}`:null;
  if(nextKey!==key){
   if(current){
    if(enabled&&now>=end){outgoing?.hull.dispose();current.update(1);outgoing={hull:current,age:0};}
    else current.dispose();current=null;
   }
   key=nextKey;end=next?.end||0;
   if(template?.root.userData.shipId!==next?.id){template?.dispose();template=next?createAssemblyHull(next.id):null;}
   if(next){current=template.clone();root.add(current.root);}
  }
  if(!enabled&&outgoing){outgoing.hull.dispose();outgoing=null;}
  if(outgoing){outgoing.age+=dt;const t=outgoing.age/3;outgoing.hull.root.position.set(0,smooth(t)*1.5,t*t*34);if(t>=1){outgoing.hull.dispose();outgoing=null;}}
  const progress=shipConstructionProgress(next,now);current?.update(progress);
  Object.assign(stats,{active:!!next,shipId:next?.id||null,progress,phase:next?shipConstructionPhase(progress):'船坞待命',departing:outgoing?.hull.root.userData.shipId||null});
  root.userData.construction={...stats};
 },dispose(){if(disposed)return;disposed=true;current?.dispose();outgoing?.hull.dispose();template?.dispose();root.removeFromParent();root.clear();}};
}
