import fs from 'node:fs';
import * as THREE from 'three';
import {publicCatalog} from '../game/catalog.mjs';
import {createShipModel} from '../opendesign/mockups/galactic-command/ship-models.js';
const w=new THREE.Vector3(-1,.8,-1.2).normalize(),u=new THREE.Vector3(0,1,0).cross(w).normalize(),v=w.clone().cross(u),out=[];
for(const ship of publicCatalog.shipArchive){if(!ship.reference)continue;const group=createShipModel(ship.id,{fit:false}),triangles=[];group.updateMatrixWorld(true);group.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry,a=g.attributes.position;for(let i=0;i<a.count;i+=3){const tri=[];for(let j=0;j<3;j++){const p=new THREE.Vector3().fromBufferAttribute(a,i+j).applyMatrix4(m.matrixWorld);tri.push([p.dot(u),p.dot(v)]);}triangles.push(tri);}});out.push({id:ship.id,reference:ship.reference,triangles});}
fs.writeFileSync('output/playwright/ship-archive/projected-source.json',JSON.stringify(out));
