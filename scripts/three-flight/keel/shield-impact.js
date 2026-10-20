import * as THREE from 'three';

// Short blue light bounce on the actual PBR cabin, separate from red hull damage.
export function createShieldBounce(eye){
 const light=new THREE.PointLight(0x32baff,0,18,1.5);light.position.set(eye[0],eye[1]+.5,eye[2]-2.2);
 return {light,update(fx){const d=fx.shieldDirection||[0,0,-1],length=Math.hypot(...d)||1;light.position.set(eye[0]+d[0]/length*2,eye[1]+.5,eye[2]+d[2]/length*2.2);light.intensity=(fx.shieldFlash||0)*95;},dispose(){light.dispose();light.removeFromParent();}};
}
