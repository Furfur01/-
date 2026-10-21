import {Worker} from 'node:worker_threads';

// One owner, one immutable structured-clone snapshot in flight. Serialization,
// gzip and atomic disk commits run on this worker, never the simulation loop.
export function createSaveWriter(saveFile){
 const worker=new Worker(new URL('./save-worker.mjs',import.meta.url),{workerData:{saveFile}});
 let pending=null,failure=null;
 const fail=error=>{failure=error;pending?.reject(error);pending=null;};
 worker.on('error',fail);
 worker.on('exit',code=>{if(pending)fail(Error('保存线程已退出：'+code));});
 worker.on('message',result=>{const request=pending;pending=null;if(result.error)request.reject(Error(result.error));else request.resolve(result);});
 return {
  write(world){
   if(failure)return Promise.reject(failure);
   if(pending)throw Error('存档提交必须串行');
   return new Promise((resolve,reject)=>{pending={resolve,reject};try{worker.postMessage(world);}catch(error){pending=null;reject(error);}});
  },
  close:()=>worker.terminate(),
 };
}
