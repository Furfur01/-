import {randomUUID} from 'node:crypto';
import {units} from './catalog.mjs';
import {battleStats} from './battle-stats.mjs';
import {planetBattleEnvironment} from './battle-terrain.mjs';
import {spatialSurvivors} from './spatial-battle.mjs';

// Retain the established trial balance; advanced hulls also have formal production definitions.
export const trialUnits={...units,
  Iron_Behemoth:{...units.Destroyer,id:'Iron_Behemoth',name:'深空吞噬者',strength:350000,shield:4000,attack:5500,splashMultipliers:{},splashRadius:0},
  Interceptor:{...units.Destroyer,id:'Interceptor',name:'裂变者',strength:55000,shield:2250,attack:18000,splashMultipliers:{},splashRadius:0},
  Devourer_Interceptor:{...units.Destroyer,id:'Devourer_Interceptor',name:'噬能截击者',strength:55000,shield:3000,attack:16000,splashMultipliers:{},splashRadius:0},
  Titanenergetic_Frigate:{...units.Cruiser,id:'Titanenergetic_Frigate',name:'钛能守卫者',strength:13500,shield:600,attack:4800,splashMultipliers:{},splashRadius:0},
  Reaper:{...units.Destroyer,id:'Reaper',name:'收割者',strength:165000,shield:6000,attack:48000,splashMultipliers:{},splashRadius:0},
  Annihilator:{...units.Destroyer,id:'Annihilator',name:'湮灭之星',strength:2000,shield:0,attack:500000,splashMultipliers:{},splashRadius:0}
};
// Retained only to settle unfinished trial battles in existing saves.
export function finishTrial(world,b){
  if(b.settled)return;
  const survivors=spatialSurvivors(b),losses={attacker:{},defender:{}};
  for(const side of ['attacker','defender'])for(const[id,n]of Object.entries(b.initial[side])){const lost=n-(survivors[side][id]||0);if(lost)losses[side][id]=lost;}
  const report={id:randomUUID(),read:false,type:'battle',trial:true,engine:`spatial-v${b.version}`,battleId:b.id,replayRef:b.id,at:b.finishedAt,title:b.aborted?'编队测试 · 已重开':'编队测试 · 战果',targetId:b.environment?.planetId,targetName:world.planets[b.environment?.planetId]?.name||'近地轨道演练',position:world.planets[b.environment?.planetId]?.position||[0,0,0],attackerName:'己方测试编队',defenderName:'对方测试编队',seed:b.seed,initial:structuredClone(b.initial),survivors,losses,debris:[0,0,0],loot:[0,0,0],repair:{},moonChance:0,moonCreated:false,winner:b.winner,duration:b.tick*.05,rounds:[],simulation:{implementation:`spatial-v${b.version}`,spatial:true,grouped:false},technology:{attacker:b.batches[0].technology,defender:b.batches[1].technology}};
  const player=world.players[b.attacker];if(player){player.reports.unshift(report);player.reports=player.reports.slice(0,100);}
  b.settled=true;b.reportId=report.id;
}
