import * as T from 'three';
import {createPrismArray,createOriginalImpactor,createElectronRing} from './arsenal-original.js';
import {createLaunchVessel} from './arsenal-v3.js';

export const arsenalKinds=['laser','missile','accelerator','antimatterPlant'];
// Reference shaders share the world's logarithmic depth buffer, rather than
// bringing a second renderer or camera into the game.
export function prepareArsenalShaders(root){root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){
 if(!m?.isShaderMaterial||m.vertexShader.includes('logdepthbuf_pars_vertex'))continue;
 m.vertexShader='#include <common>\n#include <logdepthbuf_pars_vertex>\n'+m.vertexShader;
 m.vertexShader=m.vertexShader.replace(/}\s*$/,'\n#include <logdepthbuf_vertex>\n}');
 m.fragmentShader='#include <logdepthbuf_pars_fragment>\n'+m.fragmentShader;
 m.fragmentShader=m.fragmentShader.replace(/void main\(\)\s*{/,'void main(){\n#include <logdepthbuf_fragment>\n');
 m.needsUpdate=true;
 }});}

function replaceProjectile(vessel){
 const original=createOriginalImpactor({target:new T.Vector3(1000,0,0)}),source=original.group.getObjectByName('Asterion / relativistic penetrator');
 const detail=source.clone(true),resources=new Set();
 detail.traverse(o=>{if(o.geometry){o.geometry=o.geometry.clone();resources.add(o.geometry);}if(o.material){o.material=Array.isArray(o.material)?o.material.map(m=>m.clone()):o.material.clone();for(const m of Array.isArray(o.material)?o.material:[o.material])resources.add(m);}});
 detail.position.set(0,0,0);detail.quaternion.identity();detail.updateMatrixWorld(true);
 const bounds=new T.Box3().setFromObject(detail),center=bounds.getCenter(new T.Vector3()),scale=1.55/(bounds.max.x-bounds.min.x);
 detail.scale.setScalar(scale);detail.position.copy(center).multiplyScalar(-scale);detail.name='Original seven-shield penetrator / 1.55 units';
 const mount=vessel.group.getObjectByName('Tiny segmented penetrator');for(const child of [...mount.children])mount.remove(child);mount.add(detail);
 original.dispose();return {mount,dispose:()=>resources.forEach(r=>r.dispose())};
}

export function createArsenalModel(kind,{target=new T.Vector3(6000,40,1800)}={}){
 if(kind==='antimatterPlant')return createAntimatterPlant();
 const anchor=kind==='missile'?new T.Vector3(-390,42,290):new T.Vector3();
 const raw=(kind==='laser'?createPrismArray:kind==='missile'?createLaunchVessel:createElectronRing)({target:target.clone().add(anchor)});
 const projectile=kind==='missile'?replaceProjectile(raw):null,group=new T.Group(),shift=new T.Group();shift.position.copy(anchor).negate();shift.add(raw.group);group.add(shift);
 const local=p=>p.clone().sub(anchor),parts=[];raw.group.traverse(o=>{if(o.isMesh&&!o.material?.isShaderMaterial)parts.push({o,count:o.isInstancedMesh?o.count:null});});
 let progress=1;prepareArsenalShaders(group);
 function updateShot(time,shotTime=-1){raw.update({time,shotTime,quality:'balanced',selected:shotTime>=0});if(progress<1)for(let i=0;i<parts.length;i++){const {o,count}=parts[i];if(count!=null)o.count=Math.ceil(count*progress);else o.visible=i/parts.length<progress;}}
 return {group,raw,parts,focus:local(raw.focus),cameraOffset:raw.cameraOffset,impactAt:raw.impactAt,duration:raw.duration,
  projectile:projectile?.mount,local,anchor,
  setProgress(v){progress=v;if(v===1)for(const {o,count}of parts){if(count!=null)o.count=count;else o.visible=true;}},
  update(dt,time){updateShot(time);},updateShot,
  dispose(){projectile?.dispose();raw.dispose();group.clear();}
 };
}

function createAntimatterPlant(){
 const group=new T.Group(),steel=new T.MeshStandardMaterial({color:0x405663,metalness:.8,roughness:.32}),light=new T.MeshBasicMaterial({color:0x90eadd}),parts=[];
 const add=(g,m,p)=>{const mesh=new T.Mesh(g,m);mesh.position.fromArray(p);group.add(mesh);parts.push(mesh);return mesh;};
 add(new T.CylinderGeometry(10,14,45,12),steel,[0,0,0]);
 for(let i=0;i<7;i++){const r=add(new T.TorusGeometry(24,1.2,8,64),i%2?steel:light,[0,-30+i*10,0]);r.rotation.x=Math.PI/2;}
 for(let i=0;i<6;i++){const a=i*Math.PI/3;add(new T.CylinderGeometry(4,4,55,8),steel,[Math.cos(a)*38,0,Math.sin(a)*38]);}
 return {group,parts,setProgress(p){parts.forEach((o,i)=>o.visible=i/parts.length<p);},update(dt,time){group.rotation.y=time*.035;},dispose(){parts.forEach(o=>o.geometry.dispose());steel.dispose();light.dispose();group.clear();}};
}
