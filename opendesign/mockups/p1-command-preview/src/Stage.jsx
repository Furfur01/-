import React,{useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {RotateCcw,Rotate3D} from 'lucide-react';

export default function Stage({id,image,model=true}){
 const mount=useRef(null),rt=useRef(null),[ready,setReady]=useState(false),[error,setError]=useState(false);
 useEffect(()=>{
  if(!model)return;const el=mount.current;let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setError(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  el.appendChild(renderer.domElement);const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(9,6,10);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=8;controls.maxDistance=22;
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xd9efe6,0x22322b,2));const key=new THREE.DirectionalLight(0xffefd4,3);key.position.set(4,9,5);scene.add(key);
  const grid=new THREE.GridHelper(26,26,0x4f7063,0x263a31);grid.position.y=-2.4;grid.material.transparent=true;grid.material.opacity=.35;scene.add(grid);
  const state={scene,camera,controls,renderer,model:null};rt.current=state;
  const resize=()=>{const r=el.getBoundingClientRect();renderer.setSize(Math.max(1,r.width),Math.max(1,r.height));camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  let frame;const draw=()=>{frame=requestAnimationFrame(draw);if(document.hidden)return;controls.update();renderer.render(scene,camera);};draw();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});env.dispose();renderer.dispose();renderer.domElement.remove();rt.current=null;};
 },[model]);
 useEffect(()=>{
  setReady(false);setError(false);const state=rt.current;if(!model)return;if(!state){setError(true);return;}let cancelled=false;
  const dispose=g=>g.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});
  if(state.model){state.scene.remove(state.model);dispose(state.model);state.model=null;}
  new GLTFLoader().load(`assets/models/${id}.glb`,g=>{if(cancelled){dispose(g.scene);return;}const box=new THREE.Box3().setFromObject(g.scene),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());g.scene.position.sub(center);const group=new THREE.Group();group.add(g.scene);group.scale.setScalar(6.5/Math.max(size.x,size.y,size.z));state.scene.add(group);state.model=group;setReady(true);},undefined,()=>{if(!cancelled)setError(true);});
  return()=>{cancelled=true;};
 },[id,model]);
 return <div className="model-stage"><div ref={mount} className="model-canvas" aria-label="三维模型，可拖动旋转和滚轮缩放"/>{(!model||error)&&<img className="model-fallback" src={image} alt="设施预览"/>}{model&&!ready&&!error&&<div className="model-loading">正在载入模型…</div>}<div className="stage-caption"><span><Rotate3D size={14}/>{model&&!error?'拖动旋转 · 滚轮缩放':'设施图像预览'}</span>{model&&!error&&<button className="icon-button" aria-label="复位模型视角" onClick={()=>{const s=rt.current;if(s){s.camera.position.set(9,6,10);s.controls.target.set(0,0,0);}}}><RotateCcw size={15}/></button>}</div></div>;
}
