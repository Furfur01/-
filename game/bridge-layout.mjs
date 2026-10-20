// Hologram arrangement: navigation above defense; weapons above fire control.
export function bridgeDisplays(kind){
 const medium=kind==='horizon',flag=kind==='flagship',x=medium?1.51:flag?1.14:1.30,z=medium?-3.10:flag?.30:0,y=medium?3.47:flag?3.35:3.34,w=medium?.92:flag?.88:.84,h=w*.625,tilt=medium?.183:0,yaw=medium?.22:flag?.26:.20;
 const panel=(id,side,yy,height=h)=>({id,pos:[side*x,yy,z],size:[w,height],rotation:[tilt,-side*yaw,0],width:1024,height:Math.round(1024*height/w),hologram:true});
 const list=[panel('defense',-1,y),panel('fire',1,y),panel('helm',-1,y+h/2+.14,.20),panel('weapons',1,y+h/2+.14,.20)];
 if(flag){list[2].pos[1]=y+h/2+.67;list.push(panel('swarm',-1,y+h/2+.30,.48));}
 return list;
}
export function bridgeHologram(kind){return kind==='horizon'?{pos:[0,3.08,-3.19],radius:.62,scale:1.5,embedded:true}:kind==='flagship'?{pos:[0,2.80,-.27],radius:.62,scale:1.55,embedded:true}:{pos:[0,3.09,-.30],radius:.62,scale:1.35,embedded:true};}
// Legacy Bastion collision consumers keep their original coordinates. KEEL
// walking is derived from the imported deck/steps and furniture in walking.js.
export const bridgeConsoleObstacles=[{x:-4.05,z:-4.8,rx:1.525,rz:.65},{x:4.05,z:-4.8,rx:1.525,rz:.65},{x:4.11,z:-4.56,rx:1.525,rz:.65},{x:0,z:-6,rx:2.28,rz:2.28}];
