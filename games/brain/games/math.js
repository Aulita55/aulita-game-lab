import { clamp, h, pick, quiz, rnd, shuffle } from '../core/engine.js';

const int = (a, b) => a + rnd(b - a + 1);
const plural = (n, one, few, many) => { const a = n % 100, b = n % 10; return a > 10 && a < 20 ? many : b === 1 ? one : b >= 2 && b <= 4 ? few : many; };
const fish = (n) => `${n} ${plural(n, 'рыбка', 'рыбки', 'рыбок')}`;
function expr(lv) {
  const big = 6 + lv * 3;
  const kind = lv < 3 ? pick(['+', '-']) : lv < 6 ? pick(['+', '-', '×']) : pick(['+', '-', '×', '÷']);
  if (kind === '+') { const a = int(1, big), b = int(1, big); return { t: `${a} + ${b}`, v: a + b }; }
  if (kind === '-') { const a = int(2, big + 4), b = int(1, a - 1); return { t: `${a} − ${b}`, v: a - b }; }
  if (kind === '×') { const a = int(2, Math.min(9, 2 + lv)), b = int(2, 9); return { t: `${a} × ${b}`, v: a * b }; }
  const b = int(2, 9), v = int(2, 9); return { t: `${b * v} ÷ ${b}`, v };
}

function catchOffer(lv) {
  const kind = lv < 3 ? pick(['bags', 'sum']) : lv < 6 ? pick(['bags', 'sum', 'minus', 'half']) : pick(['bags', 'minus', 'half', 'quarter', 'perc']);
  const base = 4 + lv * 2;
  if (kind === 'bags') { const a = int(2, 4 + (lv >> 1)), b = int(2, 9); return { t: `${a} ${plural(a, 'пакет', 'пакета', 'пакетов')} по ${fish(b)}`, v: a * b }; }
  if (kind === 'sum') { const a = int(3, base), b = int(3, base); return { t: `${fish(a)} и ещё ${b}`, v: a + b }; }
  if (kind === 'minus') { const a = int(base, base + 20), b = int(1, base - 2); return { t: `${fish(a)}, но ${b} ${plural(b, 'уплыла', 'уплыли', 'уплыли')}`, v: a - b }; }
  if (kind === 'half') { const a = int(3, base + 5) * 2; return { t: `половина от ${a} рыбок`, v: a / 2 }; }
  if (kind === 'quarter') { const a = int(3, base) * 4; return { t: `четверть от ${a} рыбок`, v: a / 4 }; }
  const a = pick([20, 40, 50, 60, 80, 100, 120, 200]), p = pick([10, 25, 50]);
  if ((a * p) % 100) return { t: `половина от ${a} рыбок`, v: a / 2 };
  return { t: `${p}% от ${a} рыбок`, v: a * p / 100 };
}

const ball = { '#ff543e': '🔴', '#368cf4': '🔵', '#34c7a1': '🟢', '#ffc21f': '🟡' };
const bagView = (r, o, tag) => h('div', { style: { flex: 1, background: '#fffbe9', border: '3px solid var(--ink)', borderRadius: '22px', padding: '10px', minWidth: 0 } },
  h('div', { style: { fontWeight: 700, marginBottom: '6px', textAlign: 'center' } }, tag),
  h('div', { class: 'bag' }, ...shuffle([...Array(r).fill('🔴'), ...Array(o).fill('⚪')]).map((x) => h('span', {}, x))));

export const games = {
  bigger: (ctx) => {
    quiz(ctx, (lv) => {
      const a = expr(lv);
      let b = expr(lv);
      if (Math.random() < 0.18) { for (let i = 0; i < 40 && b.v !== a.v; i++) b = expr(lv); }
      const ans = a.v > b.v ? 0 : a.v === b.v ? 1 : 2;
      return {
        say: 'Какая сторона больше?', cols: 3, points: 9, keys: { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2 },
        show: (el) => el.append(h('div', { class: 'expr' }, h('div', {}, a.t), h('div', {}, b.t))),
        options: [{ label: 'Левая', ok: ans === 0 }, { label: 'Поровну', ok: ans === 1 }, { label: 'Правая', ok: ans === 2 }],
      };
    }, { pause: 120, badPause: 500 });
  },

  'best-catch': (ctx) => {
    quiz(ctx, (lv) => {
      const n = lv < 5 ? 2 : 3;
      let offers = [];
      for (let g = 0; g < 80; g++) {
        offers = Array.from({ length: n }, () => catchOffer(lv));
        const max = Math.max(...offers.map((o) => o.v));
        if (offers.filter((o) => o.v === max).length === 1 && new Set(offers.map((o) => o.t)).size === n) break;
      }
      const max = Math.max(...offers.map((o) => o.v));
      return {
        say: 'Где больше всего рыбок?', cols: 1, points: 11,
        show: (b) => b.append(h('div', { style: { fontSize: 'clamp(48px,14vw,80px)' } }, '🎣')),
        options: offers.map((o) => ({ label: o.t, ok: o.v === max })),
      };
    }, { pause: 200, badPause: 700 });
  },

  'magic-bags': (ctx) => {
    quiz(ctx, (lv) => {
      const cap = clamp(4 + (lv >> 1), 4, 12);
      let a, b, c, d;
      for (let g = 0; g < 60; g++) {
        a = int(1, cap); b = int(1, cap); c = int(1, cap); d = int(1, cap);
        const diff = Math.abs(a / (a + b) - c / (c + d));
        if (diff > Math.max(0.05, 0.3 - lv * 0.025) && a + b <= cap + 2 && c + d <= cap + 2) break;
      }
      const left = a / (a + b) > c / (c + d);
      return {
        say: 'Где вероятнее вытащить 🔴?', cols: 2, points: 11,
        show: (el) => el.append(h('div', { style: { display: 'flex', gap: '10px', width: '100%', alignItems: 'stretch' } }, bagView(a, b, 'Мешочек 1'), bagView(c, d, 'Мешочек 2'))),
        options: [{ label: 'Мешочек 1', ok: left }, { label: 'Мешочек 2', ok: !left }],
      };
    }, { pause: 200, badPause: 650 });
  },

  'snow-count': (ctx) => {
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const q = expr(ctx.level);
      let input = '';
      ctx.say('Сколько будет?');
      const screen = h('div', { class: 'big-text' }, `${q.t} = ?`);
      ctx.board.append(screen);
      const pad = h('div', { class: 'keypad' });
      const refresh = () => { screen.textContent = `${q.t} = ${input || '?'}`; };
      const press = (k) => {
        if (k === '⌫') input = input.slice(0, -1);
        else if (k === 'ОК') {
          if (!input) return;
          if (Number(input) === q.v) { ctx.good(10); ctx.after(120, round); } else { ctx.bad(); screen.textContent = `${q.t} = ${q.v}`; ctx.after(700, round); }
          input = ''; return;
        } else if (input.length < 4) input += k;
        refresh();
      };
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', 'ОК'].forEach((k) => pad.append(h('button', { class: `answer ${k === 'ОК' ? 'btn-green' : ''}`, type: 'button', onclick: () => press(k) }, k)));
      ctx.actions.classList.add('cols-1'); ctx.actions.append(pad);
      const map = { Backspace: () => press('⌫'), Enter: () => press('ОК') };
      for (let i = 0; i < 10; i++) map[String(i)] = () => press(String(i));
      ctx.keys(map);
      ctx.bot(() => { input = String(q.v); press('ОК'); });
    }
    round();
  },
};
