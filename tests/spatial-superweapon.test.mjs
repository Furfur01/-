import test from 'node:test';
import assert from 'node:assert/strict';
import {trialCatalog,trialUnits,validateTrial} from '../game/battle-trial.mjs';
import {units} from '../game/catalog.mjs';
import {createSpatialBattle,addSpatialFleet,advanceSpatialBattle,packedShips,controlBattle,spatialSnapshot} from '../game/spatial-battle.mjs';

function scene(){
 const b=createSpatialBattle({id:'super',attacker:'a',defender:'d',start:0,seed:42});
 addSpatialFleet(b,{fleet:{Annihilator:1},side:'attacker',owner:'a'},trialUnits);
 addSpatialFleet(b,{fleet:{Battleship:3,Reaper:1},side:'defender',owner:'d'},trialUnits);
 for(const s of b.ships){s.x=s.id?250:0;s.y=0;s.z=[0,0,100,900,200][s.id];s.speed=0;if(s.id){s.attack=0;s.profile={...s.profile,speed:0};s.hp=s.maxHp=1000;s.shield=s.maxShield=5000;}}
 return b;
}
test('military trial roster includes capital and superweapon hulls without enabling civilian or formal construction',()=>{
 const ids=trialCatalog().ships.map(s=>s.id);
 for(const id of ['Death_Star','Reaper','Titanenergetic_Frigate','Annihilator','Iron_Behemoth'])assert.ok(ids.includes(id));
 for(const id of ['Cargo_Ship','Guardian'])assert.ok(!ids.includes(id));
 for(const id of ['Reaper','Titanenergetic_Frigate','Annihilator','Iron_Behemoth'])assert.equal(units[id],undefined);
 assert.deepEqual(validateTrial({attacker:{Annihilator:1,Reaper:2},defender:{Death_Star:1}}).attacker,{Annihilator:1,Reaper:2});
});
test('antimatter travels as one expendable hull, expands after contact, bypasses shields and preserves immunity',()=>{
 const b=scene();assert.throws(()=>controlBattle(b,'a',{type:'claim',shipId:0}),/只能驾驶/);
 advanceSpatialBattle(b,1900);assert.equal(b.ships[0].x,0);assert.equal(b.events.filter(e=>e.type==='antimatter').length,0);
 advanceSpatialBattle(b,3000);assert.ok(b.ships[0].x>0);assert.equal(b.ships[1].hp,1000);
 advanceSpatialBattle(b,4200);assert.equal(b.ships[0].hp,0);assert.equal(b.status,'active','blast completes after its last launcher is gone');
 const event=b.events.find(e=>e.type==='antimatter');assert.ok(event&&!event.harmless);assert.ok(spatialSnapshot(b).specialBlasts.length);
 const restored=JSON.parse(JSON.stringify(b));advanceSpatialBattle(b,10000);advanceSpatialBattle(restored,10000);
 assert.deepEqual(packedShips(b),packedShips(restored));assert.deepEqual(b.events,restored.events);
 assert.equal(b.ships[1].hp,0);assert.equal(b.ships[2].hp,0);assert.equal(b.ships[1].shield,5000);
 assert.equal(b.ships[3].hp,1000,'out-of-radius hull survives');assert.equal(b.ships[4].hp,1000,'Reaper is immune');
 assert.equal(b.events.filter(e=>e.type==='antimatter').length,1);assert.equal(b.events.filter(e=>e.type==='destroy'&&e.shipId===1).length,1);assert.equal(b.status,'finished');
});
test('lost lock safely consumes ordnance without damaging nearby ships; no friendly blast damage',()=>{
 const b=scene();advanceSpatialBattle(b,2100);b.ships[b.ships[0].launch.target].hp=0;advanceSpatialBattle(b,2200);
 assert.ok(b.events.find(e=>e.type==='antimatter').harmless);advanceSpatialBattle(b,8000);assert.equal(b.ships[2].hp,1000);
 const friendly=scene();addSpatialFleet(friendly,{fleet:{Dreadnought:1},side:'attacker',owner:'a'},trialUnits);const ally=friendly.ships.at(-1);ally.x=270;ally.y=ally.z=0;ally.profile.speed=0;ally.attack=0;const hp=ally.hp;advanceSpatialBattle(friendly,10000);assert.equal(ally.hp,hp);
});

test('losing a target before launch rearms against a live target without exploding on the launch line',()=>{
 const b=scene();advanceSpatialBattle(b,1000);const s=b.ships[0];
 assert.ok(s.launch&&!s.launch.fired);b.ships[s.launch.target].hp=0;
 const before=[s.x,s.y,s.z];advanceSpatialBattle(b,1500);
 assert.ok(s.hp>0);assert.deepEqual([s.x,s.y,s.z],before);
 assert.equal(b.events.filter(e=>e.type==='antimatter').length,0);
 const copy=structuredClone(b);advanceSpatialBattle(b,6000);advanceSpatialBattle(copy,6000);
 assert.deepEqual(b,copy);
 const launch=b.events.find(e=>e.type==='antimatter-launch'),blast=b.events.find(e=>e.type==='antimatter');
 assert.ok(launch);assert.ok(!blast||blast.tick>=launch.tick);
});
test('Reaper uses dual beam profile and restores bounded shields; Titan has real missile equipment',()=>{
 const b=createSpatialBattle({id:'reaper',attacker:'a',defender:'d',start:0});addSpatialFleet(b,{fleet:{Reaper:1,Titanenergetic_Frigate:1},side:'attacker',owner:'a'},trialUnits);addSpatialFleet(b,{fleet:{Death_Star:1},side:'defender',owner:'d'},trialUnits);
 const s=b.ships[0],t=b.ships[2];for(const ship of b.ships){ship.x=0;ship.y=ship.z=0;ship.profile.speed=0;}t.x=100;t.attack=0;s.target=2;s.shield=0;s.cooldown=0;s.yaw=Math.PI/2;
 advanceSpatialBattle(b,50);assert.ok(s.shield>0&&s.shield<=s.maxShield*.08);assert.ok(b.events.some(e=>e.type==='fire'&&e.kind==='reaper'));assert.equal(s.profile.muzzles.length,2);assert.ok(b.ships[1].profile.secondaryMissile);assert.equal(b.ships[1].profile.missiles.length,12);
});
