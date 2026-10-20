import {coverageUniforms,constructionCoverageGLSL} from '../construction-coverage.js';
export const noiseGLSL = `
float hash31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){return .55*noise3(p)+.27*noise3(p*2.03+9.)+.13*noise3(p*4.11-7.)+.05*noise3(p*8.21);}
`;
const vertex=`
#include <common>
#include <logdepthbuf_pars_vertex>
attribute vec3 aCoarse;attribute vec3 aCoarseNormal;attribute vec4 aEdge;attribute vec2 aHints;
uniform vec3 uOrigin;uniform float uMorph;uniform vec4 uEdges;
varying vec3 vP;varying vec3 vN;varying vec3 vColor;varying vec2 vHints;
void main(){
 vec4 e=aEdge*uEdges;float m=max(1.-uMorph,max(max(e.x,e.y),max(e.z,e.w)));
 vec3 p=mix(position,aCoarse,m);vP=p+uOrigin;vN=mix(normal,aCoarseNormal,m);vColor=color;vHints=aHints;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 #include <logdepthbuf_vertex>
}`;
export function createTerrainMaterial(THREE,type,radius,coverage){
  return new THREE.ShaderMaterial({vertexColors:true,uniforms:{...(coverage?.uniforms||coverageUniforms(THREE)),uOrigin:{value:new THREE.Vector3()},uMorph:{value:1},uEdges:{value:new THREE.Vector4()},uRadius:{value:radius},uSun:{value:new THREE.Vector3(.5,.5,1).normalize()},uEye:{value:new THREE.Vector3()},uTime:{value:0},uType:{value:type==='terrestrial'?0:type==='mercury'?1:2}},vertexShader:vertex,fragmentShader:`
 #include <common>
 #include <logdepthbuf_pars_fragment>
 uniform float uRadius,uTime;uniform int uType;uniform vec3 uSun,uEye;
 varying vec3 vP,vN,vColor;varying vec2 vHints;
 ${noiseGLSL}
 ${constructionCoverageGLSL}
 void main(){
  #include <logdepthbuf_fragment>
  if(coveredByConstruction(vP))discard;
  vec3 p=vP/uRadius;vec3 radial=normalize(p),n=normalize(vN),view=normalize(uEye-vP);
  float dist=length(uEye-vP)/uRadius,nearby=1.-smoothstep(.015,.25,dist);
  vec3 geo=normalize(cross(dFdx(vP),dFdy(vP)));if(dot(geo,radial)<0.)geo=-geo;
  n=geo;vec3 albedo=vColor;
  float slope=1.-clamp(dot(n,radial),0.,1.);
  float day=smoothstep(-.03,.06,dot(radial,uSun));float ndl=max(0.,dot(n,uSun))*day,global=max(0.,dot(radial,uSun));
  float ambient=(uType==0?.27:uType==2?.22:.24)*mix(2.1,1.,day);
  float sky=.45+.55*clamp(dot(n,radial),0.,1.);
  vec3 lit=albedo*(vec3(.47,.59,.78)*ambient*sky+vec3(1.09,1.01,.88)*(ndl*1.30+global*sky*.065));
  lit*=1.-.15*slope;
  if(uType==1){float spec=pow(max(0.,dot(n,normalize(uSun+view))),48.);lit+=vec3(.36,.40,.48)*spec*.15*global;lit+=vec3(.80,.052,.002)*vHints.x*.24;}
  if(uType==2)lit+=vec3(.012,.18,.46)*pow(clamp(vHints.y,0.,1.),2.)*.55;
  vec3 haze=uType==0?vec3(.16,.29,.48):(uType==2?vec3(.38,.18,.105):vec3(.085,.055,.040));
  float fog=length(uEye)/uRadius<1.16?(1.-exp(-dist*(uType==0?1.8:uType==2?.8:.12)))*.38:(uType==0?.035:uType==2?.018:.002);
  fog+=pow(1.-max(0.,dot(radial,view)),3.)*(uType==0?.095:.025);
  lit=mix(lit,haze*(.10+global*.72),fog);
  gl_FragColor=vec4(lit,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
}
export function createLiquidMaterial(THREE,type,radius,coverage){
 const lava=type==='mercury';
 return new THREE.ShaderMaterial({transparent:false,depthWrite:true,uniforms:{...(coverage?.uniforms||coverageUniforms(THREE)),uOrigin:{value:new THREE.Vector3()},uMorph:{value:1},uEdges:{value:new THREE.Vector4()},uRadius:{value:radius},uSun:{value:new THREE.Vector3(.5,.5,1).normalize()},uEye:{value:new THREE.Vector3()},uTime:{value:0},uLava:{value:lava?1:0}},vertexShader:`
 #include <common>
 #include <logdepthbuf_pars_vertex>
 attribute vec3 aCoarse;attribute vec4 aEdge;attribute vec2 aHints;
 uniform vec3 uOrigin;uniform float uMorph;uniform vec4 uEdges;
 varying vec3 vP;varying vec2 vHints;
 void main(){vec4 e=aEdge*uEdges;float m=max(1.-uMorph,max(max(e.x,e.y),max(e.z,e.w)));vec3 p=mix(position,aCoarse,m);vP=p+uOrigin;vHints=aHints;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
 #include <logdepthbuf_vertex>
 }`,fragmentShader:`
 #include <common>
 #include <logdepthbuf_pars_fragment>
 uniform float uRadius,uTime;uniform int uLava;uniform vec3 uSun,uEye;varying vec3 vP;varying vec2 vHints;
 ${noiseGLSL}
 ${constructionCoverageGLSL}
 void main(){
 #include <logdepthbuf_fragment>
  if(coveredByConstruction(vP))discard;
 if(uLava==1 && vHints.x<.1)discard;
 vec3 p=vP/uRadius,n=normalize(p),view=normalize(uEye-vP);float dist=length(uEye-vP)/uRadius;
 float small=1.-smoothstep(.012,.30,dist),wave=.5;
 vec3 tangent=normalize(cross(n,vec3(.12,1.,.11))),bitangent=cross(n,tangent);
 vec3 wn=normalize(n+small*(tangent*sin(dot(p,vec3(2240.,1250.,1710.))+uTime*1.6)+bitangent*sin(dot(p,vec3(-1590.,1980.,1120.))-uTime*1.1))*.008);
 float day=smoothstep(-.03,.06,dot(n,uSun));float sun=max(0.,dot(wn,uSun))*day,spec=pow(max(0.,dot(wn,normalize(uSun+view))),240.)*day;
 vec3 col;
 if(uLava==0){
   float shallow=1.-smoothstep(.00005,.004,vHints.y);vec3 base=mix(vec3(.014,.13,.27),vec3(.04,.43,.40),shallow);
   col=base*(.16+sun*.91);float fres=pow(1.-max(0.,dot(wn,view)),4.);col+=vec3(.15,.24,.34)*fres*(.14+sun*.18);col+=vec3(.28,.41,.44)*spec*.08;
   col+=vec3(.012,.09,.075)*shallow*pow(wave,4.)*small;
 }else{
   vec3 drift=vec3(uTime*.004,-uTime*.002,uTime*.003);
   vec3 warp=vec3(fbm(p*9.+drift),fbm(p*9.+17.-drift),fbm(p*9.-8.+drift));
   float flow=fbm(p*21.+warp*2.+drift),plates=noise3(p*43.+warp*4.);
   float aa=max(.002,fwidth(plates));
   float filamentDistance=abs(plates-.48);
   float filaments=1.-smoothstep(.003,.016+aa,filamentDistance);
   float crust=smoothstep(.54,.66,flow)*(1.-filaments*.75);
   vec3 molten=mix(vec3(.30,.004,.0004),vec3(.95,.046,.001),smoothstep(.28,.70,flow));
   molten+=vec3(1.55,.32,.008)*filaments*(.22+.58*smoothstep(.35,.65,flow));
   col=mix(molten,vec3(.018,.012,.013)*(.40+sun),crust*.93);
   float footprint=max(length(dFdx(p)),length(dFdy(p)));
   float nearFlow=(1.-smoothstep(.14,.65,dist))*(1.-smoothstep(.0005,.002,footprint));
   if(nearFlow>.01){
     float grain=fbm(p*520.+warp*9.+drift*3.);
     float fissure=1.-smoothstep(.008,.028+fwidth(grain),abs(grain-.48));
     float raft=smoothstep(.49,.64,grain)*(1.-filaments*.65);
     col=mix(col,col*.20+vec3(.014,.007,.005),raft*nearFlow*.78);
     col+=vec3(.62,.076,.001)*fissure*nearFlow*(.2+.8*flow);
   }
 }
 gl_FragColor=vec4(col,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
}
