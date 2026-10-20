import {createTerrainWorkerClient} from './terrain-worker-pool.js';
import {buildTile} from './continuous-planets/tile-builder.js';

let fallbackFrame=null,fallbackDeadline=0;
// Adapts the demo's queue contract to the world's single bounded Worker.
// Each visible asset can dispatch at most two tasks, with at most 24 waiting
// globally. All fallback generators share one frame budget.
export class SharedPlanetTilePool {
  constructor(field,config,url){
    Object.assign(this,{field,config,url,queue:[],nextId:0,disposed:false,active:true,fallback:false,error:null,completed:0});
    this.inflight=new Map();this.client=null;this.started=false;this.fallbackJob=null;
  }
  start(){
    if(this.started||this.disposed)return;this.started=true;
    this.client=createTerrainWorkerClient(this.url,{onmessage:data=>{
      const task=this.inflight.get(data.id);if(!task)return;this.inflight.delete(data.id);
      if(data.error){this.queue.unshift(task);this.useFallback(data.error);return;}
      if(data.requestKey!==this.config.requestKey){task.resolve(null);return;}
      this.completed++;task.resolve(data.geometry);this.pump();
    },onerror:error=>this.useFallback(String(error?.message||error))});
    if(!this.client)this.fallback=true;
  }
  useFallback(error){
    this.error=error;this.fallback=true;this.client?.dispose();this.client=null;
    this.queue.unshift(...this.inflight.values());this.inflight.clear();
  }
  request(job,priority=0){
    if(this.disposed||!this.active||this.pending>=48)return Promise.resolve(null);
    return new Promise(resolve=>{this.queue.push({id:++this.nextId,job,priority,resolve});this.queue.sort((a,b)=>b.priority-a.priority);this.start();this.pump();});
  }
  pump(){
    if(!this.active||this.disposed||this.fallback)return;
    while(this.queue.length&&this.inflight.size<2&&!this.fallback){
      // Register before posting: postMessage can fail synchronously, and the
      // error callback must be able to put this task back into fallback work.
      const task=this.queue.shift();this.inflight.set(task.id,task);
      if(!this.client.request(task.id,{kind:'continuous-tile',config:this.config,job:task.job,requestKey:this.config.requestKey})){
        this.inflight.delete(task.id);this.queue.unshift(task);break;
      }
    }
  }
  tick(budgetMs=1.6,time=0){
    if(this.disposed||!this.active)return;this.pump();if(!this.fallback)return;
    if(fallbackFrame!==time){fallbackFrame=time;fallbackDeadline=performance.now()+budgetMs;}
    while(performance.now()<fallbackDeadline){
      if(!this.fallbackJob){const task=this.queue.shift();if(!task)return;this.fallbackJob={task,iterator:buildTile(this.field,task.job)};}
      try{const result=this.fallbackJob.iterator.next();if(result.done){this.fallbackJob.task.resolve(result.value);this.fallbackJob=null;this.completed++;}}
      catch(error){this.error=String(error);this.fallbackJob.task.resolve(null);this.fallbackJob=null;}
    }
  }
  pause(){
    this.active=false;for(const task of this.queue)task.resolve(null);this.queue=[];
    for(const task of this.inflight.values()){this.client?.cancel(task.id);task.resolve(null);}this.inflight.clear();
    this.fallbackJob?.task.resolve(null);this.fallbackJob=null;
  }
  resume(){if(!this.disposed)this.active=true;}
  get pending(){return this.queue.length+this.inflight.size+(this.fallbackJob?1:0);}
  get stats(){return {...(this.client?.stats||{workers:0,queued:0,running:0,maxQueued:24}),localPending:this.pending};}
  dispose(){if(this.disposed)return;this.pause();this.disposed=true;this.client?.dispose();this.client=null;this.field=null;}
}
