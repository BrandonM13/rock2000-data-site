// web/src/lib/liveData.js (v2) — per-year tabs, precomputed CHANGE
import { fetchGviz } from "./gviz";

export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MASTER_LOG = "MASTER_LOG";

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
};

const HDR_LOG = {
  key:   ["key","song|artist","song_artist_key","master key","master_key","c"],
  relYr: ["release year","release_year","year released","rel year","rel_yr","i"]
};

export async function loadYearRows(targetYear){
  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: String(targetYear) });
  const out = [];
  for (const r of rows){
    const rank = Number(valueFor(r, HDR_YEAR.rank));
    const song = valueFor(r, HDR_YEAR.song);
    const artist = valueFor(r, HDR_YEAR.artist);
    let change = valueFor(r, HDR_YEAR.change);
    if (!rank || !song || !artist) continue;
    const num = Number(change);
    if (!Number.isNaN(num) && change !== "" && change !== null) change = num;
    out.push({ rank, song, artist, change, key: `${norm(song)}|${norm(artist)}` });
  }
  out.sort((a,b)=> a.rank - b.rank);
  return out;
}

export async function loadReleaseYearMap(){
  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MASTER_LOG });
  const map = new Map();
  for (const r of rows){
    let key = valueFor(r, HDR_LOG.key);
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
  return map;
}
