import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import * as THREE from 'three';
import {units,publicCatalog} from '../game/catalog.mjs';
import {createShipModel,modelIds,disposeShip} from '../opendesign/mockups/galactic-command/ship-models.js';
import {communityShipStats} from '../game/ship-community-stats.mjs';

const archive=publicCatalog.shipArchive,reference=JSON.parse(fs.readFileSync(new URL('../models/reference/original-atlas-v1/name-map.json',import.meta.url)));
test('spinal guns require an explicit compatible hull and match the model',()=>{
  assert.deepEqual(archive.filter(s=>s.spinalMount).map(s=>s.id),['Destroyer','Interceptor','Devourer_Interceptor']);
  for(const id of ['Battleship','Cruiser','Iron_Behemoth','Destroyer']){
    const model=createShipModel(id),allowed=!!archive.find(s=>s.id===id).spinalMount;
    assert.equal(!!model.userData.spinalMount,allowed);
    assert.equal(!!model.getObjectByName('01b_Internal_spinal_battery'),false);
    disposeShip(model);
  }
});
test('a capital ship without a spinal mount fires turrets instead of charging a bow beam',()=>{
  const source=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/hangar.js',import.meta.url),'utf8');
  const fn=source.slice(source.indexOf('  function fireMain(){'),source.indexOf('  // A segment / oriented ellipsoid'));
  const flight={profile:{capital:true,spinal:false},gunCooldown:0,charging:false};let turrets=0,main=0;
  const context=vm.createContext({state:{flight},canFire:()=>true,fireTurrets:()=>turrets++,dischargeMain:()=>main++,tone:()=>{}});
  assert.equal(vm.runInContext(fn+';fireMain()',context),true);assert.equal(turrets,1);assert.equal(main,0);assert.equal(flight.charging,false);
  flight.profile.capital=false;vm.runInContext('fireMain()',context);assert.equal(main,1);
});
test('all 90 base statistic fields agree with the recorded user screenshots',()=>{
  const text=fs.readFileSync(new URL('../research/截图参数校准.md',import.meta.url),'utf8');
  const ids=['Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Probe','Solar_Satellite','Light_Fighter','Heavy_Fighter','Cruiser','Battleship','Dreadnought','Bomber','Destroyer','Death_Star','Guardian'];
  for(let i=0;i<ids.length;i++){const line=text.split('\n').find(l=>l.startsWith('| IMG_'+(3981+i)+' |')),values=line.split('|').slice(3,9).map(s=>Number(s.trim().replaceAll(',','')));assert.deepEqual(['fuel','strength','attack','shield','speed','cargo'].map(k=>units[ids[i]][k]),values,ids[i]);}
});
test('all 20 APK ship identities plus the separate legacy Guardian are modeled',()=>{
  assert.deepEqual(archive.filter(s=>s.apkId).map(s=>s.apkId),[1,2,3,4,5,6,7,8,9,10,11,12,13,14,23,24,25,26,28,29]);
  assert.deepEqual(new Set(archive.map(s=>s.id)),new Set(modelIds));
  assert.equal(archive.find(s=>s.id==='Guardian').apkId,null);
  assert.equal(archive.find(s=>s.apkId===26).id,'Titanenergetic_Frigate');
  for(const s of archive){assert.equal(s.apkStats,null);assert.equal(s.apkRapid,null);if(!s.playable){assert.equal(s.rapid,null);if(communityShipStats[s.id]){assert.deepEqual(s.stats,communityShipStats[s.id]);assert.match(s.statsSource,/galaxyempire.fandom.com/);}else assert.ok(Object.values(s.stats).every(v=>v===null));assert.equal(units[s.id],undefined);}}
});
test('archive sprites match the APK reference bytes, statistics and both counter directions match settlement catalog',()=>{
  for(const s of archive){
    if(s.reference){const r=reference.rows.find(r=>r.category==='fleet'&&r.id===s.apkId);assert.equal(r.project_or_reference_id,s.id);assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../models/reference/original-atlas-v1/'+s.reference,import.meta.url))).digest('hex'),s.referenceHash);}
    if(s.playable){for(const[k,v]of Object.entries(s.stats))assert.equal(v,units[s.id][k]);assert.deepEqual(s.rapid,units[s.id].rapid);for(const[target,rate]of Object.entries(s.rapid)){assert.ok(units[target],target);assert.ok(Number.isFinite(rate)&&rate>1);}}
  }
  assert.equal(archive.find(s=>s.id==='Dreadnought').rapid.Battleship,10);
  assert.equal(archive.find(s=>s.id==='Destroyer').rapid.Dreadnought,2);
  assert.equal(archive.find(s=>s.id==='Guardian').rapid.Death_Star,10);
  const reaper=archive.find(s=>s.id==='Reaper');assert.match(reaper.description,/免疫湮灭之星/);
});
test('all ship models have finite, nonempty, distinct geometry and reject unknown identities',()=>{
  const hashes=new Set();for(const id of modelIds){
    const model=createShipModel(id);let triangles=0;const hash=crypto.createHash('sha256');
    model.traverse(o=>{if(o.isMesh){const a=o.geometry.attributes.position.array;assert.ok(a.every(Number.isFinite),id);triangles+=(o.geometry.index?.count||a.length/3)/3;hash.update(Buffer.from(a.buffer,a.byteOffset,a.byteLength));hash.update(JSON.stringify([o.position.toArray(),o.rotation.toArray(),o.scale.toArray()]));}});
    assert.ok(triangles>100,id);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());assert.ok(size.toArray().every(n=>n>0&&Number.isFinite(n)),id);hashes.add(hash.digest('hex'));disposeShip(model);
  }
  assert.equal(hashes.size,modelIds.length);assert.throws(()=>createShipModel('NoSuchShip'),/未知/);
});
