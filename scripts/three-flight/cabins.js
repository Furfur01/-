import * as THREE from 'three';
import {CabinFeedback,createFeedbackOverlay} from './keel/feedback.js';
import {ExteriorFeed} from './keel/exterior-feed.js';
import {cabinPose} from '../../game/pilot-controls.mjs';
import {createKeelRoom,keelRoomKind} from './keel/room.js';

// The room is an eye-space layer over the actual battle, with the same field of view.
// Windows remain transparent: no demo planets, enemies or parallel simulation.
export class Cabins {
 constructor(backend){this.backend=backend;this.rooms=new Map();this.camera=new THREE.PerspectiveCamera();this.feedback=new CabinFeedback();this.feedbackOverlay=createFeedbackOverlay();this.exteriorFeed=new ExteriorFeed();}
 room(kind){if(!this.rooms.has(kind))this.rooms.set(kind,createKeelRoom(this.backend,kind));return this.rooms.get(kind);}
 walk(pose,keys,dt){return this.rooms.get(this.last?.roomKey)?.walk?.(pose,keys,dt);}
 pickFighterConsole(x,y){
  if(this.last?.kind!=='fighter')return null;const origin=this.camera.position,point=new THREE.Vector3(x/this.backend.width*2-1,1-y/this.backend.height*2,.5).unproject(this.camera),direction=point.sub(origin).normalize();
  return this.rooms.get(this.last.roomKey)?.console.pick(origin,direction)||null;
 }
 fighterConsoleLayout(){if(this.last?.kind!=='fighter')return [];return this.rooms.get(this.last.roomKey).console.layout(p=>{const q=new THREE.Vector3(...p).project(this.camera);return {x:(q.x+1)*this.backend.width/2,y:(1-q.y)*this.backend.height/2,visible:q.z>=-1&&q.z<=1};});}
 pickBridgeConsole(x,y){const console=this.rooms.get(this.last?.roomKey)?.console;if(!console)return null;const origin=this.camera.position,direction=new THREE.Vector3(x/this.backend.width*2-1,1-y/this.backend.height*2,.5).unproject(this.camera).sub(origin).normalize();return console.pick(origin,direction);}
 bridgeConsoleLayout(){const console=this.rooms.get(this.last?.roomKey)?.console;return console?console.layout(p=>{const q=new THREE.Vector3(...p).project(this.camera);return {x:(q.x+1)*this.backend.width/2,y:(1-q.y)*this.backend.height/2,visible:q.z>=-1&&q.z<=1};}):[];}
 draw(data){const {kind,time=0,opacity=1}=data,roomKey=keelRoomKind(kind,data),room=this.room(roomKey),pose=data.pose||cabinPose(kind),camera=this.camera;camera.fov=(data.fov||Math.PI/3)*180/Math.PI;camera.aspect=this.backend.width/this.backend.height;camera.near=.035;camera.far=180;camera.position.fromArray(pose.eye);camera.up.set(0,1,0);camera.lookAt(new THREE.Vector3(...pose.eye).add(new THREE.Vector3(Math.sin(pose.yaw)*Math.cos(pose.pitch),Math.sin(pose.pitch),-Math.cos(pose.yaw)*Math.cos(pose.pitch))));camera.updateProjectionMatrix();camera.updateMatrixWorld();
  data={...data,console:data.console?{...data.console,shipType:data.meta?.type||data.console.shipType}:null};
  data.feedback=this.feedback.update(data,time);this.feedback.apply(camera,time);if(kind!=='fighter')data.exteriorTexture=this.exteriorFeed.capture(this.backend,data,time);
  room.console?.update(data.console,time,camera);
  if(room.render)room.render(camera,data);else{this.backend.three.clearDepth();this.backend.three.render(room.scene,camera);}this.feedbackOverlay.draw(this.backend.three,this.feedback,time);this.last={kind,roomKey,eye:[...pose.eye],yaw:pose.yaw,pitch:pose.pitch,triangles:this.backend.three.info.render.triangles};
 }
 dispose(){for(const room of this.rooms.values())room.dispose();this.rooms.clear();this.exteriorFeed.dispose();this.feedbackOverlay.dispose();}
}
