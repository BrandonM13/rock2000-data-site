// web/src/lib/gviz.js (v3e) — returns headers, rows (objects), and rowsArray (column-ordered)
export async function fetchGviz({ sheetId, sheetName, range = "", tq = "" }){
  const params = new URLSearchParams();
  if (sheetName) params.set("sheet", sheetName);
  if (range) params.set("range", range);
  if (tq) params.set("tq", tq);
  // Always request JSON
  params.set("tqx", "out:json");
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  // Strip JS wrapper
  const m = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+?)\);/);
  if (!m) throw new Error("GViz: Failed to parse response");
  const payload = JSON.parse(m[1]);
  const table = payload.table;
  const headers = (table.cols || []).map((c, i) => (c && c.label ? String(c.label).trim() : (c && c.id ? String(c.id) : `COL${i}`)));
  const rowsArray = (table.rows || []).map(r => {
    const cells = r.c || [];
    return headers.map((_, i) => {
      const cell = cells[i];
      if (!cell) return null;
      // Prefer the raw value; fallback to formatted string.
      return (cell.v !== undefined && cell.v !== null) ? cell.v : (cell.f !== undefined ? cell.f : null);
    });
  });
  // Also provide an array of objects keyed by header label (useful elsewhere)
  const rows = rowsArray.map(arr => {
    const o = {};
    headers.forEach((h, i) => { o[h] = arr[i]; });
    return o;
  });
  return { headers, rowsArray, rows };
}
