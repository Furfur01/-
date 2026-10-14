import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createBuildingModel} from './planet-buildings.js';

const models=[
  ['Metal_Mine','金属矿','熔炼炉、红色粗管与排烟筒，前方保留开放熔池和装卸口。'],
  ['Crystal_Mine','晶体矿','高位晶簇料斗连接加工机组，前方以带齿滚筒和矿石辨识开采功能。'],
  ['Gas_Mine','气体矿','高机房与双排气系统，侧面储罐、水槽和管路形成完整的提炼装置。'],
  ['Solar_Plant','太阳能电站','两面拱形光伏阵列包围中央机房，细分电池格、连接器与外围变电设施。'],
  ['Metal_Storage','金属仓库','厚重工业箱体、顶部熔光窗口与斜面装卸舱门，保留原图的密闭轮廓。'],
  ['Crystal_Storage','晶体仓库','根据原图重建储存主体、独立模块和可辨识的蓝色晶体结构。'],
  ['Gas_Storage','气体仓库','成组压力容器连接输送管路，加入阀门、检修结构与安全标识。'],
  ['Robotics_Facility','机器人厂','传送带穿过前方半圆机壳，后方加工桥与机械机构表现自动化生产。'],
  ['Shipyard','飞船基地','圆拱船坞与高架停机坪组成上下两层，辅以舱门、储罐和导航灯。'],
  ['Research_Lab','研究实验室','三座大小不同的蓝色玻璃穹顶，通过基座、通道和天线构成研究设施。'],
  ['Radar_Facility','雷达站','四脚支撑环形基座与细高塔，金色球体和双竖板构成独特的探测阵列。'],
  ['Fusion_Reactor','核电站','下沉环形反应井、铜色管路与独立圆盘高塔，突出能量核心与输送结构。']
];
const $=s=>document.querySelector(s),stage=$('#stage'),shared={};
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setClearColor(0x0d1d26,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;stage.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.03,100);scene.add(new THREE.HemisphereLight(0xc7e5fa,0x29404a,1.75));
const environmentGenerator=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=environmentGenerator.fromScene(room,.04).texture;scene.environmentIntensity=.38;room.dispose();environmentGenerator.dispose();
const sun=new THREE.DirectionalLight(0xfff0d8,4.2);sun.position.set(-4,7,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-3,right:3,top:4,bottom:-3,near:.1,far:20});sun.shadow.bias=-.0003;sun.shadow.normalBias=.012;scene.add(sun);
const rim=new THREE.DirectionalLight(0x91cde4,1.7);rim.position.set(3,4,-4);scene.add(rim);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.ShadowMaterial({color:0x000000,opacity:.24}));ground.rotation.x=-Math.PI/2;ground.position.y=-.015;ground.receiveShadow=true;scene.add(ground);
const circle=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:128},(_,i)=>new THREE.Vector3(Math.cos(i/128*Math.PI*2)*1.6,0,Math.sin(i/128*Math.PI*2)*1.6))),new THREE.LineBasicMaterial({color:0x90b2bc,transparent:true,opacity:.13}));scene.add(circle);
const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.maxPolarAngle=Math.PI*.49;controls.minDistance=1.5;controls.maxDistance=15;controls.autoRotateSpeed=.65;
let current=null,selected=0,view='perspective',wireframe=false,clock=0,last=performance.now(),fitDistance=5,target=new THREE.Vector3();
$('#building-list').innerHTML=models.map(([id,name],i)=>`<button data-model="${id}" class="${i?'':'active'}"><span>${String(i+1).padStart(2,'0')}</span>${name}</button>`).join('');
function inspect(angle='perspective'){
  view=angle;const direction=angle==='front'?new THREE.Vector3(0,.15,1):angle==='side'?new THREE.Vector3(1,.15,0):angle==='top'?new THREE.Vector3(0,1,.001):new THREE.Vector3(1,.76,1.35);camera.position.copy(target).add(direction.normalize().multiplyScalar(fitDistance));controls.target.copy(target);controls.update();document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===angle));
}
function select(id){
  const index=models.findIndex(m=>m[0]===id);if(index<0)return;selected=index;if(current)scene.remove(current.group);
  current=createBuildingModel(THREE,id,1,shared);current.group.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;o.material.wireframe=wireframe;}});scene.add(current.group);
  const bounds=new THREE.Box3().setFromObject(current.group);bounds.getCenter(target);const size=bounds.getSize(new THREE.Vector3()),radius=size.length()*.5;
  const fov=camera.fov*Math.PI/180,angle=Math.min(fov/2,Math.atan(Math.tan(fov/2)*camera.aspect));fitDistance=radius/Math.sin(angle)*1.12;controls.maxDistance=fitDistance*2.5;inspect('perspective');
  const [,name,description]=models[index];$('#model-title').textContent=name;$('#model-index').textContent=String(index+1).padStart(2,'0')+' / 12';$('#model-english').textContent=id.replaceAll('_',' ').toUpperCase();$('#model-description').textContent=description;
  $('#reference-image').src='../galaxy-empire/assets/original/buildings/'+id+'.png';$('#reference-image').alt=name+' · APK 解包原图';document.querySelectorAll('[data-model]').forEach(b=>b.classList.toggle('active',b.dataset.model===id));
  let triangles=0;current.group.traverse(o=>{if(o.isMesh)triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);});$('#model-stats').textContent=Math.round(triangles).toLocaleString()+' TRIANGLES';$('#export-status').textContent='';$('#model-loading').hidden=true;
}
function plainMeshTree(node){
  let copy;
  if(node.isInstancedMesh){copy=new THREE.Group();copy.name=node.name;copy.position.copy(node.position);copy.quaternion.copy(node.quaternion);copy.scale.copy(node.scale);const matrix=new THREE.Matrix4();for(let i=0;i<node.count;i++){const mesh=new THREE.Mesh(node.geometry,node.material);node.getMatrixAt(i,matrix);matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);copy.add(mesh);}}
  else copy=node.clone(false);for(const child of node.children)copy.add(plainMeshTree(child));return copy;
}
async function exportModel(id=models[selected][0]){
  if(!models.some(m=>m[0]===id))throw Error('未知建筑');const model=createBuildingModel(THREE,id,1,shared),root=plainMeshTree(model.group);root.name=id;root.userData={name:models.find(m=>m[0]===id)[1],reference:'APK building sprite',units:'building-local units'};
  return new GLTFExporter().parseAsync(root,{binary:true,onlyVisible:true,trs:true});
}
$('#building-list').addEventListener('click',e=>{const b=e.target.closest('[data-model]');if(b)select(b.dataset.model);});
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>inspect(b.dataset.view));
$('#auto-rotate').onclick=()=>{controls.autoRotate=!controls.autoRotate;$('#auto-rotate').setAttribute('aria-pressed',String(controls.autoRotate));};
$('#wireframe').onclick=()=>{wireframe=!wireframe;for(const material of shared.buildingResources.materials.values())material.wireframe=wireframe;$('#wireframe').setAttribute('aria-pressed',String(wireframe));};
$('#reset-view').onclick=()=>{controls.autoRotate=false;$('#auto-rotate').setAttribute('aria-pressed','false');inspect();};
$('#export-model').onclick=async()=>{const button=$('#export-model');button.disabled=true;$('#export-status').textContent='正在导出…';try{const result=await exportModel(),url=URL.createObjectURL(new Blob([result],{type:'model/gltf-binary'})),a=document.createElement('a');a.href=url;a.download=models[selected][0]+'.glb';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$('#export-status').textContent='已导出标准 GLB 模型';}catch(e){$('#export-status').textContent=e.message;}finally{button.disabled=false;}};
function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);if(current)select(models[selected][0]);}
new ResizeObserver(resize).observe(stage);resize();select(models[0][0]);
renderer.setAnimationLoop(now=>{const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;clock+=dt;for(const a of current?.animations||[])if(a.kind==='rotate')a.mesh.rotation[a.axis||'y']+=dt*(a.speed||.5);controls.update();renderer.render(scene,camera);});
window.BuildingAtlas={models,select,exportModel,get current(){return current;},renderer,scene,camera,controls};
