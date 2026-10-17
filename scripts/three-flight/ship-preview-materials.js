// Match the bounded armor priority used by the flight renderer. Coplanar light
// plating must consistently win over dark backing, including vertex-colored hulls.
// Apply after loading/cloning: GLTF and Material.clone() do not retain shader hooks.
const prepared=new WeakSet();

export function prepareShipPreviewMaterials(root){
  root.traverse(object=>{
    if(!object.isMesh)return;
    for(const material of Array.isArray(object.material)?object.material:[object.material]){
      if(!material?.isMeshStandardMaterial||material.transparent||!material.depthWrite||prepared.has(material))continue;
      prepared.add(material);
      const compile=material.onBeforeCompile,programKey=material.customProgramCacheKey();
      const surfaceColor=material.color.clone().convertLinearToSRGB();
      material.onBeforeCompile=function(shader,renderer){
        compile.call(this,shader,renderer);
        shader.uniforms.shipSurfaceColor={value:surfaceColor};
        shader.vertexShader='uniform vec3 shipSurfaceColor;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
          vec3 shipSurface = shipSurfaceColor;
          #if defined(USE_COLOR) || defined(USE_COLOR_ALPHA) || defined(USE_INSTANCING_COLOR) || defined(USE_BATCHING_COLOR)
            shipSurface *= vColor.rgb;
          #endif
          float shipLayer = 1. + floor(clamp(dot(shipSurface, vec3(.2126, .7152, .0722)), 0., 1.) * 15. + .5);
          gl_Position.z -= shipLayer * (2. / 16777216.) * gl_Position.w;
        `);
      };
      material.customProgramCacheKey=()=>programKey+'|ship-preview-depth-v1';
      material.needsUpdate=true;
    }
  });
  return root;
}
