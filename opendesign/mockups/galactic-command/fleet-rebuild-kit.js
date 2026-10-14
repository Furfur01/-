import * as THREE from 'three';
import {createShipKit} from './ship-sculpted-kit.js';

export function rebuildKit(id,seatDetails=false){
  const k=createShipKit(id,{panel:0x21466d,gold:0x9c8462});
  const {root,section,add,loft,plate,block,cyl,ring,pipe}=k;
  const concept=['Death_Star','Guardian'].includes(id),inferred=['Probe','Solar_Satellite','Annihilator','Reaper','Guardian'].includes(id);
  root.userData={modelId:id,revision:'fleet-three-view-01',rebuiltFromScratch:true,silhouetteVerified:false,referenceViews:inferred?'interpreted':'recovered-tripo',reference:concept?'Legacy concept; no APK sprite':inferred?'APK sprite; hidden views interpreted':'Recovered Tripo orthographic views checked against APK sprite'};
  function shell(rows,cx=0,mat='armor'){
    loft(rows,'side',cx);
    loft(rows.map(([z,w,b,t,shift=0])=>[z,w*.92,Math.max(b,t-.19),t+.045,shift]),mat,cx);
  }
  function skin(points,heights,mat='light',depth=.07){
    const m=plate(points,0,depth,mat,.018),p=m.geometry.attributes.position;
    for(let v=0;v<p.count;v++){
      const z=p.getZ(v);let i=0;while(i<heights.length-2&&heights[i+1][0]<z)i++;
      const a=heights[i],b=heights[i+1],t=Math.max(0,Math.min(1,(z-a[0])/(b[0]-a[0])));
      p.setY(v,p.getY(v)+a[1]+(b[1]-a[1])*t);
    }m.geometry.computeVertexNormals();return m;
  }
  function fin(points,x,t=.12,mat='armor'){
    const sh=new THREE.Shape();points.forEach(([z,y],i)=>i?sh.lineTo(-z,y):sh.moveTo(-z,y));sh.closePath();
    const g=new THREE.ExtrudeGeometry(sh,{depth:t,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:1});g.rotateY(Math.PI/2);return add(g,mat,[x-t/2,0,0]);
  }
  function flank(points,widths,s,mat='armor'){
    const m=fin(points,0,.085,mat),p=m.geometry.attributes.position;
    for(let v=0;v<p.count;v++){
      const z=p.getZ(v);let i=0;while(i<widths.length-2&&widths[i+1][0]<z)i++;
      const a=widths[i],b=widths[i+1],t=Math.max(0,Math.min(1,(z-a[0])/(b[0]-a[0])));
      p.setX(v,s*(p.getX(v)+a[1]+(b[1]-a[1])*t));
    }if(s<0){const index=m.geometry.index;if(index)for(let i=0;i<index.count;i+=3){const a=index.getX(i);index.setX(i,index.getX(i+2));index.setX(i+2,a);}else{for(const attr of Object.values(m.geometry.attributes))for(let i=0;i<attr.count;i+=3)for(let c=0;c<attr.itemSize;c++){const a=attr.array[i*attr.itemSize+c];attr.array[i*attr.itemSize+c]=attr.array[(i+2)*attr.itemSize+c];attr.array[(i+2)*attr.itemSize+c]=a;}}}
    if(seatDetails&&s<0)m.position.x*=s;
    m.geometry.computeVertexNormals();return m;
  }
  function vent(x,y,z,w=.6,l=.8,n=8){
    plate([[x-w*.5,z-l*.5],[x+w*.33,z-l*.5],[x+w*.5,z-l*.32],[x+w*.5,z+l*.5],[x-w*.5,z+l*.5]],y,.035,'black',.009);
    for(let i=0;i<n;i++)block(w*.78,.025,l/(n*2),x,y+.055,z-l*.39+i*l*.78/(n-1),'steel',.004);
  }
  function nose(x,y,z,w,h,lit=true){
    block(w,h,.09,x,y,z,'edge',.025);block(w*.83,h*.71,.025,x,y,z-.06,'black',.012);
    if(lit)for(let i=0;i<3;i++)block(w*.16,h*.12,.012,x+(i-1)*w*.23,y-h*.16,z-.08,'glass',.003);
  }
  function bridge(x,y,z,scale=1){
    const g=section('Recessed_command_bridge',()=>{
      shell([[-.85,.38,0,.14],[-.36,.68,.04,.52],[.64,.63,.02,.53],[.95,.4,0,.25]],0,'armor');
      plate([[-.47,-.32],[.37,-.42],[.53,-.11],[.48,.57],[-.37,.71],[-.51,.28]],.5,.08,'light',.025);
      nose(0,.31,-.57,.83,.17);vent(0,seatDetails?.575:.62,.3,.6,.38,5);
      for(const s of[-1,1]){block(.04,.11,.5,s*.653,.29,.13,'black',.005);for(let j=0;j<3;j++)block(.012,.04,.07,s*.68,.3,-.03+j*.14,'glass',.002);}
    });g.position.set(x,y,z);g.scale.setScalar(scale);return g;
  }
  function ports(x,y,z,n=5,step=.6){
    for(let i=0;i<n;i++){block(.08,.26,.35,x,y,z+i*step,'dark',.014);block(.025,.057,.23,x+Math.sign(x)*.052,y+.02,z+i*step,i%3===0?'glass':'steel',.004);}
  }
  function missiles(x,y,z,w=.55,l=.8){
    block(w,.08,l,x,y,z,'black',.015);
    for(const s of[-1,1])for(let j=0;j<3;j++){block(w*.32,.065,l*.23,x+s*w*.23,y+.04,z+(j-1)*l*.29,'steel',.008);cyl(w*.066,.018,x+s*w*.23,y+.085,z+(j-1)*l*.29,'red','y',w*.066,10);}
  }
  return {...k,shell,skin,fin,flank,vent,nose,bridge,ports,missiles};
}
