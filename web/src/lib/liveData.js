// web/src/lib/liveData.js
import { fetchGviz } from "./gviz";

export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MCD = "MasterCountdownData";
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

const HDR_MCD = {
  year:   ["year","release_year","yr"],
  rank:   ["rank","position"],
  song:   ["songs","song","title","song_title","SONGS","TITLE"],
  artist: ["artists","artist","artist_name","ARTISTS","ARTIST"],
};
const HDR_LOG = {
  key:   ["key","song|artist","song_artist_key","master key","master_key"],
  relYr: ["release year","release_year","year released","rel year","rel_yr","i"]
};

export async function loadYearIndex(){
  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MCD });
  const byYear = new Map();
  const yearSet = new Set();
  for (const r of rows){
    const y = Number(valueFor(r, HDR_MCD.year));
    const rank = Number(valueFor(r, HDR_MCD.rank));
    const song = valueFor(r, HDR_MCD.song);
    const artist = valueFor(r, HDR_MCD.artist);
    if (!y || !rank || !song || !artist) continue;
    if (y < 2002) continue;
    yearSet.add(y);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y).push({ rank, song, artist, key: `${norm(song)}|${norm(artist)}` });
  }
  for (const [y, arr] of byYear){
    arr.sort((a,b)=> a.rank - b.rank);
  }
  const years = Array.from(yearSet).sort((a,b)=>b-a); // newest->oldest
  return { byYear, years };
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

export function computeLiveRows(targetYear, byYear, years, releaseMap){
  const rows = (byYear.get(targetYear) || []).map(x => ({...x}));
  const prevYear = years.find(y => y < targetYear);
  const prev = prevYear ? byYear.get(prevYear) || [] : [];
  const prevIndex = new Map(prev.map(r => [r.key, r.rank]));

  const hadBefore = new Set();
  for (const y of years){
    if (y >= targetYear) continue;
    const arr = byYear.get(y) || [];
    for (const r of arr) hadBefore.add(r.key);
  }

  for (const row of rows){
    if (prevIndex.has(row.key)){
      const diff = prevIndex.get(row.key) - row.rank;
      row.change = (diff === 0) ? "-" : diff;
    } else {
      row.change = hadBefore.has(row.key) ? "RE-ENTRY" : "DEBUT";
    }
    const rel = releaseMap.get(row.key) ?? null;
    row.releaseYear = rel;
  }
  rows.sort((a,b)=> a.rank - b.rank);
  return rows;
}
