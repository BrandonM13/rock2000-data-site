import React, { useEffect, useMemo, useState } from "react";
import { HashRouter as Router, Routes, Route, Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { searchArtist } from "./lib/artistSearch";

// Types (JS doc style for clarity)
/** @typedef {{rank:number,title:string,artist:string,year:number,change?:string|number}} ResultRow */

// Demo data; replace with real results later
const SAMPLE_DATA = [
  { rank: 2000, title: "Song Z", artist: "Band Y", year: 1991, change: -1 },
  { rank: 1532, title: "Nothing Makes Sense", artist: "The Rainfall", year: 2015, change: "+12" },
  { rank: 656, title: "EMPIRE OF THE CLOUDS", artist: "IRON MAIDEN", year: 2015, change: 0 },
  { rank: 532, title: "Big John and the Wonderful Adventure", artist: "Test Artist", year: 1987, change: "+2" },
];

/** @param {"song"|"artist"|"year"} type @param {string} query */
async function runSearch(type, query) {
  if (type === "artist") {
    return await searchArtist(query);
  }

  // TEMP: keep sample search for song/year until you wire them
  const q = (query || "").trim().toUpperCase();
  if (!q) return [];
  if (type === "song")   return SAMPLE_DATA.filter(r => r.title.toUpperCase().includes(q));
  if (type === "year")   return SAMPLE_DATA.filter(r => String(r.year) === q);
  return [];
}


function SearchCard({ title, type, placeholder, inputMode }) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const onSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    navigate(`/results?type=${encodeURIComponent(type)}&q=${encodeURIComponent(q)}`);
  };
  return (
    <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-5 shadow-lg">
      <h2 className="text-xl font-medium mb-3">{title}</h2>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded-xl bg-neutral-900 border border-neutral-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder={placeholder}
          value={value}
          inputMode={inputMode}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="rounded-xl px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition">
          Search
        </button>
      </form>
    </div>
  );
}

function HomePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <header className="mx-auto max-w-5xl px-6 pt-10 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Rock 2000 – Search</h1>
        <p className="text-neutral-300 mt-2">Pick a search type to dive in. Results open on their own page.</p>
      </header>
      <main className="mx-auto max-w-5xl px-6 pb-16 grid gap-6 md:grid-cols-3">
        <SearchCard title="Search by Song" type="song" placeholder="Enter song title..." />
        <SearchCard title="Search by Artist" type="artist" placeholder="Enter artist name..." />
        <SearchCard title="Search by Year" type="year" placeholder="e.g. 2015" inputMode="numeric" />
      </main>
    </motion.div>
  );
}

function ResultsTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-700 bg-neutral-800/60">
      <table className="min-w-full text-sm">
        <thead className="bg-neutral-800/80 text-left">
          <tr className="text-neutral-300">
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Song</th>
            <th className="px-4 py-3">Artist</th>
            <th className="px-4 py-3">Year</th>
            <th className="px-4 py-3">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.rank}-${r.title}`} className="border-t border-neutral-700/70 hover:bg-neutral-800/40">
              <td className="px-4 py-3 tabular-nums">#{r.rank}</td>
              <td className="px-4 py-3 whitespace-nowrap">{r.title}</td>
              <td className="px-4 py-3 whitespace-nowrap">{r.artist}</td>
              <td className="px-4 py-3">{r.year}</td>
              <td className="px-4 py-3">{r.change ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultsPage() {
  const [params] = useSearchParams();
  const type = (params.get("type") || "song");
  const q = params.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    runSearch(type, q).then(res => {
      if (!active) return;
      setRows(res);
      setLoading(false);
    });
    return () => { active = false; };
  }, [type, q]);

  const title = useMemo(() => {
    const label = type === "song" ? "Song" : type === "artist" ? "Artist" : "Year";
    return `${label} search: “${q}”`;
  }, [type, q]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <header className="mx-auto max-w-6xl px-6 pt-8 pb-4 flex items-center gap-3">
        <Link to="/" className="rounded-xl border border-neutral-700 bg-neutral-800/60 px-3 py-2 hover:bg-neutral-800 transition" aria-label="Go home">
          ⟵ Home
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-16">
        {loading ? <div className="mt-8 text-neutral-300">Loading results…</div>
                 : rows.length === 0 ? <div className="mt-8 text-neutral-300">No results found.</div>
                 : <ResultsTable rows={rows} />}
      </main>
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}
