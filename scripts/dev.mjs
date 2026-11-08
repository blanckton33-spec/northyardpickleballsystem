import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {backendHandler} from '../server/backend.js';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.jpeg':'image/jpeg'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/')){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>1000000){res.writeHead(413);res.end();return;}}req.body=raw?JSON.parse(raw):{};res.status=n=>{res.statusCode=n;return res;};res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};await backendHandler(url.pathname.split('/').pop().replace(/\.php$/,''))(req,res);return;}const routes={'/':'index.html','/display':'display.html','/display.php':'display.html','/openplay':'openplay.html','/openplay.php':'openplay.html'};const file=path.resolve(root,routes[url.pathname]||'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root)){res.writeHead(403);res.end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(Number(process.env.PORT)||5173,'127.0.0.1',()=>console.log('North Yard: http://127.0.0.1:5173 — set DATABASE_URL for API access'));
