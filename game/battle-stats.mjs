import {combatProfile} from './spatial-profiles.mjs';
import {DEVOURER} from './devourer-command.mjs';

// Read the same frozen profile and damage shares used by the spatial simulator.
export function battleStats(unit,technology={}){
 const p=combatProfile(unit),hull=unit.strength*(1+(technology.Strength_Tech||0)*.1),shield=unit.shield*(1+(technology.Shielding_Tech||0)*.1),attack=unit.attack*(1+(technology.Weapons_Tech||0)*.1);
 const missileShare=p.missileShare??.18,secondaryShare=p.secondaryShare??.12,primaryShare=1-(p.secondary?secondaryShare:0)-(p.secondaryMissile?missileShare:0),primaryCount=Math.max(1,p.missile?p.missileSalvo:p.hardpoints?.main.length||p.muzzles.length);
 const special=p.special==='antimatter',weapon=(kind,count,range,cooldown,share,speed)=>({kind,count,range,cooldown,volley:attack*share*cooldown/6,perRound:attack*share*cooldown/6/count,dps:attack*share/6,speed});
 return {base:{hull:unit.strength,shield:unit.shield,attack:unit.attack},hull,shield,attack,dps:special?null:attack/6,
  defenseOnly:p.defenseOnly,primary:special||p.defenseOnly?null:weapon(p.kind,primaryCount,p.range,p.cooldown,primaryShare,p.beam?null:p.projectileSpeed),
  secondary:p.secondary?weapon(p.secondaryKind,Math.max(1,p.hardpoints?.secondary.length||1),Math.min(800,p.range),1.4,secondaryShare,p.secondaryKind==='laser'?null:p.projectileSpeed):null,
  missiles:p.secondaryMissile?weapon('missile',p.missileSalvo,p.missileRange??Math.max(1100,p.range),p.missileCooldown,missileShare,210):null,
  speed:p.speed,boostSpeed:p.speed*1.5,turnDegrees:p.turn*180/Math.PI,length:p.length,radius:p.radius,role:p.role,fixed:p.fixed,arcHalfDegrees:p.fixed?.16*180/Math.PI:null,
  pointDefense:p.pointDefense?{range:140,cooldown:.7,interceptChance:.55}:null,
  splash:p.splashRadius?{radius:p.splashRadius,fraction:p.splashFraction}:null,
  special:p.special,blast:special?{radius:p.blastRadius,peak:attack,arming:2,stagger:8,timeout:20,waveDelay:.28,waveTravel:1.1,falloff:.65}:null,
  reaper:p.special==='reaper'?{shieldReturn:.08,maxShieldPerShot:.08,antimatterImmune:true}:null,
  carrier:p.carrier?{...DEVOURER,swarmDps:attack*DEVOURER.swarmShare/6,fighterDps:attack*DEVOURER.swarmShare/6/DEVOURER.capacity,
    fighterHull:DEVOURER.hull*(1+(technology.Strength_Tech||0)*.1),fighterShield:0,buffedDps:attack/6*(1+DEVOURER.aura),temporary:true}:null,
  rapid:unit.rapid||{},economy:{cost:unit.cost,speed:unit.speed,cargo:unit.cargo,fuel:unit.fuel,requirements:unit.req||[]}};
}
