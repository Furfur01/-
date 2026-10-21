import {units,tech,rules} from './catalog.mjs';
import {battle,seeded} from './combat.mjs';
import {expeditionZones,ordinaryRewardShips,fleetValue,fleetCapacity,resourceBase} from './expedition-rules.mjs';

function validateFleet(fleet){
  if(!fleet||typeof fleet!=='object'||Array.isArray(fleet))throw Error('请选择编队');
  let total=0;
  for(const[id,n]of Object.entries(fleet)){
    if(!Object.hasOwn(units,id)||units[id].type==='defense'||id==='Solar_Satellite'||!Number.isSafeInteger(n)||n<0)throw Error('舰船数量无效');
    total+=n;
  }
  if(total<1||total>20000)throw Error('请选择 1–20,000 艘舰船');
}

export function escortAssessment(fleet,technology,zoneId='outer'){
  validateFleet(fleet);
  if(!Object.hasOwn(expeditionZones,zoneId))throw Error('探险区域无效');
  const zone=expeditionZones[zoneId];
  const escorts=Object.fromEntries(Object.entries(fleet).filter(([id,n])=>n>0&&units[id].type==='combat'));
  if(!Object.keys(escorts).length)return {safe:false,reason:'没有护航舰；遭遇海盗时将放弃奖励撤离',losses:{}};
  const pirateTech=Object.fromEntries(['Weapons_Tech','Shielding_Tech','Strength_Tech'].map(id=>[id,zone.tech]));
  // Fixed patrol, fixed engagement. Preview and settlement use the same combat
  // rules, rather than promising safety from a rough fleet-power score.
  const combat=battle(escorts,zone.pirates,technology,pirateTech,zone.seed);
  const lossRatio=fleetValue(combat.losses.attacker,units)/fleetValue(escorts,units);
  const safe=combat.winner==='attacker'&&lossRatio<=.1;
  return {safe,reason:safe?(lossRatio?'能够击退海盗；预计有小额护航损失，届时停止连跑':'护航充足，预计无损击退海盗'):'护航不足；舰队将避战撤离并放弃本轮奖励',losses:safe?combat.losses.attacker:{},combat};
}

export function rewardShipPool(fleet,player,planet){
  return ordinaryRewardShips.filter(id=>fleet[id]>0&&units[id]?.fleetAvailable!==false&&(units[id].req||[]).every(([key,n])=>(Object.hasOwn(tech,key)?player.tech[key]||0:planet.buildings[key]||0)>=n));
}

export function explore(fleet,seed,_holdHours=1,technology={},options={}){
  const zoneId=options.zone||'outer',zone=expeditionZones[zoneId];
  if(!zone)throw Error('探险区域无效');
  const rng=seeded(seed),roll=rng(),encounter=rng()<.2;
  const result={event:'nothing',body:'没有发现可带回的物资。',ships:{...fleet},cargo:[0,0,0],darkMatter:0,parts:0,foundShips:{},returnFactor:1,discovered:null,capacity:fleetCapacity(fleet,units),zone:zoneId,encounter,retreated:false,losses:{},salvage:[0,0,0]};
  if(encounter){
    const assessment=escortAssessment(fleet,technology,zoneId);
    if(!assessment.safe){
      result.event='retreat';result.retreated=true;
      result.body=`遭遇${zone.name}固定海盗，护航不足，舰队放弃本轮收获撤离。民用船先行返航，全舰保全。`;
      return result;
    }
    result.combat=assessment.combat;result.losses=assessment.losses;
    for(const[id,n]of Object.entries(result.losses))result.ships[id]-=n;
    result.capacity=fleetCapacity(result.ships,units);
  }
  let free=result.capacity;
  const load=amounts=>amounts.map((n,i)=>{const amount=Math.min(Math.floor(n),free);result.cargo[i]+=amount;free-=amount;return amount;});
  if(roll<.6){
    result.event='resources';
    const resource=Math.floor(rng()*3),amount=Math.floor(resourceBase(fleet,units,zoneId)*(.5+rng()*.5)*[1,.6,.8][resource]);
    result.discovered={resource,amount};load([0,1,2].map(i=>i===resource?amount:0));
    result.body=`发现${['金属','晶体','气体'][resource]} ${amount}，实际装载 ${result.cargo[resource]}。`;
  }else if(roll<.8){
    const pool=(options.rewardPool||[]).filter(id=>ordinaryRewardShips.includes(id)&&fleet[id]>0);
    if(pool.length){
      const id=pool[Math.floor(rng()*pool.length)],quantity=fleet[id]*(.02+rng()*.03),count=Math.floor(quantity);
      result.event='ships';result.foundShips=count?{[id]:count}:{};
      // Found ships travel separately and do not enlarge this round's cargo.
      const materials=load(units[id].cost.map(n=>Math.floor(n*(quantity-count))));
      result.discovered={ship:id,count,materials};
      result.body=`找到${units[id].name} ${count} 艘；不足整艘的部分折为材料，装载 ${materials.join(' / ')}。发现舰船返港后留在基地。`;
    }else result.body='未发现与当前编队已解锁普通舰型匹配的舰船。';
  }else if(roll<.95){
    result.event='darkMatter';
    const [min,max]=zone.darkMatter,amount=min+Math.floor(rng()*(max-min+1));
    result.darkMatter=Math.min(amount,free);free-=result.darkMatter;
    result.discovered={resource:'darkMatter',amount};
    result.body=`发现暗物质 ${amount}，实际带回 ${result.darkMatter}。`;
  }
  if(encounter){
    const debris=[0,0,0];
    for(const[id,n]of Object.entries(result.combat.losses.defender))for(let i=0;i<2;i++)debris[i]+=Math.floor(units[id].cost[i]*n*rules.debrisRate);
    let salvageSpace=Math.min(free,(fleet.Recycler||0)*units.Recycler.cargo);
    result.salvage=load(debris.map(n=>{const amount=Math.min(n,salvageSpace);salvageSpace-=amount;return amount;}));
    result.body+=` 护航舰击退${zone.name}海盗，民用船未参战；回收敌方残骸 ${result.salvage.join(' / ')}。`;
  }
  for(const[id,n]of Object.entries(result.foundShips))result.ships[id]=(result.ships[id]||0)+n;
  result.body+=' 所得随舰队返港入账。';
  return result;
}
