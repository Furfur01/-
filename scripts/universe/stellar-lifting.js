import * as T from 'three';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';

const TAU=Math.PI*2,INTAKE_X=-31.8;
const point=(x,y,z)=>new T.Vector3(x,y,z);

function lineGeometry(curves,steps){
 const positions=[];
 for(const curve of curves){const samples=curve.getPoints(steps);for(let i=1;i<samples.length;i++)positions.push(...samples[i-1].toArray(),...samples[i].toArray());}
 return new LineSegmentsGeometry().setPositions(positions);
}

// LineSegments2 expands open segments into camera-facing strips; width stays readable in CSS pixels.
const lineMaterial=(color,linewidth,opacity,options={})=>new LineMaterial({color,linewidth,opacity,transparent:true,depthWrite:false,toneMapped:false,worldUnits:false,alphaToCoverage:true,...options});

function surfacePatch(center,normal,radius,angularRadius,segments){
 // Radial subdivisions keep triangle interiors above the raymarched photosphere, not just their vertices.
 const geometry=new T.RingGeometry(0,1,segments,6),positions=geometry.attributes.position;
 const tangent=point(0,0,1).cross(normal).normalize(),bitangent=normal.clone().cross(tangent),p=new T.Vector3();
 for(let i=0;i<positions.count;i++){
  p.copy(normal).addScaledVector(tangent,positions.getX(i)*angularRadius).addScaledVector(bitangent,positions.getY(i)*angularRadius).normalize().multiplyScalar(radius).add(center);
  positions.setXYZ(i,p.x,p.y,p.z);
 }
 geometry.computeBoundingSphere();return geometry;
}

function extractionField({starRadius=80,starDistance=starRadius+91,dysonRadius=starRadius*2.5,detailed=true}={}){
 const group=new T.Group();group.name='stellar-extraction-field';group.userData.effect=true;
 const center=point(-starDistance,0,0),surfaceOffset=Math.max(.035,starRadius*.0005);
 // All contact points are on the visible hemisphere, and every beam stops at the surface.
 const capAngle=Math.min(.3,Math.acos(starRadius/(starDistance-35))*.52),patchAngle=Math.min(.08,capAngle*.45),heatPatchAngle=Math.min(.12,capAngle*.55);
 const normalAt=(angle,azimuth)=>point(Math.cos(angle),Math.sin(angle)*Math.cos(azimuth),Math.sin(angle)*Math.sin(azimuth));
 const surface=normal=>normal.clone().multiplyScalar(starRadius+surfaceOffset).add(center);
 const flowCurve=(normal,azimuth,mouthRadius,spread=1)=>{
  const start=surface(normal),mouth=point(INTAKE_X,Math.cos(azimuth)*mouthRadius,Math.sin(azimuth)*mouthRadius),reach=mouth.x-start.x;
  const bulge=Math.max(12,starRadius*.74,reach*.35)*spread;
  const first=start.clone().add(point(reach*.29,Math.cos(azimuth)*bulge*.72,Math.sin(azimuth)*bulge*.72));
  const second=point(mouth.x-reach*.32,Math.cos(azimuth)*bulge,Math.sin(azimuth)*bulge);
  return new T.CubicBezierCurve3(start,first,second,mouth);
 };
 const fieldCurves=Array.from({length:detailed?12:6},(_,i)=>{
  const angle=i/(detailed?12:6)*TAU,start=surface(normalAt(capAngle,angle)),mouth=point(INTAKE_X,Math.cos(angle)*7.1,Math.sin(angle)*7.1),reach=mouth.x-start.x;
  // The control cage opens to a stellar-scale magnetic arch; the warm flow stays inside it.
  const outerRadius=Math.max(12,starRadius*.94),y=Math.cos(angle)*outerRadius,z=Math.sin(angle)*outerRadius;
  return new T.CubicBezierCurve3(start,point(start.x+reach*.2,y,z),point(mouth.x-reach*.3,y,z),mouth);
 });
 const fieldMaterial=lineMaterial(0x20dff7,detailed?2.7:2.3,.8);
 const fieldLines=new LineSegments2(lineGeometry(fieldCurves,detailed?48:24),fieldMaterial);fieldLines.name='open-magnetic-funnel';group.add(fieldLines);

 const spots=Array.from({length:detailed?3:1},(_,i)=>({azimuth:i/3*TAU+.35,normal:normalAt(capAngle*.62,i/3*TAU+.35)}));
 const heatMaterial=new T.ShaderMaterial({
  uniforms:{uTime:{value:0},uPower:{value:0}},transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false,
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform float uTime;uniform float uPower;varying vec2 vUv;
   void main(){vec2 p=vUv*2.-1.;float a=atan(p.y,p.x);float r=length(p)+sin(a*7.+uTime*1.6)*.025;
    float rim=1.-smoothstep(.76,1.,r);float core=1.-smoothstep(.48,.76,r);
    vec3 color=mix(vec3(1.15,.17,.015),vec3(2.,1.8,1.12),core);
    float pulse=.96+.04*sin(uTime*2.+r*17.);gl_FragColor=vec4(color,min(.99,rim*mix(.76,.99,core)*pulse*uPower));
    #include <colorspace_fragment>
   }`
 });
 const prominenceCurves=[];
 for(const {normal,azimuth}of spots){
  const patch=new T.Mesh(surfacePatch(center,normal,starRadius+surfaceOffset,heatPatchAngle,detailed?40:20),heatMaterial);patch.name='stellar-surface-hotspot';patch.renderOrder=1;group.add(patch);
  const tangent=point(0,-Math.sin(azimuth),Math.cos(azimuth));
  for(let j=0;j<(detailed?2:1);j++){
   const offset=patchAngle*(.5+j*.25),start=surface(normal.clone().addScaledVector(tangent,offset).normalize()),end=surface(normal.clone().addScaledVector(tangent,-offset).normalize());
   const crown=surface(normal).addScaledVector(normal,starRadius*patchAngle*(1.8+j*.65));
   prominenceCurves.push(new T.QuadraticBezierCurve3(start,crown,end));
  }
 }
 const prominenceMaterial=lineMaterial(0xffb353,1.9,.8);
 const prominences=new LineSegments2(lineGeometry(prominenceCurves,detailed?32:16),prominenceMaterial);prominences.name='heated-prominences';group.add(prominences);

 const laserCurves=Array.from({length:detailed?3:2},(_,i)=>{
  const spot=spots[i%spots.length],a=spot.azimuth+(detailed?0:(i===0?-.3:.3));
  return new T.LineCurve3(point(-34.2,Math.cos(a)*8.2,Math.sin(a)*8.2),surface(spot.normal));
 });
 const laserMaterial=lineMaterial(0x9be6ff,3.2,.94);
 const lasers=new LineSegments2(lineGeometry(laserCurves,1),laserMaterial);lasers.name='extractor-surface-heating-lasers';group.add(lasers);

 const dysonGroup=new T.Group();dysonGroup.name='dyson-powered-heating';dysonGroup.userData.dynamic=true;group.add(dysonGroup);
 const orbitAngle=Math.min(.55,Math.acos(starRadius/dysonRadius)*.65);
 const dysonCurves=spots.map(({normal,azimuth})=>new T.LineCurve3(normalAt(capAngle*.62+orbitAngle,azimuth).multiplyScalar(dysonRadius).add(center),surface(normal)));
 const dysonMaterial=lineMaterial(0x72bcff,3,.86);
 const dysonBeams=new LineSegments2(lineGeometry(dysonCurves,1),dysonMaterial);dysonBeams.name='dyson-orbit-surface-beams';dysonGroup.add(dysonBeams);
 const nodeBox=new T.BoxGeometry(),nodePrism=new T.CylinderGeometry(1.15,1.45,.2,3);
 const nodeDark=new T.MeshStandardMaterial({color:0x283541,metalness:.7,roughness:.42}),nodeEdge=new T.MeshStandardMaterial({color:0xa4b4bf,metalness:.55,roughness:.34}),nodeLens=new T.MeshBasicMaterial({color:0x75d9ff,toneMapped:false});
 const nodePart=(parent,size,at,material)=>{const mesh=new T.Mesh(nodeBox,material);mesh.scale.set(...size);mesh.position.set(...at);parent.add(mesh);};
 for(const [index,curve]of dysonCurves.entries()){
  const node=new T.Group();node.name=`dyson-heating-projector-${index+1}`;node.position.copy(curve.v1);node.quaternion.setFromUnitVectors(point(0,0,1),curve.v2.clone().sub(curve.v1).normalize());dysonGroup.add(node);
  nodePart(node,[5.2,3.2,1.4],[0,0,-.9],nodeDark);nodePart(node,[6.1,4,.25],[0,0,-.14],nodeEdge);
  for(const side of [-1,1]){nodePart(node,[2.8,4.2,.35],[side*4.1,0,-.65],nodeEdge);nodePart(node,[2.2,3.6,.4],[side*4.1,0,-.4],nodeDark);}
  const lens=new T.Mesh(nodePrism,nodeLens);lens.rotation.x=Math.PI/2;lens.position.z=.04;node.add(lens);
 }

 // Open, moving filaments replace the old closed luminous suction tube.
 const matterCurves=[];
 for(const {normal,azimuth}of spots)for(let i=0;i<(detailed?3:2);i++){
  const angle=azimuth+(i-1)*.18,n=normal.clone().add(point(0,Math.cos(angle)*patchAngle*(i-1)*.3,Math.sin(angle)*patchAngle*(i-1)*.3)).normalize();
  matterCurves.push(flowCurve(n,angle,1.4+i*1.5,.66+i*.07));
 }
 const particlesPerCurve=detailed?12:6,particleCount=matterCurves.length*particlesPerCurve,positions=new Float32Array(particleCount*6),colors=new Float32Array(particleCount*6);
 for(let i=0;i<particleCount;i++)colors.set([.55,.095,.004,1,.78,.3],i*6);
 const matterGeometry=new LineSegmentsGeometry().setPositions(positions).setColors(colors);matterGeometry.attributes.instanceStart.data.setUsage(T.DynamicDrawUsage);
 const matterMaterial=lineMaterial(0xffffff,detailed?3.8:3.3,.98,{vertexColors:true});
 const matter=new LineSegments2(matterGeometry,matterMaterial);matter.name='stellar-matter-inflow';group.add(matter);

 const pulseCurves=[...laserCurves,...dysonCurves],pulsePositions=new Float32Array(pulseCurves.length*3*6),pulseGeometry=new LineSegmentsGeometry().setPositions(pulsePositions);
 pulseGeometry.attributes.instanceStart.data.setUsage(T.DynamicDrawUsage);
 const pulseMaterial=lineMaterial(0xe4f7ff,4.5,.96);
 const pulses=new LineSegments2(pulseGeometry,pulseMaterial);pulses.name='surface-directed-laser-pulses';group.add(pulses);

 const allCurves=[...fieldCurves,...matterCurves,...prominenceCurves,...laserCurves,...dysonCurves];
 let boundsRadius=66;for(const curve of allCurves)for(const p of curve.getPoints(48))boundsRadius=Math.max(boundsRadius,p.length()+starRadius*heatPatchAngle);
 for(const curve of dysonCurves)boundsRadius=Math.max(boundsRadius,curve.v1.length()+7);
 for(const geometry of [matterGeometry,pulseGeometry])geometry.boundingSphere=new T.Sphere(new T.Vector3(),boundsRadius);
 const head=new T.Vector3(),tail=new T.Vector3();
 group.userData.starRadius=starRadius;group.userData.starDistance=starDistance;group.userData.dysonRadius=dysonRadius;
 return {group,boundsRadius,update(time,{dysonLevel=0,effectLevel=2}){
  const power=effectLevel===1?.9:1;fieldMaterial.opacity=((detailed?.8:.88)+Math.sin(time*.7)*.035)*power;
  heatMaterial.uniforms.uTime.value=time;heatMaterial.uniforms.uPower.value=dysonLevel>0?1.12:1;
  prominenceMaterial.opacity=(.78+Math.sin(time*1.1)*.08)*power;laserMaterial.opacity=.94*power;
  dysonGroup.visible=dysonLevel>0;dysonMaterial.opacity=(.82+Math.sin(time*1.3)*.045)*power;
  for(let i=0;i<particleCount;i++){
   const curve=matterCurves[Math.floor(i/particlesPerCurve)],t=(i%particlesPerCurve/particlesPerCurve+time*(.16+(i%3)*.013))%1;
   curve.getPoint(Math.max(0,t-(detailed?.036:.075)),tail);curve.getPoint(t,head);tail.toArray(positions,i*6);head.toArray(positions,i*6+3);
  }
  matterGeometry.attributes.instanceStart.data.needsUpdate=true;matterMaterial.opacity=.98*power;
  const activeCurves=laserCurves.length+(dysonLevel>0?dysonCurves.length:0);pulseGeometry.instanceCount=activeCurves*3;
  for(let i=0;i<activeCurves;i++)for(let j=0;j<3;j++){
   const t=(j/3+time*.42)%1,at=(i*3+j)*6;pulseCurves[i].getPoint(Math.max(0,t-.045),tail);pulseCurves[i].getPoint(t,head);tail.toArray(pulsePositions,at);head.toArray(pulsePositions,at+3);
  }
  pulseGeometry.attributes.instanceStart.data.needsUpdate=true;
 }};
}

export function attachStellarLifting(item,options={}){
 const field=extractionField(options),mechanicalUpdate=item.update.bind(item);item.effects.add(field.group);item.effects.visible=false;item.boundsRadius=field.boundsRadius;
 // Match the star raymarcher's logarithmic depth, including the retained internal plasma materials.
 const shaders=new Set();item.group.traverse(o=>{for(const material of Array.isArray(o.material)?o.material:o.material?[o.material]:[])if(material.isShaderMaterial)shaders.add(material);});
 for(const material of shaders){
  if(material.isLineMaterial)continue;
  material.vertexShader='#include <common>\n#include <logdepthbuf_pars_vertex>\n'+material.vertexShader.replace(/}\s*$/,'\n#include <logdepthbuf_vertex>\n}');
  material.fragmentShader='#include <logdepthbuf_pars_fragment>\n'+material.fragmentShader.replace(/void main\(\)\s*{/,'void main(){\n#include <logdepthbuf_fragment>\n');
 }
 item.update=(dt,time,settings)=>{
  const active=!!settings.enabled&&settings.progress>=.62&&settings.effectLevel>0;item.effects.visible=active;
  if(active){mechanicalUpdate(dt,time,settings);field.update(time,settings);}
 };
 return item;
}

export function createLightExtractor(options={}){
 const group=new T.Group();group.name='stellar_lifting';group.userData.facilityId='stellar_lifting';const effects=new T.Group();effects.userData.effect=true;effects.name='effects';group.add(effects);
 const dark=new T.MeshStandardMaterial({color:0x1c2c3a,metalness:.7,roughness:.48}),edge=new T.MeshStandardMaterial({color:0x8296a2,metalness:.66,roughness:.43}),copper=new T.MeshStandardMaterial({color:0xba7250,metalness:.7,roughness:.4});
 const parts=[];const phase=threshold=>{const object=new T.Group();object.userData.phase=true;group.add(object);parts.push({object,threshold});return object;};
 const frame=phase(.03),intake=phase(.24),processor=phase(.43),radiators=phase(.62),boxGeometry=new T.BoxGeometry();
 const box=(parent,size,at,material=dark)=>{const mesh=new T.Mesh(boxGeometry,material);mesh.scale.set(...size);mesh.position.set(...at);parent.add(mesh);};
 for(const y of [-7.8,7.8])for(const z of [-7.8,7.8])box(frame,[68,1.5,1.5],[1,y,z],edge);
 box(frame,[53,1.8,9],[3,-5.5,0]);box(processor,[17,15,14],[25,0,0]);box(processor,[12,2,14],[42,-4.5,0],edge);
 const ringGeometry=new T.TorusGeometry(8.2,.65,4,20);
 for(const x of [-31,-20,-7,6]){const ring=new T.Mesh(ringGeometry,x===-31?copper:edge);ring.rotation.y=Math.PI/2;ring.position.x=x;intake.add(ring);}
 for(const sign of [-1,1]){box(radiators,[28,1.2,19],[0,0,sign*23],edge);box(processor,[20,6,6],[23,0,sign*11]);}
 const item={group,effects,parts,update(){},setProgress(progress){for(const part of parts)part.object.visible=progress>=part.threshold;}};
 return attachStellarLifting(item,{...options,detailed:false});
}
