import * as THREE from 'three';

// Render the same exterior scene before the eye-space cabin pass. The feed has
// no canvas, renderer or world of its own, and can never capture its own screen.
export class ExteriorFeed {
 constructor(){
  this.target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true});
  this.target.texture.name='world-exterior-feed';this.target.texture.colorSpace=THREE.LinearSRGBColorSpace;
  this.texture=this.target.texture;this.viewport=new THREE.Vector4();this.scissor=new THREE.Vector4();
  this.size=new THREE.Vector2();this.copyOrigin=new THREE.Vector2();this.framebuffer=null;
 }
 capture(backend,data,time){
  if(data.exteriorTexture)return data.exteriorTexture;
  const key=(data.meta?.type||data.console?.shipType||data.kind)+':'+(data.meta?.id??'');
  // The formal world has just rendered this exact camera. Reuse those pixels
  // before the cabin overlay instead of submitting the entire battle again.
  if(backend.managed&&backend.three.getRenderTarget()===null)return this.captureFramebuffer(backend.three,key,time);
  const changed=this.texture!==this.target.texture;this.texture=this.target.texture;
  const aspect=Math.max(.1,backend.width/Math.max(1,backend.height));
  const width=Math.max(1,Math.min(1024,Math.round(2048*aspect))),height=Math.max(1,Math.round(width/aspect));
  const resized=this.target.width!==width||this.target.height!==height;
  if(!changed&&!resized&&key===this.key&&time>=this.time&&time-this.time<.08)return this.texture;
  if(resized)this.target.setSize(width,height);
  const displayAspect=1024/214;
  this.texture.repeat.set(Math.min(1,displayAspect/aspect),Math.min(1,aspect/displayAspect));
  this.texture.offset.set((1-this.texture.repeat.x)/2,(1-this.texture.repeat.y)/2);
  const renderer=backend.three,previousTarget=renderer.getRenderTarget(),autoClear=renderer.autoClear,scissorTest=renderer.getScissorTest();
  renderer.getViewport(this.viewport);renderer.getScissor(this.scissor);
  try{
   renderer.setRenderTarget(this.target);renderer.setViewport(0,0,width,height);renderer.setScissorTest(false);renderer.autoClear=false;
   renderer.clear(true,true,true);renderer.render(backend.worldScene||backend.scene,backend.camera);
   this.key=key;this.time=time;
  }finally{
   renderer.setRenderTarget(previousTarget);renderer.setViewport(this.viewport);renderer.setScissor(this.scissor);renderer.setScissorTest(scissorTest);renderer.autoClear=autoClear;
  }
  return this.texture;
 }
 captureFramebuffer(renderer,key,time){
  renderer.getDrawingBufferSize(this.size);
  const width=Math.max(1,Math.floor(this.size.x)),height=Math.max(1,Math.min(Math.floor(this.size.y),Math.round(width/(1024/214))));
  const resized=!this.framebuffer||this.framebuffer.image.width!==width||this.framebuffer.image.height!==height;
  if(resized){this.framebuffer?.dispose();this.framebuffer=new THREE.FramebufferTexture(width,height);this.framebuffer.minFilter=this.framebuffer.magFilter=THREE.LinearFilter;this.framebuffer.colorSpace=THREE.NoColorSpace;this.framebuffer.name='world-exterior-copy';this.framebuffer.userData.displayEncoded=true;}
  const changed=this.texture!==this.framebuffer;this.texture=this.framebuffer;
  if(!changed&&!resized&&key===this.key&&time>=this.time&&time-this.time<.08)return this.texture;
  this.copyOrigin.set(0,Math.max(0,Math.floor((this.size.y-height)/2)));renderer.copyFramebufferToTexture(this.texture,this.copyOrigin);this.key=key;this.time=time;return this.texture;
 }
 dispose(){this.target.dispose();this.framebuffer?.dispose();}
}
