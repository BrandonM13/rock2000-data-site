export function norm(s){
return (s||"").toString().normalize("NFKD").toUpperCase()
.replace(/&/g,"AND").replace(/["'`]/g,"").replace(/\s+/g," ").trim();
}
export function headerIndex(cols, candidates){
const lower = cols.map(c => c.toString().trim().toLowerCase());
for(const cand of candidates){ const i = lower.indexOf(cand); if(i!==-1) return i; }
return -1;
}
// Color helpers (used by artist matrix)
export const hsl=(h,s,l)=>`hsl(${h} ${s}% ${l}%)`;
export function scaleGreenRed(value, min, max){
if(value==null || isNaN(value) || min==null || max==null || min===max) return '';
const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
const hue = 120 - 120 * t; // green -> red
const sat = 60;
const light = 88 - 38 * (1 - Math.abs(0.5 - t) * 2);
return hsl(hue.toFixed(0), sat, light.toFixed(0));
}
export function scaleChange(val, maxAbs){
if(val === '-') return '#EEEEEE';
if(val === 'DEBUT') return '#FDE68A';
if(val === 'RE-ENTRY') return '#FFD6A5';
if(val==='' || val==null) return '';
const t = Math.max(0, Math.min(1, Math.abs(val) / (maxAbs || 1)));
const light = 86 - 36 * t;
if(val > 0) return hsl(120, 60, light.toFixed(0));
if(val < 0) return hsl(0, 60, light.toFixed(0));
return '#EEEEEE';
}