import * as THREE from 'three';
import {reaperReferenceGeometry} from './reaper-reference-geometry.js';
import {createShipKit} from './ship-sculpted-kit.js';
import {shipWeaponLayouts} from '../../../game/ship-weapon-mounts.mjs';

export function createReferenceReaper(){
  const root=new THREE.Group();root.name='Reaper';
  const data=reaperReferenceGeometry(),groups=new Map();
  // Preserve the input's opaque geometry and luminous surfaces; omit its translucent
  // halo duplicates so they cannot z-fight or become opaque in the flight exporter.
  for(const bucket of ['solid','engine'])for(let i=0;i<data[bucket].length;i+=39){
    const tri=data[bucket].slice(i,i+39),key=tri.slice(6,12).join(',');
    if(!groups.has(key))groups.set(key,{color:tri.slice(6,9),emit:tri.slice(9,12),position:[],normal:[]});
    const g=groups.get(key);for(let k=0;k<3;k++){g.position.push(...tri.slice(k*13,k*13+3));g.normal.push(...tri.slice(k*13+3,k*13+6));}
  }
  const reference=new THREE.Group();reference.name='User_RAVEN_original_geometry';root.add(reference);
  for(const [key,g]of groups){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(g.position,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(g.normal,3));
    const intensity=Math.max(...g.emit),color=new THREE.Color().setRGB(...g.color,THREE.SRGBColorSpace);
    const emissive=intensity?new THREE.Color().setRGB(...g.emit.map(v=>v/intensity),THREE.SRGBColorSpace):new THREE.Color(0);
    const material=new THREE.MeshStandardMaterial({name:'reference_'+key,color,emissive,emissiveIntensity:intensity*.48,metalness:.36,roughness:.56,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(geometry,material);mesh.name='RAVEN_reference_surface';reference.add(mesh);
  }
  root.updateMatrixWorld(true);
  const k=createShipKit('RAVEN_integrated_hardpoints',{armor:0x667b91,light:0x8295a9,side:0x232d3b,steel:0x4e6579,glass:0x71dbfa,core:0x71dbfa});
  // Tiny structural saddles support the reference's inner engine pods and port caps.
  k.section('Wing_engine_supports',()=>{for(const s of[-1,1]){
    k.pipe([s*2.2,-.82,1.5],[s*3.08,-.88,1.5],.12,'side');
    k.pipe([s*3.05,-.89,2.62],[s*3.70,-.95,2.62],.10,'side');
    k.pipe([s*3.04,-.65,3.05],[s*3.04,-.65,3.45],.13,'side');
    // Bridge the tiny physical gaps between thruster collars and emissive caps.
    k.cyl(.15,.08,s*3.04,-.65,3.735,'dark','z');
    k.cyl(.28,.07,s*.79,-.19,6.585,'dark','z');
  }k.cyl(.21,.05,0,-.42,6.73,'dark','z');});
  k.section('Original_hardpoint_collimators',()=>{for(const s of[-1,1]){
    // Move only the bore to the outer edge of the existing hardpoint so the long
    // side machinery channel cannot block the beam in front of the old barrel.
    k.cyl(.105,1.78,s*2.04,-.33,-.41,'side','z');
    k.ring(.09,.018,s*2.04,-.33,-1.315,'steel');
    k.cyl(.066,.01,s*2.04,-.33,-1.33,'core','z');
  }});
  const seat=(x,z,r)=>{
    const hits=[[0,0],[r,0],[-r,0],[0,r],[0,-r]].map(([dx,dz])=>{
      const hit=new THREE.Raycaster(new THREE.Vector3(x+dx,10,z+dz),new THREE.Vector3(0,-1,0)).intersectObject(reference,true)[0];
      if(!hit)throw Error('Reference hardpoint has no hull beneath it');return hit.point.y;
    });return {high:Math.max(...hits),low:Math.min(...hits)};
  };
  const mounts=[],tubes=[];
  k.section('RAVEN_low_profile_guns',()=>{for(const [x,z]of[[-1.3,-.6],[1.3,-.6],[-.44,3.5],[.44,3.5]]){
    const s=.27,{high,low}=seat(x,z,s*.42),y=high+.008;
    k.cyl(s*.38,high-low+.04,x,(high+low)/2,z,'side');k.turret(x,y,z,s);mounts.push([x,y,z]);
  }});
  k.section('RAVEN_flush_missile_ports',()=>{for(const s of[-1,1])for(const z of[-1.6,-1.2]){
    const x=s*1.18,{high,low}=seat(x,z,.12),y=high+.035;
    k.block(.28,high-low+.07,.28,x,(high+low)/2,z,'side',.012);
    k.cyl(.1,.023,x,y,z,'steel');k.cyl(.064,.012,x,y+.014,z,'black');tubes.push([x,y+.024,z]);
  }});
  root.add(k.finish());
  root.userData={modelId:'Reaper',revision:'user-raven-reaper-02',specialDesign:true,referenceGeometry:true,design:'收割者 / 用户 RAVEN 模型',weaponLayout:shipWeaponLayouts.Reaper,seatedMounts:mounts,seatedTubes:tubes,
    engineNozzles:[[-.79,-.19,6.65,.28],[.79,-.19,6.65,.28],[0,-.42,6.78,.21],[-3.04,-.65,3.91,.15],[3.04,-.65,3.91,.15]].map(([x,y,z,radius])=>({position:[x,y,z],radius,direction:[0,0,1]})),
    designSource:'Actual geometry from user starfighter_model.html; integrated weapon supports added; combat effects retained'};
  return root;
}
