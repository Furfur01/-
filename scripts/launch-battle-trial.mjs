import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createWorld,createPlayer,act} from '../game/engine.mjs';
import {startTrial,trialPresets} from '../game/battle-trial.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const directory=path.join(root,'output','battle-trial',String(Date.now()));
fs.mkdirSync(directory,{recursive:true});
const now=Date.now(),world=createWorld(now);
const player=createPlayer(world,'战场试玩',now,()=>.1);
const opponent=createPlayer(world,'对阵舰队',now,()=>.2);
const home=world.planets[player.home],target=world.planets[opponent.home];
const fleet=process.argv.includes('--small')?{Dreadnought:20,Destroyer:12,Battleship:10,Cruiser:6,Bomber:2}:process.argv.includes('--capital')?{Dreadnought:200,Destroyer:120,Battleship:100,Cruiser:60,Bomber:20}:{Light_Fighter:200,Heavy_Fighter:70,Cruiser:70,Battleship:60,Dreadnought:60,Destroyer:30,Bomber:10};
home.ships={...fleet};home.resources=[1e9,1e9,1e9];
target.ships={...fleet};target.defense={};
player.tech.Computer_Tech=3;
for(const owner of [player,opponent]){owner.tech.Strength_Tech=50;owner.tech.Shielding_Tech=50;}
if(process.argv.includes('--small'))startTrial(world,player,{attacker:trialPresets[1].fleet,defender:trialPresets[1].fleet,seed:42},now);
else {act(world,player,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:fleet},now);world.missions[0].end=now+15000;}
const saveFile=path.join(directory,'universe.json'),sessionFile=path.join(directory,'session.json');
fs.writeFileSync(saveFile,JSON.stringify(world));
fs.writeFileSync(sessionFile,JSON.stringify({cookie:`empire=${player.id}`}));
const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');
const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const log=fs.openSync(path.join(directory,'server.log'),'a');
const child=spawn(process.execPath,[path.join(root,'server.mjs')],{
  cwd:root,env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:sessionFile,EMPIRE_BATTLE_TRIAL:'1'},
  detached:true,windowsHide:true,stdio:['ignore',log,log]
});
child.unref();fs.closeSync(log);
const url=`http://localhost:${port}/`;
for(let attempt=0;attempt<30;attempt++){
  try{if((await fetch(url+'api/catalog')).ok){console.log(JSON.stringify({url,pid:child.pid,saveFile}));process.exit(0);}}catch{}
  await new Promise(resolve=>setTimeout(resolve,200));
}
throw new Error('试玩服务未启动，请查看 '+path.join(directory,'server.log'));
