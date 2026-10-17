import React,{useEffect,useRef,useState} from 'react';
import {asset} from './data.mjs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {prepareShipPreviewMaterials} from '../../scripts/three-flight/ship-preview-materials.js';
import {RotateCcw,Rotate3D,Maximize} from 'lucide-react';

export default function Stage({id,name,planet,grounded=false,staticArt=false}){
 const mount=useRef(null),runtime=useRef(null),[ready,setReady]=useState(false),[error,setError]=useState(false),[auto,setAuto]=useState(false);
 useEffect(()=>{
  if(staticArt)return;
  const el=mount.current;let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setError(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0x10191c,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,200);
  camera.position.set(-9,7,-11);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=22;controls.maxPolarAngle=Math.PI*.78;controls.autoRotate=false;controls.autoRotateSpeed=.35;
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xc8e5eb,0x17221e,1.1));
  const key=new THREE.DirectionalLight(0xdce9ee,3);key.position.set(3,8,4);scene.add(key);
  const rim=new THREE.DirectionalLight(0x8ccfbb,1.8);rim.position.set(-5,2,-4);scene.add(rim);
  const amber=new THREE.PointLight(0xe5ba75,30,30);amber.position.set(-6,3,4);scene.add(amber);
  const grid=new THREE.GridHelper(25,25,0x47645a,0x233830);grid.position.y=-2.2;grid.material.transparent=true;grid.material.opacity=.3;scene.add(grid);
  const ring=new THREE.Mesh(new THREE.RingGeometry(4.3,4.32,100),new THREE.MeshBasicMaterial({color:0x84baa7,side:THREE.DoubleSide,transparent:true,opacity:.32}));ring.rotation.x=-Math.PI/2;ring.position.y=-2.18;scene.add(ring);
  const state={scene,camera,controls,renderer,model:null,fit:null};
  const resize=()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();state.fit?.();};
  const observer=new ResizeObserver(resize);observer.observe(el);resize();
  runtime.current=state;
  let frame,last=0;function draw(t){frame=requestAnimationFrame(draw);if(t-last<26||document.hidden)return;last=t;controls.update();renderer.render(scene,camera);}frame=requestAnimationFrame(draw);
  return ()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});env.dispose();renderer.dispose();renderer.domElement.remove();runtime.current=null;};
 },[staticArt]);
 useEffect(()=>{if(runtime.current)runtime.current.controls.autoRotate=auto;},[auto,staticArt]);
 useEffect(()=>{
  const state=runtime.current;if(!state)return;
  let cancelled=false;setReady(false);setError(false);
  const dispose=model=>model?.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});
  state.fit=null;
  if(state.model){state.scene.remove(state.model);dispose(state.model);state.model=null;}
  new GLTFLoader().load(asset('models',id),g=>{
   if(cancelled){dispose(g.scene);return;}
   const model=g.scene,box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
   model.position.sub(center);const group=new THREE.Group();group.add(model);group.scale.setScalar(8/Math.max(size.x,size.y,size.z));
   if(grounded)group.position.y=-2.18+size.y*group.scale.x/2;
   // Ships are normalized to 8 units with a minimum orbit distance of 8. Keep
   // the near plane out of the precision-starved range without clipping the hull.
   state.camera.near=grounded?.1:.5;state.camera.updateProjectionMatrix();
   // Keep each model's authored material colors, emissive surfaces and vertex colors.
   if(!grounded)prepareShipPreviewMaterials(model);
   model.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});
   state.model=group;state.scene.add(group);
   if(grounded){
    const sphere=new THREE.Box3().setFromObject(group).getBoundingSphere(new THREE.Sphere());
    state.fit=()=>{const vertical=THREE.MathUtils.degToRad(state.camera.fov),horizontal=2*Math.atan(Math.tan(vertical/2)*state.camera.aspect),distance=sphere.radius/Math.sin(Math.min(vertical,horizontal)/2)*1.15;state.controls.target.copy(sphere.center);state.controls.minDistance=distance*.45;state.controls.maxDistance=distance*2.5;state.camera.position.copy(sphere.center).add(new THREE.Vector3(-9,7,-11).normalize().multiplyScalar(distance));state.controls.update();};
    state.fit();
   }else{state.camera.position.set(-9,7,-11);state.controls.target.set(0,0,0);state.controls.minDistance=8;state.controls.maxDistance=22;state.controls.update();}
   setReady(true);
  },undefined,()=>{if(!cancelled)setError(true);});
  return()=>{cancelled=true;};
 },[id,staticArt,grounded]);
 const reset=()=>{const s=runtime.current;if(s?.fit)s.fit();else if(s){s.camera.position.set(-9,7,-11);s.controls.target.set(0,0,0);s.controls.update();}};
 return <div className="ship-stage"><div className="stage-orbit orbit-one"></div><div className="stage-orbit orbit-two"></div><div className="stage-canvas" ref={mount} aria-label={grounded?'防御设施三维预览，可拖拽旋转和滚轮缩放':'舰船三维预览，可拖拽旋转和滚轮缩放'}></div>{!staticArt&&!ready&&!error&&<div className="stage-loading"><span className="loading-ring"></span>正在准备三维模型</div>}{(staticArt||error)&&<img className="stage-fallback" src={asset('ships',id)} alt={name}/>}<div className="stage-coordinate"><span>{grounded?'PLANETARY DEFENSE':'ORBITAL DOCK / 07'}</span><span>{planet.name} · {grounded?'行星防御':'同步轨道'}</span></div>{!staticArt&&<div className="stage-controls"><span><Rotate3D size={14}/>拖动旋转 · 滚轮缩放</span><button title="复位视角" aria-label={grounded?'复位防御设施视角':'复位舰船视角'} onClick={reset}><Maximize size={16}/></button><button title="自动旋转" aria-label="自动旋转" aria-pressed={auto} className={auto?'active':''} onClick={()=>setAuto(v=>!v)}><RotateCcw size={16}/></button></div>}</div>;
}
