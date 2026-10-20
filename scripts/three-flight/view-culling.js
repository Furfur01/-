// Battle-local clip planes. Keep depth clipping to the logarithmic-depth shader;
// side/eye planes alone reject ships wholly outside the camera's view.
export class BattleViewCulling {
 constructor(){this.planes=new Float64Array(20);}
 update(m){
  const p=this.planes;
  for(let i=0;i<5;i++){const row=i>>1,sign=i%2?-1:1,offset=i*4;
   let length=0;for(let j=0;j<4;j++){const value=m[j*4+3]+(i<4?sign*m[j*4+row]:0);p[offset+j]=value;if(j<3)length+=value*value;}
   length=Math.sqrt(length)||1;for(let j=0;j<4;j++)p[offset+j]/=length;
  }return this;
 }
 visible(x,y,z,radius){const p=this.planes;for(let i=0;i<20;i+=4)if(p[i]*x+p[i+1]*y+p[i+2]*z+p[i+3]<-radius)return false;return true;}
}

export function projectileInView(q,view,eye,focal){
 let x0=q.pos[0],x1=x0,y0=q.pos[1],y1=y0,z0=q.pos[2],z1=z0;
 if(q.missile)for(const p of q.trail||[]){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);z0=Math.min(z0,p[2]);z1=Math.max(z1,p[2]);}
 const x=(x0+x1)*.5,y=(y0+y1)*.5,z=(z0+z1)*.5;
 // Include the entire curved trail, motor, volume and largest point halo. A
 // projectile whose head has left the screen may still have a visible wake.
 const margin=Math.max(20,q.missile?0:q.visual?.trail||0,(q.visual?.radius||0)*3,Math.hypot(x-eye[0],y-eye[1],z-eye[2])*128/focal);
 return view.visible(x,y,z,Math.hypot(x1-x0,y1-y0,z1-z0)*.5+margin);
}
