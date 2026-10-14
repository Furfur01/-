import {Box3,Matrix4,Raycaster,Vector3} from 'three';
import {createShipKit} from '../opendesign/mockups/galactic-command/ship-sculpted-kit.js';

// Positions are in the approved model's original construction coordinates.
export function installFlightArmament(model,id){
  const added={Cruiser:[.75,-3,.22],Battleship:[.95,3.6,.25],Bomber:[.5,-2,.36]}[id];
  const bays={Destroyer:[1.7,3.8],Devourer_Interceptor:[2,-2.5],Iron_Behemoth:[1.35,1.9]}[id];
  const k=createShipKit('Flight_armament'),tubes=[],bounds=new Box3().setFromObject(model);
  const seat=(x,z,r)=>{
    const samples=[[0,0],[r,0],[-r,0],[0,r],[0,-r]].map(([dx,dz])=>{
      const p=model.localToWorld(new Vector3(x+dx,0,z+dz));
      const hit=new Raycaster(new Vector3(p.x,bounds.max.y+1,p.z),new Vector3(0,-1,0)).intersectObject(model,true)[0];
      if(!hit)throw Error('Unsupported weapon footprint: '+id+' '+[x,z]);
      return model.worldToLocal(hit.point.clone()).y;
    });
    const y=Math.max(...samples);return {y,low:Math.min(...samples)};
  };
  if(added)for(const sign of [-1,1]){
    const [x,z,s]=added,{y,low}=seat(sign*x,z,s*.37);
    k.section('Seated_turret',()=>{k.cyl(s*.38,y-low+.04,sign*x,(y+low)/2-.01,z,'dark');k.turret(sign*x,y-.008,z,s);});
  }
  if(bays)for(const sign of [-1,1]){
    const [x,z]=bays,{y,low}=seat(sign*x,z,.16);
    k.section('Flush_missile_bay',()=>{
      k.block(.38,y-low+.07,.52,sign*x,(y+low)/2,z,'side',.012);
      for(const dz of [-.13,.13]){k.cyl(.105,.025,sign*x,y+.045,z+dz,'steel');k.cyl(.073,.012,sign*x,y+.064,z+dz,'black');tubes.push([sign*x,y+.073,z+dz]);}
    });
  }
  if(id==='Cruiser')k.section('Original_missile_ports',()=>{
    for(const s of [-1,1])for(const dx of [-.0989,.0989])for(const dz of [-.2291,0,.2291]){
      const x=s*1.42+dx,z=3.37+dz,{y,low}=seat(x,z,.028);
      if(y>1.145){k.cyl(.033,y-low+.018,x,(y+low)/2,z,'steel');k.cyl(.02,.01,x,y+.009,z,'black');}
      tubes.push([x,Math.max(1.145,y+.015),z]);
    }
  });
  if(added||bays)model.add(k.finish());
  model.updateMatrixWorld(true);
  const joints=[];const owners=new Map();
  model.traverse(owner=>{
    if(!owner.userData.articulations?.length)return;
    const list=owner.userData.articulations.map((entry,i)=>{
      const matrix=new Matrix4().multiplyMatrices(owner.matrixWorld,new Matrix4().fromArray(entry.matrix)),p=new Vector3().setFromMatrixPosition(matrix),raw=model.worldToLocal(p.clone());
      let role='pd';
      if(id==='Reaper'&&raw.z>1)role='secondary';
      if(id==='Cruiser'&&owner.name!=='Flight_armament'||id==='Battleship'&&raw.z<0)role='main';
      if((id==='Battleship'&&raw.z>1&&owner.name!=='Flight_armament')||
         (id==='Bomber'&&owner.name==='Flight_armament')||
         (id==='Dreadnought'&&raw.z>2)||
         (id==='Destroyer'&&Math.abs(raw.z-1.2)<.1)||
         (id==='Interceptor'&&raw.y>0&&raw.z<1)||
         (id==='Devourer_Interceptor'&&raw.z>4)||
         (id==='Iron_Behemoth'&&(Math.abs(raw.z-1.1)<.1||Math.abs(raw.z-5.25)<.1)))role='secondary';
      const s=new Vector3().setFromMatrixScale(matrix).x;
      const joint={mount:[p.z,p.y,-p.x],scale:s,role,pivot:[-.2*s,.096*s,0],muzzles:[[-.905*s,.096*s,-.22*s],[-.905*s,.096*s,.22*s]],vertices:[[],[]],parts:[],source:owner.name+':'+i};joints.push(joint);return joint;
    });owners.set(owner,list);
  });
  return {joints,owners,tubes};
}
