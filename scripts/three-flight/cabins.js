import * as THREE from 'three';
import {geometryFromNative} from './shared-resources.js';
import {buildBastion,buildHorizon,cabinVertex,cabinFragment} from './cockpit-models.js';
import {cabinPose} from '../../game/pilot-controls.mjs';
import {BridgeConsole} from './bridge-console.js';

// The room is an eye-space layer over the actual battle, with the same field of view.
// Windows remain transparent: no demo planets, enemies or parallel simulation.
export class Cabins {
 constructor(backend){this.backend=backend;this.rooms=new Map();this.camera=new THREE.PerspectiveCamera();this.vp=new THREE.Matrix4();this.canvas=document.createElement('canvas');this.canvas.width=1024;this.canvas.height=512;this.texture=new THREE.CanvasTexture(this.canvas);this.labels=document.createElement('canvas');this.labels.width=1024;this.labels.height=512;this.labelTexture=new THREE.CanvasTexture(this.labels);this.labelAtlas();}
 labelAtlas(){const c=this.labels.getContext('2d'),names=['COMMAND','NAVIGATION','TACTICAL','COMMS','PORT','STARBOARD','FLIGHT DECK','ENGINEERING','AUTO HELM','BASTION','CREW','SYSTEMS','OPERATIONS','DECK 01','HORIZON','BRIDGE'];c.clearRect(0,0,1024,512);names.forEach((text,i)=>{c.fillStyle='#b8d5db';c.font='22px sans-serif';c.textAlign='center';c.fillText(text,(i%4)*256+128,Math.floor(i/4)*128+70);});this.labelTexture.needsUpdate=true;}
 room(kind){if(this.rooms.has(kind))return this.rooms.get(kind);const source=kind==='bastion'?buildBastion():kind==='horizon'?buildHorizon():null,scene=new THREE.Scene(),geometries=[],materials=[];
  const groups=source?.groups||{fighter:this.backend.cockpit,...Object.fromEntries(this.backend.screens.map((m,i)=>['screen'+i,m]))};
  for(const [name,group]of Object.entries(groups)){
   // Remove only the forward centre mullion; keep the panoramic window frame.
   let vertices=group.data;if(kind==='horizon'&&vertices){const clear=[];for(let i=0;i<vertices.length;i+=39){let centrePost=true;for(let j=0;j<3;j++){const o=i+j*13;if(Math.abs(vertices[o])>.28||vertices[o+2]>-13.2||vertices[o+1]<.8||vertices[o+1]>6.3)centrePost=false;}if(!centrePost)for(let j=0;j<39;j++)clear.push(vertices[i+j]);}vertices=clear;}
   const geometry=group.geometry||geometryFromNative(vertices);if(!group.geometry)geometries.push(geometry);
   const screen=name.startsWith('screen'),label=name==='labels',glass=name==='glass',holo=name==='holo';
   const uniforms=Object.fromEntries(Object.entries({uModel:new THREE.Matrix4(),uVP:this.vp,uEye:new THREE.Vector3(),uLight:new THREE.Vector3(-.35,.8,.6),uOpacity:glass?.028:holo?.36:1,uMode:screen?2:label?3:0,uRoom:kind==='fighter'?0:1,uTime:0,uLighting:1,uTexture:label?this.labelTexture:this.texture,uCity:this.texture}).map(([k,value])=>[k,{value}]));
   const material=new THREE.RawShaderMaterial({vertexShader:cabinVertex,fragmentShader:cabinFragment,uniforms,side:THREE.DoubleSide,transparent:glass||holo||label,depthWrite:!(glass||holo||label),blending:holo?THREE.AdditiveBlending:THREE.NormalBlending,toneMapped:false});materials.push(material);
   if(kind==='fighter'&&screen)uniforms.uTexture.value=this.backend.fighterConsole.displays[Number(name.slice(-1))].texture;
   const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;scene.add(mesh);
  }
  const console=kind==='fighter'?null:new BridgeConsole(kind);if(console)scene.add(console.group);
  const room={scene,geometries,materials,console,obstacles:source?.obstacles||[]};this.rooms.set(kind,room);return room;
 }
 instruments(data,time){if(data.kind==='fighter'){this.backend.fighterConsole.update(data.console,time);return;}if(time-(this.lastUpdate??-1)<.15)return;this.lastUpdate=time;const c=this.canvas.getContext('2d'),row=data.row||[],meta=data.meta||{},hp=Math.round(100*(row[6]||0)/(meta.maxHp||1)),shield=Math.round(100*(row[7]||0)/(meta.maxShield||1));
  const tiles=[['HELM',`${Math.round(row[9]||0)} m/s`,data.auto?'AUTO / AI':'MANUAL'],['DEFENSE',`HULL ${hp}%`,`SHIELD ${shield}%`],['TACTICAL',`CONTACT ${row[8]>=0?row[8]+1:'—'}`,`${data.counts?.join(' : ')||'LIVE FEED'}`],['PRIMARY',`${(row[10]||0).toFixed(1)} s`,'WEAPON CYCLE'],['ENGINEERING',`${Math.round((data.throttle??0)*100)}%`,'THROTTLE'],['NAVIGATION',`${Math.round((row[4]||0)*180/Math.PI)}°`,'HEADING'],['ORDNANCE',`${(row[11]||0).toFixed(1)} s`,'MISSILE CYCLE'],['FLEET',`${meta.type||'VESSEL'}`,`T + ${Math.floor(time)} s`]];
  c.fillStyle='#07141c';c.fillRect(0,0,1024,512);tiles.forEach(([title,value,detail],i)=>{const x=i%4*256,y=Math.floor(i/4)*256;c.strokeStyle='#28505e';c.strokeRect(x+8,y+8,240,240);c.fillStyle='#7da6ad';c.font='18px sans-serif';c.fillText(title,x+20,y+40);c.fillStyle='#d6f5ed';c.font='24px monospace';c.fillText(value,x+20,y+94,220);c.fillStyle='#72adbd';c.font='15px monospace';c.fillText(detail,x+20,y+130,220);for(let j=0;j<8;j++){c.fillStyle=j<Math.round(hp/12.5)?'#5fa6a7':'#132d39';c.fillRect(x+20+j*27,y+182,22,32);}});this.texture.needsUpdate=true;
 }
 pickFighterConsole(x,y){
  if(this.last?.kind!=='fighter')return null;const origin=this.camera.position,point=new THREE.Vector3(x/this.backend.width*2-1,1-y/this.backend.height*2,.5).unproject(this.camera),direction=point.sub(origin).normalize();
  return this.backend.fighterConsole.pick(origin.toArray(),direction.toArray());
 }
 fighterConsoleLayout(){if(this.last?.kind!=='fighter')return [];return this.backend.fighterConsole.layout(p=>{const q=new THREE.Vector3(...p).project(this.camera);return {x:(q.x+1)*this.backend.width/2,y:(1-q.y)*this.backend.height/2,visible:q.z>=-1&&q.z<=1};});}
 pickBridgeConsole(x,y){const console=this.rooms.get(this.last?.kind)?.console;if(!console)return null;const origin=this.camera.position,direction=new THREE.Vector3(x/this.backend.width*2-1,1-y/this.backend.height*2,.5).unproject(this.camera).sub(origin).normalize();return console.pick(origin,direction);}
 bridgeConsoleLayout(){const console=this.rooms.get(this.last?.kind)?.console;return console?console.layout(p=>{const q=new THREE.Vector3(...p).project(this.camera);return {x:(q.x+1)*this.backend.width/2,y:(1-q.y)*this.backend.height/2,visible:q.z>=-1&&q.z<=1};}):[];}
 draw(data){const {kind,time=0,opacity=1}=data,room=this.room(kind),pose=data.pose||cabinPose(kind),camera=this.camera;this.instruments(data,time);camera.fov=(data.fov||Math.PI/3)*180/Math.PI;camera.aspect=this.backend.width/this.backend.height;camera.near=.035;camera.far=180;camera.position.fromArray(pose.eye);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3(...pose.eye).add(new THREE.Vector3(Math.sin(pose.yaw)*Math.cos(pose.pitch),Math.sin(pose.pitch),-Math.cos(pose.yaw)*Math.cos(pose.pitch))));camera.updateProjectionMatrix();camera.updateMatrixWorld();this.vp.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  room.console?.update(data.console,time);
  for(const material of room.materials){material.uniforms.uEye.value.copy(camera.position);material.uniforms.uTime.value=time;material.uniforms.uOpacity.value=opacity*(material.transparent?(material.blending===THREE.AdditiveBlending?.36:material.uniforms.uMode.value===3?1:.028):1);}
  this.backend.three.clearDepth();this.backend.three.render(room.scene,camera);this.last={kind,eye:[...pose.eye],yaw:pose.yaw,pitch:pose.pitch,triangles:this.backend.three.info.render.triangles};
 }
 dispose(){for(const room of this.rooms.values()){room.console?.dispose();room.geometries.forEach(g=>g.dispose());room.materials.forEach(m=>m.dispose());room.scene.clear();}this.rooms.clear();this.texture.dispose();this.labelTexture.dispose();}
}
