export const planetTypes={
  terrestrial:{id:'terrestrial',name:'类地星',description:'温带海洋 · 三类矿产',specialty:null,multipliers:[1,1,1]},
  mercury:{id:'mercury',name:'金属岩星',description:'熔岩大陆 · 金属 ×3，晶体与气体 ×0.1',specialty:0,multipliers:[3,.1,.1]},
  mars:{id:'mars',name:'火星岩星',description:'晶体裂谷 · 晶体 ×3，金属与气体 ×0.1',specialty:1,multipliers:[.1,3,.1]},
  gas:{id:'gas',name:'气态巨星',description:'浮空平台 · 气体 ×3，金属与晶体 ×0.1',specialty:2,multipliers:[.1,.1,3]}
};
export const planetType=p=>Object.hasOwn(planetTypes,p?.biome)?planetTypes[p.biome]:planetTypes.terrestrial;
