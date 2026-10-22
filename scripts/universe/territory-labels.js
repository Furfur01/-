import * as T from 'three';
import {WORLD_SCALE} from './spatial.js';

export const PUBLIC_CORE_RADIUS=6500*WORLD_SCALE;
const radius=p=>Math.hypot(p[0],p[2]);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[2]-b[2]);
const atlas='/opendesign/mockups/galactic-command/assets/heraldry/nations-atlas.png';
const seals={'faction:iron':0,'faction:dawn':1,'faction:zenith':2,'faction:obsidian':3,'realm:starbay':4,'faction:frontier':5};
const namedSeals={'自由港商盟':6,'猎户防卫同盟':7,'天鹅座共同体':8,'白帆自由港':9,'远望殖民站':10,'熔炉矿港':11,'流浪者港':12,'观星庭':13,'静海避风港':14};
function inside(point,cell,vertices){
 let sign=0;
 for(let i=0;i<cell.vertices.length;i++){
  const a=vertices[cell.vertices[i]],b=vertices[cell.vertices[(i+1)%cell.vertices.length]],cross=(b[0]-a[0])*(point[2]-a[2])-(b[2]-a[2])*(point[0]-a[0]);
  if(Math.abs(cross)<1)continue;const s=Math.sign(cross);if(sign&&s!==sign)return false;sign=s;
 }
 return true;
}
export function footprint(position,width){
 const h=width*.625;
 // Emblem above, full-width country name below.
 return [[0,0],[-.25,-.4],[.25,-.4],[-.25,.12],[.25,.12],[-.46,.34],[.46,.34],[-.46,.46],[.46,.46]].map(([x,z])=>[position[0]+x*width,0,position[2]+z*h]);
}
// Fixed world-space imprints inside real holdings, never in the public core.
export function territoryLabels(data,playerId,homePosition){
 const byId=new Map(data.cells.map(c=>[c.id,c])),largest=new Map();
 for(const region of data.regions){
  if(region.shared||region.owners.length!==1)continue;
  const owner=region.owners[0];if(owner.id===playerId||owner.id==='reserved-expansion')continue;
  if(!largest.has(owner.id)||region.area>largest.get(owner.id).area)largest.set(owner.id,region);
 }
 return [...largest.values()].map(region=>{
  const owner=region.owners[0],cells=region.systemIds.map(id=>byId.get(id)),major=region.systemIds.length>=12;
  const desired=Math.min(major?16000:5200,Math.sqrt(region.area)/WORLD_SCALE*.9)*WORLD_SCALE;
  const score=c=>distance(c.center,region.center)+(homePosition?Math.max(0,desired*1.1-distance(c.center,homePosition))*4:0);
  const candidates=cells.filter(c=>radius(c.center)>PUBLIC_CORE_RADIUS).sort((a,b)=>score(a)-score(b));
  let placement;
  for(const scale of [1,.85,.7,.55,.4,.28]){
   const width=desired*scale;
   const cell=candidates.find(c=>footprint(c.center,width).every(p=>radius(p)>PUBLIC_CORE_RADIUS&&cells.some(other=>inside(p,other,data.vertices))));
   if(cell){placement={position:cell.center.slice(),system:cell.id,width};break;}
  }
  return placement?{id:owner.id,name:owner.name,color:owner.color,seal:seals[owner.id]??namedSeals[owner.name]??5,major,...placement}:null;
 }).filter(Boolean);
}
function inscription(label,image){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640;const ctx=canvas.getContext('2d');
 const column=label.seal%4,row=Math.floor(label.seal/4),cw=image.width/4,ch=image.height/4;
 ctx.drawImage(image,column*cw,row*ch,cw,ch,240,-14,544,544);
 ctx.globalCompositeOperation='source-in';ctx.fillStyle='#edf1e9';ctx.fillRect(0,0,1024,640);ctx.globalCompositeOperation='source-over';
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 114px "Microsoft YaHei","Segoe UI",sans-serif';ctx.fillText(label.name,512,574,940);
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}
export function createTerritoryLabels(world){
 const root=new T.Group();root.name='territory-heraldry-imprints';world.scene.add(root);
 const geometry=new T.PlaneGeometry(1,1);geometry.rotateX(-Math.PI/2);
 const loader=new T.TextureLoader();let disposed=false,source=null,image=null,entries=[];
 const release=()=>{for(const entry of entries){entry.mesh.removeFromParent();entry.mesh.material.map.dispose();entry.mesh.material.dispose();}entries=[];};
 loader.load(atlas,texture=>{image=texture.image;texture.dispose();if(disposed)return;source=null;},undefined,error=>{if(!disposed)world.fail(new Error('国家徽章载入失败，请刷新页面',{cause:error}));});
 function rebuild(data){
  release();entries=territoryLabels(data,world.navigation.playerId,world.body(world.navigation.homePlanetId)?.position).map(label=>{
   const material=new T.MeshBasicMaterial({map:inscription(label,image),transparent:true,opacity:.86,depthWrite:false,depthTest:false,side:T.DoubleSide,toneMapped:false});
   const mesh=new T.Mesh(geometry,material);mesh.name='heraldry:'+label.id;mesh.position.fromArray(label.position);mesh.position.y=50;mesh.scale.set(label.width,1,label.width*.625);mesh.renderOrder=3;root.add(mesh);return {...label,mesh};
  });
 }
 function update(){
  const n=world.navigation,data=world.environment.territoryData;
  if(image&&source!==data){source=data;rebuild(data);}
  root.position.fromArray(n.camera.center.map(v=>-v));
  root.visible=n.enabled&&n.level==='galaxy'&&world.environment.stats.territoriesVisible&&!n.combatCamera&&!n.missionFollow&&!world.previewId&&!world.coreExplorer.visible&&n.camera.dist>3800*WORLD_SCALE;
  if(!root.visible)return;const fade=T.MathUtils.clamp((n.camera.dist/WORLD_SCALE-3800)/5000,0,1);
  for(const entry of entries)entry.mesh.material.opacity=.86*fade;
 }
 function overlapsName(x,y,width,height){
  if(!root.visible)return false;
  return entries.some(entry=>{
   const corners=footprint(entry.position,entry.width).slice(-4).map(p=>world.project(p));
   if(!corners.some(p=>p.visible))return false;
   const left=Math.min(...corners.map(p=>p.x))-6,right=Math.max(...corners.map(p=>p.x))+6,top=Math.min(...corners.map(p=>p.y))-6,bottom=Math.max(...corners.map(p=>p.y))+6;
   return x<right&&x+width>left&&y<bottom&&y+height>top;
  });
 }
 return {update,overlapsName,dispose(){disposed=true;release();geometry.dispose();root.removeFromParent();}};
}
