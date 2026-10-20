import * as T from 'three';
import {stellarFunctions, blackHoleFunctions} from './environment-shaders.js';

export const celestialNoise=`
float skyHash(vec3 p){p=fract(p*.3183099+vec3(.1,.2,.3));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float skyNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(skyHash(i),skyHash(i+vec3(1,0,0)),f.x),mix(skyHash(i+vec3(0,1,0)),skyHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(skyHash(i+vec3(0,0,1)),skyHash(i+vec3(1,0,1)),f.x),mix(skyHash(i+vec3(0,1,1)),skyHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float skyClouds(vec3 p){return skyNoise(p)*.57+skyNoise(p*2.03)*.28+skyNoise(p*4.07)*.15;}
vec3 universeSky(vec3 ray){
 float neb=skyClouds(ray*4.2+vec3(12,4,8)),band=exp(-pow((ray.y+ray.x*.33+.55)*3.,2.));
 float dust=smoothstep(.30,.72,neb)*band;vec3 c=vec3(.006,.008,.020)+mix(vec3(.19,.06,.32),vec3(.035,.18,.22),skyClouds(ray*6.))*dust;
 c*=1.-smoothstep(.53,.76,skyClouds(ray*14.))*band*.75;
 vec3 field=ray*720.,cell=floor(field);float star=step(.996,skyHash(cell))*exp(-dot(fract(field)-.5,fract(field)-.5)*16.);
 return c+mix(vec3(.56,.72,1.),vec3(1.,.79,.55),skyHash(cell+9.))*star*.8;
}`;

const vertex=`
varying vec3 vLocal;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vLocal=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
#include <logdepthbuf_vertex>
}`;
const output=`
#include <tonemapping_fragment>
#include <colorspace_fragment>
`;
const rayDepth=`
void rayDepth(float travel,vec3 ray){
 float viewDepth=max(.000001,travel*uRadius*dot(ray,uForward));
 #ifdef USE_LOGARITHMIC_DEPTH_BUFFER
 gl_FragDepth=log2(1.+viewDepth)*logDepthBufFC*.5;
 #else
 vec4 clip=projectionMatrix*vec4(0.,0.,-viewDepth,1.);gl_FragDepth=(clip.z/clip.w+1.)*.5;
 #endif
}`;

export function createStellarNoise(){
 let seed=827341;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const values=new Uint8Array(256*256),data=new Uint8Array(256*256*4);
 for(let i=0;i<values.length;i++)values[i]=Math.floor(random()*256);
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){const j=(y*256+x)*4;data[j]=values[y*256+x];data[j+1]=values[((y+17)&255)*256+((x+37)&255)];data[j+2]=128;data[j+3]=255;}
 const texture=new T.DataTexture(data,256,256,T.RGBAFormat);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.magFilter=texture.minFilter=T.LinearFilter;texture.needsUpdate=true;return texture;
}

export function createStellarMaterials(noise,type=0){
 const shared={uNoise:{value:noise},uEye:{value:new T.Vector3()},uForward:{value:new T.Vector3(0,0,-1)},uRadius:{value:1},uTime:{value:0},uAlpha:{value:1},uType:{value:type}};
 const fragment=`
varying vec3 vLocal;uniform sampler2D uNoise;uniform vec3 uEye,uForward;
uniform float uTime,uRadius,uAlpha;uniform int uType,uPass;uniform mat4 projectionMatrix;
#include <common>
#include <logdepthbuf_pars_fragment>
${stellarFunctions}
${rayDepth}
void main(){
 vec3 rd=normalize(vLocal-uEye);vec2 outer=hitSphere(uEye,rd,2.6);if(outer.y<=0.)discard;
 vec2 hit=hitSphere(uEye,rd,1.);bool solid=hit.x>0.;float stop=solid?hit.x:1e6;
 if(uPass==0){if(!solid)discard;gl_FragColor=vec4(surface(normalize(uEye+rd*stop),rd,uType)*uAlpha,1.);rayDepth(stop,rd);}
 else{
  vec3 col=corona(uEye,rd,uType,stop)+prominences(uEye,rd,uType,stop);
  float along=-dot(uEye,rd),impact=length(uEye+rd*along);
  if(along>0.&&impact>1.)col+=tint(uType)*exp(-(impact-1.)*3.6)*.033;
  if(max(max(col.r,col.g),col.b)<.001)discard;
  gl_FragColor=vec4(col*uAlpha,1.);rayDepth(solid?stop:max(.001,outer.x),rd);
 }
 ${output}
}`;
 const surface=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{...shared,uPass:{value:0}},side:T.BackSide,depthWrite:true});
 const corona=new T.ShaderMaterial({vertexShader:vertex,fragmentShader:fragment,uniforms:{...shared,uPass:{value:1}},side:T.BackSide,transparent:true,blending:T.AdditiveBlending,depthWrite:false});
 return {surface,corona,uniforms:shared};
}

export function createBlackHoleMaterial(){
 return new T.ShaderMaterial({vertexShader:vertex,side:T.BackSide,transparent:true,depthWrite:true,uniforms:{uEye:{value:new T.Vector3()},uForward:{value:new T.Vector3()},uTime:{value:0},uRadius:{value:250}},fragmentShader:`
varying vec3 vLocal;uniform vec3 uEye,uForward;uniform float uTime,uRadius;uniform mat4 projectionMatrix;
#include <common>
#include <logdepthbuf_pars_fragment>
${blackHoleFunctions}
${celestialNoise}
${rayDepth}
void main(){
 vec3 dir=normalize(vLocal-uEye),original=dir,pos=uEye;float b=dot(pos,dir),disc=b*b-dot(pos,pos)+324.;
 if(disc<0.||b>0.)discard;float entry=max(0.,-b-sqrt(disc));pos+=dir*entry;
 vec3 crossRay=cross(pos,dir);float h2=dot(crossRay,crossRay),transmission=1.,firstHit=-1.;vec3 emission=vec3(0.);bool captured=false;
 for(int i=0;i<220;i++){
  float r=length(pos);if(r<1.015){captured=true;break;}if(r>19.)break;
  float stepSize=clamp(r*.065,.045,.85);vec3 previous=pos,acc=bend(pos,h2);
  pos+=dir*stepSize+.5*acc*stepSize*stepSize;dir+=.5*(acc+bend(pos,h2))*stepSize;
  if(previous.y*pos.y<0.){
   vec3 hit=mix(previous,pos,previous.y/(previous.y-pos.y));float radius=length(hit.xz);
   if(radius>2.95&&radius<12.){if(firstHit<0.)firstHit=length(hit-uEye);emission+=transmission*disk(hit);transmission*=1.-.96*smoothstep(2.95,3.3,radius)*(1.-smoothstep(8.,12.,radius));}
  }
  if(transmission<.015)break;
 }
 float impact=sqrt(h2),ring=exp(-pow((impact-2.598)/.025,2.)),edge=1.-smoothstep(13.,17.8,impact);
 if(edge<.001)discard;emission+=vec3(1.,.80,.49)*ring*.32;
 vec3 color=emission+(captured?vec3(0.):universeSky(normalize(dir)))*transmission;
 gl_FragColor=vec4(color,edge);rayDepth(firstHit>0.?firstHit:max(.001,-b),original);
 ${output}
}`});
}

export function createSkyMaterial(){return new T.ShaderMaterial({vertexShader:vertex,side:T.BackSide,depthTest:false,depthWrite:false,fragmentShader:`varying vec3 vLocal;${celestialNoise}
void main(){gl_FragColor=vec4(universeSky(normalize(vLocal)),1.);${output}}`});}

export function createNpcMaterial(){return new T.ShaderMaterial({uniforms:{uLight:{value:new T.Vector3(-.5,.6,1)},uEye:{value:new T.Vector3()}},vertexShader:`
attribute vec3 emission;varying vec3 p,n,c,e;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){p=position;n=normal;c=color;e=emission;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
#include <logdepthbuf_vertex>
}`,fragmentShader:`
varying vec3 p,n,c,e;uniform vec3 uLight,uEye;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){vec3 N=normalize(n),V=normalize(uEye-p),L=normalize(uLight);float sun=max(0.,dot(N,L)),fill=max(0.,dot(N,normalize(vec3(-.5,.6,1.)))),hemi=.5+.5*N.y,spec=pow(max(0.,dot(N,normalize(L+V))),35.);
 gl_FragColor=vec4(c*(.38+.24*hemi+sun*1.9+fill*.6)+vec3(.18,.23,.29)*spec+e,1.);
#include <logdepthbuf_fragment>
${output}
}`,vertexColors:true});}

export function createGalaxyMaterial(){return new T.ShaderMaterial({uniforms:{uOpacity:{value:1},uZoom:{value:1},uDPR:{value:1}},transparent:true,blending:T.AdditiveBlending,depthWrite:false,vertexColors:true,vertexShader:`
attribute vec2 star;uniform float uZoom,uDPR;varying float brightness,fade;varying vec3 tint;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vec4 eye=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*eye;fade=smoothstep(25000.,150000.,length(eye.xyz));brightness=star.y;tint=color;gl_PointSize=max(1.,star.x*uDPR*uZoom);
#include <logdepthbuf_vertex>
}`,fragmentShader:`
varying float brightness,fade;varying vec3 tint;uniform float uOpacity;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float halo=exp(-r*r*5.),core=1.-smoothstep(.12,.55,r);gl_FragColor=vec4(tint,brightness*(core*.6+halo*.4)*fade*uOpacity);
#include <logdepthbuf_fragment>
${output}
}`});}

export function createCometMaterial(mode=1){return new T.ShaderMaterial({uniforms:{uHead:{value:new T.Vector3()},uOpacity:{value:1},uDPR:{value:1}},transparent:true,blending:T.AdditiveBlending,depthWrite:false,vertexColors:true,vertexShader:`
attribute float fade;varying vec3 tint;varying float opacity;uniform vec3 uHead;uniform float uDPR;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){float t=position.x,dust=${mode===2?'1.':'0.'};vec3 outward=normalize(uHead),side=normalize(cross(outward,vec3(0.,1.,0.)));
vec3 p=uHead+outward*t*(7.-dust*1.8)+side*(position.y*(.05+t*.55)+dust*t*t*1.8)+vec3(0.,position.z*(.04+t*.25),0.);
tint=color;opacity=fade;gl_PointSize=uDPR*(t<.001?9.:mix(3.2,1.2,t));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
#include <logdepthbuf_vertex>
}`,fragmentShader:`
varying vec3 tint;varying float opacity;uniform float uOpacity;
#include <common>
#include <logdepthbuf_pars_fragment>
void main(){float r=length(gl_PointCoord*2.-1.);if(r>1.)discard;gl_FragColor=vec4(tint,opacity*uOpacity*exp(-r*r*3.5)*(1.-smoothstep(.6,1.,r)));
#include <logdepthbuf_fragment>
${output}
}`});}
