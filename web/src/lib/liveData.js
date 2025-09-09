// web/src/lib/liveData.js (v3b) — robust CHANGE parsing
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
function valueFor(obj, candidates){
  const keys = Object.keys(obj);
  const canon = (k) => k.toString().trim().toLowerCase().replace(/[\s_]+/g, " ");
  const map = new Map(keys.map(k => [canon(k), k]));
  for (const cand of candidates){
    const kk = canon(cand);
    if (map.has(kk)) return obj[map.get(kk)];
  }
  return null;
}

const HDR_YEAR = {
  rank:   ["rank","position","rnk","#"],
  song:   ["song","songs","title","song_title","all_caps_title","title (song)"],
  artist: ["artist","artists","artist_name","all_caps_artist","artist (band)"],
  change: ["change","delta","movement"],
  status: ["status","state","type","debut/re-entry","debut re-entry","debut_reentry","change text","change_text"],
};

const HDR_LOG = {
  key:   ["key","song|artist","song_artist_key","master key","master_key","c"],
  relYr: ["release year","release_year","year released","rel year","rel_yr","i"]
};

function normalizeChange(change, status){
  // Treat "", null, undefined, "null", "n/a" as missing
  if (change === null || change === undefined) return null;
  if (typeof change === "string"){
    const s = change.trim().toUpperCase();
    if (!s || s === "NULL" || s === "N/A" || s === "NA") return null;
    if (s === "-" || s === "—") return "-";
    if (s === "DEBUT" || s === "REENTRY" || s === "RE-ENTRY") return s === "REENTRY" ? "RE-ENTRY" : s;
    const n = Number(s);
    if (!Number.isNaN(n)) return n;
  } else if (typeof change === "number"){
    return change;
  }
  // Fallback to status text
  if (status){
    const t = String(status).trim().toUpperCase();
    if (t === "DEBUT" || t === "REENTRY" || t === "RE-ENTRY") return t === "REENTRY" ? "RE-ENTRY" : t;
  }
  return null;
}

export async function loadYearRows(targetYear){
  const ck = `yearRows_${targetYear}_v3b`;
  const cached = getCache(ck);
  if (cached) return cached;

  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: String(targetYear) });
  const out = [];
  for (const r of rows){
    const rank = Number(valueFor(r, HDR_YEAR.rank));
    const song = valueFor(r, HDR_YEAR.song);
    const artist = valueFor(r, HDR_YEAR.artist);
    const rawChange = valueFor(r, HDR_YEAR.change);
    const status = valueFor(r, HDR_YEAR.status);
    if (!rank || !song || !artist) continue;
    const change = normalizeChange(rawChange, status);
    out.push({ rank, song, artist, change, key: `${norm(song)}|${norm(artist)}` });
  }
  out.sort((a,b)=> a.rank - b.rank);
  setCache(ck, out);
  return out;
}

export async function loadReleaseYearMap(){
  const ck = "releaseMap_v3b";
  const cached = getCache(ck);
  if (cached){
    const m = new Map(Object.entries(cached).map(([k,v]) => [k, v]));
    return m;
  }

  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MASTER_LOG });
  const map = new Map();
  for (const r of rows){
    let key = valueFor(r, ["key","c","song|artist","song_artist_key"]);
    if (!key){
      const cols = Object.keys(r);
      if (cols.length >= 3) key = r[cols[2]];
    }
    let rel = valueFor(r, HDR_LOG.relYr);
    if (rel == null){
      const cols = Object.keys(r);
      if (cols.length >= 9) rel = r[cols[8]];
    }
    if (!key) continue;
    const k = norm(String(key));
    const yr = Number(rel) || null;
    if (!map.has(k)) map.set(k, yr);
  }
  const obj = {}; map.forEach((v,k)=> obj[k]=v);
  setCache(ck, obj);
  return map;
}
