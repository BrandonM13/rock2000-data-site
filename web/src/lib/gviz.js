// web/src/lib/gviz.js (v3f) — returns headers, rowsArray (column-ordered)
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
  const rowsArray = (table.rows || []).map(r => {
    const cells = r.c || [];
    return headers.map((_, i) => {
      const cell = cells[i];
      if (!cell) return null;
      return (cell.v !== undefined && cell.v !== null) ? cell.v : (cell.f !== undefined ? cell.f : null);
    });
  });
  return { headers, rowsArray };
}
