import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
const digest=v=>createHash('sha256').update(v).digest('hex');
export function hashPassword(password){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex');}
export function verifyPassword(password,hash){const [salt,key]=hash.split(':');if(!salt||!key)return false;const stored=Buffer.from(key,'hex');const actual=scryptSync(password,salt,64);return stored.length===actual.length&&timingSafeEqual(stored,actual);}
export async function currentUser(db,req){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ny_session='))?.slice(11);if(!token)return null;return (await db.query("SELECT u.id,u.email,u.name,u.role,u.status FROM northyard_users u JOIN northyard_auth_sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.status='Active'",[digest(token)])).rows[0]||null;}
export async function auth(db,req,res){const action=req.query.action;const body=req.body||{};
 if(action==='me'){const user=await currentUser(db,req);return res.status(user?200:401).json({ok:!!user,user});}
 if(action==='logout'){const token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('ny_session='))?.slice(11);if(token)await db.query('DELETE FROM northyard_auth_sessions WHERE token_hash=$1',[digest(token)]);res.setHeader('Set-Cookie','ny_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');return res.json({ok:true});}
 if(action!=='login'||req.method!=='POST')return res.status(403).json({ok:false,error:'Contact the administrator to create an account.'});
 const email=String(body.email||'').trim().toLowerCase();const password=String(body.password||'');
 const key=digest(email);
 await db.query("DELETE FROM northyard_login_attempts WHERE window_start < now()-interval '15 minutes'");
 const attempt=(await db.query("INSERT INTO northyard_login_attempts(key,attempts,window_start) VALUES($1,1,now()) ON CONFLICT(key) DO UPDATE SET attempts=northyard_login_attempts.attempts+1 RETURNING attempts",[key])).rows[0];
 if(attempt.attempts>15)return res.status(429).json({ok:false,error:'Too many login attempts. Wait 15 minutes.'});
 const count=(await db.query('SELECT count(*)::int AS count FROM northyard_users')).rows[0].count;
 if(!count){const initialEmail=process.env.ADMIN_EMAIL;const initialPassword=process.env.ADMIN_PASSWORD;if(!initialEmail||!initialPassword||initialPassword.length<12)return res.status(503).json({ok:false,error:'Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) in Vercel to initialize the first administrator.'});await db.query("INSERT INTO northyard_users(email,name,password_hash,role) VALUES($1,'Administrator',$2,'Administrator')",[initialEmail.toLowerCase(),hashPassword(initialPassword)]);}
 const user=(await db.query('SELECT * FROM northyard_users WHERE email=$1',[email])).rows[0];
 if(!user||user.status!=='Active'||!verifyPassword(password,user.password_hash))return res.status(401).json({ok:false,error:'Incorrect email or password'});
 await db.query('DELETE FROM northyard_login_attempts WHERE key=$1',[key]);
 await db.query('DELETE FROM northyard_auth_sessions WHERE expires_at<=now()');
 const token=randomBytes(32).toString('hex');await db.query("INSERT INTO northyard_auth_sessions VALUES($1,$2,now()+interval '12 hours')",[digest(token),user.id]);res.setHeader('Set-Cookie',`ny_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`);delete user.password_hash;return res.json({ok:true,user});
}
