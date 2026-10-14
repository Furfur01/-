import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createWorld,createPlayer,advance,act,snapshot,migrateWorld} from './game/engine.mjs';
import {publicCatalog} from './game/catalog.mjs';
import {buildReplay} from './game/replay.mjs';
import {starMap} from './game/star-map.mjs';
import {battleVisible,controlBattle,spatialSnapshot,spatialMetadata} from './game/spatial-battle.mjs';
import {battleStorage} from './game/battle-storage.mjs';
import {trialCatalog,startTrial} from './game/battle-trial.mjs';

const root=path.dirname(fileURLToPath(import.meta.url)),saveFile=process.env.EMPIRE_SAVE_FILE||path.join(root,'data','universe.json');
// The test fleet editor can only run against an explicitly separate save.
const trialEnabled=process.env.EMPIRE_BATTLE_TRIAL==='1'&&!!process.env.EMPIRE_SAVE_FILE&&path.resolve(saveFile).toLowerCase()!==path.join(root,'data','universe.json').toLowerCase();
fs.mkdirSync(path.dirname(saveFile),{recursive:true});
let world=fs.existsSync(saveFile)?JSON.parse(fs.readFileSync(saveFile,'utf8')):createWorld();
const battleStore=battleStorage(saveFile);
world=migrateWorld(battleStore.restore(world));
let dirty=true;
function save(){if(!dirty)return;const manifest=battleStore.checkpoint(world);fs.writeFileSync(saveFile+'.tmp',JSON.stringify(manifest));fs.renameSync(saveFile+'.tmp',saveFile);battleStore.compact(world,manifest);battleStore.prune(manifest);dirty=false;}
function json(res,value,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
const playerCookie=player=>`empire=${player.id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000`;
function cookiePlayer(cookie){const token=cookie?.match(/(?:^|;\s*)empire=([a-f0-9-]+)(?:;|$)/)?.[1];const player=world.players[token];return player&&!player.bot?player:null;}
function getPlayer(req,res){let player=cookiePlayer(req.headers.cookie);if(!player){player=createPlayer(world);res.setHeader('Set-Cookie',playerCookie(player));dirty=true;}return player;}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon','.mp3':'audio/mpeg','.wav':'audio/wav'};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname==='/api/session/local'||url.pathname==='/api/session/godot'){
      const host=new URL('http://'+req.headers.host),origin=req.headers.origin;
      const local=['127.0.0.1','localhost','[::1]'].includes(host.hostname)&&Number(host.port||80)===server.address().port&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
      if(req.method!=='POST'||!local||origin!==host.origin||req.headers['x-empire-client']!=='galactic-command'||(req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin')){json(res,{error:'来源无效'},403);return;}
      let player=null,source='local';
      try{const session=JSON.parse(fs.readFileSync(process.env.EMPIRE_SESSION_FILE||path.join(root,'data','session.json'),'utf8'));player=cookiePlayer(session.cookie);}catch{}
      if(!player){player=cookiePlayer(req.headers.cookie);source=player?'browser':'new';}
      if(!player){player=createPlayer(world);dirty=true;save();}
      res.setHeader('Set-Cookie',playerCookie(player));json(res,{source,name:player.name});return;
    }
    if(url.pathname==='/api/catalog'){json(res,publicCatalog);return;}
    // A read-only directory: never advance time, initialize NPCs or create an account.
    if(req.method==='GET'&&url.pathname==='/api/star-map'){json(res,starMap(world));return;}
    if(url.pathname.startsWith('/api/')){
      const origin=req.headers.origin;
      if(origin&&new URL(origin).host!==req.headers.host){json(res,{error:'来源无效'},403);return;}
      advance(world);dirty=true;const player=getPlayer(req,res);
      if(url.pathname==='/api/battle-trial'){
        if(req.method==='GET'){json(res,trialEnabled?trialCatalog():{enabled:false});return;}
        if(!trialEnabled){json(res,{error:'编队测试仅在隔离试玩服务开放'},403);return;}
        if(req.method!=='POST'){json(res,{error:'不支持的操作'},405);return;}
        if(!origin||new URL(origin).host!==req.headers.host){json(res,{error:'来源无效'},403);return;}
        let body='';for await(const chunk of req){body+=chunk;if(body.length>8192){json(res,{error:'请求过大'},413);return;}}
        try{const b=startTrial(world,player,JSON.parse(body));save();json(res,{id:b.id});}catch(error){json(res,{error:error.message},400);}return;
      }
      const combat=/^\/api\/battles\/([a-f0-9-]+)(?:\/(events|control))?$/.exec(url.pathname);
      if(combat){
        const current=()=>world.battles?.[combat[1]],b=current();
        if(!b||!battleVisible(b,player.id)){json(res,{error:'战斗不存在'},404);return;}
        if(req.method==='POST'&&combat[2]==='control'){
          if(!origin||new URL(origin).host!==req.headers.host){json(res,{error:'来源无效'},403);return;}
          let body='';for await(const chunk of req){body+=chunk;if(body.length>4096){json(res,{error:'请求过大'},413);return;}}
          try{const action=JSON.parse(body),live=current();controlBattle(live,player.id,action);if(action.type==='claim')for(const other of Object.values(world.battles))if(other.id!==live.id&&other.status==='active'&&other.controls[player.id])controlBattle(other,player.id,{type:'release'});dirty=true;json(res,{ok:true,tick:live.tick,control:live.controls[player.id]||null});}catch(error){json(res,{error:error.message},400);}return;
        }
        if(req.method==='GET'&&combat[2]==='events'){
          res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive'});
          let seq=0,count=-1;
          const send=()=>{const live=current();if(!live||live.status!=='active'){res.write('event: finished\ndata: '+JSON.stringify({id:combat[1]})+'\n\n');clearInterval(timer);res.end();return;}if(res.writableLength>1024*1024)return;const data=spatialSnapshot(live,{since:seq,metadata:count!==live.ships.length});count=live.ships.length;seq=live.eventSeq;res.write('id: '+seq+'\ndata: '+JSON.stringify(data)+'\n\n');};
          const timer=setInterval(send,200);send();req.on('close',()=>clearInterval(timer));return;
        }
        if(req.method==='GET'&&!combat[2]){const data=b.storage?battleStore.read(b.storage):b;json(res,spatialSnapshot(data));return;}
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
        if(/^spatial-v[12]$/.test(report.engine)){
          const stored=world.battles[report.battleId],b=stored?.storage?battleStore.read(stored.storage):stored;
          if(!b){json(res,{error:'战斗记录缺失'},404);return;}
          replay.version=4;replay.record={metadata:spatialMetadata(b),frames:b.frames,events:b.events.filter(e=>e.type!=='input'),boundary:b.boundary};
        }
        json(res,replay);return;
      }
      if(req.method==='POST'&&url.pathname==='/api/action'){
        let body='';for await(const chunk of req){body+=chunk;if(body.length>64000){json(res,{error:'请求过大'},413);return;}}
        const action=JSON.parse(body);const checkpoint=structuredClone(world);
        try{act(world,player,action);save();json(res,snapshot(world,player));}catch(error){world=checkpoint;json(res,{error:error.message},400);}return;
      }
      json(res,{error:'不存在'},404);return;
    }
    let name=decodeURIComponent(url.pathname);if(name==='/')name='/opendesign/mockups/galactic-command/index.html';if(name.endsWith('/'))name+='index.html';
    if(!name.startsWith('/opendesign/')||name.includes('..')){res.writeHead(404);res.end();return;}
    const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':path.extname(file)==='.png'?'public, max-age=3600':'no-cache','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
  }catch(error){if(!res.headersSent)json(res,{error:'服务器暂时无法处理请求'},500);else res.end();console.error(error);}
});
setInterval(()=>{try{advance(world);dirty=true;save();}catch(error){console.error(error);}},5000).unref();
setInterval(()=>{if(Object.values(world.battles||{}).some(b=>b.status==='active'))try{advance(world);dirty=true;}catch(error){console.error(error);}},50).unref();
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{dirty=true;save();process.exit(0);});
server.listen(Number(process.env.PORT||8289),'127.0.0.1',()=>console.log(`银河帝国 http://localhost:${process.env.PORT||8289}/`));
