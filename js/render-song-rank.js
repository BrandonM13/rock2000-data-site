import { state } from './data.js';
import { norm } from './utils.js';


export function renderSong(titleRaw, artistRaw, mount){
const entries = state.byKey.get(`${norm(titleRaw)}|${norm(artistRaw)}`) || [];
if(!entries.length){ mount.innerHTML = `<div class="text-gray-500">No matches</div>`; return; }
const any = entries[0];
const best = Math.min(...entries.map(e=>e.rank));
const avg = Math.round(entries.reduce((a,b)=>a+b.rank,0)/entries.length);
const years = entries.map(e=>e.year);
mount.innerHTML = `
<div class="font-medium">${any.song} by ${any.artist}</div>
<div>Years: ${Math.min(...years)}–${Math.max(...years)} · Best <strong>#${best}</strong> · Avg <strong>#${avg}</strong></div>
`;
}


export function renderRank(year, rank, mount){
const entry = state.byYearRank.get(`${String(year).trim()}|${String(rank).trim()}`);
if(!entry){ mount.innerHTML = `<div class="text-gray-500">No result</div>`; return; }
mount.innerHTML = `<div class="font-medium">#${entry.rank} in ${entry.year}</div><div>${entry.song} by <strong>${entry.artist}</strong></div>`;
}