import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {BufferGeometry,Scene,Vector3} from 'three';
import {battleMount} from '../game/spatial-battle.mjs';
import {shipWeaponLayouts} from '../game/ship-weapon-mounts.mjs';
import {createShipModel,disposeShip} from '../scripts/three-flight/shared-models.js';
import {createGalaxyRender} from '../scripts/three-flight/renderer.js';
import {ThreeRenderBackend} from '../scripts/three-flight/backend.js';

const fleet=JSON.parse(fs.readFileSync(new URL('../opendesign/mockups/galactic-command/three-flight-assets/flight-fleet.json',import.meta.url)));
const hardpoints=JSON.parse(fs.readFileSync(new URL('../game/ship-flight-hardpoints.json',import.meta.url)));
// Access the real rendering math without constructing a canvas, loading binary
// meshes, starting a simulation, or creating a WebGL context.
const {M,V,Renderer,shipMatrix,jointTransforms}=createGalaxyRender({...fleet,vertices:new Float32Array(0)});
const native=([x,y,z])=>[z,y,-x];
const poses=[
  {x:0,y:0,z:0,yaw:0,pitch:0},
  {x:123.5,y:-27.25,z:460.75,yaw:.71,pitch:.38},
  {x:-719.25,y:54.5,z:-302.125,yaw:-2.31,pitch:-.62},
];
const renderMatrix=(ship,index)=>shipMatrix({pos:[ship.x,ship.y,ship.z],yaw:Math.PI-ship.yaw,pitch:ship.pitch,roll:0},index);

function close(actual,expected,label,tolerance=1e-9){
  assert.equal(actual.length,expected.length,label+' dimensions');
  for(let i=0;i<actual.length;i++){
    assert.ok(Number.isFinite(actual[i])&&Number.isFinite(expected[i]),label+' finite component '+i);
    assert.ok(Math.abs(actual[i]-expected[i])<=tolerance,
      `${label}[${i}]: ${actual[i]} != ${expected[i]} (tolerance ${tolerance})`);
  }
}

test('canonical model ports become the same native mounts used by Three.js and the server',()=>{
  // These models cover fixed guns, articulated guns, different root scales,
  // authored engine nozzles and a twelve-port missile bank.
  for(const id of ['Light_Fighter','Cruiser','Titanenergetic_Frigate']){
    const index=fleet.ships.findIndex(ship=>ship.id===id),layout=fleet.layouts[index],authored=shipWeaponLayouts[id];
    const model=createShipModel(id);
    try{
      model.updateMatrixWorld(true);
      const checkPort=(port,exported,label)=>{
        const fromCanonical=native(model.localToWorld(new Vector3(...port)).toArray());
        close(exported,fromCanonical,id+' '+label+' canonical -> native');
        for(const pose of poses)close(M.transform(renderMatrix(pose,index),exported),battleMount(pose,fromCanonical),id+' '+label+' -> server world');
      };
      assert.equal(layout.main.length,authored.muzzles.length,id+' main port count');
      authored.muzzles.forEach((port,i)=>checkPort(port,layout.main[i],'main '+i));
      (authored.missiles||[]).forEach((port,i)=>checkPort(port,layout.tubes[i],'missile '+i));
      const measured=[];
      model.traverse(owner=>{
        for(const engine of owner.userData.engineNozzles||[])measured.push({
          position:native(owner.localToWorld(new Vector3(...engine.position)).toArray()),
          direction:native(new Vector3(...engine.direction).transformDirection(owner.matrixWorld).toArray()),
        });
      });
      if(id==='Cruiser'){
        assert.ok(measured.length>0,'the canonical cruiser must provide its authored nozzle anchors');
        assert.equal(layout.engines.length,measured.length,'all measured nozzles survive export');
        measured.forEach((engine,i)=>{
          close(layout.engines[i].position,engine.position,'cruiser nozzle '+i);
          close(layout.engines[i].direction,engine.direction,'cruiser exhaust direction '+i);
        });
      }
    }finally{disposeShip(model);}
  }
});

test('every exported flight hull transforms native gun, missile, engine and joint anchors like battleMount',()=>{
  for(const [index,layout]of fleet.layouts.entries()){
    const server=hardpoints[layout.id];
    assert.ok(server,layout.id+' authoritative mounts');
    assert.equal(layout.scale,1,layout.id+' exported mounts already include model scale');
    assert.deepEqual(layout.main,server.main,layout.id+' main mounts');
    assert.deepEqual(layout.tubes,server.tubes,layout.id+' missile mounts');
    assert.deepEqual(layout.tubeDirections,server.directions,layout.id+' missile directions');
    assert.deepEqual(layout.joints.filter(j=>j.role==='secondary').map(j=>j.mount),server.secondary,layout.id+' secondary mounts');
    assert.deepEqual(layout.joints.filter(j=>j.role==='pd').map(j=>j.mount),server.pd,layout.id+' point-defense mounts');
    const anchors=[...layout.main,...layout.tubes,...layout.engines.map(e=>e.position),...layout.joints.map(j=>j.mount)];
    const directions=[[-1,0,0],...layout.tubeDirections,...layout.engines.map(e=>e.direction)];
    for(const pose of poses){
      const matrix=renderMatrix(pose,index),origin=M.transform(matrix,[0,0,0]);
      for(const [n,anchor]of anchors.entries())close(M.transform(matrix,anchor),battleMount(pose,anchor),layout.id+' world anchor '+n);
      for(const [n,direction]of directions.entries())close(V.sub(M.transform(matrix,direction),origin),battleMount(pose,direction,true),layout.id+' world direction '+n);
    }
  }
});

test('articulated muzzle world positions follow their physical pivot and the server hull frame',()=>{
  const yawAxis=new Vector3(0,1,0),pitchAxis=new Vector3(0,0,1);
  let tested=0;
  for(const [index,layout]of fleet.layouts.entries())for(const original of layout.joints){
    for(const pose of poses){
      const model=renderMatrix(pose,index),rest=jointTransforms(M,model,{...original,yaw:0,pitch:0});
      for(const [yaw,pitch]of [[.37,.29],[-.61,.52]]){
        const joint={...original,yaw,pitch},actual=jointTransforms(M,model,joint);
        close(actual.base,rest.base,layout.id+' fixed turret base');
        close(M.transform(actual.base,[0,0,0]),battleMount(pose,joint.mount),layout.id+' turret mount');
        for(const muzzle of joint.muzzles){
          // Independent vector/axis-angle construction: pitch about the physical
          // barrel pivot, yaw about its seated base, then use the server frame.
          const local=new Vector3(...muzzle).sub(new Vector3(...joint.pivot))
            .applyAxisAngle(pitchAxis,-pitch).add(new Vector3(...joint.pivot))
            .applyAxisAngle(yawAxis,yaw).add(new Vector3(...joint.mount));
          close(M.transform(actual.barrels,muzzle),battleMount(pose,local.toArray()),layout.id+' articulated muzzle');
          const localDirection=new Vector3(-1,0,0).applyAxisAngle(pitchAxis,-pitch).applyAxisAngle(yawAxis,yaw);
          const tip=M.transform(actual.barrels,muzzle),ahead=M.transform(actual.barrels,[muzzle[0]-1,muzzle[1],muzzle[2]]);
          close(V.sub(ahead,tip),battleMount(pose,localDirection.toArray(),true),layout.id+' barrel direction');
          tested++;
        }
      }
    }
  }
  assert.ok(tested>0,'actual fleet turret data must be exercised');
});

function backendWithoutGPU(){
  const backend=Object.create(ThreeRenderBackend.prototype);
  Object.assign(backend,{_relative:new Float64Array(16),_blend:false,_depthWrite:true,_depthTest:true,_frontSide:false,time:20});
  backend._material=()=>null;
  backend._queue=(_geometry,_material,_kind,uniforms)=>{backend.captured=uniforms;};
  backend._dynamic=(_kind,data,_stride,_attributes,uniforms)=>{backend.capturedDynamic={data,uniforms};};
  return backend;
}

test('new GPU matrix and particle uploads retain precision after 100 million units of travel',()=>{
  const backend=backendWithoutGPU();
  const render=shift=>{
    backend.eye=[shift+5,shift+3,shift+8];
    backend.vp=M.mul(M.perspective(1,16/9,.08,22000),M.lookAt(backend.eye,[shift,shift,shift]));
    backend.drawMesh({geometry:{}},M.compose([shift+.1234,shift+.2345,shift+.3456],[.1,.3,0]));
    backend.dynamicFlat([shift+.1234,shift+.2345,shift+.3456,.2,.4,.6,3],true,.7);
    return {model:backend.captured.uModel,vp:backend.captured.uVP,eye:backend.captured.uEye,particle:backend.capturedDynamic.data,particleVP:backend.capturedDynamic.uniforms.uMatrix};
  };
  const baseline=render(0);
  for(const shift of [1e4,1e6,1e8]){
    const current=render(shift);
    for(const key of ['model','vp','particle','particleVP']){
      assert.ok(current[key] instanceof Float32Array,key+' must be the actual GPU upload type');
      close(current[key],baseline[key],key+' at '+shift,1e-6);
    }
    assert.deepEqual(current.eye,[0,0,0],'shading receives a camera-relative eye');
  }
});

test('fleet instance uploads preserve the already-relative matrix and authoritative slot ID',()=>{
  const backend=backendWithoutGPU(),geometry=new BufferGeometry();
  Object.assign(backend,{eye:[1e8+5,1e8+3,1e8+8],vp:M.identity(),instanceBatches:new Map(),shipMeshes:[{geometry}],scene:new Scene(),geometryResources:new Set(),_order:0});
  const relative=M.compose([1e8+.1234,1e8+.2345,1e8+.3456],[.1,.3,0]);
  for(let i=0;i<3;i++)relative[12+i]-=backend.eye[i];
  const matrices=new Float32Array(relative);
  try{
    backend.drawFleetInstances('attacker:fixture',0,matrices,[313],{high:true});
    const batch=backend.instanceBatches.get('attacker:fixture:high');
    assert.deepEqual([...batch.mesh.instanceMatrix.array.slice(0,16)],[...matrices],'the renderer must not subtract the camera twice');
    assert.deepEqual(batch.ids,[313]);assert.equal(batch.idToSlot.get(313),0);
    assert.equal(batch.mesh.count,1);
  }finally{backend.resetInstances();geometry.dispose();}
});

test('screen rays and world projection agree for centered, cinematic and archive cameras',()=>{
  const renderer=Object.create(Renderer.prototype);
  Object.assign(renderer,{width:1920,height:1080,fov:.92,eye:[5,-3,8],cameraForward:V.norm([.3,-.2,-1]),cameraUp:[0,1,0]});
  for(const [shiftX,shiftY]of [[0,0],[.12,-.22],[-.26,-.13]]){
    renderer.projectionShiftX=shiftX;renderer.projectionOffset=shiftY;
    const projection=M.perspective(renderer.fov,renderer.width/renderer.height,.08,22000,shiftX);projection[9]=shiftY;
    renderer.vp=M.mul(projection,M.lookAt(renderer.eye,V.add(renderer.eye,renderer.cameraForward),renderer.cameraUp));
    for(const [x,y]of [[123,97],[960,540],[1700,960]]){
      const ray=renderer.ray(x,y),projected=renderer.project(V.add(ray.origin,V.scale(ray.direction,1000)));
      assert.equal(projected.visible,true);close([projected.x,projected.y],[x,y],'ray/project '+[shiftX,shiftY,x,y],1e-6);
    }
  }
});
