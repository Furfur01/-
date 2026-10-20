import * as T from 'three';
import {PLANET_QUALITY,qualityName} from './planet-profile.js';
import {tangentFrame} from './terrain.js';

const NOISE=`float hash3(vec3 p){p=fract(p*.3183099+.1)*17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float s=0.,a=.55;for(int i=0;i<4;i++){s+=a*noise3(p);p=p*2.07+1.3;a*=.48;}return s;}
vec3 rotateY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,c*p.z-s*p.x);}`;
const VERTEX=`varying vec3 vLocal,vWorld,vNormalWorld;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vLocal=normalize(position);vNormalWorld=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(position,1.);vWorld=world.xyz;vec4 mvPosition=viewMatrix*world;gl_Position=projectionMatrix*mvPosition;
#include <logdepthbuf_vertex>
}`;
const TERRAIN_VERTEX=`attribute vec4 terrainData;attribute vec3 landform,coarsePosition;uniform float lodBlend,radius,patchExtentRatio;uniform vec3 patchNormal,patchRight,patchForward;varying vec3 vLocal,vWorld,vNormalWorld,vRegions;varying vec4 vSurface;varying float vHeight;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vec3 N=normalize(position);float blend=lodBlend;if(patchExtentRatio>0.){float edge=max(abs(dot(N,patchRight)),abs(dot(N,patchForward)))/(max(.001,dot(N,patchNormal))*patchExtentRatio);blend*=1.-smoothstep(.72,.995,edge);}vec3 p=mix(coarsePosition,position,blend);vLocal=N;vHeight=length(position)/radius-1.;vSurface=terrainData;vRegions=landform;vNormalWorld=normalize(mat3(modelMatrix)*normal);vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;vec4 mvPosition=viewMatrix*world;gl_Position=projectionMatrix*mvPosition;
#include <logdepthbuf_vertex>
}`;
const HEADER=`varying vec3 vLocal,vWorld,vNormalWorld;uniform vec3 sunDir,lowColor,highColor,cloudColor,atmosphereColor,rockColor,accentColor,fieldOffset;uniform float radius,time,biomeCode,groundDetail,opacity,atmosphere;
#include <common>
#include <logdepthbuf_pars_fragment>
${NOISE}`;
const FOOTER=`
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const LIGHT=`vec3 W=normalize(vNormalWorld),V=normalize(cameraPosition-vWorld);float light=dot(W,sunDir);float daylight=smoothstep(-.12,.65,light);`;
export function addProfileUniforms(uniforms,profile,radius){
  const c=profile.palette;Object.assign(uniforms,{radius:{value:radius},time:{value:0},biomeCode:{value:['terrestrial','mercury','mars','gas'].indexOf(profile.biome)},fieldOffset:{value:new T.Vector3(...profile.fields[0].offset)},rockColor:{value:new T.Color(...c[2])},accentColor:{value:new T.Color(...c[3])},lodBlend:{value:1}});
  uniforms.lowColor.value.setRGB(...c[0]);uniforms.highColor.value.setRGB(...c[1]);uniforms.cloudColor.value.setRGB(...c[3]);uniforms.atmosphereColor.value.setRGB(...c[4]);
}
export function makeTerrainMaterial(uniforms){return new T.ShaderMaterial({name:'planet-geological-surface',uniforms,vertexShader:TERRAIN_VERTEX,fragmentShader:`${HEADER}
varying vec3 vRegions;varying vec4 vSurface;varying float vHeight;uniform vec3 patchNormal,patchRight,patchForward;uniform float patchExtentRatio;
void main(){
#include <logdepthbuf_fragment>
${LIGHT}
vec3 N=normalize(vLocal);float micro=noise3(N*250.+fieldOffset),grain=noise3(N*1900.+fieldOffset);vec3 color=mix(highColor,rockColor,clamp(vRegions.y*.65+vHeight*8.,0.,1.));vec3 emission=vec3(0.);
if(biomeCode<.5){color=mix(rockColor,highColor,smoothstep(.28,.65,vSurface.x));color=mix(color,accentColor,vSurface.w);float coast=1.-smoothstep(.0002,.0018,abs(vHeight+.004));emission=vec3(.025,.25,.22)*coast*vRegions.z*.16;}
else if(biomeCode<1.5){color=mix(lowColor,rockColor,clamp(vHeight*7.+.16+vRegions.y*.18,0.,1.));float cracks=smoothstep(.63,.95,vSurface.y)*(.65+micro*.35);emission=vec3(1.,.13,.012)*cracks*.55;}
else {color=mix(highColor,rockColor,vRegions.y*.7+vRegions.x*.2);float crystal=smoothstep(.15,.7,vSurface.z);color=mix(color,accentColor,crystal*.65);emission=accentColor*crystal*.32;float strata=.91+.09*sin(vHeight*700.);color*=strata;}
color*=mix(.95+micro*.1,.78+micro*.27+grain*.12,groundDetail);
float cloudShadow=biomeCode<.5?1.-smoothstep(.55,.75,fbm(rotateY(N,time*.005)*7.+fieldOffset))*.15:1.;
vec3 col=color*(.055+daylight*.98)*cloudShadow+emission;float alpha=opacity;
if(patchExtentRatio>0.){float edge=max(abs(dot(N,patchRight)),abs(dot(N,patchForward)))/(max(.001,dot(N,patchNormal))*patchExtentRatio);alpha*=1.-smoothstep(.72,.995,edge);if(alpha<.001)discard;}
gl_FragColor=vec4(col,alpha);${FOOTER}`});}

export function makeLiquidMaterial(uniforms,lava=false){return new T.ShaderMaterial({name:lava?'planet-lava':'planet-ocean',uniforms,vertexShader:VERTEX,fragmentShader:`${HEADER}
void main(){
#include <logdepthbuf_fragment>
${LIGHT}
vec3 N=normalize(vLocal);float waves=fbm(N*mix(22.,95.,groundDetail)+fieldOffset+vec3(time*.025,0,0));
${lava?`float crust=smoothstep(.39,.68,waves);vec3 col=mix(vec3(1.25,.15,.008),vec3(.13,.018,.009),crust);col*=.7+daylight*.25;`:`vec3 color=mix(lowColor,vec3(.015,.19,.25),waves*.42);vec3 H=normalize(sunDir+V);float spec=pow(max(dot(W,H),0.),110.)*daylight;vec3 col=color*(.055+daylight*.85)+vec3(.8,.86,.9)*spec*.65;`}
gl_FragColor=vec4(col,1.);${FOOTER}`});}

const WEATHER=`uniform vec4 stormCenters[6],stormMotion[6];uniform int stormCount;uniform float bandCount,windSpeed,windWarp,weatherPhase,layer;
vec4 weather(vec3 N){
 vec3 advect=rotateY(N,time*windSpeed*(sin(N.y*bandCount*1.7)*.7+.3)+layer*.013);
 float turbulence=fbm(advect*9.+fieldOffset),latitude=N.y+(turbulence-.5)*windWarp;
 float band=.5+.5*sin(latitude*bandCount*3.14159265+weatherPhase);
 float filaments=fbm(advect*vec3(25.,65.,25.)+fieldOffset+turbulence*2.);
 float density=clamp(band*.64+filaments*.48,0.,1.);float eye=0.,wall=0.,swirl=0.;
 for(int i=0;i<6;i++){if(i>=stormCount)break;vec3 C=rotateY(stormCenters[i].xyz,time*stormMotion[i].y);float radius=stormCenters[i].w;
  if(dot(N,C)>1.-radius*radius*2.5){vec3 R=normalize(cross(abs(C.y)>.96?vec3(1,0,0):vec3(0,1,0),C)),F=cross(C,R);vec2 q=vec2(dot(N,R)*.78,dot(N,F))/radius;float r=length(q),mask=1.-smoothstep(.75,1.5,r);float angle=atan(q.y,q.x),twist=4.5*exp(-r*r*.8)+time*stormMotion[i].x;vec2 flow=mat2(cos(twist),-sin(twist),sin(twist),cos(twist))*q;float vapor=fbm(vec3(flow*6.,layer*.13)+fieldOffset);float arm=.5+.5*sin(angle*2.-r*11.+time*stormMotion[i].x+vapor*5.);float e=exp(-r*r*45.),w=exp(-pow((r-.34)*6.,2.));density=mix(density,.22+vapor*.5+arm*.13+w*.19-e*.15,mask);eye=max(eye,e*mask);wall=max(wall,w*mask);swirl=max(swirl,mask*stormMotion[i].z);}
 }
 if(groundDetail>.01)density+=(fbm(advect*150.+fieldOffset)-.5)*.16*groundDetail;
 return vec4(density,eye,wall,swirl);
}`;
export function addWeatherUniforms(uniforms,profile){const w=profile.weather;Object.assign(uniforms,{stormCenters:{value:Array.from({length:6},(_,i)=>new T.Vector4(...(w.storms[i]?.center||[0,1,0]),w.storms[i]?.radius||.1))},stormMotion:{value:Array.from({length:6},(_,i)=>{const s=w.storms[i];return new T.Vector4(s?.spin||0,s?.drift||0,s?.strength||0,0);})},stormCount:{value:w.storms.length},bandCount:{value:w.bands},windSpeed:{value:w.speed},windWarp:{value:w.warp},weatherPhase:{value:w.phase},layer:{value:0}});}
export function makeGasMaterial(uniforms,{layer=0}={}){const local={...uniforms,layer:{value:layer}};return new T.ShaderMaterial({name:layer?'gas-upper-clouds':'gas-cloud-deck',uniforms:local,vertexShader:VERTEX,transparent:layer>0,depthWrite:layer===0,side:layer?T.DoubleSide:T.FrontSide,fragmentShader:`${HEADER}
${WEATHER}
void main(){
#include <logdepthbuf_fragment>
${LIGHT}
vec4 w=weather(normalize(vLocal));vec3 color=mix(lowColor,highColor,smoothstep(.14,.53,w.x));color=mix(color,rockColor,smoothstep(.47,.77,w.x));color=mix(color,cloudColor,smoothstep(.68,.9,w.x)*.8+w.z*.35);color=mix(color,highColor*.55,w.w*.2);color*=1.-w.y*.68;
float shadow=layer>0.?1.:.82+.18*w.x;vec3 col=color*(.04+daylight*1.1)*shadow;float alpha=layer>0.?smoothstep(.5,.78,w.x)*.22:1.;
float flash=pow(max(0.,sin(time*1.7+weatherPhase)),55.)*w.z*w.w;col+=vec3(.5,.65,1.)*flash*.12*(1.-daylight);
gl_FragColor=vec4(col,alpha);${FOOTER}`});}
function makeThinClouds(uniforms){return new T.ShaderMaterial({name:'planet-thin-clouds',uniforms,vertexShader:VERTEX,transparent:true,depthWrite:false,side:T.DoubleSide,fragmentShader:`${HEADER}
void main(){
#include <logdepthbuf_fragment>
${LIGHT}
vec3 N=rotateY(normalize(vLocal),time*.005);float density=fbm(N*8.+fieldOffset);float alpha=smoothstep(.53,.74,density)*.55;gl_FragColor=vec4(vec3(.68,.78,.85)*(.07+daylight),alpha);${FOOTER}`});}

function makeVolume(uniforms,storm,radius){
 const material=new T.ShaderMaterial({name:'gas-local-volume',uniforms:{...uniforms,eyeBox:{value:new T.Vector3()},clearCenter:{value:new T.Vector3(1e6,1e6,1e6)},clearRadius:{value:1},boxScale:{value:new T.Vector3()},volumeLight:{value:1},volumePhase:{value:storm.spin}},transparent:true,depthWrite:false,side:T.BackSide,vertexShader:`varying vec3 vBox;
#include <common>
#include <logdepthbuf_pars_vertex>
void main(){vBox=position;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
#include <logdepthbuf_vertex>
}`,fragmentShader:`varying vec3 vBox;uniform vec3 eyeBox,cloudColor,highColor,clearCenter,boxScale;uniform float time,volumePhase,volumeLight,clearRadius;
#include <common>
#include <logdepthbuf_pars_fragment>
${NOISE}
void main(){
#include <logdepthbuf_fragment>
vec3 ray=normalize(vBox-eyeBox),inv=1./(ray+vec3(.000001));vec3 t0=(-vec3(1.)-eyeBox)*inv,t1=(vec3(1.)-eyeBox)*inv;vec3 lo=min(t0,t1),hi=max(t0,t1);float start=max(0.,max(lo.x,max(lo.y,lo.z))),end=min(hi.x,min(hi.y,hi.z));if(end<=start)discard;float stepSize=(end-start)/20.;vec4 sum=vec4(0.);
for(int i=0;i<20;i++){vec3 p=eyeBox+ray*(start+(float(i)+.5)*stepSize);float r=length(p.xz);float height=p.y+r*r*.8;float edge=(1.-smoothstep(.65,.98,r))*(1.-smoothstep(.5,.95,abs(height)));float arm=.5+.5*sin(atan(p.z,p.x)*3.-r*16.+time*volumePhase);float density=smoothstep(.35,.7,fbm(p*6.+vec3(time*.02,0,0)))*edge*arm*smoothstep(0.,clearRadius,length((p-clearCenter)*boxScale));float a=1.-exp(-density*stepSize*2.);vec3 c=mix(highColor,cloudColor,clamp(height*.4+.6,0.,1.))*volumeLight;sum.rgb+=(1.-sum.a)*a*c;sum.a+=(1.-sum.a)*a;}
if(sum.a<.002)discard;gl_FragColor=vec4(sum.rgb/max(.001,sum.a),sum.a*.65);${FOOTER}`});
 const mesh=new T.Mesh(new T.BoxGeometry(2,2,2),material),frame=tangentFrame(storm.center);mesh.name='local-storm-volume';mesh.position.fromArray(storm.center).multiplyScalar(radius*1.002);mesh.scale.set(radius*storm.radius,radius*.055,radius*storm.radius);mesh.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(new T.Vector3(...frame.right),new T.Vector3(...frame.normal),new T.Vector3(...frame.forward).negate()));mesh.userData.basePosition=mesh.position.clone();mesh.userData.baseQuaternion=mesh.quaternion.clone();mesh.userData.drift=storm.drift;material.uniforms.boxScale.value.copy(mesh.scale);mesh.renderOrder=2;return mesh;
}
export function createPlanetWeather(profile,uniforms,radius,quality='standard'){
 const root=new T.Group();root.name='planet-weather';const shells=[],volumes=[],gas=profile.biome==='gas';let selected=qualityName(quality);
 if(gas){for(let i=1;i<3;i++){const mesh=new T.Mesh(new T.SphereGeometry(radius*(1+i*.0007),128,80),makeGasMaterial(uniforms,{layer:i}));mesh.name=`gas-cloud-layer-${i}`;root.add(mesh);shells.push(mesh);}for(const s of profile.weather.storms.slice(0,2)){const volume=makeVolume(uniforms,s,radius);root.add(volume);volumes.push(volume);}}
 else if(profile.biome==='terrestrial'){const mesh=new T.Mesh(new T.SphereGeometry(radius*1.065,64,40),makeThinClouds(uniforms));mesh.name='continental-clouds';root.add(mesh);shells.push(mesh);}
 const inverse=new T.Matrix4(),local=new T.Vector3(),up=new T.Vector3(0,1,0),rotation=new T.Quaternion();
 return {root,setQuality(q){selected=qualityName(q);},update({eyeLocal,projectedRadius=1000,time=0,clearSite}){uniforms.time.value=time;const q=PLANET_QUALITY[selected];shells.forEach((mesh,i)=>mesh.visible=projectedRadius>60&&(!gas||i<q.cloudLayers-1));volumes.forEach((mesh,i)=>{mesh.visible=projectedRadius>180&&i<q.volumes;if(mesh.visible){rotation.setFromAxisAngle(up,time*mesh.userData.drift);mesh.position.copy(mesh.userData.basePosition).applyQuaternion(rotation);mesh.quaternion.copy(rotation).multiply(mesh.userData.baseQuaternion);mesh.updateMatrix();mesh.updateWorldMatrix(true,false);inverse.copy(mesh.matrix).invert();const u=mesh.material.uniforms;u.eyeBox.value.copy(local.copy(eyeLocal).applyMatrix4(inverse));u.volumeLight.value=.06+Math.max(0,local.copy(up).transformDirection(mesh.matrixWorld).dot(uniforms.sunDir.value));if(clearSite){u.clearCenter.value.fromArray(clearSite.position).applyMatrix4(inverse);u.clearRadius.value=clearSite.footprint*3;}else u.clearCenter.value.setScalar(1e6);}});},get stats(){return {cloudLayers:gas?1+shells.filter(m=>m.visible).length:shells.filter(m=>m.visible).length,volumes:volumes.filter(m=>m.visible).length,storms:gas?profile.weather.storms.length:0};},dispose(){for(const mesh of [...shells,...volumes]){mesh.geometry.dispose();mesh.material.dispose();}root.clear();}};
}
