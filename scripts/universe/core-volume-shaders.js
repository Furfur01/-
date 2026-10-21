// Optical integration adapted from the user-supplied azure-rift-nebula.html.
// RGBA stores gas extinction, dust extinction, emission and violet mix.
export const fullscreenVertex=`
varying vec2 vUv;
void main(){vUv=position.xy*.5+.5;gl_Position=vec4(position.xy,0.,1.);}`;

export const volumeFragment=`
precision highp sampler3D;
varying vec2 vUv;
layout(location=0) out vec4 fogResult;
layout(location=1) out vec4 frontResult;
uniform sampler3D tDensity,tNoise;
uniform sampler2D tDepth,tBlackHoleDepth;
uniform mat4 uInvProjection,uCameraWorld;
uniform vec3 uCamera;
uniform vec3 uShape;
uniform vec4 uCut,uFlash,uLens,uBurst;
uniform vec3 uBurstDirection;
uniform float uBurstLength,uBurstAge;
uniform float uTime,uFrame,uReveal,uFar,uBlackHoleViewDepth;
const vec3 center=vec3(7.,2.,-2.);
const vec3 boxMin=vec3(-38.,-24.,-24.);
const vec3 boxSize=vec3(76.,48.,48.);
const float worldScale=2400.;
float noise3(vec3 p){return texture(tNoise,p).r;}
float cutMask(vec3 p){
 vec3 q=p-center;
 float side=smoothstep(-.25,.25,q.y*uCut.w);
 float wedge=smoothstep(uShape.z-.025,uShape.z+.025,dot(q.xz,uCut.yz)/max(length(q.xz),.001));
 float boundary=1.-smoothstep(uShape.x*.98,uShape.x,length(q/vec3(1.,uShape.y,1.)));
 return 1.-uCut.x*side*wedge*boundary*.965;
}
vec4 densityAt(vec3 p){
 // Slow coherent advection, not independent screen-space flicker.
 vec3 flow=vec3(sin(p.z*.13+uTime*.045),cos(p.x*.11-uTime*.031),sin(p.y*.17+uTime*.038))*.36;
 vec3 uv=(p+flow-boxMin)/boxSize;
 vec4 f=texture(tDensity,uv);
 float edge=smoothstep(0.,.035,min(min(min(uv.x,uv.y),uv.z),min(min(1.-uv.x,1.-uv.y),1.-uv.z)));
 f.rgb*=edge*cutMask(p);return f;
}
vec2 intersection(vec3 ro,vec3 rd){
 vec3 safe=mix(vec3(-1.),vec3(1.),greaterThanEqual(rd,vec3(0.)))*max(abs(rd),vec3(.000001));
 vec3 a=(boxMin-ro)/safe,b=(boxMin+boxSize-ro)/safe,mn=min(a,b),mx=max(a,b);
 return vec2(max(max(mn.x,mn.y),mn.z),min(min(mx.x,mx.y),mx.z));
}
void main(){
 vec4 rayView=uInvProjection*vec4(vUv*2.-1.,1.,1.);
 vec3 viewRay=normalize(rayView.xyz/rayView.w);
 vec3 rd=normalize((uCameraWorld*vec4(viewRay,0.)).xyz);
 vec2 hit=intersection(uCamera,rd);float start=max(hit.x,0.),finish=hit.y;
 float depth=texture2D(tDepth,vUv).r;
 if(depth<.999999){float viewDepth=exp2(depth*log2(uFar+1.))-1.;finish=min(finish,viewDepth/max(.001,-viewRay.z)/worldScale);}
 float holeDepth=texture2D(tBlackHoleDepth,vUv).r;
 float holeViewDepth=holeDepth<.999999?exp2(holeDepth*log2(uFar+1.))-1.:uBlackHoleViewDepth;
 float holeTravel=holeViewDepth/max(.001,-viewRay.z)/worldScale;
 frontResult=vec4(0.,0.,0.,1.);
 if(finish<=start){fogResult=frontResult;return;}
 float stepSize=(finish-start)/144.;
 float jitter=fract(52.9829189*fract(dot(gl_FragCoord.xy+vec2(uFrame*17.13,uFrame*3.71),vec2(.06711056,.00583715))));
 float travel=start+jitter*stepSize,transmission=1.;vec3 radiance=vec3(0.);
 for(int i=0;i<144;i++){
  if(transmission<.007)break;
  vec3 p=uCamera+rd*travel;vec4 f=densityAt(p);
  float fine=noise3(p*.021+vec3(0.,uTime*.0006,0.)),detail=noise3(p*.079);
  float gas=f.r*(.72+fine*.48),dust=f.g*(.68+fine*.44+detail*.17),emissive=f.b*(.7+fine*.6);
  vec3 cavity=(p-vec3(7.,3.,-2.))/vec3(10.5,6.7,15.);
  dust*=1.-exp(-dot(cavity,cavity)*1.8)*.88;
  float extinction=(gas*.105+dust*.77)*uReveal;
  vec3 ldir=normalize(vec3(10.,8.,-12.)-p);
  vec4 l1=densityAt(p+ldir*.9),l2=densityAt(p+ldir*2.9);
  float shadow=exp(-l1.g*2.6-l2.g*3.5-l2.r*.35),selfLight=exp(-dust*3.2);
  vec3 gasColor=mix(vec3(.055,.36,.77),vec3(.47,.115,.63),smoothstep(.12,.91,f.a));
  float rim=pow(max(0.,emissive-dust*.16-.025),1.15);
  vec3 light=gasColor*(emissive*.19*(.24+.76*shadow)+gas*.008);
  light+=mix(vec3(.12,.75,1.08),vec3(.82,.24,.95),f.a)*rim*.21*selfLight*(.14+.86*shadow);
  light+=gasColor*dust*.009*(.10+shadow);
  light+=vec3(.73,.39,.19)*gas*exp(-length(p-center)*.20)*shadow*.075;
  vec3 excitation=(p-center)/vec3(24.,18.,22.);light*=.42+.98*exp(-dot(excitation,excitation));
  // Each transient only illuminates neighbouring gas. No full-screen exposure pulse.
  float flashDistance=length(p-uFlash.xyz),lensDistance=length(p-uLens.xyz);
  float flash=uFlash.w*(exp(-flashDistance*flashDistance*.16)*gas*.9+exp(-flashDistance*flashDistance*14.)*3.);
  light+=vec3(.40,.78,1.3)*flash*cutMask(p);
  float lensRing=exp(-pow((lensDistance-3.)/.85,2.))*uLens.w;
  light+=vec3(.25,.56,.95)*lensRing*(gas*.42+emissive*.16);
  vec3 beamDelta=p-uBurst.xyz;float along=dot(beamDelta,uBurstDirection);
  float beamRadius=length(beamDelta-uBurstDirection*along);
  float front=1.-smoothstep(uBurstLength*.85,max(.001,uBurstLength),abs(along));
  float burstFlash=exp(-pow((uBurstAge-.17)/.055,2.));
  float beam=exp(-beamRadius*beamRadius/5.)*gas*front*uBurst.w;
  float source=exp(-dot(beamDelta,beamDelta)*.10)*gas*(.2+burstFlash*2.)*uBurst.w;
  light+=vec3(.36,.48,1.25)*(beam*.9+source)*cutMask(p);
  light*=uReveal;
  float attenuation=exp(-extinction*stepSize),integral=extinction>.0001?(1.-attenuation)/extinction:stepSize;
  // Save the foreground prefix without a second march. Only the step crossing
  // the disc needs a partial integral; whole foreground steps reuse the result.
  float frontStep=clamp(holeTravel-(start+float(i)*stepSize),0.,stepSize);
  if(frontStep==stepSize)frontResult=vec4(radiance+transmission*light*integral,transmission*attenuation);
  else if(frontStep>0.){
   float frontAttenuation=exp(-extinction*frontStep),frontIntegral=extinction>.0001?(1.-frontAttenuation)/extinction:frontStep;
   frontResult=vec4(radiance+transmission*light*frontIntegral,transmission*frontAttenuation);
  }
  radiance+=transmission*light*integral;transmission*=attenuation;travel+=stepSize;
 }
 fogResult=vec4(radiance,transmission);
}`;

export const temporalFragment=`varying vec2 vUv;uniform sampler2D tCurrent,tHistory,tFrontCurrent,tFrontHistory;uniform float uHistory;
layout(location=0) out vec4 fogResult;
layout(location=1) out vec4 frontResult;
void main(){fogResult=mix(texture2D(tCurrent,vUv),texture2D(tHistory,vUv),uHistory);frontResult=mix(texture2D(tFrontCurrent,vUv),texture2D(tFrontHistory,vUv),uHistory);}`;

export const compositeFragment=`
varying vec2 vUv;uniform sampler2D tScene,tSceneDepth,tVolume,tFrontVolume,tBlackHole,tBlackHoleDepth,tBlackHoleLens;uniform vec4 uLensScreen;uniform float uAspect;
vec3 background(vec2 uv){
 vec4 fog=texture2D(tVolume,uv),front=texture2D(tFrontVolume,uv);
 return (max(vec3(0.),fog.rgb-front.rgb)+texture2D(tScene,uv).rgb*fog.a)/max(.001,front.a);
}
vec3 total(vec2 uv){
 vec4 front=texture2D(tFrontVolume,uv),hole=texture2D(tBlackHole,uv),lens=texture2D(tBlackHoleLens,uv);
 float holeDepth=texture2D(tBlackHoleDepth,uv).r;
 if(holeDepth>texture2D(tSceneDepth,uv).r){hole=vec4(0.);lens=vec4(0.);}
 vec2 source=uv+lens.xy;
 // A screen-space lens cannot sample outside the rendered background. Fade
 // displacement at the viewport boundary instead of stretching its last texel.
 float margin=min(min(source.x,source.y),min(1.-source.x,1.-source.y));
 float weight=smoothstep(0.,.035,margin)*step(.001,lens.z);
 source=clamp(source,vec2(.001),vec2(.999));
 if(texture2D(tSceneDepth,source).r<holeDepth)weight=0.;
 vec3 behind=mix(background(uv),background(source),weight);
 // Only background light bends. Foreground fog and the traced disc stay put.
 return front.rgb+front.a*(hole.rgb+(1.-hole.a)*behind);
}
void main(){
 vec2 delta=(vUv-uLensScreen.xy)*vec2(uAspect,1.);float radius=uLensScreen.z;
 float r=length(delta)/max(radius,.00001);
 float bend=uLensScreen.w*.35*exp(-pow((r-.95)/.65,2.));
 vec2 uv=clamp(vUv-delta/vec2(uAspect,1.)*bend,vec2(.001),vec2(.999));
 vec3 color=total(uv);
 float arc=exp(-pow((r-1.)/.085,2.))*uLensScreen.w;
 color+=total(clamp(uv+delta/vec2(uAspect,1.)*.08,vec2(.001),vec2(.999)))*arc*.45;
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
