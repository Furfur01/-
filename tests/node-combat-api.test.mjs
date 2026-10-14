import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,act} from '../game/engine.mjs';


test('20k real fleets settle without Godot and both browser reports equal persisted losses',async()=>{
  const started=Date.now()-3600000,world=createWorld(started),attacker=createPlayer(world,'20k attacker',started),defender=createPlayer(world,'20k defender',started);
  const home=world.planets[attacker.home],target=world.planets[defender.home];
  const fleet={Light_Fighter:7000,Heavy_Fighter:2000,Cruiser:700,Battleship:300};
  home.ships=structuredClone(fleet);target.ships=structuredClone(fleet);target.defense={};home.resources=[1e8,1e8,1e8];
  attacker.tech={Weapons_Tech:4,Shielding_Tech:3,Strength_Tech:3};defender.tech={Weapons_Tech:3,Shielding_Tech:3,Strength_Tech:4};
  act(world,attacker,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:structuredClone(fleet)},started);
  const mission=world.missions.find(m=>m.owner===attacker.id);assert.ok(mission.end<Date.now());mission.seed=20261010;

  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'empire-node-combat-')),file=path.join(directory,'universe.json');
  fs.writeFileSync(file,JSON.stringify(world));
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,GODOT_BIN:'missing-and-not-needed'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;let errors='';child.stderr.on('data',chunk=>{errors+=chunk;});
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error(errors);}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('server startup timeout')),10000);timer.unref();})]);
    const state=async player=>{const response=await fetch(base+'/api/state',{headers:{Cookie:`empire=${player.id}`}});assert.equal(response.status,200);return response.json();};
    const attackState=await state(attacker),defenseState=await state(defender);
    const attackReport=attackState.reports.find(r=>r.type==='battle'),defenseReport=defenseState.reports.find(r=>r.type==='battle');
    assert.ok(attackReport);assert.ok(defenseReport);assert.equal(attackReport.simulation.implementation,'spatial-v2');const expected=attackReport;assert.deepEqual(expected.initial,{attacker:fleet,defender:fleet});for(const side of ['attacker','defender'])for(const[id,n]of Object.entries(fleet))assert.equal((expected.losses[side][id]||0)+(expected.survivors[side][id]||0),n);
    for(const report of [attackReport,defenseReport])for(const field of ['initial','survivors','losses','rounds','debris','stateHash'])assert.deepEqual(report[field],expected[field]);
    for(const[player,report]of [[attacker,attackReport],[defender,defenseReport]]){
      const response=await fetch(base+'/api/replay/'+report.id,{headers:{Cookie:`empire=${player.id}`}});assert.equal(response.status,200);const replay=await response.json();assert.deepEqual(replay.report,report);assert.equal(replay.version,4);assert.equal(replay.record.metadata.length,20000);assert.ok(replay.record.frames.length>1);
    }
    assert.equal((await fetch(base+'/api/replay/'+attackReport.id,{headers:{Cookie:`empire=${defender.id}`}})).status,404);
    const saved=await fetch(base+'/api/action',{method:'POST',headers:{Cookie:`empire=${attacker.id}`,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({type:'readAll'})});assert.equal(saved.status,200);
    const disk=JSON.parse(fs.readFileSync(file,'utf8'));
    assert.deepEqual(disk.players[attacker.id].reports.find(r=>r.type==='battle').survivors,expected.survivors);
    assert.deepEqual(disk.planets[target.id].ships,expected.survivors.defender);
    assert.deepEqual(disk.planets[target.id].debris,expected.debris);
    await state(attacker);assert.equal((await state(attacker)).reports.filter(r=>r.type==='battle').length,1);assert.equal(errors,'');
  }finally{
    child.kill();await once(child,'exit');
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep+'empire-node-combat-'));fs.rmSync(directory,{recursive:true,force:true});
  }
});
