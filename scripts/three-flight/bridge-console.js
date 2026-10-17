import * as THREE from 'three';
import {FighterConsole,consolePoint} from './fighter-console.js';
import {bridgeDisplays,bridgeHologram} from '../../game/bridge-layout.mjs';

const colors={cyan:'#8bd9ee',gold:'#edc78c',muted:'#7aa7ba',text:'#cfedf4',red:'#ff8b7f'};
const pct=v=>Math.max(0,Math.min(100,Math.round(v||0)));
const reason=w=>w?.reason==='unavailable'?'未装备':w?.reason==='cooldown'?w.cooldown.toFixed(1)+' s':w?.ready?'就绪':'待命';

class BridgeDisplays extends FighterConsole {
 operations(c,d,s){
  if(s.carrier){const a=s.carrier,enabled=s.canCommand&&!s.commandPending;
   this.text(c,'无人僚机指挥',28,118,32);this.text(c,`${a.active} / ${a.capacity}`,610,120,38,colors.cyan,'right');
   this.text(c,`自动补充 · ${Math.ceil(a.nextWave||0)} s`,28,164,28,colors.muted);this.text(c,`全军攻击 +${Math.round((a.aura||0)*100)}%`,610,164,26,colors.gold,'right');
   for(const [i,[value,label]]of [['assault','突击 · 攻击目标'],['guard','护卫 · 掩护母舰']].entries())this.choice(c,d,label,26+i*305,190,283,'mode',value,a.mode===value,enabled);
   this.text(c,'护航阵型',28,288,28,colors.muted);
   for(const [i,[value,label]]of [['wedge','楔形'],['screen','屏障'],['orbit','环绕']].entries())this.choice(c,d,label,26+i*202,308,184,'formation',value,a.formation===value,enabled);
   const target=s.contacts.find(v=>v.id===s.target),cooldown=!a.focusAutomatic&&(a.focusCooldown||0)>0;
   this.text(c,target?'目标 · '+target.name:'先在右屏或全息雷达选择目标',28,410,27,colors.text,'left',580);
   this.button(c,d,cooldown?'集火冷却 '+a.focusCooldown.toFixed(1)+' s':'下达集火指令',26,435,588,'focus',null,enabled&&!!target?.enemy&&!cooldown);
   this.text(c,s.command||(!s.canCommand?'只读 · '+(s.replay?'历史记录':'进入战场后启用指挥'):'阵型控制本舰僚机 · 集火联动附近友舰'),28,531,25,colors.gold,'left',580);
  }else{
   this.text(c,s.weaponName||'主武器',28,120,32,colors.text,'left',420);this.text(c,reason(s.weapon),610,120,28,colors.cyan,'right');
   this.text(c,`有效射程 ${Math.round(s.weapon?.range||0)} m`,28,166,28,colors.muted);
   this.button(c,d,'主武器开火 · SPACE',26,191,588,'fire',null,s.manual&&s.weapon?.reason!=='unavailable');
   this.line(c,26,277,614,277);this.text(c,'导弹 / 辅助武器',28,322,30);this.text(c,reason(s.missile),610,322,28,colors.cyan,'right');
   this.button(c,d,'导弹齐射 · R',26,351,588,'missile',null,s.manual&&s.missile?.reason!=='unavailable');
   this.text(c,s.solution||'选择敌方目标',28,463,28,colors.gold,'left',580);this.text(c,s.command||'炮组由舰载火控追踪目标',28,531,25,colors.muted,'left',580);
  }
 }
 choice(c,d,label,x,y,w,action,value,active,enabled){this.button(c,d,(active?'◆ ':'')+label,x,y,w,action,value,enabled);if(active){c.fillStyle=colors.cyan;c.fillRect(x,y+52,w,3);}}
 contacts(c,d,s){
  const enemies=s.contacts.filter(v=>v.enemy),selected=enemies.find(v=>v.id===s.target),list=[...(selected?[selected]:[]),...enemies.filter(v=>v!==selected)].slice(0,4);
  if(!list.length)this.text(c,'无敌方接触',28,136,30,colors.muted);
  list.forEach((v,i)=>{const y=90+i*64;c.fillStyle=v===selected?'#35242b':'#0a2130';c.fillRect(24,y,592,56);this.text(c,'◇ '+v.name,38,y+36,30,v===selected?colors.gold:colors.text,'left',390);this.text(c,Math.round(v.distance)+' m',602,y+36,27,colors.muted,'right');d.hits.push({x:24,y,w:592,h:56,action:'select',value:String(v.id)});});
  this.button(c,d,'下一目标 · T',26,366,281,'target',null,!!enemies.length);this.button(c,d,s.locked?'解除对准 · X':'舰艏对准 · X',327,366,287,'lock',null,s.manual&&!!enemies.length);
  this.text(c,selected?'目标舰体  '+pct(selected.hull)+'%':'目标舰体  —',28,475,28,colors.muted);this.bar(c,selected?.hull||0,290,462,324,colors.gold);
  this.text(c,s.carrier?'红 / 敌舰　青 / 友舰　金 / 本舰僚机':'点击目标或中央全息标记锁定',28,531,25,colors.cyan,'left',580);
 }
 helm(c,d,s){
  this.text(c,Math.round(s.speed)+' m/s',28,125,38);this.text(c,'HDG '+String(Math.round((s.heading*180/Math.PI+360)%360)).padStart(3,'0'),610,123,30,colors.cyan,'right');
  for(const [i,[name,value,color]]of [['护盾',s.shield,colors.cyan],['舰体',s.hull,colors.gold]].entries()){const y=187+i*67;this.text(c,name,28,y,30,colors.muted);this.bar(c,value,145,y-15,330,color);this.text(c,pct(value)+'%',610,y,32,color,'right');}
  this.text(c,'油门 '+pct(s.throttle*100)+'%',28,321,30,colors.muted);this.button(c,d,'−',333,282,125,'slower',null,s.manual);this.button(c,d,'+',479,282,135,'faster',null,s.manual);
  this.button(c,d,s.manual?'交还 AI · G':'接管驾驶 · G',26,367,588,'auto',null,s.canPilot&&!s.replay);this.text(c,s.walking?'中键环视 · W/A/S/D 舰桥行走':'中键环视 · C 回正',28,458,25,colors.muted);
 }
}

// These objects are part of the cabin scene; projection and clicks share the actual mesh surfaces.
export class BridgeConsole {
 constructor(kind){
  this.kind=kind;this.group=new THREE.Group();this.resources=[];this.markers=new Map();this.pickables=[];this.raycaster=new THREE.Raycaster();
  this.displays=new BridgeDisplays(canvas=>this.keep(new THREE.CanvasTexture(canvas)),bridgeDisplays(kind));
  for(const d of this.displays.displays){
   const frame=this.box([d.size[0]+.18,d.size[1]+.18,.19],0x253944);frame.position.fromArray(consolePoint(d,[0,0,-.1]));frame.rotation.set(d.rotation[0],d.rotation[1],0,'YXZ');
   const mesh=new THREE.Mesh(this.keep(new THREE.PlaneGeometry(...d.size)),this.keep(new THREE.MeshBasicMaterial({map:d.texture,toneMapped:false})));mesh.position.fromArray(consolePoint(d,[0,0,.003]));mesh.rotation.copy(frame.rotation);this.group.add(mesh);
   for(const side of [-1,1]){const rail=this.box([.035,d.size[1]-.12,.025],0x689baa);rail.position.fromArray(consolePoint(d,[side*(d.size[0]/2+.05),0,.006]));rail.rotation.copy(frame.rotation);}
   const leg=this.box([.32,1.1,.42],0x172b37);leg.position.set(d.pos[0],d.pos[1]-d.size[1]/2-.45,d.pos[2]-.2);
  }
  const hologram=bridgeHologram(kind);this.holo=new THREE.Group();this.holo.position.fromArray(hologram.pos);this.group.add(this.holo);this.radius=hologram.radius;
  const cylinder=(r,h,y,color)=>{const mesh=new THREE.Mesh(this.keep(new THREE.CylinderGeometry(r,r*.88,h,48)),this.keep(new THREE.MeshBasicMaterial({color})));mesh.position.y=y;this.holo.add(mesh);return mesh;};
  cylinder(1.62,.9,-.42,0x172c39);cylinder(2.28,.18,.08,0x405c69);cylinder(2.13,.04,.19,0x061824);
  this.grid=new THREE.Group();this.grid.position.y=1.6;this.holo.add(this.grid);
  for(const r of [.52,1.05,1.57,2.1])this.ring(r,0,0x548da5,this.grid,.52);
  this.ring(2.23,.02,0x94e7fa,this.grid,.85);
  const lines=[];for(let i=-4;i<=4;i++){const x=i*.5,z=Math.sqrt(Math.max(0,this.radius*this.radius-x*x));lines.push(x,0,-z,x,0,z,-z,0,x,z,0,x);}
  this.lineMesh(lines,0x437f98,this.grid,.3);
  const sweepGeometry=this.keep(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(2.1,0,0)]));this.sweep=new THREE.Line(sweepGeometry,this.keep(new THREE.LineBasicMaterial({color:0x89e7ff,transparent:true,opacity:.7})));this.grid.add(this.sweep);
  const own=new THREE.Mesh(this.keep(new THREE.ConeGeometry(.11,.32,3)),this.keep(new THREE.MeshBasicMaterial({color:0xbcefff,wireframe:true})));own.rotation.x=-Math.PI/2;own.position.y=2.1;this.holo.add(own);
  this.ring(.19,1.65,0xbcefff,this.holo,.85);
  const beams=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;beams.push(Math.sin(a)*.5,.24,Math.cos(a)*.5,Math.sin(a)*2.1,1.6,Math.cos(a)*2.1);}this.lineMesh(beams,0x5cb5da,this.holo,.14);
  this.titleCanvas=document.createElement('canvas');this.titleCanvas.width=1024;this.titleCanvas.height=128;const texture=this.keep(new THREE.CanvasTexture(this.titleCanvas));
  this.title=new THREE.Mesh(this.keep(new THREE.PlaneGeometry(3.5,.44)),this.keep(new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false})));this.title.position.set(0,2.7,0);this.title.rotation.x=-.12;this.holo.add(this.title);this.titleTexture=texture;
  const hitDisk=new THREE.Mesh(this.keep(new THREE.CircleGeometry(2.3,48)),this.keep(new THREE.MeshBasicMaterial({visible:false,side:THREE.DoubleSide})));hitDisk.rotation.x=-Math.PI/2;hitDisk.position.y=.21;this.holo.add(hitDisk);this.pickables.push(hitDisk);
 }
 keep(resource){this.resources.push(resource);return resource;}
 box(size,color){const m=new THREE.Mesh(this.keep(new THREE.BoxGeometry(...size)),this.keep(new THREE.MeshBasicMaterial({color})));this.group.add(m);return m;}
 lineMesh(points,color,parent,opacity=1){const g=this.keep(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const m=new THREE.LineSegments(g,this.keep(new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false})));parent.add(m);return m;}
 ring(radius,y,color,parent,opacity){const points=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2,b=(i+1)/96*Math.PI*2;points.push(Math.sin(a)*radius,y,Math.cos(a)*radius,Math.sin(b)*radius,y,Math.cos(b)*radius);}return this.lineMesh(points,color,parent,opacity);}
 update(s,time){
  this.displays.update(s,time);this.sweep.rotation.y=-time*.45;if(!s)return;
  if(this.lastPaint!=null&&time-this.lastPaint<.05&&time>=this.lastPaint)return;this.lastPaint=time;
  const seen=new Set();for(const contact of s.contacts){seen.add(contact.id);let marker=this.markers.get(contact.id);
   if(!marker){const group=new THREE.Group(),geometry=new THREE.ConeGeometry(.085,.24,4),material=new THREE.MeshBasicMaterial({color:0x8bd9ee,wireframe:true,transparent:true,opacity:.95}),icon=new THREE.Mesh(geometry,material);icon.rotation.x=-Math.PI/2;group.add(icon);const stemG=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),stemM=new THREE.LineBasicMaterial({color:0x548da5,transparent:true,opacity:.6}),stem=new THREE.Line(stemG,stemM);this.holo.add(stem,group);const hit=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({visible:false}));group.add(hit);this.pickables.push(hit);marker={group,icon,stem,hit,resources:[geometry,material,stemG,stemM,hit.geometry,hit.material]};this.markers.set(contact.id,marker);}
   const dx=contact.pos[0]-s.pos[0],dz=contact.pos[2]-s.pos[2],right=-dx*Math.cos(s.heading)+dz*Math.sin(s.heading),front=dx*Math.sin(s.heading)+dz*Math.cos(s.heading),range=Math.max(s.scanRange,Math.hypot(right,front)),x=right/range*1.97,z=-front/range*1.97,y=1.95+Math.max(-.14,Math.min(.8,(contact.pos[1]-s.pos[1])/s.scanRange*3));
   marker.group.position.set(x,y,z);const selected=contact.id===s.target,color=selected?0xffd0a2:contact.enemy?0xff8278:contact.drone?0xe8c48b:0x8bd9ee;marker.icon.material.color.setHex(color);marker.icon.scale.setScalar(selected?1.55:1);marker.stem.material.color.setHex(color);marker.stem.geometry.attributes.position.setXYZ(0,x,1.61,z);marker.stem.geometry.attributes.position.setXYZ(1,x,y,z);marker.stem.geometry.attributes.position.needsUpdate=true;marker.hit.userData=contact.enemy?{action:'select',value:String(contact.id)}:{};
  }
  for(const [id,m]of this.markers)if(!seen.has(id)){m.group.removeFromParent();m.stem.removeFromParent();m.resources.forEach(r=>r.dispose());this.pickables.splice(this.pickables.indexOf(m.hit),1);this.markers.delete(id);}
  const key=[s.carrier?'旗舰战术态势':'战列舰战术态势',Math.round(s.scanRange),s.contacts.length].join('|');if(key!==this.titleKey){this.titleKey=key;const c=this.titleCanvas.getContext('2d');c.clearRect(0,0,1024,128);c.fillStyle='#a3e5fa';c.textAlign='center';c.font='32px "Microsoft YaHei"';c.fillText((s.carrier?'FLEET COMMAND / 旗舰态势':'TACTICAL DISPLAY / 战术态势')+'  ·  '+Math.round(s.scanRange)+' m',512,51);c.fillStyle='#6dacc5';c.font='24px "Microsoft YaHei"';c.fillText('实时接触 '+s.contacts.length+'  ·  点击红色标记选择目标',512,96);this.titleTexture.needsUpdate=true;}
  this.group.updateMatrixWorld(true);
 }
 pick(origin,direction){const panel=this.displays.pick(origin.toArray(),direction.toArray());this.raycaster.set(origin,direction);const hits=this.raycaster.intersectObjects(this.pickables,false).filter(h=>!panel||h.distance<panel.distance);const score=h=>{const center=h.object.getWorldPosition(new THREE.Vector3());return this.raycaster.ray.distanceSqToPoint(center)/Math.max(.01,center.distanceToSquared(origin));};const hit=hits.filter(h=>h.object.userData.action).sort((a,b)=>score(a)-score(b))[0]||hits[0];return hit?{surface:'hologram',...hit.object.userData}:panel;}
 layout(project){return [...this.displays.layout(project),{id:'hologram',corners:[],controls:[...this.markers.values()].filter(m=>m.hit.userData.action).map(m=>({action:m.hit.userData.action,value:m.hit.userData.value,point:project(m.group.getWorldPosition(new THREE.Vector3()).toArray())}))}];}
 dispose(){for(const m of this.markers.values())m.resources.forEach(r=>r.dispose());this.resources.forEach(r=>r.dispose());this.group.clear();}
}
