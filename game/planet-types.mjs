export const planetTypes={
  terrestrial:{id:'terrestrial',name:'类地星',description:'温带海洋 · 三类矿产',specialty:null,multipliers:[1,1,1]},
  mercury:{id:'mercury',name:'金属岩星',description:'熔岩大陆 · 活火山 · 金属产量 ×3',specialty:0,multipliers:[3,0,0]},
  mars:{id:'mars',name:'火星岩星',description:'红岩裂谷 · 巨型晶脉 · 晶体产量 ×3',specialty:1,multipliers:[0,3,0]},
  gas:{id:'gas',name:'气态巨星',description:'木星云带 · 多层风暴 · 浮空平台 · 气体产量 ×3',specialty:2,multipliers:[0,0,3]}
};
export const planetType=p=>Object.hasOwn(planetTypes,p?.biome)?planetTypes[p.biome]:planetTypes.terrestrial;
