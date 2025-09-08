import { loadData } from './data.js';
import { renderArtistMatrix } from './render-artist.js';
import { renderSong, renderRank } from './render-song-rank.js';


const statusEl = document.getElementById('status'); // optional if you add it


(async function init(){
console.log('[main] boot');
await loadData(statusEl);
if(statusEl) statusEl.textContent = 'Ready.';


// Artist (expects #artistSummary and #artistTable)
const artistBtn = document.getElementById('artistBtn');
artistBtn && (artistBtn.onclick = () => {
const a = document.getElementById('artistName').value;
const sum = document.getElementById('artistSummary') || document.getElementById('artistResult');
const tbl = document.getElementById('artistTable') || document.getElementById('artistResult');
renderArtistMatrix(a, sum, tbl);
});


// Song
const songBtn = document.getElementById('songBtn');
songBtn && (songBtn.onclick = () => {
const t = document.getElementById('songTitle').value;
const a = document.getElementById('songArtist').value;
renderSong(t, a, document.getElementById('songResult'));
});


// Rank
const rankBtn = document.getElementById('rankBtn');
rankBtn && (rankBtn.onclick = () => {
const y = document.getElementById('rankYear').value;
const r = document.getElementById('rankNumber').value;
renderRank(y, r, document.getElementById('rankResult'));
});
})();