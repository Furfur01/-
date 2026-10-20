import {THREE,builder,chamfer} from './primitives.js';
import {loft} from './forms.js';
export function floatingPlatforms(ground,p,mats,{clouds=true}={}){
  const g=builder(ground,mats);
  for(const [x,z,w,d]of p.courts){const cx=x+w/2-80,cz=z+d/2-70,poly=chamfer(cx,cz,w,d,Math.min(w,d)*.18),inner=poly.map(([xx,zz])=>[cx+(xx-cx)*.65,cz+(zz-cz)*.65]);loft(g,[[.5,inner],[4.7,poly],[5.8,poly]],['roof','ivory'],'concrete');g.extrude(poly,.2,5.8,'concrete',0);
    for(const dx of[-w*.28,w*.28]){g.cylinder([cx+dx,.6,cz],1.9,2.4,'roof');g.cylinder([cx+dx,-.65,cz],1.2,.25,'teal');}for(const dx of[-w*.35,w*.35])g.box([cx+dx,5.5,cz+d*.48],[w*.18,.25,.3],'teal');
  }
  g.finish();
  // Thin translucent atmospheric layers stay visually separate from the suspended decks.
  if(!clouds)return;
  const cloud=new THREE.SphereGeometry(1,20,6),cloudMats=[.13,.19,.24].map((opacity,i)=>new THREE.MeshBasicMaterial({color:[0x89adc4,0xa3b9cc,0x7095b2][i],transparent:true,opacity,depthWrite:false}));
  for(let i=0;i<18;i++){const angle=i*2.399,r=24+i*4,m=new THREE.Mesh(cloud,cloudMats[i%3]);m.name='atmospheric-cloud-band';m.position.set(Math.cos(angle)*r,-13-(i%4)*5,Math.sin(angle)*r);m.scale.set(38+(i%3)*12,.7+(i%3)*.3,13+(i%5)*4);m.rotation.y=.26;m.castShadow=false;m.receiveShadow=false;ground.add(m);}
}
export function spaceOutcrops(group,p,mats,height,blocked){
  // Cleared institutions do not need a perimeter of decorative boulders. Keep
  // small scree pockets only along the explicitly planned mineral valley.
  const valley=p.landscape.find(l=>l.kind==='valley');if(!valley)return;
  const g=builder(group,mats),geo=new THREE.IcosahedronGeometry(1,0),[head,,toe,,bank]=valley.points;
  const pockets=[[head[0]-5,head[1]+7,1],[bank[0]-4,bank[1]+9,.72],[toe[0]+2,toe[1]+6,.55]];
  // Uneven fragments around one embedded outcrop, with a broad size hierarchy.
  const fragments=[[0,0,1,1.2],[-1.4,.5,.43,2.8],[.9,-.8,.28,.4],[1.7,.7,.18,1.9],[-.7,1.5,.22,3.7]];
  for(const [cx,cz,scale]of pockets)for(const [dx,dz,size,angle]of fragments){
    const x=cx+dx*scale,z=cz+dz*scale;if(blocked(x,z))continue;
    const s=size*scale;g.add(geo,size<.3?'glass':'rock',[x-80,height(x,z)+s*.08,z-70],[s*1.1,s*.32,s*.65],[.12,angle,-.18]);
  }
  geo.dispose();g.finish();
}
