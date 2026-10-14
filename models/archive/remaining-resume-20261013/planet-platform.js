// Building origins sit at Y = 0 on connected atmospheric platforms.
export function createFloatingPlatform(THREE) {
  const group=new THREE.Group();group.name='gas-giant-floating-city';group.userData.floatingPlatform=true;
  const plots={Command_Center:[0,0],Research_Lab:[-1.42,-1.42],Nanite_Factory:[1.42,-1.42],Alliance_Depot:[-1.42,1.42],Robotics_Facility:[1.42,1.42],Gas_Mine:[-5.15,-2.7],Gas_Storage:[-3.85,-2.7],Metal_Storage:[-5.15,1.65],Crystal_Storage:[-3.85,1.65],Metal_Mine:[-.65,-4.8],Crystal_Mine:[.65,-4.8],Missile_Silo:[-.65,4.6],Terraformer:[.65,4.6],Solar_Plant:[3.95,-2.7],Fusion_Reactor:[5.25,-2.7],Shipyard:[4.8,2.5],Radar_Facility:[0,-4.8]};
  const decks=[[0,0,2.3,2.3],[-4.5,-2.7,1.5,1.15],[-4.5,1.65,1.5,1.15],[0,-4.8,1.5,1.05],[0,4.6,1.5,1.05],[4.6,-2.7,1.5,1.15],[4.8,2.5,2.4,1.8]];
  group.userData.platformSurface={y:0,halfWidth:7.2,halfDepth:5.85,decks};
  const geometries=new Map(),materials=new Map(),batches=new Map();
  const palette={deck:0x6c7c83,hull:0xc5cdca,dark:0x203846,steel:0x879a9f,pale:0xe2e4dc,orange:0xeaa33e,cyan:0x65d9ed,core:0xb9f4f4,gas:0x55f5a0};
  function material(key){
    if(!materials.has(key)){
      const glow=['cyan','core','gas'].includes(key),m=new THREE.MeshStandardMaterial({color:palette[key],roughness:.62,metalness:.28,emissive:glow?palette[key]:0,emissiveIntensity:key==='gas'?.82:glow?.48:0,flatShading:true});
      m.name='carrier-'+key;m.userData.platformResource=true;materials.set(key,m);
    }
    return materials.get(key);
  }
  function geometry(key){
    if(!geometries.has(key)){
      let g;
      if(key==='box')g=new THREE.BoxGeometry(1,1,1);
      else if(key==='cylinder')g=new THREE.CylinderGeometry(1,1,1,12);
      else if(key==='nozzle')g=new THREE.CylinderGeometry(1,.50,1,8);
      else if(key==='intakeRing')g=new THREE.TorusGeometry(1,.13,5,20).rotateX(Math.PI/2);
      else if(key==='deck'){
        const outline=[[-.78,-1],[.78,-1],[1,-.72],[1,.72],[.78,1],[-.78,1],[-1,.72],[-1,-.72]],v=[];
        const tri=(a,b,c)=>v.push(...a,...b,...c);
        for(let i=0;i<8;i++){
          const[x,z]=outline[i],[nx,nz]=outline[(i+1)%8];
          tri([0,0,0],[nx,0,nz],[x,0,z]);tri([x,0,z],[nx,0,nz],[nx,-.42,nz]);tri([x,0,z],[nx,-.42,nz],[x,-.42,z]);tri([0,-.42,0],[x,-.42,z],[nx,-.42,nz]);
        }
        g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.computeVertexNormals();
      }else throw new Error('Unknown carrier geometry '+key);
      g.userData.platformResource=true;geometries.set(key,g);
    }
    return geometries.get(key);
  }
  const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),e=new THREE.Euler(),matrix=new THREE.Matrix4();
  function add(key,mat,x,y,z,sx,sy,sz,ry=0){
    p.set(x,y,z);s.set(sx,sy,sz);q.setFromEuler(e.set(0,ry,0));matrix.compose(p,q,s);
    const name=key+':'+mat;if(!batches.has(name))batches.set(name,{key,mat,matrices:[]});batches.get(name).matrices.push(matrix.clone());
  }
  const box=(w,h,d,x,y,z,mat='hull',ry=0)=>add('box',mat,x,y,z,w,h,d,ry);
  const cylinder=(r,h,x,y,z,mat='steel')=>add('cylinder',mat,x,y,z,r,h,r);
  function bridge(ax,az,bx,bz){
    const dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),x=(ax+bx)/2,z=(az+bz)/2;
    box(.46,.14,length,x,-.12,z,'dark',angle);box(.31,.045,length,x,-.026,z,'steel',angle);
    for(const side of[-1,1]){
      const ox=Math.cos(angle)*side*.21,oz=-Math.sin(angle)*side*.21;
      box(.035,.075,length,x+ox,.008,z+oz,'orange',angle);box(.014,.024,length,x+ox,.055,z+oz,'cyan',angle);
      for(let k=0;k<Math.ceil(length/.55);k++){const t=(k+.5)/Math.ceil(length/.55);box(.04,.36,.04,ax+dx*t+ox,-.15,az+dz*t+oz,'pale');}
    }
  }
  for(const[x,z]of decks.slice(1))bridge(0,0,x,z);
  bridge(-4.5,-2.7,-4.5,1.65);bridge(4.6,-2.7,4.8,2.5);
  decks.forEach(([x,z,w,d],index)=>{
    const deck=new THREE.Mesh(geometry('deck'),material('deck'));deck.name=index?'satellite-deck-'+index:'main-deck-y-zero';deck.position.set(x,0,z);deck.scale.set(w,1,d);deck.castShadow=true;deck.receiveShadow=true;group.add(deck);
    const rim=new THREE.Mesh(geometry('deck'),material('hull'));rim.position.set(x,-.17,z);rim.scale.set(w*1.025,.45,d*1.025);rim.castShadow=true;group.add(rim);
    for(const side of[-1,1]){
      box(w*1.48,.055,.075,x,.029,z+side*d*.95,'pale');box(w*1.42,.02,.028,x,.065,z+side*d*.95,'orange');
      box(.075,.055,d*1.35,x+side*w*.96,.029,z,'pale');
      for(let i=0;i<5;i++)box(.13,.009,.055,x-w*.57+i*w*.285,.008,z+side*d*.83,i%2?'orange':'pale');
      for(const t of[-.60,.60]){
        const px=x+side*w*.83,pz=z+t*d;
        box(.10,.30,.10,px,.15,pz,'dark');cylinder(.075,.04,px,.32,pz,'cyan');
        cylinder(.18,.26,px,-.49,pz,'steel');add('nozzle','dark',px,-.91,pz,.19,.64,.19);cylinder(.11,.035,px,-1.25,pz,'cyan');
      }
    }
    cylinder(index?.35:.60,.22,x,-.49,z,'hull');add('nozzle','dark',x,-.83,z,index?.31:.54,.48,index?.31:.54);cylinder(index?.19:.35,.035,x,-1.085,z,'core');
    for(const side of[-1,1]){box(.06,.18,d*1.60,x+side*w*.53,-.47,z,'orange');box(w*1.55,.18,.06,x,-.48,z+side*d*.48,'steel');}
    box(w*1.50,.005,.012,x,.003,z,'dark');box(.012,.005,d*1.65,x,.003,z,'dark');
  });
  const intakeX=plots.Gas_Mine[0]-.05,intakeZ=-1.43;
  group.userData.gasIntake={center:[intakeX,.10,intakeZ],radius:.577,bottom:-1.25};
  box(.18,.18,.91,intakeX,-.13,-1.92,'hull');box(.056,.022,.65,intakeX,.013,-1.84,'gas');
  add('intakeRing','steel',intakeX,.03,intakeZ,.51,.51,.51);
  add('intakeRing','gas',intakeX,.10,intakeZ,.44,.44,.44);
  cylinder(.34,.025,intakeX,.015,intakeZ,'dark');add('nozzle','steel',intakeX,-.30,intakeZ,.45,.60,.45);
  cylinder(.22,.64,intakeX,-.89,intakeZ,'dark');
  for(const y of[-.58,-1.19])add('intakeRing','gas',intakeX,y,intakeZ,.235,.235,.235);
  for(const side of[-1,1])box(.065,.63,.075,intakeX+side*.24,-.89,intakeZ,'steel');
  for(const{key,mat,matrices}of batches.values()){
    const mesh=new THREE.InstancedMesh(geometry(key),material(mat),matrices.length);mesh.name='carrier/'+key+'/'+mat;
    matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.platformResource=true;group.add(mesh);
  }
  group.updateMatrixWorld(true);
  return {group,animations:[],plots};
}
