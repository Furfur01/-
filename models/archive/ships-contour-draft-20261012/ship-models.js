import * as THREE from 'three';
import {fitShipShape} from './ship-shape-fit.js';

export const legacyIds=['Destroyer','Cruiser','Battleship','Heavy_Fighter','Dreadnought'];
export const modelIds=[...legacyIds,'Light_Fighter','Bomber','Cargo_Ship','Large_Cargo_Ship','Colony_Ship','Recycler','Probe','Solar_Satellite','Death_Star','Interceptor','Iron_Behemoth','Devourer_Interceptor','Titanenergetic_Frigate','Annihilator','Reaper','Guardian'];

// Geometry is in display units: the APK sprites do not specify physical dimensions.
export function createShipModel(id,{fit=true}={}){
  if(!modelIds.includes(id))throw Error('未知舰船模型: '+id);
  const root=new THREE.Group();root.name=id;
  const mats={};for(const [key,color]of Object.entries({hull:0x586775,light:0xafbac3,dark:0x1b2732,steel:0x364653,red:0x74363b,gold:0xaa8847,glass:0x47bee2,panel:0x1854a2}))mats[key]=new THREE.MeshStandardMaterial({color,metalness:key==='glass'?.25:.72,roughness:.44,flatShading:true,emissive:key==='glass'?0x31b9f0:0,emissiveIntensity:.85});
  const add=(g,p,c='hull',rot=[0,0,0])=>{const m=new THREE.Mesh(g,mats[c]);m.position.set(...p);m.rotation.set(...rot);root.add(m);return m;};
  const box=(s,p,c='hull',rot)=>add(new THREE.BoxGeometry(...s),p,c,rot);
  const cyl=(r,l,p,c='steel',r2=r)=>add(new THREE.CylinderGeometry(r,r2,l,16),p,c,[Math.PI/2,0,0]);
  function hull(sections,x=0,y=0,c='hull'){
    const vertices=[],indices=[];
    for(const[z,w,h]of sections)for(const[a,b]of[[-.38,.5],[.38,.5],[.5,.27],[.5,-.27],[.38,-.5],[-.38,-.5],[-.5,-.27],[-.5,.27]])vertices.push(x+a*w,y+b*h,z);
    for(let k=0;k<sections.length-1;k++)for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8,c=a+8,d=b+8;indices.push(a,c,b,b,c,d);}
    for(let i=1;i<7;i++){indices.push(0,i,i+1);const n=(sections.length-1)*8;indices.push(n,n+i+1,n+i);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return add(g,[0,0,0],c);
  }
  function engine(x,y,z,r=.4){cyl(r,.9,[x,y,z]);cyl(r*1.08,.18,[x,y,z+.4],'dark');cyl(r*.72,.035,[x,y,z+.51],'glass');for(let i=0;i<6;i++){const a=i*Math.PI/3;box([.09,.09,.64],[x+Math.cos(a)*r,y+Math.sin(a)*r,z],'light');}}
  function bridge(x,y,z,s=1){box([1.1*s,.3*s,1.4*s],[x,y,z],'dark');hull([[z-.7*s,.75*s,.28*s],[z+.55*s,1.1*s,.48*s]],x,y+.3*s,'light');box([.7*s,.09*s,.035],[x,y+.38*s,z-.71*s],'glass');}
  function cannon(x,y,z,s=1){box([.48*s,.28*s,.65*s],[x,y,z],'steel');for(const side of[-1,1])cyl(.055*s,1.05*s,[x+side*.13*s,y,z-.65*s],'dark');}
  function wing(side,z,width=2,length=2,c='hull'){const w=box([width,.15,length],[side*(.7+width/2),-.05,z],c,[0,side*.38,side*.08]);return w;}
  function ribs(x,y,z,length,count=8,c='steel'){for(let i=0;i<count;i++)box([.95,.09,.08],[x,y,z+i*length/(count-1)],c);}
  function spine(length=8,width=2,height=1,c='hull'){hull([[-length/2,.25,.3],[-length*.29,width*.85,height],[-length*.05,width,height],[length*.36,width*.8,height*.9],[length/2,width*.55,height*.65]],0,0,c);}

  if(id==='Heavy_Fighter'){
    hull([[-2,1.1,.8],[.5,2.6,1.1],[3.5,2.2,1.2]],0,0,'hull');
    for(const s of[-1,1]){hull([[-4.8,.18,.22],[-3.2,.7,.35],[1,.9,.6],[2.5,.75,.75]],s*1.15,-.15,'light');box([.14,.12,4.4],[s*1.17,.08,-1.9],'glass');for(let j=0;j<8;j++)box([.55,.07,.09],[s*1.15,.12,-3.7+j*.43],'steel');box([.12,.4,5.8],[s*1.95,-.2,-.1],'steel',[0,s*.1,0]);hull([[.6,.6,.4],[2.1,1.1,1.4],[3.3,.85,1.35]],s*.95,.4,'dark');engine(s*.8,0,3.6,.45);wing(s,2.5,.6,1.5,'steel');}bridge(0,.65,.4,.8);cyl(.21,1.25,[0,.25,-1.3],'red');
  }else if(id==='Cruiser'){
    hull([[-5,.08,.15],[-3,2.2,.65],[-.5,3.4,.9],[2.2,3,.8],[4.2,1.8,.7]],0,0,'dark');
    hull([[-4.6,.12,.1],[-2.8,1.5,.18],[1.8,1.9,.38]],0,.52,'light');
    for(const s of[-1,1]){hull([[-4.2,.12,.16],[-2.4,.26,.25],[1.6,.38,.45],[3.3,.65,.5]],s*1.18,.05,'hull');box([.16,.16,4.5],[s*.85,.6,-.2],'steel');for(let j=0;j<5;j++)box([.62,.08,.17],[s*.75,.65,-1.8+j*.56],'hull');wing(s,2.3,1.05,1.4,'hull');engine(s*1.3,0,3.8,.42);box([.5,.25,1.7],[s*1.9,.2,2.8],'light');cannon(s*.75,.73,.2,.75);}bridge(0,.85,1.4,1.1);bridge(0,1.23,1.6,.6);ribs(0,.83,-2.9,1.8,5,'steel');
  }else if(id==='Battleship'){
    hull([[-5.2,3.3,.45],[-4.2,3.7,.65],[-1.8,3.1,.7],[-.7,1.8,.6],[4,1.8,.8]],0,0,'dark');
    for(let j=-1;j<=1;j++)hull([[-5.3,.72,.35],[-4.8,.97,.45],[-2,.82,.55],[-1.25,.55,.4]],j*1.08,.27,'light');
    for(const s of[-1,1]){for(let j=0;j<4;j++){box([.7,.13,.65],[s*1.16,.55,-4.35+j*.72],'hull');box([.85,.07,.09],[s*1.12,.64,-4.3+j*.72],'steel');}for(let j=0;j<3;j++){hull([[-.4+j*1.5,.62,.5],[.65+j*1.5,.9,.65]],s*1.03,.08,'hull');box([.1,.22,.45],[s*1.5,.12,j*1.5],'red');}engine(s*.85,0,4.4,.5);cannon(s*.85,.62,.7,.95);}hull([[-2.6,.72,.35],[2.9,.85,.55]],0,.6,'steel');bridge(0,.95,2.2,.95);ribs(0,.91,-2.4,2.2,6);
  }else if(id==='Dreadnought'){
    hull([[-3.7,1.3,1],[-2.4,2,1.6],[2.7,2.5,1.85],[4,1.8,1.4]],0,0,'dark');
    hull([[-3.8,1.4,.45],[-2.8,1.9,.65],[2.5,1.7,.7]],0,.6,'light');hull([[-2.5,1.5,.45],[.5,1.6,.7],[3,1.9,1]],0,1,'hull');bridge(0,1.85,2,1.1);
    for(const s of[-1,1]){hull([[-5.5,.06,.1],[-3.8,.2,.2],[-2,.45,.45],[2,.55,.65]],s*1.2,-.75,'steel');for(let j=0;j<6;j++){box([.13,.6,.38],[s*1.13,.1,-1.8+j*.67],'hull');box([.09,.12,.26],[s*1.21,.25,-1.8+j*.67],'gold');}engine(s*.83,.15,4,.55);box([.5,.7,.5],[s*.8,1.75,2.8],'light');cannon(s*1.05,.4,-1,.8);}box([1.3,.12,.035],[0,.8,-3.8],'glass');box([.65,.12,.8],[0,1.42,-1.5],'red');
  }else if(id==='Destroyer'){
    hull([[-4.8,2.35,1.3],[-3.8,2.6,1.55],[2.7,2.4,1.5],[4,1.8,1.05]],0,0,'dark');
    for(const s of[-1,1]){hull([[-5,1,1],[-4,1.15,1.4],[2.5,.9,1.25]],s*.77,0,'hull');for(let j=0;j<9;j++){box([.75,.11,.16],[s*.77,.73,-4+j*.72],'steel');box([.1,.68,.18],[s*1.27,.1,-3.9+j*.73],'steel');}box([.22,.1,4],[s*.67,.82,-1.5],'red');wing(s,2.45,2.3,2,'dark');hull([[1.3,.65,.65],[3.1,.9,.9],[4,.65,.7]],s*2.75,0,'hull');engine(s*2.75,0,4,.43);box([.17,.8,1.2],[s*3.12,.55,3],'steel');cannon(s*.8,.95,-1.2,1.15);}bridge(0,1.1,2,1.35);box([.65,.4,.1],[0,0,-4.9],'red');
  }else if(id==='Light_Fighter'){
    spine(8,1.4,.7,'light');bridge(0,.4,.1,.75);for(const s of[-1,1]){wing(s,1.8,1.5,1.6);box([.12,1.15,1.25],[s*2,.48,2.4],'steel',[0,0,s*-.35]);engine(s*1.05,0,2.8,.3);cannon(s*1.3,-.2,.4,.8);}ribs(0,.41,-2.5,2,7);
  }else if(id==='Bomber'){
    spine(10,2.3,1.2);hull([[-4.8,.3,.35],[-2.1,1.4,.65],[2,1.1,.8]],0,.55,'light');bridge(0,1,1.1);for(const s of[-1,1]){wing(s,1.7,2.4,3.2);box([.14,.2,3],[s*3.25,-.03,2.2],'light',[0,s*.4,0]);engine(s*.95,0,3.7,.46);for(let i=0;i<4;i++)cyl(.18,.8,[s*1.45,-.45,.1+i*.65],'red');}ribs(0,1.02,1,2.7,8);
  }else if(['Cargo_Ship','Large_Cargo_Ship'].includes(id)){
    const big=id==='Large_Cargo_Ship',len=big?9:7,w=big?3.6:3;
    box([w,.25,len],[0,-.62,0],'steel');box([w,.25,len],[0,.9,0],'light');box([w,1.5,.3],[0,.1,len/2],'dark');
    for(const s of[-1,1]){hull([[-len/2,.35,1.5],[-len*.28,.7,1.65],[len*.4,.7,1.5]],s*w/2,.15,'light');for(let i=0;i<6;i++){box([.14,1.25,.12],[s*(w/2-.4),.08,-len/2+.5+i*len/7],'red');box([.12,.12,len*.75],[s*.7,.72,.4],'red');}engine(s*w/2,0,len/2,.48);wing(s,2,big?1.45:.8,1.6);}
    box([w-.7,.1,.08],[0,-.43,-len/2],'light');bridge(0,1.12,len/2-1,.75);if(big)for(const s of[-1,1])for(let j=0;j<3;j++)box([.5,.55,1.1],[s*2.3,-.35,j*1.3],'hull');
  }else if(id==='Colony_Ship'){
    box([3.7,.55,2.6],[0,0,2],'steel');for(const s of[-1,1]){hull([[-4,1.05,.85],[2,1.25,1.1],[3.2,.7,.8]],s*.95,0,'hull');box([.18,.08,6],[s*.95,.57,-.5],'gold');box([.7,.42,.12],[s*.95,.03,-4.02],'red');engine(s*.95,0,3.4,.42);wing(s,1,1.25,1.8);box([.15,.7,2.1],[s*2.1,-.15,2.4],'steel',[0,s*.35,s*.3]);}bridge(0,.5,1.8,1.2);
  }else if(id==='Recycler'){
    spine(8,3,1.6,'red');hull([[-4.1,1.8,.65],[-2,2.8,1],[1,2.6,1.2]],0,.2,'light');bridge(0,.95,1.8);for(const s of[-1,1]){wing(s,1.5,.85,2.4);engine(s*1.3,-.1,3.5,.47);hull([[-4.7,.23,.23],[-3.5,.5,.35],[-2,.4,.35]],s*.8,-.5,'steel');box([.08,2.1,.08],[s*.5,1.8,1.8],'steel');for(let j=0;j<4;j++)box([.15,.65,.2],[s*1.5,.45,j*.7],'steel');}cyl(.8,.25,[0,.25,2.6],'dark');
  }else if(id==='Probe'){
    cyl(.43,2.5,[0,0,0],'steel',.25);cyl(.23,2,[0,0,-1.8],'glass',.06);cyl(.16,1.6,[0,0,2],'light',.02);for(const s of[-1,1]){box([1.5,.08,.1],[s*.8,0,.4],'steel');cyl(.13,2.7,[s*1.5,0,.2],'light',.04);cyl(.09,.6,[s*1.5,0,-.65],'glass');}engine(0,0,1,.32);
  }else if(id==='Solar_Satellite'){
    add(new THREE.CylinderGeometry(.4,.4,2.8,12),[0,0,0]);for(const s of[-1,1]){box([3.2,.1,.12],[s*1.9,0,0],'steel');for(let x=0;x<3;x++)for(let y=0;y<3;y++){box([.77,.82,.1],[s*(.9+x*.85),-.9+y*.91,0],'panel');for(let j=0;j<4;j++)box([.012,.8,.012],[s*(.61+x*.85+j*.15),-.9+y*.91,.058],'light');}}for(const y of[-.9,0,.9])add(new THREE.TorusGeometry(.41,.035,6,24),[0,y,0],'gold',[Math.PI/2,0,0]);
  }else if(id==='Death_Star'){
    add(new THREE.SphereGeometry(3,48,32),[0,0,0],'hull');add(new THREE.TorusGeometry(3.01,.06,8,64),[0,0,0],'dark',[Math.PI/2,0,0]);for(let i=0;i<12;i++)add(new THREE.TorusGeometry(3.01,.018,4,64),[0,0,0],'steel',[0,i*Math.PI/12,0]);cyl(.8,.25,[.8,.85,-2.65],'dark');cyl(.37,.3,[.8,.85,-2.82],'glass');
  }else if(id==='Interceptor'){
    for(const y of[-.85,.85])hull([[-5,.7,.4],[-3,2,1],[2.7,2.2,1.35],[4,1.1,1]],0,y,'dark');box([1.65,1.8,2.5],[0,0,2],'steel');for(const s of[-1,1]){for(let j=0;j<5;j++){cannon(s*1.1,-.15,-2.5+j,.7);box([.22,.7,.45],[s*1.1,.65,j*.6],'hull');}engine(s*.7,.85,4,.46);engine(s*.7,-.85,4,.46);}bridge(0,1.6,2,.8);
  }else if(id==='Iron_Behemoth'){
    hull([[-4,5.6,.9],[-1,4.7,1.1],[3.5,1.7,1.2]],0,0,'dark');hull([[-4.3,2,.8],[-2,2.2,1.4],[2.5,1.4,1.3]],0,.4,'steel');for(const s of[-1,1]){hull([[-5,.25,.25],[-3.7,.8,.7],[1.8,1.1,.7]],s*2,-.2,'hull');for(let j=0;j<6;j++)box([.8,.12,.12],[s*1.7,.65,-3+j*.75],'steel');engine(s*1.1,0,3,.5);cannon(s*1.9,.7,-1,1.1);}bridge(0,1.15,1.5);
  }else if(id==='Devourer_Interceptor'){
    box([4.4,.8,3],[0,.05,2],'dark');for(const s of[-1,1]){hull([[-5.2,1,.7],[-3.8,1.3,.9],[3,1.3,1.3]],s*1.5,0,'hull');box([1,.45,.12],[s*1.5,0,-5.22],'dark');box([.78,.06,.03],[s*1.5,.1,-5.3],'glass');ribs(s*1.5,.49,-3.7,4.6,10);engine(s*1.6,0,3.7,.65);wing(s,2.2,1.5,1.9,'light');}bridge(0,.9,1.5,1.4);
  }else if(id==='Titanenergetic_Frigate'){
    spine(8,2,1.5,'light');for(const s of[-1,1]){box([.42,.3,5.7],[s*1.8,.6,.2],'steel');box([3.8,.25,.45],[0,.6,2.7],'light');box([.4,2.6,.5],[s*1.8,1.5,2],'hull');box([.18,.28,2.8],[s*1.8,2.8,1.6],'steel');hull([[-1.2,.9,.7],[2,.95,1],[3,.6,.7]],s*2.45,-.1,'hull');engine(s*2.45,-.1,3.2,.45);for(let i=0;i<3;i++)cyl(.1,.06,[s*2.45+(i-1)*.22,-.1,-1.3],'glass');}bridge(0,1,0,1.1);box([1,.5,1],[0,.1,-3.7],'light');
  }else if(id==='Annihilator'){
    spine(9,2.6,1.1,'hull');bridge(0,.7,0,1.1);for(const s of[-1,1]){for(let j=0;j<2;j++){wing(s,1.2+j*1.6,2.2,1.15,'steel');cyl(.35,.18,[s*2.2,0,1.3+j*1.6],'red');cyl(.16,.2,[s*2.2,0,1.3+j*1.6],'glass');}engine(s*.85,0,3.8,.45);}ribs(0,.6,-3,2.4,7);
  }else if(id==='Reaper'){
    spine(8,2.4,1.4,'light');hull([[-4.2,.5,.4],[-2.7,1.8,.65],[1,2,.7]],0,-.35,'red');bridge(0,.9,-.5,.9);for(const s of[-1,1]){for(let j=0;j<3;j++)wing(s,j*1.15,1.25+j*.24,.8,'steel');box([.16,1.5,3.3],[s*.8,1.25,1.5],'red',[0,0,s*-.2]);box([.2,.2,2.7],[s*.86,2,1.8],'light');engine(s*1.2,-.2,3.2,.45);cannon(s*1.4,.3,.2,1.2);}
  }else if(id==='Guardian'){
    spine(7,3,1.5,'light');add(new THREE.TorusGeometry(2.3,.18,12,48),[0,0,0],'gold');add(new THREE.TorusGeometry(2.3,.08,8,48),[0,0,.15],'glass');for(const s of[-1,1]){box([.5,.5,4],[s*2.2,0,1],'steel');engine(s*2.2,0,3,.5);}bridge(0,1,1,1.2);
  }
  const armamentMounts={Light_Fighter:[0,.6,.7],Heavy_Fighter:[0,.8,1.3],Cruiser:[0,.8,-.2],Battleship:[0,.95,-.5],Dreadnought:[0,1.65,.1],Bomber:[0,1.2,2],Destroyer:[0,.92,.3],Interceptor:[0,1.45,.2],Iron_Behemoth:[0,1.2,.1],Devourer_Interceptor:[0,.7,2.5],Titanenergetic_Frigate:[0,1.3,-1.1],Annihilator:[0,.82,1.8],Reaper:[0,1.2,.5],Guardian:[0,1.1,-.4]};
  if(armamentMounts[id]){const[x,y,z]=armamentMounts[id];cannon(x,y,z,.65);for(const s of[-1,1]){const pod=box([.34,.2,.7],[x+s*.6,y-.1,z+.55],'dark');pod.name='Added_Missile_Pod';for(const dx of[-.08,.08])cyl(.055,.09,[x+s*.6+dx,y-.1,z+.17],'red');}root.userData.addedArmaments='Low-profile twin turret and two missile pods; design additions, not recovered APK weapons';}
  root.userData={...root.userData,modelId:id,units:'display units',reference: ['Death_Star','Guardian'].includes(id)?'concept':'APK sprite; reconstructed hidden surfaces'};
  if(fit)fitShipShape(root,id);
  return root;
}

export function disposeShip(root){const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
