import * as T from 'three';
import {createOpenHull} from './death-star-hull.js';

// Adapted from the user-supplied Death Star observatory (source header: MIT).
// Regenerate with node scripts/import-death-star.mjs. UI, lights and CDN loader
// belong to the original viewer and are deliberately outside this model factory.
export function createDeathStar(){
  const CFG = Object.freeze({ radius: 100, dishRadius: 31, dishDepth: 18,
    trenchHalfHeight: 1.55, textureWidth: 4096, textureHeight: 2048,
    surfaceSegments: 384, surfaceRings: 256, greebles: 26500, towers: 1600,
    stars: 11000, seed: 19470525 });
  let seed = CFG.seed;
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rr = (a,b) => a+(b-a)*rand();
  const clamp = T.MathUtils.clamp;
  const PI = Math.PI, TAU = PI*2, R = CFG.radius;
  const D = new T.Vector3(0.31,0.48,0.82).normalize();
  const dishAngle = Math.asin(CFG.dishRadius/R), dishDot = Math.cos(dishAngle);
  const dishRimZ = Math.sqrt(R*R-CFG.dishRadius*CFG.dishRadius);

  const station=new T.Group();station.name='Death_Star';
  let geometricParts=0;
  const addMat=m=>m;
  const metal=(color,rough=.78,metallic=.42)=>addMat(new T.MeshStandardMaterial({color,roughness:rough,metalness:metallic}));
  const charcoal=metal(0x191d23,.9,.3),trim=metal(0x50565d,.65,.55),darkSteel=metal(0x2c323a,.86,.48);
  // Large plates and small machinery share a spherical UV atlas. The height
  // atlas provides sub-pixel bevel shading; actual protrusions are instanced.
  function makeHullMaps() {
    const W=CFG.textureWidth,H=CFG.textureHeight;
    const canvas=()=>{const c=document.createElement('canvas'); c.width=W;c.height=H;return c;};
    const a=canvas(),b=canvas(),e=canvas(); const ac=a.getContext('2d'),bc=b.getContext('2d'),ec=e.getContext('2d');
    ac.fillStyle='#545b62';ac.fillRect(0,0,W,H);bc.fillStyle='#777';bc.fillRect(0,0,W,H);ec.fillStyle='#000';ec.fillRect(0,0,W,H);
    function plate(x,y,w,h,depth=0) {
      if(depth<4 && w>21 && h>19 && rand()<.86) {
        if((w/h>.85 && rand()<.75)||w/h>2.8) {
          const cut=Math.floor(w*rr(.26,.74));plate(x,y,cut,h,depth+1);plate(x+cut,y,w-cut,h,depth+1);
        } else {const cut=Math.floor(h*rr(.3,.7));plate(x,y,w,cut,depth+1);plate(x,y+cut,w,h-cut,depth+1);}
        return;
      }
      const n=Math.floor(rr(64,113)), margin=.65;
      ac.fillStyle=`rgb(${n},${n+4},${n+8})`; ac.fillRect(x+margin,y+margin,w-margin*2,h-margin*2);
      const z=Math.floor(rr(110,180));bc.fillStyle=`rgb(${z},${z},${z})`;bc.fillRect(x+margin,y+margin,w-margin*2,h-margin*2);
      ac.fillStyle='rgba(215,221,223,.19)';ac.fillRect(x+1,y+1,w-2,.65);
      ac.fillStyle='rgba(5,9,13,.5)';ac.fillRect(x+w-1.1,y+.5,.8,h-1);
      if(w>10 && h>12 && rand()<.68) {
        const vx=x+rr(2,Math.max(3,w*.45)),vy=y+rr(2,Math.max(3,h*.55));
        const vw=Math.min(w-4,rr(3,14)),vh=Math.min(h-4,rr(3,13));
        ac.fillStyle='rgba(8,12,18,.55)';ac.fillRect(vx,vy,vw,vh);bc.fillStyle='#333';bc.fillRect(vx,vy,vw,vh);
        ac.fillStyle='rgba(169,180,186,.48)';
        if(rand()<.65) for(let v=1;v<vh;v+=2.5) ac.fillRect(vx+.7,vy+v,vw-1.4,.75);
        else for(let v=1;v<vw;v+=2.7) ac.fillRect(vx+v,vy+.7,.7,vh-1.4);
      }
      if(rand()<.23 && h>9) {
        const px=x+rr(2,Math.max(3,w-2)); ac.fillStyle='rgba(9,14,18,.45)';ac.fillRect(px,y+2,1,h-4);
      }
    }
    for(let y=0;y<H;) {
      const band=Math.floor(rr(35,91));
      for(let x=-90;x<W;) {const w=Math.floor(rr(48,173));plate(x,y,w,band);x+=w;}
      ac.fillStyle='rgba(8,13,19,.63)';ac.fillRect(0,y,W,1.6);bc.fillStyle='#252525';bc.fillRect(0,y,W,1.6);
      if(rand()<.65){ac.fillStyle='rgba(169,177,187,.22)';ac.fillRect(0,y+2,W,1);}
      y+=band;
    }
    // Interrupted channels break up the plate grid without oversized tiles.
    for(let i=0;i<390;i++) {
      const x=rr(0,W),y=rr(0,H),w=rr(2,10),h=rr(25,190);
      ac.fillStyle='rgba(16,21,27,.7)';ac.fillRect(x,y,w,h);bc.fillStyle='#222';bc.fillRect(x,y,w,h);
      for(let k=0;k<h;k+=rr(4,12)){ac.fillStyle=`rgba(142,153,165,${rr(.25,.65)})`;ac.fillRect(x+1,y+k,Math.max(1,w-2),rr(.6,1.6));}
    }
    for(let i=0;i<64000;i++) {
      const x=rr(0,W),y=rr(0,H),w=rr(.4,2.8),h=rr(.5,4.5);
      ac.fillStyle=rand()<.5?'rgba(208,218,224,.16)':'rgba(9,13,18,.25)';ac.fillRect(x,y,w,h);
    }
    for(let i=0;i<9300;i++) {
      const x=Math.floor(rr(0,W)), y=Math.floor(rr(0,H));
      if(Math.abs(y-H/2)>H*.37 && rand()<.75)continue;
      const clustered=rand()<.4, n=clustered?Math.floor(rr(2,7)):1;
      for(let j=0;j<n;j++) {
        ec.fillStyle=rand()<.78?'rgb(143,120,81)':'rgb(79,119,145)'; ec.fillRect(x+j*3,y,1,rand()<.75?1:2);
        ac.fillStyle='rgba(195,197,174,.5)';ac.fillRect(x+j*3,y,1,1);
      }
    }
    const tx=(c,srgb=false)=>{const t=new T.CanvasTexture(c);if(srgb)t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;t.wrapS=T.RepeatWrapping;return t;};
    return {map:tx(a,true),bumpMap:tx(b),emissiveMap:tx(e,true)};
  }
  const maps=typeof document==='undefined'?{}:makeHullMaps();
  const hullMat=addMat(new T.MeshStandardMaterial({color:0xffffff,...maps,bumpScale:.26,emissive:0xffffff,emissiveIntensity:1.1,roughness:.83,metalness:.36}));
  const hull=new T.Mesh(createOpenHull(R,CFG.surfaceSegments,CFG.surfaceRings,D,dishRimZ,CFG.trenchHalfHeight),hullMat);
  hull.castShadow=true;hull.receiveShadow=true;
  station.add(hull);geometricParts++;
  const unitBox=new T.BoxGeometry(1,1,1),dummy=new T.Object3D(),basis=new T.Matrix4();
  const normal=new T.Vector3(),east=new T.Vector3(),north=new T.Vector3();
  const color=new T.Color();
  const solidInstances=[];
  function setupBox(instance,index,phi,y,radius,w,h,length,lightness) {
    const ct=Math.sqrt(Math.max(0,1-y*y));normal.set(ct*Math.cos(phi),y,ct*Math.sin(phi));
    east.set(-Math.sin(phi),0,Math.cos(phi));north.crossVectors(east,normal);
    basis.makeBasis(east,normal,north);dummy.quaternion.setFromRotationMatrix(basis);
    dummy.position.copy(normal).multiplyScalar(radius+h*.5);dummy.scale.set(w,h,length);dummy.updateMatrix();
    instance.setMatrixAt(index,dummy.matrix);
    if(lightness!==undefined){color.setRGB(lightness,lightness*1.025,lightness*1.07);instance.setColorAt(index,color);}
  }
  const gmat=metal(0xffffff,.76,.45);
  const greebles=new T.InstancedMesh(unitBox,gmat,CFG.greebles+CFG.towers);
  let gi=0;
  for(let i=0;i<CFG.greebles+CFG.towers;i++) {
    const p=rr(0,TAU),y=rr(-.994,.994),q=Math.sqrt(1-y*y);normal.set(q*Math.cos(p),y,q*Math.sin(p));
    if(Math.abs(y*R)<3 || normal.dot(D)>Math.cos(dishAngle+.035)){continue;}
    const tower=i>=CFG.greebles;
    const belt=Math.sin(Math.asin(y)*51)>.72;
    if(tower&&!belt&&rand()<.7)continue;
    const w=tower?rr(.35,1.5):rr(.13,.72), l=tower?rr(.7,2.3):rr(.24,2.1), h=tower?rr(.17,.58):rr(.035,.19);
    setupBox(greebles,gi++,p,y,R+.013,w,h,l,rr(.11,.34));
  }
  greebles.count=gi;greebles.instanceMatrix.needsUpdate=true;greebles.castShadow=true;greebles.receiveShadow=true;
  greebles.computeBoundingSphere();station.add(greebles);solidInstances.push(greebles);geometricParts+=gi;
  const trench=new T.Mesh(new T.CylinderGeometry(97.8,97.8,3.13,512,1,true),charcoal);station.add(trench);trench.receiveShadow=true;geometricParts++;
  function torus(parent,r,t,z,mat,segments=256) {
    const o=new T.Mesh(new T.TorusGeometry(r,t,6,segments),mat);o.position.z=z;parent.add(o);o.castShadow=true;o.receiveShadow=true;geometricParts++;return o;
  }
  for(const yy of [-1.68,1.68]) {
    const rail=torus(station,Math.sqrt(R*R-yy*yy),.11,0,trim,512);rail.rotation.x=PI/2;rail.position.y=yy;
  }
  const tm=new T.InstancedMesh(unitBox,darkSteel,3600);let ti=0;
  for(let i=0;i<2750;i++) {
    const p=rr(0,TAU),y=rr(-1.25,1.25)/R;
    setupBox(tm,ti++,p,y,rr(98.05,98.9),rr(.12,1.0),rr(.12,.64),rr(.08,.55));
  }
  for(let i=0;i<98;i++) {
    const p=i/98*TAU;
    setupBox(tm,ti++,p,0,99.08,rr(.16,.28),.7,3.03);
  }
  tm.count=ti;tm.castShadow=true;tm.receiveShadow=true;tm.computeBoundingSphere();station.add(tm);solidInstances.push(tm);geometricParts+=ti;
  const bayDark=new T.MeshBasicMaterial({color:0x020407});
  const bays=new T.InstancedMesh(unitBox,bayDark,210),borders=new T.InstancedMesh(unitBox,trim,840);
  const lightMat = new T.MeshBasicMaterial({color:0xb1c5c3,toneMapped:false});
  const trenchLights=new T.InstancedMesh(unitBox,lightMat,4500);let li=0,bi=0;
  for(let i=0;i<210;i++) {
    const p=(i+rr(-.12,.12))/210*TAU,yy=rr(-.6,.6),bw=rr(.35,1.15),bh=rr(.25,.72);
    setupBox(bays,i,p,yy/R,99.19,bw,.025,bh);
    setupBox(borders,bi++,p,(yy+bh/2+.055)/R,99.20,bw+.12,.075,.075);
    setupBox(borders,bi++,p,(yy-bh/2-.045)/R,99.20,bw+.12,.075,.07);
    setupBox(borders,bi++,p-(bw/2+.04)/R,yy/R,99.20,.07,.075,bh+.1);
    setupBox(borders,bi++,p+(bw/2+.04)/R,yy/R,99.20,.07,.075,bh+.1);
    setupBox(trenchLights,li++,p,(yy-bh/2+.045)/R,99.235,bw*.7,.03,.025);
  }
  for(let i=0;i<3200;i++) {
    setupBox(trenchLights,li++,rr(0,TAU),rr(-1.32,1.32)/R,rr(98.75,99.4),rr(.018,.05),.035,rr(.015,.035));
    color.setRGB(rr(.25,.55),rr(.22,.46),rr(.16,.38));trenchLights.setColorAt(li-1,color);
  }
  trenchLights.count=li;
  for(const m of [bays,borders,trenchLights]){m.computeBoundingSphere();station.add(m);geometricParts+=m.count;}
  borders.castShadow=true;borders.receiveShadow=true;

  // True concave paraboloid: z rises from the central recess toward the rim.
  // The hull is clipped at the same analytic spherical-cap boundary in both
  // color and shadow passes, so the dish stays open from every viewing angle.
  const dish=new T.Group();dish.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),D);station.add(dish);
  const bowlZ = r => dishRimZ-CFG.dishDepth+CFG.dishDepth*(r/CFG.dishRadius)**2;
  let dishTexture,dishBump;
  if(typeof document!=='undefined'){
  const dc=document.createElement('canvas');dc.width=dc.height=2048;const cx=dc.getContext('2d');
  cx.fillStyle='#50545a';cx.fillRect(0,0,2048,2048);cx.translate(1024,1024);
  const dr=1000;
  for(let row=0;row<17;row++) {
    const r0=row/17*dr,r1=(row+1)/17*dr;
    const sectors=Math.max(24,Math.round(48+row*5.6));
    for(let j=0;j<sectors;j++){
      const start=j/sectors*TAU+.001,end=(j+1)/sectors*TAU-.001;
      const n=Math.floor(rr(60,102));cx.fillStyle=`rgb(${n},${n+3},${n+7})`;
      cx.beginPath();cx.arc(0,0,r0+1,start,end);cx.arc(0,0,r1-1,end,start,true);cx.closePath();cx.fill();
      cx.strokeStyle='rgba(12,16,20,.68)';cx.lineWidth=1.3;cx.stroke();
      if(rand()<.6){const a=(start+end)*.5,ra=rr(r0+3,r1-3);cx.save();cx.rotate(a);cx.fillStyle='rgba(12,17,21,.42)';cx.fillRect(ra,-1.2,rr(3,17),2.4);cx.restore();}
    }
  }
  for(let i=0;i<128;i++){const a=i/128*TAU;cx.beginPath();cx.moveTo(Math.cos(a)*85,Math.sin(a)*85);cx.lineTo(Math.cos(a)*dr,Math.sin(a)*dr);cx.strokeStyle=i%8===0?'rgba(12,15,19,.72)':'rgba(172,180,186,.14)';cx.lineWidth=i%8===0?2.5:.8;cx.stroke();}
  dishTexture=new T.CanvasTexture(dc);dishTexture.colorSpace=T.SRGBColorSpace;dishTexture.anisotropy=8;
  dishBump=dishTexture.clone();dishBump.colorSpace=T.NoColorSpace;dishBump.needsUpdate=true;
  }
  const bowlMat=addMat(new T.MeshStandardMaterial({color:0xc4c6c9,...(dishTexture?{map:dishTexture,bumpMap:dishBump}:{}),bumpScale:.09,roughness:.82,metalness:.48}));
  const positions=[],normals=[],uvs=[],indices=[];const radials=80,azimuths=256;
  for(let j=0;j<=radials;j++) {
    const r=j/radials*CFG.dishRadius,derivative=2*CFG.dishDepth*r/CFG.dishRadius**2;
    for(let k=0;k<=azimuths;k++) {
      const a=k/azimuths*TAU,c=Math.cos(a),s=Math.sin(a);
      positions.push(r*c,r*s,bowlZ(r));const n=new T.Vector3(-derivative*c,-derivative*s,1).normalize();normals.push(n.x,n.y,n.z);
      uvs.push(.5+r*c/CFG.dishRadius*.488,.5+r*s/CFG.dishRadius*.488);
      if(j<radials&&k<azimuths){const a0=j*(azimuths+1)+k,b0=a0+azimuths+1;indices.push(a0,b0,a0+1,b0,b0+1,a0+1);}
    }
  }
  const bowlGeometry=new T.BufferGeometry();bowlGeometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));bowlGeometry.setAttribute('normal',new T.Float32BufferAttribute(normals,3));bowlGeometry.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));bowlGeometry.setIndex(indices);
  const bowl=new T.Mesh(bowlGeometry,bowlMat);bowl.castShadow=true;bowl.receiveShadow=true;dish.add(bowl);geometricParts++;
  for(const r of [5.2,9.4,14.2,19.5,24.2,28.4,30.8])torus(dish,r,r>28?.11:.055,bowlZ(r)+.04,darkSteel);
  torus(dish,31,.22,dishRimZ+.035,trim);
  torus(dish,31.48,.15,Math.sqrt(R*R-31.48**2)+.03,charcoal);
  const collarGeo=new T.BufferGeometry();const cp=[],ci=[],cn=[];
  for(let j=0;j<=1;j++)for(let k=0;k<=256;k++) {
    const r=31.12+j*.92,a=k/256*TAU,z=Math.sqrt(R*R-r*r)+.025;
    cp.push(Math.cos(a)*r,Math.sin(a)*r,z);const nn=new T.Vector3(Math.cos(a)*r,Math.sin(a)*r,z).normalize();cn.push(nn.x,nn.y,nn.z);
    if(j===0&&k<256){const a0=k,b0=k+257;ci.push(a0,b0,a0+1,b0,b0+1,a0+1);}
  }
  collarGeo.setAttribute('position',new T.Float32BufferAttribute(cp,3));collarGeo.setAttribute('normal',new T.Float32BufferAttribute(cn,3));collarGeo.setIndex(ci);
  const collar=new T.Mesh(collarGeo,trim);dish.add(collar);collar.castShadow=true;collar.receiveShadow=true;geometricParts++;
  // Radial inlaid structural ribs follow the curved bowl exactly.
  const ribPos=[];
  for(let i=0;i<64;i++) {
    const a=i/64*TAU;
    for(let j=0;j<28;j++){let r0=4.4+j/28*26.2,r1=4.4+(j+1)/28*26.2;ribPos.push(r0*Math.cos(a),r0*Math.sin(a),bowlZ(r0)+.045,r1*Math.cos(a),r1*Math.sin(a),bowlZ(r1)+.045);}
  }
  const ribGeo=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(ribPos,3));
  dish.add(new T.LineSegments(ribGeo,new T.LineBasicMaterial({color:0x252c33,transparent:true,opacity:.66})));
  function disc(parent,r,depth,z,mat,x=0,y=0) {
    const o=new T.Mesh(new T.CylinderGeometry(r,r,depth,64),mat);o.rotation.x=PI/2;o.position.set(x,y,z);parent.add(o);o.castShadow=true;o.receiveShadow=true;geometricParts++;return o;
  }
  const hubZ=bowlZ(0);
  disc(dish,4.3,.22,hubZ+.11,charcoal);disc(dish,3.62,.48,hubZ+.29,darkSteel);
  torus(dish,3.72,.11,hubZ+.55,trim,128);disc(dish,2.65,.11,hubZ+.58,charcoal);
  const greenLens=addMat(new T.MeshStandardMaterial({color:0x143226,roughness:.32,metalness:.4,emissive:0x46ff93,emissiveIntensity:.06}));
  disc(dish,1.65,.1,hubZ+.69,greenLens);
  const emitters=[];
  for(let i=0;i<8;i++) {
    const a=(i+.5)/8*TAU,r=23.0,x=r*Math.cos(a),y=r*Math.sin(a),z=bowlZ(r)+.14;
    disc(dish,1.25,.16,z,darkSteel,x,y);disc(dish,.91,.13,z+.14,charcoal,x,y);
    const ring=torus(dish,1.02,.075,z+.2,trim,48);ring.position.x=x;ring.position.y=y;
    disc(dish,.48,.12,z+.22,greenLens,x,y);emitters.push(new T.Vector3(x,y,z+.3));
  }
  const crown=new T.InstancedMesh(unitBox,darkSteel,192);
  for(let i=0;i<192;i++) {
    const a=i/192*TAU,r=31.58;
    dummy.position.set(r*Math.cos(a),r*Math.sin(a),Math.sqrt(R*R-r*r)+.14);
    dummy.rotation.set(0,0,a);dummy.scale.set(.43,.14,.11);dummy.updateMatrix();crown.setMatrixAt(i,dummy.matrix);
  }
  crown.computeBoundingSphere();dish.add(crown);geometricParts+=192;

  hull.name='Death_Star_open_armor';dish.name='Death_Star_concave_superlaser';
  bowl.name='Death_Star_parabolic_bowl';greebles.name='Death_Star_surface_machinery';
  trench.name='Death_Star_equatorial_trench';
  // Keep the previous station's display diameter and face the fleet's -Z bow.
  station.scale.setScalar(.0692);station.rotation.y=Math.PI;
  station.userData={modelId:'Death_Star',revision:'death-star-user-01',
    reference:'Death_Star_Threejs (1).html',referenceGeometry:true,silhouetteVerified:false,
    source:'models/reference/death-star-user-20261014/Death_Star_Threejs.html',
    geometricParts,emitterCount:emitters.length,dishRadius:CFG.dishRadius,
    dishDepth:CFG.dishDepth,referenceRadius:R};
  station.updateMatrixWorld(true);
  return station;
}
