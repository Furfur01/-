import {fleetStations,fleetFronts,formationGoal,planetBombingGoal} from './fleet-formation.mjs';
import {antimatterDamage} from './special-combat.mjs';
import {projectileContact} from './projectile-contact.mjs';
import {pilotHandling} from './pilot-controls.mjs';
import {steerPilot} from './pilot-motion.mjs';
import {weaponSolution} from './weapon-solution.mjs';
import {placePlanetUnit,keepAboveSurface,terrainBlocks,surfaceHeight,battleViewEnvironment} from './battle-terrain.mjs';
import {STEP_MS,MAX_BATTLE_MS,SPATIAL_VERSION,combatProfile} from './spatial-profiles.mjs';
import {absorbDefenseShield} from './planet-defense.mjs';
import {advanceCarriers,retireSwarms,commandCarrier,commandMultiplier,commandedTarget,swarmTarget,swarmGoal,guardDecoy,carrierSnapshot} from './devourer-command.mjs';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const angle=v=>Math.atan2(Math.sin(v),Math.cos(v));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const sides=['attacker','defender'];
export function createSpatialBattle({id,target,attacker,defender,start,seed=1,name='',environment=null}){
  return {id,target,attacker,defender,start,name,environment,version:SPATIAL_VERSION,tick:0,seed:seed>>>0,rng:seed>>>0,status:'active',ships:[],batches:[],projectiles:[],controls:{},events:[],eventSeq:0,frames:[],nextProjectile:0,boundary:4000,initial:{attacker:{},defender:{}},finishedAt:null};
}
function random(b){b.rng=(Math.imul(b.rng,1664525)+1013904223)>>>0;return b.rng/4294967296;}
function emit(b,type,data={}){const e={seq:++b.eventSeq,tick:b.tick,type,...data};b.events.push(e);return e;}
export function addSpatialFleet(b,{fleet,technology={},owner,mission=null,side},definitions){
  if(b.status!=='active')throw Error('战斗已经结束');
  const entries=Object.entries(fleet).filter(([,n])=>n>0).sort(([a],[c])=>a.localeCompare(c));
  for(const[id,n]of entries)if(!definitions[id]||definitions[id].missile||!Number.isSafeInteger(n)||n<0)throw Error('无效的参战舰队');
  for(const n of Object.values(technology))if(!Number.isFinite(n)||n<0)throw Error('无效的战斗科技');
  if(!sides.includes(side))throw Error('无效阵营');
  const batch={id:b.batches.length,owner,mission,side,technology:structuredClone(technology),fleet:structuredClone(fleet),tick:b.tick};
  b.batches.push(batch);
  const sign=side==='attacker'?-1:1;
  const lane=b.batches.filter(x=>x.side===side).length-1,stations=fleetStations(entries,id=>combatProfile(definitions[id]),lane);
  let ordinal=0;
  for(const [typeIndex,[id,count]]of entries.entries()){
    const u=definitions[id],profile=combatProfile(u),maxHp=u.strength*(1+(technology.Strength_Tech||0)*.1),maxShield=u.shield*(1+(technology.Shielding_Tech||0)*.1),attack=u.attack*(1+(technology.Weapons_Tech||0)*.1);
    if(![maxHp,maxShield,attack].every(Number.isFinite)||maxHp<=0||maxShield<0||attack<0)throw Error('无效单位属性');
    b.initial[side][id]=(b.initial[side][id]||0)+count;
    for(let n=0;n<count;n++,ordinal++){
      const formation=Math.floor(n/32),slot=stations.get(id)[n],station={...slot,y:clamp(slot.y+sign*Math.min(60,profile.length*1.2+12),-560,560)};
      const x=sign*(1050+station.depth),y=station.y,z=station.z;
      b.ships.push({id:b.ships.length,type:id,side,owner,batch:batch.id,formation:`${batch.id}:${id}:${formation}`,station,x,y,z,yaw:sign<0?Math.PI/2:-Math.PI/2,pitch:0,speed:0,hp:maxHp,shield:maxShield,maxHp,maxShield,attack,profile,rapid:{...u.rapid},cooldown:n%11*.07,secondaryCooldown:0,missileCooldown:0,pdCooldown:0,target:-1,lastHit:-1000});
      placePlanetUnit(b,b.ships.at(-1));
      const placed=b.ships.at(-1);b.boundary=Math.max(b.boundary,Math.abs(placed.x)+1500,Math.abs(placed.z)+1500);
      b.boundary=Math.max(b.boundary,Math.abs(x)+1500,Math.abs(z)+1500);
    }
  }
  emit(b,'reinforcement',{batch:batch.id,side,count:entries.reduce((n,[,c])=>n+c,0)});
  recordFrame(b);
  return batch;
}
export function spatialSurvivors(b,batchId=null){
  const out={attacker:{},defender:{}};
  for(const s of b.ships)if(s.hp>0&&!s.temporary&&(batchId===null||s.batch===batchId))out[s.side][s.type]=(out[s.side][s.type]||0)+1;
  return out;
}
export function strikeBattleDefenses(b,damage,types){
  const losses={};
  for(const type of types)for(const s of b.ships){
    if(s.side!=='defender'||s.type!==type||s.hp<=0||damage<s.maxHp)continue;
    damage-=s.maxHp;s.hp=0;s.shield=0;s.unrepairable=true;losses[type]=(losses[type]||0)+1;
    emit(b,'destroy',{shipId:s.id,x:s.x,y:s.y,z:s.z,source:'interplanetary-missile'});
  }
  emit(b,'strategic-strike',{losses});recordFrame(b);return {losses,remaining:damage};
}
export function battleSummary(b,planet={}){
  const survivors=spatialSurvivors(b);
  return {id:b.id,target:b.trial?(b.environment?.planetId||planet.id||b.target):b.target,name:b.name,environment:battleViewEnvironment(b.environment,planet),trial:!!b.trial,start:b.start,elapsed:b.tick*STEP_MS/1000,status:b.status,winner:b.winner,attacker:b.attacker,defender:b.defender,counts:sides.map(side=>Object.values(survivors[side]).reduce((a,c)=>a+c,0)),formations:new Set(b.ships.filter(s=>s.hp>0).map(s=>s.formation)).size};
}
export function battleVisible(b,playerId){return b.attacker===playerId||b.defender===playerId;}
export function controlBattle(b,owner,action){
  if(b.status!=='active'||!battleVisible(b,owner))throw Error('战斗不可操作');
  if(action.clientId!==undefined&&(typeof action.clientId!=='string'||action.clientId.length>100))throw Error('无效驾驶会话');
  if(action.type==='release'){if(b.controls[owner]?.clientId&&b.controls[owner].clientId!==action.clientId)return;delete b.controls[owner];emit(b,'release',{owner});return;}
  const s=b.ships[action.shipId];
  if(!s||s.owner!==owner||s.hp<=0||!s.profile.piloted)throw Error('只能驾驶自己的存活战斗舰');
  if(action.type==='carrier-order'){commandCarrier(b,s,action,emit);return;}
  if(action.type==='claim'){
    // Repeating a claim is idempotent and cannot reset the input sequence or weapon state.
    if(b.controls[owner]?.shipId===s.id&&b.controls[owner]?.clientId===action.clientId)return;
    b.controls[owner]={shipId:s.id,seq:-1,...(action.clientId?{clientId:action.clientId}:{}),lastTick:b.tick,input:{throttle:0,yaw:0,pitch:0,fire:false,missile:false}};
    emit(b,'claim',{owner,shipId:s.id});return;
  }
  if(action.type!=='input')throw Error('无效控制命令');
  const control=b.controls[owner];
  if(!control||control.shipId!==s.id)throw Error('请先接管舰船');
  if(control.clientId&&control.clientId!==action.clientId)throw Error('驾驶权已切换到其他页面');
  if(!Number.isSafeInteger(action.seq)||action.seq<=control.seq)throw Error('控制序号已过期');
  const i=action.input||{};
  for(const key of ['throttle','yaw','pitch'])if(!Number.isFinite(i[key])||Math.abs(i[key])>1)throw Error('无效驾驶输入');
  for(const [key,max]of [['heading',Math.PI],['elevation',1.2],['roll',1]])if(i[key]!==undefined&&(!Number.isFinite(i[key])||Math.abs(i[key])>max))throw Error('无效驾驶朝向');
  if(i.target!==undefined&&(!Number.isInteger(i.target)||!b.ships[i.target]||b.ships[i.target].side===s.side))throw Error('目标无效');
  control.seq=action.seq;control.lastTick=b.tick;control.input={throttle:clamp(i.throttle,0,1),yaw:i.yaw,pitch:i.pitch,roll:i.roll||0,...(i.heading!==undefined?{heading:i.heading}:{}),...(i.elevation!==undefined?{elevation:i.elevation}:{}),fire:i.fire===true,missile:i.missile===true,target:i.target??-1,lock:i.lock===true,boost:i.boost===true};
  emit(b,'input',{owner,shipId:s.id,inputSeq:action.seq,input:{...control.input}});
}
// Grid buckets are keyed in the horizontal battle plane. Vertical distance still participates in all hits.
function gridFor(b){const grids=[new Map(),new Map()],alive=[[],[]],bounds=[[Infinity,-Infinity,Infinity,-Infinity],[Infinity,-Infinity,Infinity,-Infinity]];for(const s of b.ships)if(s.hp>0){const side=s.side==='attacker'?0:1,x=Math.floor(s.x/300),z=Math.floor(s.z/300),key=`${x},${z}`,g=grids[side],box=bounds[side];box[0]=Math.min(box[0],x);box[1]=Math.max(box[1],x);box[2]=Math.min(box[2],z);box[3]=Math.max(box[3],z);if(!g.has(key))g.set(key,[]);g.get(key).push(s);alive[side].push(s);}return {grids,alive,bounds};}
function targetScore(s,t){const role=s.profile.role,other=t.profile.role,priority=role==='line'?(other==='line'?.65:other==='fighter'?1.8:1):role==='fighter'?(other==='fighter'?.7:1):role==='screen'?(other==='fighter'?.65:1):1;return distance(s,t)*priority*(s.type==='Bomber'&&t.profile.ground?.3:1)/(1+Math.log2(s.rapid[t.type]||1)*.15);}
function acquire(b,s,grid){
  const enemy=s.side==='attacker'?1:0,g=grid.grids[enemy],cx=Math.floor(s.x/300),cz=Math.floor(s.z/300);let best=null,score=Infinity,checked=0;
  const box=grid.bounds[enemy],firstRing=Math.max(0,box[0]-cx,cx-box[1],box[2]-cz,cz-box[3]);
  for(let ring=firstRing;ring<=4;ring++){
    for(let dx=-ring;dx<=ring;dx++)for(let dz=-ring;dz<=ring;dz++){
      if(ring&&Math.abs(dx)!==ring&&Math.abs(dz)!==ring)continue;
      if(cx+dx<box[0]||cx+dx>box[1]||cz+dz<box[2]||cz+dz>box[3])continue;
      const bucket=g.get(`${cx+dx},${cz+dz}`);if(!bucket)continue;
      // Deterministic rotating sample prevents dense thousand-ship cells becoming quadratic.
      const offset=(s.id+b.tick)%bucket.length;
      for(let j=0;j<Math.min(12,bucket.length);j++){const t=bucket[(offset+j)%bucket.length],d=targetScore(s,t);if(d<score){best=t;score=d;}checked++;}
    }
    if(best||checked>128)break;
  }
  if(!best){const enemies=grid.alive[enemy];for(let i=0;i<Math.min(12,enemies.length);i++){const t=enemies[(s.id*17+i*97)%enemies.length],d=targetScore(s,t);if(d<score){best=t;score=d;}}}
  return best?.id??-1;
}
function steer(s,yaw,pitch,dt){s.yaw+=clamp(angle(yaw-s.yaw),-s.profile.turn*dt,s.profile.turn*dt);s.yaw=angle(s.yaw);s.pitch+=clamp(pitch-s.pitch,-s.profile.turn*dt,s.profile.turn*dt);}
function hurt(b,s,damage,contact={}){
  if(s.hp<=0)return;
  const field=contact.bypassShield?{remaining:damage,absorbed:0,generators:[]}:absorbDefenseShield(b,s,damage);
  const absorbed=contact.bypassShield?0:Math.min(s.shield,field.remaining);
  s.shield-=absorbed;s.hp=Math.max(0,s.hp-field.remaining+absorbed);s.lastHit=b.tick;
  if(contact.projectileId!==undefined||b.ships.length<=128||s.hp<=0||(s.id+b.tick)%Math.max(1,Math.ceil(b.ships.length/80))===0)emit(b,s.hp>0?'hit':'destroy',{shipId:s.id,shield:absorbed+field.absorbed>0,...(field.absorbed?{defenseShield:field.absorbed,shieldGenerators:field.generators}:{}),x:s.x,y:s.y,z:s.z,...contact});
}
function detonateOrdnance(b,s,harmless=false){
  if(s.hp<=0)return;
  s.hp=0;s.shield=0;s.speed=0;emit(b,'destroy',{shipId:s.id,source:s.id,kind:'antimatter',x:s.x,y:s.y,z:s.z});
  const blast={source:s.id,side:s.side,x:s.x,y:s.y,z:s.z,tick:b.tick,radius:harmless?85:s.profile.blastRadius,damage:s.attack*commandMultiplier(b,s),harmless,hit:[]};
  (b.specialBlasts??=[]).push(blast);emit(b,'antimatter',{source:s.id,side:s.side,x:s.x,y:s.y,z:s.z,radius:blast.radius,harmless});
}
function moveOrdnance(b,s,t,dt,previous){
  if(!s.launch){
    if(!t||b.tick<(b.ordnanceReady?.[s.side]||0))return;
    (b.ordnanceReady??={})[s.side]=b.tick+160;
    s.launch={target:t.id,ready:b.tick+40};emit(b,'antimatter-charge',{shipId:s.id,target:t.id});
  }
  const locked=b.ships[s.launch.target];
  if(!locked||locked.hp<=0){
    // A cancelled lock while still armed on the launch line is not a detonation.
    if(!s.launch.fired){
      s.launch=t?.hp>0?{target:t.id,ready:b.tick+40}:null;
      if(s.launch)emit(b,'antimatter-charge',{shipId:s.id,target:t.id});
    }else detonateOrdnance(b,s,true);
    return;
  }
  t=locked;
  if(b.tick<s.launch.ready)return;
  if(!s.launch.fired){s.launch.fired=true;emit(b,'antimatter-launch',{shipId:s.id,target:t.id});}
  const from=[s.x,s.y,s.z],yaw=Math.atan2(t.x-s.x,t.z-s.z),pitch=Math.atan2(t.y-s.y,Math.hypot(t.x-s.x,t.z-s.z));
  steer(s,yaw,pitch,dt);s.speed=Math.min(s.profile.speed,s.speed+s.profile.speed*dt);
  s.x+=Math.sin(s.yaw)*Math.cos(s.pitch)*s.speed*dt;s.z+=Math.cos(s.yaw)*Math.cos(s.pitch)*s.speed*dt;s.y+=Math.sin(s.pitch)*s.speed*dt;
  if(projectileContact(from,[s.x,s.y,s.z],[t.x,t.y,t.z],t.profile.radius+s.profile.radius+8,previous[t.id])!==null)detonateOrdnance(b,s);
  else if(b.tick-s.launch.ready>400||Math.abs(s.x)>b.boundary||Math.abs(s.z)>b.boundary||Math.abs(s.y)>700)detonateOrdnance(b,s,true);
}
function advanceAntimatter(b){
  for(const blast of b.specialBlasts||[]){
    const age=(b.tick-blast.tick)*STEP_MS/1000;if(blast.harmless||age>1.5)continue;
    for(const s of b.ships){
      if(s.hp<=0||s.side===blast.side||blast.hit.includes(s.id))continue;
      const d=distance(blast,s),damage=antimatterDamage(d,blast.radius,s.type)*blast.damage/180;
      if(damage>0&&age>=.28+d/blast.radius*1.1){blast.hit.push(s.id);hurt(b,s,damage,{source:blast.source,kind:'antimatter',bypassShield:true});}
    }
  }
  if(b.specialBlasts)b.specialBlasts=b.specialBlasts.filter(blast=>(b.tick-blast.tick)*STEP_MS/1000<5.3);
}
export function battleMount(s,local=[0,0,0],direction=false){
  const yaw=s.profile?.ground?s.turretYaw??s.yaw:s.yaw,pitch=s.profile?.ground?s.turretPitch??0:s.pitch,pivot=s.profile?.ground&&!direction?s.profile.hardpoints?.pivot??3:0;
  const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch),[x,ly,lz]=[local[0],local[1]-pivot,local[2]],roll=s.roll||0,y=ly*Math.cos(roll)+lz*Math.sin(roll),z=lz*Math.cos(roll)-ly*Math.sin(roll);
  return [-x*sy*cp-y*sy*sp+z*cy,-x*sp+y*cp,-x*cy*cp-y*cy*sp-z*sy].map((v,i)=>v+(direction?0:[s.x,s.y+pivot,s.z][i]));
}
function launchRound(b,s,t,order){
  const {kind,secondary,barrel,damage,range,speed,missile}=order,h=s.profile.hardpoints;
  const local=(missile?h?.tubes:secondary?h?.secondary:h?.main)?.[barrel];
  const from=battleMount(s,local),flight=distance(s,t)/speed,aim=[t.x+Math.sin(t.yaw)*t.speed*flight*.7,t.y,t.z+Math.cos(t.yaw)*t.speed*flight*.7],id=b.nextProjectile++;
  const direction=missile?battleMount(s,h?.directions?.[barrel]||[-1,0,0],true):null;
  // Every missile is a real projectile. Spread damage across the equipped launchers.
  b.projectiles.push({id,source:s.id,target:t.id,side:s.side,kind,secondary,barrel,missile,damage,splashRadius:secondary?0:s.profile.splashRadius||0,splashFraction:secondary?0:s.profile.splashFraction||0,x:from[0],y:from[1],z:from[2],dx:aim[0],dy:aim[1],dz:aim[2],speed,ttl:range/speed+2,age:0,...(direction?{vx:direction[0]*38,vy:direction[1]*38,vz:direction[2]*38}:{})});
  if(b.controls[s.owner]?.shipId===s.id||(s.id+b.tick)%Math.max(1,Math.ceil(b.ships.length/180))===0)emit(b,'fire',{shipId:s.id,target:t.id,kind,secondary,barrel,from,to:aim,projectileId:id,speed,...(direction?{velocity:direction.map(v=>v*38)}:{})});
}
function fire(b,s,t,secondary=false){
  if(!secondary&&s.profile.defenseOnly)return false;
  const p=s.profile,auxMissile=secondary==='missile',turret=secondary===true,range=turret?Math.min(800,p.range):auxMissile?p.missileRange??Math.max(1100,p.range):p.range,d=distance(s,t);
  if(s.attack<=0||!weaponSolution(b.environment,s,t,secondary).ready)return false;
  const multiplier=Math.min(4,1+Math.log2(s.rapid[t.type]||1)*.35),period=turret?1.4:auxMissile?p.missileCooldown:p.cooldown/multiplier;
  const missileShare=p.missileShare??.18,secondaryShare=p.secondaryShare??.12,share=turret?secondaryShare:auxMissile?missileShare:1-(p.secondary?secondaryShare:0)-(p.secondaryMissile?missileShare:0);
  const damage=s.attack*commandMultiplier(b,s)*share*(turret?1.4:auxMissile?p.missileCooldown:p.cooldown)/6;
  if(turret)s.secondaryCooldown=period;else if(auxMissile)s.missileCooldown=period;else s.cooldown=period;
  const kind=turret?p.secondaryKind||'shell':auxMissile?'missile':p.kind,beam=turret?kind==='laser':!secondary&&p.beam;
  const speed=auxMissile?210:p.projectileSpeed,flight=d/speed;
  const aim=[t.x+Math.sin(t.yaw)*t.speed*flight*.7,t.y,t.z+Math.cos(t.yaw)*t.speed*flight*.7];
  const from=battleMount(s,p.hardpoints?.main?.[0]),center=[t.x,t.y,t.z],fraction=projectileContact(from,center,center,t.profile.radius+.4)??1;
  const point=from.map((v,i)=>v+(center[i]-v)*fraction);
  if(beam){if(b.controls[s.owner]?.shipId===s.id||(s.id+b.tick)%Math.max(1,Math.ceil(b.ships.length/180))===0)emit(b,'fire',{shipId:s.id,target:t.id,kind,secondary:!!secondary,from,to:point,speed});hurt(b,t,damage,{source:s.id,kind,x:point[0],y:point[1],z:point[2]});if(kind==='reaper')s.shield=Math.min(s.maxShield,s.shield+Math.min(damage*.08,s.maxShield*.08));return true;}
  const missile=auxMissile||!secondary&&p.missile,count=Math.max(1,missile?p.missileSalvo||1:turret?p.hardpoints?.secondary.length||1:p.hardpoints?.main.length||1);
  const ports=p.hardpoints?.tubes.length||count,rotate=missile&&count<ports;
  for(let i=0;i<count;i++){
    const barrel=rotate?((s.missileCursor||0)+i*Math.ceil(ports/count))%ports:i;
    const order={source:s.id,target:t.id,kind,secondary:!!secondary,barrel,damage:damage/count,range,speed,missile,tick:b.tick+i*(missile?3:1)};
    if(!i)launchRound(b,s,t,order);else (b.salvos??=[]).push(order);
  }
  if(rotate)s.missileCursor=((s.missileCursor||0)+1)%ports;
  return true;
}
export function stepSpatialBattle(b){
  if(b.status!=='active')return;
  if(b.version<SPATIAL_VERSION){emit(b,'rules-upgrade',{from:b.version,to:SPATIAL_VERSION});b.version=SPATIAL_VERSION;}
  const dt=STEP_MS/1000;b.tick++;
  const manual=new Map();
  // Old active saves acquire permanent stations at their existing lateral/vertical positions.
  for(const s of b.ships)if(!s.station)s.station={role:s.profile.role,spacing:Math.max(28,s.profile.length*4),depth:0,y:s.y,z:s.z};
  for(const [owner,c]of Object.entries(b.controls)){if(b.tick-c.lastTick>2000/STEP_MS||b.ships[c.shipId]?.hp<=0){delete b.controls[owner];emit(b,'release',{owner,reason:'timeout-or-destroyed'});}else manual.set(c.shipId,c.input);}
  const acquisitionGrid=gridFor(b);
  advanceCarriers(b,manual,s=>acquire(b,s,acquisitionGrid),emit);
  for(const s of b.ships)if(s.temporary&&s.bornTick===b.tick)keepAboveSurface(b,s);
  const previous=b.ships.map(s=>[s.x,s.y,s.z]),grid=gridFor(b);
  const fronts=fleetFronts(grid.alive.map(ships=>ships.filter(s=>!s.temporary)));
  const guards=b.ships.filter(s=>s.temporary&&s.hp>0&&b.ships[s.carrierId]?.carrier?.mode==='guard');
  for(const s of b.ships){
    if(s.hp<=0)continue;
    const p=s.profile,input=manual.get(s.id);
    s.cooldown=Math.max(0,s.cooldown-dt);s.secondaryCooldown=Math.max(0,s.secondaryCooldown-dt);s.pdCooldown=Math.max(0,s.pdCooldown-dt);s.missileCooldown=Math.max(0,(s.missileCooldown||0)-dt);
    if(!b.ships[s.target]||b.ships[s.target].hp<=0)s.target=acquire(b,s,grid);
    else if((b.tick+s.id)%20===0){const candidate=b.ships[acquire(b,s,grid)];if(candidate&&targetScore(s,candidate)<targetScore(s,b.ships[s.target])*.75)s.target=candidate.id;}
    if(input?.target>=0&&b.ships[input.target]?.hp>0)s.target=input.target;
    if(s.temporary){
      if(b.ships[s.carrierId]?.hp<=0){s.hp=0;s.shield=0;emit(b,'destroy',{shipId:s.id,x:s.x,y:s.y,z:s.z,kind:'swarm-expire'});continue;}
      s.target=swarmTarget(b,s,a=>acquire(b,a,grid));
    }else if(!input){
      const focused=commandedTarget(b,s);
      s.target=focused??guardDecoy(b,s,b.ships[s.target],guards);
    }
    const t=b.ships[s.target];
    if(p.special==='antimatter'){moveOrdnance(b,s,t,dt,previous);continue;}
    let desiredSpeed=0,droneGoal=null;
    if(input){
      const intent=input.lock&&t?{...input,heading:Math.atan2(t.x-s.x,t.z-s.z),elevation:Math.atan2(t.y-s.y,Math.hypot(t.x-s.x,t.z-s.z))}:input;
      steerPilot(s,intent,dt);desiredSpeed=input.throttle*p.speed*(input.boost?1.5:1);
    }else if(t||s.temporary){
      const d=t?distance(s,t):Infinity,goal=s.temporary?swarmGoal(b,s,t):formationGoal(s,t,fronts),close=t?Math.max(22,Math.min(60,(p.length+t.profile.length)*1.5,p.range*.2)):0;
      let tx=goal.x,ty=goal.y,tz=goal.z;
      if(b.environment&&!p.ground){
        if(s.side==='defender')tx=Math.max(300,tx);
        // Airborne targets must not feed their changing altitude back into each
        // other's goals. Keep the formation's anchored vertical lane.
        ty=Math.max(surfaceHeight(b.environment,tx,tz)+100,t?.profile.ground?t.y+100+clamp(s.station.y*.12,-60,60):goal.y);
        if(s.type==='Bomber'&&t.profile.ground){const run=planetBombingGoal(s,t);tx=run.x;tz=run.z;ty=Math.max(surfaceHeight(b.environment,tx,tz)+120,run.y);}
      }
      const skirmisher=!s.temporary&&(p.role==='fighter'||p.role==='screen');
      if(skirmisher&&!goal.assembling&&d<close&&!s.attackRun)s.attackRun={x:s.x+Math.sin(s.yaw)*p.range*.4,y:clamp(s.y+(s.id%2?1:-1)*45,-600,600),z:s.z+Math.cos(s.yaw)*p.range*.4,until:b.tick+60};
      if(s.attackRun&&(b.tick>s.attackRun.until||Math.hypot(s.attackRun.x-s.x,s.attackRun.y-s.y,s.attackRun.z-s.z)<p.speed*.25))s.attackRun=null;
      if(s.attackRun){tx=s.attackRun.x;ty=s.attackRun.y;tz=s.attackRun.z;}
      ty=clamp(ty,-600,600);
      const error=Math.hypot(tx-s.x,ty-s.y,tz-s.z),holding=!s.attackRun&&error<Math.max(3,s.station.spacing*.12);
      if(s.temporary)droneGoal={x:tx,y:ty,z:tz,error};
      const gunRun=p.role==='line'&&d<=p.range*.9&&!terrainBlocks(b.environment,[s.x,s.y,s.z],[t.x,t.y,t.z]);
      const aim=t&&(holding||gunRun||s.temporary&&d<p.range*.9)?[t.x,t.y,t.z]:[tx,ty,tz];
      // Turret ships hold a stable hull while their weapons track the enemy.
      const steady=(holding||gunRun)&&!p.fixed&&!skirmisher;
      const yaw=steady?s.yaw:Math.atan2(aim[0]-s.x,aim[2]-s.z),pitch=steady?0:clamp(Math.atan2(aim[1]-s.y,Math.hypot(aim[0]-s.x,aim[2]-s.z)),-1.2,1.2);
      steer(s,yaw,pitch,dt);
      s.roll=(s.roll||0)*Math.exp(-dt*2);
      desiredSpeed=holding?0:Math.min(p.speed,error*.7)*Math.max(0,Math.cos(angle(yaw-s.yaw)))*Math.max(0,Math.cos(pitch-s.pitch));
      if(gunRun){
        // Hold the firing line instead of turning the spinal guns away to readjust spacing.
        desiredSpeed=0;
      }

    }
    const handling=input?pilotHandling(p):{braking:1,acceleration:.7};
    s.speed+=clamp(desiredSpeed-s.speed,-p.speed*handling.braking*dt,p.speed*handling.acceleration*dt);
    if(droneGoal){
      // Unmanned fighters strafe toward their formation station while tracking a target.
      // A guard's guns must not pull its movement away from the carrier's screen.
      const fraction=Math.min(1,s.speed*dt/Math.max(.001,droneGoal.error));
      for(const axis of ['x','y','z'])s[axis]+=(droneGoal[axis]-s[axis])*fraction;
    }else{s.x+=Math.sin(s.yaw)*Math.cos(s.pitch)*s.speed*dt;s.z+=Math.cos(s.yaw)*Math.cos(s.pitch)*s.speed*dt;s.y+=Math.sin(s.pitch)*s.speed*dt;}
    keepAboveSurface(b,s);
    if(p.ground){
      s.pitch=0;s.yaw=s.side==='defender'?-Math.PI/2:Math.PI/2;s.roll=0;
      if(t){const yaw=Math.atan2(t.x-s.x,t.z-s.z),pitch=Math.atan2(t.y-s.y-3,Math.hypot(t.x-s.x,t.z-s.z));
        s.turretYaw=(s.turretYaw??s.yaw)+clamp(angle(yaw-(s.turretYaw??s.yaw)),-dt*1.2,dt*1.2);
        s.turretPitch=(s.turretPitch??0)+clamp(pitch-(s.turretPitch??0),-dt*.8,dt*.8);
      }
    }
    // Bounded local separation keeps nearby hulls from converging onto the same point.
    // This is independent of display grouping and remains deterministic on resume.
    if(p.speed>0){
      const allies=grid.grids[s.side==='attacker'?0:1].get(`${Math.floor(s.x/300)},${Math.floor(s.z/300)}`)||[];
      for(let i=0;i<Math.min(16,allies.length);i++){const other=allies[(s.id+b.tick+i)%allies.length];if(other.id===s.id||other.hp<=0)continue;const gap=(p.length+other.profile.length)*.65;
        if(Math.abs(s.y-other.y)>=gap)continue;
        const dx=s.x-other.x,dz=s.z-other.z;if(Math.abs(dx)>=gap||Math.abs(dz)>=gap)continue;
        const d=Math.hypot(dx,dz);
        if(d<gap){const push=Math.min(p.speed*dt*.3,(gap-d)*.15),sign=s.id<other.id?-1:1;s.x+=(d?dx/d:sign)*push;s.z+=(d?dz/d:0)*push;}
      }
    }
    const edge=b.boundary;if(!p.ground&&(Math.abs(s.x)>edge||Math.abs(s.z)>edge||Math.abs(s.y)>700)){s.x=clamp(s.x,-edge,edge);s.z=clamp(s.z,-edge,edge);s.y=clamp(s.y,-700,700);s.speed=0;steer(s,Math.atan2(-s.x,-s.z),0,dt);}
    if(t){
      if(s.cooldown<=0&&(!input||(!p.fixed&&!p.missile)||(p.missile?input.missile||input.fire:input.fire)))fire(b,s,t);
      if(p.secondary&&s.secondaryCooldown<=0)fire(b,s,t,true);
      if(p.secondaryMissile&&s.missileCooldown<=0&&(!input||input.missile))fire(b,s,t,'missile');
    }
  }
  b.salvos=(b.salvos||[]).filter(order=>{const s=b.ships[order.source],t=b.ships[order.target];if(s.hp<=0||t.hp<=0)return false;if(order.tick>b.tick)return true;launchRound(b,s,t,order);return false;});
  const remaining=[],collisionGrid=gridFor(b);
  const padding=b.ships.reduce((max,s)=>Math.max(max,s.profile.radius+.4+distance(s,{x:previous[s.id][0],y:previous[s.id][1],z:previous[s.id][2]})),0);
  for(const q of b.projectiles){
    const t=b.ships[q.target];q.ttl-=dt;if(q.ttl<=0||!t||t.hp<=0)continue;
    if(q.missile){q.dx=t.x;q.dy=t.y;q.dz=t.z;if(t.profile.pointDefense&&t.pdCooldown<=0&&distance(q,t)<140){t.pdCooldown=.7;if(random(b)<.55){emit(b,'intercept',{shipId:t.id,projectileId:q.id,source:q.source,kind:q.kind,from:battleMount(t,t.profile.hardpoints?.pd?.[q.id%Math.max(1,t.profile.hardpoints?.pd?.length||1)]),x:q.x,y:q.y,z:q.z});continue;}}}
    const dx=q.dx-q.x,dy=q.dy-q.y,dz=q.dz-q.z,len=Math.hypot(dx,dy,dz),move=Math.min(len,q.speed*dt);
    const ox=q.x,oy=q.y,oz=q.z;q.age=(q.age||0)+dt;
    if(q.missile&&q.vx!==undefined){
      // Eject from the actual tube, then ignite and bend toward the lock.
      const v=Math.min(q.speed,38+Math.max(0,q.age-.2)*180),blend=q.age<.2?0:1-Math.exp(-dt*4);
      q.vx+=(dx/(len||1)*v-q.vx)*blend;q.vy+=(dy/(len||1)*v-q.vy)*blend;q.vz+=(dz/(len||1)*v-q.vz)*blend;
      q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=q.vz*dt;
    }else if(len){q.x+=dx/len*move;q.y+=dy/len*move;q.z+=dz/len*move;}
    const from=[ox,oy,oz],to=[q.x,q.y,q.z],g=collisionGrid.grids[q.side==='attacker'?1:0];
    if(terrainBlocks(b.environment,from,to))continue;
    let victim=null,first=Infinity;
    for(let x=Math.floor((Math.min(ox,q.x)-padding)/300);x<=Math.floor((Math.max(ox,q.x)+padding)/300);x++)for(let z=Math.floor((Math.min(oz,q.z)-padding)/300);z<=Math.floor((Math.max(oz,q.z)+padding)/300);z++){
      for(const enemy of g.get(`${x},${z}`)||[]){
        if(enemy.hp<=0)continue;
        const hit=projectileContact(from,to,[enemy.x,enemy.y,enemy.z],enemy.profile.radius+.4,previous[enemy.id]);
        if(hit!==null&&(hit<first||hit===first&&enemy.id<victim.id)){first=hit;victim=enemy;}
      }
    }
    if(victim){
      const point=from.map((v,i)=>v+(to[i]-v)*first),contact={source:q.source,kind:q.kind,x:point[0],y:point[1],z:point[2]};
      hurt(b,victim,q.damage,{...contact,projectileId:q.id});
      const radius=q.splashRadius||0;
      if(radius>0&&q.splashFraction>0){
        emit(b,'blast',{...contact,radius});
        for(let x=Math.floor((point[0]-radius)/300);x<=Math.floor((point[0]+radius)/300);x++)for(let z=Math.floor((point[2]-radius)/300);z<=Math.floor((point[2]+radius)/300);z++)for(const enemy of g.get(`${x},${z}`)||[]){
          if(enemy.id===victim.id||enemy.hp<=0)continue;
          const d=Math.hypot(enemy.x-point[0],enemy.y-point[1],enemy.z-point[2]);
          if(d<radius)hurt(b,enemy,q.damage*q.splashFraction*(1-d/radius),{source:q.source,kind:q.kind,splash:true});
        }
      }
      continue;
    }
    if(len<=move&&!q.missile)continue;remaining.push(q);
  }
  b.projectiles=remaining;
  advanceAntimatter(b);
  retireSwarms(b,emit);
  const alive=[false,false];for(const s of b.ships)if(s.hp>0&&!s.temporary)alive[s.side==='attacker'?0:1]=true;
  if((!alive[0]||!alive[1])&&!b.specialBlasts?.length||b.tick*STEP_MS>=MAX_BATTLE_MS){b.status='finished';b.finishedAt=b.start+b.tick*STEP_MS;b.winner=alive[0]&&!alive[1]?'attacker':alive[1]&&!alive[0]?'defender':'draw';b.controls={};emit(b,'finish',{winner:b.winner});recordFrame(b);}
  else if(b.tick%40===0||b.swarmChangedTick===b.tick)recordFrame(b);
}
export function advanceSpatialBattle(b,to){const tick=Math.min(MAX_BATTLE_MS/STEP_MS,Math.floor((to-b.start)/STEP_MS));while(b.status==='active'&&b.tick<tick)stepSpatialBattle(b);return b;}
export function packedShips(b){return b.ships.map(s=>[s.id,Math.round(s.x*10)/10,Math.round(s.y*10)/10,Math.round(s.z*10)/10,Math.round(s.yaw*1000)/1000,Math.round(s.pitch*1000)/1000,Math.round(s.hp*100)/100,Math.round(s.shield*100)/100,s.target,Math.round(s.speed*10)/10,Math.round(s.cooldown*100)/100,Math.round((s.missileCooldown||0)*100)/100,Math.round((s.roll||0)*1000)/1000,...(s.profile.ground?[s.turretYaw??s.yaw,s.turretPitch??0]:[])]);}
export function recordFrame(b){const frame={tick:b.tick,ships:packedShips(b),carriers:carrierSnapshot(b)};if(b.frames.at(-1)?.tick===b.tick)b.frames[b.frames.length-1]=frame;else b.frames.push(frame);}
export function spatialMetadata(b){return b.ships.map(s=>({id:s.id,type:s.type,side:s.side,owner:s.owner,batch:s.batch,formation:s.formation,maxHp:s.maxHp,maxShield:s.maxShield,profile:s.profile,...(s.temporary?{temporary:true,carrierId:s.carrierId,bornTick:s.bornTick}:{}),...(s.fortressSlot?{fortressSlot:s.fortressSlot}:{})}));}
export function spatialSnapshot(b,{since=0,metadata=true,planet={}}={}){return {...battleSummary(b,planet),tick:b.tick,boundary:b.boundary,ships:packedShips(b),carriers:carrierSnapshot(b),...(metadata?{metadata:spatialMetadata(b)}:{}),projectiles:b.projectiles.filter((q,i)=>i%Math.max(1,Math.ceil(b.projectiles.length/600))===0),specialBlasts:(b.specialBlasts||[]).map(({source,x,y,z,tick,radius,harmless})=>({source,x,y,z,tick,radius,harmless})),controls:b.controls,eventSeq:b.eventSeq,events:b.events.slice(Math.max(0,b.events.length-2000)).filter(e=>e.seq>since&&e.tick>=b.tick-40&&e.type!=='input')};}
