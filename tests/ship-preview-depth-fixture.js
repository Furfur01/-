import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {prepareShipPreviewMaterials} from '../scripts/three-flight/ship-preview-materials.js';

// Real GPU coverage for both GLTF materials and the merged, vertex-colored hulls.
window.verifyPreviewDepth=()=>{
  const renderer=new THREE.WebGLRenderer({antialias:false});
  renderer.setSize(96,96);renderer.setClearColor(0);renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
  const target=new THREE.WebGLRenderTarget(96,96),pixels=new Uint8Array(16*16*4),results=[];
  const material=color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1,roughness:1});
  try{
    for(const type of ['perspective','orthographic'])for(const vertexColors of [false,true])for(const reversed of [false,true])for(const separated of [false,true]){
      const scene=new THREE.Scene(),root=new THREE.Group(),white=material(0xffffff),dark=material(0x101010);
      const planes=[new THREE.Mesh(new THREE.PlaneGeometry(4,4).toNonIndexed(),white),new THREE.Mesh(new THREE.PlaneGeometry(4,4).toNonIndexed(),dark)];
      if(separated)planes[1].geometry.translate(0,0,.02);
      if(reversed)planes.reverse();
      if(vertexColors){
        for(const mesh of planes){const colors=new Float32Array(mesh.geometry.attributes.position.count*3);for(let i=0;i<colors.length;i+=3)mesh.material.color.toArray(colors,i);mesh.geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));}
        const geometry=mergeGeometries(planes.map(m=>m.geometry));
        const mat=material(0xffffff);mat.vertexColors=true;
        // Emission is uniform; use ambient illumination to expose vertex colors.
        mat.emissive.set(0);scene.add(new THREE.AmbientLight(0xffffff,Math.PI));
        root.add(new THREE.Mesh(geometry,mat));
      }else{planes.forEach((mesh,i)=>{mesh.renderOrder=i;root.add(mesh);});}
      scene.add(root);prepareShipPreviewMaterials(root);
      const camera=type==='perspective'?new THREE.PerspectiveCamera(36,1,.1,200):new THREE.OrthographicCamera(-2,2,2,-2,.1,500);
      let worst=separated?0:255;
      for(const angle of [-.7,-.2,0,.2,.7])for(const distance of [8,22]){
        camera.position.set(Math.sin(angle)*distance,.2,Math.cos(angle)*distance);camera.lookAt(0,0,0);
        renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.readRenderTargetPixels(target,40,40,16,16,pixels);
        for(let i=0;i<pixels.length;i+=4)worst=separated?Math.max(worst,pixels[i]):Math.min(worst,pixels[i]);
      }
      results.push({type,vertexColors,reversed,separated,worst,passed:separated?worst<40:worst>200});
      const geometries=new Set(),materials=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
      for(const mesh of planes){geometries.add(mesh.geometry);materials.add(mesh.material);}
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
    }
    return results;
  }finally{target.dispose();renderer.dispose();}
};
