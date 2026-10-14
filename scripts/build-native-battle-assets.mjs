import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import {createShipModel,disposeShip,modelIds} from '../opendesign/mockups/galactic-command/ship-models.js';
import {units} from '../game/catalog.mjs';
import {trialUnits} from '../game/battle-trial.mjs';
import {combatProfile} from '../game/spatial-profiles.mjs';

// Extract the largest real hull components, preserving their geometry and material colors.
// Distant fleet instances never use invented box-shaped substitute ships.
export function buildNativeBattleAssets(dir){
 const chunks=[],ships=[];let offset=0;
 for(const u of Object.values(trialUnits).filter(u=>!u.missile)){
  const profile=combatProfile(u),known=modelIds.includes(u.id);
  const model=known?createShipModel(u.id):new THREE.Mesh(new THREE.CylinderGeometry(2,4,3,12),new THREE.MeshStandardMaterial({color:0x7893a8}));
  model.updateMatrixWorld(true);let bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  if(['Death_Star','Guardian'].includes(u.id)){const factor=(u.id==='Death_Star'?90:35)/size.z;model.scale.multiplyScalar(factor);model.updateMatrixWorld(true);bounds=new THREE.Box3().setFromObject(model);size=bounds.getSize(new THREE.Vector3());}
  const components=[];
  model.traverse(mesh=>{if(!mesh.isMesh)return;const g=mesh.geometry,normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld),p=new THREE.Vector3(),n=new THREE.Vector3(),data=[],material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material,color=material.color?.clone().convertLinearToSRGB().toArray()||[.6,.7,.8];
   for(let i=0;i<(g.index?.count||g.attributes.position.count);i++){const j=g.index?g.index.getX(i):i;p.fromBufferAttribute(g.attributes.position,j).applyMatrix4(mesh.matrixWorld);n.fromBufferAttribute(g.attributes.normal,j).applyNormalMatrix(normalMatrix);const c=g.attributes.color?[g.attributes.color.getX(j),g.attributes.color.getY(j),g.attributes.color.getZ(j)]:color;data.push(p.z,p.y,-p.x,n.z,n.y,-n.x,...c,0,0,-5,0);}
   const box=new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());components.push({data,volume:box.x*box.y*box.z,triangles:data.length/39});
  });
  components.sort((a,b)=>b.volume-a.volume);const chosen=[];let triangles=0;
  for(const c of components){if(c.triangles>1800||triangles+c.triangles>2000)continue;chosen.push(c);triangles+=c.triangles;if(chosen.length>=12)break;}
  if(!chosen.length)chosen.push(components[0]);
  const low=new Float32Array(chosen.flatMap(c=>c.data)),lowInfo={offset,floatCount:low.length};chunks.push(Buffer.from(low.buffer));offset+=low.length;
  const full=new Float32Array(components.flatMap(c=>c.data)),fullInfo={offset,floatCount:full.length};chunks.push(Buffer.from(full.buffer));offset+=full.length;
  const center=bounds.getCenter(new THREE.Vector3()),length=size.z;
  ships.push({id:u.id,name:u.name,low:lowInfo,full:fullInfo,stats:[u.strength,u.shield,u.attack,u.speed,u.cargo,u.fuel],profile,length,
   layout:{id:u.id,length,scale:1,bridge:[0,bounds.max.y+length*.025,center.z+length*.2],chase:[length*.6,length*.55,length*1.5],focus:[0,0,-length*.25],main:u.attack>0?[[bounds.min.z,center.y,-center.x]]:[],tubes:[],tubeDirections:[],joints:[],mounts:[],pdMuzzles:[],engines:[],propulsion:{name:'舰载推进',color:[.3,.6,1],core:[.8,.9,1],pulse:4},turretScale:1,bounds:{center:[center.z,center.y,-center.x],half:[size.z/2,size.y/2,size.x/2]},archiveDistance:length*2.6}});
  disposeShip(model);
 }
 fs.writeFileSync(path.join(dir,'battle-fleet.bin'),Buffer.concat(chunks));fs.writeFileSync(path.join(dir,'battle-fleet.json'),JSON.stringify({ships}));
}
