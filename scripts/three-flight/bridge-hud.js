import {SvgGlass} from './instruments/fusion-glass-svg.js';
import {fusionState} from './instruments/fusion-displays.js';
import {bridgeHUDStyles} from './bridge-hud-style.js';

// Instruments live on the physical consoles; targeting is projected on glass.
export class BridgeHUD {
 constructor(actions){
  this.actions=actions;this.style=document.createElement('style');this.style.textContent=bridgeHUDStyles+'\n#bridge-flight-hud[data-external=false] > header,#bridge-flight-hud .b-glass-target,#bridge-flight-hud footer > span,#bridge-flight-hud[data-external=false] .b-threat{display:none!important}';document.head.append(this.style);
  this.root=document.createElement('section');this.root.id='bridge-flight-hud';this.root.hidden=true;this.root.setAttribute('aria-label','舰桥战术显示');
  this.root.innerHTML=`<header><small data-label></small><h2 data-name></h2><span data-mode></span></header>
   <div class="b-glass-target" hidden><i></i><i></i><i></i><i></i><div class="b-target-caption"><small data-target-status></small><strong data-target-name></strong><span data-target-range></span><div class="b-target-health"><b></b></div></div></div>
   <div class="b-offscreen" hidden><span data-offscreen-arrow></span><span data-offscreen-name></span></div>
   <div class="b-threat" hidden role="status"><div class="b-threat-symbol">!</div><div><small>INCOMING / 来袭预警</small><strong data-threat-title></strong><span data-threat-detail></span></div><b data-threat-time></b></div>
   <div class="b-threat-bearing" hidden><i></i></div>
   <footer><span data-help></span><button data-action="auto">接管驾驶 · G</button><button data-action="view">切换视角 · V</button><button data-action="exit">退出 · Esc</button></footer>`;
  this.glassElement=document.createElementNS('http://www.w3.org/2000/svg','svg');this.glassElement.setAttribute('aria-hidden','true');this.glassElement.setAttribute('preserveAspectRatio','none');this.glassElement.setAttribute('font-family','Bahnschrift, Microsoft YaHei, sans-serif');Object.assign(this.glassElement.style,{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'});this.root.prepend(this.glassElement);this.glass=new SvgGlass(this.glassElement);this.messages=[];
  document.body.append(this.root);this.nodes=Object.fromEntries([...this.root.querySelectorAll('[data-label],[data-name],[data-mode],[data-help],[data-target-status],[data-target-name],[data-target-range],[data-offscreen-arrow],[data-offscreen-name],[data-threat-title],[data-threat-detail],[data-threat-time]')].map(el=>[el.getAttributeNames().find(n=>n.startsWith('data-')).slice(5),el]));
  this.root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled){this.actions[b.dataset.action]?.();b.blur();}});
 }
 text(key,value){if(this.nodes[key].textContent!==String(value))this.nodes[key].textContent=value;}
 update(s){
  this.root.hidden=!s?.visible;document.body.classList.toggle('bridge-hud-active',!!s?.visible);if(!s?.visible){this.state=null;return;}this.state=s;
  const vessel=(s.feedbackEpoch??'')+':'+(s.shipType||s.name)+':'+(s.vesselId??'');if(vessel!==this.vesselKey){this.vesselKey=vessel;this.messages=[];this.lastHull=this.lastShield=null;this.lastCommand=null;}
  this.root.dataset.cabin=s.cabinKind||'';this.root.dataset.external=String(!!s.external);
  this.text('label',s.carrier?'FLEET COMMAND / 无人僚机指挥':'BATTLESHIP / 舰桥火控');this.text('name',s.name);
  this.text('mode',s.replay?'历史回放 · 指令只读':s.manual?'手动驾驶':s.walking?'AI 驾驶 · 舰桥行走':'AI 驾驶');
  this.text('help',s.external?'V 返回舰桥':s.walking?'W/A/S/D 行走 · 中键环视 · C 返回指挥席':'W/S 油门 · A/D 转向 · T 选敌 · X 对准 · 中键环视 · C 回正');
  const auto=this.root.querySelector('[data-action=auto]');auto.textContent=s.manual?'交还 AI · G':'接管驾驶 · G';auto.disabled=!!s.replay||!s.canPilot;
  this.drawTarget(s);this.drawThreat(s);this.drawFusion(s);
 }
 drawFusion(s){
  const t=performance.now()/1000,h=this.glass;if(h.w!==innerWidth||h.h!==innerHeight)h.resize();h.clear();if(s.walking||s.external&&!s.aimPoint){h.present();return;}
  const pitch=s.pitch||0,state=fusionState(s),forward={pos:[s.pos[0]+Math.sin(s.heading)*Math.cos(pitch)*2000,s.pos[1]+Math.sin(pitch)*2000,s.pos[2]+Math.cos(s.heading)*Math.cos(pitch)*2000]},p=s.aimPoint||s.project?.(forward)||{x:h.w/2,y:h.h/2,visible:true},bottom=s.external?.9:.68;
  if(p.visible!==false&&p.x>0&&p.x<h.w&&p.y>90&&p.y<h.h*bottom)h.reticle(p.x,p.y,state,t);
  for(const c of s.contacts||[]){const q=s.project?.(c);if(!q||q.visible===false||q.x<10||q.x>h.w-10||q.y<65||q.y>h.h*bottom)continue;
   if(c.id===s.target){h.brackets(q.x,q.y,36,state,t);continue;}h.contact(q.x,q.y,c.enemy);
  }
  let message=s.command&&s.command!==this.lastCommand?s.command:null;if(this.lastHull!=null&&s.hull<this.lastHull-.2)message='舰体受损，损管响应。';else if(this.lastShield!=null&&s.shield<this.lastShield-1&&t-(this.lastSaid||0)>3)message='护盾承压，侦测到敌方命中。';
  if(message){this.messages.push({t,who:'舰桥：',text:message});this.messages=this.messages.slice(-5);this.lastSaid=t;}this.lastHull=s.hull;this.lastShield=s.shield;this.lastCommand=s.command;h.comms(this.messages,t);h.present();
 }
 drawTarget(s){
  const marker=this.root.querySelector('.b-glass-target'),off=this.root.querySelector('.b-offscreen'),target=s.contacts?.find(c=>c.id===s.target&&c.enemy),point=target?s.project?.(target):null;
  marker.hidden=true;off.hidden=true;if(!target||s.external||s.walking)return;
  const bounds=s.viewport||{left:0,top:0,width:innerWidth,height:innerHeight},left=bounds.left+80,right=bounds.left+bounds.width-80,top=bounds.top+90,bottom=bounds.top+bounds.height*.68;
  if(point&&point.visible!==false&&point.x>=left&&point.x<=right&&point.y>=top&&point.y<=bottom){
   marker.hidden=false;marker.style.left=point.x+'px';marker.style.top=point.y+'px';marker.classList.toggle('aligned',!!s.locked);marker.classList.toggle('caption-left',point.x+280>right);
   this.text('target-status',s.locked?'LOCK / 舰艏对准':'TRACK / 目标跟踪');this.text('target-name',target.name);this.text('target-range',Math.round(target.distance)+' m · 舰体 '+Math.round(target.hull??100)+'%');
   marker.querySelector('.b-target-health b').style.width=Math.max(0,Math.min(100,target.hull??100))+'%';
  }else{
   off.hidden=false;const dx=target.pos[0]-s.pos[0],dz=target.pos[2]-s.pos[2],heading=s.heading-(s.lookYaw||0),rightward=-dx*Math.cos(heading)+dz*Math.sin(heading),forward=dx*Math.sin(heading)+dz*Math.cos(heading);
   this.text('offscreen-arrow',forward<0?'↶':rightward>=0?'›':'‹');this.text('offscreen-name',(forward<0?'后方 · ':rightward>=0?'右侧 · ':'左侧 · ')+target.name+' · '+Math.round(target.distance)+' m');
  }
 }
 drawThreat(s){
  const warning=this.root.querySelector('.b-threat'),bearing=this.root.querySelector('.b-threat-bearing'),threat=s.threats?.[0];warning.hidden=!threat||!!s.walking;bearing.hidden=!threat||!!s.external||!!s.walking;
  if(!threat)return;
  this.text('threat-title',threat.direction+' · '+threat.kind+'接近');this.text('threat-detail',(s.threats.length>1?s.threats.length+' 个来袭目标 · ':'')+'预计接近 · '+(s.shield>0?'护盾承压':'护盾离线'));
  this.text('threat-time',threat.eta.toFixed(1)+' s');warning.classList.toggle('critical',threat.eta<3);bearing.style.transform=`translate(-50%,-50%) rotate(${threat.bearing-(s.lookYaw||0)}rad)`;
 }
 dispose(){this.root.remove();this.style.remove();document.body.classList.remove('bridge-hud-active');}
}
