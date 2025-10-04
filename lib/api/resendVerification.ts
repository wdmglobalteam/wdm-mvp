export async function resendVerification(email: string) {
  const fnUrl = process.env.NEXT_PUBLIC_RESEND_VERIF_FN_URL || '';
  if(!fnUrl) return { ok:false, message:'Resend function not configured' };
  try{
    const r = await fetch(fnUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
    if(!r.ok) return { ok:false, message: await r.text() };
    return { ok:true, message: 'Sent' };
  }catch(e:any){ return { ok:false, message: e?.message || String(e) }; }
}
