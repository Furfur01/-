import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createWorldEnvironment} from './environment.js';
import {createPlanetSurface,createPlanetPrewarm} from './planet-surface.js';
import {qualityName} from './planet-profile.js';
import {AURORA_WORLD_VERSION} from './aurora-world-surface.js';
import {createWorldCombat} from './combat.js';
import {ShipModelCache} from '../three-flight/shared-models.js';
import {WORLD_SCALE,add,sub,mul,length,norm,dot,cross,clamp,mix,lerp,copyCamera,starRadius,bodyRecords,rotate,spin} from './spatial.js';

// Authored hulls use +Y up and -Z forward, independently of the port's latitude.
const SHIP_PREVIEW_OFFSET=mul(norm([-1,.8,-1.2]),3);

export class WorldRuntime {
 constructor(host,{onNavigation,onBuilding,onDismiss}={}){
  Object.assign(this,{host,onNavigation,onBuilding,onDismiss,ready:false,prepared:false,active:true,nowOffset:0,disposed:false,width:1,height:1,frameCount:0});
  this.abort=new AbortController();this.surfaces=new Map();this.owned=new Map();this.cleanups=[];this.frameListeners=new Set();this.scratch=new THREE.Vector3();this.raycaster=new THREE.Raycaster();this.matrix=new THREE.Matrix4();
  this.planetQuality='standard';try{this.planetQuality=qualityName(localStorage.getItem('empire.planetQuality'));}catch{}
  const initial={center:[90000,0,54000],dist:10170000,yaw:0,pitch:1.3};
  this.navigation={enabled:false,level:'galaxy',system:[1,16],systems:[],planets:[],bodies:new Map(),missions:[],battles:[],camera:copyCamera(initial),goal:copyCamera(initial),time:0,dt:0,screen:[],flights:[],frames:0,frameTimes:[],details:new Map(),resources:{},zoomTarget:null,selectedPlanetId:null};
  this.canvas=document.createElement('canvas');this.canvas.className='universe-canvas';this.canvas.id='universe-world';this.canvas.tabIndex=0;this.canvas.setAttribute('aria-label','银河连续三维空间');host.append(this.canvas);
  this.three=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,alpha:false,logarithmicDepthBuffer:true,powerPreference:'high-performance'});
  this.three.autoClear=false;this.three.info.autoReset=false;this.three.outputColorSpace=THREE.SRGBColorSpace;this.three.toneMapping=THREE.ACESFilmicToneMapping;this.three.toneMappingExposure=.92;
  this.scene=new THREE.Scene();this.scene.name='persistent-universe';this.camera=new THREE.PerspectiveCamera(55,1,.0001,5000000);
  this.ambient=new THREE.AmbientLight(0x8baac4,.3);this.planetFill=new THREE.HemisphereLight(14478837,4612720,1);this.sun=new THREE.DirectionalLight(0xffe6c0,2);this.scene.add(this.ambient,this.planetFill,this.sun,this.sun.target);
  this.labels=document.createElement('div');this.labels.className='universe-labels';host.append(this.labels);this.labelPool=[];
  this.errorElement=document.createElement('div');this.errorElement.className='universe-error';this.errorElement.hidden=true;host.append(this.errorElement);
  this.loadingElement=document.createElement('div');this.loadingElement.className='universe-loading';this.loadingElement.setAttribute('role','status');this.loadingElement.textContent='正在准备星际空间…';host.append(this.loadingElement);
  this.environment=createWorldEnvironment({scene:this.scene,camera:this.camera,onError:e=>this.fail(e)});
  this.planetPrewarm=createPlanetPrewarm();
  this.combat=createWorldCombat(this);this.navigation.resources.battles=this.combat;
  this.previewCache=new ShipModelCache();this.previewRoot=new THREE.Group();this.previewRoot.name='shipyard-inspection';this.scene.add(this.previewRoot);
  this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();this.bindInput();this.ready=true;
  this.tick=t=>{if(this.disposed)return;this.raf=requestAnimationFrame(this.tick);if(!this.active||document.hidden){this.last=t;return;}try{this.render(t);}catch(e){this.fail(e);}};this.raf=requestAnimationFrame(this.tick);
 }
 async prepareWorld(){
  // Compile the actual material variants while the DOM remains interactive.
  // The detached groups are resource keepers, never extra scenes or viewports.
  const start=performance.now();
  await this.environment.ready;if(this.disposed)return;
  await Promise.all([this.three.compileAsync(this.environment.prewarmRoot,this.camera,this.scene),this.three.compileAsync(this.planetPrewarm.root,this.camera,this.scene)]);
  if(!this.disposed){this.prepared=true;this.preparedInMs=performance.now()-start;this.loadingElement.remove();}
 }
 fail(error){const message=error?.message||String(error);if(this.errorElement.textContent!==message)console.error(error);this.errorElement.textContent=message;this.errorElement.hidden=false;}
 addFrameListener(callback){this.frameListeners.add(callback);return()=>this.frameListeners.delete(callback);}
 resize(){const rect=this.host.getBoundingClientRect();this.width=Math.max(1,rect.width||innerWidth);this.height=Math.max(1,rect.height||innerHeight);this.three.setPixelRatio(Math.min(devicePixelRatio||1,1.6));this.three.setSize(this.width,this.height,false);this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();if(this.navigation.surfaceFollow?.id==='Missile_Silo'&&this.selectedBuilding==='Missile_Silo')this.selectBuilding('Missile_Silo');}
 emit(type,detail={}){const n=this.navigation;this.onNavigation?.({type,level:n.level,system:n.system.slice(),planetId:n.selectedPlanetId,...detail});}
 body(id){return this.navigation.bodies.get(id)||this.navigation.planets.find(p=>p.id===id);}
 applyPlanet(planet,catalog,now=Date.now()){this.planet=planet;this.catalog=catalog;this.nowOffset=now-Date.now();}
 setNavigationState(value){
  const n=this.navigation,first=!n.enabled;
  this.owned=new Map((value.ownedPlanets||[]).map(p=>[p.id,p]));Object.assign(n,{playerId:value.playerId,homePlanetId:value.homePlanetId,activePlanetId:value.activePlanetId,missions:value.missions||[],battles:value.battles||[],logistics:value.logistics||[]});
  n.systems=(value.systems||[]).map(s=>({...s,position:mul(s.position,WORLD_SCALE),radius:starRadius(s.id)}));
  n.planets=bodyRecords(value.planets||[],n.systems);n.bodies=new Map(n.planets.flatMap(p=>[[p.key,p],...(p.id?[[p.id,p]]:[])]));n.enabled=!!n.systems.length;
  this.environment.setState({...value,gameNowOffset:this.nowOffset,systems:n.systems,planets:n.planets});
  if(n.enabled&&!this.preparation)this.preparation=this.prepareWorld().catch(error=>{if(!this.disposed){this.loadingElement.remove();this.fail(error);}});
  if(first&&n.enabled){const p=this.body(n.homePlanetId)||this.body(n.activePlanetId);if(p){n.system=p.coordinates.slice(0,2);n.selectedPlanetId=p.key;}this.toGalaxy();this.settle();}
 }
 surface(p){
  if(!p||p.npc||p.kind==='belt')return null;
  let entry=this.surfaces.get(p.key);
  const capital=!p.moon&&this.owned.has(p.id),signature=`${AURORA_WORLD_VERSION}/${p.biome}/${p.radius}/${!!p.moon}`;
  if(entry&&entry.signature!==signature){this.scene.remove(entry.object.root);entry.object.dispose();this.surfaces.delete(p.key);entry=null;}
  if(!entry){const object=createPlanetSurface(p,{catalog:this.catalog,workerURL:'/opendesign/mockups/galactic-command/terrain-worker.js',quality:this.planetQuality,capital});this.scene.add(object.root);entry={object,used:this.frameCount,body:p,signature};this.surfaces.set(p.key,entry);}
  entry.used=this.frameCount;entry.body=p;return entry.object;
 }
 setPlanetQuality(value){this.planetQuality=qualityName(value);for(const entry of this.surfaces.values())entry.object.setQuality(this.planetQuality);try{localStorage.setItem('empire.planetQuality',this.planetQuality);}catch{}return this.planetQuality;}
 interrupt(){const n=this.navigation;n.goal=copyCamera(n.camera);this.buildingFlight=null;n.flight=false;}
 clearFollow({notify=true}={}){const n=this.navigation,hadFleet=!!(n.combatCamera||n.missionFollow||n.pilotActive);n.pilotActive=false;n.battleFocus=null;n.combatCamera=null;n.departureFocus=null;n.missionFollow=null;n.surfaceFollow=null;n.bridgeUp=null;n.bridgeNear=null;this.buildingFlight=null;if(hadFleet&&notify)this.emit("fleet-exit",{reason:"navigation"});}
 toGalaxy(){const n=this.navigation;this.clearFollow();n.zoomTarget=null;n.goal={center:[90000,0,54000],dist:10170000*Math.max(1,1.08*this.height/this.width),yaw:0,pitch:1.3};n.flight=true;this.emit('system');}
 focusSystem(id){const n=this.navigation,s=n.systems.find(s=>s.id===Number(id));if(!s)return false;this.clearFollow();n.system=[1,s.id];n.zoomTarget={type:'system',id:s.id};n.goal={center:s.position.slice(),dist:44000*Math.max(1,this.height/this.width),pitch:.51,yaw:0};n.flight=true;this.emit('system');return true;}
 selectNavigationSystem(id){const n=this.navigation,s=n.systems.find(s=>s.id===Number(id));if(!s)return false;this.clearFollow();n.system=[1,s.id];n.zoomTarget={type:'system',id:s.id};n.goal.center=s.position.slice();n.flight=true;this.emit('system');return true;}
 toSystem(){return this.focusSystem(this.navigation.system[1]);}
 selectNavigationPlanet(id,{focus=false,internal=false}={}){const n=this.navigation,p=this.body(id);if(!p)return false;this.clearFollow({notify:!internal});n.selectedPlanetId=p.key;n.system=p.coordinates.slice(0,2);n.zoomTarget={type:'planet',id:p.key};if(focus){n.goal.center=p.position.slice();n.flight=true;}this.emit('select',{target:{...p,position:p.coordinates},internal});return true;}
 toPlanet(id=this.navigation.selectedPlanetId,{orbit=false,internal=false}={}){const n=this.navigation,p=this.body(id);if(!p||p.kind==='belt')return false;const departure=this.planetFlightStart(p),surfaceDeparture=n.surfaceFollow?.body===p.key;this.selectNavigationPlanet(id,{internal});n.goal={center:p.position.slice(),dist:p.radius*(orbit?5.6:2.25)*Math.max(1,this.height/this.width),pitch:.24,yaw:.18};if(surfaceDeparture||departure.startRadius<p.radius*1.35)this.buildingFlight={...departure,orbitGoal:copyCamera(n.goal)};n.flight=true;return true;}
 locateColony(id=this.navigation.homePlanetId){const p=this.body(id);if(!p)return false;this.navigation.selectedPlanetId=p.key;return this.focusSystem(p.coordinates[1]);}
 fitColonies(){const n=this.navigation,ids=new Set([...this.owned.values()].map(p=>p.position[1])),stars=n.systems.filter(s=>ids.has(s.id));if(!stars.length)return false;this.clearFollow();const min=[0,1,2].map(i=>Math.min(...stars.map(s=>s.position[i]))),max=[0,1,2].map(i=>Math.max(...stars.map(s=>s.position[i])));n.goal={center:lerp(min,max,.5),dist:Math.max(44000,length(sub(max,min))*1.35)*Math.max(1,this.height/this.width),pitch:1.25,yaw:0};n.zoomTarget=null;n.flight=true;return true;}
 toBlackHole(){this.clearFollow();const n=this.navigation;n.zoomTarget={type:'blackHole',id:'gargantua'};n.goal={center:[0,0,0],dist:4500,pitch:.3,yaw:.2};n.flight=true;}
 focusLogistics(key){const item=this.environment.pickTargets?.find(p=>p.type==='logistics'&&p.id===key);if(!item)return false;this.clearFollow();const n=this.navigation;n.system=[1,item.system];n.zoomTarget={type:'logistics',id:key};n.goal={center:item.position.slice(),dist:item.radius*6*Math.max(1,this.height/this.width),pitch:.58,yaw:.28};n.flight=true;return true;}
 planetFlightStart(p){const n=this.navigation,eye=n.eye||add(n.camera.center,this.eyeOffset(n.camera));return {body:p.key,elapsed:0,duration:2.8,start:norm(sub(eye,p.position)),startRadius:length(sub(eye,p.position)),startTarget:sub(n.camera.center,p.position),startUp:this.camera.up.toArray(),startTime:n.time,rotatingStart:n.surfaceFollow?.body===p.key};}
 selectBuilding(id){
  const n=this.navigation,p=this.body(n.activePlanetId);if(!p)return false;const departure=this.planetFlightStart(p);this.clearFollow();n.selectedPlanetId=p.key;n.system=p.coordinates.slice(0,2);n.zoomTarget={type:'planet',id:p.key};
  const target=this.surface(p)?.buildingTarget(id);if(!target)return false;
  // One smooth start-to-destination transition; no ascent or orbital waypoints.
  this.buildingFlight={...departure,id,direct:true,duration:.65};
  n.surfaceFollow={body:p.key,id,spin:spin(p,n.time)};this.selectedBuilding=id;n.flight=true;this.emit('select',{target:{...p,position:p.coordinates},buildingId:id});return true;
 }
 focusElevator(view='full'){this.selectBuilding('Shipyard');if(this.buildingFlight){this.buildingFlight.station=view==='station';this.buildingFlight.shipyard=view==='shipyard';this.buildingFlight.elevatorOverview=view==='full';}}
 focusConstruction(facility='Shipyard'){this.hideShip();this.selectBuilding(facility);if(this.buildingFlight)this.buildingFlight.construction=true;}
 setViewport(sidebar){this.sidebar=!!sidebar;}
 setActive(active){this.active=active;}
 eyeOffset(c){return [Math.sin(c.yaw)*Math.cos(c.pitch)*c.dist,Math.sin(c.pitch)*c.dist,Math.cos(c.yaw)*Math.cos(c.pitch)*c.dist];}
 setViewFromEye(eye,target){const offset=sub(eye,target),dist=Math.max(.0001,length(offset));return {center:target.slice(),dist,yaw:Math.atan2(offset[0],offset[2]),pitch:Math.asin(clamp(offset[1]/dist,-1,1))};}
 supportFrameRect(){
  const element=this.supportFrame;if(!element?.isConnected||this.navigation.surfaceFollow?.id!=='Missile_Silo')return null;
  const rect=element.getBoundingClientRect(),host=this.host.getBoundingClientRect(),clip=element.getRootNode().querySelector?.('.ui-body')?.getBoundingClientRect()||host;
  const left=Math.max(rect.left,host.left,clip.left),right=Math.min(rect.right,host.right,clip.right),top=Math.max(rect.top,host.top,clip.top),bottom=Math.min(rect.bottom,host.bottom,clip.bottom);
  if(right-left<40||bottom-top<40)return null;
  return {x:(left+right)/2-host.left,y:(top+bottom)/2-host.top,width:right-left,height:bottom-top};
 }
 updateCamera(dt){
  const n=this.navigation;this.combat.update();let flightUp=null;const supportFrame=this.supportFrameRect();
  // Fleet views own the camera immediately, including entry from a rotating
  // facility. A pending surface ascent must never overwrite the hull seat.
  if(n.missionFollow||n.combatCamera){this.buildingFlight=null;n.surfaceFollow=null;}
  if(this.buildingFlight){
   const f=this.buildingFlight,p=this.body(f.body),t=f.orbitGoal?null:this.surface(p)?.buildingTarget(f.id);if(!p||(!f.orbitGoal&&!t)){this.buildingFlight=null;return;}
   f.elapsed+=dt;const progress=clamp(f.elapsed/f.duration,0,1),a=spin(p,n.time),rotation=f.rotatingStart?a-spin(p,f.startTime):0,start=rotate(f.start,rotation),startTarget=add(p.position,rotate(f.startTarget,rotation)),safeRadius=p.radius*1.35,ease=k=>k*k*(3-2*k);
   let position,normal,endEye;if(f.orbitGoal){position=p.position;endEye=add(position,this.eyeOffset(f.orbitGoal));normal=norm(sub(endEye,position));}else{const defenseNarrow=f.id==='Missile_Silo'&&t.defenseDisplay&&!supportFrame&&this.width<=650;let local=f.construction&&t.construction?t.construction:f.preview&&t.preview?t.preview:f.shipyard&&t.shipyard?t.shipyard:f.station&&t.station?t.station:f.elevatorOverview&&t.overview?t.overview:t.position;if((defenseNarrow||supportFrame)&&t.defenseDisplay)local=lerp(local,t.defenseDisplay.position,.2);position=add(p.position,rotate(local,a));normal=f.preview?[0,1,0]:norm(rotate(t.normal,a));const tangent=norm(cross(Math.abs(normal[1])>.98?[0,0,1]:[0,1,0],normal)),radius=f.construction?t.constructionRadius||t.radius:f.shipyard?t.shipyardRadius||t.radius:f.station?t.stationRadius||t.radius:f.elevatorOverview?t.overviewRadius||t.radius:t.radius,distance=f.preview?3:Math.max(.7,radius*(f.construction?4.4:4.2)*(defenseNarrow?Math.max(1,this.height/this.width):1)),cameraOffset=f.preview?SHIP_PREVIEW_OFFSET:f.construction&&t.constructionCameraOffset?t.constructionCameraOffset:f.elevatorOverview&&t.overviewCameraOffset?t.overviewCameraOffset:t.cameraOffset;endEye=add(position,cameraOffset?mul(norm(rotate(cameraOffset,a)),distance):add(mul(normal,distance*.7),mul(tangent,distance*.7)));}
   let eye,target;
   const ascent=f.startRadius<safeRadius?.25:0,turnEnd=f.direct?0:ascent?.6:.55;
   if(f.direct){const s=ease(progress);eye=lerp(add(p.position,mul(start,f.startRadius)),endEye,s);target=lerp(startTarget,position,s);}
   else if(f.localTransfer&&!f.orbitGoal){const s=ease(progress),startEye=add(p.position,mul(start,f.startRadius));eye=lerp(startEye,endEye,s);eye=add(eye,mul(normal,Math.sin(Math.PI*s)*Math.max(p.radius*.012,length(sub(startEye,endEye))*.22)));target=lerp(startTarget,position,s);}
   else if(ascent&&progress<ascent){const s=ease(progress/ascent);eye=add(p.position,mul(start,mix(f.startRadius,safeRadius,s)));target=lerp(startTarget,p.position,s);}
   else if(progress<turnEnd){const s=ease((progress-ascent)/(turnEnd-ascent)),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(...start),new THREE.Vector3(...normal));q.slerp(new THREE.Quaternion(),1-s);const dir=new THREE.Vector3(...start).applyQuaternion(q).toArray();eye=add(p.position,mul(dir,mix(ascent?safeRadius:f.startRadius,safeRadius,s)));target=ascent?p.position:lerp(startTarget,p.position,s);}
   else{const s=ease((progress-turnEnd)/(1-turnEnd));eye=lerp(add(p.position,mul(normal,safeRadius)),endEye,s);target=lerp(p.position,position,s);}
   // Transport screen-up between adjacent frames, including the poles. During
   // descent roll toward the final view, whose up is never radial/degenerate.
   const previousForward=new THREE.Vector3(...(f.forward||sub(f.startTarget,mul(f.start,f.startRadius)))).normalize(),forward=new THREE.Vector3(...sub(target,eye)).normalize(),up=new THREE.Vector3(...(f.up||f.startUp));up.addScaledVector(previousForward,-up.dot(previousForward)).normalize();
   if(up.lengthSq()<.001)up.set(Math.abs(previousForward.y)<.9?0:1,Math.abs(previousForward.y)<.9?1:0,0).addScaledVector(previousForward,-(Math.abs(previousForward.y)<.9?previousForward.y:previousForward.x)).normalize();
   up.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(previousForward,forward));
   if(progress>=turnEnd){const endForward=new THREE.Vector3(...sub(position,endEye)).normalize(),desired=new THREE.Vector3(...(f.orbitGoal?[0,1,0]:normal));desired.addScaledVector(endForward,-desired.dot(endForward)).normalize().applyQuaternion(new THREE.Quaternion().setFromUnitVectors(endForward,forward));const blend=ease((progress-turnEnd)/(1-turnEnd)),weight=clamp((blend-(f.rollBlend||0))/Math.max(1e-9,1-(f.rollBlend||0)),0,1),roll=Math.atan2(forward.dot(new THREE.Vector3().crossVectors(up,desired)),up.dot(desired));up.applyAxisAngle(forward,roll*weight);f.rollBlend=blend;}
   f.forward=forward.toArray();f.up=flightUp=up.toArray();
   n.camera=this.setViewFromEye(eye,target);n.goal=copyCamera(n.camera);if(n.surfaceFollow)n.surfaceFollow.spin=a;
   if(progress===1){this.buildingFlight=null;n.flight=false;}
  }else{
   if(n.surfaceFollow){const p=this.body(n.surfaceFollow.body);if(p){const a=spin(p,n.time),delta=a-n.surfaceFollow.spin,anchor=n.surfaceFollow.preview&&(this.surface(p)?.buildingTarget('Shipyard')?.preview||this.previewAnchor?.local);for(const c of [n.camera,n.goal]){c.center=anchor?add(p.position,rotate(anchor,a)):add(p.position,rotate(sub(c.center,p.position),delta));c.yaw+=delta;}n.surfaceFollow.spin=a;}}
   const k=1-Math.exp(-dt*(n.flight?5:16));n.camera.yaw+=Math.atan2(Math.sin(n.goal.yaw-n.camera.yaw),Math.cos(n.goal.yaw-n.camera.yaw))*k;n.camera.pitch=mix(n.camera.pitch,n.goal.pitch,k);n.camera.dist=Math.exp(mix(Math.log(Math.max(.0001,n.camera.dist)),Math.log(Math.max(.0001,n.goal.dist)),k));n.camera.center=lerp(n.camera.center,n.goal.center,k);
   if(n.combatCamera?.mode==='bridge'){n.camera=copyCamera(n.goal);}else if(n.combatCamera?.mode==='follow'){n.camera.center=n.goal.center.slice();}
   if(Math.abs(Math.log(n.camera.dist/n.goal.dist))<.00002&&length(sub(n.camera.center,n.goal.center))<.00001)n.flight=false;
  }
  // A management camera can never be dragged underneath its selected planet.
  const p=this.body(n.zoomTarget?.id);let offset=this.eyeOffset(n.camera),eye=add(n.camera.center,offset);
  if(p&&!p.npc&&!n.combatCamera&&!n.missionFollow){const radial=sub(eye,p.position),surface=this.surface(p),direction=rotate(norm(radial),-spin(p,n.time)),minimum=p.radius+(surface?.cameraHeightAt?.(direction)??surface?.heightAt(direction)??0)+p.radius*.00002;if(length(radial)<minimum){eye=add(p.position,mul(norm(radial),minimum));n.camera=this.setViewFromEye(eye,n.camera.center);n.goal=copyCamera(n.camera);offset=sub(eye,n.camera.center);}}
  n.eye=eye;this.camera.position.fromArray(offset);this.camera.up.fromArray(n.bridgeUp||flightUp||this.surfaceUp()||[0,1,0]);this.camera.fov=n.combatCamera?.mode==='bridge'?60:55;this.camera.near=n.bridgeNear||Math.max(.00001,Math.min(10,n.camera.dist*.001));this.camera.far=Math.max(5000000,n.camera.dist*3);this.camera.lookAt(0,0,0);if(supportFrame){this.camera.zoom=1.6*Math.min(supportFrame.width/this.width,supportFrame.height/this.height);this.camera.setViewOffset(this.width,this.height,this.width/2-supportFrame.x,this.height/2-supportFrame.y,this.width,this.height);}else{this.camera.zoom=1;this.camera.clearViewOffset();}this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.matrix.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse);n.vp=Array.from(this.matrix.elements);
 }
 project(position,radius=1){if(!position)return {visible:false,depth:-1,x:0,y:0,radius:0};const n=this.navigation,relative=sub(position,n.camera.center),v=this.scratch.fromArray(relative).applyMatrix4(this.camera.matrixWorldInverse),depth=-v.z,p=v.applyMatrix4(this.camera.projectionMatrix);return {x:(p.x+1)*this.width/2,y:(1-p.y)*this.height/2,depth,radius:Math.abs(radius*this.height*this.camera.projectionMatrix.elements[5]/(2*Math.max(.0001,depth))),visible:depth>0&&p.z<=1&&Math.abs(p.x)<1.15&&Math.abs(p.y)<1.15};}
 updateNavigationContext(closest,nearest){
  const n=this.navigation,previousSystem=n.system.join(':'),level=n.surfaceFollow||n.combatCamera||closest.distance<14?'planet':nearest.distance<160000?'system':'galaxy',changedLevel=level!==n.level;n.level=level;
  // Portrait framing puts the eye farther out. A nearby star must not replace
  // the system the player is actually looking at or its orbit/action list.
  const target=n.zoomTarget,focusedSystem=target?.type==='system'?Number(target.id):target?.type==='planet'?this.body(target.id)?.coordinates[1]:target?.type==='logistics'?this.environment.pickTargets?.find(p=>p.type==='logistics'&&p.id===target.id)?.system:null;
  if(focusedSystem)n.system=[1,focusedSystem];
  else if(closest.p&&level==='planet')n.system=closest.p.coordinates.slice(0,2);
  else if(nearest.s&&level==='system')n.system=[1,nearest.s.id];
  if(changedLevel||previousSystem!==n.system.join(':'))this.emit('level');
 }
 render(t){
  const n=this.navigation,dt=Math.min(.1,Math.max(0,(t-(this.last??t))/1000));this.last=t;this.frameCount++;n.frames++;n.time+=dt;n.dt=dt;n.sampleTime=t;
  if(!n.enabled||!this.prepared)return;for(const callback of this.frameListeners)callback(t);this.updateCamera(dt);n.screen=[];
  const closest=n.planets.reduce((best,p)=>{const d=length(sub(n.eye,p.position))/p.radius;return d<best.distance?{p,distance:d}:best;},{distance:Infinity}),nearest=n.systems.reduce((best,s)=>{const d=length(sub(n.eye,s.position));return d<best.distance?{s,distance:d}:best;},{distance:Infinity});
  this.updateNavigationContext(closest,nearest);
  // Keep AURORA's sky/ground fill at every zoom, including coarse planet LODs.
  // Removing it beyond 10 radii crushed the night side to black. The directional
  // sun still shapes the terminator; system-view exposure/sky stay unchanged.
  const auroraView=closest.distance<10;this.ambient.intensity=auroraView?0:.3;this.sun.intensity=auroraView?2.65:2;
  this.sun.color.setHex(auroraView?16774362:0xffe6c0);this.three.toneMapping=auroraView?THREE.NeutralToneMapping:THREE.ACESFilmicToneMapping;this.three.toneMappingExposure=auroraView?1:.92;
  const origin=n.camera.center;this.environment.update({time:n.time,eye:n.eye,origin,distance:n.camera.dist,width:this.width,height:this.height});
  const bodies=n.planets.map(p=>({p,q:this.project(p.position,p.radius)})).filter(({p,q})=>!p.npc&&p.kind!=='belt'&&(q.visible||n.surfaceFollow?.body===p.key||length(sub(n.eye,p.position))<p.radius*1.4)&&q.radius>1.5).sort((a,b)=>b.q.radius-a.q.radius).slice(0,16);
  const visibleKeys=new Set(bodies.map(({p})=>p.key));
  for(const [key,entry]of this.surfaces){const visible=visibleKeys.has(key);entry.object.setVisible?.(visible);entry.object.root.visible=visible;}
  n.visibleDetails=[];
  for(const [index,{p,q}]of bodies.entries()){const object=this.surface(p),star=n.systems.find(s=>s.id===p.coordinates[1]),light=norm(sub(star?.position||[0,1000,0],p.position));object.setVisible?.(true);object.root.visible=true;object.root.position.fromArray(sub(p.position,origin));object.root.rotation.y=spin(p,n.time);object.root.updateMatrixWorld(true);object.update({time:n.time,now:Date.now()+this.nowOffset,eye:n.eye,origin,camera:this.camera,planet:this.owned.get(p.id)||null,catalog:this.catalog,selectedBuilding:n.surfaceFollow?.body===p.key?this.selectedBuilding:null,light,viewportHeight:this.height,detailEnabled:index<4});n.visibleDetails.push({key:p.key,biome:p.biome,weight:1,...object.stats});n.screen.push({id:p.key,type:'planet',name:p.name,position:p.position,...q});}
  if(this.surfaces.size>16){for(const [key,e]of [...this.surfaces].sort((a,b)=>a[1].used-b[1].used)){if(this.surfaces.size<=16)break;if(e.used===this.frameCount)continue;e.object.root.removeFromParent();e.object.dispose();this.surfaces.delete(key);}}
  this.updateNavigationTargets();
  const light=closest.p?norm(sub(n.systems.find(s=>s.id===closest.p.coordinates[1])?.position||[0,10000,0],closest.p.position)):[-.55,.42,-.72];this.sun.position.fromArray(mul(light,1000));this.sun.target.position.set(0,0,0);
  this.updateShipPreview();this.three.info.reset();this.three.setClearColor(0x01040a,1);this.three.clear(true,true,true);
  this.combat.draw();this.three.render(this.scene,this.camera);this.combat.drawCabin();this.updateLabels();
  if(dt>0){n.frameTimes.push(dt*1000);if(n.frameTimes.length>600)n.frameTimes.shift();}
 }
 updateNavigationTargets(){
  const n=this.navigation;
  for(const item of this.environment.pickTargets||[]){
   const q=this.project(item.position,item.radius||1);if(!q.visible)continue;
   // Local objects must be visible before they can cover a distant star's hit area.
   if(item.type==='logistics'&&(n.level==='galaxy'||q.radius<2))continue;
   if(item.type==='planet'&&q.radius<1.5)continue;
   n.screen.push({...item,...q,radius:Math.max(item.type==='system'?7:10,q.radius)});
  }
  const home=this.body(n.homePlanetId);if(!home)return;
  const type=n.level==='galaxy'?'system':'planet',id=type==='system'?home.coordinates[1]:home.key;
  let marker=n.screen.find(p=>p.type===type&&p.id===id);
  if(!marker&&type==='planet'){
   const q=this.project(home.position,home.radius);
   if(q.visible){marker={id,type,name:home.name,position:home.position,...q,radius:Math.max(10,q.radius)};n.screen.push(marker);}
  }
  if(marker){marker.home=true;marker.homeName=home.name;}
 }
 updateLabels(){
  const n=this.navigation,selected=p=>n.zoomTarget?.type===p.type&&n.zoomTarget.id===p.id;
  const show=n.screen.filter(p=>p.home||selected(p)||['battle','mission','logistics'].includes(p.type)||(n.hover?.type===p.type&&n.hover.id===p.id)).sort((a,b)=>Number(b.home)-Number(a.home)||Number(selected(b))-Number(selected(a))).slice(0,12);
  show.forEach((p,i)=>{
   let element=this.labelPool[i];if(!element){element=document.createElement('button');element.addEventListener('click',e=>{const r=this.canvas.getBoundingClientRect();if(e.detail===0)this.activateTarget(element.target);else this.activateClick(element.target,e.clientX-r.left,e.clientY-r.top);});this.labels.append(element);this.labelPool.push(element);}
   element.className=`universe-label${p.home?' is-home':''}${selected(p)?' is-selected':''}`;element.target=p;element.textContent=p.home?'⌂ 母星':p.name||p.type;element.title=p.home?`${p.homeName} · ${p.name}`:p.name||p.type;element.setAttribute('aria-pressed',String(selected(p)));element.style.transform=`translate(${p.x+12}px,${p.y-12}px)`;element.hidden=false;
  });
  for(let i=show.length;i<this.labelPool.length;i++)this.labelPool[i].hidden=true;
 }
 pick(x,y){const n=this.navigation;if(n.level==='planet'&&n.surfaceFollow){this.raycaster.setFromCamera(new THREE.Vector2(x/this.width*2-1,1-y/this.height*2),this.camera);const surface=this.surfaces.get(n.surfaceFollow.body)?.object,hit=surface?.pick(this.raycaster);if(hit)return {type:'building',id:hit.gameId||hit.id||hit.building?.gameId};}const hits=n.screen.filter(p=>Math.hypot(p.x-x,p.y-y)<Math.max(12,p.radius));return hits.sort(n.level==='galaxy'?(a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y):(a,b)=>a.depth-b.depth)[0];}
 activateTarget(hit,double=false){if(!hit){this.emit('deselect');return;}if(hit.type==='building'){this.selectBuilding(hit.id);this.onBuilding?.(hit.id);}else if(hit.type==='vessel')this.emit('vessel',{battleId:hit.battleId,shipId:hit.id,double});else if(hit.type==='battle'){this.combat.focus(hit.id);this.emit('battle',{battleId:hit.id});}else if(hit.type==='mission')this.combat.mission(hit.id);else if(hit.type==='system'){double?this.focusSystem(hit.id):this.selectNavigationSystem(hit.id);this.emit('inspect');}else if(hit.type==='blackHole'){this.toBlackHole();this.emit('inspect');}else if(hit.type==='logistics'){this.focusLogistics(hit.id);this.emit('logistics');}else double?this.toPlanet(hit.id):this.selectNavigationPlanet(hit.id,{focus:true});}
 // Selection starts a camera flight immediately. Keep the first click's target
 // for a second click at the same screen position, even after the object moves.
 activateClick(hit,x,y,now=performance.now()){
  const previous=this.lastTargetClick;
  if(previous?.hit&&now-previous.at<500&&Math.hypot(x-previous.x,y-previous.y)<6){this.lastTargetClick=null;this.activateTarget(previous.hit,true);}
  else{this.lastTargetClick={hit,x,y,at:now};this.activateTarget(hit);}
 }
 zoomNavigation(delta,x=this.width/2,y=this.height/2){
  const n=this.navigation;if(n.combatCamera?.mode==='bridge'||n.pilotActive)return false;
  if(n.missionFollow)n.missionFollow.manual=true;
  // Wheel input interrupts the distance easing, but must retain the destination
  // of a selected target even when its centering flight is still in progress.
  const center=n.zoomTarget&&!n.surfaceFollow&&!n.combatCamera&&!n.missionFollow&&!this.buildingFlight?n.goal.center.slice():null;
  this.interrupt();
  if(center){n.goal.center=center;n.flight=true;}
  else if(!n.zoomTarget&&!n.surfaceFollow&&!n.combatCamera){const hit=this.pick(x,y);if(hit?.position){n.goal.center=hit.position.slice();n.flight=true;n.zoomTarget={type:hit.type,id:hit.id};}}
  n.goal.dist=clamp(n.goal.dist*Math.exp(delta*.0028),.05,40000000);return true;
 }
 surfaceUp(){const n=this.navigation;if(!n.surfaceFollow||n.surfaceFollow.preview)return null;const p=this.body(n.surfaceFollow.body);if(!p)return null;const radial=sub(n.camera.center,p.position);return length(radial)>1e-6?norm(radial):null;}
 orbitCamera(dx,dy){const n=this.navigation,up=this.surfaceUp();if(!up){n.goal.yaw-=dx/this.width*Math.PI*1.5;n.goal.pitch=clamp(n.goal.pitch+dy/this.height*Math.PI*.75,-1.54,1.54);return;}const offset=new THREE.Vector3(...this.eyeOffset(n.goal)),normal=new THREE.Vector3(...up);offset.applyAxisAngle(normal,-dx/this.width*Math.PI*1.5);const altitude=Math.asin(clamp(offset.clone().normalize().dot(normal),-1,1)),next=clamp(altitude+dy/this.height*Math.PI*.75,.08,1.5),right=new THREE.Vector3().crossVectors(normal,offset).normalize();offset.applyAxisAngle(right,altitude-next);n.goal=this.setViewFromEye(add(n.goal.center,offset.toArray()),n.goal.center);}
 toggleNavigationPan(){return this.navigation.panMode=!this.navigation.panMode;}
 moveMapCamera(keys,dt){
  const n=this.navigation;if(n.combatCamera?.mode!=='free'||n.pilotActive)return;
  const x=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),y=Number(keys.has('KeyE'))-Number(keys.has('KeyQ')),z=Number(keys.has('KeyW'))-Number(keys.has('KeyS'));
  const magnitude=Math.hypot(x,y,z);if(!magnitude)return;
  const right=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),forward=this.camera.getWorldDirection(new THREE.Vector3()),speed=n.camera.dist*dt*(keys.has('ShiftLeft')||keys.has('ShiftRight')?3.2:.8)/magnitude;
  const movement=right.multiplyScalar(x).addScaledVector(forward,z).add(new THREE.Vector3(0,y,0)).multiplyScalar(speed).toArray();
  n.camera.center=add(n.camera.center,movement);n.goal.center=add(n.goal.center,movement);
 }
 toggleTerritories(){return this.environment.toggleTerritories();}
 bindInput(){const listen=(node,type,handler,options)=>{node.addEventListener(type,handler,options);this.cleanups.push(()=>node.removeEventListener(type,handler,options));},n=this.navigation,pointers=new Map();let start=null,pinch=0,moved=false;
  const point=e=>{const r=this.canvas.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
  listen(this.canvas,'contextmenu',e=>e.preventDefault());
  listen(this.canvas,'pointerdown',e=>{if(n.pilotActive||n.combatCamera?.mode==='bridge')return;this.interrupt();this.canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,point(e));start={point:point(e),button:e.button};moved=false;if(e.button!==0)this.lastTargetClick=null;if(pointers.size===2){const a=[...pointers.values()];pinch=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);moved=true;this.lastTargetClick=null;}});
  listen(this.canvas,'pointermove',e=>{const [x,y]=point(e);n.hover=this.pick(x,y);if(!pointers.has(e.pointerId))return;const previous=pointers.get(e.pointerId);pointers.set(e.pointerId,[x,y]);if(pointers.size===2){const a=[...pointers.values()],distance=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);this.zoomNavigation(Math.log(Math.max(1,pinch)/Math.max(1,distance))/.0028,x,y);pinch=distance;return;}if(Math.hypot(x-start.point[0],y-start.point[1])>4)moved=true;if(n.missionFollow||(n.combatCamera&&n.combatCamera.mode!=='free'))return;const dx=x-previous[0],dy=y-previous[1];if(n.panMode||start.button===2||e.shiftKey){n.zoomTarget=null;n.surfaceFollow=null;const right=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0),up=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,1),scale=n.goal.dist*Math.tan(this.camera.fov*Math.PI/360)*2/this.height;n.goal.center=add(n.goal.center,add(mul(right.toArray(),-dx*scale),mul(up.toArray(),dy*scale)));}else{this.orbitCamera(dx,dy);}});
  listen(this.canvas,'pointerup',e=>{if(!pointers.has(e.pointerId))return;pointers.delete(e.pointerId);if(!n.pilotActive&&n.combatCamera?.mode!=='bridge'&&!moved&&start?.button===0){const [x,y]=point(e);this.activateClick(this.pick(x,y),x,y);}else this.lastTargetClick=null;if(pointers.size)moved=true;else start=null;});listen(this.canvas,'pointercancel',e=>{pointers.delete(e.pointerId);moved=true;this.lastTargetClick=null;if(!pointers.size)start=null;});
  listen(this.canvas,'wheel',e=>{e.preventDefault();this.lastTargetClick=null;this.zoomNavigation(e.deltaY,...point(e));},{passive:false});
  listen(this.canvas,'webglcontextlost',e=>{e.preventDefault();this.active=false;this.fail(new Error('三维画面已暂停，图形上下文丢失。请刷新恢复。'));});
 }
 showShip(id){
  if(this.previewId===id)return;this.hideShip();const p=this.body(this.navigation.activePlanetId);if(!p)return;
  this.previewId=id;this.preview=this.previewCache.acquire(id);
  if(this.preview.userData.revision==='october-user-models-01'){
   // These supplied PBR materials need the same soft reflections as their source
   // viewers. Apply only to the leased inspection copy, never the universe or cache.
   if(!this.previewEnvironment){const room=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(this.three);this.previewEnvironment=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();}
   this.preview.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){m.envMap=this.previewEnvironment.texture;m.envMapIntensity=.8;}});
  }
  // Fit in the hull's own frame before attaching to the rotating port. Preserve
  // the factory's scale, which already normalizes different authored hull sizes.
  const size=new THREE.Box3().setFromObject(this.preview).getSize(new THREE.Vector3()).length();
  this.preview.scale.multiplyScalar(1/Math.max(1,size));this.previewRoot.add(this.preview);
  this.selectBuilding('Shipyard');const target=this.surface(p)?.buildingTarget('Shipyard');
  this.previewAnchor={body:p.key,local:target?.preview||target?.station||mul(norm([1,.4,0]),p.radius*1.2)};this.previewRoot.visible=true;
  if(this.buildingFlight)Object.assign(this.buildingFlight,{station:true,preview:true});
  this.navigation.surfaceFollow={body:p.key,id:'Shipyard',spin:spin(p,this.navigation.time),preview:true};this.selectedBuilding=null;this.updateShipPreview();
  const a=spin(p,this.navigation.time),center=add(p.position,rotate(this.previewAnchor.local,a));
  this.navigation.goal=this.setViewFromEye(add(center,rotate(SHIP_PREVIEW_OFFSET,a)),center);this.navigation.flight=true;
 }
 hideShip(){if(this.defenseBody)this.surfaces.get(this.defenseBody)?.object.setDefensePreview(null);this.defenseBody=null;if(this.buildingFlight?.preview){this.buildingFlight=null;this.navigation.goal=copyCamera(this.navigation.camera);this.navigation.flight=false;}if(this.navigation.surfaceFollow?.preview)this.navigation.surfaceFollow=null;if(this.preview){this.previewCache.release(this.preview);this.preview.removeFromParent();}this.preview=null;this.previewId=null;this.previewRoot.visible=false;}
 get defenseDisplay(){return this.surfaces.get(this.defenseBody)?.object.defenseDisplay||null;}
 showDefense(id){
  const p=this.body(this.navigation.activePlanetId);if(!p)return false;
  this.hideShip();const surface=this.surface(p);if(!surface?.setDefensePreview(id))return false;
  this.defenseBody=p.key;this.selectBuilding('Missile_Silo');return true;
 }
 updateShipPreview(){
  if(!this.preview||!this.previewAnchor)return;const p=this.body(this.previewAnchor.body);if(p){const target=this.surface(p)?.buildingTarget('Shipyard');if(target?.preview)this.previewAnchor.local=target.preview;this.previewRoot.rotation.y=spin(p,this.navigation.time);this.previewRoot.position.fromArray(sub(add(p.position,rotate(this.previewAnchor.local,spin(p,this.navigation.time))),this.navigation.camera.center));}
 }
 settle(){this.navigation.camera=copyCamera(this.navigation.goal);this.navigation.flight=false;}
 get navigationState(){const n=this.navigation;return {combatCamera:n.combatCamera,missionFollow:n.missionFollow};}
 get snapshot(){const n=this.navigation;return {render:{...this.three.info.render,geometries:this.three.info.memory.geometries,textures:this.three.info.memory.textures,renderer:'three-unified',rendererCount:1,canvasCount:1,frame:this.frameCount},navigation:{...n,bodies:undefined,details:undefined,resources:undefined,systemCount:n.systems.length,planetCount:n.planets.length,detailCount:this.surfaces.size,galaxy:this.environment.stats?.galaxy||this.environment.stats,battles:this.combat.stats,targets:n.screen,strategy:{territoriesVisible:this.environment.stats.territoriesVisible},frameTimes:n.frameTimes.slice()},features:{unified:true,prepared:this.prepared,preparedInMs:this.preparedInMs,worldScale:WORLD_SCALE,artStatus:AURORA_WORLD_VERSION}};}
 getWebGLError(){return this.three.getContext().getError();}
 prepareMapFleet(){return this.combat.ready;}
 setMapBattle(...args){return this.combat.set(...args);}
 focusMapBattle(...args){return this.combat.focus(...args);}
 focusMapMission(...args){return this.combat.mission(...args);}
 setMapVessel(...args){return this.combat.vessel(...args);}
 exitMapFleet(...args){return this.combat.exit(...args);}
 setMapPilot(value){this.navigation.pilotActive=value;}
 setMapTarget(target,locked){Object.assign(this.navigation.combatCamera||{},{target,locked});}
 setMapCabin(pose){if(this.navigation.combatCamera)this.navigation.combatCamera.pose=pose?structuredClone(pose):null;}
 setMapPilotPose(id,row){const b=this.combat.records.get(id);if(b)b.pilotRow=row;}
 setMapBridgeInstruments(id,state){const b=this.combat.records.get(id);if(b)b.bridgeInstruments=state;}
 setMapFighterInstruments(id,state){const b=this.combat.records.get(id);if(b)b.fighterInstruments=state;}
 walkMapCabin(...args){return this.combat.walkCabin(...args);}
 pickMapBridgeConsole(...args){return this.combat.pickBridgeConsole(...args);}
 getMapBridgeConsole(){return this.combat.bridgeConsoleLayout();}
 pickMapFighterConsole(...args){return this.combat.pickFighterConsole(...args);}
 getMapFighterConsole(){return this.combat.fighterConsoleLayout();}
 dispose(){if(this.disposed)return;this.disposed=true;cancelAnimationFrame(this.raf);this.abort.abort();this.environment.cancelLoading?.();this.resizeObserver.disconnect();this.cleanups.forEach(f=>f());this.frameListeners.clear();this.canvas.remove();this.labels.remove();this.errorElement.remove();this.loadingElement.remove();const release=()=>{this.combat.dispose();this.environment.dispose();this.planetPrewarm.dispose();for(const e of this.surfaces.values())e.object.dispose();this.surfaces.clear();this.previewCache.dispose();this.previewEnvironment?.dispose();this.three.dispose();};Promise.allSettled([this.preparation,this.combat.ready]).then(release);}
}
