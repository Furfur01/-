import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';

export function discoverFFmpeg(explicit){
  if(explicit)return path.resolve(explicit);if(process.env.FFMPEG_BIN)return process.env.FFMPEG_BIN;
  const appdata=process.env.LOCALAPPDATA;
  if(appdata){const cache=path.join(appdata,'ms-playwright');if(fs.existsSync(cache))for(const name of fs.readdirSync(cache).filter(n=>n.startsWith('ffmpeg-')).sort().reverse()){const file=path.join(cache,name,'ffmpeg-win64.exe');if(fs.existsSync(file))return file;}}
  return 'ffmpeg';
}
async function metadata(command,file){
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
export async function alignVideo(command,file,timing){
  const info=await metadata(command,file),estimatedStart=(timing.captureStart.wallMs-timing.pageCreatedWallMs)/1000,estimatedEnd=(timing.captureEnd.wallMs-timing.pageCreatedWallMs)/1000;
  const fallback={method:'host-clock-estimate',startOffsetSeconds:estimatedStart,endOffsetSeconds:estimatedEnd,exact:false,uncertainty:'The first encoded frame may start after page creation; use the green/magenta pixel markers to align before a frame-exact comparison.',...info};
  if(!info.available)return fallback;
  const tailDuration=Math.max(4,(timing.pageCloseWallMs-timing.captureEnd.wallMs)/1000+2);
  const head=await scanMarker(command,file,{duration:Math.min(info.durationSeconds,estimatedStart+4)}),tailStart=Math.max(0,info.durationSeconds-tailDuration),tail=await scanMarker(command,file,{seek:tailStart,duration:tailDuration});
  if(head.startOffsetSeconds===null||head.startOffsetSeconds===undefined||tail.endOffsetSeconds===null||tail.endOffsetSeconds===undefined)return {...fallback,markerDetection:{head,tail}};
  return {method:'decoded-sync-marker',exact:true,startOffsetSeconds:head.startOffsetSeconds,endOffsetSeconds:tail.endOffsetSeconds,clipDurationSeconds:tail.endOffsetSeconds-head.startOffsetSeconds,resolutionSeconds:info.encodedFPS?1/info.encodedFPS:null,...info,markerDetection:{head,tail}};
}
