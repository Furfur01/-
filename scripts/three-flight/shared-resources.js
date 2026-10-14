import * as THREE from 'three';

// One vertex layout for the model exporter, full hulls, articulated parts and LODs.
export function geometryFromNative(data){
  const geometry=new THREE.BufferGeometry();
  const interleaved=new THREE.InterleavedBuffer(data instanceof Float32Array?data:new Float32Array(data),13);
  for(const [name,size,offset] of [['aPosition',3,0],['aNormal',3,3],['aColor',3,6],['aEmission',1,9],['aTag',1,10],['aUV',2,11]]){
    geometry.setAttribute(name,new THREE.InterleavedBufferAttribute(interleaved,size,offset));
  }
  geometry.setAttribute('position',geometry.getAttribute('aPosition'));
  geometry.computeBoundingSphere();return geometry;
}

export function createAdditiveMaterial(color,opacity=1){
  return new THREE.MeshBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
}

export function createVisualShaderMaterial(vertexShader,fragmentShader,uniforms,options={}){
  const {raw=true,...settings}=options;
  const Material=raw?THREE.RawShaderMaterial:THREE.ShaderMaterial;
  return new Material({vertexShader,fragmentShader,uniforms,side:THREE.DoubleSide,toneMapped:false,...settings});
}

export function disposeObjectResources(root,{geometries=true,materials=true}={}){
  const geometrySet=new Set(),materialSet=new Set(),textures=new Set();
  root.traverse(object=>{
    if(object.isInstancedMesh)object.dispose();
    if(geometries&&object.geometry)geometrySet.add(object.geometry);
    if(materials)for(const material of Array.isArray(object.material)?object.material:object.material?[object.material]:[])materialSet.add(material);
  });
  for(const geometry of geometrySet)geometry.dispose();
  for(const material of materialSet){for(const value of Object.values(material))if(value?.isTexture)textures.add(value);material.dispose();}
  if(geometries)for(const texture of textures)texture.dispose();
}
