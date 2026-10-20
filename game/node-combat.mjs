import {units} from './catalog.mjs';
import {areaWeaponRules,splashDamage,criticalChance} from './damage-amplification.mjs';
import {fleetStations} from './fleet-formation.mjs';
import {combatProfile} from './spatial-profiles.mjs';

const SIDES=['attacker','defender'],MAX_COHORTS=2048,ROUNDS=100,INTERVAL=6,IMPACT_DELAY=.75;
function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}

// The front member retains damage; untouched members stay whole. A packet never
// carries projectile overkill into another ship, including in a merged cohort.
export function applyPacket(target,damage,shots){
  if(!target.count||damage<=0||shots<=0)return;
  const needed=Math.ceil((target.hp+target.shield)/damage);
  if(shots<needed){
    const power=damage*shots,absorbed=Math.min(target.shield,power);
    target.shield-=absorbed;target.hp=Math.max(0,target.hp-power+absorbed);return;
  }
  shots-=needed;target.count--;
  if(!target.count){target.hp=0;target.shield=0;return;}
  const full=Math.ceil((target.maxHp+target.maxShield)/damage);
  const killed=Math.min(target.count,Math.floor(shots/full));
  target.count-=killed;shots-=killed*full;
  target.hp=target.count?target.maxHp:0;target.shield=target.count?target.maxShield:0;
  if(target.count&&shots){
    const power=damage*shots,absorbed=Math.min(target.shield,power);
    target.shield-=absorbed;target.hp=Math.max(0,target.hp-power+absorbed);
  }
}

function setup(fleet,technology,definitions){
  const entries=Object.entries(fleet).filter(([,n])=>n>0).sort(([a],[b])=>a.localeCompare(b));
  const total=entries.reduce((n,[,count])=>n+count,0);
  if(!Number.isSafeInteger(total))throw new Error('参战舰队总数超出安全整数范围');
  const budget=MAX_COHORTS-entries.length,cohorts=[];
  const groupCounts=new Map(entries.map(([id,count])=>[id,total<=MAX_COHORTS?count:Math.min(count,1+Math.floor(count/total*budget))]));
  const stations=fleetStations([...groupCounts],id=>combatProfile({...units[id],...definitions[id]}));
  for(const[id,count]of entries){
    const unit={...units[id],...definitions[id]};
    const maxHp=unit.strength*(1+(technology.Strength_Tech||0)*.1);
    const maxShield=unit.shield*(1+(technology.Shielding_Tech||0)*.1);
    const attack=unit.attack*(1+(technology.Weapons_Tech||0)*.1);
    if(![maxHp,maxShield,maxHp+maxShield,attack].every(Number.isFinite)||maxHp<=0||maxShield<0||attack<0)throw new Error('无效的战斗单位属性');
    const groups=groupCounts.get(id);
    const quotient=Math.floor(count/groups),remainder=count%groups;
    for(let i=0;i<groups;i++){const p=stations.get(id)[i];cohorts.push({id,count:quotient+(i<remainder?1:0),maxHp,maxShield,attack,splashMultipliers:unit.splashMultipliers,...areaWeaponRules(unit),x:p.depth,y:p.y,z:p.z,hp:maxHp,shield:maxShield});}
  }
  return {cohorts,total};
}

function snapshot(teams){
  return Object.fromEntries(SIDES.map((side,i)=>{
    const fleet={};for(const c of teams[i].cohorts)if(c.count)fleet[c.id]=(fleet[c.id]||0)+c.count;
    return [side,fleet];
  }));
}

function targets(cohorts){
  const list=cohorts.filter(c=>c.count>0),cumulative=[],grid=new Map();let total=0;
  for(const c of list){total+=c.count;cumulative.push(total);const key=[c.x,c.y,c.z].map(v=>Math.floor(v/60)).join(',');if(!grid.has(key))grid.set(key,[]);grid.get(key).push(c);}
  return {list,cumulative,total,grid};
}

function nearby(table,target,radius){
  const found=[];
  for(let x=Math.floor((target.x-radius)/60);x<=Math.floor((target.x+radius)/60);x++)for(let y=Math.floor((target.y-radius)/60);y<=Math.floor((target.y+radius)/60);y++)for(let z=Math.floor((target.z-radius)/60);z<=Math.floor((target.z+radius)/60);z++)for(const c of table.grid.get(`${x},${y},${z}`)||[])found.push(c);
  return found;
}

function choose(table,fraction){
  const value=fraction*table.total;let lo=0,hi=table.list.length-1;
  while(lo<hi){const mid=(lo+hi)>>>1;if(table.cumulative[mid]>value)hi=mid;else lo=mid+1;}
  return table.list[lo];
}

function hash(value){let h=2166136261;for(const c of JSON.stringify(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}

export function simulateBattle(request){
  if(!Number.isSafeInteger(request.seed)||!request.initial||!request.technology)throw new Error('无效的战斗请求');
  for(const side of SIDES){
    const fleet=request.initial[side],tech=request.technology[side]||{};
    if(!fleet||typeof fleet!=='object'||Array.isArray(fleet))throw new Error('无效的参战舰队');
    for(const[id,count]of Object.entries(fleet))if(!Object.hasOwn(units,id)||units[id].missile||!Number.isSafeInteger(count)||count<0)throw new Error('无效的参战舰队');
    for(const value of Object.values(tech))if(!Number.isFinite(value)||value<0)throw new Error('无效的战斗科技');
  }
  const rng=random(request.seed),teams=SIDES.map(side=>setup(request.initial[side],request.technology[side]||{},request.unitStats||{}));
  const grouped=teams.some(t=>t.cohorts.some(c=>c.count>1));
  const rounds=[];let before=snapshot(teams),duration=.25,shotCount=0,criticalCount=0,splashCount=0;
  for(let number=1;number<=ROUNDS;number++){
    const tables=teams.map(t=>targets(t.cohorts));
    if(!tables[0].total||!tables[1].total){rounds.push({number,time:duration,before,after:before});break;}
    // Godot's fleet_sim restores shields every 24 x .25 seconds. Volleys are
    // scheduled from one shared snapshot, so destroyed ships still return fire.
    for(const team of teams)for(const c of team.cohorts)if(c.count)c.shield=c.maxShield;
    const packets=[];
    for(let side=0;side<2;side++){
      const enemy=tables[1-side];
      for(const source of teams[side].cohorts){
        if(!source.count||source.attack<=0)continue;
        const shots=source.count,samples=Math.min(shots,enemy.list.length,16);
        const offset=rng(),base=Math.floor(shots/samples),remainder=shots%samples;
        for(let i=0;i<samples;i++){
          const target=choose(enemy,(i+offset)/samples),count=base+(i<remainder?1:0);
          // One random sample per impact, compared against each victim's own
          // 1 - 1/r chance. Large salvos retain the expected critical count.
          let sample,blastCrits=0;
          const packet=(victim,power,members=1)=>{
            const expected=count*criticalChance(source,victim.id),crits=Math.floor(expected)+(expected%1>0&&(sample??=rng())<expected%1?1:0);
            blastCrits=Math.max(blastCrits,crits);
            if(count>crits)packets.push([victim,power,(count-crits)*members]);
            if(crits)packets.push([victim,power*2,crits*members]);
          };
          packet(target,source.attack);
          if(source.splashRadius>0)for(const victim of nearby(enemy,target,source.splashRadius)){
            const members=victim.count-(victim===target?1:0);if(members<=0)continue;
            const power=splashDamage(source.attack,source,victim.id,Math.hypot(victim.x-target.x,victim.y-target.y,victim.z-target.z),source.splashRadius);
            if(power>0){packet(victim,power,members);splashCount+=count*members;}
          }
          criticalCount+=blastCrits;
        }
        shotCount+=shots;
      }
    }
    for(const[target,damage,shots]of packets)applyPacket(target,damage,shots);
    const after=snapshot(teams),alive=SIDES.map(side=>Object.values(after[side]).reduce((a,b)=>a+b,0));
    const finished=!alive[0]||!alive[1];
    duration=finished?(number-1)*INTERVAL+.25+IMPACT_DELAY:number*INTERVAL;
    rounds.push({number,time:duration,before,after});before=after;
    if(finished)break;
  }
  const survivors=snapshot(teams),alive=SIDES.map(side=>Object.keys(survivors[side]).length>0);
  for(const side of SIDES)for(const[id,count]of Object.entries(survivors[side]))if(!Number.isSafeInteger(count)||count<0||count>request.initial[side][id])throw new Error('战斗结算产生无效舰船数量');
  const winner=alive[0]&&!alive[1]?'attacker':alive[1]&&!alive[0]?'defender':'draw';
  const simulation={implementation:'node-v3-splash',spatial:false,formation:'stationary-cohorts',grouped,cohorts:teams.map(t=>t.cohorts.length),cohortLimitPerSide:MAX_COHORTS,shotCount,criticalCount,splashCount};
  // Keep this legacy report discriminator; implementation is explicitly Node.
  return {engine:'sandbox-v1',sandbox:{version:2,runtime:'node',volleyInterval:INTERVAL,shieldInterval:INTERVAL,impactDelay:IMPACT_DELAY,maxDuration:ROUNDS*INTERVAL},simulation,rounds,survivors,winner,duration,stateHash:hash([survivors,teams.map(t=>t.cohorts.map(c=>[c.count,c.hp,c.shield])),shotCount,request.seed])};
}
