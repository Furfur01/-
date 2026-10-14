import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer} from '../game/engine.mjs';

test('report API exposes saved snapshots and rejects forged settlements and foreign reports',async()=>{
  const world=createWorld(),player=createPlayer(world,'回放检查'),other=createPlayer(world,'另一玩家');
  const report={id:'stored-report',type:'battle',winner:'defender',seed:42,initial:{attacker:{Light_Fighter:1},defender:{Battleship:1}},survivors:{attacker:{},defender:{Battleship:1}},losses:{attacker:{Light_Fighter:1},defender:{}},loot:[0,0,0],rounds:[]};
  player.reports=[structuredClone(report)];
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'empire-api-test-')),file=path.join(directory,'universe.json');
  fs.writeFileSync(file,JSON.stringify(world));
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file,GODOT_BIN:'missing-native-engine'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`;
  let errors='';child.stderr.on('data',chunk=>{errors+=chunk;});
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error(errors);}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('server startup timeout')),10000);timer.unref();})]);
    const headers={Cookie:`empire=${player.id}`,Origin:base,'Content-Type':'application/json'};
    for(let i=0;i<2;i++){
      const response=await fetch(base+'/api/replay/'+report.id,{headers});
      assert.equal(response.status,200);assert.deepEqual(await response.json(),{version:3,report});
    }
    assert.equal((await fetch(base+'/api/replay/'+report.id,{headers:{Cookie:`empire=${other.id}`}})).status,404);
    assert.equal((await fetch(base+'/api/replay/'+report.id,{method:'POST',headers:{Cookie:headers.Cookie}})).status,403);
    assert.equal((await fetch(base+'/api/replay/'+report.id,{method:'POST',headers:{...headers,Origin:'http://foreign.invalid'}})).status,403);
    const legacyPost=await fetch(base+'/api/replay/'+report.id,{method:'POST',headers});
    assert.equal(legacyPost.status,200);assert.deepEqual(await legacyPost.json(),{version:3,report});
    assert.equal((await fetch(base+'/api/replay/'+report.id,{method:'POST',headers:{...headers,Cookie:`empire=${other.id}`}})).status,404);
    const forged=await fetch(base+'/api/action',{method:'POST',headers,body:JSON.stringify({type:'settleBattle',id:report.id,winner:'attacker',survivors:{attacker:{Death_Star:9999}},loot:[1e9,1e9,1e9]})});
    assert.equal(forged.status,400);
    const state=await (await fetch(base+'/api/state',{headers})).json();
    assert.deepEqual(state.reports[0],report);
    assert.deepEqual(state.planets[0].ships,world.planets[player.home].ships);
    assert.deepEqual(JSON.parse(fs.readFileSync(file,'utf8')).players[player.id].reports[0],report);
  }finally{
    child.kill();await once(child,'exit');fs.rmSync(directory,{recursive:true,force:true});
  }
});
