import { state } from './data.js';
import { norm, scaleGreenRed, scaleChange } from './utils.js';


export function renderArtistMatrix(artistRaw, mountSummary, mountTable){
const aNorm = norm(artistRaw);
mountSummary.innerHTML = ''; mountTable.innerHTML='';


const songsMap = state.artistSongYear.get(aNorm);
if(!songsMap){
mountSummary.innerHTML = `<div class="text-gray-500">No matches for <strong>${artistRaw}</strong></div>`;
return;
}


const yearsAll = Array.from(state.allYears).sort((a,b)=>b-a); // latest first
const latest = yearsAll[0];
const prev = yearsAll.find(y => y < latest);


const songs = Array.from(songsMap.values()).sort((a,b)=> a.label.localeCompare(b.label));


// Gather stats for color scales
const allRanks = []; const bestVals = []; const avgVals = [];
let maxAbsChange = 0;


const enriched = songs.map(sRec => {
const years = Array.from(sRec.years.keys()).sort((a,b)=>a-b);
const ranks = years.map(y => sRec.years.get(y));
const best = Math.min(...ranks);
const avg = Math.round(ranks.reduce((a,b)=>a+b,0)/ranks.length);


const latestRank = sRec.years.get(latest);
const prevRank = prev!=null ? sRec.years.get(prev) : undefined;


let changeDisplay = '';
if(latestRank==null){
changeDisplay = '';
} else if(prevRank==null){
const hadEarlier = years.some(y => y < latest);
const hadPrevYear = years.includes(prev);
if(!hadEarlier) changeDisplay = 'DEBUT';
else if(!hadPrevYear) changeDisplay = 'RE-ENTRY';
else changeDisplay = '';
} else {
const diff = prevRank - latestRank; // positive = improved
changeDisplay = (diff === 0) ? '-' : diff;
maxAbsChange = Math.max(maxAbsChange, Math.abs(diff));
}


bestVals.push(best); avgVals.push(avg); for(const v of ranks) allRanks.push(v);
return { label: sRec.label, yearsMap: sRec.years, best, avg, changeDisplay };
});


const minRank = Math.min(...allRanks), maxRank = Math.max(...allRanks);
const minBest = Math.min(...bestVals), maxBest = Math.max(...bestVals);
const minAvg = Math.min(...avgVals), maxAvg = Math.max(...avgVals);


// Header
const hdrYears = yearsAll.map(y=>`<th class="px-2 py-1 text-right">${y}</th>`).join('');
const thead = `
<thead class="bg-gray-100 sticky top-0">
<tr>
<th class="text-left px-2 py-1">Song</th>
<th class="text-right px-2 py-1">Change</th>
<th class="text-right px-2 py-1">Best</th>
<th class="text-right px-2 py-1">Average</th>
${hdrYears}
</tr>
</thead>`;


// Rows
const rowsHtml = enriched.map(row => {
const changeBG = scaleChange(row.changeDisplay, maxAbsChange);
const bestBG = scaleGreenRed(row.best, minBest, maxBest);
const avgBG = scaleGreenRed(row.avg, minAvg, maxAvg);


}