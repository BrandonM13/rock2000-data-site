// web/src/lib/gviz.js
// Minimal Google Sheets GViz helper
export function gvizUrl({ sheetId, sheetName, tq = "select *" }) {
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`;
  const params = new URLSearchParams({ tq, tqx: "out:json", sheet: sheetName });
  return `${base}?${params.toString()}`;
}

export async function fetchGviz({ sheetId, sheetName, tq = "select *" }) {
  const res = await fetch(gvizUrl({ sheetId, sheetName, tq }), { mode: "cors" });
  const text = await res.text();
  const start = text.indexOf("(");
  const end = text.lastIndexOf(")");
  const json = JSON.parse(text.slice(start + 1, end));
  const table = json.table;
  const headers = table.cols.map((c, i) => (c.label || c.id || `COL${i+1}`));
  const rows = table.rows.map((r) => {
    const obj = {};
    r.c.forEach((cell, i) => { obj[headers[i]] = cell ? cell.v : null; });
    return obj;
  });
  return { headers, rows };
}
