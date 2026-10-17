// A system-scale cargo port. Geometry is shared by every owned logistics center;
// shuttles are decorative and never create missions or alter the resource ledger.
function auroraLogisticsPose(center,star){return {id:center.key,position:add(star.position,[-34,26,-40]),radius:16,system:center.position[1]};}
function createAuroraLogistics(){
 const frame=[],hull=[],lights=[],traffic=[];
 const metal=[.57,.65,.66],ivory=[.78,.80,.72],dark=[.15,.23,.26],panel=[.29,.39,.41],brass=[.60,.44,.23];
 const polar=(r,a,y=0)=>[r*Math.cos(a),y,r*Math.sin(a)];
 function annulus(dst,inner,outer,y,height,color,segments=72){
  for(let i=0;i<segments;i++){
   const a=i/segments*TAU+.008,b=(i+1)/segments*TAU-.008;
   const p=polar(inner,a,y),q=polar(outer,a,y),r=polar(outer,b,y),s=polar(inner,b,y),top=v=>[v[0],v[1]+height,v[2]];
   quad(dst,top(p),top(s),top(r),top(q),color);quad(dst,p,q,r,s,color);
   quad(dst,q,top(q),top(r),r,color);quad(dst,s,top(s),top(p),p,color);
   quad(dst,p,top(p),top(q),q,color);quad(dst,r,top(r),top(s),s,color);
  }
 }
 // Two load-bearing rings and a six-spoke truss are visible from system altitude.
 ring(frame,[0,-.65,0],10.2,.16,metal,[0,0,0],0,72);
 ring(frame,[0,1.65,0],7.2,.12,metal,[0,0,0],0,60);
 annulus(hull,9.4,10.8,-.5,.85,ivory);
 annulus(hull,6.8,7.7,1.45,.6,metal,60);
 annulus(hull,3.2,4.2,.15,.8,dark,36);
 annulus(lights,9.48,9.57,.37,.045,[1,1,1]);
 annulus(lights,7.55,7.64,2.06,.04,[1,1,1],60);
 for(let i=0;i<6;i++){
  const a=i*TAU/6,rot=[0,-a,0];
  beam(frame,polar(2.1,a,-1),polar(10.3,a,-1),.23,metal);
  beam(frame,polar(3,a,1.9),polar(9.8,a,-.9),.12,metal);
  box(hull,polar(6,a,.3),[7.4,.5,.9],panel,rot);
  for(const side of [-1,1]){
   beam(frame,polar(4,a+side*.09,-.8),polar(10,a+side*.08,-.8),.10,brass);
   for(let j=0;j<4;j++)beam(frame,polar(4+j*1.5,a+side*.09,-.8),polar(5.4+j*1.5,a-side*.07,-.8),.065,metal);
  }
  // Warehouse blocks, roof ribs, docking mouths and crane gantries.
  box(hull,polar(11.4,a,.7),[4.5,2.3,2.7],dark,rot);
  box(hull,polar(11.4,a,1.9),[4.1,.32,2.85],ivory,rot);
  for(let j=0;j<5;j++)box(hull,polar(9.8+j*.8,a,2.15),[.12,.23,2.95],metal,rot);
  box(hull,polar(13.69,a,.55),[.12,1.55,2.02],[.035,.07,.085],rot);
  for(const side of [-1,1]){
   const edge=add(polar(13.8,a,.55),polar(.98,a+side*PI/2));
   box(lights,edge,[.10,1.48,.06],[1,1,1],rot);
   const foot=add(polar(11.4,a,2.5),polar(1.7,a+side*PI/2));
   box(frame,foot,[.2,1.1,.2],metal,rot);
  }
  box(frame,polar(11.4,a,3.1),[.25,.25,3.6],brass,rot);
  // Stacked freight containers on the inner apron.
  for(let j=0;j<3;j++)for(let layer=0;layer<2;layer++){
   const p=add(polar(8.5,a,.45+layer*.5),polar((j-1)*.7,a+PI/2));
   box(hull,p,[1.3,.43,.56],(j+i)%2?panel:brass,rot);
  }
  const b=a+PI/6;
  box(hull,polar(10.2,b,.65),[1.2,1.25,1.9],metal,[0,-b,0]);
  box(lights,polar(10.2,b,1.31),[.85,.06,1.3],[1,1,1],[0,-b,0]);
 }
 // Axial control tower, armored base, bridge crown and antenna mast.
 cyl(hull,[0,-.5,0],2.8,1.7,dark,12);
 cyl(hull,[0,1.1,0],2.1,2,metal,12,[0,0,0],1.6);
 cyl(hull,[0,2.8,0],1.45,2,ivory,6,[0,0,0],1.05);
 cyl(hull,[0,4.1,0],2.0,.65,dark,12);
 ring(lights,[0,4.22,0],2.03,.08,[1,1,1],[0,0,0],0,36);
 cyl(hull,[0,4.65,0],1.75,.5,ivory,12,[0,0,0],.85);
 cyl(frame,[0,5.8,0],.10,2,metal,8);
 sphere(lights,[0,6.85,0],[.15,.15,.15],[1,1,1]);
 for(let i=0;i<3;i++){const a=i*TAU/3;beam(frame,polar(.9,a,4.6),polar(1.8,a,6.0),.065,metal);}
 box(traffic,[0,0,0],[.55,.3,1.35],ivory);box(traffic,[0,.23,0],[.42,.16,.6],brass);
 for(const side of [-1,1])box(traffic,[side*.38,-.04,-.2],[.18,.22,1.2],dark);
 const meshes={frame:upload(frame),hull:upload(hull),lights:upload(lights),traffic:upload(traffic)};
 const labels=new Map();let stats=[];
 function label(center,q,progress){
  let el=labels.get(center.key);
  if(!el){el=document.createElement('button');el.className='logistics-world-label';el.style.cssText='position:absolute;z-index:7;min-height:44px;padding:6px 9px;border:0;border-left:1px solid #8cc6b5;background:#061015b8;color:#c3dfd5;text-align:left;font:11px sans-serif;cursor:pointer;white-space:nowrap';el.addEventListener('click',()=>{auroraNavigation.system=center.position.slice();auroraNavigationEmit('logistics');});document.body.append(el);labels.set(center.key,el);}
  el.innerHTML='<span style="font-size:9px;letter-spacing:1.6px;color:#7fa99b">SYSTEM LOGISTICS</span><br>恒星系物流中心'+(center.level?'':' · 建设 '+Math.round(progress*100)+'%');
  const narrow=W<=700;el.style.left=clamp(narrow?q.x-90:q.x+q.radius+9,8,W-188)+'px';el.style.top=clamp(narrow?q.y-q.radius-56:q.y-12,8,H-50)+'px';el.hidden=false;
 }
 function draw(n,screen,body,bySystem,alpha){
  stats=[];for(const el of labels.values())el.hidden=true;
  if(alpha<.1||n.level==='galaxy')return;
  for(const center of n.logistics||[]){
   if(!(center.level||center.queue))continue;const star=bySystem.get(center.position[1]);if(!star)continue;
   const pose=auroraLogisticsPose(center,star),q=screen(pose.position,pose.radius);
   if(q.depth<=0||q.radius<2||q.x+q.radius<0||q.x-q.radius>W||q.y+q.radius<0||q.y-q.radius>H)continue;
   const progress=center.level?1:clamp((Date.now()+gameNowOffset-center.queue.start)/(center.queue.end-center.queue.start),0,1),rotation=-.22,light=norm(sub(star.position,pose.position));
   body(meshes.frame,pose.position,1,metal,7,alpha,light,3,6,rotation);
   if(progress>0)body({...meshes.hull,count:Math.floor(meshes.hull.count*progress/3)*3},pose.position,1,ivory,7,alpha,light,3,6,rotation);
   body(meshes.lights,pose.position,1,center.level?[.30,.86,.71]:[.92,.58,.20],-1,alpha*(center.level?.85:.35),light,3,6,rotation);
   if(center.level&&q.radius>14)for(let i=0;i<4;i++){
    const a=n.time*.045+i*TAU/4,position=add(pose.position,polar(15.4+i*.35,a,.3+Math.sin(a*2+i)*1.6));
    body(meshes.traffic,position,.65,ivory,7,alpha,light,3,6,-a);
   }
   n.screen.push({...q,id:center.key,type:'logistics',system:center.position[1],radius:Math.max(18,q.radius)});
   if(center.position[1]===n.system[1]&&q.radius>12&&q.x>0&&q.x<W&&q.y>0&&q.y<H)label(center,q,progress);
   stats.push({key:center.key,position:pose.position,radius:pose.radius,projectedRadius:q.radius,progress,shuttles:center.level&&q.radius>14?4:0});
  }
  for(const [key,el]of labels)if(!n.logistics?.some(c=>c.key===key&&(c.level||c.queue))){el.remove();labels.delete(key);}
 }
 return {draw,get stats(){return stats;},dispose(){for(const geo of Object.values(meshes))gl.deleteBuffer(geo.b);for(const el of labels.values())el.remove();labels.clear();}};
}
