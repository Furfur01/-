// Resource monitoring for recorded clips. No sampling starts merely by importing.
// This is separate from the certified renderer benchmark and does not change it.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {once} from 'node:events';

const MiB=1024*1024;
const number=value=>value!==null&&value!==undefined&&value!==''&&Number.isFinite(Number(value))?Number(value):null;
const reason=error=>String(error?.message||error).slice(0,600);
const timeout=(promise,ms,message)=>{
  let timer;
  return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(message)),ms);})]).finally(()=>clearTimeout(timer));
};

// One persistent process handles PID lists received through stdin. GetProcessById
// requires neither WMI/CIM access nor periodic powershell.exe startup.
const processSamplerScript=String.raw`
$ErrorActionPreference='Stop'
[Console]::InputEncoding=New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
while($null -ne ($sampleLine=[Console]::ReadLine())) {
  if([string]::IsNullOrWhiteSpace($sampleLine)){continue}
  $sampleRequest=$null
  try {
    $sampleRequest=$sampleLine | ConvertFrom-Json
    $sampleRows=New-Object System.Collections.Generic.List[object]
    $sampleErrors=New-Object System.Collections.Generic.List[object]
    foreach($taskProcessId in $sampleRequest.pids) {
      $taskProcess=$null
      try {
        $taskProcess=[System.Diagnostics.Process]::GetProcessById([int]$taskProcessId)
        $taskProcess.Refresh()
        $birthTicks=$null
        try {$birthTicks=$taskProcess.StartTime.ToUniversalTime().Ticks.ToString()}catch{}
        $sampleRows.Add([pscustomobject]@{pid=$taskProcess.Id;name=$taskProcess.ProcessName;birthTicks=$birthTicks;cpuSeconds=$taskProcess.TotalProcessorTime.TotalSeconds;workingSetBytes=$taskProcess.WorkingSet64;privateBytes=$taskProcess.PrivateMemorySize64})
      } catch {$sampleErrors.Add([pscustomobject]@{pid=[int]$taskProcessId;reason=$_.Exception.Message})}
      finally {if($null -ne $taskProcess){$taskProcess.Dispose()}}
    }
    $sampleResponse=[pscustomobject]@{requestId=$sampleRequest.requestId;atMs=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds();logicalProcessors=[Environment]::ProcessorCount;processes=@($sampleRows.ToArray());errors=@($sampleErrors.ToArray())}
  } catch {$sampleResponse=[pscustomobject]@{requestId=$sampleRequest.requestId;error=$_.Exception.Message}}
  [Console]::WriteLine(($sampleResponse | ConvertTo-Json -Depth 5 -Compress))
}
`;

function windowsProcessSampler(powerShellPath){
  if(process.platform!=='win32')return {available:false,reason:'Windows process counters are unavailable on this platform',stop:async()=>{}};
  const executable=powerShellPath||path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
  const child=spawn(executable,['-NoLogo','-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(processSamplerScript,'utf16le').toString('base64')],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  const pending=new Map();let sequence=0,failed=null,closed=false,stderr='';
  const fail=error=>{failed=reason(error);for(const task of pending.values())task.reject(Error(failed));pending.clear();};
  child.on('error',fail);child.stdin.on('error',fail);
  child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-1800);});
  child.on('close',code=>{closed=true;if(code&&!failed)fail(Error(stderr||'Windows sampler exited with code '+code));});
  const lines=createInterface({input:child.stdout});
  lines.on('line',line=>{
    try{const value=JSON.parse(line.replace(/^\uFEFF/,'')),task=pending.get(value.requestId);if(!task)return;pending.delete(value.requestId);value.error?task.reject(Error(value.error)):task.resolve(value);}
    catch(error){fail(Error('Windows sampler returned invalid JSON: '+reason(error)));}
  });
  return {
    get available(){return !failed&&!closed;},get reason(){return failed||stderr||'Windows sampler is closed';},
    async sample(pids){
      if(failed||closed)throw Error(failed||'Windows sampler is closed');
      const requestId=++sequence;
      const response=new Promise((resolve,reject)=>pending.set(requestId,{resolve,reject}));
      child.stdin.write(JSON.stringify({requestId,pids})+'\n');
      return timeout(response,3000,'Windows process sample timed out').finally(()=>pending.delete(requestId));
    },
    async stop(){
      if(closed)return;
      child.stdin.end();
      try{await timeout(once(child,'close'),1200,'Windows sampler did not exit');}catch{child.kill();}
      lines.close();
    },
  };
}

function gpuSampler(nvidiaSmiPath){
  const executable=nvidiaSmiPath||'nvidia-smi';
  const child=spawn(executable,['--query-gpu=index,name,utilization.gpu,memory.used,memory.total','--format=csv,noheader,nounits','-l','1'],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  const cards=new Map();let failed=null,closed=false,stderr='';
  child.on('error',error=>{failed=reason(error);});
  child.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-1200);});
  child.on('close',code=>{closed=true;if(code&&!failed)failed=stderr||'nvidia-smi exited with code '+code;});
  const lines=createInterface({input:child.stdout});
  lines.on('line',line=>{
    const fields=line.split(',').map(value=>value.trim());
    if(fields.length!==5||number(fields[0])===null){if(line.trim())stderr=(stderr+' '+line).slice(-1200);return;}
    cards.set(Number(fields[0]),{index:Number(fields[0]),name:fields[1],utilizationPercent:number(fields[2]),dedicatedMemoryUsedMiB:number(fields[3]),dedicatedMemoryTotalMiB:number(fields[4]),atMs:Date.now()});
  });
  return {
    sample(){
      if(failed||closed)return {status:'unavailable',scope:'whole-gpu-card',reason:failed||stderr||'nvidia-smi stopped',cards:[]};
      const values=[...cards.values()].map(card=>({...card,sampleAgeMs:Date.now()-card.atMs}));
      if(!values.length)return {status:'unavailable',scope:'whole-gpu-card',reason:stderr||'Waiting for the first nvidia-smi sample',cards:[]};
      for(const card of values){
        if(card.sampleAgeMs>3500){card.status='unavailable';card.reason='GPU sample is stale';card.utilizationPercent=null;card.dedicatedMemoryUsedMiB=null;card.dedicatedMemoryTotalMiB=null;}
        else card.status=[card.utilizationPercent,card.dedicatedMemoryUsedMiB,card.dedicatedMemoryTotalMiB].every(value=>value!==null)?'available':'partial';
      }
      return {status:values.every(card=>card.status==='available')?'available':values.every(card=>card.status==='unavailable')?'unavailable':'partial',scope:'whole-gpu-card',cards:values};
    },
    async stop(){if(!closed){child.kill();try{await timeout(once(child,'close'),1200,'nvidia-smi did not exit');}catch{}}lines.close();},
  };
}

function statistics(values){
  const valid=values.filter(value=>typeof value==='number'&&Number.isFinite(value)).sort((a,b)=>a-b);
  return valid.length?{status:'available',samples:valid.length,mean:valid.reduce((a,b)=>a+b,0)/valid.length,max:valid.at(-1),p95:valid[Math.ceil(valid.length*.95)-1]}:{status:'unavailable',samples:0,mean:null,max:null,p95:null};
}

export function summarizeUsage(samples){
  const cards=[...new Set(samples.flatMap(sample=>sample.gpu.cards.map(card=>card.index)))];
  return {
    browserCPUPercentMachine:statistics(samples.map(sample=>sample.browser.cpuPercentMachine)),
    browserCPUPercentOneCore:statistics(samples.map(sample=>sample.browser.cpuPercentOneCore)),
    workingSetMiB:statistics(samples.map(sample=>sample.browser.workingSetMiB)),
    privateBytesMiB:statistics(samples.map(sample=>sample.browser.privateBytesMiB)),
    jsHeapUsedMiB:statistics(samples.map(sample=>sample.page.jsHeapUsedMiB)),
    rendererTaskPercentOneCore:statistics(samples.map(sample=>sample.page.rendererTaskPercentOneCore)),
    gpuStatus:samples.some(sample=>sample.gpu.status==='available')?'available':samples.some(sample=>sample.gpu.status==='partial')?'partial':'unavailable',
    gpuUnavailableReasons:[...new Set(samples.filter(sample=>sample.gpu.status==='unavailable').map(sample=>sample.gpu.reason).filter(Boolean))],
    gpu:cards.map(index=>({index,name:samples.flatMap(sample=>sample.gpu.cards).find(card=>card.index===index)?.name,scope:'whole-gpu-card',utilizationPercent:statistics(samples.map(sample=>sample.gpu.cards.find(card=>card.index===index)?.utilizationPercent)),dedicatedMemoryUsedMiB:statistics(samples.map(sample=>sample.gpu.cards.find(card=>card.index===index)?.dedicatedMemoryUsedMiB))})),
  };
}

/**
 * const monitor=await startResourceMonitor({browser,page,outPath:'clip-usage.jsonl',label:'cinema'});
 * monitor.mark({phase:'warmup'}); monitor.mark({phase:'recording',replayTime:20,wallMs:0});
 * const report=await monitor.stop(); // Stop before closing the page or browser.
 * PIDs can alternatively be supplied as `pids` or async `processIdProvider`.
 */
export async function startResourceMonitor({browser,page,outPath,label='battle',intervalMs=1000,pids,processIdProvider,powerShellPath,nvidiaSmiPath,onSample}={}){
  if(!outPath)throw Error('outPath must be a JSONL file path');
  if(!(intervalMs>=1000))throw Error('Resource sampling interval must be at least 1000 ms');
  fs.mkdirSync(path.dirname(path.resolve(outPath)),{recursive:true});
  const stream=fs.createWriteStream(outPath,{encoding:'utf8'}),samples=[];
  let writeError=null;stream.on('error',error=>{writeError=error;});
  const write=value=>{if(!writeError)stream.write(JSON.stringify(value)+'\n');};
  const metadata={label,startedAt:new Date().toISOString(),intervalMs,logicalProcessors:os.availableParallelism?.()||os.cpus().length,pidDiscovery:'unavailable',definitions:{
    browserCPUPercentMachine:'Delta of cumulative CPU seconds for the monitored browser process group, divided by wall time and logical processor count; 100% means all logical processors busy.',
    browserCPUPercentOneCore:'Same process-group CPU delta before dividing by logical processors; may exceed 100%. First sample has no delta and is null. CPU from processes exiting between samples can be missed.',
    workingSetMiB:'Sum of resident working sets of browser-group PIDs from Windows GetProcessById; shared pages may be counted in more than one process.',
    privateBytesMiB:'Sum of Windows process private committed bytes; this is not private resident RAM.',
    rendererTaskPercentOneCore:'Page CDP Performance TaskDuration delta / wall time. Renderer task-time proxy only, not whole-browser CPU usage.',
    jsHeapUsedMiB:'Page CDP Performance JSHeapUsedSize; JavaScript heap only, not total process memory.',
    gpu:'nvidia-smi utilization.gpu and memory.used/memory.total describe the entire physical card, including other applications; they are not browser-exclusive usage.',
    unavailable:'Missing or unsupported measurements are null with an explicit unavailable/partial status; never substituted with zero.',
  }};
  let browserSession=null,pageSession=null,pidError=null,pageError=null;
  if(processIdProvider||pids)metadata.pidDiscovery=processIdProvider?'caller-supplied-dynamic-browser-PIDs':'caller-supplied-static-PIDs';
  else if(browser){
    try{browserSession=await timeout(browser.newBrowserCDPSession(),3000,'Browser CDP session timed out');metadata.pidDiscovery='CDP SystemInfo.getProcessInfo for this browser instance';}
    catch(error){pidError=reason(error);}
  }
  if(page){
    try{pageSession=await timeout(page.context().newCDPSession(page),3000,'Page CDP session timed out');await timeout(pageSession.send('Performance.enable'),3000,'Performance.enable timed out');}
    catch(error){pageError=reason(error);}
  }
  const windows=windowsProcessSampler(powerShellPath),gpu=gpuSampler(nvidiaSmiPath);
  let previousProcesses=null,previousProcessAt=null,previousCPUSource=null,previousPage=null,current=null,timer=null,inflight=null,stopPromise=null,stopped=false,phase='setup',markData={};
  write({kind:'metadata',...metadata});

  async function sampleBrowser(){
    let processInfo=[];
    try{
      if(processIdProvider){const supplied=await processIdProvider();processInfo=supplied.map(value=>typeof value==='number'?{id:value}:value);}
      else if(pids)processInfo=pids.map(id=>({id}));
      else if(browserSession)processInfo=(await timeout(browserSession.send('SystemInfo.getProcessInfo'),2500,'Process discovery timed out')).processInfo;
      else throw Error(pidError||'Reliable browser process IDs are unavailable');
    }catch(error){pidError=reason(error);metadata.pidDiscoveryError=pidError;}
    const ids=[...new Set(processInfo.map(item=>Number(item.id)).filter(id=>Number.isSafeInteger(id)&&id>0))];
    const unavailable={status:'unavailable',scope:'browser-process-group',reason:pidError||'No reliable browser process IDs',pids:[],cpuPercentMachine:null,cpuPercentOneCore:null,workingSetMiB:null,privateBytesMiB:null};
    if(!ids.length)return unavailable;
    let osSample=null,osError=null;
    if(windows.available){try{osSample=await windows.sample(ids);}catch(error){osError=reason(error);}}
    else osError=windows.reason;
    const rows=osSample?.processes||[],completeOSCPU=rows.length===ids.length&&rows.every(row=>number(row.cpuSeconds)!==null);
    const completeCDPCPU=ids.every(id=>processInfo.some(item=>Number(item.id)===id&&number(item.cpuTime)!==null));
    const cpuRows=completeOSCPU?rows.map(row=>({id:row.pid,key:row.pid+':'+(row.birthTicks||''),cpuTime:number(row.cpuSeconds)})):completeCDPCPU?processInfo.map(item=>({...item,key:String(item.id)})):[];
    const cpuSource=completeOSCPU?'Windows process TotalProcessorTime':'CDP SystemInfo cumulative CPU usage';
    const atMs=osSample?.atMs||Date.now(),seconds=previousProcessAt===null?null:(atMs-previousProcessAt)/1000;
    let delta=0,matched=0;
    if(previousProcesses&&previousCPUSource===cpuSource&&seconds>0)for(const item of cpuRows){const old=previousProcesses.get(item.key);if(old!==undefined&&item.cpuTime!==null&&item.cpuTime>=old){delta+=item.cpuTime-old;matched++;}}
    const oneCore=matched?delta/seconds*100:null,processors=osSample?.logicalProcessors||metadata.logicalProcessors;
    previousProcesses=new Map(cpuRows.filter(item=>item.cpuTime!==null).map(item=>[item.key,item.cpuTime]));previousProcessAt=atMs;previousCPUSource=cpuSource;
    const fullMemory=rows.length===ids.length&&rows.every(row=>number(row.workingSetBytes)!==null&&number(row.privateBytes)!==null);
    return {status:fullMemory&&oneCore!==null?'available':'partial',scope:'browser-process-group',pids:ids,processCount:ids.length,sampledProcessCount:rows.length,cpuSource:cpuRows.length?cpuSource:null,cpuPercentMachine:oneCore===null?null:oneCore/processors,cpuPercentOneCore:oneCore,cpuMatchedProcesses:matched,cpuIntervalSeconds:seconds,
      workingSetMiB:fullMemory?rows.reduce((sum,row)=>sum+row.workingSetBytes,0)/MiB:null,privateBytesMiB:fullMemory?rows.reduce((sum,row)=>sum+row.privateBytes,0)/MiB:null,
      memorySource:fullMemory?'Windows GetProcessById':null,reason:fullMemory?(oneCore===null?'CPU delta baseline is not yet available':null):(osError||'Some process memory counters are unavailable'),errors:osSample?.errors||[]};
  }

  async function samplePage(){
    const empty={status:'unavailable',scope:'page-renderer-only',reason:pageError||'Page CDP metrics are unavailable',rendererTaskPercentOneCore:null,taskDurationSeconds:null,jsHeapUsedMiB:null,jsHeapTotalMiB:null,documents:null,domNodes:null,eventListeners:null};
    if(!pageSession)return empty;
    try{
      const data=await timeout(pageSession.send('Performance.getMetrics'),2500,'Page metrics timed out');
      const metrics=Object.fromEntries(data.metrics.map(metric=>[metric.name,metric.value])),atMs=Date.now(),task=number(metrics.TaskDuration),seconds=previousPage?(atMs-previousPage.atMs)/1000:null;
      const taskPercent=task!==null&&previousPage?.task!==null&&previousPage&&seconds>0&&task>=previousPage.task?(task-previousPage.task)/seconds*100:null;
      previousPage={atMs,task};
      return {status:task!==null&&number(metrics.JSHeapUsedSize)!==null?'available':'partial',scope:'page-renderer-only',rendererTaskPercentOneCore:taskPercent,taskDurationSeconds:task,jsHeapUsedMiB:number(metrics.JSHeapUsedSize)===null?null:metrics.JSHeapUsedSize/MiB,jsHeapTotalMiB:number(metrics.JSHeapTotalSize)===null?null:metrics.JSHeapTotalSize/MiB,documents:number(metrics.Documents),domNodes:number(metrics.Nodes),eventListeners:number(metrics.JSEventListeners)};
    }catch(error){return {...empty,reason:reason(error)};}
  }

  const poll=()=>{
    if(stopped)return;
    const begin=Date.now();
    inflight=(async()=>{
      const [browserResult,pageResult]=await Promise.all([sampleBrowser(),samplePage()]);
      current={kind:'sample',label,phase,mark:markData,at:new Date().toISOString(),atMs:Date.now(),elapsedMs:Date.now()-Date.parse(metadata.startedAt),browser:browserResult,page:pageResult,gpu:gpu.sample()};
      samples.push(current);write(current);
      if(onSample)try{await onSample(current);}catch(error){write({kind:'observer-error',at:new Date().toISOString(),reason:reason(error)});}
    })().catch(error=>write({kind:'sampling-error',at:new Date().toISOString(),reason:reason(error)})).finally(()=>{if(!stopped)timer=setTimeout(poll,Math.max(0,intervalMs-(Date.now()-begin)));});
  };
  poll();
  return {
    metadata,
    latest:()=>current,
    mark(data={}){if(stopped)return;if(data.phase)phase=data.phase;markData={...markData,...data};write({kind:'mark',label,at:new Date().toISOString(),...data});},
    stop(){
      if(stopPromise)return stopPromise;
      stopped=true;clearTimeout(timer);
      stopPromise=(async()=>{
        await inflight;
        await Promise.allSettled([windows.stop(),gpu.stop(),browserSession?.detach(),pageSession?.detach()]);
        const summary=summarizeUsage(samples);
        summary.byPhase=Object.fromEntries([...new Set(samples.map(sample=>sample.phase))].map(name=>[name,summarizeUsage(samples.filter(sample=>sample.phase===name))]));
        const report={outPath:path.resolve(outPath),label,sampleCount:samples.length,summary,metadata};
        write({kind:'summary',...report});
        await new Promise(resolve=>stream.end(resolve));
        if(writeError)throw writeError;
        return report;
      })();
      return stopPromise;
    },
  };
}
