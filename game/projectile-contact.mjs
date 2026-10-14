// Earliest contact of a swept projectile and a moving spherical combat envelope.
// Returns a fraction of the step, not the closest point after penetration.
export function projectileContact(from,to,center,radius,previous=center){
  const p=from.map((v,i)=>v-previous[i]);
  const v=to.map((n,i)=>n-from[i]-(center[i]-previous[i]));
  const c=p.reduce((sum,n)=>sum+n*n,0)-radius*radius;
  if(c<=0)return 0;
  const a=v.reduce((sum,n)=>sum+n*n,0),b=2*p.reduce((sum,n,i)=>sum+n*v[i],0);
  if(a<1e-12)return null;
  const discriminant=b*b-4*a*c;if(discriminant<0)return null;
  const t=(-b-Math.sqrt(discriminant))/(2*a);
  return t>=0&&t<=1?t:null;
}
