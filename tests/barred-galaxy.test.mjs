import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {systemCoordinates} from '../game/star-positions.mjs';
const base=new URL('../opendesign/mockups/planet-construction-review/',import.meta.url);
const layout=JSON.parse(fs.readFileSync(new URL('galaxy-layout.json',base),'utf8'));
test('zoom gradually brightens the galaxy and limits rings to the middle distance',()=>{
 const source=fs.readFileSync(new URL('aurora-galaxy.js',base),'utf8').replace('/*__AURORA_GALAXY_LAYOUT__*/','{}');
 const appearance=vm.runInNewContext(source+';auroraGalaxyPresentation');
 const distances=[440,1600,4000,8000,18000,30000,50000,75000,101700,200000];
 const values=distances.map(d=>appearance(d));
 assert(values.every((v,i)=>v.background>=.06&&v.background<=.72&&(!i||v.background>=values[i-1].background)));
 assert(appearance(101700).background>.65);assert(appearance(440).background<.1);
 assert.equal(appearance(440).rings,0);assert.equal(appearance(101700).rings,0);assert.equal(appearance(24000).rings,1);
 assert.equal(appearance(440).points,0);assert(appearance(101700).points>0);
 for(const distance of distances){assert.equal(JSON.stringify(appearance(distance)),JSON.stringify(appearance(distance*2,.5)));const before=appearance(distance-.01),after=appearance(distance+.01);assert(Math.abs(before.background-after.background)<.00001);assert(Math.abs(before.rings-after.rings)<.00001);}
});
test('selected B image and every display anchor share the same pixel/world transform',()=>{
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL(layout.source,base))).digest('hex'),layout.sourceSha256);
 assert.equal(layout.systems.length,499);assert.equal(new Set(layout.systems.map(s=>s.pixel.join(','))).size,499);
 for(const s of layout.systems){
  assert(s.position.every(Number.isFinite));assert.equal(layout.systems[s.id-1],s);
  assert(Math.abs(s.position[0]-((s.pixel[0]+.5)/layout.width-.5)*layout.span)<1e-4);
  assert(Math.abs(s.position[2]-((s.pixel[1]+.5)/layout.height-.5)*layout.span)<1e-4);
  for(const other of layout.systems)if(other.id>s.id)assert(Math.hypot(s.position[0]-other.position[0],s.position[2]-other.position[2])>650);
 }
 assert.deepEqual(systemCoordinates()[15].position,[-6750,40,9260]);
});
test('white points retain different sizes and exclude duplicate real-system anchors',()=>{
 const bytes=fs.readFileSync(new URL(layout.points,base));assert.equal(bytes.length,layout.pointCount*20);
 const anchors=new Set(layout.systems.map(s=>s.position.map(v=>Math.fround(v)).join(',')));let small=0,large=0;
 for(let i=0;i<bytes.length;i+=20){const p=Array.from({length:5},(_,j)=>bytes.readFloatLE(i+j*4));assert(p.every(Number.isFinite));assert(!anchors.has(p.slice(0,3).join(',')));assert(p[3]>.5&&p[3]<5);assert(p[4]>0&&p[4]<=1);if(p[3]<1)small++;if(p[3]>3.5)large++;}
 assert(small>10000);assert(large>100);assert(new Set(layout.systems.map(s=>s.size)).size>30);
});
test('constellations are deterministic small non-crossing groups of selectable stars',()=>{
 const linksFor=vm.runInNewContext(fs.readFileSync(new URL('aurora-strategy.js',base),'utf8')+';auroraConstellationLinks');
 const stars=layout.systems.slice(0,256),byId=new Map(stars.map(s=>[s.id,s])),links=linksFor(stars),groups=new Map(),degree=new Map();
 assert(links.length>150);assert.equal(JSON.stringify(links),JSON.stringify(linksFor([...stars].reverse())));assert.equal(linksFor([]).length,0);
 for(const e of links){assert(byId.has(e.a)&&byId.has(e.b));assert.notEqual(e.a,e.b);assert(Math.hypot(...byId.get(e.a).position.map((v,k)=>v-byId.get(e.b).position[k]))<=5400);
  if(!groups.has(e.group))groups.set(e.group,new Set());for(const id of[e.a,e.b]){groups.get(e.group).add(id);degree.set(id,(degree.get(id)||0)+1);}
 }
 assert([...groups.values()].every(g=>g.size<=8));assert([...degree.values()].every(d=>d<=3));
 const turn=(a,b,c)=>(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
 for(let i=0;i<links.length;i++)for(let j=i+1;j<links.length;j++){const a=links[i],b=links[j];if([a.a,a.b].some(id=>id===b.a||id===b.b))continue;const[p,q,r,s]=[a.a,a.b,b.a,b.b].map(id=>byId.get(id).position);assert(!(turn(p,q,r)*turn(p,q,s)<0&&turn(r,s,p)*turn(r,s,q)<0));}
});
