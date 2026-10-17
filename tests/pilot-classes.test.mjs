import test from 'node:test';
import assert from 'node:assert/strict';
import {cockpitClass,pilotKeys,pilotHandling,cabinPose,walkCabin} from '../game/pilot-controls.mjs';
import {bridgeObstacles} from '../game/bridge-obstacles.mjs';
import {createSpatialBattle,addSpatialFleet,controlBattle,stepSpatialBattle,packedShips} from '../game/spatial-battle.mjs';
import {trialUnits} from '../game/battle-trial.mjs';
import {predictPilot} from '../game/pilot-motion.mjs';
function fixture(type){const b=createSpatialBattle({id:'pilot',attacker:'a',defender:'d',start:0});addSpatialFleet(b,{fleet:{[type]:1},owner:'a',side:'attacker'},trialUnits);addSpatialFleet(b,{fleet:{Battleship:1},owner:'d',side:'defender'},trialUnits);controlBattle(b,'a',{type:'claim',shipId:0});return b;}
test('fighter inputs roll and pitch; both capital classes turn only on manual keys',()=>{
 for(const [type,kind]of [['Light_Fighter','fighter'],['Heavy_Fighter','fighter'],['Titanenergetic_Frigate','fighter'],['Cruiser','horizon'],['Battleship','horizon'],['Interceptor','bastion'],['Reaper','bastion'],['Iron_Behemoth','bastion']]){
  const b=fixture(type),s=b.ships[0];assert.equal(cockpitClass(s.profile),kind,type);const keys=pilotKeys(new Set(['KeyW','KeyA','KeyQ']),s.profile);assert.equal(keys.throttle,1);assert.equal(keys.roll,kind==='fighter'?-1:0);assert.equal(keys.pitch,kind==='fighter'?1:0);assert.equal(keys.yaw,kind==='fighter'?0:-1);
 }
});
test('server and prediction agree on roll, heavy acceleration and manual pitch restriction',()=>{
 for(const type of ['Light_Fighter','Battleship','Reaper']){const b=fixture(type),s=b.ships[0],input={throttle:1,yaw:0,pitch:1,roll:1,heading:0,elevation:.9},row=[0,s.x,s.y,s.z,s.yaw,s.pitch,s.hp,s.shield,s.target,s.speed,0,0,0];controlBattle(b,'a',{type:'input',shipId:0,seq:0,input});const predicted=predictPilot(row,s.profile,input,.4);for(let i=0;i<8;i++)stepSpatialBattle(b);for(const key of ['x','y','z','yaw','pitch','roll','speed'])assert.ok(Math.abs(s[key]-predicted[key])<1e-8,`${type} ${key}`);if(type!=='Light_Fighter'){assert.equal(s.pitch,0);assert.equal(s.roll,0);}else assert(s.roll>.6);assert.equal(packedShips(b)[0][12],Math.round(s.roll*1000)/1000);}
});
test('capital lock rotates toward the selected enemy once per step, without doubling turn rate',()=>{
 const b=fixture('Reaper'),s=b.ships[0],t=b.ships[1];t.x=s.x;t.z=s.z+1500;t.y=s.y+500;const yaw=s.yaw;controlBattle(b,'a',{type:'input',shipId:0,seq:0,input:{throttle:0,yaw:1,pitch:0,heading:3,elevation:-1,lock:true,target:t.id}});stepSpatialBattle(b);assert(s.pitch>0);assert(Math.abs(s.yaw-yaw)<=pilotHandling(s.profile).turn*.05+1e-9);assert.equal(s.target,t.id);
});
test('walking remains inside the bridge and outside desk collision bounds',()=>{const pose=cabinPose('bastion');for(let i=0;i<1000;i++)walkCabin(pose,new Set(['KeyS','KeyD']),.05,bridgeObstacles);assert(pose.eye[0]<=15&&pose.eye[2]<=32.5);assert(!bridgeObstacles.some(o=>Math.abs(pose.eye[0]-o.x)<o.rx+.45&&Math.abs(pose.eye[2]-o.z)<o.rz+.45));});
test('walking forward cannot pass through the central helm and radar pedestal',()=>{const pose=cabinPose('bastion');for(let i=0;i<200;i++)walkCabin(pose,new Set(['KeyW']),.05,bridgeObstacles);assert(pose.eye[2]>-2,'the near helm blocks the forward path');assert(!bridgeObstacles.some(o=>Math.abs(pose.eye[0]-o.x)<o.rx+.45&&Math.abs(pose.eye[2]-o.z)<o.rz+.45));});
test('the command chair blocks walking backwards until the captain steps around it',()=>{const pose=cabinPose('bastion');for(let i=0;i<20;i++)walkCabin(pose,new Set(['KeyS']),.05,bridgeObstacles);assert(pose.eye[2]<2.3);for(let i=0;i<13;i++)walkCabin(pose,new Set(['KeyA']),.05,bridgeObstacles);for(let i=0;i<20;i++)walkCabin(pose,new Set(['KeyS']),.05,bridgeObstacles);assert(pose.eye[2]>4);});
