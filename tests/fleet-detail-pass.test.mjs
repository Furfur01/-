import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3,Vector3} from 'three';
import {detailedFleetIds} from '../opendesign/mockups/galactic-command/fleet-detail-pass.js';
import {createRefinedShip} from '../opendesign/mockups/galactic-command/fleet-refined.js';
import {createRemainingCombat,remainingCombatIds} from '../opendesign/mockups/galactic-command/fleet-remaining-combat.js';
import {createRemainingCivil} from '../opendesign/mockups/galactic-command/fleet-remaining-civil.js';
import {disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';

test('nine reference overlays keep their supporting hull geometry intact and stay close to its silhouette',()=>{
  assert.equal(detailedFleetIds.length,9);assert.ok(!detailedFleetIds.includes('Guardian'));assert.ok(!detailedFleetIds.includes('Death_Star'));
  for(const id of detailedFleetIds){
    const raw=remainingCombatIds.includes(id)?createRemainingCombat(id):createRemainingCivil(id),refined=createRefinedShip(id);
    assert.equal(refined.userData.detailPass,'reference-structure-02');assert.ok(refined.userData.detailAssemblies>=12,id);assert.ok(refined.userData.referenceFeatures.some(x=>x.startsWith(({Bomber:'B02_',Cargo_Ship:'C02_',Large_Cargo_Ship:'L02_',Colony_Ship:'K01_',Recycler:'R01_',Solar_Satellite:'S01_',Interceptor:'I05_',Devourer_Interceptor:'D01_',Titanenergetic_Frigate:'T03_'})[id])),id+' keeps its reference-specific structures');
    for(let i=0;i<raw.children.length;i++){
      const a=raw.children[i],b=refined.children[i];assert.equal(a.name,b.name);assert.equal(a.children.length,b.children.length);
      for(let j=0;j<a.children.length;j++)assert.deepEqual(a.children[j].geometry.attributes.position.array,b.children[j].geometry.attributes.position.array,id+' original hull is unchanged');
    }
    const before=new Box3().setFromObject(raw),after=new Box3().setFromObject(refined),a=before.getSize(new Vector3()),b=after.getSize(new Vector3());
    for(const axis of['x','y','z'])assert.ok(b[axis]-a[axis]<.65,id+' detail stays within hull silhouette tolerance on '+axis);
    disposeShip(raw);disposeShip(refined);
  }
});
test('archived rebuild batch keeps the original death star and guardian exports',()=>{
  for(const id of['Death_Star','Guardian']){
    const current=fs.readFileSync(new URL('../models/generated/remaining-fleet-rebuild-01/'+id+'.glb',import.meta.url));
    const previous=fs.readFileSync(new URL('../models/archive/before-nine-detail-20261013/deliverables/'+id+'.glb',import.meta.url));
    assert.deepEqual(current,previous,id);
  }
});
