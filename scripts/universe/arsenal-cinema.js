import * as T from 'three';
import {createArsenalModel,prepareArsenalShaders} from './arsenal-models.js';
import {createReferenceImpact,createGlowTexture} from './arsenal-original.js';
import {copyCamera,add,sub,norm,mul,starRadius} from './spatial.js';
import {arsenalTimings,arsenalShotTime,electronThroughFlight} from './arsenal-motion.js';

const names={laser:'戴森棱镜阵列',missile:'相对论导弹发射舰',accelerator:'恒星电子加速器'};
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=(lo,hi,v)=>{const p=clamp((v-lo)/(hi-lo));return p*p*(3-2*p);};
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);

function createFlightVisual(scene,kind,scale){
 const group=new T.Group(),color=kind==='laser'?0xd8ffc6:kind==='missile'?0x9adfff:0xc5a6ff;
 const geometry=new T.CylinderGeometry(1,1,1,12,1,true),materials=[];
 const beam=new T.Group();
 for(const [width,alpha]of [[3,.12],[1,.5],[.3,1]]){
  const material=new T.MeshBasicMaterial({color,transparent:true,opacity:alpha,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
  const mesh=new T.Mesh(geometry,material);mesh.userData.width=width*scale*(kind==='laser'?.3:.17);mesh.userData.alpha=alpha;beam.add(mesh);materials.push(material);
 }
 group.add(beam);
 const trailGeometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(new Float32Array(6),3));
 const trail=new T.Line(trailGeometry,new T.LineBasicMaterial({color,transparent:true,opacity:.7,depthWrite:false,toneMapped:false}));trail.frustumCulled=false;group.add(trail);
 const tipGeometry=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute([0,0,0],3));
 const tip=new T.Points(tipGeometry,new T.PointsMaterial({color,size:7,sizeAttenuation:false,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));tip.frustumCulled=false;group.add(tip);scene.add(group);
 const start=new T.Vector3(),end=new T.Vector3(),axis=new T.Vector3(),up=new T.Vector3(0,1,0);
 return {
  update(from,to,origin,strength,overview){
   group.visible=strength>0;start.fromArray(sub(from,origin));end.fromArray(sub(to,origin));axis.copy(end).sub(start);
   const length=axis.length();beam.visible=kind!=='missile'&&length>0;
   if(beam.visible){beam.position.copy(start).add(end).multiplyScalar(.5);beam.quaternion.setFromUnitVectors(up,axis.normalize());for(const mesh of beam.children){mesh.scale.set(mesh.userData.width,length,mesh.userData.width);mesh.material.opacity=mesh.userData.alpha*strength;}}
   trail.visible=tip.visible=overview;trail.geometry.attributes.position.setXYZ(0,...start.toArray());trail.geometry.attributes.position.setXYZ(1,...end.toArray());trail.geometry.attributes.position.needsUpdate=true;trail.material.opacity=strength*.7;tip.position.copy(end);tip.material.opacity=strength;
  },
  dispose(){group.removeFromParent();geometry.dispose();materials.forEach(m=>m.dispose());trailGeometry.dispose();trail.material.dispose();tipGeometry.dispose();tip.material.dispose();},
 };
}
export function createArsenalCinema(world){
 let active=null;
 const overlay=document.createElement('section');overlay.className='arsenal-cinema';overlay.hidden=true;
 const seek=document.createElement('input');seek.type='range';seek.min='0';seek.step='.05';seek.setAttribute('aria-label','回放时间');
 const label=document.createElement('div'),title=document.createElement('strong'),caption=document.createElement('small'),pause=document.createElement('button'),skip=document.createElement('button');
 label.append(title,caption,seek);pause.textContent='暂停';skip.textContent='跳过';overlay.append(label,pause,skip);document.body.append(overlay);
 seek.oninput=()=>{if(active){active.time=Number(seek.value);active.paused=true;pause.textContent='继续';}};
 pause.onclick=()=>{if(active){active.paused=!active.paused;pause.textContent=active.paused?'继续':'暂停';}};skip.onclick=()=>stop();
 const key=e=>{if(e.key==='Escape'&&active){stop();e.preventDefault();}};window.addEventListener('keydown',key,{signal:world.abort.signal});
 function start(strike){
  if(strike?.status!=='hit'||!names[strike.kind])return false;
  const target=world.body(strike.target)||world.body(strike.position.join(':')),star=world.navigation.systems.find(s=>s.id===strike.fromPosition[1]);if(!target||!star)return false;
  stop();world.clearFollow();world.hideShip();
  const scale=strike.kind==='missile'?10:starRadius(star.id)/(strike.kind==='laser'?12:30),source=strike.kind==='missile'?add(star.position,[12500,2400,-7000]):star.position.slice();
  const model=createArsenalModel(strike.kind,{target:new T.Vector3(...sub(target.position,source)).multiplyScalar(1/scale)}),sourceRoot=new T.Group();sourceRoot.scale.setScalar(scale);sourceRoot.add(model.group);world.scene.add(sourceRoot);
  const texture=createGlowTexture(),impact=createReferenceImpact({center:new T.Vector3(),radius:17,texture});impact.group.scale.setScalar(target.radius/17);prepareArsenalShaders(impact.group);world.scene.add(impact.group);
  model.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m?.isMeshStandardMaterial){m.envMap=world.shipEnvironment();m.envMapIntensity=.8;}});
  const muzzle=add(source,mul(model.local(model.raw.muzzle).toArray(),scale));
  // Both endpoints must stay on the muzzle–planet axis. Extending along the
  // star-centre axis instead would make a tangent extractor's beam drift.
  const direction=new T.Vector3(...norm(sub(muzzle,target.position))),outgoing=direction.clone().negate();
  const contact=add(target.position,mul(direction.toArray(),target.radius));
  const routeLength=new T.Vector3(...sub(contact,muzzle)).length(),flight=createFlightVisual(world.scene,strike.kind,scale);
  const side=new T.Vector3().crossVectors(outgoing,new T.Vector3(0,1,0)).normalize();
  const targetOffset=direction.clone().multiplyScalar(target.radius*2.1).addScaledVector(side,-target.radius*3.7).add(new T.Vector3(0,target.radius*1.7,0)).toArray();
  const overviewOffset=side.clone().multiplyScalar(routeLength*.38).add(new T.Vector3(0,routeLength*.65,0)).addScaledVector(outgoing,-routeLength*.12).toArray();
  const signals=new T.BufferGeometry(),points=[];for(let i=0;i<260;i++){const y=1-2*(i+.5)/260,a=i*2.399963,r=Math.sqrt(1-y*y);points.push(Math.cos(a)*r*1.025,y*1.025,Math.sin(a)*r*1.025);}signals.setAttribute('position',new T.Float32BufferAttribute(points,3));
  const signalMat=new T.ShaderMaterial({uniforms:{front:{value:-1},direction:{value:direction}},vertexShader:'uniform float front;uniform vec3 direction;varying float power;void main(){power=smoothstep(front-.05,front+.05,acos(clamp(dot(normalize(position),direction),-1.,1.))/3.14159265);vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=2.3;}',fragmentShader:'varying float power;void main(){float r=length(gl_PointCoord-.5);gl_FragColor=vec4(.7,.85,1.,power*(1.-smoothstep(.12,.5,r)));}',transparent:true,depthWrite:false,blending:T.AdditiveBlending}),lights=new T.Points(signals,signalMat);lights.scale.setScalar(target.radius);prepareArsenalShaders(lights);world.scene.add(lights);
  const timing={...arsenalTimings[strike.kind]};
  if(strike.kind==='missile'){
   const arrival=timing.release+(model.raw.impactAt-timing.rawRelease)*timing.release/timing.rawRelease;
   timing.end+=arrival-timing.arrival;timing.arrival=arrival;timing.rawImpact=model.raw.impactAt;
  }
  active={strike,target,source,scale,model,sourceRoot,impact,texture,flight,lights,time:0,paused:false,direction,outgoing,muzzle,contact,routeLength,targetOffset,overviewOffset,timing};
  world.surface(target)?.ready().catch(error=>{if(active?.target===target)world.fail(error);});
  seek.max=String(active.timing.end);seek.value='0';world.environment.megastructures.suppress({key:strike.system,kind:strike.kind});
  title.textContent=`${names[strike.kind]} · ${strike.targetName}`;pause.textContent='暂停';overlay.hidden=false;
  world.navigation.zoomTarget=null;world.navigation.selectedPlanetId=target.key;world.navigation.system=target.coordinates.slice(0,2);world.emit('select',{target:{...target,position:target.coordinates},internal:true});return true;
 }
 function stop(){
  if(!active)return;const a=active;active=null;overlay.hidden=true;world.environment.megastructures.suppress(null);
  const surface=world.surfaces.get(a.target.key)?.object;if(surface?.desolation){surface.desolation.uniforms.ruin.value=1;surface.desolation.uniforms.heat.value=0;}
  a.sourceRoot.removeFromParent();a.model.dispose();a.impact.group.removeFromParent();a.impact.dispose();a.texture.dispose();a.flight.dispose();a.lights.removeFromParent();a.lights.geometry.dispose();a.lights.material.dispose();
  const n=world.navigation;n.zoomTarget={type:'planet',id:a.target.key};n.selectedPlanetId=a.target.key;n.system=a.target.coordinates.slice(0,2);n.goal={center:a.target.position.slice(),dist:a.target.radius*4.5,yaw:.5,pitch:.3};n.camera=copyCamera(n.goal);world.emit('select',{target:{...a.target,position:a.target.coordinates},internal:true});
 }
 function sourceView(a,t){
  const {model,source,scale,strike,timing}=a,rawTime=arsenalShotTime(strike.kind,t,timing);
  if(strike.kind==='missile'){
   if(t>=6.5){const position=model.raw.getProjectileSample(rawTime).position;return {center:add(source,mul(model.local(position).toArray(),scale)),offset:new T.Vector3(...(t<9.25?[3,2.1,4]:[4,25,2])).applyQuaternion(model.raw.group.quaternion).multiplyScalar(scale).toArray()};}
   if(t>=3.5)return {center:add(source,mul(model.local(model.raw.reactorFocus).toArray(),scale)),offset:mul(model.raw.reactorOffset.toArray(),scale)};
  }
  const detail=strike.kind==='missile'?0:smooth(timing.release*.45,timing.release*.75,t);
  return {center:add(source,mul(mix(model.focus.toArray(),model.local(model.raw.detailFocus).toArray(),detail),scale)),offset:mul(mix(model.cameraOffset.toArray(),model.raw.detailOffset.toArray(),detail),scale)};
 }
 function update(dt){
  if(!active)return;const a=active;if(!a.paused)a.time+=dt;const {time:t,model,strike,target,timing}=a;
  if(t>timing.end){stop();return;}
  seek.value=String(t);const rawTime=arsenalShotTime(strike.kind,t,timing);model.updateShot(rawTime,rawTime);
  // Only one growing beam owns the launch-to-target path, rather than an
  // instantaneous reference beam plus a second, fixed-length target beam.
  if(model.raw.beam)model.raw.beam.visible=false;if(model.raw.beamRings)model.raw.beamRings.visible=false;
  let {center,offset}=sourceView(a,Math.min(t,timing.release+.5));
  if(t<timing.release+.5){
   caption.textContent=strike.kind==='missile'?(t<3.5?'舰尾装填 · 已装载反物质燃料':t<6.5?'反应堆升功率 · 脉冲储能':t<9.25?'约束锁定 · 七层前盾展开':'逐环加速 · 出膛后持续加速'):strike.kind==='laser'?'棱镜转向 · 支路汇光 · 逐级收束':t<8?'束团循环加速 · 三通分流准备':'超导磁约束锁定 · 抽取炮口收束';
  }else{
   const transit=timing.arrival-timing.release;
   const pullback=smooth(timing.release+Math.min(.5,transit*.04),timing.release+Math.min(4,transit*.3),t),approach=smooth(timing.arrival-Math.min(3.5,transit*.3),timing.arrival-Math.min(1,transit*.08),t);
   center=mix(center,mix(a.muzzle,target.position,.5),pullback);offset=mix(offset,a.overviewOffset,pullback);
   const impactTime=t-timing.arrival;
   const impactOffset=strike.kind==='missile'?mul(a.targetOffset,1+smooth(.2,5,impactTime)*1.1):a.targetOffset;
   center=mix(center,target.position,approach);offset=mix(offset,impactOffset,approach);
   caption.textContent=impactTime<0?`跨星系${strike.kind==='missile'?'持续加速':'束流推进'} · [1:${strike.fromPosition[1]}] → [1:${strike.position[1]}] · 飞行时间已压缩`:impactTime<10?{laser:'白热落点 · 熔融喷流 · 地表烧蚀',missile:'地平线冲击 · 地壳碎片抛射',accelerator:'贯穿星球 · 束流继续向深空推进'}[strike.kind]:'永久死寂行星 · 不可殖民';
  }
  const n=world.navigation;n.camera=world.setViewFromEye(add(center,offset),center);n.goal=copyCamera(n.camera);n.flight=false;
 }
 function draw(){
  if(!active)return;const a=active,n=world.navigation,impactTime=a.time-a.timing.arrival,rawTime=arsenalShotTime(a.strike.kind,a.time,a.timing);
  a.sourceRoot.position.fromArray(sub(a.source,n.camera.center));a.impact.group.position.fromArray(sub(a.target.position,n.camera.center));
  a.impact.update({kind:a.strike.kind,time:impactTime,direction:a.direction,globalTime:a.time,quality:'balanced'});
  a.impact.exitBeam.visible=false;
  let from=a.muzzle,to=mix(a.muzzle,a.contact,clamp((a.time-a.timing.release)/(a.timing.arrival-a.timing.release)));
  if(a.strike.kind==='missile')to=add(a.source,mul(a.model.local(a.model.raw.getProjectileSample(rawTime).position).toArray(),a.scale));
  if(a.strike.kind==='accelerator'&&impactTime>=0){const through=electronThroughFlight(impactTime,a.target.radius,a.routeLength/(a.timing.arrival-a.timing.release));to=add(a.contact,mul(a.outgoing.toArray(),through.head));from=add(a.muzzle,mul(a.outgoing.toArray(),through.tail));}
  const fade=a.strike.kind==='missile'?Number(impactTime<0):1-smooth(a.strike.kind==='laser'?6:8,a.strike.kind==='laser'?10:14,impactTime);
  const strength=smooth(a.timing.release,a.timing.release+.25,a.time)*fade;
  a.flight.update(from,to,n.camera.center,strength,a.time>=a.timing.release+.5&&impactTime<0);
  a.lights.position.copy(a.impact.group.position);a.lights.visible=a.strike.kind==='accelerator'&&impactTime<3.5;a.lights.material.uniforms.front.value=impactTime<0?-1:impactTime/3.2;
  const surface=world.surface(a.target);if(surface?.desolation){surface.desolation.uniforms.ruin.value=Math.min(1,Math.max(0,impactTime/3.2));surface.desolation.uniforms.heat.value=impactTime<0?0:Math.min(1,impactTime)*Math.exp(-Math.max(0,impactTime-5)*.28);}
 }
 return {start,stop,update,draw,get active(){return active;},dispose(){stop();overlay.remove();}};
}
