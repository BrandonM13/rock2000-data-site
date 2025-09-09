// web/src/lib/liveData.js — clean spec: read year sheet A:D; YEAR from MASTER_LOG by key SONG|ARTIST
import { fetchGviz, fetchCsv } from "./gviz";

export const SHEET_ID = "1xlSqIR-ZjTaZB5Ghn4UmoryKxdcjyvFUKfCqI299fnE";
export const TAB_MASTER_LOG = "MASTER_LOG";

const CACHE_TTL_MS = 1000 * 60 * 60 * 12;

function getCache(key){
  try{
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.t || !obj.v) return null;
    if (Date.now() - obj.t > CACHE_TTL_MS) return null;
    return obj.v;
  }catch{ return null; }
}
function setCache(key, v){
  try{ sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); }catch{}
}

// Return EXACT key as displayed: "SONG|ARTIST"
function exactKey(song, artist){
  return `${(song ?? "").toString()}` + "|" + `${(artist ?? "").toString()}`;
}

export async function loadYearRows(targetYear){
  const ck = `yearRows_${targetYear}_v4a`;
  const cached = getCache(ck);
  if (cached) return cached;

  // A:D => RANK, SONG, ARTIST, CHANGE (display text)
  const { rowsArrayF, rowsArrayV } = await fetchGviz({
    sheetId: SHEET_ID,
    sheetName: String(targetYear),
    range: "A:D"
  });
  // CSV fallback for column D when GViz JSON formatted value is null
  const csvD = await fetchCsv({ sheetId: SHEET_ID, sheetName: String(targetYear), range: "D:D" });

  const out = [];
  for (let i = 0; i < rowsArrayF.length; i++){
    const arrF = rowsArrayF[i] || [];
    const arrV = rowsArrayV[i] || [];
    const rank = Number(arrF[0] ?? arrV[0]);
    const song = arrF[1];
    const artist = arrF[2];
    let change = arrF[3];

    if (!rank || !song || !artist) continue;

    if (change === null || change === undefined || (typeof change === "string" && change.trim() === "")){
      change = (arrV[3] !== undefined && arrV[3] !== null) ? arrV[3] : (csvD[i] ? csvD[i][0] : null);
    }
    if (typeof change === "string") change = change.trim();

    const keyExact = exactKey(song, artist);

    out.push({ rank, song, artist, change, keyExact });
  }

  out.sort((a,b)=> a.rank - b.rank);
  setCache(ck, out);
  return out;
}

export async function loadReleaseYearMap(){
  const ck = "releaseMap_v4a";
  const cached = getCache(ck);
  if (cached){
    // revive as Map
    return new Map(Object.entries(cached));
  }
  // We need MASTER_LOG!C (key "SONG|ARTIST") and I (YEAR)
  const { rowsArrayF } = await fetchGviz({ sheetId: SHEET_ID, sheetName: TAB_MASTER_LOG });
  const map = new Map();
  for (const row of rowsArrayF){
    const key = row[2];        // MASTER_LOG column C (displayed)
    const year = row[8];       // MASTER_LOG column I (displayed)
    if (!key) continue;
    if (!map.has(key)) map.set(key, year ?? "");
  }
  const obj = {}; map.forEach((v,k)=> obj[k]=v);
  setCache(ck, obj);
  return map;
}
