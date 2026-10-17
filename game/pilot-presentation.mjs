import {predictPilot} from './pilot-motion.mjs';

// Presentation only: the server still owns position, collisions and combat.
// Advance immediately from local input, reconcile toward an equally aged server
// pose, and share the resulting row between the camera and the rendered hull.
export function presentPilot(previous,row,profile,input,now,received,latency=0){
 const age=Math.max(0,(now-received)/1000),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
 const authority=predictPilot(row,profile,input,Math.min(.4,age+latency+.025));
 const values=s=>[s.x,s.y,s.z,s.yaw,s.pitch],out=row.slice();
 let pose=authority;
 if(previous&&age<.6&&Math.hypot(...[1,2,3].map((i,j)=>previous.row[i]-values(authority)[j]))<100){
  const dt=Math.max(0,Math.min(.05,(now-previous.at)/1000)),next=predictPilot(previous.row,profile,input,dt);
  const blend=1-Math.exp(-dt*7),angular=1-Math.exp(-dt*3);
  pose={...next};for(const key of ['x','y','z'])pose[key]+=(authority[key]-pose[key])*blend;
  for(const key of ['yaw','pitch','roll'])pose[key]+=wrap(authority[key]-pose[key])*angular;
 }
 values(pose).forEach((v,i)=>out[i+1]=v);out[9]=pose.speed;out[12]=pose.roll;
 return {row:out,at:now};
}
