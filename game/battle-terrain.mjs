import {allocateFortressSlot,defenseModelScale} from './fortress-layout.mjs';
// Combat coordinates are shared by simulation, live views and replay.
export const PLANET_BATTLE_RADIUS=12000;
export function planetBattleEnvironment(planet={}){
 return {kind:'planet',radius:PLANET_BATTLE_RADIUS,center:[700,-12400,0],atmosphere:180,biome:planet.biome||'terrestrial',moon:!!planet.moon,...(planet.id?{planetId:planet.id}:{})};
}
// Legacy recordings retain every recorded coordinate and outcome. Their flight
// envelope is +/-700; place the local surface below it instead of using deep space.
export function battleViewEnvironment(environment,planet={}){
 if(environment?.kind==='planet')return !environment.planetId&&planet.id?{...environment,planetId:planet.id}:environment;
 return {...planetBattleEnvironment(planet),center:[700,-12800,0]};
}
export function arrivingBattlePosition(station,profile,environment=planetBattleEnvironment(),warp=0){
 const x=-1050-station.depth-warp*400,z=station.z;
 const y=Math.max(-560,Math.min(560,station.y-Math.min(60,profile.length*1.2+12)));
 return [x,Math.max(y,surfaceHeight(environment,x,z)+Math.max(20,profile.radius*1.2)),z];
}
export function surfaceHeight(environment,x,z){
 if(environment?.kind!=='planet')return -Infinity;
 const [cx,cy,cz]=environment.center,r=environment.radius;
 return cy+Math.sqrt(Math.max(0,r*r-(x-cx)**2-(z-cz)**2));
}
export function placePlanetUnit(b,s){
 if(!b.environment)return;
 if(s.profile.ground){
  const slot=allocateFortressSlot(b.environment,s.type);
  s.fortressSlot={module:slot.module,vertex:slot.vertex,...(slot.socket!==undefined?{socket:slot.socket,kind:slot.kind}:{})};
  if(b.environment.fortress.version>=2){
   const scale=defenseModelScale(s.type),h=s.profile.hardpoints;
   s.profile={...s.profile,modelScale:scale,length:s.profile.length*scale,radius:s.profile.radius*scale,hardpoints:{...h,pivot:(h?.pivot??3)*scale}};
   for(const key of ['main','tubes','secondary'])if(h?.[key])s.profile.hardpoints[key]=h[key].map(p=>p.map(v=>v*scale));
  }
  s.x=slot.x;s.z=slot.z;s.y=slot.y+s.profile.length*.4;
  s.station={...s.station,y:s.y,z:s.z};
  s.turretYaw=s.yaw;s.turretPitch=0;
 }else if(s.side==='defender'){
  s.x=650+s.station.depth*.35;s.y=-80+s.station.y*.35;s.station={...s.station,y:s.y};
 }
 keepAboveSurface(b,s);
}
export function keepAboveSurface(b,s){
 if(!b.environment||s.profile.ground)return;
 const floor=surfaceHeight(b.environment,s.x,s.z)+Math.max(20,s.profile.radius*1.2);
 if(s.y<floor){s.y=floor;if(s.pitch<0)s.pitch=0;}
}
export function terrainBlocks(environment,from,to){
 if(!environment)return false;
 const d=to.map((v,i)=>v-from[i]),o=from.map((v,i)=>v-environment.center[i]);
 const length=d.reduce((a,v)=>a+v*v,0),t=Math.max(0,Math.min(1,-o.reduce((a,v,i)=>a+v*d[i],0)/(length||1)));
 return o.reduce((a,v,i)=>a+(v+d[i]*t)**2,0)<(environment.radius-1)**2;
}
