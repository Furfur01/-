import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createLandscape,seededRandom,GAS_RADIUS,GAS_CENTER_Y} from './planet-terrain.js';
import {createBuildingModel} from './planet-buildings.js';
import {createFloatingPlatform} from './planet-platform.js';
import {planetType} from '../../../game/planet-types.mjs';

const Y=new THREE.Vector3(0,1,0);
const colonyPlots={Command_Center:[0,0],Metal_Mine:[-3.75,0],Metal_Storage:[-2.3,0],Crystal_Mine:[-3.75,-2.6],Crystal_Storage:[-2.3,-2.6],Gas_Mine:[-3.75,2.6],Gas_Storage:[-2.3,2.6],Solar_Plant:[2.2,-2.7],Fusion_Reactor:[4.6,-2.7],Robotics_Facility:[2.2,-.4],Shipyard:[3.5,3],Research_Lab:[.6,3],Radar_Facility:[4.6,-.4],Alliance_Depot:[.4,5.4],Nanite_Factory:[2.2,5.4],Terraformer:[-2,5],Missile_Silo:[4.6,5.4]};
const resourceMines=['Metal_Mine','Crystal_Mine','Gas_Mine'],resourceStores=['Metal_Storage','Crystal_Storage','Gas_Storage'];
class PlanetScene{
  constructor(container,{onBuilding,onApproach}={}){
    Object.assign(this,{container,onBuilding,onApproach,mode:'home',active:true,close:true,selected:null,animations:[],labels:[],buildings:{},shared:{},time:0});
    this.appearance='terrestrial';this.terrainScale=5;this.centerY=-24;
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));this.renderer.setClearColor(0x06121d,0);this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.08;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFShadowMap;
    container.append(this.renderer.domElement);this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(40,1,.07,1800);this.camera.position.set(10,12,19);
    this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.075;this.controls.enablePan=false;this.controls.rotateSpeed=.58;this.controls.zoomSpeed=.65;this.controls.minDistance=9;this.controls.maxDistance=42;
    this.controls.addEventListener('start',()=>{this.transition=null;});
    this.scene.add(new THREE.HemisphereLight(0xc2deff,0x14291c,1.4));
    this.sun=new THREE.DirectionalLight(0xfff0d2,3.8);this.sun.position.set(-12,25,12);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:85});this.sun.shadow.bias=-.0003;this.sun.shadow.normalBias=.018;this.scene.add(this.sun);
    const fill=new THREE.DirectionalLight(0x83b7e7,.65);fill.position.set(10,2,-12);this.scene.add(fill);
    this.home=new THREE.Group();this.scene.add(this.home);this.makeStars();this.landscape=createLandscape(THREE);this.home.add(this.landscape.group);this.globe=this.landscape.globe;
    this.city=new THREE.Group();this.platform=new THREE.Group();this.home.add(this.city,this.platform);this.makeOrbital();
    this.selector=new THREE.Mesh(new THREE.RingGeometry(.51,.535,64),new THREE.MeshBasicMaterial({color:0x9ffff2,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));this.selector.visible=false;this.home.add(this.selector);
    this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.bind();this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
    this.last=performance.now();this.renderer.setAnimationLoop(t=>this.frame(t));
    document.addEventListener('visibilitychange',()=>this.renderer.setAnimationLoop(document.hidden||!this.active?null:t=>this.frame(t)));
  }
  makeStars(){
    const random=seededRandom(413),positions=[],colors=[];
    for(let i=0;i<1700;i++){const y=random()*2-1,a=random()*Math.PI*2,r=Math.sqrt(1-y*y);positions.push(Math.cos(a)*r*600,y*600,Math.sin(a)*r*600);const c=new THREE.Color().setHSL(.56+random()*.12,.1+random()*.2,.45+random()*.45);colors.push(c.r,c.g,c.b);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));this.stars=new THREE.Points(geo,new THREE.PointsMaterial({size:.6,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,fog:false}));this.scene.add(this.stars);
  }
  makeOrbital(){
    this.orbital=new THREE.Group();this.home.add(this.orbital);const curve=new THREE.EllipseCurve(0,0,8.4,8.4,0,Math.PI*2);
    const path=curve.getPoints(180).map(p=>new THREE.Vector3(p.x,0,p.y));this.orbitLine=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(path),new THREE.LineBasicMaterial({color:0x9ebeca,transparent:true,opacity:.12}));this.orbitLine.rotation.z=.34;this.orbital.add(this.orbitLine);
    const hull=new THREE.MeshStandardMaterial({color:0xccd5d2,metalness:.6,roughness:.4}),solar=new THREE.MeshStandardMaterial({color:0x133454,metalness:.55,roughness:.32});
    this.satellite=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.3,8),hull);body.rotation.z=Math.PI/2;this.satellite.add(body);
    for(const side of[-1,1]){const panel=new THREE.Mesh(new THREE.BoxGeometry(.45,.012,.26),solar);panel.position.x=side*.34;this.satellite.add(panel);for(let i=0;i<5;i++){const strip=new THREE.Mesh(new THREE.BoxGeometry(.004,.015,.26),hull);strip.position.set(side*.34-.18+i*.09,.006,0);this.satellite.add(strip);}}
    this.orbital.add(this.satellite);
  }
  bind(){
    const canvas=this.renderer.domElement;
    canvas.addEventListener('pointerdown',e=>{this.down=[e.clientX,e.clientY];});
    canvas.addEventListener('pointerup',e=>{
      if(!this.active||!this.down||Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1])>6)return;
      const rect=canvas.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);
      const hit=this.raycaster.intersectObjects([this.globe,this.landscape.water,...this.city.children].filter(o=>o.visible),true).find(h=>h.object.userData.building||h.object===this.globe||h.object===this.landscape.water);
      if(!hit)return;if(!this.close){this.approach();return;}const id=hit.object.userData.building;if(id){this.selectBuilding(id);this.onBuilding?.(id);}
    });
  }
  normal(point){return this.appearance==='gas'?Y.clone():point.clone().sub(new THREE.Vector3(0,this.centerY,0)).normalize();}
  surface(x,z,offset=0){if(this.appearance==='gas')return new THREE.Vector3(x,7.15+offset,z);const scale=this.terrainScale,n=new THREE.Vector3(x/scale,Math.sqrt(Math.max(1,36-(x*x+z*z)/(scale*scale))),z/scale).normalize();return n.multiplyScalar(Math.max(6.025,this.landscape.sample(n).radius)*scale+offset).add(new THREE.Vector3(0,this.centerY,0));}
  appearanceFor(planet){return planet.moon?'moon':planetType(planet).id;}
  clear(group){
    group.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&!o.geometry.userData.sharedBuilding)o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)if(m&&!m.userData.sharedBuilding)m.dispose();});group.clear();
  }
  updatePlanet(planet,catalog){
    if(!planet)return;const appearance=this.appearanceFor(planet),signature=JSON.stringify([planet.id,appearance,planet.buildings,planet.layout]);this.planet=planet;this.catalog=catalog;if(signature===this.signature)return;const changedType=this.appearance!==appearance;this.signature=signature;this.appearance=appearance;this.landscape.setType(appearance);this.globe.receiveShadow=appearance!=='gas';
    this.terrainScale=['gas','moon'].includes(appearance)?1:5;this.centerY=appearance==='gas'?GAS_CENTER_Y:6-6*this.terrainScale;this.landscape.group.scale.setScalar(this.terrainScale);this.landscape.group.position.y=appearance==='gas'?0:this.centerY;
    this.clear(this.city);this.clear(this.platform);this.labels=[];this.animations=[];this.buildings={};this.selector.visible=false;this.selected=null;this.slots=[];
    let platformPlots;if(appearance==='gas'){const platform=createFloatingPlatform(THREE);platform.group.position.y=7.15;this.platform.add(platform.group);this.animations.push(...platform.animations);platformPlots=platform.plots;}
    const resource=planetType(planet),specialty=resource.specialty;
    Object.entries(planet.buildings).filter(([id,level])=>level>0&&catalog.buildings[id]&&(planet.moon||!catalog.buildings[id].moon)&&(!resourceMines.includes(id)||planet.moon||resource.multipliers[resourceMines.indexOf(id)]>0)).forEach(([id,level],i)=>{
      const location=planet.layout?.[id]||[520+(i%4)*190,260+Math.floor(i/4)*185];
      let plot=planet.moon?[THREE.MathUtils.clamp((location[0]-850)/210,-2.25,2.25),THREE.MathUtils.clamp((location[1]-535)/210,-1.85,1.85)]:platformPlots?.[id]||colonyPlots[id];
      if(!plot)return;
      if(!planet.moon&&appearance!=='gas'&&specialty!==null){if(id===resourceMines[specialty])plot=colonyPlots.Metal_Mine;if(id===resourceStores[specialty])plot=colonyPlots.Metal_Storage;else if(id==='Metal_Storage')plot=colonyPlots[resourceStores[specialty]];}
      const [x,z]=plot,{group,height,animations=[]}=createBuildingModel(THREE,id,level,this.shared);group.scale.setScalar(id==='Command_Center'?.9:.65);group.position.copy(this.surface(x,z,.025));group.quaternion.setFromUnitVectors(Y,this.normal(group.position));group.traverse(o=>{if(o.isMesh){o.userData.building=id;o.castShadow=true;o.receiveShadow=true;}});this.city.add(group);this.buildings[id]=group;
      this.slots.push({id,x,z,model:group});this.animations.push(...animations);this.labels.push({id,model:group,point:new THREE.Vector3(0,height+.15,0),name:catalog.buildings[id]?.name||id,level,bonus:!planet.moon&&resourceMines[specialty]===id?'产量 ×3':''});
    });
    this.orbital.visible=!planet.moon;this.orbital.position.y=this.centerY;this.orbitLine.scale.setScalar((appearance==='gas'?GAS_RADIUS+6:6*this.terrainScale+2.4)/8.4);this.drawLabels();this.updateAtmosphericView();if(changedType)this.close?this.approach():this.orbit();
  }
  travel(to,target,duration){this.transition={from:this.camera.position.clone(),to,targetFrom:this.controls.target.clone(),targetTo:target,at:performance.now(),duration:matchMedia('(prefers-reduced-motion:reduce)').matches?1:duration};}
  updateAtmosphericView(){
    const airborne=this.appearance==='gas'&&this.close;
    this.scene.fog=this.close?new THREE.FogExp2(airborne?0xcdb48d:this.appearance==='mars'?0xb07755:this.appearance==='mercury'?0x4f4640:0xa2cbd0,airborne?.008:this.appearance==='mercury'?.0015:.006):null;
    this.stars.material.opacity=airborne?.15:.8;
  }
  approach(){
    this.close=true;const mobile=this.container.clientWidth<800,target=new THREE.Vector3(this.appearance==='gas'?.7:.25,this.appearance==='gas'?7.25:this.planet?.moon?5.65:6.45,.85),offset=new THREE.Vector3(6.5,10,14.5).multiplyScalar(mobile?(this.appearance==='gas'?2.2:1.7):this.appearance==='gas'?1.2:1.06);this.travel(target.clone().add(offset),target,1350);
    this.controls.minDistance=5;this.controls.maxDistance=mobile?48:32;this.controls.minPolarAngle=.04;this.controls.maxPolarAngle=1.35;this.onApproach?.(true);this.drawLabels();this.updateAtmosphericView();
  }
  orbit(){
    this.close=false;const gas=this.appearance==='gas',mobile=this.container.clientWidth<800,target=new THREE.Vector3(0,this.centerY+(gas?12:.5),0),offset=gas?new THREE.Vector3(40,44,112).multiplyScalar(mobile?2.2:1):new THREE.Vector3(10,12,19).multiplyScalar(this.terrainScale*(mobile?2.2:1.08));
    this.travel(offset.add(target),target,1600);this.controls.minDistance=gas?GAS_RADIUS+18:9*this.terrainScale;this.controls.maxDistance=gas?360:65*this.terrainScale;this.controls.minPolarAngle=.03;this.controls.maxPolarAngle=Math.PI-.03;this.selector.visible=false;this.onApproach?.(false);this.drawLabels();this.updateAtmosphericView();
  }
  selectBuilding(id){
    this.selected=id;const b=this.buildings[id];if(!b){this.selector.visible=false;return;}this.selector.scale.set(id==='Shipyard'?4.2:1,id==='Shipyard'?2.85:1,1);this.selector.position.copy(b.position.clone().addScaledVector(this.normal(b.position),.03));this.selector.quaternion.copy(b.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2));this.selector.visible=true;if(!this.close)this.approach();this.drawLabels();
  }
  drawLabels(){
    const layer=document.getElementById('building-labels');layer.replaceChildren();layer.style.display=this.close&&this.active?'block':'none';if(!this.close)return;
    for(const label of this.labels){const el=document.createElement('div');el.className='building-label'+(label.id===this.selected?' selected':'');const name=document.createElement('b');name.textContent=label.name;const level=document.createElement('small');level.textContent='Lv '+label.level+(label.bonus?' · '+label.bonus:'');el.append(name,level);layer.append(el);label.el=el;}
  }
  setMode(mode){
    this.mode=mode;this.active=mode==='home';this.home.visible=this.active;this.renderer.domElement.style.pointerEvents=this.active?'auto':'none';this.renderer.domElement.style.opacity=this.active?'1':'0';this.renderer.setAnimationLoop(this.active&&!document.hidden?t=>this.frame(t):null);if(this.active){this.last=performance.now();this.close?this.approach():this.orbit();}else document.getElementById('building-labels').style.display='none';
  }
  resize(){const w=this.container.clientWidth,h=this.container.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);if(this.planet)this.close?this.approach():this.orbit();}
  frame(now){
    if(!this.active||document.hidden)return;const dt=Math.max(0,Math.min(.05,(now-this.last)/1000));this.last=now;this.time+=dt;this.landscape.clock.value=this.time;
    if(this.transition){const t=Math.min(1,(now-this.transition.at)/this.transition.duration),k=t*t*(3-2*t);this.camera.position.lerpVectors(this.transition.from,this.transition.to,k);this.controls.target.lerpVectors(this.transition.targetFrom,this.transition.targetTo,k);this.camera.lookAt(this.controls.target);if(t===1){this.transition=null;this.controls.update();}}else this.controls.update();
    const gas=this.appearance==='gas',centerY=this.centerY,radius=gas?GAS_RADIUS+.35:6.12*this.terrainScale,dx=this.camera.position.x,dy=this.camera.position.y-centerY,dz=this.camera.position.z,distance=Math.hypot(dx,dy,dz);if(distance<1e-6)this.camera.position.set(0,centerY+radius,0);else if(distance<radius)this.camera.position.set(dx*radius/distance,centerY+dy*radius/distance,dz*radius/distance);this.stars.position.copy(this.camera.position);
    const angle=this.time*.023,orbitRadius=gas?GAS_RADIUS+6:6*this.terrainScale+2.4;this.satellite.position.set(Math.cos(angle)*orbitRadius,Math.cos(angle)*orbitRadius*.274,Math.sin(angle)*orbitRadius);this.satellite.rotation.y=-angle;
    for(const a of this.animations){if(a.kind==='rotate')a.mesh.rotation[a.axis||'y']+=dt*(a.speed??.5);else if(a.kind==='pulse')a.mesh.scale.setScalar((a.base??1)+Math.sin(this.time*(a.speed||2))*(a.amplitude??.035));}
    if(this.close){
      const occupied=[],w=this.container.clientWidth,h=this.container.clientHeight,top=document.getElementById('workspace').offsetTop;
      for(const l of [...this.labels].sort((a,b)=>(b.id===this.selected)-(a.id===this.selected))){
        if(!l.el)continue;const world=l.point.clone();l.model.localToWorld(world);const facing=this.normal(world).dot(this.camera.position.clone().sub(world))>0,p=world.project(this.camera),x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h-top,width=l.name.length*10+(l.bonus?110:58);
        const bounds={left:x-width/2,right:x+width/2,top:y-27,bottom:y+5};const visible=facing&&p.z<1&&x>(w<800?45:250)&&x<w-(w<800?45:260)&&y>0&&y<h-190&&!occupied.some(b=>bounds.left<b.right&&bounds.right>b.left&&bounds.top<b.bottom&&bounds.bottom>b.top);
        l.el.style.left=x+'px';l.el.style.top=y+'px';l.el.style.display=visible?'block':'none';if(visible)occupied.push(bounds);
      }
    }
    this.renderer.render(this.scene,this.camera);
  }
}
export {PlanetScene as MoonPlanetScene};

