import {units,rules} from './catalog.mjs';
import {simulate} from './sandbox.mjs';

export function seeded(seed) { let a=seed>>>0; return ()=>{ a+=0x6D2B79F5; let t=a; t=Math.imul(t^t>>>15,t|1); t^=t+Math.imul(t^t>>>7,t|61); return ((t^t>>>14)>>>0)/4294967296; }; }

export function battle(attacker,defender,attackTech={},defenseTech={},seed=1){
  for(const fleet of [attacker,defender])for(const[id,count]of Object.entries(fleet)){
    if(!Object.hasOwn(units,id)||units[id].missile||!Number.isSafeInteger(count)||count<0)throw new Error('无效的参战舰队');
  }
  for(const technology of [attackTech,defenseTech])for(const value of Object.values(technology))if(!Number.isFinite(value)||value<0)throw new Error('无效的战斗科技');
  if(!Number.isSafeInteger(seed))throw new Error('无效的战斗种子');
  const initial=structuredClone({attacker,defender}),technology=structuredClone({attacker:attackTech,defender:defenseTech});
  const unitStats=Object.fromEntries([...new Set([...Object.keys(attacker),...Object.keys(defender)])].map(id=>[id,{name:units[id].name,strength:units[id].strength,shield:units[id].shield,attack:units[id].attack,splashMultipliers:{...units[id].splashMultipliers},splashRadius:units[id].splashRadius,criticalChances:{...units[id].criticalChances},criticalMultiplier:units[id].criticalMultiplier}]));
  const result=simulate({seed,initial,technology,unitStats});
  const losses={attacker:{},defender:{}},debris=[0,0,0];
  for(const [side,fleet]of Object.entries(initial))for(const[id,count]of Object.entries(fleet)){
    const lost=count-(result.survivors[side][id]||0);
    if(lost)losses[side][id]=lost;
    if(units[id].type!=='defense')for(let i=0;i<2;i++)debris[i]+=Math.floor(units[id].cost[i]*lost*rules.debrisRate);
  }
  const moonChance=Math.min(rules.moonCap,Math.floor((debris[0]+debris[1])/rules.moonStep)*.01);
  return {...result,seed,initial,technology,unitStats,losses,debris,moonChance,moonCreated:moonChance>0&&seeded(seed)()<moonChance};
}
