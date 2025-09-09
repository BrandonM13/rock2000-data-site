// web/src/lib/liveData.js — CSV-first exact values (no recomputation)
import { fetchGviz, fetchCsv } from "./gviz";

export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MASTER_LOG = "MASTER_LOG";

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

function getCache(key){ try{ const raw = sessionStorage.getItem(key); if(!raw) return null; const obj = JSON.parse(raw); if(!obj||!obj.t||!obj.v) return null; if(Date.now()-obj.t> CACHE_TTL_MS) return null; return obj.v; }catch{ return null; }}
function setCache(key, v){ try{ sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); }catch{} }

/** Load year rows from sheet named exactly with the year.
 * Columns: RANK, SONG, ARTIST, CHANGE come directly from that sheet (display text).
 * YEAR is not included here; it is merged in the page using the releaseYearMap.
 */
export async function loadYearRows(targetYear){
  const ck = `yearRows_${targetYear}_vCSV1`;
  const cached = getCache(ck);
  if (cached) return cached;

  // CSV gives us exactly what the sheet displays.
  const rows = await fetchCsv({ sheetId: SHEET_ID, sheetName: String(targetYear), range: "A:D" });

  const out = [];
  for (const r of rows){
    const rankTxt = (r[0] ?? "").trim();
    const song = (r[1] ?? "").trim();
    const artist = (r[2] ?? "").trim();
    let change = r[3]; // as displayed (DEBUT, RE-ENTRY, '-', numbers)
    const rank = Number(rankTxt);

    // Skip headers or blank/incomplete rows
    if (!Number.isFinite(rank) || !song || !artist) continue;

    out.push({ rank, song, artist, change, keyExact: `${song}|${artist}` });
  }

  out.sort((a,b)=> a.rank - b.rank);
  setCache(ck, out);
  return out;
}

/** Build a release-year map from MASTER_LOG (key at C, YEAR at I), exact strings. */
export async function loadReleaseYearMap(){
  const ck = "releaseMap_vCSV1";
  const cached = getCache(ck);
  if (cached) return new Map(Object.entries(cached));

  // Fetch C:I so we can read C (index 0 in this range) and I (index 6 in this range)
  const rows = await fetchCsv({ sheetId: SHEET_ID, sheetName: TAB_MASTER_LOG, range: "C:I" });
  const map = new Map();
  for (const r of rows){
    const key = (r[0] ?? "").trim();   // MASTER_LOG!C:C (exact SONG|ARTIST)
    const yr  = (r[6] ?? "").trim();   // MASTER_LOG!I:I (displayed YEAR)
    if (!key) continue;
    if (!map.has(key)) map.set(key, yr);
  }
  const obj = Object.fromEntries(map.entries());
  setCache(ck, obj);
  return map;
}
