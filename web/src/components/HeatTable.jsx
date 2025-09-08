// web/src/components/HeatTable.jsx (song-wrap patch)
import React from "react";
import "./heat-table.css";

export default function HeatTable({ years, rows }) {
  return (
    <div className="heat-wrap">
      <div className="heat-scroll">
        <table className="heat-table">
          <thead>
            <tr>
              <th className="sticky-left sticky-top corner col-song">SONG</th>
              <th className="sticky-top">CHANGE</th>
              <th className="sticky-top">BEST</th>
              <th className="sticky-top">AVERAGE</th>
              {years.map(y => <th key={y} className="sticky-top">{y}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.song + idx}>
                <td className="sticky-left col-song song-cell" title={r.song}>{r.song}</td>
                <td className="num-cell" style={{background:r._change.bg, color:r._change.color}}>{r.change}</td>
                <td className="num-cell" style={{background:r._bestBg}}>{r.best}</td>
                <td className="num-cell" style={{background:r._avgBg}}>{r.average}</td>
                {r.cells.map((v, i) => (
                  <td key={i} className="num-cell" style={{ background: r._cellBg[i] }}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
