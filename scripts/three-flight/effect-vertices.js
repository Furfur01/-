// Reuse CPU storage as well as GPU buffers. Coordinates are made camera-relative
// before Float32 conversion, preserving precision in distant battles.
export class EffectVertices {
 constructor(stride=10){this.array=new Float32Array(1024);this.length=0;this.stride=stride;}
 reset(){this.length=0;return this;}
 reserve(count){if(this.length+count<=this.array.length)return;const next=new Float32Array(2**Math.ceil(Math.log2(this.length+count)));next.set(this.array);this.array=next;}
 point(x,y,z,r,g,b,size){this.reserve(7);const a=this.array,i=this.length;this.length+=7;a[i]=x;a[i+1]=y;a[i+2]=z;a[i+3]=r;a[i+4]=g;a[i+5]=b;a[i+6]=size;}
 vertex(x,y,z,r,g,b,u,v,age,type){this.reserve(this.stride);const a=this.array,i=this.length;this.length+=this.stride;a[i]=x;a[i+1]=y;a[i+2]=z;a[i+3]=r;a[i+4]=g;a[i+5]=b;a[i+6]=u;a[i+7]=v;a[i+8]=age;if(this.stride===10)a[i+9]=type;}
 view(){return this.array.subarray(0,this.length);}
}
const QUAD_X=[0,0,1,1,0,1],QUAD_Y=[-1,1,-1,-1,1,1];
export function effectRibbon(data,a,b,eye,width,r,g,blue,alpha){
 const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],ex=eye[0]-(a[0]+b[0])*.5,ey=eye[1]-(a[1]+b[1])*.5,ez=eye[2]-(a[2]+b[2])*.5;
 let sx=dy*ez-dz*ey,sy=dz*ex-dx*ez,sz=dx*ey-dy*ex;const scale=width/(Math.hypot(sx,sy,sz)||1);sx*=scale;sy*=scale;sz*=scale;
 for(let i=0;i<6;i++){const x=QUAD_X[i],y=QUAD_Y[i],p=x?b:a;data.vertex(p[0]-eye[0]+sx*y,p[1]-eye[1]+sy*y,p[2]-eye[2]+sz*y,r,g,blue,x,y,alpha,4);}
}
export function effectBillboard(data,pos,eye,right,up,size,color,age,type){
 const px=pos[0]-eye[0],py=pos[1]-eye[1],pz=pos[2]-eye[2];
 // Match the original winding and UVs exactly.
 for(let i=0;i<6;i++){const x=QUAD_Y[i],y=QUAD_X[i]*2-1;data.vertex(px+(right[0]*x+up[0]*y)*size,py+(right[1]*x+up[1]*y)*size,pz+(right[2]*x+up[2]*y)*size,color[0],color[1],color[2],x,y,age,type);}
}

const CIRCLES=new Map();
// Reuse the circle samples and endpoints rather than allocating two closures
// and four arrays for every segment of every blast on every rendered frame.
export function effectRing(data,pos,eye,right,up,radius,width,color,opacity,segments=48){
 let circle=CIRCLES.get(segments);
 if(!circle){circle=Array.from({length:segments+1},(_,i)=>[Math.cos(i*Math.PI*2/segments),Math.sin(i*Math.PI*2/segments)]);CIRCLES.set(segments,circle);}
 const a=[0,0,0],b=[0,0,0];data.reserve(segments*60);
 for(let i=0;i<=segments;i++){
  const [c,s]=circle[i];for(let j=0;j<3;j++)b[j]=pos[j]+radius*(right[j]*c+up[j]*s);
  if(i)effectRibbon(data,a,b,eye,width,color[0],color[1],color[2],opacity);
  for(let j=0;j<3;j++)a[j]=b[j];
 }
}
