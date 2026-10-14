import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createLandscape,GAS_RADIUS,GAS_CENTER_Y} from '../opendesign/mockups/galactic-command/planet-terrain.js';

const landscape=createLandscape(THREE),globe=landscape.globe,earthGeometry=globe.geometry;

test('gas giant expands around a fixed north-pole cloud deck',()=>{
  assert.equal(GAS_RADIUS,42);assert.equal(GAS_CENTER_Y,-36);
  assert.equal(landscape.setType('gas'),'gas');assert.equal(landscape.globe,globe);
  assert.deepEqual(globe.position.toArray(),[0,-36,0]);assert.deepEqual(globe.scale.toArray(),[7,7,7]);
  globe.geometry.computeBoundingSphere();assert(Math.abs(globe.position.y+globe.geometry.boundingSphere.radius*globe.scale.y-6)<1e-4);
  for(const n of[new THREE.Vector3(0,1,0),new THREE.Vector3(1,0,0),new THREE.Vector3(0,-1,0)])assert.equal(landscape.sample(n).radius,42);
  assert.equal(globe.receiveShadow,false,'deck shadow frustum must not clip against giant clouds');
});

test('gas layers are thin, cached, and separate from terrestrial clouds',()=>{
  landscape.setType('gas');const clouds=landscape.gasClouds,atmosphere=landscape.gasAtmosphere;
  assert.equal(landscape.clouds.visible,false);assert.equal(landscape.water.visible,false);assert.equal(landscape.vegetation.visible,false);assert.equal(landscape.atmosphere.visible,false);
  assert(clouds.visible&&atmosphere.visible);assert.equal(clouds.children.length,2);assert.equal(atmosphere.children.length,2);
  for(const group of[clouds,atmosphere]){
    assert.deepEqual(group.position.toArray(),[0,GAS_CENTER_Y,0]);assert.equal(group.scale.x,7);
    for(const mesh of group.children){assert(mesh.material.transparent);assert.equal(mesh.material.depthWrite,false)}
  }
  for(const cloud of clouds.children){assert(cloud.material.uniforms.density.value<=.2);assert.equal(cloud.material.uniforms.uTime,landscape.clock);assert(cloud.scale.y*7-36<7.15,'cloud layer stays below the colony deck')}
  const geometry=globe.geometry,materials=clouds.children.map(mesh=>mesh.material),layers=[...clouds.children,...atmosphere.children];
  for(let i=0;i<10;i++){landscape.setType('mars');landscape.setType('gas');assert.equal(globe.geometry,geometry);assert.deepEqual([...clouds.children,...atmosphere.children],layers);assert.deepEqual(clouds.children.map(mesh=>mesh.material),materials)}
});

test('leaving gas restores geometry, coordinates, weather, and moon compatibility',()=>{
  for(const type of['mercury','mars','moon','terrestrial']){
    landscape.setType('gas');landscape.setType(type);assert.equal(landscape.globe,globe);assert.deepEqual(globe.scale.toArray(),[1,1,1]);assert.deepEqual(globe.position.toArray(),[0,0,0]);assert.equal(globe.receiveShadow,true);assert(!landscape.gasClouds.visible&&!landscape.gasAtmosphere.visible);assert(landscape.sample(new THREE.Vector3(0,1,0)).radius<7);
  }
  assert.equal(globe.geometry,earthGeometry);assert(landscape.water.visible&&landscape.clouds.visible&&landscape.vegetation.visible);assert.equal(landscape.sample(new THREE.Vector3(0,1,0)).radius,6.103);
  landscape.setMoon(true);assert.equal(landscape.type,'moon');landscape.setMoon(false);assert.equal(landscape.type,'terrestrial');assert.equal(globe.geometry,earthGeometry);
});

test('solid planets have distinct faceted terrain, safe colony space and cached ore scenery',()=>{
  const geometries=new Set(),m=new THREE.Matrix4(),p=new THREE.Vector3();
  for(const type of['terrestrial','mercury','mars']){
    assert.equal(landscape.setType(type),type);geometries.add(globe.geometry);assert(globe.material.flatShading);
    assert(landscape.sample(new THREE.Vector3(0,1,0)).radius>6);
    const scenery=landscape.colonyScenery.get(type);assert(scenery.visible);assert(scenery.children.length>3&&scenery.children.length<20);
    for(const mesh of scenery.children){
      assert(mesh.isInstancedMesh);assert(Array.from(mesh.instanceMatrix.array).every(Number.isFinite));
      if(mesh.name.endsWith('-cliff')||mesh.name.endsWith('-tree'))for(let i=0;i<mesh.count;i++){
        mesh.getMatrixAt(i,m);p.setFromMatrixPosition(m).multiplyScalar(5);
        assert(!(p.x>-4.2&&p.x<5.8&&p.z>-4.8&&p.z<5.6),'reserved building sites stay clear');
      }
    }
    if(type==='mercury')assert(scenery.getObjectByName('mercury-ore')&&!scenery.getObjectByName('mercury-crystal'));
    if(type==='mars')assert(scenery.getObjectByName('mars-crystal')&&!scenery.getObjectByName('mars-ore'));
    landscape.setType('gas');assert(!scenery.visible);landscape.setType(type);assert.equal(landscape.colonyScenery.get(type),scenery);
  }
  assert.equal(geometries.size,3);landscape.setType('terrestrial');
});

test('ore terrain adjoins each native mine without crossing the other resource plots',()=>{
  const matrix=new THREE.Matrix4(),box=new THREE.Box3();
  for(const[type,sites]of[['terrestrial',{ore:0,crystal:-2.6,vent:2.6}],['mercury',{ore:0}],['mars',{crystal:0}]]){
    landscape.setType(type);const scenery=landscape.colonyScenery.get(type);
    for(const shade of['ore','crystal','vent']){
      const meshes=scenery.children.filter(mesh=>mesh.name===type+'-'+shade);
      assert.equal(meshes.length>0,Object.hasOwn(sites,shade),'specialist planets only expose their own ore');
      for(const mesh of meshes){
        assert(mesh.material.emissiveIntensity>0,'ore remains identifiable against the dark rock');
        mesh.geometry.computeBoundingBox();
        for(let i=0;i<mesh.count;i++){
          mesh.getMatrixAt(i,matrix);box.copy(mesh.geometry.boundingBox).applyMatrix4(matrix);box.min.multiplyScalar(5);box.max.multiplyScalar(5);
          assert(box.min.x>-6.5&&box.max.x<-4.2,'ore sits on the mine west side without covering machinery');
          assert(box.min.z>sites[shade]-.9&&box.max.z<sites[shade]+.9,'each resource stays inside its own separated patch');
        }
      }
    }
  }
  landscape.setType('terrestrial');
});
