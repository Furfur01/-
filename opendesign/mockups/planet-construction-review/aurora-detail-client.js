// GPU handles stay in the master context. Uploads are drained in short batches.
function createWorldDetail(biome,onReady,onError){
 let proxyData=null,proxyGeometry=null;
 const worker=new Worker('aurora-detail-worker.js'),handles=new Map(),uniformNames=new Map(),frames=new Map(),pending=new Map(),views=new Map(),owned={buffers:[],programs:[],textures:[],framebuffers:[],renderbuffers:[],shaders:[]};let uploads=[],draws=[],viewNow=null,busy=false,ready=false,released=false,targets={},buildingStates=[],count=0,reported=false,loadMs=0;
 const constants={};for(let p=gl;p;p=Object.getPrototypeOf(p))for(const key of Object.getOwnPropertyNames(p))if(typeof gl[key]==='number')constants[key]=gl[key];
 function decode(a){if(a&&typeof a==='object'&&'__gl'in a)return handles.get(a.__gl);return a;}
 let shadow=false;
 function execute(command){const [name,args,id]=command,values=args.map(decode);if(name==='bindFramebuffer'){shadow=values[1]!==null;if(!shadow&&viewNow?.target)values[1]=viewNow.target;}
  if(viewNow&&!shadow&&name==='uniformMatrix4fv'&&uniformNames.get(args[0]?.__gl)==='uVP')values[2]=viewNow.vp;
  if(viewNow&&!shadow&&name==='uniformMatrix4fv'&&uniformNames.get(args[0]?.__gl)==='uVPAtmosphere')values[2]=viewNow.vp;
  if(viewNow&&!shadow&&name==='uniform3fv'&&uniformNames.get(args[0]?.__gl)==='uEye')values[1]=viewNow.eye;
  if(viewNow&&!shadow&&name==='uniform3fv'&&uniformNames.get(args[0]?.__gl)==='uLight')values[1]=viewNow.light;
  if(viewNow&&name==='uniform1f'&&uniformNames.get(args[0]?.__gl)==='uTime')values[1]=viewNow.time;
  if(viewNow&&!shadow&&name==='viewport'){values[2]=canvas.width;values[3]=canvas.height;}
  // Prevent stale async material opacity during immediate wheel reversals.
  if(viewNow&&!viewNow.target&&name==='uniform1f'&&uniformNames.get(args[0]?.__gl)==='uOpacity')values[1]*=viewNow.opacity;
  const result=gl[name](...values);if(id){handles.set(id,result);if(name==='getUniformLocation')uniformNames.set(id,args[1]);const group={createBuffer:'buffers',createProgram:'programs',createTexture:'textures',createFramebuffer:'framebuffers',createRenderbuffer:'renderbuffers',createShader:'shaders'}[name];if(group)owned[group].push(result);}
 }
 worker.onmessage=e=>{if(released)return;const m=e.data;if(m.type==='proxy')proxyData=m.geometry;else if(m.type==='ready'){uploads=m.commands;targets=m.targets;count=m.buffers;loadMs=m.ms;reported=true;}else if(m.type==='draw'){frames.delete(m.key);frames.set(m.key,{commands:m.commands,buildings:m.buildings});while(frames.size>16)frames.delete(frames.keys().next().value);busy=false;}else if(m.type==='error'){busy=false;onError(new Error(m.message));}};
 worker.onerror=e=>onError(new Error(e.message));worker.postMessage({type:'init',biome,constants,buildingIds:[...Object.values(gameBuildingIds),'Moon_Base','Metal_Storage','Crystal_Storage','Gas_Storage','The_EU_X_Radar','Wormhole_Generator']});
 return {
  get ready(){return ready;},get bufferCount(){return count+(proxyGeometry?1:0);},get proxy(){return proxyGeometry;},buildingTarget:id=>targets[id],
  prepare(){if(released)return;const start=performance.now();viewNow=null;if(proxyData){const b=gl.createBuffer();owned.buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,proxyData,gl.STATIC_DRAW);proxyGeometry={b,count:proxyData.length/STRIDE,mode:gl.TRIANGLES};proxyData=null;}while(uploads.length&&performance.now()-start<3)execute(uploads.shift());if(reported&&!uploads.length&&!ready){ready=true;onReady(loadMs);}if(ready&&!busy&&pending.size){const [key,message]=pending.entries().next().value;pending.delete(key);busy=true;worker.postMessage(message);}gl.bindFramebuffer(gl.FRAMEBUFFER,null);},
  drawWorld(view,planet,catalog){if(!ready)return false;viewNow=view;const key=view.bodyKey+':'+view.buildings,frame=frames.get(key);draws=frame?.commands||[];buildingStates=frame?.buildings||[];views.delete(view.bodyKey);views.set(view.bodyKey,{view,buildings:buildingStates});while(views.size>16)views.delete(views.keys().next().value);for(const c of draws)execute(c);const {target,...safeView}=view;pending.set(key,{type:'draw',key,view:{...safeView,opacity:1},planet,catalog});while(pending.size>16)pending.delete(pending.keys().next().value);return draws.length>0;},
  hasFrame(key,own){return frames.has(key+':'+own);},
  get drawInfo(){return {bodyKey:viewNow?.bodyKey,buildings:buildingStates.filter(b=>b.state!=='unbuilt').length,commandCount:draws.length};},
  pickBuilding(x,y,key){const entry=views.get(key);if(!entry)return null;const view=entry.view;let best=null,dist=Infinity;for(const b of entry.buildings){if(b.state==='unbuilt')continue;const q=proj(view.vp,b.position),dx=(q[0]+1)*W/2-x,dy=(1-q[1])*H/2-y,d=Math.hypot(dx,dy);if(q[3]>0&&dot(b.normal,sub(view.eye,b.position))>0&&d<45&&d<dist){dist=d;best=b;}}return best?{building:{...best,gameId:best.gameId||gameBuildingIds[best.type]}}:null;},
  release(){released=true;worker.terminate();for(const [group,fn]of Object.entries({buffers:'deleteBuffer',programs:'deleteProgram',textures:'deleteTexture',framebuffers:'deleteFramebuffer',renderbuffers:'deleteRenderbuffer',shaders:'deleteShader'}))for(const item of owned[group])gl[fn](item);handles.clear();draws=[];uploads=[];}
 };
}
