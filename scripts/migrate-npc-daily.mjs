// Explicit offline maintenance. Default mode checks an in-memory copy only.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {migrateWorld} from '../game/engine.mjs';
import {npcType,npcTypes} from '../game/npc-types.mjs';
import {nextNpcRefresh} from '../game/npc-daily.mjs';

const root=path.resolve(import.meta.dirname,'..'),file=path.join(root,'data/universe.json'),sessionFile=path.join(root,'data/session.json'),apply=process.argv.includes('--apply');
if(apply){let running=false;try{running=(await fetch('http://127.0.0.1:8289/api/health',{signal:AbortSignal.timeout(2000)})).ok;}catch{}assert(!running,'请先通过启动器正常关闭正式后台');}
const original=fs.readFileSync(file),session=fs.readFileSync(sessionFile),before=JSON.parse(original),world=structuredClone(before),id=JSON.parse(session).cookie?.match(/^empire=(.+)$/)?.[1];
assert(before.players[id]&&!before.players[id].bot,'会话与原正式账号不匹配，停止维护');
migrateWorld(world);
const otherState=({planets,npcDailyDay,npcDailyVersion,...rest})=>rest;
assert.deepEqual(otherState(world),otherState(before),'账号、科技、任务、战报或其他世界数据发生意外变化');
assert.deepEqual(Object.keys(world.planets).sort(),Object.keys(before.planets).sort(),'不允许增删实体');
const keepCamp=({resources,ships,defense,npcDailyResources,npcRefreshDay,npcRefreshedAt,...rest})=>rest;
let refreshed=0;const deferred=[];
for(const old of Object.values(before.planets)){
  const p=world.planets[old.id],type=npcType(p);
  if(!type||p.owner){assert.deepEqual(p,old,'原有殖民地、月球或电脑势力发生意外变化');continue;}
  assert.deepEqual(keepCamp(p),keepCamp(old),'据点身份、位置、建筑或残骸发生意外变化');
  const active=Object.values(world.battles||{}).some(b=>b.target===p.id&&b.status==='active');
  if(active){for(const key of ['ships','defense','resources'])assert.deepEqual(p[key],old[key]);deferred.push(p.position);}
  else if(before.npcDailyVersion!==1){assert.deepEqual(p.resources,type.resources);assert.deepEqual(p.ships,type.ships);assert.deepEqual(p.defense,type.defense);refreshed++;}
}
const report={applied:apply,account:world.players[id].name,preserved:'all accounts, colonies, moons, technology, reports, missions, battles and sovereignty unchanged',refreshedCamps:refreshed,deferredBattles:deferred,refreshTime:'每天北京时间 00:00',nextRefresh:new Date(nextNpcRefresh(world.at)).toISOString(),dailyStocks:[...npcTypes].sort((a,b)=>a.level-b.level).map(t=>({level:t.level,name:t.name,resources:t.resources,total:t.resources.reduce((a,b)=>a+b,0)}))};
if(apply&&JSON.stringify(world)!==JSON.stringify(before)){
  assert(fs.readFileSync(file).equals(original),'核对期间存档被其他进程更新');assert(fs.readFileSync(sessionFile).equals(session),'核对期间会话变化');
  const backup=path.join(root,'data/backups','npc-daily-'+new Date().toISOString().replace(/[:.]/g,'-'));fs.mkdirSync(backup,{recursive:true});
  fs.writeFileSync(path.join(backup,'universe.json'),original);fs.writeFileSync(path.join(backup,'session.json'),session);
  function copyDirectory(source,target){fs.mkdirSync(target,{recursive:true});for(const entry of fs.readdirSync(source,{withFileTypes:true})){const from=path.join(source,entry.name),to=path.join(target,entry.name);if(entry.isDirectory())copyDirectory(from,to);else{assert(entry.isFile());fs.copyFileSync(from,to);}}}
  if(fs.existsSync(file+'.battles'))copyDirectory(file+'.battles',path.join(backup,'universe.json.battles'));
  assert(fs.readFileSync(path.join(backup,'universe.json')).equals(original));assert(fs.readFileSync(file).equals(original));assert(fs.readFileSync(sessionFile).equals(session));
  fs.writeFileSync(file+'.npc-daily.tmp',JSON.stringify(world));fs.renameSync(file+'.npc-daily.tmp',file);report.backup=backup;
  fs.writeFileSync(path.join(backup,'migration-report.json'),JSON.stringify(report,null,2));
}
const out=path.join(root,'output/npc-daily');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,apply?'migration-report.json':'migration-preview.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
