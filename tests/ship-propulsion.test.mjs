import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Vector3,Raycaster} from 'three';
import {shipPropulsion,plumeEnvelope,plumeMeshData} from '../game/ship-propulsion.mjs';
import {publicCatalog} from '../game/catalog.mjs';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
const fleet=JSON.parse(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/flight-fleet.json',import.meta.url)));
const native=JSON.parse(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/battle-fleet.json',import.meta.url)));

test('exhaust has smooth finite normals and no cross-section caps that cut across the flame',()=>{
  const data=plumeMeshData();assert.ok(data.length>0&&data.length%39===0);assert.ok(data.every(Number.isFinite));
  for(let i=0;i<data.length;i+=39)assert.ok(new Set([data[i],data[i+13],data[i+26]]).size>1);
  for(let i=0;i<data.length;i+=13){assert.ok(Math.abs(Math.hypot(...data.slice(i+3,i+6))-1)<1e-6);if(data[i]===1)assert.equal(Math.hypot(data[i+1],data[i+2]),0);}
});

test('propulsion follows required drives and distinguishes description evidence from concepts',()=>{
  for(const [id,drive]of Object.entries({Light_Fighter:'Combustion_Drive',Heavy_Fighter:'Impulse_Drive',Cruiser:'Impulse_Drive',Bomber:'Impulse_Drive',Battleship:'Hyperspace_Drive',Dreadnought:'Hyperspace_Drive',Destroyer:'Hyperspace_Drive',Interceptor:'Particle_Collapse',Iron_Behemoth:'Jump_Drive'})){
    const p=shipPropulsion(publicCatalog.shipArchive.find(s=>s.id===id));assert.equal(p.drive,drive);assert.notEqual(p.source,'concept');
  }
  for(const id of ['Titanenergetic_Frigate','Devourer_Interceptor'])assert.equal(shipPropulsion({id}).source,'concept');
  assert.throws(()=>shipPropulsion({id:'unknown'}));
});

test('all eleven ship exhaust origins are attached to actual aft geometry at approved scale',()=>{
  for(const layout of fleet.layouts){
    assert.ok(layout.engines.length>0,layout.id);const model=createShipModel(layout.id);model.updateMatrixWorld(true);
    for(const e of layout.engines){
      assert.ok(e.radius>0&&Number.isFinite(e.radius));
      const [z,y,nx]=e.position,origin=new Vector3(-nx,y,z+e.radius*2);
      const hit=new Raycaster(origin,new Vector3(0,0,-1)).intersectObject(model,true)[0];
      assert.ok(hit,layout.id);assert.ok(Math.abs(hit.point.z-z)<=e.radius*.02,layout.id+' detached exhaust');
    }
    disposeShip(model);
  }
});

test('throttle and boost increase plume length and brightness without unbounded flicker',()=>{
  for(const time of [0,.2,1,50]){
    const idle=plumeEnvelope(0,false,time,9),cruise=plumeEnvelope(40,false,time,9),full=plumeEnvelope(100,false,time,9),boost=plumeEnvelope(100,true,time,9);
    assert.ok(idle.length<cruise.length&&cruise.length<full.length&&full.length<boost.length);
    assert.ok(idle.alpha<cruise.alpha&&cruise.alpha<full.alpha&&full.alpha<boost.alpha);
    assert.ok(boost.alpha<=1&&boost.length<33);
    assert.deepEqual(plumeEnvelope(-10,false,time,9),idle);assert.deepEqual(plumeEnvelope(200,false,time,9),full);
  }
});

test('probe and civilian flight assets carry attached aft-facing engine nozzles',()=>{
  for(const id of ['Probe','Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler']){
    const layout=native.ships.find(s=>s.id===id).layout;
    assert(layout.engines.length>=2,id+' needs visible propulsion');
    if(id==='Probe')assert.equal(layout.engines.length,3);
    assert.equal(layout.propulsion.drive,shipPropulsion(publicCatalog.shipArchive.find(s=>s.id===id)).drive);
    const model=createShipModel(id);model.updateMatrixWorld(true);
    try{for(const e of layout.engines){
      assert(e.radius>0);assert(Math.hypot(e.direction[0]-1,e.direction[1],e.direction[2])<1e-6,id+' must exhaust opposite its forward axis');
      const [z,y,nx]=e.position,hit=new Raycaster(new Vector3(-nx,y,z+e.radius*2),new Vector3(0,0,-1)).intersectObject(model,true)[0];
      assert(hit&&Math.abs(hit.point.z-z)<=e.radius*.03,id+' flame must start at the physical nozzle');
    }}finally{disposeShip(model);}
  }
});
