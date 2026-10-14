import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import {once} from 'node:events';
import {output,root,views,routes,playwright,startServer,installBrowserProbe,configureProbe,frameMetrics,median,hash,sourceFingerprint} from '../tests/three-battle-harness.mjs';

const help=`Record the same frozen fleet replay sequentially with both renderers.

node scripts/record-three-battle.mjs [options]
  --engine both|legacy|three     Default: both, legacy then three for each view
  --view all|cinema|overview|follow|bridge  Default: all; comma lists also accepted
  --fixture PATH                Default: saved fixture-normal.json
  --start SECONDS               Default: 26; --full defaults to 0
  --duration SECONDS|full       Default: 20; --full records remaining fixture
  --warm SECONDS                Default: 5, limited by available replay history
  --ship-id ID                  Select a specific follow/bridge ship, including ordnance
  --full                        Record the complete supplied fixture, not a resimulation
  --out DIRECTORY               Default: a new recordings/<timestamp> directory
  --base URL                    Reuse a server; otherwise start a separate empty save
  --ffmpeg PATH                 Optional marker detection, otherwise auto-discovered
  --headed                      Show the browser while recording
  --help

Examples:
  node scripts/record-three-battle.mjs
  node scripts/record-three-battle.mjs --engine three --view cinema --start 26 --duration 20
  node scripts/record-three-battle.mjs --fixture output/full-battle.json --engine three --view overview --full --warm 0

Recorded FPS includes video encoding and the overlay. It is never substituted for
the certified no-recording benchmark in three-battle-comparison/full.
`;

export function parseOptions(argv){
  const options={engine:'both',view:'all',fixture:path.join(output,'fixture-normal.json'),start:undefined,duration:undefined,warm:5,'ship-id':undefined,out:undefined,base:undefined,ffmpeg:undefined,headed:false,full:false,help:false};
  for(let i=0;i<argv.length;i++){
    const [flag,inline]=argv[i].split(/=(.*)/s),key=flag.replace(/^--/,'');
    if(!flag.startsWith('--')||!Object.hasOwn(options,key))throw Error('Unknown option: '+flag);
    if(['headed','full','help'].includes(key)){if(inline!==undefined)throw Error(flag+' does not take a value');options[key]=true;continue;}
    const value=inline??argv[++i];if(value===undefined||value.startsWith('--'))throw Error('Missing value for '+flag);options[key]=value;
  }
  options.engines=options.engine==='both'?['legacy','three']:options.engine.split(',');
  options.views=options.view==='all'?views:options.view.split(',');
  if(!options.engines.every(x=>['legacy','three'].includes(x))||new Set(options.engines).size!==options.engines.length)throw Error('engine must be legacy, three, or both');
  if(!options.views.every(x=>views.includes(x))||new Set(options.views).size!==options.views.length)throw Error('Unknown or duplicate view');
  options.shipId=options['ship-id']===undefined?null:Number(options['ship-id']);
  if(options.shipId!==null&&(!Number.isSafeInteger(options.shipId)||options.shipId<0))throw Error('ship-id must be a non-negative integer');
  if(options.shipId!==null&&!options.views.every(view=>['follow','bridge'].includes(view)))throw Error('ship-id is supported for follow and bridge views');
  options.start=Number(options.start??(options.full?0:26));options.warm=Number(options.warm);
  options.duration=options.full||options.duration==='full'?'full':Number(options.duration??20);
  for(const name of ['start','warm'])if(!Number.isFinite(options[name])||options[name]<0)throw Error(name+' must be finite and non-negative');
  if(options.duration!=='full'&&(!Number.isFinite(options.duration)||options.duration<=0))throw Error('duration must be positive or full');
  options.fixture=path.resolve(options.fixture);options.out=path.resolve(options.out??path.join(output,'recordings',String(Date.now())));
  for(const protectedName of ['full','smoke','regression']){const protectedPath=path.resolve(output,protectedName).toLowerCase(),candidate=options.out.toLowerCase();if(candidate===protectedPath||candidate.startsWith(protectedPath+path.sep))throw Error('Recording output must not overwrite benchmark or regression evidence');}
  if(options.base){const url=new URL(options.base);if(!['http:','https:'].includes(url.protocol))throw Error('base must be an HTTP URL');options.base=url.origin;}
  return options;
}

export function readRecordingFixture(file,options){
  const parsed=JSON.parse(fs.readFileSync(file,'utf8')),replay=parsed.replay??parsed;
  if(!replay.record?.frames?.length||!replay.record?.metadata?.length||!Array.isArray(replay.record.events))throw Error('Fixture must be a saved spatial replay with frames, metadata and events');
  const finalTick=replay.record.frames.at(-1).tick,duration=Math.min(Number(replay.report?.duration??finalTick*.05),finalTick*.05);
  if(!Number.isFinite(duration)||duration<=0)throw Error('Fixture duration is invalid');
  const start=options.start,end=options.duration==='full'?duration:start+options.duration;
  if(start>=duration||end>duration+1e-6)throw Error(`Requested ${start}–${end}s is outside the saved ${duration}s replay`);
  if(options.shipId!==null&&!replay.record.metadata.some(m=>m.id===options.shipId))throw Error('Requested ship-id is absent from the replay');
  const warm=Math.min(options.warm,start),manifestPath=file.replace(/\.json$/i,'-manifest.json');
  let savedManifest=null;if(manifestPath!==file&&fs.existsSync(manifestPath))savedManifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const sha256=hash(replay);if(savedManifest?.sha256&&savedManifest.sha256!==sha256)throw Error('Saved fixture hash does not match its manifest');
  const canStreamSource=parsed===replay&&replay.report?.id&&replay.report.duration===duration;
  replay.report??={};replay.report.id??='00000000-0000-4000-8000-000000000100';replay.report.duration=duration;
  return {replay,transportSource:canStreamSource?file:null,manifest:{...(savedManifest??{}),source:file,sha256,duration,ships:replay.record.metadata.length},range:{start,end,duration:end-start,warm,playbackStart:start-warm}};
}

// Large complete replays exceed Chromium's DevTools message limit when sent by
// route.fulfill({json}). Serve bytes over HTTP and proxy the unchanged application
// through the same loopback origin, so neither CDP nor CORS carries the replay.
export async function startRecordingProxy(upstream,fixture,directory){
  const payloadFile=fixture.transportSource??path.join(directory,'replay-payload.json');
  if(!fixture.transportSource)fs.writeFileSync(payloadFile,JSON.stringify(fixture.replay));
  const payloadBytes=fs.statSync(payloadFile).size,owner=fixture.replay.record.metadata.find(m=>m.side==='attacker')?.owner??fixture.replay.record.metadata[0].owner;
  const sockets=new Set(),errors=[];
  const listener=http.createServer((request,response)=>{
    const pathname=new URL(request.url,'http://localhost').pathname;
    if(pathname==='/api/state'){
      response.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});response.end(JSON.stringify({player:{id:owner}}));return;
    }
    if(pathname.startsWith('/api/replay/')){
      if(request.method!=='GET'){response.writeHead(405);response.end();return;}
      response.writeHead(200,{'Content-Type':'application/json','Content-Length':String(payloadBytes),'Cache-Control':'no-store'});
      const stream=fs.createReadStream(payloadFile);stream.on('error',error=>{errors.push(error.message);response.destroy(error);});response.on('close',()=>stream.destroy());stream.pipe(response);return;
    }
    const target=new URL(request.url,upstream.base),client=target.protocol==='https:'?https:http;
    const forwarded=client.request(target,{method:request.method,headers:{...request.headers,host:target.host}},incoming=>{response.writeHead(incoming.statusCode,incoming.headers);incoming.pipe(response);});
    forwarded.on('error',error=>{errors.push(error.message);if(!response.headersSent)response.writeHead(502);response.end('Recording proxy upstream unavailable');});
    request.on('aborted',()=>forwarded.destroy());request.pipe(forwarded);
  });
  listener.on('connection',socket=>{sockets.add(socket);socket.once('close',()=>sockets.delete(socket));});
  listener.listen(0,'127.0.0.1');await once(listener,'listening');
  return {base:`http://127.0.0.1:${listener.address().port}`,payloadFile,payloadBytes,errors,stop:()=>new Promise(resolve=>{listener.close(resolve);for(const socket of sockets)socket.destroy();})};
}

export async function mountRecordingReplay(page,server,fixture,engine){
  const requests=[];page.on('request',request=>{if(request.method()==='POST')requests.push(request.url());});
  await page.addInitScript(installBrowserProbe);
  const started=performance.now();await page.goto(server.base+routes[engine]+'?replay='+fixture.replay.report.id,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(count=>window.GalacticDemo?.renderer&&window.flightController?.replay&&flightController.rows.length===count,fixture.replay.record.metadata.length,{timeout:120000});
  await page.evaluate(()=>{flightController.paused=true;});
  return {loadMs:performance.now()-started,requests};
}

// Only the recording page is instrumented. Production, renderer and benchmark
// source files remain byte-for-byte untouched.
function installRecordingOverlay({engine,view,start,end,ships}){
  const probe=window.__battleProbe,c=window.flightController,d=window.GalacticDemo;
  const colors={legacy:'#ffbc75',three:'#79dcff'},labels={cinema:'交火视角',overview:'舰队全景',follow:'外部追踪',bridge:'舰桥视角'};
  const overlay=document.createElement('aside');overlay.id='recording-telemetry';
  Object.assign(overlay.style,{position:'fixed',top:'112px',left:'20px',width:'395px',padding:'14px 18px',color:'#f5fbff',background:'rgba(4,12,20,.93)',border:`1px solid ${colors[engine]}`,borderRadius:'7px',font:'14px/1.6 Consolas, "Microsoft YaHei", monospace',zIndex:'2147483646',pointerEvents:'none',boxShadow:'0 4px 24px #0008'});
  overlay.innerHTML=`<div style="font:700 19px/1.4 system-ui;color:${colors[engine]}">${engine==='three'?'Three.js':'原版 WebGL'} · ${labels[view]}</div><div style="font-size:12px;color:#b5c6d1">${ships} 艘同记录对照 · 1920×1080 · DPR 1</div><div id="recording-phase" style="margin:7px 0;color:#ffe0a0"></div><div id="recording-values"></div><div style="border-top:1px solid #ffffff28;margin-top:8px;padding-top:6px;font-size:11px;color:#b5c6d1">视频 25 fps；面板为游戏渲染 FPS<br>录屏期间指标含编码与叠加层开销<br>不替代无录屏性能验收结果</div>`;
  const marker=document.createElement('div');marker.id='recording-sync-marker';Object.assign(marker.style,{position:'fixed',top:'0',left:'0',width:'16px',height:'16px',background:'#000',zIndex:'2147483647',pointerEvents:'none'});
  document.body.append(overlay,marker);
  const rec=window.__battleRecording={phase:'ready',requestedStart:start,requestedEnd:end,marks:[],paintAt:0,heapSamples:[],finished:false,markerUntil:0};
  const recordMark=(phase,replayTime)=>{const mark={phase,replayTime,browserPerformanceMs:performance.now(),browserTimeOriginMs:performance.timeOrigin,wallMs:Date.now()};rec.marks.push(mark);window.__recordingMark?.(mark);return mark;};
  const number=value=>Number.isFinite(value)?Math.round(value).toLocaleString('en-US'):'—';
  function paint(force=false){
    const now=performance.now();if(now>=rec.markerUntil)marker.style.background='#000';if(!force&&now-rec.paintAt<200)return;rec.paintAt=now;
    const samples=probe.samples.slice(-60),elapsed=samples.reduce((n,s)=>n+s.ms,0),fps=elapsed?samples.length*1000/elapsed:null,last=samples.at(-1),stats=c.renderStats??{},heap=performance.memory?.usedJSHeapSize/1048576;
    if(rec.phase==='recording')rec.heapSamples.push({replayTime:probe.simTime,wallMs:Date.now(),heapMiB:heap??null});
    document.querySelector('#recording-phase').textContent=(rec.phase==='recording'?'● 正在录制':rec.phase==='finished'?'■ 片段结束':rec.phase==='warmup'?'预热 / 同步':'准备录制')+` · 回放 ${probe.simTime.toFixed(2)} s`;
    document.querySelector('#recording-values').innerHTML=`FPS <b style="font-size:20px">${fps?.toFixed(1)??'—'}</b>　quality <b>${c.quality.toFixed(2)}</b><br>实际绘制 / 存活　<b>${number(stats.instances)} / ${number(stats.alive)}</b><br>三角形 / 帧　<b>${number(last?.triangles)}</b><br>绘制调用 / 帧　<b>${number(last?.calls)}</b><br>JS heap　<b>${heap?.toFixed(1)??'—'} MiB</b>`;
  }
  const update=c.update.bind(c);c.update=function(dt){update(dt);if(rec.phase!=='ready'&&rec.phase!=='finished'){
    if(rec.phase==='warmup'&&probe.simTime>=start){rec.phase='recording';rec.captureStart=recordMark('clip-start',probe.simTime);marker.style.background='#00ff00';rec.markerUntil=performance.now()+250;paint(true);}
    if(probe.simTime>=end){probe.finish(end);rec.phase='finished';rec.finished=true;rec.captureEnd=recordMark('clip-end',end);marker.style.background='#ff00ff';rec.markerUntil=performance.now()+350;paint(true);}
  }paint();};
  rec.start=function(warmMs){rec.phase='warmup';rec.started=recordMark('playback-start',probe.startTime);probe.start(warmMs);paint(true);return rec.started;};
  paint(true);
}

function discoverFFmpeg(explicit){
  if(explicit)return path.resolve(explicit);if(process.env.FFMPEG_BIN)return process.env.FFMPEG_BIN;
  const appdata=process.env.LOCALAPPDATA;
  if(appdata){const cache=path.join(appdata,'ms-playwright');if(fs.existsSync(cache))for(const name of fs.readdirSync(cache).filter(n=>n.startsWith('ffmpeg-')).sort().reverse()){const file=path.join(cache,name,'ffmpeg-win64.exe');if(fs.existsSync(file))return file;}}
  return 'ffmpeg';
}
async function ffmpegMetadata(command,file){
  return new Promise(resolve=>{const child=spawn(command,['-hide_banner','-i',file],{windowsHide:true,stdio:['ignore','ignore','pipe']});let stderr='';child.stderr.on('data',chunk=>stderr+=chunk);child.on('error',error=>resolve({available:false,reason:error.message}));child.on('close',()=>{const m=/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr),fps=/,\s*(\d+(?:\.\d+)?)\s+fps/.exec(stderr);resolve(m?{available:true,durationSeconds:Number(m[1])*3600+Number(m[2])*60+Number(m[3]),encodedFPS:fps?Number(fps[1]):null}:{available:false,reason:stderr.slice(-1200)});});});
}
async function scanMarker(command,file,{seek=0,duration}){
  return new Promise(resolve=>{
    const args=['-hide_banner','-loglevel','info',...(seek?['-ss',String(seek)]:[]),'-i',file,'-t',String(duration),'-vf','crop=16:16:0:0,scale=1:1:flags=area,showinfo','-vsync','0','-f','rawvideo','-pix_fmt','rgb24','pipe:1'];
    const child=spawn(command,args,{windowsHide:true,stdio:['ignore','pipe','pipe']}),rgb=[],pts=[];let pending='',tail='';
    child.stdout.on('data',chunk=>rgb.push(chunk));child.stderr.on('data',chunk=>{const text=chunk.toString();tail=(tail+text).slice(-2000);pending+=text;const lines=pending.split(/\r?\n/);pending=lines.pop();for(const line of lines){const m=/\bn:\s*\d+\s+pts:.*?pts_time:\s*([-+\d.eE]+)/.exec(line);if(m)pts.push(Number(m[1])+seek);}});
    child.on('error',error=>resolve({error:error.message}));child.on('close',code=>{
      if(code!==0){resolve({error:tail});return;}const bytes=Buffer.concat(rgb);let start=null,end=null;
      for(let i=0;i<Math.min(pts.length,Math.floor(bytes.length/3));i++){const r=bytes[i*3],g=bytes[i*3+1],b=bytes[i*3+2];if(start===null&&g>150&&r<100&&b<100)start=pts[i];if(end===null&&r>140&&b>140&&g<110)end=pts[i];}
      resolve({startOffsetSeconds:start,endOffsetSeconds:end,decodedFrames:pts.length});
    });
  });
}
async function alignVideo(command,file,timing){
  const metadata=await ffmpegMetadata(command,file),estimatedStart=(timing.captureStart.wallMs-timing.pageCreatedWallMs)/1000,estimatedEnd=(timing.captureEnd.wallMs-timing.pageCreatedWallMs)/1000;
  const fallback={method:'host-clock-estimate',startOffsetSeconds:estimatedStart,endOffsetSeconds:estimatedEnd,exact:false,uncertainty:'The first encoded frame may start after page creation; use the green/magenta pixel markers to align before a frame-exact comparison.',...metadata};
  if(!metadata.available)return fallback;
  const tailDuration=Math.max(4,(timing.pageCloseWallMs-timing.captureEnd.wallMs)/1000+2);
  const head=await scanMarker(command,file,{duration:Math.min(metadata.durationSeconds,estimatedStart+4)}),tailStart=Math.max(0,metadata.durationSeconds-tailDuration),tail=await scanMarker(command,file,{seek:tailStart,duration:tailDuration});
  if(head.startOffsetSeconds===null||head.startOffsetSeconds===undefined||tail.endOffsetSeconds===null||tail.endOffsetSeconds===undefined)return {...fallback,markerDetection:{head,tail}};
  return {method:'decoded-sync-marker',exact:true,startOffsetSeconds:head.startOffsetSeconds,endOffsetSeconds:tail.endOffsetSeconds,clipDurationSeconds:tail.endOffsetSeconds-head.startOffsetSeconds,resolutionSeconds:metadata.encodedFPS?1/metadata.encodedFPS:null,...metadata,markerDetection:{head,tail}};
}

export async function recordBattle(options){
  const fixture=readRecordingFixture(options.fixture,options),range=fixture.range;
  fs.mkdirSync(options.out,{recursive:true});const rawDirectory=path.join(options.out,'capture');fs.mkdirSync(rawDirectory,{recursive:true});
  const reportFile=path.join(options.out,'recording-manifest.json');if(fs.existsSync(reportFile))throw Error('Recording output already has a manifest; choose a fresh --out directory');
  const report={kind:'recorded-video-observation',certifiedBenchmark:false,createdAt:new Date().toISOString(),fixture:fixture.manifest,range,options:{engines:options.engines,views:options.views,shipId:options.shipId},conditions:{width:1920,height:1080,dpr:1,visualSeed:42,fixedQuality:1,sequence:'one page at a time; no parallel GPU recording',fpsScope:'Includes Playwright video encoding, telemetry sampling and the visible overlay; not comparable to certified no-recording FPS without accounting for this extra load.',gpuScope:'Whole GPU shared with other applications; never attributed exclusively to this page.'},syncMarker:{rect:{x:0,y:0,width:16,height:16},startRGB:[0,255,0],endRGB:[255,0,255],startHoldMs:250,endHoldMs:350},sourceStart:sourceFingerprint(),recorderSha256:createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex'),segments:[],errors:[]};
  const save=()=>fs.writeFileSync(reportFile,JSON.stringify(report,null,2));save();
  const {startResourceMonitor}=await import('./three-battle-usage.mjs');
  let server=null,proxy=null,browser=null;
  try{
    server=options.base?{base:options.base}:await startServer({directory:path.join(options.out,'server')});
    proxy=await startRecordingProxy(server,fixture,options.out);report.transport={method:'same-origin-streaming-http',payloadBytes:proxy.payloadBytes,payloadFile:proxy.payloadFile};save();
    const {chromium}=playwright();browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:!options.headed,args:['--use-angle=d3d11','--disable-background-timer-throttling','--disable-renderer-backgrounding']});report.browser=browser.version();
    for(const view of options.views)for(const engine of options.engines){
      const key=`${engine}-${view}${options.shipId===null?'':'-ship'+options.shipId}-${range.start.toFixed(2)}-${range.end.toFixed(2)}`,segment={engine,view,requestedReplay:{start:range.start,end:range.end},status:'recording',errors:[]};
      report.segments.push(segment);save();console.log(`Recording ${key}: ${range.duration}s + ${range.warm}s warmup`);
      let context=null,page=null,monitor=null,video=null;
      try{
        context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,recordVideo:{dir:rawDirectory,size:{width:1920,height:1080}}});
        const pageCreatedWallMs=Date.now(),pageCreatedMonotonicMs=performance.now();page=await context.newPage();video=page.video();
        page.on('pageerror',error=>segment.errors.push(error.message));page.on('console',message=>{if(message.type()==='error')segment.errors.push(message.text());});page.on('response',response=>{if(response.status()>=400)segment.errors.push(`HTTP ${response.status()}: ${response.url()}`);});
        await page.exposeFunction('__recordingMark',mark=>{monitor?.mark({...mark,eventPhase:mark.phase,phase:({'clip-start':'recording','clip-end':'finished','playback-start':'warmup'})[mark.phase]??mark.phase,engine,view});});
        const mounted=await mountRecordingReplay(page,proxy,fixture,engine);segment.loadMs=mounted.loadMs;
        // Arbitrary saved fixtures can use a different attacker account UUID.
        // This is observer ownership only; the replay bytes and simulation stay unchanged.
        await page.evaluate(()=>{const c=flightController,owner=c.metadata.find(m=>m.side==='attacker')?.owner;if(owner&&owner!==c.owner){c.owner=owner;c.prepare();}});
        segment.environment=await page.evaluate(configureProbe,{view,startTime:range.playbackStart,adaptive:false});
        if(options.shipId!==null){const selected=await page.evaluate(async id=>{await flightController.select(id);return {selected:flightController.selected,shipType:flightController.metadata[flightController.selected]?.type};},options.shipId);Object.assign(segment.environment,selected);if(selected.selected!==options.shipId)throw Error('Requested ship is not supported by the renderer');}
        await page.evaluate(installRecordingOverlay,{engine,view,start:range.start,end:range.end,ships:fixture.manifest.ships});
        monitor=await startResourceMonitor({browser,page,outPath:path.join(options.out,key+'-usage.jsonl'),label:key,intervalMs:1000});
        monitor.mark({phase:'page-ready',replayTime:range.playbackStart,wallMs:Date.now()});
        await page.evaluate(warmMs=>window.__battleRecording.start(warmMs),range.warm*1000);
        const began=Date.now();while(!(await page.evaluate(()=>window.__battleRecording.finished))){await page.waitForTimeout(Math.min(1000,Math.max(100,range.duration*1000)));if(Date.now()-began>(range.warm+range.duration+30)*1000)throw Error('Recording exceeded the replay time limit');}
        // Keep the end marker visible in several encoded frames for alignment.
        await page.waitForTimeout(420);
        const captured=await page.evaluate(()=>{const p=window.__battleProbe,r=window.__battleRecording,d=window.GalacticDemo;return {frames:p.samples,marks:r.marks,captureStart:r.captureStart,captureEnd:r.captureEnd,heapSamples:r.heapSamples,end:{replayTime:flightController.playTime,render:{...flightController.renderStats},quality:flightController.quality,glError:d.renderer.gl.getError(),gpuResources:d.renderer.getStats?.()??null}};});
        if(!captured.captureStart||!captured.captureEnd)throw Error('Recording sync markers were not reached');
        segment.metrics=frameMetrics(captured.frames);segment.renderMetrics={medianCalls:median(captured.frames.map(f=>f.calls)),medianTriangles:median(captured.frames.map(f=>f.triangles)),medianCPUrenderMs:median(captured.frames.map(f=>f.cpuRenderMs)),medianQuality:median(captured.frames.map(f=>f.quality)),medianHeapMiB:median(captured.heapSamples.map(f=>f.heapMiB))};
        segment.end=captured.end;segment.timing={pageCreatedWallMs,pageCreatedMonotonicMs,marks:captured.marks,captureStart:captured.captureStart,captureEnd:captured.captureEnd};
        segment.framesFile=path.join(options.out,key+'-frames.json');fs.writeFileSync(segment.framesFile,JSON.stringify({frames:captured.frames,heapSamples:captured.heapSamples}));
        segment.usage=await monitor.stop();monitor=null;
        segment.screenshot=path.join(options.out,key+'-end.png');await page.screenshot({path:segment.screenshot});
        if(mounted.requests.length)segment.errors.push('Read-only replay sent POST: '+mounted.requests.join(', '));if(captured.end.glError!==0)segment.errors.push('WebGL error '+captured.end.glError);
        segment.timing.pageCloseWallMs=Date.now();await context.close();context=null;
        segment.video=path.join(options.out,key+'.webm');await video.saveAs(segment.video);await video.delete();
        segment.alignment=await alignVideo(discoverFFmpeg(options.ffmpeg),segment.video,segment.timing);
        segment.trim={input:segment.video,startSeconds:segment.alignment.startOffsetSeconds,endSeconds:segment.alignment.endOffsetSeconds,replayStart:range.start,replayEnd:range.end,method:segment.alignment.method};
        segment.status=segment.errors.length?'failed':'complete';console.log(JSON.stringify({segment:key,status:segment.status,recordedFPS:segment.metrics.averageFPS,alignment:segment.alignment.method,video:segment.video}));
      }catch(error){segment.status='failed';segment.errors.push(error.stack??String(error));report.errors.push(key+': '+error.message);}
      finally{if(monitor)segment.usage=await monitor.stop().catch(error=>({error:error.message}));if(context)await context.close().catch(()=>{});save();}
    }
  }catch(error){report.errors.push(error.stack??String(error));}
  finally{if(browser)await browser.close();if(proxy){await proxy.stop();report.errors.push(...proxy.errors);}if(server?.stop)await server.stop();if(server?.stderr)report.errors.push(server.stderr);report.sourceEnd=sourceFingerprint();report.sourceUnchanged=report.sourceStart.sha256===report.sourceEnd.sha256;if(!report.sourceUnchanged)report.errors.push('Renderer/benchmark source changed during video capture');report.finishedAt=new Date().toISOString();report.passed=report.errors.length===0&&report.segments.length===options.engines.length*options.views.length&&report.segments.every(s=>s.status==='complete');save();}
  console.log('Recording manifest: '+reportFile);return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const options=parseOptions(process.argv.slice(2));if(options.help)console.log(help);else{const report=await recordBattle(options);if(!report.passed)process.exitCode=1;}}
  catch(error){console.error(error.stack??String(error));process.exitCode=1;}
}
