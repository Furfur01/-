import * as THREE from 'three';
export class CabinFeedback {
 constructor(){this.shake=this.hullFlash=this.shieldFlash=this.flicker=0;this.last=null;this.event=this.shieldEvent=0;this.shieldDirection=[0,.08,-1];this.shieldStrength=1;this.seenHits=new WeakSet();this.lastShieldTime=-Infinity;}
 update(data,time){
  const s=data.console||{},key=(data.feedbackEpoch??s.feedbackEpoch??'')+':'+(data.meta?.type||s.shipType||data.kind)+':'+(data.meta?.id??s.vesselId??''),dt=this.time==null?0:Math.max(0,Math.min(.1,time-this.time));
  const reset=this.key!==key||time<(this.time??time)||time-(this.time??time)>2;
  if(reset){this.resetCount=(this.resetCount||0)+1;this.last=null;this.shake=this.hullFlash=this.shieldFlash=this.flicker=0;this.seenHits=new WeakSet();this.lastShieldTime=-Infinity;}
  this.key=key;this.time=time;this.shake*=Math.exp(-dt*3.2);this.hullFlash*=Math.exp(-dt*3);this.shieldFlash*=Math.exp(-dt*4);this.flicker=Math.max(0,this.flicker-dt);
  const hits=data.shieldHits||[],fresh=hits.filter(h=>!this.seenHits.has(h));for(const h of hits)this.seenHits.add(h);
  let shieldLoss=0;
  if(this.last){const hull=this.last.hull-(s.hull??100);shieldLoss=this.last.shield-(s.shield??100);
   if(hull>.05){this.shake=Math.max(this.shake,.65+Math.min(.45,hull*.025));this.hullFlash=Math.min(1,.5+hull*.03);this.flicker=.35+Math.min(.45,hull*.02);this.event++;}
  }
  if(!reset&&(fresh.length||shieldLoss>.05&&time-this.lastShieldTime>.2)){
   const hit=fresh.at(-1);this.shieldDirection=hit?.cabinDirection?[...hit.cabinDirection]:[0,.08,-1];this.shieldStrength=hit?Math.min(1.4,.8+(hit.power||0)):1;
   this.shieldEvent++;this.lastShieldTime=time;this.shake=Math.max(this.shake,.12+Math.min(.18,Math.max(0,shieldLoss)*.008));this.shieldFlash=Math.min(1,this.shieldFlash+.55);
  }
  if(data.impact){this.shake=Math.max(this.shake,data.impact.shake||0);this.hullFlash=Math.max(this.hullFlash,data.impact.hullFlash||0);this.shieldFlash=Math.max(this.shieldFlash,data.impact.shieldFlash||0);}
  this.last={hull:s.hull??100,shield:s.shield??100};this.alert=s.hull<35||s.shield<=0||this.hullFlash>.25;
  this.flash=this.flicker>0&&Math.sin(time*79)+Math.sin(time*137)>.2?.85:0;
  return this;
 }
 apply(camera,time){const n=a=>Math.sin(time*a)+Math.sin(time*a*1.7+1.3)*.5,sh=this.shake;camera.position.x+=n(37)*sh*.03;camera.position.y+=n(41)*sh*.03;camera.rotateX(n(29)*sh*.006);camera.rotateY(n(33)*sh*.006);camera.rotateZ(n(23)*sh*.008);camera.updateMatrixWorld();}
}
export function createCabinSparks(eye){
 const geometry=new THREE.BufferGeometry(),positions=new Float32Array(48*3),velocity=[];geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
 const material=new THREE.PointsMaterial({color:0xffb45f,size:.018,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),points=new THREE.Points(geometry,material);let event=0,age=9;
 for(let i=0;i<48;i++)velocity.push([Math.sin(i*47)*.9,Math.abs(Math.sin(i*29))*1.1,Math.cos(i*31)*.5]);
 return {points,update(fx,time,dt){if(fx.event!==event){event=fx.event;age=fx.hullFlash>.1?0:9;}age+=dt;material.opacity=Math.max(0,1-age/1.1);points.visible=age<1.1;if(!points.visible)return;
  for(let i=0;i<48;i++){const side=i%2?1:-1,v=velocity[i];positions[i*3]=eye[0]+side*.88+v[0]*age;positions[i*3+1]=eye[1]-.33+v[1]*age-age*age*1.8;positions[i*3+2]=eye[2]-1.45+v[2]*age;}geometry.attributes.position.needsUpdate=true;},dispose(){geometry.dispose();material.dispose();}};
}
export function createFeedbackOverlay(){
 const scene=new THREE.Scene(),camera=new THREE.Camera(),geometry=new THREE.PlaneGeometry(2,2),material=new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false,uniforms:{hull:{value:0},shield:{value:0},alarm:{value:0}},vertexShader:'varying vec2 uv0;void main(){uv0=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:'varying vec2 uv0;uniform float hull,shield,alarm;void main(){float edge=pow(length((uv0-.5)*1.4),2.);float h=hull*(.04+edge*.34)+alarm*edge*.045;float s=shield*(.018+edge*.13);gl_FragColor=vec4(mix(vec3(.18,.65,.9),vec3(1.,.19,.055),h/(h+s+.001)),min(.45,h+s));}'});scene.add(new THREE.Mesh(geometry,material));
 return {draw(renderer,fx,time){material.uniforms.hull.value=fx.hullFlash;material.uniforms.shield.value=fx.shieldFlash;material.uniforms.alarm.value=fx.alert?.5+.5*Math.sin(time*5):0;renderer.render(scene,camera);},dispose(){geometry.dispose();material.dispose();scene.clear();}};
}
