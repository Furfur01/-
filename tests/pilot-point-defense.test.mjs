import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {missileTargetValid,missileGuidance,segmentEllipsoidHit} from '../game/ship-missiles.mjs';

const source=fs.readFileSync(new URL('../opendesign/mockups/galactic-command/hangar.js',import.meta.url),'utf8');
const section=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
function setup(){
  const flight={pos:[0,0,0],hull:100,shield:100,profile:{turretDamage:.12},turretMode:'auto',turretShots:0,targets:[],projectiles:[],particles:[],beams:[],salvoQueue:[]};
  let roll=.09,rolls=0,damage=0;
  const V={add:(a,b)=>a.map((v,i)=>v+b[i]),sub:(a,b)=>a.map((v,i)=>v-b[i]),scale:(a,k)=>a.map(v=>v*k),dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),length:a=>Math.hypot(...a),norm:a=>a.map(v=>v/(Math.hypot(...a)||1))};
  const context=vm.createContext({state:{flight,shipIndex:0},COMBAT:[{capital:false}],SHIPS:[{id:'Destroyer'},{id:'Light_Fighter'},{id:'Heavy_Fighter'},{id:'Titanenergetic_Frigate'}],LAYOUTS:[{pdMuzzles:[[0,0,0]],bounds:{center:[0,0,0],half:[1,1,1]}}],V,M:{transform:(_,v)=>v},shipMatrix:()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],missileTargetValid,missileGuidance,segmentEllipsoidHit,Math:Object.assign(Object.create(Math),{random:()=>{rolls++;return roll;}}),burst:()=>{},launchMissile:()=>{},clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),hitSegment:()=>0,damageTarget:()=>damage++});
  vm.runInContext(section('  const PD_RANGE=','  function defenseTarget(')+section('  function shootTurret(','  function fireTurrets(')+section('  function updateProjectiles(','  function updateFlight('),context);
  context.weaponRay=()=>({start:[0,0,0],dir:[1,0,0]});
  return {flight,context,run:code=>vm.runInContext(code,context),roll:n=>roll=n,rolls:()=>rolls,damage:()=>damage};
}
const fighter=(kind=1,x=20)=>({kind,hp:100,pos:[x,0,0],velocity:[0,0,0]});
const missile=(x=20)=>({hostile:true,missile:true,age:0,life:10,pos:[x,0,0],velocity:[0,0,0],trail:[],trailClock:0});

test('PD selects only nearby fighters or hostile live missiles, prioritizing missiles',()=>{
  const s=setup(),capital=fighter(0,1),far=fighter(1,81),near=fighter(2,30),incoming=missile(40);
  s.flight.targets=[capital,far];assert.equal(s.run('pdTarget([0,0,0])'),null);
  s.flight.targets.push(near);assert.equal(s.run('pdTarget([0,0,0])'),near);
  s.flight.projectiles=[{...incoming,hostile:false}, {...incoming,missile:false}];assert.equal(s.run('pdTarget([0,0,0])'),near);
  s.flight.projectiles.push(incoming);assert.equal(s.run('pdTarget([0,0,0])'),incoming);
  incoming.intercepted=true;assert.equal(s.run('pdTarget([0,0,0])'),near);
  for(const kind of [1,2,3]){s.context.target=fighter(kind);assert.equal(s.run('pdFighter(target)'),true);}
});

test('manual PD cannot bypass target class, range, or hold-fire; lifetime caps travel at 80',()=>{
  const s=setup();s.flight.turretMode='manual';s.context.turret={index:0,transform:{},cooldown:0,inArc:true};
  for(const target of [fighter(0),fighter(1,81),null]){s.context.turret.pdTarget=target;assert.equal(s.run('shootTurret(turret)'),false);}
  s.context.turret.pdTarget=fighter();s.flight.turretMode='hold';assert.equal(s.run('shootTurret(turret)'),false);
  s.flight.turretMode='manual';assert.equal(s.run('shootTurret(turret)'),true);
  const bullet=s.flight.projectiles[0];assert.equal(bullet.life*145,80);
  s.run('updateProjectiles(1)');assert.equal(s.flight.projectiles.length,0);assert.ok(Math.hypot(...bullet.pos)<=80.000001);
});

test('PD collision ignores capital ships and hits fighters',()=>{
  const s=setup();const bullet=()=>({kind:'pd',pos:[0,0,0],velocity:[145,0,0],age:0,life:80/145,damage:.12});
  s.flight.targets=[fighter(0)];s.flight.projectiles=[bullet()];s.run('updateProjectiles(.01)');assert.equal(s.damage(),0);
  s.flight.targets=[fighter()];s.flight.projectiles=[bullet()];s.run('updateProjectiles(.01)');assert.equal(s.damage(),1);
});

test('slow PD rounds lead fast incoming missiles ahead of the ship',()=>{
  const s=setup();s.context.incoming={...missile(80),velocity:[-290,0,0]};
  const aim=s.run('pdAim([0,0,0],incoming)');assert.ok(Math.abs(aim[0]-80/3)<.00001);
});

test('each missile hit rolls once at strict 0.1 percent; misses preserve missile and consume PD round',()=>{
  for(const roll of [0,.000999,.001,.1,.9]){
    const s=setup(),incoming={...missile(5),target:s.flight};s.roll(roll);
    const bullet={kind:'pd',pos:[0,0,0],velocity:[145,0,0],age:0,life:80/145,damage:.12};
    s.flight.projectiles=[incoming,bullet];s.run('updateProjectiles(.05)');
    assert.equal(s.rolls(),1);assert.equal(s.flight.projectiles.includes(bullet),false);
    assert.equal(s.flight.projectiles.includes(incoming),roll>=.001);
    s.run('updateProjectiles(.05)');assert.equal(s.rolls(),1);
  }
});

