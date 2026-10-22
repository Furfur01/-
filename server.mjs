import {EQUITY_VERSION} from './game/exchange-equity.mjs';
import {FACTION_WARS_VERSION} from './game/faction-wars.mjs';
import {factionWarReplay} from './game/faction-war-replay.mjs';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {format} from 'node:util';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createWorld,createPlayer,advance,act,snapshot,migrateWorld,templatePreview} from './game/engine.mjs';
import {publicCatalog} from './game/catalog.mjs';
import {escortAssessment} from './game/expedition.mjs';
import {buildReplay} from './game/replay.mjs';
import {battleViewEnvironment} from './game/battle-terrain.mjs';
import {starMap} from './game/star-map.mjs';
import {battleVisible,controlBattle,spatialSnapshot,spatialMetadata} from './game/spatial-battle.mjs';
import {battleStorage} from './game/battle-storage.mjs';
import {createSaveWriter} from './game/save-writer.mjs';
import {MARKET_VERSION} from './game/market.mjs';
import {GRAND_POWERS_VERSION} from './game/grand-powers.mjs';
import {MINOR_NATIONS_VERSION} from './game/minor-nations.mjs';
import {DIPLOMACY_VERSION} from './game/diplomacy.mjs';
import {MEGASTRUCTURES_VERSION} from './game/megastructure-rules.mjs';
import {GRAND_POWER_MEGASTRUCTURES_VERSION} from './game/grand-power-megastructures.mjs';

const root=path.dirname(fileURLToPath(import.meta.url)),saveFile=process.env.EMPIRE_SAVE_FILE||path.join(root,'data','universe.json');
const isolated=path.resolve(saveFile).toLowerCase()!==path.join(root,'data','universe.json').toLowerCase();
const personalSessionFile=path.join(root,'data','session.json');
const localSessionFile=process.env.EMPIRE_SESSION_FILE||(isolated?saveFile+'.session':personalSessionFile);
if(isolated&&path.resolve(localSessionFile).toLowerCase()===personalSessionFile.toLowerCase())throw new Error('测试存档不能共用个人账号会话');
const managed=process.env.EMPIRE_MANAGED_STDIN==='1';
const logFile=process.env.EMPIRE_SERVER_LOG||(process.env.EMPIRE_SAVE_FILE?saveFile+'.log':path.join(root,'output','galactic-command','server.log'));
fs.mkdirSync(path.dirname(logFile),{recursive:true});
for(const method of ['log','warn','error']){
  const original=console[method].bind(console);
  console[method]=(...args)=>{fs.appendFileSync(logFile,`${new Date().toISOString()} ${format(...args)}\n`);if(!managed)original(...args);};
}
fs.mkdirSync(path.dirname(saveFile),{recursive:true});
let world=fs.existsSync(saveFile)?JSON.parse(fs.readFileSync(saveFile,'utf8')):createWorld();
if(fs.existsSync(saveFile)&&(!(world.strategic?.version>=DIPLOMACY_VERSION)||!(world.market?.version>=MARKET_VERSION)||!(world.grandPowers?.version>=GRAND_POWERS_VERSION)||!(world.galacticEconomy?.version>=EQUITY_VERSION)||!(world.factionWars?.version>=FACTION_WARS_VERSION)||!(world.minorNations?.version>=MINOR_NATIONS_VERSION)||!(world.megastructures?.version>=MEGASTRUCTURES_VERSION)||!(world.grandPowerMegastructures?.version>=GRAND_POWER_MEGASTRUCTURES_VERSION))){
  const humans=Object.values(world.players).filter(p=>!p.bot);
  for(const p of humans)if(world.planets[p.home]?.owner!==p.id)throw Error('账号母星归属异常，已停止更新，请检查原存档');
  const update=!(world.strategic?.version>=DIPLOMACY_VERSION)?'strategic-trade':!(world.market?.version>=MARKET_VERSION)?'galactic-market':!(world.grandPowers?.version>=GRAND_POWERS_VERSION)?'grand-powers':!(world.galacticEconomy?.version>=EQUITY_VERSION)||!(world.factionWars?.version>=FACTION_WARS_VERSION)?'exchange-and-wars':!(world.minorNations?.version>=MINOR_NATIONS_VERSION)?'starbay-republic':!(world.megastructures?.version>=MEGASTRUCTURES_VERSION)?'megastructures':'grand-power-megastructures';
  const backup=saveFile+'.before-'+update+'-'+Date.now()+'.bak';
  fs.copyFileSync(saveFile,backup,fs.constants.COPYFILE_EXCL);
  if(fs.existsSync(localSessionFile))fs.copyFileSync(localSessionFile,backup+'.session',fs.constants.COPYFILE_EXCL);
  if(fs.existsSync(saveFile+'.battles')){fs.mkdirSync(backup+'.battles');for(const name of fs.readdirSync(saveFile+'.battles'))fs.copyFileSync(path.join(saveFile+'.battles',name),path.join(backup+'.battles',name),fs.constants.COPYFILE_EXCL);}
  console.log('经济系统更新前已核实 %d 个原账号并备份：%s',humans.length,backup);
}
if(fs.existsSync(saveFile)&&!(world.npcDefenseRepairVersion>=1)){
  const backup=saveFile+'.before-npc-defense-repair-'+Date.now()+'.bak';
  fs.copyFileSync(saveFile,backup,fs.constants.COPYFILE_EXCL);
  if(fs.existsSync(saveFile+'.battles')){
    // Battle storage is flat. Node 24 on Windows can crash in cpSync on Chinese
    // directory paths; copy each checkpoint before allowing migration to run.
    fs.mkdirSync(backup+'.battles');
    for(const name of fs.readdirSync(saveFile+'.battles'))fs.copyFileSync(path.join(saveFile+'.battles',name),path.join(backup+'.battles',name),fs.constants.COPYFILE_EXCL);
  }
  console.log('野怪防御规则更新前的存档备份：%s',backup);
}
const battleStore=battleStorage(saveFile);
world=migrateWorld(battleStore.restore(world));
const saveWriter=createSaveWriter(saveFile);
let revision=1,savedRevision=0,saving=null,transaction=null,shuttingDown=false;
let lastSavedAt=fs.existsSync(saveFile)?fs.statSync(saveFile).mtime.toISOString():null;
async function save(){
  const target=revision;
  while(savedRevision<target){
    if(!saving){
      const version=revision;
      saving=saveWriter.write(world).then(result=>{battleStore.compact(world,result);savedRevision=version;lastSavedAt=result.savedAt;if(result.warning)console.error('存档已保存，旧检查点清理失败：',result.warning);}).finally(()=>{saving=null;});
    }
    await saving;
  }
}
function json(res,value,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
const playerCookie=player=>`empire=${player.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000`;
function cookiePlayer(cookie){const token=cookie?.match(/(?:^|;\s*)empire=([a-f0-9-]+)(?:;|$)/)?.[1];const player=world.players[token];return player&&!player.bot?player:null;}
function localSessionPlayer(){try{return cookiePlayer(JSON.parse(fs.readFileSync(localSessionFile,'utf8')).cookie);}catch{return null;}}
function persistSession(player){fs.mkdirSync(path.dirname(localSessionFile),{recursive:true});fs.writeFileSync(localSessionFile+'.tmp',JSON.stringify({cookie:`empire=${player.id}`}));fs.renameSync(localSessionFile+'.tmp',localSessionFile);}
// Account selectors are not the bearer credentials used by legacy game cookies.
const accountKey=player=>createHash('sha256').update('launcher:'+player.id).digest('hex');
function logTail(){
  const fd=fs.openSync(logFile,'r');
  try{const size=fs.fstatSync(fd).size,start=Math.max(0,size-32768),buffer=Buffer.alloc(size-start);fs.readSync(fd,buffer,0,buffer.length,start);const lines=buffer.toString('utf8').split('\n');if(start)lines.shift();return lines.slice(-100).join('\n');}
  finally{fs.closeSync(fd);}
}
function trustedLocalClient(req){
  const host=new URL('http://'+req.headers.host),origin=req.headers.origin;
  return ['127.0.0.1','localhost','[::1]'].includes(host.hostname)&&Number(host.port||80)===server.address().port&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)&&req.headers['x-empire-client']==='galactic-command'&&(!origin||origin===host.origin)&&(!req.headers['sec-fetch-site']||req.headers['sec-fetch-site']==='same-origin');
}
function getPlayer(req){
  // The desktop browser may drop cookies. Tagged same-origin loopback requests
  // resume the same disk session used by bootstrap, never allocate each poll.
  return (trustedLocalClient(req)&&localSessionPlayer())||cookiePlayer(req.headers.cookie);
}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    // Launcher probes never create a player or advance the universe.
    if(url.pathname==='/api/health'){
      if(req.method!=='GET'){json(res,{error:'不支持的操作'},405);return;}
      json(res,{service:'galaxy-empire',status:'running',monitorVersion:1,managed,isolated,pid:process.pid,uptime:Math.floor(process.uptime()),port:server.address().port});return;
    }
    if(url.pathname.startsWith('/api/launcher/')){
      if(!trustedLocalClient(req)||req.headers.origin!==new URL('http://'+req.headers.host).origin){json(res,{error:'来源无效'},403);return;}
      while(transaction)await transaction;
      const players=Object.values(world.players).filter(player=>!player.bot);
      if(url.pathname==='/api/launcher/status'&&req.method==='GET'){
        const current=localSessionPlayer();
        json(res,{service:'galaxy-empire',status:shuttingDown?'stopping':'running',pid:process.pid,uptime:Math.floor(process.uptime()),managed,saveFile:path.resolve(saveFile),logFile:path.resolve(logFile),lastSavedAt,currentAccount:current?accountKey(current):null,accounts:players.map(player=>({key:accountKey(player),name:player.name})),log:logTail()});return;
      }
      if(url.pathname==='/api/launcher/account'&&req.method==='POST'){
        let body='';for await(const chunk of req){body+=chunk;if(body.length>4096){json(res,{error:'请求过大'},413);return;}}
        let key;try{key=JSON.parse(body).key;}catch{json(res,{error:'账号参数无效'},400);return;}
        const player=players.find(player=>accountKey(player)===key);
        if(!player){json(res,{error:'账号不存在'},404);return;}
        await save();persistSession(player);
        console.log('启动器切换账号：%s',player.name);json(res,{ok:true,name:player.name});return;
      }
      if(url.pathname==='/api/launcher/stop'&&req.method==='POST'){
        revision++;await save();console.log('启动器请求关闭后台，进度已保存');
        res.once('finish',shutdown);json(res,{ok:true,savedAt:lastSavedAt});return;
      }
      json(res,{error:'不支持的操作'},405);return;
    }
    if(url.pathname==='/api/session/local'||url.pathname==='/api/session/godot'){
      const host=new URL('http://'+req.headers.host),origin=req.headers.origin;
      const local=['127.0.0.1','localhost','[::1]'].includes(host.hostname)&&Number(host.port||80)===server.address().port&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
      if(req.method!=='POST'||!local||origin!==host.origin||req.headers['x-empire-client']!=='galactic-command'||(req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin')){json(res,{error:'来源无效'},403);return;}
      while(transaction)await transaction;if(shuttingDown){json(res,{error:'后台正在保存并关闭'},503);return;}
      let player=localSessionPlayer(),source='local';
      if(!player){player=cookiePlayer(req.headers.cookie);source=player?'browser':'new';}
      if(!player){
        const players=Object.values(world.players).filter(p=>!p.bot);
        if(players.length>1){json(res,{error:'请在启动器选择已有账号'},409);return;}
        if(players.length===1){player=players[0];source='local';}
        else{player=createPlayer(world,isolated?'测试指挥官':'指挥官');revision++;await save();}
      }
      persistSession(player);
      res.setHeader('Set-Cookie',playerCookie(player));json(res,{source,name:player.name});return;
    }
    if(url.pathname==='/api/catalog'){json(res,publicCatalog);return;}
    // A read-only directory: never advance time, initialize NPCs or create an account.
    if(req.method==='GET'&&url.pathname==='/api/star-map'){json(res,starMap(world));return;}
    if(url.pathname.startsWith('/api/')){
      const origin=req.headers.origin;
      if(origin&&new URL(origin).host!==req.headers.host){json(res,{error:'来源无效'},403);return;}
      // Polling, probes and failed requests must never register accounts or advance the world.
      while(transaction)await transaction;if(shuttingDown){json(res,{error:'后台正在保存并关闭'},503);return;}
      const player=getPlayer(req);
      if(!player){json(res,{error:'请刷新游戏主页，重新连接账号'},401);return;}
      advance(world);revision++;
      const publicWar=/^\/api\/faction-wars\/([a-f0-9-]+)$/.exec(url.pathname);
      if(publicWar&&req.method==='GET'){const b=world.factionWars?.battles.find(b=>b.id===publicWar[1]);if(!b||b.status==='cancelled'){json(res,{error:'会战记录不存在或已撤军'},404);return;}json(res,factionWarReplay(world,b));return;}
      const combat=/^\/api\/battles\/([a-f0-9-]+)(?:\/(events|control))?$/.exec(url.pathname);
      if(combat){
        const current=()=>world.battles?.[combat[1]],b=current();
        if(!b||!battleVisible(b,player.id)){json(res,{error:'战斗不存在'},404);return;}
        if(req.method==='POST'&&combat[2]==='control'){
          if(!origin||new URL(origin).host!==req.headers.host){json(res,{error:'来源无效'},403);return;}
          let body='';for await(const chunk of req){body+=chunk;if(body.length>4096){json(res,{error:'请求过大'},413);return;}}
          while(transaction)await transaction;if(shuttingDown){json(res,{error:'后台正在保存并关闭'},503);return;}
          try{const action=JSON.parse(body),live=current();controlBattle(live,player.id,action);if(action.type==='claim')for(const other of Object.values(world.battles))if(other.id!==live.id&&other.status==='active'&&other.controls[player.id])controlBattle(other,player.id,{type:'release',clientId:other.controls[player.id].clientId});revision++;json(res,{ok:true,tick:live.tick,control:live.controls[player.id]||null});}catch(error){json(res,{error:error.message},400);}return;
        }
        if(req.method==='GET'&&combat[2]==='events'){
          res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive'});
          let seq=0,count=-1;
          const send=()=>{if(transaction||shuttingDown)return;const live=current();if(!live||live.status!=='active'){res.write('event: finished\ndata: '+JSON.stringify({id:combat[1]})+'\n\n');clearInterval(timer);res.end();return;}if(res.writableLength>1024*1024)return;const data=spatialSnapshot(live,{since:seq,metadata:count!==live.ships.length,planet:world.planets[live.target]||(live.trial?world.planets[player.home]:null)||{}});count=live.ships.length;seq=live.eventSeq;res.write('id: '+seq+'\ndata: '+JSON.stringify(data)+'\n\n');};
          const timer=setInterval(send,200);send();req.on('close',()=>clearInterval(timer));return;
        }
        if(req.method==='GET'&&!combat[2]){const data=b.storage?battleStore.read(b.storage):b;json(res,spatialSnapshot(data,{planet:world.planets[data.target]||(data.trial?world.planets[player.home]:null)||{}}));return;}
        json(res,{error:'不支持的操作'},405);return;
      }
      if(req.method==='GET'&&url.pathname==='/api/state'){
        const system=url.searchParams.has('galaxy')||url.searchParams.has('system')?[Number(url.searchParams.get('galaxy')),Number(url.searchParams.get('system'))]:null;
        try{if(system&&system[0]!==1)throw Error('仅开放第 1 银河');json(res,snapshot(world,player,system));}catch(error){json(res,{error:error.message},400);}return;
      }
      if(['GET','POST'].includes(req.method)&&url.pathname.startsWith('/api/replay/')){
        const report=player.reports.find(r=>r.id===url.pathname.slice('/api/replay/'.length)&&r.type==='battle');
        if(!report){json(res,{error:'战报不存在'},404);return;}
        if(req.method==='POST'){
          if(!origin||new URL(origin).host!==req.headers.host){json(res,{error:'来源无效'},403);return;}
        }
        const replay=buildReplay(report);
        if(/^spatial-v[1-5]$/.test(report.engine)){
          const stored=world.battles[report.battleId],b=stored?.storage?battleStore.read(stored.storage):stored;
          if(!b){json(res,{error:'战斗记录缺失'},404);return;}
          replay.version=4;replay.record={metadata:spatialMetadata(b),frames:b.frames,events:b.events.filter(e=>e.type!=='input'),boundary:b.boundary,environment:battleViewEnvironment(b.environment,world.planets[b.target]||world.planets[report.targetId]||(b.trial?world.planets[player.home]:null)||{})};
        }
        json(res,replay);return;
      }
      if(req.method==='POST'&&url.pathname==='/api/plan-preview'){
        let body='';for await(const chunk of req){body+=chunk;if(body.length>64000){json(res,{error:'请求过大'},413);return;}}
        try{json(res,{previews:templatePreview(world,player,JSON.parse(body))});}catch(error){json(res,{error:error.message},400);}return;
      }
      if(req.method==='POST'&&url.pathname==='/api/expedition-preview'){
        let body='';for await(const chunk of req){body+=chunk;if(body.length>64000){json(res,{error:'请求过大'},413);return;}}
        try{
          const {ships,zone}=JSON.parse(body),{combat,...assessment}=escortAssessment(ships,player.tech,zone);
          json(res,assessment);
        }catch(error){json(res,{error:error.message},400);}return;
      }
      if(req.method==='POST'&&url.pathname==='/api/action'){
        let body='';for await(const chunk of req){body+=chunk;if(body.length>64000){json(res,{error:'请求过大'},413);return;}}
        const action=JSON.parse(body);while(transaction)await transaction;if(shuttingDown){json(res,{error:'后台正在保存并关闭'},503);return;}
        // Resource-changing actions retain their all-or-nothing save contract.
        // Periodic checkpoints do not take this barrier: battle control and the
        // 20 Hz simulation keep running while those snapshots are compressed.
        let release;transaction=new Promise(resolve=>{release=resolve;});
        const checkpoint=structuredClone(world),currentPlayer=world.players[player.id];
        try{act(world,currentPlayer,action);revision++;await save();json(res,snapshot(world,currentPlayer));}
        catch(error){world=checkpoint;revision++;json(res,{error:error.message},400);}
        finally{transaction=null;release();}return;
      }
      json(res,{error:'不存在'},404);return;
    }
    let name=decodeURIComponent(url.pathname);if(name==='/')name='/opendesign/mockups/galactic-command/index.html';if(name.endsWith('/'))name+='index.html';
    if(!name.startsWith('/opendesign/')||name.includes('..')){res.writeHead(404);res.end();return;}
    const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':path.extname(file)==='.png'?'public, max-age=3600':'no-cache','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
  }catch(error){if(!res.headersSent)json(res,{error:'服务器暂时无法处理请求'},500);else res.end();console.error(error);}
});
setInterval(()=>{if(transaction||shuttingDown)return;try{advance(world);revision++;void save().catch(error=>console.error('定时保存失败：',error));}catch(error){console.error(error);}},5000).unref();
setInterval(()=>{if(!transaction&&!shuttingDown&&Object.values(world.battles||{}).some(b=>b.status==='active'))try{advance(world);revision++;}catch(error){console.error(error);}},50).unref();
function shutdown(){
  if(shuttingDown)return;shuttingDown=true;
  const finish=async()=>{
    try{while(transaction)await transaction;revision++;await save();await saveWriter.close();process.exit(0);}
    catch(error){console.error('退出前保存失败，将重试：',error);setTimeout(finish,1000);}
  };
  finish();
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,shutdown);
// A private inherited pipe binds this process to the launcher. Closing the
// window or losing the legacy launcher process closes the pipe. New monitors
// start an independent process and stop it explicitly through the local API.
if(managed){process.stdin.on('end',shutdown);process.stdin.on('error',shutdown);process.stdin.resume();}
server.listen(Number(process.env.PORT||8289),'127.0.0.1',()=>console.log(`银河帝国 http://localhost:${process.env.PORT||8289}/`));
