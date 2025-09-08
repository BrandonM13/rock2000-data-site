// web/src/lib/artistData.js (v4 — use SONG/ARTIST columns only; no KEY fallback)
import { fetchGviz } from "./gviz";

// Sheet config
export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MCD = "MasterCountdownData";

/**
 * Normalization used for artist/song keys.
 * Matches previous legacy behavior: uppercase, replace & -> AND,
 * strip quotes, collapse whitespace.
 */
export function norm(s){
  return (s ?? "")
    .toString()
    .normalize("NFKD")
    .toUpperCase()
    .replace(/&/g,"AND")
    .replace(/['\"`]/g,"")
    .replace(/\s+/g," ")
    .trim();
}

/** Case/space/underscore-insensitive column lookup */
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

// IMPORTANT: we now read SONGS from col D and ARTISTS from col E (i.e., sheet-provided)
// so we *do not* derive from KEY anymore.
const HDR = {
  year:   ["year","release_year","yr"],
  rank:   ["rank","position"],
  song:   ["songs","song","title","song_title","all_caps_title","all caps title","SONGS","TITLE"],
  artist: ["artists","artist","artist_name","all_caps_artist","all caps artist","ARTISTS","ARTIST"],
};

export async function loadArtistData() {
  const { rows } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MCD });
  const entries = [];
  const yearSet = new Set();

  for (const r of rows) {
    const year = Number(valueFor(r, HDR.year));
    const rank = Number(valueFor(r, HDR.rank));
    const song = valueFor(r, HDR.song);
    const artist = valueFor(r, HDR.artist);

    // Skip any row that doesn't provide SONG or ARTIST explicitly.
    if (!year || !rank || !song || !artist) continue;

    yearSet.add(year);
    entries.push({ year, rank, song, artist });
  }

  // Build index: ARTIST -> SONG -> [{year, rank}] sorted by year
  const byArtistSong = new Map();
  for (const e of entries) {
    const a = norm(e.artist);
    const s = norm(e.song);
    if (!byArtistSong.has(a)) byArtistSong.set(a, new Map());
    const m = byArtistSong.get(a);
    if (!m.has(s)) m.set(s, { song: e.song, artist: e.artist, list: [] });
    m.get(s).list.push({ year: e.year, rank: e.rank });
  }

  for (const [, m] of byArtistSong) {
    for (const [, obj] of m) obj.list.sort((a, b) => a.year - b.year);
  }

  // Render years (newest -> oldest), 2002+
  const years = Array.from(yearSet).filter(y => y >= 2002).sort((a,b)=>b-a);
  return { byArtistSong, years };
}

// CHANGE column logic (current vs previous year)
function computeChange(map, currentYear, previousYear){
  const hasCurr = map.has(currentYear);
  if (!hasCurr) return "";
  if (map.has(previousYear)) {
    const diff = map.get(previousYear) - map.get(currentYear); // +ve improved
    return diff === 0 ? "-" : diff;
  }
  const hadBefore = [...map.keys()].some(y => y < currentYear);
  return hadBefore ? "RE-ENTRY" : "DEBUT";
}

export function computeRowsForArtist(byArtistSong, artistQuery, years) {
  const a = norm(artistQuery);
  const songsMap = byArtistSong.get(a);
  if (!songsMap) return { total: 0, rows: [] };

  const currentYear = years[0];
  const previousYear = years[1];

  const rows = [];
  for (const [, obj] of songsMap) {
    const list = obj.list;
    const map = new Map(list.map(x => [x.year, x.rank]));

    const change = computeChange(map, currentYear, previousYear);
    const ranks = list.map(x => x.rank);
    const best = ranks.length ? Math.min(...ranks) : "";
    const avg  = ranks.length ? Math.round(ranks.reduce((a,b)=>a+b,0) / ranks.length) : "";

    const cells = years.map(y => (map.has(y) ? map.get(y) : ""));

    rows.push({ song: obj.song, artist: obj.artist, change, best, average: avg, cells });
  }

  // Sort by Song title (A→Z)
  rows.sort((a,b)=> a.song.localeCompare(b.song));
  return { total: rows.length, rows };
}

// === Colors (dark): green -> black -> red ===
function clamp01(x){ return Math.max(0, Math.min(1,x)); }
function lerp(a,b,t){ return a + (b-a)*t; }
function hexToRgb(h){
  const s = h.replace('#','');
  return { r:parseInt(s.slice(0,2),16), g:parseInt(s.slice(2,4),16), b:parseInt(s.slice(4,6),16) };
}
function rgbToHex({r,g,b}){
  const to = (n)=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0');
  return `#${to(r)}${to(g)}${to(b)}`;
}
const DARK_GREEN = '#1e7a46';
const DARK_RED   = '#8e1a1a';
const BLACK      = '#000000';
function mix(c1, c2, t){
  const a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex({ r: lerp(a.r,b.r,t), g: lerp(a.g,b.g,t), b: lerp(a.b,b.b,t) });
}
export function heatForRank(rank){
  if (!rank || isNaN(rank)) return "";
  const t = clamp01((rank - 1) / (2000 - 1));
  if (t <= 0.5){ return mix(DARK_GREEN, BLACK, t/0.5); }
  return mix(BLACK, DARK_RED, (t-0.5)/0.5);
}
export function colorForChange(val){
  if (val === "") return { bg: "", color: "#e5e7eb" };
  if (val === "-") return { bg: "#000000", color: "#e5e7eb" };
  if (val === "DEBUT") return { bg: "#b08900", color: "#000000" };
  if (val === "RE-ENTRY") return { bg: "#000000", color: "#f59e0b" };
  const num = Number(val);
  if (isNaN(num)) return { bg: "", color: "#e5e7eb" };
  return { bg: num > 0 ? DARK_GREEN : DARK_RED, color: "#ffffff" };
}
