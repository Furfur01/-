import {createMapFleetRenderer,missionVisual,cruiseView} from '../three-flight/map-renderer.js';
import {shipCabinClass} from '../../game/ship-cabins.mjs';
import {cabinPose} from '../../game/pilot-controls.mjs';
import {add,sub,mul,norm,cross,clamp,mix,lerp as vlerp,rotate,spin,copyCamera,battleScale as auroraBattleScale,battleAnchor as auroraBattleAnchor,battleRow} from './spatial.js';
export const shouldDrawMission=(level,pose,following)=>(following||level!=='galaxy')&&(pose.model>0||following);
export function trackCruiseCamera(n,position,distance){
 const follow=n.missionFollow;if(!follow)return;
 // First entry remains a camera flight. Subsequent route displacement is
 // applied to both views so normal interpolation does not lag behind warp.
 if(follow.lastCruisePosition)n.camera.center=add(n.camera.center,sub(position,follow.lastCruisePosition));
 follow.lastCruisePosition=position.slice();n.goal.center=position.slice();
 if(!follow.manual)n.goal.dist=distance;
}
export function createWorldCombat(world){
 const auroraNavigation=world.navigation,auroraBlackHole={position:[0,0,0]},auroraNavigationBody=id=>world.body(id),auroraNavigationToPlanet=(id,o)=>world.toPlanet(id,{...o,internal:true}),auroraNavigationEmit=(type,detail)=>world.emit(type,detail),auroraNavigationCopyCamera=copyCamera,auroraNavigationRotate=rotate,auroraNavigationSpin=p=>spin(p,auroraNavigation.time);
 let W=world.width,H=world.height,gameNowOffset=0,disposed=false,shared=null;
// Authoritative combat is drawn in the navigation context, beside the real target.
// World placement is cosmetic; ship positions, damage, shots and outcomes stay server-owned.
const auroraMapBattles=new Map();let auroraBattleEpoch=0;
const auroraFinishedBattles=new Map();
const missionDocks=new Map();
const AURORA_BATTLE_ORBIT_SCALE=1;
function auroraDock(p){
 const target=world.surface(p)?.buildingTarget('Shipyard'),normal=target?.normal||[.003019531,-.642857143,.765980141];
 const local=target?.station?target.station:mul(normal,p.radius*1.95);
 return {position:add(p.position,auroraNavigationRotate(local,auroraNavigationSpin(p))),normal:auroraNavigationRotate(normal,auroraNavigationSpin(p))};
}
function auroraMissionDock(m,p){
 // Once airborne, a leg keeps its own world-space frame across polling,
 // warp entry and re-entering follow. The actual shipyard continues rotating.
 let leg=missionDocks.get(m.id);
 if(!leg||leg.phase!==m.phase||leg.start!==m.start){leg={phase:m.phase,start:m.start,ports:new Map()};missionDocks.set(m.id,leg);}
 if(!leg.ports.has(p.key))leg.ports.set(p.key,auroraDock(p));
 return leg.ports.get(p.key);
}
function auroraBattleRow(b,id,sampleTime=auroraNavigation.sampleTime??performance.now()){return battleRow(b,id,sampleTime);}
function auroraBattleVessel(b,id){return b?.metadata?.find(m=>m.id===id);}
function auroraFleetExit(reason='escape'){
 const n=auroraNavigation;if(!n.missionFollow&&!n.combatCamera)return false;
 n.missionFollow=null;n.combatCamera=null;n.battleFocus=null;n.departureFocus=null;n.bridgeUp=null;n.pilotActive=false;n.warpTunnel=null;n.zoomTarget=null;n.surfaceFollow=null;
 Object.assign(n.goal,auroraNavigationCopyCamera(n.camera));n.goal.dist=Math.max(1,Math.min(3000,n.camera.dist*4));n.flight=true;
 auroraNavigationEmit('fleet-exit',{reason});return true;
}
function auroraMissionCanFollow(m){return !!m&&!(m.phase==='holding'&&['explore','mine'].includes(m.task))&&(!m.ships||Object.values(m.ships).some(n=>n>0));}
function auroraMapVessel(id,shipId,mode='follow'){
 const n=auroraNavigation,b=auroraMapBattles.get(id),row=auroraBattleRow(b,shipId);if(!b||(mode!=='free'&&(!row||row[6]<=0)))return false;
 if(n.battleFocus!==id)auroraBattleFocus(id);
 if(mode==='free'){
  // Stop tracking at the current eye, not at the next eased chase position.
  // A cabin's tiny look distance is unsuitable for orbit/keyboard movement.
  const camera=auroraNavigationCopyCamera(n.camera);
  if(n.combatCamera?.mode==='bridge'){
   const p=auroraNavigationBody(b.target),distance=Math.max(camera.dist,auroraBattleScale(p,b)*Math.max(80,(auroraBattleVessel(b,shipId)?.profile.length||10)*5));
   const forward=[-Math.sin(camera.yaw)*Math.cos(camera.pitch),-Math.sin(camera.pitch),-Math.cos(camera.yaw)*Math.cos(camera.pitch)];
   camera.center=add(camera.center,mul(forward,distance-camera.dist));camera.dist=distance;
  }
  n.camera=camera;n.goal=auroraNavigationCopyCamera(camera);n.bridgeUp=null;n.bridgeNear=null;n.pilotActive=false;n.zoomTarget=null;n.surfaceFollow=null;
 }
 n.combatCamera={...n.combatCamera,id,shipId,mode,entered:performance.now()};n.missionFollow=null;n.battleFocus=id;n.flight=true;return true;
}
function auroraUpdateCombatCamera(){
 const n=auroraNavigation,view=n.combatCamera;n.bridgeUp=null;n.bridgeNear=null;if(!view||view.mode==='free')return;
 const b=auroraMapBattles.get(view.id),p=b&&auroraNavigationBody(b.target);if(!b||!p){n.combatCamera=null;return;}
 let row=auroraBattleRow(b,view.shipId),meta=auroraBattleVessel(b,view.shipId);
 if(!row||row[6]<=0){meta=b.metadata.find(m=>m.owner===meta?.owner&&m.side===meta?.side&&b.ships.find(r=>r[0]===m.id)?.[6]>0);if(!meta){auroraFleetExit('destroyed');return;}view.shipId=meta.id;view.mode='follow';row=auroraBattleRow(b,meta.id);}
 const scale=auroraBattleScale(p,b),anchor=auroraBattleAnchor(p,b),pos=add(anchor,mul(row.slice(1,4),scale)),length=meta.profile.length,forward=[Math.sin(row[4])*Math.cos(row[5]),Math.sin(row[5]),Math.cos(row[4])*Math.cos(row[5])];
 if(view.mode==='bridge'&&!shipCabinClass(meta.type,meta.profile))view.mode='follow';
 if(view.mode==='bridge'){
  const kind=shipCabinClass(meta.type,meta.profile),pose=view.pose||cabinPose(kind),small=kind==='fighter',roll=small?row[12]||0:0;
  const right=norm(cross(forward,[0,1,0])),up=norm(cross(right,forward)),bankRight=add(mul(right,Math.cos(roll)),mul(up,-Math.sin(roll))),bankUp=add(mul(up,Math.cos(roll)),mul(right,Math.sin(roll)));
  const dir=norm(add(mul(forward,Math.cos(pose.yaw)*Math.cos(pose.pitch)),add(mul(bankRight,Math.sin(pose.yaw)*Math.cos(pose.pitch)),mul(bankUp,Math.sin(pose.pitch)))));
  const base=cabinPose(kind).eye,offset=pose.eye.map((v,i)=>v-base[i]);
  // Authored seat and hull share the same ship frame, including fighter banking.
  const seat=n.resources?.battles?.bridgeSeat?.(meta.type)||[0,length*.25,length*.2];
  const eye=add(pos,add(mul(bankUp,(seat[1]+offset[1])*scale),add(mul(bankRight,(seat[0]+offset[0])*scale),mul(forward,-(seat[2]+offset[2])*scale)))),distance=scale*2;
  n.bridgeNear=scale*.035;
  n.goal.center=add(eye,mul(dir,distance));n.goal.dist=distance;n.goal.yaw=Math.atan2(-dir[0],-dir[2]);n.goal.pitch=-Math.asin(dir[1]);n.bridgeUp=bankUp;

 }else if(meta.profile.ground){
  const module=b.environment?.fortress?.modules[meta.fortressSlot?.module];
  n.goal.center=module?add(anchor,mul([module.x,module.y+25,module.z],scale)):pos;
  n.goal.dist=500*scale*Math.max(1,H/W);n.goal.yaw=-.65;n.goal.pitch=.9;
 }else{
  const dir=forward;
  n.goal.center=add(pos,mul(dir,length*scale*1.6));n.goal.dist=Math.max(35,length*7)*scale*Math.max(1,H/W);n.goal.yaw=Math.atan2(-dir[0],-dir[2])+.65;n.goal.pitch=.72;
 }
}
function auroraBattleSet(id,data){
 if(!data){const b=auroraMapBattles.get(id);if(b?.ships){auroraFinishedBattles.set(id,{...b,finishedSeen:Date.now()});}auroraMapBattles.delete(id);return;}
 const old=auroraMapBattles.get(id),sameTick=old&&Number.isFinite(data.tick)&&data.tick===old.tick&&!!data.replay===!!old.replay;
 data={...data,environment:data.environment||old?.environment||{kind:'planet',radius:12000,center:[700,-12800,0],atmosphere:180}};
 auroraMapBattles.set(id,{...old,...data,previous:sameTick?old.previous:old?.ships||data.ships,metadata:data.metadata||old?.metadata||[],received:sameTick?old.received:performance.now(),epoch:old?.epoch||++auroraBattleEpoch,effects:[...(old?.effects||[]),...(data.events||[]).filter(e=>e.seq>(old?.eventSeq||0)).map(e=>({...e,received:performance.now()}))].slice(-700)});
 if(auroraNavigation.battleFocus===id&&!old?.ships&&auroraNavigation.combatCamera?.id!==id){const follow=auroraNavigation.missionFollow;auroraBattleFocus(id);auroraNavigation.missionFollow=follow;}
}
function auroraBattleFocus(id){
 const n=auroraNavigation,b=auroraMapBattles.get(id)||n.battles?.find(b=>b.id===id),p=b&&(auroraNavigationBody(b.target)||n.planets.find(p=>p.coordinates.join(':')===b.position?.join(':')));if(!p)return false;
 const mission=n.missions?.find(m=>m.battleId===id&&!m.inbound),follow=n.missionFollow|| (mission?{id:mission.id,key:'engaged:holding'}:null);auroraNavigationToPlanet(p.key,{orbit:true});n.battleFocus=id;if(n.missions?.some(m=>m.id===follow?.id&&m.battleId===id))n.missionFollow=follow;
 const extent=Math.max(p.radius*.15,Math.max(b.ships?.length?0:1800,...(b.ships||[]).filter(r=>r[6]>0).map(r=>Math.hypot(r[1],r[2],r[3])))*auroraBattleScale(p,b));
 n.goal.center=auroraBattleAnchor(p,b);n.goal.dist=Math.max(p.radius*.2,extent*1.4)*Math.max(1,H/W);n.goal.pitch=.32;n.goal.yaw=.35;
 const own=(b.metadata||[]).filter(m=>m.owner===n.playerId&&b.ships?.find(r=>r[0]===m.id)?.[6]>0),ship=own.find(m=>m.type==='Battleship')||own.find(m=>m.profile.piloted)||own[0]||(b.metadata||[]).find(m=>b.ships?.find(r=>r[0]===m.id)?.[6]>0);
 if(ship){n.combatCamera={id,shipId:ship.id,mode:'follow'};auroraUpdateCombatCamera();}return true;
}
function auroraMissionAnchor(p){return add(p.position,[p.radius*1.8,p.radius*.8,0]);}
function auroraMissionDistance(m){return Math.min(560,Math.max(220,160+Math.sqrt(Object.values(m.ships||{}).reduce((a,b)=>a+b,0))*26));}
function auroraMissionFocus(id){
 const n=auroraNavigation,m=n.missions?.find(m=>m.id===id);if(!auroraMissionCanFollow(m))return false;
 if(m.phase==='engaged'&&m.battleId){n.missionFollow={id,key:null};auroraBattleFocus(m.battleId);auroraNavigationEmit('combat-track',{battleId:m.battleId});return true;}
 const at=m.phase==='return'?m.position:m.fromPosition,p=n.planets.find(p=>p.coordinates.join(':')===at?.join(':')&&!p.moon)||auroraNavigationBody(m.from);if(!p)return false;
 auroraNavigationToPlanet(p.key,{orbit:true});const dock=auroraMissionDock(m,p);n.goal.center=dock.position;n.goal.dist=auroraBattleScale(p)*auroraMissionDistance(m)*Math.max(1,H/W);n.goal.pitch=Math.asin(dock.normal[1])+.15;n.goal.yaw=Math.atan2(dock.normal[0],dock.normal[2])+.5;n.departureFocus={id,planet:p.key,center:n.goal.center.slice()};n.missionFollow={id,key:null};return true;
}
function auroraFollowMission(visual,cruiseView){
 const n=auroraNavigation,follow=n.missionFollow;if(!follow||!visual)return;
 const m=n.missions?.find(m=>m.id===follow.id);if(!auroraMissionCanFollow(m)){auroraFleetExit(!m?'completed':m.phase==='holding'?m.task:'destroyed');return;}
 const pose=visual(m,Date.now()+gameNowOffset),key=m.phase+':'+pose.stage;
 if(follow.key===key)return;follow.key=key;follow.manual=false;delete follow.lastCruisePosition;
 const find=(coords,id)=>auroraNavigationBody(id)||n.planets.find(p=>p.coordinates.join(':')===coords?.join(':')&&!p.moon),home=find(m.fromPosition,m.from),target=find(m.position,m.target);
 if(m.phase==='engaged'&&m.battleId){auroraBattleFocus(m.battleId);n.missionFollow=follow;auroraNavigationEmit('combat-track',{battleId:m.battleId});return;}
 n.combatCamera=null;n.battleFocus=null;
 if(pose.stage==='cruise'){
  const a=home?.position,b=m.task==='explore'?auroraBlackHole.position:target?.position;if(!a||!b)return;
  const direction=norm(m.phase==='return'?sub(a,b):sub(b,a));
  n.combatCamera=null;n.battleFocus=null;n.departureFocus=null;n.zoomTarget=null;n.surfaceFollow=null;n.goal.center=vlerp(a,b,.5);n.goal.dist=(home?auroraBattleScale(home):.01)*auroraMissionDistance(m)*2;n.goal.pitch=cruiseView.pitch-Math.asin(direction[1]);n.goal.yaw=Math.atan2(-direction[0],-direction[2]);n.flight=true;return;
 }
 const arriving=pose.stage==='warp-out'||pose.stage==='holding',p=m.phase==='return'?(arriving?home:target):(arriving?target:home);if(!p)return;
 auroraNavigationToPlanet(p.key,{orbit:true});n.missionFollow=follow;n.departureFocus={id:m.id,planet:p.key};
 const dock=arriving?auroraDock(p):auroraMissionDock(m,p);n.goal.center=dock.position;n.goal.dist=auroraBattleScale(p)*auroraMissionDistance(m)*Math.max(1,H/W);n.goal.pitch=Math.asin(dock.normal[1])+.15;n.goal.yaw=Math.atan2(dock.normal[0],dock.normal[2])+.5;n.flight=true;
 if(pose.travel===0)n.departureFocus.launch={port:dock.position,normal:dock.normal,radius:auroraBattleScale(p)*170};
 const finished=m.phase==='return'&&pose.travel===0&&(auroraFinishedBattles.get(m.battleId)||auroraMapBattles.get(m.battleId));
 if(finished){const rows=finished.ships.filter(r=>r[6]>0&&auroraBattleVessel(finished,r[0])?.owner===n.playerId),row=rows.find(r=>auroraBattleVessel(finished,r[0])?.type==='Battleship')||rows[0];if(row){const pos=add(auroraBattleAnchor(p,finished),mul(row.slice(1,4),auroraBattleScale(p,finished))),normal=norm(sub(home.position,target.position));n.goal.center=pos;n.goal.dist=auroraBattleScale(p,finished)*500;n.goal.pitch=.22;n.goal.yaw=-.9;n.departureFocus.launch={port:pos,normal,radius:auroraBattleScale(p)*170};}}
 if(m.task==='attack'&&m.phase==='outbound'&&arriving){n.goal.center=add(auroraBattleAnchor(p),[-1050*auroraBattleScale(p),0,0]);n.goal.dist=auroraBattleScale(p)*500;n.goal.pitch=.72;n.goal.yaw=-.9;}
 n.departureFocus.center=n.goal.center.slice();
}

 const ready=createMapFleetRenderer(world.canvas,{renderer:world.three,scene:world.scene,camera:world.camera,managed:true,signal:world.abort.signal}).then(value=>{if(disposed)value.dispose();else shared=value;return value;});
 ready.catch(error=>{if(!disposed&&!world.disposed&&error?.name!=='AbortError')world.fail(error);});
 let stats={visible:[],markers:[],loaded:false,renderer:'shared-three-world'},poses=[];
 function endpoint(coords,id,m,arriving=false){const p=auroraNavigationBody(id)||auroraNavigation.planets.find(p=>p.coordinates.join(':')===coords?.join(':')&&!p.moon);if(p)return {...(arriving?auroraDock(p):auroraMissionDock(m,p)),radius:p.radius,planet:p};return null;}
 function missionPose(m){
  const pose=missionVisual(m,Date.now()+gameNowOffset),returning=m.phase==='return',arriving=pose.stage==='warp-out'||pose.stage==='holding';
  const home=endpoint(m.fromPosition,m.from,m,returning&&arriving),dest=m.task==='explore'?{position:[0,0,0],radius:200}:endpoint(m.position,m.target,m,!returning&&arriving);if(!home||!dest)return null;
  const recall=m.recalledElapsed==null?null:missionVisual({phase:'outbound',start:0,end:m.travel},m.recalledElapsed),returnOrigin=recall?{...dest,position:vlerp(home.position,dest.position,recall.travel)}:dest,a=returning?returnOrigin:home,b=returning?home:dest;
  const finished=returning&&pose.travel===0&&(auroraFinishedBattles.get(m.battleId)||auroraMapBattles.get(m.battleId)),dir=norm(sub(b.position,a.position)),scale=auroraBattleScale((pose.travel===0?a:b).planet||(pose.travel===0?a:b),finished),start=add(a.position,mul(dir,a.radius*1.5)),end=add(b.position,mul(dir,-b.radius*1.5));
  pose.battleApproach=!returning&&m.task==='attack'&&(pose.stage==='warp-out'||pose.stage==='holding');
  if(pose.battleApproach)pose.environment={kind:'planet',radius:12000,center:[700,-12400,0]};
  Object.assign(pose,{launch:pose.travel===0,docking:returning&&pose.stage==='warp-out',departureDirection:a.normal||dir,dockNormal:b.normal||dir});
  if(finished){pose.returnRows=finished.ships.filter(r=>r[6]>0&&auroraBattleVessel(finished,r[0])?.owner===auroraNavigation.playerId);pose.returnMetadata=finished.metadata;pose.departureDirection=dir;}
  const position=finished&&a.planet?auroraBattleAnchor(a.planet,finished):pose.battleApproach&&b.planet?auroraBattleAnchor(b.planet):pose.stage==='cruise'?vlerp(start,end,pose.travel):pose.travel===0?a.position:pose.docking?b.position:pose.stage==='holding'?b.position:add(end,mul(dir,b.radius*1.5*(pose.local||0)));
  return {m,pose,position,scale,dir,planet:b.planet};
 }
 function update(){
  W=world.width;H=world.height;gameNowOffset=world.nowOffset;
  const activeMissions=new Set((auroraNavigation.missions||[]).map(m=>m.id));for(const id of missionDocks.keys())if(!activeMissions.has(id))missionDocks.delete(id);
  auroraFollowMission(missionVisual,cruiseView);auroraUpdateCombatCamera();
  const n=auroraNavigation;poses=(n.missions||[]).filter(m=>m.phase!=='engaged').map(missionPose).filter(Boolean);
  const followed=poses.find(p=>p.m.id===n.missionFollow?.id);
  if(followed?.pose.stage==='cruise')trackCruiseCamera(n,followed.position,Math.max(2,followed.scale*auroraMissionDistance(followed.m)*2));
  for(const [id,b]of auroraFinishedBattles)if(Date.now()-b.finishedSeen>30000)auroraFinishedBattles.delete(id);
 }
 function draw(){
  const n=auroraNavigation;stats={visible:[],markers:[],loaded:!!shared,renderer:'shared-three-world'};n.flights=[];if(!shared)return;
  const forward=world.camera.getWorldDirection(world.scratch).toArray(),up=world.camera.up.toArray();
  shared.begin({eye:n.eye,center:n.camera.center,vp:n.vp,fov:world.camera.fov*Math.PI/180,forward,up,light:world.sun?norm(world.sun.position.toArray()):[-.55,.42,-.72],width:W,height:H,dpr:world.three.getPixelRatio(),time:n.time,dt:n.dt,sampleTime:n.sampleTime,mainCamera:world.camera});
  const records=new Map((n.battles||[]).map(b=>[b.id,b]));for(const [id,b]of auroraMapBattles)records.set(id,b);
  for(const b of records.values()){
   const p=world.body(b.target)||n.planets.find(p=>p.coordinates.join(':')===b.position?.join(':'));if(!p)continue;
   const marker=world.project(n.level==='galaxy'?n.systems.find(s=>s.id===p.coordinates[1])?.position||p.position:p.position,p.radius);
   if(marker.visible){const hit={id:b.id,type:'battle',...marker,radius:18,name:b.status==='finished'?'战斗结束':'正在交战',position:p.position};n.screen.push(hit);stats.markers.push(hit);}
   if(!b.ships||n.level==='galaxy'||p.coordinates[1]!==n.system[1])continue;
   const dock=auroraDock(p),view=shared.battle(b,auroraBattleAnchor(p,b),auroraBattleScale(p,b),n.playerId,{camera:n.combatCamera,dock:dock.position});
   for(const ship of view.ships){const hit=world.project(ship.position,.015);if(hit.visible)n.screen.push({id:ship.id,battleId:b.id,type:'vessel',...hit,radius:14,name:'舰船 #'+(ship.id+1),position:ship.position});}
   stats.visible.push({id:b.id,target:p.key,tick:b.tick,...view});b.effects=(b.effects||[]).filter(e=>n.sampleTime-e.received<6000);
  }
  for(const {m,pose,position,scale,dir}of poses){
   const following=n.missionFollow?.id===m.id,detail=shouldDrawMission(n.level,pose,following)?pose.stage==='cruise'&&following?shared.cruise(m,pose,position,scale,dir):shared.travel(m,pose,position,scale,dir):{models:0};
   const hit=world.project(position,.2);if(hit.visible)n.screen.push({id:m.id,type:'mission',...hit,radius:15,name:m.phase==='return'?'舰队返航':'舰队航行',position});
   for(const ship of detail.ships||[]){const q=world.project(ship.position,ship.radius);if(q.visible)n.screen.push({id:m.id,type:'mission',ship:ship.slot,...q,radius:Math.max(12,q.radius),name:'舰队',position:ship.position});}
   n.flights.push({id:m.id,count:m.count,progress:pose.progress,stage:pose.stage,returning:m.phase==='return',position,controllable:false,...detail});
  }
  shared.end();
 }
 const api={ready,update,draw,drawCabin:()=>shared?.drawCabin(),get stats(){return stats;},get records(){return auroraMapBattles;},get fleet(){return shared;},set:auroraBattleSet,focus:auroraBattleFocus,vessel:auroraMapVessel,mission:auroraMissionFocus,exit:auroraFleetExit,dock:auroraDock,
  bridgeSeat:type=>shared?.bridgeSeat(type),walkCabin:(...args)=>shared?.walkCabin(...args),pickBridgeConsole:(...args)=>shared?.pickBridgeConsole(...args),bridgeConsoleLayout:()=>shared?.bridgeConsoleLayout()||[],pickFighterConsole:(...args)=>shared?.pickFighterConsole(...args),fighterConsoleLayout:()=>shared?.fighterConsoleLayout()||[],
  dispose(){disposed=true;shared?.dispose();auroraMapBattles.clear();auroraFinishedBattles.clear();missionDocks.clear();}
 };
 return api;
}
