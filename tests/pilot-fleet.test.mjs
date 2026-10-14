import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {shipLengths} from '../game/ship-weapon-mounts.mjs';
const dir=new URL('../opendesign/mockups/galactic-command/',import.meta.url),fleet=JSON.parse(fs.readFileSync(new URL('flight-fleet.json',dir)));

test('original pilot renderer receives all approved and trial models at their actual lengths',()=>{
  const bytes=fs.readFileSync(new URL('flight-fleet.bin',dir)),data=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4);
  assert.equal(fleet.ships.length,13);let next=0;
  for(const [i,ship]of fleet.ships.entries()){
    assert.equal(ship.offset,next);assert.equal(ship.floatCount%39,0);next+=ship.floatCount;
    let lo=Infinity,hi=-Infinity;
    for(let j=ship.offset;j<next;j+=13){lo=Math.min(lo,data[j]);hi=Math.max(hi,data[j]);}
    assert.ok(Math.abs(hi-lo-shipLengths[ship.id])<.0001,ship.id);
    assert.equal(fleet.layouts[i].id,ship.id);
    if(ship.relativeLength<=5)assert.equal(fleet.layouts[i].mounts.length,0);
  }
  for(const part of fleet.parts){assert.equal(part.offset,next);assert.ok(part.floatCount>0);assert.equal(part.floatCount%39,0);next+=part.floatCount;}
  assert.equal(next,data.length);assert.ok(data.every(Number.isFinite));
  const titan=fleet.ships.findIndex(s=>s.id==='Titanenergetic_Frigate');assert.equal(fleet.layouts[titan].tubes.length,12);
  const flagship=fleet.ships.findIndex(s=>s.id==='Iron_Behemoth');assert.equal(fleet.layouts[flagship].main.length,0);
});

test('native flight fire control uses actual ship weapon types and does not arm the flagship',()=>{
  const source=fs.readFileSync(new URL('hangar.js',dir),'utf8'),fn=source.slice(source.indexOf('  function fireMain(){'),source.indexOf('  // A segment / oriented ellipsoid'));
  let main=0,missiles=0;const flight={gunCooldown:0,charging:false},context=vm.createContext({state:{flight},canFire:()=>true,dischargeMain:()=>main++,fireMissile:()=>missiles++,tone:()=>{},notice:()=>{}});
  for(const id of ['Battleship','Titanenergetic_Frigate','Bomber','Iron_Behemoth']){
    const index=fleet.ships.findIndex(s=>s.id===id);flight.profile=fleet.profiles[index];flight.charging=false;
    const result=vm.runInContext(fn+';fireMain()',context);
    if(id==='Battleship')assert.equal(main,1);
    if(id==='Titanenergetic_Frigate')assert.equal(flight.charging,true);
    if(id==='Bomber')assert.equal(missiles,1);
    if(id==='Iron_Behemoth')assert.equal(result,false);
  }
});
