import { state } from './data.js';
import { norm, scaleGreenRed, getChangeStyle } from './utils.js';

export function renderArtistMatrix(artistRaw, mountSummary, mountTable){
  const aNorm = norm(artistRaw);
  mountSummary.innerHTML = '';
  mountTable.innerHTML = '';

  const songsMap = state.artistSongYear.get(aNorm);
  if (!songsMap) {
    mountSummary.innerHTML = `<div class="text-gray-500">No matches for <strong>${artistRaw}</strong></div>`;
    return;
  }

  const yearsAll = Array.from(state.allYears).sort((a,b)=>b-a); // latest first (e.g., 2025, 2024, …)
  const latest = yearsAll[0];
  const prev   = yearsAll.find(y => y < latest);

  const songs = Array.from(songsMap.values()).sort((a,b)=> a.label.localeCompare(b.label));

  // Shared heatmap values (Best, Avg, and all year cells)
  const allHeatVals = [];

  const enriched = songs.map(sRec => {
    const years = Array.from(sRec.years.keys()).sort((a,b)=>a-b);
    const ranks = years.map(y => sRec.years.get(y));
    const best  = Math.min(...ranks);
    const avg   = Math.round(ranks.reduce((a,b)=>a+b,0)/ranks.length);

    // Change logic (fixed colors)
    const latestRank = sRec.years.get(latest);
    const prevRank   = prev!=null ? sRec.years.get(prev) : undefined;
    let changeDisplay = '';
    if (latestRank == null) {
      changeDisplay = ''; // blank if not in latest year
    } else if (prevRank == null) {
      const hadEarlier = years.some(y => y < latest);
      const hadPrevYear = years.includes(prev);
      if (!hadEarlier) changeDisplay = 'DEBUT';
      else if (!hadPrevYear) changeDisplay = 'RE-ENTRY';
    } else {
      const diff = prevRank - latestRank; // positive = improved
      changeDisplay = (diff === 0) ? '-' : diff;
    }

    allHeatVals.push(...ranks, best, avg);
    return { label: sRec.label, yearsMap: sRec.years, best, avg, changeDisplay };
  });

  const heatMin = Math.min(...allHeatVals);
  const heatMax = Math.max(...allHeatVals);

  // Header (ALL CAPS) + borders
  const hdrYears = yearsAll
    .map(y => `<th class="px-2 py-1 text-center border border-black">${y}</th>`)
    .join('');

  const thead = `
    <thead class="bg-gray-100 sticky top-0">
      <tr>
        <th class="px-2 py-1 text-left  border border-black border-r-4">SONG</th>
        <th class="px-2 py-1 text-center border border-black">CHANGE</th>
        <th class="px-2 py-1 text-center border border-black">BEST</th>
        <th class="px-2 py-1 text-center border border-black border-r-4">AVERAGE</th>
        ${hdrYears}
      </tr>
    </thead>`;

  const rowsHtml = enriched.map(row => {
    // Change = fixed palette
    const { bg: changeBG, color: changeColor } = getChangeStyle(row.changeDisplay);
    const changeTxt = (row.changeDisplay === '') ? '' : row.changeDisplay;

    // Shared heatmap for Best/Avg/Years: green -> white -> red
    const bestBG = scaleGreenRed(row.best, heatMin, heatMax);
    const avgBG  = scaleGreenRed(row.avg,  heatMin, heatMax);

    // Year cells (centered, shared heatmap)
    const cellsYears = yearsAll.map(y => {
      const v  = row.yearsMap.get(y);
      const bg = (v==null) ? '' : scaleGreenRed(v, heatMin, heatMax);
      const txt = (v==null) ? '' : v;
      return `<td class="px-2 py-1 text-center border border-black" style="background:${bg}; color:#000">${txt}</td>`;
    }).join('');

    return `<tr>
      <td class="px-2 py-1 text-left whitespace-nowrap border border-black border-r-4">${row.label}</td>
      <td class="px-2 py-1 text-center border border-black" style="background:${changeBG}; color:${changeColor}">${changeTxt}</td>
      <td class="px-2 py-1 text-center border border-black" style="background:${bestBG}; color:#000">${row.best}</td>
      <td class="px-2 py-1 text-center border border-black border-r-4" style="background:${avgBG}; color:#000">${row.avg}</td>
      ${cellsYears}
    </tr>`;
  }).join('');

  mountSummary.innerHTML = `<div class="inline-block text-xs bg-gray-200 rounded-full px-2 py-1">Total songs: ${songs.length}</div>`;
  mountTable.innerHTML = `
    <div class="overflow-auto border border-black rounded">
      <table class="text-xs w-[1400px] min-w-full border-collapse">
        ${thead}
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}
