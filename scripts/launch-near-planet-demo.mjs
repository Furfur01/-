import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawn} from 'node:child_process';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {freePort} from '../tests/three-battle-harness.mjs';

const root=process.cwd(),base=path.join(root,'output/near-planet-demo'),out=path.join(base,'run-'+Date.now());fs.mkdirSync(out,{recursive:true});
const now=Date.now(),world=createWorld(now),player=createPlayer(world,'近地战斗演示',now),enemy=createPlayer(world,'演示防守方',now);
const home=world.planets[player.home],target=world.planets[enemy.home];
target.name='近地堡垒演示星';target.biome='terrestrial';target.ships={Cruiser:2};target.defense={Rocket_Launcher:24,Light_Laser:7,Heavy_Laser:7,Ion_Cannon:7,MK2_Cannon:8,Plasma_Cannon:4};
home.ships={Battleship:4,Cruiser:4,Bomber:2};home.resources=[1e9,1e9,1e9];
for(const p of [player,enemy])p.tech={Strength_Tech:20,Shielding_Tech:10,Weapons_Tech:0,Computer_Tech:4};
fs.writeFileSync(path.join(out,'universe.json'),JSON.stringify(world));fs.writeFileSync(path.join(out,'session.json'),JSON.stringify({cookie:`empire=${player.id}`}));
let source=fs.readFileSync(path.join(root,'server.mjs'),'utf8').replaceAll("'./game/",`'${pathToFileURL(path.join(root,'game')).href}/`);
source=source.replace('const root=path.dirname(fileURLToPath(import.meta.url)),saveFile=',`const root=${JSON.stringify(root)},saveFile=`);
source=source.replace('let dirty=true;',`const demoTemplate=structuredClone(world);let dirty=true;`);
source=source.replace("if(url.pathname==='/api/health'){",`
    if(url.pathname==='/demo'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(${JSON.stringify(path.join(base,'index.html'))}));return;}
    if(url.pathname==='/api/demo/start'||url.pathname==='/api/demo/finish'){
      if(req.method!=='POST'||!trustedLocalClient(req)){json(res,{error:'来源无效'},403);return;}
      const pId=${JSON.stringify(player.id)},targetId=${JSON.stringify(target.id)};
      if(url.pathname.endsWith('/start')){
        world=structuredClone(demoTemplate);const at=Date.now();world.at=at;const p=world.players[pId],h=world.planets[p.home],t=world.planets[targetId];
        act(world,p,{type:'dispatch',planet:h.id,target:t.id,position:t.position,task:'attack',ships:{...h.ships}},at);
        const m=world.missions.at(-1);m.start=at-5000;m.end=at+16000;m.travel=21000;dirty=true;save();json(res,{mission:m,target:t});return;
      }
      for(let i=0;i<20&&Object.values(world.battles).some(b=>b.status==='active');i++)advance(world,world.at+60000);
      dirty=true;save();json(res,{report:world.players[pId].reports.find(r=>r.type==='battle')});return;
    }
    if(url.pathname==='/api/health'){
`);
fs.writeFileSync(path.join(out,'server.mjs'),source);
const port=await freePort();const child=spawn(process.execPath,[path.join(out,'server.mjs')],{cwd:root,windowsHide:true,stdio:'inherit',env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:path.join(out,'universe.json'),EMPIRE_SESSION_FILE:path.join(out,'session.json')}});
console.log('演示地址 http://127.0.0.1:'+port+'/demo');child.on('exit',code=>process.exit(code||0));
