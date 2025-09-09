// web/src/components/LiveTable.jsx (v2) — centered top row, font sizes, equal song/artist widths
import React, { useEffect, useRef, useState } from "react";
import "./live-table.css";

export default function LiveTable({ rows }){
  const tableRef = useRef(null);
  const [colW, setColW] = useState(0);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    el.style.setProperty("--col-song-w", "auto");
    el.style.setProperty("--col-artist-w", "auto");
    let maxSong = 0, maxArtist = 0;
    const songCells = el.querySelectorAll("td.col-song");
    const artistCells = el.querySelectorAll("td.col-artist");
    songCells.forEach(td => { maxSong = Math.max(maxSong, td.offsetWidth); });
    artistCells.forEach(td => { maxArtist = Math.max(maxArtist, td.offsetWidth); });
    const w = Math.max(maxSong, maxArtist);
    if (w && Math.abs(w - colW) > 1) {
      setColW(w);
      el.style.setProperty("--col-song-w", w + "px");
      el.style.setProperty("--col-artist-w", w + "px");
    }
  }, [rows, colW]);

  return (
    <div className="live-wrap">
      <div className="live-scroll">
        <table ref={tableRef} className="live-table" style={{'--hdr-h':'42px'}}>
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
              const change = r.change;
              let changeClass = "chg-neutral";
              const n = Number(change);
              if (change === "-") changeClass = "chg-dash";
              else if (!Number.isNaN(n)) changeClass = n > 0 ? "chg-pos" : "chg-neg";
              else if (change === "DEBUT") changeClass = "chg-debut";
              else if (change === "RE-ENTRY") changeClass = "chg-reentry";

              return (
                <tr key={r.key + idx} className={isTop ? "sticky-first-row center-all" : ""}>
                  <td className="col-rank">{r.rank}</td>
                  <td className={"col-song" + (isTop ? " gold-text" : "")} title={r.song}>{r.song}</td>
                  <td className={"col-artist" + (isTop ? " gold-text" : "")} title={r.artist}>{r.artist}</td>
                  <td className="col-year">{r.releaseYear ?? ""}</td>
                  <td className={`col-change ${changeClass}`}>{String(change)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
