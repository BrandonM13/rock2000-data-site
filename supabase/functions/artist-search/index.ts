import "https://deno.land/std@0.168.0/dotenv/load.ts";  // <-- Required
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Load environment variables
const SHEET_ID = Deno.env.get("SHEET_ID");
const TAB_NAME = Deno.env.get("TAB_NAME") || "MasterCountdownData";

// Utility: Normalize artist and song strings
function norm(s: string): string {
  return (s ?? "")
    .toString()
    .normalize("NFKD")
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/['"`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Parse GViz response from Google Sheets
async function fetchGviz(sheetId: string, sheetName: string) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tqx=out:json`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+?)\);/);
  if (!match) throw new Error("Failed to parse GViz response");

  const data = JSON.parse(match[1]);
  const headers = data.table.cols.map((c: any, i: number) => c.label || `COL${i}`);
  const rows = data.table.rows.map((r: any) => {
    const obj: Record<string, any> = {};
    headers.forEach((h: string, i: number) => {
      obj[h] = r.c[i]?.v ?? null;
    });
    return obj;
  });

  return rows;
}

// Build the artist → song → {year, rank} map
function buildArtistMap(rows: any[]) {
  const HDR = {
    year: ["year", "release_year", "yr"],
    rank: ["rank", "position"],
    song: ["song", "title", "songs"],
    artist: ["artist", "artists"],
  };

  function valueFor(obj: Record<string, any>, keys: string[]) {
    const canon = (s: string) => s.toLowerCase().replace(/[\s_]+/g, " ").trim();
    const map = new Map(Object.keys(obj).map(k => [canon(k), k]));
    for (const key of keys) {
      const k = map.get(canon(key));
      if (k && obj[k] != null) return obj[k];
    }
    return null;
  }

  const artistMap = new Map<string, Map<string, { song: string; artist: string; list: { year: number; rank: number }[] }>>();
  const yearSet = new Set<number>();

  for (const r of rows) {
    const year = Number(valueFor(r, HDR.year));
    const rank = Number(valueFor(r, HDR.rank));
    const song = valueFor(r, HDR.song);
    const artist = valueFor(r, HDR.artist);
    if (!year || !rank || !song || !artist) continue;

    yearSet.add(year);

    const a = norm(artist);
    const s = norm(song);

    if (!artistMap.has(a)) artistMap.set(a, new Map());
    const songsMap = artistMap.get(a)!;

    if (!songsMap.has(s)) {
      songsMap.set(s, { song, artist, list: [] });
    }

    songsMap.get(s)!.list.push({ year, rank });
  }

  for (const [_, songsMap] of artistMap) {
    for (const [__, obj] of songsMap) {
      obj.list.sort((a, b) => a.year - b.year);
    }
  }

  const years = Array.from(yearSet).filter(y => y >= 2002).sort((a, b) => b - a);

  return { byArtistSong: Object.fromEntries(
    [...artistMap.entries()].map(([a, m]) => [a, Object.fromEntries([...m.entries()])])
  ), years };
}

serve(async (_req) => {
  try {
    if (!SHEET_ID) {
      return new Response("Missing SHEET_ID", { status: 500 });
    }

    const rows = await fetchGviz(SHEET_ID, TAB_NAME);
    const result = buildArtistMap(rows);

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", },
    });
  } catch (e) {
    console.error("Function error:", e);
    return new Response("Failed to load data", { status: 500 });
  }
});
