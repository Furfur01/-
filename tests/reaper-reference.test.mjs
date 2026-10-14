import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Box3} from 'three';
import {reaperReferenceGeometry} from '../opendesign/mockups/galactic-command/reaper-reference-geometry.js';
import {createShipModel,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {shipWeaponLayouts} from '../game/ship-weapon-mounts.mjs';

test('Reaper imports the original geometry builders verbatim, not a silhouette approximation',()=>{
  const html=fs.readFileSync(new URL('../models/reference/reaper-user-20261013/starfighter_model.html',import.meta.url),'utf8').replaceAll('\r','');
  const imported=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/reaper-reference-geometry.js',import.meta.url),'utf8').replaceAll('\r','');
  assert.ok(imported.includes(html.slice(html.indexOf('function rgb(hex)'),html.indexOf('// ---------- upload all 3D meshes ----------'))));
  const raw=reaperReferenceGeometry(),model=createShipModel('Reaper'),reference=model.getObjectByName('User_RAVEN_original_geometry');
  let count=0;reference.traverse(m=>{if(m.isMesh){count+=m.geometry.attributes.position.count;assert.ok(m.geometry.attributes.position.array.every(Number.isFinite));assert.ok(m.geometry.attributes.normal.array.every(Number.isFinite));}});
  assert.equal(count,(raw.solid.length+raw.engine.length)/13);
  const original=[];for(const key of['solid','engine'])for(let i=0;i<raw[key].length;i+=13)original.push(raw[key].slice(i,i+3).map(Math.fround).join(','));
  const actual=[];reference.traverse(m=>{if(m.isMesh){const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)actual.push([p.getX(i),p.getY(i),p.getZ(i)].join(','));}});
  assert.deepEqual(actual.sort(),original.sort());
  assert.equal(model.userData.engineNozzles.length,5);assert.ok(model.userData.referenceGeometry);
  assert.ok(Math.abs(new Box3().setFromObject(model).max.z-new Box3().setFromObject(model).min.z-90)<1e-6);
  disposeShip(model);
});

test('reference hardpoints match seated mounts and upward missile ports',()=>{
  const model=createShipModel('Reaper'),layout=shipWeaponLayouts.Reaper;
  for(const [actual,configured]of[[model.userData.seatedMounts,layout.pointDefense],[model.userData.seatedTubes,layout.missiles]]){
    assert.equal(actual.length,configured.length);actual.forEach((p,i)=>p.forEach((v,j)=>assert.ok(Math.abs(v-configured[i][j])<.00001)));
  }
  assert.deepEqual(layout.launchDirection,[0,1,0]);disposeShip(model);
});

test('armored warhead keeps its self-propelled role without turrets or an exposed core',()=>{
  const model=createShipModel('Annihilator');assert.ok(model.getObjectByName('Armored_antimatter_torpedo'));
  assert.equal(model.userData.weaponLayout.muzzles.length,0);assert.equal(model.userData.weaponLayout.pointDefense.length,0);
  assert.equal(model.userData.articulations.length,0);assert.equal(model.userData.engineNozzles.length,1);
  assert.equal(model.userData.revision,'armored-antimatter-02');disposeShip(model);
});
