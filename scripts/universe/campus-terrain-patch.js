import * as THREE from 'three';
import {districtHeightField,districtPatchBoundary,DISTRICT_PATCH} from './aurora-district-layout.js';
import {createTerrainMaterial} from './continuous-planets/materials.js';

// The campus and its roads share this two-unit triangulation. Only the outer
// geological apron follows the planet's current LOD, including its geomorph.
export function createCampusTerrainPatch(site,field,{radius,biome}){
  const model= districtHeightField(site.id),origin=new THREE.Vector3(...site.position),normal=new THREE.Vector3(...site.normal),right=new THREE.Vector3(...site.right),back=new THREE.Vector3(...site.forward).negate();
  const axis=inner=>{const a=[];for(let x=-132;x< -inner;x+=8)a.push(x);for(let x=-inner;x<=inner;x+=2)a.push(x);for(let x=inner+8;x<132;x+=8)a.push(x);a.push(132);return a;},xs=axis(84),zs=axis(76),positions=[],colors=[],hints=[],seams=[];
  const point=new THREE.Vector3(),direction=new THREE.Vector3(),smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
  for(const z of zs)for(const x of xs){
    let y=model.surfaceHeight(x+80,z+70);
    if(Math.abs(x)>82||Math.abs(z)>74)for(let k=0;k<4;k++){point.copy(origin).addScaledVector(right,x*site.unit).addScaledVector(back,z*site.unit).addScaledVector(normal,y*site.unit);direction.copy(point).normalize();y=(direction.dot(normal)*radius*(1+field.height(direction.x,direction.y,direction.z))-origin.length())/site.unit;}
    point.copy(origin).addScaledVector(right,x*site.unit).addScaledVector(back,z*site.unit).addScaledVector(normal,y*site.unit);direction.copy(point).normalize();const sample=field.sample(direction.x,direction.y,direction.z),index=positions.length/3;
    colors.push(...sample.color);hints.push(sample.lava||0,sample.crystal||0);point.sub(origin);positions.push(...point.toArray());
    const weight=smooth(Math.max((Math.abs(x)-84)/48,(Math.abs(z)-76)/56));
    if(weight>0){const angle=Math.atan2(z,x/DISTRICT_PATCH.aspect),edge=districtPatchBoundary(angle);direction.copy(origin).addScaledVector(right,Math.cos(angle)*edge*DISTRICT_PATCH.aspect*site.unit).addScaledVector(back,Math.sin(angle)*edge*site.unit).normalize();seams.push({index,weight,direction:direction.clone(),base:point.clone(),fallback:field.height(direction.x,direction.y,direction.z)*radius});}
  }
  const indices=[];for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++){const a=j*xs.length+i,b=a+1,c=a+xs.length,d=c+1;indices.push(a,c,b,b,c,d);}
  const geometry=new THREE.BufferGeometry(),position=new THREE.Float32BufferAttribute(positions,3);geometry.setAttribute('position',position);geometry.setIndex(indices);geometry.computeVertexNormals();geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('aHints',new THREE.Float32BufferAttribute(hints,2));geometry.setAttribute('aCoarse',position);geometry.setAttribute('aCoarseNormal',geometry.attributes.normal);geometry.setAttribute('aEdge',new THREE.Float32BufferAttribute(new Float32Array(position.count*4),4));geometry.computeBoundingSphere();geometry.boundingSphere.radius+=radius*.04;
  // A private material deliberately has no campus cutouts: only the underlying
  // global surface is masked, so there is exactly one surface under each road.
  const material=createTerrainMaterial(THREE,biome,radius),mesh=new THREE.Mesh(geometry,material);mesh.name=`campus-terrain/${site.id}`;mesh.position.copy(origin);material.uniforms.uOrigin.value.copy(origin);
  let disposed=false;
  return {mesh,update({renderedHeight,eye,sun,time}){if(disposed)return;material.uniforms.uEye.value.copy(eye);material.uniforms.uSun.value.copy(sun);material.uniforms.uTime.value=time;for(const s of seams){const height=renderedHeight(s.direction)??s.fallback;point.copy(s.direction).multiplyScalar(radius+height+.03*site.unit).sub(origin).lerp(s.base,1-s.weight);position.setXYZ(s.index,point.x,point.y,point.z);}position.needsUpdate=true;},dispose(){if(disposed)return;disposed=true;mesh.removeFromParent();geometry.dispose();material.dispose();}};
}
