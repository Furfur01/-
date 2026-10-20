// Authoritative combat is drawn in the navigation context, beside the real target.
// World placement is cosmetic; ship positions, damage, shots and outcomes stay server-owned.
const auroraMapBattles=new Map();let auroraBattleEpoch=0;
const auroraFinishedBattles=new Map();
const AURORA_BATTLE_ORBIT_SCALE=1.3;
function auroraBattleScale(p,b=null){return p.radius*AURORA_BATTLE_ORBIT_SCALE/(b?.environment?.radius||12000);}
function auroraBattleAnchor(p,b=null){return sub(p.position,mul(b?.environment?.center||[700,-12400,0],auroraBattleScale(p,b)));}
function auroraDock(p){
 const target=auroraNavigation.details.get(p.biome)?.runtime.buildingTarget('Shipyard'),normal=target?.normal||[.003019531,-.642857143,.765980141];
 const local=target?.station?mul(target.station,p.radius/16):mul(normal,p.radius*1.95);
 return {position:add(p.position,auroraNavigationRotate(local,auroraNavigationSpin(p))),normal:auroraNavigationRotate(normal,auroraNavigationSpin(p))};
}
function auroraBattleRow(b,id,sampleTime=auroraNavigation.sampleTime??performance.now()){if(b?.pilotRow?.[0]===id)return b.pilotRow;const row=b?.ships?.find(r=>r[0]===id);if(!row)return null;const old=b.previous?.find(r=>r[0]===id)||row,t=b.replay?1:clamp((sampleTime-b.received)/200,0,1),out=row.slice();for(let i=1;i<=3;i++)out[i]=mix(old[i],row[i],t);out[5]=mix(old[5],row[5],t);out[12]=(old[12]||0)+Math.atan2(Math.sin((row[12]||0)-(old[12]||0)),Math.cos((row[12]||0)-(old[12]||0)))*t;out[4]=old[4]+Math.atan2(Math.sin(row[4]-old[4]),Math.cos(row[4]-old[4]))*t;return out;}
function auroraBattleVessel(b,id){return b?.metadata?.find(m=>m.id===id);}
function auroraFleetExit(reason='escape'){
 const n=auroraNavigation;if(!n.missionFollow&&!n.combatCamera)return false;
 n.missionFollow=null;n.combatCamera=null;n.battleFocus=null;n.departureFocus=null;n.bridgeUp=null;n.pilotActive=false;n.warpTunnel=null;n.zoomTarget=null;n.surfaceFollow=null;
 Object.assign(n.goal,auroraNavigationCopyCamera(n.camera));n.goal.dist=Math.max(.6,Math.min(30,n.camera.dist*4));n.flight=true;
 auroraNavigationEmit('fleet-exit',{reason});return true;
}
function auroraMissionCanFollow(m){return !!m&&!(m.phase==='holding'&&['explore','mine'].includes(m.task))&&(!m.ships||Object.values(m.ships).some(n=>n>0));}
function auroraMapVessel(id,shipId,mode='follow'){
 const n=auroraNavigation,b=auroraMapBattles.get(id),row=auroraBattleRow(b,shipId);if(!row||row[6]<=0)return false;
 if(n.battleFocus!==id)auroraBattleFocus(id);
 n.combatCamera={...n.combatCamera,id,shipId,mode,entered:performance.now()};n.missionFollow=null;n.battleFocus=id;n.flight=true;return true;
}
function auroraUpdateCombatCamera(){
 const n=auroraNavigation,view=n.combatCamera;n.bridgeUp=null;n.bridgeNear=null;if(!view||view.mode==='free')return;
 const b=auroraMapBattles.get(view.id),p=b&&auroraNavigationBody(b.target);if(!b||!p){n.combatCamera=null;return;}
 let row=auroraBattleRow(b,view.shipId),meta=auroraBattleVessel(b,view.shipId);
 if(!row||row[6]<=0){meta=b.metadata.find(m=>m.owner===meta?.owner&&m.side===meta?.side&&b.ships.find(r=>r[0]===m.id)?.[6]>0);if(!meta){auroraFleetExit('destroyed');return;}view.shipId=meta.id;view.mode='follow';row=auroraBattleRow(b,meta.id);}
 const scale=auroraBattleScale(p,b),anchor=auroraBattleAnchor(p,b),pos=add(anchor,mul(row.slice(1,4),scale)),length=meta.profile.length,forward=[Math.sin(row[4])*Math.cos(row[5]),Math.sin(row[5]),Math.cos(row[4])*Math.cos(row[5])];
 const cabinKind=n.resources?.battles?.cabinClass?.(meta.type,meta.profile);
 if(view.mode==='bridge'&&cabinKind===null)view.mode='follow';
 if(view.mode==='bridge'){
  const pose=view.pose||{eye:[0,0,0],yaw:0,pitch:0},small=meta.profile.role==='fighter',roll=small?row[12]||0:0;
  const right=norm(cross(forward,[0,1,0])),up=norm(cross(right,forward)),bankRight=add(mul(right,Math.cos(roll)),mul(up,-Math.sin(roll))),bankUp=add(mul(up,Math.cos(roll)),mul(right,Math.sin(roll)));
  const dir=norm(add(mul(forward,Math.cos(pose.yaw)*Math.cos(pose.pitch)),add(mul(bankRight,Math.sin(pose.yaw)*Math.cos(pose.pitch)),mul(bankUp,Math.sin(pose.pitch)))));
  const base=small?[0,0,0]:meta.profile.length>=50?[0,3.75,2]:[0,3.8,-1],offset=pose.eye.map((v,i)=>v-base[i]);
  // Authored seat and hull share the same ship frame, including fighter banking.
  const seat=n.resources?.battles?.bridgeSeat?.(meta.type)||[0,length*.25,length*.2];
  const eye=add(pos,add(mul(bankUp,(seat[1]+offset[1])*scale),add(mul(bankRight,(seat[0]+offset[0])*scale),mul(forward,-(seat[2]+offset[2])*scale)))),distance=scale*2;
  n.bridgeNear=scale*.035;
  n.goal.center=add(eye,mul(dir,distance));n.goal.dist=distance;n.goal.yaw=Math.atan2(-dir[0],-dir[2]);n.goal.pitch=-Math.asin(dir[1]);n.bridgeUp=bankUp;

 }else if(meta.profile.ground){
  const module=b.environment?.fortress?.modules[meta.fortressSlot?.module];
  n.goal.center=module?add(anchor,mul([module.x,module.y+25,module.z],scale)):pos;
  n.goal.dist=500*scale*Math.max(1,H/W);n.goal.yaw=-.65;n.goal.pitch=.9;
 }else{
  const dir=forward;
  n.goal.center=add(pos,mul(dir,length*scale*1.6));n.goal.dist=Math.max(35,length*7)*scale*Math.max(1,H/W);n.goal.yaw=Math.atan2(-dir[0],-dir[2])+.65;n.goal.pitch=.72;
 }
}
function auroraBattleSet(id,data){
 if(!data){const b=auroraMapBattles.get(id);if(b?.ships){auroraFinishedBattles.set(id,{...b,finishedSeen:Date.now()});}auroraMapBattles.delete(id);return;}
 const old=auroraMapBattles.get(id),sameTick=old&&Number.isFinite(data.tick)&&data.tick===old.tick&&!!data.replay===!!old.replay;
 data={...data,environment:data.environment||old?.environment||{kind:'planet',radius:12000,center:[700,-12800,0],atmosphere:180}};
 auroraMapBattles.set(id,{...old,...data,previous:sameTick?old.previous:old?.ships||data.ships,metadata:data.metadata||old?.metadata||[],received:sameTick?old.received:performance.now(),epoch:old?.epoch||++auroraBattleEpoch,effects:[...(old?.effects||[]),...(data.events||[]).filter(e=>e.seq>(old?.eventSeq||0)).map(e=>({...e,received:performance.now()}))].slice(-700)});
 if(auroraNavigation.battleFocus===id&&!old?.ships){const follow=auroraNavigation.missionFollow;auroraBattleFocus(id);auroraNavigation.missionFollow=follow;}
}
function auroraBattleFocus(id){
 const n=auroraNavigation,b=auroraMapBattles.get(id)||n.battles?.find(b=>b.id===id),p=b&&(auroraNavigationBody(b.target)||n.planets.find(p=>p.coordinates.join(':')===b.position?.join(':')));if(!p)return false;
 const mission=n.missions?.find(m=>m.battleId===id&&!m.inbound),follow=n.missionFollow|| (mission?{id:mission.id,key:'engaged:holding'}:null);auroraNavigationToPlanet(p.key,{orbit:true});n.battleFocus=id;if(n.missions?.some(m=>m.id===follow?.id&&m.battleId===id))n.missionFollow=follow;
 const extent=Math.max(p.radius*.15,Math.max(b.ships?.length?0:1800,...(b.ships||[]).filter(r=>r[6]>0).map(r=>Math.hypot(r[1],r[2],r[3])))*auroraBattleScale(p,b));
 n.goal.center=auroraBattleAnchor(p,b);n.goal.dist=Math.max(p.radius*.2,extent*1.4)*Math.max(1,H/W);n.goal.pitch=.32;n.goal.yaw=.35;
 const own=(b.metadata||[]).filter(m=>m.owner===n.playerId&&b.ships?.find(r=>r[0]===m.id)?.[6]>0),ship=own.find(m=>m.type==='Battleship')||own.find(m=>m.profile.piloted)||own[0]||(b.metadata||[]).find(m=>b.ships?.find(r=>r[0]===m.id)?.[6]>0);
 if(ship){n.combatCamera={id,shipId:ship.id,mode:'follow'};auroraUpdateCombatCamera();}return true;
}
function auroraMissionAnchor(p){return add(p.position,[p.radius*1.8,p.radius*.8,0]);}
function auroraMissionDistance(m){return Math.min(560,Math.max(220,160+Math.sqrt(Object.values(m.ships||{}).reduce((a,b)=>a+b,0))*26));}
function auroraMissionFocus(id){
 const n=auroraNavigation,m=n.missions?.find(m=>m.id===id);if(!auroraMissionCanFollow(m))return false;
 if(m.phase==='engaged'&&m.battleId){n.missionFollow={id,key:null};auroraBattleFocus(m.battleId);auroraNavigationEmit('combat-track',{battleId:m.battleId});return true;}
 const at=m.phase==='return'?m.position:m.fromPosition,p=n.planets.find(p=>p.coordinates.join(':')===at?.join(':')&&!p.moon)||auroraNavigationBody(m.from);if(!p)return false;
 auroraNavigationToPlanet(p.key,{orbit:true});const dock=auroraDock(p);n.goal.center=dock.position;n.goal.dist=auroraBattleScale(p)*auroraMissionDistance(m)*Math.max(1,H/W);n.goal.pitch=Math.asin(dock.normal[1])+.15;n.goal.yaw=Math.atan2(dock.normal[0],dock.normal[2])+.5;n.departureFocus={id,planet:p.key,center:n.goal.center.slice()};n.missionFollow={id,key:null};return true;
}
function auroraFollowMission(visual,cruiseView){
 const n=auroraNavigation,follow=n.missionFollow;if(!follow||!visual)return;
 const m=n.missions?.find(m=>m.id===follow.id);if(!auroraMissionCanFollow(m)){auroraFleetExit(!m?'completed':m.phase==='holding'?m.task:'destroyed');return;}
 const pose=visual(m,Date.now()+gameNowOffset),key=m.phase+':'+pose.stage;
 if(follow.key===key)return;follow.key=key;follow.manual=false;
 const find=(coords,id)=>auroraNavigationBody(id)||n.planets.find(p=>p.coordinates.join(':')===coords?.join(':')&&!p.moon),home=find(m.fromPosition,m.from),target=find(m.position,m.target);
 if(m.phase==='engaged'&&m.battleId){auroraBattleFocus(m.battleId);n.missionFollow=follow;auroraNavigationEmit('combat-track',{battleId:m.battleId});return;}
 n.combatCamera=null;n.battleFocus=null;
 if(pose.stage==='cruise'){
  const a=home?.position,b=m.task==='explore'?auroraBlackHole.position:target?.position;if(!a||!b)return;
  const direction=norm(m.phase==='return'?sub(a,b):sub(b,a));
  n.combatCamera=null;n.battleFocus=null;n.departureFocus=null;n.zoomTarget=null;n.surfaceFollow=null;n.goal.center=vlerp(a,b,.5);n.goal.dist=2;n.goal.pitch=cruiseView.pitch-Math.asin(direction[1]);n.goal.yaw=Math.atan2(-direction[0],-direction[2]);n.flight=true;return;
 }
 const arriving=pose.stage==='warp-out'||pose.stage==='holding',p=m.phase==='return'?(arriving?home:target):(arriving?target:home);if(!p)return;
 auroraNavigationToPlanet(p.key,{orbit:true});n.missionFollow=follow;n.departureFocus={id:m.id,planet:p.key};
 const dock=auroraDock(p);n.goal.center=dock.position;n.goal.dist=auroraBattleScale(p)*auroraMissionDistance(m)*Math.max(1,H/W);n.goal.pitch=Math.asin(dock.normal[1])+.15;n.goal.yaw=Math.atan2(dock.normal[0],dock.normal[2])+.5;n.flight=true;
 if(pose.travel===0)n.departureFocus.launch={port:dock.position,normal:dock.normal,radius:auroraBattleScale(p)*170};
 const finished=m.phase==='return'&&pose.travel===0&&(auroraFinishedBattles.get(m.battleId)||auroraMapBattles.get(m.battleId));
 if(finished){const rows=finished.ships.filter(r=>r[6]>0&&auroraBattleVessel(finished,r[0])?.owner===n.playerId),row=rows.find(r=>auroraBattleVessel(finished,r[0])?.type==='Battleship')||rows[0];if(row){const pos=add(auroraBattleAnchor(p,finished),mul(row.slice(1,4),auroraBattleScale(p,finished))),normal=norm(sub(home.position,target.position));n.goal.center=pos;n.goal.dist=auroraBattleScale(p,finished)*500;n.goal.pitch=.22;n.goal.yaw=-.9;n.departureFocus.launch={port:pos,normal,radius:auroraBattleScale(p)*170};}}
 if(m.task==='attack'&&m.phase==='outbound'&&arriving){n.goal.center=add(auroraBattleAnchor(p),[-1050*auroraBattleScale(p),0,0]);n.goal.dist=auroraBattleScale(p)*500;n.goal.pitch=.72;n.goal.yaw=-.9;}
 n.departureFocus.center=n.goal.center.slice();
}
// Distort the current world frame, keeping the real stars and bodies behind the fleet.
// One reused texture and fullscreen pass; the hulls and HUD are drawn afterwards.
function createAuroraWarpScenery(){
 const vertex='attribute vec2 aPosition;varying vec2 uv;void main(){uv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}';
 const fragment=`precision highp float;varying vec2 uv;uniform sampler2D uScene;uniform float uStrength,uTime;uniform vec2 uPixel,uCenter;
 void main(){
  vec2 center=uCenter,delta=uv-center;float radius=length(delta),edge=smoothstep(.12,.68,radius);
  vec2 bend=delta*(1.-.09*uStrength*edge);
  bend+=vec2(-delta.y,delta.x)*sin(radius*12.-uTime*.7)*.008*uStrength*edge;
  vec2 at=clamp(center+bend,uPixel,1.-uPixel),split=delta*.002*uStrength*edge;
  vec3 color=texture2D(uScene,at).rgb;
  color.r=texture2D(uScene,clamp(at+split,uPixel,1.-uPixel)).r;
  color.b=texture2D(uScene,clamp(at-split,uPixel,1.-uPixel)).b;
  vec3 trail=texture2D(uScene,clamp(at-delta*.012*uStrength,uPixel,1.-uPixel)).rgb;
  color=mix(color,trail,.10*uStrength*edge);
  gl_FragColor=vec4(color,1.);
 }`;
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const texture=gl.createTexture(),buffer=gl.createBuffer(),a=gl.getAttribLocation(program,'aPosition'),u={};let width=0,height=0;
 for(const key of ['uScene','uStrength','uTime','uPixel','uCenter'])u[key]=gl.getUniformLocation(program,key);
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
 const attributes=gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
 function prepare(){
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  if(width!==canvas.width||height!==canvas.height){width=canvas.width;height=canvas.height;gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
 }
 return {prepare,draw(strength,time,vanishingY){
  prepare();
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.copyTexSubImage2D(gl.TEXTURE_2D,0,0,0,0,0,width,height);
  gl.viewport(0,0,width,height);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.depthMask(false);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(let i=0;i<attributes;i++)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,8,0);
  gl.uniform1i(u.uScene,0);gl.uniform1f(u.uStrength,strength);gl.uniform1f(u.uTime,time);gl.uniform2f(u.uPixel,1/width,1/height);gl.uniform2f(u.uCenter,.5,1-vanishingY);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  gl.depthMask(true);gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 },dispose(){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}
// A transparent hint of flow supplements the scenery instead of covering it.
function auroraDrawWarpTunnel(ctx,pose,time,vanishingY){
 const strength=pose.stage==='cruise'?1:pose.stage==='warp-in'?pose.warp:pose.stage==='warp-out'?pose.warp:0;
 if(!strength)return 0;
 const cx=W*.5,cy=H*vanishingY,radius=Math.hypot(W,H)*.65;
 ctx.save();ctx.globalAlpha=strength;
 const bg=ctx.createRadialGradient(cx,cy,5,cx,cy,radius);bg.addColorStop(0,'#07152e00');bg.addColorStop(.58,'#12355208');bg.addColorStop(1,'#173e6015');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 ctx.globalCompositeOperation='lighter';
 for(let i=0;i<96;i++){
  const seed=Math.sin(i*127.1+311.7)*43758.5453,angle=i*2.399963+time*.025,z=(seed-Math.floor(seed)+time*(.45+(i%5)*.045))%1;
  const r=18+z*z*radius,tail=8+z*z*radius*.18,x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.77;
  const end=angle+.09*z,tx=cx+Math.cos(end)*(r+tail),ty=cy+Math.sin(end)*(r+tail)*.77;
  ctx.strokeStyle=i%4===0?'#ceeaff':'#4b9ee8';ctx.globalAlpha=strength*z*z*.25;ctx.lineWidth=.5+z;
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(cx+Math.cos(angle+.04)*(r+tail*.5),cy+Math.sin(angle+.04)*(r+tail*.5)*.77,tx,ty);ctx.stroke();
 }
 ctx.restore();return strength;
}
function auroraDrawFlightStatus(ctx,m,pose,now){
 const width=Math.min(460,W-40),left=(W-width)/2,top=H-178,pad=18,track=width-pad*2;
 const seconds=Math.max(0,Math.ceil((m.end-now)/1000)),eta=seconds>=3600?Math.floor(seconds/3600)+'时 '+Math.floor(seconds%3600/60)+'分':Math.floor(seconds/60)+'分 '+String(seconds%60).padStart(2,'0')+'秒';
 const count=m.count||Object.values(m.ships||{}).reduce((a,b)=>a+b,0);
 const title=({'warp-in':'正在进入曲速',cruise:m.phase==='return'?'曲速返航':'曲速航行','warp-out':m.phase==='return'?'正在返回船坞':'正在抵达目标'})[pose.stage];
 const destination=m.phase==='return'?m.fromPosition:m.position;
 ctx.save();ctx.fillStyle='#07111ce8';ctx.fillRect(left,top,width,110);ctx.strokeStyle='#54849780';ctx.lineWidth=1;ctx.strokeRect(left+.5,top+.5,width-1,109);
 ctx.font='14px "Microsoft YaHei",sans-serif';ctx.fillStyle='#e2f4ff';ctx.fillText(title+' · '+count+' 艘',left+pad,top+25);
 ctx.font='12px "Microsoft YaHei",sans-serif';ctx.textAlign='right';ctx.fillStyle='#9bdce9';ctx.fillText(Math.floor(pose.progress*100)+'%',left+width-pad,top+25);
 ctx.textAlign='left';ctx.fillStyle='#b3c8d6';ctx.fillText('目标 '+(destination?destination.join(':'):'银心黑洞'),left+pad,top+49);ctx.textAlign='right';ctx.fillText('抵达 '+eta,left+width-pad,top+49);
 ctx.fillStyle='#294356';ctx.fillRect(left+pad,top+62,track,3);ctx.fillStyle='#9be8f1';ctx.fillRect(left+pad,top+62,track*pose.progress,3);
 ctx.textAlign='center';ctx.font='11px "Microsoft YaHei",sans-serif';ctx.fillStyle='#8ca8bb';ctx.fillText('Esc 退出舰队视角',W/2,top+91);ctx.restore();
 return {progress:pose.progress,seconds,count,destination};
}
function createAuroraBattles(){
 let shared=null,visual=null,cruiseView=null,scenery=null,disposed=false,failed=false,lastTime=performance.now(),stats={visible:[],markers:[],loaded:false};
 const abort=new AbortController();
 const tunnel=document.createElement('canvas'),tunnelCtx=tunnel.getContext('2d'),canvas3d=document.createElement('canvas'),overlay=document.createElement('canvas'),ctx=overlay.getContext('2d');
 tunnel.className='map-warp-background';canvas3d.className='map-fleet-renderer';overlay.className='map-battle-overlay';
 for(const [c,z] of [[tunnel,6],[canvas3d,7],[overlay,9]]){c.setAttribute('aria-hidden','true');Object.assign(c.style,{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:z});document.body.append(c);}
 const ready=import('./map-fleet.bundle.js').then(async module=>{if(disposed)return;visual=module.missionVisual;cruiseView=module.cruiseView;const value=await module.createMapFleetRenderer(canvas3d,{signal:abort.signal});if(disposed)value.dispose();else{shared=value;scenery=createAuroraWarpScenery();scenery.prepare();}}).catch(e=>{if(!disposed){failed=true;console.error('星图舰队渲染加载失败',e);}throw e;});ready.catch(()=>{});
 function draw(n,screen){
  const ratio=Math.min(DPR,2),now=performance.now(),dt=Math.min(.1,(now-lastTime)/1000);lastTime=now;
  for(const [c,context] of [[overlay,ctx],[tunnel,tunnelCtx]]){if(c.width!==Math.round(W*ratio)||c.height!==Math.round(H*ratio)){c.width=Math.round(W*ratio);c.height=Math.round(H*ratio);}context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,W,H);}
  const flightNow=Date.now()+gameNowOffset,followed=n.missions?.find(m=>m.id===n.missionFollow?.id),followPose=followed&&visual?.(followed,flightNow),cruising=followPose?.stage==='cruise';
  const vanishingY=cruising?cruiseView.vanishingY:.38;
  n.warpTunnel=followPose?{id:followed.id,strength:auroraDrawWarpTunnel(tunnelCtx,followPose,n.time,vanishingY),stage:followPose.stage,vanishingY}:null;
  if(n.warpTunnel?.strength>0){scenery??=createAuroraWarpScenery();scenery.draw(n.warpTunnel.strength,n.time,vanishingY);n.warpTunnel.scenery=true;}
  n.resources.label.style.visibility=cruising?'hidden':'';
  stats={visible:[],markers:[],loaded:!!shared,failed,renderer:'shared-battlefield'};n.flights=[];
  const forward=norm(sub(n.camera.center,n.eye)),right=norm(cross(forward,[0,1,0])),up=norm(cross(right,forward));
  shared?.begin({backgroundCanvas:canvas,eye:n.eye,center:n.camera.center,vp:n.vp,fov:n.renderFov||FOV,forward,up:n.bridgeUp||up,width:W,height:H,dpr:ratio,time:n.time,dt,sampleTime:n.sampleTime,occluders:cruising?[]:n.planets.filter(p=>p.kind!=='belt'&&screen(p.position,p.radius).radius>1).map(p=>({position:p.position,radius:p.radius*(p.npc?.65:1)}))});
  const records=new Map((n.battles||[]).map(b=>[b.id,b]));for(const [id,b]of auroraMapBattles)records.set(id,b);
  const replayTargets=new Set([...records.values()].filter(b=>b.replay).map(b=>b.target));
  for(const b of records.values()){
   if(cruising)continue;
   if(!b.replay&&replayTargets.has(b.target))continue;
   const p=auroraNavigationBody(b.target)||n.planets.find(p=>p.coordinates.join(':')===b.position?.join(':'));if(!p)continue;
   const star=n.systems.find(s=>s.id===p.coordinates[1]),markerPosition=n.level==='galaxy'?star?.position:p.position;if(!markerPosition)continue;
   const marker=screen(markerPosition,p.radius);
   const label=b.replay?'战斗回放':b.status==='finished'?'战斗结束':'正在交战';
   if(marker.depth>0&&marker.x>8&&marker.x<W-100&&marker.y>100&&marker.y<H-140){ctx.strokeStyle=b.replay?'#99d5df':'#ff9f76';ctx.fillStyle='#08131ee6';ctx.fillRect(marker.x+18,marker.y-13,92,25);ctx.strokeRect(marker.x+18,marker.y-13,92,25);ctx.fillStyle=ctx.strokeStyle;ctx.font='11px "Microsoft YaHei",sans-serif';ctx.fillText(label+' ↗',marker.x+27,marker.y+4);stats.markers.push({id:b.id,x:marker.x+64,y:marker.y,radius:47});n.screen.push({id:b.id,type:'battle',x:marker.x+64,y:marker.y,radius:35,depth:marker.depth-.001});}
   if(!b.ships||n.level==='galaxy'||p.coordinates[1]!==n.system[1]||!shared)continue;
   const dock=auroraDock(p),view=shared.battle(b,auroraBattleAnchor(p,b),auroraBattleScale(p,b),n.playerId,{camera:n.combatCamera,dock:dock.position});
   if(p.npc)shared.port(dock.position,p.radius*.13,dock.normal);
   for(const ship of view.ships){const q=screen(ship.position,.015);if(q.depth>0&&q.x>0&&q.x<W&&q.y>0&&q.y<H)n.screen.push({id:ship.id,battleId:b.id,type:'vessel',x:q.x,y:q.y,radius:14,depth:q.depth-.01});}
   const helm=n.combatCamera;if(helm?.mode==='bridge'&&helm.id===b.id&&helm.target!=null&&!shared?.bridgeConsoleLayout().length&&!b.fighterInstruments?.inspectingConsole){const selected=view.ships.find(s=>s.id===helm.target&&s.hp>0);if(selected){const q=screen(selected.position,.015),onscreen=q.depth>0&&q.x>40&&q.x<W-40&&q.y>170&&q.y<H-100;ctx.strokeStyle=helm.locked?'#f8b58d':'#d4e3cf';ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1;ctx.font='11px "Microsoft YaHei",sans-serif';if(onscreen){ctx.strokeRect(q.x-16,q.y-16,32,32);ctx.fillText((helm.locked?'锁定 ':'目标 ')+'#'+(selected.id+1),q.x+23,q.y-14);}else{const dx=q.depth>0?q.x-W/2:W/2-q.x,dy=q.depth>0?q.y-H/2:H/2-q.y,a=Math.atan2(dy,dx),x=W/2+Math.cos(a)*145,y=H/2+Math.sin(a)*145;ctx.fillText('▸',x,y);ctx.fillText('目标 #'+(selected.id+1),x+16,y);}}}
   stats.visible.push({id:b.id,target:p.key,replay:!!b.replay,tick:b.tick,...view});
   // Consumed event sequences live in the shared controller; only retain a short reconnect window.
   b.effects=(b.effects||[]).filter(e=>now-e.received<6000);
  }
  const endpoint=(coords,id)=>{const p=auroraNavigationBody(id)||n.planets.find(p=>p.coordinates.join(':')===coords?.join(':')&&!p.moon);if(p)return {position:auroraDock(p).position,radius:p.radius,planet:p};if(!coords)return null;const s=n.systems.find(s=>s.id===coords[1]);return s?{position:add(s.position,auroraNavigationSlot(coords[2],coords.slice(0,2)).position),radius:1.5}:null;};
  for(const [id,b]of auroraFinishedBattles)if(Date.now()-b.finishedSeen>30000)auroraFinishedBattles.delete(id);
  for(const m of n.missions||[]){
   if(m.phase==='engaged')continue;
   const home=endpoint(m.fromPosition,m.from),dest=m.task==='explore'?{position:auroraBlackHole.position,radius:2}:endpoint(m.position,m.target);if(!home||!dest)continue;
   const returning=m.phase==='return',recall=m.recalledElapsed==null?null:visual?.({phase:'outbound',start:0,end:m.travel},m.recalledElapsed),returnOrigin=recall?{...dest,position:vlerp(home.position,dest.position,recall.travel)}:dest,a=returning?returnOrigin:home,b=returning?home:dest,pose=visual?.(m,flightNow)||{stage:'cruise',progress:0,travel:0,model:0,warp:0};
   const finished=returning&&pose.travel===0&&(auroraFinishedBattles.get(m.battleId)||auroraMapBattles.get(m.battleId));
   const dir=norm(sub(b.position,a.position)),scale=auroraBattleScale(pose.travel===0?a:b,finished||null);
   // Departure and arrival keep actual models outside the planet, in the same layer as combat.
   const start=add(a.position,mul(dir,a.radius*1.5)),end=add(b.position,mul(dir,-b.radius*1.5));
   pose.battleApproach=!returning&&m.task==='attack'&&(pose.stage==='warp-out'||pose.stage==='holding');
   if(pose.battleApproach)pose.environment={kind:'planet',radius:12000,center:[700,-12400,0]};
   pose.launch=pose.travel===0;pose.docking=returning&&pose.stage==='warp-out';pose.departureDirection=a.planet?auroraDock(a.planet).normal:dir;pose.dockNormal=b.planet?auroraDock(b.planet).normal:dir;
   if(finished){pose.returnRows=finished.ships.filter(r=>r[6]>0&&auroraBattleVessel(finished,r[0])?.owner===n.playerId);pose.returnMetadata=finished.metadata;pose.departureDirection=dir;}
   const position=finished&&a.planet?auroraBattleAnchor(a.planet,finished):pose.battleApproach&&b.planet?auroraBattleAnchor(b.planet):pose.stage==='cruise'?vlerp(start,end,pose.travel):pose.travel===0?a.position:pose.docking?b.position:pose.stage==='holding'?b.position:add(end,mul(dir,b.radius*1.5*(pose.local||0)));
   const markerPosition=pose.battleApproach?add(position,[-1050*scale,0,0]):position,q=screen(markerPosition,.2);
   let detail={models:0};if(shared){if(cruising&&followed.id===m.id)detail=shared.cruise(m,pose);else if(!cruising&&pose.model>0&&n.level!=='galaxy')detail=shared.travel(m,pose,position,scale,dir);}
   for(const ship of detail.observer?[]:detail.ships||[]){const hit=screen(ship.position,ship.radius);if(hit.depth>0&&hit.x>0&&hit.x<W&&hit.y>0&&hit.y<H)n.screen.push({id:m.id,type:'mission',ship:ship.slot,x:hit.x,y:hit.y,radius:Math.max(12,hit.radius),depth:hit.depth-.01});}
   if(n.missionFollow?.id===m.id&&pose.stage==='cruise'){n.goal.center=position.slice();n.camera.center=position.slice();}
   if(detail.focus&&n.missionFollow?.id===m.id&&!n.missionFollow.manual&&n.departureFocus){n.goal.center=detail.focus.slice();n.departureFocus.center=detail.focus.slice();if(Math.abs(Math.log(n.camera.dist/n.goal.dist))<.1)n.camera.center=detail.focus.slice();}
   const label=({departing:returning?'返航编队集结':'太空电梯出舰','warp-in':'进入曲速',cruise:returning?'曲速返航':'曲速航行','warp-out':returning?'返回轨道船坞':'退出曲速 · 目标近地轨道',holding:'驻留作业'})[pose.stage];
   ctx.save();if(cruising)ctx.globalAlpha=0;ctx.translate(q.x,q.y);ctx.fillStyle=m.inbound?'#ffa080':'#9ae9ff';ctx.strokeStyle=ctx.fillStyle;
   if(!cruising&&(pose.stage==='cruise'||n.level==='galaxy')){ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(6,6);ctx.lineTo(0,3);ctx.lineTo(-6,6);ctx.closePath();ctx.fill();ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(-3,9);ctx.lineTo(-3,20);ctx.moveTo(3,9);ctx.lineTo(3,20);ctx.stroke();ctx.globalAlpha=1;}
   ctx.font='11px "Microsoft YaHei",sans-serif';ctx.fillText(label+(m.count?' · '+m.count+' 艘':''),14,-9);ctx.restore();
   n.flights.push({id:m.id,x:q.x,y:q.y,count:m.count,progress:pose.progress,stage:pose.stage,returning,position,controllable:false,...detail});
   n.screen.push({id:m.id,type:'mission',x:q.x,y:q.y,radius:15,depth:q.depth});
  }
  if(n.warpTunnel?.strength>0)n.warpTunnel.status=auroraDrawFlightStatus(ctx,followed,followPose,flightNow);
  else if((followed||n.combatCamera)&&!(n.combatCamera?.mode==='bridge'&&(shared?.fighterConsoleLayout().length||shared?.bridgeConsoleLayout().length))){ctx.save();ctx.fillStyle='#07111cdd';ctx.fillRect(W/2-170,H-94,340,32);ctx.fillStyle='#cfedff';ctx.font='12px "Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.fillText((n.combatCamera?'战斗跟随':'舰队跟随')+' · Esc 退出舰队视角',W/2,H-73);ctx.restore();}
  if(failed){ctx.fillStyle='#ffac87';ctx.font='13px sans-serif';ctx.fillText('舰队画面加载失败，请刷新重试',24,H-100);}
  shared?.end();
 }
 return {draw,ready,walkCabin:(pose,keys,dt)=>shared?.walkCabin(pose,keys,dt),update:()=>auroraFollowMission(visual,cruiseView),bridgeSeat:type=>shared?.bridgeSeat(type),cabinClass:(type,profile)=>shared?.cabinClass(type,profile),pickBridgeConsole:(x,y)=>shared?.pickBridgeConsole(x,y),bridgeConsoleLayout:()=>shared?.bridgeConsoleLayout()||[],pickFighterConsole:(x,y)=>shared?.pickFighterConsole(x,y),fighterConsoleLayout:()=>shared?.fighterConsoleLayout()||[],get stats(){return stats;},dispose(){disposed=true;abort.abort();shared?.dispose();scenery?.dispose();tunnel.remove();canvas3d.remove();overlay.remove();auroraMapBattles.clear();auroraFinishedBattles.clear();}};
}
