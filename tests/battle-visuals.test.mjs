import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {addShieldHit} from '../game/flight-scenes.mjs';

test('authoritative shield hits reach the practice renderer with charge in percent',()=>{
  const context={window:{},URLSearchParams,location:{search:''}};
  vm.runInNewContext(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/battlefield-controller.js',import.meta.url),'utf8'),context);
  const battle=context.window.createFlightController({state:{flight:{pos:[0,0,0],particles:[]}},COMBAT:[{}],LAYOUTS:[{joints:[]}],V:{sub:(a,b)=>a.map((v,i)=>v-b[i]),length:a=>Math.hypot(...a)},burst:()=>{},shipMatrix:()=>[],renderer:{weaponImpact(){},shieldImpact(v,index,model,point,amount,charge){addShieldHit(v.shieldHits,point,0,amount,charge);}}});
  battle.indices=new Map([['Cruiser',0]]);battle.metadata=[{id:0,type:'Cruiser',maxShield:200,profile:{length:10}}];
  battle.rows=[[0,0,0,0,0,0,100,150]];battle.previous=[[0,0,0,0,0,0,100,200]];
  const before=JSON.stringify(battle.rows);
  battle.effect({type:'hit',shipId:0,shield:true,x:0,y:0,z:0});
  const hits=battle.visualVessel(0).shieldHits;assert.equal(hits.length,1);assert.equal(hits[0].weak,false,'full shield must appear blue, not depleted orange');
  battle.previous[0][7]=40;battle.effect({type:'hit',shipId:0,shield:true,x:0,y:0,z:0});assert.equal(hits.at(-1).weak,true);
  battle.effect({type:'hit',shipId:0,shield:false,x:0,y:0,z:0});assert.equal(hits.length,2,'hull-only hits cannot create shield flashes');
  assert.equal(JSON.stringify(battle.rows),before,'visual effects cannot alter authoritative health');
});


test('prediction stops before an intervening enemy and terminal event removes the same projectile',()=>{
  const context={window:{},URLSearchParams,location:{search:''}};
  vm.runInNewContext(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/battlefield-controller.js',import.meta.url),'utf8'),context);
  const state={flight:{pos:[0,0,0],particles:[],projectiles:[{id:7}]}},impacts=[];
  const battle=context.window.createFlightController({state,COMBAT:[{}],LAYOUTS:[],V:{sub:(a,b)=>a.map((v,i)=>v-b[i]),add:(a,b)=>a.map((v,i)=>v+b[i]),scale:(v,s)=>v.map(x=>x*s),norm:v=>v.map(x=>x/(Math.hypot(...v)||1)),length:a=>Math.hypot(...a)},mix:(a,b,t)=>a+(b-a)*t,burst:()=>{},renderer:{weaponImpact:(...a)=>impacts.push(a)}});
  battle.metadata=[{id:0,type:'Cruiser',side:'defender',profile:{length:10,radius:5}}];battle.indices=new Map([['Cruiser',0]]);battle.rows=[[0,50,0,0,0,0,100,0]];battle.row=id=>battle.rows[id];
  const q={id:7,x:0,y:0,z:0,dx:100,dy:0,dz:0,speed:540,side:'attacker'};
  assert.ok(Math.abs(battle.projectilePosition(q,.2)[0]-44.6)<1e-8);
  battle.projectiles=[q];battle.projectileVisuals.set(7,{});
  battle.effect({type:'hit',shipId:0,projectileId:7,x:44.6,y:0,z:0,shield:false});
  assert.equal(battle.projectiles.length,0);assert.equal(state.flight.projectiles.length,0);assert.equal(battle.projectileVisuals.size,0);assert.equal(impacts.length,1);
  assert.equal(battle.rows[0][6],100,'presentation never applies damage');
});

test('antimatter warhead has one blast, safe disarm has none, and victim destruction still renders',()=>{
 const context={window:{},URLSearchParams,location:{search:''}};
 vm.runInNewContext(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/battlefield-controller.js',import.meta.url),'utf8'),context);
 const state={flight:{pos:[0,0,0],particles:[],specialBlasts:[]}},impacts=[];
 const battle=context.window.createFlightController({state,COMBAT:[{}],LAYOUTS:[{length:20}],notice(){},tone(){},burst(){},renderer:{weaponImpact:(...a)=>impacts.push(a)},V:{sub:(a,b)=>a.map((v,i)=>v-b[i]),length:a=>Math.hypot(...a)}});
 battle.metadata=[{id:0,type:'Annihilator',profile:{length:8}},{id:1,type:'Battleship',profile:{length:20}}];battle.indices=new Map([['Annihilator',0],['Battleship',0]]);
 battle.effect({type:'destroy',shipId:0,source:0,kind:'antimatter',x:0,y:0,z:0});assert.equal(impacts.length,0);assert.equal(battle.presentation.impacts.length,0);
 const blast={type:'antimatter',source:0,tick:50,x:0,y:0,z:0,radius:680};battle.effect(blast);battle.effect(blast);assert.equal(state.flight.specialBlasts.length,1);
 battle.effect({...blast,tick:60,harmless:true});assert.equal(state.flight.specialBlasts.length,1);
 battle.effect({type:'destroy',shipId:1,source:0,kind:'antimatter',x:50,y:0,z:0});assert.equal(impacts.length,1);
});
