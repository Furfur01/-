import * as THREE from 'three';
import {drawWarning,drawPipLabel} from '../instruments/fusion-screens.js';
export function installKeelStatus(keel,kind){
 const resources=[],nodes=[],make=(w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;resources.push(tex);return {canvas,ctx:canvas.getContext('2d'),tex};};
 let anchor=keel.anchors.EMPTY_OVERHEAD_SCREEN_ANCHOR||keel.anchors.EMPTY_OVERHEAD_TACTICAL_SCREEN;
 if(kind==='bastion'){const housing=keel.interior.getObjectByName('BATTLESHIP_06_HIGH_TACTICAL_SCREEN_HOUSING');housing.position.y-=1.55;housing.position.z-=2;}
 if(!anchor){anchor=new THREE.Group();anchor.name='DEPLOYED_TACTICAL_MONITOR';anchor.position.set(0,5.20,-2.00);keel.root.parent.add(anchor);anchor.userData={width:2.25,height:.48};const g=new THREE.BoxGeometry(2.38,.61,.08),m=new THREE.MeshStandardMaterial({color:0x29373e,metalness:.65,roughness:.4}),bezel=new THREE.Mesh(g,m);bezel.position.z=-.05;anchor.add(bezel);resources.push(g,m);}
 const size=anchor.userData.dimensions||[anchor.userData.width,anchor.userData.height],plane=(w,h,mat,y=0,z=.025)=>{const geo=new THREE.PlaneGeometry(w,h),mesh=new THREE.Mesh(geo,mat);mesh.position.set(0,y,z);anchor.add(mesh);nodes.push(mesh);resources.push(geo,mat);return mesh;};
 const pipMaterial=new THREE.MeshBasicMaterial({color:0xffffff,toneMapped:true}),pip=plane(size[0],size[1],pipMaterial),label=make(1024,48),warning=make(1536,96);
 // Framebuffer copies already contain display-encoded pixels. Copy into RGBA8
 // (WebGL cannot copy a linear default framebuffer into an sRGB attachment),
 // then pass those bytes through without a second output transform.
 pipMaterial.onBeforeCompile=shader=>{if(pipMaterial.map?.userData.displayEncoded)shader.fragmentShader=shader.fragmentShader.replace('#include <colorspace_fragment>','');};
 pipMaterial.customProgramCacheKey=()=>String(!!pipMaterial.map?.userData.displayEncoded);
 plane(size[0],.065,new THREE.MeshBasicMaterial({map:label.tex,toneMapped:false}),-size[1]/2+.028,.029);
 plane(size[0]*.94,.145,new THREE.MeshBasicMaterial({map:warning.tex,toneMapped:false}),-size[1]/2-.15,.03);
 let last=-Infinity;
 return {pip,update(s,time,texture){if(texture&&pipMaterial.map!==texture){pipMaterial.map=texture;pipMaterial.toneMapped=!texture.userData.displayEncoded;pipMaterial.needsUpdate=true;}if(time>=last&&time-last<.1)return;last=time;drawPipLabel(label,time,'forward');
  // Feed is the actual exterior, captured before drawing the cabin.
  const c=label.ctx;c.fillStyle='#06131d';c.fillRect(0,0,850,48);c.fillStyle='#5fe3ff';c.font='600 25px Bahnschrift,"Microsoft YaHei"';c.textBaseline='middle';c.fillText('外部战术视角 · CAM-01 前向光学',12,24);label.tex.needsUpdate=true;
  const threat=s?.threats?.[0],alert=(s?.hull??100)<35||(s?.shield??100)<=0||!!threat;drawWarning(warning,{alert,banner:threat?threat.direction+' · '+threat.kind+'接近 '+threat.eta.toFixed(1)+' s':s?.hull<35?'舰体重伤 · 损管响应':s?.shield<=0?'护盾离线':null,speed:s?.speed||0,throttle:s?.throttle||0},time);
 },dispose(){nodes.forEach(n=>n.removeFromParent());if(anchor.name==='DEPLOYED_TACTICAL_MONITOR')anchor.removeFromParent();resources.forEach(r=>r.dispose());}};
}
