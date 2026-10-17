// Local command-carrier balance. Swarms are battle-only units, never inventory.
export const DEVOURER = Object.freeze({
  aura: .15, focusRadius: 1000, lockRange: 2400, focusFraction: .35, focusMax: 8,
  focusSeconds: 6, focusCooldown: 8,
  initial: 8, wave: 4, interval: 6, capacity: 12, lifetime: 30,
  swarmShare: .8, hull: 35, cooldown: .5, guardRadius: 240,
});
export const SWARM_TYPE = 'Swarm_Fighter';
export const swarmModes = ['assault', 'guard'];
export const swarmFormations = ['wedge', 'screen', 'orbit'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const ticks=seconds=>Math.round(seconds*20);
export const isCarrier=s=>s.type==='Iron_Behemoth'&&!!s.profile.carrier;
export function carrierState(b,s){
  return s.carrier??={mode:s.side==='attacker'?'assault':'guard',formation:s.side==='attacker'?'wedge':'screen',nextWave:b.tick,focusReady:0,focusTarget:-1,focusUntil:0,launched:0};
}
export function commandCarrier(b,s,action,emit){
  if(!isCarrier(s))throw Error('该舰没有蜂群指挥系统');
  if(action.mode!==undefined&&!swarmModes.includes(action.mode))throw Error('无效蜂群战术');
  if(action.formation!==undefined&&!swarmFormations.includes(action.formation))throw Error('无效蜂群阵型');
  const target=action.target===undefined?null:b.ships[action.target];
  if(action.target!==undefined&&(!Number.isSafeInteger(action.target)||!target||target.hp<=0||target.side===s.side))throw Error('集火目标无效');
  if(target&&distance(s,target)>DEVOURER.lockRange)throw Error('目标超出指挥锁定范围');
  const c=carrierState(b,s);
  if(target&&b.tick<c.focusReady&&!c.focusAutomatic)throw Error('集火指令冷却中');
  if(action.mode)c.mode=action.mode;
  if(action.formation)c.formation=action.formation;
  if(target){c.orderedTarget=target.id;s.target=target.id;c.focusReady=b.tick;c.focusAutomatic=false;}
  emit(b,'carrier-order',{shipId:s.id,mode:c.mode,formation:c.formation,...(target?{target:target.id}:{})});
}
export function commandMultiplier(b,s){
  if(s.profile.ground)return 1;
  return (b.commanders?.[s.side]||[]).some(id=>b.ships[id]?.hp>0)?1+DEVOURER.aura:1;
}
function launchSwarm(b,s,count,emit){
  const c=carrierState(b,s),technology=b.batches[s.batch]?.technology||{};
  const profile={role:'fighter',ground:false,defenseOnly:false,speed:200,turn:3.8,range:340,cooldown:DEVOURER.cooldown,
    kind:'laser',beam:true,missile:false,primaryName:'蜂群脉冲激光',projectileSpeed:540,fixed:true,radius:1.1,length:1.5,
    hardpoints:{main:[[-.7,0,0]],tubes:[],secondary:[]},secondary:false,secondaryMissile:false,pointDefense:false,
    muzzles:[[-.7,0,0]],missiles:[],piloted:false,renderType:'Light_Fighter',modelScale:1.5};
  const ids=[],occupied=new Set(b.ships.filter(d=>d.carrierId===s.id&&d.hp>0).map(d=>d.swarmSlot));
  for(let n=0;n<count;n++){
    let slot=0;while(occupied.has(slot))slot++;occupied.add(slot);c.launched++;
    const a=slot*Math.PI*2/DEVOURER.capacity;
    const hp=DEVOURER.hull*(1+(technology.Strength_Tech||0)*.1);
    const drone={id:b.ships.length,type:SWARM_TYPE,side:s.side,owner:s.owner,batch:s.batch,
      formation:`${s.batch}:${SWARM_TYPE}:${s.id}`,station:{role:'fighter',spacing:12,depth:0,y:s.y,z:s.z},
      x:s.x+Math.cos(a)*120,y:s.y+25+(slot%3)*12,z:s.z+Math.sin(a)*120,yaw:s.yaw,pitch:0,roll:0,speed:0,
      hp,shield:0,maxHp:hp,maxShield:0,attack:s.attack*DEVOURER.swarmShare/DEVOURER.capacity,profile:{...profile},rapid:{},
      cooldown:slot*.025,secondaryCooldown:0,missileCooldown:0,pdCooldown:0,target:-1,lastHit:-1000,
      temporary:true,carrierId:s.id,swarmSlot:slot,bornTick:b.tick,expires:b.tick+ticks(DEVOURER.lifetime)};
    b.ships.push(drone);ids.push(drone.id);
  }
  if(ids.length){b.swarmChangedTick=b.tick;emit(b,'swarm-launch',{shipId:s.id,ships:ids,mode:c.mode,formation:c.formation});}
}
export function retireSwarms(b,emit){
  const drones=new Map();
  for(const s of b.ships)if(s.temporary&&s.hp>0){
    if(b.ships[s.carrierId]?.hp<=0||b.tick>=s.expires){
      s.hp=0;s.shield=0;s.speed=0;emit(b,'destroy',{shipId:s.id,source:s.carrierId,kind:'swarm-expire',x:s.x,y:s.y,z:s.z});
    }else{if(!drones.has(s.carrierId))drones.set(s.carrierId,[]);drones.get(s.carrierId).push(s);}
  }
  return drones;
}
// Runs before movement/grid creation so newborns participate in collision and fire this tick.
export function advanceCarriers(b,manual,acquire,emit){
  const carriers=b.ships.filter(s=>s.hp>0&&isCarrier(s));
  b.commanders={attacker:[],defender:[]};
  for(const s of carriers)b.commanders[s.side].push(s.id);
  const drones=retireSwarms(b,emit);
  for(const s of carriers){
    const c=carrierState(b,s),input=manual.get(s.id),ordered=b.ships[c.orderedTarget];
    if(ordered?.hp>0)s.target=ordered.id;
    else if(input?.lock&&b.ships[input.target]?.hp>0)s.target=input.target;
    else if(!b.ships[s.target]||b.ships[s.target].hp<=0)s.target=acquire(s);
    const t=b.ships[s.target];
    const override=input?.lock&&c.focusAutomatic&&t?.id!==c.focusTarget;
    if(t?.hp>0&&t.side!==s.side&&distance(s,t)<=DEVOURER.lockRange&&(b.tick>=c.focusReady||override)&&(!input||input.lock||ordered?.hp>0)){
      const nearby=b.ships.filter(a=>a.hp>0&&a.side===s.side&&a.id!==s.id&&!a.temporary&&!a.profile.ground&&a.attack>0&&!['support','ordnance'].includes(a.profile.role)&&!manual.has(a.id)&&distance(s,a)<=DEVOURER.focusRadius&&!(a.focus?.until>b.tick&&a.focus.source!==s.id&&b.ships[a.focus.source]?.hp>0))
        .sort((a,d)=>distance(s,a)-distance(s,d)||a.id-d.id);
      const allies=nearby.slice(0,Math.min(DEVOURER.focusMax,Math.ceil(nearby.length*DEVOURER.focusFraction)));
      // A player can replace an automatic order once, then respects the normal cooldown.
      for(const ally of b.ships)if(ally.focus?.source===s.id)delete ally.focus;
      c.focusAutomatic=!input&&!(ordered?.hp>0);c.focusTarget=t.id;c.focusUntil=b.tick+ticks(DEVOURER.focusSeconds);c.focusReady=b.tick+ticks(DEVOURER.focusCooldown);delete c.orderedTarget;
      for(const a of allies){a.focus={source:s.id,target:t.id,until:c.focusUntil};a.target=t.id;}
      emit(b,'focus-command',{shipId:s.id,target:t.id,ships:allies.map(a=>a.id),until:c.focusUntil});
    }
    if(b.tick>=c.nextWave){
      const count=Math.min(c.launched?DEVOURER.wave:DEVOURER.initial,DEVOURER.capacity-(drones.get(s.id)?.length||0));
      launchSwarm(b,s,count,emit);c.nextWave=b.tick+ticks(DEVOURER.interval);
    }
  }
}
export function commandedTarget(b,s){
  if(s.carrier?.focusUntil>b.tick&&b.ships[s.carrier.focusTarget]?.hp>0)return s.carrier.focusTarget;
  const f=s.focus,source=b.ships[f?.source],target=b.ships[f?.target];
  if(f&&source?.hp>0&&target?.hp>0&&f.until>b.tick&&distance(source,s)<=DEVOURER.focusRadius)return target.id;
  if(f)delete s.focus;
  return null;
}
export function swarmTarget(b,s,acquire){
  const carrier=b.ships[s.carrierId],c=carrier.carrier;
  if(c.mode==='assault'){
    const locked=b.ships[c.focusUntil>b.tick?c.focusTarget:carrier.target];
    return locked?.hp>0?locked.id:acquire(s);
  }
  // Guards engage threats around the carrier, never chase across the battlefield.
  const target=b.ships[acquire(s)];
  return target?.hp>0&&distance(carrier,target)<=DEVOURER.guardRadius+340?target.id:-1;
}
export function swarmGoal(b,s,target){
  const mother=b.ships[s.carrierId],c=mother.carrier,guard=c.mode==='guard',anchor=guard||!target?mother:target;
  const forward=guard?mother.yaw:Math.atan2(target.x-mother.x,target.z-mother.z),slot=s.swarmSlot;
  let ahead,lateral,vertical;
  if(c.formation==='orbit'){
    const a=slot*Math.PI*2/DEVOURER.capacity+b.tick*.05*.65;
    ahead=Math.cos(a)*(guard?175:115);lateral=Math.sin(a)*(guard?175:115);vertical=Math.sin(a*2)*45+30;
  }else if(c.formation==='screen'){
    ahead=guard?165:-125;lateral=(slot%6-2.5)*32;vertical=30+(Math.floor(slot/6)-.5)*60;
  }else{
    ahead=(guard?180:-100)-Math.floor(slot/2)*15;lateral=(slot%2?1:-1)*(15+Math.floor(slot/2)*18);vertical=25+(slot%3-1)*18;
  }
  return {x:anchor.x+Math.sin(forward)*ahead+Math.cos(forward)*lateral,y:anchor.y+vertical,z:anchor.z+Math.cos(forward)*ahead-Math.sin(forward)*lateral,assembling:false};
}
export function guardDecoy(b,s,target,guards){
  if(!target||target.temporary||target.profile.ground)return target?.id??-1;
  const eligible=guards.filter(d=>d.side!==s.side&&d.hp>0&&distance(d,target)<DEVOURER.guardRadius&&distance(d,s)<700&&distance(d,s)<distance(s,target)+50);
  eligible.sort((a,d)=>distance(a,s)-distance(d,s)||a.id-d.id);
  return eligible[0]?.id??target.id;
}
export function carrierSnapshot(b){
  const counts=new Map();for(const s of b.ships)if(s.temporary&&s.hp>0)counts.set(s.carrierId,(counts.get(s.carrierId)||0)+1);
  return b.ships.filter(s=>isCarrier(s)).map(s=>{
    const c=s.carrier||{};
    return {shipId:s.id,mode:c.mode|| (s.side==='attacker'?'assault':'guard'),formation:c.formation||(s.side==='attacker'?'wedge':'screen'),
      active:counts.get(s.id)||0,capacity:DEVOURER.capacity,
      nextWave:Math.max(0,((c.nextWave??b.tick)-b.tick)/20),focusCooldown:Math.max(0,((c.focusReady??b.tick)-b.tick)/20),focusAutomatic:!!c.focusAutomatic,
      focusTarget:c.focusUntil>b.tick&&b.ships[c.focusTarget]?.hp>0?c.focusTarget:-1,aura:s.hp>0?DEVOURER.aura:0};
  });
}
