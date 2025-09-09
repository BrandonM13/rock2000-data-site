// web/src/lib/liveData.js (v3f) — STRICT: read A:D; CHANGE=D; bump cache key
import { fetchGviz } from "./gviz";

export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MASTER_LOG = "MASTER_LOG";

const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12h

function getCache(key){
  try{
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.t || !obj.v) return null;
    if (Date.now() - obj.t > CACHE_TTL_MS) return null;
    return obj.v;
  }catch{ return null; }
}
function setCache(key, v){
  try{ sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); }catch{}
}

export function norm(s){
  return (s ?? "").toString().normalize("NFKD").toUpperCase().replace(/&/g,"AND").replace(/['\"`]/g,"").replace(/\s+/g," ").trim();
}

export async function loadYearRows(targetYear){
  const ck = `yearRows_${targetYear}_v3f`; // bump to invalidate any old caches
  const cached = getCache(ck);
  if (cached) return cached;

  const { rowsArray } = await fetchGviz({ sheetId: SHEET_ID, sheetName: String(targetYear), range: "A:D" });
  const out = [];
  for (const arr of rowsArray){
    const rank = Number(arr[0]);
    const song = arr[1];
    const artist = arr[2];
    let change = arr[3];
    if (!rank || !song || !artist) continue;
    if (typeof change === "string") change = change.trim();
    out.push({ rank, song, artist, change, key: `${norm(song)}|${norm(artist)}` });
  }
  out.sort((a,b)=> a.rank - b.rank);
  setCache(ck, out);
  return out;
}

export async function loadReleaseYearMap(){
  // unchanged; shown elsewhere only
  const ck = "releaseMap_v3e";
  const cached = getCache(ck);
  if (cached){
    const m = new Map(Object.entries(cached).map(([k,v]) => [k, v]));
    return m;
  }
  const { rowsArray } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MASTER_LOG });
  const map = new Map();
  for (const arr of rowsArray){
    const key = arr[2] ? String(arr[2]) : "";
    const yr  = Number(arr[8]);
    if (!key) continue;
    const k = norm(key);
    const v = Number.isFinite(yr) ? yr : null;
    if (!map.has(k)) map.set(k, v);
  }
  const obj = {}; map.forEach((v,k)=> obj[k]=v);
  setCache(ck, obj);
  return map;
}
