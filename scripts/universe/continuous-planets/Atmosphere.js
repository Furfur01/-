import { noiseGLSL } from './materials.js';
import {makeRandom} from './noise.js';
export function createSolidAtmosphere({THREE,type,seed,radius}){
 const root=new THREE.Group(),clouds=new THREE.Group();root.name='atmosphere';clouds.name='weather';
 const outer=type==='terrestrial'?1.10:type==='mars'?1.075:1.065;
 const uniforms={uEye:{value:new THREE.Vector3(0,0,radius*4)},uSun:{value:new THREE.Vector3(.5,.5,1).normalize()},uRadius:{value:radius},uOuter:{value:outer},uColor:{value:new THREE.Color().setRGB(...(type==='terrestrial'?[.17,.36,.76]:type==='mars'?[.62,.29,.12]:[.12,.077,.046]))},uStrength:{value:type==='terrestrial'?1.1:type==='mars'?.85:.14}};
 const vertex=`
 #include <common>
 #include <logdepthbuf_pars_vertex>
 varying vec3 vP;
 void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
 #include <logdepthbuf_vertex>
 }`;
 const material=new THREE.ShaderMaterial({uniforms,side:THREE.BackSide,transparent:true,depthWrite:false,vertexShader:vertex,fragmentShader:`
 #include <common>
 #include <logdepthbuf_pars_fragment>
 varying vec3 vP;uniform vec3 uEye,uSun,uColor;uniform float uRadius,uOuter,uStrength;
 vec2 hit(vec3 ro,vec3 rd,float r){float b=dot(ro,rd),c=dot(ro,ro)-r*r,h=b*b-c;if(h<0.)return vec2(-1);float s=sqrt(h);return vec2(-b-s,-b+s);}
 void main(){
 #include <logdepthbuf_fragment>
 vec3 ro=uEye/uRadius,rd=normalize(vP-uEye);vec2 span=hit(ro,rd,uOuter);float a=max(0.,span.x),b=span.y;
 vec2 ground=hit(ro,rd,.998);if(ground.x>0.)b=min(b,ground.x);if(b<=a)discard;
 float optical=0.,light=0.;float ds=(b-a)/8.;
 for(int i=0;i<8;i++){vec3 p=ro+rd*(a+(float(i)+.5)*ds);float alt=max(0.,length(p)-1.);float den=exp(-alt/(uOuter-1.)*4.);float sun=dot(normalize(p),uSun);float lit=smoothstep(-.1,.24,sun);optical+=den*ds;light+=den*ds*lit;}
 float mu=dot(rd,uSun),phase=.65+.35*mu*mu;vec3 color=uColor*phase*(.12+light/max(.00001,optical)*1.1);
 color+=vec3(.5,.25,.10)*pow(max(0.,mu),12.)*light*2.;float alpha=1.-exp(-optical*uStrength*9.);
 if(alpha<.0001)discard;gl_FragColor=vec4(color,alpha);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const geometry=new THREE.SphereGeometry(radius*outer,64,32),mesh=new THREE.Mesh(geometry,material);mesh.name='integrated-atmosphere';mesh.renderOrder=4;root.add(mesh);
 let cloudMaterial,cloudGeometry;
 if(type==='terrestrial'){
  const random=makeRandom(`${seed}:water-clouds`),offset=new THREE.Vector3(random()*113,random()*157,random()*193);
  cloudMaterial=new THREE.ShaderMaterial({uniforms:{uEye:uniforms.uEye,uSun:uniforms.uSun,uRadius:{value:radius},uTime:{value:0},uSeedOffset:{value:offset}},side:THREE.DoubleSide,transparent:true,depthWrite:false,vertexShader:vertex,fragmentShader:`
  #include <common>
  #include <logdepthbuf_pars_fragment>
  varying vec3 vP;uniform vec3 uEye,uSun,uSeedOffset;uniform float uRadius,uTime;
  ${noiseGLSL}
  void main(){
   #include <logdepthbuf_fragment>
   vec3 p=normalize(vP);float a=uTime*.006;mat2 rot=mat2(cos(a),-sin(a),sin(a),cos(a));p.xz=rot*p.xz;
   vec3 w=p*5.3+uSeedOffset;float cover=fbm(w+vec3(fbm(w*1.6)*1.4,0,0));
   float curl=fbm(p*29.+cover*3.);float alpha=smoothstep(.62,.76,cover+curl*.10)*.28;
   if(alpha<.01)discard;float sun=max(0.,dot(normalize(vP),uSun));vec3 col=mix(vec3(.09,.13,.21),vec3(.81,.87,.93),sun)*(.86+.16*curl);
   gl_FragColor=vec4(col,alpha);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`});
  cloudGeometry=new THREE.SphereGeometry(radius*1.082,96,48);const cloudMesh=new THREE.Mesh(cloudGeometry,cloudMaterial);cloudMesh.name='advected-water-clouds';cloudMesh.renderOrder=2;clouds.add(cloudMesh);
 }
 return {root,clouds,update({eyeLocal,weatherTime}){uniforms.uEye.value.copy(eyeLocal);if(cloudMaterial)cloudMaterial.uniforms.uTime.value=weatherTime||0;},setLighting({directionLocal}){uniforms.uSun.value.copy(directionLocal).normalize();},dispose(){geometry.dispose();material.dispose();cloudGeometry?.dispose();cloudMaterial?.dispose();root.clear();clouds.clear();}};
}
