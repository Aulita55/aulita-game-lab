import { beep, clamp, grid, h, pick, quiz, range, rnd, sample, shuffle, yesNo } from '../core/engine.js';

const SNACKS = ['🐟', '🧀', '🥛', '🍗', '🥚', '🍤', '🥩', '🍪'];

// Подсказка-разделитель: на первой карточке отвечать не нужно.
function firstThenAsk(ctx, render, nextValue, same, question = 'Такая же, как прошлая?') {
  let prev = nextValue(null);
  ctx.clear(); ctx.say('Запоминай первую карточку'); render(prev);
  ctx.after(900, function trial() {
    if (!ctx.alive) return;
    const want = Math.random() < 0.45;
    const cur = nextValue(prev, want);
    const ok = same(prev, cur);
    ctx.clear(); render(cur); ctx.say(question);
    let lock = false;
    const go = (v) => { if (lock) return; lock = true; if (v === ok) ctx.good(10); else ctx.bad(); prev = cur; ctx.after(v === ok ? 90 : 340, trial); };
    const btns = yesNo(ok).map((o, i) => h('button', { class: `answer ${o.cls}`, type: 'button', onclick: () => go(i === 1) }, o.label));
    ctx.actions.classList.add('cols-2'); ctx.actions.append(...btns);
    ctx.keys({ ArrowLeft: () => go(false), ArrowRight: () => go(true) });
    ctx.bot(() => btns[ok ? 1 : 0].click());
  });
}

const FOLD_CELLS = 3;
function foldPattern(level) {
  const n = FOLD_CELLS, rows = 3;
  const dots = clamp(2 + (level >> 1), 2, 6);
  const leftCells = sample(range(n * rows), dots);
  const rightCells = sample(range(n * rows), Math.max(1, dots - 1));
  return { n, rows, leftCells, rightCells };
}
function miniGrid(n, rows, filled) {
  const g = h('div', { class: 'mini', style: { gridTemplateColumns: `repeat(${n},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` } });
  for (let i = 0; i < n * rows; i++) g.append(h('i', { class: filled.has(i) ? 'f' : '' }));
  return g;
}

export const games = {
  'same-fish': (ctx) => {
    const set = ['🐟', '🐠', '🐡', '🦈', '🐙', '🦀'];
    firstThenAsk(ctx, (v) => ctx.board.append(h('div', { class: 'big-card' }, v)), (prev, want) => {
      if (prev === null) return pick(set);
      if (want) return prev;
      let n = pick(set); while (n === prev) n = pick(set); return n;
    }, (a, b) => a === b);
  },

  'same-spot': (ctx) => {
    const animals = ['🐭', '🐹', '🐰', '🦔', '🐿️'];
    const render = (v) => {
      const n = v.n;
      const g = grid(ctx.board, n, n, (x, y, i) => h('div', { class: 'cell static' }, i === v.pos ? v.who : '🪟'));
      return g;
    };
    firstThenAsk(ctx, render, (prev, want) => {
      const n = ctx.level < 6 ? 3 : 4;
      if (prev === null || prev.n !== n) return { n, pos: rnd(n * n), who: pick(animals) };
      if (want) return { n, pos: prev.pos, who: pick(animals) };
      let pos = rnd(n * n); while (pos === prev.pos) pos = rnd(n * n);
      return { n, pos, who: Math.random() < 0.5 ? prev.who : pick(animals) };
    }, (a, b) => a.pos === b.pos && a.n === b.n, 'Зверёк в том же окошке?');
  },

  feeders: (ctx) => {
    quiz(ctx, (lv) => {
      const count = lv < 4 ? 3 : lv < 8 ? 4 : 6;
      const bowls = SNACKS.slice(0, count);
      const want = pick(bowls);
      return {
        say: 'Нажми такую же миску!', cols: count === 6 ? 6 : count,
        show: (b) => b.append(h('div', { class: 'big-card' }, want)),
        options: bowls.map((x) => ({ label: x, ok: x === want, cls: 'big' })),
        points: 7,
      };
    }, { pause: 80, badPause: 320 });
  },

  scooter: (ctx) => {
    ctx.clear(); ctx.say('Объезжай препятствия');
    const lanes = 3;
    const arena = h('div', { class: 'arena', style: { background: 'repeating-linear-gradient(90deg,#d4d9d6 0 33%,#bcc5c1 33% 33.4%)' } });
    ctx.board.append(arena);
    const hero = h('div', { class: 'sprite', style: { fontSize: '42px', width: '33.3%', height: '60px', left: '33.3%', bottom: '10px', transition: 'left .09s linear' } }, '🛴');
    arena.append(hero);
    let lane = 1, obstacles = [], spawn = 0, hitLock = 0;
    const move = (d) => { lane = clamp(lane + d, 0, lanes - 1); hero.style.left = `${lane * 33.333}%`; beep(330, 0.04); };
    const left = h('button', { class: 'answer big', type: 'button', onclick: () => move(-1), 'aria-label': 'Влево' }, '⬅️');
    const right = h('button', { class: 'answer big', type: 'button', onclick: () => move(1), 'aria-label': 'Вправо' }, '➡️');
    ctx.actions.classList.add('cols-2'); ctx.actions.append(left, right);
    ctx.keys({ ArrowLeft: () => move(-1), ArrowRight: () => move(1) });
    ctx.on(arena, 'pointerdown', (e) => { const r = arena.getBoundingClientRect(); lane = clamp(Math.floor((e.clientX - r.left) / r.width * lanes), 0, lanes - 1); hero.style.left = `${lane * 33.333}%`; });
    const items = ['🚧', '🪨', '📦', '🛢️', '🌵'];
    ctx.frame((dt) => {
      const speed = 150 + ctx.level * 22;
      spawn -= dt;
      const H = arena.clientHeight;
      if (spawn <= 0) {
        spawn = Math.max(0.55, 1.35 - ctx.level * 0.07);
        const blocked = ctx.level >= 6 && Math.random() < 0.4 ? sample(range(lanes), 2) : [rnd(lanes)];
        blocked.forEach((l) => {
          const el = h('div', { class: 'sprite', style: { fontSize: '36px', width: '33.3%', height: '44px', left: `${l * 33.333}%`, top: 0 } }, pick(items));
          arena.append(el); obstacles.push({ l, y: -44, el });
        });
      }
      hitLock = Math.max(0, hitLock - dt);
      const heroTop = H - 70;
      obstacles = obstacles.filter((o) => {
        o.y += speed * dt;
        o.el.style.transform = `translateY(${o.y}px)`;
        if (!o.hit && o.l === lane && o.y + 40 > heroTop && o.y < heroTop + 50 && hitLock <= 0) {
          o.hit = true; hitLock = 0.4; ctx.bad(); hero.animate([{ transform: 'rotate(-12deg)' }, { transform: 'rotate(12deg)' }, { transform: 'none' }], 300);
        }
        if (o.y > H) { o.el.remove(); if (!o.hit) ctx.good(4); return false; }
        return true;
      });
    });
    ctx.bot(() => {
      const threats = obstacles.filter((o) => !o.hit && o.y + 44 < H0() && o.y > H0() - 240);
      const blocked = new Set(threats.map((o) => o.l));
      if (blocked.has(lane)) { const free = range(lanes).find((l) => !blocked.has(l)); if (free !== undefined) { lane = free; hero.style.left = `${lane * 33.333}%`; } }
    });
    const H0 = () => arena.clientHeight;
  },

  suitcase: (ctx) => {
    const flip = (cells, n, rows) => new Set(cells.map((i) => { const y = Math.floor(i / n), x = i % n; return y * n + (n - 1 - x); }));
    const key = (s) => [...s].sort((a, b) => a - b).join();
    quiz(ctx, (lv) => {
      const t = foldPattern(lv);
      const leftS = new Set(t.leftCells);
      const answer = new Set([...t.rightCells, ...flip(t.leftCells, t.n, t.rows)]);
      const seen = new Set([key(answer)]);
      const wrongs = [];
      const candidates = [new Set([...t.rightCells, ...t.leftCells]), new Set(t.rightCells), new Set([...flip(t.rightCells, t.n, t.rows), ...t.leftCells])];
      for (const c of candidates) { const k = key(c); if (!seen.has(k)) { seen.add(k); wrongs.push(c); } }
      while (wrongs.length < 2) {
        const s = new Set(answer); const c = rnd(t.n * t.rows);
        if (s.has(c)) s.delete(c); else s.add(c);
        const k = key(s); if (s.size && !seen.has(k)) { seen.add(k); wrongs.push(s); }
      }
      const options = shuffle([{ s: answer, ok: true }, ...wrongs.slice(0, 2).map((s) => ({ s, ok: false }))]);
      return {
        say: 'Левую половину кладём на правую. Что получится?', cols: 3, points: 12,
        show: (b) => {
          const sheet = h('div', { style: { display: 'flex', alignItems: 'center', gap: '0', width: 'min(82vw,330px)', background: '#fffbe9', border: '3px solid var(--ink)', borderRadius: '14px', padding: '10px' } },
            h('div', { style: { flex: 1 } }, miniGrid(t.n, t.rows, leftS)),
            h('div', { style: { width: '0', height: '90px', borderLeft: '3px dashed var(--red-dark)', margin: '0 8px' } }),
            h('div', { style: { flex: 1 } }, miniGrid(t.n, t.rows, new Set(t.rightCells))));
          b.append(sheet);
        },
        options: options.map((o) => ({ label: miniGrid(t.n, t.rows, o.s), ok: o.ok, aria: 'Вариант рисунка' })),
      };
    }, { badPause: 800 });
  },

  'sausage-chase': (ctx) => {
    function maze(n) {
      const open = range(n * n).map(() => new Set());
      const seen = new Set([0]); const stack = [0];
      while (stack.length) {
        const c = stack[stack.length - 1];
        const x = c % n, y = Math.floor(c / n);
        const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < n && b < n).map(([a, b]) => b * n + a).filter((v) => !seen.has(v));
        if (!nb.length) { stack.pop(); continue; }
        const v = pick(nb); open[c].add(v); open[v].add(c); seen.add(v); stack.push(v);
      }
      return open;
    }
    function path(open, from, to) {
      const prev = new Map([[from, -1]]); const q = [from];
      while (q.length) { const c = q.shift(); if (c === to) break; for (const v of open[c]) if (!prev.has(v)) { prev.set(v, c); q.push(v); } }
      const out = []; let c = to; while (c !== from && c !== undefined) { out.unshift(c); c = prev.get(c); }
      return out;
    }
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const n = clamp(4 + (ctx.level >> 2), 4, 7);
      const open = maze(n);
      const food = pick(range(n * n).filter((i) => i !== 0 && i !== n * n - 1 && path(open, 0, i).length >= 3));
      let me = 0, rival = n * n - 1, done = false;
      const rot = pick([0, 90, 180, 270]);
      ctx.say('Беги к сосиске раньше соперника!');
      const g = grid(ctx.board, n, n, (x, y, i) => {
        const el = h('button', { class: 'cell', type: 'button', style: { borderRadius: 0, background: '#fff8e6', border: 0, position: 'relative' }, 'aria-label': `Клетка ${i + 1}`, onclick: () => move(i) });
        const b = '3px solid #15304a';
        el.style.borderTop = !open[i].has(i - n) ? b : '1px dotted #d8cfae';
        el.style.borderBottom = !open[i].has(i + n) ? b : '1px dotted #d8cfae';
        el.style.borderLeft = !open[i].has(i - 1) ? b : '1px dotted #d8cfae';
        el.style.borderRight = !open[i].has(i + 1) ? b : '1px dotted #d8cfae';
        return el;
      });
      g.root.style.gap = '0'; g.root.style.transform = `rotate(${rot}deg)`;
      function paint() {
        g.cells.forEach((c, i) => {
          const s = i === me ? 'me' : i === rival ? '🐶' : i === food ? '🌭' : '';
          if (c.dataset.s === s) return;
          c.dataset.s = s;
          if (s === 'me') c.replaceChildren(h('img', { src: 'img/rocky.webp', alt: 'Рокки' })); else c.textContent = s;
          c.style.transform = s ? `rotate(${-rot}deg)` : '';
        });
      }
      function finish(win) {
        if (done) return; done = true; stopRival();
        if (win) ctx.good(10 + n * 3); else ctx.bad();
        ctx.after(600, round);
      }
      function move(i) {
        if (done || !open[me].has(i)) return;
        me = i; beep(520, 0.04); paint();
        if (me === food) finish(true);
      }
      const delay = Math.max(620, 1300 - ctx.level * 45);
      const startDelay = ctx.botMode ? delay * 4 : delay;
      let stopRival = () => {};
      ctx.after(startDelay, () => {
        if (done) return;
        stopRival = ctx.every(delay, () => {
          const p = path(open, rival, food);
          if (p.length) { rival = p[0]; paint(); }
          if (rival === food) finish(false);
        });
      });
      paint();
      const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // экран: вверх, вправо, вниз, влево
      const stepBy = (k) => {
        const [dx, dy] = dirs[(k - rot / 90 + 4) % 4];
        const x = me % n + dx, y = Math.floor(me / n) + dy;
        if (x >= 0 && y >= 0 && x < n && y < n) move(y * n + x);
      };
      ctx.keys({ ArrowUp: () => stepBy(0), ArrowRight: () => stepBy(1), ArrowDown: () => stepBy(2), ArrowLeft: () => stepBy(3) });
      ctx.bot(() => { const p = path(open, me, food); if (p.length) g.cells[p[0]].click(); });
    }
    round();
  },

  // Три ответа вместо двух: совпало всё, половина или ничего.
  'fish-flash': (ctx) => {
    const FISHES = ['🐟', '🐠', '🐡', '🦈', '🐙', '🦀'];
    const BACKS = ['#ffd9d3', '#c9f4e4', '#cfe4ff', '#fff0b3'];
    const show = (b, v) => b.append(h('div', { class: 'big-card', style: { background: v.bg } }, v.f));
    const other = (set, x) => pick(set.filter((y) => y !== x));
    let prev = { f: pick(FISHES), bg: pick(BACKS) };
    ctx.clear(); ctx.say('Запоминай первую карточку'); show(ctx.board, prev);
    ctx.after(900, () => quiz(ctx, () => {
      const kind = rnd(3);
      const half = Math.random() < 0.5;
      const cur = kind === 0 ? { ...prev } : kind === 1 ? (half ? { f: prev.f, bg: other(BACKS, prev.bg) } : { f: other(FISHES, prev.f), bg: prev.bg }) : { f: other(FISHES, prev.f), bg: other(BACKS, prev.bg) };
      prev = cur;
      return {
        say: 'Сравни с прошлой карточкой', cols: 3, points: 11, show: (b) => show(b, cur),
        keys: { ArrowLeft: 0, ArrowDown: 1, ArrowRight: 2 },
        options: [{ label: 'Всё то же', ok: kind === 0 }, { label: 'Часть', ok: kind === 1 }, { label: 'Всё другое', ok: kind === 2 }],
      };
    }, { pause: 90, badPause: 340 }));
  },

  // Прямая через центр тарелки должна разделить угощение поровну.
  'fair-split': (ctx) => {
    const TREATS = ['🐟', '🍪', '🧀', '🍤'];
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const half = clamp(2 + (ctx.level >> 1), 2, 9);
      const icon = pick(TREATS), solution = rnd(180);
      const pts = [];
      for (const side of [0, 1]) {
        let placed = 0, tries = 0;
        while (placed < half && tries++ < 3000) {
          const a = (solution + 20 + Math.random() * 140 + side * 180) * Math.PI / 180;
          const r = 0.26 + Math.random() * 0.62;
          const p = { x: Math.cos(a) * r, y: Math.sin(a) * r };
          if (pts.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 0.25)) { pts.push(p); placed++; }
        }
      }
      const countSides = (deg) => {
        const a = deg * Math.PI / 180, nx = -Math.sin(a), ny = Math.cos(a);
        return pts.reduce((c, p) => { c[p.x * nx + p.y * ny > 0 ? 0 : 1]++; return c; }, [0, 0]);
      };
      let angle = rnd(180), guard = 0;
      while (guard++ < 40 && countSides(angle)[0] === countSides(angle)[1]) angle = rnd(180);
      let done = false;
      ctx.say('Проведи палочку так, чтобы котятам досталось поровну');
      const line = h('div', { style: { position: 'absolute', left: '-2%', right: '-2%', top: 'calc(50% - 3px)', height: '6px', borderRadius: '6px', background: 'var(--ink)', pointerEvents: 'none' } });
      const plate = h('div', { style: { position: 'relative', width: 'min(100cqw,100cqh)', aspectRatio: '1', maxWidth: '440px', borderRadius: '50%', border: '4px solid var(--ink)', background: '#fffbe9', touchAction: 'none', cursor: 'grab', flex: 'none' } }, line);
      pts.forEach((p) => plate.append(h('span', { class: 'sprite', style: { left: `${50 + p.x * 45}%`, top: `${50 + p.y * 45}%`, transform: 'translate(-50%,-50%)', fontSize: 'clamp(20px,6vw,30px)', pointerEvents: 'none' } }, icon)));
      ctx.board.append(plate);
      const paint = () => { line.style.transform = `rotate(${angle}deg)`; };
      paint();
      let drag = false;
      const aim = (e) => { const r = plate.getBoundingClientRect(); angle = ((Math.atan2(e.clientY - r.top - r.height / 2, e.clientX - r.left - r.width / 2) * 180 / Math.PI) + 360) % 180; paint(); };
      ctx.on(plate, 'pointerdown', (e) => { if (done) return; drag = true; plate.setPointerCapture(e.pointerId); aim(e); });
      ctx.on(plate, 'pointermove', (e) => { if (drag && !done) aim(e); });
      ctx.on(plate, 'pointerup', () => { drag = false; });
      const turn = (d) => { if (done) return; angle = (angle + d + 180) % 180; paint(); };
      const submit = () => {
        if (done) return; done = true;
        const [a, b] = countSides(angle);
        if (a === b) { ctx.say(`Поровну: ${a} и ${b}!`); ctx.good(10 + half * 3); } else { ctx.say(`Не поровну: ${a} и ${b}`); ctx.bad(); }
        ctx.after(a === b ? 520 : 1000, round);
      };
      const ok = h('button', { class: 'answer btn-green', type: 'button', onclick: submit }, 'Готово');
      ctx.actions.classList.add('cols-3');
      ctx.actions.append(h('button', { class: 'answer big', type: 'button', 'aria-label': 'Повернуть влево', onclick: () => turn(-6) }, '↺'), ok, h('button', { class: 'answer big', type: 'button', 'aria-label': 'Повернуть вправо', onclick: () => turn(6) }, '↻'));
      ctx.keys({ ArrowLeft: () => turn(-6), ArrowRight: () => turn(6), Enter: submit, ' ': submit });
      ctx.bot(() => { angle = solution; paint(); ok.click(); });
    }
    round();
  },

  // В реке всплывают звери: один из них уже был в прошлый раз.
  'river-patrol': (ctx) => {
    const ANIMALS = ['🦆', '🐸', '🐢', '🦢', '🐟', '🦀', '🐊', '🦩', '🐧', '🐙', '🦦', '🐳'];
    let last = [];
    const spots = (k) => sample(range(12), k).map((i) => ({ x: 6 + (i % 4) * 23, y: 6 + Math.floor(i / 4) * 31 }));
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const lv = ctx.level;
      const k = clamp(2 + (lv >> 2), 2, 5);
      const first = last.length === 0;
      const seen = first ? null : pick(last);
      const list = first ? sample(ANIMALS, k) : shuffle([seen, ...sample(ANIMALS.filter((x) => !last.includes(x)), k - 1)]);
      last = list;
      ctx.say(first ? 'Запоминай, кто всплыл' : 'Кто уже был в прошлый раз?');
      const arena = h('div', { class: 'arena', style: { background: 'repeating-linear-gradient(170deg,#a8ddf5 0 26px,#97d3ef 26px 52px)' } });
      ctx.board.append(arena);
      let done = false, stopDrift = () => {};
      const finish = (right, el) => {
        if (done) return; done = true; stopTimer(); stopDrift();
        if (right) ctx.good(10 + k * 2); else { ctx.bad(); if (el) el.style.opacity = '.4'; buttons[list.indexOf(seen)].style.background = '#7fe3bf'; }
        ctx.after(right ? 220 : 800, round);
      };
      const place = spots(k);
      const buttons = list.map((a, i) => {
        const b = h('button', { class: 'sprite', type: 'button', 'aria-label': 'Зверёк', style: { left: `${place[i].x}%`, top: `${place[i].y}%`, width: 'clamp(58px,17vw,84px)', height: 'clamp(58px,17vw,84px)', fontSize: 'clamp(36px,11vw,54px)', background: 'rgba(255,255,255,.45)', border: 0, borderRadius: '50%', cursor: 'pointer', padding: 0 }, onclick: (e) => { if (!first) finish(a === seen, e.currentTarget); } }, a);
        arena.append(b); return b;
      });
      const speed = 8 + lv * 2.4; let t = 0;
      stopDrift = ctx.frame((dt) => { t += dt; buttons.forEach((b, i) => { b.style.transform = `translate(${Math.sin(t * 0.9 + i) * speed}px,${Math.cos(t * 0.7 + i * 2) * 6}px)`; }); });
      const stopTimer = ctx.after(first ? 1500 : Math.max(1500, 3600 - lv * 170), () => { if (first) { done = true; stopDrift(); round(); } else finish(false); });
      ctx.bot(first ? null : () => buttons[list.indexOf(seen)].click());
    }
    round();
  },
};
