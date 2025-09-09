// web/src/lib/liveData.js — minimal, exact, no recomputation
import { fetchGviz, fetchCsv } from "./gviz";

export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MASTER_LOG = "MASTER_LOG";

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

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

export async function loadYearRows(year) {
  const baseUrl = 'http://localhost:8000';
  const res = await fetch(`${baseUrl}/live-countdown?year=${year}`);
  const data = await res.json();

  // Normalize keys + strip quotes
  const rows = data.rows.map(row => {
    const fixed = {};
    for (const [k, v] of Object.entries(row)) {
      const key = k.toLowerCase();
      let value = typeof v === 'string' ? v.replace(/^"+|"+$/g, '') : v;
      fixed[key] = value;
    }
    return fixed;
  });

  return rows; // ← remove filtering and just trust data
}


// Build a map: MASTER_LOG!C (key SONG|ARTIST) -> MASTER_LOG!I (YEAR)
export async function loadReleaseYearMap(){
  const ck = "releaseMap_vFIX1";
  const cached = getCache(ck);
  if (cached){
    return new Map(Object.entries(cached));
  }

  const { rowsArrayF, rowsArrayV } = await fetchGviz({
    sheetId: SHEET_ID,
    sheetName: TAB_MASTER_LOG,
    range: "C:I"
  });

  const map = new Map();
  for (let i = 0; i < rowsArrayF.length; i++){
    const key = String((rowsArrayF[i]?.[0] ?? rowsArrayV[i]?.[0] ?? "")).trim();
    const year = String((rowsArrayF[i]?.[6] ?? rowsArrayV[i]?.[6] ?? "")).trim();
    if (!key) continue;
    if (!map.has(key)) map.set(key, year);
  }
  setCache(ck, Object.fromEntries(map.entries()));
  return map;
}
