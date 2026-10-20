// Bounds come from the actual hull, in the same native coordinates as its mesh.
export function shieldEnvelope(vertices,mesh){
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=mesh.offset;i<mesh.offset+mesh.floatCount;i+=13)for(let k=0;k<3;k++){min[k]=Math.min(min[k],vertices[i+k]);max[k]=Math.max(max[k],vertices[i+k]);}
 const center=min.map((v,k)=>(v+max[k])/2),span=min.map((v,k)=>(max[k]-v)/2),floor=Math.max(...span)*.08;
 const radii=span.map(v=>Math.max(v,floor,.01));let extent=1;
 for(let i=mesh.offset;i<mesh.offset+mesh.floatCount;i+=13)extent=Math.max(extent,Math.hypot(...center.map((v,k)=>(vertices[i+k]-v)/radii[k])));
 return {center,radii:radii.map(v=>v*extent*1.12)};
}
export function shieldLocalPoint(model,point){
 const d=point.map((v,k)=>v-model[12+k]);
 return [0,1,2].map(k=>{const axis=[model[k*4],model[k*4+1],model[k*4+2]],sq=axis.reduce((s,v)=>s+v*v,0);return axis.reduce((s,v,i)=>s+v*d[i],0)/Math.max(sq,1e-12);});
}
export function shieldDirection(point,envelope){
 const p=point.map((v,k)=>(v-envelope.center[k])/envelope.radii[k]),length=Math.hypot(...p);
 return length>1e-8?p.map(v=>v/length):[-1,0,0];
}
