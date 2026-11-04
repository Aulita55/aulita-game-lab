// Рыбки АюлитА: нарисованы кодом в стиле фирменной лапки (толстый контур, мягкая тень, блик).
// Векторные, поэтому чёткие на любом экране и ничего не весят.
const INK = '#1b1b1f';
const TAIL = 'M56 82C40 62 26 48 12 46C18 62 20 72 20 82C20 92 18 102 12 118C26 116 40 102 56 82Z';
const VEIL = 'M60 82C36 40 10 30 4 38C14 54 12 68 2 82C12 96 14 110 4 126C10 134 36 124 60 82Z';
const SPIKY = 'M58 82L24 50L28 70L8 66L22 82L8 98L28 94L24 114Z';

let uid = 0;
const SPECIES = [
  { name: 'Рыжик', main: '#ffa347', shade: '#ef7f1f', tail: TAIL, top: 'M84 40C90 18 112 14 128 28L120 44Z', rx: 62, ry: 44, art: '<path d="M78 38C70 60 70 104 78 126L96 128C88 104 88 60 96 36Z" fill="#fff"/>' },
  { name: 'Капелька', main: '#7fd0ff', shade: '#4fb0ea', tail: TAIL, top: 'M92 40C96 26 112 24 122 34L116 44Z', rx: 56, ry: 50, art: '<ellipse cx="108" cy="116" rx="40" ry="22" fill="#e6f7ff"/>' },
  { name: 'Пуговка', main: '#ffa9c6', shade: '#f47fa8', tail: TAIL, top: '', rx: 54, ry: 54, art: '', under: '<path d="M72 42L60 22L84 32M104 30L106 8L120 28M138 40L154 24L152 50M62 124L46 138L72 136M106 136L108 158L122 134M144 122L162 136L154 112" fill="#ffd9e6" stroke="#1b1b1f" stroke-width="4" stroke-linejoin="round"/>' },
  { name: 'Лимонка', main: '#ffe066', shade: '#f5c52c', tail: SPIKY, top: 'M76 46L92 22L102 40L116 20L126 44Z', rx: 66, ry: 38, art: '<circle cx="78" cy="70" r="7" fill="#ffb627"/><circle cx="96" cy="96" r="6" fill="#ffb627"/><circle cx="72" cy="98" r="5" fill="#ffb627"/>' },
  { name: 'Вуалька', main: '#c9a7ff', shade: '#a67ff0', tail: VEIL, top: 'M78 42C78 10 116 2 136 26L122 44Z', rx: 54, ry: 42, art: '<path d="M70 62q14 10 0 20M70 88q14 10 0 20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>' },
  { name: 'Мятка', main: '#7fe3bf', shade: '#49c79b', tail: SPIKY, top: 'M80 44L88 18L104 38L118 16L128 44Z', rx: 60, ry: 44, art: '<path d="M62 66l12 10-12 10 12 10" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' },
  { name: 'Бантик', main: '#ff8a8a', shade: '#ee5f66', tail: VEIL, top: 'M92 42C96 28 112 26 122 36L116 46Z', rx: 56, ry: 46, art: '<ellipse cx="108" cy="114" rx="36" ry="18" fill="#ffe0e0"/>', extra: '<g stroke="#1b1b1f" stroke-width="4" stroke-linejoin="round"><path d="M118 30L92 16V46Z" fill="#ff4f93"/><path d="M118 30L144 16V46Z" fill="#ff4f93"/><circle cx="118" cy="30" r="7" fill="#ffb3d1"/></g>' },
  { name: 'Звёздочка', main: '#6f8cff', shade: '#4d68e0', tail: TAIL, top: 'M82 42C88 22 110 16 126 30L118 44Z', rx: 60, ry: 46, art: '<path d="M78 62l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1zM92 98l2 5 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1z" fill="#ffe066"/>' },
];

export const FISH_COUNT = SPECIES.length;
export const fishName = (i) => SPECIES[i].name;

export function fishSvg(i) {
  const s = SPECIES[i], id = `fb${++uid}`, f = s.rx - 64;
  const body = `<ellipse cx="108" cy="82" rx="${s.rx}" ry="${s.ry}"`;
  const line = `stroke="${INK}" stroke-width="5" stroke-linejoin="round"`;
  return `<svg class="fishy" viewBox="0 0 200 164" role="img" aria-label="${s.name}">
<defs><clipPath id="${id}">${body}/></clipPath></defs>
<path class="fish-tail" d="${s.tail}" fill="${s.shade}" ${line}/>
${s.under || ''}
${s.top ? `<path d="${s.top}" fill="${s.shade}" ${line}/>` : ''}
${body} fill="${s.main}"/>
<g clip-path="url(#${id})">${s.art}<ellipse cx="${108 - s.rx * 0.28}" cy="${82 + s.ry * 0.28}" rx="${s.rx}" ry="${s.ry}" fill="none" stroke="${s.shade}" stroke-width="16" opacity=".55"/></g>
${body} fill="none" ${line}/>
${s.extra || ''}
<path class="fish-fin" d="M92 92C82 88 70 96 72 108C84 112 96 106 92 92Z" fill="${s.shade}" ${line}/>
<ellipse cx="${126 + f}" cy="96" rx="10" ry="6" fill="#ff7fa8" opacity=".55"/><ellipse cx="${156 + f}" cy="94" rx="7" ry="5" fill="#ff7fa8" opacity=".55"/>
<circle cx="${128 + f}" cy="72" r="15" fill="${INK}"/><circle cx="${123 + f}" cy="66" r="6" fill="#fff"/><circle cx="${133 + f}" cy="77" r="3" fill="#fff"/>
<circle cx="${155 + f}" cy="72" r="12" fill="${INK}"/><circle cx="${151 + f}" cy="67" r="5" fill="#fff"/><circle cx="${159 + f}" cy="76" r="2.5" fill="#fff"/>
<path d="M${136 + f} 96q6 7 12 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="88" cy="56" rx="11" ry="7" fill="#fff" opacity=".55" transform="rotate(-24 88 56)"/>
</svg>`;
}

// Карточка-аквариум: вода, пузырьки, песок и рыбка.
export function fishCard(h, i) {
  const el = h('div', { class: 'aqua', html: `<i class="bub b1"></i><i class="bub b2"></i><i class="bub b3"></i><i class="sand"></i>${fishSvg(i)}` });
  return el;
}
