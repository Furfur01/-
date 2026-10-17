// Markers describe exact ownership. The world renderer joins adjacent planar cells with the same owners.
function auroraStrategyData(systems,planets,playerId){
 const records=new Map(),palette=['#cc92dc','#82abef','#e5a771','#b6cb79','#db91a8'];
 const color=id=>{if(id===playerId)return '#67d9c3';let hash=0;for(const c of String(id))hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;return palette[hash%palette.length];};
 for(const p of planets){if(!p.owner||p.npc||p.moon||p.kind==='belt')continue;const id=(p.coordinates||p.position)[1];if(!records.has(id))records.set(id,{owners:new Map(),worlds:[]});const r=records.get(id);r.owners.set(p.owner,{id:p.owner,name:p.ownerName||String(p.owner),color:color(p.owner)});r.worlds.push(p);}
 for(const s of systems)if(s.systemOwner){const r=records.get(s.id)||{worlds:[]};r.territoryClass='sovereign:'+s.systemOwner;r.owners=new Map([[s.systemOwner,{id:s.systemOwner,name:s.systemOwnerName,color:s.systemOwner===playerId?'#67d9c3':s.systemColor||color(s.systemOwner)}]]);records.set(s.id,r);}
 return systems.filter(s=>records.has(s.id)).map(s=>({id:s.id,position:s.position.slice(),name:s.name,territoryClass:records.get(s.id).territoryClass,owners:[...records.get(s.id).owners.values()].sort((a,b)=>String(a.id).localeCompare(String(b.id))),worlds:records.get(s.id).worlds}));
}
// Short, separate constellations join selectable systems only; these are visual guides.
function auroraConstellationLinks(systems){
 const stars=[...systems].sort((a,b)=>a.id-b.id),parent=stars.map((_,i)=>i),sizes=stars.map(()=>1),degree=stars.map(()=>0),candidates=[],links=[];
 const root=i=>{while(parent[i]!==i)i=parent[i];return i;};
 const turn=(a,b,c)=>(b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]);
 for(let i=0;i<stars.length;i++)for(let j=i+1;j<stars.length;j++){
  const distance=Math.hypot(...stars[i].position.map((v,k)=>v-stars[j].position[k]));
  if(distance<=5400)candidates.push({i,j,distance});
 }
 candidates.sort((a,b)=>a.distance-b.distance||stars[a.i].id-stars[b.i].id||stars[a.j].id-stars[b.j].id);
 for(const edge of candidates){const {i,j}=edge,a=root(i),b=root(j);if(a===b||degree[i]>=3||degree[j]>=3||sizes[a]+sizes[b]>8)continue;
  const p=stars[i].position,q=stars[j].position;
  if(links.some(e=>{if([e.i,e.j].includes(i)||[e.i,e.j].includes(j))return false;const r=stars[e.i].position,s=stars[e.j].position;return turn(p,q,r)*turn(p,q,s)<0&&turn(r,s,p)*turn(r,s,q)<0;}))continue;
  parent[b]=a;sizes[a]+=sizes[b];degree[i]++;degree[j]++;links.push(edge);
 }
 return links.map(({i,j})=>({a:stars[i].id,b:stars[j].id,group:stars[root(i)].id}));
}
function createAuroraStrategy(){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.className='strategy-overlay';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:6});document.body.append(canvas);
 const beacon=document.createElement('button');beacon.className='strategy-home-beacon';Object.assign(beacon.style,{position:'absolute',zIndex:9,display:'none',alignItems:'center',gap:'8px',background:'#081720e8',border:'1px solid #e6bc7080',borderRadius:'4px',padding:'12px',color:'#f3d397',font:'12px "Microsoft YaHei",sans-serif',cursor:'pointer'});beacon.onclick=()=>auroraNavigationLocate();document.body.append(beacon);
 const territories=createAuroraTerritories();
 let signature='',cells=[],labels=[],constellations=[],guides={markers:[],links:[],highlighted:[]},lastPlanets,lastSystems,lastPlayer;
 function prepare(n){
  if(lastPlanets!==n.planets||lastSystems!==n.systems||lastPlayer!==n.playerId){lastPlanets=n.planets;lastSystems=n.systems;lastPlayer=n.playerId;const next=JSON.stringify([n.playerId,n.systems.map(s=>[s.id,...s.position,s.systemOwner,s.systemOwnerName,s.systemColor]),n.planets.filter(p=>p.owner&&!p.npc&&!p.moon).map(p=>[p.key,p.owner,p.ownerName,p.name])]);
  if(next!==signature){signature=next;cells=auroraStrategyData(n.systems,n.planets,n.playerId);constellations=auroraConstellationLinks(n.systems);territories.set(cells,n.systems);}}
 }
 function drawGuides(n,width,height){
  guides={markers:[],links:[],highlighted:[]};
  const appearance=auroraGalaxyPresentation(n.camera.dist,width/height),fade=appearance.points,markerScale=width<600?.72:1;guides.ringOpacity=appearance.rings;if(!fade)return;
  const targets=new Map(n.screen.filter(p=>p.type==='system'&&p.depth>0).map(p=>[p.id,p]));
  const hover=n.hover?.type==='system'?n.hover.id:null,selected=n.zoomTarget?.type==='system'?n.zoomTarget.id:null;
  const active=hover??selected,group=constellations.find(e=>e.a===active||e.b===active)?.group;
  ctx.save();ctx.lineCap='round';
  for(const edge of constellations){const a=targets.get(edge.a),b=targets.get(edge.b);if(!a||!b)continue;
   if((a.x<0&&b.x<0)||(a.x>width&&b.x>width)||(a.y<0&&b.y<0)||(a.y>height&&b.y>height))continue;
   const padding=(3+2*appearance.rings)*markerScale,dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length<padding*2+1)continue;
   const lit=group!==undefined&&edge.group===group,inset=padding/length;
   ctx.strokeStyle=lit?'#b9ebf2':'#73989f';ctx.globalAlpha=appearance.links*(lit?.78:.40);ctx.lineWidth=lit?1.25:.8;ctx.beginPath();ctx.moveTo(a.x+dx*inset,a.y+dy*inset);ctx.lineTo(b.x-dx*inset,b.y-dy*inset);ctx.stroke();guides.links.push([edge.a,edge.b]);if(lit)guides.highlighted.push([edge.a,edge.b]);
  }
  for(const s of n.systems){const p=targets.get(s.id);if(!p||p.x<0||p.x>width||p.y<0||p.y>height)continue;
   const lit=s.id===active,radius=(1.1+(s.galaxyStar?.size||3)*.18)*markerScale,color=auroraStarColor(s.id),css='rgb('+color.map(v=>Math.round(v*255)).join(',')+')';
   if(appearance.rings>0){ctx.globalAlpha=appearance.rings*(lit?.9:.55);ctx.strokeStyle=css;ctx.lineWidth=lit?1:.65;ctx.beginPath();ctx.arc(p.x,p.y,(lit?5.5:4.4)*markerScale,0,Math.PI*2);ctx.stroke();}
   ctx.globalAlpha=fade;ctx.fillStyle=css;ctx.beginPath();ctx.arc(p.x,p.y,radius+(lit?.3:0),0,Math.PI*2);ctx.fill();guides.markers.push({id:s.id,x:p.x,y:p.y,radius,color,type:auroraStarType(s.id),ringOpacity:appearance.rings});
  }
  ctx.restore();
 }
 function draw(n,project,width,height){
  const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);beacon.style.display='none';labels=[];
  guides={markers:[],links:[],highlighted:[]};if(n.coreDetail)return;
  const opacity=Math.max(0,Math.min(1,(n.camera.dist-700)/1800));canvas.style.opacity=opacity;if(!opacity)return;
  drawGuides(n,width,height);
  const core=n.screen?.find(p=>p.type==='blackHole');if(core&&core.depth>0&&core.x>16&&core.x<width-70&&core.y>110&&core.y<height-130){ctx.strokeStyle='#d9b77e';ctx.lineWidth=1;ctx.beginPath();ctx.arc(core.x,core.y,9,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#edcf9c';ctx.font='12px "Microsoft YaHei",sans-serif';ctx.fillText('银心',core.x+16,core.y+4);}
  const home=n.planets.find(p=>p.id===n.homePlanetId),homeSystem=home?.coordinates[1],selected=n.zoomTarget?.type==='system'?n.zoomTarget.id:n.planets.find(p=>p.key===n.selectedPlanetId)?.coordinates[1];
  const occupied=[];const label=(text,x,y,color,priority=false)=>{ctx.font=(priority?'600 13px':'12px')+' "Microsoft YaHei",sans-serif';const w=ctx.measureText(text).width,box={x:x-4,y:y-14,w:w+8,h:23};if(x<12||x+w>width-12||y<110||y>height-130||occupied.some(b=>box.x<b.x+b.w&&box.x+box.w>b.x&&box.y<b.y+b.h&&box.y+box.h>b.y))return;occupied.push(box);ctx.fillStyle='#051019dc';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.fillStyle=color;ctx.fillText(text,x,y+2);labels.push(text);};
  const homeStar=n.systems.find(s=>s.id===homeSystem),hp=homeStar&&project(homeStar.position,1);
  if(hp){
   if(hp.depth>0&&hp.x>30&&hp.x<width-30&&hp.y>130&&hp.y<height-145){ctx.save();ctx.translate(hp.x,hp.y);ctx.strokeStyle='#f1cc80';ctx.fillStyle='#f1cc80';ctx.lineWidth=1.7;ctx.shadowBlur=16;ctx.shadowColor='#e5b85e';ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=i%2?5:13;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.strokeRect(-22,-22,44,44);ctx.restore();label(home.name,hp.x+29,hp.y,'#f4dba5',true);}
   else{const dx=(hp.x-width/2)*(hp.depth>0?1:-1),dy=(hp.y-height/2)*(hp.depth>0?1:-1),t=Math.min((width/2-95)/Math.max(1,Math.abs(dx)),(height/2-155)/Math.max(1,Math.abs(dy)));beacon.textContent='✦ '+home.name+' '+(Math.abs(dx)>Math.abs(dy)?dx>0?'→':'←':dy>0?'↓':'↑');beacon.title='定位 '+home.name;beacon.setAttribute('aria-label',beacon.title);beacon.style.display='flex';beacon.style.left=Math.max(12,Math.min(width-180,width/2+dx*t-70))+'px';beacon.style.top=Math.max(112,Math.min(height-160,height/2+dy*t-20))+'px';}
  }
  const target=n.systems.find(s=>s.id===selected),sp=target&&project(target.position,1);if(sp&&sp.depth>0){ctx.strokeStyle='#eaf4f5';ctx.lineWidth=1;for(const [dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){ctx.beginPath();ctx.moveTo(sp.x+dx*12,sp.y+dy*20);ctx.lineTo(sp.x+dx*20,sp.y+dy*20);ctx.lineTo(sp.x+dx*20,sp.y+dy*12);ctx.stroke();}if(selected!==homeSystem)label(target.name,sp.x+26,sp.y,'#eaf4f5',true);}
  // One actual owner name per visible faction; no generic "friendly/home" subtitles.
  if(n.territoriesVisible!==false){const named=new Set();for(const cell of [...cells].sort((a,b)=>(b.id===homeSystem)-(a.id===homeSystem))){if(cell.owners.length!==1)continue;const o=cell.owners[0];if(named.has(o.id)||/^(指挥官|玩家|新玩家|未命名.*)$/.test(o.name))continue;const p=project(cell.position,1),scale=project([cell.position[0]+1100,cell.position[1],cell.position[2]],1);if(p.depth<=0||Math.hypot(scale.x-p.x,scale.y-p.y)<30)continue;label(o.name,p.x-ctx.measureText(o.name).width/2,p.y+52,o.color);named.add(o.id);}}
  if(n.camera.dist<14000)for(const cell of cells){if(cell.id===homeSystem||cell.id===selected)continue;const p=project(cell.position,1);if(p.depth>0)label(cell.name,p.x+14,p.y,cell.owners[0].color);}
 }
 return {draw,drawWorld(n,project){prepare(n);territories.draw(n,project);},get stats(){return {...territories.stats,constellations:guides};},get cells(){return cells;},get labels(){return labels;},dispose(){territories.dispose();canvas.remove();beacon.remove();}};
}
