import * as THREE from 'three';
import {geometryFromNative,createVisualShaderMaterial} from './shared-resources.js';

// The packed asset format is shared with the model builder: xyz, normal, rgb,
// emission, material tag, uv. No second model conversion occurs in the browser.
export function createGeometry(source) {
  const data = source instanceof Float32Array ? source : new Float32Array(source);
  const geometry = geometryFromNative(data);
  return {geometry,count:data.length/13,lineCount:data.length/13*2};
}

const IDENTITY = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
const MAIN_DEFAULTS = {
  uModel:IDENTITY,uVP:IDENTITY,uEye:[0,0,0],uLight:[-.65,.9,.65],
  uOpacity:1,uSelected:-10,uMode:0,uWire:0,uTime:0,uExposure:1,uTint:[1,1,1],
  uNearFade:0,uFighter:0,uShellOffset:0,uImpact:[0,0,0,0],uShield:[1,0],uTexture:null,
};
const fleetVertex = `attribute vec3 aPosition,aNormal,aColor;uniform mat4 vp;varying vec3 color;
void main(){vec3 normal=normalize(mat3(instanceMatrix)*aNormal);
float light=.68+.72*max(0.,dot(normal,normalize(vec3(-.5,.9,.7))))+.2*max(0.,dot(normal,normalize(vec3(.8,-.1,-.7))));
color=pow(aColor,vec3(.85))*light;gl_Position=vp*instanceMatrix*vec4(aPosition,1.);}`;
const fleetFragment = 'varying vec3 color;uniform vec3 tint;void main(){gl_FragColor=vec4(color*tint,1.);}';
const ribbonVertex = 'attribute vec3 p,c;attribute vec2 texcoord;attribute float a;uniform mat4 vp;varying vec3 color;varying vec2 tex;varying float alpha;void main(){color=c;tex=texcoord;alpha=a;gl_Position=vp*vec4(p,1.);}';
const ribbonFragment = 'varying vec3 color;varying vec2 tex;varying float alpha;void main(){float edge=abs(tex.y);float core=exp(-edge*edge*110.);float halo=exp(-edge*edge*5.)*.7;float cap=smoothstep(0.,.025,tex.x)*smoothstep(0.,.025,1.-tex.x);gl_FragColor=vec4(mix(color,vec3(1.,.96,.87),core*.7),(core+halo)*alpha*cap);}';
const skyVertex = 'attribute vec2 skyPosition;varying vec2 screenUV;void main(){screenUV=skyPosition;gl_Position=vec4(skyPosition,1.,1.);}';
const skyFragment = `varying vec2 screenUV;uniform sampler2D image;uniform vec3 forward,right,up;uniform vec2 shift;uniform float aspect,tanHalf,exposure;
void main(){vec3 d=normalize(forward+right*(screenUV.x+shift.x)*aspect*tanHalf+up*(screenUV.y+shift.y)*tanHalf);
vec2 st=vec2(fract(atan(d.z,d.x)/6.28318530718+.5),acos(clamp(d.y,-1.,1.))/3.14159265359);
vec4 tex=texture2D(image,st);vec3 c=tex.rgb*tex.a*16.*exposure;
c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);gl_FragColor=vec4(pow(c,vec3(1./2.2)),1.);}`;

const material = (vertexShader,fragmentShader,defaults={}) => createVisualShaderMaterial(vertexShader,fragmentShader,Object.fromEntries(Object.entries(defaults).map(([k,v])=>[k,{value:v}])),{
  raw:false,
  transparent:true,side:THREE.DoubleSide,depthTest:true,depthWrite:true,
  // Preserve the native renderer's LESS test and blendFunc factors for both
  // RGB and alpha; Three's standard blends otherwise use a different alpha source.
  depthFunc:THREE.LessDepth,blending:THREE.CustomBlending,
  blendEquation:THREE.AddEquation,blendEquationAlpha:THREE.AddEquation,
  blendSrc:THREE.SrcAlphaFactor,blendSrcAlpha:THREE.SrcAlphaFactor,
  blendDst:THREE.OneMinusSrcAlphaFactor,blendDstAlpha:THREE.OneMinusSrcAlphaFactor,
  toneMapped:false,premultipliedAlpha:false,forceSinglePass:true,
});

export class ThreeRenderBackend {
  constructor(canvas, shaders, assets) {
    this.canvas=canvas;this.shaders=shaders;this.assets=assets;
    this.three=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'high-performance'});
    this.gl=this.three.getContext();
    this.three.autoClear=false;
    this.three.outputColorSpace=THREE.LinearSRGBColorSpace;
    this.three.toneMapping=THREE.NoToneMapping;
    this.three.info.autoReset=false;
    this.scene=new THREE.Scene();this.overlay=new THREE.Scene();this.camera=new THREE.Camera();
    this.camera.matrixAutoUpdate=false;
    this.meshPools=new Map();this.dynamicPools=new Map();this.instanceBatches=new Map();
    this.materials=new Map();this.geometryResources=new Set();this.textures=new Set();this.lowMeshes=new Map();
    this.shaderErrors=[];
    this.three.debug.onShaderError=(gl,program,vertex,fragment)=>{
      const error=[gl.getProgramInfoLog(program),gl.getShaderInfoLog(vertex),gl.getShaderInfoLog(fragment)].filter(Boolean).join('\n');
      this.shaderErrors.push(error);console.error('Three.js shader compilation failed',error);
    };
    this._onContextLost=e=>{e.preventDefault();const message=document.getElementById('no-webgl'),detail=document.getElementById('webgl-error');if(message)message.hidden=false;if(detail)detail.textContent='图形上下文已丢失。请刷新页面重新初始化。';};
    canvas.addEventListener('webglcontextlost',this._onContextLost);
    this.vp=new Float64Array(IDENTITY);this.eye=[0,0,0];this._relative=new Float64Array(16);
    this._blend=false;this._depthWrite=true;this._depthTest=true;this._frontSide=false;this._layer=0;this._order=0;
    this.frame=0;this.disposed=false;this.resize();
  }

  resize(width=globalThis.innerWidth,height=globalThis.innerHeight,dpr) {
    this.width=width||this.canvas.clientWidth||1;this.height=height||this.canvas.clientHeight||1;
    const requested = new URLSearchParams(globalThis.location?.search||'').get('dpr');
    this.dpr=dpr??(requested?Number(requested):Math.min(globalThis.devicePixelRatio||1,1.6));
    if(!(this.dpr>0))this.dpr=1;
    this.three.setPixelRatio(this.dpr);this.three.setSize(this.width,this.height,false);
  }
  texture(canvas) {
    const texture=new THREE.CanvasTexture(canvas);texture.minFilter=texture.magFilter=THREE.LinearFilter;
    texture.generateMipmaps=false;texture.colorSpace=THREE.NoColorSpace;this.textures.add(texture);return texture;
  }
  flatBuffer(source) {
    const data=source instanceof Float32Array?source:new Float32Array(source),geometry=new THREE.BufferGeometry(),buffer=new THREE.InterleavedBuffer(data,7);
    for(const [name,size,offset]of [['aPosition',3,0],['aColor',3,3],['aSize',1,6]])geometry.setAttribute(name,new THREE.InterleavedBufferAttribute(buffer,size,offset));
    geometry.setAttribute('position',geometry.getAttribute('aPosition'));this.geometryResources.add(geometry);
    return {geometry,count:data.length/7};
  }
  relativeVP() {
    // Float64 multiplication before upload keeps distant battles stable.
    const m=this.vp,e=this.eye,r=this._relative;r.set(m);
    for(let i=0;i<4;i++)r[12+i]=m[i]*e[0]+m[4+i]*e[1]+m[8+i]*e[2]+m[12+i];
    return r;
  }
  setBlend(additive,depthWrite) {this._blend=!!additive;if(depthWrite!==undefined)this._depthWrite=!!depthWrite;}
  setDepthWrite(value){this._depthWrite=!!value;}
  setDepthTest(value){this._depthTest=!!value;}
  setSide(frontOnly){this._frontSide=!!frontOnly;}
  beginOverlay(){this._layer=1;}
  _state(opts={}) {
    return {blend:opts.additive??this._blend,depthWrite:opts.depthWrite??this._depthWrite,depthTest:opts.depthTest??this._depthTest,front:opts.frontOnly??this._frontSide};
  }
  _material(kind,state,wire=false) {
    const key=[kind,+state.blend,+state.depthWrite,+state.depthTest,+state.front,+wire].join(':');
    let mat=this.materials.get(key);if(mat)return mat;
    if(kind==='main')mat=material(this.shaders.vertexSource,this.shaders.fragmentSource,{...MAIN_DEFAULTS});
    else if(kind==='flat')mat=material(this.shaders.flatVertex,this.shaders.flatFragment,{uMatrix:IDENTITY,uDpr:1,uAlpha:1,uPointMode:0});
    else if(kind==='impact')mat=material(this.shaders.impactVertex.replace('attribute vec2 uv;','attribute vec2 texcoord;').replace('tex=uv;','tex=texcoord;'),this.shaders.impactFragment,{vp:IDENTITY});
    else if(kind==='ribbon')mat=material(ribbonVertex,ribbonFragment,{vp:IDENTITY});
    else if(kind==='fleet')mat=material(fleetVertex,fleetFragment,{vp:IDENTITY,tint:[1,1,1]});
    else throw new Error('Unknown renderer material '+kind);
    mat.blendDst=mat.blendDstAlpha=state.blend?THREE.OneFactor:THREE.OneMinusSrcAlphaFactor;mat.depthWrite=state.depthWrite;mat.depthTest=state.depthTest;
    mat.side=state.front?THREE.FrontSide:THREE.DoubleSide;mat.wireframe=wire;
    this.materials.set(key,mat);return mat;
  }
  _queue(geometry,mat,kind='mesh',uniforms={}) {
    const key=[geometry.id,mat.id,kind,this._layer].join(':');
    let pool=this.meshPools.get(key);if(!pool){pool={items:[],cursor:0};this.meshPools.set(key,pool);}
    let object=pool.items[pool.cursor++];
    if(!object){
      object=kind==='points'?new THREE.Points(geometry,mat):kind==='lines'?new THREE.LineSegments(geometry,mat):new THREE.Mesh(geometry,mat);
      object.frustumCulled=false;object.matrixAutoUpdate=false;
      object.onBeforeRender=()=>{
        for(const [name,value]of Object.entries(object.userData.uniforms))mat.uniforms[name].value=value;
        mat.uniformsNeedUpdate=true;
      };
      pool.items.push(object);(this._layer?this.overlay:this.scene).add(object);
    }
    object.userData.uniforms=uniforms;object.visible=true;object.renderOrder=this._order++;
    this.geometryResources.add(geometry);return object;
  }
  drawMesh(mesh,model,opts={}) {
    if(!mesh||opts.opacity===0)return;
    const relative=new Float32Array(model);for(let i=0;i<3;i++)relative[12+i]=model[12+i]-this.eye[i];
    const uniforms={uModel:relative,uVP:new Float32Array(this.relativeVP()),uEye:[0,0,0],uLight:opts.light||[-.65,.9,.65],
      uOpacity:opts.opacity??1,uSelected:opts.selected??-10,uMode:opts.mode||0,uWire:opts.wire?1:0,uTime:this.time||0,
      uExposure:opts.exposure??1,uTint:opts.tint||[1,1,1],uNearFade:opts.nearFade||0,uFighter:opts.fighter?1:0,
      uShellOffset:opts.shellOffset||0,uImpact:opts.impact||[0,0,0,0],uShield:opts.shield||[1,0],uTexture:opts.texture||this.moonTexture};
    this._queue(mesh.geometry,this._material('main',this._state(opts),!!opts.wire),'mesh',uniforms);
  }
  drawFlat(batch,matrix,points=false,alpha=1) {
    if(!batch?.count)return;
    this._queue(batch.geometry,this._material('flat',this._state()),points?'points':'lines',{uMatrix:new Float32Array(matrix),uDpr:this.dpr,uAlpha:alpha,uPointMode:points?1:0});
  }
  _dynamic(kind,source,stride,attributes,uniforms,primitive='mesh',state=this._state()) {
    if(!source.length)return;
    const mat=this._material(kind,state),key=[kind,mat.id,primitive,this._layer].join(':');
    let pool=this.dynamicPools.get(key);if(!pool){pool={items:[],cursor:0};this.dynamicPools.set(key,pool);}
    const slot=pool.cursor++;let item=pool.items[slot];
    if(!item||item.buffer.array.length<source.length){
      if(item){this.geometryResources.delete(item.geometry);item.geometry.dispose();for(const [poolKey,p]of this.meshPools)if(poolKey.startsWith(item.geometry.id+':')){for(const obj of p.items)obj.removeFromParent();this.meshPools.delete(poolKey);}}
      const capacity=Math.max(stride*64,2**Math.ceil(Math.log2(source.length))),array=new Float32Array(Math.ceil(capacity/stride)*stride);
      const geometry=new THREE.BufferGeometry(),buffer=new THREE.InterleavedBuffer(array,stride);buffer.setUsage(THREE.DynamicDrawUsage);
      for(const [name,size,offset]of attributes)geometry.setAttribute(name,new THREE.InterleavedBufferAttribute(buffer,size,offset));
      geometry.setAttribute('position',geometry.getAttribute(attributes[0][0]));item={geometry,buffer};pool.items[slot]=item;this.geometryResources.add(geometry);
    }
    item.buffer.array.set(source);item.buffer.clearUpdateRanges();item.buffer.addUpdateRange(0,source.length);item.buffer.needsUpdate=true;item.geometry.setDrawRange(0,source.length/stride);
    this._queue(item.geometry,mat,primitive,uniforms);
  }
  dynamicFlat(source,points=false,alpha=1) {
    const data=Float32Array.from(source);for(let i=0;i<data.length;i+=7)for(let j=0;j<3;j++)data[i+j]=source[i+j]-this.eye[j];
    this._dynamic('flat',data,7,[['aPosition',3,0],['aColor',3,3],['aSize',1,6]],{uMatrix:new Float32Array(this.relativeVP()),uDpr:this.dpr,uAlpha:alpha,uPointMode:points?1:0},points?'points':'lines');
  }
  points(source,alpha=1){this.dynamicFlat(source,true,alpha);}
  drawRibbons(data) {
    this._dynamic('ribbon',data,9,[['p',3,0],['c',3,3],['texcoord',2,6],['a',1,8]],{vp:new Float32Array(this.relativeVP())},'mesh',{blend:true,depthWrite:false,depthTest:true,front:false});
  }
  drawImpacts(data) {
    this._dynamic('impact',data,10,[['p',3,0],['c',3,3],['texcoord',2,6],['fx',2,8]],{vp:new Float32Array(this.relativeVP())},'mesh',{blend:true,depthWrite:false,depthTest:true,front:false});
  }
  drawInstances(key,{type,index,high=false,matrices,count,ids,tint=[1,1,1]}) {
    count??=ids.length;if(!count)return;
    const id=key+':'+(high?'high':'low');let batch=this.instanceBatches.get(id);
    let entry=this.shipMeshes[index];
    if(!high){
      const name=type||this.assets?.ships?.find(s=>s.id===key.split(':').at(-1))?.id;
      const asset=this.assets?.ships?.find(s=>s.id===(name||this.assets.ships[index]?.id));
      if(asset){entry=this.lowMeshes.get(asset.id);if(!entry){entry=createGeometry(this.assets.vertices.subarray(asset.low.offset,asset.low.offset+asset.low.floatCount));this.lowMeshes.set(asset.id,entry);}}
    }
    if(!entry)return;
    if(!batch||batch.capacity<count||batch.mesh.geometry!==entry.geometry){
      if(batch){batch.mesh.removeFromParent();batch.mesh.dispose();batch.mesh.material.dispose();}
      const capacity=2**Math.ceil(Math.log2(Math.max(1,count))),mat=material(fleetVertex,fleetFragment,{vp:IDENTITY,tint});
      const mesh=new THREE.InstancedMesh(entry.geometry,mat,capacity);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.matrixAutoUpdate=false;
      batch={mesh,capacity,ids:[],idToSlot:new Map()};this.instanceBatches.set(id,batch);this.scene.add(mesh);this.geometryResources.add(entry.geometry);
    }
    batch.mesh.visible=true;batch.mesh.renderOrder=this._order++;batch.mesh.count=count;
    batch.mesh.instanceMatrix.array.set(matrices.subarray?matrices.subarray(0,count*16):matrices.slice(0,count*16));
    batch.mesh.instanceMatrix.clearUpdateRanges();batch.mesh.instanceMatrix.addUpdateRange(0,count*16);batch.mesh.instanceMatrix.needsUpdate=true;
    batch.mesh.material.uniforms.vp.value=new Float32Array(this.relativeVP());batch.mesh.material.uniforms.tint.value=tint;
    batch.ids=Array.from(ids).slice(0,count);batch.idToSlot.clear();batch.ids.forEach((shipId,slot)=>batch.idToSlot.set(shipId,slot));
  }
  drawFleetInstances(key,index,matrices,ids,opts={}) {this.drawInstances(key,{...opts,index,matrices,ids,count:ids.length,type:opts.type||key.split(':').at(-1)});}
  resetInstances(){for(const batch of this.instanceBatches.values()){batch.mesh.removeFromParent();batch.mesh.dispose();batch.mesh.material.dispose();}this.instanceBatches.clear();}
  drawSpaceSky(exposure=1) {
    if(!this.sky){
      const fallback=new THREE.DataTexture(new Uint8Array([1,2,4,1]),1,1);fallback.needsUpdate=true;this.textures.add(fallback);
      const mat=material(skyVertex,skyFragment,{image:fallback,forward:[0,0,-1],right:[1,0,0],up:[0,1,0],shift:[0,0],aspect:1,tanHalf:1,exposure:1});
      mat.depthWrite=false;mat.depthTest=false;mat.blending=THREE.NoBlending;
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('skyPosition',new THREE.Float32BufferAttribute([-1,-1,3,-1,-1,3],2));geometry.setAttribute('position',new THREE.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
      this.sky={geometry,material:mat,ready:false,error:null,draws:0,source:'HDR Multi Nebulae 2'};
      const texture=new THREE.TextureLoader().load('/opendesign/shared/assets/multi-nebulae-2-rgbm.png',()=>{if(!this.disposed)this.sky.ready=true;},undefined,error=>{if(!this.disposed)this.sky.error=String(error);});
      texture.flipY=false;texture.colorSpace=THREE.NoColorSpace;texture.wrapS=THREE.RepeatWrapping;texture.minFilter=THREE.LinearMipmapLinearFilter;this.textures.add(texture);mat.uniforms.image.value=texture;
    }
    const forward=new THREE.Vector3(...(this.cameraForward||[0,0,-1])).normalize(),right=new THREE.Vector3().crossVectors(forward,new THREE.Vector3(...(this.cameraUp||[0,1,0]))).normalize(),up=new THREE.Vector3().crossVectors(right,forward);
    this._queue(this.sky.geometry,this.sky.material,'mesh',{image:this.sky.material.uniforms.image.value,forward:forward.toArray(),right:right.toArray(),up:up.toArray(),shift:[this.projectionShiftX||0,this.projectionOffset||0],aspect:this.width/this.height,tanHalf:Math.tan((this.fov||Math.PI/3)/2),exposure});
    this.sky.draws++;
  }
  begin(time) {
    this.time=time;this.frame++;this._order=0;this._layer=0;this._blend=false;this._depthWrite=true;this._depthTest=true;this._frontSide=false;
    for(const pool of this.meshPools.values()){pool.cursor=0;for(const item of pool.items)item.visible=false;}
    for(const pool of this.dynamicPools.values())pool.cursor=0;
    for(const batch of this.instanceBatches.values()){batch.mesh.visible=false;batch.ids=[];batch.idToSlot.clear();}
    this.three.info.reset();this.three.setClearColor(0,0);this.three.clear(true,true,true);
  }
  endFrame() {
    if(this.disposed)return;
    this.three.render(this.scene,this.camera);
    if(this._layer){this.three.clearDepth();this.three.render(this.overlay,this.camera);}
    if(this.shaderErrors.length)throw new Error(this.shaderErrors.at(-1));
    this.lastStats=this.stats();return this.lastStats;
  }
  stats(){const info=this.three.info;return {backend:'three',frame:this.frame,calls:info.render.calls,triangles:info.render.triangles,points:info.render.points,lines:info.render.lines,geometries:info.memory.geometries,textures:info.memory.textures,programs:info.programs?.length||0,instances:[...this.instanceBatches.values()].reduce((n,b)=>n+(b.mesh.visible?b.mesh.count:0),0),shaderErrors:[...this.shaderErrors]};}
  getStats(){return this.stats();}
  dispose() {
    if(this.disposed)return;this.disposed=true;this.canvas.removeEventListener('webglcontextlost',this._onContextLost);
    for(const value of Object.values(this)){if(value?.geometry)this.geometryResources.add(value.geometry);if(Array.isArray(value))for(const item of value)if(item?.geometry)this.geometryResources.add(item.geometry);}
    for(const mesh of this.lowMeshes.values())this.geometryResources.add(mesh.geometry);
    this.resetInstances();for(const geometry of this.geometryResources)geometry.dispose();for(const mat of this.materials.values())mat.dispose();this.sky?.material.dispose();for(const texture of this.textures)texture.dispose();
    this.scene.clear();this.overlay.clear();this.meshPools.clear();this.dynamicPools.clear();this.materials.clear();this.geometryResources.clear();this.textures.clear();this.lowMeshes.clear();this.three.dispose();
  }
}
