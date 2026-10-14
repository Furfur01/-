import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';

const dir=new URL('../models/generated/cruiser-sample-01/',import.meta.url);
const bytes=fs.readFileSync(new URL('Cruiser.glb',dir));
assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);
const json=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));
assert.equal(json.nodes.find(n=>n.name==='Cruiser').extras.revision,'concept-sample-01');
assert.equal(json.images,undefined);
const imported=(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'')).scene;
const source=createShipModel('Cruiser');
const stats=root=>{let triangles=0,meshes=0;root.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position,n=o.geometry.attributes.normal;assert.ok(p.array.every(Number.isFinite));assert.ok(n.array.every(Number.isFinite));triangles+=(o.geometry.index?.count||p.count)/3;});return {meshes,triangles,bounds:new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).toArray()};};
const a=stats(source),b=stats(imported);assert.deepEqual(b,a);assert.equal(source.children.length,9);assert.ok(a.meshes<120);assert.ok(a.triangles>25000);
assert.ok(a.bounds[0]>8&&a.bounds[0]<11);assert.ok(a.bounds[2]>16&&a.bounds[2]<20);
const result={...a,bytes:bytes.length,assemblies:source.children.map(x=>x.name),glbRoundTrip:true,silhouetteVerified:false,reference:'fleet_03_Cruiser.png'};
fs.writeFileSync(new URL('checks.json',dir),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));disposeShip(source);disposeShip(imported);
