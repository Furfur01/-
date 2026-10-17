// Explicit offline maintenance. No gameplay requests or test accounts.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {migrateWorld} from '../game/engine.mjs';
import {starMap} from '../game/star-map.mjs';
import {colonyLimit} from '../game/sovereignty.mjs';
import {restoreSystemCamps} from '../game/npc-types.mjs';

const root=path.resolve(import.meta.dirname,'..'),file=path.join(root,'data/universe.json'),sessionFile=path.join(root,'data/session.json'),apply=process.argv.includes('--apply');
if(apply){let running=false;try{running=(await fetch('http://127.0.0.1:8289/api/health',{signal:AbortSignal.timeout(2000)})).ok;}catch{}assert(!running,'先通过启动器正常关闭正式后台，再进行离线维护');}
const original=fs.readFileSync(file),session=fs.readFileSync(sessionFile),before=JSON.parse(original),world=structuredClone(before),id=JSON.parse(session).cookie?.match(/^empire=(.+)$/)?.[1];
assert(before.players[id]&&!before.players[id].bot,'当前会话未对应原正式账号，停止维护');
assert(before.sovereignty?.version===1,'须先完成星系主权迁移');
const originArg=process.argv.indexOf('--origin-save');
if(originArg>=0){
  const source=JSON.parse(fs.readFileSync(path.resolve(process.argv[originArg+1])));
  assert(source.players[id]&&!source.players[id].bot,'原始备份与当前账号不匹配');
  const origins={};for(const p of Object.values(before.planets))if(p.npc&&!p.moon){const old=source.planets[p.id];assert(old?.npc&&!old.owner,'备份缺少原始野怪实体');origins[p.id]=old.position;}
  restoreSystemCamps(world,origins);
}
migrateWorld(world);
assert.deepEqual(world.players,before.players,'账号、科技或战报发生意外变化');
assert.deepEqual(Object.keys(world.planets).sort(),Object.keys(before.planets).sort(),'本次修正不应增删实体');
const moved=[];
for(const p of Object.values(before.planets)){
  const current=world.planets[p.id];
  const camp=p.npc||before.planets[p.parent]?.npc;
  if(camp){assert.deepEqual({...current,position:p.position},p,'据点战损或资源被改写');if(current.position.join(':')!==p.position.join(':'))moved.push(p.id);}
  else assert.deepEqual(current,p,'原有殖民地发生意外变化');
}
for(const key of ['sovereignty','missions','battles','alliances','chat','biomeSeed','at'])assert.deepEqual(world[key],before[key],`${key} 发生意外变化`);
const occupied=new Set();for(const p of Object.values(world.planets).filter(p=>!p.moon)){assert(!occupied.has(p.position.join(':')),'出现重叠轨道');occupied.add(p.position.join(':'));}
const map=starMap(world),systems=[];
for(const system of map.systems){
  const local=map.planets.filter(p=>p.position[1]===system.id&&!p.moon&&p.kind!=='belt');
  assert.deepEqual(local.filter(p=>p.npc).map(p=>p.npcLevel).sort(),[1,2,3,4,5],`星系 ${system.id} 的五级据点不齐全`);
  assert.equal(new Set(local.filter(p=>!p.npc).map(p=>p.biome)).size,4,`星系 ${system.id} 的四类普通行星不齐全`);
  systems.push(system.id);
}
const safe=world.sovereignty.safeSystems;
assert(!Object.values(world.planets).some(p=>p.position[0]===1&&safe.includes(p.position[1])&&world.players[p.owner]?.bot),'附近扩张区存在电脑势力');
const home=world.planets[world.players[id].home],homePlanets=map.planets.filter(p=>p.position[1]===home.position[1]&&!p.moon&&p.kind!=='belt');
const report={applied:apply,account:world.players[id].name,home:{name:home.name,position:home.position},preserved:{accounts:'exact match',colonies:'exact match',campLossesAndResources:'exact match',sessionSHA256:createHash('sha256').update(session).digest('hex')},systemsChecked:systems.length,campLevelsPerSystem:[1,2,3,4,5],ordinaryTypesPerSystem:4,relocatedCamps:moved.length,neighborhood:{systems:safe.length,unclaimed:safe.filter(s=>!world.sovereignty.claims['1:'+s]).length,emptyOrbits:map.planets.filter(p=>safe.includes(p.position[1])&&!p.owner&&!p.npc&&!p.moon&&p.kind!=='belt').length},colonization:{level:world.players[id].tech.Astrophysics_Tech||0,limit:colonyLimit(world.players[id])},homeOrdinaryPlanets:homePlanets.filter(p=>!p.npc).map(p=>({position:p.position,biome:p.biome,owned:!!p.owner}))};
if(apply&&JSON.stringify(world)!==JSON.stringify(before)){
  assert(fs.readFileSync(file).equals(original),'存档在核对期间被其他进程写入');assert(fs.readFileSync(sessionFile).equals(session),'会话在核对期间发生变化');
  const backup=path.join(root,'data/backups','system-distribution-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(backup,{recursive:true});
  fs.writeFileSync(path.join(backup,'universe.json'),original);fs.writeFileSync(path.join(backup,'session.json'),session);
  function copyDirectory(source,target){fs.mkdirSync(target,{recursive:true});for(const entry of fs.readdirSync(source,{withFileTypes:true})){const from=path.join(source,entry.name),to=path.join(target,entry.name);if(entry.isDirectory())copyDirectory(from,to);else{assert(entry.isFile());fs.copyFileSync(from,to);}}}
  if(fs.existsSync(file+'.battles'))copyDirectory(file+'.battles',path.join(backup,'universe.json.battles'));
  assert(fs.readFileSync(path.join(backup,'universe.json')).equals(original));assert(fs.readFileSync(file).equals(original));assert(fs.readFileSync(sessionFile).equals(session));
  fs.writeFileSync(file+'.distribution.tmp',JSON.stringify(world));fs.renameSync(file+'.distribution.tmp',file);report.backup=backup;
  fs.writeFileSync(path.join(backup,'restoration-report.json'),JSON.stringify(report,null,2));
}
fs.mkdirSync(path.join(root,'output/sovereignty'),{recursive:true});fs.writeFileSync(path.join(root,'output/sovereignty',apply?'distribution-report.json':'distribution-preview.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
