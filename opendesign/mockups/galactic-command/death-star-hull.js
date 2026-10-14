import * as THREE from 'three';

// Clip real triangles, so the recessed dish and trench also survive GLB export,
// raycasting and shadow passes without the source viewer's custom shader.
export function createOpenHull(radius,segments,rings,dishDirection,rimZ,trenchHalfHeight){
  const sphere=new THREE.SphereGeometry(radius,segments,rings),p=sphere.attributes.position,uv=sphere.attributes.uv;
  const positions=[],normals=[],uvs=[];
  const clip=(polygon,distance)=>{
    const out=[];
    for(let i=0;i<polygon.length;i++){
      const a=polygon[i],b=polygon[(i+1)%polygon.length],da=distance(a),db=distance(b);
      if(da>=0)out.push(a);
      if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,j)=>v+(b[j]-v)*t));}
    }
    return out;
  };
  for(let i=0;i<sphere.index.count;i+=3){
    const triangle=[];
    for(let j=0;j<3;j++){const k=sphere.index.getX(i+j);triangle.push([p.getX(k),p.getY(k),p.getZ(k),uv.getX(k),uv.getY(k)]);}
    const open=clip(triangle,v=>rimZ-v[0]*dishDirection.x-v[1]*dishDirection.y-v[2]*dishDirection.z);
    for(const side of [-1,1]){
      const polygon=clip(open,v=>side*v[1]-trenchHalfHeight);
      for(let j=1;j<polygon.length-1;j++)for(const v of [polygon[0],polygon[j],polygon[j+1]]){
        positions.push(...v.slice(0,3));const length=Math.hypot(...v.slice(0,3));
        normals.push(v[0]/length,v[1]/length,v[2]/length);uvs.push(v[3],v[4]);
      }
    }
  }
  sphere.dispose();
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  return geometry;
}
