import test from 'node:test';
import assert from 'node:assert/strict';
import { backendHandler } from '../server/backend.js';
function response() {return {headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},json(v){this.data=v;return this;}};}
test('unconfigured backend returns an explicit error without fake login',async()=>{
 delete process.env.PHP_BACKEND_ORIGIN;
 const res=response();await backendHandler('auth')({headers:{},method:'POST',body:{email:'test',password:'wrong'},url:'/api/auth?action=login'},res);
 assert.equal(res.code,503);assert.equal(res.data.ok,false);assert.equal(res.headers['Cache-Control'],'private, no-store');
});
test('real backend receives method, query, body and session; cookie domain is rewritten',async()=>{
 process.env.PHP_BACKEND_ORIGIN='https://backend.example/app';
 const previous=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{
  assert.equal(url.href,'https://backend.example/app/api/auth.php?action=login');
  assert.equal(options.method,'POST');assert.equal(options.headers.Cookie,'PHPSESSID=existing');
  assert.deepEqual(JSON.parse(options.body),{email:'test',password:'provided'});
  return {status:200,headers:{get:()=> 'application/json',getSetCookie:()=>['PHPSESSID=new; Domain=backend.example; Path=/app; HttpOnly; Secure; SameSite=Lax']},json:async()=>({ok:true,user:{id:2}})};
 };
 try {const res=response();await backendHandler('auth')({headers:{host:'frontend.example',cookie:'PHPSESSID=existing'},method:'POST',body:{email:'test',password:'provided'},url:'/api/auth?action=login'},res);assert.equal(res.data.user.id,2);assert.ok(!res.headers['Set-Cookie'][0].includes('Domain='));assert.match(res.headers['Set-Cookie'][0],/Path=\//);}finally{globalThis.fetch=previous;delete process.env.PHP_BACKEND_ORIGIN;}
});
test('hosting challenge is reported as a failure rather than accepted as data',async()=>{
 process.env.PHP_BACKEND_ORIGIN='https://backend.example';const previous=globalThis.fetch;
 globalThis.fetch=async()=>({headers:{get:()=> 'text/html'}});
 try {const res=response();await backendHandler('open_play')({headers:{},method:'GET',url:'/api/open_play?action=current'},res);assert.equal(res.code,502);assert.equal(res.data.ok,false);}finally{globalThis.fetch=previous;delete process.env.PHP_BACKEND_ORIGIN;}
});
