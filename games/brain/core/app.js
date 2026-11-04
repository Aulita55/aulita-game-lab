import { CATEGORIES, CATS, GAMES, playable } from './catalog.js';
import { createRound, h, sound } from './engine.js';
import * as store from './store.js';

const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const testSeconds = params.get('t') ? Number(params.get('t')) : undefined;
const HOME = '../../';
let current = null;
const catImg = (id, cls = '') => h('img', { class: `cat ${cls}`, src: `img/${CATS[id].img}.webp`, alt: CATS[id].name, loading: 'lazy' });
const go = (hash) => { location.hash = hash; };

function hash32(s) { let x = 2166136261; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619); } return x >>> 0; }

// Разминка дня: 5 игр из разных категорий, одинаковые на весь день.
function dailySet(day = store.today()) {
  const seed = hash32(day);
  const order = [...CATEGORIES].sort((a, b) => hash32(a.id + day) - hash32(b.id + day)).slice(0, 5);
  return order.map((c, i) => { const list = playable.filter((x) => x.category === c.id); return list[(seed + i * 7) % list.length]; });
}

function header(active) {
  const muteBtn = h('button', { class: 'top-link', type: 'button', onclick: () => { sound.muted = !sound.muted; muteBtn.textContent = sound.muted ? '🔇' : '🔊'; }, 'aria-label': 'Звук' }, sound.muted ? '🔇' : '🔊');
  return h('header', { class: 'top' },
    h('a', { class: 'brand', href: HOME }, h('img', { src: `${HOME}aulita-wordmark.png`, alt: 'АюлитА' })),
    h('nav', {},
      h('a', { class: `top-link ${active === 'home' ? 'on' : ''}`, href: '#/' }, 'Игры'),
      h('a', { class: `top-link ${active === 'stats' ? 'on' : ''}`, href: '#/stats' }, 'Мой прогресс'),
      muteBtn));
}

function card(game) {
  const d = game.external ? null : store.gameData(game.id);
  const cat = CATEGORIES.find((c) => c.id === game.category);
  return h('a', { class: 'game-card', style: { '--accent': cat.color }, href: game.external || `#/g/${game.id}` },
    h('span', { class: 'card-art' }, h('span', { class: 'card-icon' }, game.icon), catImg(game.cat)),
    h('span', { class: 'card-body' },
      h('strong', {}, game.title), h('small', {}, game.tagline),
      h('span', { class: 'stars' }, game.external ? 'Уже на сайте' : d.plays ? `${'★'.repeat(d.stars)}${'☆'.repeat(3 - d.stars)}  ·  рекорд ${d.best}` : 'Новая игра')));
}

function viewHome() {
  const daily = dailySet();
  const done = store.dayData().done;
  const doneCount = daily.filter((x) => done.includes(x.id)).length;
  const nextGame = daily.find((x) => !done.includes(x.id));
  app.replaceChildren(
    header('home'),
    h('main', { class: 'page' },
      h('section', { class: 'hero' },
        h('div', {},
          h('span', { class: 'label' }, 'Игровая вселенная АюлитА'),
          h('h1', {}, 'Тренировка ума с котиками'),
          h('p', {}, `${GAMES.length} игр на память, внимание, скорость, логику, слова и счёт. Сложность подстраивается под игрока прямо во время игры.`)),
        h('div', { class: 'hero-cats' }, catImg('mia'), catImg('rocky'), catImg('tima'))),
      h('section', { class: 'daily' },
        h('div', { class: 'daily-head' },
          catImg('rocky', 'daily-cat'),
          h('div', {},
            h('span', { class: 'label' }, 'Разминка дня'),
            h('h2', {}, doneCount === 5 ? 'Разминка выполнена!' : 'Пять игр с Рокки'),
            h('p', {}, `Готово ${doneCount} из 5  ·  Дней подряд: ${store.streak()}`)),
          h('a', { class: 'btn btn-red daily-go', href: nextGame ? `#/g/${nextGame.id}?daily=1` : '#/stats' }, nextGame ? (doneCount ? 'Продолжить' : 'Начать') : 'Мой прогресс')),
        h('ol', { class: 'daily-list' }, daily.map((x) => h('li', { class: done.includes(x.id) ? 'done' : '' },
          h('a', { href: `#/g/${x.id}?daily=1` }, h('span', {}, done.includes(x.id) ? '✓' : x.icon), x.title))))),
      ...CATEGORIES.map((c) => h('section', { class: 'cat-section', id: `c-${c.id}` },
        h('div', { class: 'cat-head', style: { '--accent': c.color } }, catImg(c.cat), h('div', {}, h('h2', {}, c.title), h('p', {}, c.blurb))),
        h('div', { class: 'cards' }, GAMES.filter((x) => x.category === c.id).map(card)))),
      h('footer', { class: 'foot' }, h('a', { href: HOME }, '← На главную Игровой вселенной'))));
  window.scrollTo(0, 0);
}

function viewStats() {
  const t = store.totals();
  app.replaceChildren(header('stats'), h('main', { class: 'page' },
    h('section', { class: 'stats-top' },
      [['Дней подряд', store.streak()], ['Сыграно игр', t.plays], ['Звёзд', t.stars], ['Открыто игр', `${t.tried}/${playable.length}`]].map(([a, b]) => h('div', { class: 'stat' }, h('b', {}, String(b)), h('span', {}, a)))),
    h('section', { class: 'bars' },
      h('h2', {}, 'Форма по разделам'),
      h('p', { class: 'muted' }, 'Считается по точности и достигнутому уровню за последние игры.'),
      CATEGORIES.map((c) => {
        const v = store.categoryForm(playable.filter((x) => x.category === c.id).map((x) => x.id));
        return h('div', { class: 'bar-row' }, catImg(c.cat),
          h('div', { class: 'bar-text' }, h('strong', {}, c.title), h('span', {}, v === null ? 'пока не играли' : `${v} из 100`)),
          h('div', { class: 'bar' }, h('i', { style: { width: `${v ?? 0}%`, background: c.color } })));
      })),
    h('section', { class: 'bars' },
      h('button', { class: 'btn btn-plain', type: 'button', onclick: (e) => {
        if (e.currentTarget.dataset.sure) { store.reset(); viewStats(); return; }
        e.currentTarget.dataset.sure = '1'; e.currentTarget.textContent = 'Нажмите ещё раз, чтобы стереть';
      } }, 'Сбросить прогресс'))));
  window.scrollTo(0, 0);
}

const loaders = { memory: () => import('../games/memory.js'), speed: () => import('../games/speed.js'), attention: () => import('../games/attention.js'), flexibility: () => import('../games/flexibility.js'), logic: () => import('../games/logic.js'), words: () => import('../games/words.js'), math: () => import('../games/math.js') };

function gameFrame(meta, content, daily) {
  return h('div', { class: 'play' },
    h('div', { class: 'play-top' },
      h('button', { class: 'back', type: 'button', 'aria-label': 'Назад', onclick: () => { current?.destroy(); current = null; go('/'); } }, '←'),
      h('strong', {}, meta.title),
      daily ? h('span', { class: 'chip chip-daily' }, 'Разминка') : null,
      h('img', { class: 'play-cat', src: `img/${CATS[meta.cat].img}.webp`, alt: CATS[meta.cat].name })),
    content);
}

function viewIntro(meta, daily) {
  const d = store.gameData(meta.id);
  const box = h('div', { class: 'intro' },
    catImg(meta.cat, 'intro-cat'),
    h('div', { class: 'bubble' }, h('b', {}, `${CATS[meta.cat].name} объясняет`), h('p', {}, meta.how)),
    d.plays ? h('p', { class: 'muted' }, `Рекорд: ${d.best}  ·  Начнём с уровня ${d.level}`) : null,
    h('button', { class: 'btn btn-red btn-big', type: 'button', id: 'start', onclick: () => viewPlay(meta, daily) }, '▶ Играть'));
  app.replaceChildren(gameFrame(meta, box, daily));
  window.scrollTo(0, 0);
}

async function viewPlay(meta, daily) {
  const host = h('div', { class: 'stage-host' });
  app.replaceChildren(gameFrame(meta, host, daily));
  const mod = await loaders[meta.category]();
  const start = store.gameData(meta.id).level;
  current?.destroy();
  current = createRound({ host, meta, level: start, duration: testSeconds, onEnd: (r) => viewResult(meta, r, daily) });
  window.__round = current;
  mod.games[meta.id](current);
}

function viewResult(meta, r, daily) {
  const { stars, isBest } = store.record(meta.id, r);
  const pct = Math.round(r.accuracy * 100);
  const next = dailySet().find((x) => !store.dayData().done.includes(x.id));
  const phrase = stars === 3 ? 'Великолепно!' : stars === 2 ? 'Очень хорошо!' : stars === 1 ? 'Хорошее начало!' : 'Попробуем ещё раз?';
  const box = h('div', { class: 'result', id: 'result' },
    catImg(meta.cat, stars >= 2 ? 'intro-cat cheer' : 'intro-cat'),
    h('div', { class: 'big-stars', 'aria-label': `Звёзд: ${stars}` }, '★'.repeat(stars), h('span', {}, '★'.repeat(3 - stars))),
    h('h2', {}, phrase),
    isBest && r.score > 0 ? h('p', { class: 'record' }, 'Новый рекорд!') : null,
    h('div', { class: 'result-grid' },
      h('div', {}, h('b', {}, String(r.score)), h('span', {}, 'очков')),
      h('div', {}, h('b', {}, `${pct}%`), h('span', {}, 'точность')),
      h('div', {}, h('b', {}, String(r.peakLevel)), h('span', {}, 'уровень'))),
    h('div', { class: 'result-actions', style: { pointerEvents: 'none' } },
      h('button', { class: 'btn btn-red', type: 'button', onclick: () => viewPlay(meta, daily) }, 'Ещё раз'),
      daily && next ? h('a', { class: 'btn btn-green', href: `#/g/${next.id}?daily=1` }, 'Следующая') : null,
      h('a', { class: 'btn btn-blue', href: '#/' }, 'Все игры')));
  app.replaceChildren(gameFrame(meta, box, daily));
  // Игрок мог нажимать до последней секунды: случайное нажатие не должно сразу увести с итогов.
  setTimeout(() => { box.querySelector('.result-actions').style.pointerEvents = ''; }, 700);
  current = null;
  window.scrollTo(0, 0);
}

function route() {
  current?.destroy(); current = null;
  document.body.classList.remove('in-game');
  const [path, query] = location.hash.replace(/^#/, '').split('?');
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'stats') return viewStats();
  if (parts[0] === 'g') {
    const meta = playable.find((x) => x.id === parts[1]);
    if (meta) { document.body.classList.add('in-game'); return viewIntro(meta, new URLSearchParams(query).has('daily')); }
  }
  viewHome();
}
window.addEventListener('hashchange', route);
route();
