// Explicit offline maintenance; ordinary tests must never invoke --apply.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {migrateWorld} from '../game/engine.mjs';
import {colonyLimit,polity,systemKey} from '../game/sovereignty.mjs';
const root=path.resolve(import.meta.dirname,'..'),file=path.join(root,'data/universe.json'),sessionFile=path.join(root,'data/session.json');
const apply=process.argv.includes('--apply');
if(apply){let running=false;try{running=(await fetch('http://127.0.0.1:8289/api/health',{signal:AbortSignal.timeout(2000)})).ok;}catch{}assert(!running,'先通过启动器正常关闭正式后台，再进行离线迁移');}
const original=fs.readFileSync(file),session=fs.readFileSync(sessionFile),before=JSON.parse(original),world=structuredClone(before),id=JSON.parse(session).cookie?.match(/^empire=(.+)$/)?.[1];
assert(before.players[id]&&!before.players[id].bot,'个人会话未对应到原正式账号，停止迁移');
if(before.sovereignty?.version>=1){console.log('正式存档已经完成星系归属迁移，无需再次执行。');process.exit(0);}
let backup;
if(apply){
  backup=path.join(root,'data/backups','sovereignty-'+new Date().toISOString().replace(/[:.]/g,'-'));
  fs.mkdirSync(backup,{recursive:true});fs.writeFileSync(path.join(backup,'universe.json'),original);fs.writeFileSync(path.join(backup,'session.json'),session);
  function backupDirectory(source,target){fs.mkdirSync(target,{recursive:true});for(const entry of fs.readdirSync(source,{withFileTypes:true})){const from=path.join(source,entry.name),to=path.join(target,entry.name);if(entry.isDirectory())backupDirectory(from,to);else {assert(entry.isFile(),'战斗目录包含非普通文件，停止备份');fs.copyFileSync(from,to);}}}
  if(fs.existsSync(file+'.battles'))backupDirectory(file+'.battles',path.join(backup,'universe.json.battles'));
}
migrateWorld(world);
const humans=Object.values(before.players).filter(p=>!p.bot),humanIds=new Set(humans.map(p=>p.id));
for(const player of humans)assert.deepEqual(world.players[player.id],player,'正式账号或进度发生意外变化');
for(const p of Object.values(before.planets)){
  const migrated=world.planets[p.id];assert(migrated,'原星球丢失');
  if(humanIds.has(p.owner))assert.deepEqual(migrated,p,'用户星球发生意外变化');
  for(const field of ['resources','ships','defense','buildings','buildQueue','shipQueue','debris'])assert.deepEqual(migrated[field],p[field],`原星球的${field}被改写`);
}
assert.deepEqual(world.missions,before.missions,'存在受迁移影响的在途任务，请先另行核实');
assert.deepEqual(world.battles,before.battles);assert.deepEqual(world.alliances,before.alliances);assert.deepEqual(world.chat,before.chat);
const occupied=new Set();for(const p of Object.values(world.planets).filter(p=>!p.moon)){
  assert(!occupied.has(p.position.join(':')),'迁移导致轨道重叠');occupied.add(p.position.join(':'));
  if(p.owner)assert.equal(world.sovereignty.claims[systemKey(p.position)].owner,polity(world,p.owner).id);
  if(p.position[0]===1&&world.sovereignty.safeSystems.includes(p.position[1]))assert(!world.players[p.owner]?.bot,'扩张区仍存在电脑势力');
}
const safe=world.sovereignty.safeSystems,home=world.planets[world.players[id].home];
const report={applied:apply,backup,account:world.players[id].name,home:{name:home.name,position:home.position},preserved:{accounts:humans.length,planets:Object.values(before.planets).filter(p=>humanIds.has(p.owner)).length,progress:'exact match',sessionSHA256:createHash('sha256').update(session).digest('hex')},colonization:{level:world.players[id].tech.Astrophysics_Tech||0,limit:colonyLimit(world.players[id])},neighborhood:{systems:safe.length,unclaimed:safe.filter(s=>!world.sovereignty.claims[`1:${s}`]).length,emptyOrbits:safe.reduce((n,s)=>n+15-Object.values(world.planets).filter(p=>!p.moon&&p.position[0]===1&&p.position[1]===s).length,0)},realms:Object.entries(world.sovereignty.claims).reduce((r,[key,c])=>{const name=polity(world,c.founder).name;(r[name]??=[]).push(key);return r;},{}),relocated:Object.values(before.planets).filter(p=>world.planets[p.id].position.join(':')!==p.position.join(':')).length};
if(apply){
  assert(fs.readFileSync(file).equals(original),'存档在核对期间被其他进程写入');assert(fs.readFileSync(sessionFile).equals(session),'会话在核对期间发生变化');
  fs.writeFileSync(file+'.sovereignty.tmp',JSON.stringify(world));fs.renameSync(file+'.sovereignty.tmp',file);
  assert(fs.readFileSync(sessionFile).equals(session));fs.writeFileSync(path.join(backup,'migration-report.json'),JSON.stringify(report,null,2));
}
fs.mkdirSync(path.join(root,'output/sovereignty'),{recursive:true});fs.writeFileSync(path.join(root,'output/sovereignty',apply?'migration-report.json':'migration-preview.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
