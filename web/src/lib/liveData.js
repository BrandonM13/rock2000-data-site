// web/src/lib/liveData.js (v3g) — CHANGE uses formatted text in column D exactly as sheet shows
import { fetchGviz } from "./gviz";

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

export function norm(s){
  return (s ?? "").toString().normalize("NFKD").toUpperCase().replace(/&/g,"AND").replace(/['\"`]/g,"").replace(/\s+/g," ").trim();
}

export async function loadYearRows(targetYear){
  const ck = `yearRows_${targetYear}_v3g`;
  const cached = getCache(ck);
  if (cached) return cached;

  const { rowsArrayF } = await fetchGviz({ sheetId: SHEET_ID, sheetName: String(targetYear), range: "A:D" });
const debug = new URLSearchParams(location.search).has("debug");
if (debug) {
  console.table(rowsArrayF.slice(0, 10).map(r => ({ A:r[0], B:r[1], C:r[2], D:r[3] })));

  // Spot-check THE SUMMONING / SLEEP TOKEN
  const chk = rowsArrayF.find(r =>
    String(r[1]).toUpperCase().includes("THE SUMMONING") &&
    String(r[2]).toUpperCase().includes("SLEEP TOKEN")
  );
  console.log("SUMMONING row (A,B,C,D):", chk);
}

  const out = [];
  for (const arrF of rowsArrayF){
    const rank = Number(arrF[0]);
    const song = arrF[1];
    const artist = arrF[2];
    let change = arrF[3]; // EXACTLY what the sheet displays.
    if (!rank || !song || !artist) continue;
    if (typeof change === "string") change = change.trim();
    out.push({ rank, song, artist, change, key: `${norm(song)}|${norm(artist)}` });
  }
  out.sort((a,b)=> a.rank - b.rank);
  setCache(ck, out);
  return out;
}

export async function loadReleaseYearMap(){
  // unchanged; we still use sheet values for display elsewhere
  const ck = "releaseMap_v3e";
  const cached = getCache(ck);
  if (cached){
    const m = new Map(Object.entries(cached).map(([k,v]) => [k, v]));
    return m;
  }
  // Use full GViz (no custom range) for master log
  const { rowsArrayF } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MASTER_LOG });
  const map = new Map();
  for (const arr of rowsArrayF){
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
