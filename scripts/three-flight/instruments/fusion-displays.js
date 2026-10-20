import * as THREE from 'three';
import {FighterConsole,consolePoint} from '../fighter-console.js';
import {drawDefense,drawFire,frame,bar} from './fusion-screens.js';

const CY='#5fe3ff',DIM='#5d8798',TXT='#cfefff',GRN='#64f0a8',AMB='#ffb35c';
export function fusionState(s){
 const target=s.contacts?.find(v=>v.id===s.target),dx=target?target.pos[0]-s.pos[0]:0,dz=target?target.pos[2]-s.pos[2]:0;
 const right=-dx*Math.cos(s.heading)+dz*Math.sin(s.heading),front=dx*Math.sin(s.heading)+dz*Math.cos(s.heading),az=Math.atan2(right,front)*180/Math.PI,el=target?Math.atan2(target.pos[1]-s.pos[1],Math.hypot(dx,dz))*180/Math.PI:0;
 return {...s,locked:s.aimed??s.locked,live:true,aggregateShield:!s.shields,shields:s.shields||[s.shield,s.shield,s.shield,s.shield],shieldHit:s.shieldHit||[0,0,0,0],sections:s.sections||{bow:s.hull,bridge:s.hull,laserL:s.hull,laserR:s.hull,engines:s.hull},shieldMode:'both',alert:s.hull<35||s.shield<=0,
  statusLine:s.hull<35?'舰体危急 · 损管响应':s.shield<=0?'护盾离线':s.threats?.length?'侦测到来袭火力':'护盾稳定 · 结构完整',
  target:target?{...target,hp:target.hull??100,maxHp:100,sh:target.shield??0,maxSh:100}:null,targetDist:target?.distance||0,
  alignErr:Math.hypot(az,el-(s.pitch||0)*180/Math.PI),offset:{x:az,y:el-(s.pitch||0)*180/Math.PI},aligning:s.locked&&(s.aimed===undefined?Math.abs(az)>6:!s.aimed),gimbal:6,lockProgress:(s.aimed??s.locked)?1:0,
  weaponRange:s.weapon?.range,fireReady:!!s.weapon?.ready,weapon:{state:s.weapon?.reason||'ready',charge:s.weapon?.charge??(s.weapon?.ready?1:0),heat:0},kills:0};
}
export class FusionDisplays extends FighterConsole {
 constructor(texture,panels){super(texture,panels);for(const d of this.displays){d.canvas.width=d.width||1024;d.canvas.height=d.height||640;}}
 update(s,time=0){
  if(this.lastTime!=null&&time>=this.lastTime&&time-this.lastTime<1/30&&s?.name===this.state?.name)return;this.lastTime=time;this.state=s;
  for(const d of this.displays){const c=d.canvas.getContext('2d');d.hits=[];c.clearRect(0,0,d.canvas.width,d.canvas.height);if(!s)continue;
   if(d.id==='defense'||d.id==='fire'){
    c.save();c.scale(d.canvas.width/1024,d.canvas.height/640);(d.id==='defense'?drawDefense:drawFire)({ctx:c,canvas:{width:1024,height:640},tex:d.texture},fusionState(s),time);c.restore();
    if(d.id==='fire'){if(!s.replay)d.hits.push({x:24,y:78,w:470,h:300,action:'target'});if(s.manual)d.hits.push({x:560,y:80,w:450,h:310,action:'lock'});}
   }else this[d.id](c,d,s,time);d.texture.needsUpdate=true;
  }
 }
 label(c,t,x,y,size=25,color=TXT,align='left'){c.fillStyle=color;c.font=`${size}px "Bahnschrift","Microsoft YaHei"`;c.textAlign=align;c.textBaseline='middle';c.fillText(String(t),x,y);c.textAlign='left';}
 control(c,d,label,x,y,w,h,action,value,enabled,active=false){
  c.strokeStyle=active?CY:'rgba(95,227,255,.28)';c.fillStyle=active?'rgba(95,227,255,.12)':'rgba(8,35,45,.12)';c.fillRect(x,y,w,h);c.strokeRect(x,y,w,h);this.label(c,label,x+w/2,y+h/2,25,enabled?(active?CY:TXT):DIM,'center');if(enabled)d.hits.push({x,y,w,h,action,value});
 }
 helm(c,d,s,t){const w=d.canvas.width,h=d.canvas.height;frame(c,w,h,'航行控制 · NAV',s.manual?'MANUAL':'AUTO',t);
  this.label(c,Math.round(s.speed||0)+' m/s',28,98,37,CY);this.label(c,'HDG '+Math.round((s.heading*180/Math.PI+360)%360)+'°',280,98,29);
  this.control(c,d,'−',535,76,66,50,'slower',null,s.manual);this.label(c,Math.round(s.throttle*100)+'%',662,101,29,CY,'center');this.control(c,d,'+',718,76,66,50,'faster',null,s.manual);
  this.control(c,d,s.manual?'交还 AI':'接管',810,76,190,50,'auto',null,s.canPilot!==false&&!s.replay);bar(c,28,h-35,w-56,8,s.throttle,CY);
 }
 weapons(c,d,s,t){const w=d.canvas.width,h=d.canvas.height;frame(c,w,h,'武器状态 · ARMAMENT',s.carrier?'POINT DEFENSE':s.weaponName||'主武器',t);
  const label=weapon=>weapon?.reason==='unavailable'?'—':weapon?.reason==='cooldown'?(weapon.cooldown||0).toFixed(1)+' s':weapon?.ready?'READY':'STANDBY';
  this.control(c,d,'主武器  '+label(s.weapon),24,80,476,h-103,'fire',null,s.manual&&s.weapon?.reason!=='unavailable');this.control(c,d,'导弹  '+label(s.missile),524,80,476,h-103,'missile',null,s.manual&&s.missile?.reason!=='unavailable');
 }
 swarm(c,d,s,t){const a=s.carrier;if(!a)return;const w=d.canvas.width,h=d.canvas.height,enabled=s.canCommand&&!s.commandPending;frame(c,w,h,'蜂群指挥 · SWARM',a.active+' / '+a.capacity,t);
  this.label(c,'补充 '+Math.ceil(a.nextWave||0)+' s',26,90,25,CY);this.label(c,'全军攻击 +'+Math.round((a.aura||0)*100)+'%',w-26,90,25,AMB,'right');
  [['assault','突击'],['guard','护卫']].forEach(([value,label],i)=>this.control(c,d,label,24+i*498,119,476,62,'mode',value,enabled,a.mode===value));
  [['wedge','楔形'],['screen','屏障'],['orbit','环绕']].forEach(([value,label],i)=>this.control(c,d,label,24+i*333,202,310,62,'formation',value,enabled,a.formation===value));
  const target=s.contacts.find(c=>c.id===s.target),cool=!a.focusAutomatic&&(a.focusCooldown||0)>0;
  this.control(c,d,cool?'集火冷却 '+a.focusCooldown.toFixed(1)+' s':'集火选中目标',24,289,976,64,'focus',null,enabled&&!!target?.enemy&&!cool);
  this.label(c,s.command||(!s.canCommand?'战场中启用蜂群指挥':'本舰僚机 · 自动出击与补充'),28,h-35,24,DIM);
 }
}
// Same additive projection + tinted transparent backing as the fusion cockpit.
export function hologramSurface(d,resources){
 const group=new THREE.Group();group.position.fromArray(consolePoint(d,[0,0,0]));group.rotation.set(...d.rotation,'YXZ');
 const geometry=new THREE.PlaneGeometry(...d.size),backMat=new THREE.MeshBasicMaterial({color:0x03101a,transparent:true,opacity:.56,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}),mat=new THREE.MeshBasicMaterial({map:d.texture,color:0x90bac8,toneMapped:false,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const back=new THREE.Mesh(geometry,backMat),front=new THREE.Mesh(geometry,mat);back.renderOrder=2;front.renderOrder=3;front.position.z=.003;group.add(back,front);resources.push(geometry,backMat,mat);return group;
}
