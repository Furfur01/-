import * as THREE from 'three';
import {DefenseModels as D} from './foundry-models.js';
export const defenseIds={15:'Rocket_Launcher',16:'Light_Laser',17:'Heavy_Laser',18:'MK2_Cannon',19:'Ion_Cannon',20:'Plasma_Cannon',27:'Proton_Cannon'};
let models;
export function foundrySource(id){models??=D.buildAll();return models.find(r=>defenseIds[r.meta.id]===id);}
export function foundryMeasurements(id){
 const root=foundrySource(id);if(!root)return null;
 root.joints.pitch.rot[0]=0;root.update();const bounds=D.bounds(root),scale=32/Math.max(bounds.max[0]-bounds.min[0],bounds.max[2]-bounds.min[2]);
 const convert=p=>[-p[2]*scale,(p[1]-bounds.min[1])*scale-12.8,p[0]*scale];
 return {root,scale,bottom:bounds.min[1],pivot:convert(D.M.p(root.joints.pitch.world,[0,0,0]))[1],muzzles:root.muzzles.map(p=>convert(D.M.p(root.joints.recoil.world,p)))};
}
export function createFoundryModel(id){
 const info=foundryMeasurements(id);if(!info)return null;
 const {root,scale,bottom}=info,group=new THREE.Group();group.name=id;
 group.userData.defensePivot=info.pivot;
 function visit(node,part='base'){
  if(node===root.joints.yaw)part='turret';if(node===root.joints.pitch)part='barrels';
  for(const [m,data]of node.groups){
   const positions=[],normals=[];
   for(let i=0;i<data.length;i+=9){const p=D.M.p(node.world,data.slice(i,i+3)),n=D.M.n(node.world,data.slice(i+3,i+6));
    // Foundry +Z points forward; archive models use -Z, then the packed exporter maps it to -X.
    positions.push(-p[0]*scale,(p[1]-bottom)*scale-12.8,-p[2]*scale);normals.push(-n[0],n[1],-n[2]);
   }
   const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
   const material=new THREE.MeshStandardMaterial({color:new THREE.Color(...m.c).convertSRGBToLinear(),metalness:m.metal,roughness:m.rough});
   material.userData={team:!!m.team,emission:m.em};
   const mesh=new THREE.Mesh(geometry,material);mesh.name=node.name+' / '+m.name;mesh.userData.defensePart=part;group.add(mesh);
  }
  for(const child of node.children)visit(child,part);
 }
 visit(root);return group;
}
