// Packed ship palettes are exported as sRGB, not linear light. Both individual
// hulls and fleet instances must decode them before lighting, then encode once.
export const hullShadingGLSL=`
vec3 hullLinear(vec3 srgb){
  return mix(srgb/12.92,pow((srgb+.055)/1.055,vec3(2.4)),step(vec3(.04045),srgb));
}
vec3 hullOutput(vec3 linear){
  #ifdef HULL_OUTPUT_SRGB
    // Standalone flight has no renderer-level output transform.
    return mix(linear*12.92,1.055*pow(max(linear,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),linear));
  #else
    // The shared world applies its tone mapper and sRGB output transform.
    return linear;
  #endif
}
vec3 shadeHull(vec3 palette,vec3 normal,vec3 view,vec3 light,float emission){
  vec3 base=hullLinear(palette);
  float key=max(dot(normal,light),0.);
  float fill=max(dot(normal,-light),0.);
  float highlight=pow(max(dot(normal,normalize(light+view)),0.),56.);
  vec3 lighting=vec3(.12,.145,.18)+vec3(.86,.88,.9)*key+vec3(.055,.07,.09)*fill;
  vec3 shaded=base*lighting+vec3(.035,.04,.045)*highlight;
  return mix(shaded,base*1.2,clamp(emission,0.,1.));
}
`;
