import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createWorld,createPlayer,act,advance} from '../game/engine.mjs';

// A separate playable universe: never change the player's normal save or session.
const root=path.resolve(import.meta.dirname,'..');
const directory=path.join(root,'output','planet-battle-trial',String(Date.now()));
fs.mkdirSync(directory,{recursive:true});
const now=Date.now(),start=now-8000,world=createWorld(start);
const player=createPlayer(world,'近地作战测试员',start,()=>.1),enemy=createPlayer(world,'地面防御测试基地',start,()=>.2);
const home=world.planets[player.home],target=world.planets[enemy.home];
target.name='模块化堡垒试验场';
player.tech={Strength_Tech:160,Shielding_Tech:40,Weapons_Tech:4,Computer_Tech:5};enemy.tech={Strength_Tech:120,Shielding_Tech:20,Computer_Tech:5};
home.resources=[1e8,1e8,1e8];home.ships={Bomber:12,Battleship:2,Cruiser:4,Light_Fighter:4};
target.ships={Light_Fighter:4};
target.defense={Rocket_Launcher:24,Light_Laser:18,Heavy_Laser:2,MK2_Cannon:3,Plasma_Cannon:2,Small_Shield_Dome:1,Large_Shield_Dome:1};
act(world,player,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:{...home.ships}},start);
const mission=world.missions[0];mission.end=start;mission.seed=42;advance(world,now);
const battle=world.battles[mission.battleId];
if(!battle?.environment||battle.status!=='active')throw Error('测试战斗未进入交战');
const saveFile=path.join(directory,'universe.json'),sessionFile=path.join(directory,'session.json');
fs.writeFileSync(saveFile,JSON.stringify(world));fs.writeFileSync(sessionFile,JSON.stringify({cookie:`empire=${player.id}`}));
const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const log=fs.openSync(path.join(directory,'server.log'),'a');
const child=spawn(process.execPath,[path.join(root,'server.mjs')],{cwd:root,env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:sessionFile,EMPIRE_BATTLE_TRIAL:'1',EMPIRE_MANAGED_STDIN:'0'},detached:true,windowsHide:true,stdio:['ignore',log,log]});
child.unref();fs.closeSync(log);
const base=`http://127.0.0.1:${port}`,url=`${base}/opendesign/mockups/galactic-command/battlefield-three.html?battle=${battle.id}&view=ground`;
for(let i=0;i<40;i++){
 try{if((await fetch(base+'/api/health')).ok){const info={url,base,pid:child.pid,battleId:battle.id,account:player.name,groundDefenses:battle.ships.filter(s=>s.profile.ground).length,fortressModules:battle.environment.fortress.modules.length,saveFile};fs.writeFileSync(path.join(directory,'launch.json'),JSON.stringify(info,null,2));console.log(JSON.stringify(info));process.exit(0);}}catch{}
 await new Promise(resolve=>setTimeout(resolve,200));
}
throw Error('测试后台启动失败：'+directory);
