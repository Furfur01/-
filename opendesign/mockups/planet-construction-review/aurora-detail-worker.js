// CPU scene generation and animation run off the input/render thread. WebGL
// commands are replayed on the world's one context; this worker creates none.
let commands=[],serial=0,runtime;
const noop=()=>{},element=()=>({classList:{add:noop,remove:noop,toggle:noop},style:{},querySelectorAll:()=>[],getContext:()=>({}),remove:noop});
self.window=self;self.__AURORA_WORKER=true;self.__AURORA_CONFIG={production:true};self.innerWidth=1440;self.innerHeight=1000;self.document={documentElement:element(),body:element(),querySelector:element,querySelectorAll:()=>[],createElement:element};
self.addEventListener('message',e=>{const m=e.data;try{
 if(m.type==='init'){
  const returns=new Set(['createBuffer','createShader','createProgram','createTexture','createFramebuffer','createRenderbuffer','getUniformLocation','getAttribLocation']);
  const fake=new Proxy(m.constants,{get(target,name){if(name in target)return target[name];if(name==='getShaderParameter'||name==='getProgramParameter')return ()=>true;if(name==='checkFramebufferStatus')return ()=>target.FRAMEBUFFER_COMPLETE;if(name==='getExtension')return ()=>null;return (...args)=>{const result=returns.has(name)?{__gl:++serial}:null;commands.push([name,args,result?.__gl]);return result;};}});
  importScripts('review.bundle.js');const start=performance.now();runtime=self.createAuroraDetail({biome:m.biome,gl:fake,canvas:{width:1440,height:1000},onProxy:geometry=>self.postMessage({type:'proxy',geometry},[geometry.buffer])});
  const targets={};for(const id of m.buildingIds)targets[id]=runtime.buildingTarget(id);
  const transfers=[...new Set(commands.filter(c=>c[0]==='bufferData'&&ArrayBuffer.isView(c[1][1])).map(c=>c[1][1].buffer))];
  self.postMessage({type:'ready',commands,targets,buffers:runtime.snapshot.bufferCount,ms:performance.now()-start},transfers);commands=[];
 }else if(m.type==='draw'){
  runtime.drawWorld(m.view,m.planet,m.catalog);self.postMessage({type:'draw',key:m.key,commands,buildings:m.view.buildings?runtime.snapshot.districts.flatMap(d=>d.buildings):[]});commands=[];
 }
}catch(error){self.postMessage({type:'error',message:error.stack||error.message});}});
