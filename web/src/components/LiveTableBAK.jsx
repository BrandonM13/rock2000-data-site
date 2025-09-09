// web/src/components/LiveTable.jsx (v3d) — centered top row, gold Year; class from strict value
import React, { useEffect, useRef, useState } from "react";
import "./live-table.css";

export default function LiveTable({ rows }){
	console.log("Rendering LiveTable with rows:", rows);

const seenKeys = new Set();
rows.forEach((r, i) => {
  const key = (r.rank || 'no-rank') + '-' + (r.song || 'no-song') + '-' + (r.artist || 'no-artist');
  if (seenKeys.has(key)) {
    console.warn("⚠️ Duplicate key detected:", key, r);
  } else {
    seenKeys.add(key);
  }

  if (!r.rank || isNaN(parseInt(r.rank))) {
    console.warn("⚠️ Invalid or missing rank in row:", r);
  }
});

	
  const tableRef = useRef(null);
  const [measured, setMeasured] = useState({ song: 0, artist: 0 });

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "17px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'";
    let maxSong = 0, maxArtist = 0;
    for (const r of rows){
      if (r.song)   maxSong   = Math.max(maxSong, ctx.measureText(r.song).width);
      if (r.artist) maxArtist = Math.max(maxArtist, ctx.measureText(r.artist).width);
    }
    const pad = 32;
    const w = Math.ceil(Math.max(maxSong, maxArtist) + pad);
    if (w && (w !== measured.song || w !== measured.artist)){
      el.style.setProperty("--col-song-w", w + "px");
      el.style.setProperty("--col-artist-w", w + "px");
      setMeasured({ song: w, artist: w });
    }
  }, [rows]);

  const changeClass = (val) => {
    if (val === null || val === undefined) return "chg-dash";
    if (typeof val === "number"){
      if (val === 0) return "chg-dash";
      return val > 0 ? "chg-pos" : "chg-neg";
    }
    const t = String(val).trim().toUpperCase();
    if (t === "DEBUT") return "chg-debut";
    if (t === "RE-ENTRY" || t === "REENTRY") return "chg-reentry";
    if (t === "-" || t === "—" || t === "0") return "chg-dash";
    const n = Number(t);
    if (!Number.isNaN(n)) return n > 0 ? "chg-pos" : (n < 0 ? "chg-neg" : "chg-dash");
    return "chg-dash";
  };

  return (
    <div className="live-wrap">
      <div className="live-scroll">
        <table ref={tableRef} className="live-table" style={{'--hdr-h':'44px'}}>
          <thead>
            <tr>
              <th className="sticky-top th-rank">RANK</th>
              <th className="sticky-top th-song">SONG</th>
              <th className="sticky-top th-artist">ARTIST</th>
              <th className="sticky-top th-year">YEAR</th>
              <th className="sticky-top th-change">CHANGE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const isTop = idx === 0;
              const cls = changeClass(r.change);
              return (
				<tr key={`${r.rank}-${r.song}-${r.artist}`} className={isTop ? "sticky-first-row center-all" : ""}>
                  <td className={"col-rank" + (isTop ? " gold-text" : "")}>{r.rank}</td>
                  <td className={"col-song" + (isTop ? " gold-text" : "")} title={r.song}>{r.song}</td>
                  <td className={"col-artist" + (isTop ? " gold-text" : "")} title={r.artist}>{r.artist}</td>
                  <td className={"col-year" + (isTop ? " gold-text" : "")}>{r.releaseYear ?? ""}</td>
                  <td className={`col-change ${cls}`}>{String(r.change)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
