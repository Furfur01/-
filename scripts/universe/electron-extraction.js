import * as T from 'three';

// A shared septum chamber lets the circulating path bend away while the
// extracted bunch continues straight along the exact ring tangent.
export function createElectronExtraction({junction,target,ringRadius=178,ringHeight=-9}){
 const group=new T.Group();group.name='electron-three-way-extraction';
 const radial=new T.Vector3(junction.x,0,junction.z).normalize();
 const axis=target.clone().sub(junction).normalize(),up=new T.Vector3().crossVectors(axis,radial).normalize();
 const basis=new T.Matrix4().makeBasis(radial,up,axis);
 group.position.copy(junction);group.quaternion.setFromRotationMatrix(basis);
 const localToWorld=p=>p.clone().applyMatrix4(basis).add(junction);
 const steel=new T.MeshStandardMaterial({color:0x8498ad,metalness:.78,roughness:.3});
 const dark=new T.MeshStandardMaterial({color:0x1a2636,metalness:.7,roughness:.36});
 const copper=new T.MeshStandardMaterial({color:0xc28b55,metalness:.82,roughness:.27});
 const violet=new T.MeshBasicMaterial({color:0xc3a4ff,toneMapped:false});
 const cyan=new T.MeshBasicMaterial({color:0x83e9ff,toneMapped:false});
 const add=(parent,geometry,material,position=new T.Vector3())=>{const mesh=new T.Mesh(geometry,material);mesh.position.copy(position);parent.add(mesh);return mesh;};
 const box=(parent,size,position,material)=>add(parent,new T.BoxGeometry(...size),material,new T.Vector3(...position));
 const tube=(parent,curve,radius,material,segments=48)=>add(parent,new T.TubeGeometry(curve,segments,radius,12,false),material);
 const torus=(parent,radius,thickness,z,material,segments=64)=>add(parent,new T.TorusGeometry(radius,thickness,8,segments),material,new T.Vector3(0,0,z));
 const port=(position,direction)=>{
  const socket=new T.Group();socket.position.copy(position);socket.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),direction);group.add(socket);
  torus(socket,3.5,.45,0,steel);torus(socket,3.1,.12,.35,cyan);
  for(let j=0;j<8;j++){const a=j*Math.PI/4;box(socket,[.65,.65,1.1],[Math.cos(a)*4,Math.sin(a)*4,0],copper);}
 };
 // The incoming ring port, curved return port and straight extraction port
 // share a widening Y shell until the two outgoing bores have separated.
 const halfWidth=5.5,split=ringRadius*Math.acos((ringRadius-halfWidth)/(ringRadius+halfWidth));
 const ringPoint=q=>new T.Vector3(ringRadius*(Math.cos(q/ringRadius)-1),0,ringRadius*Math.sin(q/ringRadius));
 const ringEdge=(q,side)=>{const p=ringPoint(q),r=side*halfWidth;return [p.x+Math.cos(q/ringRadius)*r,p.z+Math.sin(q/ringRadius)*r];};
 const outline=[];for(let q=-22;q<72;q+=8)outline.push(ringEdge(q,-1));outline.push(ringEdge(72,-1));
 const ringPortEdge=outline.length-1;outline.push(ringEdge(72,1),ringEdge(68,1),ringEdge(split,1),[-halfWidth,85]);
 const straightPortEdge=outline.length-1;outline.push([halfWidth,85],[halfWidth,0],ringEdge(-11,1),ringEdge(-22,1));
 const shape=new T.Shape(outline.map(([x,z])=>new T.Vector2(x,z)));
 const plate=new T.ExtrudeGeometry(shape,{depth:.8,bevelEnabled:true,bevelThickness:.25,bevelSize:.25,bevelSegments:1});
 plate.rotateX(Math.PI/2);
 for(const y of [-5.5,6.3])add(group,plate,dark,new T.Vector3(0,y,0));
 for(let i=0;i<outline.length-1;i++){
  if(i===ringPortEdge||i===straightPortEdge)continue;
  const [x,z]=outline[i],[xx,zz]=outline[i+1],wall=box(group,[.7,10.5,Math.hypot(xx-x,zz-z)],[(x+xx)/2,0,(z+zz)/2],steel);
  wall.rotation.y=Math.atan2(xx-x,zz-z);
 }
 for(const y of [-6.5,6.5]){
  box(group,[.65,.28,100],[0,y,33],cyan);
  const guide=[];for(let q=-20;q<=72;q+=2){const p=ringPoint(q);p.y=y;guide.push(p);}
  tube(group,new T.CatmullRomCurve3(guide),.24,copper,46);
  for(const z of [4,24,44]){box(group,[7,.65,1.1],[0,y,z],dark);box(group,[2.2,.72,.45],[0,y,z],violet);}
 }
 for(const q of [-22,72]){
  const sign=Math.sign(q),p=ringPoint(q),direction=new T.Vector3(-Math.sin(q/ringRadius),0,Math.cos(q/ringRadius)).multiplyScalar(sign);
  port(p,direction);
 }
 port(new T.Vector3(0,0,85),new T.Vector3(0,0,1));
 // The extraction path never bends: the magnetic mirrors sit downstream of
 // the split, where the curved ring has already moved clear of the barrel.
 const entrance=localToWorld(new T.Vector3(0,0,85));
 const orientation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),axis);
 const barrel=new T.Group();barrel.name='superconducting-magnetic-confinement';
 barrel.position.set(0,0,85);group.add(barrel);
 const drift=add(barrel,new T.CylinderGeometry(2.8,2.8,22,24,1,true).rotateX(Math.PI/2),dark,new T.Vector3(0,0,11));
 drift.name='open-extraction-drift-tube';
 for(const z of [0,5,10,15,20]){torus(barrel,3.35,.32,z,steel);torus(barrel,3.0,.1,z+.45,cyan);}
 for(const [index,z]of [26,41,56,71].entries()){
  const radius=10.8-index*.75,bank=new T.Group();bank.position.z=z;bank.name=`magnetic-mirror-bank-${index+1}`;barrel.add(bank);
  for(const dz of [-2.2,2.2]){torus(bank,radius,.7,dz,steel,8);torus(bank,radius-1.1,.32,dz,copper,64);torus(bank,radius-1.7,.16,dz+.15,violet);}
  for(let j=0;j<8;j++){
   const a=(j+.5)*Math.PI/4,block=box(bank,[3.5,2.3,4.8],[Math.cos(a)*(radius-1.2),Math.sin(a)*(radius-1.2),0],dark);block.rotation.z=a-Math.PI/2;
   const winding=box(bank,[2.7,.24,3.8],[Math.cos(a)*(radius-2.4),Math.sin(a)*(radius-2.4),0],copper);winding.rotation.z=a-Math.PI/2;
   const status=box(bank,[1.6,.12,2.7],[Math.cos(a)*(radius+.25),Math.sin(a)*(radius+.25),0],cyan);status.rotation.z=a-Math.PI/2;
  }
 }
 for(let i=0;i<6;i++){
  const a=(i+.5)*Math.PI/3,x=Math.cos(a),y=Math.sin(a);
  const spine=box(barrel,[.8,1.3,54],[x*12.8,y*12.8,47],steel);spine.rotation.z=a;
  box(barrel,[1.9,2.3,10],[x*13,y*13,21],dark);
  for(const z of [26,41,56,71]){
   const radius=10.8-(z-26)/15*.75;
   const brace=box(barrel,[13-radius,.7,1.5],[x*(13+radius)/2,y*(13+radius)/2,z],copper);brace.rotation.z=a;
  }
 }
 torus(barrel,6.1,.5,78,steel);torus(barrel,5.5,.22,78.6,violet);
 // Closed meridional loops show the return flux outside the yokes and the
 // pinched field through the bore. Moving highlights convey increasing power.
 const fluxMaterial=new T.MeshBasicMaterial({color:0xc1a4ff,transparent:true,opacity:.35,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
 const innerMaterial=new T.MeshBasicMaterial({color:0xb9f5ff,transparent:true,opacity:.45,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
 const haloMaterial=new T.MeshBasicMaterial({color:0x9871ff,transparent:true,opacity:.1,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
 const pulses=[],pulseMaterial=new T.MeshBasicMaterial({color:0xf5eaff,transparent:true,opacity:.8,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});
 const pulseGeometry=new T.SphereGeometry(.32,8,6);
 for(let i=0;i<10;i++){
  const angle=i*Math.PI/5,point=(r,z)=>new T.Vector3(Math.cos(angle)*r,Math.sin(angle)*r,z);
  const curve=new T.CatmullRomCurve3([point(4.6,24),point(3.7,42),point(2,65),point(1.35,79),point(5.8,88),point(14.8,72),point(16,43),point(11.8,22)],true,'centripetal');
  const line=add(barrel,new T.TubeGeometry(curve,100,.18,6,true),i%2?fluxMaterial:innerMaterial);line.name='magnetic-return-field';
  add(barrel,new T.TubeGeometry(curve,100,.42,6,true),haloMaterial);
  const dot=add(barrel,pulseGeometry,pulseMaterial);pulses.push({dot,curve,phase:i/10});
 }
 const muzzle=entrance.clone().addScaledVector(axis,79);
 const focus=junction.clone().addScaledVector(axis,84);
 const cameraOffset=radial.clone().multiplyScalar(130).addScaledVector(axis,48).add(new T.Vector3(0,92,0));
 return {group,muzzle,orientation,focus,cameraOffset,entrance,axis,
  update(time,charge,fire){
   fluxMaterial.opacity=.16+charge*.62+fire*.2;innerMaterial.opacity=.18+charge*.68+fire*.14;haloMaterial.opacity=.025+charge*.09+fire*.05;pulseMaterial.opacity=.2+charge*.8;
   violet.color.setRGB(.46+charge*.35,.28+charge*.28,.85+charge*.45);
   for(const {dot,curve,phase}of pulses)dot.position.copy(curve.getPoint((time*(.12+charge*.24)+phase)%1));
  },
 };
}
