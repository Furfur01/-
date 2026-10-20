import * as THREE from 'three';
import {createKeelInterior} from './interior.js';
import {BridgeConsole} from '../bridge-console.js';
import {cabinPose} from '../../../game/pilot-controls.mjs';
import {shipCabinFamily} from '../../../game/ship-cabins.mjs';
import {installKeelStatus} from './status-display.js';
import {createFighterInterior} from './fighter.js';
import {createBattleshipInterior} from './battleship.js';
import {createFlagshipInterior} from './flagship.js';
import {createFighterInstruments} from './fighter-instruments.js';
import {createCabinSparks} from './feedback.js';
import {createShieldBounce} from './shield-impact.js';
import {createKeelWalker} from './walking.js';
import {createCabinFaceCulling} from './face-culling.js';

// Keep flight handling classes stable; a command carrier selects its own room.
export const keelRoomKind=(kind,data={})=>data.meta?.type?shipCabinFamily(data.meta.type,data.meta.profile||{role:kind==='fighter'?'fighter':'line',length:kind==='bastion'?50:20}):kind==='fighter'?'fighter':data.console?.carrier||data.meta?.profile?.carrier?'flagship':kind;

// The world uses its own shaders and output transform. Scope PBR settings to the
// cabin pass, including on failure, so switching seats cannot recolour combat.
export function renderKeelPass(renderer,scene,camera,{exposure=1.12,shadowDirty=false}={}){
 const previous={toneMapping:renderer.toneMapping,toneMappingExposure:renderer.toneMappingExposure,outputColorSpace:renderer.outputColorSpace};
 const shadow=Object.fromEntries(['enabled','type','autoUpdate','needsUpdate'].map(k=>[k,renderer.shadowMap[k]]));
 try{
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=exposure;renderer.outputColorSpace=THREE.SRGBColorSpace;
  Object.assign(renderer.shadowMap,{enabled:true,type:THREE.PCFShadowMap,autoUpdate:false,needsUpdate:shadowDirty});
  renderer.clearDepth();renderer.render(scene,camera);
 }finally{Object.assign(renderer,previous);Object.assign(renderer.shadowMap,shadow);}
}

export function createKeelRoom(backend,kind='horizon'){
 const factory={horizon:createKeelInterior,fighter:createFighterInterior,bastion:createBattleshipInterior,flagship:createFlagshipInterior}[kind];
 const keel=factory({renderer:backend.three}),scene=new THREE.Scene();
 // Preserve the existing game eye origin, aiming and world/cabin parallax.
 keel.root.position.fromArray(cabinPose(kind==='flagship'?'bastion':kind).eye).sub(new THREE.Vector3(...keel.config.pilot));scene.add(keel.root);
 const console=kind==='fighter'?createFighterInstruments(keel):new BridgeConsole(kind);scene.add(console.group);
 const status=kind!=='fighter'?installKeelStatus(keel,kind):null;
 const sparks=createCabinSparks(cabinPose(kind==='flagship'?'bastion':kind).eye);scene.add(sparks.points);let lastTime=0;
 const shieldBounce=createShieldBounce(cabinPose(kind==='flagship'?'bastion':kind).eye);scene.add(shieldBounce.light);
 keel.lights.traverse(l=>{if(l.shadow)l.shadow.mapSize.set(1024,1024);});
 const fade=new Map();let lastOpacity=1,shadowDirty=true;
 const faceCulling=createCabinFaceCulling(keel.interior);
 function opacity(value){
  if(value===1&&lastOpacity===1)return;
  scene.traverse(o=>{for(const m of o.material?Array.isArray(o.material)?o.material:[o.material]:[]){
   if(!fade.has(m))fade.set(m,{opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite});
   const base=fade.get(m),transparent=base.transparent||value<1;
   if(m.transparent!==transparent){m.transparent=transparent;m.needsUpdate=true;}
   m.opacity=base.opacity*value;m.depthWrite=base.depthWrite&&value===1;
  }});lastOpacity=value;
 }
 return {scene,console,keel,faceCulling,materials:[],geometries:[],obstacles:[],walk:kind==='bastion'||kind==='flagship'?createKeelWalker(keel):null,
  render(camera,data){
   const hull=data.console?.hull??100,shield=data.console?.shield??100;
   const fx=data.feedback||{alert:hull<35||shield<=0,event:0};keel.update(fx,data.time||0);shieldBounce.update(fx);sparks.update(fx,data.time,Math.min(.1,Math.max(0,data.time-lastTime)));lastTime=data.time;opacity(Math.max(0,Math.min(1,data.opacity??1)));
   status?.update(data.console,data.time||0,data.exteriorTexture);
   faceCulling.update(camera);
   try{renderKeelPass(backend.three,scene,camera,{exposure:keel.config.exposure,shadowDirty});shadowDirty=false;}finally{faceCulling.restore();}
  },
  dispose(){console.dispose();status?.dispose();sparks.dispose();shieldBounce.dispose();faceCulling.dispose();keel.dispose();fade.clear();scene.clear();}
 };
}
