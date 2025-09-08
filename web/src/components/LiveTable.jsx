// web/src/components/LiveTable.jsx
import React from "react";
import "./live-table.css";

export default function LiveTable({ rows }){
  return (
    <div className="live-wrap">
      <div className="live-scroll">
        <table className="live-table" style={{'--hdr-h':'42px'}}>
          <thead>
            <tr>
              <th className="sticky-top">RANK</th>
              <th className="sticky-top">SONG</th>
              <th className="sticky-top">ARTIST</th>
              <th className="sticky-top">YEAR</th>
              <th className="sticky-top">CHANGE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const isTop = idx === 0;
              const change = r.change;
              let changeClass = "chg-neutral";
              if (typeof change === "number") changeClass = change > 0 ? "chg-pos" : "chg-neg";
              if (change === "-") changeClass = "chg-dash";
              if (change === "DEBUT") changeClass = "chg-debut";
              if (change === "RE-ENTRY") changeClass = "chg-reentry";

              return (
                <tr key={r.key + idx} className={isTop ? "sticky-first-row" : ""}>
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
