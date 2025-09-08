import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { mountArtistLegacy } from '../legacy/artist/init-artist';
import '../styles/artist-legacy-dark.css'; // dark-mode overrides for legacy table

export default function ArtistLegacy() {
  const [params] = useSearchParams();
  const initialQuery = params.get('q') || '';

  useEffect(() => {
    const cleanup = mountArtistLegacy(initialQuery);  // attach legacy code with initial query
    return cleanup;                                   // detach timers when leaving page
  }, [initialQuery]);

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <header className="mx-auto max-w-6xl px-6 pt-8 pb-4 flex items-center gap-3">
        <Link
          to="/"
          className="rounded-xl border border-neutral-700 bg-neutral-800/60 px-3 py-2 hover:bg-neutral-800 transition"
        >
          ⟵ Home
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Artist Search</h1>
        <span id="status" className="text-sm text-neutral-400 ml-2">Loading…</span>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-4 md:p-6 shadow-lg">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <label htmlFor="artistName" className="block text-sm mb-1 text-neutral-300">
                Artist (exact for now)
              </label>
              <input
                id="artistName"
                defaultValue={initialQuery}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., IRON MAIDEN"
              />
            </div>
            <button
              id="artistBtn"
              className="rounded-2xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition text-white"
            >
              Search
            </button>
          </div>

          {/* mounts expected by legacy renderer */}
          <div id="artistSummary" className="mt-4 text-sm"></div>
          <div id="artistTable" className="mt-3"></div>
        </div>

        <p className="mt-6 text-xs text-neutral-400">
          Data live-fetched from Google Sheets (read-only).
        </p>
      </main>
    </div>
  );
}
