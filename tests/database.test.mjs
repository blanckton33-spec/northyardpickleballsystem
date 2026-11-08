import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {transaction} from '../server/database.js';
import {backendHandler} from '../server/backend.js';
function response(){return {headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;},json(data){this.data=data;return this;}};}
test('Postgres schema, authentication, permissions, persistence and rollback',async()=>{
 const sql=new PGlite();const pool={async connect(){return {query:(query,params)=>query.includes('pg_advisory_xact_lock')?Promise.resolve({rows:[]}):sql.query(query,params),release(){}};}};
 const run=fn=>transaction(fn,pool);
 const call=async(endpoint,action,method='GET',body={},cookie='')=>{const res=response();await backendHandler(endpoint,run)({url:'/api/'+endpoint+'?action='+action,method,body,headers:{host:'localhost',cookie}},res);return res;};
 process.env.ADMIN_EMAIL='owner@example.test';process.env.ADMIN_PASSWORD='a-long-test-password';
 try {
  assert.equal((await call('open_play','current')).code,401);
  assert.equal((await call('auth','login','POST',{email:'owner@example.test',password:'wrong'})).code,401);
  const login=await call('auth','login','POST',{email:'owner@example.test',password:'a-long-test-password'});assert.equal(login.code,200);assert.ok(login.data.ok);
  const cookie=login.headers['Set-Cookie'].split(';')[0];
  const added=await call('open_play','add_player','POST',{name:'Persistent Player'},cookie);assert.ok(added.data.ok);
  const read=await call('open_play','current','GET',{},cookie);assert.equal(read.data.players[0].name,'Persistent Player');
  await assert.rejects(run(async(db,s)=>{s.players=[];throw new Error('rollback');}),/rollback/);
  assert.equal((await call('open_play','current','GET',{},cookie)).data.players.length,1);
  const exposed=await call('open_play','get_display_data');assert.equal(exposed.code,200);assert.equal(exposed.data.logbook,undefined);
  const create=await call('users','','POST',{name:'Staff',email:'staff@example.test',password:'another-long-password',role:'Staff',status:'Active'},cookie);assert.ok(create.data.ok);
  const staff=await call('auth','login','POST',{email:'staff@example.test',password:'another-long-password'});const staffCookie=staff.headers['Set-Cookie'].split(';')[0];assert.equal((await call('users','','GET',{},staffCookie)).code,403);
  await call('auth','logout','POST',{},cookie);assert.equal((await call('auth','me','GET',{},cookie)).code,401);
  for(let n=0;n<16;n++)await call('auth','login','POST',{email:'blocked@example.test',password:'wrong'});
  assert.equal((await call('auth','login','POST',{email:'blocked@example.test',password:'wrong'})).code,429);
 } finally {delete process.env.ADMIN_EMAIL;delete process.env.ADMIN_PASSWORD;await sql.close();}
});
