import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),publicRoot=path.join(root,'opendesign');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webm':'video/webm','.svg':'image/svg+xml','.woff2':'font/woff2'};
http.createServer((req,res)=>{
  try{
    let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(name==='/')name='/opendesign/mockups/planet-construction-review/index.html';if(name.endsWith('/'))name+='index.html';
    const file=path.resolve(root,'.'+name);
    if(req.method!=='GET'||!file.startsWith(publicRoot+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});fs.createReadStream(file).pipe(res);
  }catch{res.writeHead(400);res.end();}
}).listen(8289,'127.0.0.1',()=>console.log('Independent review: http://127.0.0.1:8289/opendesign/mockups/planet-construction-review/'));
