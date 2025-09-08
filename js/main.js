import { loadData, state } from './data.js';
import { renderArtistMatrix } from './render-artist.js';
import { renderSong, renderRank } from './render-song-rank.js';


const statusEl = document.getElementById('status');


(async function init(){
try { await loadData(statusEl); }
catch (e){ console.error(e); statusEl.textContent = 'Failed to load. Check Sheet publish & tab names.'; return; }
statusEl.textContent = 'Ready.';


// Wire: Artist
document.getElementById('artistBtn').onclick = () => {
const a = document.getElementById('artistName').value;
renderArtistMatrix(a, document.getElementById('artistSummary'), document.getElementById('artistTable'));
};


// Wire: Song
document.getElementById('songBtn').onclick = () => {
const t = document.getElementById('songTitle').value;
const a = document.getElementById('songArtist').value;
renderSong(t, a, document.getElementById('songResult'));
};


// Wire: Rank
document.getElementById('rankBtn').onclick = () => {
const y = document.getElementById('rankYear').value;
const r = document.getElementById('rankNumber').value;
renderRank(y, r, document.getElementById('rankResult'));
};
})();