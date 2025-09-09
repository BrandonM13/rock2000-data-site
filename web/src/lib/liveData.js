// web/src/lib/liveData.js — minimal, exact, no recomputation
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

// RANK, SONG, ARTIST, CHANGE from the year sheet (displayed values).
// YEAR is looked up separately via MASTER_LOG.
export async function loadYearRows(targetYear){
  const ck = `yearRows_${targetYear}_vFIX1`;
  const cached = getCache(ck);
  if (cached) return cached;

  const { rowsArrayF, rowsArrayV } = await fetchGviz({
    sheetId: SHEET_ID,
    sheetName: String(targetYear),
    range: "A:D"
  });

  const out = [];
  for (let i = 0; i < rowsArrayF.length; i++){
    const arrF = rowsArrayF[i] || [];
    const arrV = rowsArrayV[i] || [];
    const rank = Number(arrV[0] ?? arrF[0]);
    const song = String(arrF[1] ?? arrV[1] ?? "").trim();
    const artist = String(arrF[2] ?? arrV[2] ?? "").trim();
    let change = arrF[3];
    if (change === null || change === undefined || (typeof change === "string" && change.trim() === "")){
      change = arrV[3] ?? "";
    }
    if (!Number.isFinite(rank) || !song || !artist) continue;
    out.push({ rank, song, artist, change, key: `${song}|${artist}` });
  }

  out.sort((a,b)=> a.rank - b.rank);
  setCache(ck, out);
  return out;
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
