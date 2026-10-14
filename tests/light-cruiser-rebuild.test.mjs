import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Box3,Vector3} from 'three';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {createRebuiltCombat} from '../opendesign/mockups/galactic-command/fleet-rebuild-combat.js';

test('the light fighter and cruiser retain reference proportions with finite, bounded geometry',()=>{
  for(const [id,reference]of [['Light_Fighter',[13.78,6.22,14]],['Cruiser',[9.36,5.62,14]]]){
    const m=createShipModel(id),size=new Box3().setFromObject(m).getSize(new Vector3()).divideScalar(m.scale.x).toArray();
    assert.equal(m.userData.rebuiltFromScratch,true);assert.equal(m.userData.referenceViews,'recovered-tripo');
    for(let i=0;i<3;i++)assert.ok(Math.abs(size[i]/reference[i]-1)<.12,id+' reference bounds');
    let meshes=0;m.traverse(o=>{if(!o.isMesh)return;meshes++;for(const attr of['position','normal'])assert.ok(o.geometry.attributes[attr].array.every(Number.isFinite));});
    assert.ok(meshes<160);disposeShip(m);
  }
  assert.throws(()=>createRebuiltCombat('Dreadnought'),/Unknown/);
});

test('six retained ships keep their geometry, transforms and colors after the requested stern revisions',()=>{
  const hashes=JSON.parse(fs.readFileSync(new URL('../models/archive/remaining-resume-20261013/protected-ten-hashes.json',import.meta.url)));
  assert.equal(Object.keys(hashes).length,10);
  for(const [id,expected]of Object.entries(hashes)){
    if(['Destroyer','Cruiser','Reaper','Annihilator'].includes(id))continue;
    const m=createShipModel(id),h=createHash('sha256');m.scale.setScalar(id==='Iron_Behemoth'?2.8:1);m.updateMatrixWorld(true);
    m.traverse(o=>{if(!o.isMesh)return;for(const key of['position','normal','color']){const a=o.geometry.attributes[key]?.array;if(a)h.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));}h.update(JSON.stringify(o.matrixWorld.elements));h.update(JSON.stringify(o.material.color.toArray()));});
    assert.equal(h.digest('hex'),expected,id);disposeShip(m);
  }
});
