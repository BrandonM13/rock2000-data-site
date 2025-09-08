import { state } from './data.js';
import { norm, scaleGreenRed, getChangeStyle } from './utils.js';

export function renderArtistMatrix(artistRaw, mountSummary, mountTable) {
  const aNorm = norm(artistRaw);
  mountSummary.innerHTML = '';
  mountTable.innerHTML = '';

  const songsMap = state.artistSongYear.get(aNorm);
  if (!songsMap) {
    mountSummary.innerHTML = `<div class="text-gray-500">No matches for <strong>${artistRaw}</strong></div>`;
    return;
  }

  const yearsAll = Array.from(state.allYears).sort((a, b) => b - a);
  const latest = yearsAll[0];
  const prev = yearsAll.find(y => y < latest);

  const songs = Array.from(songsMap.values()).sort((a, b) => a.label.localeCompare(b.label));

  const allRanks = []; const bestVals = []; const avgVals = [];
  const enriched = songs.map(sRec => {
    const years = Array.from(sRec.years.keys()).sort((a, b) => a - b);
    const ranks = years.map(y => sRec.years.get(y));
    const best  = Math.min(...ranks);
    const avg   = Math.round(ranks.reduce((a,b)=>a+b,0)/ranks.length);

    const latestRank = sRec.years.get(latest);
    const prevRank   = prev!=null ? sRec.years.get(prev) : undefined;

    let changeDisplay = '';
    if (latestRank == null) {
      changeDisplay = '';
    } else if (prevRank == null) {
      const hadEarlier = years.some(y => y < latest);
      const hadPrevYear = years.includes(prev);
      if (!hadEarlier) changeDisplay = 'DEBUT';
      else if (!hadPrevYear) changeDisplay = 'RE-ENTRY';
    } else {
      const diff = prevRank - latestRank; // positive = improved
      changeDisplay = (diff === 0) ? '-' : diff;
    }

    bestVals.push(best); avgVals.push(avg); for(const v of ranks) allRanks.push(v);
    return { label: sRec.label, yearsMap: sRec.years, best, avg, changeDisplay };
  });

  const minRank = Math.min(...allRanks), maxRank = Math.max(...allRanks);
  const minBest = Math.min(...bestVals), maxBest = Math.max(...bestVals);
  const minAvg  = Math.min(...avgVals),  maxAvg  = Math.max(...avgVals);

  const hdrYears = yearsAll.map(y => `<th class="px-2 py-1 text-right">${y}</th>`).join('');
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

  const rowsHtml = enriched.map(row => {
    const { bg: changeBG, color: changeColor } = getChangeStyle(row.changeDisplay);
    const bestBG =  scaleGreenRed(row.best, minBest, maxBest);
    const avgBG  =  scaleGreenRed(row.avg,  minAvg,  maxAvg);

    const cellsYears = yearsAll.map(y => {
      const v = row.yearsMap.get(y);
      const bg = (v == null) ? '' : scaleGreenRed(v, minRank, maxRank);
      const txt = (v == null) ? '' : v;
      return `<td class="px-2 py-1 text-right" style="background:${bg}; color:#000">${txt}</td>`;
    }).join('');

    const changeTxt = (row.changeDisplay === '') ? '' : row.changeDisplay;
    return `<tr>
      <td class="px-2 py-1">${row.label}</td>
      <td class="px-2 py-1 text-right" style="background:${changeBG}; color:${changeColor}">${changeTxt}</td>
      <td class="px-2 py-1 text-right" style="background:${bestBG}; color:#000">${row.best}</td>
      <td class="px-2 py-1 text-right" style="background:${avgBG}; color:#000">${row.avg}</td>
      ${cellsYears}
    </tr>`;
  }).join('');

  mountSummary.innerHTML = `<div class="inline-block text-xs bg-gray-200 rounded-full px-2 py-1">Total songs: ${songs.length}</div>`;
  mountTable.innerHTML = `
    <div class="overflow-auto border rounded">
      <table class="text-xs w-[1400px] min-w-full">
        ${thead}
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}
