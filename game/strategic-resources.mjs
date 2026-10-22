// Single-player recipes. Names and geography are authored, not recovered Wiki costs.
export const strategicResources={
 resonance:{name:'谐振晶矿',ship:'Interceptor',amount:4,value:12000,habitat:'特殊结晶行星'},
 titanium:{name:'钛能晶体',ship:'Titanenergetic_Frigate',amount:6,value:14000,habitat:'高压矿层'},
 phase:{name:'相位凝胶',ship:'Devourer_Interceptor',amount:8,value:16000,habitat:'异常星云凝聚物'},
 galaxium:{name:'星河稀金',ship:'Iron_Behemoth',amount:36,value:18000,habitat:'古老恒星重元素矿区'},
 nullphase:{name:'零相矿',ship:'Reaper',amount:16,value:20000,habitat:'致密天体矿区'},
 antimatter:{name:'反物质前驱晶',ship:'Annihilator',amount:24,value:24000,habitat:'高能辐射带'}
};
export const strategicKeys=Object.keys(strategicResources);
export const strategicRules={rate:6,capacity:240,mineCost:[20000,10000,5000],industryHours:6,defenderLimit:6};
export const strategicRecipe=id=>Object.entries(strategicResources).find(([,r])=>r.ship===id);
