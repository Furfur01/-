import * as THREE from 'three';
import {createModelToolkit} from './continuum-assets/capital-original.js';

/** An extension to the supplied TETHER station, built with its CONTINUUM toolkit.
 * All coordinates below are station-local; raising the elevator never rescales a
 * ship, warehouse, crane, handrail, or the original terminal. */
export function createContinuumOrbitalYard({stationHeight=240}={}){
  const kit=createModelToolkit(THREE),{C,Batch,group}=kit;
  const root=new THREE.Group();root.name='CONTINUUM / orbital shipbuilding complex';root.position.y=stationHeight;
  const near=group(root,'shipyard / detailed fabrication'),far=group(root,'shipyard / structural distance model');
  const steel=new Batch('Shipyard / double chord trusses, gantries and service decks');
  const fine=new Batch('Shipyard / catwalks, hydraulic tools, railways and utilities');
  const distant=new Batch('Shipyard / retained gantries and open drydock silhouettes');
  const lights=new Batch('Shipyard / work strips and approach beacons');
  const fixtures=new Batch('Shipyard / reusable hull assembly fixtures');
  const bays=[{id:'capital',x:43,z:6,width:18,length:60,height:13,hullLength:50,hullWidth:8.4},
    {id:'cruiser',x:67,z:4,width:17,length:48,height:11,hullLength:39,hullWidth:7.1},
    {id:'service',x:89,z:2,width:15,length:38,height:9,hullLength:30,hullWidth:5.8}];
  const stages=[];let disposed=false,clock=0,visual={assemblyProgress:0,showDemoShip:false,construction:1,activity:1};
  const truss=(a,b,width=1.3,height=1.6)=>{
    const dir=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),length=dir.length(),side=new THREE.Vector3(-dir.z,0,dir.x).normalize();
    const p=(t,s,y)=>new THREE.Vector3(...a).addScaledVector(dir,t).addScaledVector(side,s).add(new THREE.Vector3(0,y,0)).toArray();
    for(const s of [-width/2,width/2])for(const y of [0,-height]){steel.ibeam(p(0,s,y),p(1,s,y),.14,.23,C.steel);distant.beam(p(0,s,y),p(1,s,y),.12,.16,C.pale);}
    const n=Math.max(1,Math.ceil(length/2.6));
    for(let i=0;i<n;i++)for(const s of [-width/2,width/2])steel.beam(p(i/n,s,-height),p((i+1)/n,s,0),.085,.10,C.steel);
    steel.beam(p(0,0,.08),p(1,0,.08),width,.12,C.navy,'paint');
    for(const s of [-width/2,width/2])kit.rail(fine,p(0,s,.14),p(1,s,.14),.36,1.5);
    for(let t=0;t<=1;t+=1/n)lights.box(p(t,0,.16),[.24,.025,.18],C.warm,'lamp',.01);
  };
  // A continuous freight spine connects the retained orbital transfer station.
  truss([18,-.69,-9.98],[18,-1.1,-26],2.4,2.0);
  truss([18,-1.1,-26],[99,-1.1,-26],2.4,2.0);
  for(const bay of bays){
    const {x,z,width:w,length:l,height:h}=bay,back=z-l/2,front=z+l/2,half=w/2;
    truss([x,-1.1,-26],[x,-1.1,back],2.0,1.5);
    for(const side of [-1,1]){
      const xx=x+side*half;
      truss([xx,-2.7,back],[xx,-2.7,front],1.4,1.9);
      steel.beam([xx,0,back],[xx,0,front],.16,.2,C.yellow,'paint');
      fine.pipe([xx+side*.30,-3.3,back],[xx+side*.30,-3.3,front],.14,C.alloy);
      for(let zz=back+1;zz<=front;zz+=4){
        steel.ibeam([xx,-2.6,zz],[xx,h*.56,zz],.26,.38,C.pale);
        steel.beam([xx,h*.50,zz],[xx-side*1.4,h*.50,zz],.24,.28,C.steel);
        lights.box([xx-side*.18,h*.49,zz],[.11,.16,.8],C.white,'lamp',.01);
        fine.box([xx+side*.78,-2.4,zz],[.17,.22,.23],C.yellow,'paint',.025);
      }
      distant.beam([xx,-2.4,back],[xx,-2.4,front],1.2,.65,C.navy,'paint');
    }
    // Four open portals have real diagonal webs and travelling bridge cranes.
    for(const [portal,t] of [0,.33,.66,1].entries()){
      const zz=back+l*t;
      for(const side of [-1,1]){
        const xx=x+side*half;
        steel.ibeam([xx,-2.7,zz],[xx,h,zz],.48,.65,C.pale);
        steel.beam([xx,-2.0,zz-1.1],[xx,h-1.1,zz+1.1],.16,.19,C.steel);
        steel.box([xx,h+.18,zz],[1.25,.44,1.0],C.navy,'paint',.07);
        distant.beam([xx,-2.7,zz],[xx,h,zz],.45,.6,C.pale,'paint');
        lights.box([xx,h+.45,zz],[.30,.14,.30],portal===0?C.warm:C.blueLight,'lamp',.025);
      }
      steel.ibeam([x-half,h,zz],[x+half,h,zz],.50,.66,C.yellow);
      steel.ibeam([x-half,h-1,zz],[x+half,h-1,zz],.24,.32,C.steel);
      for(let j=0;j<6;j++)steel.beam([x-half+w*j/6,h-1,zz],[x-half+w*(j+1)/6,h,zz],.10,.12,C.steel);
      distant.beam([x-half,h,zz],[x+half,h,zz],.48,.65,C.yellow,'paint');
      if(portal===1||portal===2){
        const trolley=x+(portal===1?-.2:.27)*w;
        steel.box([trolley,h-.55,zz],[2.5,.8,1.5],C.navy,'paint',.08);
        for(const s of [-1,1])fine.pipe([trolley+s*.65,h-1,zz],[trolley+s*.65,h*.45,zz],.025,C.steel);
        fine.box([trolley,h*.45,zz],[2.0,.25,.9],C.yellow,'paint',.035);
        for(const s of [-1,1])fine.cyl([trolley+s*.8,h-.2,zz],.23,.18,C.steel,'steel',12,[Math.PI/2,0,0]);
      }
    }
    // Positioning robots, hoses, sockets and grated lower service crosswalks.
    for(let zz=back+5;zz<front-2;zz+=8){
      steel.ibeam([x-half,-3.1,zz],[x+half,-3.1,zz],.24,.36,C.steel);
      for(const side of [-1,1]){
        const a=[x+side*(half-.6),-1.6,zz],b=[x+side*(half-2),1.1,zz+.6],c=[x+side*(bay.hullWidth/2+.5),2.2,zz];
        fine.cyl(a,.45,.6,C.navy,'paint',20);
        fine.beam(a,b,.42,.54,C.pale,'paint');fine.beam(b,c,.28,.37,C.yellow,'paint');
        fine.pipe([a[0],a[1]+.3,a[2]],c,.09,C.alloy);fine.ball(b,[.35,.35,.35],C.steel,'steel');
        fine.box(c,[.55,.36,.42],C.navy,'paint',.045);
      }
    }
    addHullFixture(bay);
    // Navigable approach markers remain visible in the structural distance LOD.
    for(const side of [-1,1])lights.box([x+side*(half-.3),-2.0,front+.7],[.4,.28,1.2],C.blueLight,'lamp',.035);
  }
  function addHullFixture(bay){
    const {x,z,hullLength:l,hullWidth:w}=bay,stations=12,y=2.4;
    const shape=t=>Math.min(1,Math.max(.12,(1-t)*5))*Math.min(1,.7+t*3);
    const point=(i,k)=>{const t=i/stations,theta=(k/8)*Math.PI*2+Math.PI/8,s=shape(t);return [x+Math.cos(theta)*w*.5*s,y+Math.sin(theta)*w*.27*s,z+(t-.5)*l];};
    const groups=[0,1,2].map(i=>group(near,`${bay.id} / host-controlled armor stage ${i}`));
    const panels=[0,1,2].map(i=>new Batch(`${bay.id} / articulated hull plates stage ${i}`));
    for(let i=0;i<=stations;i++){
      for(let k=0;k<8;k++){const a=point(i,k),b=point(i,(k+1)%8);fixtures.beam(a,b,.085,.13,C.steel);}
      if(i<stations)for(let k=0;k<8;k++){
        const a=point(i,k),b=point(i+1,k),c=point(i+1,(k+1)%8),d=point(i,(k+1)%8);
        if(k%2===0)fixtures.beam(a,b,.065,.09,C.pale);
        // Separate cut plates retain seams and reveal the actual frames beneath.
        const centre=new THREE.Vector3(...a).add(new THREE.Vector3(...b)).add(new THREE.Vector3(...c)).add(new THREE.Vector3(...d)).multiplyScalar(.25);
        const verts=[a,b,c,d].map(p=>new THREE.Vector3(...p).lerp(centre,.055).toArray()),coords=[...verts[0],...verts[2],...verts[1],...verts[0],...verts[3],...verts[2]];
        const geometry=kit.own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geometry.computeVertexNormals();
        panels[(i+Math.floor(k/2))%3].add(geometry,[0,0,0],i%3===0?C.pale:C.blueLight,'paint');
        if(k===1&&i%2===0)fine.box([x+w*.36*shape(i/stations),y+w*.27*shape(i/stations)+.07,z+(i/stations-.5)*l],[.32,.09,.22],C.yellow,'paint',.01);
      }
    }
    // Dock tooling stays visible while idle; queued craft cladding follows host progress.
    fixtures.ibeam([x,-.4,z-l/2],[x,-.4,z+l/2],.35,.55,C.navy);
    for(const side of [-1,1]){
      const engineX=x+side*w*.25,engineZ=z-l*.5-1;
      panels[2].cyl([engineX,y,engineZ],w*.17,2.3,C.steel,'steel',32,[Math.PI/2,0,0],w*.13);
      panels[2].torus([engineX,y,engineZ-1.17],w*.17,.08,C.alloy,'steel',[0,0,0],32);
      panels[2].cyl([engineX,y,engineZ-1.2],w*.13,.06,C.dark,'paint',24,[Math.PI/2,0,0]);
    }
    panels[1].box([x,y+w*.25,z+l*.15],[w*.42,w*.22,l*.12],C.navy,'paint',.1);
    panels[1].box([x,y+w*.34,z+l*.21],[w*.38,w*.10,.13],C.glass,'glass',.02);
    panels.forEach((b,i)=>{b.finish(groups[i]);stages.push({group:groups[i],threshold:[.12,.44,.72][i]});});
    // The distant mesh keeps a segmented keel shape, never a solid box enclosure.
    for(let i=0;i<stations;i+=2){distant.beam(point(i,1),point(i+2,1),.13,.17,C.pale);distant.beam(point(i,5),point(i+2,5),.13,.17,C.steel);}
  }
  // Shipyard control, modular fabrication halls and thermal plant behind the spine.
  steel.box([60,.9,-33],[25,4.2,8.5],C.navy,'paint',.14);
  steel.box([60,3.15,-33],[26,.32,9.5],C.pale,'paint',.10);
  fine.box([60,1.9,-28.72],[22,1.4,.05],C.glass,'glass',.01);
  for(let x=49;x<73;x+=2.5){fine.box([x,2,-28.64],[.16,2.0,.16],C.pale,'paint',.02);kit.roofPlant(fine,x,3.35,-33,1.5,.9);}
  kit.rail(fine,[47.2,3.4,-28.6],[72.8,3.4,-28.6],.4,1.4);
  for(const x of [80,87,94]){
    fine.cyl([x,.4,-32.5],2.4,5.2,C.pale,'paint',32);
    for(const yy of [-1.4,.4,2.3])fine.torus([x,yy,-32.5],2.44,.07,C.steel,'steel');
    fine.pipe([x,-1.1,-30],[x,-1.1,-26],.18,C.steel);
  }
  for(let z=-17;z<=16;z+=5.5){
    steel.beam([98,-2,z],[106,-2,z],.20,.28,C.pale,'paint');
    fine.box([102,-2.12,z],[7.6,.12,4.3],C.solar,'paint',.035);
    for(let x=99;x<=105;x++)fine.box([x,-2.05,z],[.035,.025,4.2],C.blueLight,'steel',0);
  }
  distant.box([60,.9,-33],[25,4.2,8.5],C.navy,'paint',.14);
  steel.finish(near);fine.finish(near);fixtures.finish(near);distant.finish(far);
  const markers=group(root,'shipyard / navigation and task lighting');lights.finish(markers,false);
  kit.mats.paint.side=THREE.DoubleSide;
  kit.mats.lamp.emissive.setHex(0x9ed7ff);kit.mats.lamp.emissiveIntensity=.16;
  kit.trimCaches(root);
  root.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(root),bounds={min:box.min.toArray(),max:box.max.toArray()};
  const anchors={focus:[63,stationHeight+3,1],connection:[18,stationHeight-.69,-9.98],approaches:bays.map(b=>[b.x,stationHeight+3,b.z+b.length/2+10])};
  const meta={name:'CONTINUUM / 大型轨道造船厂',version:1,originalStationPreserved:true,bayCount:bays.length,bays:bays.map(b=>({...b})),hostControlledAssembly:true,bounds,anchors};
  function setState(state={}){Object.assign(visual,state);for(const {group,threshold} of stages)group.visible=visual.showDemoShip&&visual.assemblyProgress>=threshold;}
  function update(dt,{visible=true,detail=true,nightStrength=0}={}){
    root.visible=visible&&visual.construction>.15;near.visible=detail;far.visible=!detail;
    if(root.visible&&detail&&visual.activity>0)clock+=Math.max(0,Math.min(.1,dt||0));
    // A very slow work-light variation reads as active servicing, not strobes.
    kit.mats.lamp.emissiveIntensity=.12+Math.max(0,Math.min(1,nightStrength))*1.8*(.95+.05*Math.sin(clock*.45));
  }
  setState();update(0);
  return {root,near,far,bounds,anchors,meta,setState,update,dispose(){if(disposed)return;disposed=true;kit.dispose(root);}};
}
