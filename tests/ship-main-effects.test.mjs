import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {mainGunVisual,mainGunGlow} from '../game/ship-main-effects.mjs';
const fleet=JSON.parse(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/flight-fleet.json',import.meta.url)));

test('capital main guns get world-sized bodies and readable first-person glow',()=>{
  for(const id of ['Cruiser','Battleship','Dreadnought','Destroyer','Interceptor','Devourer_Interceptor','Bomber']){
    const index=fleet.ships.findIndex(s=>s.id===id),p=fleet.profiles[index];
    assert.equal(p.visual.capital,true,id);assert.ok(p.visual.radius>p.beamWidth,id);
    assert.ok(p.visual.trail>=4.5&&p.visual.muzzle>=60);
    assert.ok(mainGunGlow(p.visual,400,1000,1)>=12);
  }
  const spear=fleet.profiles[fleet.ships.findIndex(s=>s.id==='Devourer_Interceptor')].visual;
  assert.ok(spear.radius>=1.3&&spear.trail>=30);
  const near=mainGunGlow(spear,40,1000,1),far=mainGunGlow(spear,800,1000,1);
  assert.ok(near>far&&near<=110&&far>=22);
});

test('fighter effects and point-defense bullets do not inherit capital readability enlargement',()=>{
  for(const id of ['Light_Fighter','Heavy_Fighter','Titanenergetic_Frigate']){
    const v=fleet.profiles[fleet.ships.findIndex(s=>s.id===id)].visual;
    assert.equal(v.capital,false);assert.equal(mainGunGlow(v,20,1000,1),3);
  }
  assert.equal(mainGunGlow(undefined,20,1000,1),3);
  const v=mainGunVisual('heavy',50,.8);assert.ok(v.radius>.8);
});


test('elite weapons visibly outrank capital guns without upgrading fighter effects',()=>{
  const capital=mainGunVisual('laser',20,.11),elite=mainGunVisual('nuclear',50,.33),fighter=mainGunVisual('laser',1,.02);
  assert.ok(capital.radius>=1);assert.ok(elite.radius>capital.radius*2);
  assert.ok(elite.blastRadius>capital.blastRadius*3);assert.ok(elite.muzzle>capital.muzzle);assert.ok(elite.beamPixels>capital.beamPixels);
  assert.equal(fighter.elite,false);assert.equal(fighter.capital,false);
});
