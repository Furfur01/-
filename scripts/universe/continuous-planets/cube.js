// Each face uses matching orientations. No latitude/longitude texture seam.
export function cubeDirection(face,u,v,out=[0,0,0]){
  if(face===0){out[0]=1;out[1]=v;out[2]=-u;}
  else if(face===1){out[0]=-1;out[1]=v;out[2]=u;}
  else if(face===2){out[0]=u;out[1]=1;out[2]=-v;}
  else if(face===3){out[0]=u;out[1]=-1;out[2]=v;}
  else if(face===4){out[0]=u;out[1]=v;out[2]=1;}
  else{out[0]=-u;out[1]=v;out[2]=-1;}
  const s=1/Math.hypot(...out);out[0]*=s;out[1]*=s;out[2]*=s;return out;
}
export function directionFaceUV(x,y,z){
  const ax=Math.abs(x),ay=Math.abs(y),az=Math.abs(z);
  if(ax>=ay&&ax>=az)return x>=0?[0,-z/ax,y/ax]:[1,z/ax,y/ax];
  if(ay>=az)return y>=0?[2,x/ay,-z/ay]:[3,x/ay,z/ay];
  return z>=0?[4,x/az,y/az]:[5,-x/az,y/az];
}
export function tileBounds(level,x,y){const span=2/2**level;return {u:-1+x*span,v:-1+y*span,span};}
export function surfaceNormal(field,x,y,z,eps=0.000025){
  let tx,tz,ty;
  if(Math.abs(y)<.92){tx=-z;ty=0;tz=x;}else{tx=0;ty=z;tz=-y;}
  const tl=Math.hypot(tx,ty,tz);tx/=tl;ty/=tl;tz/=tl;
  const bx=y*tz-z*ty,by=z*tx-x*tz,bz=x*ty-y*tx;
  const f=(a,b,c)=>{const k=1/Math.hypot(a,b,c);return field.height(a*k,b*k,c*k);};
  const h=field.height(x,y,z),a=(f(x+eps*tx,y+eps*ty,z+eps*tz)-f(x-eps*tx,y-eps*ty,z-eps*tz))/(2*eps*(1+h));
  const b=(f(x+eps*bx,y+eps*by,z+eps*bz)-f(x-eps*bx,y-eps*by,z-eps*bz))/(2*eps*(1+h));
  const nx=x-a*tx-b*bx,ny=y-a*ty-b*by,nz=z-a*tz-b*bz,k=1/Math.hypot(nx,ny,nz);
  return [nx*k,ny*k,nz*k];
}
