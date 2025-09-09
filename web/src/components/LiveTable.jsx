// web/src/components/LiveTable.jsx (v3b) — also make top rank gold
import React, { useEffect, useRef, useState } from "react";
import "./live-table.css";

export default function LiveTable({ rows }){
  const tableRef = useRef(null);
  const [measured, setMeasured] = useState({ song: 0, artist: 0 });

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "20px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'";
    let maxSong = 0, maxArtist = 0;
    for (const r of rows){
      if (r.song)   maxSong   = Math.max(maxSong, ctx.measureText(r.song).width);
      if (r.artist) maxArtist = Math.max(maxArtist, ctx.measureText(r.artist).width);
    }
    const pad = 36;
    const w = Math.ceil(Math.max(maxSong, maxArtist) + pad);
    if (w && (w !== measured.song || w !== measured.artist)){
      el.style.setProperty("--col-song-w", w + "px");
      el.style.setProperty("--col-artist-w", w + "px");
      setMeasured({ song: w, artist: w });
    }
  }, [rows]);

  return (
    <div className="live-wrap">
      <div className="live-scroll">
        <table ref={tableRef} className="live-table" style={{'--hdr-h':'48px'}}>
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
              const n = Number(r.change);
              let changeClass = "chg-neutral";
              if (r.change === "-") changeClass = "chg-dash";
              else if (!Number.isNaN(n)) changeClass = n > 0 ? "chg-pos" : "chg-neg";
              else if (String(r.change).toUpperCase() === "DEBUT") changeClass = "chg-debut";
              else if (String(r.change).toUpperCase() === "RE-ENTRY") changeClass = "chg-reentry";

              return (
                <tr key={r.key + idx} className={isTop ? "sticky-first-row center-all" : ""}>
                  <td className={"col-rank" + (isTop ? " gold-text" : "")}>{r.rank}</td>
                  <td className={"col-song" + (isTop ? " gold-text" : "")} title={r.song}>{r.song}</td>
                  <td className={"col-artist" + (isTop ? " gold-text" : "")} title={r.artist}>{r.artist}</td>
                  <td className="col-year">{r.releaseYear ?? ""}</td>
                  <td className={`col-change ${changeClass}`}>{String(r.change)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
