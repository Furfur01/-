import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createShipModel,modelIds,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {publicCatalog} from '../game/catalog.mjs';
import {shipWeaponLayouts} from '../game/ship-weapon-mounts.mjs';

// Texture-free binary export only; Node's Blob supplies the buffer operation.
globalThis.FileReader=class{readAsArrayBuffer(blob){blob.arrayBuffer().then(result=>{this.result=result;this.onloadend?.();}).catch(error=>{this.error=error;this.onerror?.(error);});}};
const scaleWeapons=process.argv.includes('--scale-weapons');
const threeView=process.argv.includes('--three-view');
const remaining=process.argv.includes('--remaining');
const pair=process.argv.includes('--light-cruiser');
const special=process.argv.includes('--special');
const raven=process.argv.includes('--raven');
const out=new URL('../models/generated/'+(raven?'user-raven-reaper-02':special?'special-reborn-01':scaleWeapons?'fleet-scale-weapons-03':pair?'light-cruiser-rebuild-01':remaining?'remaining-fleet-rebuild-01':threeView?'three-view-rebuild-01':'six-ships-loadout-01')+'/',import.meta.url);fs.mkdirSync(out,{recursive:true});
const stat=root=>{let triangles=0,meshes=0;root.traverse(o=>{if(!o.isMesh)return;meshes++;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite));triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});return {triangles,meshes,bounds:new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).toArray()};};
const manifest=[];
for(const id of modelIds.filter(id=>(special||raven)?['Reaper','Annihilator'].includes(id):scaleWeapons?!!shipWeaponLayouts[id]:pair?['Light_Fighter','Cruiser'].includes(id):remaining?!['Heavy_Fighter','Dreadnought','Destroyer','Iron_Behemoth','Light_Fighter','Cruiser','Probe','Battleship','Annihilator','Reaper'].includes(id):threeView?['Destroyer','Iron_Behemoth'].includes(id):shipWeaponLayouts[id])){
  const model=createShipModel(id),meta=publicCatalog.shipArchive.find(s=>s.id===id),a=stat(model);
  assert.ok(a.triangles>100&&a.meshes<160,id);assert.ok(a.bounds.every(x=>x>0&&Number.isFinite(x)),id);
  model.userData={...model.userData,apkId:meta.apkId,name:meta.name,silhouetteVerified:false};
  const buffer=await new GLTFExporter().parseAsync(model,{binary:true,trs:true}),bytes=Buffer.from(buffer);
  assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(8),bytes.length);
  const restored=(await new GLTFLoader().parseAsync(buffer,'')).scene,b=stat(restored);assert.deepEqual(b,a,id+' round trip');
  fs.writeFileSync(new URL(id+'.glb',out),bytes);
  manifest.push({id,name:meta.name,apkId:meta.apkId,file:id+'.glb',preview:raven?(id==='Reaper'?'reaper-reference.png':'armored-antimatter.png'):id+'.png',...a,relativeLength:model.userData.relativeLength,bytes:bytes.length,revision:model.userData.revision||'preserved',detailPass:model.userData.detailPass,detailAssemblies:model.userData.detailAssemblies,status:model.userData.preserved?'preserved-approved-reference':meta.reference?'refined-awaiting-shape-review':'refined-legacy-concept',weaponLayout:meta.weaponLayout,spinalMount:meta.spinalMount,radialBranches:model.userData.radialBranches,glbRoundTrip:true,silhouetteVerified:false});
  console.log(id,a.triangles+' triangles',a.meshes+' meshes');disposeShip(model);disposeShip(restored);
}
fs.writeFileSync(new URL('manifest.json',out),JSON.stringify(manifest,null,2));
