import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {output,playwright,startServer,installBrowserProbe,frameMetrics,median,hash,sourceFingerprint} from '../tests/three-battle-harness.mjs';
import {startResourceMonitor} from './three-battle-usage.mjs';
import {alignVideo,discoverFFmpeg} from './three-battle-video-alignment.mjs';

const help=`Record the original Reaper practice charge and phase-cut simulation.

node scripts/record-three-practice.mjs [options]
  --engine both|legacy|three     Default: both, sequentially
  --view follow|bridge          Default: follow
  --duration SECONDS            Default: 10
  --warm SECONDS                Default: 2, static-render warmup
  --fire-at SECONDS             Default: 1, measured in practice simulation time
  --out DIRECTORY               Default: new recordings/practice-<timestamp>
  --base URL                    Reuse an existing server
  --ffmpeg PATH                 Full FFmpeg for encoded-frame sync detection
  --headed                      Show the browser
  --help

Both pages start from the same built-in practice targets and ship state, then
invoke the existing fireMain() once. No live battle or control API is involved.
This is a visual practice regression, not a certified performance benchmark.
`;

export function parsePracticeOptions(argv){
  const options={engine:'both',view:'follow',duration:10,warm:2,'fire-at':1,out:null,base:null,ffmpeg:null,headed:false,help:false};
  for(let i=0;i<argv.length;i++){
    const [flag,inline]=argv[i].split(/=(.*)/s),key=flag.replace(/^--/,'');
    if(!flag.startsWith('--')||!Object.hasOwn(options,key))throw Error('Unknown option: '+flag);
    if(['headed','help'].includes(key)){if(inline!==undefined)throw Error(flag+' does not take a value');options[key]=true;continue;}
    const value=inline??argv[++i];if(value===undefined||value.startsWith('--'))throw Error('Missing value for '+flag);options[key]=value;
  }
  options.engines=options.engine==='both'?['legacy','three']:options.engine.split(',');
  if(!options.engines.every(engine=>['legacy','three'].includes(engine))||new Set(options.engines).size!==options.engines.length)throw Error('engine must be legacy, three, or both');
  if(!['follow','bridge'].includes(options.view))throw Error('view must be follow or bridge');
  for(const key of ['duration','warm','fire-at']){options[key]=Number(options[key]);if(!Number.isFinite(options[key])||options[key]<0)throw Error(key+' must be finite and non-negative');}
  if(options.duration<=options['fire-at']+3)throw Error('duration must include at least 3 seconds after fire-at to show the charge and cut');
  options.out=path.resolve(options.out??path.join(output,'recordings','practice-'+Date.now()));
  for(const protectedName of ['full','smoke','regression']){const protectedPath=path.resolve(output,protectedName).toLowerCase(),candidate=options.out.toLowerCase();if(candidate===protectedPath||candidate.startsWith(protectedPath+path.sep))throw Error('Practice recording must not overwrite benchmark evidence');}
  if(options.base){const url=new URL(options.base);if(!['http:','https:'].includes(url.protocol))throw Error('base must be an HTTP URL');options.base=url.origin;}
  return options;
}

function freezePracticeAtLoad(){
  window.commandSceneActive=true;
  // The baseline runtime uses 4982 for its private particle generator.
  window.battleBenchmark={visualSeed:4982,fixedQuality:1};
}

function installPracticeRecording({engine,view,duration,warm,fireAt}){
  const d=window.GalacticDemo,r=d.renderer,p=d.state.flight;
  if(window.flightController)throw Error('Practice recording must not have a live/replay controller');
  if(d.ships[d.state.shipIndex]?.id!=='Reaper'||p.profile.special!=='reaper')throw Error('Reaper practice did not initialize');
  if(p.elapsed!==0)throw Error('Practice advanced before the synchronized start');
  const target=p.targets[0];
  p.throttle=0;p.speed=0;p.velocity=[0,0,0];p.ai=false;p.align=true;d.setTurretMode('hold');
  p.yaw=p.yawTarget=Math.atan2(target.pos[0],-target.pos[2]);p.pitch=p.pitchTarget=Math.atan2(target.pos[1],Math.hypot(target.pos[0],target.pos[2]));
  if(p.external!==(view==='follow'))d.setView();p.cameraBlend=p.external?1:0;p.cameraVelocity=0;p.cameraZoom=1;p.orbitYaw=p.external?.32:0;p.orbitPitch=0;
  d.state.helpOpen=true;
  const rec=window.__practiceRecording={phase:'ready',duration,warm,fireAt,samples:[],marks:[],stages:[],heapSamples:[],finished:false,frameBegin:0,lastFrame:0,drawnShips:0,lastStage:null,paintAt:0,markerUntil:0};
  const color=engine==='three'?'#79dcff':'#ffbc75',overlay=document.createElement('aside'),marker=document.createElement('div');
  Object.assign(overlay.style,{position:'fixed',top:'112px',left:'20px',width:'395px',padding:'14px 18px',color:'#f5fbff',background:'rgba(4,12,20,.93)',border:'1px solid '+color,borderRadius:'7px',font:'14px/1.6 Consolas, "Microsoft YaHei", monospace',zIndex:'2147483646',pointerEvents:'none'});
  overlay.innerHTML=`<div style="font:700 19px/1.4 system-ui;color:${color}">${engine==='three'?'Three.js':'原版 WebGL'} · 收割者靶场</div><div style="font-size:12px;color:#b5c6d1">独立练习 · ${view==='follow'?'外部追踪':'舰桥视角'} · 1920×1080</div><div id="practice-recording-phase" style="margin:7px 0;color:#ffe0a0"></div><div id="practice-recording-values"></div><div style="border-top:1px solid #ffffff28;margin-top:8px;padding-top:6px;font-size:11px;color:#b5c6d1">视频 25 fps；面板为游戏渲染 FPS<br>录屏期间指标含编码与叠加层开销<br>练习特效独立验证，不计入千舰跑分</div>`;
  Object.assign(marker.style,{position:'fixed',top:'0',left:'0',width:'16px',height:'16px',background:'#000',zIndex:'2147483647',pointerEvents:'none'});document.body.append(overlay,marker);
  const mark=(phase,extra={})=>{const value={phase,replayTime:p.elapsed,simulationTime:p.elapsed,browserPerformanceMs:performance.now(),browserTimeOriginMs:performance.timeOrigin,wallMs:Date.now(),...extra};rec.marks.push(value);window.__practiceMark?.(value);return value;};
  const stage=()=>p.charging?'charging':p.reaperCut?'cutting':p.mainShots>0?'recovery':'idle';
  const number=value=>Number.isFinite(value)?Math.round(value).toLocaleString('en-US'):'—';
  function paint(force=false){
    const now=performance.now();if(now>=rec.markerUntil)marker.style.background='#000';if(!force&&now-rec.paintAt<200)return;rec.paintAt=now;
    const recent=rec.samples.slice(-60),elapsed=recent.reduce((n,s)=>n+s.ms,0),fps=elapsed?recent.length*1000/elapsed:null,last=recent.at(-1),heap=performance.memory?.usedJSHeapSize/1048576;
    if(rec.phase==='recording')rec.heapSamples.push({simulationTime:p.elapsed,heapMiB:heap??null});
    const phaseLabel=rec.phase==='recording'?({charging:'蓄能',cutting:'双束切割 / 护盾回收',recovery:'武器恢复',idle:'准备发射'})[stage()]:rec.phase==='finished'?'片段结束':'渲染预热';
    document.querySelector('#practice-recording-phase').textContent=phaseLabel+' · 练习 '+p.elapsed.toFixed(2)+' s';
    document.querySelector('#practice-recording-values').innerHTML=`FPS <b style="font-size:20px">${fps?.toFixed(1)??'—'}</b>　quality <b>完整模型</b><br>实际绘制舰数　<b>${number(last?.ships??rec.drawnShips)}</b><br>三角形 / 帧　<b>${number(last?.triangles)}</b><br>绘制调用 / 帧　<b>${number(last?.calls)}</b><br>JS heap　<b>${heap?.toFixed(1)??'—'} MiB</b>`;
  }
  const vessel=r.drawVessel.bind(r);r.drawVessel=function(...args){rec.drawnShips++;return vessel(...args);};
  const flight=r.flight.bind(r),endFrame=r.endFrame?.bind(r);
  function finishFrame(){
    if(rec.phase==='recording'&&rec.lastFrame)rec.samples.push({ms:rec.frameBegin-rec.lastFrame,cpuRenderMs:performance.now()-rec.frameBegin,...r.gl.__benchCounts,ships:rec.drawnShips,simulationTime:p.elapsed,phase:stage(),charging:p.charging,charge:p.charge,cutAge:p.reaperCut?.age??null,effects:{beams:p.beams.length,particles:p.particles.length,shieldHits:p.shieldHits.length},target:{hp:target.hp,shield:target.shield},shield:p.shield});
    rec.lastFrame=rec.frameBegin;paint();
  }
  r.flight=function(state){
    rec.frameBegin=performance.now();rec.drawnShips=0;for(const key in r.gl.__benchCounts)r.gl.__benchCounts[key]=0;
    if(rec.phase==='warmup'&&rec.frameBegin>=rec.startWallMs+warm*1000){rec.phase='recording';d.state.helpOpen=false;rec.lastFrame=0;rec.captureStart=mark('clip-start');marker.style.background='#00ff00';rec.markerUntil=performance.now()+250;paint(true);}
    if(rec.phase==='recording'){
      window.__benchSeed(42+Math.floor(p.elapsed*20));
      if(!rec.fired&&p.elapsed>=fireAt){rec.fired=true;const accepted=d.fireMain();rec.fire=mark('fire',{accepted});}
      const current=stage();if(current!==rec.lastStage){rec.lastStage=current;rec.stages.push(mark('weapon-stage',{stage:current}));}
      if(p.elapsed>=duration){rec.phase='finished';rec.finished=true;rec.captureEnd=mark('clip-end');window.commandSceneActive=true;d.state.helpOpen=true;marker.style.background='#ff00ff';rec.markerUntil=performance.now()+350;paint(true);}
    }
    const result=flight(state,p.elapsed);if(!endFrame)finishFrame();return result;
  };
  if(endFrame)r.endFrame=function(...args){const result=endFrame(...args);finishFrame();return result;};
  rec.start=()=>{rec.phase='warmup';rec.startWallMs=performance.now();mark('warmup');window.commandSceneActive=false;};
  paint(true);
  const debug=r.gl.getExtension('WEBGL_debug_renderer_info');
  return {selected:null,shipType:'Reaper',ship:'Reaper',targets:structuredClone(p.targets),target:structuredClone(target),initialShip:{pos:p.pos,yaw:p.yaw,pitch:p.pitch,shield:p.shield,throttle:p.throttle,align:p.align,turretMode:p.turretMode},camera:{view,orbitYaw:p.orbitYaw,orbitPitch:p.orbitPitch,zoom:p.cameraZoom},viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},gpu:debug?r.gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):r.gl.getParameter(r.gl.RENDERER)};
}

export async function recordPractice(options){
  fs.mkdirSync(options.out,{recursive:true});const reportFile=path.join(options.out,'practice-recording-manifest.json');if(fs.existsSync(reportFile))throw Error('Choose a fresh output directory');
  const report={kind:'practice-special-effect-video',captureKind:'independent-practice',certifiedBenchmark:false,createdAt:new Date().toISOString(),ship:'Reaper',options,range:{start:0,end:options.duration,duration:options.duration,warm:options.warm,timeline:'independent-practice-simulation'},fixture:{kind:'independent-practice-descriptor',name:'Reaper 独立靶场初态与火控计划',ships:4,sha256:null,note:'This hash identifies a built-in practice initial state and input schedule, not a saved battle replay.'},sourceStart:sourceFingerprint(),recorderSha256:createHash('sha256').update(fs.readFileSync(fileURLToPath(import.meta.url))).digest('hex'),conditions:{width:1920,height:1080,dpr:1,expectedVideoFPS:25,particleSeed:4982,visualSeed:42,quality:'full practice geometry',simulation:'Existing independent practice simulation, same initial state and fire schedule. Real frame delta integration is preserved; minor particle paths can differ between renderers.',gpuScope:'Whole GPU shared with other applications.',changesForCapture:['pause practice during static warmup','zero throttle','align to built-in first target','hold automatic turrets to isolate Reaper special effect','fixed follow/bridge camera']},segments:[],errors:[]};
  const save=()=>fs.writeFileSync(reportFile,JSON.stringify(report,null,2));save();let server=null,browser=null;
  try{
    server=options.base?{base:options.base}:await startServer({directory:path.join(options.out,'server')});
    const {chromium}=playwright();browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:!options.headed,args:['--use-angle=d3d11','--disable-background-timer-throttling','--disable-renderer-backgrounding']});report.browser=browser.version();
    for(const engine of options.engines){
      const key=engine+'-practice-Reaper-'+options.view,segment={engine,view:options.view,requestedReplay:{start:0,end:options.duration,timeline:'independent-practice-simulation'},status:'recording',errors:[],requests:[]};report.segments.push(segment);save();console.log('Recording '+key);
      let context=null,page=null,monitor=null,video=null;
      try{
        context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,recordVideo:{dir:path.join(options.out,'capture'),size:{width:1920,height:1080}}});
        const pageCreatedWallMs=Date.now();page=await context.newPage();video=page.video();
        page.on('pageerror',error=>segment.errors.push(error.message));page.on('console',message=>{if(message.type()==='error')segment.errors.push(message.text());});page.on('response',response=>{if(response.status()>=400)segment.errors.push('HTTP '+response.status()+': '+response.url());});
        page.on('request',request=>{if(request.url().includes('/api/'))segment.requests.push({method:request.method(),url:request.url()});});
        await page.addInitScript(installBrowserProbe);await page.addInitScript(freezePracticeAtLoad);
        await page.exposeFunction('__practiceMark',mark=>{monitor?.mark({...mark,eventPhase:mark.phase,phase:({'clip-start':'recording','clip-end':'finished'})[mark.phase]??(mark.phase==='warmup'?'warmup':'recording')});});
        const route=engine==='three'?'/opendesign/mockups/galactic-command/hangar-three.html':'/opendesign/mockups/galactic-command/legacy-webgl/hangar.html',began=performance.now();
        await page.goto(server.base+route+'?ship=Reaper&map=planet&entry=direct-flight-01');await page.waitForFunction(()=>window.GalacticDemo?.renderer&&GalacticDemo.state.mode==='flight',null,{timeout:60000});segment.loadMs=performance.now()-began;
        segment.environment=await page.evaluate(installPracticeRecording,{engine,view:options.view,duration:options.duration,warm:options.warm,fireAt:options['fire-at']});
        const descriptor={ship:'Reaper',initialShip:segment.environment.initialShip,targets:segment.environment.targets,camera:segment.environment.camera,fireSchedule:[{time:options['fire-at'],action:'fireMain'}],particleSeed:4982,visualSeed:42};segment.fixtureSha256=hash(descriptor);
        if(report.fixture.sha256&&report.fixture.sha256!==segment.fixtureSha256)throw Error('Practice initial states differ between renderers');
        report.fixture.sha256=segment.fixtureSha256;report.fixture.descriptor=descriptor;
        monitor=await startResourceMonitor({browser,page,outPath:path.join(options.out,key+'-usage.jsonl'),label:key});
        await page.evaluate(()=>__practiceRecording.start());
        const started=Date.now();while(!(await page.evaluate(()=>__practiceRecording.finished))){await page.waitForTimeout(500);if(Date.now()-started>(options.duration+options.warm+30)*1000)throw Error('Practice capture timeout');}
        await page.waitForTimeout(420);
        const captured=await page.evaluate(()=>{const rec=__practiceRecording,d=GalacticDemo;return {samples:rec.samples,marks:rec.marks,stages:rec.stages,fire:rec.fire,heapSamples:rec.heapSamples,captureStart:rec.captureStart,captureEnd:rec.captureEnd,end:{elapsed:d.state.flight.elapsed,mainShots:d.state.flight.mainShots,glError:d.renderer.gl.getError(),controllerAbsent:!window.flightController,resources:d.renderer.getStats?.()??null}};});
        segment.metrics=frameMetrics(captured.samples);segment.renderMetrics={medianCalls:median(captured.samples.map(s=>s.calls)),medianTriangles:median(captured.samples.map(s=>s.triangles)),medianShips:median(captured.samples.map(s=>s.ships)),medianHeapMiB:median(captured.heapSamples.map(s=>s.heapMiB))};
        segment.effects={fire:captured.fire,stages:captured.stages,chargingFrames:captured.samples.filter(s=>s.charging).length,cuttingFrames:captured.samples.filter(s=>s.phase==='cutting').length};segment.end=captured.end;
        if(!captured.fire?.accepted||!segment.effects.chargingFrames||!segment.effects.cuttingFrames)segment.errors.push('Expected successful fire, charging and cutting phases were not all observed');
        if(segment.requests.length)segment.errors.push('Independent practice unexpectedly called API');if(captured.end.glError!==0)segment.errors.push('WebGL error '+captured.end.glError);if(!captured.end.controllerAbsent)segment.errors.push('Unexpected battle controller');
        segment.timing={pageCreatedWallMs,marks:captured.marks,captureStart:captured.captureStart,captureEnd:captured.captureEnd};segment.framesFile=path.join(options.out,key+'-frames.json');fs.writeFileSync(segment.framesFile,JSON.stringify(captured));
        segment.usage=await monitor.stop();monitor=null;segment.screenshot=path.join(options.out,key+'-end.png');await page.screenshot({path:segment.screenshot});
        segment.timing.pageCloseWallMs=Date.now();await context.close();context=null;segment.video=path.join(options.out,key+'.webm');await video.saveAs(segment.video);await video.delete();
        segment.alignment=await alignVideo(discoverFFmpeg(options.ffmpeg),segment.video,segment.timing);segment.trim={input:segment.video,startSeconds:segment.alignment.startOffsetSeconds,endSeconds:segment.alignment.endOffsetSeconds,practiceStart:0,practiceEnd:options.duration,method:segment.alignment.method};
        segment.status=segment.errors.length?'failed':'complete';console.log(JSON.stringify({segment:key,status:segment.status,recordedFPS:segment.metrics.averageFPS,chargingFrames:segment.effects.chargingFrames,cuttingFrames:segment.effects.cuttingFrames,video:segment.video}));
      }catch(error){segment.status='failed';segment.errors.push(error.stack??String(error));report.errors.push(key+': '+error.message);}
      finally{if(monitor)segment.usage=await monitor.stop().catch(error=>({error:error.message}));if(context)await context.close().catch(()=>{});save();}
    }
  }catch(error){report.errors.push(error.stack??String(error));}
  finally{if(browser)await browser.close();if(server?.stop)await server.stop();if(server?.stderr)report.errors.push(server.stderr);report.sourceEnd=sourceFingerprint();report.sourceUnchanged=report.sourceStart.sha256===report.sourceEnd.sha256;if(!report.sourceUnchanged)report.errors.push('Renderer source changed during recording');report.finishedAt=new Date().toISOString();report.passed=report.errors.length===0&&report.segments.length===options.engines.length&&report.segments.every(segment=>segment.status==='complete');save();}
  console.log('Practice manifest: '+reportFile);return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const options=parsePracticeOptions(process.argv.slice(2));if(options.help)console.log(help);else if(!(await recordPractice(options)).passed)process.exitCode=1;}
  catch(error){console.error(error.stack??String(error));process.exitCode=1;}
}
