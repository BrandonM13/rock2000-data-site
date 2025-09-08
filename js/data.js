import { SHEET_ID, TAB_MCD, EXPECTED } from './config.js';
const cols = json.table.cols.map(c => (c.label || c.id || '').trim());
const rows = (json.table.rows || []).map(r => (r.c || []).map(c => (c ? c.v : '')));
return { cols, rows };
}


export async function loadData(statusEl){
statusEl && (statusEl.textContent = 'Loading…');
const { cols, rows } = await fetchSheet(TAB_MCD);


const iYear = headerIndex(cols, EXPECTED.year);
const iRank = headerIndex(cols, EXPECTED.rank);
const iKey = headerIndex(cols, EXPECTED.key);
const iSong = headerIndex(cols, EXPECTED.song);
const iArt = headerIndex(cols, EXPECTED.artist);


if(iYear===-1 || iRank===-1 || (iKey===-1 && (iSong===-1 || iArt===-1))){
const msg = `Header mapping failed. Detected: [${cols.join(', ')}]`;
statusEl && (statusEl.textContent = msg);
throw new Error(msg);
}


// reset
state.allYears = new Set();
state.byKey.clear(); state.byArtist.clear(); state.byYearRank.clear(); state.artistSongYear.clear();


for(const r of rows){
const year = r[iYear];
const rank = r[iRank];
if(year==='' || rank==='') continue;
const yr = Number(year), rk = Number(rank);
state.allYears.add(yr);


let song = iSong!==-1 ? r[iSong] : '';
let artist = iArt!==-1 ? r[iArt] : '';
if((!song || !artist) && iKey!==-1 && r[iKey]){
const parts = String(r[iKey]).split('|');
song = song || (parts[0]||'');
artist = artist || (parts[1]||'');
}
if(!(song || artist)) continue;


const sN = norm(song), aN = norm(artist);
const key = `${sN}|${aN}`;


if(!state.byKey.has(key)) state.byKey.set(key, []);
state.byKey.get(key).push({ year: yr, rank: rk, song, artist });


if(!state.byArtist.has(aN)) state.byArtist.set(aN, []);
state.byArtist.get(aN).push({ year: yr, rank: rk, song, artist });


state.byYearRank.set(`${yr}|${rk}`, { year: yr, rank: rk, song, artist });


if(!state.artistSongYear.has(aN)) state.artistSongYear.set(aN, new Map());
const songsMap = state.artistSongYear.get(aN);
if(!songsMap.has(sN)) songsMap.set(sN, { label: song, years: new Map() });
songsMap.get(sN).years.set(yr, rk);
}


const yearsAll = Array.from(state.allYears).sort((a,b)=>a-b);
statusEl && (statusEl.textContent = `Loaded ${rows.length} rows · Years ${yearsAll[0]}–${yearsAll[yearsAll.length-1]} · Artists: ${state.byArtist.size}`);
}