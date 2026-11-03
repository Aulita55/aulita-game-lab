// Прогресс хранится в браузере. В платформе этот модуль заменяется на запросы к серверу.
const KEY = 'aulita.brain.v1';
let mem = { games: {}, days: {} };
try { const raw = localStorage.getItem(KEY); if (raw) mem = { games: {}, days: {}, ...JSON.parse(raw) }; } catch { /* приватный режим */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* приватный режим */ } };

export const today = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const gameData = (id) => mem.games[id] || { best: 0, plays: 0, level: 1, stars: 0, recent: [] };
export const dayData = (k = today()) => mem.days[k] || { done: [] };

export function starsFor(r) {
  if (r.right + r.wrong === 0) return 0;
  if (r.accuracy >= 0.9 && r.right >= 5) return 3;
  if (r.accuracy >= 0.7 && r.right >= 3) return 2;
  return r.right >= 1 ? 1 : 0;
}

export function record(id, r) {
  const g = { ...gameData(id) };
  const stars = starsFor(r);
  const isBest = r.score > g.best;
  g.best = Math.max(g.best, r.score);
  g.plays++; g.stars = Math.max(g.stars, stars);
  // Следующая игра начинается чуть ниже достигнутого, чтобы был разгон.
  g.level = Math.max(1, r.level - 1);
  const form = Math.round((r.accuracy * 0.6 + (r.peakLevel / 12) * 0.4) * 100);
  g.recent = [...(g.recent || []), form].slice(-5);
  mem.games[id] = g;
  const k = today();
  const d = mem.days[k] || { done: [] };
  if (!d.done.includes(id)) d.done.push(id);
  mem.days[k] = d;
  save();
  return { stars, isBest };
}

export function streak() {
  let n = 0; const d = new Date();
  if (!(mem.days[today(d)]?.done.length)) d.setDate(d.getDate() - 1);
  while (mem.days[today(d)]?.done.length) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

export const categoryForm = (ids) => {
  const v = ids.flatMap((id) => gameData(id).recent || []);
  return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
};
export const totals = () => ({
  plays: Object.values(mem.games).reduce((a, g) => a + g.plays, 0),
  stars: Object.values(mem.games).reduce((a, g) => a + g.stars, 0),
  tried: Object.keys(mem.games).length,
});
export function reset() { mem = { games: {}, days: {} }; save(); }
