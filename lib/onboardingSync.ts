import supabase from './supabaseClient';
const STORAGE_KEY_PREFIX = 'wdm_onboarding_';
export function getLocalKey(userId:string){ return `${STORAGE_KEY_PREFIX}${userId}`; }
export function readLocal(userId:string){ try{ const s = localStorage.getItem(getLocalKey(userId)); return s?JSON.parse(s):null }catch(e){return null} }
export function writeLocal(userId:string,payload:any){ try{ localStorage.setItem(getLocalKey(userId), JSON.stringify(payload)); }catch(e){} }
export async function fetchRemote(userId:string){ const { data, error } = await supabase.from('onboarding_progress').select('step,data').eq('user_id', userId).single(); if(error) throw error; return data; }
export async function upsertRemote(userId:string,payload:any){ const { error } = await supabase.from('onboarding_progress').upsert({ user_id:userId, step: payload.step, data: payload.data }, { onConflict: 'user_id' }); if(error) throw error; return true; }
