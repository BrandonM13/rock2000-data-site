// ===== CONFIG =====
export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE"; // change if needed
export const TAB_MCD = "MasterCountdownData"; // YEAR, RANK, KEY=SONG|ARTIST, SONGS, ARTISTS
export const LIVE_REFRESH_MS = 60_000; // 60s; bump to 120_000 if your sheet grows

// Case‑insensitive header synonyms
export const EXPECTED = {
year: ["year", "release_year", "yr"],
rank: ["rank", "position"],
song: ["songs", "song", "title", "song_title", "all_caps_title", "all caps title"],
artist: ["artists", "artist", "artist_name", "all_caps_artist", "all caps artist"],
key: ["key", "key = song|artist", "master_key", "song|artist", "song_artist_key"],

};
