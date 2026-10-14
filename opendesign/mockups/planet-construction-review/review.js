import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createReviewBuilding} from './building-models.js';
import {createResourceOperation} from './resource-operations.js';
import {BUILDINGS,districts,buildingDistrict,sampleSurface,ground,PLANET_RADIUS,DISTRICT_RADIUS,LAYOUT_VERSION} from './surface-layout.js';

const $=id=>document.getElementById(id),viewport=$('viewport'),Y=new THREE.Vector3(0,1,0);
const stateNames={running:'正常生产','low-power':'缺电',stopped:'停产',full:'仓满',unbuilt:'未建',construction:'施工',upgrading:'升级'};
const phases={outbound:'前往矿区',travel:'前往矿区',loading:'装载矿石',mining:'开采中',drilling:'钻采中',returning:'满载返程',return:'满载返程',inbound:'满载返程',unloading:'仓库卸货',parked:'已停靠',idle:'待机',stopped:'已停靠',walking:'行走中',to_mine:'前往矿区',to_storage:'运回仓库'};
const descriptions={metal:'矿车驶入露天矿场装载矿石，再沿道路运回金属仓库。两辆矿车错开作业。',crystal:'机器人走到晶簇前，放下电钻开采，然后携带晶体返回仓库卸货。',gas:'气井、泵站与储气设施通过管道连接。往复泵与压缩机共同演示抽气过程。'};
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(error){$('loading').textContent='无法启用三维显示，请开启浏览器硬件加速后重试。';throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0x080f18);renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
viewport.prepend(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.15,600);
camera.position.set(78,48,98);
let controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.dampingFactor=.08;controls.minDistance=43;controls.maxDistance=180;
function orbitUp(normal,focused){const target=controls.target.clone();controls.dispose();camera.up.copy(normal);controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.enablePan=false;controls.dampingFactor=.08;controls.minDistance=focused?5:43;controls.maxDistance=180;controls.minPolarAngle=focused?.12:0;controls.maxPolarAngle=focused?1.38:Math.PI;}
scene.add(new THREE.HemisphereLight(0xe5eddf,0x434d3f,2.25));
const sun=new THREE.DirectionalLight(0xffe2b6,3.1);sun.position.set(60,75,90);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.camera.near=1;sun.shadow.camera.far=250;sun.shadow.normalBias=.035;sun.shadow.bias=-.00015;
scene.add(sun,sun.target);
const fill=new THREE.DirectionalLight(0xc3d9e9,1.1);scene.add(fill);
const planet=new THREE.Group();scene.add(planet);
const m=(color,roughness=.86)=>new THREE.MeshStandardMaterial({color,roughness,flatShading:true});
const mats={pad:m(0x747e70),rim:m(0xb2b4a0),dark:m(0x344541),orange:m(0xdca160),beam:m(0x687b77),rock:m(0x929582),tree:m(0x637c4d),trunk:m(0x75644f)};

// Terrain and districts share a single radial surface. No detached landscape patch.
const geo=new THREE.SphereGeometry(PLANET_RADIUS,192,128),pos=geo.attributes.position,colors=[];
const sand=new THREE.Color(0xb2a37b),grass=new THREE.Color(0x7d925d),rock=new THREE.Color(0x8c9080),deep=new THREE.Color(0x526b70);
for(let i=0;i<pos.count;i++){
  const n=new THREE.Vector3().fromBufferAttribute(pos,i).normalize(),s=sampleSurface(n.toArray());
  pos.setXYZ(i,n.x*s.radius,n.y*s.radius,n.z*s.radius);
  const c=s.land<.06?deep.clone():sand.clone().lerp(grass,Math.min(1,Math.max(0,(s.land-.04)*2.2)));
  if(s.land>1)c.lerp(rock,Math.min(.7,(s.land-1)*2));
  c.multiplyScalar(.96+Math.sin(n.x*47+n.y*71+n.z*37)*.025);colors.push(c.r,c.g,c.b);
}
geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
const globe=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));globe.receiveShadow=true;planet.add(globe);
const sea=new THREE.Mesh(new THREE.SphereGeometry(PLANET_RADIUS+.035,128,80),new THREE.MeshStandardMaterial({color:0x375d67,roughness:.42,metalness:.12}));planet.add(sea);
const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(38,72,48),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,uniforms:{tint:{value:new THREE.Color(0x7eafbc)}},vertexShader:'varying vec3 n;varying vec3 v;void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);v=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform vec3 tint;varying vec3 n;varying vec3 v;void main(){float f=pow(1.-abs(dot(normalize(n),normalize(v))),4.);gl_FragColor=vec4(tint,f*.19);}'}));planet.add(atmosphere);
// Sparse distant stars, deliberately quiet behind the colony.
const starPositions=[];for(let i=0;i<650;i++){const a=i*2.39996,y=1-2*(i+.5)/650,r=Math.sqrt(1-y*y);starPositions.push(Math.cos(a)*r*240,y*240,Math.sin(a)*r*240);}
const stars=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3)),new THREE.PointsMaterial({color:0xa6b8c2,size:.28,transparent:true,opacity:.65}));scene.add(stars);

const boxGeo=new THREE.BoxGeometry(1,1,1),cylinderGeo=new THREE.CylinderGeometry(1,1,1,8);
function box(parent,w,h,d,x,y,z,material=mats.pad){const o=new THREE.Mesh(boxGeo,material);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function makeFoundation(b){
  const g=new THREE.Group(),[w,d]=b.footprint,y=ground(b.x,b.z);
  // Foundation overlaps terrain by a small amount; supporting feet follow curvature.
  box(g,w,.12,d,0,.005,0,mats.pad);
  for(const x of [-w*.43,w*.43])for(const z of [-d*.43,d*.43]){
    const terrain=ground(b.x+x,b.z+z)-y,h=Math.max(.05,.045-terrain);
    box(g,.12,h,.12,x,.045-h/2,z,mats.dark);
  }
  g.position.set(b.x,y+.035,b.z);g.quaternion.setFromUnitVectors(Y,new THREE.Vector3(b.x,DISTRICT_RADIUS+y,b.z).normalize());return g;
}
function scaffold(b,height){
  const g=new THREE.Group(),[w,d]=b.footprint;
  for(const x of [-w/2,w/2])for(const z of [-d/2,d/2])box(g,.038,height+.25,.038,x,(height+.25)/2,z,mats.orange);
  for(const y of [.35,height*.6,height+.1]){
    for(const z of [-d/2,d/2])box(g,w,.035,.055,0,y,z,mats.beam);
    for(const x of [-w/2,w/2])box(g,.055,.035,d,x,y,0,mats.beam);
  }
  box(g,.4,.22,.28,w*.35,.11,d*.65,mats.orange);return g;
}

const districtViews=new Map(),buildingViews=new Map(),pickables=[];
for(const def of districts){
  const root=new THREE.Group(),n=new THREE.Vector3(...def.direction);root.position.copy(n).multiplyScalar(DISTRICT_RADIUS);root.quaternion.setFromUnitVectors(Y,n);planet.add(root);
  const view={def,root,status:'running',storageBuilt:true,progress:.45,operation:null,buildings:[],label:document.createElement('button')};
  view.label.className='label'+(descriptions[def.id]?' resource':'');view.label.innerHTML=`<b>${String(def.index+1).padStart(2,'0')}</b>${def.name}`;view.label.onclick=()=>focus(def.id);$('labels').append(view.label);
  for(const b of def.buildings){
    const foundation=makeFoundation(b);foundation.userData.building=b.id;root.add(foundation);
    const model=createReviewBuilding(b.id);model.group.position.y=.065;foundation.add(model.group);
    const frame=scaffold(b,model.height);frame.visible=false;foundation.add(frame);
    const progressBack=box(frame,b.footprint[0],.08,.08,0,model.height+.35,b.footprint[1]/2,mats.dark);
    const progressFill=box(frame,b.footprint[0]*.45,.085,.09,-b.footprint[0]*.275,model.height+.35,b.footprint[1]/2,mats.orange);
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(b.footprint[0],.06,b.footprint[1])),new THREE.LineBasicMaterial({color:0xd5bf8b,transparent:true,opacity:.85}));outline.position.y=.1;foundation.add(outline);outline.visible=false;
    const hit=new THREE.Mesh(new THREE.BoxGeometry(b.footprint[0],model.height+.2,b.footprint[1]),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=model.height/2;hit.userData.building=b.id;foundation.add(hit);pickables.push(hit);
    const record={...b,foundation,model,frame,outline,progressFill,district:def.id};buildingViews.set(b.id,record);view.buildings.push(record);
  }
  if(descriptions[def.id]){view.operation=createResourceOperation(def.id,{ground});root.add(view.operation.group);}
  districtViews.set(def.id,view);
}

// Shared instancing keeps vegetation inexpensive; it stays outside all work sites.
const treeGeo=new THREE.ConeGeometry(.27,.85,5),rockGeo=new THREE.IcosahedronGeometry(.23,0),treeMatrices=[],rockMatrices=[];
const temp=new THREE.Object3D();for(let i=0;i<2800;i++){
  const y=1-2*(i+.5)/2800,a=i*2.399963,r=Math.sqrt(1-y*y),n=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r),s=sampleSurface(n.toArray());
  if(s.pad>.03||s.land<.3)continue;
  temp.position.copy(n).multiplyScalar(s.radius+.30);temp.quaternion.setFromUnitVectors(Y,n);temp.scale.setScalar(.7+(i%7)*.1);temp.updateMatrix();
  (i%5===0?rockMatrices:treeMatrices).push(temp.matrix.clone());
}
for(const [geometry,material,matrices]of [[treeGeo,mats.tree,treeMatrices],[rockGeo,mats.rock,rockMatrices]]){const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.receiveShadow=true;planet.add(mesh);}

let selected=null,selectedBuilding=null,paused=false,speed=1,showLabels=true,transition=null,elapsed=0,frameCount=0;
function travel(position,target,duration=1000){transition={from:camera.position.clone(),to:position,turn:new THREE.Quaternion().setFromUnitVectors(camera.position.clone().normalize(),position.clone().normalize()),targetFrom:controls.target.clone(),targetTo:target,start:performance.now(),duration:matchMedia('(prefers-reduced-motion:reduce)').matches?1:duration};}
function focus(id,buildingId=null){
  const view=districtViews.get(id);if(!view)return;
  selected=id;selectedBuilding=buildingId;
  const n=new THREE.Vector3(...view.def.direction),target=n.clone().multiplyScalar(DISTRICT_RADIUS),local=new THREE.Vector3(9,11,15).applyQuaternion(view.root.quaternion);
  orbitUp(n,true);
  travel(target.clone().add(local),target);
  sun.target.position.copy(target);sun.position.copy(target).add(new THREE.Vector3(8,22,8).applyQuaternion(view.root.quaternion));
  syncUI();
}
function overview(opposite=false){
  selected=null;selectedBuilding=null;orbitUp(Y,false);
  const direction=camera.position.clone().normalize();if(opposite)direction.negate();
  travel(direction.multiplyScalar(globalDistance()),new THREE.Vector3());sun.position.set(60,75,90);sun.target.position.set(0,0,0);syncUI();
}
function applyState(view){
  view.operation?.setState({status:view.status,storageBuilt:view.storageBuilt});
  for(const b of view.buildings){
    const absent=(b.id.endsWith('_Storage')&&!view.storageBuilt)||view.status==='unbuilt',construction=view.status==='construction';
    b.model.group.visible=!absent&&!construction;b.frame.visible=!absent&&(construction||view.status==='upgrading');b.outline.visible=absent||construction;
  }
}
function changeStatus(status){if(!(status in stateNames))return;for(const view of districtViews.values())if(!selected||view.def.id===selected){view.status=status;applyState(view);}syncUI();}
function setStorage(built){for(const view of districtViews.values())if((!selected||view.def.id===selected)&&view.operation){view.storageBuilt=built;applyState(view);}syncUI();}
function syncUI(){
  const view=districtViews.get(selected),building=buildingViews.get(selectedBuilding);
  $('selection-title').textContent=building?.name||view?.def.name||'类地星建设样板';
  $('selection-description').textContent=selected?(descriptions[selected]||'建筑位于固定地表槽位。可检查施工与原址升级，拖动镜头观察基础和地形的连接。'):'建筑分散在整个球面。选择一个矿区，观察从采集到卸货的完整过程。';
  $('view-title').textContent=building?.name||view?.def.name||'全球建设布局';$('view-caption').textContent=view?'固定槽位 / '+stateNames[view.status]+' / 独立验收':'14 个建设区 / 17 种建筑 / 固定槽位';
  $('status').value=view?.status||[...districtViews.values()][0].status;$('storage').checked=view?.storageBuilt??true;$('storage').disabled=!!view&&!view.operation;
  $('progress').value=(view?.progress??.45)*100;$('progress-value').textContent=Math.round((view?.progress??.45)*100)+'%';
  $('mode-label').textContent=paused?'动画已暂停':stateNames[view?.status||'running'];
  $('progress-wrap').hidden=!['construction','upgrading'].includes(view?.status||$('status').value);
  document.querySelectorAll('[data-focus]').forEach(b=>b.classList.toggle('active',b.dataset.focus===selected));
  for(const v of districtViews.values())v.label.classList.toggle('selected',v.def.id===selected);
  for(const button of document.querySelectorAll('[data-building]')){const b=buildingViews.get(button.dataset.building),v=districtViews.get(b.district);button.classList.toggle('active',selectedBuilding===b.id);button.querySelector('span').textContent=(b.id.endsWith('_Storage')&&!v.storageBuilt)?'未建':stateNames[v.status];}
  updateActivity();
}
function updateActivity(){
  const view=districtViews.get(selected);if(!view?.operation){$('activity').textContent=view?stateNames[view.status]+' · 固定槽位':'选择矿区查看采集进度。';return;}
  const s=view.operation.getState(),agents=s.agents||s.vehicles||s.workers||[];
  if(selected==='gas'){$('activity').innerHTML=`<div class="activity-row"><b>抽气泵 / 压缩机</b><span>${paused?'已暂停':s.pump?.running?'循环运转':'已停止'}</span></div><div class="activity-row"><b>输气管线</b><span>${view.storageBuilt?'气井 → 提取站 → 储气站':'气井 → 提取站临时储罐'}</span></div>`;return;}
  $('activity').innerHTML=agents.map((a,i)=>`<div class="activity-row"><b>${selected==='metal'?'矿车':'机器人'} ${String(i+1).padStart(2,'0')}</b><span>${a.phase==='loading'&&selected==='crystal'?'钻采晶体':phases[a.phase]||a.phase||'作业中'}${a.cargo?' · 载货':''}</span></div>`).join('')+`<p class="hint">卸货点：${view.storageBuilt?'配套仓库':'矿场临时卸料点'} · ${paused?'已暂停':speed+'× 播放'}</p>`;
}
for(const [id,name]of BUILDINGS){const button=document.createElement('button');button.dataset.building=id;button.innerHTML=name+'<span>正常生产</span>';button.onclick=()=>focus(buildingDistrict(id).id,id);$('building-list').append(button);}
document.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>focus(b.dataset.focus));
$('overview').onclick=()=>overview();$('opposite').onclick=()=>overview(true);
$('labels-toggle').onclick=()=>{showLabels=!showLabels;$('labels-toggle').textContent='地名 '+(showLabels?'开':'关');$('labels-toggle').setAttribute('aria-pressed',String(showLabels));};
$('status').onchange=e=>changeStatus(e.target.value);$('storage').onchange=e=>setStorage(e.target.checked);
$('speed').onchange=e=>speed=Number(e.target.value);
$('pause').onclick=()=>{paused=!paused;$('pause').textContent=paused?'继续动画':'暂停动画';$('pause').setAttribute('aria-pressed',String(paused));syncUI();};
$('progress').oninput=e=>{const p=Number(e.target.value)/100;$('progress-value').textContent=e.target.value+'%';for(const v of districtViews.values())if(!selected||v.def.id===selected){v.progress=p;for(const b of v.buildings){b.progressFill.scale.x=b.footprint[0]*Math.max(.001,p);b.progressFill.position.x=-b.footprint[0]*(1-p)/2;}}if(p===1)changeStatus('running');};
$('reset').onclick=()=>{for(const view of districtViews.values()){view.status='running';view.storageBuilt=true;applyState(view);}paused=false;speed=1;$('speed').value='1';$('pause').textContent='暂停动画';$('pause').setAttribute('aria-pressed','false');overview();};
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerDown=null;
renderer.domElement.addEventListener('pointerdown',e=>pointerDown=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects([globe,sea,...pickables],false);const first=hits[0];if(first?.object.userData.building){const id=first.object.userData.building;focus(buildingDistrict(id).id,id);}});
function globalDistance(){const half=Math.min(THREE.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));return 38/Math.sin(half)*1.16;}
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!selected&&!transition)camera.position.setLength(globalDistance());}
new ResizeObserver(resize).observe(viewport);resize();
function renderLabels(){
  const viewDirection=camera.position.clone().normalize(),projected=new THREE.Vector3();
  for(const view of districtViews.values()){
    const normal=new THREE.Vector3(...view.def.direction),front=normal.dot(viewDirection)>PLANET_RADIUS/camera.position.length()+.02;
    const closeEnough=!selected||view.def.id===selected;
    view.root.visible=front||view.def.id===selected;
    projected.copy(normal).multiplyScalar(DISTRICT_RADIUS+2.7).project(camera);
    const py=(-projected.y*.5+.5)*viewport.clientHeight;
    const visible=showLabels&&front&&closeEnough&&Math.abs(projected.x)<.92&&py>82&&py<viewport.clientHeight-87&&projected.z<1;
    view.label.hidden=!visible;if(visible){view.label.style.left=(projected.x*.5+.5)*viewport.clientWidth+'px';view.label.style.top=(-projected.y*.5+.5)*viewport.clientHeight+'px';}
  }
}
function tick(dt){
  if(paused)return;const scaled=dt*speed;elapsed+=scaled;
  for(const view of districtViews.values()){
    view.operation?.update(scaled);
    const active=['running','upgrading','low-power'].includes(view.status),mult=view.status==='low-power'?.3:1;
    if(active)for(const b of view.buildings)for(const a of b.model.animations||[])a.mesh.rotation[a.axis]+=scaled*a.speed*mult;
  }
}
let last=performance.now(),lastUI=0;
function frame(now){
  requestAnimationFrame(frame);const dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;if(document.hidden)return;
  tick(dt);
  if(transition){let t=Math.min(1,(now-transition.start)/transition.duration);t=t*t*(3-2*t);const rotation=new THREE.Quaternion().slerp(transition.turn,t);camera.position.copy(transition.from).normalize().applyQuaternion(rotation).multiplyScalar(THREE.MathUtils.lerp(transition.from.length(),transition.to.length(),t));controls.target.lerpVectors(transition.targetFrom,transition.targetTo,t);camera.lookAt(controls.target);if(t>=1){transition=null;controls.update();}}
  else controls.update();if(camera.position.length()<PLANET_RADIUS+2)camera.position.setLength(PLANET_RADIUS+2);
  fill.position.copy(camera.position);renderLabels();renderer.render(scene,camera);frameCount++;
  if(now-lastUI>400){lastUI=now;updateActivity();$('render-stats').textContent=`${renderer.info.render.calls} 次绘制 / ${(renderer.info.render.triangles/1000).toFixed(0)}k 三角面`;}
}
window.ColonyReview={focus,overview,setStatus:changeStatus,setStorage,setPaused:v=>{paused=v;syncUI();},setSpeed:v=>speed=v,step:dt=>{const saved=paused;paused=false;tick(dt);paused=saved;updateActivity();},getState:()=>({layoutVersion:LAYOUT_VERSION,selected,selectedBuilding,paused,speed,elapsed,frameCount,buildings:buildingViews.size,districts:[...districtViews.values()].map(v=>({id:v.def.id,status:v.status,storageBuilt:v.storageBuilt,direction:v.def.direction,operation:v.operation?.getState()})),camera:camera.position.toArray(),memory:{...renderer.info.memory},render:{...renderer.info.render}}),renderer,scene,camera};
syncUI();$('loading').hidden=true;requestAnimationFrame(frame);
