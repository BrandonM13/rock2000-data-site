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
 * Mounts the legacy artist search into the DOM elements rendered by React.
 * Returns a cleanup function to stop timers/listeners when the page unmounts.
 */
export function mountArtistLegacy() {
  const statusEl      = document.getElementById('status');
  const artistSummary = document.getElementById('artistSummary') || document.getElementById('artistResult');
  const artistTable   = document.getElementById('artistTable')   || document.getElementById('artistResult');
  const input         = document.getElementById('artistName');
  const btn           = document.getElementById('artistBtn');

  let currentArtist = '';

  const handleArtist = () => {
    currentArtist = input.value;
    renderArtistMatrix(currentArtist, artistSummary, artistTable);
  };

  async function refresh(){
    try {
      await loadData(statusEl);                 // pulls fresh data from your Google Sheet
      statusEl && (statusEl.textContent = 'Ready.');
      if (currentArtist) renderArtistMatrix(currentArtist, artistSummary, artistTable);
    } catch (e){
      console.error(e);
      statusEl && (statusEl.textContent = 'Failed to load.');
    }
  }

  // Initial load + periodic refresh (pauses when tab is hidden)
  refresh();
  const interval = LIVE_REFRESH_MS || 60000;
  const timer = setInterval(() => { if (!document.hidden) refresh(); }, interval);

  // Hook up UI
  if (btn) btn.onclick = handleArtist;
  onEnter('artistName', handleArtist);

  // Cleanup when route unmounts
  return () => clearInterval(timer);
}
