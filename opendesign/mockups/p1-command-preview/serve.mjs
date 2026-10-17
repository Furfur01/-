import http from 'node:http';
import fs from 'node:fs';
import {promises as fsp} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=await fsp.realpath(path.resolve(import.meta.dirname,'../../..'));
const prefix='/opendesign/mockups/p1-command-preview/';
const previews=['p1-command-preview','p0-command-preview','three-hud-preview'];
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.glb':'model/gltf-binary','.bin':'application/octet-stream','.woff':'font/woff','.woff2':'font/woff2','.json':'application/json; charset=utf-8'};
const fail=(res,status=404)=>{res.writeHead(status,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'});res.end(status===405?'Method not allowed':'Not found');};
export function createPreviewServer(){return http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method))return fail(res,405);
 let pathname;try{pathname=decodeURIComponent((req.url||'').split('?')[0]);}catch{return fail(res);}
 if(!pathname.startsWith('/')||/[\\\0%]/.test(pathname)||pathname.split('/').some(s=>s==='..'||s==='.'))return fail(res);
 if(pathname==='/'){res.writeHead(302,{Location:prefix+'index.html'});return res.end();}
 if(pathname==='/preview-health'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({service:'p1-independent-preview',pid:process.pid,port:8390}));}
 const chosen=previews.find(name=>pathname.startsWith(`/opendesign/mockups/${name}/`));
 if(!chosen)return fail(res);
 const relative=pathname.slice(`/opendesign/mockups/${chosen}/`.length)||'index.html',ext=path.extname(relative).toLowerCase();
 if(!['index.html','preview.css','preview.js'].includes(relative)&&!(relative.startsWith('assets/')&&mime[ext]&&ext!=='.json'))return fail(res);
 try{const directory=await fsp.realpath(path.join(root,'opendesign/mockups',chosen)),file=await fsp.realpath(path.resolve(directory,relative));if(!file.startsWith(directory+path.sep))return fail(res);const stat=await fsp.stat(file);if(!stat.isFile())return fail(res);
 res.writeHead(200,{'Content-Type':mime[ext],'Content-Length':stat.size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'self'"});if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res);
 }catch{return fail(res);}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createPreviewServer();
 server.on('error',e=>{console.error(e.message);process.exitCode=1;});
 server.listen(8390,'127.0.0.1',()=>console.log(`P1 independent preview: http://127.0.0.1:8390${prefix}index.html | PID ${process.pid}`));
 for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));
}
