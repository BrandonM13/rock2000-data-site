// web/src/pages/Artist.jsx (patched width)
import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { computeRowsForArtist, heatForRank, colorForChange } from "../lib/artistData";
import HeatTable from "../components/HeatTable";

export default function Artist() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [artist, setArtist] = useState(params.get("q") || "");
  const [years, setYears] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

useEffect(() => {
  let alive = true;
  setLoading(true);
  
  const baseUrl = 'http://localhost:8000';
  fetch(`${baseUrl}/artist-search?q=${artist}`)

    .then((res) => res.json())
    .then(({ byArtistSong, years }) => {
      if (!alive) return;

      setYears(years);

      if (artist) {
		const byArtistSongMap = new Map(Object.entries(byArtistSong));
        const { rows } = computeRowsForArtist(byArtistSongMap, artist, years);
        const decorated = rows.map(r => ({
          ...r,
          _change: colorForChange(r.change),
          _bestBg: heatForRank(r.best),
          _avgBg: heatForRank(r.average),
          _cellBg: r.cells.map(c => heatForRank(Number(c)))
        }));
        setRows(decorated);
      } else {
        setRows([]);
      }

      setLoading(false);
    })
    .catch((e) => {
      console.error(e);
      setErr("Failed to load data.");
      setLoading(false);
    });

  return () => {
    alive = false;
  };
}, [artist]);


  function onSubmit(e) {
    e.preventDefault();
    const q = artist.trim();
    if (!q) return;
    nav(`/artist?q=${encodeURIComponent(q)}`);
    setArtist(q);
  }

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <header className="mx-auto max-w-[1800px] w-[95%] px-2 md:px-6 pt-8 pb-4 flex items-center gap-3">
        <Link to="/" className="rounded-xl border border-neutral-700 bg-neutral-800/60 px-3 py-2 hover:bg-neutral-800 transition">⟵ Home</Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Artist Search</h1>
        <span className="text-sm text-neutral-400 ml-2">{loading ? "Loading…" : "Ready."}</span>
      </header>

      <main className="mx-auto max-w-[1800px] w-[95%] px-2 md:px-6 pb-16">
        <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-4 md:p-5 shadow-lg">
          <form onSubmit={onSubmit} className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor="artistInput" className="block text-sm mb-1 text-neutral-300">Artist (exact for now)</label>
              <input
                id="artistInput"
                value={artist}
                onChange={(e)=>setArtist(e.target.value)}
                className="w-full rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 text-neutral-100 placeholder-neutral-500 outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., IRON MAIDEN"
              />
            </div>
            <button className="rounded-2xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition text-white">Search</button>
          </form>

          <div className="mt-3 text-sm text-neutral-300">
            {rows.length > 0 && <strong className="text-neutral-100 mr-2">TOTAL SONGS: {rows.length}</strong>}
            {err && <span className="text-red-400">{err}</span>}
          </div>

          <div className="mt-3">
            <HeatTable years={years} rows={rows} />
          </div>
        </div>
      </main>
    </div>
  );
}
