import * as T from 'three';
import {expeditionZones} from '../../game/expedition-rules.mjs';

// Navigation overlays share the galaxy's coordinates, camera and floating origin.
// These guides remain the original exploration hit areas. The atmosphere owns
// scenery only; choosing a zone still dispatches the existing navigation event.
export const CORE={void:4500,deep:22000,inner:52000,outer:100000,flat:.64,half:Math.PI*.29};
const smooth=(a,b,x)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const zones=Object.values(expeditionZones);
const bands=[[CORE.inner,CORE.outer],[CORE.deep,CORE.inner],[CORE.void,CORE.deep]];
const colors=[0x95c9bc,0x8da9b8,0xc6bda5];
const facePoint=(face,r,t)=>{
  const a=face===0?(t*2-1)*CORE.half:face===1?-CORE.half:CORE.half;
  const h=face===0?0:t*Math.PI/2;
  return [r*Math.cos(h)*Math.cos(a),r*Math.sin(h)*CORE.flat,r*Math.cos(h)*Math.sin(a)];
};
function sectionGeometry(face,low,high){
  const points=[],indices=[];
  for(let i=0;i<=48;i++)for(const r of [low,high])points.push(...facePoint(face,r,i/48));
  for(let i=0;i<48;i++){const j=i*2;indices.push(j,j+1,j+3,j,j+3,j+2);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));geometry.setIndex(indices);return geometry;
}
export function createCoreExplorer(world){
  const root=new T.Group();root.name='galactic-core-destinations';world.scene.add(root);
  const overlay=document.createElement('div');overlay.className='core-explorer';overlay.hidden=true;
  const ns='http://www.w3.org/2000/svg',lines=document.createElementNS(ns,'svg');lines.setAttribute('aria-hidden','true');overlay.append(lines);
  const heading=document.createElement('span');heading.className='core-heading';heading.textContent='探索地点';overlay.append(heading);
  world.host.append(overlay);
  const faces=[],materials=[],geometries=[],rows=[];
  let open=0,visible=false,hover=null;
  const selected=()=>world.navigation.explorationZone||'outer';
  for(const [index,zone]of zones.entries()){
    const [low,high]=bands[index],group=new T.Group();root.add(group);
    const fill=new T.MeshBasicMaterial({color:colors[index],side:T.DoubleSide,transparent:true,opacity:0,depthWrite:false});materials.push(fill);
    for(let f=0;f<3;f++){
      const geometry=sectionGeometry(f,low,high);geometries.push(geometry);
      const mesh=new T.Mesh(geometry,fill);mesh.userData.zone=zone.id;mesh.renderOrder=2;group.add(mesh);faces.push(mesh);
    }
    const borderPoints=[];
    for(let f=0;f<3;f++){
      for(const r of [low,high])for(let i=0;i<48;i++)borderPoints.push(...facePoint(f,r,i/48),...facePoint(f,r,(i+1)/48));
      for(const t of [0,1])borderPoints.push(...facePoint(f,low,t),...facePoint(f,high,t));
    }
    const borderGeometry=new T.BufferGeometry();borderGeometry.setAttribute('position',new T.Float32BufferAttribute(borderPoints,3));geometries.push(borderGeometry);
    const borderMaterial=new T.LineBasicMaterial({color:colors[index],transparent:true,depthWrite:false});materials.push(borderMaterial);
    group.add(new T.LineSegments(borderGeometry,borderMaterial));
    const shellGeometry=new T.SphereGeometry(high,64,32);shellGeometry.scale(1,CORE.flat,1);geometries.push(shellGeometry);
    const shellMaterial=new T.ShaderMaterial({uniforms:{opacity:{value:0},tint:{value:new T.Color(colors[index])}},side:T.DoubleSide,transparent:true,depthWrite:false,vertexShader:`
      varying vec3 p,n,v;
      #include <common>
      #include <logdepthbuf_pars_vertex>
      void main(){p=position;n=normalize(normalMatrix*normal);vec4 eye=modelViewMatrix*vec4(position,1.);v=normalize(-eye.xyz);gl_Position=projectionMatrix*eye;
      #include <logdepthbuf_vertex>
      }`,fragmentShader:`
      uniform float opacity;uniform vec3 tint;varying vec3 p,n,v;
      #include <common>
      #include <logdepthbuf_pars_fragment>
      void main(){if(p.y>=0.&&p.x>length(p.xz)*${Math.cos(CORE.half).toFixed(8)})discard;
      float edge=pow(1.-abs(dot(normalize(n),normalize(v))),3.);gl_FragColor=vec4(tint,opacity*(.08+edge*.92));
      #include <logdepthbuf_fragment>
      }`});materials.push(shellMaterial);group.add(new T.Mesh(shellGeometry,shellMaterial));
    const path=document.createElementNS(ns,'path'),dot=document.createElementNS(ns,'circle');dot.setAttribute('r','2.5');lines.append(path,dot);
    const button=document.createElement('button');button.className='core-zone';button.dataset.coreZone=zone.id;
    const title=document.createElement('b'),meta=document.createElement('span');title.textContent=zone.name;button.append(title,meta);
    button.addEventListener('click',()=>world.selectExplorationZone(zone.id));
    button.addEventListener('pointerenter',()=>{hover=zone.id;});button.addEventListener('pointerleave',()=>{hover=null;});
    overlay.append(button);rows.push({zone,button,meta,path,dot,fill,borderMaterial,shellMaterial,anchor:new T.Vector3(...facePoint(1,(low+high)/2,.8))});
  }
  function update(){
    const n=world.navigation,eye=new T.Vector3(...n.eye),distance=eye.length(),q=world.project([0,0,0],CORE.outer);
    // No core mode or camera swap: zoom opens the cut, then fades the guides as
    // the existing black hole fills the view. Orbiting keeps the cut facing us.
    open=(1-smooth(280000,850000,distance))*smooth(14000,42000,distance);
    visible=q.visible&&open>.02&&!n.combatCamera&&!n.missionFollow&&n.level==='galaxy';
    root.visible=visible;overlay.hidden=!visible;
    const angle=Math.atan2(eye.z,eye.x),hemisphere=eye.y<0?-1:1;
    world.environment.setCoreCut({open:visible?open:0,angle,hemisphere,radius:CORE.outer,flat:CORE.flat,half:CORE.half});
    if(!visible)return;
    root.position.set(...n.camera.center.map(v=>-v));root.rotation.y=-angle;root.scale.y=hemisphere;root.updateMatrixWorld(true);
    overlay.style.opacity=String(smooth(.02,.35,open));
    const width=world.width,height=world.height,small=width<700,labelWidth=small?124:154;
    const x=Math.max(16,Math.min(q.x-q.radius-labelWidth-35,width-labelWidth-24));
    const gap=small?63:74,top=T.MathUtils.clamp(q.y-gap,125,Math.max(125,height-280));
    heading.style.transform=`translate(${x}px,${top-29}px)`;
    const level=world.navigation.astrophysics||0;
    rows.forEach((row,i)=>{
      const active=selected()===row.zone.id,highlight=hover===row.zone.id||n.hover?.id===row.zone.id,locked=level<row.zone.level;
      row.fill.opacity=open*(highlight?.035:active?.012:.003);
      row.borderMaterial.opacity=open*(highlight?.35:active?.17:.065);
      row.shellMaterial.uniforms.opacity.value=open*(active?.016:.006);
      const y=top+i*gap;
      row.button.style.transform=`translate(${x}px,${y}px)`;
      row.button.classList.toggle('is-selected',active);row.button.classList.toggle('is-locked',locked);row.button.setAttribute('aria-pressed',String(active));
      const meta=locked?`${row.zone.seconds/60} 分钟 · 需 ${row.zone.level} 级`:`${row.zone.seconds/60} 分钟`;
      if(row.meta.textContent!==meta)row.meta.textContent=meta;
      row.button.title=locked?`需要天体物理 ${row.zone.level} 级`:'';
      const anchor=row.anchor.clone().applyMatrix4(root.matrixWorld).add(new T.Vector3(...n.camera.center)),a=world.project(anchor.toArray());
      const endX=x+labelWidth+8,endY=y+24,elbow=Math.max(endX+16,a.x-24);
      row.path.setAttribute('d',`M ${endX} ${endY} L ${elbow} ${endY} L ${a.x} ${a.y}`);
      row.dot.setAttribute('cx',a.x);row.dot.setAttribute('cy',a.y);
      for(const el of [row.path,row.dot]){el.classList.toggle('is-selected',active||highlight);el.style.opacity=a.visible?'1':'0';}
    });
  }
  return {update,get visible(){return visible;},pick(raycaster){
    if(!visible||open<.35)return null;
    const hit=raycaster.intersectObjects(faces,false)[0];
    return hit?{type:'explorationZone',id:hit.object.userData.zone,position:[0,0,0],name:expeditionZones[hit.object.userData.zone].name}:null;
  },dispose(){overlay.remove();root.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
