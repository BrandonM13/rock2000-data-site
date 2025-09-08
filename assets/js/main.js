import { loadData } from './data.js';
import { renderArtistMatrix } from './render-artist.js';
import { renderSong, renderRank } from './render-song-rank.js';

const statusEl = document.getElementById('status');
const artistSummary = document.getElementById('artistSummary') || document.getElementById('artistResult');
const artistTable   = document.getElementById('artistTable')   || document.getElementById('artistResult');

function onEnter(id, handler){
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handler(); }
  });
}

const handleArtist = () => {
  const a = document.getElementById('artistName').value;
  renderArtistMatrix(a, artistSummary, artistTable);
};
const handleSong = () => {
  const t = document.getElementById('songTitle').value;
  const a = document.getElementById('songArtist').value;
  renderSong(t, a, document.getElementById('songResult'));
};
const handleRank = () => {
  const y = document.getElementById('rankYear').value;
  const r = document.getElementById('rankNumber').value;
  renderRank(y, r, document.getElementById('rankResult'));
};

(async function init(){
  try { await loadData(statusEl); statusEl && (statusEl.textContent = 'Ready.'); }
  catch (e){ console.error(e); statusEl && (statusEl.textContent = 'Failed to load data.'); return; }

  // Clicks
  const ab = document.getElementById('artistBtn'); ab && (ab.onclick = handleArtist);
  const sb = document.getElementById('songBtn');   sb && (sb.onclick = handleSong);
  const rb = document.getElementById('rankBtn');   rb && (rb.onclick = handleRank);

  // Enter-to-search
  onEnter('artistName', handleArtist);
  onEnter('songTitle',  handleSong);
  onEnter('songArtist', handleSong);
  onEnter('rankYear',   handleRank);
  onEnter('rankNumber', handleRank);
})();
