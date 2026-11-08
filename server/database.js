import pg from 'pg';
let pool;
let initialized=false;
export async function database() {
 if (!process.env.DATABASE_URL) throw new Error('Connect Neon in Vercel Storage, then redeploy.');
 pool ||= new pg.Pool({connectionString:process.env.DATABASE_URL,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
 return pool;
}
export function emptyState() {
 return {session:{id:1,status:'ongoing',start_time:'',total_players:0,total_courts:3},players:[],courtState:[1,2,3].map(n=>({courtNumber:String(n),players:[]})),courtTimers:{},queue:[],syncedTimers:{},matchResults:[],logbook:[],courtRentals:[],paddleRentals:[],products:[],stockIn:[],stockOut:[],suppliers:[]};
}
export async function transaction(fn, testPool) {
 const client=await (testPool || await database()).connect();
 try {
  await client.query('BEGIN');
  await client.query('SELECT pg_advisory_xact_lock(741923)');
  if (!initialized || testPool) {
  await client.query('CREATE TABLE IF NOT EXISTS northyard_state (id integer PRIMARY KEY, data jsonb NOT NULL)');
  await client.query('CREATE TABLE IF NOT EXISTS northyard_users (id serial PRIMARY KEY,email text UNIQUE NOT NULL,name text NOT NULL,password_hash text NOT NULL,role text NOT NULL,status text NOT NULL DEFAULT \'Active\',created_at timestamptz NOT NULL DEFAULT now())');
  await client.query('CREATE TABLE IF NOT EXISTS northyard_auth_sessions (token_hash text PRIMARY KEY,user_id integer REFERENCES northyard_users(id) ON DELETE CASCADE,expires_at timestamptz NOT NULL)');
  await client.query('INSERT INTO northyard_state VALUES (1,$1) ON CONFLICT DO NOTHING',[JSON.stringify(emptyState())]);
  await client.query('CREATE TABLE IF NOT EXISTS northyard_login_attempts (key text PRIMARY KEY, attempts integer NOT NULL, window_start timestamptz NOT NULL)');
  }
  const {rows}=await client.query('SELECT data FROM northyard_state WHERE id=1 FOR UPDATE');
  const original=JSON.stringify(rows[0].data);
  const result=await fn(client,rows[0].data);
  if (JSON.stringify(rows[0].data)!==original) await client.query('UPDATE northyard_state SET data=$1 WHERE id=1',[JSON.stringify(rows[0].data)]);
  await client.query('COMMIT');initialized=true;return result;
 } catch(error) {await client.query('ROLLBACK');throw error;} finally {client.release();}
}
