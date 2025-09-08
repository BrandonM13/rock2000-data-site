import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <header className="mx-auto max-w-5xl px-6 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Rock 2000 – Search</h1>
        <p className="text-neutral-300 mt-2">Pick a search type to dive in.</p>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-16 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-5 shadow-lg">
          <h2 className="text-xl font-medium mb-3">Artist Search</h2>
          <Link to="/artist" className="rounded-xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 inline-block">Open</Link>
        </div>

        {/* Placeholders for Song / Rank; we’ll wire them later the same way */}
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
