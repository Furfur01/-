import {projectileContact} from '../../game/projectile-contact.mjs';

// Display-space contacts only: damage and authoritative projectile lifetime stay
// on the server. Sweep from the last displayed position, not just the new packet.
export class ProjectileVisualContacts {
 constructor(){this.cells=new Map();this.current=new Map();this.activeCells=[];this.radius=1;this.frame=0;}
 update(metadata,row){
  for(const cell of this.activeCells)cell.length=0;this.activeCells.length=0;this.radius=1;this.frame++;
  if(this.cells.size>4096)this.cells.clear();
  for(const m of metadata){const r=row(m.id);if(!r||r[6]<=0)continue;
   let entry=this.current.get(m.id);if(!entry){entry={id:m.id,pos:[0,0,0],previous:[0,0,0],frame:-1};this.current.set(m.id,entry);}
   const p=entry.pos,before=entry.previous;
   for(let axis=0;axis<3;axis++){before[axis]=entry.frame===this.frame-1?p[axis]:r[axis+1];p[axis]=r[axis+1];}
   entry.frame=this.frame;entry.side=m.side;entry.radius=(m.profile.radius||1)+.4;this.radius=Math.max(this.radius,entry.radius);
   // Index both ends of the ship's motion, including crossings of grid cells.
   for(let x=Math.floor(Math.min(p[0],before[0])/300);x<=Math.floor(Math.max(p[0],before[0])/300);x++)for(let z=Math.floor(Math.min(p[2],before[2])/300);z<=Math.floor(Math.max(p[2],before[2])/300);z++){
    const key=m.side+':'+x+':'+z;let cell=this.cells.get(key);if(!cell)this.cells.set(key,cell=[]);if(!cell.length)this.activeCells.push(cell);cell.push(entry);
   }
  }
 }
 contact(from,to,side,moving=true){
  const pad=this.radius,enemy=side==='attacker'?'defender':'attacker';let first=null;
  for(let x=Math.floor((Math.min(from[0],to[0])-pad)/300);x<=Math.floor((Math.max(from[0],to[0])+pad)/300);x++)for(let z=Math.floor((Math.min(from[2],to[2])-pad)/300);z<=Math.floor((Math.max(from[2],to[2])+pad)/300);z++)for(const e of this.cells.get(enemy+':'+x+':'+z)||[]){
   const fraction=projectileContact(from,to,e.pos,e.radius,moving?e.previous:e.pos);
   if(fraction!==null&&(!first||fraction<first.fraction))first={fraction,id:e.id,pos:from.map((v,i)=>v+(to[i]-v)*fraction)};
  }return first;
 }
 clear(){this.cells.clear();this.current.clear();this.activeCells.length=0;this.frame=0;}
}

export function predictedProjectilePosition(q,seconds){
 const t=Math.max(0,seconds),dx=q.dx-q.x,dy=q.dy-q.y,dz=q.dz-q.z,length=Math.hypot(dx,dy,dz),step=Math.min(length,q.speed*t)/(length||1);
 return q.vx===undefined?[q.x+dx*step,q.y+dy*step,q.z+dz*step]:[q.x+q.vx*t,q.y+q.vy*t,q.z+q.vz*t];
}

export function displayedProjectilePosition(q,visual,alpha){
 if(visual.packet!==q){
  const old=visual.packet;
  if(old)visual.packetStart=[old.x,old.y,old.z];
  else{
   const back=Math.min(.2,Math.max(0,q.age||0)),dx=q.dx-q.x,dy=q.dy-q.y,dz=q.dz-q.z,f=q.speed/(Math.hypot(dx,dy,dz)||1);
   visual.packetStart=[q.x-(q.vx??dx*f)*back,q.y-(q.vy??dy*f)*back,q.z-(q.vz??dz*f)*back];
  }
  visual.packet=q;
 }
 const a=Math.max(0,Math.min(1,alpha)),from=visual.packetStart;
 return [from[0]+(q.x-from[0])*a,from[1]+(q.y-from[1])*a,from[2]+(q.z-from[2])*a];
}
