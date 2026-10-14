// Package existing videos and measured data into a static, offline-readable report.
// This script never opens a browser, measures performance, or invokes an encoder.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const defaultBenchmark=path.join(root,'output/playwright/three-battle-comparison/full/results.json');
const defaultComplete=path.join(root,'output/playwright/three-battle-video/fixture-complete-manifest.json');
const views={cinema:'交火视角',overview:'舰队全景',follow:'外部追踪',bridge:'舰桥视角'};
const engines={legacy:'原版 WebGL',three:'Three.js'};
const clipNames={shells:'炮弹与爆炸',missiles:'导弹与尾迹',reaper:'收割者武器',annihilator:'湮灭之星', 'special-reaper':'收割者双炮口', 'practice-reaper':'收割者靶场蓄能与切割'};
const help=`Create a static video report from completed assembly manifests.

node scripts/report-three-battle-videos.mjs --assembly PATH [--assembly PATH ...] --out DIR

  --assembly PATH          Assembly manifest; repeat for full battle and clip suites
  --out DIR                Report root containing index.html, report.md and metrics.json
  --benchmark PATH         Optional no-recording results.json override
  --complete-fixture PATH  Optional complete-battle manifest override
  --visual-qa PATH         Explicit review JSON: status pending|passed|failed,
                           optional note and artifacts: [{path, label}]
  --help

Videos already inside --out are linked in place. External videos and evidence are
copied into media/ and evidence/ with collision-resistant names. Input files are
never changed. Existing generated report files can be regenerated. Visual review
defaults to pending; assembly success is never treated as visual acceptance.
`;

export function parseOptions(argv){
  const options={assemblies:[],out:null,benchmark:defaultBenchmark,completeFixture:defaultComplete,visualQA:null,help:false};
  for(let i=0;i<argv.length;i++){
    const [flag,inline]=argv[i].split(/=(.*)/s);
    if(flag==='--help'){options.help=true;continue;}
    const keys={'--assembly':'assemblies','--out':'out','--benchmark':'benchmark','--complete-fixture':'completeFixture','--visual-qa':'visualQA'},key=keys[flag];
    if(!key)throw Error('Unknown option: '+flag);
    const value=inline??argv[++i];if(!value||value.startsWith('--'))throw Error('Missing value for '+flag);
    if(key==='assemblies')options.assemblies.push(path.resolve(value));else options[key]=path.resolve(value);
  }
  if(!options.help){if(!options.assemblies.length||!options.out)throw Error('--assembly and --out are required');if(new Set(options.assemblies).size!==options.assemblies.length)throw Error('Duplicate --assembly');}
  return options;
}

const finite=value=>typeof value==='number'&&Number.isFinite(value);
const digest=value=>createHash('sha256').update(value).digest('hex');
const readJSON=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const fmt=(value,digits=1)=>finite(value)?value.toLocaleString('zh-CN',{minimumFractionDigits:digits,maximumFractionDigits:digits}):'unavailable';
const md=value=>String(value??'').replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ');
const inside=(directory,file)=>{const relative=path.relative(directory,file);return relative===''||(!path.isAbsolute(relative)&&relative!=='..'&&!relative.startsWith('..'+path.sep));};
const href=(directory,file)=>path.relative(directory,file).split(path.sep).map(encodeURIComponent).join('/');
const median=values=>{const sorted=values.filter(finite).sort((a,b)=>a-b),n=sorted.length;return n?n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2:null;};
const total=values=>values&&Object.values(values).every(finite)?Object.values(values).reduce((a,b)=>a+b,0):null;
const titleOf=(manifest,record,segment)=>{
  const category=path.basename(path.dirname(manifest));
  if(record.fixture?.name==='complete')return '完整战斗 · '+(views[segment.view]??segment.view??'全景');
  if(record.kind==='practice-special-effect-video')return '收割者靶场蓄能与切割';
  return clipNames[category]??views[segment.view]??segment.view??category;
};

function resolveReference(value,manifest){
  if(typeof value!=='string'||!value)throw Error('Missing file reference in '+manifest);
  const choices=path.isAbsolute(value)?[value]:[path.resolve(path.dirname(manifest),value),path.resolve(root,value),path.resolve(value)];
  const found=choices.find(file=>fs.existsSync(file)&&fs.statSync(file).isFile());
  if(!found)throw Error('Cannot find '+value+' referenced by '+manifest);
  return fs.realpathSync.native(found);
}

function makePackager(directory){
  const copied=new Map();
  return function packageFile(file,{media=false,sha256}={}){
    file=fs.realpathSync.native(file);if(inside(directory,file))return href(directory,file);
    if(copied.has(file))return copied.get(file);
    const stat=fs.statSync(file),key=sha256??(media?digest(file+'\0'+stat.size+'\0'+stat.mtimeMs):digest(fs.readFileSync(file)));
    const dest=path.join(directory,media?'media':'evidence',key.slice(0,12)+'-'+path.basename(file));
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    if(!fs.existsSync(dest))fs.copyFileSync(file,dest,fs.constants.COPYFILE_EXCL);
    else if(fs.statSync(dest).size!==stat.size)throw Error('Existing packaged file has a different size: '+dest);
    const url=href(directory,dest);copied.set(file,url);return url;
  };
}

function recordingRow(file,record,segment,index,packageFile,warnings){
  const range=segment.requestedReplay??record.range??{start:0,end:record.options?.duration};
  const usage=segment.usage?.summary?.byPhase?.recording??null;
  if(!usage)warnings.push(titleOf(file,record,segment)+' / '+(engines[segment.engine]??segment.engine)+' 缺少 recording 阶段资源汇总；未用全程数据替代。');
  const evidence={manifest:packageFile(file)};
  for(const [key,value] of Object.entries({frames:segment.framesFile,usage:segment.usage?.outPath,screenshot:segment.screenshot})){
    if(!value)continue;
    try{evidence[key]=packageFile(resolveReference(value,file));}catch(error){warnings.push(error.message);}
  }
  const category=path.basename(path.dirname(file)),full=record.fixture?.name==='complete'&&range.start===0&&range.end>=record.fixture.duration;
  return {id:digest(file+':'+index).slice(0,16),title:titleOf(file,record,segment),category,engine:segment.engine,view:segment.view??record.options?.view,
    fixture:{name:record.fixture?.name??'practice',sha256:record.fixture?.sha256??null,ships:record.fixture?.ships??null,duration:record.fixture?.duration??record.options?.duration},full,
    sampleKind:record.kind==='practice-special-effect-video'?'practice':record.fixture?.name==='special'?'special':full?'complete':'normal',range,
    status:segment.status,metrics:segment.metrics??{},renderMetrics:segment.renderMetrics??{},usage,
    usageStatus:usage?'available':'unavailable',logicalProcessors:segment.usage?.metadata?.logicalProcessors??null,alignment:segment.alignment??null,
    errors:segment.errors??[],evidence,simulationMs:record.fixture?.simulationMs??null,conditions:record.conditions??{},environment:segment.environment??{},
    sourceFingerprint:{start:record.sourceStart?.sha256??null,end:record.sourceEnd?.sha256??null,unchangedDuringCapture:record.sourceUnchanged??null}};
}

function benchmarkRows(report){
  const rows=[];
  for(const [fixture,summaries] of Object.entries(report?.summaries??{}))for(const summary of summaries)for(const engine of ['legacy','three']){
    const measured=(report.results??[]).filter(item=>item.fixture===fixture&&item.view===summary.view&&item.engine===engine&&!item.adaptive);
    rows.push({fixture,view:summary.view,engine,rounds:summary[engine]?.rounds??measured.length,status:summary.status,
      averageFPS:summary[engine]?.averageFPS??null,minOneSecondFPS:summary[engine]?.minOneSecondFPS??null,p95Ms:summary[engine]?.p95Ms??null,
      p50Ms:median(measured.map(item=>item.metrics?.p50Ms)),p99Ms:median(measured.map(item=>item.metrics?.p99Ms)),fpsRatio:summary.fpsRatio,p95Ratio:summary.p95Ratio});
  }
  return rows;
}

export function collectReport(options){
  fs.mkdirSync(options.out,{recursive:true});const directory=fs.realpathSync.native(options.out),packageFile=makePackager(directory),warnings=[],recordings=new Map(),rowMap=new Map(),videos=[],assemblies=[],sources=[];
  const loadRecording=(file,expectedHash)=>{
    file=fs.realpathSync.native(file);
    if(!recordings.has(file)){
      const bytes=fs.readFileSync(file),sha256=digest(bytes),record=JSON.parse(bytes);
      if(expectedHash&&sha256!==expectedHash)throw Error('Recording manifest hash differs from assembly: '+file);
      recordings.set(file,record);sources.push({type:'recording',label:path.basename(path.dirname(file))+' / 录制清单',url:packageFile(file),sha256,status:record.passed===true?'passed':record.finishedAt?'failed':'incomplete',
        sourceStartSHA256:record.sourceStart?.sha256??null,sourceEndSHA256:record.sourceEnd?.sha256??null,sourceUnchangedDuringCapture:record.sourceUnchanged??null});
      if(record.passed!==true||record.sourceUnchanged!==true)warnings.push('录制清单未确认成功或源码未变：'+file);
    }else if(expectedHash&&digest(fs.readFileSync(file))!==expectedHash)throw Error('Recording manifest hash differs from assembly: '+file);
    return recordings.get(file);
  };
  for(const assemblyFile of options.assemblies){
    const assembly=readJSON(assemblyFile),assemblyURL=packageFile(assemblyFile);
    if(!Array.isArray(assembly.outputs)||!Array.isArray(assembly.sources))throw Error('Invalid assembly manifest: '+assemblyFile);
    const entry={url:assemblyURL,passed:assembly.passed===true,errors:assembly.errors??[],encoding:assembly.encoding,synchronization:assembly.synchronization};assemblies.push(entry);
    sources.push({type:'assembly',label:path.basename(path.dirname(assemblyFile))+' / 装配清单',url:assemblyURL,sha256:digest(fs.readFileSync(assemblyFile)),status:entry.passed?'passed':'incomplete'});
    if(!entry.passed)warnings.push('装配尚未确认完成：'+assemblyFile);
    for(const source of assembly.sourceManifests??[])loadRecording(resolveReference(source.path,assemblyFile),source.sha256);
    const sourceMap=new Map();
    for(const source of assembly.sources){
      const file=resolveReference(source.manifest,assemblyFile),record=loadRecording(file,source.manifestSha256),index=source.segmentIndex;
      if(!Number.isInteger(index)||!record.segments?.[index])throw Error('Assembly source segment does not exist: '+source.id);
      if(source.fixtureSha256&&record.fixture?.sha256!==source.fixtureSha256)throw Error('Fixture hash differs between assembly and recording: '+source.id);
      const key=file+':'+index;if(!rowMap.has(key))rowMap.set(key,recordingRow(file,record,record.segments[index],index,packageFile,warnings));
      sourceMap.set(source.id,rowMap.get(key));
    }
    for(const output of assembly.outputs){
      const rows=(output.sourceIds??[]).map(id=>{const row=sourceMap.get(id);if(!row)throw Error('Unknown assembly source ID: '+id);return row;});
      if(!rows.length)throw Error('Video output has no source: '+output.id);
      if(output.kind==='pair'&&(rows.length!==2||rows[0].engine!=='legacy'||rows[1].engine!=='three'||output.layout?.left!=='legacy'||output.layout?.right!=='three'))throw Error('Pair must explicitly place legacy left and Three.js right: '+output.id);
      const videoFile=resolveReference(output.file,assemblyFile);
      if(finite(output.bytes)&&fs.statSync(videoFile).size!==output.bytes)throw Error('Assembled video size differs from manifest: '+output.id);
      const first=rows[0];videos.push({id:output.id,kind:output.kind,url:packageFile(videoFile,{media:true,sha256:output.sha256}),title:first.title,full:rows.every(row=>row.full),
        category:first.category,view:first.view,sampleKind:first.sampleKind,fixture:first.fixture,engine:output.kind==='single'?first.engine:null,
        width:output.width,height:output.height,encodedFPS:output.encodedFPS,durationSeconds:output.durationSeconds,replayRange:output.replayRange??first.range,
        bytes:output.bytes,sha256:output.sha256,sourceRowIds:rows.map(row=>row.id),sourceFingerprints:[...new Set(rows.map(row=>row.sourceFingerprint.start))],assemblyURL,layout:output.layout??null,
        timeline:output.timeline??(first.sampleKind==='practice'?'independent-practice':'shared-replay'),practiceSimulationRanges:output.practiceSimulationRanges??null,phaseComparison:output.phaseComparison??null,tailOmittedSeconds:output.tailOmittedSeconds??null});
    }
  }
  const clipOrder=['cinema','overview','follow','bridge'];
  const rows=[...rowMap.values()].sort((a,b)=>Number(b.full)-Number(a.full)||a.title.localeCompare(b.title,'zh-CN')||a.engine.localeCompare(b.engine));
  videos.sort((a,b)=>Number(b.full)-Number(a.full)||Number(b.kind==='pair')-Number(a.kind==='pair')||Number(b.category==='views')-Number(a.category==='views')||clipOrder.indexOf(a.view)-clipOrder.indexOf(b.view)||a.title.localeCompare(b.title,'zh-CN'));
  let complete=null,benchmark=null;
  if(fs.existsSync(options.completeFixture)){
    const data=readJSON(options.completeFixture),url=packageFile(options.completeFixture);
    complete={...data,evidenceURL:url,survivorTotals:{attacker:total(data.survivors?.attacker),defender:total(data.survivors?.defender)}};
    sources.push({type:'fixture',label:'完整战斗终局清单',url,sha256:digest(fs.readFileSync(options.completeFixture))});
  }else warnings.push('完整战斗终局清单缺失；终局数据 unavailable。');
  if(fs.existsSync(options.benchmark)){
    const data=readJSON(options.benchmark),url=packageFile(options.benchmark);
    benchmark={evidenceURL:url,conditions:data.conditions,fixtures:data.fixtures,errors:data.errors??[],sourceUnchanged:data.sourceUnchanged,sourceFingerprint:{start:data.sourceStart?.sha256??null,end:data.sourceEnd?.sha256??null},rows:benchmarkRows(data),summaries:data.summaries??{}};
    sources.push({type:'benchmark',label:'原无录屏基准 results.json',url,sha256:digest(fs.readFileSync(options.benchmark)),sourceStartSHA256:data.sourceStart?.sha256??null,sourceEndSHA256:data.sourceEnd?.sha256??null,sourceUnchangedDuringCapture:data.sourceUnchanged??null});
  }else warnings.push('原无录屏基准缺失；未用录屏指标替代。');
  let visualQA={status:'pending',note:'待逐段检查舰体、武器效果与驾驶视野；编码、清单或指标正常不代表视觉审核通过。'};
  if(options.visualQA){
    const review=readJSON(options.visualQA);if(!['pending','passed','failed'].includes(review.status))throw Error('Visual QA status must be pending, passed, or failed');
    if(review.artifacts!==undefined&&!Array.isArray(review.artifacts))throw Error('Visual QA artifacts must be an array of {path,label}');
    const artifacts=(review.artifacts??[]).map((artifact,index)=>{
      if(!artifact||typeof artifact.path!=='string'||!artifact.path)throw Error('Visual QA artifact '+index+' requires a file path');
      const file=resolveReference(artifact.path,options.visualQA),url=packageFile(file),label=artifact.label??path.basename(file);
      return {label:String(label),url,sha256:digest(fs.readFileSync(file)),type:path.extname(file).toLowerCase()==='.png'?'image/png':'file'};
    });
    visualQA={...review,artifacts,evidenceURL:packageFile(options.visualQA),source:'explicit-review-file'};
    sources.push({type:'visual-review',label:'画面核验记录',url:visualQA.evidenceURL,sha256:digest(fs.readFileSync(options.visualQA))});
    for(const artifact of artifacts)sources.push({type:'visual-review-artifact',label:artifact.label,url:artifact.url,sha256:artifact.sha256});
  }
  return {kind:'static-video-evidence-report',generatedAt:new Date().toISOString(),visualQA,complete,assemblies,videos,recordings:rows,benchmark,sources,warnings,
    definitions:{videoFPS:'25 fps 为编码视频帧率，不等于游戏渲染 FPS；画面内 FPS 与下表为录制期间实际渲染测量。',
      recording:'录屏数据含浏览器、采样与画面叠加层带来的额外负载，不替代原无录屏基准；不同样本分别列出。',
      resources:'资源表只采用 recording 阶段，每约 1 秒采样；边界 CPU 区间可跨前一阶段约 1 秒。缺失指标显示 unavailable，绝不当作 0。',
      cpu:'CPU % machine 是当前浏览器进程组累计 CPU 时间差 / 墙钟时间 / 逻辑核数；100% 为全部逻辑核。它不含浏览器外部的 FFmpeg 编码器、Node 采集器或 PowerShell 采样进程。',
      memory:'浏览器工作集为各进程驻留页之和，共享页可能重复计数；private bytes 为私有提交内存。CDP JS 堆仅包含该页面 JavaScript 堆，与总进程内存及 performance.memory 面板口径不同。所有内存均为 MiB（2²⁰ 字节）。',
      gpu:'GPU 利用率与显存来自 nvidia-smi，属于整张显卡，包含其他应用；不是本页面独占 GPU 用量。',
      alignment:'同步标记按编码帧定位；25 fps 的一帧为 40 ms。视频播放速度 1×，裁去预热与收尾，不为凑时长添加战斗或冻结尾帧。',
      simulation:'模拟耗时单独报告；离线回放的渲染测量不运行权威模拟，模拟速度变化不能算作渲染收益。独立靶场使用自身练习模拟，不能混入千舰性能结论。'}};
}

function table(headers,rows){return '<div class="table-scroll"><table><thead><tr>'+headers.map(header=>'<th>'+esc(header)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(cell=>'<td>'+esc(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
function markdownTable(headers,rows){return '| '+headers.map(md).join(' | ')+' |\n| '+headers.map(()=>'---').join(' | ')+' |\n'+rows.map(row=>'| '+row.map(md).join(' | ')+' |').join('\n');}
const rowLabel=row=>`${row.title} · ${engines[row.engine]??row.engine} · ${fmt(row.range.start,2)}–${fmt(row.range.end,2)} s`;
const stat=(row,key,field='mean')=>row.usage?.[key]?.[field];
const formatStats=(row,key)=>[fmt(stat(row,key)),fmt(stat(row,key,'max')),String(row.usage?.[key]?.samples??0)];
function reportTables(report){
  const rows=report.recordings;
  return [
    {id:'fps',title:'录屏期间 · 渲染 FPS 与帧时',note:'每个录制片段分别列出，FPS 来自实际渲染帧间隔；资源与视频编码帧率不参与此计算。',headers:['片段 / 引擎 / 时间','平均 FPS','最低一秒 FPS','P50 ms','P95 ms','P99 ms','绘制调用中位数','三角形中位数'],rows:rows.map(row=>[rowLabel(row),fmt(row.metrics.averageFPS),fmt(row.metrics.minOneSecondFPS),fmt(row.metrics.p50Ms,2),fmt(row.metrics.p95Ms,2),fmt(row.metrics.p99Ms,2),fmt(row.renderMetrics.medianCalls,0),fmt(row.renderMetrics.medianTriangles,0)])},
    {id:'cpu',title:'录屏期间 · 浏览器 CPU',note:report.definitions.cpu,headers:['片段 / 引擎 / 时间','CPU % machine 均值','CPU % machine 峰值','有效样本数','逻辑核数'],rows:rows.map(row=>[rowLabel(row),...formatStats(row,'browserCPUPercentMachine'),row.logicalProcessors??'unavailable'])},
    {id:'memory',title:'录屏期间 · 浏览器内存',note:'工作集与私有提交内存分别列示，均为 MiB；工作集相加可能重复计算共享页。',headers:['片段 / 引擎 / 时间','工作集均值 MiB','工作集峰值 MiB','有效样本数','私有提交均值 MiB','私有提交峰值 MiB'],rows:rows.map(row=>[rowLabel(row),...formatStats(row,'workingSetMiB'),fmt(stat(row,'privateBytesMiB')),fmt(stat(row,'privateBytesMiB','max'))])},
    {id:'heap',title:'录屏期间 · 页面 CDP JavaScript 堆',note:'仅页面 JS 堆，不是浏览器总内存，也不与视频面板 performance.memory 采样混合。',headers:['片段 / 引擎 / 时间','CDP 堆均值 MiB','CDP 堆峰值 MiB','有效样本数'],rows:rows.map(row=>[rowLabel(row),...formatStats(row,'jsHeapUsedMiB')])},
    {id:'gpu',title:'录屏期间 · GPU 整卡',note:report.definitions.gpu,headers:['片段 / 引擎 / 时间','显卡','利用率均值 %','利用率峰值 %','显存均值 MiB','显存峰值 MiB','利用率有效样本数'],rows:rows.flatMap(row=>(row.usage?.gpu?.length?row.usage.gpu:[null]).map(gpu=>[rowLabel(row),gpu?.name??'unavailable',fmt(gpu?.utilizationPercent?.mean),fmt(gpu?.utilizationPercent?.max),fmt(gpu?.dedicatedMemoryUsedMiB?.mean),fmt(gpu?.dedicatedMemoryUsedMiB?.max),gpu?.utilizationPercent?.samples??0]))},
  ];
}

function benchmarkTable(report){return {headers:['样本 / 视角','引擎','轮数','平均 FPS 中位数','最低一秒 FPS 中位数','P50 ms 中位数','P95 ms 中位数','P99 ms 中位数','原基准结论'],rows:(report.benchmark?.rows??[]).map(row=>[row.fixture+' / '+(views[row.view]??row.view),engines[row.engine]??row.engine,row.rounds,fmt(row.averageFPS),fmt(row.minOneSecondFPS),fmt(row.p50Ms,2),fmt(row.p95Ms,2),fmt(row.p99Ms,2),row.status])};}
function versionTable(report){return {headers:['测量来源','采集开始源码集合 SHA256','采集结束源码集合 SHA256','该次采集期间未变'],rows:report.sources.filter(source=>['recording','benchmark'].includes(source.type)).map(source=>[source.label,source.sourceStartSHA256??'unavailable',source.sourceEndSHA256??'unavailable',source.sourceUnchangedDuringCapture===true?'是':source.sourceUnchangedDuringCapture===false?'否':'unavailable'])};}
const versionNote='按每次录制或基准清单保留源码集合指纹，不将不同指纹合并为同一版本结论。“期间未变”仅指该次采集的开始至结束；后续补丁范围与补验见画面核验说明及附件。';
function practiceTimeline(video){
  const phaseOffsets=(video.phaseComparison?.phases??[]).map(item=>item.threeMinusLegacyWallSeconds).filter(finite),largest=phaseOffsets.length?Math.max(...phaseOffsets.map(Math.abs))*1000:null;
  return {headers:['引擎','实际练习模拟起止 s','墙钟时长 s','标记区间时长 s','并排输出省略尾部 ms'],
    rows:(video.practiceSimulationRanges??[]).map((range,index)=>[index===0?'原版 WebGL':'Three.js',fmt(range.simulationStart,4)+'–'+fmt(range.simulationEnd,4),fmt(range.wallSpanSeconds,4),fmt(range.markerSpanSeconds,4),fmt(finite(video.tailOmittedSeconds?.[index])?video.tailOmittedSeconds[index]*1000:null,1)]),
    note:`练习双方各自按帧时间积分，仅对齐录像起点，不是同一权威战斗回放。已记录阶段边界的最大墙钟偏差为 ${fmt(largest,1)} ms；阶段是否全部落在一个 40 ms 视频帧内：${video.phaseComparison?.phaseMatchedWithinOneEncodedFrame===true?'是':video.phaseComparison?.phaseMatchedWithinOneEncodedFrame===false?'否':'unavailable'}。并排视频取较短标记区间，完整较长尾部仍保留在源 WebM；不通过改速对齐阶段。`};
}
function simulationTable(report){
  const fixtures=new Map();if(report.complete)fixtures.set(report.complete.sha256,{name:'完整 600 秒样本',...report.complete});
  for(const row of report.recordings)if(row.simulationMs&&!fixtures.has(row.fixture.sha256))fixtures.set(row.fixture.sha256,{...row.fixture,simulationMs:row.simulationMs});
  for(const fixture of report.benchmark?.fixtures??[])if(!fixtures.has(fixture.sha256))fixtures.set(fixture.sha256,fixture);
  return {headers:['样本','记录总时长 s','模拟 step 均值 ms','模拟 step P95 ms','模拟 step P99 ms'],rows:[...fixtures.values()].map(item=>[item.name,fmt(item.duration,0),fmt(item.simulationMs?.mean,3),fmt(item.simulationMs?.p95,3),fmt(item.simulationMs?.p99,3)])};
}
function outcome(report){const f=report.complete;return f?`完整战斗记录 ${fmt(f.duration,0)} 秒 / ${fmt(f.finalTick,0)} tick，状态 ${f.status}，胜负 ${f.winner==='draw'?'平局（draw）':f.winner}。进攻方剩余 ${fmt(f.survivorTotals.attacker,0)} 艘，防守方剩余 ${fmt(f.survivorTotals.defender,0)} 艘。这是全量终局记录；原无录屏基准使用的 80 秒片段仅用于基准采样。`:'完整战斗终局信息 unavailable。';}
function visualLabel(report){return {pending:'待审核',passed:'画面核验通过',failed:'画面核验未通过'}[report.visualQA.status];}
function visualEvidence(report){
  const artifacts=report.visualQA.artifacts??[];
  return artifacts.length?'<div class="evidence"><p>画面核验与版本说明附件：</p><ul>'+artifacts.map(artifact=>`<li><a href="${esc(artifact.url)}">${esc(artifact.label)}</a>${artifact.type==='image/png'?`<details><summary>展开截图</summary><img src="${esc(artifact.url)}" alt="${esc(artifact.label)}" loading="lazy" decoding="async" style="display:block;max-width:100%;height:auto;max-height:900px;object-fit:contain;margin:12px 0"></details>`:''}</li>`).join('')+'</ul></div>':'';
}
function videoCard(video){
  const range=video.replayRange,pair=video.kind==='pair',special=video.sampleKind==='special',practice=video.sampleKind==='practice',timeline=practice?practiceTimeline(video):null,label=pair?'原版 WebGL（左） / Three.js（右）':engines[video.engine]??video.engine;
  return `<article class="video-card"><div class="card-title"><h3>${esc(video.title)}</h3><span>${esc(label)}</span></div>${pair?'<div class="pair-label"><span>← 原版 WebGL</span><span>Three.js →</span></div>':''}<video controls playsinline preload="metadata" width="${esc(video.width)}" height="${esc(video.height)}" style="aspect-ratio:${esc(video.width)}/${esc(video.height)}" aria-label="${esc(video.title+' '+label)}"><source src="${esc(video.url)}" type="${video.url.toLowerCase().endsWith('.webm')?'video/webm':'video/mp4'}">浏览器无法播放，请下载视频。</video><p>${esc(fmt(video.width,0)+' × '+fmt(video.height,0)+' · '+fmt(video.encodedFPS,0)+' fps 视频 · '+(practice?'练习计划 ':'回放 ')+fmt(range.start,2)+'–'+fmt(range.end,2)+' 秒 · 文件时长 '+fmt(video.durationSeconds,2)+' 秒')}${special?' · <strong>10 艘特殊武器补充样本，非千舰性能样本</strong>':''}${practice?' · <strong>独立靶场练习，非千舰性能样本</strong>':''}</p>${timeline?'<p>'+esc(timeline.note)+'</p><details><summary>实际练习时间线</summary>'+table(timeline.headers,timeline.rows)+'</details>':''}<p><a href="${esc(video.url)}" download>下载视频</a> <a href="${esc(video.assemblyURL)}">装配清单</a></p></article>`;
}

export function renderHTML(report){
  const full=report.videos.filter(video=>video.full),pairs=report.videos.filter(video=>!video.full&&video.kind==='pair'),viewPairs=pairs.filter(video=>video.category==='views'),effectPairs=pairs.filter(video=>video.category!=='views'),tables=reportTables(report),bench=benchmarkTable(report),simulation=simulationTable(report),versions=versionTable(report);
  const singles=report.videos.filter(video=>video.kind==='single');
  const section=(id,title,items)=>items.length?`<section id="${id}"><h2>${title}</h2>${items.map(videoCard).join('')}</section>`:'';
  const condition=report.benchmark?.conditions;
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>千舰战斗 · 视频与实测数据</title><style>
*{box-sizing:border-box}html{color-scheme:dark;scroll-behavior:smooth}body{margin:0;background:#0b1119;color:#e9f0f5;font:15px/1.65 system-ui,"Microsoft YaHei",sans-serif}main{max-width:1620px;margin:auto;padding:36px 26px 72px}h1{font-size:32px;margin:0 0 12px}h2{font-size:24px;margin:32px 0 14px}h3{font-size:19px;margin:0}p{margin:9px 0}a{color:#8bd7ff;text-underline-offset:3px}nav{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0}section{scroll-margin-top:18px}.notice,.video-card{padding:18px 22px;background:#131d29;border:1px solid #2b3b4d;border-radius:8px;margin:16px 0}.notice{border-left:4px solid #e3b86b}.muted{color:#acbccb}.card-title,.pair-label{display:flex;justify-content:space-between;align-items:baseline;gap:18px;flex-wrap:wrap}.pair-label{margin:12px 0 5px;color:#cbd7e2}.pair-label span{width:47%}.pair-label span:last-child{text-align:right}video{display:block;width:100%;height:auto;background:#000;margin:10px 0}table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}th,td{padding:10px 12px;text-align:right;border-bottom:1px solid #2b3948;white-space:nowrap}th{color:#b4c7d8;background:#121d28}td:first-child,th:first-child{text-align:left}.table-scroll{overflow:auto;border:1px solid #2b3948;border-radius:6px;margin:12px 0 22px}summary{cursor:pointer;font-weight:600}li{margin:6px 0}code{font-size:13px;overflow-wrap:anywhere}.evidence a{overflow-wrap:anywhere}@media(max-width:700px){main{padding:24px 14px}h1{font-size:27px}.video-card,.notice{padding:14px}.card-title span{font-size:13px}}
</style></head><body><main><header><p class="muted">Three.js 舰船渲染统一 · 可复跑录像证据</p><h1>千舰战斗：视频与实测数据</h1><p>${esc(outcome(report))}</p><nav><a href="#full">完整战斗</a><a href="#views">四视角对照</a><a href="#effects">武器与效果</a><a href="#fps">录屏指标</a><a href="#benchmark">无录屏基准</a><a href="#evidence">原始证据</a><a href="report.md">Markdown 报告</a><a href="metrics.json">完整指标 JSON</a></nav></header>
<div class="notice"><strong>画面核验：${esc(visualLabel(report))}</strong><p>${esc(report.definitions.videoFPS)}</p><p>${esc(report.definitions.recording)}</p><details><summary>核验结论、截图与版本说明</summary><p>${esc(report.visualQA.note??'结论来自单独提供的画面核验文件。')}</p>${report.visualQA.evidenceURL?`<a href="${esc(report.visualQA.evidenceURL)}">查看画面核验记录</a>`:''}${visualEvidence(report)}</details>${report.visualQA.remainingIssues?.length?'<details><summary>已知差异、限制与已修复问题</summary><ul>'+report.visualQA.remainingIssues.map(item=>'<li>'+esc(item)+'</li>').join('')+'</ul></details>':''}</div>
${section('full','完整战斗 · 全量 600 秒',full)}${section('views','四视角对照 · 原版左 / Three.js 右',viewPairs)}${section('effects','武器与效果 · '+visualLabel(report),effectPairs)}
${!full.length&&!pairs.length?section('clips','独立录像',singles):''}
<section id="downloads"><h2>独立 1920 视频下载</h2><p class="muted">并排视频保留左右各 1920 × 1080；独立视频便于单独全屏检查。</p><ul>${singles.map(video=>`<li><a href="${esc(video.url)}" download>${esc(video.title+' · '+(engines[video.engine]??video.engine))}</a> · ${esc(fmt(video.durationSeconds,2))} 秒 · ${esc(fmt((video.bytes??NaN)/1048576))} MiB</li>`).join('')}</ul></section>
<section id="scope"><h2>指标口径</h2>${['resources','memory','alignment'].map(key=>'<p>'+esc(report.definitions[key])+'</p>').join('')}</section>
<section id="versions"><h2>测量所用源码版本</h2><p>${esc(versionNote)}</p>${table(versions.headers,versions.rows)}</section>
${tables.map(item=>`<section id="${item.id}"><h2>${item.title}</h2><p class="muted">${esc(item.note)}</p>${table(item.headers,item.rows)}</section>`).join('')}
<section id="benchmark"><h2>原无录屏基准 · 独立结果</h2><p>此表读取既有验收结果，不使用本次录屏指标重新判定。${condition?esc(`${condition.width} × ${condition.height}、DPR ${condition.dpr}，每视角预热 ${condition.warmMs/1000} 秒、采样 ${condition.sampleMs/1000} 秒、${condition.rounds} 轮，固定画质 ${condition.fixedQuality}。`):'原结果 unavailable。'}</p>${table(bench.headers,bench.rows)}${report.benchmark?`<p><a href="${esc(report.benchmark.evidenceURL)}">原 results.json</a> · 原基准采样期间源码未变：${esc(String(report.benchmark.sourceUnchanged))} · 原基准错误数：${report.benchmark.errors.length}</p>`:''}</section>
<section id="simulation"><h2>模拟耗时 · 与渲染分开</h2><p>${esc(report.definitions.simulation)}</p>${table(simulation.headers,simulation.rows)}</section>
<section id="evidence" class="evidence"><h2>原始清单与采样文件</h2><ul>${report.sources.map(source=>`<li><a href="${esc(source.url)}">${esc(source.label)}</a>${source.status?' · '+esc(source.status):''}</li>`).join('')}</ul><details><summary>各片段逐帧指标、资源 JSONL 与截图</summary><ul>${report.recordings.map(row=>`<li>${esc(rowLabel(row))}：${Object.entries(row.evidence).map(([key,url])=>`<a href="${esc(url)}">${esc(({manifest:'录制清单',frames:'逐帧数据',usage:'资源采样',screenshot:'结束截图'})[key]??key)}</a>`).join(' · ')}</li>`).join('')}</ul></details></section>
${report.warnings.length?'<section><h2>数据缺口与待确认项</h2><ul>'+report.warnings.map(warning=>'<li>'+esc(warning)+'</li>').join('')+'</ul></section>':''}<footer><p class="muted">生成于 ${esc(report.generatedAt)}。此页面为静态证据目录；输入数据、视频与正式游戏存档均未修改。</p></footer></main></body></html>`;
}

export function renderMarkdown(report){
  const bench=benchmarkTable(report),simulation=simulationTable(report),versions=versionTable(report);
  return ['# 千舰战斗视频与指标报告','',outcome(report),'',`视觉审核：**${visualLabel(report)}**。${report.visualQA.note??''}`,'',
    ...(report.visualQA.remainingIssues?.length?['## 已知差异、限制与已修复问题','',...report.visualQA.remainingIssues.map(item=>'- '+item),'']:[]),
    ...(report.visualQA.artifacts?.length?['画面核验与版本说明附件：','',...report.visualQA.artifacts.map(artifact=>`- [${md(artifact.label)}](${artifact.url})`),'']:[]),
    '## 视频目录','',...report.videos.filter(video=>video.full||video.kind==='pair').map(video=>`- [${video.title} · ${video.kind==='pair'?'原版左 / Three.js 右':engines[video.engine]}](${video.url}) — ${video.width} × ${video.height}，视频 ${video.encodedFPS} fps，${video.sampleKind==='practice'?'练习计划':'回放'} ${fmt(video.replayRange.start,2)}–${fmt(video.replayRange.end,2)} 秒。`),'',
    '独立单片下载见 [视频首页](index.html)。完整结构化指标见 [metrics.json](metrics.json)。','',
    ...report.videos.filter(video=>video.sampleKind==='practice').flatMap(video=>{const timeline=practiceTimeline(video);return ['## '+video.title+' · 实际时间线','',timeline.note,'',markdownTable(timeline.headers,timeline.rows),''];}),
    '## 测量口径','',...Object.values(report.definitions).flatMap(text=>[text,'']),
    '## 测量所用源码版本','',versionNote,'',markdownTable(versions.headers,versions.rows),'',
    ...reportTables(report).flatMap(item=>['## '+item.title,'',item.note,'',markdownTable(item.headers,item.rows),'']),
    '## 原无录屏基准','',`该结果来自原验收数据；本次录屏数据不替代基准。${report.benchmark?' [原 results.json]('+report.benchmark.evidenceURL+')。':' unavailable。'}`,'',markdownTable(bench.headers,bench.rows),'',
    '## 模拟耗时','',report.definitions.simulation,'',markdownTable(simulation.headers,simulation.rows),'',
    '## 原始证据','',...report.sources.map(source=>`- [${source.label}](${source.url})${source.status?' — '+source.status:''}`),'',
    '## 待确认项','',...(report.warnings.length?report.warnings.map(text=>'- '+text):['未发现清单数据缺口。视觉审核状态仍由单独画面核验决定。']),'',
    '生成时间：'+report.generatedAt,''].join('\n');
}

export function generateReport(options){
  const report=collectReport(options);
  fs.writeFileSync(path.join(options.out,'metrics.json'),JSON.stringify(report,null,2));
  fs.writeFileSync(path.join(options.out,'index.html'),renderHTML(report));
  fs.writeFileSync(path.join(options.out,'report.md'),renderMarkdown(report));
  console.log(JSON.stringify({index:path.join(options.out,'index.html'),videos:report.videos.length,recordings:report.recordings.length,visualQA:report.visualQA.status,warnings:report.warnings.length},null,2));
  return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{const options=parseOptions(process.argv.slice(2));if(options.help)console.log(help);else generateReport(options);}
  catch(error){console.error(error.stack??String(error));process.exitCode=1;}
}
