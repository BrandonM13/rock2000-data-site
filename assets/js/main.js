import { loadData } from './data.js';
import { renderArtistMatrix } from './render-artist.js';
import { renderSong, renderRank } from './render-song-rank.js';

const statusEl = document.getElementById('status');
const artistSummary = document.getElementById('artistSummary') || document.getElementById('artistResult');
const artistTable   = document.getElementById('artistTable')   || document.getElementById('artistResult');

(async function init(){
  try {
    console.log('[main] boot');
    await loadData(statusEl);
    if (statusEl) statusEl.textContent = 'Ready.';
  } catch (e) {
    console.error('[main] loadData failed:', e);
    if (statusEl) statusEl.textContent = 'Failed to load. Check Sheet publish & tab names.';
    return;
  }

  const ab = document.getElementById('artistBtn');
  if (!ab) { console.error('[main] #artistBtn missing'); return; }
  ab.onclick = () => {
    const a = document.getElementById('artistName').value;
    renderArtistMatrix(a, artistSummary, artistTable);
  };

  const sb = document.getElementById('songBtn');
  if (sb) sb.onclick = () => {
    const t = document.getElementById('songTitle').value;
    const a = document.getElementById('songArtist').value;
    renderSong(t, a, document.getElementById('songResult'));
  };

  const rb = document.getElementById('rankBtn');
  if (rb) rb.onclick = () => {
    const y = document.getElementById('rankYear').value;
    const r = document.getElementById('rankNumber').value;
    renderRank(y, r, document.getElementById('rankResult'));
  };
})();
