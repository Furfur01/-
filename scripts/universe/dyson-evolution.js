import * as T from 'three';
import {createDyson} from './megastructure-factories.js';

export function createEvolvedDyson(){
 const base=createDyson(),frameGeometry=new T.EdgesGeometry(new T.IcosahedronGeometry(89,2)),frame=new T.LineSegments(frameGeometry,new T.LineBasicMaterial({color:0xc9a668,transparent:true,opacity:.75}));
 frame.name='Dyson IV / load-bearing stellar frame';frame.userData.keepMesh=true;base.group.add(frame);
 const panels=new T.Group();panels.name='Dyson V / closed collection shell';panels.userData.keepMesh=true;
 const source=new T.IcosahedronGeometry(88.8,2),p=source.attributes.position,vertices=[];
 for(let i=0;i<p.count;i+=3){const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2),center=a.clone().add(b).add(c).multiplyScalar(1/3);for(const v of [a,b,c])vertices.push(...v.lerp(center,.075).toArray());}
 source.dispose();const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
 // Keep every collector and its original spacing. A transmissive collection
 // surface lets the actual stellar photosphere/corona remain visible inside.
 const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color:0x394550,emissive:0x805024,emissiveIntensity:.18,metalness:.72,roughness:.32,transparent:true,opacity:.62,depthWrite:false,side:T.FrontSide}));mesh.userData.keepMesh=true;panels.add(mesh);base.group.add(panels);
 const update=base.update.bind(base);base.update=(dt,time,state)=>{update(dt,time,state);frame.visible=state.level>=4;panels.visible=state.level>=5;};frame.visible=panels.visible=false;
 return base;
}
