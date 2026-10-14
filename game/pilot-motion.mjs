// Shared angular intent: the browser sends a heading, never an authoritative pose.
export function steerPilot(ship,input,dt){
 const turn=ship.profile.turn*dt,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),limit=(v,a,b)=>Math.max(a,Math.min(b,v));
 ship.yaw=wrap(ship.yaw+(input.heading===undefined?input.yaw*turn:limit(wrap(input.heading-ship.yaw),-turn,turn)));
 ship.pitch=limit(ship.pitch+(input.elevation===undefined?input.pitch*turn:limit(input.elevation-ship.pitch,-turn,turn)),-1.2,1.2);
}

// Cosmetic extrapolation uses the same limits and acceleration as the server.
// Collision/separation remains authoritative and is reconciled by the controller.
export function predictPilot(row,profile,input,seconds){
 const ship={x:row[1],y:row[2],z:row[3],yaw:row[4],pitch:row[5],speed:row[9],profile};
 const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
 for(let left=Math.max(0,Math.min(.4,seconds));left>1e-7;){
  const dt=Math.min(.05,left);left-=dt;steerPilot(ship,input,dt);
  const desired=input.throttle*profile.speed*(input.boost?1.5:1);
  ship.speed+=limit(desired-ship.speed,-profile.speed*dt,profile.speed*.7*dt);
  ship.x+=Math.sin(ship.yaw)*Math.cos(ship.pitch)*ship.speed*dt;
  ship.y+=Math.sin(ship.pitch)*ship.speed*dt;
  ship.z+=Math.cos(ship.yaw)*Math.cos(ship.pitch)*ship.speed*dt;
 }
 return ship;
}
