import * as THREE from 'three';
import {shieldRippleGLSL} from './shield-ripple.js';
// Shared original fusion shield: angular shock rings and hexagonal cells.
export class ShieldBubble{
  constructor(parent,center,radii){
    this.hits=Array.from({length:8},()=>new THREE.Vector4(0,0,-1,9));this.str=new Float32Array(8);this.next=0;
    this.mat=new THREE.ShaderMaterial({
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,
      uniforms:{hits:{value:this.hits},hitS:{value:this.str},time:{value:0},quad:{value:new THREE.Vector4(1,1,1,1)},base:{value:.04},flash:{value:0}},
      vertexShader:`varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
      fragmentShader:`
        uniform vec4 hits[8];uniform float hitS[8];uniform float time,base,flash;uniform vec4 quad;
        varying vec3 vP;varying vec3 vN;varying vec3 vV;
        ${shieldRippleGLSL}
        void main(){
          vec3 p=normalize(vP);
          vec2 uv=vec2(atan(p.x,-p.z)/6.2832*150.,acos(clamp(p.y,-1.,1.))/3.1416*70.);
          float edge=shieldHex(p);
          float ang=atan(p.x,-p.z);float s;
          if(abs(ang)<.785)s=quad.x;else if(abs(ang)>2.356)s=quad.z;else if(ang>0.)s=quad.y;else s=quad.w;
          vec3 col=mix(vec3(1.,.25,.12),vec3(.25,.8,1.),smoothstep(.1,.6,s));
          float acc=0.;
          for(int i=0;i<8;i++){
            acc+=shieldRipple(p,hits[i].xyz,hits[i].w,hitS[i]);
          }
          float fr=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.5);
          float idle=(base*fr*(.25+.75*edge))*(s>.02?1.:0.)*(.85+.15*sin(time*3.+uv.y*.4));
          float flick=s<.25&&s>.02?(.5+.5*sin(time*40.)):1.;
          gl_FragColor=vec4(col*(acc+idle*flick+flash*fr*edge*.6),1.);
        }`
    });
    this.mesh=new THREE.Mesh(new THREE.SphereGeometry(1,96,64),this.mat);
    this.mesh.position.copy(center);this.mesh.scale.copy(radii);parent.add(this.mesh);
    this.center=center.clone();this.radii=radii.clone();
  }
  /** localPt: 舰体局部坐标 */
  hit(localPt,strength=1){
    const d=localPt.clone().sub(this.center).divide(this.radii).normalize();
    const i=this.next++%8;this.hits[i].set(d.x,d.y,d.z,0);this.str[i]=strength;
  }
  inside(localPt){const d=localPt.clone().sub(this.center).divide(this.radii);return d.lengthSq()<1}
  update(dt,t,quad){
    for(const h of this.hits)h.w+=dt;
    this.mat.uniforms.time.value=t;this.mat.uniforms.quad.value.set(...quad);
    this.mat.uniforms.flash.value*=Math.exp(-dt*5);
  }
}
