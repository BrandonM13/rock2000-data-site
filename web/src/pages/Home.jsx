import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [artist, setArtist] = useState('');
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    const q = artist.trim();
    if (!q) return;
    navigate(`/artist?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <header className="mx-auto max-w-5xl px-6 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Rock 2000 – Search</h1>
        <p className="text-neutral-300 mt-2">Pick a search type to dive in.</p>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-5 shadow-lg">
          <h2 className="text-xl font-medium mb-3">Artist Search</h2>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g., IRON MAIDEN"
              className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="rounded-xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition"
            >
              Search
            </button>
          </form>
          <Link to="/artist" className="text-xs text-neutral-400 hover:text-neutral-300 mt-2 inline-block">
            Open full page
          </Link>
        </div>

        {/* Placeholders for Song / Rank; we’ll wire them later */}
        <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-5 shadow-lg opacity-70">
          <h2 className="text-xl font-medium mb-3">Song Search</h2>
          <div className="text-neutral-400 text-sm">Coming next.</div>
        </div>
        <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-5 shadow-lg opacity-70">
          <h2 className="text-xl font-medium mb-3">Search by Rank</h2>
          <div className="text-neutral-400 text-sm">Coming next.</div>
        </div>
      </main>
    </div>
  );
}
