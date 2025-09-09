// web/src/lib/gviz.js (v3g) — expose both value and formatted arrays
export async function fetchGviz({ sheetId, sheetName, range = "A:D", tq = "" }){
  const params = new URLSearchParams();
  if (sheetName) params.set("sheet", sheetName);
  if (range) params.set("range", range);
  if (tq) params.set("tq", tq);
  params.set("tqx", "out:json");
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  const m = text.match(/google\.visualization\.Query\.setResponse\((([\s\S]+))\);/);
  if (!m) throw new Error("GViz: failed to parse");
  const payload = JSON.parse(m[1]);
  const table = payload.table;
  const headers = (table.cols || []).map((c, i) => c?.label ?? c?.id ?? `COL${i}`);

  const rowsArrayV = (table.rows || []).map(r => {
    const cells = r.c || [];
    return headers.map((_, i) => {
      const cell = cells[i];
      if (!cell) return null;
      return (cell.v !== undefined && cell.v !== null) ? cell.v : null;
    });
  });
  const rowsArrayF = (table.rows || []).map(r => {
    const cells = r.c || [];
    return headers.map((_, i) => {
      const cell = cells[i];
      if (!cell) return null;
      // Prefer formatted display text; fallback to value if not present.
      return (cell.f !== undefined && cell.f !== null) ? cell.f : (cell.v !== undefined ? cell.v : null);
    });
  });

  return { headers, rowsArrayV, rowsArrayF };
}


/**
 * Minimal CSV fetcher for Google Sheets GViz endpoint.
 * Returns array-of-arrays of displayed text for the requested range.
 */
export async function fetchCsv({ sheetId, sheetName, range = "A:D" }){
  const params = new URLSearchParams();
  if (sheetName) params.set("sheet", sheetName);
  if (range) params.set("range", range);
  params.set("tqx", "out:csv");
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  // Simple CSV parser that handles quoted fields containing commas.
  const rows = [];
  let i = 0, cur = [], field = "", inQuotes = false;
  function pushField(){ cur.push(field); field = ""; }
  function pushRow(){ rows.push(cur); cur = []; }
  while (i < text.length){
    const ch = text[i++];
    if (inQuotes){
      if (ch === '"'){
        if (text[i] === '"'){ field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"'){ inQuotes = true; }
      else if (ch === ','){ pushField(); }
      else if (ch === '\r'){ /* ignore */ }
      else if (ch === '\n'){ pushField(); pushRow(); }
      else { field += ch; }
    }
  }
  // Final field/row if file didn't end with newline
  if (field.length > 0 || cur.length){ pushField(); pushRow(); }
  return rows;
}
