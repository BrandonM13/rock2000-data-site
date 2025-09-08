// ---- Color constants (your palette) ----
export const COLORS = {
  rankGood:  '#57bb8a', // lowest/best rank end of scale
  rankBad:   '#e67c73', // highest/worst rank end of scale
  changePos: '#57bb8a',
  changeNeg: '#e67c73',
  changeNone:'#b7e1cd', // dash
  debutBg:   '#fce8b2',
  reentryTx: '#f09300', // text color; bg stays white
};

// ---- Helpers (unchanged utilities) ----
export function norm(s){
  return (s||"").toString().normalize("NFKD").toUpperCase()
    .replace(/&/g,"AND").replace(/["'`]/g,"").replace(/\s+/g," ").trim();
}
export function headerIndex(cols, candidates){
  const lower = cols.map(c => c.toString().trim().toLowerCase());
  for (const cand of candidates){ const i = lower.indexOf(cand); if (i !== -1) return i; }
  return -1;
}

// ---- Hex blending for the rank scales (green -> red anchored to your colors) ----
function hexToRgb(hex){
  const h = hex.replace('#','');
  const v = h.length===3 ? h.split('').map(x=>x+x).join('') : h;
  const r = parseInt(v.slice(0,2),16), g = parseInt(v.slice(2,4),16), b = parseInt(v.slice(4,6),16);
  return {r,g,b};
}
function rgbToHex(r,g,b){
  const p = n => n.toString(16).padStart(2,'0');
  return `#${p(r)}${p(g)}${p(b)}`;
}
function blendHex(c1, c2, t){
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const lerp = (x,y)=>Math.round(x+(y-x)*t);
  return rgbToHex(lerp(a.r,b.r), lerp(a.g,b.g), lerp(a.b,b.b));
}

/**
 * Rank/score color scale (used for year cells, Best, Average).
 * value closer to min -> greener (#57bb8a); closer to max -> redder (#e67c73)
 */
export function scaleGreenRed(value, min, max){
  if(value==null || isNaN(value) || min==null || max==null || min===max) return '';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return blendHex(COLORS.rankGood, COLORS.rankBad, t);
}

/**
 * Change cell style (fixed colors). Returns { bg, color }.
 * - positive -> green bg (#57bb8a)
 * - negative -> red bg (#e67c73)
 * - '-'      -> #b7e1cd
 * - 'DEBUT'  -> #fce8b2
 * - 'RE-ENTRY' -> white bg, orange text (#f09300)
 * - '' (blank) -> transparent
 */
export function getChangeStyle(val){
  if (val === '-')          return { bg: COLORS.changeNone, color: '#000' };
  if (val === 'DEBUT')      return { bg: COLORS.debutBg,  color: '#000' };
  if (val === 'RE-ENTRY')   return { bg: '#ffffff',       color: COLORS.reentryTx };
  if (val === '' || val==null) return { bg: '',           color: '#000' };
  return { bg: (Number(val) > 0 ? COLORS.changePos : COLORS.changeNeg), color: '#000' };
}

// Back-compat helper (if anything still imports scaleChange)
export function scaleChange(val){ return getChangeStyle(val).bg; }
