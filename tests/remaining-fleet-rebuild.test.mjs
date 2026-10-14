import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {remainingCombatIds} from '../opendesign/mockups/galactic-command/fleet-remaining-combat.js';
import {remainingCivilIds} from '../opendesign/mockups/galactic-command/fleet-remaining-civil.js';

const read=path=>JSON.parse(fs.readFileSync(new URL('../'+path,import.meta.url)));
test('remaining batch contains eleven ships and excludes the four retained versions',()=>{
  const ids=[...remainingCombatIds,...remainingCivilIds];
  assert.equal(ids.length,11);assert.equal(new Set(ids).size,11);
  for(const id of['Probe','Battleship','Annihilator','Reaper'])assert.ok(!ids.includes(id));
  for(const id of ids){const model=createShipModel(id);if(id==='Death_Star'){assert.equal(model.userData.revision,'death-star-user-01');assert.equal(model.userData.referenceGeometry,true);}else{assert.equal(model.userData.revision,'remaining-three-view-01');assert.equal(model.userData.rebuiltFromScratch,true);assert.equal(model.userData.referenceViews,['Solar_Satellite','Guardian'].includes(id)?'interpreted':'recovered-tripo');}disposeShip(model);}
});
test('colony and devourer references use the corrected identities despite retained filenames',()=>{
  const rows=read('models/recovered/remaining-tripo-20261013/manifest.json');
  for(const [id,file,sha] of[
    ['Devourer_Interceptor','Colony_Ship.glb','252569b1e7d99b235c36d7b2e2ccb73af55237f88edc6f3a636dee569ee363b6'],
    ['Colony_Ship','Devourer_Interceptor.glb','5d23affa39036dd3bd8d3d95e22dee70b74b1e4d2eed0f6bdf877bebef52f01e']
  ]){
    const row=rows.find(r=>r.id===id);assert.equal(row.file,file);assert.equal(row.sha256,sha);
    assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../models/recovered/remaining-tripo-20261013/'+file,import.meta.url))).digest('hex'),sha);
  }
});
test('every delivered GLB matches its successful contact audit',()=>{
  const base='models/generated/remaining-fleet-rebuild-01/',manifest=read(base+'manifest.json'),audit=read(base+'connections.json');
  assert.equal(manifest.length,11);assert.equal(Object.keys(audit).length,11);
  for(const row of manifest){const a=audit[row.id];assert.equal(a.connectedClusters,1,row.id);assert.deepEqual(a.detached,[]);assert.equal(a.sha256,createHash('sha256').update(fs.readFileSync(new URL('../'+base+row.file,import.meta.url))).digest('hex'),row.id+' audit matches the current mesh');}
});
