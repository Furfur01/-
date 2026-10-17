// Local presentation adapter. All commands affect this tab's reference simulation only.
const G=window.GalacticDemo,H=window.CommandHUD,R=window.GalaxyRender;
const {V,M,axes,clamp}=R,p=G.state.flight;
const names={fighter:'HF-01 · TALON',battleship:'BB-01 · VALIANT',flagship:'深空吞噬者'};
export const demo={mode:'fighter',formation:'wedge',squad:'alpha',map:false,help:false,toast:'',logs:[],drones:[],loaded:false,command:'guard',version:0};
const labels={guard:'护卫旗舰',intercept:'拦截来袭',attack:'攻击目标',recall:'返航召回'};
let toastUntil=0,flagshipMesh=null,lastPanel=0,seenLog=null;
const groups={alpha:{label:'ALPHA',count:4},beta:{label:'BETA',count:4}};
export function notify(message){demo.toast=message;toastUntil=performance.now()+3200;demo.logs.unshift({time:Math.floor(p.elapsed),message});demo.logs=demo.logs.slice(0,4);demo.version++;}

export async function init(){
 const response=await fetch('assets/flagship.bin');if(!response.ok)throw Error('旗舰模型载入失败');
 const geom=new R.Geometry();geom.data=new Float32Array(await response.arrayBuffer());flagshipMesh=geom.upload(G.renderer.gl);demo.loaded=true;
 const originalDraw=G.renderer.drawVessel.bind(G.renderer);
 G.renderer.drawVessel=(index,model,opts,turrets)=>{
  if(demo.mode==='flagship'&&index===4&&turrets===p.turrets&&flagshipMesh){G.renderer.drawMesh(flagshipMesh,model,opts);return;}
  originalDraw(index,model,opts,turrets);
 };
 const originalBefore=H.beforeFrame;
 H.beforeFrame=dt=>{originalBefore(dt);if(!G.state.hudPaused&&!document.hidden){updateDrones(dt);if(demo.mode==='flagship'){p.charging=false;p.charge=0;}}};
 const originalAfter=H.afterFrame;
 H.afterFrame=now=>{originalAfter(now);const log=H.hud.logs.at(-1);if(log&&log!==seenLog){seenLog=log;notify(demo.mode==='flagship'&&log.message.includes('已接管玄武级战列舰')?'已接管深空吞噬者，无人联队指挥链路就绪':log.message);}if(now>toastUntil&&demo.toast){demo.toast='';demo.version++;}if(now-lastPanel>90){lastPanel=now;document.dispatchEvent(new Event('hud-tick'));}};
 window.PreviewHUD={get mode(){return demo.mode;},get state(){return snapshot();},switchMode,command,setFormation,deploy,reset};
 window.addEventListener('keydown',keyboard,true);
 window.addEventListener('hashchange',()=>{const mode=location.hash.slice(1);if(names[mode]&&mode!==demo.mode)switchMode(mode);});
 let initial=location.hash.slice(1);if(!names[initial]){try{initial=localStorage.getItem('empire-three-hud-preview-mode');}catch{}}
 switchMode(names[initial]?initial:'fighter',true);
 document.documentElement.dataset.previewReady='true';
}
export function switchMode(mode,initial=false){
 if(!names[mode])return;
 demo.mode=mode;demo.map=false;demo.help=false;demo.drones=[];demo.command='guard';
 H.hud.hangar=false;H.hud.friends=H.hud.friends.filter(f=>!f.drone&&!f.deployed);H.hud.lastHull=-1;
 G.state.transition=null;G.configureFlight(mode==='fighter'?3:4,initial);G.screenVisible('flight');H.beforeFrame(0);
 p.external=mode!=='fighter';p.cameraBlend=p.external?1:0;p.cameraZoom=mode==='flagship'?1.45:1;
 p.throttle=mode==='fighter'?32:0;p.speed=mode==='fighter'?90:0;p.boost=false;p.ai=false;p.align=false;
 G.clearControls();G.setTurretMode(mode==='fighter'?'hold':'auto');
 document.body.dataset.previewMode=mode;document.getElementById('command-shell').dataset.previewMode=mode;
 try{localStorage.setItem('empire-three-hud-preview-mode',mode);}catch{}
 history.replaceState(null,'','#'+mode);
 notify({fighter:'战机链路已建立 · 编队护航中',battleship:'战列舰火控就绪 · 自动追踪当前目标',flagship:'旗舰指挥链路已建立 · 无人僚机待命'}[mode]);
 demo.version++;
}
export function reset(){const mode=demo.mode;H.reset();switchMode(mode,true);notify('演练已重置 · 三舰桥共享本地场景');}
export function setFormation(value){demo.formation=value;H.hud.formation=value;notify('编队调整为'+{wedge:'楔形',line:'纵列',screen:'护航屏障'}[value]);}
export function selectTarget(index){if(G.state.hudPaused)return;G.selectTarget(index);notify('已锁定 · '+p.targets[index].name);}
export function action(name){
 if(name==='pause'){H.setPaused(!G.state.hudPaused);demo.version++;return;}
 if(name==='view'){G.setView();return;}
 if(name==='help'){demo.help=!demo.help;demo.version++;return;}
 if(name==='map'){demo.map=!demo.map;demo.version++;return;}
 if(name==='reset'){reset();return;}
 if(G.state.hudPaused)return;
 if(name==='target'){G.cycleTarget();notify('已锁定 · '+p.targets[p.targetIndex].name);}
 if(name==='fire'){
  if(demo.mode==='flagship'){notify('旗舰无主炮 · 请指挥无人僚机攻击');return;}
  if(demo.mode==='fighter')H.actions.main();else{G.fireTurrets();notify(p.turretMode==='hold'?'当前为停火模式':'舰炮组已接收射击指令');}
 }
 if(name==='missile')H.actions.missile();
 if(name==='align')G.alignTarget();
 if(name==='auto')G.setAI(!p.ai);
 if(name==='turret')H.actions.turret();
 if(name==='emergency')H.actions.emergency();
 if(name==='balance')H.actions['shield-balance']();
 if(name==='boost')H.actions.boost();
}
export function power(index,value){if(!G.state.hudPaused)H.setPower(index,value);}
export function shield(index){if(!G.state.hudPaused){H.hud.priority=index;notify(['舰艏','左舷','右舷','舰艉'][index]+'护盾优先充能');}}
export function throttle(value){if(!G.state.hudPaused){p.throttle=+value;p.ai=false;}}
export function deploy(){
 if(G.state.hudPaused||demo.mode!=='flagship')return;
 const group=demo.squad;if(demo.drones.some(d=>d.group===group)){notify(groups[group].label+' 联队已在外执行任务');return;}
 const a=axes(p);
 for(let i=0;i<groups[group].count;i++){
  const d={name:groups[group].label+' '+(i+1),group,drone:true,kind:3,scale:.7,pos:V.add(p.pos,V.scale(a.right,(group==='alpha'?-1:1)*12)),heading:-p.yaw-Math.PI/2,age:0,phase:'launch',command:'guard',hp:100,lastShot:0,slot:i,deployed:true};
  demo.drones.push(d);H.hud.friends.push(d);
 }
 H.hud.hangar=true;notify(groups[group].label+' 联队出动 · 4 架无人僚机');
}
export function command(name){
 if(G.state.hudPaused)return;
 const list=demo.drones.filter(d=>d.group===demo.squad);
 if(!list.length){notify('请先释放 '+groups[demo.squad].label+' 联队');return;}
 demo.command=name;
 for(const d of list){d.command=name;d.phase=name==='recall'?'return':d.phase;d.target=p.targetIndex;}
 notify(groups[demo.squad].label+' · '+labels[name]+(name==='attack'?'：'+p.targets[p.targetIndex].name:''));
}
function updateDrones(dt){
 if(demo.mode!=='flagship')return;
 const a=axes(p),remove=[];
 for(const d of demo.drones){
  d.age+=dt;let goal;
  if(d.phase==='launch'&&d.age>2)d.phase='active';
  const side=d.group==='alpha'?-1:1,slot=d.slot,spacing=demo.formation==='line'?22:demo.formation==='screen'?62:38;
  if(d.command==='recall'){
   goal=V.add(p.pos,V.scale(a.right,side*12));
   if(V.length(V.sub(d.pos,goal))<3){remove.push(d);continue;}
  }else if(d.command==='attack'&&p.targets[d.target]?.hp>0){
   const t=p.targets[d.target],angle=p.elapsed*.45+slot*1.57;
   goal=V.add(t.pos,[Math.cos(angle)*65,15+Math.sin(angle*.6)*18,Math.sin(angle)*50]);
   if(d.phase==='active'&&V.length(V.sub(d.pos,t.pos))<160&&p.elapsed-d.lastShot>1.7){d.lastShot=p.elapsed;p.beams.push({start:[...d.pos],end:[...t.pos],width:.15,color:[.35,.8,1],age:0,life:.2});G.damageTarget(t,.35);}
  }else if(d.command==='intercept'){
   const q=p.projectiles.find(q=>q.hostile&&V.length(V.sub(q.pos,p.pos))<500);
   goal=q?V.add(q.pos,V.scale(a.forward,10)):V.add(p.pos,V.add(V.scale(a.right,side*(65+slot*25)),V.scale(a.forward,150+slot*25)));
   if(q&&V.length(V.sub(d.pos,q.pos))<80){p.beams.push({start:[...d.pos],end:[...q.pos],width:.15,color:[.4,.85,1],age:0,life:.2});q.life=0;q.age=999;}
  }else{
   goal=V.add(p.pos,V.add(V.scale(a.right,side*(32+slot*spacing)),V.add(V.scale(a.forward,65+slot*(demo.formation==='line'?65:20)),V.scale(a.up,10+slot*4))));
  }
  const delta=V.sub(goal,d.pos),distance=V.length(delta),step=Math.min(distance,dt*(d.command==='recall'?105:85));
  if(distance>.01){d.pos=V.add(d.pos,V.scale(delta,step/distance));d.heading=Math.atan2(delta[0],-delta[2])-Math.PI/2;}
 }
 if(remove.length){demo.drones=demo.drones.filter(d=>!remove.includes(d));H.hud.friends=H.hud.friends.filter(d=>!remove.includes(d));if(!demo.drones.some(d=>d.group===remove[0].group))notify(groups[remove[0].group].label+' 联队已全部回收');}
 H.hud.hangar=demo.drones.length>0;
}
function keyboard(e){
 if(e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 const mode={Digit1:'fighter',Digit2:'battleship',Digit3:'flagship'}[e.code];
 if(mode){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)switchMode(mode);return;}
 if(e.code==='KeyH'||demo.help&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)action('help');return;}
 if(demo.help){e.preventDefault();e.stopImmediatePropagation();return;}
 if(e.code==='F4'||e.code==='F5'||e.code==='F1'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&demo.mode==='flagship'){if(e.code==='F4')deploy();if(e.code==='F5')action('emergency');if(e.code==='F1')command('attack');}return;}
 if(e.code==='Space'&&demo.mode!=='fighter'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)action('fire');}
}
export function snapshot(){
 const t=p.targets[p.targetIndex];
 return {mode:demo.mode,name:names[demo.mode],formation:demo.formation,squad:demo.squad,loaded:demo.loaded,map:demo.map,help:demo.help,toast:demo.toast,logs:[...demo.logs],paused:!!G.state.hudPaused,elapsed:p.elapsed,speed:p.speed,throttle:p.throttle,shield:p.shield,hull:p.hull,heat:H.hud.heat,capacitor:H.hud.capacitor,shields:[...H.hud.shields],priority:H.hud.priority,power:[...H.hud.power],missiles:p.missileStock,missileCooldown:p.missileCooldown,turretMode:p.turretMode,turrets:p.turrets.length,aligned:p.turrets.filter(t=>t.aligned).length,auto:p.ai,align:p.align,external:p.external,targetIndex:p.targetIndex,target:t?{name:t.name,hp:t.hp,distance:V.length(V.sub(t.pos,p.pos))*.008,error:p.boresightError}:null,targets:p.targets.map((t,i)=>({index:i,name:t.name,hp:t.hp,distance:V.length(V.sub(t.pos,p.pos))*.008})),drones:demo.drones.map(d=>({name:d.name,group:d.group,phase:d.phase,command:d.command,hp:d.hp})),command:demo.command};
}
export function drawRadar(canvas,large=false){
 const c=canvas.getContext('2d'),w=canvas.width/2,h=canvas.height/2,cx=w/2,cy=h/2,range=750,r=Math.min(cx,cy)-24;
 c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,w,h);c.lineWidth=.65;
 for(let i=1;i<=4;i++){c.strokeStyle='#77bddd33';c.beginPath();c.ellipse(cx,cy,large?r*i/4*2.4:r*i/4,r*i/4,0,0,Math.PI*2);c.stroke();}
 c.strokeStyle='#77bddd40';c.beginPath();c.moveTo(cx,12);c.lineTo(cx,h-12);c.moveTo(12,cy);c.lineTo(w-12,cy);c.stroke();
 const a=axes(p),project=pos=>{const d=V.sub(pos,p.pos);return {x:clamp(cx+V.dot(d,a.right)/range*r*(large?2.4:1),12,w-12),y:clamp(cy-V.dot(d,a.forward)/range*r,12,h-12)};};
 const contacts=[];
 for(let i=0;i<p.targets.length;i++){
  const t=p.targets[i];if(t.hp<=0)continue;const q=project(t.pos);c.fillStyle='#ff7f70';c.fillRect(q.x-2.5,q.y-2.5,5,5);
  if(i===p.targetIndex){c.strokeStyle='#ff8b7d';c.strokeRect(q.x-7,q.y-7,14,14);}
  if(large){c.font='10px Bahnschrift, Microsoft YaHei';c.fillText(t.name,q.x+12,q.y-5);}contacts.push({...q,index:i});
 }
 for(const f of H.hud.friends){const q=project(f.pos);c.fillStyle=f.drone?'#b6f3e1':'#7bd6ff';c.beginPath();c.moveTo(q.x,q.y-4);c.lineTo(q.x-3,q.y+3);c.lineTo(q.x+3,q.y+3);c.closePath();c.fill();if(large){c.font='9px Consolas';c.fillText(f.name,q.x+7,q.y+4);}}
 c.fillStyle='#e1f3ff';c.beginPath();c.moveTo(cx,cy-8);c.lineTo(cx-5,cy+5);c.lineTo(cx+5,cy+5);c.closePath();c.fill();
 c.fillStyle='#71a8be';c.font='9px Consolas';c.fillText('6 KM',12,h-9);canvas.contacts=contacts;
}
export function pickRadar(e){const c=e.currentTarget,r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*c.width/2,y=(e.clientY-r.top)/r.height*c.height/2;let hit,dist=20;for(const q of c.contacts||[]){const d=Math.hypot(x-q.x,y-q.y);if(d<dist){hit=q;dist=d;}}if(hit)selectTarget(hit.index);}
