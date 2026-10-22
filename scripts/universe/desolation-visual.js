import * as T from 'three';

// Applied to the existing AURORA terrain: continental boundaries, oceans and
// relief retain their original seed and geometry after irradiation.
export function createDesolationVisual(kind){
 const uniforms={ruin:{value:1},heat:{value:0},kind:{value:{laser:0,missile:1,accelerator:2}[kind]}};
 const declarations='varying vec3 vRuinPoint; uniform float ruin,heat,kind;';
 const shade=`
 vec3 rn=normalize(vRuinPoint);
 float seam=abs(sin(rn.x*33.+sin(rn.z*19.)*2.)*sin(rn.y*28.+sin(rn.x*17.)*1.7));
 float crack=1.-smoothstep(.015,.045,seam);
 if(kind<1.5){
   float relief=dot(gl_FragColor.rgb,vec3(.21,.72,.07));
   vec3 crust=kind<.5?vec3(.022,.030,.038):vec3(.041,.033,.029);
   gl_FragColor.rgb=mix(gl_FragColor.rgb,crust*(.55+relief*1.4)*(1.-crack*.85),ruin);
   gl_FragColor.rgb+=vec3(1.8,.31,.025)*crack*heat*(kind<.5?1.:.65);
 }else{
   float grey=dot(gl_FragColor.rgb,vec3(.21,.72,.07));
   gl_FragColor.rgb=mix(gl_FragColor.rgb,mix(gl_FragColor.rgb,vec3(grey*.65,grey*.77,grey*.86),.86)*.6,ruin);
 }
 `;
 function apply(root){root.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){
  if(!m||m.userData.desolation)continue;m.userData.desolation=true;
  if(m.isShaderMaterial){
   // Clouds, atmospheric scattering and rings fade after surface sterilisation.
   m.uniforms.ruin=uniforms.ruin;m.vertexShader='varying vec3 vRuinPoint;\n'+m.vertexShader;
   m.vertexShader=m.vertexShader.replace(/void main\(\)\s*{/,'void main(){ vRuinPoint=position;');
   m.fragmentShader='uniform float ruin;\n'+m.fragmentShader;
   m.fragmentShader=m.fragmentShader.replace(/}\s*$/,'gl_FragColor.a*=1.-ruin*.92;\n}');
  }else if(m.isMeshStandardMaterial){
   if(kind==='laser'){m.roughness=.26;m.metalness=.32;}else if(kind==='missile'){m.roughness=.98;m.metalness=.04;}
   const previous=m.onBeforeCompile,cache=m.customProgramCacheKey.call(m);
   m.onBeforeCompile=(shader,renderer)=>{previous.call(m,shader,renderer);Object.assign(shader.uniforms,uniforms);
    shader.vertexShader='varying vec3 vRuinPoint;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvRuinPoint=position;');
    shader.fragmentShader=declarations+'\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\n'+shade);
   };m.customProgramCacheKey=()=>cache+'|stellar-desolation-v1';
  }m.needsUpdate=true;
 }});}
 return {apply,uniforms};
}
