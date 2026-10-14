import {SimplexNoise} from 'three/addons/math/SimplexNoise.js';

export const GAS_RADIUS=42;
export const GAS_CENTER_Y=6-GAS_RADIUS;

export function seededRandom(seed=4128){return()=>{seed=Math.imul(seed,1664525)+1013904223>>>0;return seed/4294967296;};}
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};

export function createLandscape(THREE){
  const noise=new SimplexNoise({random:seededRandom(917)}),group=new THREE.Group(),random=seededRandom(611);
  const fbm=(x,y,z)=>noise.noise3d(x,y,z)*.58+noise.noise3d(x*2.1+3,y*2.1,z*2.1)*.27+noise.noise3d(x*4.3,y*4.3+9,z*4.3)*.15;
  let currentType='terrestrial';
  function craterField(seed,count){
    const rand=seededRandom(seed),field=[];
    for(let i=0;i<count;i++){
      const y=rand()*2-1,a=rand()*Math.PI*2,r=Math.sqrt(1-y*y),radius=.045+rand()*.15;
      field.push({x:Math.cos(a)*r,y,z:Math.sin(a)*r,radius,depth:radius*(.28+rand()*.3)});
    }
    return field;
  }
  const marsCraters=craterField(8402,30),mercuryCraters=craterField(2718,72),moonCraters=craterField(7091,62);
  const mercuryPits=[[-5.1,0]];
  function addBasin(field,vector,radius,depth){const center=new THREE.Vector3(...vector).normalize();field.push({x:center.x,y:center.y,z:center.z,radius,depth});}
  addBasin(marsCraters,[.45,.16,.88],.2,.16);addBasin(marsCraters,[-.18,.42,.89],.16,.115);addBasin(marsCraters,[.75,-.32,.58],.13,.1);
  addBasin(moonCraters,[.4,.27,.88],.22,.17);addBasin(moonCraters,[-.3,.35,.89],.15,.12);addBasin(moonCraters,[.6,-.3,.7],.13,.1);
  function colonyAt(n){return smooth(.78,.96,n.y+.045*noise.noise3d(n.x*7,3,n.z*7));}
  function sampleTerrestrial(n){
    const warp=noise.noise3d(n.x*2.1+9,n.y*2.1,n.z*2.1)*.27;
    const coast=fbm(n.x*2.15+warp+2,n.y*2.15-4,n.z*2.15+warp);
    const colony=colonyAt(n);
    const land=coast*(1-colony)+.24*colony;
    const ridge=Math.pow(1-smooth(0,.72,Math.abs(fbm(n.x*5.8+31,n.y*5.8,n.z*5.8))),2);
    // The beach joins the seabed continuously; the colony plateau remains 6.103.
    const shore=smooth(-.04,.09,land);
    const height=land*.18+shore*(.055+land*.02)+ridge*.46*smooth(.15,.42,land)*(1-colony);
    return {radius:6+height,land,ridge,colony,moisture:fbm(n.x*4,n.y*4+19,n.z*4)};
  }
  function sampleRock(n,type='mars'){
    const moon=type==='moon',mercury=type==='mercury',offset=moon?41:mercury?73:17,colony=colonyAt(n);
    const broad=fbm(n.x*2.7+offset,n.y*2.7-4,n.z*2.7+8);
    const detail=fbm(n.x*11+offset,n.y*11,n.z*11),ridge=1-Math.abs(detail);
    let height=.035+broad*(moon?.04:mercury?.12:.25)+detail*(moon?.008:.045),crater=0;
    if(!moon&&!mercury)height+=Math.floor(smooth(-.25,.45,broad)*4)*.055;
    for(const c of moon?moonCraters:mercury?mercuryCraters:marsCraters){
      const d2=Math.max(0,2-2*(n.x*c.x+n.y*c.y+n.z*c.z));
      if(d2>c.radius*c.radius*2.1025)continue;
      const q=Math.sqrt(d2)/c.radius,bowl=1-smooth(.12,.91,q);
      const rim=Math.exp(-(((q-.98)/.155)**2))*.38;
      height+=c.depth*(-bowl+rim);crater=Math.max(crater,bowl);
    }
    // Building positions retain a stable, continuous plateau at the north pole.
    height=height*(1-colony)+(moon?.06:.095)*colony;
    if(mercury&&n.y>.9)for(const[x,z]of mercuryPits){
      const q=Math.hypot(n.x*30-x,n.z*30-z)/1.05;
      if(q<1.3)height+=-.055*(1-smooth(.30,.90,q))+.018*Math.exp(-(((q-1)/.16)**2));
    }
    return {radius:6+height,land:1,ridge,colony,moisture:0,crater:crater*(1-colony),broad,detail};
  }
  function sample(n){
    if(currentType==='gas')return {radius:GAS_RADIUS,land:-1,ridge:0,colony:0,moisture:0};
    if(['mars','mercury','moon'].includes(currentType))return sampleRock(n,currentType);
    return sampleTerrestrial(n);
  }
  const geometry=new THREE.SphereGeometry(1,168,112),position=geometry.attributes.position,colors=[],n=new THREE.Vector3();
  const sand=new THREE.Color('#c3b78a'),grass=new THREE.Color('#789653'),forest=new THREE.Color('#3d7253'),stone=new THREE.Color('#858f83'),snow=new THREE.Color('#d9ded2');
  for(let i=0;i<position.count;i++){
    n.fromBufferAttribute(position,i).normalize();const p=sample(n),c=sand.clone();
    if(p.land>.025)c.lerp(grass,smooth(.025,.11,p.land));
    if(p.land>.09)c.lerp(forest,smooth(-.1,.5,p.moisture)*.52);
    if(p.radius>6.22)c.lerp(stone,smooth(6.22,6.39,p.radius));
    if(Math.abs(n.z)>.94&&p.land>0)c.lerp(snow,smooth(.94,.995,Math.abs(n.z))*.85);
    const grain=noise.noise3d(n.x*95,n.y*95,n.z*95)*.045;c.multiplyScalar(1+grain);
    colors.push(c.r,c.g,c.b);position.setXYZ(i,n.x*p.radius,n.y*p.radius,n.z*p.radius);
  }
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.93,metalness:0,flatShading:true});
  material.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vGround;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGround=position;');
    s.fragmentShader='varying vec3 vGround;\n'+s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grain=sin(vGround.x*390.+sin(vGround.z*240.))*sin(vGround.y*280.+vGround.z*180.);diffuseColor.rgb*=.96+grain*.035;');
  };
  const globe=new THREE.Mesh(geometry,material);globe.receiveShadow=true;group.add(globe);
  const seaGeo=new THREE.SphereGeometry(6.012,160,100),seaColors=[],coasts=[];
  for(let i=0;i<seaGeo.attributes.position.count;i++){
    n.fromBufferAttribute(seaGeo.attributes.position,i).normalize();const p=sample(n),c=new THREE.Color('#0b4368').lerp(new THREE.Color('#389eaa'),smooth(-.18,.035,p.land));seaColors.push(c.r,c.g,c.b);coasts.push(smooth(-.02,.018,p.land));
  }
  seaGeo.setAttribute('color',new THREE.Float32BufferAttribute(seaColors,3));seaGeo.setAttribute('coast',new THREE.Float32BufferAttribute(coasts,1));
  const clock={value:0},seaMat=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.43,metalness:.025,clearcoat:.18,clearcoatRoughness:.4});
  seaMat.onBeforeCompile=s=>{
    s.uniforms.uTime=clock;s.vertexShader='attribute float coast;varying float vCoast;varying vec3 vSea;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSea=position;vCoast=coast;');
    s.fragmentShader='uniform float uTime;varying float vCoast;varying vec3 vSea;\n'+s.fragmentShader;
    s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nvec3 ripple=vec3(sin(dot(vSea,vec3(13.4,8.1,-6.3))+uTime*.22),sin(dot(vSea,vec3(-7.7,10.9,14.2))-uTime*.17),sin(dot(vSea,vec3(5.3,-12.7,9.8))+uTime*.14));normal=normalize(normal+ripple*.005);');
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat foam=smoothstep(.3,.65,vCoast)*(1.-smoothstep(.76,.98,vCoast));float drift=.5+.5*sin(dot(vSea,vec3(8.2,4.7,-9.1))+uTime*.22);diffuseColor.rgb+=vec3(.47,.67,.61)*foam*drift*.045;');
  };
  const water=new THREE.Mesh(seaGeo,seaMat);water.receiveShadow=true;group.add(water);
  const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(6.17,80,48),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,uniforms:{sun:{value:new THREE.Vector3(-.5,.8,.5).normalize()},tint:{value:new THREE.Color(.20,.53,.92)},strength:{value:.74}},vertexShader:'varying vec3 N;varying vec3 E;varying vec3 W;void main(){vec4 p=modelViewMatrix*vec4(position,1.);N=normalize(normalMatrix*normal);E=normalize(-p.xyz);W=normalize(position);gl_Position=projectionMatrix*p;}',fragmentShader:'varying vec3 N;varying vec3 E;varying vec3 W;uniform vec3 sun;uniform vec3 tint;uniform float strength;void main(){float rim=pow(1.-abs(dot(normalize(N),normalize(E))),3.4);float day=.35+.65*max(0.,dot(W,sun));gl_FragColor=vec4(tint*day,rim*strength);}'}));group.add(atmosphere);
  const cloudMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:clock},vertexShader:'varying vec3 vP;varying vec3 vN;void main(){vP=position;vN=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
    varying vec3 vP;varying vec3 vN;uniform float uTime;
    float hash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
    void main(){vec3 p=vP*2.25+vec3(uTime*.003,0.,uTime*.001);float a=noise(p)*.45+noise(p*2.7)*.32+noise(p*6.5)*.23;float cloud=smoothstep(.55,.73,a)*smoothstep(.38,.68,noise(p*.48+9.));cloud*=1.-smoothstep(.73,.96,vN.y);float light=.68+.32*max(0.,dot(vN,normalize(vec3(-.5,.8,.5))));gl_FragColor=vec4(vec3(.84,.9,.94)*light,cloud*.32);}`});
  const clouds=new THREE.Mesh(new THREE.SphereGeometry(6.34,80,48),cloudMaterial);clouds.renderOrder=3;group.add(clouds);
  const gasClouds=new THREE.Group(),gasAtmosphere=new THREE.Group(),gasBillows=new THREE.Group();
  gasClouds.name='gas-cloud-layers';gasAtmosphere.name='gas-atmosphere';
  for(const layer of[gasClouds,gasAtmosphere]){layer.visible=false;layer.position.y=GAS_CENTER_Y;layer.scale.setScalar(GAS_RADIUS/6);group.add(layer);}
  gasBillows.name='gas-cloud-billows';gasBillows.visible=false;group.add(gasBillows);
  const vegetation=new THREE.Group();group.add(vegetation);const trees=[],rocks=[];
  for(let i=0;i<20000&&trees.length<2000;i++){
    const y=random()*2-1,a=random()*Math.PI*2,r=Math.sqrt(1-y*y);n.set(Math.cos(a)*r,y,Math.sin(a)*r);const p=sample(n);
    const x=n.x*6,z=n.z*6,insideCity=n.y>.72&&Math.abs(x)<2.7&&Math.abs(z)<2.4;
    if(p.land<.05||insideCity||p.radius>6.35)continue;
    if(noise.noise3d(n.x*13,n.y*13,n.z*13)<.09)continue;
    const point=n.clone().multiplyScalar(p.radius);trees.push({point,normal:n.clone(),scale:.028+random()*.04,conifer:random()<.32,angle:random()*Math.PI*2});
  }
  for(let i=0;i<1600&&rocks.length<280;i++){
    const y=random()*2-1,a=random()*Math.PI*2,r=Math.sqrt(1-y*y);n.set(Math.cos(a)*r,y,Math.sin(a)*r);const p=sample(n);
    if(p.land<.02||p.colony>.6||p.land>.12&&random()>.16)continue;rocks.push({point:n.clone().multiplyScalar(p.radius),normal:n.clone(),scale:.035+random()*.095,angle:random()*6.28});
  }
  const dummy=new THREE.Object3D(),up=new THREE.Vector3(0,1,0),color=new THREE.Color();
  function instances(geo,mat,items,shape){
    const mesh=new THREE.InstancedMesh(geo,mat,items.length);mesh.castShadow=true;mesh.receiveShadow=true;
    items.forEach((item,i)=>{dummy.position.copy(item.point);dummy.quaternion.setFromUnitVectors(up,item.normal);dummy.rotateY(item.angle);dummy.scale.setScalar(item.scale);shape?.(dummy,item);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);color.setHSL(.29+random()*.055,.24+random()*.13,.2+random()*.1);mesh.setColorAt(i,color);});mesh.instanceMatrix.needsUpdate=true;vegetation.add(mesh);return mesh;
  }
  const trunk=new THREE.CylinderGeometry(.1,.16,1,5);trunk.translate(0,.5,0);
  const crown=new THREE.ConeGeometry(.55,1.15,7);crown.translate(0,1.02,0);
  const broadCrown=new THREE.IcosahedronGeometry(.68,1);broadCrown.scale(1,.72,1);broadCrown.translate(0,1.05,0);
  instances(trunk,new THREE.MeshStandardMaterial({color:'#938666',roughness:1}),trees);
  const foliage=new THREE.MeshStandardMaterial({color:'#c9dab0',roughness:.96,flatShading:true});
  instances(crown,foliage,trees.filter(tree=>tree.conifer));
  instances(broadCrown,foliage,trees.filter(tree=>!tree.conifer));
  const rockGeo=new THREE.DodecahedronGeometry(1,0);rockGeo.scale(1,.6,.8);rockGeo.translate(0,.25,0);
  instances(rockGeo,new THREE.MeshStandardMaterial({color:'#b6b9a5',roughness:1,flatShading:true}),rocks);

  const colonyScenery=new Map();
  function makeColonyScenery(type){
    const details=new THREE.Group();details.name='near-colony-'+type;group.add(details);
    const rand=seededRandom(type==='mars'?142:type==='mercury'?846:390),bins=new Map(),transform=new THREE.Object3D();
    const earth=type==='terrestrial',mars=type==='mars',worldScale=5;
    const shape={cliff:new THREE.CylinderGeometry(.78,1,1,5),boulder:new THREE.IcosahedronGeometry(1,0),shard:new THREE.ConeGeometry(1,1,5),trunk:new THREE.CylinderGeometry(.075,.12,1,5),tree:new THREE.ConeGeometry(.7,1.7,5),disc:new THREE.CylinderGeometry(1,1,.05,24),rim:new THREE.TorusGeometry(1,.15,3,10).rotateX(Math.PI/2),beam:new THREE.BoxGeometry(1,1,1)};
    const shades={cliff:earth?0x889281:mars?0xb95735:0x555661,cap:earth?0x78964b:mars?0xdc8552:0x887764,ore:0xff641c,crystal:0x59c9ff,violet:0x8aacf7,trunk:0x746c55,tree:0x638149,dark:0x161e22,basalt:0x424b50,steel:0x75858f,water:0x50acb9,sand:0xc7b995,vent:0x62ef8b,vapour:0xb1efc8};
    const sites=earth?[{kind:'metal',x:-5.1,z:0},{kind:'crystal',x:-5.1,z:-2.6},{kind:'gas',x:-5.1,z:2.6}]:[{kind:mars?'crystal':'metal',x:-5.1,z:0}];
    const nearDeposit=(x,z,padding=0)=>sites.some(site=>Math.abs(x-site.x)<1.25+padding&&Math.abs(z-site.z)<1.05+padding);
    const reserved=(x,z,padding=0)=>x>-4.5-padding&&x<6.2+padding&&z>-5.2-padding&&z<6+padding;
    function piece(shapeName,shade,x,z,y,w,h,d=w,angle=0){
      // The scene expands the R6 landscape fivefold; these dimensions are colony-world units.
      const normal=new THREE.Vector3(x/worldScale,Math.sqrt(Math.max(0,36-(x*x+z*z)/(worldScale*worldScale))),z/worldScale).normalize();
      const ground=earth?sampleTerrestrial(normal):sampleRock(normal,type);
      transform.position.copy(normal).multiplyScalar(ground.radius+y/worldScale);transform.quaternion.setFromUnitVectors(up,normal);transform.rotateY(angle);transform.scale.set(w/worldScale,h/worldScale,d/worldScale);transform.updateMatrix();
      const key=shapeName+':'+shade;if(!bins.has(key))bins.set(key,{shapeName,shade,matrices:[]});bins.get(key).matrices.push(transform.matrix.clone());
    }
    for(let i=0;i<56;i++){
      const angle=rand()*Math.PI*2,r=5.7+rand()*7.1,x=Math.cos(angle)*r,z=Math.sin(angle)*r;
      if(reserved(x,z,1.3)||nearDeposit(x,z,1)||z>3.7&&Math.abs(x)<4.4)continue;
      const width=.52+rand()*1.12,height=.35+rand()*1.85;
      if(mars){
        for(let step=0;step<3;step++){const size=width*(1-step*.15);piece('cliff',step===2?'cap':'cliff',x,z,height*(step+.5)/3,size,height/3,size*.75,angle);}
      }else{piece('cliff','cliff',x,z,height*.4,width,height,width*.7,angle);piece('boulder','cap',x,z,height*.87,width*.7,height*.13,width*.54,angle);}
    }
    for(let i=0;i<130;i++){
      const x=(rand()-.5)*23,z=(rand()-.5)*22;if(reserved(x,z,.3)||nearDeposit(x,z,.15))continue;
      const size=.08+rand()*.20;piece('boulder',i%5?'cliff':'cap',x,z,size*.2,size,size*.65,size*.75,rand()*6.28);
    }
    for(const{kind,x,z}of sites){
      // Resource islands meet the mine's west edge; their low eastern rims leave the machinery clear.
      piece('cliff','basalt',x,z,.02,1.12,.23,.93,.2);
      for(let i=0;i<9;i++){
        const a=.48+i/8*5.3,px=x-.08+Math.cos(a)*.77,pz=z+Math.sin(a)*.66,size=.16+rand()*.16;
        piece('boulder','basalt',px,pz,.15,size,.12+rand()*.15,size*.8,a);
      }
      for(let i=-1;i<=1;i++)piece('beam','steel',x+.84,z+i*.43,.10,.075,.13,.38);
      if(kind==='metal'){
        piece('disc','dark',x-.08,z,.14,.66,1,.53);piece('rim','basalt',x-.08,z,.17,.68,.3,.56);
        piece('disc','ore',x-.22,z+.05,.155,.26,1,.18);
        for(let i=0;i<(earth?13:23);i++){
          const a=rand()*6.28,r=.18+rand()*.53,px=x-.13+Math.cos(a)*r,pz=z+Math.sin(a)*r*.78;
          piece('beam','ore',px,pz,.19,.035,.025,.15+rand()*.25,a);
        }
      }else if(kind==='crystal'){
        for(let i=0;i<(earth?24:40);i++){
          const a=rand()*6.28,r=Math.sqrt(rand())*.68,h=.25+rand()*(earth?.56:.88),w=.075+rand()*.105;
          piece('shard',i%5?'crystal':'violet',x-.15+Math.cos(a)*r,z+Math.sin(a)*r*.82,.11+h*.48,w,h,w,rand()*6.28);
        }
      }else{
        for(const[dx,dz,r]of[[-.3,-.32,.22],[-.26,.35,.25],[.2,-.05,.29]]){
          piece('disc','dark',x+dx,z+dz,.15,r*1.28,1,r*1.08);piece('rim','basalt',x+dx,z+dz,.19,r,.4,r*.84);piece('disc','vent',x+dx,z+dz,.175,r*.75,1,r*.60);
          for(let i=0;i<3;i++)piece('boulder','vapour',x+dx-i*.055,z+dz,.25+i*.14,r*(.66+i*.16),.10+i*.025,r*.55,i);
        }
      }
    }
    if(earth){
      for(let i=0;i<260;i++){
        const x=(rand()-.5)*25,z=(rand()-.5)*23;if(reserved(x,z,.25)||nearDeposit(x,z,.4)||x>6&&x<10&&z>1&&z<4.6)continue;
        const h=.30+rand()*.43;piece('trunk','trunk',x,z,h*.34,.24,h*.65,.24);piece('tree','tree',x,z,h*.76,h*.52,h*.66,h*.52,rand()*6.28);
      }
      piece('disc','sand',8,2.9,.026,1.75,1,1.23);piece('disc','water',8,2.9,.065,1.49,1,1.02);
    }
    for(const{shapeName,shade,matrices}of bins.values()){
      const glow=['crystal','violet','ore','vent'].includes(shade),mist=shade==='vapour',mat=new THREE.MeshStandardMaterial({color:shades[shade],roughness:shade==='water'?.3:shade==='steel'?.5:.92,metalness:shade==='steel'?.5:0,flatShading:true,emissive:glow?shades[shade]:0,emissiveIntensity:glow?(['ore','vent'].includes(shade)?.7:.3):0,transparent:mist,opacity:mist?.3:1,depthWrite:!mist});
      const mesh=new THREE.InstancedMesh(shape[shapeName],mat,matrices.length);mesh.name=type+'-'+shade;matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;details.add(mesh);
    }
    for(const[key,geo]of Object.entries(shape))if(![...bins.values()].some(bin=>bin.shapeName===key))geo.dispose();
    colonyScenery.set(type,details);return details;
  }
  makeColonyScenery('terrestrial');

  // Bounded variants are created lazily and reused. The Mesh itself never
  // changes, preserving the planet scene's existing raycast reference.
  const variants=new Map([['terrestrial',{geometry,material}]]);
  function makeRockVariant(type){
    const moon=type==='moon',mercury=type==='mercury',geo=new THREE.SphereGeometry(1,moon?224:168,moon?144:112),points=geo.attributes.position,vertexColors=[];
    const dark=new THREE.Color(moon?'#7b7d80':mercury?'#343640':'#8d341e'),light=new THREE.Color(moon?'#b4b5b4':mercury?'#a38e77':'#dd8950'),dust=new THREE.Color(moon?'#929699':mercury?'#bc743b':'#bd4f28');
    const direction=new THREE.Vector3();
    for(let i=0;i<points.count;i++){
      direction.fromBufferAttribute(points,i).normalize();const p=sampleRock(direction,type);
      const c=dark.clone().lerp(light,.22+smooth(-.48,.48,p.broad)*.6);
      c.lerp(dust,smooth(-.2,.5,p.detail)*(moon?.18:.25));
      c.multiplyScalar((1-p.crater*.28)*(1+noise.noise3d(direction.x*86,direction.y*86,direction.z*86)*.045));
      vertexColors.push(c.r,c.g,c.b);points.setXYZ(i,direction.x*p.radius,direction.y*p.radius,direction.z*p.radius);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(vertexColors,3));geo.computeVertexNormals();geo.computeBoundingSphere();
    const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.97,metalness:mercury?.10:0,flatShading:!moon});
    mat.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 vRock;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRock=position;');
      shader.fragmentShader='varying vec3 vRock;\n'+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat grit=sin(dot(vRock,vec3(151.,97.,83.)))*sin(dot(vRock,vec3(-71.,137.,53.)));diffuseColor.rgb*=.98+grit*.022;');
    };
    return {geometry:geo,material:mat};
  }
  function makeGasLayers(){
    // shortcut: thin shells approximate atmospheric depth; use volume clouds if flight inside clouds becomes gameplay.
    if(gasClouds.children.length)return;
    const billowRandom=seededRandom(9081),billowGeometry=new THREE.IcosahedronGeometry(1,1),billowMaterial=new THREE.MeshStandardMaterial({color:0xfff3df,roughness:1,flatShading:true});
    const billows=new THREE.InstancedMesh(billowGeometry,billowMaterial,180),puff=new THREE.Object3D(),puffColor=new THREE.Color();
    billows.name='golden-cloud-tops';
    for(let i=0;i<billows.count;i++){
      const a=billowRandom()*Math.PI*2,r=i<140?8+billowRandom()*18:billowRandom()*7.8,x=Math.cos(a)*r,z=Math.sin(a)*r;
      const wide=i<140?1.4+billowRandom()*2.6:1.1+billowRandom()*1.5,high=i<140?.65+billowRandom()*1.15:.30+billowRandom()*.25;
      const cloudTop=Math.sqrt(GAS_RADIUS*GAS_RADIUS-x*x-z*z)+GAS_CENTER_Y;
      puff.position.set(x,Math.min(i<140?6.9:6.30,cloudTop+high*.72)-high,z);puff.scale.set(wide,high,wide*(.72+billowRandom()*.5));puff.rotation.y=billowRandom()*Math.PI*2;puff.updateMatrix();billows.setMatrixAt(i,puff.matrix);
      puffColor.setHSL(.10+billowRandom()*.02,.23+billowRandom()*.12,.69+billowRandom()*.15);billows.setColorAt(i,puffColor);
    }
    billows.instanceMatrix.needsUpdate=true;billows.computeBoundingSphere();gasBillows.add(billows);
    const sphere=new THREE.SphereGeometry(1,128,80);
    const cloudVertex='varying vec3 vCloud;varying vec3 vCloudEye;varying vec3 vCloudNormal;void main(){vCloud=normalize(position);vec4 point=modelViewMatrix*vec4(position,1.);vCloudEye=-point.xyz;vCloudNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*point;}';
    const cloudFragment=`
      varying vec3 vCloud;varying vec3 vCloudEye;varying vec3 vCloudNormal;
      uniform float uTime;uniform float phase;uniform float density;
      float cloudHash(vec3 p){p=fract(p*.3183099+.13);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float cloudNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(cloudHash(i),cloudHash(i+vec3(1,0,0)),f.x),mix(cloudHash(i+vec3(0,1,0)),cloudHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(cloudHash(i+vec3(0,0,1)),cloudHash(i+vec3(1,0,1)),f.x),mix(cloudHash(i+vec3(0,1,1)),cloudHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      void main(){
        vec3 n=normalize(vCloud);float drift=uTime*(.0007+phase*.0002),cs=cos(drift),sn=sin(drift);
        n=vec3(n.x*cs+n.z*sn,n.y,-n.x*sn+n.z*cs);
        vec3 p=vec3(dot(n,vec3(.71,.13,.69)),dot(n,vec3(-.54,.73,.41)),dot(n,vec3(-.45,-.67,.59)));
        p*=90.+phase*55.;p.y*=2.6;p.z*=.65;p+=vec3(phase*17.,uTime*.007,phase*7.);
        float wisps=cloudNoise(p)*.63+cloudNoise(p*2.07+7.)*.37;
        float coverage=smoothstep(.3,.69,cloudNoise(n*14.+phase*9.));
        float alpha=smoothstep(.46,.75,wisps)*coverage*density;
        float horizon=pow(1.-abs(dot(normalize(vCloudNormal),normalize(vCloudEye))),2.);
        alpha*=1.-horizon*.38;
        float day=.44+.56*max(0.,dot(n,normalize(vec3(-.5,.8,.5))));
        gl_FragColor=vec4(mix(vec3(.62,.52,.36),vec3(.87,.8,.65),wisps)*day,alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `;
    for(const [index,radius,density] of[[0,6.012,.20],[1,6.043,.12]]){
      const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:clock,phase:{value:index},density:{value:density}},vertexShader:cloudVertex,fragmentShader:cloudFragment});
      const mesh=new THREE.Mesh(sphere,mat);mesh.scale.setScalar(radius);mesh.renderOrder=2+index;gasClouds.add(mesh);
    }
    const atmosphereVertex='varying vec3 vAirNormal;varying vec3 vAirEye;varying vec3 vAirWorld;void main(){vec4 point=modelViewMatrix*vec4(position,1.);vAirNormal=normalize(normalMatrix*normal);vAirEye=-point.xyz;vAirWorld=normalize(position);gl_Position=projectionMatrix*point;}';
    // Fade at the silhouette too, so low-altitude views have no hard shell outlines.
    const atmosphereFragment='varying vec3 vAirNormal;varying vec3 vAirEye;varying vec3 vAirWorld;uniform float strength;void main(){float facing=abs(dot(normalize(vAirNormal),normalize(vAirEye)));float rim=pow(1.-facing,3.3)*smoothstep(0.,.17,facing);float daylight=.24+.76*max(0.,dot(normalize(vAirWorld),normalize(vec3(-.5,.8,.5))));gl_FragColor=vec4(vec3(.58,.5,.36)*daylight,rim*strength);}';
    for(const [radius,strength] of[[6.085,.14],[6.18,.065]]){
      const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,uniforms:{strength:{value:strength}},vertexShader:atmosphereVertex,fragmentShader:atmosphereFragment});
      const mesh=new THREE.Mesh(sphere,mat);mesh.scale.setScalar(radius);mesh.renderOrder=4;gasAtmosphere.add(mesh);
    }
  }
  function makeGasVariant(){
    makeGasLayers();
    const mat=new THREE.MeshStandardMaterial({roughness:.88,metalness:0});
    mat.onBeforeCompile=shader=>{
      shader.uniforms.uGasTime=clock;
      shader.vertexShader='varying vec3 vGas;varying vec3 vGasEye;varying vec3 vGasNormal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvGas=normalize(position);').replace('#include <project_vertex>','#include <project_vertex>\nvGasEye=-mvPosition.xyz;vGasNormal=normalize(normalMatrix*normal);');
      shader.fragmentShader=`
        varying vec3 vGas;varying vec3 vGasEye;varying vec3 vGasNormal;uniform float uGasTime;
        float gasHash(vec3 p){p=fract(p*.3183099+.17);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
        float gasNoise(vec3 p){
          vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
          return mix(mix(mix(gasHash(i),gasHash(i+vec3(1,0,0)),f.x),mix(gasHash(i+vec3(0,1,0)),gasHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(gasHash(i+vec3(0,0,1)),gasHash(i+vec3(1,0,1)),f.x),mix(gasHash(i+vec3(0,1,1)),gasHash(i+vec3(1,1,1)),f.x),f.y),f.z);
        }
        float gasTurbulence(vec3 p){return gasNoise(p)*.55+gasNoise(p*2.13+7.)*.3+gasNoise(p*4.37-5.)*.15;}
        vec4 gasStorm(vec3 n,vec3 center,vec2 size,float time){
          vec3 axis=normalize(cross(vec3(0,1,0),center)),up=normalize(cross(center,axis));
          vec2 local=vec2(dot(n,axis),dot(n,up))*size;float radius=length(local);
          float mask=(1.-smoothstep(.4,1.25,radius))*smoothstep(.6,.85,dot(n,center));
          if(mask<.001)return vec4(0.);
          float angle=atan(local.y,local.x+.000001)+radius*4.8-time;
          float curl=gasTurbulence(vec3(cos(angle)*radius,sin(angle)*radius,radius)*4.1);
          float bands=.5+.5*sin(angle*2.+radius*9.+curl*7.);
          vec3 color=mix(vec3(.23,.075,.028),vec3(.65,.33,.13),bands*.7+curl*.3);
          color=mix(color,vec3(.76,.59,.36),smoothstep(.65,.94,curl)*.6);
          return vec4(color,mask);
        }
      `+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
        vec3 gasN=normalize(vGas);float time=uGasTime*.007;
        float wind=time*(.55+.45*sin(gasN.y*9.));float cs=cos(wind),sn=sin(wind);
        vec3 moving=vec3(gasN.x*cs+gasN.z*sn,gasN.y,-gasN.x*sn+gasN.z*cs);
        float latitude=asin(clamp(moving.y,-1.,1.));float longitude=atan(moving.z,moving.x);
        float turbulence=gasTurbulence(moving*12.+vec3(0,time*.2,0));
        float latitudeWarp=latitude+.034*sin(longitude*5.+latitude*13.)+.044*(turbulence-.5);
        float broad=.5+.5*sin(latitudeWarp*29.+gasTurbulence(moving*4.)*3.5+turbulence*.9);
        float fine=.5+.5*sin(latitudeWarp*112.+gasNoise(moving*37.)*3.);
        vec3 gasColor=mix(vec3(.52,.29,.14),vec3(.88,.73,.52),smoothstep(.08,.91,broad));
        gasColor=mix(gasColor,vec3(.98,.90,.75),smoothstep(.53,.88,turbulence)*.46);
        gasColor*=.88+fine*.12;
        vec4 storm=gasStorm(moving,normalize(vec3(.62,.19,.76)),vec2(4.8,10.5),time*.9);
        gasColor=mix(gasColor,storm.rgb,storm.a*.76);
        vec4 smallStorm=gasStorm(moving,normalize(vec3(-.63,-.3,.72)),vec2(8.5,14.5),-time*.7);
        gasColor=mix(gasColor,mix(smallStorm.rgb,vec3(.72,.65,.51),.58),smallStorm.a*.62);
        vec3 detailFlow=moving*145.+vec3(0,time*1.8,time*.6);
        float cloudDetail=gasNoise(detailFlow)*.65+gasNoise(detailFlow*2.07+11.)*.35;
        gasColor*=.91+cloudDetail*.17;
        float gasHaze=pow(1.-abs(dot(normalize(vGasNormal),normalize(vGasEye))),3.2);
        diffuseColor.rgb=gasColor;
      `);
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight=mix(outgoingLight,vec3(.63,.53,.38),gasHaze*.16);\n#include <opaque_fragment>');
    };
    return {geometry:new THREE.SphereGeometry(6,160,100),material:mat};
  }
  function setType(type){
    if(!['terrestrial','mercury','mars','gas','moon'].includes(type))type='terrestrial';
    if(!variants.has(type))variants.set(type,type==='gas'?makeGasVariant():makeRockVariant(type));
    const variant=variants.get(type);globe.geometry=variant.geometry;globe.material=variant.material;currentType=type;
    const gas=type==='gas';globe.scale.setScalar(gas?GAS_RADIUS/6:1);globe.position.set(0,gas?GAS_CENTER_Y:0,0);
    // The colony's small shadow frustum would leave a clipped triangle across the giant clouds.
    globe.receiveShadow=!gas;
    water.visible=clouds.visible=vegetation.visible=type==='terrestrial';atmosphere.visible=!['moon','mercury','gas'].includes(type);
    gasClouds.visible=gasAtmosphere.visible=gasBillows.visible=gas;
    if(['terrestrial','mercury','mars'].includes(type)&&!colonyScenery.has(type))makeColonyScenery(type);
    for(const[key,details]of colonyScenery)details.visible=key===type;
    const {tint,strength}=atmosphere.material.uniforms;
    if(type==='mars'){tint.value.setRGB(.87,.36,.16);strength.value=.22;}
    else if(type==='gas'){tint.value.setRGB(.69,.58,.39);strength.value=.52;}
    else{tint.value.setRGB(.20,.53,.92);strength.value=.74;}
    return type;
  }
  return {group,globe,water,clouds,vegetation,atmosphere,gasClouds,gasAtmosphere,gasBillows,colonyScenery,clock,sample,setType,get type(){return currentType;},counts:{trees:trees.length,rocks:rocks.length},setMoon(moon){return setType(moon?'moon':'terrestrial');}};
}
