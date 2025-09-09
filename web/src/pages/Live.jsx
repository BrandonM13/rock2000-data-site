// web/src/pages/Live.jsx (v3) — speed tweaks + fallback change fix
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadYearRows, loadReleaseYearMap } from "../lib/liveData";
import LiveTable from "../components/LiveTable";

const YEAR_MIN = 2002;
const YEAR_MAX_DEFAULT = 2025;

function yearsRange(max, min){
  const arr = [];
  for (let y = max; y >= min; y--) arr.push(y);
  return arr;
}

export default function Live(){
  const [years] = useState(yearsRange(YEAR_MAX_DEFAULT, YEAR_MIN));
  const [year, setYear] = useState(YEAR_MAX_DEFAULT);
  const [releaseMap, setReleaseMap] = useState(new Map());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Preload release map (cached in sessionStorage)
  useEffect(() => {
    let alive = true;
    loadReleaseYearMap().then(map => { if (alive) setReleaseMap(map); })
      .catch(e => { console.error(e); if (alive) setErr("Failed to load release years."); });
    return () => { alive = false; };
  }, []);

  // Load the selected year and fill missing change values if needed
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const curRows = await loadYearRows(year);
        const withRelease = curRows.map(r => ({ ...r, releaseYear: releaseMap.get(r.key) ?? "" }));
        if (alive) setRows(withRelease);
      } catch (e){
        console.error(e);
        if (alive) setErr("Failed to load year data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [year, releaseMap]);

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100">
      <header className="mx-auto max-w-[1400px] w-[95%] px-2 md:px-6 pt-8 pb-4 flex items-center gap-3">
        <Link to="/" className="rounded-xl border border-neutral-700 bg-neutral-800/60 px-3 py-2 hover:bg-neutral-800 transition">⟵ Home</Link>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Live Countdown</h1>
        <span className="text-sm text-neutral-400 ml-2">{loading ? "Loading…" : "Ready."}</span>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="yearSelect" className="text-sm text-neutral-300">Year</label>
          <select
            id="yearSelect"
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1 text-neutral-100"
            value={year}
            onChange={(e)=>setYear(Number(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] w-[95%] px-2 md:px-6 pb-16">
        <div className="rounded-2xl bg-neutral-800/60 border border-neutral-700 p-3 md:p-4 shadow-lg">
          {err && <div className="text-red-400 text-sm mb-3">{err}</div>}
          <LiveTable rows={rows} />
        </div>
      </main>
    </div>
  );
}
