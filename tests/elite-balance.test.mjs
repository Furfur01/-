import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {startTrial,trialCatalog} from '../game/battle-trial.mjs';
import {stepSpatialBattle} from '../game/spatial-battle.mjs';

test('published values match entrants and damage budgets, including multi-barrel division',()=>{
 const w=createWorld(0),p=createPlayer(w,'Values',0),catalog=trialCatalog();
 for(const {id,stats:v} of catalog.ships){
  const b=startTrial(w,p,{attacker:{[id]:1},defender:{Battleship:1}},0),s=b.ships[0];
  assert.equal(v.hull,s.hp);assert.equal(v.shield,s.shield);assert.equal(v.attack,s.attack);
  if(v.special==='antimatter'){assert.equal(v.dps,null);assert.equal(v.blast.peak,s.attack);continue;}
  const weapons=[v.primary,v.secondary,v.missiles].filter(Boolean);assert.ok(Math.abs(weapons.reduce((n,w)=>n+w.dps,0)-s.attack/6)<1e-8);
  for(const w of weapons)assert.ok(Math.abs(w.perRound*w.count-w.volley)<1e-8);
  if(v.primary){assert.equal(v.primary.range,s.profile.range);assert.equal(v.primary.cooldown,s.profile.cooldown);}
 }
});
test('elite guns keep firing and defeat a normal battleship promptly after opening fire',()=>{
 const w=createWorld(0),p=createPlayer(w,'Duels',0);
 for(const [type,maxSeconds] of [['Reaper',10],['Interceptor',22],['Devourer_Interceptor',24]]){
  const b=startTrial(w,p,{attacker:{[type]:1},defender:{Battleship:1},seed:42},0);
  while(b.status==='active'&&b.tick<2000)stepSpatialBattle(b);
  const fires=b.events.filter(e=>e.type==='fire'&&e.shipId===0&&!e.secondary);
  assert.equal(b.winner,'attacker',type);assert.ok(fires.length>=2);
  assert.ok((b.tick-fires[0].tick)*.05<maxSeconds,type+' should use its actual primary firepower');
 }
});
test('antimatter explosion preserves observation, following and pilot cameras',()=>{
 const context={window:{},URLSearchParams,location:{search:''}};vm.runInNewContext(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/battlefield-controller.js',import.meta.url),'utf8'),context);
 const state={flight:{specialBlasts:[]}},battle=context.window.createFlightController({state,notice(){},tone(){}});
 for(const overview of [true,false]){
  Object.assign(battle,{overview,center:[50,60,70],distance:420,overviewYaw:.7,overviewPitch:.6,cinematicAnchor:7,selected:3,controlled:overview?null:3});
  const read=()=>JSON.stringify([battle.overview,battle.center,battle.distance,battle.overviewYaw,battle.overviewPitch,battle.cinematicAnchor,battle.selected,battle.controlled]),before=read();
  battle.effect({type:'antimatter',source:1,tick:100,x:300,y:400,z:500,radius:680,harmless:false});assert.equal(read(),before);
 }
 assert.equal(state.flight.specialBlasts.length,1,'explosion still renders and is deduplicated');
});
