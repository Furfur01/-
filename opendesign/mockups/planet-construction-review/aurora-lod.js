// Mix two live, premultiplied body layers, including their silhouettes. Both
// use the same projection and rotation. Never leave the low model underneath.
function createWorldLOD(){
 const layers=[0,1].map(()=>({target:gl.createFramebuffer(),texture:gl.createTexture(),depth:gl.createRenderbuffer()}));let width=0,height=0;
 const vs='attribute vec2 aPosition;varying vec2 uv;void main(){uv=aPosition*.5+.5;gl_Position=vec4(aPosition,0.,1.);}';
 const fs=`precision mediump float;varying vec2 uv;uniform sampler2D uLow,uHigh;uniform vec2 uPixel;uniform float uBlend,uBlur;
 void main(){vec2 d=uPixel*uBlur;vec4 high=texture2D(uHigh,uv)*.5;
 high+=(texture2D(uHigh,uv+vec2(d.x,0.))+texture2D(uHigh,uv-vec2(d.x,0.))+texture2D(uHigh,uv+vec2(0.,d.y))+texture2D(uHigh,uv-vec2(0.,d.y)))*.125;
 gl_FragColor=mix(texture2D(uLow,uv),high,uBlend);}`;
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
 const a=gl.getAttribLocation(program,'aPosition'),u={};for(const key of['uLow','uHigh','uPixel','uBlend','uBlur'])u[key]=gl.getUniformLocation(program,key);
 function begin(index){if(width!==canvas.width||height!==canvas.height){width=canvas.width;height=canvas.height;for(const l of layers){gl.bindTexture(gl.TEXTURE_2D,l.texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.bindRenderbuffer(gl.RENDERBUFFER,l.depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,width,height);gl.bindFramebuffer(gl.FRAMEBUFFER,l.target);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,l.texture,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,l.depth);}}
  gl.bindFramebuffer(gl.FRAMEBUFFER,layers[index].target);gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.blendFuncSeparate(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA,gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 }
 return {target:layers[1].target,beginLow:()=>begin(0),begin:()=>begin(1),end(blend){
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,width,height);gl.disable(gl.DEPTH_TEST);gl.depthMask(false);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(let i=0;i<gl.getParameter(gl.MAX_VERTEX_ATTRIBS);i++)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,8,0);
  layers.forEach((l,i)=>{gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,l.texture);});gl.uniform1i(u.uLow,0);gl.uniform1i(u.uHigh,1);gl.uniform2f(u.uPixel,1/width,1/height);gl.uniform1f(u.uBlend,blend);gl.uniform1f(u.uBlur,1.2*4*blend*(1-blend));
  gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,6);gl.activeTexture(gl.TEXTURE0);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);
 },dispose(){gl.deleteBuffer(buffer);gl.deleteProgram(program);for(const l of layers){gl.deleteTexture(l.texture);gl.deleteFramebuffer(l.target);gl.deleteRenderbuffer(l.depth);}}};
}
