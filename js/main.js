import { loadData } from './data.js';
import { renderArtistMatrix } from './render-artist.js';
import { renderSong, renderRank } from './render-song-rank.js';
import { LIVE_REFRESH_MS } from './config.js';


const statusEl = document.getElementById('status');
const artistSummary = document.getElementById('artistSummary');
const artistTable = document.getElementById('artistTable');
const liveToggle = document.getElementById('liveToggle');


let currentArtist = '';
let liveTimer = null;


async function refreshDataAndMaybeRender(){
try {
await loadData(statusEl);
statusEl.textContent = 'Ready.';
if (currentArtist) {
renderArtistMatrix(currentArtist, artistSummary, artistTable);
}
} catch (e) {
console.error(e);
statusEl.textContent = 'Load error. Check Sheet publish & tab names.';
}
}


function startLive(){
if (liveTimer) return;
liveTimer = setInterval(() => {
// Pause while tab is hidden to be friendly to batteries/network
if (document.hidden) return;
refreshDataAndMaybeRender();
}, LIVE_REFRESH_MS);
}
function stopLive(){
if (!liveTimer) return;
clearInterval(liveTimer);
liveTimer = null;
}


// Initial boot
(async function init(){
await refreshDataAndMaybeRender();


// Artist search
document.getElementById('artistBtn').onclick = () => {
currentArtist = document.getElementById('artistName').value;
renderArtistMatrix(currentArtist, artistSummary, artistTable);
};


// Song search (unchanged)
document.getElementById('songBtn').onclick = () => {
const t = document.getElementById('songTitle').value;
const a = document.getElementById('songArtist').value;
renderSong(t, a, document.getElementById('songResult'));
};


// Rank search (unchanged)
document.getElementById('rankBtn').onclick = () => {
const y = document.getElementById('rankYear').value;
const r = document.getElementById('rankNumber').value;
renderRank(y, r, document.getElementById('rankResult'));
};


// Live toggle
liveToggle.addEventListener('change', (e) => {
if (e.target.checked) startLive(); else stopLive();
})();
