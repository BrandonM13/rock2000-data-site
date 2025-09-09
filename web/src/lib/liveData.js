// web/src/lib/liveData.js (v3d) — STRICT: CHANGE from column D of the year tab. No fallbacks.
import { fetchGviz } from "./gviz";

export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MASTER_LOG = "MASTER_LOG";

const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

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

// helper: get the Nth column value from a row (A=0, B=1, C=2, D=3, ...)
function col(row, idx){
  if (Array.isArray(row)) return row[idx];
  const vals = [];
  for (const k of Object.keys(row)) vals.push(row[k]);
  return vals[idx];
}

export async function loadYearRows(targetYear){
  const ck = `yearRows_${targetYear}_v3d`;
  const cached = getCache(ck);
  if (cached) return cached;

  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: String(targetYear) });
  const out = [];
  for (const r of rows){
    const rank   = Number(col(r, 0)); // A
    const song   = col(r, 1);         // B
    const artist = col(r, 2);         // C
    const changeCell = col(r, 3);     // D (STRICT)
    if (!rank || !song || !artist) continue;

    // Use exactly what's in column D (numbers, 'DEBUT', 'RE-ENTRY', '-', etc.)
    let change = changeCell;
    if (typeof change === "string") change = change.trim();

    out.push({ rank, song, artist, change, key: `${norm(song)}|${norm(artist)}` });
  }
  out.sort((a,b)=> a.rank - b.rank);
  setCache(ck, out);
  return out;
}

// Still used only for showing release year (unrelated to CHANGE).
export async function loadReleaseYearMap(){
  const ck = "releaseMap_v3d";
  const cached = getCache(ck);
  if (cached){
    const m = new Map(Object.entries(cached).map(([k,v]) => [k, v]));
    return m;
  }
  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MASTER_LOG });
  const map = new Map();
  for (const r of rows){
    const vals = Object.keys(r).map(k=>r[k]);
    const key = (vals[2] ?? "").toString();
    const yr  = Number(vals[8]);
    if (!key) continue;
    const k = norm(key);
    const v = Number.isFinite(yr) ? yr : null;
    if (!map.has(k)) map.set(k, v);
  }
  const obj = {}; map.forEach((v,k)=> obj[k]=v);
  setCache(ck, obj);
  return map;
}
