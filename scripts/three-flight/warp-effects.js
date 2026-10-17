// Camera-relative, additive geometry submitted through the shared fleet backend.
// All motion is derived from mission time: pausing or seeking never accumulates particles.
const clamp = x => Math.max(0, Math.min(1, x));
const smooth = (a, b, x) => { const t = clamp((x-a)/(b-a)); return t*t*(3-2*t); };
const cyan=[.18,.65,1],violet=[.48,.3,1],white=[.7,.94,1];

// Retain one vertex allocation across frames and stage changes. The GPU backend
// already keeps its upload buffer; rebuilding a JS number array defeated that.
export class WarpRibbonBuffer {
  constructor(capacity=262144){this.array=new Float32Array(capacity);this.length=0;}
  reset(){this.length=0;return this;}
  reserve(count){if(this.length+count<=this.array.length)return;const next=new Float32Array(2**Math.ceil(Math.log2(this.length+count)));next.set(this.array.subarray(0,this.length));this.array=next;}
  view(){return this.array.subarray(0,this.length);}
}

export function warpEnvelope(pose) {
  if (pose.stage==='cruise'&&pose.observer) return .55;
  if (pose.stage==='warp-in') return smooth(0,.2,pose.warp)*(1-smooth(.88,1,pose.warp));
  if (pose.stage==='warp-out') return smooth(0,.09,pose.local)*(1-smooth(.18,1,pose.local));
  return 0;
}

export function stretchAlongHeading(matrix, heading, stretch) {
  // World-space stretch preserves the translation and every transverse component.
  for(let column=0;column<3;column++) {
    const offset=column*4, projection=(heading[0]*matrix[offset]+heading[1]*matrix[offset+1]+heading[2]*matrix[offset+2])*(stretch-1);
    for(let axis=0;axis<3;axis++) matrix[offset+axis]+=heading[axis]*projection;
  }
  return matrix;
}

export function appendWarpEffect(data, {position,heading,eye,length,pose,slot,detailed=true}) {
  const energy=warpEnvelope(pose);
  if(energy<=.001)return;
  const h=1/(Math.sqrt(heading[0]*heading[0]+heading[1]*heading[1]+heading[2]*heading[2])||1),fx=heading[0]*h,fy=heading[1]*h,fz=heading[2]*h;
  let rx=Math.abs(fy)>.9?0:-fz,ry=Math.abs(fy)>.9?fz:0,rz=Math.abs(fy)>.9?-fy:fx;
  const rn=1/(Math.sqrt(rx*rx+ry*ry+rz*rz)||1);rx*=rn;ry*=rn;rz*=rn;
  const ux=ry*fz-rz*fy,uy=rz*fx-rx*fz,uz=rx*fy-ry*fx;
  const arrival=pose.stage==='warp-out',t=arrival?pose.local:pose.warp;
  const radius=Math.max(10,length*.95),phase=t*3.5+slot*.618;
  const a=new Float64Array(3),b=new Float64Array(3),buffer=data instanceof WarpRibbonBuffer;
  if(buffer)data.reserve((pose.stage==='cruise'?8:detailed?213:2)*54);
  const vertices=buffer?data.array:data;let cursor=data.length;
  function point(out,along,r,angle){const x=Math.cos(angle)*r,y=Math.sin(angle)*r;out[0]=position[0]+fx*along+rx*x+ux*y;out[1]=position[1]+fy*along+ry*x+uy*y;out[2]=position[2]+fz*along+rz*x+uz*y;}
  function vertex(x,y,z,color,u,v,alpha){vertices[cursor++]=x;vertices[cursor++]=y;vertices[cursor++]=z;vertices[cursor++]=color[0];vertices[cursor++]=color[1];vertices[cursor++]=color[2];vertices[cursor++]=u;vertices[cursor++]=v;vertices[cursor++]=alpha;}
  function ribbon(width,color,alpha,continuous=false) {
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],vx=eye[0]-(a[0]+b[0])*.5,vy=eye[1]-(a[1]+b[1])*.5,vz=eye[2]-(a[2]+b[2])*.5;
    let sx=dy*vz-dz*vy,sy=dz*vx-dx*vz,sz=dx*vy-dy*vx;
    // Compare normalized cross products, retaining the original head-on fallback.
    if(sx*sx+sy*sy+sz*sz<.000001*(dx*dx+dy*dy+dz*dz||1)*(vx*vx+vy*vy+vz*vz||1)){sx=rx;sy=ry;sz=rz;}
    const scale=width/(Math.sqrt(sx*sx+sy*sy+sz*sz)||1);sx*=scale;sy*=scale;sz*=scale;
    const ax=a[0]-eye[0],ay=a[1]-eye[1],az=a[2]-eye[2],bx=b[0]-eye[0],by=b[1]-eye[1],bz=b[2]-eye[2],u=continuous?.5:0,v=continuous?.5:1;
    vertex(ax-sx,ay-sy,az-sz,color,u,-1,alpha);vertex(ax+sx,ay+sy,az+sz,color,u,1,alpha);vertex(bx-sx,by-sy,bz-sz,color,v,-1,alpha);
    vertex(bx-sx,by-sy,bz-sz,color,v,-1,alpha);vertex(ax+sx,ay+sy,az+sz,color,u,1,alpha);vertex(bx+sx,by+sy,bz+sz,color,v,1,alpha);
  }
  if(pose.stage==='cruise') {
    // Keep the hull clear: flowing light runs beside it, never through its centre.
    for(let j=0;j<8;j++) {
      const seed=(j*.61803398875+slot*.137)%1,flow=(pose.time*.65+seed)%1;
      const angle=j*2.399963,r=radius*(.8+seed*.7),along=length*(2-flow*5);
      point(a,along-length*.9,r,angle);point(b,along,r,angle);ribbon(radius*.018,cyan,energy*Math.sin(flow*Math.PI));
    }
    data.length=cursor;return;
  }
  // Long blue sheath and a narrow hot core stay attached to each individual hull.
  const trail=length*(arrival?1+pose.warp*7:1+t*t*9);
  point(a,-trail,0,0);point(b,length*.55,0,0);
  ribbon(radius*.38,cyan,energy*.55);ribbon(radius*.09,white,energy*.85);
  if(!detailed){data.length=cursor;return;}
  // Sweeping field rings contract on entry and propagate outwards on arrival.
  for(let ring=0;ring<3;ring++) {
    const wave=(t+ring*.27)%1;
    const r=radius*(arrival?.85+wave*2.9:1.7-wave*.75);
    const along=length*(arrival?-.5+ring*.45:-.8+wave*1.8);
    const alpha=energy*(arrival?(1-wave)*.85:.7)*(ring===0?1:.75);
    for(let j=0;j<64;j++) {
      const angle=j/64*Math.PI*2+phase*(ring%2?1:-1);
      const next=angle+Math.PI*2/64;
      const modulation=.65+.35*Math.sin(angle*3+phase*4);
      point(a,along,r,angle);point(b,along,r,next);ribbon(radius*(ring===0?.16:.09),ring===2?violet:cyan,alpha*modulation,true);
    }
  }
  // Deterministic helical sparks slide through the field instead of blinking randomly.
  for(let j=0;j<18;j++) {
    const seed=(j*.61803398875+slot*.137)%1,flow=(phase+seed)%1;
    const angle=j*2.399963+phase*.35,r=radius*(.65+seed*1.4);
    const along=length*(1-flow*5),span=length*(.25+t*t*1.6);
    point(a,along-span,r,angle);point(b,along,r,angle);ribbon(radius*(.018+seed*.025),j%4===0?violet:cyan,energy*Math.sin(flow*Math.PI)*.65);
  }
  // A short, local lens flare marks the actual transition without washing out the map.
  const flash=arrival?Math.exp(-(((t-.14)/.1)**2)):Math.exp(-(((t-.8)/.1)**2));
  point(a,length*.3,0,0);const vx=eye[0]-a[0],vy=eye[1]-a[1],vz=eye[2]-a[2],vertical=vy*vy>.81*(vx*vx+vy*vy+vz*vz);
  let cx=vertical?0:-vz,cy=vertical?vz:0,cz=vertical?-vy:vx;const scale=radius*3.5/(Math.sqrt(cx*cx+cy*cy+cz*cz)||1);cx*=scale;cy*=scale;cz*=scale;
  b[0]=a[0]+cx;b[1]=a[1]+cy;b[2]=a[2]+cz;a[0]-=cx;a[1]-=cy;a[2]-=cz;
  ribbon(radius*.12,white,flash*energy);data.length=cursor;
}
