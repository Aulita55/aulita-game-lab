import { beep, clamp, grid, h, pick, quiz, range, rnd, sample, shuffle } from '../core/engine.js';

const ROT = { '⬅️': 0, '⬆️': 90, '➡️': 180, '⬇️': 270 };
const fishEl = (dir, size) => h('span', { style: { display: 'inline-block', fontSize: size, transform: dir === 180 ? 'scaleX(-1)' : `rotate(${dir}deg)`, lineHeight: 1 } }, '🐟');

const COLORS = [['#ff543e', 'красный'], ['#368cf4', 'синий'], ['#34c7a1', 'зелёный'], ['#ffd43b', 'жёлтый'], ['#b07cf0', 'фиолетовый'], ['#ff9b4a', 'оранжевый'], ['#ff7fa8', 'розовый'], ['#7a5a3c', 'коричневый']];

const ODD_PAIRS = [['🐟', '🐠'], ['🍎', '🍏'], ['😺', '😸'], ['⭐', '🌟'], ['🐭', '🐹'], ['🌼', '🌻'], ['🍊', '🍋'], ['🟡', '🟠'], ['🐶', '🐺'], ['🧀', '🧈']];

export const games = {
  'fish-school': (ctx) => {
    quiz(ctx, (lv) => {
      const arrows = lv < 5 ? ['⬅️', '➡️'] : ['⬅️', '⬆️', '➡️', '⬇️'];
      const arrow = pick(arrows), dir = ROT[arrow];
      const conflict = Math.random() < clamp(0.35 + lv * 0.05, 0.35, 0.8);
      const other = conflict ? ROT[pick(arrows.filter((a) => a !== arrow))] : dir;
      const size = lv < 7 ? 3 : 5;
      const mid = Math.floor(size / 2);
      return {
        say: 'Куда плывёт рыбка в центре?', cols: arrows.length, points: 8,
        keys: { ArrowLeft: arrows.indexOf('⬅️'), ArrowRight: arrows.indexOf('➡️'), ...(arrows.length > 2 ? { ArrowUp: arrows.indexOf('⬆️'), ArrowDown: arrows.indexOf('⬇️') } : {}) },
        show: (b) => {
          const g = h('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${size},1fr)`, gap: '6px', placeItems: 'center' } });
          for (let i = 0; i < size * size; i++) {
            const y = Math.floor(i / size), x = i % size;
            const c = x === mid && y === mid;
            const near = lv < 7 ? y === mid || x === mid : true;
            g.append(c ? h('span', { style: { background: '#ffe08a', borderRadius: '50%', padding: '6px', display: 'inline-flex' } }, fishEl(dir, size === 3 ? '50px' : '34px')) : near ? fishEl(other, size === 3 ? '50px' : '34px') : h('span'));
          }
          b.append(g);
        },
        options: arrows.map((a) => ({ label: a, ok: a === arrow, cls: 'big' })),
      };
    }, { pause: 120, badPause: 420 });
  },

  'odd-one': (ctx) => {
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const lv = ctx.level, n = clamp(3 + (lv >> 1), 3, 8);
      const rows = n, cols = n;
      const [a, b] = shuffle(pick(ODD_PAIRS));
      const odd = rnd(cols * rows);
      const tilt = lv >= 8;
      ctx.say('Найди предмет, который не такой, как все');
      let lock = false;
      const g = grid(ctx.board, cols, rows, (x, y, i) => {
        const el = h('button', { class: 'cell', type: 'button', style: { background: '#fffbe9', fontSize: `min(${Math.floor(62 / n)}vw,${Math.floor(220 / n)}px)` }, onclick: () => {
          if (lock) return; lock = true;
          if (i === odd) { el.classList.add('ok'); ctx.good(6 + n * 2); ctx.after(260, round); } else { el.classList.add('no'); g.cells[odd].classList.add('ok'); ctx.bad(); ctx.after(800, round); }
        } }, i === odd ? b : a);
        if (tilt) el.style.transform = `rotate(${rnd(4) * 90}deg)`;
        return el;
      });
      ctx.bot(() => g.cells[odd].click());
    }
    round();
  },

  'kitten-bus': (ctx) => {
    ctx.clear();
    ctx.say('Переводи развилки, чтобы котёнок доехал до домика своего цвета');
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 420'); svg.setAttribute('style', 'width:100%;height:100%;display:block');
    ctx.board.append(svg);
    const mk = (tag, a, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); parent.append(e); return e; };
    let depth = 0, nodes = [], kittens = [], layer = null, nextSpawn = 0;

    function build() {
      depth = ctx.level < 4 ? 1 : ctx.level < 8 ? 2 : 3;
      svg.replaceChildren(); kittens = []; nodes = [];
      const leaves = 2 ** depth;
      const rowH = 250 / depth; // длинный въезд, чтобы успеть перевести первую развилку
      function make(d, i) {
        const span = 400 / (2 ** d);
        const n = { d, i, x: span * (i + 0.5), y: 112 + d * rowH, kids: null, state: 0, color: null };
        nodes.push(n);
        if (d < depth) n.kids = [make(d + 1, i * 2), make(d + 1, i * 2 + 1)];
        return n;
      }
      const root = make(0, 0);
      const cols = sample(COLORS, leaves);
      const leavesList = nodes.filter((n) => !n.kids);
      leavesList.forEach((n, i) => { n.color = cols[i][0]; });
      nodes.filter((n) => n.kids).forEach((n) => {
        n.kids.forEach((k, side) => { n['line' + side] = mk('line', { x1: n.x, y1: n.y, x2: k.x, y2: k.y, stroke: '#cbd5d1', 'stroke-width': 7, 'stroke-linecap': 'round' }); });
      });
      function paint(n) { n.line0.setAttribute('stroke', n.state === 0 ? '#15304a' : '#cbd5d1'); n.line1.setAttribute('stroke', n.state === 1 ? '#15304a' : '#cbd5d1'); }
      leavesList.forEach((n) => {
        const size = Math.min(44, 300 / leaves + 8);
        mk('rect', { x: n.x - size / 2, y: n.y - 2, width: size, height: size - 8, rx: 7, fill: n.color, stroke: '#15304a', 'stroke-width': 3 });
        mk('path', { d: `M${n.x - size / 2 - 3} ${n.y} L${n.x} ${n.y - size * 0.45} L${n.x + size / 2 + 3} ${n.y} Z`, fill: n.color, stroke: '#15304a', 'stroke-width': 3 });
      });
      nodes.filter((n) => n.kids).forEach((n) => {
        const toggle = () => { n.state = 1 - n.state; paint(n); beep(600, 0.04); };
        n.toggle = toggle; n.paint = () => paint(n);
        paint(n);
        const hit = mk('circle', { cx: n.x, cy: n.y, r: depth === 3 && n.d === 2 ? 24 : 30, fill: 'transparent', style: 'cursor:pointer' });
        const dot = mk('circle', { cx: n.x, cy: n.y, r: 15, fill: '#ffd43b', stroke: '#15304a', 'stroke-width': 3, 'pointer-events': 'none' });
        hit.addEventListener('pointerdown', (e) => { e.preventDefault(); toggle(); dot.setAttribute('fill', n.state ? '#83cbb5' : '#ffd43b'); });
        n.dot = dot;
      });
      mk('line', { x1: root.x, y1: 0, x2: root.x, y2: root.y, stroke: '#15304a', 'stroke-width': 7 });
      layer = mk('g', {});
      nodes.root = root; nodes.leaves = leavesList;
    }
    build();
    let builtDepth = depth;
    ctx.frame((dt) => {
      const want = ctx.level < 4 ? 1 : ctx.level < 8 ? 2 : 3;
      if (want !== builtDepth && !kittens.length) { build(); builtDepth = depth; }
      nextSpawn -= dt;
      const gap = Math.max(1.7, 4.2 - ctx.level * 0.2);
      if (nextSpawn <= 0 && want === builtDepth) {
        nextSpawn = gap;
        const target = pick(nodes.leaves);
        const g = document.createElementNS(NS, 'g');
        const body = document.createElementNS(NS, 'circle'); body.setAttribute('r', 13); body.setAttribute('fill', target.color); body.setAttribute('stroke', '#15304a'); body.setAttribute('stroke-width', 3);
        const face = document.createElementNS(NS, 'text'); face.setAttribute('text-anchor', 'middle'); face.setAttribute('dy', '6'); face.setAttribute('font-size', '15'); face.textContent = '🐱';
        g.append(body, face); layer.append(g);
        kittens.push({ g, target, at: nodes.root, from: { x: nodes.root.x, y: 8 }, t: 0, to: nodes.root });
      } else if (nextSpawn <= 0) { nextSpawn = 0.3; }
      const speed = 52 + ctx.level * 5;
      kittens = kittens.filter((k) => {
        const dx = k.to.x - k.from.x, dy = k.to.y - k.from.y, len = Math.hypot(dx, dy) || 1;
        k.t += dt * speed / len;
        const p = Math.min(k.t, 1);
        k.g.setAttribute('transform', `translate(${k.from.x + dx * p},${k.from.y + dy * p})`);
        if (k.t < 1) return true;
        const n = k.to;
        if (n.kids) { k.from = { x: n.x, y: n.y }; k.to = n.kids[n.state]; k.t = 0; return true; }
        k.g.remove();
        if (n === k.target) ctx.good(10 + depth * 3); else ctx.bad();
        return false;
      });
    });
    ctx.bot(() => {
      const set = new Set();
      const pathTo = (node, target) => { if (node === target) return []; if (!node.kids) return null; for (const s of [0, 1]) { const r = pathTo(node.kids[s], target); if (r) return [[node, s], ...r]; } return null; };
      [...kittens].sort((a, b) => b.to.d + b.t - (a.to.d + a.t)).forEach((k) => {
        (pathTo(k.to, k.target) || []).forEach(([n, s]) => { if (set.has(n)) return; set.add(n); if (n.state !== s) n.toggle(); });
      });
    });
  },

  drums: (ctx) => {
    ctx.clear(); ctx.say('Нажимай, когда нота дойдёт до линии');
    const padColors = ['#ff7fa8', '#ffd43b', '#34c7a1', '#368cf4'];
    const arena = h('div', { class: 'arena', style: { background: '#fff3c9' } });
    ctx.board.append(arena);
    const line = h('div', { style: { position: 'absolute', left: 0, right: 0, height: '5px', background: '#15304a' } });
    arena.append(line);
    let padCount = 3, notes = [], spawn = 0.3, pattern = 0;
    const tones = [262, 330, 392, 494];
    const pads = range(4).map((i) => h('button', { class: 'answer big', type: 'button', style: { background: padColors[i] }, 'aria-label': `Барабан ${i + 1}`, onpointerdown: (e) => { e.preventDefault(); hit(i); }, onclick: (e) => { if (e.detail === 0) hit(i); } }, '🥁'));
    function layout() {
      padCount = ctx.level < 6 ? 3 : 4;
      ctx.actions.className = `actions cols-${padCount}`;
      ctx.actions.replaceChildren(...pads.slice(0, padCount));
    }
    layout();
    function lineY() { return arena.clientHeight - 54; }
    function hit(i) {
      if (!ctx.alive) return;
      beep(tones[i], 0.12, 'triangle', 0.09);
      const y = lineY();
      const candidates = notes.filter((n) => n.p === i && !n.done && Math.abs(n.y - y) < 42);
      if (!candidates.length) { ctx.bad(); return; }
      const n = candidates.sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))[0];
      n.done = true; n.el.remove(); ctx.good(Math.abs(n.y - y) < 18 ? 10 : 6);
    }
    ctx.keys({ 1: () => hit(0), 2: () => hit(1), 3: () => hit(2), 4: () => padCount > 3 && hit(3), a: () => hit(0), s: () => hit(1), d: () => hit(2), f: () => padCount > 3 && hit(3) });
    ctx.frame((dt) => {
      const speed = 120 + ctx.level * 14;
      const y0 = lineY();
      line.style.top = `${y0}px`;
      if (padCount !== (ctx.level < 6 ? 3 : 4)) layout();
      spawn -= dt;
      if (spawn <= 0) {
        const beat = Math.max(0.34, 0.85 - ctx.level * 0.04);
        pattern++;
        spawn = pattern % 4 === 0 ? beat * 1.5 : beat;
        const p = rnd(padCount);
        const w = 100 / padCount;
        const el = h('div', { class: 'sprite', style: { width: `${w}%`, left: `${p * w}%`, top: 0, height: '30px', fontSize: '26px' } }, '🎵');
        arena.append(el); notes.push({ p, y: -30, el });
      }
      notes = notes.filter((n) => {
        if (n.done) return false;
        n.y += speed * dt; n.el.style.transform = `translateY(${n.y - 15}px)`;
        if (n.y > y0 + 44) { n.el.remove(); ctx.bad(); return false; }
        return true;
      });
    });
    ctx.bot(() => { const y = lineY(); notes.filter((n) => !n.done && Math.abs(n.y - y) < 20).forEach((n) => hit(n.p)); });
  },

  'sharp-eye': (ctx) => {
    const CENTER = ['🐟', '🧀', '🥛', '🍗'];
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const lv = ctx.level, n = 5;
      const pos = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].filter((i) => i !== 12 && (i % 5 === 0 || i % 5 === 4 || i < 5 || i >= 20 || lv < 5));
      const where = pick(pos.filter((i) => i !== 12));
      const center = pick(CENTER);
      const flash = Math.max(240, 900 - lv * 60);
      ctx.say('Смотри в центр!');
      const g = grid(ctx.board, n, n, (x, y, i) => h('button', { class: 'cell', type: 'button', style: { background: i === 12 ? '#ffe08a' : '#eef6f3' }, 'aria-label': `Клетка ${i + 1}`, onclick: () => tapWhere(i) }, i === 12 ? '❔' : ''));
      let phase = 'wait';
      ctx.after(500, () => {
        g.cells[12].textContent = center; g.cells[where].textContent = '🐭';
        ctx.after(flash, () => {
          g.cells[12].textContent = '❔'; g.cells[where].textContent = '';
          phase = 'center'; ctx.say('Что было в центре?');
          const opts = CENTER.map((c) => h('button', { class: 'answer big', type: 'button', onclick: (e) => {
            if (phase !== 'center') return;
            if (c === center) { e.currentTarget.classList.add('is-right'); beep(640); firstOk = true; } else { e.currentTarget.classList.add('is-wrong'); firstOk = false; }
            phase = 'where'; ctx.say('Где была мышка?');
            ctx.after(120, () => ctx.actions.replaceChildren());
          } }, c));
          ctx.actions.classList.add('cols-4'); ctx.actions.append(...opts);
        });
      });
      let firstOk = false;
      function tapWhere(i) {
        if (phase !== 'where' || i === 12) return; phase = 'done';
        const ok = i === where;
        g.cells[where].textContent = '🐭'; g.cells[where].classList.add('ok');
        if (!ok) g.cells[i].classList.add('no');
        if (ok && firstOk) ctx.good(16); else ctx.bad();
        ctx.after(ok && firstOk ? 500 : 900, round);
      }
      ctx.bot(() => {
        if (phase === 'center') [...ctx.actions.children].find((b) => b.textContent === center)?.click();
        else if (phase === 'where') g.cells[where].click();
      });
    }
    round();
  },

  'yarn-count': (ctx) => {
    quiz(ctx, (lv) => {
      const max = clamp(4 + lv, 5, 14), count = 2 + rnd(max - 1);
      const flash = Math.max(350, 1250 - lv * 70);
      const opts = new Set([count]);
      while (opts.size < 4) { const v = count + pick([-3, -2, -1, 1, 2, 3]); if (v >= 1) opts.add(v); }
      return {
        say: 'Сколько клубков?', cols: 4, points: 9,
        show: (b) => {
          const a = h('div', { class: 'arena', style: { background: '#fffbe9' } });
          const taken = [];
          for (let i = 0; i < count; i++) {
            let x, y, guard = 0;
            do { x = 4 + rnd(82); y = 4 + rnd(80); guard++; } while (guard < 60 && taken.some((t) => Math.abs(t[0] - x) < 15 && Math.abs(t[1] - y) < 15));
            taken.push([x, y]);
            a.append(h('span', { class: 'sprite', style: { left: `${x}%`, top: `${y}%`, fontSize: 'clamp(24px,7vw,36px)' } }, '🧶'));
          }
          b.append(a);
          ctx.after(flash, () => { a.replaceChildren(h('div', { class: 'big-text', style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '❔')); });
        },
        options: [...opts].sort((p, q) => p - q).map((v) => ({ label: String(v), ok: v === count, cls: 'big' })),
      };
    }, { pause: 200, badPause: 560 });
  },

  'feed-fish': (ctx) => {
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const n = clamp(2 + (ctx.level >> 1), 3, 8);
      ctx.say('Покорми каждую рыбку по одному разу');
      const arena = h('div', { class: 'arena', style: { background: 'linear-gradient(#bfeaff,#7fcdf0)' } });
      ctx.board.append(arena);
      const fed = new Set(), speed = 26 + ctx.level * 6;
      let lock = false;
      const list = range(n).map((i) => {
        const el = h('button', { class: 'sprite', type: 'button', 'aria-label': 'Рыбка', style: { width: '52px', height: '52px', fontSize: '36px', border: 0, background: 'none', cursor: 'pointer', padding: 0, left: 0, top: 0 } });
        el.append(h('span', { style: { display: 'inline-block' } }, '🐟'));
        const f = { i, el, x: 20 + rnd(240), y: 20 + rnd(200), vx: (Math.random() < .5 ? -1 : 1) * speed, vy: (Math.random() < .5 ? -1 : 1) * speed * .7 };
        el.addEventListener('pointerdown', (e) => { e.preventDefault(); feed(f); });
        el.addEventListener('click', (e) => { if (e.detail === 0) feed(f); });
        arena.append(el);
        return f;
      });
      function feed(f) {
        if (lock) return;
        if (fed.has(f.i)) { lock = true; ctx.bad(); f.el.animate([{ transform: `${f.el.style.transform} scale(1.5)` }, { transform: f.el.style.transform }], 250); ctx.after(650, () => { stop(); round(); }); return; }
        fed.add(f.i); beep(640 + fed.size * 30); ctx.good(5);
        const crumb = h('span', { class: 'sprite', style: { left: `${f.x + 10}px`, top: `${f.y + 10}px`, fontSize: '20px' } }, '✨');
        arena.append(crumb); setTimeout(() => crumb.remove(), 300);
        if (fed.size === n) { lock = true; ctx.good(n * 3); ctx.after(500, () => { stop(); round(); }); }
      }
      const stop = ctx.frame((dt) => {
        const W = arena.clientWidth - 52, H = arena.clientHeight - 52;
        list.forEach((f) => {
          f.x += f.vx * dt; f.y += f.vy * dt;
          if (f.x < 0 || f.x > W) { f.vx *= -1; f.x = clamp(f.x, 0, W); }
          if (f.y < 0 || f.y > H) { f.vy *= -1; f.y = clamp(f.y, 0, H); }
          f.el.style.transform = `translate(${f.x}px,${f.y}px)`;
          f.el.firstChild.style.transform = f.vx > 0 ? 'scaleX(-1)' : '';
        });
      });
      ctx.bot(() => { const f = list.find((x) => !fed.has(x.i)); if (f && !lock) feed(f); });
    }
    round();
  },

  // Взгляд держим на котике в центре, а числа вспыхивают вокруг него.
  'roof-numbers': (ctx) => {
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const lv = ctx.level, n = lv < 5 ? 3 : 5, center = Math.floor(n * n / 2);
      const count = clamp(2 + (lv >> 1), 2, n === 3 ? 6 : 8);
      const free = range(n * n).filter((i) => i !== center);
      const spots = sample(lv < 5 ? free : free.filter((i) => { const x = i % n, y = Math.floor(i / n); return x === 0 || y === 0 || x === n - 1 || y === n - 1 || Math.random() < 0.4; }), count);
      const values = sample(range(lv < 6 ? 9 : 40).map((v) => v + 1), count).sort((a, b) => a - b);
      const at = new Map(shuffle(spots).map((s, i) => [s, values[i]]));
      let phase = 'look', nextIdx = 0;
      ctx.say('Смотри на котика. Числа вспыхнут вокруг');
      const g = grid(ctx.board, n, n, (x, y, i) => (i === center
        ? h('div', { class: 'cell static', style: { background: '#fff' } }, h('img', { src: 'img/mia.webp', alt: 'Мия' }))
        : h('button', { class: 'cell', type: 'button', 'aria-label': `Клетка ${i + 1}`, onclick: (e) => tap(i, e.currentTarget) })));
      function tap(i, el) {
        if (phase !== 'recall' || el.classList.contains('ok')) return;
        if (at.get(i) === values[nextIdx]) {
          el.classList.add('ok'); el.textContent = String(values[nextIdx]); nextIdx++; beep(560 + nextIdx * 40, 0.06);
          if (nextIdx === count) { phase = 'done'; ctx.good(count * 4); ctx.after(450, round); }
        } else {
          phase = 'done'; el.classList.add('no'); ctx.bad();
          at.forEach((v, s) => { g.cells[s].textContent = String(v); g.cells[s].classList.add('on'); });
          ctx.after(1100, round);
        }
      }
      ctx.after(650, () => {
        at.forEach((v, s) => { g.cells[s].textContent = String(v); g.cells[s].classList.add('on'); });
        ctx.after(Math.max(420, 1500 - lv * 90), () => {
          at.forEach((v, s) => { g.cells[s].textContent = ''; g.cells[s].classList.remove('on'); });
          ctx.say('Нажми от меньшего числа к большему'); phase = 'recall';
        });
      });
      ctx.bot(() => { if (phase !== 'recall') return; for (const [s, v] of at) if (v === values[nextIdx]) { g.cells[s].click(); return; } });
    }
    round();
  },

  // Мышата бегут по полю, а клубок мягко разводит их в стороны.
  'mouse-paths': (ctx) => {
    ctx.clear();
    const arena = h('div', { class: 'arena', style: { background: '#e5f4d6', touchAction: 'none', cursor: 'pointer' } });
    ctx.board.append(arena);
    const SIZE = 38;
    let mice = [], charges = 1, recharge = 0, safe = 0, shown = -1;
    const say = () => { const m = Math.max(1, 1 + (ctx.level >> 2)); if (shown !== charges + m * 100) { shown = charges + m * 100; ctx.say(`Не дай мышатам столкнуться. Клубков: ${charges} из ${m}`); } };
    function addMouse() {
      const a = Math.random() * Math.PI * 2;
      const el = h('div', { class: 'sprite', style: { left: 0, top: 0, width: `${SIZE}px`, height: `${SIZE}px`, fontSize: '30px', pointerEvents: 'none' } }, '🐭');
      arena.append(el);
      let x, y, tries = 0;
      const W = arena.clientWidth, H = arena.clientHeight;
      do { x = SIZE + Math.random() * (W - SIZE * 2); y = SIZE + Math.random() * (H - SIZE * 2); } while (tries++ < 30 && mice.some((m) => Math.hypot(m.x - x, m.y - y) < SIZE * 2.5));
      mice.push({ x, y, a, el, hit: 0 });
    }
    function drop(px, py) {
      if (charges <= 0) { beep(180, 0.06, 'square', 0.03); return; }
      charges--; shown = -1; beep(420, 0.07);
      const yarn = h('div', { class: 'sprite', style: { left: `${px - 18}px`, top: `${py - 18}px`, width: '36px', height: '36px', fontSize: '28px', pointerEvents: 'none' } }, '🧶');
      arena.append(yarn); ctx.after(450, () => yarn.remove());
      mice.forEach((m) => { if (Math.hypot(m.x - px, m.y - py) < 130) m.a = Math.atan2(m.y - py, m.x - px); });
    }
    ctx.on(arena, 'pointerdown', (e) => { const r = arena.getBoundingClientRect(); drop(e.clientX - r.left, e.clientY - r.top); });
    const nearest = () => {
      let best = null;
      for (let i = 0; i < mice.length; i++) for (let j = i + 1; j < mice.length; j++) {
        const d = Math.hypot(mice[i].x - mice[j].x, mice[i].y - mice[j].y);
        if (!best || d < best.d) best = { d, a: mice[i], b: mice[j] };
      }
      return best;
    };
    ctx.frame((dt) => {
      const W = arena.clientWidth, H = arena.clientHeight;
      if (!W || !H) return;
      const want = clamp(3 + (ctx.level >> 1), 3, clamp(Math.floor(W * H / 16900), 4, 8)); // на маленьком поле мышат меньше
      while (mice.length < want) addMouse();
      const speed = 40 + ctx.level * 3.5;
      const maxCharges = Math.max(1, 1 + (ctx.level >> 2));
      recharge += dt;
      if (recharge > 1.3) { recharge = 0; if (charges < maxCharges) { charges++; shown = -1; } }
      charges = Math.min(charges, maxCharges);
      say();
      for (const m of mice) {
        m.x += Math.cos(m.a) * speed * dt; m.y += Math.sin(m.a) * speed * dt;
        if (m.x < 2 || m.x > W - SIZE - 2) { m.a = Math.PI - m.a; m.x = clamp(m.x, 2, W - SIZE - 2); }
        if (m.y < 2 || m.y > H - SIZE - 2) { m.a = -m.a; m.y = clamp(m.y, 2, H - SIZE - 2); }
        m.hit = Math.max(0, m.hit - dt);
        m.el.style.transform = `translate(${m.x}px,${m.y}px)`;
      }
      for (let i = 0; i < mice.length; i++) for (let j = i + 1; j < mice.length; j++) {
        const a = mice[i], b = mice[j];
        if (a.hit || b.hit || Math.hypot(a.x - b.x, a.y - b.y) > SIZE * 0.72) continue;
        a.hit = b.hit = 1; safe = 0; ctx.bad();
        const dir = Math.atan2(a.y - b.y, a.x - b.x); a.a = dir; b.a = dir + Math.PI;
      }
      safe += dt;
      if (safe >= 3.5) { safe = 0; ctx.good(7); }
    });
    ctx.bot(() => { const n = nearest(); if (n && n.d < 90) drop((n.a.x + n.b.x) / 2 + SIZE / 2, (n.a.y + n.b.y) / 2 + SIZE / 2); });
  },
};
