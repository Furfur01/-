import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createPlanet,entries,inspectModel} from './models.js';

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.append(renderer.domElement);
const pmrem=new THREE.PMREMGenerator(renderer),environment=new RoomEnvironment(),env=pmrem.fromScene(environment,.04).texture;environment.dispose();
const objects=entries.map(e=>createPlanet(e.id));
function sceneWith(model){
  const scene=new THREE.Scene();scene.environment=env;scene.environmentIntensity=.5;
  scene.add(model,new THREE.HemisphereLight(0xc6e5ff,0x263044,1.15));
  for(const [color,power,pos]of [[0xfff1e0,2.5,[3,4,5]],[0x8abaff,1.3,[-4,1,1]],[0xa3caff,1.8,[1,2,-4]]]){const light=new THREE.DirectionalLight(color,power);light.position.set(...pos);scene.add(light);}return scene;
}
const gallery=document.getElementById('gallery'),views=[];
entries.forEach((entry,i)=>{
  const card=document.createElement('article');card.className='card';card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',entry.name);card.style.setProperty('--accent',entry.color);
  card.innerHTML=`<h2><span class="dot">${String(i+1).padStart(2,'0')}</span> &nbsp;${entry.name}</h2><small>APK ${entry.ref}</small><div class="thumb"></div><footer><span>${entry.tag}</span><span>查看 ↗</span></footer>`;
  gallery.append(card);const model=objects[i].clone(true);model.rotation.set(.09,-.28,0);const scene=sceneWith(model),camera=new THREE.PerspectiveCamera(34,1,.1,30);camera.position.set(0,.22,4.9);camera.lookAt(0,0,0);
  views.push({scene,camera,model,element:card.querySelector('.thumb')});card.onclick=()=>select(i);card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(i);}};
});
const main=document.getElementById('main-view'),mainScene=sceneWith(new THREE.Group()),camera=new THREE.PerspectiveCamera(35,1,.1,40);camera.position.set(0,.35,4.65);
const controls=new OrbitControls(camera,main);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=2.5;controls.maxDistance=8;controls.autoRotate=true;controls.autoRotateSpeed=.45;
let current=null,index=4,wire=false;
function select(i){
  index=i;if(current)mainScene.remove(current);current=objects[i];current.rotation.set(.09,-.28,0);mainScene.add(current);const e=entries[i];
  document.getElementById('name').textContent=e.name;document.getElementById('description').textContent=e.description;
  document.getElementById('reference').src=`./references/apk-${e.ref}.png`;document.getElementById('reference-label').textContent=`planet_Icon_${e.ref}`;
  document.getElementById('download').href=`./${e.id}.glb`;const info=inspectModel(current);document.getElementById('metrics').textContent=`${info.triangles.toLocaleString()} 三角形 · ${info.meshes} 材质网格 · GLB`;
  [...gallery.children].forEach((card,j)=>{card.classList.toggle('active',i===j);card.setAttribute('aria-pressed',String(i===j));});
  current.traverse(o=>{if(o.isMesh)o.material.wireframe=wire;});reset();
}
function reset(){camera.position.set(0,.35,4.65);controls.target.set(0,0,0);controls.update();}
document.getElementById('rotate').onclick=e=>{controls.autoRotate=!controls.autoRotate;e.currentTarget.setAttribute('aria-pressed',String(controls.autoRotate));};
document.getElementById('wire').onclick=e=>{wire=!wire;e.currentTarget.setAttribute('aria-pressed',String(wire));current.traverse(o=>{if(o.isMesh)o.material.wireframe=wire;});};
document.getElementById('reset').onclick=reset;
function draw(scene,cam,element){const r=element.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||!r.width||!r.height)return;cam.aspect=r.width/r.height;cam.updateProjectionMatrix();renderer.setViewport(r.left,innerHeight-r.bottom,r.width,r.height);renderer.setScissor(r.left,innerHeight-r.bottom,r.width,r.height);renderer.render(scene,cam);}
let last=0;function render(time=0){requestAnimationFrame(render);if(time-last<30)return;last=time;controls.update();renderer.setScissorTest(false);renderer.setClearColor(0,0);renderer.clear();renderer.setScissorTest(true);for(const view of views)draw(view.scene,view.camera,view.element);draw(mainScene,camera,main);}
window.addEventListener('resize',()=>renderer.setSize(innerWidth,innerHeight));select(4);requestAnimationFrame(render);
// Review automation observes these same live meshes and controls.
window.npcReview={ready:true,entries,select,inspect:()=>objects.map((o,i)=>({id:entries[i].id,...inspectModel(o)})),pause:()=>{controls.autoRotate=false;document.getElementById('rotate').setAttribute('aria-pressed','false');},view:(x,y,z)=>{camera.position.set(x,y,z);controls.update();},current:()=>entries[index].id};
