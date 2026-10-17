import {terrainBlocks} from './battle-terrain.mjs';
const angle=a=>Math.atan2(Math.sin(a),Math.cos(a));

// Shared by authoritative firing and the pilot HUD. No minimum range exists.
export function weaponSolution(environment,s,t,secondary=false){
 const p=s.profile,missile=secondary==='missile',turret=secondary===true;
 const range=turret?Math.min(800,p.range):missile?p.missileRange??Math.max(1100,p.range):p.range;
 const distance=t?Math.hypot(s.x-t.x,s.y-t.y,s.z-t.z):null;
 const result=reason=>({range,distance,reason,ready:reason==='ready'});
 if(!secondary&&p.defenseOnly||missile&&!p.secondaryMissile)return result('unavailable');
 if(!t||t.hp<=0)return result('target');
 if(distance>range)return result('range');
 if(terrainBlocks(environment,[s.x,s.y,s.z],[t.x,t.y,t.z]))return result('terrain');
 const yaw=Math.atan2(t.x-s.x,t.z-s.z),pitch=Math.atan2(t.y-s.y,Math.hypot(t.x-s.x,t.z-s.z));
 if(p.ground&&(Math.abs(angle(yaw-(s.turretYaw??s.yaw)))>.18||Math.abs(pitch-(s.turretPitch??0))>.18))return result('aim');
 if(!secondary&&p.fixed&&(Math.abs(angle(yaw-s.yaw))>.16||Math.abs(pitch-s.pitch)>.16))return result('aim');
 return result('ready');
}
export function pilotWeaponStatus(environment,meta,row,target,missile=false){
 if(!meta||!row)return {reason:'target',ready:false,range:0,distance:null,cooldown:0};
 const ship=r=>({x:r[1],y:r[2],z:r[3],yaw:r[4],pitch:r[5],hp:r[6],turretYaw:r[13],turretPitch:r[14],profile:meta.profile});
 const p=meta.profile,primaryMissile=missile&&p.missile;
 const result=weaponSolution(environment,ship(row),target?ship(target):null,missile&&!primaryMissile?'missile':false);
 const cooldown=row[missile&&!primaryMissile?11:10]||0;
 if(result.ready&&cooldown>0){result.reason='cooldown';result.ready=false;}
 return {...result,cooldown};
}
