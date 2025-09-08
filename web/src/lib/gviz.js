// Minimal Google Sheets GViz helper (no extra libs)

// Build a GViz URL for a given sheet tab name.
function gvizUrl({ sheetId, sheetName, tq = "select *" }) {
  const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq`;
  // tqx=out:json makes it JSON (wrapped in a function)
  const params = new URLSearchParams({
    tq,
    tqx: "out:json",
    sheet: sheetName,
  });
  return `${base}?${params.toString()}`;
}

// Parse GViz response string → plain JS object
function parseGviz(responseText) {
  // Strip google.visualization.Query.setResponse(...)
  const start = responseText.indexOf("(");
  const end = responseText.lastIndexOf(")");
  const json = JSON.parse(responseText.slice(start + 1, end));
  const table = json.table;

  const headers = table.cols.map((c, i) => (c.label || c.id || `COL${i + 1}`));
  const rows = table.rows.map((r) => {
    const obj = {};
    r.c.forEach((cell, i) => {
      obj[headers[i]] = cell ? cell.v : null;
    });
    return obj;
  });

  return { headers, rows };
}

// Simple 2-minute in-memory cache
const _cache = new Map();
const TTL_MS = 2 * 60 * 1000;

export async function fetchSheet({ sheetId, sheetName, tq = "select *" }) {
  const key = `${sheetId}::${sheetName}::${tq}`;
  const now = Date.now();
  const cached = _cache.get(key);
  if (cached && now - cached.time < TTL_MS) return cached.data;

  const res = await fetch(gvizUrl({ sheetId, sheetName, tq }), { mode: "cors" });
  const text = await res.text();
  const data = parseGviz(text);

  _cache.set(key, { time: now, data });
  return data;
}
