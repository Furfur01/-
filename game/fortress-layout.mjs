// Seven interchangeable sockets per large hex: a heavy turret or a small hex.
// Axial hex rings grow without moving any existing buildings or casualties.
export const LEGACY_FORTRESS={radius:110,spacing:132,vertexRadius:82,centerHeight:60,vertexHeight:46};
export const FORTRESS={radius:81.36,spacing:108,vertexRadius:59.04,centerHeight:43.2,vertexHeight:33.12,scale:.72,smallScale:.2,smallVertexRadius:16.4,smallCenterHeight:12,smallVertexHeight:9.2,orbitScale:1.3};
export const smallDefense=type=>['Rocket_Launcher','Light_Laser','Heavy_Laser','Ion_Cannon'].includes(type);
export const defenseModelScale=type=>({Rocket_Launcher:.4,Light_Laser:.45,Heavy_Laser:.5,Ion_Cannon:.5})[type]||1;
const directions=[[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]];
export function hexCell(index){
 if(index===0)return [0,0];
 let ring=1;while(index>=1+3*ring*(ring+1))ring++;
 let offset=index-(1+3*(ring-1)*ring),q=0,r=-ring;
 for(const [dq,dr]of directions){const steps=Math.min(offset,ring);q+=dq*steps;r+=dr*steps;offset-=steps;if(!offset)break;}
 return [q,r];
}
export function fortressModule(index,environment){
 const layout=environment.fortress?.version===1?LEGACY_FORTRESS:FORTRESS;
 const [q,r]=hexCell(index),x=900+layout.spacing*1.5*q,z=layout.spacing*Math.sqrt(3)*(r+q/2);
 const [cx,cy,cz]=environment.center;
 const y=cy+Math.sqrt(Math.max(0,environment.radius**2-(x-cx)**2-(z-cz)**2));
 return {index,q,r,x,y,z};
}
export function allocateFortressSlot(environment,type){
 const f=environment.fortress??={version:2,small:0,large:0,modules:[]};
 if(f.version===1){
  const small=type==='Rocket_Launcher'||type==='Light_Laser',ordinal=small?f.small++:f.large++,index=small?Math.floor(ordinal/6):ordinal,vertex=small?ordinal%6:null;
  while(f.modules.length<=index)f.modules.push(fortressModule(f.modules.length,environment));
  const m=f.modules[index],a=(vertex??0)*Math.PI/3;
  return {module:index,vertex,x:m.x+(small?Math.cos(a)*LEGACY_FORTRESS.vertexRadius:0),z:m.z+(small?Math.sin(a)*LEGACY_FORTRESS.vertexRadius:0),y:m.y+(small?LEGACY_FORTRESS.vertexHeight:LEGACY_FORTRESS.centerHeight)};
 }
 const small=smallDefense(type);let module,socket=-1;
 if(small)for(const m of f.modules){const i=m.sockets.findIndex(s=>s?.kind==='small'&&s.count<7);if(i>=0){module=m;socket=i;break;}}
 if(!module)for(const m of f.modules){const i=m.sockets.findIndex(s=>s===null);if(i>=0){module=m;socket=i;break;}}
 if(!module){module={...fortressModule(f.modules.length,environment),sockets:Array(7).fill(null)};f.modules.push(module);socket=0;}
 module.sockets[socket]??={kind:small?'small':'heavy',count:0};
 const ordinal=module.sockets[socket].count++,vertex=small?(ordinal===0?null:ordinal-1):null;
 if(small)f.small++;else f.large++;
 const position=fortressSocket(module,socket),a=(vertex??0)*Math.PI/3;
 return {module:module.index,socket,kind:small?'small':'heavy',vertex,
  x:position.x+(small&&vertex!==null?Math.cos(a)*FORTRESS.smallVertexRadius:0),
  z:position.z+(small&&vertex!==null?Math.sin(a)*FORTRESS.smallVertexRadius:0),
  y:position.y+(small?4+(vertex===null?FORTRESS.smallCenterHeight:FORTRESS.smallVertexHeight):0)};
}
export function fortressSocket(module,socket){const vertex=socket-1,a=vertex*Math.PI/3;return {x:module.x+(socket?Math.cos(a)*FORTRESS.vertexRadius:0),y:module.y+(socket?FORTRESS.vertexHeight:FORTRESS.centerHeight),z:module.z+(socket?Math.sin(a)*FORTRESS.vertexRadius:0)};}
export function fortressConnections(modules){
 const cells=new Map(modules.map(m=>[`${m.q}:${m.r}`,m])),links=[];
 for(const m of modules)for(const [dq,dr]of directions.slice(0,3)){const other=cells.get(`${m.q+dq}:${m.r+dr}`);if(other)links.push([m,other]);}
 return links;
}
