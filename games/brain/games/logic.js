import { CATS } from '../core/catalog.js';
import { beep, clamp, grid, h, pick, range, rnd, sample, shuffle } from '../core/engine.js';

const HOUSE = ['#ff543e', '#368cf4', '#34c7a1', '#ffc21f', '#b07cf0', '#ff7fa8'];

function homeward(ctx) {
  function solve(W, H, adj, start, kits) {
    // Поиск в ширину по состояниям: где машинка и что с каждым котёнком (0 ждёт, 1 едет, 2 дома).
    const n = kits.length, cap = 3;
    const startState = [start, kits.map(() => 0)];
    const key = (p, s) => `${p}|${s.join('')}`;
    const apply = (p, s) => { const r = [...s]; kits.forEach((k, i) => { if (r[i] === 1 && k.home === p) r[i] = 2; }); kits.forEach((k, i) => { if (r[i] === 0 && k.at === p && r.filter((v) => v === 1).length < cap) r[i] = 1; }); return r; };
    const first = apply(start, startState[1]);
    const q = [[start, first, []]], seen = new Set([key(start, first)]);
    while (q.length) {
      const [p, s, path] = q.shift();
      if (s.every((v) => v === 2)) return path;
      for (const nx of adj[p]) {
        const ns = apply(nx, s), k = key(nx, ns);
        if (!seen.has(k)) { seen.add(k); q.push([nx, ns, [...path, nx]]); }
      }
    }
    return null;
  }
  function round() {
    if (!ctx.alive) return;
    ctx.clear();
    const lv = ctx.level, W = clamp(3 + (lv >> 2), 3, 5), H = clamp(3 + (lv >> 2), 3, 5), n = W * H;
    const kitsN = clamp(1 + Math.ceil(lv / 3), 1, 4);
    const adj = range(n).map((i) => { const x = i % W, y = Math.floor(i / W); return [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < W && b < H).map(([a, b]) => b * W + a); });
    const spots = sample(range(n), kitsN * 2 + 1);
    const start = spots[0];
    const kits = range(kitsN).map((i) => ({ at: spots[1 + i * 2], home: spots[2 + i * 2], color: HOUSE[i], state: 0 }));
    const plan = solve(W, H, adj, start, kits);
    const budget = plan.length;
    let pos = start, fuel = budget, done = false;
    const cell = grid(ctx.board, W, H, (x, y, i) => h('button', { class: 'cell', type: 'button', style: { background: '#eef6f3', position: 'relative', fontSize: 'clamp(15px,5vw,26px)' }, 'aria-label': `Перекрёсток ${i + 1}`, onclick: () => move(i) }));
    function act() {
      kits.forEach((k) => { if (k.state === 1 && k.home === pos) { k.state = 2; beep(780); } });
      kits.forEach((k) => { if (k.state === 0 && k.at === pos && kits.filter((v) => v.state === 1).length < 3) { k.state = 1; beep(620); } });
    }
    function paint() {
      cell.cells.forEach((c, i) => {
        c.replaceChildren(); c.style.background = adj[pos].includes(i) ? '#fff0b8' : '#eef6f3';
        const home = kits.find((k) => k.home === i);
        if (home) { c.style.background = home.color; c.append(h('span', {}, home.state === 2 ? '🏡' : '🏠')); }
        const kit = kits.find((k) => k.state === 0 && k.at === i);
        if (kit) { c.append(h('span', { style: { display: 'inline-flex', background: kit.color, borderRadius: '50%', padding: '2px', border: '2px solid #15304a' } }, '🐱')); }
        if (i === pos) c.append(h('span', { style: { position: 'absolute', fontSize: '1.2em' } }, '🚙'));
      });
      const riding = kits.filter((k) => k.state === 1).length;
      ctx.say(`Ходов осталось: ${fuel}${riding ? `  ·  В машине котят: ${riding}` : ''}`);
    }
    function finish(win) {
      done = true;
      if (win) ctx.good(kitsN * 8 + budget); else ctx.bad();
      ctx.after(win ? 600 : 900, round);
    }
    function move(i) {
      if (done || !adj[pos].includes(i) || fuel <= 0) return;
      pos = i; fuel--; beep(420, 0.04); act(); paint();
      if (kits.every((k) => k.state === 2)) finish(true);
      else if (fuel <= 0) finish(false);
    }
    act(); paint();
    let botStep = 0;
    ctx.bot(() => { if (!done && plan[botStep] !== undefined) cell.cells[plan[botStep++]].click(); });
    if (kits.every((k) => k.state === 2)) finish(true);
  }
  round();
}

function mosaic(ctx) {
  const PAL = ['#ff7fa8', '#ffd43b', '#34c7a1', '#368cf4', '#b07cf0', '#ff9b4a', '#7fd0e8', '#a7c957'];
  function partition(W, H, maxPieces) {
    for (;;) {
      const owner = new Array(W * H).fill(-1);
      const seeds = sample(range(W * H), maxPieces);
      seeds.forEach((s, i) => { owner[s] = i; });
      let changed = true;
      while (changed) {
        changed = false;
        for (const c of shuffle(range(W * H))) {
          if (owner[c] !== -1) continue;
          const x = c % W, y = Math.floor(c / W);
          const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < W && b < H).map(([a, b]) => owner[b * W + a]).filter((v) => v !== -1);
          if (nb.length) { owner[c] = pick(nb); changed = true; }
        }
      }
      const counts = {};
      owner.forEach((o) => { counts[o] = (counts[o] || 0) + 1; });
      if (Object.values(counts).every((v) => v >= 2 && v <= 7)) return owner;
    }
  }
  function round() {
    if (!ctx.alive) return;
    ctx.clear();
    const lv = ctx.level, W = clamp(3 + (lv >> 2), 3, 6), H = W, pieces = clamp(2 + (lv >> 1), 3, 8);
    const owner = partition(W, H, pieces);
    const list = range(pieces).map((id) => {
      const cells = owner.flatMap((o, i) => (o === id ? [[i % W, Math.floor(i / W)]] : []));
      const minX = Math.min(...cells.map((c) => c[0])), minY = Math.min(...cells.map((c) => c[1]));
      const shapeCells = cells.map(([x, y]) => [x - minX, y - minY]);
      return { id, shape: shapeCells, ax: minX, ay: minY, color: PAL[id % PAL.length], placed: null, w: Math.max(...shapeCells.map((c) => c[0])) + 1, h: Math.max(...shapeCells.map((c) => c[1])) + 1 };
    });
    const board = new Array(W * H).fill(-1);
    let sel = list[0];
    ctx.say('Выбери фигуру и нажми клетку поля');
    const g = grid(ctx.board, W, H, (x, y, i) => h('button', { class: 'cell', type: 'button', 'aria-label': `Клетка ${i + 1}`, onclick: () => tap(x, y, i) }));
    const tray = h('div', { class: 'tiles' });
    ctx.actions.append(tray);
    function paint() {
      g.cells.forEach((c, i) => { const o = board[i]; c.style.background = o === -1 ? '#f5efe0' : list[o].color; });
      tray.replaceChildren(...list.filter((p) => p.placed === null).map((p) => {
        const size = 15;
        const m = h('span', { style: { display: 'grid', gridTemplateColumns: `repeat(${p.w},${size}px)`, gridTemplateRows: `repeat(${p.h},${size}px)`, gap: '1px' } });
        p.shape.forEach(([x, y]) => m.append(h('i', { style: { gridColumn: x + 1, gridRow: y + 1, background: p.color, border: '1px solid #15304a', borderRadius: '3px' } })));
        return h('button', { class: `tile ${p === sel ? 'sel' : ''}`, type: 'button', style: { background: p === sel ? '#ffe08a' : '#fff', minWidth: '52px', minHeight: '52px' }, 'aria-label': 'Фигура', onclick: () => { sel = p; paint(); } }, m);
      }));
    }
    function fits(p, ax, ay) { return p.shape.every(([x, y]) => { const a = ax + x, b = ay + y; return a >= 0 && b >= 0 && a < W && b < H && board[b * W + a] === -1; }); }
    function tap(x, y, i) {
      const o = board[i];
      if (o !== -1) {
        const p = list[o]; p.shape.forEach(([sx, sy]) => { board[(p.placed[1] + sy) * W + p.placed[0] + sx] = -1; }); p.placed = null; sel = p; paint(); return;
      }
      if (!sel) return;
      // Ставим фигуру так, чтобы её первая клетка совпала с нажатой, если получается.
      const [fx, fy] = sel.shape[0];
      const tries = [[x - fx, y - fy], ...sel.shape.map(([sx, sy]) => [x - sx, y - sy])];
      const place = tries.find(([a, b]) => fits(sel, a, b));
      if (!place) { g.cells[i].classList.add('no'); setTimeout(() => g.cells[i].classList.remove('no'), 220); beep(190, 0.08, 'square', 0.03); return; }
      sel.placed = place; sel.shape.forEach(([sx, sy]) => { board[(place[1] + sy) * W + place[0] + sx] = sel.id; }); beep(620, 0.05);
      sel = list.find((p) => p.placed === null) || null;
      paint();
      if (list.every((p) => p.placed)) { ctx.good(pieces * 6); ctx.after(650, round); }
    }
    paint();
    ctx.bot(() => {
      const p = list.find((q) => q.placed === null);
      if (!p) return;
      sel = p;
      const [fx, fy] = p.shape[0];
      const px = p.ax + fx, py = p.ay + fy;
      tapAt(px, py);
      function tapAt(x, y) { tap(x, y, y * W + x); }
    });
  }
  round();
}

function queue(ctx) {
  const heroes = Object.keys(CATS);
  const validators = {
    before: (o, a, b) => o.indexOf(a) < o.indexOf(b),
    right: (o, a, b) => o.indexOf(a) + 1 === o.indexOf(b),
    first: (o, a) => o[0] === a,
    last: (o, a) => o[o.length - 1] === a,
    notFirst: (o, a) => o[0] !== a,
  };
  const text = (c) => {
    const A = CATS[c.a].name, B = c.b ? CATS[c.b].name : '';
    return { before: `${A} стоит раньше, чем ${B}.`, right: `${A} и ${B} стоят рядом: ${A} впереди.`, first: `Первое место занимает ${A}.`, last: `Последнее место занимает ${A}.`, notFirst: `Первое место занимает не ${A}.` }[c.t];
  };
  const perms = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
  function round() {
    if (!ctx.alive) return;
    ctx.clear();
    const n = clamp(2 + Math.ceil(ctx.level / 3), 3, 6);
    const who = sample(heroes, n);
    const answer = shuffle(who);
    const all = perms(who);
    const clues = [];
    const ok = (p, c) => validators[c.t](p, c.a, c.b);
    let left = all;
    let guard = 0;
    while (left.length > 1 && guard++ < 200) {
      const a = pick(who), b = pick(who.filter((x) => x !== a));
      const c = pick([{ t: 'before', a: answer.indexOf(a) < answer.indexOf(b) ? a : b, b: answer.indexOf(a) < answer.indexOf(b) ? b : a },
        { t: 'before', a: answer.indexOf(a) < answer.indexOf(b) ? a : b, b: answer.indexOf(a) < answer.indexOf(b) ? b : a },
        answer.indexOf(a) + 1 === answer.indexOf(b) ? { t: 'right', a, b } : { t: 'notFirst', a: answer[0] === a ? b : a },
        { t: 'first', a: answer[0] }, { t: 'last', a: answer[n - 1] }]);
      const next = left.filter((p) => ok(p, c));
      if (next.length < left.length) { clues.push(c); left = next; }
    }
    ctx.say('Нажимай котиков по порядку, начиная с первого');
    const picked = [];
    const col = h('div', { class: 'col', style: { justifyContent: 'flex-start', overflow: 'auto' } });
    col.append(h('ul', { class: 'clues' }, clues.map((c) => h('li', {}, text(c)))));
    const queueLine = h('div', { class: 'tiles', style: { minHeight: '56px' } });
    col.append(queueLine);
    ctx.board.append(col);
    let lock = false;
    const buttons = shuffle(who).map((id) => h('button', { class: 'tile', type: 'button', 'data-id': id, style: { padding: '4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '14px' }, onclick: (e) => choose(id, e.currentTarget) },
      h('img', { src: `img/${CATS[id].img}.webp`, alt: '', style: { width: '42px', height: '42px', objectFit: 'contain' } }), CATS[id].name));
    const tray = h('div', { class: 'tiles' }, buttons);
    ctx.actions.append(tray);
    function choose(id, el) {
      if (lock) return;
      picked.push(id); el.disabled = true;
      queueLine.append(h('span', { class: 'chip' }, `${picked.length}. ${CATS[id].name}`));
      if (picked.length < n) return;
      lock = true;
      const good = clues.every((c) => ok(picked, c));
      if (good) ctx.good(n * 7); else ctx.bad();
      ctx.say(good ? 'Верно!' : `Правильно: ${answer.map((x) => CATS[x].name).join(', ')}`);
      ctx.after(good ? 700 : 1800, round);
    }
    ctx.bot(() => { const id = answer[picked.length]; if (id) buttons.find((b) => b.dataset.id === id)?.click(); });
  }
  round();
}

function treasure(ctx) {
  const D = { '⬆️': [0, -1], '➡️': [1, 0], '⬇️': [0, 1], '⬅️': [-1, 0] };
  function dogAt(d, t) {
    const period = (d.path.length - 1) * 2;
    if (!period) return d.path[0];
    const k = t % period;
    return k < d.path.length ? d.path[k] : d.path[period - k];
  }
  function solve(W, H, rocks, dogs, start, goal) {
    const lcm = 12;
    const q = [[start, 0, []]], seen = new Set([`${start}|0`]);
    while (q.length) {
      const [p, t, path] = q.shift();
      if (p === goal) return path;
      if (path.length > 40) continue;
      const x = p % W, y = Math.floor(p / W);
      for (const [name, [dx, dy]] of Object.entries(D)) {
        const a = x + dx, b = y + dy;
        if (a < 0 || b < 0 || a >= W || b >= H) continue;
        const np = b * W + a;
        if (rocks.has(np)) continue;
        const nt = t + 1;
        // Нельзя встать на клетку пса и нельзя поменяться с ним местами.
        if (dogs.some((d) => dogAt(d, nt) === np || (dogAt(d, nt) === p && dogAt(d, t) === np))) continue;
        const k = `${np}|${nt % lcm}`;
        if (!seen.has(k)) { seen.add(k); q.push([np, nt, [...path, name]]); }
      }
    }
    return null;
  }
  function build(lv) {
    const W = clamp(4 + (lv >> 2), 4, 6), H = W;
    for (let tries = 0; tries < 200; tries++) {
      const start = 0, goal = W * H - 1;
      const rocks = new Set(sample(range(W * H).filter((i) => i !== start && i !== goal), clamp(2 + (lv >> 1), 2, W * 2)));
      const dogs = [];
      const dogN = lv < 3 ? 1 : lv < 8 ? 2 : 3;
      for (let i = 0; i < dogN; i++) {
        const row = 1 + rnd(H - 2), a = rnd(W - 2), len = 3;
        const path = range(len).map((k) => row * W + a + k);
        if (path.some((p) => rocks.has(p) || p === start || p === goal)) continue;
        if (dogs.some((d) => d.path.some((p) => path.includes(p)))) continue;
        dogs.push({ path });
      }
      if (!dogs.length) continue;
      const plan = solve(W, H, rocks, dogs, start, goal);
      if (plan && plan.length >= W) return { W, H, rocks, dogs, start, goal, plan };
    }
    return build(1);
  }
  function round() {
    if (!ctx.alive) return;
    ctx.clear();
    const t = build(ctx.level);
    let queueMoves = [], running = false, pos = t.start;
    ctx.say('Составь маршрут: псы ходят на шаг за каждый твой шаг');
    const g = grid(ctx.board, t.W, t.H, (x, y, i) => h('div', { class: 'cell static', style: { background: t.rocks.has(i) ? '#8a8f95' : '#e7f6d9', fontSize: 'clamp(15px,5vw,26px)' } }));
    function paint(time = 0, plannedPath = []) {
      g.cells.forEach((c, i) => {
        const dog = t.dogs.some((d) => dogAt(d, time) === i);
        if (i === pos) c.replaceChildren(h('img', { src: 'img/rocky.webp', alt: 'Рокки' })); else c.textContent = dog ? '🐕' : i === t.goal ? '💎' : t.rocks.has(i) ? '🪨' : '';
        c.style.outline = plannedPath.includes(i) ? '3px solid #ff9b4a' : '';
      });
    }
    const plannedCells = () => {
      const out = []; let c = t.start;
      for (const m of queueMoves) { const x = c % t.W + D[m][0], y = Math.floor(c / t.W) + D[m][1]; if (x < 0 || y < 0 || x >= t.W || y >= t.H) break; c = y * t.W + x; out.push(c); }
      return out;
    };
    const planLine = h('div', { style: { minHeight: '26px', fontSize: '16px', textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap', gridColumn: '1/-1' } });
    function add(m) { if (running || queueMoves.length >= 24) return; queueMoves.push(m); planLine.textContent = queueMoves.join(''); paint(0, plannedCells()); beep(500, 0.03); }
    const arrows = Object.keys(D).map((m) => h('button', { class: 'answer big', type: 'button', style: { minHeight: '46px', fontSize: '22px' }, onclick: () => add(m) }, m));
    const clear = h('button', { class: 'answer', type: 'button', style: { minHeight: '46px', fontSize: '15px', gridColumn: 'span 2' }, onclick: () => { if (!running) { queueMoves = []; planLine.textContent = ''; paint(); } } }, 'Стереть');
    const goBtn = h('button', { class: 'answer btn-green', type: 'button', style: { minHeight: '46px', fontSize: '15px', gridColumn: 'span 2' }, onclick: run }, 'Идти');
    ctx.actions.classList.add('cols-4');
    ctx.actions.append(planLine, ...arrows, clear, goBtn);
    ctx.actions.style.gridTemplateColumns = 'repeat(4,1fr)';
    ctx.keys({ ArrowUp: () => add('⬆️'), ArrowRight: () => add('➡️'), ArrowDown: () => add('⬇️'), ArrowLeft: () => add('⬅️'), Enter: run });
    function run() {
      if (running || !queueMoves.length) return;
      running = true;
      let time = 0, prev = pos;
      const stepMs = 220;
      const stop = ctx.every(stepMs, () => {
        if (!queueMoves.length) { stop(); fail(); return; }
        const m = queueMoves.shift();
        planLine.textContent = queueMoves.join('');
        const x = pos % t.W + D[m][0], y = Math.floor(pos / t.W) + D[m][1];
        if (x < 0 || y < 0 || x >= t.W || y >= t.H || t.rocks.has(y * t.W + x)) { stop(); paint(time); fail(); return; }
        prev = pos; const np = y * t.W + x; const was = time; time++; pos = np; paint(time);
        if (t.dogs.some((d) => dogAt(d, time) === np || (dogAt(d, time) === prev && dogAt(d, was) === np))) { stop(); fail(); return; }
        if (pos === t.goal) { stop(); ctx.good(t.plan.length * 4 + t.dogs.length * 6); ctx.after(600, round); }
      });
    }
    function fail() { ctx.bad(); ctx.say('Маршрут не сработал. Новая карта!'); ctx.after(1000, round); }
    paint();
    ctx.bot(() => { if (!running) { t.plan.forEach(add); run(); } });
  }
  round();
}

function milkPipes(ctx) {
  // Трубы: стороны 0 верх, 1 право, 2 низ, 3 лево.
  const KIND = { I: [0, 2], L: [0, 1], T: [0, 1, 2] };
  const svgFor = (sides) => {
    const lines = sides.map((s) => ({ 0: 'M12 12V0', 1: 'M12 12H24', 2: 'M12 12V24', 3: 'M12 12H0' }[s])).join(' ');
    return `<svg viewBox="0 0 24 24" width="100%" height="100%"><path d="${lines}" stroke="#15304a" stroke-width="10" stroke-linecap="round" fill="none"/><path d="${lines}" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`;
  };
  const rotSides = (sides, r) => sides.map((s) => (s + r) % 4);
  function genPath(W, H) {
    for (;;) {
      const path = [0], seen = new Set([0]);
      const goal = W * H - 1;
      let g = 0;
      while (path[path.length - 1] !== goal && g++ < 80) {
        const c = path[path.length - 1], x = c % W, y = Math.floor(c / W);
        const nb = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]].filter(([a, b]) => a >= 0 && b >= 0 && a < W && b < H).map(([a, b]) => b * W + a).filter((v) => !seen.has(v));
        if (!nb.length) break;
        const n = pick(nb); path.push(n); seen.add(n);
      }
      if (path[path.length - 1] === goal) return path;
    }
  }
  const sideOf = (W, a, b) => (b === a - W ? 0 : b === a + 1 ? 1 : b === a + W ? 2 : 3);
  function round() {
    if (!ctx.alive) return;
    ctx.clear();
    const lv = ctx.level, W = clamp(3 + (lv >> 2), 3, 6), H = W;
    const path = genPath(W, H);
    const tiles = range(W * H).map(() => null);
    path.forEach((c, i) => {
      const prev = i === 0 ? 3 : sideOf(W, c, path[i - 1]);
      const next = i === path.length - 1 ? 1 : sideOf(W, c, path[i + 1]);
      const straight = (prev + 2) % 4 === next;
      const kind = straight ? 'I' : 'L';
      // Найти поворот, при котором труба соединяет нужные стороны.
      const need = [prev, next];
      const sol = range(4).find((r) => need.every((s) => rotSides(KIND[kind], r).includes(s)));
      tiles[c] = { kind, sol, rot: rnd(4) };
    });
    tiles.forEach((t, i) => { if (!t) tiles[i] = { kind: pick(['I', 'L', 'T']), sol: null, rot: rnd(4) }; });
    // Источник и миска подходят к углам: иначе поле может решиться само.
    if (tiles.every((t) => t.sol === null || t.rot === t.sol)) tiles[path[0]].rot = (tiles[path[0]].sol + 1) % 4;
    let done = false;
    ctx.say('Поверни трубы от молока 🥛 к миске 🥣');
    const g = grid(ctx.board, W, H, (x, y, i) => h('button', { class: 'cell', type: 'button', style: { background: '#d7f0f7', padding: '2px', position: 'relative' }, 'aria-label': `Труба ${i + 1}`, onclick: () => turn(i) }));
    const connected = () => {
      const open = (i) => rotSides(KIND[tiles[i].kind], tiles[i].rot);
      if (!open(0).includes(3)) return new Set();
      const seen = new Set([0]); const q = [0];
      while (q.length) {
        const c = q.shift(), x = c % W, y = Math.floor(c / W);
        for (const s of open(c)) {
          const nx = s === 1 ? x + 1 : s === 3 ? x - 1 : x, ny = s === 0 ? y - 1 : s === 2 ? y + 1 : y;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const n = ny * W + nx;
          if (!seen.has(n) && open(n).includes((s + 2) % 4)) { seen.add(n); q.push(n); }
        }
      }
      return seen;
    };
    const isSolved = (seen) => seen.has(W * H - 1) && rotSides(KIND[tiles[W * H - 1].kind], tiles[W * H - 1].rot).includes(1);
    function paint() {
      const seen = connected();
      g.cells.forEach((c, i) => {
        c.innerHTML = svgFor(rotSides(KIND[tiles[i].kind], tiles[i].rot));
        c.style.background = seen.has(i) ? '#fff' : '#cfe8ef';
        if (i === 0) c.append(h('span', { style: { position: 'absolute', left: 0, top: 0, fontSize: '16px' } }, '🥛'));
        if (i === W * H - 1) c.append(h('span', { style: { position: 'absolute', right: 0, bottom: 0, fontSize: '16px' } }, '🥣'));
      });
      return isSolved(seen);
    }
    function turn(i) {
      if (done) return;
      tiles[i].rot = (tiles[i].rot + 1) % 4; beep(460, 0.03);
      if (paint()) { done = true; ctx.good(W * W * 2); ctx.after(650, round); }
    }
    paint();
    ctx.bot(() => { const i = path.find((c) => tiles[c].rot !== tiles[c].sol); if (i !== undefined) turn(i); });
  }
  round();
}

export const games = { homeward, mosaic, queue, treasure, 'milk-pipes': milkPipes,

  // Рассадить овощи по правилам или доказать, что правила несовместимы.
  'garden-rules': (ctx) => {
    const SEEDS = ['🥕', '🍅', '🌽', '🥒', '🍆'];
    const perms = (a) => (a.length < 2 ? [a] : a.flatMap((v, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [v, ...p])));
    const posOf = (arr) => { const p = {}; arr.forEach((s, i) => { p[s] = i; }); return p; };
    function makeRule(seeds, lv) {
      const [a, b] = sample(seeds, 2), n = seeds.length, i = rnd(n), j = rnd(n);
      const kinds = ['left', 'next', 'far', 'at', 'notAt', ...(lv >= 3 ? ['if', 'if'] : [])];
      const kind = pick(kinds);
      if (kind === 'left') return { text: `${a} левее ${b}`, test: (p) => p[a] < p[b] };
      if (kind === 'next') return { text: `${a} рядом с ${b}`, test: (p) => Math.abs(p[a] - p[b]) === 1 };
      if (kind === 'far') return { text: `${a} не рядом с ${b}`, test: (p) => Math.abs(p[a] - p[b]) !== 1 };
      if (kind === 'at') return { text: `${a} на грядке ${i + 1}`, test: (p) => p[a] === i };
      if (kind === 'notAt') return { text: `${a} не на грядке ${i + 1}`, test: (p) => p[a] !== i };
      return { text: `Если ${a} на грядке ${i + 1}, то ${b} на грядке ${j + 1}`, test: (p) => p[a] !== i || p[b] === j };
    }
    function puzzle(lv) {
      const n = lv < 4 ? 3 : lv < 8 ? 4 : 5;
      const seeds = sample(SEEDS, n);
      const all = perms(seeds);
      const secret = pick(all);
      const fixed = lv >= 2 && Math.random() < 0.6 ? rnd(n) : -1;
      let sols = all.filter((a) => fixed < 0 || a[fixed] === secret[fixed]);
      const rules = [];
      for (let t = 0; t < 200 && sols.length > 2 && rules.length < n + 1; t++) {
        const r = makeRule(seeds, lv);
        if (!r.test(posOf(secret)) || rules.some((x) => x.text === r.text)) continue;
        const next = sols.filter((a) => r.test(posOf(a)));
        if (next.length < sols.length) { rules.push(r); sols = next; }
      }
      if (!rules.length) rules.push({ text: `${secret[0]} на грядке 1`, test: (p) => p[secret[0]] === 0 });
      sols = sols.filter((a) => rules.every((r) => r.test(posOf(a))));
      let impossible = false;
      if (lv >= 4 && Math.random() < 0.22) {
        for (let t = 0; t < 120 && !impossible; t++) {
          const r = makeRule(seeds, lv);
          if (!rules.some((x) => x.text === r.text) && !sols.some((a) => r.test(posOf(a))) && all.some((a) => r.test(posOf(a)))) { rules.push(r); impossible = true; }
        }
      }
      return { n, seeds, secret, fixed, rules: shuffle(rules), impossible, sols };
    }
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const lv = ctx.level, t = puzzle(lv);
      const arr = Array(t.n).fill(null);
      if (t.fixed >= 0) arr[t.fixed] = t.secret[t.fixed];
      let sel = null, done = false;
      ctx.say('Рассади овощи так, чтобы все правила выполнялись');
      const slots = h('div', { class: 'tiles' });
      const shelf = h('div', { class: 'tiles' });
      ctx.board.append(h('div', { class: 'col', style: { justifyContent: 'flex-start', overflow: 'auto' } },
        h('ul', { class: 'clues', style: { paddingLeft: '22px' } }, ...t.rules.map((r) => h('li', {}, r.text))), slots, shelf));
      function paint() {
        slots.replaceChildren(...arr.map((s, i) => h('button', { class: `tile ${i === t.fixed ? 'ok' : ''}`, type: 'button', 'aria-label': `Грядка ${i + 1}`, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1, minWidth: 'clamp(50px,15vw,70px)' }, onclick: () => place(i) }, h('span', { style: { fontSize: '11px', fontWeight: 400 } }, String(i + 1)), s || '·')));
        shelf.replaceChildren(...t.seeds.filter((s) => !arr.includes(s)).map((s) => h('button', { class: `tile ${s === sel ? 'sel' : ''}`, type: 'button', onclick: () => { sel = s === sel ? null : s; paint(); } }, s)));
      }
      function place(i) {
        if (done || i === t.fixed) return;
        if (sel) { if (arr[i]) arr[arr.indexOf(arr[i])] = null; arr[i] = sel; sel = null; } else arr[i] = null;
        beep(500, 0.04); paint();
      }
      function finish(right, keep) {
        done = true;
        if (right) ctx.good(12 + t.n * 3); else ctx.bad();
        if (!right && !keep) {
          if (t.impossible) ctx.say('Здесь правила спорят друг с другом: решения нет');
          else { t.sols[0].forEach((s, i) => { arr[i] = s; }); paint(); ctx.say('Вот как можно было рассадить'); }
        }
        ctx.after(right ? 600 : 1900, round);
      }
      const check = () => {
        if (done) return;
        if (arr.includes(null)) { ctx.say('Сначала заполни все грядки'); return; }
        finish(!t.impossible && t.rules.every((r) => r.test(posOf(arr))));
      };
      const never = () => { if (!done) finish(t.impossible); };
      const checkBtn = h('button', { class: 'answer btn-green', type: 'button', onclick: check }, 'Проверить');
      const neverBtn = h('button', { class: 'answer btn-red', type: 'button', onclick: never }, 'Невозможно');
      ctx.actions.classList.add(lv >= 4 ? 'cols-2' : 'cols-1');
      if (lv >= 4) ctx.actions.append(neverBtn);
      ctx.actions.append(checkBtn);
      ctx.keys({ Enter: check });
      paint();
      ctx.bot(() => { if (done) return; if (t.impossible) { neverBtn.click(); return; } t.sols[0].forEach((s, i) => { arr[i] = s; }); paint(); checkBtn.click(); });
    }
    round();
  },
};
