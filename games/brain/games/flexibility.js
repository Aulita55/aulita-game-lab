import { clamp, h, pick, quiz, rnd, shuffle, yesNo } from '../core/engine.js';

const COLOR_WORDS = [['#e33b32', 'КРАСНЫЙ', 'Красный'], ['#1f6fe0', 'СИНИЙ', 'Синий'], ['#12925f', 'ЗЕЛЁНЫЙ', 'Зелёный'], ['#d49d00', 'ЖЁЛТЫЙ', 'Жёлтый'], ['#8a4fd6', 'ЛИЛОВЫЙ', 'Лиловый']];
const SHAPES = ['●', '■', '▲', '★'];
const SHAPE_NAMES = { '●': 'круг', '■': 'квадрат', '▲': 'треугольник', '★': 'звезда' };
const COLS = [['#e33b32', 'красный'], ['#1f6fe0', 'синий'], ['#12925f', 'зелёный'], ['#d49d00', 'жёлтый']];
const shape = (s, c, size = '46px') => h('span', { style: { color: c, fontSize: size, lineHeight: 1 } }, s);

export const games = {
  'two-windows': (ctx) => {
    quiz(ctx, (lv) => {
      const three = lv >= 7;
      const task = rnd(three ? 3 : 2);
      const shown = pick([1, 2, 3, 4, 6, 7, 8, 9]);
      const warm = Math.random() < 0.5;
      const color = warm ? pick(['#ff543e', '#ff9b4a', '#ffc21f']) : pick(['#368cf4', '#2fb3a0', '#7a6ff0']);
      const [q, ok] = [
        ['Число больше 5?', shown > 5],
        ['Цвет тёплый?', warm],
        ['Число чётное?', shown % 2 === 0],
      ][task];
      const win = (i) => {
        const on = i === task;
        return h('div', { style: { flex: 1, minHeight: 0, width: 'min(78vw,300px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--ink)', borderRadius: '16px', background: on ? '#fff8d8' : '#f2f2ef' } },
          on ? h('span', { style: { font: "700 clamp(46px,13vw,68px) Georgia,serif", color } }, String(shown)) : h('span', { style: { color: '#9aa8a8', fontSize: '13px' } }, ['про число', 'про цвет', 'чётность'][i]));
      };
      return {
        say: q, cols: 2, points: 9,
        show: (b) => b.append(h('div', { class: 'col' }, ...(three ? [0, 1, 2] : [0, 1]).map(win))),
        options: yesNo(ok),
      };
    }, { pause: 110, badPause: 460 });
  },

  'color-words': (ctx) => {
    quiz(ctx, (lv) => {
      const count = lv < 4 ? 3 : lv < 8 ? 4 : 5;
      const set = COLOR_WORDS.slice(0, count);
      const word = pick(set);
      const ink = Math.random() < 0.25 ? word : pick(set.filter((x) => x !== word));
      const byWord = lv >= 5 && Math.random() < 0.3;
      const want = byWord ? word : ink;
      return {
        say: byWord ? 'По слову: что написано?' : 'Какого цвета буквы?', cols: count > 3 ? 2 : 3, points: 9,
        show: (b) => b.append(h('div', { class: 'big-text', style: { color: ink[0], padding: '6px 16px', borderRadius: '14px', background: byWord ? '#fff0c4' : 'transparent' } }, word[1])),
        options: shuffle(set).map((x) => ({ label: x[2], ok: x === want })),
      };
    }, { pause: 110, badPause: 460 });
  },

  'rule-frame': (ctx) => {
    quiz(ctx, (lv) => {
      const byColor = Math.random() < 0.5;
      const card = { s: pick(SHAPES), c: pick(COLS) };
      const n = lv < 6 ? 2 : 3;
      const goodOpt = byColor ? { s: pick(SHAPES.filter((x) => x !== card.s)), c: card.c } : { s: card.s, c: pick(COLS.filter((x) => x !== card.c)) };
      const wrongs = [];
      // Второй вариант совпадает по другому признаку: он и проверяет переключение.
      wrongs.push(byColor ? { s: card.s, c: pick(COLS.filter((x) => x !== card.c)) } : { s: pick(SHAPES.filter((x) => x !== card.s)), c: card.c });
      if (n === 3) wrongs.push({ s: pick(SHAPES.filter((x) => x !== card.s)), c: pick(COLS.filter((x) => x !== card.c)) });
      const items = shuffle([{ ...goodOpt, ok: true }, ...wrongs.map((w) => ({ ...w, ok: false }))]);
      return {
        say: byColor ? 'Оранжевая рамка: такой же ЦВЕТ' : 'Синяя рамка: такая же ФОРМА', cols: n, points: 9,
        show: (b) => b.append(h('div', { class: 'big-card', style: { border: `10px solid ${byColor ? '#ff9b4a' : '#368cf4'}` } }, shape(card.s, card.c[0], 'clamp(70px,22vw,110px)'))),
        options: items.map((o) => ({ label: shape(o.s, o.c[0], '42px'), ok: o.ok, aria: `${o.c[1]} ${SHAPE_NAMES[o.s]}` })),
      };
    }, { pause: 120, badPause: 500 });
  },

  'secret-rule': (ctx) => {
    const RULES = ['color', 'shape', 'count'];
    let rule = pick(RULES), okInRow = 0, needed = 4;
    const refs = [{ s: '●', c: COLS[0], n: 1 }, { s: '■', c: COLS[1], n: 2 }, { s: '▲', c: COLS[2], n: 3 }];
    const card = (o, size) => h('span', { style: { display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px', maxWidth: '100%' } }, ...Array.from({ length: o.n }, () => shape(o.s, o.c[0], size)));
    quiz(ctx, () => {
      const c = { s: pick(refs).s, c: pick(refs).c, n: 1 + rnd(3) };
      // Просим карточку, где признаки ведут к разным стопкам, иначе правило не проверить.
      const match = (r, o) => (r === 'color' ? o.c === c.c : r === 'shape' ? o.s === c.s : o.n === c.n);
      const target = refs.find((r) => match(rule, r));
      return {
        say: 'В какую стопку положить?', cols: 3, points: 9,
        show: (b) => b.append(h('div', { class: 'big-card' }, card(c, 'clamp(34px,10vw,50px)'))),
        options: refs.map((r) => ({ label: card(r, '24px'), ok: r === target, aria: `Стопка ${r.n}` })),
        done: (ok) => {
          if (ok) {
            okInRow++;
            if (okInRow >= needed) { okInRow = 0; needed = clamp(5 - (ctx.level >> 2), 3, 5); rule = pick(RULES.filter((x) => x !== rule)); ctx.say('Фил что-то поменял…'); }
          } else okInRow = 0;
        },
      };
    }, { pause: 280, badPause: 600 });
  },

  'leaf-fall': (ctx) => {
    const DIRS = [['⬆️', 0, -1, 0], ['➡️', 1, 0, 90], ['⬇️', 0, 1, 180], ['⬅️', -1, 0, 270]];
    const ARROWS = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 };
    quiz(ctx, (lv) => {
      const face = pick(DIRS);
      const moveD = Math.random() < 0.25 ? face : pick(DIRS.filter((d) => d !== face));
      const followFace = Math.random() < 0.5;
      const want = followFace ? face : moveD;
      const n = clamp(3 + (lv >> 1), 3, 8);
      return {
        say: followFace ? 'Зелёные: куда смотрят?' : 'Жёлтые: куда летят?', cols: 4, points: 9, keys: ARROWS,
        show: (b) => {
          const a = h('div', { class: 'arena', style: { background: followFace ? '#e6f7e7' : '#fff5cd' } });
          const pts = Array.from({ length: n }, () => ({ x: 8 + rnd(78), y: 8 + rnd(72), offset: rnd(100) }));
          const leaves = pts.map((p) => {
            // Лист: заострённый кончик показывает, куда он «смотрит».
            const el = h('span', { class: 'sprite', style: { left: `${p.x}%`, top: `${p.y}%`, width: '34px', height: '34px' } });
            el.innerHTML = `<svg viewBox="0 0 24 24" width="34" height="34" style="transform:rotate(${face[3]}deg)"><path d="M12 1 C20 8 20 17 12 23 C4 17 4 8 12 1Z" fill="${followFace ? '#2fa84f' : '#e9a800'}" stroke="#15304a" stroke-width="1.6"/><path d="M12 5V21" stroke="#15304a" stroke-width="1.2"/></svg>`;
            a.append(el);
            return { el, off: p.offset };
          });
          b.append(a);
          let t = 0;
          const stop = ctx.frame((dt) => {
            if (!a.isConnected) { stop(); return; }
            t += dt * (46 + lv * 5);
            leaves.forEach((l) => {
              const v = (t + l.off) % 70 - 35;
              l.el.style.transform = `translate(${moveD[1] * v}px,${moveD[2] * v}px)`;
            });
          });
        },
        options: DIRS.map((d) => ({ label: d[0], ok: d === want, cls: 'big' })),
      };
    }, { pause: 140, badPause: 500 });
  },

  // Четыре окна, четыре вопроса: подсказка только на самом окне.
  'four-windows': (ctx) => {
    const WINDOWS = [
      ['Чётное?', (c) => c.n % 2 === 0], ['Больше 5?', (c) => c.n > 5],
      ['Тёплый цвет?', (c) => c.warm], ['Кружок?', (c) => c.round],
    ];
    quiz(ctx, (lv) => {
      const task = rnd(4);
      const c = { n: pick([1, 2, 3, 4, 6, 7, 8, 9]), warm: Math.random() < 0.5, round: Math.random() < 0.5 };
      const color = c.warm ? pick(['#ff543e', '#ff9b4a', '#e9a800']) : pick(['#368cf4', '#2fb3a0', '#7a6ff0']);
      return {
        say: lv < 4 ? `В этом окне вопрос: ${WINDOWS[task][0]}` : 'Отвечай на вопрос того окна, где карточка', cols: 2, points: 11,
        show: (b) => b.append(h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '8px', width: '100%', height: '100%', maxWidth: '460px' } }, ...WINDOWS.map(([label], i) => h('div', { style: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, border: '3px solid var(--ink)', borderRadius: '14px', background: i === task ? '#fff8d8' : '#f2f2ef' } },
          h('small', { style: { position: 'absolute', top: '4px', left: 0, right: 0, textAlign: 'center', fontSize: 'clamp(11px,3vw,13px)', fontWeight: 700, color: i === task ? 'var(--ink)' : '#7c8c8c' } }, label),
          i === task ? h('span', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 'clamp(46px,14vw,70px)', height: 'clamp(46px,14vw,70px)', marginTop: '14px', borderRadius: c.round ? '50%' : '10px', background: color, color: '#fff', font: "700 clamp(26px,8vw,40px) Georgia,serif" } }, String(c.n)) : null)))),
        options: yesNo(WINDOWS[task][1](c)),
      };
    }, { pause: 110, badPause: 460 });
  },
};
