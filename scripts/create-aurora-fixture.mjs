import fs from 'node:fs';
import path from 'node:path';
import {createWorld,createPlayer} from '../game/engine.mjs';
import {publicCatalog} from '../game/catalog.mjs';

// Explicit local verification universe, never derived from the user's save.
const out=path.resolve(process.env.EMPIRE_FIXTURE_DIR||'output/aurora-integration-fixture');fs.mkdirSync(out,{recursive:true});
const world=createWorld(),player=createPlayer(world,'星球接入验收',world.at,()=>.5),home=world.planets[player.home];
player.tech=Object.fromEntries(Object.keys(publicCatalog.tech).map(id=>[id,15]));
home.fields=9999;home.position=[1,16,7];home.name='类地星 · 验收';home.biome='terrestrial';
home.buildings=Object.fromEntries(Object.values(publicCatalog.buildings).filter(b=>!b.moon&&!b.mergedInto).map(b=>[b.id,b.id.endsWith('_Mine')?14:8]));
home.buildings.Solar_Plant=30;home.resources=[1e6,1e6,1e6];home.ships={Light_Fighter:10,Cargo_Ship:4};
home.buildQueue=null;home.shipQueue=[];
for(const [biome,name,slot] of [['mercury','熔岩金属星',6],['mars','裂谷火星',8],['gas','木星浮空殖民地',9]]){
 const p=structuredClone(home);Object.assign(p,{id:'aurora-'+biome,name,biome,position:[1,16,slot]});world.planets[p.id]=p;
}
const moon=structuredClone(home);Object.assign(moon,{id:'aurora-moon',name:'兼容月球',moon:true,parent:home.id,biome:null,buildings:{Moon_Base:8,Metal_Storage:5,Crystal_Storage:5,Gas_Storage:5,Robotics_Facility:5,Shipyard:5}});world.planets[moon.id]=moon;
fs.writeFileSync(path.join(out,'universe.json'),JSON.stringify(world));fs.writeFileSync(path.join(out,'session.json'),JSON.stringify({cookie:'empire='+player.id}));
console.log('Isolated Aurora verification fixture created: '+out);
