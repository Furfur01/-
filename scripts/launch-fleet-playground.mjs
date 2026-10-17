import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {createWorld,createPlayer,ensureSystemNpcs,act} from '../game/engine.mjs';
import {tech} from '../game/catalog.mjs';

// A separate universe and session: never edits the main commander's save.
const root=path.resolve(import.meta.dirname,'..'),directory=path.join(root,'output','fleet-playground',String(Date.now()));
fs.mkdirSync(directory,{recursive:true});
const now=Date.now(),world=createWorld(now),player=createPlayer(world,'星海试驾官',now,()=>135/(499*9)),home=world.planets[player.home];
home.name='无尽船坞';home.resources=[1e10,1e10,1e10];
home.ships={Light_Fighter:10000,Heavy_Fighter:6000,Cruiser:3000,Battleship:2000,Dreadnought:2000,Destroyer:1000,Bomber:800,Death_Star:200,Cargo_Ship:2000,Large_Cargo_Ship:2000,Probe:500,Recycler:1000,Colony_Ship:50};
player.tech=Object.fromEntries(Object.keys(tech).map(id=>[id,15]));
Object.assign(player.tech,{Computer_Tech:30,Weapons_Tech:0,Strength_Tech:50,Shielding_Tech:50});
Object.assign(home.buildings,{Command_Center:15,Shipyard:15,Research_Lab:15});
ensureSystemNpcs(world,...home.position.slice(0,2));
const targets=Object.values(world.planets).filter(p=>p.npc&&p.position[1]===home.position[1]);
const fleet={Light_Fighter:200,Heavy_Fighter:70,Cruiser:70,Battleship:60,Dreadnought:60,Destroyer:30,Bomber:10};
const target=targets.find(p=>p.npcType==='cargo'),defender='playground:defender';
world.players[defender]={id:defender,name:'演习守备军',bot:true,home:target.id,tech:{Weapons_Tech:0,Strength_Tech:50,Shielding_Tech:50},reports:[],researchQueue:null,alliance:null};
for(const p of targets){p.owner=defender;p.resources=[1e8,1e8,1e8];p.defense={};p.ships=Object.fromEntries(Object.entries(fleet).map(([id,n])=>[id,n*Math.max(1,p.npcLevel||1)]));}
target.ships={...fleet};
// A real attack at an actual planet, with a short lead-in for opening the UI.
act(world,player,{type:'dispatch',planet:home.id,target:target.id,position:target.position,task:'attack',ships:fleet},now);
const mission=world.missions.find(m=>m.owner===player.id);mission.end=now+90000;
const saveFile=path.join(directory,'universe.json'),sessionFile=path.join(directory,'session.json');
fs.writeFileSync(saveFile,JSON.stringify(world));fs.writeFileSync(sessionFile,JSON.stringify({cookie:`empire=${player.id}`}));
const listener=net.createServer();listener.listen(0,'127.0.0.1');await once(listener,'listening');const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
const log=fs.openSync(path.join(directory,'server.log'),'a');
const child=spawn(process.execPath,[path.join(root,'server.mjs')],{cwd:root,env:{...process.env,PORT:String(port),EMPIRE_SAVE_FILE:saveFile,EMPIRE_SESSION_FILE:sessionFile,EMPIRE_MANAGED_STDIN:'0',EMPIRE_BATTLE_TRIAL:'0'},detached:true,windowsHide:true,stdio:['ignore',log,log]});
child.unref();fs.closeSync(log);
const url=`http://127.0.0.1:${port}/`;
for(let i=0;i<50;i++){
 try{if((await fetch(url+'api/health')).ok){const result={url,pid:child.pid,account:player.name,home:home.position,ships:30650,resources:home.resources,openingBattle:'500 vs 500',target:target.position,battleStartsAt:mission.end,saveFile};result.ships=Object.values(home.ships).reduce((a,b)=>a+b,0)+500;fs.writeFileSync(path.join(directory,'launch.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));process.exit(0);}}catch{}
 await new Promise(resolve=>setTimeout(resolve,200));
}
throw Error('试玩启动失败，请查看 '+path.join(directory,'server.log'));
