const clamp=x=>Math.max(0,Math.min(1,x));
export function shipConstructionProgress(queue,now){
 if(!queue)return 0;
 const duration=queue.each>0?queue.each*1000:Math.max(1,queue.end-queue.start);
 return clamp((now-(queue.end-duration))/duration);
}
export function shipConstructionPhase(progress){return progress<.24?'龙骨与承力结构':progress<.46?'动力与设备安装':progress<.76?'外壳封装焊接':progress<.92?'武器与附件舾装':'系统联调';}
