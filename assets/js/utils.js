// ---- Palette ----
export const COLORS = {
  // heatmap anchors (shared across Best, Avg, Year grid)
  rankGood:  '#57bb8a',  // low/better
  rankBad:   '#e67c73',  // high/worse
  // Change column
  changePos: '#57bb8a',  // > 0
  changeNeg: '#e67c73',  // < 0
  changeNone:'#b7e1cd',  // '-'
  debutBg:   '#fce8b2',  // DEBUT
  reentryTx: '#f09300',  // RE-ENTRY text (bg white)
};

// ---- Basics ----
export function norm(s){
  return (s||"").toString().normalize("NFKD").toUpperCase()
    .replace(/&/g,"AND").replace(/['"`]/g,"").replace(/\s+/g," ").trim();
}
export function headerIndex(cols, candidates){
  const lower = cols.map(c => c.toString().trim().toLowerCase());
  for (const cand of candidates){ const i = lower.indexOf(cand); if (i !== -1) return i; }
  return -1;
}

// ---- Hex blending helpers ----
function hexToRgb(hex){
  const h = hex.replace('#','');
  const v = h.length===3 ? h.split('').map(x=>x+x).join('') : h;
  return { r:parseInt(v.slice(0,2),16), g:parseInt(v.slice(2,4),16), b:parseInt(v.slice(4,6),16) };
}
function rgbToHex(r,g,b){ const p=n=>n.toString(16).padStart(2,'0'); return `#${p(r)}${p(g)}${p(b)}`; }
function blendHex(c1,c2,t){ const a=hexToRgb(c1), b=hexToRgb(c2);
  const L=(x,y)=>Math.round(x+(y-x)*t); return rgbToHex(L(a.r,b.r), L(a.g,b.g), L(a.b,b.b)); }

/**
 * Shared heatmap: green (#57bb8a) -> white -> red (#e67c73)
 * min -> green, mid -> white, max -> red
 */
export function scaleGreenRed(value, min, max){
  if (value==null || isNaN(value) || min==null || max==null || min===max) return '';
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  if (t <= 0.5) return blendHex(COLORS.rankGood, '#ffffff', t/0.5);      // green -> white
  return blendHex('#ffffff', COLORS.rankBad, (t-0.5)/0.5);               // white -> red
}

/** Fixed colors for Change column (no gradients). */
export function getChangeStyle(val){
  if (val === '-')        return { bg: COLORS.changeNone, color: '#000' };
  if (val === 'DEBUT')    return { bg: COLORS.debutBg,    color: '#000' };
  if (val === 'RE-ENTRY') return { bg: '#ffffff',         color: COLORS.reentryTx };
  if (val === '' || val==null) return { bg: '',           color: '#000' };
  return { bg: (Number(val) > 0 ? COLORS.changePos : COLORS.changeNeg), color: '#000' };
}
