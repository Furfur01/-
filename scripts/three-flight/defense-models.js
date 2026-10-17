import * as THREE from 'three';
import {createFoundryModel} from './foundry-adapter.js';

// Deliberately simple, distinct ground emplacements. One model per real unit.
export function createDefenseModel(id){
 const foundry=createFoundryModel(id);if(foundry)return foundry;
 const group=new THREE.Group();group.name=id;
 const concrete=new THREE.MeshStandardMaterial({color:0x59656b}),armor=new THREE.MeshStandardMaterial({color:0xa2adb2}),dark=new THREE.MeshStandardMaterial({color:0x283944}),accent=new THREE.MeshStandardMaterial({color:0x6fcde1});
 let part='base';
 const box=(size,pos,material=armor)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.userData.defensePart=part;mesh.position.set(...pos);group.add(mesh);return mesh;};
 box([32,4,32],[0,-10.8,0],concrete);box([22,6,22],[0,-5.8,0]);
 for(const x of [-12,12])for(const z of [-12,12])box([3,2,3],[x,-7.8,z],accent);
 if(id.includes('Shield_Dome')){
  const dome=new THREE.Mesh(new THREE.SphereGeometry(id.startsWith('Large')?15:11,20,10,0,Math.PI*2,0,Math.PI/2),accent);dome.position.y=-2.8;group.add(dome);
  box([4,13,4],[0,3,0],dark);
 }else if(id==='Rocket_Launcher'){
  part='turret';
  box([13,5,10],[0,0,0],dark);
  part='barrels';
  for(const x of [-4,4])for(const y of [2,6]){box([5,3,17],[x,y,0]);box([3,2,1],[x,y,-8],dark);}
 }else{
  part='turret';
  box([14,8,12],[0,0,0]);
  box([8,2,4],[0,5,4],accent);
  part='barrels';
  const length=id==='MK2_Cannon'?24:id==='Plasma_Cannon'?16:20;
  for(const x of id==='Heavy_Laser'?[-3,3]:[0])box([id==='Plasma_Cannon'?6:3,3,length],[x,5,-length*.35],dark);
 }
 return group;
}
