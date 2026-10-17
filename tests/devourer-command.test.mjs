import test from 'node:test';
import assert from 'node:assert/strict';
import {trialUnits,trialCatalog,finishTrial} from '../game/battle-trial.mjs';
import {createSpatialBattle,addSpatialFleet,stepSpatialBattle,advanceSpatialBattle,controlBattle,spatialSurvivors,spatialSnapshot} from '../game/spatial-battle.mjs';
import {DEVOURER,SWARM_TYPE,commandMultiplier,commandedTarget,swarmGoal} from '../game/devourer-command.mjs';

function scene(fleet={Iron_Behemoth:1,Cruiser:12},enemy={Death_Star:1}){
  const b=createSpatialBattle({id:'test-devourer',attacker:'test-a',defender:'test-d',start:0,seed:42});
  addSpatialFleet(b,{fleet,side:'attacker',owner:'test-a'},trialUnits);
  addSpatialFleet(b,{fleet:enemy,side:'defender',owner:'test-d'},trialUnits);
  for(const s of b.ships){s.x=s.side==='attacker'?0:600;s.y=0;s.z=s.id*2;s.yaw=s.side==='attacker'?Math.PI/2:-Math.PI/2;s.profile.speed=0;if(s.side==='defender'){s.attack=0;s.hp=s.maxHp=1e9;}}
  return b;
}
const carrier=b=>b.ships.find(s=>s.type==='Iron_Behemoth'),enemy=b=>b.ships.find(s=>s.side==='defender');
const drones=b=>b.ships.filter(s=>s.temporary&&s.hp>0);
function order(b,action){controlBattle(b,'test-a',{type:'carrier-order',shipId:carrier(b).id,...action});}

test('carrier aura boosts actual shots once, loses effect on final carrier death, never mutates attack',()=>{
  function shot(count){const b=scene({Iron_Behemoth:count,Battleship:1}),s=b.ships.find(s=>s.type==='Battleship');stepSpatialBattle(b);return {b,s,damage:b.projectiles.find(q=>q.source===s.id&&!q.missile)?.damage};}
  const baseline=shot(0),one=shot(1),two=shot(2);
  assert.ok(baseline.damage>0);assert.equal(one.s.attack,baseline.s.attack);
  assert.ok(Math.abs(one.damage/baseline.damage-1.15)<1e-10);assert.equal(two.damage,one.damage);
  const carriers=two.b.ships.filter(s=>s.type==='Iron_Behemoth');carriers[0].hp=0;assert.equal(commandMultiplier(two.b,two.s),1.15);carriers[1].hp=0;assert.equal(commandMultiplier(two.b,two.s),1);
});
test('lock forces a bounded nearby subset, respects manual pilots and releases dead-source orders',()=>{
  const b=scene(),s=carrier(b),target=enemy(b),manual=b.ships[0];
  b.ships[1].x=-3000;
  controlBattle(b,'test-a',{type:'claim',shipId:manual.id});
  order(b,{target:target.id});stepSpatialBattle(b);
  const event=b.events.find(e=>e.type==='focus-command');
  assert.equal(event.target,target.id);assert.equal(event.ships.length,4);assert.ok(!event.ships.includes(manual.id));assert.ok(!event.ships.includes(1));
  for(const id of event.ships){assert.equal(b.ships[id].target,target.id);assert.equal(commandedTarget(b,b.ships[id]),target.id);}
  assert.throws(()=>order(b,{target:target.id}),/冷却/);
  s.hp=0;assert.equal(commandedTarget(b,b.ships[event.ships[0]]),null);
});
test('manual lock also issues focus; hostile, dead, invalid and out of range orders are rejected',()=>{
  const b=scene(),s=carrier(b),t=enemy(b),input={throttle:0,yaw:0,pitch:0,target:t.id,lock:true};
  controlBattle(b,'test-a',{type:'claim',shipId:s.id});controlBattle(b,'test-a',{type:'input',shipId:s.id,seq:1,input});stepSpatialBattle(b);
  assert.equal(b.events.find(e=>e.type==='focus-command').target,t.id);
  assert.throws(()=>controlBattle(b,'test-d',{type:'carrier-order',shipId:s.id,mode:'guard'}));
  assert.throws(()=>order(b,{mode:'invalid'}));assert.throws(()=>order(b,{formation:'invalid'}));
  assert.throws(()=>order(b,{target:s.id}));assert.throws(()=>order(b,{target:1.5}));
  t.x=10000;assert.throws(()=>order(b,{target:t.id}),/范围/);t.hp=0;assert.throws(()=>order(b,{target:t.id}),/无效/);
});
test('player orders can replace automatic focus once without bypassing subsequent cooldowns',()=>{
  const b=scene({},{});
  addSpatialFleet(b,{fleet:{Iron_Behemoth:1,Cruiser:10},owner:'test-a',side:'attacker'},trialUnits);
  addSpatialFleet(b,{fleet:{Battleship:2},owner:'test-d',side:'defender'},trialUnits);
  for(const s of b.ships){s.x=s.side==='attacker'?0:900;s.y=s.z=0;s.profile.speed=0;}
  stepSpatialBattle(b);const s=carrier(b),targets=b.ships.filter(s=>s.side==='defender');
  assert(s.carrier.focusAutomatic);const target=targets.find(t=>t.id!==s.carrier.focusTarget);
  order(b,{target:target.id});stepSpatialBattle(b);
  assert.equal(s.carrier.focusTarget,target.id);assert.equal(s.carrier.focusAutomatic,false);
  assert.equal(b.ships.filter(a=>a.focus?.source===s.id).length,4);
  assert.throws(()=>order(b,{target:targets[0].id}),/冷却/);
});
test('periodic waves are capped, replenish losses, inherit weapon technology and stay outside inventory',()=>{
  const b=scene({Iron_Behemoth:1});stepSpatialBattle(b);assert.equal(drones(b).length,8);
  const first=drones(b)[0];assert.equal(first.maxHp,35);assert.equal(first.maxShield,0);assert.equal(first.attack/6,5500*.8/12/6);
  advanceSpatialBattle(b,6050);assert.equal(drones(b).length,12);
  drones(b).slice(0,3).forEach(s=>s.hp=0);advanceSpatialBattle(b,12050);assert.equal(drones(b).length,12);
  assert.equal(new Set(drones(b).map(s=>s.swarmSlot)).size,12,'replacements fill vacant formation stations');
  assert.equal(b.initial.attacker[SWARM_TYPE],undefined);assert.equal(spatialSurvivors(b).attacker[SWARM_TYPE],undefined);
  const snap=spatialSnapshot(b);assert.equal(snap.carriers[0].active,12);assert.ok(snap.metadata.some(m=>m.temporary&&m.profile.renderType==='Light_Fighter'));
  assert.ok(b.frames.some(f=>f.tick===first.bornTick&&f.ships[first.id]?.[6]>0),'replay records birth exactly');
  const catalog=trialCatalog().ships.find(s=>s.id==='Iron_Behemoth').stats;
  assert.ok(Math.abs(catalog.carrier.swarmDps+catalog.secondary.dps+catalog.missiles.dps-catalog.dps)<1e-8);
  assert.equal(catalog.carrier.fighterHull,210);
});
test('assault drones hit hard, remain fragile, and expire or lose control with the carrier',()=>{
  const b=scene({Iron_Behemoth:1});stepSpatialBattle(b);const d=drones(b)[0],t=enemy(b);
  d.x=t.x-80;d.y=t.y;d.z=t.z;d.yaw=Math.PI/2;d.cooldown=0;d.profile.speed=0;
  const before=t.hp+t.shield;stepSpatialBattle(b);assert.ok(before-t.hp-t.shield>30,'single half-second shot exceeds ordinary fighter damage');
  assert.ok(d.maxHp<trialUnits.Light_Fighter.strength/5);
  d.expires=b.tick+1;stepSpatialBattle(b);assert.equal(d.hp,0);
  carrier(b).hp=0;stepSpatialBattle(b);assert.equal(drones(b).length,0);assert.equal(b.winner,'defender');
});
test('guard swarms draw real hostile fire near the carrier and formation commands move their stations',()=>{
  const b=scene({Iron_Behemoth:1},{Cruiser:1}),s=carrier(b),t=enemy(b);order(b,{mode:'guard',formation:'screen'});stepSpatialBattle(b);
  const d=drones(b)[0];t.x=400;t.y=0;t.z=0;t.target=s.id;t.cooldown=t.secondaryCooldown=t.missileCooldown=0;t.attack=12000;t.yaw=-Math.PI/2;
  d.x=180;d.y=0;d.z=0;d.profile.speed=0;
  const oldGoal=swarmGoal(b,d,t);order(b,{formation:'orbit'});assert.notDeepEqual(swarmGoal(b,d,t),oldGoal);
  stepSpatialBattle(b);assert.ok(b.ships[t.target].temporary,'AI fires at the covering swarm');
  advanceSpatialBattle(b,3000);assert.ok(b.events.some(e=>e.type==='destroy'&&e.shipId===d.id),'the decoy actually takes lethal damage');
});
test('a lethal hit on the last carrier retires its swarm before the final replay frame',()=>{
  const b=scene({Iron_Behemoth:1},{Light_Fighter:1}),s=carrier(b),t=enemy(b);stepSpatialBattle(b);
  s.hp=1;s.shield=0;
  for(const d of drones(b))d.y=200;
  b.projectiles.push({id:b.nextProjectile++,source:t.id,target:s.id,side:t.side,kind:'shell',damage:1000,x:s.x+105,y:s.y,z:s.z,dx:s.x,dy:s.y,dz:s.z,speed:540,ttl:1});
  stepSpatialBattle(b);assert.equal(s.hp,0);assert.equal(b.status,'finished');assert.equal(drones(b).length,0);
  assert.ok(b.frames.at(-1).ships.filter(r=>b.ships[r[0]].temporary).every(r=>r[6]===0));
});
test('guard formation stays around its carrier while firing at an approaching target',()=>{
  for(const formation of ['wedge','screen','orbit']){
    const b=scene({Iron_Behemoth:1}),s=carrier(b),t=enemy(b);t.x=350;order(b,{mode:'guard',formation});advanceSpatialBattle(b,20000);
    assert.ok(drones(b).every(d=>Math.hypot(d.x-s.x,d.y-s.y,d.z-s.z)<=DEVOURER.guardRadius),formation+' remains a local escort');
    assert.ok(b.events.some(e=>e.type==='fire'&&b.ships[e.shipId]?.temporary),'guards still shoot');
  }
});
test('JSON checkpoints, wave production and commands replay deterministically without creating permanent ships',()=>{
  const b=scene();order(b,{mode:'guard',formation:'orbit'});advanceSpatialBattle(b,8250);
  const copy=JSON.parse(JSON.stringify(b));advanceSpatialBattle(b,40000);for(let ms=8300;ms<=40000;ms+=50)advanceSpatialBattle(copy,ms);
  assert.deepEqual(JSON.parse(JSON.stringify(b)),JSON.parse(JSON.stringify(copy)));assert.ok(drones(b).length<=DEVOURER.capacity);
  b.finishedAt=40000;b.winner='draw';const world={players:{'test-a':{reports:[]}},planets:{}};finishTrial(world,b);
  assert.equal(world.players['test-a'].reports[0].survivors.attacker[SWARM_TYPE],undefined);
  assert.equal(world.players['test-a'].reports[0].losses.attacker[SWARM_TYPE],undefined);
});
