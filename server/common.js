export function fail(message,status=400){const e=new Error(message);e.status=status;throw e;}
export function text(value,label,max=150){const s=String(value??'').trim();if(!s||s.length>max||/[<>]/.test(s))fail(`Enter a valid ${label}.`);return s;}
export function number(value,label,min=0,max=999999,integer=false){if(value===''||value===null||value===undefined)fail(`Enter ${label}.`);const n=Number(value);if(!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n)))fail(`Invalid ${label}.`);return n;}
export function nextId(state,key){state.sequences||={};const list=state[key]||[];state.sequences[key]=Math.max(state.sequences[key]||0,...list.map(x=>Number(x.id)||0))+1;return state.sequences[key];}
export function timestamp(){return new Date().toLocaleString('sv-SE',{timeZone:'Asia/Manila'});}
export function date(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||'')||new Date(value).toISOString().slice(0,10)!==value)fail('Invalid date.');return value;}
export function time(value){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(value||''))fail('Invalid time.');return value;}
export function contact(value){if(!/^[+0-9() .-]{7,30}$/.test(value||''))fail('Enter a valid contact number.');return value;}
export function find(list,id){const item=list.find(x=>Number(x.id)===Number(id));if(!item)fail('Record no longer exists. Refresh and try again.',404);return item;}
export function compact(state){const numbers=[...new Set(state.queue.map(q=>Number(q.queue_number)))].sort((a,b)=>a-b);const map=new Map(numbers.map((n,i)=>[n,i+1]));const positions={};state.queue.forEach(q=>{q.queue_number=map.get(Number(q.queue_number));q.position_in_queue=(positions[q.queue_number]=(positions[q.queue_number]||0)+1);});}
