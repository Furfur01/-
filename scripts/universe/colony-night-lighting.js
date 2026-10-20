// Night effects extend the supplied CONTINUUM materials without replacing any
// model geometry. One uniform animates the entire installation through twilight.
const CONTINUUM_GLASS=3428190;
const clamp=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;

export function installColonyNightMaterials({THREE:T,root,palette={}}){
  const uniforms={nightStrength:{value:0},windowColor:{value:new T.Color(palette.glass??CONTINUUM_GLASS)}};
  const materials=new Map(),releases=[];
  root.traverse(object=>{
    for(const material of Array.isArray(object.material)?object.material:[object.material]){
      if(!material?.isMeshStandardMaterial)continue;
      const lamp=object.name.endsWith('/ lamp')||material.emissiveIntensity>0&&material.emissive?.getHex()!==0;
      materials.set(material,Boolean(materials.get(material)||lamp));
    }
  });
  for(const [material,lamp] of materials){
    const originalCompile=material.onBeforeCompile,originalCache=material.customProgramCacheKey,baseKey=originalCache.call(material);
    material.onBeforeCompile=function(shader,renderer){
      originalCompile.call(this,shader,renderer);
      shader.uniforms.uColonyNight=uniforms.nightStrength;
      shader.uniforms.uColonyGlass=uniforms.windowColor;
      shader.uniforms.uColonyLamp={value:lamp?1:0};
      shader.vertexShader='varying vec3 vColonyLightPosition;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        vec4 colonyPosition=vec4(position,1.0);
        #ifdef USE_INSTANCING
          colonyPosition=instanceMatrix*colonyPosition;
        #endif
        vColonyLightPosition=colonyPosition.xyz;`);
      shader.fragmentShader=`uniform float uColonyNight;
        uniform float uColonyLamp;
        uniform vec3 uColonyGlass;
        varying vec3 vColonyLightPosition;
        float colonyRoomHash(vec3 cell){return fract(sin(dot(cell,vec3(12.9898,78.233,37.719)))*43758.5453);}
        `+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
        #ifdef USE_COLOR
          // Match the source's actual glazing color. Solar panels, water and
          // opaque walls share materials in some batches but remain unlit.
          float colonyWindow=1.0-smoothstep(0.002,0.012,distance(vColor.rgb,uColonyGlass));
          float colonyOccupancy=colonyRoomHash(floor(vColonyLightPosition*vec3(1.8,3.2,1.8)));
          float colonyRoom=step(0.23,colonyOccupancy)*mix(0.38,1.0,colonyOccupancy);
          vec3 colonyWarm=mix(vec3(1.0,0.48,0.18),vec3(1.0,0.79,0.47),colonyOccupancy);
          totalEmissiveRadiance+=uColonyNight*(colonyWindow*colonyRoom*colonyWarm*1.45+uColonyLamp*vColor.rgb*5.0);
        #endif`);
      // There is no global shadow map in the continuous world. The planet must
      // still block sunlight arriving beneath the local horizon on its dark side.
      shader.fragmentShader=shader.fragmentShader.replace(
        'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
        'vec3 outgoingLight = (totalDiffuse + totalSpecular) * mix(1.0,0.16,uColonyNight) + totalEmissiveRadiance;'
      );
    };
    material.customProgramCacheKey=()=>baseKey+'|continuum-night-v1';
    material.needsUpdate=true;
    releases.push(()=>{material.onBeforeCompile=originalCompile;material.customProgramCacheKey=originalCache;material.needsUpdate=true;});
  }
  let disposed=false;
  return {uniforms,materialCount:materials.size,
    update(strength=0){if(disposed)return;uniforms.nightStrength.value=clamp(strength);root.userData.nightStrength=uniforms.nightStrength.value;},
    dispose(){if(disposed)return;disposed=true;for(const release of releases)release();materials.clear();}
  };
}

/** Soft ground illumination uses a single instanced batch, not point lights.
 * Each pool is [x,y,z,radiusX,radiusZ,color?] in the supplied parent's coordinates.
 */
export function createColonyLightPools({THREE:T,parent,pools=[]}){
  const geometry=new T.PlaneGeometry(2,2).rotateX(-Math.PI/2);
  const material=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:1,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const strength={value:0};
  material.onBeforeCompile=shader=>{
    shader.uniforms.uColonyPoolStrength=strength;
    shader.vertexShader='varying vec2 vColonyPoolUv;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvColonyPoolUv=uv*2.0-1.0;');
    shader.fragmentShader='uniform float uColonyPoolStrength;\nvarying vec2 vColonyPoolUv;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float colonyFalloff=max(0.0,1.0-dot(vColonyPoolUv,vColonyPoolUv));
      diffuseColor.a*=colonyFalloff*colonyFalloff*uColonyPoolStrength*0.34;
      #include <opaque_fragment>`);
  };
  material.customProgramCacheKey=()=> 'continuum-light-pool-v1';
  const mesh=new T.InstancedMesh(geometry,material,pools.length),matrix=new T.Matrix4(),rotation=new T.Quaternion(),position=new T.Vector3(),scale=new T.Vector3();
  mesh.name='CONTINUUM night / soft plaza and road illumination';mesh.renderOrder=2;
  pools.forEach(([x,y,z,rx,rz,color=0xffb96d],i)=>{matrix.compose(position.set(x,y,z),rotation,scale.set(rx,1,rz));mesh.setMatrixAt(i,matrix);mesh.setColorAt(i,new T.Color(color));});
  mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.visible=false;parent.add(mesh);
  let disposed=false;
  return {mesh,uniform:strength,count:pools.length,
    update(value=0,visible=true){if(disposed)return;strength.value=clamp(value);mesh.visible=visible&&strength.value>.001;},
    dispose(){if(disposed)return;disposed=true;mesh.removeFromParent();mesh.dispose();geometry.dispose();material.dispose();}
  };
}
