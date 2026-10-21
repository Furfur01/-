// Cockpit controls follow the saved battle role, including older active battles.
export function cockpitClass(profile={}) {
 if(profile.role==='fighter'||(!profile.role&&!(profile.length>=10)))return 'fighter';
 return profile.length>=50?'bastion':'horizon';
}
export function pilotHandling(profile) {
 const kind=cockpitClass(profile);
 return {kind,turn:Math.min(profile.turn||.45,kind==='fighter'?3:kind==='bastion'?.22:.38),acceleration:kind==='fighter'?.7:kind==='bastion'?.12:.22,braking:kind==='fighter'?1:kind==='bastion'?.18:.3};
}
export function pilotKeys(keys,profile) {
 const axis=(positive,negative)=>(keys.has(positive)?1:0)-(keys.has(negative)?1:0),small=cockpitClass(profile)==='fighter';
 return {throttle:axis('KeyW','KeyS'),yaw:small?axis('ArrowRight','ArrowLeft'):axis('KeyD','KeyA'),pitch:small?axis('KeyQ','KeyE')+axis('ArrowUp','ArrowDown'):0,roll:small?axis('KeyD','KeyA'):0};
}
export function cabinPose(kind) {return {eye:kind==='bastion'?[0,3.75,2]:kind==='horizon'?[0,3.8,-1]:[0,0,0],yaw:0,pitch:0};}
// Walk on the bridge decks. Keep the camera inside the hull and out of operator desks.
export function walkCabin(pose,keys,dt,obstacles=[]) {
 const axis=(a,b)=>(keys.has(a)?1:0)-(keys.has(b)?1:0),f=axis('KeyW','KeyS'),r=axis('KeyD','KeyA'),speed=(keys.has('ShiftLeft')?5:2.8)*dt/Math.max(1,Math.hypot(f,r));
 if(!f&&!r)return pose;
 const dx=(Math.sin(pose.yaw)*f+Math.cos(pose.yaw)*r)*speed,dz=(-Math.cos(pose.yaw)*f+Math.sin(pose.yaw)*r)*speed;
 const blocked=(x,z)=>Math.abs(x)>15||z< -7.7||z>32.5||obstacles.some(o=>Math.abs(x-o.x)<o.rx+.45&&Math.abs(z-o.z)<o.rz+.45);
 if(!blocked(pose.eye[0]+dx,pose.eye[2]))pose.eye[0]+=dx;
 if(!blocked(pose.eye[0],pose.eye[2]+dz))pose.eye[2]+=dz;
 const [x,,z]=pose.eye;
 const deck=Math.abs(x)<5&&z>2.2&&z<8.2?1.7:Math.abs(x)<2&&z>=-4.8&&z<=2.2?Math.min(1.7,(z+4.8)/7*1.7):Math.abs(x)>10.7&&z>16?2.05:0;
 pose.eye[1]+=(deck+1.8-pose.eye[1])*(1-Math.exp(-dt*7));
 return pose;
}
