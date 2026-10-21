import {shipCabinClass} from '../../game/ship-cabins.mjs';
import * as THREE from 'three';
import {loadFleetAssets} from './assets.js';
import {createGalaxyRender} from './renderer.js';
import {createFlightController} from './controller.js';
import {missionVisual} from '../../game/mission-visual.mjs';
import {fleetStations} from '../../game/fleet-formation.mjs';
import {arrivingBattlePosition} from '../../game/battle-terrain.mjs';
import {appendWarpEffect,stretchAlongHeading,warpEnvelope,WarpRibbonBuffer} from './warp-effects.js';

export {missionVisual};
export const timedMissionPose=(pose,time)=>({...pose,time:pose.time??time});
// Both world scenery and the local fleet look straight along the same flight axis.
export const cruiseView=Object.freeze({fov:42,pitch:Math.atan(.24),vanishingY:.5-.24/(2*Math.tan(42*Math.PI/360))});

// The map supplies its camera and placement. Models, weapon events, shields,
// particles, propulsion, LOD and GPU submission are the battlefield's own code.
export async function createMapFleetRenderer(canvas, {signal,renderer:sharedRenderer,scene,camera:mainCamera,managed=false}={}) {
  const {fleet,assets}=await loadFleetAssets({base:'../galactic-command/three-flight-assets/',signal});
  const kit=createGalaxyRender(fleet,assets),{Renderer,M,V,LAYOUTS,shipMatrix,clamp,mix,seeded}=kit;
  const renderer=new Renderer(canvas,{renderer:sharedRenderer,scene,camera:mainCamera,managed}),views=new Map(),indices=new Map(fleet.ships.map((s,i)=>[s.id,i]));
  // Build the warp shader and upload its reusable buffer before departure. The
  // first visible field must not compile a new program or allocate a large VBO.
  const previousTarget=renderer.three.getRenderTarget(),viewport=renderer.three.getViewport(new THREE.Vector4()),scissor=renderer.three.getScissor(new THREE.Vector4()),scissorTest=renderer.three.getScissorTest();
  try{
    renderer.three.setRenderTarget(null);renderer.three.setViewport(0,0,1,1);renderer.three.setScissor(0,0,1,1);renderer.three.setScissorTest(true);renderer.begin(0);
    renderer.drawVessel(0,M.identity());
    renderer.drawRibbons(new Float32Array(213*54*16+2*54*96));
    // Compile the real instanced weapon variants during loading as well. Their
    // first launch must not block an active battle on shader compilation.
    renderer.drawEffectMesh(renderer.missileMesh,M.identity(),{light:[-.3,.7,1]});
    renderer.setBlend(true);renderer.setDepthWrite(false);
    renderer.drawEffectMesh(renderer.plumeMesh,M.identity(),{mode:4});
    renderer.drawImpacts(new Float32Array(30));
    renderer.dynamicFlat(new Float32Array([0,0,0,1,1,1,1]),true);
    await renderer.three.compileAsync(renderer.scene,renderer.camera,renderer.worldScene);
    if(signal?.aborted)throw new DOMException('舰队加载已取消','AbortError');
    renderer.three.render(renderer.worldScene,renderer.camera);renderer.begin(0);
    await renderer.prepareCabins({base:'../galactic-command/three-flight-assets/',signal});
  }catch(error){renderer.dispose();throw error;}
  finally{renderer.three.setRenderTarget(previousTarget);renderer.three.setViewport(viewport);renderer.three.setScissor(scissor);renderer.three.setScissorTest(scissorTest);}
  // Legacy standalone map tools still supply only a planet list. The live
  // shared world uses its real planet geometry and depth, with no proxy meshes.
  const occlusion=managed?null:new THREE.Scene(),camera=managed?mainCamera:new THREE.Camera(),sphere=managed?null:new THREE.SphereGeometry(1,32,24);
  const depth=managed?null:new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});
  const masks=[],warpRibbons=new WarpRibbonBuffer();let frame,used=new Set();
  const cruiseCamera=new THREE.PerspectiveCamera(cruiseView.fov,1,.1,100000);
  const portScene=new THREE.Scene(),port=new THREE.Group(),portGeometry=new THREE.BoxGeometry(1,1,1),portMaterial=new THREE.MeshBasicMaterial({color:0x667c86});
  for(const [position,size]of [[[0,-.6,0],[3,.16,2]],[[0,.6,0],[3,.16,2]],[[-1.4,0,0],[.16,1.2,2]],[[1.4,0,0],[.16,1.2,2]]]){const beam=new THREE.Mesh(portGeometry,portMaterial);beam.position.fromArray(position);beam.scale.fromArray(size);port.add(beam);}(managed?renderer.scene:portScene).add(port);port.visible=false;
  const ports=[port];let portCursor=0;
  function view(id) {
    if(views.has(id))return views.get(id);
    const state={shipIndex:0,flight:{pos:[0,0,0],profile:fleet.profiles[0],targets:[],joints:[],shieldHits:[],beams:[],particles:[],projectiles:[],weaponImpacts:[],specialBlasts:[],elapsed:0}};
    const rnd=seeded(4982);
    const burst=(pos,count,color,life,speed)=>{for(let i=0;i<count;i++)state.flight.particles.push({pos:[...pos],velocity:[(rnd()-.5)*speed,(rnd()-.5)*speed,(rnd()-.5)*speed],age:0,life:life*(.6+rnd()*.8),size:2+rnd()*6,color});};
    const battle=createFlightController({state,renderer,SHIPS:fleet.ships,COMBAT:fleet.profiles,LAYOUTS,M,V,clamp,mix,shipMatrix,burst,shortAngle:a=>Math.atan2(Math.sin(a),Math.cos(a)),notice:()=>{},tone:()=>{},$:()=>null});
    battle.indices=indices;battle.drawLabels=()=>{};battle.renderNamespace=id+':';
    const result={battle,state,seq:0};views.set(id,result);return result;
  }
  function place(anchor,scale) {
    renderer.eye=V.scale(V.sub(frame.eye,anchor),1/scale);
    renderer.vp=M.mul(frame.vp,M.mul(M.translate(...V.sub(anchor,frame.center)),M.scale(scale)));
    renderer.fov=frame.fov;renderer.cameraForward=frame.forward;renderer.cameraUp=frame.up;
  }
  return {
    renderer,
    bridgeSeat(type){return LAYOUTS[indices.get(type)]?.bridge;},
    begin(value) {
      frame=value;used=new Set();portCursor=0;for(const node of ports)node.visible=false;renderer.worldLight=managed?value.light:null;
      if(managed&&value.mainCamera)renderer.camera=value.mainCamera;
      if(renderer.width!==value.width||renderer.height!==value.height||renderer.dpr!==value.dpr)renderer.resize(value.width,value.height,value.dpr);
      renderer.begin(value.time);renderer.cabinRequest=null;
      if(!managed){
        camera.projectionMatrix.fromArray(value.vp);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
        for(const m of masks)m.visible=false;
        (value.occluders||[]).forEach((p,i)=>{let mask=masks[i];if(!mask){mask=new THREE.Mesh(sphere,depth);masks.push(mask);occlusion.add(mask);}mask.visible=true;mask.position.fromArray(V.sub(p.position,value.center));mask.scale.setScalar(p.radius);});
        renderer.three.render(occlusion,camera);
      }
    },
    port(position,scale,normal){let node=port;if(managed){node=ports[portCursor++];if(!node){node=port.clone();ports.push(node);renderer.scene.add(node);}}node.visible=true;node.position.fromArray(V.sub(position,frame.center));node.scale.setScalar(scale);node.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(...normal));if(!managed)renderer.three.render(portScene,camera);},
    battle(data,anchor,scale,owner,{camera:mapCamera,dock}={}) {
      used.add(data.id);const item=view(data.id),{battle:b,state}=item,p=state.flight;
      if(item.epoch!==data.epoch){b.clearVisuals();item.seq=0;item.tick=undefined;item.epoch=data.epoch;}
      place(anchor,scale);
      renderer.effectNamespace=data.id;
      const dt=data.replay?Math.max(0,Math.min(.4,((data.tick||0)-(item.tick??data.tick))*.05)):frame.dt;
      item.tick=data.tick;p.elapsed+=dt;renderer.time=p.elapsed;
      const entry=Math.min(1,(data.tick||0)*.05/4),entryEase=entry*entry*(3-2*entry),dockLocal=dock?V.scale(V.sub(dock,anchor),1/scale):null;
      const entering=rows=>!data.environment&&dockLocal&&entry<1?rows.map(row=>{const m=data.metadata.find(m=>m.id===row[0]);if(m?.side!=='defender'||m.profile.role==='station')return row;const out=row.slice(),t=Math.max(0,Math.min(1,entryEase*1.3-(row[0]%7)*.035));for(let i=1;i<=3;i++)out[i]=mix(dockLocal[i-1],row[i],t);return out;}):rows;
      b.presentationRow=data.pilotRow;b.previous=entering(data.previous||data.ships);b.rows=entering(data.ships);b.metadata=data.metadata;b.received=data.received;b.sampleTime=frame.sampleTime;b.owner=owner;
      const cameraMeta=data.metadata.find(m=>m.id===mapCamera?.shipId),cabinKind=cameraMeta&&shipCabinClass(cameraMeta.type,cameraMeta.profile);
      b.bridgeVessel=cabinKind&&mapCamera?.id===data.id&&mapCamera.mode==='bridge'?mapCamera.shipId:null;b.hiddenVessel=b.bridgeVessel;
      b.replay=!!data.replay;b.playTime=(data.tick||0)*.05;b.replayAlpha=1;b.fullDetail=data.metadata.length<=128;
      b.center=V.scale(V.sub(frame.center,anchor),1/scale);b.snapshot=data;b.projectiles=data.projectiles||[];
      if(item.metadata!==data.metadata){for(const m of data.metadata)if(m.profile.renderType&&indices.has(m.profile.renderType))indices.set(m.type,indices.get(m.profile.renderType));b.buildGroups();item.metadata=data.metadata;}
      b.updateQuality(frame.sampleTime);b.updateVisuals(dt);b.presentation.update(dt);
      for(const e of data.effects||[])if(e.seq>item.seq){item.seq=e.seq;if(e.resume||e.tick>=(data.tick||0)-(e.type==='antimatter'?106:data.replay?10:6))b.effect(e);}
      for(const e of data.specialBlasts||[])if(!e.harmless&&!p.specialBlasts.some(q=>q.source===e.source&&q.tick===e.tick))p.specialBlasts.push({...e,pos:[e.x,e.y,e.z],age:0});
      p.specialBlasts=p.specialBlasts.filter(e=>{e.age=Math.max(0,((data.tick||0)-e.tick)*.05);return e.age<5.3;});
      if(b.bridgeVessel!=null){const meta=data.metadata.find(m=>m.id===b.bridgeVessel);renderer.cabinRequest={kind:cabinKind,feedbackEpoch:data.id+':'+data.epoch,shieldHits:b.visualVessel(meta.id).shieldHits,console:cabinKind==='fighter'?data.fighterInstruments:data.bridgeInstruments,pose:mapCamera.pose,meta,row:b.row(meta.id),time:p.elapsed,fov:frame.fov,auto:!data.controls?.[owner],counts:data.counts};}
      // The navigation renderer already draws the actual local planet, including
      // its terrain, colony and NPC model. Never cover it with a combat sphere.
      b.drawFleet(renderer);
      // The bridge looks out over the same complete hull used by the chase camera.
      // Cutting and flattening a second bow mesh separates wings and armor plates.
      if(b.bridgeVessel!=null)b.drawNativeShip(renderer,b.bridgeVessel);
      renderer.drawCombatEffects(p,p.elapsed,M.identity(),0);
      if(!b.fullDetail)b.presentation.draw(renderer,b,false);
      return {renderer:'shared-battlefield',...b.renderStats,defenderLaunch:!data.environment&&entry<1,hiddenVessel:b.hiddenVessel,bridgeVessel:b.bridgeVessel,cabin:b.bridgeVessel!=null?cabinKind:null,effects:p.beams.length+p.projectiles.length+p.weaponImpacts.length+p.specialBlasts.length,ships:data.ships.filter(row=>row[6]>0).map(row=>({id:row[0],type:data.metadata[row[0]]?.type,position:V.add(anchor,V.scale(b.row(row[0]).slice(1,4),scale)),hp:row[6],side:data.metadata[row[0]]?.side,loaded:indices.has(data.metadata[row[0]]?.type)}))};
    },
    cruise(mission,pose,anchor,scale,direction) {
      if(managed){
        if(!anchor||!(scale>0)||!direction)throw new Error('Shared cruise requires world position, scale and direction');
        return this.travel(mission,{...pose,model:1,observer:true,budget:frame.width<600?9:18},anchor,scale,direction);
      }
      // A local observer camera keeps the hulls readable even on inter-system routes.
      // Navigation still owns the real route position and the authoritative clock.
      const groups=Object.entries(mission.ships||{}).filter(([type,n])=>indices.has(type)&&n>0);
      const total=groups.reduce((sum,[,n])=>sum+n,0),budget=frame.width<600?9:18;
      const count=groups.reduce((sum,[,n])=>sum+Math.min(n,Math.max(1,Math.round(budget*n/Math.max(1,total)))),0);
      const length=Math.max(8,...groups.map(([type])=>LAYOUTS[indices.get(type)].length)),spacing=length*1.65;
      const center=new THREE.Vector3(0,0,Math.floor(Math.max(0,count-1)/3)*spacing*.5);
      cruiseCamera.aspect=frame.width/frame.height;
      const back=new THREE.Vector3(0,Math.tan(cruiseView.pitch),1).normalize(),right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),back).normalize(),up=new THREE.Vector3().crossVectors(back,right);
      const extent=[Math.max(0,Math.min(count,3)-1)*spacing*.5+length*.45,spacing*.22+length*.25,center.z+length*.6];
      const tanY=Math.tan(cruiseCamera.fov*Math.PI/360),tanX=tanY*cruiseCamera.aspect;
      let distance=0;
      for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
        const corner=new THREE.Vector3(x*extent[0],y*extent[1],z*extent[2]);
        distance=Math.max(distance,corner.dot(back)+Math.max(Math.abs(corner.dot(right))/tanX,Math.abs(corner.dot(up))/tanY));
      }
      cruiseCamera.position.copy(center).addScaledVector(back,distance*1.1);
      cruiseCamera.lookAt(center);cruiseCamera.updateProjectionMatrix();cruiseCamera.updateMatrixWorld();
      const saved=frame;
      frame={...frame,eye:cruiseCamera.position.toArray(),center:[0,0,0],vp:new THREE.Matrix4().multiplyMatrices(cruiseCamera.projectionMatrix,cruiseCamera.matrixWorldInverse).toArray(),forward:cruiseCamera.getWorldDirection(new THREE.Vector3()).toArray(),up:[0,1,0]};
      try{return {...this.travel(mission,{...pose,model:1,warp:0,observer:true,spacing,budget,time:frame.time},[0,0,0],1,[0,0,-1]),observer:true,view:{forward:frame.forward,vanishingY:cruiseView.vanishingY}};}
      finally{frame=saved;}
    },
    travel(mission,pose,anchor,scale,direction) {
      pose=timedMissionPose(pose,frame.time);place(anchor,scale);renderer.time=frame.time;
      const heading=pose.battleApproach?[1,0,0]:pose.docking?V.scale(pose.dockNormal||direction,-1):pose.launch?pose.departureDirection||direction:direction;
      const yaw=pose.battleApproach?Math.PI/2:Math.atan2(heading[0],-heading[2]),pitch=pose.battleApproach?0:Math.atan2(heading[1],Math.hypot(heading[0],heading[2]));
      let count=0,exhausts=0;const groups=Object.entries(mission.ships||{}).filter(([type,n])=>indices.has(type)&&n>0).sort(([a],[b])=>a.localeCompare(b));
      const profiles=new Map(assets.ships.map(s=>[s.id,s.profile]));
      const stations=pose.battleApproach?fleetStations(groups,id=>profiles.get(id)):null;
      const total=groups.reduce((s,[,n])=>s+n,0),budget=pose.budget||96,ribbons=warpRibbons.reset(),focus=[0,0,0],ships=[];
      for(const [type,n] of groups){const index=indices.get(type),number=Math.min(n,Math.max(1,Math.round(budget*n/Math.max(1,total))));
        for(let i=0;i<number;i++){
          const slot=count++,spacing=pose.spacing||Math.max(8,LAYOUTS[index].length*1.6),lane=pose.observer&&total<3?slot-(total-1)/2:slot%3-1,rank=Math.floor(slot/3);
          const station=stations?.get(type)?.[i],profile=profiles.get(type);
          let pos=station?arrivingBattlePosition(station,profile,pose.environment,pose.warp):[lane*spacing,Math.sin(slot*2.4)*spacing*.22,rank*spacing];
          let opacity=pose.model;
          if(pose.launch||pose.docking){const t=clamp((pose.docking?1-(pose.local||0):(pose.local||0))*1.8-slot/Math.max(30,total*3),0,1),spread=t*t*(3-2*t),right=V.norm(V.cross(heading,Math.abs(heading[1])>.9?[1,0,0]:[0,1,0])),outward=pose.docking?V.scale(heading,-1):heading;pos=V.add(V.scale(outward,4+spread*(75+rank*spacing)+pose.warp*220),V.add(V.scale(right,lane*spacing*spread),[0,Math.sin(slot*2.4)*spacing*.1*spread,0]));opacity*=clamp(t*12+.05,0,1);}
          const returning=pose.returnRows?.filter(r=>pose.returnMetadata.find(m=>m.id===r[0])?.type===type)[i];
          let shipYaw=yaw;if(returning){pos=V.add(returning.slice(1,4),V.scale(heading,(pose.local||0)**2*80+pose.warp*220));shipYaw=Math.PI-returning[4]+Math.atan2(Math.sin(yaw-Math.PI+returning[4]),Math.cos(yaw-Math.PI+returning[4]))*Math.min(1,(pose.local||0)*2);opacity=pose.model;}
          if(slot<16)for(let axis=0;axis<3;axis++)focus[axis]+=pos[axis];
          if(opacity>.05)ships.push({slot,position:V.add(anchor,V.scale(pos,scale)),radius:LAYOUTS[index].length*scale*.55});
          const model=shipMatrix({pos,yaw:shipYaw,pitch,roll:0},index);
          const vesselHeading=[Math.sin(shipYaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(shipYaw)*Math.cos(pitch)];
          stretchAlongHeading(model,vesselHeading,1+pose.warp**3*3);
          renderer.drawVessel(index,model,{light:[-.5,.9,.75],exposure:1.3,opacity});
          if(opacity>.05){renderer.drawExhaust(index,model,pose.observer?100:65+pose.warp*35,pose.observer||pose.warp>.2,frame.time);exhausts+=LAYOUTS[index].engines.length;}
          appendWarpEffect(ribbons,{position:pos,heading:vesselHeading,eye:renderer.eye,length:LAYOUTS[index].length,pose,slot,detailed:slot<16});
        }
      }
      if(ribbons.length){
        renderer.setBlend(true,false);renderer.drawRibbons(ribbons.view());renderer.setBlend(false,true);
      }
      return {models:count,exhausts,represented:total,ships,renderer:'shared-battlefield',focus:V.add(anchor,V.scale(focus,scale/Math.max(1,Math.min(count,16)))),warpEnergy:warpEnvelope(pose),warpVertices:ribbons.length/9};
    },
    cabinClass:shipCabinClass,
    walkCabin:(pose,keys,dt)=>renderer.cabins?.walk(pose,keys,dt),
    pickBridgeConsole:(x,y)=>renderer.cabinRequest&&renderer.cabinRequest.kind!=='fighter'?renderer.pickBridgeConsole(x,y):null,
    bridgeConsoleLayout:()=>renderer.cabinRequest&&renderer.cabinRequest.kind!=='fighter'?renderer.bridgeConsoleLayout():[],
    pickFighterConsole:(x,y)=>renderer.cabinRequest?.kind==='fighter'?renderer.pickFighterConsole(x,y):null,
    fighterConsoleLayout:()=>renderer.cabinRequest?.kind==='fighter'?renderer.fighterConsoleLayout():[],
    end() {
      let removed=false;for(const [id,item]of views)if(!used.has(id)){item.battle.dispose();views.delete(id);removed=true;}
      if(removed)for(const [key,batch]of renderer.instanceBatches)if(![...used].some(id=>key.startsWith(id+':'))){batch.mesh.removeFromParent();batch.mesh.dispose();batch.mesh.material.dispose();renderer.instanceBatches.delete(key);}
      return renderer.endFrame();
    },
    drawCabin(){renderer.drawCabin();return renderer.stats();},
    dispose(){for(const item of views.values())item.battle.dispose();views.clear();sphere?.dispose();depth?.dispose();for(const node of ports)node.removeFromParent();portGeometry.dispose();portMaterial.dispose();renderer.dispose();}
  };
}
