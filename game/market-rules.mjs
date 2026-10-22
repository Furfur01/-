import {strategicKeys,strategicResources} from './strategic-resources.mjs';

export const marketKeys=['metal','crystal','gas',...strategicKeys];
export const marketNames=['金属','晶体','气体',...strategicKeys.map(k=>strategicResources[k].name)];
export const marketValues=[1,1.5,2,...strategicKeys.map(k=>strategicResources[k].value)];
export const marketRules={feeRate:.03,minRatio:.5,maxRatio:2,listingHours:72,contractHours:24,refreshHours:6,maxOrders:12};
export const marketValue=v=>v.reduce((sum,n,i)=>sum+n*marketValues[i],0);
export const marketFee=(give,index=0)=>Math.ceil(marketValue(give)*marketRules.feeRate/marketValues[index]);
export const marketBlank=()=>Array(9).fill(0);
