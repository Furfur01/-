    weaponImpact(p,pos,{visual={},color=[1,.45,.08],shield=false,destroy=false,muzzle=false}={}){
      const compact=!!visual.compact,type=compact?5:muzzle?0:shield?1:destroy?3:2;
      const radius=compact?(muzzle?.2:(visual.blastRadius||.35)*(destroy?1.8:1)):muzzle?Math.max(.7,(visual.radius||.15)*5):Math.max(1.3,visual.blastRadius||2)*(destroy?3:1);
      (p.weaponImpacts??=[]).push({pos:[...pos],color:shield?[.12,.6,1]:color,type,radius,compact,elite:!!visual.elite,born:p.elapsed||0,life:compact?(destroy?.55:muzzle?.07:.15):muzzle?(visual.elite?.45:.24):destroy?2.6:shield?.65:visual.elite?1.7:1.05});
      if(p.weaponImpacts.length>180)p.weaponImpacts.splice(0,p.weaponImpacts.length-180);
    }
    drawWeaponImpacts(p){
      const gl=this.gl;
      if(!this.impactProgram){
        const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
        const program=gl.createProgram();
        gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec3 p,c;attribute vec2 uv;attribute vec2 fx;uniform mat4 vp;varying vec3 color;varying vec2 tex,effect;void main(){color=c;tex=uv;effect=fx;gl_Position=vp*vec4(p,1.);}'));
        gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`precision mediump float;
          varying vec3 color;varying vec2 tex,effect;
          void main(){float r=length(tex),t=effect.x,kind=effect.y;
            if(kind>4.5){if(r>1.)discard;gl_FragColor=vec4(color,exp(-r*r*12.)*(1.-t));return;}
            if(kind>3.5){float d=abs(tex.y),core=exp(-d*d*85.),halo=exp(-d*d*5.)*.24;
              float cap=smoothstep(0.,.012,tex.x)*smoothstep(0.,.012,1.-tex.x);
              gl_FragColor=vec4(mix(color,vec3(1.,.96,.87),core*.55),(core+halo)*t*cap);return;}
            if(r>1.)discard;
            float angle=atan(tex.y,tex.x);float cloud=.83+.10*sin(angle*7.+t*9.)+.07*sin(angle*13.-t*7.);
            float fire=exp(-r*r/(.045+t*.22))*(1.-smoothstep(cloud-.22,cloud,r));
            float shock=exp(-pow((r-(.18+t*.72))/.025,2.))*(1.-t);
            float core=exp(-r*r/(.012+t*.018))*max(0.,1.-t*2.);
            float spikes=pow(abs(cos(angle*4.)),24.)*exp(-r*4.)*(1.-t);
            float a=(fire*.85+core+shock*.6+spikes*.3)*pow(1.-t,1.3);
            vec3 hue=mix(color,vec3(1.,.84,.48),fire*.4);
            if(kind<.5){a=(exp(-r*r*18.)+spikes*.8)*(1.-t);hue=color;}
            if(kind>.5&&kind<1.5){a=(shock*.8+core*.3+fire*.2)*(1.-t);hue=color;}
            gl_FragColor=vec4(mix(hue,vec3(1.),min(1.,core+fire*.35)),a);
          }`));
        gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
        this.impactProgram=program;this.impactBuffer=gl.createBuffer();this.impactAttrs=Object.fromEntries(['p','c','uv','fx'].map(n=>[n,gl.getAttribLocation(program,n)]));this.impactVP=gl.getUniformLocation(program,'vp');
      }
      p.weaponImpacts=(p.weaponImpacts||[]).filter(e=>(p.elapsed||0)-e.born<e.life);
      if(!p.weaponImpacts.length&&!p.beams?.length&&!p.projectiles?.some(q=>q.missile))return;
      const eye=this.eye,right=V.norm(V.cross(this.cameraForward,this.cameraUp)),up=V.norm(V.cross(right,this.cameraForward)),data=[];
      const focal=this.height/(2*Math.tan(this.fov/2));
      // Missile smoke and burning motors share the practice renderer at every fleet size.
      // Screen-space width keeps curved launch paths readable from the fleet camera.
      for(const q of p.projectiles||[]){
        if(!q.missile)continue;const compact=q.visual?.compact,trail=(q.trail||[]).slice(compact?-14:-32),step=V.length(V.sub(q.pos,eye))>650?3:2;
        for(let i=step;i<trail.length;i+=step){
          const a=trail[i-step],b=trail[i],fade=i/trail.length,mid=V.scale(V.add(a,b),.5),delta=V.sub(b,a);if(V.length(delta)<.01)continue;
          const side=V.norm(V.cross(delta,V.sub(eye,mid))),pixel=V.length(V.sub(mid,eye))/focal,w=Math.max(compact?.09:.22,pixel*(compact?.55:1.05)),color=[.62,.69,.77];
          for(const [x,y]of [[0,-1],[0,1],[1,-1],[1,-1],[0,1],[1,1]])data.push(...V.add(V.sub(x?b:a,eye),V.scale(side,y*w)),...color,x,y,fade*.24,4);
        }
        const a=V.sub(q.pos,V.scale(V.norm(q.velocity),Math.min(compact?4:9,Math.max(2,q.age*45)))),b=q.pos,mid=V.scale(V.add(a,b),.5),side=V.norm(V.cross(V.sub(b,a),V.sub(eye,mid))),w=Math.max(compact?.12:.28,V.length(V.sub(mid,eye))/focal*(compact?.8:2.2));
        for(const [x,y]of [[0,-1],[0,1],[1,-1],[1,-1],[0,1],[1,1]])data.push(...V.add(V.sub(x?b:a,eye),V.scale(side,y*w)),1,.48,.12,x,y,.9,4);
      }
      // Camera-facing core + halo, like the supplied NEREID reference; no solid white tubes.
      for(const b of p.beams||[]){
        const mid=V.scale(V.add(b.start,b.end),.5),side=V.norm(V.cross(V.sub(b.end,b.start),V.sub(eye,mid)));
        const pixel=V.length(V.sub(mid,eye))/focal,w=b.compact?Math.min(pixel*2,Math.max(b.width,pixel*.65)):Math.max(b.width*3,pixel*(b.width>=2?10:b.width>=.4?6:1.5));
        const alpha=Math.min(1,(1-b.age/b.life)*4)*.9;
        for(const [x,y]of [[0,-1],[0,1],[1,-1],[1,-1],[0,1],[1,1]]){
          const pos=V.add(V.sub(x?b.end:b.start,eye),V.scale(side,y*w));data.push(...pos,...b.color,x,y,alpha,4);
        }
      }
      for(const e of p.weaponImpacts){
        const age=Math.max(0,((p.elapsed||0)-e.born)/e.life),pixel=Math.max(.001,V.length(V.sub(e.pos,eye))/focal);
        const size=Math.max(pixel*(e.compact?1:e.elite?18:6),Math.min(pixel*(e.compact?20:e.elite?260:150),e.radius*(.65+age*(e.compact?.5:1.8))));
        for(const [x,y]of [[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]]){
          const pos=V.add(V.sub(e.pos,eye),V.add(V.scale(right,x*size),V.scale(up,y*size)));
          data.push(...pos,...e.color,x,y,age,e.type);
        }
      }
      gl.depthMask(false);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
      for(let i=0;i<gl.getParameter(gl.MAX_VERTEX_ATTRIBS);i++)gl.disableVertexAttribArray(i);
      gl.useProgram(this.impactProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.impactBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
      for(const [name,size,offset]of [['p',3,0],['c',3,12],['uv',2,24],['fx',2,32]]){const a=this.impactAttrs[name];gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,size,gl.FLOAT,false,40,offset);}
      gl.uniformMatrix4fv(this.impactVP,false,new Float32Array(M.mul(this.vp,M.translate(...eye))));gl.drawArrays(gl.TRIANGLES,0,data.length/10);
      gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(true);
    }
