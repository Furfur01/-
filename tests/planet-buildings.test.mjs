import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildings} from '../game/catalog.mjs';
import {createBuildingModel} from '../opendesign/mockups/galactic-command/planet-buildings.js';

test('all twenty industrial building models are finite, pickable and bounded',()=>{
  assert.equal(Object.keys(buildings).length,20);const shared={},shapes=new Set();let drawCalls=0,instances=0;
  for(const id of Object.keys(buildings)){
    const {group,height,animations}=createBuildingModel(THREE,id,8,shared),bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
    assert(Number.isFinite(height)&&height>.3&&height<3.5,id);assert(bounds.min.y>=-.002,id+' must sit above its foundation');
    assert(id==='Shipyard'?size.x<=6.01&&size.z<=4.01:size.x<2&&size.z<2,id+' footprint');
    let meshes=0,parts=0;group.traverse(o=>{assert(!o.isLight,id+' must not allocate lights');if(o.isMesh){meshes++;parts+=o.count;assert(o.isInstancedMesh);assert.equal(o.userData.building,id);assert(o.geometry.userData.sharedBuilding);assert(o.material.userData.sharedBuilding);assert(Array.from(o.instanceMatrix.array).every(Number.isFinite));}});
    assert(meshes<=26,id+' draw-call budget');assert(parts>=(group.userData.reference==='apk-original'?100:25),id+' detail');
    for(const animation of animations){assert.equal(animation.kind,'rotate');assert(['x','y','z'].includes(animation.axis));assert(Number.isFinite(animation.speed));assert(animation.mesh.parent);}
    shapes.add([meshes,parts,size.x.toFixed(3),height.toFixed(3),size.z.toFixed(3)].join(':'));drawCalls+=meshes;instances+=parts;
  }
  assert.equal(shapes.size,20);assert(shared.buildingResources.geometries.size<=36);assert(shared.buildingResources.materials.size<=20);
  for(const geometry of shared.buildingResources.geometries.values())for(const name of ['position','normal'])assert(Array.from(geometry.attributes[name].array).every(Number.isFinite),geometry.type+' '+name);
  console.log(JSON.stringify({models:20,drawCalls,instances,sharedGeometries:shared.buildingResources.geometries.size,sharedMaterials:shared.buildingResources.materials.size}));
});

test('shipyard has a broad paved runway and four fixed fighters inside its airfield',()=>{
  const {group,animations}=createBuildingModel(THREE,'Shipyard'),bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
  assert(size.x>=5.99&&size.z>=3.99);assert.deepEqual(animations,[]);
  assert.equal(group.userData.parkedFighters,4);assert.equal(group.userData.fighterParking.length,4);
  assert.equal(group.userData.runway.axis,'x');assert(group.userData.runway.length>5&&group.userData.runway.width>1);
  const wings=group.getObjectByName('Shipyard/fighterWing/white'),matrix=new THREE.Matrix4(),position=new THREE.Vector3();assert.equal(wings.count,4);
  group.userData.fighterParking.forEach(([x,y,z],index)=>{
    wings.getMatrixAt(index,matrix);position.setFromMatrixPosition(matrix);
    assert(Math.abs(position.x-x)<1e-6&&Math.abs(position.y-y-.145)<1e-6&&Math.abs(position.z-z)<1e-6);
    assert(Math.abs(x)+.45<3&&Math.abs(z)+.55<2,'fighter stays on the airfield');
    if(index<3)assert(z+.45<group.userData.runway.center[2]-group.userData.runway.width/2,'parked fighter keeps runway clear');
  });
  assert(group.userData.fighterParking[3][1]>1.5,'fourth fighter occupies the upper landing pad');
  const raycaster=new THREE.Raycaster(),deck=group.getObjectByName('Shipyard/airfield/steel');
  for(const x of[-2.6,0,2.6])for(const z of[.44,1.44]){
    raycaster.set(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));assert(raycaster.intersectObject(deck).length,'runway corners are supported by metal paving');
  }
});

test('robotics workshop has a closed service bay without an animated conveyor',()=>{
  const {group,animations}=createBuildingModel(THREE,'Robotics_Facility');
  assert.deepEqual(animations,[]);assert(!group.getObjectByName('conveyor drive roller'));assert(group.getObjectByName('Robotics_Facility/armor/white'));
});

test('redesigned extraction and storage models identify their concept reference',()=>{
  const originals=['Solar_Plant','Robotics_Facility','Shipyard','Research_Lab','Radar_Facility','Fusion_Reactor'],concepts=['Command_Center','Metal_Mine','Crystal_Mine','Gas_Mine','Metal_Storage','Crystal_Storage','Gas_Storage'],shared={};
  for(const id of Object.keys(buildings))assert.equal(createBuildingModel(THREE,id,1,shared).group.userData.reference,concepts.includes(id)?'planet-concept':originals.includes(id)?'apk-original':'original-industrial');
  for(const key of ['solarArc','archRoof','halfDisc','tube','shard'])assert(shared.buildingResources.geometries.has(key),'distinct APK construction geometry '+key);
  const positions=shared.buildingResources.geometries.get('shard').getAttribute('position');let volume=0;
  for(let i=0;i<positions.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(positions,i),b=new THREE.Vector3().fromBufferAttribute(positions,i+1),c=new THREE.Vector3().fromBufferAttribute(positions,i+2);volume+=a.dot(b.cross(c))/6;}
  assert(volume>0,'closed crystal facets must face outwards');
});

test('animated mechanisms stay grounded and inside their industrial plot',()=>{
  const shared={};
  for(const id of Object.keys(buildings)){
    const {group,animations}=createBuildingModel(THREE,id,8,shared);
    if(!animations.length)continue;
    for(let frame=0;frame<16;frame++){
      for(const animation of animations)animation.mesh.rotation[animation.axis]=frame*Math.PI/8;
      group.updateMatrixWorld(true);
      const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
      // InstancedMesh rotated bounding boxes are conservative, especially for the circular portal.
      assert(bounds.min.y>=-.002,id+' animated foundation');assert(size.x<2.1&&size.z<2.1,id+' animated footprint');assert(bounds.max.y<3.5,id+' animated height');
    }
  }
});

test('rebuilding and leveling a colony reuse every geometry and material',()=>{
  const shared={};for(const id of Object.keys(buildings))createBuildingModel(THREE,id,1,shared);
  const geometries=[...shared.buildingResources.geometries.values()],materials=[...shared.buildingResources.materials.values()];
  for(const id of Object.keys(buildings))createBuildingModel(THREE,id,20,shared);
  assert.deepEqual([...shared.buildingResources.geometries.values()],geometries);assert.deepEqual([...shared.buildingResources.materials.values()],materials);
  assert.throws(()=>createBuildingModel(THREE,'Missing_Building',1,shared),/Unknown colony building/);
});
