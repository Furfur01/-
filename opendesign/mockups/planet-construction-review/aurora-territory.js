// ASTRAL planar territories: bounded Voronoi cells, shared edges, real owners.
function auroraTerritoryClip(poly,nx,nz,c){
 const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*nz-c,db=b[0]*nx+b[1]*nz-c,ia=da<=1e-12,ib=db<=1e-12;if(ia)out.push(a);if(ia!==ib){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}return out;
}
function auroraTerritoryGeometry(systems,owned){
 const scale=31500,sites=systems.map(s=>[s.position[0]/scale,s.position[2]/scale]),records=new Map(owned.map(c=>[c.id,c]));
 // Neutral support sites bound the frontier and leave gaps in the spiral arms.
 for(let z=-39060;z<=39060;z+=2790)for(let x=-39060;x<=39060;x+=2790)if(systems.every(s=>Math.hypot(x-s.position[0],z-s.position[2])>4050))sites.push([x/scale,z/scale]);
 const vertices=[],vertexMap=new Map(),edgeMap=new Map(),cells=[];
 function vertex(p){const key=p.map(v=>Math.round(v*1e9)).join(',');if(!vertexMap.has(key)){vertexMap.set(key,vertices.length);vertices.push([p[0]*scale,0,p[1]*scale]);}return vertexMap.get(key);}
 for(let i=0;i<systems.length;i++){
  const a=sites[i];let poly=[[-1.6,-1.6],[1.6,-1.6],[1.6,1.6],[-1.6,1.6]];
  const nearest=sites.map((p,j)=>({j,d:(p[0]-a[0])**2+(p[1]-a[1])**2})).filter(p=>p.j!==i).sort((a,b)=>a.d-b.d);
  for(const {j}of nearest){const b=sites[j];poly=auroraTerritoryClip(poly,b[0]-a[0],b[1]-a[1],(b[0]**2+b[1]**2-a[0]**2-a[1]**2)/2);if(!poly.length)break;}
  const ids=poly.map(vertex).filter((id,k,arr)=>id!==arr[(k+arr.length-1)%arr.length]),record=records.get(systems[i].id),owners=record?.owners||[],ownerKey=owners.map(o=>o.id).join('|'),color=owners.length===1?owners[0].color:'#9faeba',key=owners.length?(record.territoryClass||color):'';
  let area=0,cx=0,cz=0;for(let k=0;k<ids.length;k++){const u=ids[k],v=ids[(k+1)%ids.length],p=vertices[u],q=vertices[v],cross=p[0]*q[2]-q[0]*p[2];area+=cross;cx+=(p[0]+q[0])*cross;cz+=(p[2]+q[2])*cross;const e=u<v?u+':'+v:v+':'+u;if(!edgeMap.has(e))edgeMap.set(e,{u,v,cells:[]});edgeMap.get(e).cells.push(i);}
  cells.push({id:systems[i].id,index:i,key,ownerKey,owners,vertices:ids,area:Math.abs(area)/2,center:area?[cx/(3*area),0,cz/(3*area)]:[systems[i].position[0],0,systems[i].position[2]],neighbors:[],color});
 }
 const edges=[...edgeMap.values()];for(const e of edges)if(e.cells.length===2){const[a,b]=e.cells;cells[a].neighbors.push(b);cells[b].neighbors.push(a);}
 const borders=edges.filter(e=>cells[e.cells[0]].key!==(e.cells.length===2?cells[e.cells[1]].key:'')),regions=[],seen=new Set();
 for(const cell of cells){if(!cell.key||seen.has(cell.index))continue;const ids=[cell.index];seen.add(cell.index);for(let k=0;k<ids.length;k++)for(const j of cells[ids[k]].neighbors)if(!seen.has(j)&&cells[j].key===cell.key){seen.add(j);ids.push(j);}
  const area=ids.reduce((sum,j)=>sum+cells[j].area,0),center=[0,1,2].map(k=>ids.reduce((sum,j)=>sum+cells[j].center[k]*cells[j].area,0)/Math.max(1,area));
  regions.push({key:cell.key+':'+cell.id,owners:[...new Map(ids.flatMap(j=>cells[j].owners).map(o=>[o.id,o])).values()],shared:cell.owners.length>1,color:cell.color,systemIds:ids.map(j=>cells[j].id),center,area});
 }
 return {cells,vertices,borders,regions};
}
function createAuroraTerritories(){
 const vertex=shader(gl.VERTEX_SHADER,'attribute vec3 aPosition,aColor;uniform mat4 uVP;uniform vec3 uOrigin;varying vec3 vColor;void main(){vColor=aColor;gl_Position=uVP*vec4(aPosition-uOrigin,1.);}'),fragment=shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec3 vColor;uniform float uOpacity;void main(){gl_FragColor=vec4(vColor,uOpacity);}');
 const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const a=gl.getAttribLocation(program,'aPosition'),c=gl.getAttribLocation(program,'aColor'),vp=gl.getUniformLocation(program,'uVP'),origin=gl.getUniformLocation(program,'uOrigin'),alpha=gl.getUniformLocation(program,'uOpacity');let geometry={cells:[],vertices:[],borders:[],regions:[]},fill=null,lines=null;
 const rgb=color=>color.slice(1).match(/../g).map(v=>parseInt(v,16)/255);
 function buffer(data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return {buffer:b,count:data.length/6};}
 const release=()=>{if(fill)gl.deleteBuffer(fill.buffer);if(lines)gl.deleteBuffer(lines.buffer);};
 return {set(cells,systems){release();geometry=auroraTerritoryGeometry(systems,cells);const data=[],edges=[];for(const cell of geometry.cells){if(!cell.key)continue;const color=rgb(cell.color),ids=cell.vertices;for(let k=1;k<ids.length-1;k++)for(const id of [ids[0],ids[k],ids[k+1]])data.push(...geometry.vertices[id],...color);}for(const edge of geometry.borders){const owners=edge.cells.map(i=>geometry.cells[i]).filter(c=>c.key);const color=owners.length===2?rgb(owners[0].color).map((v,i)=>(v+rgb(owners[1].color)[i])/2):rgb(owners[0].color);for(const id of [edge.u,edge.v])edges.push(...geometry.vertices[id],...color);}fill=buffer(data);lines=buffer(edges);},draw(n){
  const opacity=Math.max(0,Math.min(1,(n.camera.dist-1600)/2200));if(n.coreDetail||n.territoriesVisible===false||!opacity||!fill)return;
  const eyeOffset=sub(n.eye,n.camera.center),right=[Math.cos(n.camera.yaw),0,-Math.sin(n.camera.yaw)],up=norm(cross(right,norm(mul(eyeOffset,-1)))),matrix=mm(perspective(FOV,W/H,Math.max(1,n.camera.dist*.02),Math.max(50000,n.camera.dist*3)),lookAt(eyeOffset,[0,0,0],up));
  gl.useProgram(program);gl.uniformMatrix4fv(vp,false,matrix);gl.uniform3fv(origin,n.camera.center);gl.disable(gl.CULL_FACE);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);for(let i=0;i<gl.getParameter(gl.MAX_VERTEX_ATTRIBS);i++)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(a);gl.enableVertexAttribArray(c);
  for(const [mesh,mode,opacityScale]of [[fill,gl.TRIANGLES,.13],[lines,gl.LINES,.76]]){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);gl.vertexAttribPointer(a,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(c,3,gl.FLOAT,false,24,12);gl.uniform1f(alpha,opacity*opacityScale);gl.drawArrays(mode,0,mesh.count);}gl.depthMask(true);gl.enable(gl.DEPTH_TEST);
 },get stats(){return {mode:'planar-voronoi',regions:geometry.regions.length,meshes:fill?2:0,vertices:fill?.count||0,borders:geometry.borders.length,volumes:geometry.regions.map(r=>({systems:r.systemIds,shared:r.shared,center:r.center})),components:geometry.regions};},dispose(){release();gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);}};
}
