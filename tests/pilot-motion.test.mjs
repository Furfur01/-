import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {predictPilot} from '../game/pilot-motion.mjs';
import {createSpatialBattle,addSpatialFleet,controlBattle,stepSpatialBattle,packedShips} from '../game/spatial-battle.mjs';
import {trialUnits} from '../game/battle-trial.mjs';
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

test('heading intent is validated, rate limited and matches fixed-step prediction',()=>{
 const b=createSpatialBattle({id:'pilot',attacker:'a',defender:'d',start:0});
 addSpatialFleet(b,{fleet:{Light_Fighter:1},owner:'a',side:'attacker'},trialUnits);
 addSpatialFleet(b,{fleet:{Death_Star:1},owner:'d',side:'defender'},trialUnits);
 controlBattle(b,'a',{type:'claim',shipId:0});
 const input={throttle:1,yaw:0,pitch:0,heading:-2.9,elevation:.9},s=b.ships[0];
 for(const bad of [{heading:NaN},{heading:4},{elevation:2}])assert.throws(()=>controlBattle(b,'a',{type:'input',shipId:0,seq:0,input:{...input,...bad}}),/朝向/);
 controlBattle(b,'a',{type:'input',shipId:0,seq:0,input});
 const prediction=predictPilot([0,s.x,s.y,s.z,s.yaw,s.pitch,s.hp,s.shield,s.target,s.speed],s.profile,input,.4),start=s.yaw;
 for(let i=0;i<8;i++)stepSpatialBattle(b);
 assert.ok(Math.abs(wrap(s.yaw-start))<=s.profile.turn*.4+1e-9);
 for(const key of ['x','y','z','yaw','pitch','speed'])assert.ok(Math.abs(s[key]-prediction[key])<1e-8,key);
});

test('mouse heading responds locally and remains smooth across 200ms snapshots at 30/60/120 FPS',()=>{
 for(const fps of [30,60,120]){
  let clock=0;const context={window:{},URLSearchParams,location:{search:''},performance:{now:()=>clock}};
  vm.runInNewContext(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/battlefield-controller.js',import.meta.url),'utf8'),context);
  const profile={speed:110,turn:2.2,cooldown:.8},p={pos:[0,0,0],yaw:0,pitch:0,yawTarget:1.8,pitchTarget:.5,throttle:0,profile:{},align:false};
  const battle=context.window.createFlightController({state:{flight:p,shipIndex:0},COMBAT:[{}],keys:new Set(),getMouseDown:()=>false,selectedTarget:()=>null,clamp,mix:(a,b,t)=>a+(b-a)*t,shortAngle:wrap,V:{sub:(a,b)=>a.map((v,i)=>v-b[i]),length:a=>Math.hypot(...a)}});
  Object.assign(battle,{controlled:0,selected:0,received:0,metadata:[{id:0,profile,maxHp:100,maxShield:100}],rows:[[0,0,0,0,Math.PI,0,100,100,-1,0]]});
  let server=battle.rows[0],input={throttle:0,yaw:0,pitch:0,heading:Math.PI,elevation:0},lastServer=0,lastSend=-1,lastSnapshot=0,lastYaw=0,maxLag=0,minStep=Infinity;
  for(let frame=0;frame<fps*2;frame++){
   clock=frame*1000/fps;
   if(clock-lastSend>=100||lastSend<0){input=battle.pilotIntent();lastSend=clock;}
   while(lastServer+50<=clock+1e-6){const s=predictPilot(server,profile,input,.05);server=[0,s.x,s.y,s.z,s.yaw,s.pitch,100,100,-1,s.speed];lastServer+=50;}
   if(clock-lastSnapshot>=200-1e-6){battle.rows=[server];battle.received=clock;lastSnapshot=clock;}
   battle.applyOwn();const yaw=wrap(p.yaw),delta=wrap(yaw-lastYaw);lastYaw=yaw;
   if(frame>0)minStep=Math.min(minStep,delta);
   maxLag=Math.max(maxLag,Math.abs(wrap(yaw-(Math.PI-server[4]))));
   if(frame===2)assert.ok(yaw>.025,'turn begins before the next snapshot');
  }
  assert.ok(minStep>-.012,`${fps} FPS must not repeatedly pull the camera backward: ${minStep}`);
  assert.ok(maxLag<.2,`${fps} FPS local/server difference: ${maxLag}`);
  assert.ok(Math.abs(wrap(p.yaw)-1.8)<.02);assert.ok(Math.abs(p.pitch-.5)<.02);
 }
});
