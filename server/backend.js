import {transaction} from './database.js';
import {auth,currentUser} from './auth.js';
import users from './users.js';
import openPlay from './open_play.js';
import rentals from './rentals.js';
import inventory from './inventory.js';
const handlers={open_play:openPlay,court_rentals:rentals('court'),paddle_rentals:rentals('paddle'),products:inventory('products'),stock:inventory('stock'),suppliers:inventory('suppliers')};
export function backendHandler(endpoint,runTransaction=transaction){return async(req,res)=>{res.setHeader('Cache-Control','private, no-store');try{
 req.query=Object.fromEntries(new URL(req.url,'https://local.invalid').searchParams);req.body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
 if(!['GET','POST','PUT','DELETE'].includes(req.method))return res.status(405).json({ok:false,error:'Method not allowed'});
 if(req.method!=='GET'&&req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({ok:false,error:'Request origin does not match.'});
 const result=await runTransaction(async(db,state)=>{const buffer={code:200,headers:{},status(n){this.code=n;return this;},setHeader(k,v){this.headers[k]=v;},json(data){this.data=data;return this;}};
 if(endpoint==='auth'){await auth(db,req,buffer);return buffer;}
 const publicDisplay=endpoint==='open_play'&&req.method==='GET'&&req.query.action==='get_display_data';const user=publicDisplay?null:await currentUser(db,req);if(!publicDisplay&&!user)return buffer.status(401).json({ok:false,error:'Please sign in.'});
 if(endpoint==='users')await users(db,req,buffer,user);else if(handlers[endpoint])await handlers[endpoint](req,buffer,state);else return buffer.status(404).json({ok:false,error:'Unknown API'});return buffer;});
 for(const [k,v] of Object.entries(result.headers))res.setHeader(k,v);return res.status(result.code).json(result.data);
 }catch(error){const status=error.status||(error.code==='23505'?409:process.env.DATABASE_URL?500:503);return res.status(status).json({ok:false,error:error.status?error.message:error.code==='23505'?'This record already exists.':!process.env.DATABASE_URL?'Connect Neon in Vercel Storage and redeploy.':'Database operation failed. Please retry.'});}};}
