import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {createShipConstruction} from './ship-construction.js';

// Open industrial architecture: no side walls, roof panels or people. The
// overhead crane and two service galleries leave the actual hull readable.
export function createOrbitalWorkshop({openWorkshop=true}={}){
 const root=new THREE.Group();root.name='Open_Orbital_Workshop';root.userData.motion={type:'queue-driven'};
 const fixed=new THREE.Group();fixed.name='Workshop_Structure';root.add(fixed);
 const geometries=new Set(),materials={};
 for(const [name,color]of Object.entries({ivory:0xbac8c8,steel:0x344b58,dark:0x152630,yellow:0xd9a338,light:0xc6eee9,cyan:0x62bfc8})){
  materials[name]=new THREE.MeshStandardMaterial({color,metalness:.6,roughness:.44,emissive:['light','cyan'].includes(name)?color:0,emissiveIntensity:name==='light'?1.5:name==='cyan'?.65:0});
 }
 const cube=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,10),sphere=new THREE.SphereGeometry(1,8,6);[cube,cylinder,sphere].forEach(g=>geometries.add(g));
 function mesh(parent,name,geometry,size,position,material){const m=new THREE.Mesh(geometry,materials[material]);m.name=name;m.scale.set(...size);m.position.set(...position);parent.add(m);return m;}
 const box=(parent,name,size,position,mat='steel')=>mesh(parent,name,cube,size,position,mat);
 function beam(parent,name,a,b,width,mat='steel'){
  const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.sub(p),m=box(parent,name,[width,d.length(),width],p.addScaledVector(d,.5).toArray(),mat);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;
 }
 function rail(x,y,z0,z1){
  for(const h of [.45,.95])beam(fixed,'Safety_Railing',[x,y+h,z0],[x,y+h,z1],.055,'yellow');
  for(let z=z0;z<=z1;z+=2)beam(fixed,'Rail_Post',[x,y,z],[x,y+1,z],.07,'yellow');
 }
 if(openWorkshop){
  // Open-ended drydock hangs beyond the original transfer ring.
  for(const side of [-1,1]){
   const x=side*5.7;
   box(fixed,'Service_Gallery',[2,.42,20],[x,-.2,0],'steel');
   box(fixed,'Gallery_Armor',[1.94,.10,20],[x,.06,0],'ivory');
   box(fixed,'Power_Raceway',[.16,.16,19.5],[x-side*.83,.22,0],'yellow');
   box(fixed,'Lower_Truss_Chord',[.3,.3,20],[x,-1.7,0]);
   rail(x+side*.88,.12,-10,10);
   for(let z=-10;z<=10;z+=4){
    beam(fixed,'Truss_Vertical',[x,-1.7,z],[x,0,z],.18);
    if(z<10)beam(fixed,'Truss_Diagonal',[x,-1.7,z],[x,0,z+4],.16);
    box(fixed,'Gallery_Worklight',[.12,.09,1.3],[x-side*.88,-.02,z],'light');
    box(fixed,'Service_Cabinet',[.65,.8,1],[x+side*.24,.52,z+.7],'ivory');
    box(fixed,'Cabinet_Door',[.03,.49,.7],[x-side*.1,.53,z+.7],'dark');
   }
   for(const z of [-8,0,8]){
    box(fixed,'Crane_Column',[.48,8.8,.55],[x,4.4,z],'ivory');
    box(fixed,'Column_Load_Spine',[.18,8.4,.62],[x+side*.24,4.4,z]);
    box(fixed,'Column_Foot',[1.1,.65,1.2],[x,.4,z],'dark');
    box(fixed,'Column_Lamp',[.06,1.15,.14],[x-side*.26,5.5,z+.2],'light');
    beam(fixed,'Knee_Brace',[x,6.9,z],[x-side*1.4,8.6,z],.2);
    box(fixed,'Hazard_Band',[.54,.4,.61],[x,1.25,z],'yellow');
   }
   for(const y of [8.5,9.1])box(fixed,'Crane_Runway_Chord',[.26,.23,21],[x,y,0],'steel');
   for(let z=-10;z<10;z+=2)beam(fixed,'Runway_Lacing',[x,8.5,z],[x,9.1,z+2],.1,'yellow');
   box(fixed,'Crane_Rail',[.12,.12,21],[x,9.29,0],'yellow');
  }
  for(const z of [-8,8]){
   for(const y of [8.6,9.2])box(fixed,'Portal_Header',[12,.22,.24],[0,y,z],'steel');
   for(let x=-5.7;x<5.7;x+=1.9)beam(fixed,'Header_Lacing',[x,8.6,z],[x+1.9,9.2,z],.11,'yellow');
   box(fixed,'Portal_Worklight',[5,.08,.16],[0,8.42,z],'light');
  }
  // A narrow transfer bridge meets the retained elevator hub at the rear.
  box(fixed,'Freight_Transfer_Bridge',[3,.5,3],[0,-.35,-11.5]);
  for(const x of [-1.2,1.2])box(fixed,'Freight_Guide',[.1,.12,3],[x,-.04,-11.5],'yellow');
  for(const z of [-6,0,6]){
   box(fixed,'Underbody_Crossbeam',[10.6,.35,.65],[0,-.85,z]);
   for(const x of [-2.4,2.4]){box(fixed,'Assembly_Cradle',[.36,1.8,.5],[x,.1,z],'yellow');box(fixed,'Cradle_Pad',[1,.18,.8],[x,1.1,z],'dark');}
  }
 }
 // Merge only the stationary workshop members; dynamic equipment stays jointed.
 const buckets=new Map();fixed.updateMatrixWorld(true);fixed.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);const list=buckets.get(o.material)||[];list.push(g);buckets.set(o.material,list);});fixed.clear();
 for(const [material,parts]of buckets){const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());geometries.add(g);fixed.add(new THREE.Mesh(g,material));}

 const gantry=new THREE.Group();gantry.name='Travelling_Bridge_Crane';root.add(gantry);gantry.visible=openWorkshop;
 for(const z of [-.45,.45])box(gantry,'Bridge_Girder',[12,.4,.28],[0,9.1,z],'yellow');
 for(const x of [-5.7,5.7])box(gantry,'End_Carriage',[.85,.4,1.55],[x,9.3,0],'dark');
 const trolley=new THREE.Group();trolley.name='Hoist_Trolley';gantry.add(trolley);box(trolley,'Winch_Housing',[1.65,.55,1.35],[0,8.85,0],'yellow');
 const ropes=[-.55,.55].map(x=>box(trolley,'Hoist_Cable',[.035,1,.035],[x,7,0],'dark'));
 const load=new THREE.Group();load.name='Suspended_Assembly_Load';trolley.add(load);
 box(load,'Lifting_Spreader',[2.6,.18,1.9],[0,0,0],'yellow');
 const armorPanel=box(load,'Armor_Panel',[2.8,.22,1.7],[0,-.44,0],'ivory');
 const machinery=new THREE.Group();machinery.name='Machinery_Module';load.add(machinery);
 box(machinery,'Equipment_Casing',[1.8,.65,1.1],[0,-.65,0],'dark');
 for(const x of [-.65,.65])box(machinery,'Equipment_Rib',[.12,.7,1.2],[x,-.65,0],'steel');
 box(machinery,'Equipment_Lifting_Rail',[1.9,.1,.15],[0,-.27,0],'yellow');
 for(const x of [-1,1])beam(load,'Panel_Sling',[x,-.1,0],[x,-.45,0],.045);

 const ship=createShipConstruction();ship.root.position.y=3.9;root.add(ship.root);
 const arms=[];
 for(const side of [-1,1])for(const offset of [-1,1]){
  const group=new THREE.Group();group.name='Welding_Robot';root.add(group);
  const x=side*5.1,z=offset*4;
  box(group,'Rail_Carriage',[1.15,.35,1.35],[x,.45,z],'dark');
  mesh(group,'Robot_Pedestal',cylinder,[.48,.5,.48],[x,.9,z],'yellow');
  const upper=box(group,'Upper_Arm',[.34,1,.38],[0,0,0],'yellow'),lower=box(group,'Forearm',[.26,1,.3],[0,0,0],'yellow'),ram=box(group,'Hydraulic_Ram',[.1,1,.1],[0,0,0],'ivory');
  const joint=mesh(group,'Elbow',sphere,[.32,.32,.32],[0,0,0],'dark'),torch=mesh(group,'Welding_Arc',sphere,[.11,.11,.11],[0,0,0],'light');
  const positions=new Float32Array(24*6),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometries.add(geometry);
  const material=new THREE.LineBasicMaterial({color:0x9be4ff,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  const sparks=new THREE.LineSegments(geometry,material);sparks.name='Welding_Sparks';sparks.frustumCulled=false;group.add(sparks);
  arms.push({group,x,z,side,offset,upper,lower,ram,joint,torch,sparks,material,positions});
 }
 const work=new THREE.Vector3(),elbow=new THREE.Vector3(),base=new THREE.Vector3(),delta=new THREE.Vector3();
 function connect(object,a,b,width){delta.subVectors(b,a);object.position.copy(a).addScaledVector(delta,.5);object.scale.set(width,delta.length(),width);object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
 let disposed=false;
 return {root,ship,center:[0,2.7,0],radius:13,update({state,now,time}){
  const enabled=state.level>0&&state.state!=='unbuilt'&&state.state!=='construction';
  ship.update({queue:state.queue,enabled,now,time});const {active,progress}=ship.stats;
  const handling=active&&progress>=.24&&progress<.76;
  const travel=Math.sin(time*.28)*6,hoist=handling?5.6+Math.sin(time*.8)*.8:7.3;
  gantry.position.z=handling?travel:6.8;trolley.position.x=handling?Math.sin(time*.36)*2:0;load.position.y=hoist;load.visible=handling;
  machinery.visible=progress<.46;armorPanel.visible=progress>=.46;
  for(const rope of ropes){rope.scale.y=8.6-hoist;rope.position.y=(8.6+hoist)/2;}
  for(const [i,arm]of arms.entries()){
   const phase=time*1.7+i*1.9;
   const contact=active?ship.contact(arm.side,arm.offset<0?-1:0):null;
   const welding=!!contact&&active&&progress>.1&&progress<.92;
   arm.group.position.z=contact?contact.z-arm.z:0;
   base.set(arm.x,1.3,arm.z);
   elbow.set(arm.x-arm.side*1.1,3.2+(active?Math.sin(phase*.5)*.22:0),arm.z-.3);
   work.set(contact?contact.x+arm.side*.06:arm.side*4,contact?3.9+contact.y:2.2,arm.z);
   connect(arm.upper,base,elbow,.34);connect(arm.lower,elbow,work,.26);connect(arm.ram,base.clone().add(new THREE.Vector3(.24,.2,0)),elbow,.09);arm.joint.position.copy(elbow);arm.torch.position.copy(work);
   arm.torch.visible=welding;arm.torch.scale.setScalar(.07+(Math.sin(time*23+i)*.5+.5)*.045);arm.sparks.visible=welding;
   if(welding){for(let n=0;n<24;n++){
    const age=(time*1.5+n*.137+i*.13)%1,angle=n*2.399+i,radius=age*(.28+(n%5)*.12),j=n*6;
    arm.positions.set([work.x+Math.cos(angle)*radius,work.y-age*age*.65,work.z+Math.sin(angle)*radius,work.x+Math.cos(angle)*(radius+.07),work.y-age*age*.65-.04,work.z+Math.sin(angle)*(radius+.07)],j);
   }arm.sparks.geometry.attributes.position.needsUpdate=true;}
  }
  root.userData.construction={...ship.stats};
 },dispose(){if(disposed)return;disposed=true;ship.dispose();geometries.forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());arms.forEach(a=>a.material.dispose());root.removeFromParent();root.clear();}};
}

export function createElevatorConstruction(model,height){
 const root=new THREE.Group();root.name='Elevator_Construction_Gantry';root.userData.motion={type:'construction'};model.add(root);
 const geometry=new THREE.BoxGeometry(1,1,1),material=new THREE.MeshStandardMaterial({color:0xe9b448,metalness:.55,roughness:.4,emissive:0x976018,emissiveIntensity:.3});
 for(const x of [-3.5,3.5]){const rail=new THREE.Mesh(geometry,material);rail.position.x=x;rail.scale.set(.22,.3,6.6);root.add(rail);}
 for(const z of [-3.2,3.2]){const rail=new THREE.Mesh(geometry,material);rail.position.z=z;rail.scale.set(7,.3,.22);root.add(rail);}
 const lightMaterial=new THREE.MeshBasicMaterial({color:0xa5ebff,toneMapped:false});
 for(const x of [-1.08,1.08]){const light=new THREE.Mesh(geometry,lightMaterial);light.position.x=x;light.scale.set(.21,.45,.21);root.add(light);}
 root.visible=false;
 return {root,update(state,time){root.visible=['construction','upgrade'].includes(state.state);root.position.y=height*(state.state==='construction'?state.progress:(time*.08)%1);lightMaterial.color.setHex(Math.sin(time*15)>.3?0xd8faff:0x56adc7);},dispose(){geometry.dispose();material.dispose();lightMaterial.dispose();root.removeFromParent();}};
}
