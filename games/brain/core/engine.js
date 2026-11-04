// Движок раунда. Игра не знает про сайт: она получает ctx и работает только через него.
// Поэтому при переносе в платформу достаточно заменить хаб (app.js), а игры останутся те же.

export function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) el.append(c);
  return el;
}

export const rnd = (n) => Math.floor(Math.random() * n);
export const pick = (a) => a[rnd(a.length)];
export const range = (n) => Array.from({ length: n }, (_, i) => i);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export function shuffle(a) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }
export const sample = (a, n) => shuffle(a).slice(0, n);

let audio = null;
export const sound = { muted: false };
export function beep(freq = 520, dur = 0.09, type = 'sine', vol = 0.06) {
  if (sound.muted) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const o = audio.createOscillator(); const g = audio.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur);
    o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
  } catch { /* звук необязателен */ }
}

export const MAX_LEVEL = 12;

export function createRound({ host, meta, level = 1, duration, botMode = false, onEnd }) {
  const cleanups = new Set();
  const ctx = {
    alive: true, level: clamp(level, 1, MAX_LEVEL), startLevel: level, peakLevel: level,
    score: 0, right: 0, wrong: 0, streak: 0, missStreak: 0, botMode, botFn: null,
  };

  const scoreEl = h('b', {}, '0');
  const timeEl = h('b', {}, '–');
  const levelEl = h('b', {}, String(ctx.level));
  const barEl = h('i');
  const hud = h('div', { class: 'hud' },
    h('span', { class: 'chip' }, '⭐ ', scoreEl),
    h('span', { class: 'chip' }, 'Уровень ', levelEl),
    h('span', { class: 'chip chip-time' }, '⏱ ', timeEl),
    h('span', { class: 'hud-bar' }, barEl));
  const prompt = h('div', { class: 'prompt', 'aria-live': 'polite' });
  const board = h('div', { class: 'board' });
  const actions = h('div', { class: 'actions' });
  const stage = h('div', { class: 'stage' }, hud, prompt, board, actions);
  host.replaceChildren(stage);
  Object.assign(ctx, { stage, prompt, board, actions });

  ctx.say = (t) => { prompt.textContent = t; };
  ctx.clear = () => { board.replaceChildren(); actions.replaceChildren(); board.className = 'board'; actions.className = 'actions'; };

  // Всё, что запущено через ctx, автоматически останавливается при выходе из игры.
  ctx.after = (ms, fn) => { const id = setTimeout(() => { cleanups.delete(off); if (ctx.alive) fn(); }, ms); const off = () => clearTimeout(id); cleanups.add(off); return off; };
  ctx.every = (ms, fn) => { const id = setInterval(() => { if (ctx.alive) fn(); }, ms); const off = () => clearInterval(id); cleanups.add(off); return off; };
  ctx.on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); const off = () => t.removeEventListener(ev, fn, o); cleanups.add(off); return off; };
  ctx.frame = (fn) => {
    let id, last = performance.now(), stopped = false;
    const loop = (now) => { if (stopped || !ctx.alive) return; const dt = Math.min(now - last, 60) / 1000; last = now; fn(dt, now); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    const off = () => { stopped = true; cancelAnimationFrame(id); }; cleanups.add(off); return off;
  };
  let keyOff = null;
  ctx.keys = (map) => {
    if (keyOff) { keyOff(); cleanups.delete(keyOff); }
    keyOff = ctx.on(window, 'keydown', (e) => { const fn = map[e.key]; if (fn) { e.preventDefault(); fn(e); } });
  };
  ctx.bot = (fn) => { ctx.botFn = fn; };

  function pop(text, cls) {
    const p = h('span', { class: `pop ${cls}` }, text);
    stage.append(p); setTimeout(() => p.remove(), 650);
  }
  function setLevel(v) {
    const n = clamp(v, 1, MAX_LEVEL);
    if (n > ctx.level) beep(880, 0.14, 'triangle');
    ctx.level = n; ctx.peakLevel = Math.max(ctx.peakLevel, n); levelEl.textContent = String(n);
  }
  ctx.good = (points = 10) => {
    ctx.right++; ctx.streak++; ctx.missStreak = 0;
    const gain = Math.round(points * (1 + Math.min(ctx.streak, 10) * 0.1) * (1 + (ctx.level - 1) * 0.1));
    ctx.score += gain; scoreEl.textContent = String(ctx.score);
    pop(`+${gain}`, 'pop-good'); beep(660 + Math.min(ctx.streak, 8) * 30, 0.09);
    stage.classList.remove('flash-bad'); stage.classList.add('flash-good'); setTimeout(() => stage.classList.remove('flash-good'), 180);
    if (ctx.streak % 4 === 0) setLevel(ctx.level + 1);
  };
  ctx.bad = () => {
    ctx.wrong++; ctx.streak = 0; ctx.missStreak++;
    pop('Мимо', 'pop-bad'); beep(170, 0.16, 'square', 0.035);
    stage.classList.remove('flash-good'); stage.classList.add('flash-bad'); setTimeout(() => stage.classList.remove('flash-bad'), 240);
    if (ctx.missStreak % 2 === 0) setLevel(ctx.level - 1);
  };

  function stop() { ctx.alive = false; for (const off of cleanups) off(); cleanups.clear(); }
  ctx.end = () => {
    if (!ctx.alive) return; stop();
    const total = ctx.right + ctx.wrong;
    onEnd?.({ score: ctx.score, right: ctx.right, wrong: ctx.wrong, accuracy: total ? ctx.right / total : 0, level: ctx.level, peakLevel: ctx.peakLevel });
  };
  ctx.destroy = stop;

  const total = duration ?? meta.time ?? 60;
  let left = total;
  timeEl.textContent = String(total);
  ctx.frame((dt) => {
    left -= dt;
    const s = Math.ceil(Math.max(left, 0));
    if (timeEl.textContent !== String(s)) { timeEl.textContent = String(s); if (s <= 5 && s > 0) beep(440, 0.05); }
    barEl.style.width = `${Math.max(left, 0) / total * 100}%`;
    if (left <= 0) ctx.end();
  });
  return ctx;
}

// Вопрос с вариантами — основа для многих игр.
// next(level) => { say, show(boardEl), options:[{label, ok, cls}], cols, points, done }
export function quiz(ctx, next, { pause = 260, badPause = 520 } = {}) {
  function trial() {
    if (!ctx.alive) return;
    ctx.clear();
    const t = next(ctx.level);
    if (t.say) ctx.say(t.say);
    t.show?.(ctx.board);
    let locked = false;
    const buttons = t.options.map((o, i) => h('button', {
      class: `answer ${o.cls || ''}`, type: 'button', style: o.style, 'aria-label': o.aria,
      onclick: (e) => {
        if (locked) return; locked = true;
        const b = e.currentTarget;
        b.classList.add(o.ok ? 'is-right' : 'is-wrong');
        if (o.ok) ctx.good(t.points ?? 10); else { ctx.bad(); buttons[t.options.findIndex((x) => x.ok)]?.classList.add('is-right'); }
        t.done?.(o.ok);
        ctx.after(o.ok ? pause : badPause, trial);
      },
    }, o.label));
    ctx.actions.classList.add(`cols-${t.cols || buttons.length}`);
    ctx.actions.append(...buttons);
    const map = {};
    buttons.forEach((b, i) => { map[String(i + 1)] = () => b.click(); });
    if (buttons.length === 2) { map.ArrowLeft = () => buttons[0].click(); map.ArrowRight = () => buttons[1].click(); }
    Object.assign(map, t.keys ? Object.fromEntries(Object.entries(t.keys).map(([k, i]) => [k, () => buttons[i].click()])) : {});
    ctx.keys(map);
    ctx.bot(() => buttons[t.options.findIndex((x) => x.ok)]?.click());
  }
  trial();
}

export const yesNo = (ok) => [
  { label: 'Нет', ok: !ok, cls: 'btn-red' },
  { label: 'Да', ok: !!ok, cls: 'btn-green' },
];

// Сетка клеток для игр на поле.
export function grid(el, cols, rows, make) {
  el.classList.add('has-grid');
  const g = h('div', { class: 'grid', style: { gridTemplateColumns: `repeat(${cols},1fr)`, '--cols': cols, aspectRatio: `${cols}/${rows}` } });
  g.style.setProperty('--cols', cols); g.style.setProperty('--rows', rows);
  const cells = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) { const c = make(x, y, cells.length); cells.push(c); g.append(c); }
  el.append(g);
  return { root: g, cells };
}
