import {randomUUID} from 'node:crypto';
import {units} from './catalog.mjs';
import {battleStats} from './battle-stats.mjs';
import {planetBattleEnvironment} from './battle-terrain.mjs';
import {createSpatialBattle,addSpatialFleet,spatialSurvivors,recordFrame} from './spatial-battle.mjs';

// Model-only military hulls use explicit trial balance, never formal build definitions.
export const trialUnits={...units,
  Iron_Behemoth:{...units.Destroyer,id:'Iron_Behemoth',name:'深空吞噬者',strength:350000,shield:4000,attack:5500,rapid:{}},
  Interceptor:{...units.Destroyer,id:'Interceptor',name:'裂变者',strength:55000,shield:2250,attack:18000,rapid:{}},
  Devourer_Interceptor:{...units.Destroyer,id:'Devourer_Interceptor',name:'噬能截击者',strength:55000,shield:3000,attack:16000,rapid:{}},
  Titanenergetic_Frigate:{...units.Cruiser,id:'Titanenergetic_Frigate',name:'钛能守卫者',strength:13500,shield:600,attack:4800,rapid:{}},
  Reaper:{...units.Destroyer,id:'Reaper',name:'收割者',strength:165000,shield:6000,attack:48000,rapid:{}},
  Annihilator:{...units.Destroyer,id:'Annihilator',name:'湮灭之星',strength:2000,shield:0,attack:500000,rapid:{}}
};
const allowed=['Light_Fighter','Heavy_Fighter','Cruiser','Battleship','Dreadnought','Destroyer','Bomber','Interceptor','Devourer_Interceptor','Titanenergetic_Frigate','Reaper','Iron_Behemoth','Annihilator'];
export const trialPresets=[
  {name:'主力对轰',fleet:{Dreadnought:12,Destroyer:6,Battleship:6,Cruiser:4}},
  {name:'精英混编',fleet:{Interceptor:2,Devourer_Interceptor:2,Dreadnought:10,Destroyer:4,Battleship:4,Cruiser:4,Light_Fighter:8}},
  {name:'轻舰骚扰',fleet:{Interceptor:1,Dreadnought:8,Destroyer:4,Cruiser:6,Light_Fighter:16,Heavy_Fighter:8}},
  {name:'超级武器展示',fleet:{Annihilator:1,Reaper:1,Interceptor:2,Devourer_Interceptor:2,Dreadnought:10,Destroyer:4,Titanenergetic_Frigate:4}},
  {name:'重型舰队',fleet:{Iron_Behemoth:1,Reaper:2,Interceptor:3,Devourer_Interceptor:3,Dreadnought:12,Destroyer:6,Titanenergetic_Frigate:6}},
  {name:'全武器混编',fleet:{Dreadnought:8,Destroyer:4,Battleship:4,Cruiser:4,Bomber:4,Interceptor:1,Devourer_Interceptor:1,Titanenergetic_Frigate:4,Reaper:1}},
  {name:'常规舰队 · 311 艘',fleet:{Light_Fighter:100,Heavy_Fighter:100,Cruiser:50,Battleship:20,Dreadnought:20,Destroyer:10,Bomber:4,Interceptor:1,Devourer_Interceptor:1,Titanenergetic_Frigate:4,Reaper:1}},
  {name:'常规舰队 · 500 艘',fleet:{Light_Fighter:161,Heavy_Fighter:161,Cruiser:80,Battleship:32,Dreadnought:32,Destroyer:16,Bomber:6,Interceptor:2,Devourer_Interceptor:2,Titanenergetic_Frigate:6,Reaper:2}},
  {name:'深空旗舰护航',fleet:{Iron_Behemoth:1,Reaper:2,Interceptor:2,Devourer_Interceptor:2,Dreadnought:16,Battleship:16,Destroyer:8,Cruiser:20,Light_Fighter:40,Heavy_Fighter:40}},
];
export const trialTechnology={Strength_Tech:50,Shielding_Tech:50,Weapons_Tech:0};
export function trialCatalog(){return {enabled:true,technology:trialTechnology,ships:allowed.map(id=>({id,name:trialUnits[id].name,experimental:!units[id],stats:battleStats(trialUnits[id],trialTechnology),note:id==='Iron_Behemoth'?'指挥母舰 · 集火 / 全军攻击 +15%（不叠加）/ 蜂群':id==='Annihilator'?'一次性超级武器 · 试验参数':id==='Titanenergetic_Frigate'?'高级战机 · 试验参数':'精英 · 试验参数'})),presets:trialPresets};}
export function validateTrial(input){
  if(!input||typeof input!=='object')throw Error('请设置双方编队');
  const fleets={};
  for(const side of ['attacker','defender']){
    const fleet=input[side];if(!fleet||typeof fleet!=='object'||Array.isArray(fleet))throw Error('请设置双方编队');
    const clean={};let total=0;
    for(const[id,count]of Object.entries(fleet)){
      if(!allowed.includes(id)||!Number.isSafeInteger(count)||count<0||count>10000)throw Error('舰型或数量无效');
      if(count)clean[id]=count;total+=count;
    }
    if(!total||total>10000)throw Error('每方须有 1～10000 艘；推荐常规配比每方 311～500 艘');
    fleets[side]=clean;
  }
  const seed=input.seed??1;if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295)throw Error('种子须为 0～4294967295 的整数');
  return {...fleets,seed};
}
export function finishTrial(world,b){
  if(b.settled)return;
  const survivors=spatialSurvivors(b),losses={attacker:{},defender:{}};
  for(const side of ['attacker','defender'])for(const[id,n]of Object.entries(b.initial[side])){const lost=n-(survivors[side][id]||0);if(lost)losses[side][id]=lost;}
  const report={id:randomUUID(),read:false,type:'battle',trial:true,engine:`spatial-v${b.version}`,battleId:b.id,replayRef:b.id,at:b.finishedAt,title:b.aborted?'编队测试 · 已重开':'编队测试 · 战果',targetId:b.environment?.planetId,targetName:world.planets[b.environment?.planetId]?.name||'近地轨道演练',position:world.planets[b.environment?.planetId]?.position||[0,0,0],attackerName:'己方测试编队',defenderName:'对方测试编队',seed:b.seed,initial:structuredClone(b.initial),survivors,losses,debris:[0,0,0],loot:[0,0,0],repair:{},moonChance:0,moonCreated:false,winner:b.winner,duration:b.tick*.05,rounds:[],simulation:{implementation:`spatial-v${b.version}`,spatial:true,grouped:false},technology:{attacker:b.batches[0].technology,defender:b.batches[1].technology}};
  const player=world.players[b.attacker];if(player){player.reports.unshift(report);player.reports=player.reports.slice(0,100);}
  b.settled=true;b.reportId=report.id;
}
export function startTrial(world,player,input,now=Date.now()){
  const {attacker,defender,seed}=validateTrial(input);
  const id=randomUUID(),b=createSpatialBattle({id,target:`trial:${id}`,attacker:player.id,defender:`trial:${id}:opponent`,start:now,seed,name:'自选编队测试'});
  b.trial=true;b.environment=planetBattleEnvironment(world.planets[player.home]||{});
  const technology=trialTechnology;
  addSpatialFleet(b,{fleet:attacker,side:'attacker',owner:player.id,technology},trialUnits);
  addSpatialFleet(b,{fleet:defender,side:'defender',owner:b.defender,technology},trialUnits);
  for(const previous of Object.values(world.battles||{}))if(previous.trial&&previous.attacker===player.id&&previous.status==='active'){
    previous.status='finished';previous.aborted=true;previous.winner='draw';previous.finishedAt=previous.start+previous.tick*50;previous.controls={};
    previous.events.push({type:'finish',seq:++previous.eventSeq,tick:previous.tick,winner:'draw',reason:'restart'});recordFrame(previous);finishTrial(world,previous);
  }
  (world.battles??={})[id]=b;return b;
}
