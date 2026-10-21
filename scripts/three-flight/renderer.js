import {areaBlastPhase} from './area-blast.js';
import {fortressConnections,fortressSocket,FORTRESS} from '../../game/fortress-layout.mjs';
import {createFortressGeometry,createFloatingPlatformGeometry} from './fortress-models.js';
import {fortressState} from '../../game/planet-defense.mjs';
import {Cabins} from './cabins.js';
import {FighterConsole,fighterDisplays,consolePoint} from './fighter-console.js';
import {cockpitClass} from '../../game/pilot-controls.mjs';
import {shipCabinClass} from '../../game/ship-cabins.mjs';
import {plumeEnvelope,plumeMeshData} from '../../game/ship-propulsion.mjs';
import {mainGunGlow} from '../../game/ship-main-effects.mjs';
import {speedFovOffset,smoothSpeedFov} from '../../game/flight-camera.mjs';
import {nearestHullPoint,addShieldHit} from '../../game/flight-scenes.mjs';
import {shieldEnvelope,shieldLocalPoint,shieldDirection} from '../../game/shield-envelope.mjs';
import {shieldRippleGLSL} from './effects/shield-ripple.js';
import {specialRingData,specialBlastPhase} from '../../game/special-combat.mjs';
import {jointTransforms} from '../../game/ship-turrets.mjs';
// Shared flight presentation. Geometry and visual calculations preserve the native baseline.
// GPU resources, batching, shaders, and submission are owned exclusively by Three.js.
import {ThreeRenderBackend,createGeometry} from './backend.js';
import {composeShipMatrix} from './ship-transform.js';
import {practiceTargetMatrix} from './practice-targeting.js';
import {EffectVertices,effectRibbon,effectBillboard,effectRing} from './effect-vertices.js';
import {BattleViewCulling,projectileInView} from './view-culling.js';
import {hullShadingGLSL} from './hull-shading.js';

export function createGalaxyRender(fleet, assets){
if(!fleet?.vertices||!fleet?.layouts)throw new Error('Flight fleet assets are required');
  const TAU = Math.PI * 2;
  const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
  const mix = (a,b,t) => a+(b-a)*t;
  const V = {
    add:(a,b)=>a.map((v,i)=>v+b[i]), sub:(a,b)=>a.map((v,i)=>v-b[i]),
    scale:(a,s)=>a.map(v=>v*s), dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
    cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
    length:a=>Math.hypot(...a),
    norm:a=>{let l=Math.hypot(...a)||1;return a.map(v=>v/l)}
  };
  const M = {
    identity:()=>new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
    mul:(a,b)=>{const c=new Float64Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)c[j*4+i]=a[i]*b[j*4]+a[4+i]*b[j*4+1]+a[8+i]*b[j*4+2]+a[12+i]*b[j*4+3];return c},
    translate:(x,y,z)=>new Float64Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]),
    scale:(x,y=x,z=x)=>new Float64Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]),
    rx:a=>{let c=Math.cos(a),s=Math.sin(a);return new Float64Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1])},
    ry:a=>{let c=Math.cos(a),s=Math.sin(a);return new Float64Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1])},
    rz:a=>{let c=Math.cos(a),s=Math.sin(a);return new Float64Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1])},
    compose:(pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>M.mul(M.translate(...pos),M.mul(M.ry(rot[1]),M.mul(M.rx(rot[0]),M.mul(M.rz(rot[2]),M.scale(...scale))))),
    transform:(m,p)=>[m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]],
    perspective:(fov,aspect,near,far,offset=0)=>{let f=1/Math.tan(fov/2),nf=1/(near-far);return new Float64Array([f/aspect,0,0,0,0,f,0,0,offset,0,(far+near)*nf,-1,0,0,2*far*near*nf,0])},
    lookAt:(eye,target,up=[0,1,0])=>{let z=V.norm(V.sub(eye,target)),x=V.norm(V.cross(up,z)),y=V.cross(z,x);return new Float64Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,eye),-V.dot(y,eye),-V.dot(z,eye),1])},
    camera:(pos,forward,up)=>{let z=V.scale(forward,-1),x=V.norm(V.cross(up,z)),y=V.cross(z,x);return new Float64Array([...x,0,...y,0,...z,0,...pos,1])}
  };
  function seeded(seed=123){return()=>{seed=(Math.imul(1664525,seed)+1013904223)|0;return(seed>>>0)/4294967296}}
  function rgb(hex){return[(hex>>16&255)/255,(hex>>8&255)/255,(hex&255)/255]}
  const C={hull:rgb(0xb5b4ab),light:rgb(0xd1d0c5),shade:rgb(0x828a8b),dark:rgb(0x26333a),inner:rgb(0x111d23),steel:rgb(0x5e6b6e),red:rgb(0x73423b),window:rgb(0xe2dbc1),blue:rgb(0x87cddf)};

  class Geometry {
    constructor(){this.data=[]}
    vertex(p,n,c,e,tag,uv){this.data.push(...p,...n,...c,e,tag,...uv)}
    tri(a,b,c,color=C.hull,emission=0,tag=0,normals=null,uvs=null){
      const n=V.norm(V.cross(V.sub(b,a),V.sub(c,a)));
      [a,b,c].forEach((p,i)=>this.vertex(p,normals?normals[i]:n,color,emission,tag,uvs?uvs[i]:[0,0]));return this;
    }
    quad(a,b,c,d,color,emission=0,tag=0){this.tri(a,b,c,color,emission,tag,null,[[0,0],[1,0],[1,1]]);this.tri(a,c,d,color,emission,tag,null,[[0,0],[1,1],[0,1]]);return this}
    box(size,pos,color=C.hull,tag=0,rotation=[0,0,0],emission=0){
      const [x,y,z]=size.map(n=>n/2),mat=M.compose(pos,rotation);
      const p=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]].map(p=>M.transform(mat,p));
      [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[0,1,5,4],[3,7,6,2]].forEach(f=>this.quad(...f.map(i=>p[i]),color,emission,tag));return this;
    }
    hull(sections,pos=[0,0,0],color=C.hull,tag=0){
      const rings=sections.map(([x,w,h])=>{const c=Math.min(w,h)*.20;return [[h/2,-w/2+c],[h/2,w/2-c],[h/2-c,w/2],[-h/2+c,w/2],[-h/2,w/2-c],[-h/2,-w/2+c],[-h/2+c,-w/2],[h/2-c,-w/2]].map(([y,z])=>[x+pos[0],y+pos[1],z+pos[2]])});
      for(let i=0;i<rings.length-1;i++)for(let j=0;j<8;j++){let k=(j+1)%8;this.quad(rings[i][j],rings[i][k],rings[i+1][k],rings[i+1][j],color,0,tag)}
      for(let i=1;i<7;i++){this.tri(rings[0][0],rings[0][i+1],rings[0][i],color,0,tag);let r=rings.at(-1);this.tri(r[0],r[i],r[i+1],color,0,tag)}return this;
    }
    chamfer(size,pos,color=C.hull,tag=0){let[x,y,z]=size,b=Math.min(x,y,z)*.18;return this.hull([[-x/2,z-b*2,y-b*2],[-x/2+b,z,y],[x/2-b,z,y],[x/2,z-b*2,y-b*2]],pos,color,tag)}
    cylinder(r,len,pos,color=C.steel,segments=14,tag=0,emission=0,r2=r){
      let [x,y,z]=pos;
      for(let i=0;i<segments;i++){let a=TAU*i/segments,b=TAU*(i+1)/segments;const p=[x-len/2,y+Math.sin(a)*r,z+Math.cos(a)*r],q=[x-len/2,y+Math.sin(b)*r,z+Math.cos(b)*r],s=[x+len/2,y+Math.sin(b)*r2,z+Math.cos(b)*r2],t=[x+len/2,y+Math.sin(a)*r2,z+Math.cos(a)*r2];this.quad(p,q,s,t,color,emission,tag);this.tri([x-len/2,y,z],q,p,color,emission,tag);this.tri([x+len/2,y,z],t,s,color,emission,tag)}return this;
    }
    beam(a,b,width,depth,color=C.dark){
      const dir=V.sub(b,a),len=V.length(dir),unit=V.norm(dir),ref=Math.abs(unit[1])>.95?[1,0,0]:[0,1,0],right=V.norm(V.cross(unit,ref)),up=V.cross(right,unit);
      const p=[];[a,b].forEach(p0=>[[-1,-1],[-1,1],[1,1],[1,-1]].forEach(([u,v])=>p.push(V.add(p0,V.add(V.scale(right,u*width/2),V.scale(up,v*depth/2))))));
      [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[3,7,4,0]].forEach(f=>this.quad(...f.map(i=>p[i]),color));return this;
    }
    sphere(radius=1,cols=56,rows=28){
      const point=(i,j)=>{let a=i/cols*TAU,b=j/rows*Math.PI;return[Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a)]};
      for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let n=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)],p=n.map(v=>V.scale(v,radius));this.tri(p[0],p[1],p[2],C.hull,0,0,[n[0],n[1],n[2]]);this.tri(p[0],p[2],p[3],C.hull,0,0,[n[0],n[2],n[3]])}return this;
    }
    upload(){return createGeometry(this.data); }
  }

const LAYOUTS=fleet.layouts;
  function axes(p){
    const forward=[Math.sin(p.yaw)*Math.cos(p.pitch),Math.sin(p.pitch),-Math.cos(p.yaw)*Math.cos(p.pitch)];
    const right0=V.norm(V.cross(forward,[0,1,0])),u=V.cross(right0,forward);
    const up=V.add(V.scale(u,Math.cos(p.roll)),V.scale(right0,Math.sin(p.roll)));
    return {forward,up,right:V.norm(V.cross(forward,up))};
  }
  function shipMatrix(p,index){return composeShipMatrix(p,LAYOUTS[index].scale);}

  function turretTransforms(model,turret,index){
    const scale=LAYOUTS[index].turretScale;
    const base=M.mul(model,M.mul(M.translate(...turret.mount),M.scale(scale)));
    const yaw=M.mul(base,M.ry(turret.yaw));
    const barrels=M.mul(yaw,M.mul(M.translate(0,.5,0),M.mul(M.rz(-turret.pitch),M.translate(turret.recoil||0,0,0))));
    return {base,yaw,barrels};
  }

  const vertexSource=`
    attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor;
    attribute float aEmission; attribute float aTag; attribute vec2 aUV;
    uniform mat4 uModel; uniform mat4 uVP; uniform float uShellOffset;
    varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vLocal;
    varying float vEmission; varying float vTag; varying vec2 vUV;
    void main(){vec4 world=uModel*vec4(aPosition+aNormal*uShellOffset,1.);vWorld=world.xyz;vNormal=mat3(cross(uModel[1].xyz,uModel[2].xyz),cross(uModel[2].xyz,uModel[0].xyz),cross(uModel[0].xyz,uModel[1].xyz))*aNormal;vColor=aColor;vEmission=aEmission;vTag=aTag;vLocal=aPosition;vUV=aUV;gl_Position=uVP*world;
      // Negative UV.x marks solid ship material layers; leave real textures/effects untouched.
      gl_Position.z-=max(0.,-aUV.x)*(2./16777216.)*gl_Position.w;
    }
  `;
  const fragmentSource=`
    precision highp float;
    varying vec3 vWorld; varying vec3 vNormal; varying vec3 vColor; varying vec3 vLocal;
    varying float vEmission; varying float vTag; varying vec2 vUV;
    uniform vec3 uEye; uniform vec3 uLight; uniform vec3 uTeamColor; uniform float uOpacity; uniform float uSelected;
    uniform float uMode; uniform float uWire; uniform float uTime; uniform float uExposure; uniform sampler2D uTexture; uniform vec3 uTint; uniform float uNearFade; uniform float uFighter; uniform vec4 uImpact; uniform vec2 uShield;

float sceneHash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float sceneNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(sceneHash(i),sceneHash(i+vec3(1,0,0)),f.x),mix(sceneHash(i+vec3(0,1,0)),sceneHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(sceneHash(i+vec3(0,0,1)),sceneHash(i+vec3(1,0,1)),f.x),mix(sceneHash(i+vec3(0,1,1)),sceneHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}
float sceneFbm(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*sceneNoise(p);p=p*2.03+vec3(7.1,3.7,1.9);a*=.5;}return v;}
vec4 spaceScene(vec3 d,float kind){
 if(kind>1.5&&kind<2.5){
  vec3 p=d*3.2;float warp=sceneFbm(p+vec3(2,5,1));float n=sceneFbm(p*2.1+warp*3.);
  float cloud=smoothstep(.28,.72,n),dust=smoothstep(.42,.66,sceneFbm(p*3.+vec3(7,1,9)));
  float ridge=pow(max(0.,1.-abs(n-.51)*8.),3.);
  vec3 color=mix(vec3(.035,.17,.21),vec3(.52,.16,.065),smoothstep(-.5,.65,d.x+d.y))*(cloud*.85+ridge*.3);
  color*=1.-dust*.85;
  return vec4(color,clamp(cloud*.75+dust*.6,.12,.91));
 }
 return vec4(.002,.007,.012,.20);
}

    ${shieldRippleGLSL}
    ${hullShadingGLSL}
    void main(){
      if(uMode>14.5&&uMode<15.5){
        bool inside=uShield.x>.5;if(inside?gl_FrontFacing:!gl_FrontFacing)discard;
        float energy=shieldRipple(normalize(vLocal),uImpact.xyz,uImpact.w,uShield.y);
        if(energy<.001)discard;
        gl_FragColor=vec4(uTint*energy,uOpacity);return;
      }
      if(uMode>13.5&&uMode<14.5){
        if(vLocal.y<0.)discard;
        vec3 n=normalize(vNormal),view=normalize(uEye-vWorld);
        float rim=pow(1.-abs(dot(n,view)),2.5);
        float latitude=pow(.5+.5*cos(vLocal.y*95.),28.);
        float longitude=pow(.5+.5*cos(atan(vLocal.z,vLocal.x)*48.),32.);
        float grid=max(latitude,longitude)*.045;
        gl_FragColor=vec4(uTint,(.025+rim*.38+grid)*uOpacity);return;
      }
      vec3 N=normalize(vNormal);if(!gl_FrontFacing)N=-N;
      vec3 L=normalize(uLight),V=normalize(uEye-vWorld);float diffuse=max(dot(N,L),0.);
      if(uMode<.5&&uFighter>.5&&uWire<.5){
        vec3 palette=abs(vTag-77.)<.1?uTeamColor:vColor;
        vec3 hull=shadeHull(palette*uTint,N,V,L,vEmission);
        if(abs(vTag-uSelected)<.1)hull+=vec3(.12,.33,.39)*(.7+sin(uTime*2.5)*.12);
        gl_FragColor=vec4(hullOutput(hull*uExposure),uOpacity);return;
      }
      float hemi=dot(N,vec3(0.,1.,0.))*.5+.5;
      vec3 base=vColor;
      if(abs(vTag-77.)<.1)base=uTeamColor;
      if(uMode>.5&&uMode<1.5){vec3 n=normalize(vLocal);vec2 uv=vec2(atan(n.z,n.x)/6.2831853+.5,asin(n.y)/3.14159265+.5);base=texture2D(uTexture,uv).rgb;}
      float spec=pow(max(dot(reflect(-L,N),V),0.),40.)*.17;
      vec3 lighting=vec3(.13,.17,.2)+vec3(.18,.20,.215)*hemi+vec3(.94,.9,.78)*diffuse;
      if(uMode>.5&&uMode<1.5)lighting=vec3(.028,.039,.055)+vec3(.89,.86,.76)*diffuse;
      vec3 color=base*lighting+spec;
      color=mix(color,base*1.2,clamp(vEmission,0.,1.));
      if(abs(vTag-uSelected)<.1)color+=vec3(.12,.33,.39)*(.7+sin(uTime*2.5)*.12);
      if(uMode>1.5&&uMode<2.5)color=texture2D(uTexture,vUV).rgb*.76;
      if(uMode>2.5)color=uTint;
      if(uWire>.5)color=vec3(.35,.64,.72);
      color=pow(max(color,vec3(0.)),vec3(.94));
      float alpha=uOpacity;
      if(uMode>3.5&&uMode<4.5){
        float x=clamp(vLocal.x,0.,1.);
        float softEdge=(1.-smoothstep(.05,1.,abs(vUV.y)))*smoothstep(0.,.3,abs(dot(N,V)))*.65;
        float cells=.83+.17*cos(x*38.-uTime*7.);
        alpha*=pow(1.-x,1.15)*softEdge*cells;
        if(uNearFade>0.)alpha*=smoothstep(uNearFade*.5,uNearFade*2.,length(vWorld));
        color=mix(uTint,vec3(1.),.24*pow(1.-x,5.));
      }

      if(uMode>4.5&&uMode<5.5){
        float age=uImpact.w*3.,d=length(vLocal-uImpact.xyz)/max(uShield.x,.001);
        float radius=age*.72,band=exp(-pow((d-radius)/.023,2.));
        float echo=exp(-pow((d-radius*.72)/.016,2.))*.27;
        float flash=exp(-d*38.)*exp(-age*12.);
        float fade=1.-smoothstep(.55,1.45,age);
        float rim=pow(1.-abs(dot(N,V)),2.5);
        alpha=clamp((band*.82+echo+flash+rim*.20*exp(-age*4.)*uShield.y)*fade*uOpacity,0.,.85);
        color=mix(uTint,vec3(.85,1.,1.),band*.6+flash*.3);
      }
      if(uMode>5.5&&uMode<6.5){vec4 sky=spaceScene(normalize(vLocal),uSelected);color=sky.rgb;alpha=sky.a;}
      if(uMode>6.5&&uMode<7.5){
        vec3 n=normalize(vLocal);float terrain=sceneFbm(n*4.8),cloud=sceneFbm(n*19.+vec3(uTime*.001));
        float land=smoothstep(.48,.52,terrain),ice=smoothstep(.77,.94,abs(n.y));
        vec3 surface=mix(vec3(.012,.10,.18),mix(vec3(.08,.19,.105),vec3(.28,.24,.13),smoothstep(.52,.68,terrain)),land);
        surface=mix(surface,vec3(.72,.81,.82),ice);surface=mix(surface,vec3(.8,.87,.9),smoothstep(.56,.72,cloud)*.88);
        float day=max(dot(n,normalize(uLight)),0.);color=surface*(.035+day*1.4)+vec3(.01,.05,.1)*pow(1.-abs(dot(N,V)),4.);
      }
      if(uMode>7.5&&uMode<8.5){float edge=pow(1.-abs(dot(N,V)),3.);color=vec3(.15,.52,1.);alpha=edge*.36*uOpacity;}
      if(uMode>10.5&&uMode<11.5){
        vec3 q=normalize(vLocal);float terrain=sceneFbm(q*140.),detail=sceneNoise(q*1900.);
        vec3 ground=mix(vec3(.12,.17,.15),vec3(.34,.31,.24),smoothstep(.32,.7,terrain));
        ground*=.85+detail*.25;
        color=ground*(.3+max(dot(N,normalize(uLight)),0.)*.9);
        float haze=1.-exp(-length(uEye-vWorld)/11000.);
        color=mix(color,vec3(.19,.32,.43),haze*.72);
      }

      if(uMode>8.5&&uMode<9.5){
        vec3 q=normalize(vLocal);float n=sceneFbm(q*6.+vec3(uImpact.w*-.7,uImpact.w*.4,0));
        float rim=pow(1.-abs(dot(N,V)),1.5);
        float filaments=pow(1.-abs(n-.5)*1.8,6.);
        color=mix(uTint,vec3(1.,.96,1.),filaments*.65);
        alpha=(rim*.55+filaments*.33)*uOpacity;
      }
      if(uMode>9.5&&uMode<10.5){
        float edge=pow(max(0.,sin(vUV.y*3.141593)),2.);
        float arcs=.65+.35*sin(vUV.x*100.+uTime*9.);
        color=mix(uTint,vec3(1.),pow(edge,6.)*.65);alpha=edge*arcs*uOpacity;
      }
      gl_FragColor=vec4(color*uExposure,alpha);
    }
  `;
  const flatVertex=`attribute vec3 aPosition;attribute vec3 aColor;attribute float aSize;uniform mat4 uMatrix;uniform float uDpr;varying vec3 vColor;void main(){vColor=aColor;gl_Position=uMatrix*vec4(aPosition,1.);gl_PointSize=aSize*uDpr;}`;
  const flatFragment=`precision mediump float;varying vec3 vColor;uniform float uAlpha;uniform float uPointMode;void main(){float a=uAlpha;if(uPointMode>.5){float d=length(gl_PointCoord-vec2(.5));a*=1.-smoothstep(.14,.5,d);}gl_FragColor=vec4(vColor,a);}`;

const impactVertex="attribute vec3 p,c;attribute vec2 uv;attribute vec2 fx;uniform mat4 vp;varying vec3 color;varying vec2 tex,effect;void main(){color=c;tex=uv;effect=fx;gl_Position=vp*vec4(p,1.);}";
const impactFragment="precision mediump float;\r\n          varying vec3 color;varying vec2 tex,effect;\r\n          void main(){float r=length(tex),t=effect.x,kind=effect.y;\r\n            if(kind>4.5){if(r>1.)discard;gl_FragColor=vec4(color,exp(-r*r*12.)*(1.-t));return;}\r\n            if(kind>3.5){float d=abs(tex.y),core=exp(-d*d*85.),halo=exp(-d*d*5.)*.24;\r\n              float cap=smoothstep(0.,.012,tex.x)*smoothstep(0.,.012,1.-tex.x);\r\n              gl_FragColor=vec4(mix(color,vec3(1.,.96,.87),core*.55),(core+halo)*t*cap);return;}\r\n            if(r>1.)discard;\r\n            float angle=atan(tex.y,tex.x);float cloud=.83+.10*sin(angle*7.+t*9.)+.07*sin(angle*13.-t*7.);\r\n            float fire=exp(-r*r/(.045+t*.22))*(1.-smoothstep(cloud-.22,cloud,r));\r\n            float shock=exp(-pow((r-(.18+t*.72))/.025,2.))*(1.-t);\r\n            float core=exp(-r*r/(.012+t*.018))*max(0.,1.-t*2.);\r\n            float spikes=pow(abs(cos(angle*4.)),24.)*exp(-r*4.)*(1.-t);\r\n            float a=(fire*.85+core+shock*.6+spikes*.3)*pow(1.-t,1.3);\r\n            vec3 hue=mix(color,vec3(1.,.84,.48),fire*.4);\r\n            if(kind<.5){a=(exp(-r*r*18.)+spikes*.8)*(1.-t);hue=color;}\r\n            if(kind>.5&&kind<1.5){a=(shock*.8+core*.3+fire*.2)*(1.-t);hue=color;}\r\n            gl_FragColor=vec4(mix(hue,vec3(1.),min(1.,core+fire*.35)),a);\r\n          }";
  function makeMoonTexture(){
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d'),rand=seeded(32191),w=512,h=256;
    const field=new Float32Array(128*64);for(let i=0;i<field.length;i++)field[i]=rand();
    const noise=(x,y)=>{let ix=Math.floor(x),iy=Math.floor(y),u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);const at=(a,b)=>field[((b%64+64)%64)*128+((a%128+128)%128)];return mix(mix(at(ix,iy),at(ix+1,iy),u),mix(at(ix,iy+1),at(ix+1,iy+1),u),v)};
    const small=document.createElement('canvas');small.width=w;small.height=h;let s=small.getContext('2d'),img=s.createImageData(w,h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){let n=noise(x/60,y/60)*.47+noise(x/23,y/23)*.25+noise(x/8,y/8)*.15+noise(x/2.9,y/2.9)*.09+rand()*.12;let c=83+n*109;let i=(y*w+x)*4;img.data[i]=c*1.04;img.data[i+1]=c;img.data[i+2]=c*.89;img.data[i+3]=255}s.putImageData(img,0,0);ctx.drawImage(small,0,0,1024,512);
    for(let i=0;i<2800;i++){let x=rand()*1024,y=rand()*512,r=.7+Math.pow(rand(),3)*(i<130?18:6.5);ctx.save();ctx.translate(x,y);ctx.scale(1,Math.max(.3,Math.sin(y/512*Math.PI)));let grad=ctx.createRadialGradient(-r*.22,-r*.2,r*.12,0,0,r);grad.addColorStop(0,'rgba(24,26,27,.35)');grad.addColorStop(.64,'rgba(64,65,61,.29)');grad.addColorStop(.82,'rgba(219,215,193,.45)');grad.addColorStop(.91,'rgba(219,217,198,.16)');grad.addColorStop(1,'rgba(190,190,168,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();ctx.restore()}
    return canvas;
  }

  class Renderer extends ThreeRenderBackend {
    constructor(canvas,options={}){
      super(canvas,{vertexSource,fragmentSource,flatVertex,flatFragment,impactVertex,impactFragment},assets,options);
      this.jointMeshes=fleet.parts.map(s=>{const g=new Geometry();g.data=fleet.vertices.subarray(s.offset,s.offset+s.floatCount);return g.upload();});this.shipMeshes=fleet.ships.map(s=>{const g=new Geometry();g.data=fleet.vertices.subarray(s.offset,s.offset+s.floatCount);return g.upload();});
      this.defenseMeshes=new Map();for(const [index,ship]of fleet.ships.entries()){const parts=assets.ships.find(a=>a.id===ship.id)?.defenseParts;if(parts?.base)this.defenseMeshes.set(index,Object.fromEntries(Object.entries(parts).map(([part,range])=>{const g=new Geometry();g.data=assets.vertices.subarray(range.offset,range.offset+range.floatCount);return [part,range.floatCount?g.upload():null];})));}
      this.bridgeMesh=this.makeBridge().upload();
      let beam=new Geometry();beam.cylinder(1,1,[.5,0,0],C.blue,10,0,1);this.beamMesh=beam.upload();let plume=new Geometry();plume.data=plumeMeshData();this.plumeMesh=plume.upload();
      let missile=new Geometry();missile.cylinder(.11,.95,[0,0,0],C.light,8);missile.cylinder(.11,.32,[.63,0,0],C.light,8,0,0,0);this.missileMesh=missile.upload();this.moonMesh=new Geometry().sphere(1,64,36).upload();this.moonTexture=this.texture(makeMoonTexture());
      this.rockMesh=this.makeRock().upload();this.rocks=[];const rockRandom=seeded(8972);
      for(let i=0;i<90;i++){const a=rockRandom()*Math.PI*2,r=550+rockRandom()*3400,size=12+Math.pow(rockRandom(),2)*115;this.rocks.push({pos:[Math.cos(a)*r,(rockRandom()-.5)*700,Math.sin(a)*r],size,rot:[rockRandom()*6,rockRandom()*6,rockRandom()*6]});}
      const ring=new Geometry();ring.data=specialRingData();this.specialRing=ring.upload();
      this.grid=this.makeGrid();this.stars=this.makeStars();this.cockpit=this.makeCockpit().upload();
      this.fighterConsole=new FighterConsole(canvas=>this.texture(canvas));
      this.screens=fighterDisplays.map(p=>{const g=new Geometry(),[w,h]=p.size;g.quad(...[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>consolePoint(p,[x,y,.003])),C.blue);return g.upload();});
      this.fighterConsoleFrame=null;this.vp=M.identity();this.eye=[0,0,0];this.width=0;this.height=0;this.resize();
    }
    makeRock(){
      const g=new Geometry().sphere(1,12,8);
      for(let i=0;i<g.data.length;i+=13){const p=g.data.slice(i,i+3),r=.83+.13*Math.sin(p[0]*8+p[1]*5)+.12*Math.cos(p[2]*9-p[0]*3);for(let j=0;j<3;j++)g.data[i+j]*=r;g.data[i+6]=.27+r*.08;g.data[i+7]=.25+r*.07;g.data[i+8]=.23+r*.06;}
      for(let i=0;i<g.data.length;i+=39){const a=g.data.slice(i,i+3),b=g.data.slice(i+13,i+16),c=g.data.slice(i+26,i+29),n=V.norm(V.cross(V.sub(b,a),V.sub(c,a)));for(let k=0;k<3;k++)for(let j=0;j<3;j++)g.data[i+k*13+3+j]=n[j];}return g;
    }
    drawFortress(environment,namespace='',metadata=[],rows=[],presentation,time=0,events=[]){
      const modules=environment?.fortress?.modules;if(!modules?.length)return;
      const compact=environment.fortress.version>=2;
      this.fortressMeshesByVersion??=new Map();const version=compact?2:1;
      if(!this.fortressMeshesByVersion.has(version))this.fortressMeshesByVersion.set(version,createFloatingPlatformGeometry(Geometry,compact?FORTRESS.scale:1));
      const meshes=this.fortressMeshesByVersion.get(version),{destroyed,destroyedSockets}=fortressState(environment,metadata,rows);
      const poses=presentation.update(environment,metadata,rows,destroyed,time,events),parents=new Map(),group=modules.filter(m=>poses.has(m.index)),matrices=new Float32Array(group.length*16);
      group.forEach((m,i)=>{
       const pose=poses.get(m.index),down=V.norm(V.sub(environment.center||[m.x,m.y-1,m.z],[m.x,m.y,m.z])),matrix=M.compose([m.x+down[0]*pose.drop,m.y+down[1]*pose.drop,m.z+down[2]*pose.drop],[pose.pitch,0,pose.roll]);
       parents.set(m.index,matrix);const relative=new Float64Array(matrix);for(let j=0;j<3;j++)relative[12+j]-=this.eye[j];matrices.set(relative,i*16);
      });
      if(group.length)this.drawInstances(namespace+'fortress-modules',{geometry:meshes.module,high:true,matrices,ids:group.map(m=>m.index)});
      if(compact){
       this.smallFortressMeshes??=createFortressGeometry(Geometry,FORTRESS.smallScale);
       const sockets=group.flatMap(m=>m.sockets.flatMap((s,i)=>s?.kind==='small'?[{module:m,index:i,...fortressSocket(m,i)}]:[]));
       for(const ruined of [false,true]){
        const group=sockets.filter(s=>destroyedSockets.has(`${s.module.index}:${s.index}`)===ruined),matrices=new Float32Array(group.length*16);
        group.forEach((s,i)=>{const matrix=M.mul(parents.get(s.module.index),M.translate(s.x-s.module.x,s.y+4-s.module.y,s.z-s.module.z));for(let j=0;j<3;j++)matrix[12+j]-=this.eye[j];matrices.set(matrix,i*16);});
        if(group.length)this.drawInstances(namespace+(ruined?'fortress-small-wrecks':'fortress-small-modules'),{geometry:ruined?this.smallFortressMeshes.wreck:this.smallFortressMeshes.module,high:true,matrices,ids:group.map(s=>s.module.index*7+s.index)});
       }
      }
      const links=fortressConnections(modules).filter(([a,b])=>!destroyed.has(a.index)&&!destroyed.has(b.index)),bridges=new Float32Array(links.length*16);
       links.forEach(([a,b],i)=>{
        const d=V.sub([b.x,b.y,b.z],[a.x,a.y,a.z]),len=V.length(d),direction=V.scale(d,1/len);
        const inset=compact?65:90,start=V.add([a.x,a.y,a.z],V.scale(direction,inset)),end=V.add([b.x,b.y,b.z],V.scale(direction,-inset));
        const matrix=this.segmentModel(start,end);for(let j=0;j<3;j++)matrix[12+j]-=this.eye[j];bridges.set(matrix,i*16);
      });
      if(links.length)this.drawInstances(namespace+'fortress-links',{geometry:meshes.bridge,high:true,matrices:bridges,ids:links.map((_,i)=>i)});
      this.setBlend(true,false);
      for(const m of group){if(poses.get(m.index).falling)continue;const parent=parents.get(m.index);
       for(const jet of meshes.jets){const start=M.transform(parent,jet.pos),pulse=1+.06*Math.sin(this.time*9+m.index+jet.pos[0]),end=M.transform(parent,[jet.pos[0],jet.pos[1]-jet.length*pulse,jet.pos[2]]);
        this.drawEffectMesh(this.plumeMesh,this.segmentModel(start,end,jet.radius),{mode:4,tint:[.16,.62,1],opacity:.75});
       }
      }
      this.setBlend(false,true);
    }
    drawDefenseField(environment,metadata,rows,owner){
      const modules=environment?.fortress?.modules;if(!modules?.length)return;
      const {fields}=fortressState(environment,metadata,rows);if(!fields.length)return;
      const x=modules.reduce((n,m)=>n+m.x,0)/modules.length,z=modules.reduce((n,m)=>n+m.z,0)/modules.length;
      const y=Math.min(...modules.map(m=>m.y))+8,radius=Math.max(...modules.map(m=>Math.hypot(m.x-x,m.z-z)))+150;
      this.defenseFieldMesh??=new Geometry().sphere(1,80,40).upload();
      this.setBlend(true,false);
      for(const field of fields)this.drawMesh(this.defenseFieldMesh,M.compose([x,y,z],[0,0,0],[radius,radius*.45+120,radius]),{mode:14,tint:field.owner===owner?[.12,.6,1]:[1,.24,.18],opacity:.55+.45*Math.min(1,field.charge/field.capacity)});
      this.setBlend(false,true);
    }
    drawBattlePlanet(environment){
      this.battlePlanetMesh??=new Geometry().sphere(1,256,128).upload();
      const {center}=environment,radius=environment.radius/FORTRESS.orbitScale;
      this.drawMesh(this.battlePlanetMesh,M.compose(center,[0,0,0],[radius,radius,radius]),{mode:11,light:[-.4,.9,.3]});
      if(!environment.moon){this.setBlend(true,false);this.drawMesh(this.battlePlanetMesh,M.compose(center,[0,0,0],[radius+environment.atmosphere,radius+environment.atmosphere,radius+environment.atmosphere]),{mode:8,opacity:.32});this.setBlend(false,true);}
    }
    environment(s,time){
      const kind=s.sceneIndex??0;
      this.drawSpaceSky(.85);
      if(kind===1){
        const pos=[-2000,-950,-3600],rot=[.1,.42,.18];
        this.drawMesh(this.moonMesh,M.compose(pos,rot,[2100,2100,2100]),{mode:7,light:[.6,.3,1]});
        this.setDepthWrite(false);this.setBlend(true);
        this.drawMesh(this.moonMesh,M.compose(pos,rot,[2132,2132,2132]),{mode:8});
        this.setBlend(false);this.setDepthWrite(true);
        this.drawMesh(this.moonMesh,M.compose([1600,750,-5100],[0,.3,0],[230,230,230]),{mode:1,texture:this.moonTexture,light:[.6,.3,1]});
      }
      if(kind===3){
        for(const r of this.rocks){const pos=r.pos.map((v,i)=>v+Math.round((s.flight.pos[i]-v)/8000)*8000);this.drawMesh(this.rockMesh,M.compose(pos,[r.rot[0],r.rot[1]+time*.006,r.rot[2]],[r.size,r.size*.72,r.size*1.2]),{light:[.8,.25,.5]});}
        this.drawMesh(this.moonMesh,M.compose([3100,-1400,-6300],[0,.8,0],[1050,1050,1050]),{mode:1,texture:this.moonTexture,light:[.8,.25,.5]});
      }
    }
    shieldImpact(vessel,index,model,point,amount,charge){
      if(!(charge>0)||!(amount>0))return;
      const local=shieldLocalPoint(model,point);
      const surface=nearestHullPoint(fleet.vertices,fleet.ships[index],local);
      vessel.shieldHits??=[];addShieldHit(vessel.shieldHits,surface,this.time,amount,charge);
      const hit=vessel.shieldHits.at(-1);hit.bubbleDirection=shieldDirection(local,this.shieldEnvelope(index));
      // Native hulls face -X; cabin coordinates face -Z.
      hit.cabinDirection=[-hit.bubbleDirection[2],hit.bubbleDirection[1],hit.bubbleDirection[0]];
    }
    shieldEnvelope(index){
      this.shieldEnvelopes??=new Map();if(!this.shieldEnvelopes.has(index))this.shieldEnvelopes.set(index,shieldEnvelope(fleet.vertices,fleet.ships[index]));return this.shieldEnvelopes.get(index);
    }
    drawShield(vessel,index,model,opacity=1){
      vessel.shieldHits=(vessel.shieldHits||[]).filter(h=>this.time-h.time<1.4);
      if(!vessel.shieldHits.length||opacity<.01)return;
      this.setDepthWrite(false);this.setBlend(true);this.setSide(true);
      for(const h of vessel.shieldHits)if(this.time-h.time<.48)this.drawMesh(this.shipMeshes[index],model,{mode:5,tint:h.weak?[1,.42,.12]:[.08,.62,1],opacity,shellOffset:LAYOUTS[index].length*.002,impact:[...h.point,this.time-h.time],shield:[LAYOUTS[index].length,h.power]});
      const envelope=this.shieldEnvelope(index),bubble=M.mul(model,M.compose(envelope.center,[0,0,0],envelope.radii)),eye=shieldLocalPoint(bubble,this.eye),inside=Math.hypot(...eye)<1;
      this.setSide(false);
      for(const h of vessel.shieldHits)this.drawMesh(this.moonMesh,bubble,{mode:15,tint:h.weak?[1,.36,.14]:[.25,.8,1],opacity,impact:[...(h.bubbleDirection||shieldDirection(h.point,envelope)),this.time-h.time],shield:[inside?1:0,.8+h.power]});
      this.setSide(false);this.setBlend(false);this.setDepthWrite(true);
    }
    makeGrid(){let data=[];const add=(p,c)=>data.push(...p,...c,1);for(let x=-25;x<=26;x+=2.3)for(let z=-20;z<=25;z+=2.3){let fade=Math.max(0,1-Math.hypot(x*.7,z*.8)/27),c=[.22*fade,.38*fade,.45*fade];add([x-.08,-2.8,z],c);add([x+.08,-2.8,z],c);add([x,-2.8,z-.08],c);add([x,-2.8,z+.08],c)}return this.flatBuffer(data)}
    makeStars(){let data=[],r=seeded(5352);for(let i=0;i<2300;i++){let y=r()*2-1,a=r()*TAU,k=Math.sqrt(1-y*y),b=.2+Math.pow(r(),2)*.65;data.push(Math.cos(a)*k*6000,y*6000,Math.sin(a)*k*6000,b*.87,b*.93,b,.65+r()*1.45)}return this.flatBuffer(data)}
    makeCockpit(){const g=new Geometry(),frame=rgb(0x344046),trim=rgb(0x7b7e75),inner=rgb(0x101a20);
      // Load-bearing canopy members and small fasteners, all actual 3D geometry.
      g.beam([-2.25,1.48,-2.75],[2.25,1.48,-2.75],.17,.15,frame);g.beam([-2.24,1.38,-2.77],[2.24,1.38,-2.77],.025,.03,trim);
      for(let s of[-1,1]){let a=[s*2.15,1.6,-2.75],b=[s*2.35,-1.42,-2.35];g.beam(a,b,.15,.21,frame);g.beam([s*2.06,1.6,-2.78],[s*2.26,-1.42,-2.38],.026,.05,trim);g.beam([s*2.87,1.9,-2.6],[s*2.05,-1.57,-1.95],.2,.23,frame);g.beam([s*2.8,1.9,-2.57],[s*1.99,-1.57,-1.92],.035,.03,trim);for(let i=0;i<5;i++)g.box([.065,.055,.04],[s*(2.16+i*.044),1.25-i*.5,-2.59+i*.055],inner)}
      // A continuous dashboard supports five recessed screens; no duplicate old monitors.
      g.box([3.7,.32,.55],[0,-1.24,-2.5],inner);
      for(const panel of fighterDisplays){const [w,h]=panel.size,point=v=>consolePoint(panel,v);
        g.beam(point([0,-h/2,-.08]),[panel.pos[0],-1.28,-2.4],.12,.12,frame);
        g.box([w+.10,h+.12,.14],point([0,0,-.08]),frame,0,panel.rotation);
        g.box([w+.028,h+.028,.025],point([0,0,-.016]),inner,0,panel.rotation);
        for(const sx of [-1,1])for(const sy of [-1,1])g.box([.015,.015,.006],point([sx*(w/2+.03),sy*(h/2+.034),-.004]),trim,0,panel.rotation);
        g.box([w*.7,.006,.008],point([0,h/2+.033,-.004]),rgb(0x6293a2),0,panel.rotation,.3);
        g.box([.045,.009,.008],point([w/2-.03,-h/2-.038,-.004]),rgb(0x89c9be),0,panel.rotation,.4);
      }
      return g;
    }

    makeBridge(){
      const g=new Geometry(),frame=rgb(0x28363c),trim=rgb(0x72786f),inner=rgb(0x0e181d);
      // A broad command deck; the foredeck remains visible through the lower glazing.
      for(let side of[-1,1]){
        g.beam([side*3.97,2.22,-3.9],[side*3.8,-1.72,-3.35],.18,.24,frame);
        g.beam([side*3.89,2.21,-3.93],[side*3.72,-1.68,-3.38],.03,.04,trim);
        g.beam([side*6.6,3,-5.7],[side*3.75,-2.15,-2.55],.24,.3,frame);
        g.chamfer([1.65,.38,1.5],[side*2.82,-1.74,-3.1],frame);
        g.box([1.3,.023,.83],[side*2.82,-1.54,-3.1],inner);
        for(let j=0;j<6;j++)g.box([.055,.028,.45],[side*2.82-.45+j*.18,-1.519,-3.1],C.blue,0,[0,0,0],.65);
        g.beam([side*6,-1.42,-4.4],[side*3.15,-1.16,-2.54],.075,.08,trim);
        for(let i=0;i<5;i++)g.box([.055,.12,.045],[side*4.43,1.6-i*.56,-3.7+i*.065],inner);
      }
      g.beam([-5.6,2.38,-4.2],[5.6,2.38,-4.2],.21,.34,frame);
      g.beam([-5.6,2.27,-4.24],[5.6,2.27,-4.24],.045,.04,trim);
      g.beam([-5,-1.62,-3.7],[5,-1.62,-3.7],.1,.15,frame);
      g.box([12,.46,4.7],[0,-2.15,-2.65],inner);
      // Three independent instrument screens in a low central console.
      for(let i=0;i<3;i++){
        let x=(i-1)*1.1,y=i===1?-1.22:-1.15;
        g.chamfer([1.035,.79,.2],[x,y,-2.16],frame);
        g.box([.94,.6,.055],[x,y,-2.06],inner);
        g.box([.73,.032,.033],[x,y+.31,-2.025],trim);
      }
      return g;
    }
    drawVessel(index,model,opts={},turrets=null){
      const hullOpts={...opts,fighter:true};
      this.drawMesh(this.shipMeshes[index],model,hullOpts);
      for(const t of turrets||LAYOUTS[index].joints){const a=jointTransforms(M,model,t);this.drawMesh(this.jointMeshes[t.parts[0]],a.yaw,hullOpts);this.drawMesh(this.jointMeshes[t.parts[1]],a.barrels,hullOpts);}
    }

    drawDefense(index,model,yaw=0,pitch=0,teamColor=[.086,.545,.922]){
      const parts=this.defenseMeshes.get(index);if(!parts){this.drawVessel(index,model);return;}
      const pivot=assets.ships?.find(a=>a.id===fleet.ships?.[index]?.id)?.defensePivot??3,opts={teamColor,fighter:true};
      this.drawMesh(parts.base,model,opts);
      const turret=M.mul(model,M.ry(yaw)),barrels=M.mul(turret,M.mul(M.translate(0,pivot,0),M.mul(M.rz(-pitch),M.translate(0,-pivot,0))));
      if(parts.turret)this.drawMesh(parts.turret,turret,opts);
      if(parts.barrels)this.drawMesh(parts.barrels,barrels,opts);
    }
    segmentModel(a,b,radius=1){
      const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz)||1,x=dx/len,y=dy/len,z=dz/len,vertical=Math.abs(y)>.97;
      let zx=vertical?y:-z,zy=vertical?-x:0,zz=vertical?0:x;const norm=Math.hypot(zx,zy,zz)||1;zx/=norm;zy/=norm;zz/=norm;
      return new Float64Array([dx,dy,dz,0,(zy*z-zz*y)*radius,(zz*x-zx*z)*radius,(zx*y-zy*x)*radius,0,zx*radius,zy*radius,zz*radius,0,a[0],a[1],a[2],1]);
    }
    drawSpecial(p,time){
      this.setDepthWrite(false);this.setBlend(true);
      if(p.profile.special==='reaper'&&(p.charging||p.reaperCut)){
        const model=this.ownModel,layout=LAYOUTS[window.GalacticDemo.state.shipIndex],energy=p.charging?p.charge:1;
        for(const muzzle of layout.main){
          const at=M.transform(model,muzzle);
          for(let i=0;i<3;i++){const r=layout.length*.019*(1+i*.35),offset=M.transform(model,[muzzle[0]-i*r*.8,muzzle[1],muzzle[2]]);this.drawMesh(this.specialRing,M.compose(offset,[time+i,.5+i,time*.2],[r,r,r]),{mode:10,tint:[.12,1,.65],opacity:energy*.7});}
          if(p.reaperCut){
            const end=p.reaperCut.target.pos,axis=V.norm(V.sub(end,at)),right=V.norm(V.cross(axis,[0,1,0])),up=V.cross(right,axis),lines=[];
            let previous=null;
            for(let j=0;j<=64;j++){const f=j/64,a=f*40-time*18,r=Math.sin(f*Math.PI)*layout.length*.035,point=at.map((v,k)=>mix(v,end[k],f)+(right[k]*Math.cos(a)+up[k]*Math.sin(a))*r);if(previous)lines.push(...previous,.14,.65,.46,1,...point,.45,1,.72,1);previous=point;}
            this.dynamicFlat(lines,false,.65);
          }
        }
      }
      for(const e of p.specialBlasts||[]){
        const {collapse,wave,fade}=specialBlastPhase(e.age),at=e.pos,r=e.radius;
        if(collapse>0){
          const s=8+65*collapse;this.drawMesh(this.moonMesh,M.compose(at,[0,time,0],[s,s,s]),{mode:9,tint:[.63,.16,1],opacity:collapse,impact:[0,0,0,e.age]});
          for(let i=0;i<3;i++){const s=20+collapse*150;this.drawMesh(this.specialRing,M.compose(at,[i*.8,time*.2,i*.65],[s,s,s]),{mode:10,tint:[.45,.5,1],opacity:collapse*.8});}
        }
        if(wave>0){
          const bloom=(16+110*Math.sin(Math.min(1,wave*1.4)*Math.PI*.7))*(.4+.6*fade);
          this.drawMesh(this.moonMesh,M.compose(at,[e.age*.2,0,0],[bloom,bloom,bloom]),{mode:9,tint:[.62,.22,1],opacity:fade*.75,impact:[0,0,0,e.age]});
          for(let i=0;i<3;i++){
            const s=r*wave*(1-i*.12);this.drawMesh(this.specialRing,M.compose(at,[.18+i*.63,.3+i*.45,i*.24],[s,s,s]),{mode:10,tint:i===1?[.1,.7,1]:[.8,.38,1],opacity:fade*(i===0?.9:.5)});
          }
          // Stable, seeded ejecta streamers, rather than a cloud of random orange points.
          const lines=[],heads=[];
          for(let i=0;i<110;i++){
            const a=i*2.399963,b=1-2*(i+.5)/110,z=Math.sqrt(1-b*b),dir=[Math.cos(a)*z,b,Math.sin(a)*z];
            const distance=r*wave*(.4+.55*Math.abs(Math.sin(i*43.1))),tip=at.map((v,j)=>v+dir[j]*distance),tail=at.map((v,j)=>v+dir[j]*distance*(.88-.1*fade));
            lines.push(...tail,.08*fade,.22*fade,.5*fade,1,...tip,.7*fade,.65*fade,fade,1);heads.push(...tip,.6*fade,.8*fade,fade,3*fade);
          }
          this.dynamicFlat(lines,false,fade);this.dynamicFlat(heads,true,fade);
          const flash=Math.exp(-Math.max(0,e.age-.3)*8),s=12+flash*60;
          this.drawMesh(this.moonMesh,M.compose(at,[0,0,0],[s,s,s]),{mode:3,tint:[1,.94,1],opacity:flash});
        }
      }
      this.setBlend(false);this.setDepthWrite(true);
    }
    drawBeam(a,b,width,color,opacity=1){
      if(width>=.4){const mid=V.scale(V.add(a,b),.5),pixel=V.length(V.sub(mid,this.eye))*2*Math.tan(this.fov/2)/this.height;width=Math.max(width,pixel*(width>=2?3.5:1.5));}
      this.setDepthWrite(false);this.setBlend(true);
      this.drawMesh(this.beamMesh,this.segmentModel(a,b,width*3),{mode:3,tint:color,opacity:opacity*.1});
      this.drawMesh(this.beamMesh,this.segmentModel(a,b,width),{mode:3,tint:color,opacity:opacity*.65});
      this.drawMesh(this.beamMesh,this.segmentModel(a,b,width*.32),{mode:3,tint:[.92,.98,1],opacity});
      this.setBlend(false);this.setDepthWrite(true);
    }

    archive(s,time){this.begin(time);let a=s.orbit,transition=s.transition,zoom=1,centerY=0,offset=-.26;
      if(transition){let q=transition.progress;if(transition.to==='flight'){zoom=1-Math.pow(clamp(q*2,0,1),2)*.87;centerY=clamp(q*2,0,1)*1.35}else{zoom=.13+(1-Math.pow(1-clamp((q-.4)/.6,0,1),3))*.87;centerY=(1-zoom)*1.5}}
      let dist=a.distance*zoom*Math.max(1,(16/9)/(this.width/this.height)),eye=[-Math.sin(a.yaw)*Math.cos(a.pitch)*dist,Math.sin(a.pitch)*dist+centerY,Math.cos(a.yaw)*Math.cos(a.pitch)*dist];this.eye=eye;
      const proj=M.perspective(35*Math.PI/180,this.width/this.height,.07,9000,offset);proj[9]=-.13;this.vp=M.mul(proj,M.lookAt(eye,[0,centerY,0]));this.cameraForward=V.norm(V.sub([0,centerY,0],eye));this.cameraUp=[0,1,0];this.fov=35*Math.PI/180;this.projectionShiftX=offset;this.projectionOffset=-.13;this.drawSpaceSky(.6);this.drawFlat(this.grid,this.vp,false,.7*zoom);
      let rot=[0,0,0],y=Math.sin(time*.27)*.04,opacity=1;
      if(s.shipSwitch){let p=s.shipSwitch.progress;opacity=Math.abs(p-.5)*2;let side=p<.5?-1:1;rot=[0,side*(1-opacity)*.32,0];y+=(1-opacity)*side*.8}
      const model=M.compose([0,y,0],rot);this.archiveModel=model;
      this.drawVessel(s.shipIndex,model,{opacity,wire:s.wireframe,selected:s.highlight});
    }

    drawExhaust(index,own,throttle,boost,time,ownOpacity=1){const layout=LAYOUTS[index];
        this.setDepthWrite(false);this.setBlend(true);
        const drive=layout.propulsion;
        for(const [i,e] of layout.engines.entries()){
          const envelope=plumeEnvelope(throttle,boost,time,drive.pulse,i),start=M.transform(own,e.position);
          const direction=V.norm(V.sub(M.transform(own,e.direction),M.transform(own,[0,0,0]))),length=e.radius*envelope.length,end=V.add(start,V.scale(direction,length));
          this.drawMesh(this.plumeMesh,this.segmentModel(start,end,e.radius*envelope.width),{mode:4,tint:drive.color,opacity:ownOpacity*envelope.alpha,nearFade:layout.length*.08});
          this.drawMesh(this.plumeMesh,this.segmentModel(start,end,e.radius*.42),{mode:4,tint:drive.core,opacity:ownOpacity*envelope.alpha*.75,nearFade:layout.length*.08});
        }
        this.setBlend(false);this.setDepthWrite(true);
    }
        weaponImpact(p,pos,{visual={},color=[1,.45,.08],shield=false,destroy=false,muzzle=false,critical=false,areaRadius=0}={}){
      const distance=Math.hypot(pos[0]-this.eye[0],pos[1]-this.eye[1],pos[2]-this.eye[2]),focal=this.height/(2*Math.tan(this.fov/2));
      const envelope=areaRadius||(visual.blastRadius||2)*(destroy?8:3);
      if(!(this.spawnImpactView??=new BattleViewCulling()).update(this.vp).visible(...pos,Math.max(envelope,distance*20/focal)))return;
      // Co-located splash notifications share one visual shell, not one shell
      // per damaged ship. Authoritative damage/events are never coalesced.
      if(areaRadius&&(p.weaponImpacts||[]).some(e=>e.areaRadius===areaRadius&&e.critical===critical&&(p.elapsed||0)-e.born<.1&&Math.hypot(...pos.map((v,i)=>v-e.pos[i]))<Math.max(1,areaRadius*.15)))return;
      const compact=!!visual.compact||!areaRadius&&distance>350&&envelope*focal/distance<3,type=compact?5:muzzle?0:shield?1:destroy?3:2;
      const radius=compact?(muzzle?.2:(visual.blastRadius||.35)*(destroy?1.8:1)):muzzle?Math.max(.7,(visual.radius||.15)*5):Math.max(1.3,visual.blastRadius||2)*(destroy?3:1);
      (p.weaponImpacts??=[]).push({pos:[...pos],color:shield?[.12,.6,1]:critical?[1,.82,.3]:color,type,radius,compact,critical,areaRadius,elite:!!visual.elite,born:p.elapsed||0,life:areaRadius?areaBlastPhase(0,areaRadius,critical).life:compact?(destroy?.55:muzzle?.07:.15):muzzle?(visual.elite?.45:.24):destroy?2.6:shield?.65:visual.elite?1.7:1.05});
      if(p.weaponImpacts.length>180)p.weaponImpacts.splice(0,p.weaponImpacts.length-180);
    }
    drawWeaponImpacts(p,projectiles=p.projectiles){

      p.weaponImpacts=(p.weaponImpacts||[]).filter(e=>(p.elapsed||0)-e.born<e.life);
      if(!p.weaponImpacts.length&&!p.beams?.length&&!projectiles?.some(q=>q.missile))return;
      const eye=this.eye,right=V.norm(V.cross(this.cameraForward,this.cameraUp)),up=V.norm(V.cross(right,this.cameraForward)),data=(this.impactVertices??=new EffectVertices()).reset();
      const focal=this.height/(2*Math.tan(this.fov/2)),view=(this.impactView??=new BattleViewCulling()).update(this.vp);
      // Missile smoke and burning motors share the practice renderer at every fleet size.
      // Screen-space width keeps curved launch paths readable from the fleet camera.
      for(const q of projectiles||[]){
        if(!q.missile)continue;const compact=q.visual?.compact,trail=q.trail||[],start=Math.max(0,trail.length-(compact?14:32)),length=trail.length-start,step=Math.hypot(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2])>650?3:2;
        for(let i=step;i<length;i+=step){
          const a=trail[start+i-step],b=trail[start+i];if(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])<.01)continue;
          const pixel=Math.hypot((a[0]+b[0])*.5-eye[0],(a[1]+b[1])*.5-eye[1],(a[2]+b[2])*.5-eye[2])/focal,w=Math.max(compact?.09:.22,pixel*(compact?.55:1.05));
          effectRibbon(data,a,b,eye,w,.62,.69,.77,i/length*.24);
        }
        const a=V.sub(q.pos,V.scale(V.norm(q.velocity),Math.min(compact?4:9,Math.max(2,q.age*45)))),b=q.pos,mid=V.scale(V.add(a,b),.5),w=Math.max(compact?.12:.28,V.length(V.sub(mid,eye))/focal*(compact?.8:2.2));
        effectRibbon(data,a,b,eye,w,1,.48,.12,.9);
      }
      // Camera-facing core + halo, like the supplied NEREID reference; no solid white tubes.
      for(const b of p.beams||[]){
        const mid=V.scale(V.add(b.start,b.end),.5);
        const pixel=V.length(V.sub(mid,eye))/focal,w=b.compact?Math.min(pixel*2,Math.max(b.width,pixel*.65)):Math.max(b.width*3,pixel*(b.width>=2?10:b.width>=.4?6:1.5));
        if(!view.visible(...mid,V.length(V.sub(b.end,b.start))*.5+w))continue;
        const alpha=Math.min(1,b.manual?(b.life-b.age)/Math.min(.15,b.life*.25):(1-b.age/b.life)*4)*.9;
        effectRibbon(data,b.start,b.end,eye,w,b.color[0],b.color[1],b.color[2],alpha);
      }
      for(const e of p.weaponImpacts){
        const age=Math.max(0,((p.elapsed||0)-e.born)/e.life),pixel=Math.max(.001,V.length(V.sub(e.pos,eye))/focal);
        if(e.areaRadius){
          const phase=areaBlastPhase(Math.max(0,(p.elapsed||0)-e.born),e.areaRadius,e.critical);
          const core=Math.max(pixel*2,e.areaRadius*(.12+.1*phase.flash)),width=Math.max(pixel*.8,e.areaRadius*.04),ringRadius=Math.max(0,phase.radius-width);
          if(!view.visible(...e.pos,Math.max(core*Math.SQRT2,ringRadius+width)))continue;
          // A translucent expanding shell reaches the actual blast edge. Keep
          // the hot core small so nearby ships remain legible through the blast.
          effectBillboard(data,e.pos,eye,right,up,core,phase.color,age,2);
          // Keep the authored 48 segments close up; subpixel arcs need fewer.
          const segments=ringRadius/pixel>40?48:ringRadius/pixel>12?24:12;
          effectRing(data,e.pos,eye,right,up,ringRadius,width,phase.color,phase.opacity,segments);
          if(ringRadius/pixel>40){const tilted=up.map((v,j)=>v*Math.cos(.7)+this.cameraForward[j]*Math.sin(.7));effectRing(data,e.pos,eye,right,tilted,ringRadius,width,phase.color,phase.opacity*.25,segments);}
          continue;
        }
        const size=Math.max(pixel*(e.compact?1:e.elite?18:6),Math.min(pixel*(e.compact?20:e.elite?260:150),e.radius*(.65+age*(e.compact?.5:1.8))));
        if(!view.visible(...e.pos,size*Math.SQRT2))continue;
        effectBillboard(data,e.pos,eye,right,up,size,e.color,age,e.type);
      }
      this.setDepthWrite(false);this.setBlend(true);
      this.drawImpacts(data.view());
      this.setBlend(false);this.setDepthWrite(true);
    }
    drawCombatEffects(p,time,own=this.ownModel,index=window.GalacticDemo?.state.shipIndex??0){const layout=LAYOUTS[index];
      // Weapon beams join the shared impact batch for soft cores and halos.
      const missileCharge=p.salvoQueue?.find(q=>q.manual&&q.sound&&q.delay>0);
      if(p.charging||missileCharge){
        const progress=missileCharge?1-missileCharge.delay/missileCharge.windup:p.charge;
        const glows=[];for(let m of missileCharge?layout.tubes:layout.main){let x=M.transform(own,m);glows.push(...x,...p.profile.weaponColor,(p.profile.visual?.muzzle||22)*(.35+progress*.85))}
        this.setDepthWrite(false);this.setBlend(true);this.dynamicFlat(glows,true,.7);this.setBlend(false);this.setDepthWrite(true);
      }
      if(p.weaponCharges?.length){
        const glows=[];for(const q of p.weaponCharges)for(const pos of q.positions)glows.push(...pos,...q.color,q.size*(.25+.8*q.age/q.life));
        this.setDepthWrite(false);this.setBlend(true);this.dynamicFlat(glows,true,.7);this.setBlend(false);this.setDepthWrite(true);
      }
      const trails=(this.trailVertices??=new EffectVertices()).reset(),heads=(this.headVertices??=new EffectVertices()).reset(),eye=this.eye;
      const view=(this.effectView??=new BattleViewCulling()).update(this.vp),focal=this.height/(2*Math.tan(this.fov/2)),projectiles=p.projectiles.filter(q=>projectileInView(q,view,eye,focal));
      for(let q of projectiles){
        if(q.missile){
          if(q.trail)for(let i=1;i<q.trail.length;i++){
            const life=i/q.trail.length,a=q.trail[i-1],b=q.trail[i];trails.point(a[0]-eye[0],a[1]-eye[1],a[2]-eye[2],.6*life,.71*life,.73*life,1);trails.point(b[0]-eye[0],b[1]-eye[1],b[2]-eye[2],.6*life,.71*life,.73*life,1);
          }
          const unit=V.norm(q.velocity),tail=V.add(q.pos,V.scale(unit,-2.8));
          trails.point(tail[0]-eye[0],tail[1]-eye[1],tail[2]-eye[2],1,.56,.2,1);trails.point(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2],1,.88,.64,1);
          const c=q.color||[1,.77,.42];heads.point(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2],c[0],c[1],c[2],q.visual?.capital?mainGunGlow(q.visual,V.length(V.sub(q.pos,eye)),this.height,this.fov):4.5);
          const mx=this.segmentModel(V.add(q.pos,V.scale(unit,-.9)),q.pos,1.15);
          this.drawEffectMesh(this.missileMesh,mx,{light:[-.3,.7,1]});
        }else{
          const back=V.add(q.pos,V.scale(V.norm(q.velocity),-(q.visual?.capital?Math.min(q.visual.trail,q.age*V.length(q.velocity)):q.kind==='pd'?1.3:q.hostile?11:3))),c=q.color||(q.hostile?[.94,.3,.2]:[.6,.86,1]);
          if(q.visual?.capital){
            this.setDepthWrite(false);this.setBlend(true);
            this.drawEffectMesh(this.plumeMesh,this.segmentModel(q.pos,back,q.visual.radius*2.4),{mode:4,tint:c,opacity:.6});
            this.drawEffectMesh(this.plumeMesh,this.segmentModel(q.pos,back,q.visual.radius*.55),{mode:4,tint:[1,.96,.9],opacity:.95});
            this.setBlend(false);this.setDepthWrite(true);
            const glow=mainGunGlow(q.visual,V.length(V.sub(q.pos,this.eye)),this.height,this.fov);
            heads.point(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2],c[0]*.48,c[1]*.48,c[2]*.48,glow);heads.point(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2],1,.96,.9,glow*.32);
          }
          trails.point(back[0]-eye[0],back[1]-eye[1],back[2]-eye[2],c[0],c[1],c[2],1);trails.point(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2],c[0],c[1],c[2],1);heads.point(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2],c[0],c[1],c[2],q.hostile?2:3);
        }
      }
      if(trails.length)this.dynamicFlat(trails.view(),false,.9,true);
      const particles=(this.particleVertices??=new EffectVertices()).reset();
      for(let q of p.particles){let f=1-q.age/q.life,c=q.color||[1,.7,.36];particles.point(q.pos[0]-eye[0],q.pos[1]-eye[1],q.pos[2]-eye[2],c[0]*f,c[1]*f,c[2]*f,q.size);}
      this.setDepthWrite(false);this.setBlend(true);
      if(heads.length)this.dynamicFlat(heads.view(),true,1,true);if(particles.length)this.dynamicFlat(particles.view(),true,1,true);
      this.setBlend(false);this.setDepthWrite(true);
      this.drawSpecial(p,time);
      this.drawWeaponImpacts(p,projectiles);
    }
    async prepareCabins(options={}){this.cabins??=new Cabins(this);await this.cabins.prepare(options.base||'three-flight-assets/',options.signal);}
    drawCabin(){if(this.cabinRequest){this.cabins??=new Cabins(this);this.cabins.draw(this.cabinRequest);}}
    endFrame(){const stats=super.endFrame();if(!this.managed)this.drawCabin();return stats;}
    dispose(){this.cabins?.dispose();super.dispose();}
    flight(s,time){

      this.cabinRequest=null;this.fighterConsoleFrame=null;if(globalThis.flightController?.overview)return globalThis.flightController.drawOverview(this,s,time);
      this.begin(time);this.cabinRequest=null;
      const p=s.flight,layout=LAYOUTS[s.shipIndex],a=axes(p),{forward,right,up}=a;
      const shipFrame=M.camera(p.pos,forward,up),own=shipMatrix(p,s.shipIndex);
      this.flightCameraMatrix=shipFrame;this.ownModel=own;
      const blend=p.cameraBlend??(p.external?1:0);
      const bridge=layout.bridge,zoom=p.cameraZoom||1,orbit=p.orbitYaw||0;
      const c=layout.chase,co=Math.cos(orbit),si=Math.sin(orbit);
      const chase=[(c[0]*co+c[2]*si)*zoom,(c[1]+(p.orbitPitch||0)*c[2])*zoom,(-c[0]*si+c[2]*co)*zoom];
      const arc=Math.sin(blend*Math.PI)*layout.length*.15;
      const eyeLocal=bridge.map((v,i)=>mix(v,chase[i],blend));eyeLocal[0]+=arc;eyeLocal[1]+=arc*.8;
      const focus=V.scale(layout.focus,Math.max(0,1-Math.abs(orbit)*1.4));
      const extDir=V.norm(V.sub(focus,chase)),dirLocal=V.norm([extDir[0]*blend,extDir[1]*blend,mix(-1,extDir[2],blend)]);
      const localShake=p.shake||0;eyeLocal[0]+=Math.sin(time*53)*localShake*.18;eyeLocal[1]+=Math.cos(time*63)*localShake*.12;
      let eye=M.transform(shipFrame,eyeLocal),dir=V.add(V.scale(right,dirLocal[0]),V.add(V.scale(up,dirLocal[1]),V.scale(forward,-dirLocal[2])));
      if(blend<.17){const pose=p.cabinPose,base=!p.profile.capital?[0,0,0]:(p.cabinKind||cockpitClass({role:'line',length:layout.length}))==='bastion'?[0,3.75,2]:[0,3.8,-1];if(pose){eye=V.add(eye,V.add(V.scale(right,pose.eye[0]-base[0]),V.add(V.scale(up,pose.eye[1]-base[1]),V.scale(forward,-pose.eye[2]+base[2]))));dir=V.add(V.scale(forward,Math.cos(pose.yaw)*Math.cos(pose.pitch)),V.add(V.scale(right,Math.sin(pose.yaw)*Math.cos(pose.pitch)),V.scale(up,Math.sin(pose.pitch))));}}
      if(p.detonated){const e=p.detonated,q=Math.min(1,e.age/.3),dest=V.add(e.pos,[e.radius*.72,e.radius*.4,e.radius*1.35]);eye=eye.map((v,i)=>mix(v,dest[i],q));dir=V.norm(V.sub(e.pos,eye));}
      this.eye=eye;this.cameraForward=V.norm(dir);this.cameraUp=up;
      const targetFov=speedFovOffset(p.speed,p.profile.maxSpeed,p.profile.capital);
      const fovDt=this.speedFovTime==null?0:Math.min(.1,Math.max(0,time-this.speedFovTime));
      if(this.speedFovShip!==s.shipIndex){this.speedFov=0;this.speedFovShip=s.shipIndex;}
      this.speedFov=smoothSpeedFov(this.speedFov||0,targetFov,fovDt);this.speedFovTime=time;
      const fov=mix(s.shipIndex===3?65:62,s.shipIndex===3?61:55,blend)+this.speedFov;
      this.fov=fov*Math.PI/180;
      const projection=M.perspective(this.fov,this.width/this.height,mix(.035,Math.max(.035,layout.length*.04),blend),22000);projection[9]=-.06;
      this.projectionOffset=-.06;this.projectionShiftX=0;
      this.vp=M.mul(projection,M.lookAt(eye,V.add(eye,dir),up));
      if(globalThis.flightController)globalThis.flightController.presentation.environment(this,time);else this.environment(s,time);
      if(globalThis.flightController)globalThis.flightController.drawFleet(this);else for(let t of p.targets){if(t.hp>0&&!t.terrainTurret){const model=practiceTargetMatrix(M,t);this.drawVessel(t.kind,model,{light:[-.3,.65,1],exposure:.85});this.drawShield(t,t.kind,model);}}
      // The camera moves above the real hull toward the bridge. No cut, reset, or dark frame.
      const ownOpacity=p.detonated?0:1;
      if(ownOpacity>.001)this.drawVessel(s.shipIndex,own,{light:[-.5,.9,.75],opacity:ownOpacity,exposure:.83},p.joints);
      this.drawShield(p,s.shipIndex,own,p.detonated?0:1);
      // All exhaust starts inside the measured nozzle surface and follows the ship frame.
      if(ownOpacity>.05&&blend>.04)this.drawExhaust(s.shipIndex,own,p.throttle,p.boostActive,time,ownOpacity);
      this.drawCombatEffects(p,time,own);if(globalThis.flightController&&!globalThis.flightController.fullDetail)globalThis.flightController.presentation.draw(this,globalThis.flightController,false);
      // The interior is fixed to the bridge, never parented to the moving external camera.
      const cabinKind=shipCabinClass(fleet.ships[s.shipIndex].id,p.profile),interiorAlpha=p.detonated||!cabinKind?0:clamp(1-blend/.17,0,1);
      if(interiorAlpha>0){const battle=globalThis.flightController;this.cabinRequest={kind:cabinKind,feedbackEpoch:battle?(battle.replayId||battle.id)+':'+(battle.feedbackEpoch||0):'practice',shieldHits:p.shieldHits,console:p.profile.capital?this.bridgeInstrumentState:this.fighterInstrumentState,pose:p.cabinPose,time,fov:this.fov,opacity:interiorAlpha,row:[0,...p.pos,Math.PI-p.yaw,p.pitch,p.hull,p.shield,-1,p.speed/8,p.gunCooldown,p.missileCooldown],meta:{id:battle?.selected,type:fleet.ships[s.shipIndex].id,maxHp:100,maxShield:100},auto:p.ai,throttle:p.throttle/100};}
    }
    pickFighterConsole(x,y){
      if(this.cabinRequest)return this.cabins?.pickFighterConsole(x,y)||null;
      const m=this.fighterConsoleFrame;if(!m)return null;const ray=this.ray(x,y),relative=ray.origin.map((v,i)=>v-m[12+i]),local=v=>[0,4,8].map(j=>v.reduce((a,n,i)=>a+n*m[j+i],0));
      return this.fighterConsole.pick(local(relative),local(ray.direction));
    }
    pickBridgeConsole(x,y){return this.cabinRequest?this.cabins?.pickBridgeConsole(x,y)||null:null;}
    bridgeConsoleLayout(){return this.cabinRequest?this.cabins?.bridgeConsoleLayout()||[]:[];}
    fighterConsoleLayout(){if(this.cabinRequest)return this.cabins?.fighterConsoleLayout()||[];const m=this.fighterConsoleFrame;return m?this.fighterConsole.layout(p=>this.project(M.transform(m,p))):[];}
    ray(x,y){
      const right=V.norm(V.cross(this.cameraForward,this.cameraUp)),up=V.cross(right,this.cameraForward),tan=Math.tan(this.fov/2);
      const nx=x/this.width*2-1,ny=1-y/this.height*2;
      const direction=V.norm(V.add(this.cameraForward,V.add(V.scale(right,(nx+(this.projectionShiftX||0))*tan*this.width/this.height),V.scale(up,(ny+(this.projectionOffset||0))*tan))));
      return {origin:[...this.eye],direction};
    }
    project(p){const m=this.vp,x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],y=m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],z=m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];return{x:(x/w*.5+.5)*this.width,y:(-y/w*.5+.5)*this.height,z:z/w,visible:w>0,w}}
  }

  return {Renderer,V,M,clamp,mix,seeded,LAYOUTS,axes,shipMatrix,turretTransforms,jointTransforms};
}
