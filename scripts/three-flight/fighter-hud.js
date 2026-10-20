import {reticle,referenceStyle} from './fighter-hud-art.js';

// Presentation only. All contacts, flight values and commands come from the host.
export class FighterHUD {
 constructor(actions){
  this.actions=actions;this.markers=new Map();this.contacts=[];
  this.style=document.createElement('style');this.style.textContent=referenceStyle+styles;document.head.append(this.style);
  this.root=document.createElement('section');this.root.id='fighter-flight-hud';this.root.hidden=true;this.root.setAttribute('aria-label','战斗机飞行仪表');
  this.root.innerHTML=`<div class="f-identity"><small>FLIGHT CONTROL / 战斗机</small><h2 data-value="name"></h2><span data-value="mode"></span></div>
   <div class="f-heading"><div class="f-heading-ticks"></div><span data-value="heading"></span></div>
   <section class="f-wing"><h2>编队链路 <small data-value="wingCount"></small></h2><div data-wing></div></section>
   <div class="u-pilot-reticle">${reticle}</div><div class="f-attitude"><div data-attitude>− − − ───── ◇ ───── − − −</div><span data-value="pitch"></span></div>
   <div class="u-lead-label"><span data-value="solution"></span><br><b data-value="range"></b></div>
   <div class="u-velocity"><div class="u-caption">VELOCITY</div><div class="u-speed-number" data-value="speed"></div><div class="u-speed-unit">M / S</div><div class="u-speed-ruler"></div><div class="u-throttle-vertical"><i data-throttle></i></div><div class="u-thr-value" data-value="throttle"></div></div>
   <div class="u-pilot-condition"><div class="u-condition-item"><small>SHIELD / 护盾</small><b data-value="shield"></b><div class="u-bar"><i data-bar="shield"></i></div></div><div class="u-condition-item gold"><small>ARMOR / 装甲</small><b data-value="hull"></b><div class="u-bar gold"><i data-bar="hull"></i></div></div></div>
   <footer class="u-pilot-footer"><span>W/S 油门　↑/↓ 或 Q/E 俯仰　←/→ 偏航　A/D 滚转　右键拖动瞄准</span><button data-action="auto">交还 AI · G</button><button data-action="view">切换视角 · V</button><button data-action="exit">退出 · Esc</button></footer><div class="f-markers"></div>`;
  document.body.append(this.root);this.values=new Map();for(const el of this.root.querySelectorAll('[data-value]')){const list=this.values.get(el.dataset.value)||[];list.push(el);this.values.set(el.dataset.value,list);}
  this.root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled){actions[b.dataset.action]?.();b.blur();}});
 }
 text(key,value){for(const el of this.values.get(key)||[])if(el.textContent!==String(value))el.textContent=value;}
 update(s){
  this.root.hidden=!s?.visible;document.body.classList.toggle('fighter-hud-active',!!s?.visible);if(!s?.visible)return;
  const scale=Math.min(innerWidth/1600,innerHeight/900);this.root.style.setProperty('--hud-scale',scale);this.root.classList.toggle('external',!!s.external);this.root.classList.toggle('console-view',!!s.inspectingConsole);
  const consoleTop=Number.isFinite(s.consoleTop)&&!s.external?(s.consoleTop-(innerHeight-900*scale)/2)/scale-20:900;
  this.root.style.setProperty('--console-top',consoleTop+'px');
  const aim=s.aimPoint,reticle=this.root.querySelector('.u-pilot-reticle');
  reticle.hidden=!!aim&&(!aim.visible||aim.x<0||aim.x>innerWidth||aim.y<0||aim.y>innerHeight);
  const ox=(innerWidth-1600*scale)/2,oy=(innerHeight-900*scale)/2;
  const x=aim?(aim.x-ox)/scale:800,y=aim?(aim.y-oy)/scale:450;
  reticle.style.left=(x-160)+'px';reticle.style.top=(y-160)+'px';
  reticle.style.clipPath=`inset(0 0 ${Math.max(0,y+160-consoleTop)}px 0)`;
  reticle.classList.toggle('aimed',!!s.aimed);
  this.state=s;const deg=r=>(r*180/Math.PI).toFixed(1)+'°';
  for(const [k,v]of Object.entries({name:s.name,mode:s.replay?'REPLAY / 战斗记录':s.manual?'MANUAL / 手动驾驶':'AUTO / 自动驾驶',heading:'HDG '+String(Math.round((s.heading*180/Math.PI+360)%360)).padStart(3,'0'),speed:Math.round(s.speed),throttle:'THR '+Math.round(s.throttle*100)+'%',engine:Math.round(s.throttle*100)+'%',shield:Math.round(s.shield)+'%',hull:Math.round(s.hull)+'%',pitch:deg(s.pitch),roll:deg(s.roll),altitude:Math.round(s.altitude)+' m',climb:(Math.sin(s.pitch)*s.speed).toFixed(1)+' m/s',weaponName:s.weaponName,weaponState:s.weapon.reason==='cooldown'?s.weapon.cooldown.toFixed(1)+'s':s.weapon.ready?'就绪':s.weapon.reason==='unavailable'?'未装备':'待命',missileState:s.missile.reason==='unavailable'?'未装备':s.missile.reason==='cooldown'?s.missile.cooldown.toFixed(1)+'s':s.missile.ready?'就绪':'待命',weaponRange:'主武器射程 '+s.weapon.range+' m',missileRange:s.missile.reason==='unavailable'?'未装备导弹':'导弹射程 '+s.missile.range+' m',solution:s.solution||'选择目标',range:s.weapon.distance==null?'TARGET / —':Math.round(s.weapon.distance)+' m',command:s.command||'',scanRange:Math.round(s.scanRange)+' m',wingCount:s.contacts.filter(c=>!c.enemy).length+' 友方'}))this.text(k,v);
  for(const el of this.root.querySelectorAll('[data-bar]'))el.style.width=Math.max(0,Math.min(100,el.dataset.bar==='engine'?s.throttle*100:s[el.dataset.bar]))+'%';
  this.root.querySelector('[data-throttle]').style.height=Math.max(0,Math.min(100,s.throttle*100))+'%';
  this.root.querySelector('[data-attitude]').style.transform=`translateY(${Math.max(-85,Math.min(85,s.pitch*65))}px) rotate(${-s.roll}rad)`;
  const auto=this.root.querySelector('[data-action=auto]');auto.textContent=s.manual?'交还 AI · G':'接管驾驶 · G';auto.disabled=!!s.replay;
  const wing=s.contacts.filter(c=>!c.enemy).sort((a,b)=>a.distance-b.distance).slice(0,4),wingKey=wing.map(c=>c.id+':'+Math.round(c.distance)).join('|');
  if(wingKey!==this.wingKey){this.wingKey=wingKey;this.root.querySelector('[data-wing]').replaceChildren(...(wing.length?wing.map(c=>{const line=document.createElement('p');line.textContent='◇ '+c.name+'　'+Math.round(c.distance)+' m';return line;}):[Object.assign(document.createElement('p'),{textContent:'无友方编队接触'})]));}
  this.drawContacts(s,scale);
 }
 drawContacts(s,scale){
  const seen=new Set(),layer=this.root.querySelector('.f-markers'),ox=(innerWidth-1600*scale)/2,oy=(innerHeight-900*scale)/2;
  for(const c of s.contacts){const point=s.project?.(c);if(!point||point.visible===false||point.x<12||point.x>innerWidth-12||point.y<60||point.y>innerHeight*.71)continue;seen.add(c.id);let el=this.markers.get(c.id);if(!el){el=document.createElement('button');el.className='f-contact';el.innerHTML='<i></i><span></span>';el.addEventListener('click',()=>this.actions.select?.(String(c.id)));layer.append(el);this.markers.set(c.id,el);}el.classList.toggle('enemy',c.enemy);el.classList.toggle('selected',c.id===s.target);el.classList.toggle('caption-left',point.x+200*scale>innerWidth-12);el.disabled=!c.enemy||!!s.replay;el.querySelector('i').textContent=c.enemy?'◇':'△';el.querySelector('span').textContent=c.name+' · '+Math.round(c.distance)+' m';el.style.left=(point.x-ox)/scale+'px';el.style.top=(point.y-oy)/scale+'px';}
  for(const [id,el]of this.markers)if(!seen.has(id)){el.remove();this.markers.delete(id);}
 }
 dispose(){this.root.remove();this.style.remove();document.body.classList.remove('fighter-hud-active');}
}

const styles=`
#fighter-flight-hud:not(.external) :is(.u-pilot-condition,.u-velocity,.u-lead-label,.f-attitude){display:none}

#fighter-flight-hud .u-pilot-reticle[hidden]{display:none}#fighter-flight-hud .u-pilot-reticle.aimed{color:#64f0a8}#fighter-flight-hud .u-lead-label{transform:translateY(min(0px,calc(var(--console-top,900px) - 599px)))}
#fighter-flight-hud{z-index:27;line-height:1.3}#fighter-flight-hud .u-pilot-reticle{left:640px;top:290px;width:320px;height:320px}#fighter-flight-hud[hidden]{display:none!important}#fighter-flight-hud.console-view :is(.u-pilot-reticle,.f-attitude,.u-lead-label,.u-velocity,.u-pilot-condition,.f-markers){visibility:hidden}#fighter-flight-hud button{touch-action:manipulation}#fighter-flight-hud .u-pilot-footer{position:absolute;bottom:13px;left:29px;right:29px;display:flex;align-items:center;font-size:11px;gap:18px;color:#89b8cc}#fighter-flight-hud .u-pilot-footer button{font-size:11px!important}#fighter-flight-hud .u-pilot-footer span:first-child{margin-right:auto}#fighter-flight-hud .u-lead-label{top:555px;width:350px;left:625px;letter-spacing:0}
#fighter-flight-hud .f-identity{position:absolute;top:96px;left:28px;border-left:2px solid #75c8e6;padding:8px 16px;background:linear-gradient(90deg,#061a28c9,transparent)}#fighter-flight-hud .f-identity h2{font-size:21px;letter-spacing:2px;margin:8px 0}#fighter-flight-hud .f-identity span{font:11px Consolas;color:#82c9dc}#fighter-flight-hud .f-heading{position:absolute;left:595px;top:100px;width:410px;text-align:center;color:#a5d8eb;font:16px Consolas;letter-spacing:3px}#fighter-flight-hud .f-heading-ticks{height:21px;margin-bottom:9px;border-bottom:1px solid #5d8f9d;background:repeating-linear-gradient(90deg,transparent 0 15px,#568b9c99 15px 16px)}#fighter-flight-hud .f-wing{position:absolute;top:96px;right:28px;width:272px;padding:12px 16px;background:#051322bc;border-top:1px solid #568ead88;border-bottom:1px solid #568ead44}#fighter-flight-hud .f-wing h2{font-size:12px;letter-spacing:2px;color:#85c6dd;margin-bottom:9px}#fighter-flight-hud .f-wing p{font-size:11px;margin:9px 0;color:#9fcede}#fighter-flight-hud .f-wing small{float:right;letter-spacing:0}
#fighter-flight-hud .f-attitude{position:absolute;left:650px;top:450px;width:300px;text-align:center;color:#8dcce599;font:11px Consolas}#fighter-flight-hud .f-attitude span{position:absolute;left:275px;top:0;white-space:nowrap}#fighter-flight-hud .f-contact{position:absolute;transform:translate(-50%,-50%);font:10px Consolas,'Microsoft YaHei'!important;color:#82cdeb!important;text-shadow:0 1px 5px #000;white-space:nowrap;padding:6px!important}#fighter-flight-hud .f-contact.enemy{color:#ff8c7e!important}#fighter-flight-hud .f-contact.selected{border:1px solid currentColor;background:#33141655}#fighter-flight-hud .f-contact:disabled{opacity:.8;cursor:default}
#fighter-flight-hud .f-contact{width:22px;height:22px;padding:0!important}#fighter-flight-hud .f-contact i{font-style:normal}#fighter-flight-hud .f-contact span{position:absolute;left:28px;top:50%;transform:translateY(-50%);padding:3px;background:#06121a99}#fighter-flight-hud .f-contact.caption-left span{left:auto;right:28px}#fighter-flight-hud .f-contact.selected{background:transparent}
body.fighter-hud-active #map-pilot-hud,body.fighter-hud-active>.topbar,body.fighter-hud-active>.bottom-bar{display:none!important}body.fighter-hud-active #map-combat-bar{top:12px;bottom:auto;z-index:30}body.fighter-hud-active #flight>*:not(#native-battle-bar):not(#flight-notice):not(.scene-controls):not(#death-controls){visibility:hidden!important}body.fighter-hud-active #flight-notice{bottom:auto;top:20%;z-index:32}body.fighter-hud-active .scene-controls{top:12px}body.fighter-hud-active #formation-labels{display:none}
`;
