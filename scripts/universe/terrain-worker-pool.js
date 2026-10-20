// One data-only worker for every live planet. A departing planet can cancel its
// queued work without starting another worker or delivering into a disposed group.
const pools=new Map();
const MAX_QUEUED=24;
export function createTerrainWorkerClient(url,{onmessage,onerror}={}) {
  if(!url||typeof Worker==='undefined')return null;
  let pool=pools.get(url);
  if(!pool){
    let worker;try{worker=new Worker(url,{type:'module'});}catch{return null;}
    pool={worker,clients:new Set(),queue:[],active:null,next:0,failed:false};pools.set(url,pool);
    pool.pump=()=>{if(pool.failed||pool.active||!pool.queue.length)return;const job=pool.queue.shift();pool.active=job;try{worker.postMessage({...job.data,id:job.id});}catch(error){pool.fail(error);}};
    pool.fail=error=>{if(pool.failed)return;pool.failed=true;worker.terminate();pools.delete(url);pool.queue=[];pool.active=null;for(const client of [...pool.clients])if(!client.disposed)client.onerror?.(error);};
    worker.onmessage=({data})=>{const job=pool.active;if(!job||data.id!==job.id)return;pool.active=null;if(!job.client.disposed&&!job.cancelled)job.client.onmessage?.({...data,id:job.localId});pool.pump();};
    worker.onerror=pool.fail;
  }
  const client={disposed:false,onmessage,onerror,
    request(localId,data){if(client.disposed||pool.failed||pool.queue.length>=MAX_QUEUED)return false;pool.queue.push({id:++pool.next,localId,data,client});pool.pump();return true;},
    cancel(localId){pool.queue=pool.queue.filter(job=>job.client!==client||job.localId!==localId);if(pool.active?.client===client&&pool.active.localId===localId)pool.active.cancelled=true;},
    dispose(){if(client.disposed)return;client.disposed=true;pool.queue=pool.queue.filter(job=>job.client!==client);if(pool.active?.client===client)pool.active.cancelled=true;pool.clients.delete(client);if(!pool.clients.size){pool.worker.terminate();if(pools.get(url)===pool)pools.delete(url);pool.failed=true;pool.active=null;pool.queue=[];}},
    get stats(){return {workers:pool.failed?0:1,queued:pool.queue.length,running:pool.active?1:0,maxQueued:MAX_QUEUED};}
  };
  pool.clients.add(client);return client;
}
