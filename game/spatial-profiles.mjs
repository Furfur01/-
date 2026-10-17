// Local gameplay tuning, not recovered APK ballistics. Strategic speed stays unchanged.
import {shipWeaponLayouts,shipLengths} from './ship-weapon-mounts.mjs';
import hardpoints from './ship-flight-hardpoints.json' with {type:'json'};
import defenseHardpoints from './defense-hardpoints.json' with {type:'json'};
import {DEVOURER} from './devourer-command.mjs';
export const SPATIAL_VERSION=2, STEP_MS=50, MAX_BATTLE_MS=600000;
export function combatProfile(unit){
  const id=unit.id,layout=shipWeaponLayouts[id],defenseOnly=id==='Iron_Behemoth',fighter=/^(Light|Heavy)_Fighter$/.test(id)||id==='Titanenergetic_Frigate';
  const stationary=unit.type==='defense'||id==='Solar_Satellite';
  const role=defenseOnly?'support':id==='Annihilator'?'ordnance':stationary?'station':fighter?'fighter':id==='Bomber'?'artillery':id==='Cruiser'?'screen':unit.type==='civilian'?'support':'line';
  const settings={ordnance:[250,2.2,2200,8],fighter:[110,2.2,230,.8],screen:[62,1.1,450,1.8],line:[30,.45,720,3.5],artillery:[24,.4,1100,5],support:[35,.65,180,2],station:[0,1,850,3]}[role];
  const eliteSettings={Interceptor:[32,.5,1200,4.5],Devourer_Interceptor:[36,.6,1100,3],Titanenergetic_Frigate:[130,2.5,420,.65],Reaper:[32,.5,1450,4.2]}[id];
  if(eliteSettings)settings.splice(0,4,...eliteSettings);
  if(defenseOnly)settings.splice(0,4,16,.16,350,3.5);
  const kind=defenseOnly?'shell':layout?.kind||unit.weapons?.[0]?.kind||'shell';
  const missile=kind==='missile',beam=/laser|ion|beam/.test(kind)||kind==='reaper';
  // Gameplay tuning: elite projectile primaries have a small, shield-respecting blast.
  const elite=(shipLengths[id]||0)>=50;
  return {role,ground:unit.type==='defense',defenseOnly,carrier:defenseOnly?{...DEVOURER}:null,secondaryShare:defenseOnly?.16:.12,speed:settings[0],turn:settings[1],range:settings[2],cooldown:settings[3],kind,beam,missile,primaryName:layout?.primary||unit.weapons?.[0]?.name||'舰载主武器',
    projectileSpeed:missile?210:kind==='plasma'?320:540,fixed:!!layout?.muzzles?.length&&!['shell','ion'].includes(kind),
    radius:unit.type==='defense'?14:Math.max(.8,Math.min(defenseOnly?100:45,(shipLengths[id]||({Death_Star:90,Guardian:35}[id])||12)*.5)),length:unit.type==='defense'?32:shipLengths[id]||({Death_Star:90,Guardian:35}[id])||12,
    hardpoints:unit.type==='defense'?defenseHardpoints[id]||{main:[[-17,5,0]],tubes:[[-8,5,0]],directions:[[-1,0,0]],secondary:[]}:hardpoints[id],secondaryMissile:!missile&&!!hardpoints[id]?.tubes.length,missileCooldown:id==='Cruiser'?16:5,missileSalvo:id==='Cruiser'?2:defenseHardpoints[id]?.tubes.length||hardpoints[id]?.tubes.length||1,
    missileRange:defenseOnly?350:id==='Cruiser'?800:Math.max(1100,settings[2]),missileShare:defenseOnly?.04:id==='Cruiser'?.1:.18,
    special:id==='Annihilator'?'antimatter':id==='Reaper'?'reaper':null,blastRadius:id==='Annihilator'?680:0,
    splashRadius:elite&&kind==='nuclear'?70:elite&&kind==='heavy'?50:0,splashFraction:elite&&kind==='nuclear'?.3:elite&&kind==='heavy'?.22:0,
    pointDefense:!!layout?.pointDefense?.length,secondary:!!hardpoints[id]?.secondary.length,secondaryKind:['laser','plasma','heavy'].includes(kind)?kind:'shell',
    muzzles:layout?.muzzles||[],missiles:layout?.missiles||[],piloted:unit.type==='combat'&&id!=='Annihilator'};
}
