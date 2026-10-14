import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const defaultRoot=path.join(projectRoot,'output/playwright/three-battle-video/deliverables');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.webm':'video/webm','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.vtt':'text/vtt; charset=utf-8','.txt':'text/plain; charset=utf-8'};

export function parseOptions(args){
  const options={root:defaultRoot,port:8291,help:false};
  for(let i=0;i<args.length;i++){
    const [flag,inline]=args[i].split(/=(.*)/s);
    if(flag==='--help'){options.help=true;continue;}
    if(!['--root','--port'].includes(flag))throw Error('Unknown option: '+flag);
    const value=inline??args[++i];
    if(value===undefined||value===''||value.startsWith('--'))throw Error('Missing value for '+flag);
    options[flag.slice(2)]=value;
  }
  options.root=path.resolve(options.root);options.port=Number(options.port);
  if(!Number.isInteger(options.port)||options.port<0||options.port>65535)throw Error('--port must be an integer between 0 and 65535');
  return options;
}

const inside=(root,file)=>{const relative=path.relative(root,file);return relative===''||(!path.isAbsolute(relative)&&relative!=='..'&&!relative.startsWith('..'+path.sep));};

// A single byte range covers normal HTML video playback and seeking. Unsupported
// multipart or invalid ranges are rejected explicitly, never served incorrectly.
function byteRange(header,size){
  const match=/^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if(!match||(!match[1]&&!match[2])||size===0)return null;
  let start,end;
  if(!match[1]){
    const suffix=Number(match[2]);
    if(!Number.isSafeInteger(suffix)||suffix<=0)return null;
    start=Math.max(0,size-suffix);end=size-1;
  }else{
    start=Number(match[1]);end=match[2]?Number(match[2]):size-1;
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>=size||start>end)return null;
    end=Math.min(end,size-1);
  }
  return {start,end};
}

export function createVideoPreviewServer({root=defaultRoot}={}){
  const directory=fs.realpathSync.native(path.resolve(root));
  if(!fs.statSync(directory).isDirectory())throw Error('Preview root must be a directory');
  return http.createServer(async(req,res)=>{
    const send=status=>{res.writeHead(status,{'Content-Length':0,'Cache-Control':'no-store'});res.end();};
    if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');send(405);return;}
    try{
      // Parse the raw request path before URL normalization can hide dot segments.
      const name=decodeURIComponent((req.url??'').split('?')[0]);
      if(!name.startsWith('/')||/[\u0000-\u001f\\:]/.test(name)||name.split('/').some(part=>part==='.'||part==='..')){send(400);return;}
      const requested=path.resolve(directory,'.'+(name.endsWith('/')?name+'index.html':name));
      if(!inside(directory,requested)){send(403);return;}
      const file=await fs.promises.realpath(requested);
      // Also confine symlinks and Windows directory junctions to the chosen root.
      if(!inside(directory,file)){send(403);return;}
      const stat=await fs.promises.stat(file);
      if(!stat.isFile()){send(404);return;}
      const headers={'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Content-Length':stat.size,'Accept-Ranges':'bytes','Last-Modified':stat.mtime.toUTCString(),'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
      let start=0,end=stat.size-1,status=200;
      // Range applies only to GET. If-Range dates are supported; unknown validators
      // receive the full representation instead of a potentially stale byte range.
      const ifRange=req.headers['if-range'],validatorMatches=!ifRange||(Number.isFinite(Date.parse(ifRange))&&Date.parse(ifRange)>=Math.floor(stat.mtimeMs/1000)*1000);
      if(req.method==='GET'&&req.headers.range&&validatorMatches){
        const range=byteRange(req.headers.range,stat.size);
        if(!range){res.writeHead(416,{...headers,'Content-Range':`bytes */${stat.size}`,'Content-Length':0});res.end();return;}
        ({start,end}=range);status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;headers['Content-Length']=end-start+1;
      }
      res.writeHead(status,headers);
      if(req.method==='HEAD'||stat.size===0){res.end();return;}
      const stream=fs.createReadStream(file,{start,end});
      stream.on('error',error=>res.destroy(error));
      res.on('close',()=>stream.destroy());
      stream.pipe(res);
    }catch(error){
      if(res.headersSent){res.destroy();return;}
      send(error instanceof URIError?400:['ENOENT','ENOTDIR','EISDIR'].includes(error.code)?404:['EACCES','EPERM'].includes(error.code)?403:500);
    }
  });
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{
    const options=parseOptions(process.argv.slice(2));
    if(options.help)console.log('Usage: node scripts/preview-three-battle-videos.mjs [--root DIRECTORY] [--port 8291]\nServes only 127.0.0.1; / opens index.html. MP4/WebM byte-range seeking is supported.');
    else{
      const server=createVideoPreviewServer(options);
      server.on('error',error=>{console.error(error.message);process.exitCode=1;});
      server.listen(options.port,'127.0.0.1',()=>{console.log(`Video preview: http://127.0.0.1:${server.address().port}/`);console.log('Root: '+options.root);});
      const stop=()=>{server.close();server.closeAllConnections();};
      process.once('SIGINT',stop);process.once('SIGTERM',stop);
    }
  }catch(error){console.error(error.message);process.exitCode=1;}
}
