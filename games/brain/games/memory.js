import { CATS } from '../core/catalog.js';
import { beep, clamp, grid, h, pick, quiz, range, rnd, sample, shuffle, yesNo } from '../core/engine.js';

const FISH = ['🐟', '🐠', '🐡', '🦈', '🐙', '🦀', '🐚', '🦑'];
const THINGS = ['🧸', '🎈', '🪀', '🧦', '🎩', '🪁', '📚', '🕯️', '🧵', '🔑', '🎁', '🥁', '🧢', '🪞', '⏰', '🖼️', '🎻', '🧺', '☂️', '🪑'];
const heroIds = Object.keys(CATS);
const catSrc = (id) => `img/${CATS[id].img}.webp`;

function spatial(ctx, rotate) {
  function round() {
    ctx.clear();
    const lv = ctx.level;
    const n = clamp(3 + Math.floor((lv - 1) / 3), 3, 6);
    const count = clamp(2 + Math.ceil(lv * 0.8), 3, Math.floor(n * n * 0.6));
    const targets = new Set(sample(range(n * n), count));
    const left = new Set(targets);
    let phase = 'show', misses = 0;
    ctx.say('Запоминай лапки!');
    const g = grid(ctx.board, n, n, (x, y, i) => h('button', { class: `cell ${targets.has(i) ? 'on' : ''}`, type: 'button', 'aria-label': `Клетка ${i + 1}`, onclick: (e) => tap(i, e.currentTarget) }, targets.has(i) ? '🐾' : ''));
    g.root.style.transition = 'transform .6s ease';
    function tap(i, el) {
      if (phase !== 'recall' || el.classList.contains('ok')) return;
      if (targets.has(i)) {
        left.delete(i); el.classList.add('ok'); el.textContent = '🐾'; beep(620);
        if (!left.size) { phase = 'done'; ctx.good(count * 3); ctx.after(450, round); }
      } else {
        el.classList.add('no'); misses++; ctx.bad();
        phase = 'done';
        g.cells.forEach((c, k) => { if (targets.has(k)) { c.textContent = '🐾'; c.classList.add('on'); } });
        ctx.after(900, round);
      }
    }
    ctx.after(900 + count * 240, () => {
      g.cells.forEach((c) => { c.classList.remove('on'); c.textContent = ''; });
      if (rotate) { const deg = pick([90, -90, 180]); g.root.style.transform = `rotate(${deg}deg)`; ctx.say('Коврик повернулся. Где были лапки?'); } else ctx.say('Где были лапки?');
      ctx.after(rotate ? 650 : 100, () => { phase = 'recall'; });
    });
    ctx.bot(() => { if (phase !== 'recall') return; const i = [...left][0]; if (i !== undefined) g.cells[i].click(); });
  }
  round();
}

export const games = {
  pawprints: (ctx) => spatial(ctx, false),
  'spin-rug': (ctx) => spatial(ctx, true),

  'fish-back': (ctx) => {
    const seq = [];
    function step() {
      if (!ctx.alive) return;
      const n = ctx.level <= 4 ? 1 : ctx.level <= 8 ? 2 : 3;
      const set = FISH.slice(0, 4 + Math.min(4, ctx.level >> 1));
      const canAsk = seq.length >= n;
      const same = canAsk && Math.random() < 0.42;
      let item = same ? seq[seq.length - n] : pick(set);
      if (canAsk && !same) while (item === seq[seq.length - n]) item = pick(set);
      const answer = canAsk && item === seq[seq.length - n];
      seq.push(item);
      ctx.clear();
      ctx.board.append(h('div', { class: 'big-card' }, item));
      if (!canAsk) { ctx.say('Запоминай рыбку'); ctx.bot(null); ctx.after(1000, step); return; }
      ctx.say(n === 1 ? 'Такая же, как прошлая?' : `Такая же, как ${n} карточки назад?`);
      let lock = false;
      const answerNow = (v) => { if (lock) return; lock = true; if (v === answer) ctx.good(8 + n * 4); else ctx.bad(); ctx.after(220, step); };
      const opts = yesNo(answer).map((o, i) => h('button', { class: `answer ${o.cls}`, type: 'button', onclick: () => answerNow(i === 1) }, o.label));
      ctx.actions.classList.add('cols-2'); ctx.actions.append(...opts);
      ctx.keys({ ArrowLeft: () => answerNow(false), ArrowRight: () => answerNow(true) });
      ctx.bot(() => opts[answer ? 1 : 0].click());
    }
    step();
  },

  attic: (ctx) => {
    let pool, seen, showing;
    const fresh = () => { pool = sample(THINGS, 3 + Math.min(4, ctx.level >> 1)); seen = new Set(); };
    fresh();
    function turn() {
      ctx.clear();
      ctx.say(seen.size ? 'Этого ещё не выбирали?' : 'Выбери любой предмет');
      showing = shuffle(pool);
      const cols = showing.length <= 6 ? 3 : 4;
      const rows = Math.ceil(showing.length / cols);
      const g = grid(ctx.board, cols, rows, (x, y, i) => showing[i] ? h('button', { class: 'cell', type: 'button', onclick: (e) => tap(showing[i], e.currentTarget) }, showing[i]) : h('span'));
      let lock = false;
      function tap(it, el) {
        if (lock) return; lock = true;
        if (seen.has(it)) { el.classList.add('no'); ctx.bad(); ctx.after(650, () => { fresh(); turn(); }); return; }
        seen.add(it); el.classList.add('ok'); ctx.good(6);
        const rest = THINGS.filter((t) => !pool.includes(t));
        if (seen.size >= pool.length && !rest.length || pool.length >= 12 && seen.size >= pool.length) { ctx.good(20); ctx.after(450, () => { fresh(); turn(); }); return; }
        if (pool.length < 12) pool.push(pick(rest));
        ctx.after(280, turn);
      }
      ctx.bot(() => { const i = showing.findIndex((x) => !seen.has(x)); g.cells[i]?.click(); });
    }
    turn();
  },

  'pillow-jump': (ctx) => {
    function round() {
      ctx.clear();
      const lv = ctx.level, n = lv < 5 ? 3 : 4, len = clamp(2 + Math.ceil(lv / 2), 3, 9);
      const reverse = lv >= 7 && Math.random() < 0.5;
      const seq = []; while (seq.length < len) { const v = rnd(n * n); if (v !== seq[seq.length - 1]) seq.push(v); }
      const need = reverse ? [...seq].reverse() : seq;
      let pos = 0, phase = 'show';
      ctx.say('Смотри, куда прыгает Тима');
      const g = grid(ctx.board, n, n, (x, y, i) => h('button', { class: 'cell', type: 'button', 'aria-label': `Подушка ${i + 1}`, onclick: (e) => tap(i, e.currentTarget) }, '🛏️'));
      function tap(i, el) {
        if (phase !== 'input') return;
        if (i === need[pos]) {
          el.classList.add('ok'); ctx.after(160, () => el.classList.remove('ok')); beep(500 + pos * 50); pos++;
          if (pos === need.length) { phase = 'done'; ctx.good(len * 3 + (reverse ? 10 : 0)); ctx.after(500, round); }
        } else { el.classList.add('no'); phase = 'done'; ctx.bad(); ctx.after(800, round); }
      }
      seq.forEach((v, i) => {
        ctx.after(420 + i * 560, () => { const c = g.cells[v]; c.replaceChildren(h('img', { src: 'img/tima.webp', alt: 'Тима' })); c.classList.add('on'); beep(420 + v * 30); ctx.after(400, () => { c.textContent = '🛏️'; c.classList.remove('on'); }); });
      });
      ctx.after(520 + seq.length * 560, () => { phase = 'input'; ctx.say(reverse ? 'Теперь в обратном порядке!' : 'Твоя очередь!'); });
      ctx.bot(() => { if (phase === 'input') g.cells[need[pos]].click(); });
    }
    round();
  },

  'yarn-bounce': (ctx) => {
    const D = { R: [1, 0], L: [-1, 0], U: [0, -1], D: [0, 1] };
    const turn = { '/': { R: 'U', L: 'D', U: 'R', D: 'L' }, '\\': { R: 'D', L: 'U', U: 'L', D: 'R' } };
    function trace(n, boards, sx, sy, dir) {
      let x = sx, y = sy, d = dir, hits = 0;
      for (let i = 0; i < 80; i++) {
        x += D[d][0]; y += D[d][1];
        if (x < 0 || y < 0 || x >= n || y >= n) return { x, y, hits };
        const b = boards[y * n + x];
        if (b) { d = turn[b][d]; hits++; }
      }
      return null;
    }
    function make(n, count) {
      for (;;) {
        const boards = {};
        sample(range(n * n), count).forEach((i) => { boards[i] = pick(['/', '\\']); });
        const side = rnd(4), t = rnd(n);
        const [sx, sy, dir] = [[-1, t, 'R'], [n, t, 'L'], [t, -1, 'D'], [t, n, 'U']][side];
        const out = trace(n, boards, sx, sy, dir);
        if (out && out.hits >= Math.min(count, 2) && !(out.x === sx && out.y === sy)) return { boards, sx, sy, dir, out };
      }
    }
    function round() {
      ctx.clear();
      const lv = ctx.level, n = lv < 5 ? 4 : 5, count = clamp(1 + Math.ceil(lv / 2), 2, 7);
      const t = make(n, count);
      let phase = 'show';
      ctx.say('Запомни дощечки');
      const size = n + 2;
      const arrow = { R: '➡️', L: '⬅️', U: '⬆️', D: '⬇️' };
      const g = grid(ctx.board, size, size, (px, py) => {
        const x = px - 1, y = py - 1;
        const inside = x >= 0 && y >= 0 && x < n && y < n;
        const corner = (x < 0 || x >= n) && (y < 0 || y >= n);
        if (corner) return h('span');
        if (inside) { const b = t.boards[y * n + x]; const el = h('div', { class: 'cell static', 'data-b': b ? '1' : '' }, b === '/' ? '╱' : b === '\\' ? '╲' : ''); return el; }
        const start = x === t.sx && y === t.sy;
        const out = x === t.out.x && y === t.out.y;
        const el = h('button', { class: 'cell', type: 'button', style: { background: '#d8eefc' }, 'aria-label': 'Край поля', onclick: () => tap(start ? 'start' : out, el) }, start ? arrow[t.dir] : '');
        if (out) el.dataset.out = '1';
        return el;
      });
      function tap(ok, el) {
        if (phase !== 'answer' || ok === 'start') return; phase = 'done';
        g.cells.filter((c) => c.dataset.b === '1').forEach((c) => { c.style.color = ''; });
        if (ok) { el.classList.add('ok'); el.textContent = '🧶'; ctx.good(count * 4); ctx.after(600, round); } else {
          el.classList.add('no'); ctx.bad();
          const o = g.cells.find((c) => c.dataset.out); o.classList.add('ok'); o.textContent = '🧶'; ctx.after(1100, round);
        }
      }
      ctx.after(1100 + count * 420, () => { g.cells.filter((c) => c.dataset.b === '1').forEach((c) => { c.style.color = 'transparent'; }); phase = 'answer'; ctx.say('Откуда вылетит клубок?'); });
      ctx.bot(() => { if (phase === 'answer') g.cells.find((c) => c.dataset.out).click(); });
    }
    round();
  },

  'cafe-guests': (ctx) => {
    const DISHES = ['🍕', '🍔', '🍣', '🥞', '🍦', '🍩', '🥗', '🍜', '🌮', '🧁', '🍰', '🍝'];
    let known = [];
    const show = (id, dish) => h('div', { class: 'col' }, h('img', { src: catSrc(id), alt: CATS[id].name, style: { height: 'min(32dvh,200px)', maxWidth: '70%', objectFit: 'contain' } }), h('div', { class: 'big-text' }, CATS[id].name), dish ? h('div', { style: { fontSize: '54px', lineHeight: 1 } }, dish) : null);
    function step() {
      if (!ctx.alive) return;
      ctx.clear();
      const cap = clamp(1 + Math.ceil(ctx.level / 2), 2, heroIds.length);
      const newGuest = known.length < 2 || (known.length < cap && Math.random() < 0.45);
      if (newGuest) {
        const id = pick(heroIds.filter((x) => !known.some((k) => k.id === x)));
        const dish = pick(DISHES);
        known.push({ id, dish });
        ctx.say(`${CATS[id].name} заказывает:`);
        ctx.board.append(show(id, dish));
        ctx.bot(null);
        ctx.after(1700, step);
        return;
      }
      const g = pick(known);
      const others = sample(DISHES.filter((d) => d !== g.dish), 2 + Math.min(1, ctx.level >> 2));
      ctx.say(`${CATS[g.id].name} снова здесь. Какой был заказ?`);
      ctx.board.append(show(g.id));
      let lock = false;
      const opts = shuffle([g.dish, ...others]).map((d) => h('button', { class: 'answer big', type: 'button', onclick: (e) => {
        if (lock) return; lock = true; const ok = d === g.dish;
        e.currentTarget.classList.add(ok ? 'is-right' : 'is-wrong');
        if (ok) ctx.good(6 + known.length * 2); else { ctx.bad(); opts.find((b) => b.textContent === g.dish)?.classList.add('is-right'); }
        ctx.after(ok ? 350 : 900, step);
      } }, d));
      ctx.actions.classList.add(`cols-${opts.length}`); ctx.actions.append(...opts);
      ctx.bot(() => opts.find((b) => b.textContent === g.dish).click());
    }
    step();
  },

  nicknames: (ctx) => {
    const NAMES = ['Ватрушка', 'Кнопка', 'Пельмень', 'Шустрик', 'Зефирка', 'Огурчик', 'Тапочек', 'Бублик', 'Шишка', 'Компот', 'Сосиска', 'Пуговка', 'Вафля', 'Батон', 'Мурлыка'];
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const n = clamp(1 + Math.ceil(ctx.level / 3), 2, 6);
      const ids = sample(heroIds, n), nm = sample(NAMES, n);
      const pairs = ids.map((id, i) => ({ id, name: nm[i] }));
      ctx.say('Запоминай прозвища');
      let i = 0;
      function showNext() {
        if (i >= n) return ask(shuffle(pairs), 0);
        const p = pairs[i++];
        ctx.clear();
        ctx.board.append(h('div', { class: 'col' }, h('img', { src: catSrc(p.id), alt: '', style: { height: 'min(36dvh,230px)', maxWidth: '70%', objectFit: 'contain' } }), h('div', { class: 'big-text' }, p.name)));
        ctx.after(1500, showNext);
      }
      function ask(list, k) {
        if (k >= list.length) { ctx.after(150, round); return; }
        ctx.clear();
        const q = list[k];
        ctx.say(`Кто у нас ${q.name}?`);
        const cols = pairs.length <= 3 ? pairs.length : 3;
        const rows = Math.ceil(pairs.length / cols);
        const order = shuffle(pairs);
        let lock = false;
        const g = grid(ctx.board, cols, rows, (x, y, idx) => {
          const p = order[idx];
          if (!p) return h('span');
          const el = h('button', { class: 'cell', type: 'button', 'aria-label': CATS[p.id].name, onclick: () => {
            if (lock) return; lock = true; const ok = p === q;
            el.classList.add(ok ? 'ok' : 'no');
            if (ok) ctx.good(8); else ctx.bad();
            ctx.after(ok ? 320 : 700, () => ask(list, k + 1));
          } }, h('img', { src: catSrc(p.id), alt: '', style: { width: '88%', height: '88%', objectFit: 'contain' } }));
          el.dataset.ok = p === q ? '1' : '';
          return el;
        });
        ctx.bot(() => g.cells.find((c) => c.dataset.ok === '1')?.click());
      }
      ctx.bot(null);
      showNext();
    }
    round();
  },

  // Две карточки назад и одна назад одновременно: держим в уме сразу обе.
  'fish-turbo': (ctx) => {
    const seq = [];
    const LABELS = ['1 назад', '2 назад', 'Новая'];
    function step() {
      if (!ctx.alive) return;
      const set = FISH.slice(0, clamp(4 + (ctx.level >> 1), 4, FISH.length));
      if (seq.length < 2) {
        seq.push(pick(set.filter((x) => x !== seq[0])));
        ctx.clear(); ctx.say('Запоминай рыбок');
        ctx.board.append(h('div', { class: 'big-card' }, seq[seq.length - 1]));
        ctx.bot(null); ctx.after(900, step); return;
      }
      const one = seq[seq.length - 1], two = seq[seq.length - 2];
      // Если две прошлые совпали, ответ стал бы двусмысленным, поэтому даём новую рыбку.
      const roll = one === two ? 2 : Math.random() < 0.3 ? 0 : Math.random() < 0.5 ? 1 : 2;
      const fresh = set.filter((x) => x !== one && x !== two);
      const item = roll === 0 ? one : roll === 1 ? two : pick(fresh);
      seq.push(item);
      ctx.clear(); ctx.say('Эта рыбка была 1 или 2 карточки назад?');
      ctx.board.append(h('div', { class: 'big-card' }, item));
      let lock = false;
      const answer = (v) => { if (lock) return; lock = true; if (v === roll) ctx.good(14); else ctx.bad(); ctx.after(v === roll ? 160 : 480, step); };
      const btns = LABELS.map((t, i) => h('button', { class: 'answer', type: 'button', onclick: () => answer(i) }, t));
      ctx.actions.classList.add('cols-3'); ctx.actions.append(...btns);
      ctx.keys({ 1: () => answer(0), 2: () => answer(1), 3: () => answer(2) });
      ctx.bot(() => btns[roll].click());
    }
    step();
  },

  // Лифт с посылками: набор в сумке всё время меняется.
  'lift-parcels': (ctx) => {
    const PARCELS = ['🧦', '🎩', '🧸', '🎈', '🧶', '🐟', '🥛', '🧀', '🔑', '🎁'];
    const bag = new Set();
    function card(text, sub) {
      ctx.board.replaceChildren(h('div', { class: 'col' }, h('div', { class: 'big-card', style: { width: 'min(46vw,170px)', fontSize: 'clamp(58px,18vw,90px)' } }, text), h('strong', {}, sub)));
    }
    function round() {
      if (!ctx.alive) return;
      ctx.clear(); bag.clear();
      const lv = ctx.level;
      const take = sample(PARCELS, clamp(2 + (lv >> 1), 2, 6));
      let i = 0;
      ctx.say('Лифт едет вверх. Запоминай посылки!'); ctx.bot(null);
      (function collect() {
        if (i >= take.length) { ctx.after(280, () => floors(take)); return; }
        bag.add(take[i]); card(take[i], `Посылка ${i + 1} из ${take.length}`); beep(520, 0.05);
        i++; ctx.after(Math.max(520, 950 - lv * 35), collect);
      })();
    }
    function floors(take) {
      const others = PARCELS.filter((x) => !take.includes(x));
      // Часть посылок спросят дважды: после вручения её уже нет.
      const stops = shuffle([...take, ...sample(others, clamp(take.length - 1, 1, others.length)), ...(ctx.level >= 5 ? [pick(take)] : [])]);
      let idx = 0;
      (function floor() {
        if (!ctx.alive) return;
        if (idx >= stops.length) { round(); return; }
        const want = stops[idx++], has = bag.has(want), guest = pick(heroIds.filter((x) => x !== 'rocky'));
        ctx.clear(); ctx.say(`Этаж ${idx + 1}. Такая посылка ещё в сумке?`);
        ctx.board.append(h('div', { class: 'col' }, h('img', { src: catSrc(guest), alt: CATS[guest].name, style: { height: 'min(24cqh,120px)', objectFit: 'contain' } }), h('div', { class: 'big-card', style: { width: 'min(40vw,140px)', fontSize: 'clamp(50px,15vw,74px)' } }, want)));
        let lock = false;
        const go = (give) => {
          if (lock) return; lock = true; off();
          if (give === has) ctx.good(give ? 12 : 8); else ctx.bad();
          if (give && has) bag.delete(want);
          ctx.after(give === has ? 170 : 460, floor);
        };
        const off = ctx.after(Math.max(1500, 3400 - ctx.level * 160), () => go(false));
        const pass = h('button', { class: 'answer btn-red', type: 'button', onclick: () => go(false) }, 'Ехать дальше');
        const give = h('button', { class: 'answer btn-green', type: 'button', onclick: () => go(true) }, 'Отдать');
        ctx.actions.classList.add('cols-2'); ctx.actions.append(pass, give);
        ctx.keys({ ArrowLeft: () => go(false), ArrowRight: () => go(true) });
        ctx.bot(() => (has ? give : pass).click());
      })();
    }
    round();
  },
};
