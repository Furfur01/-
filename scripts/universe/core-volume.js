import * as T from 'three';
import {fullscreenVertex,volumeFragment,temporalFragment,compositeFragment} from './core-volume-shaders.js';
import {burstLength} from './core-burst.js';

const SCALE=2400,CENTER=new T.Vector3(7,2,-2);
const uniform=value=>({value});
const smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);

// One volume/pass owner, using the world's renderer and visual clock. Events do
// not create targets, encounters, timers, labels or persistent gameplay state.
export function createCoreVolume({signal,burst,blackHole}){
 const resources=new Set(),own=r=>(resources.add(r),r);
 const uniforms={tDensity:uniform(null),tNoise:uniform(null),tDepth:uniform(null),uInvProjection:uniform(new T.Matrix4()),uCameraWorld:uniform(new T.Matrix4()),uCamera:uniform(new T.Vector3()),uTime:uniform(0),uFrame:uniform(0),uReveal:uniform(0),uFar:uniform(1),uCut:uniform(new T.Vector4(0,1,0,1)),uShape:uniform(new T.Vector3(100000/SCALE,.64,Math.cos(Math.PI*.29))),uFlash:uniform(new T.Vector4(0,0,0,0)),uLens:uniform(new T.Vector4(0,0,0,0)),uBurst:uniform(new T.Vector4(0,0,0,0)),uBurstDirection:uniform(new T.Vector3(1,0,0))};
 const material=(fragmentShader,uniforms,glslVersion=null)=>own(new T.ShaderMaterial({vertexShader:fullscreenVertex,fragmentShader,uniforms,glslVersion,depthTest:false,depthWrite:false,blending:T.NoBlending}));
 uniforms.uBurstLength=uniform(0);uniforms.uBurstAge=uniform(0);
 uniforms.tBlackHoleDepth=uniform(null);uniforms.uBlackHoleViewDepth=uniform(0);
 const volume=material(volumeFragment,uniforms,T.GLSL3);
 const temporal=material(temporalFragment,{tCurrent:uniform(null),tHistory:uniform(null),tFrontCurrent:uniform(null),tFrontHistory:uniform(null),uHistory:uniform(0)},T.GLSL3);
 const composite=material(compositeFragment,{tScene:uniform(null),tSceneDepth:uniform(null),tVolume:uniform(null),tFrontVolume:uniform(null),tBlackHole:uniform(null),tBlackHoleDepth:uniform(null),tBlackHoleLens:uniform(null),uLensScreen:uniform(new T.Vector4(0,0,0,0)),uAspect:uniform(1)});
 const passScene=new T.Scene(),passCamera=new T.Camera();
 // One ray-march variant writes both the hole and its background displacement.
 const holeMaterial=own(blackHole.material.clone());
 holeMaterial.uniforms={...blackHole.material.uniforms,uViewRotation:uniform(new T.Matrix3())};
 holeMaterial.defines={BLACK_HOLE_LAYER:1};holeMaterial.glslVersion=T.GLSL3;holeMaterial.blending=T.NoBlending;
 const blackHoleScene=new T.Scene(),blackHoleLayer=new T.Mesh(blackHole.geometry,holeMaterial);
 blackHoleLayer.matrixAutoUpdate=false;blackHoleLayer.frustumCulled=false;blackHoleScene.add(blackHoleLayer);
 const triangle=own(new T.BufferGeometry());triangle.setAttribute('position',new T.Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
 const quad=new T.Mesh(triangle,volume);quad.frustumCulled=false;passScene.add(quad);
 const target=(depth,count=1)=>own(new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:depth,stencilBuffer:false,count}));
 const sceneTarget=target(true),blackHoleTarget=target(true,2),volumeTarget=target(false,2),history=[target(false,2),target(false,2)];
 const emptyFog=own(new T.DataTexture(new Uint8Array([0,0,0,255]),1,1));emptyFog.needsUpdate=true;
 sceneTarget.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
 blackHoleTarget.depthTexture=new T.DepthTexture(1,1,T.UnsignedIntType);
 let disposed=false,loaded=false,active=false,lastTime=null,clock=0,frame=0,historyIndex=0,historyFrames=0;
 const candidates=[],origin=new T.Vector3(),projected=new T.Vector3(),lensWorld=new T.Vector3(),blackHoleView=new T.Vector3(),size=new T.Vector2(),previousMatrix=new T.Matrix4(),viewProjection=new T.Matrix4();
 const viewport=new T.Vector4(),scissor=new T.Vector4(),clearColor=new T.Color();
 const events=[{name:'uFlash',next:2+Math.random()*3,duration:2.8,min:6,range:9},{name:'uLens',next:8+Math.random()*4,duration:7,min:17,range:19},{name:'uBurst',next:17+Math.random()*5,duration:10,min:26,range:23}];
 const ready=fetch('/opendesign/mockups/galactic-command/assets/nebula/azure-rift-density.bin.gz',{signal}).then(async response=>{
  if(!response.ok)throw Error(`星云体积数据 HTTP ${response.status}`);
  const raw=new Uint8Array(await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
  if(disposed)return;
  if(raw.length!==320*192*192*4)throw Error('星云体积数据长度不匹配');
  const density=own(new T.Data3DTexture(raw,320,192,192));density.format=T.RGBAFormat;density.type=T.UnsignedByteType;density.minFilter=density.magFilter=T.LinearFilter;density.unpackAlignment=1;density.needsUpdate=true;uniforms.tDensity.value=density;
  // Sample actual gas, so anomalies don't light arbitrary empty coordinates.
  for(let z=16;z<176;z+=8)for(let y=16;y<176;y+=8)for(let x=16;x<304;x+=8){const index=((z*192+y)*320+x)*4;if(raw[index]>20&&raw[index+2]>16&&raw[index+1]<90)candidates.push(new T.Vector3(x/319*76-38,y/191*48-24,z/191*48-24));}
  let seed=96271;const bytes=new Uint8Array(48**3);for(let i=0;i<bytes.length;i++){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;bytes[i]=(seed>>>0)&255;}
  const noise=own(new T.Data3DTexture(bytes,48,48,48));noise.format=T.RedFormat;noise.minFilter=noise.magFilter=T.LinearFilter;noise.wrapS=noise.wrapT=noise.wrapR=T.RepeatWrapping;noise.unpackAlignment=1;noise.needsUpdate=true;uniforms.tNoise.value=noise;loaded=true;
 });
 function selectEventPosition(camera){
  const cut=uniforms.uCut.value;
  const visible=candidates.filter(p=>{
   projected.copy(p).sub(CENTER);
   if(cut.x>.5&&projected.y*cut.w>0&&projected.x*cut.y+projected.z*cut.z>Math.hypot(projected.x,projected.z)*(uniforms.uShape.value.z-.025))return false;
   projected.multiplyScalar(SCALE).sub(origin).project(camera);
   return Math.abs(projected.x)<.8&&Math.abs(projected.y)<.8&&projected.z<1;
  });
  return visible.length?visible[Math.floor(Math.random()*visible.length)]:null;
 }
 function update({time,eye,origin:offset,camera}){
  const delta=lastTime===null?0:Math.max(0,Math.min(.1,time-lastTime));lastTime=time;origin.fromArray(offset);
  const distance=Math.hypot(...eye),reveal=(1-smooth(320000,1300000,distance))*smooth(6000,28000,distance);
  active=loaded&&reveal>.003;
  uniforms.uReveal.value=reveal;uniforms.uTime.value=time;uniforms.uCamera.value.fromArray(eye).divideScalar(SCALE).add(CENTER);uniforms.uCameraWorld.value.copy(camera.matrixWorld);uniforms.uInvProjection.value.copy(camera.projectionMatrixInverse);uniforms.uFar.value=camera.far;
  burst.hide();
  if(!active){historyFrames=0;return;}
  clock+=delta;
  for(const event of events){
   const value=uniforms[event.name].value;
   if(event.start===undefined&&clock>=event.next){
    const p=selectEventPosition(camera);
    if(p){value.set(p.x,p.y,p.z,0);event.start=clock;if(event.name==='uBurst')uniforms.uBurstDirection.value.set(Math.random()-.5,(Math.random()-.5)*.65,Math.random()-.5).normalize();}
    else event.next=clock+2;
   }
   if(event.start!==undefined){
    const age=(clock-event.start)/event.duration;
    if(age>=1){value.w=0;event.start=undefined;event.next=clock+event.min+Math.random()*event.range;}
    else {
     const isBurst=event.name==='uBurst',envelope=smooth(0,isBurst?.10:.20,age)*(1-smooth(isBurst?.62:.45,1,age));value.w=envelope*(event.name==='uFlash'?.75+.25*Math.sin(age*23.)**2:1);
     if(isBurst){uniforms.uBurstLength.value=burstLength(age)/SCALE;uniforms.uBurstAge.value=age;burst.update({position:value,direction:uniforms.uBurstDirection.value,age,strength:value.w,time,reveal});}
    }
   }
  }
 }
 function setCoreCut({open,angle,hemisphere,radius,flat,half}){uniforms.uCut.value.set(open,Math.cos(angle),Math.sin(angle),hemisphere);uniforms.uShape.value.set(radius/SCALE,flat,Math.cos(half));}
 function render(renderer,scene,camera,{core=true}={}){
  if(!core||(!active&&!blackHole.visible)){burst.hide();historyFrames=0;renderer.render(scene,camera);return;}
  renderer.getDrawingBufferSize(size);
  const width=size.x,height=size.y,scale=Math.min(.65,1152/width),w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
  if(sceneTarget.width!==width||sceneTarget.height!==height){sceneTarget.setSize(width,height);blackHoleTarget.setSize(width,height);volumeTarget.setSize(w,h);history.forEach(t=>t.setSize(w,h));historyFrames=0;}
  viewProjection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  const moving=viewProjection.elements.some((v,i)=>Math.abs(v-previousMatrix.elements[i])>1e-5);previousMatrix.copy(viewProjection);
  if(moving)historyFrames=0;
  const previousTarget=renderer.getRenderTarget(),toneMapping=renderer.toneMapping,scissorTest=renderer.getScissorTest(),alpha=renderer.getClearAlpha(),blackHoleVisible=blackHole.visible;
  renderer.getViewport(viewport);renderer.getScissor(scissor);renderer.getClearColor(clearColor);
  try{
   renderer.setScissorTest(false);renderer.toneMapping=T.NoToneMapping;
   blackHole.visible=false;
   renderer.setRenderTarget(sceneTarget);renderer.clear(true,true,true);renderer.render(scene,camera);
   blackHole.visible=blackHoleVisible;blackHoleLayer.visible=blackHoleVisible;blackHoleLayer.matrix.copy(blackHole.matrixWorld);
   holeMaterial.uniforms.uViewRotation.value.setFromMatrix4(camera.matrixWorldInverse);
   renderer.setRenderTarget(blackHoleTarget);renderer.setClearColor(0,0);renderer.clear(true,true,true);renderer.render(blackHoleScene,camera);renderer.setClearColor(clearColor,alpha);
   const pass=(mat,target)=>{quad.material=mat;renderer.setRenderTarget(target);renderer.render(passScene,passCamera);};
   uniforms.tDepth.value=sceneTarget.depthTexture;uniforms.tBlackHoleDepth.value=blackHoleTarget.depthTexture;
   uniforms.uBlackHoleViewDepth.value=-blackHoleView.setFromMatrixPosition(blackHole.matrixWorld).applyMatrix4(camera.matrixWorldInverse).z;uniforms.uFrame.value=frame++;
   if(active){
    pass(volume,volumeTarget);
    temporal.uniforms.tCurrent.value=volumeTarget.texture;temporal.uniforms.tHistory.value=history[1-historyIndex].texture;
    temporal.uniforms.tFrontCurrent.value=volumeTarget.textures[1];temporal.uniforms.tFrontHistory.value=history[1-historyIndex].textures[1];
    temporal.uniforms.uHistory.value=historyFrames?Math.min(.78,historyFrames/(historyFrames+1)):0;
    pass(temporal,history[historyIndex]);historyFrames++;
   }else historyFrames=0;
   composite.uniforms.tScene.value=sceneTarget.texture;composite.uniforms.tSceneDepth.value=sceneTarget.depthTexture;composite.uniforms.tVolume.value=active?history[historyIndex].texture:emptyFog;composite.uniforms.tFrontVolume.value=active?history[historyIndex].textures[1]:emptyFog;
   composite.uniforms.tBlackHole.value=blackHoleTarget.texture;composite.uniforms.tBlackHoleDepth.value=blackHoleTarget.depthTexture;composite.uniforms.tBlackHoleLens.value=blackHoleTarget.textures[1];composite.uniforms.uAspect.value=width/height;
   const lens=uniforms.uLens.value,lensScreen=composite.uniforms.uLensScreen.value;
   lensWorld.set(lens.x,lens.y,lens.z).sub(CENTER).multiplyScalar(SCALE).sub(origin);projected.copy(lensWorld).project(camera);
   const radius=3.6*SCALE*camera.projectionMatrix.elements[5]/Math.max(1,lensWorld.distanceTo(camera.position))*.5;
   lensScreen.set(projected.x*.5+.5,projected.y*.5+.5,radius,active&&projected.z<1?lens.w*uniforms.uReveal.value:0);
   renderer.toneMapping=toneMapping;renderer.setRenderTarget(previousTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);quad.material=composite;renderer.render(passScene,passCamera);
   historyIndex=1-historyIndex;
  }finally{blackHole.visible=blackHoleVisible;renderer.toneMapping=toneMapping;renderer.setRenderTarget(previousTarget);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.setClearColor(clearColor,alpha);}
 }
 return {ready,update,setCoreCut,render,dispose(){disposed=true;resources.forEach(r=>r.dispose());resources.clear();candidates.length=0;}};
}
