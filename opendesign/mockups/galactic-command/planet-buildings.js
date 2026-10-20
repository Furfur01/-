// Original industrial modules; all dimensions are in the building's local Y-up frame.
export function createBuildingModel(THREE,id,level=1,shared={}) {
  const resources=shared.buildingResources??={geometries:new Map(),materials:new Map()};
  const group=new THREE.Group(),animations=[],batches=new Map();
  group.name=id;group.userData={building:id,level,buildingModel:true};
  const apkBuildings=new Set(['Metal_Mine','Crystal_Mine','Gas_Mine','Solar_Plant','Metal_Storage','Crystal_Storage','Gas_Storage','Robotics_Facility','Shipyard','Research_Lab','Radar_Facility','Fusion_Reactor']);
  group.userData.reference=['Command_Center','Metal_Mine','Crystal_Mine','Gas_Mine','Metal_Storage','Crystal_Storage','Gas_Storage'].includes(id)?'planet-concept':apkBuildings.has(id)?'apk-original':'original-industrial';
  const colors={white:0xd8deda,slate:0x8c9da5,navy:0x294153,dark:0x142631,steel:0x657f8c,orange:0xe79532,yellow:0xe8bf51,cell:0x294f74,cyan:0x77e3ed,amber:0xffc674,crystal:0x82bdd4,hull:0xbbc7cb,pale:0x91aaa4,red:0xa83329,copper:0x9b5941,glass:0x285aad,glassLight:0x4185c4,solar:0x173d85,hot:0xff5923,liquid:0x20b4d4,gold:0xd7a534};
  function material(key) {
    if(!resources.materials.has(key)){
      const luminous=['cyan','amber','hot','liquid'].includes(key),glass=['glass','glassLight','solar'].includes(key);
      const m=new THREE.MeshStandardMaterial({color:colors[key],roughness:glass?.25:key==='cell'?.3:.58,metalness:glass?.52:key==='white'?.18:.38,emissive:luminous?colors[key]:0,emissiveIntensity:key==='hot'?1.05:luminous?.38:0,side:['slate','pale','solar'].includes(key)?THREE.DoubleSide:THREE.FrontSide});
      m.name='industrial-'+key;m.userData.sharedBuilding=true;resources.materials.set(key,m);
    }
    return resources.materials.get(key);
  }
  function geometry(key) {
    if(!resources.geometries.has(key)){
      let geo;
      if(key==='box')geo=new THREE.BoxGeometry(1,1,1);
      else if(key==='armor'){
        const shape=new THREE.Shape();shape.moveTo(-.45,-.45);shape.lineTo(.45,-.45);shape.lineTo(.45,.45);shape.lineTo(-.45,.45);shape.closePath();
        geo=new THREE.ExtrudeGeometry(shape,{depth:.9,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.05,bevelThickness:.05});geo.translate(0,0,-.45);
      }else if(key==='cylinder')geo=new THREE.CylinderGeometry(1,1,1,12);
      else if(key==='round')geo=new THREE.CylinderGeometry(1,1,1,24);
      else if(key==='cone')geo=new THREE.CylinderGeometry(.52,1,1,12);
      else if(key==='point')geo=new THREE.ConeGeometry(1,1,12);
      else if(key==='ring')geo=new THREE.TorusGeometry(1,.065,5,32);
      else if(key==='dome')geo=new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2);
      else if(key==='sphere')geo=new THREE.SphereGeometry(1,12,8);
      else if(key==='crystal')geo=new THREE.OctahedronGeometry(1);
      else if(key==='dish')geo=new THREE.LatheGeometry([new THREE.Vector2(.02,0),new THREE.Vector2(.25,.025),new THREE.Vector2(.55,.14),new THREE.Vector2(.8,.29),new THREE.Vector2(1,.47)],24);
      else if(key==='tube')geo=new THREE.LatheGeometry([new THREE.Vector2(.78,-.5),new THREE.Vector2(1,-.5),new THREE.Vector2(1,.5),new THREE.Vector2(.78,.5),new THREE.Vector2(.78,-.5)],20);
      else if(key==='octagon')geo=new THREE.CylinderGeometry(1,1,1,8);
      else if(key==='airfield'){
        const shape=new THREE.Shape();shape.moveTo(-2.65,-2);shape.lineTo(2.65,-2);shape.lineTo(3,-1.65);shape.lineTo(3,1.65);shape.lineTo(2.65,2);shape.lineTo(-2.65,2);shape.lineTo(-3,1.65);shape.lineTo(-3,-1.65);shape.closePath();
        geo=new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:false,steps:1});geo.rotateX(Math.PI/2);geo.translate(0,.14,0);
      }else if(key==='fighterWing'){
        const shape=new THREE.Shape();shape.moveTo(0,-.49);shape.lineTo(.62,.30);shape.lineTo(.19,.20);shape.lineTo(0,.40);shape.lineTo(-.19,.20);shape.lineTo(-.62,.30);shape.closePath();
        geo=new THREE.ExtrudeGeometry(shape,{depth:1,bevelEnabled:false,steps:1});geo.rotateX(Math.PI/2);geo.translate(0,.5,0);
      }
      else if(key==='solarArc'){
        const positions=[],uvs=[],indices=[],n=20;
        for(let i=0;i<=n;i++){const a=i/n*Math.PI/2;for(const x of [-.5,.5]){positions.push(x,Math.sin(a),Math.cos(a));uvs.push(x+.5,i/n);}}
        for(let i=0;i<n;i++){const k=i*2;indices.push(k,k+1,k+3,k,k+3,k+2);}
        geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();
      }else if(key==='archRoof'){
        const shape=new THREE.Shape();shape.moveTo(1,0);shape.absarc(0,0,1,0,Math.PI,false);shape.lineTo(-.88,0);shape.absarc(0,0,.88,Math.PI,0,true);shape.closePath();
        geo=new THREE.ExtrudeGeometry(shape,{depth:1,steps:1,curveSegments:16,bevelEnabled:false});geo.translate(0,0,-.5);
      }else if(key==='halfDisc'){
        const shape=new THREE.Shape();shape.moveTo(1,0);shape.absarc(0,0,1,0,Math.PI,false);shape.closePath();
        geo=new THREE.ExtrudeGeometry(shape,{depth:1,steps:1,curveSegments:20,bevelEnabled:false});geo.translate(0,0,-.5);
      }else if(key==='halfRing')geo=new THREE.TorusGeometry(1,.045,5,24,Math.PI);
      else if(key==='shard'){
        const positions=[],rings=[[-.5,.38],[-.27,1],[.27,.79]],vertices=[];
        for(const[y,r]of rings)for(let k=0;k<5;k++){const a=k*Math.PI*2/5;vertices.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}
        vertices.push(new THREE.Vector3(.15,.75,-.08),new THREE.Vector3(0,-.5,0));
        const triangle=(a,b,c)=>positions.push(...vertices[a].toArray(),...vertices[c].toArray(),...vertices[b].toArray());
        for(let k=0;k<5;k++){const j=(k+1)%5;triangle(16,j,k);for(let ring=0;ring<2;ring++){const a=ring*5+k,b=ring*5+j,c=(ring+1)*5+k,d=(ring+1)*5+j;triangle(a,b,d);triangle(a,d,c);}triangle(10+k,10+j,15);}
        geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();
      }
      else throw new Error('Unknown building geometry: '+key);
      geo.userData.sharedBuilding=true;resources.geometries.set(key,geo);
    }
    return resources.geometries.get(key);
  }
  const position=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Euler(),quaternion=new THREE.Quaternion(),matrix=new THREE.Matrix4();
  function add(key,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,parent=group) {
    position.set(x,y,z);scale.set(sx,sy,sz);rotation.set(rx,ry,rz);quaternion.setFromEuler(rotation);matrix.compose(position,quaternion,scale);
    if(!batches.has(parent))batches.set(parent,new Map());
    const bins=batches.get(parent),name=key+':'+mat;
    if(!bins.has(name))bins.set(name,{key,mat,transforms:[]});
    bins.get(name).transforms.push(matrix.clone());
  }
  const box=(w,h,d,x,y,z,mat='white',ry=0,rz=0,parent=group)=>add('box',mat,x,y,z,w,h,d,0,ry,rz,parent);
  const armor=(w,h,d,x,y,z,mat='white',ry=0,rz=0,parent=group)=>add('armor',mat,x,y,z,w,h,d,0,ry,rz,parent);
  const cylinder=(r,h,x,y,z,mat='steel',parent=group)=>add('cylinder',mat,x,y,z,r,h,r,0,0,0,parent);
  const ring=(r,x,y,z,mat='orange',rx=Math.PI/2,parent=group)=>add('ring',mat,x,y,z,r,r,r,rx,0,0,parent);
  function beam(from,to,width,mat='steel',parent=group,round=false) {
    const a=new THREE.Vector3(...from),b=new THREE.Vector3(...to),delta=b.clone().sub(a),length=delta.length();
    position.copy(a).add(b).multiplyScalar(.5);quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());scale.set(width,length,width);matrix.compose(position,quaternion,scale);
    if(!batches.has(parent))batches.set(parent,new Map());const bins=batches.get(parent),key=round?'cylinder':'box',name=key+':'+mat;
    if(!bins.has(name))bins.set(name,{key,mat,transforms:[]});bins.get(name).transforms.push(matrix.clone());
  }
  function pipe(points,r=.035,mat='orange') {
    for(let i=1;i<points.length;i++)beam(points[i-1],points[i],r,mat,group,true);
    for(const p of points)add('sphere',mat,...p,r*1.09,r*1.09,r*1.09);
  }
  function curvedPipe(name,points,r=.035,mat='copper',parent=group) {
    const key='curve:'+id+':'+name;
    if(!resources.geometries.has(key)){
      const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),geo=new THREE.TubeGeometry(curve,24,r,8,false);
      geo.userData.sharedBuilding=true;resources.geometries.set(key,geo);
    }
    add(key,mat,0,0,0,1,1,1,0,0,0,parent);
  }
  function mouth(x,y,z,r,h,mat='steel',parent=group) {
    add('tube',mat,x,y,z,r,h,r,0,0,0,parent);cylinder(r*.77,.015,x,y-h*.40,z,'dark',parent);
    ring(r*.96,x,y+h*.49,z,'pale',Math.PI/2,parent);
  }
  function hazard(x,y,z,w=.5,d=.055) {
    box(w,.013,d,x,y,z,'dark');const n=Math.max(3,Math.round(w/.12));
    for(let k=0;k<n;k++)box(w/n*.52,.014,d,x-w*.5+w/n*(k+.5),y+.003,z,'yellow',-.43);
  }
  function bolts(x,y,z,w,d,parent=group) {
    for(const sx of [-1,1])for(const sz of [-1,1])cylinder(.017,.015,x+sx*w*.43,y,z+sz*d*.43,'steel',parent);
  }
  function pool(x,z,w,d,y=.24,mat='liquid') {
    box(w,.12,d,x,y-.055,z,'navy');box(w-.09,.016,d-.09,x,y+.009,z,mat);
    for(const s of [-1,1]){box(w,.075,.045,x,y+.035,z+s*d*.49,'pale');box(.045,.075,d,x+s*w*.49,y+.035,z,'pale');}
  }
  function shard(x,y,z,r,h,mat='glass',rz=0,ry=0) {add('shard',mat,x,y+h*.5,z,r,h,r,0,ry,rz);}
  function ribbedDome(x,y,z,r,h) {
    add('dome','glass',x,y,z,r,h,r);ring(r,x,y+.01,z,'steel');
    for(const a of [.43,.85])ring(r*Math.cos(a),x,y+h*Math.sin(a),z,'steel');
    for(let k=0;k<8;k++){
      const phi=k*Math.PI/4;
      for(let n=0;n<5;n++){
        const a=n*Math.PI/10,b=(n+1)*Math.PI/10;
        beam([x+Math.cos(phi)*r*Math.cos(a),y+h*Math.sin(a),z+Math.sin(phi)*r*Math.cos(a)],[x+Math.cos(phi)*r*Math.cos(b),y+h*Math.sin(b),z+Math.sin(phi)*r*Math.cos(b)],.010,'pale');
      }
    }
  }
  function ribbedBody(x,y,z,r,h,mat='hull') {
    cylinder(r,h,x,y,z,mat);
    for(let k=0;k<12;k++){const a=k*Math.PI/6;box(.021,h*.88,.025,x+Math.cos(a)*r,y,z+Math.sin(a)*r,'steel',-a);}
    ring(r,x,y+h*.5,z,'pale');ring(r,x,y-h*.5,z,'navy');
  }
  function moving(name,x,y,z,axis='y',speed=.4) {
    const part=new THREE.Group();part.name=name;part.position.set(x,y,z);group.add(part);animations.push({mesh:part,kind:'rotate',axis,speed});return part;
  }
  function vent(x,y,z,w=.35,d=.3) {
    box(w,.035,d,x,y,z,'dark');for(let i=0;i<5;i++)box(w*.82,.023,.019,x,y+.02,z-d*.35+i*d*.175,'steel');
  }
  function windows(x,y,z,w=.6,count=4) {
    box(w,.10,.04,x,y,z,'dark');for(let i=0;i<count;i++)box(w/count*.55,.038,.013,x-w*.5+w/count*(i+.5),y,z+.026,'cyan');
  }
  function tank(x,z,r=.23,h=.8,mat='white') {
    cylinder(r,h,x,.24+h/2,z,mat);add('sphere',mat,x,.24+h,z,r,r*.38,r);cylinder(r*1.07,.10,x,.31,z,'navy');cylinder(r*1.04,.07,x,.24+h*.73,z,'orange');cylinder(r*.25,.13,x,.29+h,z,'steel');
  }
  function container(x,y,z,w=.44,h=.34,d=.58,mat='white') {
    armor(w,h,d,x,y,z,mat);box(w*.84,h*.72,.035,x,y,z+d*.505,'navy');
    for(const s of [-1,1])box(.045,h*.76,d*.90,x+s*w*.37,y,z,'steel');
    box(w*.72,.035,.024,x,y-h*.22,z+d*.535,'orange');
  }
  function foundation() {
    if(id==='Shipyard'){
      add('airfield','steel',0,0,0,1,1,1);add('airfield','navy',0,.141,0,.972,.15,.96);
      for(const z of[-1.83,1.83]){
        box(5.12,.022,.035,0,.184,z,'pale');
        for(let i=0;i<9;i++){const x=-2.48+i*.62;box(.10,.04,.07,x,.194,z,'steel');box(.045,.02,.04,x,.224,z,'cyan');}
      }
      for(const x of[-2.86,2.86])box(.035,.021,2.94,x,.184,0,'orange');
      for(const x of[-2,-1,0,1,2])box(.011,.008,3.35,x,.168,0,'steel');
      return;
    }
    if(apkBuildings.has(id)){
      armor(1.70,.12,1.62,0,.07,0,'steel');box(1.58,.035,1.50,0,.145,0,'dark');
      for(const s of [-1,1]){box(1.72,.055,.055,0,.175,s*.79,'slate');box(.055,.055,1.59,s*.835,.175,0,'slate');}
      for(const x of [-.72,0,.72])for(const z of [-.74,.74]){box(.10,.041,.13,x,.19,z,'steel');bolts(x,.216,z,.08,.11);}
      for(const x of [-.69,.69])for(const z of [-.52,.51])vent(x,.173,z,.16,.20);
      hazard(-.30,.176,.695,.63,.045);return;
    }
    add('cylinder','dark',0,.07,0,.85,.14,.77);
    armor(1.36,.11,1.19,0,.15,0,'slate');
    for(const s of [-1,1]){
      box(.09,.045,.78,s*.63,.222,0,'steel');
      for(let k=0;k<3;k++)box(.115,.013,.045,s*(.30+k*.12),.215,.57,'yellow',-.4);
      box(.19,.022,.023,s*.41,.222,-.51,'cyan');
    }
  }
  foundation();

  // First collection follows the silhouettes and equipment in the unpacked APK artwork.
  if(id==='Metal_Mine'||id==='Crystal_Mine') {
    const crystal=id==='Crystal_Mine',accent=crystal?'cyan':'orange';
    cylinder(.43,.08,0,.23,.08,'navy');cylinder(.31,.065,0,.285,.08,'dark');ring(.35,0,.326,.08,accent);
    for(const side of[-1,1]){
      armor(.26,.24,.68,side*.49,.35,-.04,'white');box(.28,.09,.58,side*.49,.52,-.07,'orange');
      beam([side*.49,.48,-.30],[side*.34,1.29,-.27],.18,'white');beam([side*.34,1.29,-.27],[side*.20,1.04,.19],.17,'white');
      beam([side*.48,.55,-.28],[side*.34,1.18,-.26],.049,accent);add('cylinder','navy',side*.34,1.27,-.27,.11,.24,.11,0,0,Math.PI/2);
      armor(.32,.45,.36,side*.46,.49,-.45,'white');vent(side*.46,.735,-.45,.24,.22);
    }
    armor(.43,.21,.34,0,1.09,.19,'navy');box(.45,.043,.05,0,1.18,.36,'orange');
    const cutter=moving('extraction spindle',0,.74,.19,'y',crystal?.45:1.3);cylinder(.13,.56,0,0,0,'steel',cutter);
    for(const y of[-.19,-.06,.08])ring(.16,0,y,0,accent,Math.PI/2,cutter);
    add('point','steel',0,-.35,0,.16,.21,.16,0,0,Math.PI,cutter);
    if(crystal){for(const[x,z,h]of[[-.57,.42,.50],[.47,.48,.42],[-.27,.54,.31]])shard(x,.23,z,.12,h,'glassLight',x*.4,z);}
    else{for(let i=0;i<8;i++){const a=i*2.4;add('crystal',i%2?'copper':'gold',Math.cos(a)*.41,.28,.34+Math.sin(a)*.21,.10,.065,.09,0,a);}}
    armor(.36,.13,.52,0,.29,.46,'white');box(.24,.022,.32,0,.367,.46,'slate');box(.026,.026,.24,0,.383,.46,'orange');
    pipe([[-.67,.28,-.48],[-.67,.69,-.48],[.65,.69,-.48],[.65,.29,-.48]],.035,'orange');
    hazard(0,.176,.69,.61);windows(0,1.10,.371,.30,3);
  }else if(id==='Gas_Mine') {
    for(const[x,z,h,r]of[[-.34,-.23,1.77,.23],[.35,-.20,1.28,.21]]){
      cylinder(r*1.16,.15,x,.29,z,'navy');cylinder(r,h-.48,x,(h+.12)/2,z,'white');cylinder(r*1.1,.12,x,h-.13,z,'orange');
      mouth(x,h,z,r*.84,.20,'steel');cylinder(r*.68,.04,x,h-.09,z,'dark');
      for(let k=0;k<6;k++){const a=k*Math.PI/3;box(.062,h-.67,.064,x+Math.cos(a)*r,(h+.26)/2,z+Math.sin(a)*r,'navy',-a);box(.024,h-.77,.025,x+Math.cos(a)*(r+.03),(h+.26)/2,z+Math.sin(a)*(r+.03),'cyan',-a);}
      ring(r*1.12,x,.43,z,'orange');ring(r*1.1,x,h-.29,z,'pale');
    }
    armor(.83,.39,.47,0,.41,.40,'white');vent(0,.62,.40,.59,.29);windows(0,.43,.65,.57,5);
    pipe([[-.34,.61,-.23],[-.34,.61,.39],[.35,.61,.39],[.35,.68,-.20]],.05,'orange');
    for(const x of[-.57,.57]){cylinder(.11,.15,x,.26,.37,'steel');cylinder(.067,.055,x,.36,.37,'cyan');}
  }else if(id==='Solar_Plant') {
    armor(1.30,.35,1.10,0,.40,-.02,'hull');armor(.37,.78,.97,0,.82,-.11,'pale');
    for(const x of [-.42,.42]){
      add('solarArc','solar',x,.38,-.41,.49,1.10,.99);
      for(let row=0;row<=12;row++){
        const a=row/12*Math.PI/2,y=.38+Math.sin(a)*1.10,z=-.41+Math.cos(a)*.99;
        beam([x-.245,y+.004,z+.004],[x+.245,y+.004,z+.004],row===0||row===12?.027:.009,row===0||row===12?'pale':'glassLight');
      }
      for(let col=0;col<=4;col++){
        const dx=x-.245+col*.1225;
        for(let row=0;row<12;row++){
          const a=row/12*Math.PI/2,b=(row+1)/12*Math.PI/2;
          beam([dx,.387+Math.sin(a)*1.10,-.403+Math.cos(a)*.99],[dx,.387+Math.sin(b)*1.10,-.403+Math.cos(b)*.99],col===0||col===4?.028:.008,col===0||col===4?'pale':'glassLight');
        }
      }
      for(const z of [-.34,.40])box(.08,.32,.10,x,.38,z,'navy');
    }
    armor(.31,.42,.32,0,1.25,-.34,'hull');pool(0,-.34,.22,.22,1.472,'amber');cylinder(.065,.051,-.02,1.527,-.43,'steel');
    add('armor','slate',0,.32,.54,.32,.065,.33,.42);for(let n=0;n<4;n++)box(.26,.022,.025,0,.42-n*.029,.42+n*.056,'steel');
    for(const x of [-.68,.68])for(const z of [.33,.53]){cylinder(.046,.20,x,.31,z,'steel');for(const y of [.25,.30,.35,.40])ring(.044,x,y,z,'gold');}
    hazard(.38,.18,.70,.60,.045);vent(0,1.22,.02,.26,.35);
  }else if(id==='Metal_Storage'||id==='Crystal_Storage') {
    const crystal=id==='Crystal_Storage';
    for(const x of[-.36,.36])for(const z of[-.34,.34]){
      const h=crystal?1.0:1.17,r=.26;
      cylinder(r*1.13,.12,x,.27,z,'navy');cylinder(r,h,x,.34+h/2,z,crystal?'glass':'white');
      cylinder(r*1.10,.12,x,.35+h,z,'white');add('dome','white',x,.41+h,z,r*.95,.085,r*.95);
      ring(r*1.08,x,.51+h*.58,z,'orange');cylinder(.067,.06,x,.53+h,z,'steel');
      for(let k=0;k<4;k++){const a=k*Math.PI/2;box(.042,h*.96,.043,x+Math.cos(a)*r,.37+h/2,z+Math.sin(a)*r,'steel',-a);}
      if(crystal){shard(x,.43,z+.258,.095,.42,'cyan',0,0);box(.065,.44,.021,x,.82,z-.264,'cyan');}
      else{box(.17,.18,.02,x,.69,z+.267,'navy');box(.16,.04,.024,x,.67,z+.28,'orange');}
    }
    pipe([[-.66,.24,.59],[.66,.24,.59],[.66,.24,-.56]],.034,'orange');hazard(0,.176,.71,1.18);
  }else if(id==='Gas_Storage') {
    for(const x of[-.34,.34])for(const z of[-.34,.34]){
      cylinder(.23,.25,x,.34,z,'navy');add('sphere','white',x,.76,z,.32,.37,.32);ring(.319,x,.77,z,'orange');
      cylinder(.092,.08,x,1.125,z,'steel');cylinder(.05,.05,x,1.184,z,'cyan');
      for(const side of[-1,1]){box(.052,.55,.073,x+side*.25,.52,z,'steel');box(.018,.24,.026,x+side*.277,.68,z,'orange');}
      pipe([[x,.51,z],[x,.29,z],[x,.29,.63]],.030,'orange');
    }
    pipe([[-.63,.27,.64],[.63,.27,.64],[.63,.63,.46]],.042,'orange');
    armor(.18,.53,.30,.64,.49,-.07,'white');box(.022,.28,.12,.746,.51,-.07,'cyan');
    const valve=moving('pressure valve',.63,.67,.47,'y',.07);ring(.085,0,0,0,'navy',Math.PI/2,valve);box(.16,.018,.02,0,0,0,'steel',0,0,valve);
    hazard(0,.176,.71,1.05);
  }else if(id==='Robotics_Facility') {
    armor(1.35,.55,.47,0,.60,-.39,'hull');armor(1.43,.13,.53,0,.92,-.39,'pale');
    for(const side of [-1,1]){armor(.38,.48,.49,side*.50,.54,-.13,'hull');add('cylinder','navy',side*.69,.59,-.16,.064,.017,.064,0,0,Math.PI/2);}
    armor(.53,.43,.60,-.02,.57,-.02,'navy');add('armor','steel',-.02,.83,-.025,.64,.12,.63,-.20);
    for(let k=0;k<5;k++)box(.49,.023,.020,-.02,.887-k*.006,-.27+k*.054,'slate');
    armor(.82,.39,.57,-.04,.42,.42,'white');box(.59,.24,.024,-.04,.43,.718,'navy');
    box(.025,.22,.035,-.04,.43,.736,'steel');box(.31,.035,.018,-.04,.51,.737,'cyan');
    armor(.89,.07,.63,-.04,.65,.42,'steel');vent(-.04,.696,.42,.55,.35);
    box(.59,.018,.24,-.04,.224,.62,'slate');
    armor(.29,.75,.29,-.46,1.32,-.39,'hull');add('armor','steel',-.46,1.74,-.39,.29,.18,.29,0,0,-.35);
    add('cylinder','gold',-.46,1.59,-.228,.079,.035,.079,Math.PI/2);add('cylinder','glassLight',-.46,1.59,-.201,.054,.018,.054,Math.PI/2);
    vent(-.18,1.00,-.39,.38,.27);for(const z of [.29,.59]){cylinder(.117,.065,.54,.26,z,'steel');cylinder(.094,.025,.54,.305,z,'pale');}
    for(const x of [.38,.60]){cylinder(.031,.16,x,1.064,-.35,'steel');for(let n=0;n<4;n++)ring(.032,x,1.01+n*.029,-.35,'gold');}
    hazard(-.04,.177,.728,.62,.042);bolts(.51,.831,-.15,.31,.36);
  }else if(id==='Shipyard') {
    // shortcut: parked fighters dress the airfield; bind to fleet inventory if occupancy becomes gameplay.
    group.userData.parkedFighters=4;
    group.userData.runway={center:[0,.19,.94],length:5.36,width:1.06,axis:'x'};
    group.userData.fighterParking=[[-.22,.19,-1.12],[.88,.19,-1.12],[1.98,.19,-1.12],[-1.75,1.67,-.96]];
    box(5.36,.016,1.06,0,.182,.94,'dark');
    for(const z of[.43,1.45])box(5.29,.009,.034,0,.198,z,'white');
    for(let i=0;i<7;i++)box(.30,.011,.056,-2.1+i*.70,.202,.94,'white');
    for(const x of[-2.42,2.42])for(const z of[.61,.75,1.13,1.27])box(.33,.011,.072,x,.201,z,'white');
    for(const x of[-2.75,2.75])for(const z of[.54,.80,1.06,1.32])cylinder(.033,.027,x,.197,z,'cyan');
    box(3.70,.012,.032,.87,.183,-.37,'yellow');box(.030,.013,.84,2.43,.184,.035,'yellow');
    for(const x of[-.22,.88,1.98]){
      box(.82,.009,.023,x,.181,-1.66,'pale');
      for(const side of[-1,1])box(.023,.009,1.12,x+side*.45,.181,-1.11,'pale');
      box(.026,.012,.40,x,.185,-.36,'yellow');
    }
    box(1.55,.14,1.43,-1.75,.23,-.98,'navy');add('archRoof','steel',-1.75,.31,-.98,.70,.88,1.35);
    for(const z of[-1.65,-1.31,-.97,-.63,-.305])add('halfRing','pale',-1.75,.31,z,.711,.894,.711);
    add('halfDisc','red',-1.75,.31,-.294,.636,.800,.026);box(.041,.80,.035,-1.75,.71,-.273,'dark');
    for(const x of[-2.23,-2.06,-1.91,-1.59,-1.44,-1.27]){
      const dx=(x+1.75)/.636,h=.80*Math.sqrt(Math.max(0,1-dx*dx));box(.039,h,.024,x,.31+h/2,-.270,'copper');box(.012,h*.85,.020,x+.045,.31+h*.43,-.254,'gold');
    }
    hazard(-1.75,.307,-.22,1.43,.066);
    for(const x of[-2.47,-1.03])for(const z of[-1.51,-.45])beam([x,.31,z],[x,1.57,z],.10,'navy');
    add('octagon','steel',-1.75,1.59,-.98,.93,.13,.77);add('octagon','pale',-1.75,1.662,-.98,.86,.013,.70);ring(.43,-1.75,1.677,-.98,'white');
    for(const x of[-2.35,-1.15])for(const z of[-1.39,-.58]){cylinder(.018,.21,x,1.77,z,'steel');cylinder(.036,.035,x,1.893,z,'cyan');}
    armor(.36,1.10,.49,-2.54,.77,-.78,'white');armor(.53,.22,.57,-2.48,1.39,-.76,'navy');windows(-2.48,1.40,-.46,.39,4);cylinder(.024,.39,-2.55,1.65,-.79,'steel');cylinder(.055,.065,-2.55,1.885,-.79,'cyan');
    for(const z of[-1.56,-1.22]){cylinder(.105,.29,-.80,.36,z,'steel');cylinder(.112,.051,-.80,.53,z,'steel');ring(.105,-.80,.40,z,'orange');}
    function fighter(x,y,z){
      add('fighterWing','white',x,y+.145,z,.70,.035,.68);armor(.15,.13,.63,x,y+.18,z,'white');
      add('point','white',x,y+.18,z-.40,.087,.27,.087,-Math.PI/2);add('dome','glass',x,y+.255,z-.13,.071,.059,.13);
      for(const side of[-1,1]){
        armor(.095,.13,.42,x+side*.16,y+.17,z+.13,'navy');add('cylinder','steel',x+side*.16,y+.18,z+.36,.055,.10,.055,Math.PI/2);
        add('cylinder','cyan',x+side*.16,y+.18,z+.416,.038,.016,.038,Math.PI/2);box(.048,.027,.28,x+side*.34,y+.16,z+.08,'orange',side*-.26);
        box(.027,.17,.17,x+side*.14,y+.29,z+.25,'white',0,side*.14);box(.038,.10,.035,x+side*.15,y+.075,z+.18,'steel');
      }
      box(.04,.10,.04,x,y+.075,z-.26,'steel');box(.05,.025,.11,x,y+.015,z-.26,'dark');
    }
    for(const parking of group.userData.fighterParking)fighter(...parking);
  }else if(id==='Research_Lab') {
    for(const[x,z,r,h,domeH]of [[.15,.03,.46,.63,.34],[-.49,-.38,.265,1.09,.23],[-.39,.43,.285,.40,.22]]){
      ribbedBody(x,.24+h*.5,z,r,h,'hull');ribbedDome(x,.24+h,z,r,domeH);cylinder(r*.15,.034,x,.26+h+domeH,z,'pale');
      beam([x,.28+h+domeH,z],[x,.49+h+domeH,z],.010,'steel');add('sphere','pale',x,.48+h+domeH,z,.025,.022,.025);
    }
    armor(.35,.17,.27,-.53,.32,.09,'steel');for(let k=0;k<4;k++)box(.27,.017,.025,-.53,.424,.0+k*.052,'pale');
    curvedPipe('rear-service',[[-.47,.71,-.24],[-.58,.65,-.09],[-.58,.40,.02]],.027,'steel');
    ribbedBody(.56,.49,.44,.117,.50,'slate');add('dome','glass',.56,.75,.44,.122,.081,.122);
    box(.29,.018,.39,.57,.178,-.48,'hull');hazard(.57,.193,-.678,.32,.047);hazard(.57,.193,-.282,.32,.047);
    for(const x of [.30,.49]){cylinder(.061,.075,x,.219,.70,'navy');cylinder(.049,.021,x,.268,.70,'yellow');}
  }else if(id==='Radar_Facility') {
    cylinder(.19,.12,0,.26,0,'navy');ring(.69,0,.28,0,'pale');
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2,s=Math.sin(a),c=Math.cos(a);
      curvedPipe('mast-leg-'+k,[[s*.52,.21,c*.52],[s*.32,.29,c*.32],[s*.17,.62,c*.17],[s*.12,.96,c*.12]],.064,'steel');
      armor(.19,.36,.20,s*.68,.40,c*.68,'hull',a);box(.06,.15,.037,s*.68,.43,c*.68+.108,'cyan',a);
      beam([s*.51,.29,c*.51],[s*.70,.29,c*.70],.081,'navy');
    }
    cylinder(.065,.64,0,1.10,0,'pale');cylinder(.099,.12,0,.85,0,'navy');
    for(let k=0;k<7;k++){const y=.73+k*.070;box(.13,.021,.057,-.096,y,.074,'glassLight');}
    cylinder(.08,.21,0,1.46,0,'navy');cylinder(.052,.26,0,1.61,0,'steel');
    const crown=moving('radar antenna crown',0,1.84,0,'y',.27);add('sphere','gold',0,0,0,.155,.155,.155,0,0,0,crown);cylinder(.107,.066,0,-.18,0,'cyan',crown);
    for(const side of [-1,1]){box(.38,.038,.043,side*.16,0,0,'steel',0,0,crown);armor(.089,.47,.21,side*.28,.025,0,'hull',0,side*-.05,crown);box(.031,.37,.14,side*.331,.025,0,'navy',0,0,crown);for(const y of [-.11,.02,.15])box(.038,.025,.17,side*.33,y,0,'glassLight',0,0,crown);}
    cylinder(.041,.17,0,.20,0,'steel',crown);add('sphere','cyan',0,.30,0,.048,.040,.048,0,0,0,crown);beam([0,.31,0],[0,.52,0],.013,'steel',crown);
  }else if(id==='Fusion_Reactor') {
    cylinder(.58,.10,-.19,.24,.12,'steel');cylinder(.514,.11,-.19,.262,.12,'navy');ring(.526,-.19,.33,.12,'pale');ring(.445,-.19,.285,.12,'cyan');
    cylinder(.22,.52,-.19,.55,.12,'hull');cylinder(.285,.16,-.19,.91,.12,'dark');cylinder(.29,.066,-.19,1.012,.12,'pale');
    for(let k=0;k<4;k++){
      const a=k*Math.PI/2,s=Math.sin(a),c=Math.cos(a);
      beam([-.19+s*.42,.30,.12+c*.42],[-.19+s*.14,.76,.12+c*.14],.045,'steel');
      curvedPipe('copper-loop-'+k,[[-.19+s*.12,1.08,.12+c*.12],[-.19+s*.40,1.08,.12+c*.40],[-.19+s*.40,.66,.12+c*.40],[-.19+s*.26,.54,.12+c*.26]],.031,'copper');
      box(.044,.35,.055,-.19+s*.255,.78,.12+c*.255,'copper',-a);
    }
    const chamber=moving('fusion electrode array',-.19,1.08,.12,'y',.12);cylinder(.125,.12,0,0,0,'slate',chamber);
    for(let k=0;k<5;k++){const a=k*Math.PI*2/5;add('point','pale',Math.sin(a)*.10,.17,Math.cos(a)*.10,.035,.21,.035,0,0,Math.sin(a)*.24,chamber);}
    armor(.33,1.08,.35,.52,.81,-.40,'hull');armor(.41,.16,.41,.52,.67,-.40,'steel');armor(.37,.19,.36,.52,1.15,-.40,'navy');
    beam([.52,1.17,-.40],[.52,1.63,-.40],.084,'steel');
    const dish=new THREE.Group();dish.name='fusion collector';dish.position.set(.52,1.68,-.40);dish.rotation.x=1.00;group.add(dish);
    add('dish','pale',0,0,0,.345,.345,.345,0,0,0,dish);ring(.345,0,.162,0,'steel',Math.PI/2,dish);cylinder(.044,.20,0,.18,0,'navy',dish);beam([0,.12,0],[.22,.162,0],.043,'dark',dish);
    for(let k=0;k<3;k++)box(.032,.11,.12,.701,.73+k*.17,-.40,'slate');hazard(-.12,.177,.72,1.08,.045);
    bolts(.52,.292,-.40,.39,.43);
  }else if(id==='The_EU_X_Radar') {
    armor(.67,.33,.66,0,.40,0,'white');windows(0,.43,.353,.49);add('cone','navy',0,.71,0,.23,.35,.23);
    for(const s of [-1,1]){beam([s*.29,.50,0],[s*.14,1.29,0],.075,'orange');beam([s*.30,.50,-.23],[s*.08,1.22,-.04],.037,'steel');}
    const rotor=moving('radar azimuth',0,1.34,0,'y',.19),dish=new THREE.Group();dish.name='tilted reflector';dish.rotation.x=.56;rotor.add(dish);
    add('dish','slate',0,0,0,.68,.68,.68,0,0,0,dish);ring(.68,0,.68*.47,0,'white',Math.PI/2,dish);
    for(let k=0;k<3;k++){const a=k*Math.PI*2/3;beam([Math.cos(a)*.612,.2652,Math.sin(a)*.612],[0,.6188,0],.024,'navy',dish);}
    cylinder(.055,.14,0,.6188,0,'orange',dish);add('sphere','cyan',0,.7072,0,.035,.035,.035,0,0,0,dish);
    armor(.34,.39,.38,-.47,.42,.31,'navy');vent(-.47,.627,.31,.26,.26);
  }else if(id==='Nanite_Factory') {
    armor(.98,.41,.95,0,.46,0,'navy');cylinder(.32,.31,0,.82,0,'steel');cylinder(.20,.38,0,1.08,0,'cyan');
    for(const x of [-.39,.39])for(const z of [-.35,.35]){armor(.28,.68,.31,x,.85,z,'white');box(.05,.41,.032,x,.88,z+Math.sign(z)*.17,'orange');}
    armor(.92,.12,.83,0,1.25,0,'white');vent(0,1.32,0,.57,.45);
    const rotor=moving('nanite assembly platen',0,.70,0,'y',.52);ring(.31,0,0,0,'orange',Math.PI/2,rotor);for(let k=0;k<4;k++){const a=k*Math.PI/2;box(.12,.07,.12,Math.cos(a)*.24,.03,Math.sin(a)*.24,'steel',-a,0,rotor);}
    windows(0,.50,.492,.72,6);pipe([[-.52,.40,-.3],[-.60,.40,-.3],[-.60,1.16,-.3],[-.38,1.16,-.3]],.03,'orange');
  }else if(id==='Alliance_Depot') {
    cylinder(.32,.20,0,.32,0,'white');add('cone','navy',0,1.25,0,.26,1.70,.26);
    for(const y of [.68,1.12,1.56,1.94]){cylinder(.32,.10,0,y,0,'white');ring(.285,0,y+.06,0,'cyan');}
    add('cone','white',0,2.14,0,.48,.25,.48);cylinder(.50,.08,0,2.30,0,'navy');cylinder(.22,.21,0,2.43,0,'slate');
    beam([0,2.5,0],[0,2.92,0],.027,'steel');box(.18,.04,.04,0,2.79,0,'orange');
    for(const side of [-1,1]){beam([0,1.75,0],[side*.63,1.75,0],.09,'orange');armor(.27,.13,.33,side*.59,1.84,0,'white');box(.12,.028,.022,side*.59,1.88,.175,'cyan');container(side*.40,.39,.34,.34,.29,.41,'slate');}
  }else if(id==='Command_Center') {
    const height=1.80+Math.min(3,Math.floor(Math.max(0,level-1)/6))*.16;
    cylinder(.82,.12,0,.24,0,'white');cylinder(.69,.17,0,.38,0,'navy');ring(.71,0,.49,0,'orange');
    cylinder(.47,height-.50,0,(height+.50)/2,0,'navy');
    for(let k=0;k<6;k++){
      const a=k*Math.PI/3,x=Math.sin(a),z=Math.cos(a);
      armor(.25,height-.45,.16,x*.41,(height+.53)/2,z*.41,'white',a);
      box(.075,.35,.05,x*.48,.80,z*.48,'orange',a);box(.036,height-.89,.025,x*.488,(height+.70)/2,z*.488,'cyan',a);
      armor(.22,.25,.25,x*.62,.53,z*.62,'white',a);box(.12,.08,.03,x*.76,.52,z*.76,'cyan',a);
    }
    add('cone','white',0,height+.12,0,.46,.29,.46);cylinder(.25,.31,0,height+.38,0,'white');ring(.26,0,height+.54,0,'orange');
    cylinder(.17,.045,0,height+.57,0,'dark');cylinder(.073,.065,0,height+.62,0,'cyan');beam([0,height+.64,0],[0,height+1.00,0],.028,'cyan');
    cylinder(.49,.08,0,.98,0,'white');ring(.50,0,1.03,0,'cyan');
    armor(.35,.13,.25,0,.35,.70,'navy');box(.25,.022,.02,0,.41,.84,'orange');
  }else if(id==='Moon_Base') {
    cylinder(.55,.12,0,.30,-.03,'navy');add('dome','white',0,.37,-.03,.54,.49,.54);ring(.54,0,.39,-.03,'orange');
    for(let k=0;k<8;k++){const a=k*Math.PI/4;beam([Math.cos(a)*.53,.39,-.03+Math.sin(a)*.53],[Math.cos(a)*.23,.79,-.03+Math.sin(a)*.23],.019,'steel');}
    cylinder(.15,.06,0,.88,-.03,'navy');cylinder(.09,.08,0,.94,-.03,'cyan');
    armor(.36,.35,.43,0,.43,.52,'white');box(.22,.25,.035,0,.42,.747,'navy');box(.025,.17,.015,-.07,.43,.77,'cyan');box(.025,.17,.015,.07,.43,.77,'cyan');
    tank(-.52,-.26,.13,.40,'slate');tank(.52,-.26,.13,.40,'slate');
  }else if(id==='Flagship_Center') {
    // Compact lunar construction dock for retained building inspectors.
    for(const x of[-.64,.64]){armor(.3,.7,1.4,x,.61,0,'white');windows(x,.78,.72,.2,2);}
    armor(1.15,.62,.25,0,.57,-.62,'navy');
    for(const z of[-.4,.15,.6]){beam([-.6,1.05,z],[.6,1.05,z],.045,'orange');for(const x of[-.6,.6])beam([x,.3,z],[x,1.05,z],.035,'steel');}
    armor(.38,.21,.95,0,.5,0,'slate');box(.07,.04,.8,0,.63,0,'cyan');
    cylinder(.12,.6,.62,1.25,-.5,'navy');ring(.14,.62,1.56,-.5,'cyan');
  }else if(id==='Wormhole_Generator') {
    for(const side of [-1,1]){armor(.30,.53,.50,side*.43,.50,0,'white');box(.16,.06,.52,side*.43,.34,0,'orange');}
    const portal=moving('wormhole containment ring',0,1.15,0,'z',.13);ring(.59,0,0,0,'navy',0,portal);ring(.50,0,0,0,'cyan',0,portal);
    for(let k=0;k<8;k++){const a=k*Math.PI/4;armor(.16,.27,.20,Math.sin(a)*.59,Math.cos(a)*.59,0,'white',0,-a,portal);box(.09,.038,.22,Math.sin(a)*.49,Math.cos(a)*.49,0,'orange',0,-a,portal);}
    armor(.53,.13,.42,0,.28,.41,'navy');windows(0,.30,.635,.37,4);
  }else if(id==='Terraformer') {
    cylinder(.34,.54,-.15,.51,.08,'navy');add('cone','white',-.15,.90,.08,.38,.26,.38);cylinder(.19,.24,-.15,1.13,.08,'steel');
    for(const[x,z,h]of [[-.44,-.31,1.68],[.34,-.23,2.0]]){
      cylinder(.13,h-.31,x,.31+(h-.31)/2,z,'white');cylinder(.17,.11,x,h,z,'navy');cylinder(.136,.12,x,h-.30,z,'orange');
      for(let k=0;k<4;k++)box(.022,.15,.022,x+.14,.62+k*.25,z,'steel');
    }
    armor(.38,.35,.45,.42,.43,.32,'white');vent(.42,.618,.32,.26,.29);windows(.42,.49,.557,.24,2);
    pipe([[-.15,.62,.08],[-.15,.62,.48],[.25,.62,.48],[.25,.40,.30]],.048,'orange');pipe([[-.44,1.31,-.31],[.34,1.31,-.31],[.34,1.02,-.23]],.040,'steel');
  }else if(id==='Missile_Silo') {
    armor(.99,.16,.96,-.09,.29,0,'navy');
    for(const x of [-.35,.15])for(const z of [-.27,.25]){
      cylinder(.205,.11,x,.39,z,'steel');cylinder(.172,.07,x,.48,z,'dark');add('round','white',x,.53,z,.157,.035,.157);
      box(.013,.012,.29,x,.553,z,'navy');box(.21,.013,.031,x,.554,z-.06,'orange');box(.21,.013,.031,x,.554,z+.06,'orange');
    }
    armor(.26,.55,.47,.53,.51,-.17,'white');windows(.53,.63,.078,.17,2);beam([.53,.81,-.17],[.53,1.12,-.17],.026,'steel');
  }else throw new Error('Unknown colony building: '+id);

  for(const[parent,bins]of batches)for(const {key,mat,transforms}of bins.values()){
    const mesh=new THREE.InstancedMesh(geometry(key),material(mat),transforms.length);mesh.name=id+'/'+key+'/'+mat;
    transforms.forEach((transform,i)=>mesh.setMatrixAt(i,transform));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.building=id;mesh.userData.sharedBuilding=true;mesh.computeBoundingSphere();parent.add(mesh);
  }
  group.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(group);
  return {group,height:bounds.max.y,animations};
}
