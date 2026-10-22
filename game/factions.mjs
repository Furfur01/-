import {units} from './catalog.mjs';

export const factions=[
  {id:'frontier',name:'边境联邦',region:'外缘星区',galaxies:[1,3],color:'#6faeb8'},
  {id:'iron',name:'赤铁联邦',region:'赤铁星区',galaxies:[4,6],color:'#cb926a'},
  {id:'dawn',name:'曙光联邦',region:'曙光星区',galaxies:[7,9],color:'#ad91d4'},
  {id:'zenith',name:'天穹合众国',region:'天穹星区',galaxies:[1],color:'#689dce'},
  {id:'obsidian',name:'玄冕帝国',region:'玄冕星区',galaxies:[1],color:'#cc6f88'},
];

// ponytail: authored garrisons stay defeated; add replenishment only with a later NPC economy.
export const commanders=[
  ['frontier','grey-harbor','洛恩','灰港骑士','灰港',24,3,1,{Light_Fighter:24,Heavy_Fighter:8},'以重装战机守卫矿港，谨慎而固执。'],
  ['frontier','watchtower','伊芙','守望骑士','守望堡',32,5,2,{Light_Fighter:40,Heavy_Fighter:12,Cruiser:4},'巡视边境航道，不允许陌生舰队靠近哨塔。'],
  ['frontier','longwind','雷恩','长风骑士','长风锚地',44,7,3,{Light_Fighter:60,Heavy_Fighter:16,Cruiser:10,Battleship:2},'偏爱快速巡洋舰，驻守通向联邦首府的航道。'],
  ['frontier','red-crown','阿德里安','大将军','赤冠首府',60,8,4,{Light_Fighter:100,Heavy_Fighter:30,Cruiser:18,Battleship:8},'边境联邦的统帅，以赤冠舰队守护首府。'],
  ['frontier','freeport','米拉','中立领主','白帆自由港',20,10,1,{Light_Fighter:12,Cargo_Ship:6},'经营自由贸易港，希望为自己的居民寻找庇护。'],
  ['frontier','outpost','索林','中立领主','远望殖民站',38,11,2,{Light_Fighter:20,Heavy_Fighter:4,Cruiser:2},'独立殖民站的守护者，长期受到海盗侵扰。'],
  ['iron','anvil','赫克','铁砧骑士','铁砧要塞',24,3,4,{Heavy_Fighter:40,Cruiser:12,Battleship:6},'依靠重甲舰队守住赤铁矿区。'],
  ['iron','ember','薇拉','余烬骑士','余烬船坞',32,5,5,{Light_Fighter:100,Cruiser:20,Battleship:10,Bomber:3},'从船坞废墟中崛起，舰队擅长攻坚。'],
  ['iron','black-rock','奥托','黑岩骑士','黑岩壁垒',44,7,6,{Heavy_Fighter:60,Cruiser:30,Battleship:16,Destroyer:4},'沉默的守将，重型战舰是他的城墙。'],
  ['iron','iron-marshal','瓦伦','大将军','赤铁王座',60,8,7,{Light_Fighter:180,Heavy_Fighter:80,Cruiser:45,Battleship:30,Destroyer:8},'统领赤铁工业舰队，以压倒性的火力维系联邦。'],
  ['iron','furnace','诺娅','中立领主','熔炉矿港',20,10,3,{Heavy_Fighter:18,Cruiser:6,Large_Cargo_Ship:8},'矿业聚落的领主，重视承诺与稳定的航路。'],
  ['iron','drifter','盖尔','中立领主','流浪者港',38,11,4,{Light_Fighter:50,Cruiser:10,Battleship:3},'收留失去故乡的船员，拒绝为联邦服役。'],
  ['dawn','silver-wing','赛琳','银翼骑士','银翼哨站',24,3,7,{Light_Fighter:220,Cruiser:40,Battleship:20,Dreadnought:6},'以精锐护航舰队守卫曙光边界。'],
  ['dawn','starfall','凯恩','星陨骑士','星陨堡',32,5,8,{Heavy_Fighter:100,Cruiser:55,Battleship:35,Bomber:12,Destroyer:10},'坚信胜利来自集中火力和一击突破。'],
  ['dawn','night-watch','露西亚','长夜骑士','长夜关',44,7,9,{Light_Fighter:300,Cruiser:70,Battleship:45,Dreadnought:18,Destroyer:15},'驻守首府门户的老将，从不轻视挑战者。'],
  ['dawn','dawn-marshal','奥瑞利安','大将军','曙光王庭',60,8,10,{Light_Fighter:500,Heavy_Fighter:160,Cruiser:100,Battleship:70,Dreadnought:30,Destroyer:25},'曙光联邦的最高统帅，拥有三个星区中最强的主力舰队。'],
  ['dawn','stargazer','艾琳','中立领主','观星庭',20,10,5,{Light_Fighter:60,Cruiser:18,Battleship:8,Probe:12},'守护观测站与科研居民，不愿卷入联邦纷争。'],
  ['dawn','haven','达里安','中立领主','静海避风港',38,11,6,{Heavy_Fighter:50,Cruiser:25,Battleship:15,Large_Cargo_Ship:10},'率领远航移民定居于此，珍视来之不易的和平。'],
].map(([region,id,name,title,home,system,slot,level,ships,bio])=>({
  id,name,title,home,region,factionId:title==='中立领主'?null:region,
  superior:title.includes('骑士')?`${region}:${region==='frontier'?'red-crown':region==='iron'?'iron-marshal':'dawn-marshal'}`:null,
  position:[factions.find(f=>f.id===region).galaxies[0],system,slot],level,ships,bio,
}));

export function commanderInfo(world,planet){
  const owner=world.players[planet.owner],npc=owner?.commander;
  if(!npc)return null;
  const faction=factions.find(f=>f.id===npc.factionId);
  const power=Object.entries({...planet.ships,...planet.defense}).reduce((sum,[id,count])=>{
    const unit=units[id];
    if(!unit||unit.missile)return sum;
    return sum+count*(unit.attack*(1+(owner.tech.Weapons_Tech||0)*.1)+unit.shield*(1+(owner.tech.Shielding_Tech||0)*.1)+unit.strength*(1+(owner.tech.Strength_Tech||0)*.1));
  },0);
  return {...npc,name:owner.name,factionName:faction?.name||'中立势力',color:faction?.color||'#b6bea1',power:Math.round(power),superiorName:world.players[`commander:${npc.superior}`]?.name||null};
}
