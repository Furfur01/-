import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3,Raycaster,Texture} from 'three';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';

test('user Death Star has a real open concave dish and equatorial trench',()=>{
  const model=createShipModel('Death_Star');
  assert.equal(model.userData.revision,'death-star-user-01');
  assert.equal(model.userData.emitterCount,8);
  const hull=model.getObjectByName('Death_Star_open_armor'),bowl=model.getObjectByName('Death_Star_parabolic_bowl');
  const dish=model.getObjectByName('Death_Star_concave_superlaser');
  const direction=new Vector3(0,0,1).transformDirection(dish.matrixWorld);
  const ray=new Raycaster(direction.clone().multiplyScalar(20),direction.clone().negate(),0,20);
  assert.equal(ray.intersectObject(hull).length,0,'no armor closes the dish');
  assert.ok(ray.intersectObject(bowl).length>0,'dish recess is real geometry');
  const trenchRay=new Raycaster(new Vector3(0,0,20),new Vector3(0,0,-1),0,20);
  assert.equal(trenchRay.intersectObject(hull).length,0,'equator is cut open');
  assert.ok(trenchRay.intersectObject(model.getObjectByName('Death_Star_equatorial_trench')).length>0);
  const size=new Box3().setFromObject(model).getSize(new Vector3());
  for(const value of size.toArray())assert.ok(value>13.7&&value<14.1,'retains station display scale');
  const p=bowl.geometry.attributes.position;assert.ok(Math.abs(p.getZ(p.count-1)-p.getZ(0)-18)<.001);
  let instances=0;model.traverse(o=>{if(o.isInstancedMesh)instances+=o.count;if(o.geometry)assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));});
  assert.ok(instances>25000,'source machinery remains instanced');
  disposeShip(model);
});

test('model cleanup releases all texture channels and instance buffers once',()=>{
  const model=createShipModel('Death_Star'),mesh=model.getObjectByName('Death_Star_surface_machinery');
  let released=0;mesh.addEventListener('dispose',()=>released++);
  const texture=new Texture();let textureReleased=0;texture.addEventListener('dispose',()=>textureReleased++);
  mesh.material.map=texture;mesh.material.bumpMap=texture;mesh.material.emissiveMap=texture;
  disposeShip(model);assert.equal(released,1);assert.equal(textureReleased,1);
});
