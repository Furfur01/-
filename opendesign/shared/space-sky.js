// One camera-oriented HDR sky for every native WebGL scene. No world position/parallax.
(() => {
  const base='/opendesign/shared/assets/',contexts=new WeakMap();
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);};
  function create(gl){
    if(contexts.has(gl))return contexts.get(gl);
    const webgl2=typeof gl.createVertexArray==='function',ext=webgl2?null:gl.getExtension('OES_vertex_array_object');
    const bind=vao=>webgl2?gl.bindVertexArray(vao):ext?.bindVertexArrayOES(vao);
    const vao=webgl2?gl.createVertexArray():ext?.createVertexArrayOES();
    const vs='attribute vec2 position;varying vec2 uv;void main(){uv=position;gl_Position=vec4(position,1.,1.);}';
    const fs=`precision highp float;varying vec2 uv;uniform sampler2D image;uniform vec3 forward,right,up;uniform vec2 shift;uniform float aspect,tanHalf,exposure;
      void main(){vec3 d=normalize(forward+right*(uv.x+shift.x)*aspect*tanHalf+up*(uv.y+shift.y)*tanHalf);
        vec2 st=vec2(fract(atan(d.z,d.x)/6.28318530718+.5),acos(clamp(d.y,-1.,1.))/3.14159265359);
        vec4 tex=texture2D(image,st);vec3 c=tex.rgb*tex.a*16.*exposure;
        c=clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),0.,1.);gl_FragColor=vec4(pow(c,vec3(1./2.2)),1.);}`;
    function shader(kind,text){
      if(webgl2)text='#version 300 es\n'+text.replace(/attribute/g,'in').replace(/varying/g,kind===gl.VERTEX_SHADER?'out':'in').replace(/texture2D/g,'texture').replace('void main(){',kind===gl.FRAGMENT_SHADER?'out vec4 fragColor;void main(){':'void main(){').replace(/gl_FragColor/g,'fragColor');
      const s=gl.createShader(kind);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;
    }
    const program=gl.createProgram(),vert=shader(gl.VERTEX_SHADER,vs),frag=shader(gl.FRAGMENT_SHADER,fs);
    gl.attachShader(program,vert);gl.attachShader(program,frag);gl.linkProgram(program);gl.deleteShader(vert);gl.deleteShader(frag);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
    const u=Object.fromEntries(['image','forward','right','up','shift','aspect','tanHalf','exposure'].map(n=>[n,gl.getUniformLocation(program,n)]));
    const position=gl.getAttribLocation(program,'position'),buffer=gl.createBuffer(),texture=gl.createTexture();
    const oldBuffer=gl.getParameter(gl.ARRAY_BUFFER_BINDING),oldTexture=gl.getParameter(gl.TEXTURE_BINDING_2D);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,oldBuffer);
    gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([1,2,4,1]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.bindTexture(gl.TEXTURE_2D,oldTexture);
    const state={ready:false,error:null,draws:0,source:'HDR Multi Nebulae 2',textureUrl:base+'multi-nebulae-2-rgbm.png'};
    const image=new Image();image.onload=()=>{
      if(gl.isContextLost())return;
      const previous=gl.getParameter(gl.TEXTURE_BINDING_2D),flip=gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL),color=gl.getParameter(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL),premult=gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
      gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,gl.NONE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,flip);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,premult);gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL,color);gl.bindTexture(gl.TEXTURE_2D,previous);state.ready=true;
    };image.onerror=()=>{state.error='星空贴图加载失败';console.error(state.error,state.textureUrl);};image.src=state.textureUrl;
    state.draw=({forward,up=[0,1,0],fov=Math.PI/3,aspect=gl.canvas.width/gl.canvas.height,shift=[0,0],exposure=1}={})=>{
      const previous={program:gl.getParameter(gl.CURRENT_PROGRAM),buffer:gl.getParameter(gl.ARRAY_BUFFER_BINDING),active:gl.getParameter(gl.ACTIVE_TEXTURE),depth:gl.isEnabled(gl.DEPTH_TEST),blend:gl.isEnabled(gl.BLEND),cull:gl.isEnabled(gl.CULL_FACE),mask:gl.getParameter(gl.DEPTH_WRITEMASK),vao:vao?gl.getParameter(webgl2?gl.VERTEX_ARRAY_BINDING:ext.VERTEX_ARRAY_BINDING_OES):null};
      // VAOs isolate sky attributes from the ship/terrain instancing layouts.
      bind(vao);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      gl.activeTexture(gl.TEXTURE0);const previousTexture=gl.getParameter(gl.TEXTURE_BINDING_2D);gl.bindTexture(gl.TEXTURE_2D,texture);
      const f=norm(forward),r=norm(cross(f,up)),v=cross(r,f);
      gl.uniform3fv(u.forward,f);gl.uniform3fv(u.right,r);gl.uniform3fv(u.up,v);gl.uniform2fv(u.shift,shift);gl.uniform1f(u.aspect,aspect);gl.uniform1f(u.tanHalf,Math.tan(fov/2));gl.uniform1f(u.exposure,exposure);gl.uniform1i(u.image,0);
      gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.depthMask(false);gl.drawArrays(gl.TRIANGLES,0,3);state.draws++;
      gl.bindTexture(gl.TEXTURE_2D,previousTexture);gl.activeTexture(previous.active);bind(previous.vao);gl.bindBuffer(gl.ARRAY_BUFFER,previous.buffer);gl.useProgram(previous.program);
      for(const [flag,on]of [[gl.DEPTH_TEST,previous.depth],[gl.BLEND,previous.blend],[gl.CULL_FACE,previous.cull]])on?gl.enable(flag):gl.disable(flag);gl.depthMask(previous.mask);
    };
    state.dispose=()=>{image.onload=null;gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);if(webgl2)gl.deleteVertexArray(vao);else if(vao)ext.deleteVertexArrayOES(vao);contexts.delete(gl);};
    contexts.set(gl,state);return state;
  }
  globalThis.SpaceSky={create,inspect:gl=>contexts.get(gl),panorama:base+'multi-nebulae-2.webp',name:'HDR Multi Nebulae 2'};
})();
