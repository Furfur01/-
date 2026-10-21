import * as T from 'three';
import {createCoreVolume} from './core-volume.js';
import {createCoreBurst} from './core-burst.js';

const smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);
const output=`
#include <tonemapping_fragment>
#include <colorspace_fragment>
`;

function clusterMaterial(){
 return new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,depthWrite:false,vertexColors:true,
 uniforms:{uTime:{value:0},uFar:{value:1},uDPR:{value:1}},vertexShader:`
 attribute vec2 star;varying vec3 tint;varying float strength;uniform float uTime,uFar,uDPR;
 #include <common>
 #include <logdepthbuf_pars_vertex>
 void main(){vec4 eye=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*eye;tint=mix(color,vec3(1.,.68,.30),uFar*.85);
 float twinkle=.82+.18*sin(uTime*(.5+star.y)+star.y*73.);
 float bright=step(5.,star.x)*(1.-uFar);
 strength=twinkle*mix(.32,.48,uFar)*mix(1.,8.,bright)*smoothstep(2200.,18000.,length(eye.xyz));
 gl_PointSize=uDPR*clamp(star.x*(.8+90000./max(1000.,length(eye.xyz))),1.,mix(4.5,24.,bright));
 #include <logdepthbuf_vertex>
 }`,fragmentShader:`
 varying vec3 tint;varying float strength;
 #include <common>
 #include <logdepthbuf_pars_fragment>
 void main(){float r=length(gl_PointCoord*2.-1.);if(r>1.)discard;
 gl_FragColor=vec4(tint,strength*(exp(-r*r*32.)+.14*exp(-r*r*5.))*(1.-smoothstep(.65,1.,r)));
 #include <logdepthbuf_fragment>
 ${output}
 }`});
}

// Visual scenery only: no labels, pick targets, server state or encounter rules.
export function createCoreAtmosphere({root,signal,blackHole}){
 const group=new T.Group();group.name='galactic-core-atmosphere';root.add(group);
 const resources=new Set(),own=r=>(resources.add(r),r);
 const burst=createCoreBurst(group),volume=createCoreVolume({signal,burst,blackHole});
 let seed=93173;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const positions=[],colors=[],attributes=[];
 for(let i=0;i<3400;i++){
  const r=6500+Math.pow(random(),1.5)*245000,a=random()*Math.PI*2,y=(random()+random()+random()-1.5)*r*.48;
  positions.push(Math.cos(a)*r,y,Math.sin(a)*r);const warm=random();
  colors.push(...(warm<.48?[.32,.65,1.]:[1.,.66+warm*.16,.25+warm*.22]));attributes.push(.9+random()*1.9,random());
 }
 for(let i=0;i<72;i++){
  const r=16000+random()*85000,a=random()*Math.PI*2;
  positions.push(Math.cos(a)*r,(random()-.5)*r*.85,Math.sin(a)*r);
  colors.push(...(i%2?[.22,.55,1.]:[1.,.66,.22]));attributes.push(7+random()*5,random());
 }
 const clusterGeometry=own(new T.BufferGeometry());clusterGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));clusterGeometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));clusterGeometry.setAttribute('star',new T.Float32BufferAttribute(attributes,2));
 const starsMaterial=own(clusterMaterial()),stars=new T.Points(clusterGeometry,starsMaterial);group.add(stars);
 const glowMaterial=own(new T.ShaderMaterial({transparent:true,blending:T.AdditiveBlending,depthWrite:false,
  uniforms:{uOpacity:{value:0}},vertexShader:`varying vec2 vUv;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main(){vUv=uv;vec4 eye=modelViewMatrix*vec4(0.,0.,0.,1.);eye.xy+=position.xy*650000.;gl_Position=projectionMatrix*eye;
  #include <logdepthbuf_vertex>
  }`,fragmentShader:`varying vec2 vUv;uniform float uOpacity;
  #include <common>
  #include <logdepthbuf_pars_fragment>
  void main(){float r=length((vUv-.5)*2.);gl_FragColor=vec4(.9,.53,.16,uOpacity*exp(-r*r*5.)*(1.-smoothstep(.5,1.,r)));
  #include <logdepthbuf_fragment>
  ${output}
  }`}));
 const glow=new T.Mesh(own(new T.PlaneGeometry(1,1)),glowMaterial);glow.frustumCulled=false;group.add(glow);

 return {ready:volume.ready,render:volume.render,setCoreCut:volume.setCoreCut,update({time,eye,origin,camera}){
  group.position.set(-origin[0],-origin[1],-origin[2]);
  const distance=Math.hypot(...eye),reveal=1-smooth(320000,1300000,distance);
  volume.update({time,eye,origin,camera});
  starsMaterial.uniforms.uTime.value=time;starsMaterial.uniforms.uFar.value=1-reveal;starsMaterial.uniforms.uDPR.value=Math.min(globalThis.devicePixelRatio||1,1.6);
  glowMaterial.uniforms.uOpacity.value=(1-reveal)*.42;glow.visible=reveal<.999;
 },dispose(){volume.dispose();burst.dispose();group.removeFromParent();resources.forEach(r=>r.dispose());}};
}
