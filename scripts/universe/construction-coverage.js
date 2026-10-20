import {CAPITAL_SIZE,COLONY_INDUSTRY,COLONY_ROADS} from './capital-layout.js';
import {DISTRICT_PATCH} from './aurora-district-layout.js';
// The supplied assets already own their terrain. Do not let a coarser planet
// triangle cover that detailed terrain, mine excavation or narrow connecting road.
export function coverageUniforms(T){return {
  uCampusCount:{value:0},uCampusPlanes:{value:Array.from({length:4},()=>new T.Vector2())},uCampusNormals:{value:Array.from({length:4},()=>new T.Vector3())},uCampusRights:{value:Array.from({length:4},()=>new T.Vector3())},uCampusForwards:{value:Array.from({length:4},()=>new T.Vector3())},
  uCoverPlane:{value:new T.Vector2()},uCoverNormal:{value:new T.Vector3()},uCoverRight:{value:new T.Vector3()},uCoverForward:{value:new T.Vector3()},
  uCoverRects:{value:Array.from({length:4},()=>new T.Vector4())},uCoverRoads:{value:Array.from({length:10},()=>new T.Vector4())},uCoverRoadCount:{value:0}
};}
export function createConstructionCoverage(T,config){
  const uniforms=coverageUniforms(T),c=config.capital;if(c){uniforms.uCoverPlane.value.set(config.radius+c.height,c.unit);uniforms.uCoverNormal.value.fromArray(c.normal);uniforms.uCoverRight.value.fromArray(c.right);uniforms.uCoverForward.value.fromArray(c.forward);}
  return {uniforms,setCampuses(sites=[]){uniforms.uCampusCount.value=sites.length;sites.forEach((s,i)=>{uniforms.uCampusPlanes.value[i].set(config.radius+s.height,s.unit);uniforms.uCampusNormals.value[i].fromArray(s.normal);uniforms.uCampusRights.value[i].fromArray(s.right);uniforms.uCampusForwards.value[i].fromArray(s.forward);});},update(cityVisible,active=[]){
    const rects=uniforms.uCoverRects.value;for(const r of rects)r.set(0,0,0,0);uniforms.uCoverRoadCount.value=0;if(!c)return;
    if(cityVisible){rects[0].set(0,0,CAPITAL_SIZE.width/2-.1,CAPITAL_SIZE.depth/2-.1);let i=0;for(const line of COLONY_ROADS)for(let k=1;k<line.length;k++)uniforms.uCoverRoads.value[i++].set(...line[k-1],...line[k]);uniforms.uCoverRoadCount.value=i;}
    for(const [i,id,w,d] of [[1,'Metal_Mine',58,42],[2,'Crystal_Mine',52,38],[3,'Gas_Mine',52,38]])if(active.includes(id)){const p=COLONY_INDUSTRY[id];rects[i].set(p.x,p.z,w/2-.1,d/2-.1);}
  }};
}
export const constructionCoverageGLSL=`
uniform vec2 uCoverPlane;uniform vec3 uCoverNormal,uCoverRight,uCoverForward;
uniform vec4 uCoverRects[4],uCoverRoads[10];uniform int uCoverRoadCount;
uniform int uCampusCount;uniform vec2 uCampusPlanes[4];uniform vec3 uCampusNormals[4],uCampusRights[4],uCampusForwards[4];
bool coveredByConstruction(vec3 position){
 for(int i=0;i<4;i++){if(i>=uCampusCount)break;float c=dot(position,uCampusNormals[i]);if(c<=0.)continue;vec3 p=position*(uCampusPlanes[i].x/c);vec2 q=vec2(dot(p,uCampusRights[i])/${DISTRICT_PATCH.aspect},-dot(p,uCampusForwards[i]))/uCampusPlanes[i].y;float angle=atan(q.y,q.x),edge=${DISTRICT_PATCH.radius.toFixed(1)}+${DISTRICT_PATCH.warp3.toFixed(1)}*sin(angle*3.)+${DISTRICT_PATCH.warp5.toFixed(1)}*cos(angle*5.);if(length(q)<edge-.6)return true;}
 if(uCoverPlane.y<=0.)return false;
 float facing=dot(normalize(position),uCoverNormal);if(facing<.96)return false;
 vec3 p=position*(uCoverPlane.x/dot(position,uCoverNormal));
 vec2 q=vec2(dot(p,uCoverRight),dot(p,uCoverForward))/uCoverPlane.y;
 for(int i=0;i<4;i++){vec4 r=uCoverRects[i];if(r.z>0.&&all(lessThan(abs(q-r.xy),r.zw)))return true;}
 for(int i=0;i<10;i++){if(i>=uCoverRoadCount)break;vec4 s=uCoverRoads[i];vec2 d=s.zw-s.xy;float t=clamp(dot(q-s.xy,d)/dot(d,d),0.,1.);if(length(q-s.xy-d*t)<.72)return true;}
 return false;
}`;
