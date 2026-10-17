import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createWorld,createPlayer,migrateWorld,snapshot} from '../game/engine.mjs';

test('state API initializes only the requested systems and persists independent target IDs',async()=>{
  const world=createWorld(),player=createPlayer(world,'测试地图检查',world.at,()=>.5);
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'empire-system-api-')),file=path.join(directory,'universe.json');
  fs.writeFileSync(file,JSON.stringify(world));
  const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));assert.notEqual(port,8289);
  const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:file},windowsHide:true,stdio:['ignore','pipe','pipe']});
  const base=`http://127.0.0.1:${port}`,headers={Cookie:`empire=${player.id}`,Origin:base,'Content-Type':'application/json'};
  let errors='';child.stderr.on('data',chunk=>{errors+=chunk;});
  try{
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>{throw new Error(errors);}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('server startup timeout')),10000);timer.unref();})]);
    const npcIds=(state,g,s)=>state.map.filter(p=>p.npc&&!p.moon&&p.position[0]===g&&p.position[1]===s).map(p=>p.id);
    const diskBefore=fs.readFileSync(file,'utf8');
    const directoryResponse=await fetch(base+'/api/star-map');assert.equal(directoryResponse.headers.get('set-cookie'),null);
    const directoryMap=await directoryResponse.json();assert.equal(directoryMap.systems.length,499);
    assert.equal(directoryMap.planets.filter(p=>!p.moon&&p.kind!=='belt').length,7485);
    assert.equal(fs.readFileSync(file,'utf8'),diskBefore,'read-only directory does not initialize or save NPC systems');
    assert.equal((await fetch(base+'/api/state?galaxy=2&system=20',{headers})).status,400);
    const first=await (await fetch(base+'/api/state?galaxy=1&system=420',{headers})).json();
    const firstIds=npcIds(first,1,420);assert.equal(firstIds.length,5);assert.equal(npcIds(first,1,421).length,0);
    const npcSkins=state=>Object.fromEntries(state.map.filter(p=>firstIds.includes(p.id)).map(p=>[p.id,p.npcSkin]));
    assert.equal(new Set(Object.values(npcSkins(first))).size,5);assert.ok(Object.values(npcSkins(first)).every(n=>Number.isInteger(n)&&[18,19,20,28,34].includes(n)));
    const natural=state=>state.map.filter(p=>p.unoccupied&&p.position[0]===1&&p.position[1]===420);
    assert.equal(natural(first).length,10);assert.ok(natural(first).every(p=>p.id===null&&p.owner===null&&p.biome));
    const forbidden=await fetch(base+'/api/action',{method:'POST',headers,body:JSON.stringify({type:'planetType',planet:player.home,biome:'gas'})});
    assert.equal(forbidden.status,400);assert.match((await forbidden.json()).error,/操作不存在/);
    const second=await (await fetch(base+'/api/state?galaxy=1&system=421',{headers})).json();
    const secondIds=npcIds(second,1,421);assert.equal(secondIds.length,5);assert.equal(new Set([...firstIds,...secondIds]).size,10);
    assert.deepEqual(npcIds(second,1,420),firstIds);
    for(const query of ['galaxy=0&system=1','galaxy=1&system=500','galaxy=1.5&system=1','galaxy=1','system=1'])assert.equal((await fetch(base+'/api/state?'+query,{headers})).status,400);
    const third=await (await fetch(base+'/api/state?galaxy=1&system=420',{headers})).json();
    assert.deepEqual(npcIds(third,1,420),firstIds);assert.equal(third.map.length,second.map.length);
    assert.deepEqual(npcSkins(third),npcSkins(first));
    assert.deepEqual(natural(third),natural(first));
    assert.ok(third.map.every(p=>!('ships' in p)&&!('resources' in p)));
    assert.equal((await fetch(base+'/api/action',{method:'POST',headers,body:JSON.stringify({type:'readAll'})})).status,200);
    const saved=JSON.parse(fs.readFileSync(file,'utf8'));
    assert.ok(saved.npcSystems['1:420']&&saved.npcSystems['1:421']);
    assert.equal(saved.biomeSeed,world.biomeSeed);
    assert.deepEqual(natural(snapshot(migrateWorld(saved),saved.players[player.id],[1,420])),natural(first));
    for(const id of [...firstIds,...secondIds]){assert.ok(saved.planets[id]?.npc);assert.equal(saved.planets[id].npcSkin,third.map.find(p=>p.id===id).npcSkin);}
  }finally{
    child.kill();await once(child,'exit');
    assert.ok(path.resolve(directory).startsWith(path.resolve(os.tmpdir())+path.sep));fs.rmSync(directory,{recursive:true,force:true});
  }
});


