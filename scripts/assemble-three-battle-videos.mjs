// Assemble already-recorded observations. This never runs a game or a browser.
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const fps=25,frameSeconds=1/fps;
const encoding={codec:'libx264',preset:'fast',crf:18,pixelFormat:'yuv420p',threads:4,
  encodedFPS:fps,nominalEncodedFPS:fps,fpsMode:'cfr',audio:false,fastStart:true,hardwareAcceleration:false,
  cadence:'25 frames/s on the existing timestamp timeline; explicit 40 ms frame durations. Boundary rounding may retain/drop one encoded frame, never stretch time.',
  scaling:false,cropping:false,speedMultiplier:1,terminalFreezeSeconds:0};
const help=`Assemble exact-marker battle recordings without resizing or changing speed.

node scripts/assemble-three-battle-videos.mjs --manifest PATH [--manifest PATH ...] --out DIR [--single | --pairs-only]

  --manifest PATH  A completed record-three-battle recording-manifest.json; repeatable
  --out DIR        Fresh output directory (existing files are never overwritten)
  --single         Emit independent 1920x1080 MP4 files only; omit comparison pairs
  --pairs-only     Encode only matching 3840x1080 pairs; retain raw sources and list unmatched clips
  --ffmpeg PATH    Override the bundled imageio-ffmpeg executable
  --help           Show this help without reading videos or invoking FFmpeg

Default: every segment gets an independent MP4. Matching legacy/three segments also
get a 3840x1080 pair, legacy on the left and Three.js on the right. Pairs are formed
only for the same fixture, view, selected ship, replay range and capture conditions.
25 fps is the encoded video cadence, NOT the game FPS. No time stretching, overlay,
crop, resize, estimated trim or artificial extra battle time is added.
Independent practice uses a shared initial-state descriptor, not a shared replay.
Practice pairs align their recorded starts and report any natural phase drift.
`;

export function parseOptions(argv){
  const options={manifests:[],out:null,single:false,'pairs-only':false,help:false,
    ffmpeg:path.join(root,'output/playwright/three-battle-video-tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe')};
  for(let i=0;i<argv.length;i++){
    const [flag,inline]=argv[i].split(/=(.*)/s);
    if(['--single','--pairs-only','--help'].includes(flag)){
      if(inline!==undefined)throw Error(flag+' does not take a value');
      options[flag.slice(2)]=true;continue;
    }
    if(!['--manifest','--out','--ffmpeg'].includes(flag))throw Error('Unknown option: '+flag);
    const value=inline??argv[++i];
    if(!value||value.startsWith('--'))throw Error('Missing value for '+flag);
    if(flag==='--manifest')options.manifests.push(path.resolve(value));
    else options[flag.slice(2)]=path.resolve(value);
  }
  if(options.single&&options['pairs-only'])throw Error('--single and --pairs-only are mutually exclusive');
  if(!options.help){
    if(!options.manifests.length||!options.out)throw Error('--manifest and --out are required');
    if(new Set(options.manifests).size!==options.manifests.length)throw Error('Duplicate --manifest');
  }
  return options;
}

const number=value=>typeof value==='number'&&Number.isFinite(value);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const safeName=value=>String(value).replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-|-$/g,'')||'clip';
const timeName=value=>value.toFixed(2).replace('.','p');
const frameTolerance=frameSeconds+.002;
const isPractice=report=>report.kind==='practice-special-effect-video'&&report.fixture?.kind==='independent-practice-descriptor';

export function validateSegment(report,segment,label='segment'){
  const practice=isPractice(report);
  if((report.kind==='practice-special-effect-video'||report.fixture?.kind==='independent-practice-descriptor')&&!practice)throw Error(label+': incomplete independent-practice identity');
  if(segment.status!=='complete')throw Error(label+': recording is not complete');
  if(segment.errors?.length)throw Error(label+': recording has errors');
  if(!['legacy','three'].includes(segment.engine))throw Error(label+': unknown engine');
  const a=segment.alignment;
  if(a?.exact!==true||a.method!=='decoded-sync-marker')throw Error(label+': exact decoded-sync-marker alignment is required; clock estimates are refused');
  if(!number(a.startOffsetSeconds)||!number(a.endOffsetSeconds)||a.startOffsetSeconds<0||a.endOffsetSeconds<=a.startOffsetSeconds)throw Error(label+': invalid marker interval');
  if(!number(a.encodedFPS)||Math.abs(a.encodedFPS-fps)>.001)throw Error(label+': expected 25 fps source video');
  if(a.resolutionSeconds!==undefined&&(!number(a.resolutionSeconds)||a.resolutionSeconds>frameTolerance))throw Error(label+': marker resolution exceeds one video frame');
  const range=segment.requestedReplay??report.range;
  if(!number(range?.start)||!number(range?.end)||range.start<0||range.end<=range.start)throw Error(label+': invalid replay range');
  const clipDuration=a.endOffsetSeconds-a.startOffsetSeconds;
  const timing=segment.timing,startMark=timing?.captureStart,endMark=timing?.captureEnd;
  let timeline={kind:'shared-battle-replay',requestedStart:range.start,requestedEnd:range.end};
  if(practice){
    const simulationStart=startMark?.simulationTime,simulationEnd=endMark?.simulationTime;
    const wallStart=startMark?.browserPerformanceMs,wallEnd=endMark?.browserPerformanceMs;
    if(![simulationStart,simulationEnd,wallStart,wallEnd].every(number)||simulationEnd<=simulationStart||wallEnd<=wallStart)throw Error(label+': practice requires actual simulation and monotonic wall-clock boundaries');
    const wallSpan=(wallEnd-wallStart)/1000,simulationSpan=simulationEnd-simulationStart;
    // Practice integrates the original frame dt. Check encoded markers against
    // wall time; do not force that footage to match the simulated elapsed time.
    if(Math.abs(clipDuration-wallSpan)>2*frameSeconds+.01)throw Error(label+': practice markers differ from captured wall time by more than two encoded frames');
    timeline={kind:'independent-practice',requestedStart:range.start,requestedEnd:range.end,
      simulationStart,simulationEnd,simulationSpanSeconds:simulationSpan,wallSpanSeconds:wallSpan,
      markerSpanSeconds:clipDuration,simulationMinusWallSeconds:simulationSpan-wallSpan,
      markerMinusSimulationSeconds:clipDuration-simulationSpan,
      statement:'Same initial-state descriptor and input schedule; each original practice simulation integrates its own frame dt. This is not a shared battle replay.'};
  }else{
    // Battle rules stay strict: each boundary is quantized independently by one 40 ms frame.
    if(Math.abs(clipDuration-(range.end-range.start))>2*frameSeconds+.01)throw Error(label+': marker span differs from replay duration by more than two encoded frames; inspect recording before assembly');
  }
  const startReplay=segment.timing?.captureStart?.replayTime;
  if(!practice&&number(startReplay)&&Math.abs(startReplay-range.start)>frameTolerance)throw Error(label+': captured replay start differs by more than one encoded frame');
  if(report.conditions?.width!==1920||report.conditions?.height!==1080||report.conditions?.dpr!==1)throw Error(label+': expected 1920x1080 DPR 1 capture conditions');
  if(!/^[a-f0-9]{64}$/i.test(report.fixture?.sha256??''))throw Error(label+': fixture SHA256 is missing');
  if(typeof segment.video!=='string'||!segment.video)throw Error(label+': source video path is missing');
  return {start:a.startOffsetSeconds,end:a.endOffsetSeconds,duration:clipDuration,
    replayStart:range.start,replayEnd:range.end,selected:segment.environment?.selected??report.options?.shipId??null,timeline};
}

function practicePhases(segment){
  const start=segment.timing.captureStart.browserPerformanceMs,occurrences=new Map();
  return [...(segment.effects?.stages??[]),...(segment.effects?.fire?[{...segment.effects.fire,stage:'fire'}]:[])].map(mark=>{
    const phase=mark.stage??mark.phase,index=(occurrences.get(phase)??0)+1;occurrences.set(phase,index);
    return {key:phase+':'+index,phase,simulationTime:mark.simulationTime??mark.replayTime,
      wallOffsetSeconds:number(mark.browserPerformanceMs)?(mark.browserPerformanceMs-start)/1000:null};
  });
}

export function comparePracticePhases(left,right){
  const keys=[...new Set([...left,...right].map(mark=>mark.key))];
  const phases=keys.map(key=>{
    const a=left.find(mark=>mark.key===key),b=right.find(mark=>mark.key===key);
    const delta=number(a?.wallOffsetSeconds)&&number(b?.wallOffsetSeconds)?b.wallOffsetSeconds-a.wallOffsetSeconds:null;
    return {key,legacy:a??null,three:b??null,threeMinusLegacyWallSeconds:delta,
      withinOneEncodedFrame:delta!==null&&Math.abs(delta)<=frameTolerance};
  });
  return {method:'start-aligned independent simulations; phases are observed, never time-warped',
    phaseMatchedWithinOneEncodedFrame:phases.length>0&&phases.every(phase=>phase.withinOneEncodedFrame),phases};
}

function resolveVideo(video,manifestFile){
  if(path.isAbsolute(video))return video;
  const local=path.resolve(path.dirname(manifestFile),video);
  if(fs.existsSync(local))return local;
  const fromCwd=path.resolve(video);
  if(fs.existsSync(fromCwd))return fromCwd;
  throw Error('Cannot find recording source '+video+' referenced by '+manifestFile);
}

export function readAssemblyPlan(options){
  const sources=[],manifests=[];
  for(const manifestFile of options.manifests){
    const bytes=fs.readFileSync(manifestFile),report=JSON.parse(bytes),manifestHash=digest(bytes);
    if(report.passed!==true||report.sourceUnchanged!==true||report.errors?.length)throw Error(manifestFile+': recording manifest must have passed=true, sourceUnchanged=true and no errors');
    if(!Array.isArray(report.segments)||!report.segments.length)throw Error(manifestFile+': no segments');
    manifests.push({path:manifestFile,sha256:manifestHash,fixture:report.fixture,range:report.range,
      captureConditions:report.conditions,rendererSourceSha256:report.sourceStart?.sha256,recorderSha256:report.recorderSha256});
    for(let index=0;index<report.segments.length;index++){
      const segment=report.segments[index],trim=validateSegment(report,segment,manifestFile+' segment '+index);
      const source=resolveVideo(segment.video,manifestFile);
      if(!fs.statSync(source).isFile())throw Error('Source video is not a file: '+source);
      const id=`${safeName(report.fixture.name??'fixture')}-${safeName(segment.view)}-ship${trim.selected??'auto'}-${timeName(trim.replayStart)}-${timeName(trim.replayEnd)}-${segment.engine}-${manifestHash.slice(0,8)}-${index}`;
      const pairKey=JSON.stringify({fixture:report.fixture.sha256,view:segment.view,selected:trim.selected,
        start:trim.replayStart,end:trim.replayEnd,conditions:report.conditions,
        timeline:trim.timeline.kind,rendererSource:report.sourceStart?.sha256,recorderSource:report.recorderSha256});
      sources.push({id,source,engine:segment.engine,view:segment.view,fixtureSha256:report.fixture.sha256,
        fixtureHashMeaning:isPractice(report)?'independent practice initial state / camera / input descriptor':'shared offline battle replay',
        fixtureName:report.fixture.name,ships:report.fixture.ships,manifest:manifestFile,manifestSha256:manifestHash,
        segmentIndex:index,trim,alignment:segment.alignment,practicePhases:isPractice(report)?practicePhases(segment):undefined,pairKey});
    }
  }
  const pairs=[],unpaired=[];
  if(!options.single){
    const groups=new Map();
    for(const source of sources){const group=groups.get(source.pairKey)??[];group.push(source);groups.set(source.pairKey,group);}
    for(const group of groups.values()){
      if(new Set(group.map(s=>s.engine)).size!==group.length)throw Error('Ambiguous duplicate engine in comparison group: '+group.map(s=>s.id).join(', '));
      if(group.length!==2){unpaired.push({sourceId:group[0].id,reason:'No other engine with identical fixture, camera selection, replay range and capture conditions.'});continue;}
      const left=group.find(s=>s.engine==='legacy'),right=group.find(s=>s.engine==='three');
      const practice=left.trim.timeline.kind==='independent-practice';
      if(!practice&&Math.abs(left.trim.duration-right.trim.duration)>2*frameSeconds+.01)throw Error('Pair durations differ by more than two encoded frames: '+left.id);
      pairs.push({id:`pair-${safeName(left.fixtureName??'fixture')}-${safeName(left.view)}-ship${left.trim.selected??'auto'}-${timeName(left.trim.replayStart)}-${timeName(left.trim.replayEnd)}-${digest(left.pairKey).slice(0,8)}`,left,right,
        phaseComparison:practice?comparePracticePhases(left.practicePhases,right.practicePhases):undefined});
    }
  }
  return {manifests,sources,pairs,unpaired};
}

function ffmpeg(command,args,{allowNonzero=false}={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let stderr='';
    child.stderr.on('data',chunk=>{stderr=(stderr+chunk.toString()).slice(-64000);});
    child.once('error',reject);child.once('close',code=>{
      if(code!==0&&!allowNonzero)reject(Error(`FFmpeg exited ${code}: ${stderr.slice(-4000)}`));
      else resolve({code,stderr});
    });
  });
}

export function parseVideoMetadata(stderr){
  const duration=/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(stderr);
  const line=stderr.split(/\r?\n/).find(line=>/Stream #.*Video:/.test(line));
  const size=line&&/\b(\d{3,5})x(\d{3,5})\b/.exec(line),rate=line&&/\b(\d+(?:\.\d+)?)\s+fps\b/.exec(line);
  const nominal=line&&/\b(\d+(?:\.\d+)?)\s+tbr\b/.exec(line);
  const codec=line&&/Video:\s*([^\s,(]+)/.exec(line)?.[1];
  if(!duration||!size||!rate)throw Error('Cannot read video dimensions, duration and frame rate from FFmpeg metadata');
  const averageEncodedFPS=Number(rate[1]),nominalEncodedFPS=Number(nominal?.[1]??rate[1]);
  return {width:Number(size[1]),height:Number(size[2]),durationSeconds:Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3]),
    encodedFPS:nominalEncodedFPS,nominalEncodedFPS,averageEncodedFPS,
    frameRateMeaning:'nominalEncodedFPS is the video cadence (tbr); averageEncodedFPS is the muxed stream average (fps), subject to final-frame/container duration rounding. Neither is game FPS.',codec};
}

export function validateEncodedCadence(metadata,label='video'){
  if(Math.abs(metadata.nominalEncodedFPS-fps)>.001)throw Error(label+': expected nominal 25 fps cadence');
  // FFmpeg rounds its displayed average rate to two decimals. One terminal
  // frame with an omitted/rounded duration can change 500/20 into 500/19.96.
  const averageTolerance=1/Math.max(frameSeconds,metadata.durationSeconds)+.011;
  if(Math.abs(metadata.averageEncodedFPS-fps)>averageTolerance)throw Error(label+': average encoded frame rate differs by more than one terminal frame');
}

async function videoMetadata(command,file){
  const result=await ffmpeg(command,['-hide_banner','-nostdin','-i',file],{allowNonzero:true});
  return parseVideoMetadata(result.stderr);
}
async function fileHash(file){const hash=createHash('sha256');for await(const bytes of fs.createReadStream(file))hash.update(bytes);return hash.digest('hex');}
const trimFilter=source=>`trim=start=${source.trim.start}:end=${source.trim.end},setpts=PTS-STARTPTS`;
export function encodeArguments(sources,file){
  const args=['-hide_banner','-nostdin','-loglevel','error','-n'];
  for(const source of sources)args.push('-hwaccel','none','-i',source.source);
  if(sources.length===1)args.push('-map','0:v:0','-vf',trimFilter(sources[0]));
  else if(sources.length===2)args.push('-filter_complex',`[0:v:0]${trimFilter(sources[0])}[left];[1:v:0]${trimFilter(sources[1])}[right];[left][right]hstack=inputs=2:shortest=1[out]`,'-map','[out]');
  else throw Error('Encoding requires one source or a legacy/three pair');
  args.push('-an','-map_metadata','-1','-c:v',encoding.codec,'-preset',encoding.preset,'-crf',String(encoding.crf),
    '-threads',String(encoding.threads),'-pix_fmt',encoding.pixelFormat,'-fps_mode',encoding.fpsMode,'-r',String(fps),'-movflags','+faststart',file);
  return args;
}

export async function assemble(options){
  const plan=readAssemblyPlan(options),manifestFile=path.join(options.out,'assembly-manifest.json');
  if(fs.existsSync(manifestFile))throw Error('Output already contains an assembly manifest; choose a fresh --out directory');
  const jobs=[...(options['pairs-only']?[]:plan.sources.map(source=>({id:source.id,kind:'single',sources:[source]}))),
    ...plan.pairs.map(pair=>({id:pair.id,kind:'pair',sources:[pair.left,pair.right],phaseComparison:pair.phaseComparison}))];
  for(const job of jobs){job.file=path.join(options.out,job.id+'.mp4');if(fs.existsSync(job.file))throw Error('Refusing to overwrite '+job.file);}
  fs.mkdirSync(options.out,{recursive:true});
  const report={kind:'assembled-recorded-video-observation',certifiedBenchmark:false,createdAt:new Date().toISOString(),
    outputMode:options['pairs-only']?'pairs-only':options.single?'single':'singles-and-pairs',
    sourceManifests:plan.manifests,encoding,synchronization:{method:'decoded-sync-marker (encoded clip boundaries)',speedMultiplier:1,
      frameResolutionSeconds:frameSeconds,startErrorBoundSeconds:frameSeconds,
      pairEnding:options['pairs-only']
        ?'The shorter exact-marker interval ends the pair; the complete longer footage remains in its untouched source WebM.'
        :'The shorter exact-marker interval ends the pair; longer source tail remains in its independent MP4.',
      battleRule:'Shared replay time; marker span must agree within two video frames and the captured replay start within one frame.',
      practiceRule:'Same initial state and inputs, independent frame-dt integration. Marker span is checked against wall time, not forced to simulated duration. Pairs align starts; phase differences remain visible and are reported.',
      terminalFreezeSeconds:0},
    note:'25 fps is the encoded video cadence, not game FPS. Trim only removes pre/post capture footage; no resize or speed change.',
    unpaired:plan.unpaired,sources:[],outputs:[],errors:[],passed:false};
  const save=()=>fs.writeFileSync(manifestFile,JSON.stringify(report,null,2));save();
  try{
    // Validate all sources before beginning any expensive encode. Metadata probing does not decode video frames.
    for(const source of plan.sources){
      const metadata=await videoMetadata(options.ffmpeg,source.source);
      if(metadata.width!==1920||metadata.height!==1080)throw Error('Source must be 1920x1080: '+source.source);
      validateEncodedCadence(metadata,source.source);
      if(source.trim.end>metadata.durationSeconds+frameTolerance)throw Error('End marker lies beyond the source duration: '+source.source);
      const sha256=await fileHash(source.source),bytes=fs.statSync(source.source).size;
      report.sources.push({...source,pairKey:undefined,sha256,bytes,...metadata});save();
    }
    for(const job of jobs){
      const args=encodeArguments(job.sources,job.file),expectedWidth=job.sources.length*1920;
      console.log('Encoding '+job.kind+': '+job.file);
      await ffmpeg(options.ffmpeg,args);
      const metadata=await videoMetadata(options.ffmpeg,job.file),expectedDuration=Math.min(...job.sources.map(s=>s.trim.duration));
      if(metadata.width!==expectedWidth||metadata.height!==1080||metadata.codec!=='h264')throw Error('Output dimensions/codec differ from the declared encoding: '+job.file);
      validateEncodedCadence(metadata,job.file);
      if(Math.abs(metadata.durationSeconds-expectedDuration)>2*frameSeconds+.02)throw Error('Encoded duration differs from the unchanged marker interval: '+job.file);
      report.outputs.push({id:job.id,kind:job.kind,file:job.file,sha256:await fileHash(job.file),bytes:fs.statSync(job.file).size,
        ...metadata,sourceIds:job.sources.map(s=>s.id),sourceHashes:job.sources.map(s=>report.sources.find(item=>item.id===s.id).sha256),
        layout:job.kind==='pair'?{left:'legacy',right:'three',eachWidth:1920,eachHeight:1080}:null,
        timeline:job.sources[0].trim.timeline.kind,
        ...(job.sources[0].trim.timeline.kind==='independent-practice'
          ?{practiceSimulationRanges:job.sources.map(source=>source.trim.timeline),phaseComparison:job.phaseComparison}
          :{replayRange:{start:job.sources[0].trim.replayStart,end:job.sources[0].trim.replayEnd}}),
        markerDurationSeconds:expectedDuration,
        tailOmittedSeconds:job.sources.map(s=>Math.max(0,s.trim.duration-expectedDuration)),
        ffmpeg:{executable:options.ffmpeg,args},encoding});save();
    }
    report.passed=true;
  }catch(error){report.errors.push(error.stack??String(error));throw error;}
  finally{report.finishedAt=new Date().toISOString();save();}
  console.log('Assembly manifest: '+manifestFile);return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const options=parseOptions(process.argv.slice(2));if(options.help)console.log(help);else await assemble(options);}
  catch(error){console.error(error.stack??String(error));process.exitCode=1;}
}
