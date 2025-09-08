import { fetchSheet } from "./gviz";

// Replace with your sheet ID (yours is fine to keep here if public)
const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE"; // ← your Rock 2000 DB

// Tab name exactly as it appears in Google Sheets
const TAB_ARTIST = "Artist Search";

// Map your sheet headers → fields the UI expects
// Adjust these strings if your header labels differ.
const COLS = {
  rank: "RANK",
  title: "SONG",
  artist: "ARTIST",
  year: "YEAR",          // or "ALBUM YEAR" etc.
  change: "CHANGE",      // optional
};

function normalize(s) {
  return (s ?? "").toString().trim();
}

/**
 * Search by artist name (contains, case-insensitive).
 * Returns: [{ rank, title, artist, year, change? }, ...]
 */
export async function searchArtist(query) {
  const q = normalize(query).toUpperCase();
  if (!q) return [];

  const { rows } = await fetchSheet({ sheetId: SHEET_ID, sheetName: TAB_ARTIST });

  // Filter rows where ARTIST contains the query
  const matched = rows.filter((r) => {
    const a = normalize(r[COLS.artist]).toUpperCase();
    return a.includes(q);
  });

  // Map to UI shape
  return matched.map((r) => ({
    rank: Number(r[COLS.rank]),
    title: normalize(r[COLS.title]),
    artist: normalize(r[COLS.artist]),
    year: Number(r[COLS.year]),
    change: r[COLS.change] ?? "-", // optional
  }));
}
