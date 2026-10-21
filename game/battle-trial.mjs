import {randomUUID} from 'node:crypto';
import {units} from './catalog.mjs';
import {spatialSurvivors} from './spatial-battle.mjs';

// Asset exporters use the production catalog; saved trial battles retain their frozen state.
export const trialUnits=units;
// Retained only to settle unfinished trial battles in existing saves.
export function finishTrial(world,b){
  if(b.settled)return;
  const survivors=spatialSurvivors(b),losses={attacker:{},defender:{}};
  for(const side of ['attacker','defender'])for(const[id,n]of Object.entries(b.initial[side])){const lost=n-(survivors[side][id]||0);if(lost)losses[side][id]=lost;}
  const report={id:randomUUID(),read:false,type:'battle',trial:true,engine:`spatial-v${b.version}`,battleId:b.id,replayRef:b.id,at:b.finishedAt,title:b.aborted?'编队测试 · 已重开':'编队测试 · 战果',targetId:b.environment?.planetId,targetName:world.planets[b.environment?.planetId]?.name||'近地轨道演练',position:world.planets[b.environment?.planetId]?.position||[0,0,0],attackerName:'己方测试编队',defenderName:'对方测试编队',seed:b.seed,initial:structuredClone(b.initial),survivors,losses,debris:[0,0,0],loot:[0,0,0],repair:{},moonChance:0,moonCreated:false,winner:b.winner,duration:b.tick*.05,rounds:[],simulation:{implementation:`spatial-v${b.version}`,spatial:true,grouped:false},technology:{attacker:b.batches[0].technology,defender:b.batches[1].technology}};
  const player=world.players[b.attacker];if(player){player.reports.unshift(report);player.reports=player.reports.slice(0,100);}
  b.settled=true;b.reportId=report.id;
}
