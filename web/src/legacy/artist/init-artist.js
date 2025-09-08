// [R2K-ARTIST-MOUNT] Bridge that mounts the legacy artist search into the React page.
import { loadData } from './data.js';
import { renderArtistMatrix } from './render-artist.js';
import { LIVE_REFRESH_MS } from './config.js';

function onEnter(id, handler){
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handler(); }
  });
}

/**
 * Mounts the legacy artist search into DOM nodes rendered by React.
 * @param {string} initialQuery - optional artist to pre-fill and search immediately.
 * @returns {() => void} cleanup to stop timers/listeners when unmounting.
 */
export function mountArtistLegacy(initialQuery = '') {
  const statusEl      = document.getElementById('status');
  const artistSummary = document.getElementById('artistSummary') || document.getElementById('artistResult');
  const artistTable   = document.getElementById('artistTable')   || document.getElementById('artistResult');
  const input         = document.getElementById('artistName');
  const btn           = document.getElementById('artistBtn');

  let currentArtist = '';

  const handleArtist = () => {
    if (!input) return;
    currentArtist = input.value;
    renderArtistMatrix(currentArtist, artistSummary, artistTable);
  };

  async function refresh(){
    try {
      await loadData(statusEl);                 // pulls fresh data from Google Sheets
      if (statusEl) statusEl.textContent = 'Ready.';
      if (currentArtist) renderArtistMatrix(currentArtist, artistSummary, artistTable);
    } catch (e){
      console.error(e);
      if (statusEl) statusEl.textContent = 'Failed to load.';
    }
  }

  // Initial load + periodic refresh (pauses when tab is hidden)
  refresh();
  const interval = LIVE_REFRESH_MS || 60000;
  const timer = setInterval(() => { if (!document.hidden) refresh(); }, interval);

  // Hook up UI
  if (btn) btn.onclick = handleArtist;
  onEnter('artistName', handleArtist);

  // If we were sent here with ?q=..., prefill and run a search once data is ready.
  if (input && initialQuery) {
    input.value = initialQuery;
    currentArtist = initialQuery;
    // We may have called refresh() already; kick one more render in case data arrived.
    setTimeout(handleArtist, 0);
  }

  // Cleanup when route unmounts
  return () => clearInterval(timer);
}
