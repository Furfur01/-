import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createFloatingPlatform} from '../opendesign/mockups/galactic-command/planet-platform.js';
import {createBuildingModel} from '../opendesign/mockups/galactic-command/planet-buildings.js';
import {buildings} from '../game/catalog.mjs';

test('gas city carrier has a closed, level deck and bounded shared geometry',()=>{
  const {group,animations}=createFloatingPlatform(THREE),deck=group.getObjectByName('main-deck-y-zero');
  assert(deck?.isMesh);assert.deepEqual(animations,[]);assert.equal(group.userData.platformSurface.y,0);
  const deckBounds=new THREE.Box3().setFromObject(deck);
  assert.equal(deckBounds.max.y,0);assert(Math.abs(deckBounds.max.x-2.3)<1e-6);assert(Math.abs(deckBounds.max.z-2.3)<1e-6);
  const p=deck.geometry.attributes.position;let volume=0;
  for(let i=0;i<p.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2);volume+=a.dot(b.cross(c))/6;}
  assert(volume>0,'deck shell must face outwards');
  let drawCalls=0,triangles=0,instances=0;const geometries=new Set(),materials=new Set();
  group.traverse(o=>{
    assert(!o.isLight,'emitters do not allocate lights');if(!o.isMesh)return;
    drawCalls++;const count=o.isInstancedMesh?o.count:1;instances+=count;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*count;
    geometries.add(o.geometry);materials.add(o.material);assert(o.geometry.userData.platformResource);assert(o.material.userData.platformResource);
    for(const key of ['position','normal'])assert(Array.from(o.geometry.attributes[key].array).every(Number.isFinite));
    if(o.isInstancedMesh)assert(Array.from(o.instanceMatrix.array).every(Number.isFinite));
  });
  assert(drawCalls<35);assert(triangles<35000);assert(geometries.size<=6);assert(materials.size<=10);
  const bounds=new THREE.Box3().setFromObject(group);
  assert(bounds.min.y>=-1.3);assert(bounds.max.y<.56);assert(Math.max(Math.abs(bounds.min.x),bounds.max.x)<7.4);assert(Math.max(Math.abs(bounds.min.z),bounds.max.z)<6.1);
  console.log(JSON.stringify({drawCalls,triangles,instances,geometries:geometries.size,materials:materials.size,minY:bounds.min.y,maxY:bounds.max.y}));
  let disposedGeometries=0,disposedMaterials=0;
  for(const g of geometries){g.addEventListener('dispose',()=>disposedGeometries++);g.dispose();}
  for(const m of materials){m.addEventListener('dispose',()=>disposedMaterials++);m.dispose();}
  group.clear();assert.equal(group.children.length,0);assert.equal(disposedGeometries,geometries.size);assert.equal(disposedMaterials,materials.size);
});

test('gas buildings and the enlarged airfield have fully supported, separate footprints',()=>{
  const {group,plots}=createFloatingPlatform(THREE),decks=group.children.filter(o=>o.name.includes('deck-')),raycaster=new THREE.Raycaster();
  assert.deepEqual(Object.keys(plots).sort(),Object.values(buildings).filter(b=>!b.moon).map(b=>b.id).sort());
  assert.equal(decks.length,7);
  const bounds=[],shared={};
  for(const [id,[x,z]] of Object.entries(plots)){
    // Metal and crystal extraction are inactive on Jupiter; radar uses the north deck.
    if(id==='Metal_Mine'||id==='Crystal_Mine')continue;
    const {group:model}=createBuildingModel(THREE,id,1,shared);model.scale.setScalar(id==='Command_Center'?.9:.65);model.position.set(x,0,z);model.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(model);bounds.push({id,box});
    for(const px of [box.min.x,box.max.x])for(const pz of [box.min.z,box.max.z]){
      raycaster.set(new THREE.Vector3(px,4,pz),new THREE.Vector3(0,-1,0));
      const hit=raycaster.intersectObjects(decks)[0];assert(hit,id+' unsupported building footprint corner');assert(Math.abs(hit.point.y)<1e-6,'building plinth must sit on y=0');
    }
  }
  for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){
    const a=bounds[i],b=bounds[j];assert(a.box.max.x<b.box.min.x||a.box.min.x>b.box.max.x||a.box.max.z<b.box.min.z||a.box.min.z>b.box.max.z,`${a.id} overlaps ${b.id}`);
  }
  assert(Math.hypot(plots.Gas_Mine[0]-plots.Gas_Storage[0],plots.Gas_Mine[1]-plots.Gas_Storage[1])<1.5,'gas extraction and storage share a deck');
});

test('gas district has a visible green intake outside the mine and storage foundations',()=>{
  const {group,plots}=createFloatingPlatform(THREE),intake=group.userData.gasIntake,ring=group.getObjectByName('carrier/intakeRing/gas');
  assert(intake&&ring?.isInstancedMesh);assert.equal(ring.count,3);assert(ring.material.emissive.g>ring.material.emissive.r);assert(ring.material.emissiveIntensity>.5);
  assert(intake.bottom< -1,'collection pipe reaches the cloud layer');
  const [x,y,z]=intake.center,matrix=new THREE.Matrix4(),center=new THREE.Vector3();ring.getMatrixAt(0,matrix);center.setFromMatrixPosition(matrix);assert(center.distanceTo(new THREE.Vector3(x,y,z))<1e-6);
  for(const id of['Gas_Mine','Gas_Storage']){
    const {group:model}=createBuildingModel(THREE,id);model.scale.setScalar(.65);model.position.set(plots[id][0],0,plots[id][1]);model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model);
    assert(z-intake.radius>bounds.max.z,'green ring remains in front of the building foundation');
  }
  assert(y>0,'intake rim is above the deck');assert(z+intake.radius>-1.55,'intake projects over the cloud-facing deck edge');
});
