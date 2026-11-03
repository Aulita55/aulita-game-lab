import { beep, clamp, h, pick, quiz, sample, shuffle } from '../core/engine.js';

// Все слова подобраны вручную для детей. Вымышленные окончания проверены: настоящих слов они не дают.
const BUBBLES = [
  ['КО', ['тёнок', 'рзина', 'ра', 'лесо', 'мната', 'нфета'], ['ршун', 'тмыл', 'бран', 'пуга']],
  ['МО', ['локо', 'рковь', 'ре', 'рж', 'нета', 'лния'], ['рфик', 'тухо', 'лшик', 'двел']],
  ['ПО', ['года', 'езд', 'душка', 'чта', 'лка', 'дарок'], ['ршик', 'ндрук', 'лбан', 'твас']],
  ['СТ', ['ол', 'ул', 'ена', 'акан', 'рана', 'ихи'], ['урбо', 'ошка', 'ижан', 'ымка']],
  ['ДО', ['м', 'рога', 'ска', 'ждь', 'ктор', 'чка'], ['рмак', 'мкас', 'лпик', 'нуш']],
  ['ЛА', ['па', 'мпа', 'мпочка', 'сточка', 'герь'], ['брут', 'нчук', 'фтик', 'мпур']],
  ['ЗА', ['яц', 'мок', 'бор', 'дача', 'пах'], ['ршин', 'лбун', 'мфик', 'драк']],
  ['КА', ['рта', 'ша', 'рандаш', 'пуста', 'ртина', 'тер'], ['лбак', 'рмут', 'пшин', 'тмик']],
  ['ВО', ['да', 'лк', 'робей', 'здух', 'лна'], ['рмиш', 'ткус', 'лбуш', 'драт']],
  ['РА', ['дуга', 'кета', 'бота', 'ма'], ['фтик', 'лбун', 'нчур', 'дмош']],
  ['МА', ['ма', 'шина', 'лина', 'газин', 'ска', 'льчик'], ['рбик', 'нтух', 'лшан', 'фтур']],
  ['ШК', ['ола', 'аф', 'ура'], ['ифан', 'убон', 'едик']],
  ['СО', ['лнце', 'бака', 'ль', 'ва', 'к'], ['рмик', 'пшан', 'бчик', 'ндук']],
  ['ГО', ['род', 'ра', 'лова', 'лубь', 'рка'], ['фтан', 'мбуш', 'рмух', 'тмар']],
  ['БА', ['нан', 'бочка', 'шня', 'лкон', 'тон'], ['рфик', 'лчур', 'пшан', 'дмик']],
];

const LETTERS = {
  4: ['кран', 'гора', 'роза', 'лиса', 'луна', 'рыба', 'мыло', 'сова', 'дача', 'каша', 'игра', 'туча', 'нота', 'снег', 'лето', 'зима', 'волк', 'слон'],
  5: ['книга', 'школа', 'лампа', 'мышка', 'белка', 'птица', 'время', 'сумка', 'ручка', 'зебра', 'метро', 'груша', 'вилка', 'шапка', 'парта', 'пчела'],
  6: ['собака', 'окошко', 'корова', 'солнце', 'малина', 'машина', 'дорога', 'цветок', 'улитка', 'ворона', 'лошадь'],
  7: ['ромашка', 'планета', 'подруга', 'капуста', 'учебник', 'бабочка', 'самокат', 'тетрадь', 'морковь', 'пингвин'],
  8: ['карандаш', 'самолёт', 'черепаха', 'апельсин', 'мороженое', 'телефон', 'крокодил', 'снеговик'],
};
const allWords = Object.values(LETTERS).flat();
// Настоящие слова из тех же букв тоже считаются правильным ответом.
const ALSO_OK = new Set(['тело', 'отел', 'рога', 'сила', 'молы', 'улан', 'терем', 'лавки', 'тона', 'ток']);

const SYNONYMS = [
  ['весёлый', 'радостный', ['хмурый', 'тяжёлый', 'узкий']], ['смелый', 'храбрый', ['робкий', 'мягкий', 'тихий']], ['большой', 'огромный', ['малый', 'лёгкий', 'острый']],
  ['умный', 'сообразительный', ['ленивый', 'длинный', 'горячий']], ['красивый', 'прекрасный', ['грустный', 'простой', 'старый']], ['быстрый', 'стремительный', ['медленный', 'пустой', 'тёплый']],
  ['друг', 'приятель', ['сосед', 'враг', 'гость']], ['дорога', 'путь', ['река', 'крыша', 'окно']], ['работа', 'труд', ['отдых', 'игрушка', 'обед']],
  ['говорить', 'разговаривать', ['молчать', 'бегать', 'спать']], ['смотреть', 'глядеть', ['слушать', 'нюхать', 'прыгать']], ['бежать', 'мчаться', ['стоять', 'ползти', 'сидеть']],
  ['грустный', 'печальный', ['весёлый', 'зелёный', 'шумный']], ['тихий', 'негромкий', ['звонкий', 'сильный', 'мокрый']], ['маленький', 'крошечный', ['высокий', 'громкий', 'длинный']],
  ['добрый', 'отзывчивый', ['злой', 'тонкий', 'скользкий']], ['страх', 'испуг', ['смех', 'радость', 'сон']], ['сильный', 'могучий', ['слабый', 'сладкий', 'круглый']],
  ['вкусный', 'аппетитный', ['горький', 'тусклый', 'пустой']], ['начинать', 'приступать', ['заканчивать', 'рисовать', 'читать']], ['помогать', 'выручать', ['мешать', 'плавать', 'петь']],
  ['лентяй', 'бездельник', ['трудяга', 'учитель', 'певец']], ['жилище', 'дом', ['лес', 'море', 'стол']], ['ошибка', 'промах', ['победа', 'подарок', 'песня']],
  ['чистый', 'опрятный', ['грязный', 'сонный', 'жаркий']], ['старинный', 'древний', ['новый', 'яркий', 'мокрый']], ['метель', 'вьюга', ['жара', 'радуга', 'роса']], ['солдат', 'воин', ['врач', 'повар', 'пекарь']],
];

const HALVES = [['само', 'лёт'], ['паро', 'воз'], ['пыле', 'сос'], ['снего', 'пад'], ['листо', 'пад'], ['водо', 'пад'], ['лесо', 'руб'], ['рыбо', 'лов'], ['пеше', 'ход'], ['мыше', 'ловка'], ['книго', 'люб'], ['садо', 'вод'], ['птице', 'лов'], ['звездо', 'чёт'], ['земле', 'делец'], ['подо', 'конник'], ['кот', 'ёнок'], ['тигр', 'ёнок'], ['лис', 'ёнок'], ['слон', 'ёнок']];
// Другие настоящие слова, которые могут случайно сложиться из половинок на поле.
const HALF_OK = new Set(HALVES.map((x) => x.join('')).concat(['самоход', 'пароход', 'лесовод', 'рыбовод', 'птицевод', 'снегоход', 'водовоз', 'лесовоз', 'садовод']));

const RHYMES = [
  ['кот', ['рот', ['лес', 'дом', 'мяч']]], ['мышка', ['книжка', ['лампа', 'сосна', 'чашка']]], ['ложка', ['кошка', ['вилка', 'стакан', 'лапа']]], ['день', ['пень', ['ночь', 'час', 'лес']]],
  ['гора', ['нора', ['холм', 'овраг', 'поле']]], ['дождик', ['ёжик', ['зонтик', 'тучка', 'лужа']]], ['слон', ['сон', ['лев', 'тигр', 'жираф']]], ['зима', ['сама', ['лето', 'снег', 'лёд']]],
  ['весна', ['сосна', ['лето', 'дуб', 'цветы']]], ['пушка', ['подушка', ['танк', 'кровать', 'пол']]], ['ворона', ['корона', ['птица', 'шляпа', 'сорока']]], ['рыбка', ['улыбка', ['море', 'смех', 'вода']]],
  ['мак', ['рак', ['цвет', 'роза', 'лук']]], ['река', ['рука', ['море', 'палец', 'озеро']]], ['сад', ['лад', ['лес', 'двор', 'дом']]], ['шапка', ['лапка', ['шарф', 'голова', 'нога']]],
  ['котёнок', ['утёнок', ['собака', 'зайчик', 'птенец']]], ['грибы', ['дубы', ['лес', 'ягоды', 'поляны']]], ['конфета', ['планета', ['пирог', 'космос', 'сахар']]], ['жук', ['паук', ['муха', 'оса', 'пчела']]],
  ['пчела', ['стрела', ['мёд', 'цветок', 'улей']]], ['тетрадь', ['кровать', ['ручка', 'книга', 'парта']]], ['бант', ['гигант', ['лента', 'шапка', 'коса']]], ['сова', ['трава', ['птица', 'ночь', 'филин']]],
];

export const games = {
  bubbles: (ctx) => {
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const lv = ctx.level;
      const [pre, real, fake] = pick(BUBBLES);
      const realN = clamp(2 + (lv >> 2), 2, real.length), fakeN = clamp(1 + (lv >> 2), 1, fake.length);
      const reals = sample(real, realN), fakes = sample(fake, fakeN);
      const items = shuffle([...reals.map((t) => ({ t, ok: true })), ...fakes.map((t) => ({ t, ok: false }))]);
      ctx.say(`Начало «${pre}…»: лопни настоящие слова`);
      let left = reals.length;
      const wrap = h('div', { class: 'tiles', style: { gap: '10px' } });
      ctx.board.append(wrap);
      const btns = items.map((it) => h('button', { class: 'bubble-btn', type: 'button', onclick: (e) => {
        const b = e.currentTarget; b.disabled = true;
        if (it.ok) { b.classList.add('ok'); b.textContent = (pre + it.t).toLowerCase(); left--; ctx.good(7); if (!left) ctx.after(450, round); } else { b.classList.add('no'); ctx.bad(); }
      } }, it.t));
      wrap.append(...btns);
      ctx.bot(() => { const i = items.findIndex((it, k) => it.ok && !btns[k].disabled); if (i >= 0) btns[i].click(); });
    }
    round();
  },

  'mouse-letters': (ctx) => {
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const lv = ctx.level;
      const maxLen = lv < 3 ? 4 : lv < 5 ? 5 : lv < 8 ? 6 : lv < 10 ? 7 : 9;
      const pool = allWords.filter((w) => w.length >= Math.max(3, maxLen - 1) && w.length <= maxLen);
      const word = pick(pool);
      let letters = shuffle([...word]);
      for (let k = 0; letters.join('') === word && k < 8; k++) letters = shuffle([...word]);
      const typed = [];
      ctx.say('Собери слово из букв');
      const out = h('div', { class: 'tiles', style: { minHeight: '60px' } });
      const tiles = h('div', { class: 'tiles' });
      ctx.board.append(h('div', { class: 'col' }, out, tiles));
      const refresh = () => { out.replaceChildren(...[...word].map((_, i) => h('span', { class: 'tile', style: { background: typed[i] ? '#ffe08a' : '#f4f1e6', cursor: 'default', textTransform: 'uppercase' } }, typed[i]?.ch || ' '))); };
      let lock = false;
      const buttons = letters.map((ch) => h('button', { class: 'tile', type: 'button', style: { textTransform: 'uppercase' }, onclick: (e) => {
        if (lock) return; const b = e.currentTarget; b.disabled = true; typed.push({ ch, b }); refresh(); beep(480, 0.03);
        if (typed.length === word.length) {
          lock = true;
          const t = typed.map((x) => x.ch).join('');
          const ok = t === word || allWords.includes(t) || ALSO_OK.has(t);
          if (ok) { ctx.good(word.length * 3); ctx.after(450, round); } else {
            ctx.bad(); ctx.say(`Это было слово: ${word}`); ctx.after(1300, round);
          }
        }
      } }, ch));
      tiles.append(...buttons);
      const undo = h('button', { class: 'answer', type: 'button', style: { minHeight: '46px', fontSize: '16px' }, onclick: () => { if (lock) return; const last = typed.pop(); if (last) { last.b.disabled = false; refresh(); } } }, '⌫ Стереть букву');
      ctx.actions.classList.add('cols-1'); ctx.actions.append(undo);
      refresh();
      ctx.bot(() => { const ch = word[typed.length]; buttons.find((b) => !b.disabled && b.textContent === ch)?.click(); });
    }
    round();
  },

  synonyms: (ctx) => {
    let queue = shuffle(SYNONYMS);
    quiz(ctx, () => {
      if (!queue.length) queue = shuffle(SYNONYMS);
      const [w, ok, bad] = queue.pop();
      return {
        say: 'Что значит почти то же самое?', cols: 2, points: 10,
        show: (b) => b.append(h('div', { class: 'big-text' }, w)),
        options: shuffle([{ label: ok, ok: true }, ...bad.map((x) => ({ label: x, ok: false }))]),
      };
    }, { pause: 220, badPause: 800 });
  },

  halves: (ctx) => {
    function round() {
      if (!ctx.alive) return;
      ctx.clear();
      const n = clamp(2 + (ctx.level >> 2), 3, 6);
      const set = sample(HALVES, n);
      ctx.say('Нажми начало, потом конец слова');
      let first = null, left = n;
      const col = h('div', { class: 'col' });
      const made = h('div', { class: 'tiles', style: { minHeight: '40px' } });
      const row1 = h('div', { class: 'tiles' }), row2 = h('div', { class: 'tiles' });
      col.append(made, row1, row2);
      ctx.board.append(col);
      const starts = shuffle(set).map((p) => h('button', { class: 'tile', type: 'button', 'data-word': p[0], onclick: (e) => {
        if (first) first.classList.remove('sel');
        first = e.currentTarget; first.classList.add('sel');
      } }, `${p[0]}–`));
      const ends = shuffle(set).map((p) => h('button', { class: 'tile', type: 'button', 'data-word': p[1], style: { background: '#d8eefc' }, onclick: (e) => {
        if (!first) return;
        const b = e.currentTarget;
        const word = first.dataset.word + p[1];
        if (HALF_OK.has(word)) {
          first.disabled = true; b.disabled = true; first.classList.remove('sel'); first = null;
          made.append(h('span', { class: 'chip' }, word)); left--; ctx.good(8);
          if (!left) ctx.after(450, round);
        } else {
          b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 260); ctx.bad(); first.classList.remove('sel'); first = null;
        }
      } }, `–${p[1]}`));
      row1.append(...starts); row2.append(...ends);
      ctx.bot(() => {
        const s = starts.find((b) => !b.disabled);
        if (!s) return;
        const pair = set.find((p) => p[0] === s.dataset.word);
        s.click();
        ends.find((b) => !b.disabled && b.dataset.word === pair[1])?.click();
      });
    }
    round();
  },

  rhymes: (ctx) => {
    let queue = shuffle(RHYMES);
    quiz(ctx, () => {
      if (!queue.length) queue = shuffle(RHYMES);
      const [w, [ok, bad]] = queue.pop();
      return {
        say: 'Что рифмуется?', cols: 2, points: 9,
        show: (b) => b.append(h('div', { class: 'big-text' }, w)),
        options: shuffle([{ label: ok, ok: true }, ...bad.map((x) => ({ label: x, ok: false }))]),
      };
    }, { pause: 200, badPause: 700 });
  },
};
