import test from 'node:test';
import assert from 'node:assert/strict';
import {createRefinedShip,refinedIds} from '../opendesign/mockups/galactic-command/fleet-refined.js';
import {disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {createShipKit} from '../opendesign/mockups/galactic-command/ship-detail-kit.js';
import {createShipKit as createSculptedKit} from '../opendesign/mockups/galactic-command/ship-sculpted-kit.js';
import {Box3,Vector3} from 'three';

test('rotating an armor block keeps its assigned hull position',()=>{
  const kit=createShipKit('rotation-check');
  kit.section('armor',()=>{kit.block(1,.4,2,3,0,4).rotation.y=Math.PI/2;});
  const model=kit.finish(),center=new Box3().setFromObject(model).getCenter(new Vector3());
  assert.ok(Math.abs(center.x-3)<1e-6);assert.ok(Math.abs(center.z-4)<1e-6);
  disposeShip(model);
});

test('all eighteen additional models contain detailed geometry without unbounded draw calls',()=>{
  for(const id of refinedIds){const model=createRefinedShip(id);let meshes=0,triangles=0;model.traverse(o=>{if(o.isMesh){meshes++;triangles+=o.geometry.attributes.position.count/3;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite),id);assert.ok(o.geometry.attributes.normal.array.every(Number.isFinite),id);}});assert.ok(meshes>1&&meshes<160,id);assert.ok(triangles>3000,id);assert.equal(model.userData.silhouetteVerified,false);disposeShip(model);}
});
test('shared turrets remain low and short after adoption by the fleet',()=>{
  const kit=createSculptedKit('mount');kit.section('weapon',()=>kit.turret(0,0,0));const model=kit.finish();
  const b=new Box3().setFromObject(model),size=b.getSize(new Vector3());
  assert.ok(b.max.y<.26);assert.ok(size.z<1.36);assert.ok(size.x>.9);
  disposeShip(model);
});
test('probe branches are actual 120 degree rotations, not three labels on a two-arm hull',()=>{
  const model=createRefinedShip('Probe'),branches=model.children.filter(g=>g.name.startsWith('02_Radial_sensor_branch'));
  assert.equal(branches.length,3);assert.equal(model.userData.unarmed,true);
  for(let n=1;n<3;n++){
    const angle=n*2*Math.PI/3,c=Math.cos(angle),s=Math.sin(angle);
    for(const mesh of branches[0].children){const peer=branches[n].children.find(p=>p.material.name===mesh.material.name);assert.ok(peer);const a=mesh.geometry.attributes.position,b=peer.geometry.attributes.position;assert.equal(a.count,b.count);for(let i=0;i<a.count;i++){assert.ok(Math.abs(b.getX(i)-(a.getX(i)*c-a.getY(i)*s))<1e-5);assert.ok(Math.abs(b.getY(i)-(a.getX(i)*s+a.getY(i)*c))<1e-5);assert.ok(Math.abs(b.getZ(i)-a.getZ(i))<1e-5);}}
  }
  disposeShip(model);
});
test('satellite is unarmed and keeps two arrays of three by three panels',()=>{
  const model=createRefinedShip('Solar_Satellite');assert.equal(model.userData.unarmed,true);assert.deepEqual(model.userData.solarPanels,{wings:2,rows:3,columns:3});assert.equal(model.children.filter(x=>x.name.endsWith('_solar_array')).length,2);disposeShip(model);
});
