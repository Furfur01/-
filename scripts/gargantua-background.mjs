import fs from 'node:fs';
import assert from 'node:assert/strict';

// Preserve the supplied renderer; adapt only its camera/output to the flight viewport.
const source=fs.readFileSync(new URL('../models/reference/gargantua-user/gargantua.html',import.meta.url),'utf8');
const core=source.match(/const fragCore=String\.raw`([\s\S]*?)`;/)?.[1];
assert(core,'User Gargantua shader missing');
const ray='vec3 dir=normalize(fwd+right*p.x*.55/uZoom+up*p.y*.55/uZoom);';
assert(core.includes(ray));
export const gargantuaVertex='attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*.5+.5;gl_Position=vec4(aPos,0.,1.);}';
export const gargantuaFragment=core
  .replace('varyingOrIn vec2 vUv;','varying vec2 vUv;uniform vec3 uViewForward,uViewRight,uViewUp;uniform float uTanHalf,uProjectionOffset;')
  .replace(ray,`vec3 worldRay=normalize(uViewForward+uViewRight*p.x*uTanHalf+uViewUp*(p.y+uProjectionOffset)*uTanHalf);
    vec3 skyAxis=normalize(vec3(-.3,-.35,-1.)),skyRight=normalize(cross(skyAxis,vec3(0.,1.,0.))),skyUp=cross(skyRight,skyAxis);
    vec3 dir=normalize(fwd*dot(worldRay,skyAxis)+right*dot(worldRay,skyRight)+up*dot(worldRay,skyUp));`)
  .replace('fragColor=vec4(col,1.);','gl_FragColor=vec4(col,1.);');
export const gargantuaBlit='precision mediump float;varying vec2 vUv;uniform sampler2D uImage;void main(){gl_FragColor=texture2D(uImage,vUv);}';

export function drawGargantua(time){
  const gl=this.gl;
  if(!this.gargantua){
    const ray=program(gl,GARGANTUA_VERTEX,GARGANTUA_FRAGMENT),blit=program(gl,GARGANTUA_VERTEX,GARGANTUA_BLIT),buffer=gl.createBuffer(),texture=gl.createTexture(),framebuffer=gl.createFramebuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    this.gargantua={ray,blit,buffer,texture,framebuffer,width:0,height:0,position:gl.getAttribLocation(ray,'aPos'),blitPosition:gl.getAttribLocation(blit,'aPos'),image:gl.getUniformLocation(blit,'uImage'),uni:locations(gl,ray,['uResolution','uTime','uTilt','uYaw','uZoom','uSpeed','uGlow','uViewForward','uViewRight','uViewUp','uTanHalf','uProjectionOffset'])};
  }
  const g=this.gargantua,scale=Math.min(1,Math.sqrt(1500000/(this.canvas.width*this.canvas.height))),width=Math.max(1,Math.floor(this.canvas.width*scale)),height=Math.max(1,Math.floor(this.canvas.height*scale));
  gl.bindFramebuffer(gl.FRAMEBUFFER,g.framebuffer);
  if(g.width!==width||g.height!==height){
    gl.bindTexture(gl.TEXTURE_2D,g.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,g.texture,0);
    if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Gargantua render target unavailable');g.width=width;g.height=height;
  }
  const quad=(programId,position)=>{for(let i=0;i<6;i++)gl.disableVertexAttribArray(i);gl.useProgram(programId);gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);};
  gl.viewport(0,0,width,height);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.disable(gl.BLEND);quad(g.ray,g.position);
  const u=g.uni,right=V.norm(V.cross(this.cameraForward,this.cameraUp)),up=V.cross(right,this.cameraForward);
  gl.uniform2f(u.uResolution,width,height);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uTilt,23*Math.PI/180);gl.uniform1f(u.uYaw,0);gl.uniform1f(u.uZoom,1);gl.uniform1f(u.uSpeed,1);gl.uniform1f(u.uGlow,1.35);
  gl.uniform3fv(u.uViewForward,this.cameraForward);gl.uniform3fv(u.uViewRight,right);gl.uniform3fv(u.uViewUp,up);gl.uniform1f(u.uTanHalf,Math.tan(this.fov/2));gl.uniform1f(u.uProjectionOffset,this.projectionOffset||0);gl.drawArrays(gl.TRIANGLES,0,6);
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,this.canvas.width,this.canvas.height);quad(g.blit,g.blitPosition);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,g.texture);gl.uniform1i(g.image,0);gl.drawArrays(gl.TRIANGLES,0,6);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);
}
