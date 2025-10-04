type QueueItem = { url:string; method?:string; body?:any; tries?:number };
const KEY = 'wdm_offline_queue_v1';
function read(){ try{ const s=localStorage.getItem(KEY); return s?JSON.parse(s):[] }catch(e){return []} }
function write(q:any){ try{ localStorage.setItem(KEY, JSON.stringify(q)) }catch(e){} }
export function enqueue(item:QueueItem){ const q=read(); q.push(item); write(q); }
export async function processQueue(){ const q=read(); if(!navigator.onLine) return; const remaining=[]; for(const it of q){ try{ const res = await fetch(it.url, { method: it.method||'POST', headers:{'Content-Type':'application/json'}, body: it.body?JSON.stringify(it.body):undefined }); if(!res.ok){ it.tries=(it.tries||0)+1; if(it.tries<5) remaining.push(it); } }catch(e){ it.tries=(it.tries||0)+1; if(it.tries<5) remaining.push(it); } } write(remaining); }
if(typeof window!=='undefined'){ window.addEventListener('online', ()=>{ processQueue(); }); }
export default { enqueue, processQueue };
