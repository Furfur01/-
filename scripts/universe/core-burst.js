import * as T from 'three';

const smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
// Long jets live outside the cloud's density box. Their moving tips taper out;
// there is no intersection with a nebula bounding face or screen-space edge.
export const burstLength=age=>2400000*smooth(.10,.49,age);

export function createCoreBurst(parent){
 const root=new T.Group();root.name='transient-core-burst';root.visible=false;parent.add(root);
 const resources=[],own=r=>(resources.push(r),r);
 const shared={uTime:{value:0},uAge:{value:0},uStrength:{value:0},uLength:{value:0}};
 const output=`#include <tonemapping_fragment>
 #include <colorspace_fragment>`;
 const vertexHeader=`
 varying vec3 vPoint,vNormal,vView;varying float vAlong;
 uniform float uTime,uAge,uLength,uPhase,uFilament,uHalo;
 #include <common>
 #include <logdepthbuf_pars_vertex>`;
 const jetMaterial=(filament,phase,halo=0)=>own(new T.ShaderMaterial({
  transparent:true,depthWrite:filament===1&&halo===0,blending:T.AdditiveBlending,side:T.FrontSide,
  uniforms:{...shared,uPhase:{value:phase},uFilament:{value:filament},uHalo:{value:halo}},
  vertexShader:vertexHeader+`
  void main(){
   float along=sign(position.y)*pow(abs(position.y),2.4),d=abs(along)*uLength;
   float tip=pow(max(0.,1.-abs(along)),.7)*(1.-smoothstep(.72,1.,abs(along)));
   float radius=(650.+1600.*(1.-exp(-d/19000.)))*tip;
   // Expanding corkscrews, with opposite helicity in the two polar jets.
   float twist=sign(along)*(log(1.+d/8500.)*13.-uTime*1.7)+uPhase;
   twist+=.22*sin(d/11000.-uTime*2.1);
   vec2 orbit=vec2(cos(twist),sin(twist))*radius*(.55+.12*sin(d/14000.-uTime*2.));
   vec3 p=vec3(position.x*radius,along*uLength,position.z*radius);
   if(uFilament>.5)p.xz=orbit+position.xz*radius*mix(.075,.32,uHalo);
   vAlong=along;vPoint=p;vec4 view=modelViewMatrix*vec4(p,1.);vView=normalize(-view.xyz);vNormal=normalize(normalMatrix*normal);
   gl_Position=projectionMatrix*view;
   #include <logdepthbuf_vertex>
  }`,
  fragmentShader:`
  varying vec3 vPoint,vNormal,vView;varying float vAlong;uniform float uTime,uAge,uStrength,uFilament,uPhase,uHalo;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  void main(){
   float d=abs(vPoint.y),tip=pow(max(0.,1.-abs(vAlong)),1.2)*(1.-smoothstep(.65,1.,abs(vAlong)));
   float packets=.22+.78*pow(.5+.5*sin(log(1.+d/5500.)*21.-uTime*7.+uPhase),3.);
   float nearCore=exp(-d/10000.);
   vec3 color=mix(vec3(.23,.15,.90),vec3(.63,.72,1.),packets);
   color=mix(color,vec3(1.,.86,.65),nearCore*.75);
   float face=pow(abs(dot(normalize(vNormal),normalize(vView))),mix(1.2,2.4,uHalo));
   float brightness=mix(.14,.90,uFilament)*mix(1.,.24,uHalo)*face*packets*tip*uStrength;
   if(brightness<.004)discard;
   gl_FragColor=vec4(color*(1.+nearCore*2.),brightness);
   #include <logdepthbuf_fragment>
   ${output}
  }`
 }));
 const jetGeometry=own(new T.CylinderGeometry(1,1,2,8,320,true));
 for(const [filament,phase,halo] of [[0,0,0],[1,0,0],[1,Math.PI*2/3,0],[1,Math.PI*4/3,0],[1,0,1],[1,Math.PI*2/3,1],[1,Math.PI*4/3,1]]){
  const mesh=new T.Mesh(jetGeometry,jetMaterial(filament,phase,halo));mesh.frustumCulled=false;root.add(mesh);
 }
 const diskMaterial=own(new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,uniforms:shared,
  vertexShader:`varying vec2 p;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main(){p=position.xy/6500.;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
  #include <logdepthbuf_vertex>
  }`,fragmentShader:`varying vec2 p;uniform float uTime,uAge,uStrength;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  void main(){float r=length(p),a=atan(p.y,p.x);float spiral=.55+.45*sin(a*3.-log(r+.1)*15.-uTime*3.);
   float ring=exp(-pow((r-.32)/.22,2.))*(1.-smoothstep(.7,1.,r));
   vec3 color=mix(vec3(.30,.40,1.),vec3(1.,.72,.32),spiral);
   gl_FragColor=vec4(color*1.8,ring*(.5+.5*spiral)*uStrength);
   #include <logdepthbuf_fragment>
   ${output}
  }`}));
 const disk=new T.Mesh(own(new T.RingGeometry(350,6500,96,4)),diskMaterial);disk.rotation.x=-Math.PI/2;root.add(disk);
 const flareMaterial=own(new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:shared,
  vertexShader:`varying vec2 p;uniform float uAge;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main(){p=position.xy*2.;vec4 view=modelViewMatrix*vec4(0.,0.,0.,1.);view.xy+=position.xy*24000.;gl_Position=projectionMatrix*view;
  #include <logdepthbuf_vertex>
  }`,fragmentShader:`varying vec2 p;uniform float uAge,uStrength;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  void main(){float r=length(p);float flash=exp(-pow((uAge-.17)/.055,2.));
   float core=exp(-r*r*360.)*(2.+flash*5.),halo=exp(-r*r*14.)*(.12+flash*.75);
   vec3 color=vec3(.95,.98,1.)*core+vec3(.32,.49,1.)*halo;
   gl_FragColor=vec4(color,(1.-smoothstep(.7,1.,r))*uStrength);
   #include <logdepthbuf_fragment>
   ${output}
  }`}));
 const flare=new T.Mesh(own(new T.PlaneGeometry(1,1)),flareMaterial);flare.frustumCulled=false;root.add(flare);
 const axis=new T.Vector3(0,1,0);
 return {update({position,direction,age,strength,time,reveal}){
  root.visible=strength*reveal>.001;if(!root.visible)return;
  root.position.set((position.x-7)*2400,(position.y-2)*2400,(position.z+2)*2400);root.quaternion.setFromUnitVectors(axis,direction);
  shared.uTime.value=time;shared.uAge.value=age;shared.uStrength.value=strength*reveal;shared.uLength.value=burstLength(age);
 },hide(){root.visible=false;},dispose(){root.removeFromParent();resources.forEach(r=>r.dispose());}};
}
