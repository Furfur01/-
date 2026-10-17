window.createFlightController=({state,renderer,SHIPS,COMBAT,LAYOUTS,keys,$,M,V,clamp,mix,shortAngle,notice,configureFlight,setView,selectedTarget,renderContacts,shipMatrix,tone,burst,updateCamera,forward,getMouseDown})=>{
function projectileContact(from,to,center,radius,previous=center){
  const p=from.map((v,i)=>v-previous[i]);
  const v=to.map((n,i)=>n-from[i]-(center[i]-previous[i]));
  const c=p.reduce((sum,n)=>sum+n*n,0)-radius*radius;
  if(c<=0)return 0;
  const a=v.reduce((sum,n)=>sum+n*n,0),b=2*p.reduce((sum,n,i)=>sum+n*v[i],0);
  if(a<1e-12)return null;
  const discriminant=b*b-4*a*c;if(discriminant<0)return null;
  const t=(-b-Math.sqrt(discriminant))/(2*a);
  return t>=0&&t<=1?t:null;
}
function cockpitClass(profile={}) {
 if(profile.role==='fighter'||(!profile.role&&!(profile.length>=10)))return 'fighter';
 return profile.length>=50?'bastion':'horizon';
}
function pilotHandling(profile) {
 const kind=cockpitClass(profile);
 return {kind,turn:Math.min(profile.turn||.45,kind==='fighter'?3:kind==='bastion'?.22:.38),acceleration:kind==='fighter'?.7:kind==='bastion'?.12:.22,braking:kind==='fighter'?1:kind==='bastion'?.18:.3};
}
function steerPilot(ship,input,dt){
 const handling=pilotHandling(ship.profile),turn=handling.turn*dt,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),limit=(v,a,b)=>Math.max(a,Math.min(b,v));
 ship.yaw=wrap(ship.yaw+(input.heading===undefined?input.yaw*turn:limit(wrap(input.heading-ship.yaw),-turn,turn)));
 if(handling.kind==='fighter'||input.lock)ship.pitch=limit(ship.pitch+(input.elevation===undefined?input.pitch*turn:limit(input.elevation-ship.pitch,-turn,turn)),-1.2,1.2);
 ship.roll=handling.kind==='fighter'?wrap((ship.roll||0)+(input.roll||0)*1.65*dt):0;
}
function predictPilot(row,profile,input,seconds){
 const ship={x:row[1],y:row[2],z:row[3],yaw:row[4],pitch:row[5],roll:row[12]||0,speed:row[9],profile},handling=pilotHandling(profile);
 const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
 for(let left=Math.max(0,Math.min(.4,seconds));left>1e-7;){
  const dt=Math.min(.05,left);left-=dt;steerPilot(ship,input,dt);
  const desired=input.throttle*profile.speed*(input.boost?1.5:1);
  ship.speed+=limit(desired-ship.speed,-profile.speed*handling.braking*dt,profile.speed*handling.acceleration*dt);
  ship.x+=Math.sin(ship.yaw)*Math.cos(ship.pitch)*ship.speed*dt;
  ship.y+=Math.sin(ship.pitch)*ship.speed*dt;
  ship.z+=Math.cos(ship.yaw)*Math.cos(ship.pitch)*ship.speed*dt;
 }
 return ship;
}
  // Cosmetic geometry only. Every discharge/impact originates from a server event.
  class BattlePresentation {
    constructor(){this.impacts=[];this.flashes=[];}
    event(e,battle){
      if(e.type==='fire')this.flashes.push({pos:e.from,color:this.color(e.kind),age:0,life:.22});
      if(e.type==='hit'||e.type==='destroy'||e.type==='intercept'){
        this.impacts.push({id:e.shipId,pos:[e.x,e.y,e.z],shield:e.type==='hit'&&e.shield,dead:e.type==='destroy',age:0,life:e.type==='destroy'?2.4:.7,radius:Math.max(2,battle.metadata[e.shipId]?.profile.length*.65||3)});
      }
    }
    color(kind){return /laser|ion/.test(kind)?[1,.45,.09]:/plasma/.test(kind)?[.35,.5,1]:/beam/.test(kind)?[.12,.65,1]:[1,.8,.45];}
    update(dt){this.impacts=this.impacts.filter(e=>(e.age+=dt)<e.life).slice(-160);this.flashes=this.flashes.filter(e=>(e.age+=dt)<e.life).slice(-240);}
    clear(){this.impacts=[];this.flashes=[];}
    init(r){
      if(this.program)return;const gl=r.gl;
      const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
      this.program=gl.createProgram();
      gl.attachShader(this.program,shader(gl.VERTEX_SHADER,'attribute vec3 p,c;attribute vec2 uv;attribute float a;uniform mat4 vp;varying vec3 color;varying vec2 tex;varying float alpha;void main(){color=c;tex=uv;alpha=a;gl_Position=vp*vec4(p,1.);}'));
      gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 color;varying vec2 tex;varying float alpha;void main(){float edge=abs(tex.y);float core=exp(-edge*edge*110.);float halo=exp(-edge*edge*5.)*.7;float cap=smoothstep(0.,.025,tex.x)*smoothstep(0.,.025,1.-tex.x);gl_FragColor=vec4(mix(color,vec3(1.,.96,.87),core*.7),(core+halo)*alpha*cap);}'));
      gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));
      this.attr=Object.fromEntries(['p','c','uv','a'].map(n=>[n,gl.getAttribLocation(this.program,n)]));this.vp=gl.getUniformLocation(this.program,'vp');this.buffer=gl.createBuffer();
    }
    environment(r,time){
      const gl=r.gl;r.drawSpaceSky(.8);
      const planet=M.compose([3200,-2500,-5200],[.1,.42,.18],[900,900,900]);
      r.drawMesh(r.moonMesh,planet,{mode:7,light:[-.5,.7,1],exposure:1.1});
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      r.drawMesh(r.moonMesh,M.compose([3200,-2500,-5200],[.1,.42,.18],[915,915,915]),{mode:8});
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
    }
    draw(r,battle,allWeapons){
      this.init(r);const gl=r.gl,data=[],glows=[],focal=r.height/(2*Math.tan(r.fov/2)),eye=r.eye;
      const pixelSize=p=>Math.max(.015,V.length(V.sub(p,eye))/focal);
      const ribbon=(a,b,color,width,alpha=1)=>{
        const direction=V.sub(b,a),mid=V.scale(V.add(a,b),.5),side=V.norm(V.cross(direction,V.sub(eye,mid)));
        if(!Number.isFinite(side[0]))return;
        const w=Math.max(width,pixelSize(mid)*8),offset=V.scale(side,w);
        const points=[V.sub(a,offset),V.add(a,offset),V.sub(b,offset),V.add(b,offset)];
        for(const i of [0,1,2,2,1,3])data.push(...V.sub(points[i],eye),...color,i<2?0:1,i%2?1:-1,alpha);
      };
      const glow=(p,c,size,alpha=1)=>glows.push(...p,...c.map(v=>v*alpha),size);
      if(allWeapons){
        for(const beam of state.flight.beams.slice(-240)){
          const alpha=Math.max(0,1-beam.age/beam.life);ribbon(beam.start,beam.end,beam.color,beam.width*2,alpha);
          glow(beam.start,beam.color,12,alpha);glow(beam.end,beam.color,16,alpha*.65);
        }
        for(const q of state.flight.projectiles){
          const speed=V.length(q.velocity),tail=V.sub(q.pos,V.scale(V.norm(q.velocity),Math.min(q.missile?40:28,speed*.08)));
          const color=q.missile?[1,.55,.16]:q.color||[.6,.8,1];ribbon(tail,q.pos,color,q.missile?.32:.45,.9);glow(q.pos,color,q.missile?9:7);
        }
      }
      // Engines are anchored to the same original nozzle positions as the piloted hull.
      for(const id of battle.engineIds||[]){
        const row=battle.row(id),index=battle.indices.get(battle.metadata[id]?.type),layout=LAYOUTS[index];if(!row||!layout||row[9]<.1)continue;
        const model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:0},index);
        if(V.length(V.sub(row.slice(1,4),eye))>1800)continue;
        for(const nozzle of layout.engines.slice(0,6)){
          const at=M.transform(model,nozzle.position),dir=V.norm(V.sub(M.transform(model,nozzle.direction),M.transform(model,[0,0,0])));
          const length=nozzle.radius*(5+Math.min(1,row[9]/battle.metadata[id].profile.speed)*9);
          ribbon(at,V.add(at,V.scale(dir,length)),[.12,.5,1],nozzle.radius*.8,.65);glow(at,[.3,.7,1],Math.min(16,Math.max(3,nozzle.radius/pixelSize(at)*2)),.7);
        }
      }
      for(const flash of allWeapons?this.flashes:[])glow(flash.pos,flash.color,22,1-flash.age/flash.life);
      const right=V.norm(V.cross(r.cameraForward,r.cameraUp)),up=V.norm(V.cross(right,r.cameraForward));
      for(const e of allWeapons?this.impacts.slice(-Math.floor(40*battle.quality)):[]){
        const phase=e.age/e.life,alpha=1-phase,row=battle.row(e.id);
        const at=e.shield&&row?.[6]>0?row.slice(1,4):e.pos;
        const radius=e.dead?e.radius*(.5+phase*5):e.radius*(1+phase*.15),color=e.shield?[.12,.6,1]:[1,.4,.07];
        const size=Math.min(180,Math.max(12,radius/pixelSize(at)*2));
        glow(at,color,size,alpha*(e.shield?.3:.9));glow(at,[1,.9,.65],size*.22,alpha*(e.shield?.2:1));
        if(e.shield||e.dead){
          let previous;
          for(let i=0;i<=24;i++){
            const angle=i/24*Math.PI*2,p=V.add(at,V.add(V.scale(right,Math.cos(angle)*radius),V.scale(up,Math.sin(angle)*radius*(e.dead?.45:1))));
            if(previous)ribbon(previous,p,color,pixelSize(at)*1.2,alpha*(e.shield?.7:.4));previous=p;
          }
        }
        if(e.dead)for(let i=0;i<12;i++){
          const angle=i*2.39996,dir=V.add(V.scale(right,Math.cos(angle)),V.scale(up,Math.sin(angle))),tip=V.add(at,V.scale(dir,radius*(.7+(i%4)*.15)));
          ribbon(V.sub(tip,V.scale(dir,e.radius*.3)),tip,[1,.65,.25],.15,alpha);
        }
      }
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      if(data.length){
        for(let i=0;i<gl.getParameter(gl.MAX_VERTEX_ATTRIBS);i++)gl.disableVertexAttribArray(i);
        gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
        for(const [name,size,offset]of [['p',3,0],['c',3,12],['uv',2,24],['a',1,32]]){const a=this.attr[name];gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,36,offset);}
        gl.uniformMatrix4fv(this.vp,false,new Float32Array(M.mul(r.vp,M.translate(...eye))));gl.drawArrays(gl.TRIANGLES,0,data.length/9);
      }
      if(glows.length)r.dynamicFlat(glows,true,1);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
    }
  }

  // Independent battlefield controller; shared runtime supplies cameras, controls and rendering.
  class NativeFleetBattle {
    constructor(){this.params=new URLSearchParams(location.search);this.id=this.params.get('battle');this.replayId=this.params.get('replay');this.metadata=[];this.rows=[];this.previous=[];this.selected=-1;this.controlled=null;this.seq=0;this.eventSeq=0;this.fireUntil=0;this.missileUntil=0;this.overview=true;this.presentation=new BattlePresentation();this.distance=650;this.center=[0,0,0];this.quality=1;this.lodLevels=new Map();this.overviewYaw=.45;this.overviewPitch=.24;this.playTime=0;this.playSpeed=1;this.elapsedFrames=[];this.contacts=new Map();this.vesselVisuals=new Map();this.projectileVisuals=new Map();this.meshGroups=new Map();this.detailIds=new Set();}
    async request(url,body){const r=await fetch(url,{credentials:'same-origin',cache:'no-store',...(body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'无法连接战场');return data;}
    fail(e){notice(e.message);$('#native-status').textContent=e.message;console.error(e);}
    async start(){
      document.body.classList.add('real-battle');$('.flight-header>div').innerHTML='银河帝国<span>/</span>真实战场';$('.flight-header>p').textContent='正式交战 · 自动接敌 / 亲自驾驶';$('#flight').setAttribute('aria-label','真实战场驾驶');$('#flight-nav-label').textContent='真实战场';$('.help-note').textContent='这是正式战斗。移动与射击影响真实损失；退出驾驶交还 AI。全景中拖动旋转、滚轮缩放，Shift 拖动平移。';const bar=document.createElement('div');bar.id='native-battle-bar';bar.innerHTML='<strong id="native-status">连接真实战场…</strong><select id="native-formation" aria-label="己方编队"></select><select id="native-vessel" aria-label="编队内舰船"></select><button id="native-claim">亲自驾驶</button><button id="native-release">交还 AI</button><button id="native-cinema">交火视角</button><button id="native-overview">舰队全景</button><button id="native-follow">跟随 / 舰桥</button><button id="native-leave">返回舰队</button><button id="native-pause" hidden>暂停</button><select id="native-speed" hidden><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select><input id="native-seek" type="range" min="0" max="600" step=".1" value="0" hidden>';document.body.append(bar);this.labels=document.createElement('div');this.labels.id='formation-labels';document.body.append(this.labels);this.labels.onclick=e=>{const button=e.target.closest('[data-group]');if(!button)return;const group=this.displayGroups.find(g=>g.key===button.dataset.group);if(group)this.chooseGroup(group.key);};
      window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.type!=='battle-visibility')return;window.commandSceneActive=!e.data.active;if(!e.data.active){keys.clear();void this.setAI(true);}});
      $('#native-formation').onchange=e=>this.chooseGroup(e.target.value);$('#native-vessel').onchange=e=>this.select(Number(e.target.value));$('#native-claim').onclick=()=>this.setAI(false);$('#native-release').onclick=()=>this.setAI(true);$('#native-cinema').onclick=()=>this.frameBattle();$('#native-overview').onclick=()=>this.frameBattle(true);$('#native-follow').onclick=()=>{this.overview=false;setView();};$('#native-leave').onclick=()=>this.leave();$('#native-pause').onclick=()=>{this.paused=!this.paused;$('#native-pause').textContent=this.paused?'继续':'暂停';};$('#native-speed').onchange=e=>this.playSpeed=Number(e.target.value);$('#native-seek').oninput=e=>{this.playTime=Number(e.target.value);this.replayCursor=0;this.presentation.clear();this.projectileVisuals.clear();this.vesselVisuals.clear();state.flight.shieldHits=[];state.flight.beams=[];state.flight.particles=[];state.flight.projectiles=[];state.flight.weaponImpacts=[];state.flight.specialBlasts=[];};
      const canvas=$('#scene');canvas.addEventListener('wheel',e=>{if(this.overview){e.preventDefault();this.distance=clamp(this.distance*Math.exp(e.deltaY*.001),80,12000);}},{passive:false});canvas.addEventListener('pointermove',e=>{if(this.overview&&e.buttons){this.cinematicAnchor=null;if(e.shiftKey){this.cinematicAnchor=null;const right=[Math.cos(this.overviewYaw),0,-Math.sin(this.overviewYaw)];for(let i=0;i<3;i++)this.center[i]-=right[i]*e.movementX*this.distance*.001;this.center[1]+=e.movementY*this.distance*.001;}else{this.overviewYaw-=e.movementX*.004;this.overviewPitch=clamp(this.overviewPitch+e.movementY*.003,-1.3,1.3);}}});
      document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();void this.setAI(true);}});window.addEventListener('pagehide',()=>{if(this.controlled!==null)fetch('/api/battles/'+this.id+'/control',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'release'})});});
      const account=await this.request('/api/state');this.owner=account.player.id;
      if(this.replayId){await this.loadReplay(this.replayId);return;}
      this.receive(await this.request('/api/battles/'+this.id));
      this.stream=new EventSource('/api/battles/'+this.id+'/events');this.stream.onmessage=e=>this.receive(JSON.parse(e.data));this.stream.onerror=()=>notice('正在重新连接，超时后由 AI 接管');this.stream.addEventListener('finished',async()=>{this.stream.close();clearInterval(this.inputTimer);this.receive(await this.request('/api/battles/'+this.id));this.controlled=null;notice('战斗结束 · 返回舰队可查看战报和回放');});
      this.inputTimer=setInterval(()=>this.sendInput(),100);this.syncHeader();
    }
    async loadReplay(id){this.presentation.clear();this.projectileVisuals.clear();this.vesselVisuals.clear();state.flight.shieldHits=[];state.flight.beams=[];state.flight.particles=[];state.flight.projectiles=[];state.flight.weaponImpacts=[];state.flight.specialBlasts=[];const data=await this.request('/api/replay/'+id);if(!data.record)throw Error('此战报没有空间记录');this.replay=data.record;this.deathTicks=new Map(this.replay.events.filter(e=>e.type==='destroy').map(e=>[e.shipId,e.tick]));this.report=data.report;this.metadata=data.record.metadata;this.rows=data.record.frames[0].ships;this.previous=this.rows;this.playTime=0;this.replayCursor=0;this.controlled=null;clearInterval(this.inputTimer);this.prepare();this.frameBattle();for(const name of ['pause','speed','seek'])$('#native-'+name).hidden=false;$('#native-seek').max=data.report.duration;this.syncHeader();}
    receive(data){
      if(data.trial){$('.flight-header>p').textContent='隔离编队测试 · 权威战斗模拟';$('.help-note').textContent='自选测试舰队，不影响正式资源。主力保持三维战列，轻舰近距离缠斗；返回舰队可修改双方配比。';}
      this.previous=this.rows;this.rows=data.ships;this.received=performance.now();this.snapshot=data;this.projectiles=data.projectiles||[];state.flight.specialBlasts=(data.specialBlasts||[]).filter(e=>!e.harmless).map(e=>({...e,pos:[e.x,e.y,e.z],age:Math.max(0,(data.tick-e.tick)*.05)}));
      if(data.metadata){this.metadata=data.metadata;this.prepare();}
      this.controlled=data.controls?.[this.owner]?.shipId??null;this.seq=Math.max(this.seq,data.controls?.[this.owner]?.seq??0);
      if(this.controlled!==null&&this.selected!==this.controlled)this.select(this.controlled,false);
      for(const event of data.events||[])if(event.seq>this.eventSeq)this.effect(event);
      this.eventSeq=data.eventSeq;if(data.status==='finished'&&!this.replay){this.controlled=null;this.overview=true;}this.syncHeader();
    }
    prepare(){
      this.fullDetail=this.metadata.length<=128;this.indices=new Map(SHIPS.map((s,i)=>[s.id,i]));this.types=new Map();
      for(const m of this.metadata)if(m.owner===this.owner&&m.profile.piloted){if(!this.types.has(m.type))this.types.set(m.type,[]);this.types.get(m.type).push(m.id);}
      this.displayGroups=BattleDisplay.groupBattleShips(this.metadata);this.refreshGroups();
      if(this.selected<0||!this.metadata[this.selected]){const id=this.metadata.find(m=>m.owner===this.owner&&m.profile.piloted&&this.rows[m.id]?.[6]>0)?.id??this.metadata.find(m=>this.indices.has(m.type))?.id;if(id!==undefined)this.select(id,false);}
      this.buildGroups();if(!this.framed){this.frameBattle();this.framed=true;}
    }
    async select(id,release=true){if(!this.metadata[id]||!this.indices.has(this.metadata[id].type))return;if(release&&this.controlled!==null)await this.setAI(true);this.selected=id;this.predicted=null;const m=this.metadata[id],index=this.indices.get(m.type);const blasts=state.flight.specialBlasts;configureFlight(index,true);state.flight.specialBlasts=blasts||[];state.flight.targets=[];state.flight.ai=true;this.contacts.clear();const ids=this.displayGroups.find(g=>g.key===m.formation)?.ids||[id];$('#native-formation').value=m.formation;$('#native-vessel').innerHTML=ids.filter(id=>this.rows[id]?.[6]>0).map(id=>'<option value="'+id+'">'+SHIPS[index].name+' #'+(id+1)+'</option>').join('');$('#native-vessel').value=id;this.applyOwn(true);this.refreshContacts();}
    refreshGroups(){const select=$('#native-formation'),value=select.value;select.innerHTML=this.displayGroups.map(g=>{const n=g.ids.filter(id=>this.rows[id]?.[6]>0).length;return '<option value="'+g.key+'" '+(!n?'disabled':'')+'>'+(g.owner===this.owner?'己方':'敌方')+' · '+(SHIPS[this.indices.get(g.type)]?.name||g.type)+' · '+g.key.split(':').at(-1)+'队 · '+n+' 艘</option>';}).join('');if(this.displayGroups.some(g=>g.key===value))select.value=value;}
    chooseGroup(key){const group=this.displayGroups.find(g=>g.key===key),id=group?.ids.find(id=>this.rows[id]?.[6]>0);if(id!==undefined){this.select(id);const row=this.rows[id];this.cinematicAnchor=null;this.cinemaComposition=false;this.center=row.slice(1,4);this.distance=Math.max(100,this.metadata[id].profile.length*(this.metadata[id].type==='Iron_Behemoth'?3.2:12));this.overview=true;}}
    chooseType(type){const id=this.types.get(type)?.find(id=>this.rows[id]?.[6]>0);if(id!==undefined)return this.select(id);notice('该编队已经没有存活舰船');}
    frameBattle(all=false){
      this.overview=true;this.cinematicAnchor=null;this.cinemaComposition=!all;
      const live=this.metadata.filter(m=>this.rows[m.id]?.[6]>0);if(!live.length)return;
      if(all){const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const m of live)for(let i=0;i<3;i++){lo[i]=Math.min(lo[i],this.rows[m.id][i+1]);hi[i]=Math.max(hi[i],this.rows[m.id][i+1]);}this.center=lo.map((v,i)=>(v+hi[i])/2);this.distance=Math.max(500,Math.hypot(...lo.map((v,i)=>hi[i]-v))*.85);this.overviewPitch=.55;this.overviewYaw=-.7;return;}
      const own=live.filter(m=>m.owner===this.owner),anchor=own.find(m=>m.type==='Iron_Behemoth')||own.find(m=>m.type==='Dreadnought')||own.find(m=>m.type==='Battleship')||own.find(m=>m.profile.role==='line')||own[0]||live[0],row=this.rows[anchor.id],sign=anchor.side==='attacker'?1:-1;
      this.cinematicAnchor=anchor.id;const focus=this.cinemaFocus(anchor.id,row);this.center=focus.center;this.distance=Math.max(this.fullDetail?420:520,anchor.profile.length*3.2);this.overviewYaw=focus.yaw;this.overviewPitch=.18;
    }
    cinemaFocus(id,row){const enemy=this.rows[row[8]],sign=this.metadata[id].side==='attacker'?1:-1,dir=enemy?.[6]>0?V.norm(V.sub(enemy.slice(1,4),row.slice(1,4))):[sign,0,0];return {center:[row[1]+dir[0]*(this.fullDetail?150:180),row[2]+dir[1]*(this.fullDetail?150:180)+15,row[3]+dir[2]*(this.fullDetail?150:180)],yaw:Math.atan2(-dir[0],-dir[2])+.65};}
    async setAI(enabled){if(this.replay)return;try{if(enabled){if(this.controlled!==null)await this.request('/api/battles/'+this.id+'/control',{type:'release'});this.controlled=null;this.predicted=null;state.flight.ai=true;keys.clear();}else{const data=await this.request('/api/battles/'+this.id+'/control',{type:'claim',shipId:this.selected});this.controlled=data.control.shipId;this.seq=data.control.seq;this.predicted=null;state.flight.ai=false;if(state.flight.external)setView();this.overview=false;state.flight.yawTarget=state.flight.yaw;state.flight.pitchTarget=state.flight.pitch;notice('已接管参战舰船 · 射击与损失计入真实战果');}this.syncHeader();}catch(e){notice(e.message);}}
    fire(kind){if(kind==='missile'&&!this.metadata[this.selected]?.profile.missile&&!this.metadata[this.selected]?.profile.secondaryMissile){notice('该舰未装备导弹');return false;}if(this.replay||this.controlled===null){notice('点击亲自驾驶，接管己方参战舰船');return false;}if(kind==='missile')this.missileUntil=performance.now()+180;else this.fireUntil=performance.now()+180;return true;}
    pilotIntent(){
      const p=state.flight,target=selectedTarget();
      if(p.align&&target?.hp>0){const d=V.sub(target.pos,p.pos);p.yawTarget=Math.atan2(d[0],-d[2]);p.pitchTarget=clamp(Math.atan2(d[1],Math.hypot(d[0],d[2])),-1.2,1.2);}
      const input={throttle:p.throttle/100,yaw:0,pitch:0,heading:shortAngle(Math.PI-p.yawTarget),elevation:clamp(p.pitchTarget,-1.2,1.2),fire:keys.has('Space')||(!p.profile.capital&&getMouseDown())||performance.now()<this.fireUntil,missile:keys.has('KeyR')||performance.now()<this.missileUntil,lock:p.align,boost:keys.has('ShiftLeft')||keys.has('ShiftRight')||p.boost};
      if(target?.hp>0)input.target=target.shipId;return input;
    }
    async sendInput(){if(this.busy||this.replay||this.controlled===null||document.hidden)return;
      const shipId=this.controlled,input=this.pilotIntent(),sent=performance.now();this.busy=true;
      try{await this.request('/api/battles/'+this.id+'/control',{type:'input',shipId,seq:++this.seq,input});this.inputLatency=Math.min(.15,(performance.now()-sent)/2000);}
      catch(e){if(this.controlled===shipId){this.controlled=null;state.flight.ai=true;notice(e.message);}}finally{this.busy=false;}
    }
    syncHUD(){const p=state.flight,m=this.metadata[this.selected];if(!m)return;$('#fire-spinal').hidden=!!m.profile.defenseOnly;if(m.profile.defenseOnly)$('#special-readout').textContent='超巨型旗舰 · 200 舰长 · 自动自卫炮 / 近防 · 辅助导弹';if(m.profile.special==='antimatter')$('#special-readout').textContent='无人自动突击 · 接近引爆 · 一次性消耗 · 穿盾冲击 / 收割者免疫';else if(m.profile.special==='reaper')$('#special-readout').textContent='双束相位武器 · 有限护盾回收 · 免疫湮灭之星';const missiles=m.profile.missile||m.profile.secondaryMissile;$('#weapon-primary-name').textContent=m.profile.primaryName||p.profile.primaryName;$('#fire-spinal > span:nth-child(2)').innerHTML=(m.profile.primaryName||p.profile.primaryName)+'<small>'+(m.profile.fixed?'沿舰艏射界':'自动火控 / 手动指定目标')+'</small>';$('#system-turret').hidden=!m.profile.pointDefense&&!m.profile.secondary;$('.turret-readiness').hidden=!m.profile.pointDefense&&!m.profile.secondary;$('#fire-salvo').hidden=!missiles;$('#system-missile').hidden=!missiles;$('#missile-stock').textContent=p.missileCooldown>0?p.missileCooldown.toFixed(1)+'s':'就绪';$('#missile-capacity').parentElement.hidden=true;$('#system-missile-state').textContent=p.missileCooldown>0?'装填中':'已就绪';$('.contacts h2 small').textContent=String(p.targets.length).padStart(2,'0');if(this.replay){$('.flight-header>div').innerHTML='银河帝国<span>/</span>历史回放';$('#toggle-ai').disabled=true;}}
    syncHeader(){if(!this.snapshot&&!this.report)return;const counts=[0,0];for(let i=0;i<this.rows.length;i++)if(this.rows[i]?.[6]>0)counts[this.metadata[i]?.side==='attacker'?0:1]++;$('#native-status').textContent=(this.replay?'历史战斗':this.snapshot?.trial?'编队测试':'真实战场')+' · '+counts.join(' : ')+' 艘 · '+Math.floor(this.replay?this.playTime:(this.snapshot?.elapsed||0))+' / 600 秒';$('#native-claim').textContent=this.controlled===this.selected?'驾驶中':'亲自驾驶';$('#native-claim').disabled=this.controlled===this.selected||!!this.replay||this.rows[this.selected]?.[6]<=0||this.metadata[this.selected]?.owner!==this.owner||!this.metadata[this.selected]?.profile.piloted;$('#native-release').disabled=this.controlled===null;$('#ai-label').textContent=this.controlled===null?'亲自驾驶':'交还 AI';$('#ai-indicator').classList.toggle('visible',this.controlled===null);$('#flight-input-copy').textContent=this.controlled===null?'观战中 · 选择己方编队后亲自驾驶':'右键转向 · W/S 油门 · Space 主炮 · R 导弹 · V 舰桥/追踪 · G 交还 AI';$('#loadout-caption').textContent='真实参战舰船 · 退出驾驶交还 AI · 战斗不能撤退';}
    row(id){const n=this.rows[id],o=this.previous[id]||n;if(!n)return null;const f=this.replay?this.replayAlpha:clamp((performance.now()-this.received)/200,0,1);return [id,mix(o[1],n[1],f),mix(o[2],n[2],f),mix(o[3],n[3],f),o[4]+shortAngle(n[4]-o[4])*f,mix(o[5],n[5],f),n[6],n[7],n[8],n[9],n[10]||0,n[11]||0];}
    applyOwn(reset=false){const r=this.controlled===this.selected?this.rows[this.selected]:this.row(this.selected),m=this.metadata[this.selected],p=state.flight;if(!r||!m)return;
      p.pos=r.slice(1,4);p.yaw=Math.PI-r[4];p.pitch=r[5];p.speed=r[9]*8;p.velocity=[Math.sin(r[4])*Math.cos(r[5])*r[9],Math.sin(r[5])*r[9],Math.cos(r[4])*Math.cos(r[5])*r[9]];p.hull=r[6]/m.maxHp*100;p.shield=m.maxShield?r[7]/m.maxShield*100:0;p.gunCooldown=r[10];p.missileCooldown=r[11];p.profile={...COMBAT[state.shipIndex],maxSpeed:m.profile.speed*8,turnRate:m.profile.turn,mainCooldown:m.profile.cooldown};p.ai=this.controlled===null;p.missileStock=m.profile.missile||m.profile.secondaryMissile?p.profile.missileCapacity:0;p.missileCooldown=m.profile.missile?r[10]:r[11];
      if(reset||p.ai){p.yawTarget=p.yaw;p.pitchTarget=p.pitch;}
      else{
        const now=performance.now(),age=Math.min(.4,(now-this.received)/1000+(this.inputLatency||0)+.025),input=this.pilotIntent(),authority=predictPilot(r,m.profile,input,age),old=this.predicted;
        if(!old||V.length(V.sub(old.pos,[authority.x,authority.y,authority.z]))>100)this.predicted={pos:[authority.x,authority.y,authority.z],yaw:Math.PI-authority.yaw,pitch:authority.pitch,speed:authority.speed,at:now};
        else{
          const dt=clamp((now-old.at)/1000,0,.05),row=[0,...old.pos,Math.PI-old.yaw,old.pitch,0,0,-1,old.speed??r[9]],next=predictPilot(row,m.profile,input,dt);
          // Compare poses at the same extrapolated time, rather than pulling back to a stale 5 Hz snapshot.
          const angleBlend=1-Math.exp(-dt*3),positionBlend=1-Math.exp(-dt*7);
          old.yaw=Math.PI-next.yaw+shortAngle(next.yaw-authority.yaw)*angleBlend;old.pitch=mix(next.pitch,authority.pitch,angleBlend);
          old.pos=[next.x,next.y,next.z].map((v,i)=>mix(v,[authority.x,authority.y,authority.z][i],positionBlend));old.speed=next.speed;old.at=now;
        }
        const predicted=this.predicted;p.pos=[...predicted.pos];p.yaw=predicted.yaw;p.pitch=predicted.pitch;p.speed=predicted.speed*8;p.velocity=[Math.sin(p.yaw)*Math.cos(p.pitch)*predicted.speed,Math.sin(p.pitch)*predicted.speed,-Math.cos(p.yaw)*Math.cos(p.pitch)*predicted.speed];
      }
      if(r[6]<=0){this.controlled=null;this.overview=true;p.ai=true;}
    }
    refreshContacts(){const p=state.flight,own=this.metadata[this.selected];if(!own)return;const locked=p.targets[p.targetIndex]?.shipId;
      const candidates=this.metadata.filter(m=>m.side!==own.side&&this.rows[m.id]?.[6]>0&&this.indices.has(m.type)).sort((a,b)=>V.length(V.sub(this.rows[a.id].slice(1,4),p.pos))-V.length(V.sub(this.rows[b.id].slice(1,4),p.pos))).slice(0,5);
      if(locked!==undefined&&this.rows[locked]?.[6]>0&&!candidates.some(m=>m.id===locked))candidates.unshift(this.metadata[locked]);
      p.targets=candidates.map(m=>{let t=this.contacts.get(m.id);if(!t){t={shipId:m.id,name:SHIPS[this.indices.get(m.type)].name+' #'+(m.id+1),code:'真实参战舰',kind:this.indices.get(m.type),scale:1,shieldHits:[],maxShield:100,seed:m.id,respawn:Infinity};this.contacts.set(m.id,t);}return t;});p.targetIndex=Math.max(0,p.targets.findIndex(t=>t.shipId===locked));this.updateContacts();renderContacts();
    }
    updateContacts(){for(const t of state.flight.targets){const row=this.row(t.shipId),m=this.metadata[t.shipId];if(!row)continue;t.pos=row.slice(1,4);t.hp=row[6]/m.maxHp*100;t.shield=m.maxShield?row[7]/m.maxShield*100:0;t.heading=Math.PI-row[4];t.velocity=[Math.sin(row[4])*Math.cos(row[5])*row[9],Math.sin(row[5])*row[9],Math.cos(row[4])*Math.cos(row[5])*row[9]];}}
    weaponStyle(index,kind,secondary=false){
      const profile=COMBAT[index]||{},visual=profile.visual||{},small=(LAYOUTS[index]?.length||20)<=5;
      if(kind==='missile'){const auxiliary=small||LAYOUTS[index]?.id==='Cruiser';return {color:[1,.64,.22],visual:{capital:!small,compact:auxiliary,radius:auxiliary?.16:.4,trail:auxiliary?18:55,glow:auxiliary?6:20,blastRadius:auxiliary?2:9,impact:auxiliary?5:32}};}
      if(small)return {color:profile.weaponColor||[1,.75,.35],visual:{...visual,compact:true,radius:Math.min(.035,visual.radius||.025),beamLife:.075,blastRadius:.35,impact:2}};
      if(secondary)return {color:kind==='laser'?[1,.5,.14]:kind==='plasma'?[.48,.65,1]:[1,.78,.38],visual:{capital:true,radius:.18,trail:9,glow:8,blastRadius:2.5,impact:12}};
      return {color:profile.weaponColor||[.5,.8,1],visual};
    }
    fleetBurst(point,count,color,life,speed){const left=Math.max(0,800-state.flight.particles.length);if(left&&count)burst(point,Math.min(count,left),color,life,speed);}
    muzzle(id,mount=0,secondary=false){const row=this.row(id),index=this.indices.get(this.metadata[id]?.type),layout=LAYOUTS[index];if(!row||!layout)return null;return M.transform(shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:0},index),(secondary?layout.joints.filter(j=>j.role==='secondary').map(j=>j.mount):layout.main)[mount]||[0,0,0]);}
    beamEnd(from,id,fallback){const row=this.row(id);if(!row)return fallback;const center=row.slice(1,4),radius=this.metadata[id].profile.radius||1,k=projectileContact(from,center,center,radius)??1;return from.map((v,i)=>mix(v,center[i],k));}
    effect(e){
      // The consumed warhead has one dedicated effect; victim ships still explode normally.
      if(e.type==='destroy'&&e.kind==='antimatter'&&e.shipId===e.source)return;
      this.presentation.event(e,this);const p=state.flight;
      if(e.projectileId!==undefined&&e.type!=='fire'){this.projectiles=(this.projectiles||[]).filter(q=>q.id!==e.projectileId);p.projectiles=(p.projectiles||[]).filter(q=>q.id!==e.projectileId);this.projectileVisuals.delete(e.projectileId);}
      if(e.type==='fire'){
        const index=this.indices?.get(this.metadata[e.shipId]?.type),profile=COMBAT[index]||p.profile,{visual,color}=this.weaponStyle(index,e.kind,e.secondary);
        const mounts=/laser|ion|beam|reaper/.test(e.kind)?Math.max(1,e.secondary?LAYOUTS[index]?.joints.filter(j=>j.role==='secondary').length||0:LAYOUTS[index]?.main.length||0):1;
        for(let mount=0;mount<mounts;mount++){
          const from=/laser|ion|beam|reaper/.test(e.kind)?this.muzzle(e.shipId,mount,e.secondary)||e.from:e.from;
          if(/laser|ion|beam|reaper/.test(e.kind))p.beams.push({source:e.shipId,target:e.target,mount,secondary:e.secondary,start:from,end:this.beamEnd(from,e.target,e.to),age:0,life:visual.beamLife||.35,width:visual.radius||profile.beamWidth||.12,color,compact:visual.compact});
          else if(this.replay){const delta=V.sub(e.to,from),speed=e.speed||(e.kind==='missile'?210:540);p.projectiles.push({id:e.projectileId,target:e.target,pos:[...from],previous:[...from],velocity:e.velocity||V.scale(V.norm(delta),speed),speed,age:0,life:V.length(delta)/speed+.2,missile:e.kind==='missile',trail:[[...from]],color,visual,kind:e.kind});}
          const near=V.length(V.sub(from,renderer.eye||p.pos))<350||e.shipId===this.controlled;
          if(!visual.compact||near)renderer.weaponImpact(p,from,{visual,color,muzzle:true});
          if(!visual.compact&&V.length(V.sub(from,renderer.eye||p.pos))<1800)this.fleetBurst(from,visual.capital?18:5,color,.25,visual.elite?24:10);
        }
        if(e.shipId===this.selected){tone('fire');p.mainShots++;p.shake=Math.min(.35,LAYOUTS[state.shipIndex].length*.005);}
      }else if(e.type==='antimatter'){
        if(e.harmless){notice('湮灭之星失去目标 · 安全解除弹头');return;}
        if(!(p.specialBlasts||[]).some(b=>b.source===e.source&&b.tick===e.tick))(p.specialBlasts??=[]).push({...e,pos:[e.x,e.y,e.z],age:0});
        if(!e.harmless){notice('湮灭之星起爆 · 反物质冲击扩散');tone('hit');}
      }else if(e.type==='antimatter-launch'){notice('湮灭之星 · 自行突击');
      }else if(e.type==='blast'){
        renderer.weaponImpact(p,[e.x,e.y,e.z],{visual:{blastRadius:e.radius,elite:true},color:e.kind==='heavy'?[.3,.65,1]:[1,.42,.08]});
      }else if(e.type==='destroy'||e.type==='hit'||e.type==='intercept'){
        const point=[e.x,e.y,e.z],m=this.metadata[e.shipId],source=this.metadata[e.source],profile=COMBAT[this.indices.get(source?.type||m?.type)]||{},dead=e.type==='destroy';
        const small=(m?.profile.length||20)<=5,near=V.length(V.sub(point,renderer.eye||p.pos))<350||e.shipId===this.controlled;
        const visual=dead?{blastRadius:small?Math.max(.6,(m?.profile.length||1)*.3):(m?.profile.length||5)*.6,elite:(m?.profile.length||0)>=50,compact:small}:this.weaponStyle(this.indices.get(source?.type),e.kind).visual;
        if(e.type==='intercept'&&e.from)p.beams.push({start:e.from,end:point,age:0,life:.14,width:.08,color:[1,.8,.36]});
        if(!visual.compact||near||dead)renderer.weaponImpact(p,point,{visual,shield:e.shield&&!dead,destroy:dead,color:[1,.38,.06]});
        if(V.length(V.sub(point,renderer.eye||p.pos))<2200)this.fleetBurst(point,visual.compact?(dead?(near?12:4):near?2:0):dead?100:e.shield?14:35,e.shield&&!dead?[.35,.7,1]:[1,.55,.12],visual.compact?.35:dead?2.7:.8,visual.compact?6:dead?55:visual.impact||16);
        if(e.type==='hit'&&e.shield&&(!small||near)){const row=this.rows[e.shipId],index=this.indices.get(m?.type);if(row&&index!==undefined){const vessel=this.visualVessel(e.shipId),model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:0},index),charge=Math.max(.1,(this.previous[e.shipId]?.[7]||row[7])/Math.max(1,m.maxShield)*100);renderer.shieldImpact(vessel,index,model,point,2,charge);}}
        if(e.shipId===this.selected&&e.type==='hit'){p.shake=.14;$('#damage-wash').classList.add('show');setTimeout(()=>$('#damage-wash').classList.remove('show'),150);}
      }else if(e.type==='reinforcement'&&e.tick>0)notice('增援抵达 · '+e.count+' 艘');
    }
    projectilePosition(q,seconds){
      const from=[q.x,q.y,q.z],aim=[q.dx,q.dy,q.dz],delta=V.sub(aim,from),length=V.length(delta),to=V.add(from,q.vx===undefined?V.scale(V.norm(delta),Math.min(length,q.speed*Math.max(0,seconds))):V.scale([q.vx,q.vy,q.vz],Math.max(0,seconds)));
      // Cosmetic prediction stops at the first enemy envelope. Only server events apply damage.
      if(this.collisionRows!==this.rows){this.collisionRows=this.rows;this.collisionCells=new Map();this.collisionRadius=1;
        for(const m of this.metadata){const row=this.rows[m.id];if(!row||row[6]<=0)continue;this.collisionRadius=Math.max(this.collisionRadius,(m.profile.radius||1)+.4);const key=m.side+':'+Math.floor(row[1]/300)+':'+Math.floor(row[3]/300);if(!this.collisionCells.has(key))this.collisionCells.set(key,[]);this.collisionCells.get(key).push(m);}
      }
      let first=1;const pad=this.collisionRadius+25,enemy=q.side==='attacker'?'defender':'attacker';
      for(let x=Math.floor((Math.min(from[0],to[0])-pad)/300);x<=Math.floor((Math.max(from[0],to[0])+pad)/300);x++)for(let z=Math.floor((Math.min(from[2],to[2])-pad)/300);z<=Math.floor((Math.max(from[2],to[2])+pad)/300);z++)for(const m of this.collisionCells.get(enemy+':'+x+':'+z)||[]){
        const center=this.row(m.id).slice(1,4),radius=(m.profile.radius||1)+.4;
        if(center.some((v,i)=>v<Math.min(from[i],to[i])-radius||v>Math.max(from[i],to[i])+radius))continue;
        const hit=projectileContact(from,to,center,radius);if(hit!==null)first=Math.min(first,hit);
      }
      return from.map((v,i)=>mix(v,to[i],first));
    }
    update(dt){
      this.presentation.update(dt);const now=performance.now();if(this.frameTime)this.elapsedFrames.push(now-this.frameTime);this.frameTime=now;if(this.elapsedFrames.length>600)this.elapsedFrames.shift();if(this.elapsedFrames.length%60===0){const mean=this.elapsedFrames.slice(-60).reduce((a,b)=>a+b,0)/60;this.quality=clamp(this.quality+(mean>29?-.12:mean<20?.03:0),.4,1);}if(!this.rows.length)return;
      const p=state.flight;if(this.replay){if(!this.paused)this.playTime=Math.min(this.report.duration,this.playTime+dt*this.playSpeed);const tick=this.playTime*20,frames=this.replay.frames;let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].tick<=tick)lo=mid;else hi=mid-1;}const a=frames[lo],b=frames[Math.min(lo+1,frames.length-1)];this.previous=a.ships;this.rows=a.ships.map((row,id)=>{const next=b.ships[id]||row;const result=[...next.slice(0,6),...row.slice(6)];if((this.deathTicks.get(id)??Infinity)<=tick)result[6]=0;return result;});this.replayAlpha=a.tick===b.tick?1:clamp((tick-a.tick)/(b.tick-a.tick),0,1);$('#native-seek').value=this.playTime;while(this.replayCursor<this.replay.events.length&&this.replay.events[this.replayCursor].tick<=tick){const e=this.replay.events[this.replayCursor++];if(e.tick>=tick-(e.type==='antimatter'?106:3))this.effect(e);}}
      const blastTime=this.replay?this.playTime:(this.snapshot?.elapsed||0)+Math.min(.2,(now-this.received)/1000);p.specialBlasts=(p.specialBlasts||[]).filter(e=>{e.age=Math.max(0,blastTime-e.tick*.05);return e.age<5.3;});
      if(this.controlled!==null){if(keys.has('KeyW'))p.throttle+=dt*27;if(keys.has('KeyS'))p.throttle-=dt*27;p.throttle=clamp(p.throttle,0,100);const turn=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),pitch=(keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0);if(turn||pitch)p.align=false;p.yawTarget+=turn*p.profile.turnRate*dt;p.pitchTarget=clamp(p.pitchTarget+pitch*p.profile.turnRate*dt,-1.2,1.2);p.roll+=((keys.has('KeyQ')?1:0)-(keys.has('KeyE')?1:0))*dt*.4;}
      if(this.overview&&this.cinematicAnchor!=null){const anchor=this.row(this.cinematicAnchor);if(anchor?.[6]>0){const focus=this.cinemaFocus(this.cinematicAnchor,anchor);this.center=this.center.map((v,i)=>mix(v,focus.center[i],1-Math.exp(-dt)));this.overviewYaw+=shortAngle(focus.yaw-this.overviewYaw)*(1-Math.exp(-dt*.35));}else this.frameBattle();}
      this.applyOwn();p.elapsed+=dt;p.boostActive=keys.has('ShiftLeft')||keys.has('ShiftRight')||p.boost;updateCamera(dt);p.shake*=Math.exp(-dt*5);
      if(!this.contactsAt||now-this.contactsAt>700){this.contactsAt=now;this.refreshContacts();this.refreshGroups();this.syncHeader();}else this.updateContacts();
      const target=selectedTarget();if(target){const dir=V.norm(V.sub(target.pos,p.pos));p.boresightError=Math.acos(clamp(V.dot(dir,forward()),-1,1))*180/Math.PI;p.missileLock=target;p.missileLockTime=.4;}
      // Articulation aims at actual contacts. Firing and damage stay server-authoritative.
      for(const joint of p.joints){joint.cooldown=Math.max(0,joint.cooldown-dt);if(target){const delta=V.sub(target.pos,p.pos);joint.yaw=clamp(Math.atan2(delta[0],-delta[2])-p.yaw,-Math.PI,Math.PI);joint.aligned=true;}}
      p.beams=p.beams.filter(b=>{b.age+=dt;if(b.source!==undefined){b.start=this.muzzle(b.source,b.mount,b.secondary)||b.start;b.end=this.beamEnd(b.start,b.target,b.end);}return b.age<b.life;});p.particles=p.particles.filter(q=>{q.age+=dt;q.pos=V.add(q.pos,V.scale(q.velocity,dt));return q.age<q.life;});
      if(!this.replay){
        const liveIds=new Set();p.projectiles=(this.projectiles||[]).map(q=>{
          liveIds.add(q.id);const profile=COMBAT[this.indices.get(this.metadata[q.source]?.type)]||p.profile,dir=V.norm([q.dx-q.x,q.dy-q.y,q.dz-q.z]),age=Math.min(.2,(now-this.received)/1000),pos=this.projectilePosition(q,age);
          let visual=this.projectileVisuals.get(q.id);if(!visual){visual={trail:[],born:now,trailAt:0};this.projectileVisuals.set(q.id,visual);}
          if(now-visual.trailAt>=30){visual.trail.push(pos);if(visual.trail.length>50)visual.trail.shift();visual.trailAt=now;}
          return {id:q.id,pos,previous:visual.trail.at(-2)||pos,velocity:q.vx===undefined?V.scale(dir,q.speed):[q.vx,q.vy,q.vz],age:(q.age||0)+age,life:10,missile:q.missile,trail:visual.trail,...this.weaponStyle(this.indices.get(this.metadata[q.source]?.type),q.kind,q.secondary),kind:q.kind,hostile:q.side!==this.metadata[this.selected].side};
        }).sort((a,b)=>V.length(V.sub(a.pos,this.overview?this.center:p.pos))-V.length(V.sub(b.pos,this.overview?this.center:p.pos))).slice(0,600);
        for(const id of this.projectileVisuals.keys())if(!liveIds.has(id))this.projectileVisuals.delete(id);
      }else p.projectiles=p.projectiles.filter(q=>{if(this.paused)return true;const step=dt*this.playSpeed;q.age+=step;const target=this.row(q.target);if(q.missile&&target&&q.age>.2){const speed=Math.min(q.speed||210,38+(q.age-.2)*180),goal=V.scale(V.norm(V.sub(target.slice(1,4),q.pos)),speed);q.velocity=q.velocity.map((v,i)=>mix(v,goal[i],1-Math.exp(-step*4)));}q.previous=q.pos;q.pos=V.add(q.pos,V.scale(q.velocity,step));if(q.missile){q.trail.push([...q.pos]);if(q.trail.length>50)q.trail.shift();}return q.age<q.life;});
      document.body.classList.toggle('battle-overview',this.overview);
    }
    buildGroups(){if(!renderer||!window.BattleFleetAssets)return;const gl=renderer.gl;for(const g of this.meshGroups.values()){gl.deleteBuffer(g.vertices);gl.deleteBuffer(g.instances);}this.meshGroups.clear();
      this.displayGroups=BattleDisplay.groupBattleShips(this.metadata);const assets=window.BattleFleetAssets,types=new Map();for(const m of this.metadata){const key=m.side+':'+m.type;if(!types.has(key))types.set(key,[]);types.get(key).push(m.id);}
      for(const[key,ids]of types){const asset=assets.ships.find(s=>s.id===this.metadata[ids[0]].type);if(!asset)continue;const vertices=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vertices);gl.bufferData(gl.ARRAY_BUFFER,assets.vertices.subarray(asset.low.offset,asset.low.offset+asset.low.floatCount),gl.STATIC_DRAW);this.meshGroups.set(key,{vertices,instances:gl.createBuffer(),matrices:new Float32Array(ids.length*16),ids,count:asset.low.floatCount/13});}
    }
    instancing(r){if(this.program)return;const gl=r.gl;this.extension=gl.getExtension('ANGLE_instanced_arrays');if(!this.extension)throw Error('真实战场需要支持实例化渲染的显卡');
      const shader=(kind,source)=>{const s=gl.createShader(kind);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
      const vs='attribute vec3 p,n,c;attribute vec4 m0,m1,m2,m3;uniform mat4 vp;varying vec3 color;void main(){mat4 model=mat4(m0,m1,m2,m3);vec3 normal=normalize(mat3(model)*n);float light=.68+.72*max(0.,dot(normal,normalize(vec3(-.5,.9,.7))))+.2*max(0.,dot(normal,normalize(vec3(.8,-.1,-.7))));color=pow(c,vec3(.85))*light;gl_Position=vp*model*vec4(p,1.);}';
      const fs='precision mediump float;varying vec3 color;uniform vec3 tint;void main(){gl_FragColor=vec4(color*tint,1.);}';this.program=gl.createProgram();gl.attachShader(this.program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(this.program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(this.program));this.attr=Object.fromEntries(['p','n','c','m0','m1','m2','m3'].map(k=>[k,gl.getAttribLocation(this.program,k)]));this.uniform={vp:gl.getUniformLocation(this.program,'vp'),tint:gl.getUniformLocation(this.program,'tint')};
    }
    visualVessel(id){if(id===this.selected)return state.flight;let v=this.vesselVisuals.get(id);if(!v){const index=this.indices.get(this.metadata[id].type);v={shieldHits:[],joints:LAYOUTS[index].joints.map(j=>({...j}))};this.vesselVisuals.set(id,v);}return v;}
    drawNativeShip(r,id){
      const row=this.row(id),m=this.metadata[id],index=this.indices.get(m.type),model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:0},index),v=this.visualVessel(id),target=this.row(row[8]);
      if(target){const delta=V.sub(target.slice(1,4),row.slice(1,4));for(const joint of v.joints||[]){joint.yaw=shortAngle(Math.atan2(delta[0],-delta[2])-(Math.PI-row[4]));joint.pitch=Math.atan2(delta[1],Math.hypot(delta[0],delta[2]));}}
      r.drawVessel(index,model,{light:[-.5,.9,.75],exposure:1},v.joints);r.drawShield(v,index,model);
      if(row[9]>0)r.drawExhaust(index,model,clamp(row[9]/Math.max(1,m.profile.speed)*100,0,100),false,r.time);
    }
    drawFleet(r){if(!this.rows.length)return;this.instancing(r);const gl=r.gl,ext=this.extension,p=state.flight;for(let i=0;i<gl.getParameter(gl.MAX_VERTEX_ATTRIBS);i++)gl.disableVertexAttribArray(i);
      const focal=r.height/(2*Math.tan(r.fov/2));
      const candidates=this.metadata.filter(m=>this.rows[m.id]?.[6]>0&&this.indices.has(m.type)).map(m=>{const d=Math.max(1,V.length(V.sub(this.rows[m.id].slice(1,4),r.eye)));return {id:m.id,d,pixels:m.profile.length*focal/d};}).sort((a,b)=>b.pixels-a.pixels);
      if(this.fullDetail&&candidates.every(c=>c.pixels>=8)){
        const ids=candidates.map(c=>c.id);this.renderedIds=new Set(ids);this.engineIds=[];this.detailIds=new Set(ids);this.highIds=new Set(ids);this.drawLabels(r,[]);
        this.renderStats={mode:'native',alive:ids.length,instances:ids.length,groups:0,detail:ids.length,high:ids.length,quality:1};
        for(const id of ids)if(this.overview||id!==this.selected)this.drawNativeShip(r,id);return;
      }
      const near=candidates.filter(v=>v.pixels>(this.fullDetail?8:65)&&v.id!==this.selected).slice(0,this.fullDetail?128:Math.floor(12*this.quality)).map(v=>v.id);this.detailIds=new Set(near);
      this.highIds=new Set();let triangles=0;for(const c of candidates){const mesh=r.shipMeshes[this.indices.get(this.metadata[c.id].type)];if(c.pixels<8||triangles+mesh.count/3>1800000*this.quality)continue;this.highIds.add(c.id);triangles+=mesh.count/3;}
      const display=BattleDisplay.visibleBattleShips(this.displayGroups,this.rows,{eye:r.eye,height:r.height,fov:r.fov,quality:this.quality,pinned:[this.selected,...near,...this.highIds,...state.flight.targets.slice(0,1).map(t=>t.shipId)],previous:this.lodLevels});this.lodLevels=display.levels;this.renderedIds=display.visible;this.engineIds=candidates.filter(c=>c.pixels>3&&display.visible.has(c.id)&&r.project(this.rows[c.id].slice(1,4)).visible).slice(0,Math.floor(120*this.quality)).map(c=>c.id);this.renderStats={alive:display.alive,instances:display.visible.size,groups:display.labels.length,detail:near.length,high:this.highIds.size,low:candidates.filter(c=>!this.highIds.has(c.id)&&!this.detailIds.has(c.id)).length,quality:this.quality};this.drawLabels(r,display.labels);
      gl.useProgram(this.program);gl.uniformMatrix4fv(this.uniform.vp,false,new Float32Array(M.mul(r.vp,M.translate(...r.eye))));
      for(const[key,g]of this.meshGroups)for(const high of [false,true]){let count=0;for(const id of g.ids){const row=this.row(id);if(!row||row[6]<=0||!display.visible.has(id)||this.detailIds.has(id)||this.highIds.has(id)!==high||(!this.overview&&id===this.selected))continue;const index=this.indices.get(this.metadata[id].type);if(index===undefined)continue;const matrix=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:0},index);if(!high){const pixels=this.metadata[id].profile.length*focal/Math.max(1,V.length(V.sub(row.slice(1,4),r.eye))),scale=Math.max(1,6/Math.max(.001,pixels));for(let j=0;j<12;j++)matrix[j]*=scale;}for(let j=0;j<3;j++)matrix[12+j]-=r.eye[j];g.matrices.set(matrix,count++*16);}
        if(!count)continue;const native=r.shipMeshes[this.indices.get(this.metadata[g.ids[0]].type)];gl.uniform3fv(this.uniform.tint,this.metadata[g.ids[0]].owner===this.owner?[.87,.97,1]:[1,.88,.76]);gl.bindBuffer(gl.ARRAY_BUFFER,high?native.buffer:g.vertices);for(const[name,offset]of [['p',0],['n',12],['c',24]]){const a=this.attr[name];gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,52,offset);}
        gl.bindBuffer(gl.ARRAY_BUFFER,g.instances);gl.bufferData(gl.ARRAY_BUFFER,g.matrices.subarray(0,count*16),gl.DYNAMIC_DRAW);for(let i=0;i<4;i++){const a=this.attr['m'+i];gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,4,gl.FLOAT,false,64,i*16);ext.vertexAttribDivisorANGLE(a,1);}ext.drawArraysInstancedANGLE(gl.TRIANGLES,0,high?native.count:g.count,count);for(let i=0;i<4;i++){const a=this.attr['m'+i];ext.vertexAttribDivisorANGLE(a,0);gl.disableVertexAttribArray(a);}
      }
      for(const id of near){const row=this.row(id),index=this.indices.get(this.metadata[id].type);const model=shipMatrix({pos:row.slice(1,4),yaw:Math.PI-row[4],pitch:row[5],roll:0},index);r.drawVessel(index,model,{light:[-.5,.9,.7],exposure:1.25});r.drawShield(this.visualVessel(id),index,model);}
    }
    drawLabels(r,groups){if(performance.now()-(this.labelsAt||0)<150)return;this.labelsAt=performance.now();const occupied=[];this.labels.innerHTML=groups.sort((a,b)=>a.distance-b.distance).flatMap(g=>{const q=r.project(g.center),key=Math.floor(q.x/160)+':'+Math.floor(q.y/42);if(!q.visible||q.x<30||q.x>r.width-160||q.y<110||q.y>r.height-60||occupied.some(p=>Math.abs(p.x-q.x)<155&&Math.abs(p.y-q.y)<32))return [];occupied.push(q);return ['<button data-group="'+g.key+'" style="left:'+q.x+'px;top:'+q.y+'px;color:'+(g.owner===this.owner?'#8edce9':'#ffa88b')+'">'+(g.owner===this.owner?'◆ ':'◇ ')+(SHIPS[this.indices.get(g.type)]?.name||g.type)+' × '+g.count+'</button>'];}).slice(0,40).join('');}
    drawOverview(r,s,time){r.begin(time);const d=this.distance,yaw=this.overviewYaw,pitch=this.overviewPitch;r.eye=[Math.sin(yaw)*Math.cos(pitch)*d,Math.sin(pitch)*d,Math.cos(yaw)*Math.cos(pitch)*d].map((v,i)=>v+this.center[i]);r.fov=55*Math.PI/180;const projection=M.perspective(r.fov,r.width/r.height,1,Math.max(22000,this.distance+(this.snapshot?.boundary||4000)*3));if(this.cinemaComposition){projection[8]=.12;projection[9]=-.22;}r.vp=M.mul(projection,M.lookAt(r.eye,this.center));r.cameraForward=V.norm(V.sub(this.center,r.eye));r.cameraUp=[0,1,0];r.projectionShiftX=projection[8];r.projectionOffset=projection[9];this.presentation.environment(r,time);this.drawFleet(r);r.drawCombatEffects(state.flight,time,shipMatrix(state.flight,state.shipIndex));if(!this.fullDetail)this.presentation.draw(r,this,false);}

    leave(){void this.setAI(true);this.stream?.close();clearInterval(this.inputTimer);if(parent!==window)parent.postMessage({type:'battle-exit'},location.origin);else location.assign('/');}
  }

return new NativeFleetBattle();
};