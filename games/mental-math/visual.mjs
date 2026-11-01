// Local vector objects: consistent size and silhouette across browsers.
const fruit=(fill,leaf='#6c9c66')=>`<path d="M20 12C9 5 3 17 8 29c4 10 9 8 12 8s8 2 12-8C37 17 31 5 20 12Z" fill="${fill}"/><path d="m20 12 1-8" stroke="#86684a" stroke-width="3" stroke-linecap="round"/><path d="M22 8c1-6 10-6 11-4-1 5-6 7-11 4Z" fill="${leaf}"/><path d="M12 17c-2 2-2 6-1 8" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`;
const symbols={
 '🍎':fruit('#df7765'),
 '🧸':'<circle cx="10" cy="9" r="6" fill="#bb8b62"/><circle cx="30" cy="9" r="6" fill="#bb8b62"/><ellipse cx="20" cy="28" rx="11" ry="12" fill="#bc8c63"/><circle cx="20" cy="16" r="13" fill="#cba078"/><ellipse cx="20" cy="22" rx="7" ry="5" fill="#efd3a9"/><circle cx="15" cy="14" r="1.8" fill="#534438"/><circle cx="25" cy="14" r="1.8" fill="#534438"/><ellipse cx="20" cy="20" rx="2.3" ry="1.8" fill="#534438"/><circle cx="11" cy="34" r="5" fill="#d9b58c"/><circle cx="29" cy="34" r="5" fill="#d9b58c"/>',
 '⭐':'<path d="m20 3 5.2 10.7L37 15.4l-8.5 8.3 2 11.7L20 29.9 9.5 35.4l2-11.7L3 15.4l11.8-1.7Z" fill="#f5c65c" stroke="#d7a348" stroke-width="1.4"/><path d="m20 8 3.2 8.4L20 22l-3.2-5.6Z" fill="#ffe6a2"/>',
 '🌼':'<path d="M20 18v21m0-8c-10-10-16-4-10 0 4 3 10 1 10 1" fill="#77a574" stroke="#77a574" stroke-width="2"/><g fill="#f2bf77"><ellipse cx="20" cy="9" rx="5" ry="8"/><ellipse cx="11" cy="15" rx="8" ry="5" transform="rotate(24 11 15)"/><ellipse cx="29" cy="15" rx="8" ry="5" transform="rotate(-24 29 15)"/><ellipse cx="15" cy="23" rx="5" ry="8" transform="rotate(30 15 23)"/><ellipse cx="25" cy="23" rx="5" ry="8" transform="rotate(-30 25 23)"/></g><circle cx="20" cy="17" r="6" fill="#aa7950"/>',
 '🐟':'<path d="M11 20C22 1 36 11 38 20 33 32 20 36 11 20Z" fill="#78b4c2"/><path d="m13 20-11-9v18Z" fill="#e7b36c"/><path d="m23 7-5 8 12-2Z" fill="#5596ab"/><circle cx="31" cy="18" r="2.1" fill="#274f65"/><path d="m21 19 5 5-6 2" fill="#569aaa"/>',
 '🦋':'<path d="M19 20C8-4-6 7 5 22c-7 14 8 21 14 3M21 20C32-4 46 7 35 22c7 14-8 21-14 3" fill="#b69acb"/><path d="M19 20C12 6 3 10 9 19M21 20c7-14 16-10 10-1" fill="#edd1ce"/><path d="M20 14v19m0-19-4-7m4 7 4-7" stroke="#6e6382" stroke-width="3" stroke-linecap="round"/>',
 '🍓':'<path d="M20 10C2 4 2 21 20 38 38 21 38 4 20 10" fill="#df7c82"/><path d="m9 8 8 1 3-8 3 8 8-1-7 7h-8Z" fill="#6b9b66"/><g fill="#ffde9a"><ellipse cx="13" cy="18" rx="1" ry="2"/><ellipse cx="25" cy="18" rx="1" ry="2"/><ellipse cx="19" cy="23" rx="1" ry="2"/><ellipse cx="15" cy="28" rx="1" ry="2"/><ellipse cx="24" cy="27" rx="1" ry="2"/></g>',
 '🍐':'<path d="M20 8C11 6 15 16 9 23 0 36 14 40 20 38c6 2 20-2 11-15-6-7-2-17-11-15" fill="#bfd083"/><path d="m20 10 2-8" stroke="#88744f" stroke-width="3" stroke-linecap="round"/><path d="M22 8C25 0 34 3 34 4c-2 5-6 6-12 4" fill="#769b62"/><path d="M11 27c-2 3-1 5 1 6" stroke="#e5edbb" stroke-width="3" stroke-linecap="round"/>',
 '🎈':'<ellipse cx="20" cy="15" rx="12" ry="14" fill="#d589a2"/><path d="m20 28-4 5h8Z" fill="#bd718c"/><path d="M20 33c-5 3 4 4 0 7" stroke="#9a8e87" stroke-width="1.5" fill="none"/><path d="M13 9c-1 1-2 4-1 6" stroke="#f2c5d5" stroke-width="3" stroke-linecap="round"/>',
 '🟠':fruit('#e4a14e'),
 '🌻':'<path d="M20 21v19m0-7-10-5" stroke="#78a16d" stroke-width="3"/><path d="m20 1 4 8 8-4-1 9 8 4-8 5 1 9-8-4-4 8-4-8-8 4 1-9-8-5 8-4-1-9 8 4Z" fill="#edbd59"/><circle cx="20" cy="18" r="8" fill="#99744e"/><circle cx="18" cy="16" r="3" fill="#ae8b60"/>',
 '🍒':'<path d="M10 24c1-13 11-14 14-22m5 23c-2-10-5-17-5-23" stroke="#7e9a62" stroke-width="2.5" fill="none"/><circle cx="10" cy="29" r="9" fill="#c56a76"/><circle cx="29" cy="29" r="9" fill="#dc7e7e"/><path d="M24 5c5-5 13-2 13 0-4 6-10 5-13 0" fill="#7ca76d"/><path d="M6 25v3m20-3v3" stroke="#f4b5ad" stroke-width="3" stroke-linecap="round"/>',
 '🧁':'<path d="m8 23 3 16h18l3-16" fill="#b4a1cc"/><path d="m14 27 1 9m10-9-1 9" stroke="#d8cae6" stroke-width="2"/><path d="M5 23c-2-6 4-9 7-9-1-6 7-9 9-11-1 6 5 5 7 11 8 0 10 7 7 9Z" fill="#edc7b2"/><path d="M10 20h20" stroke="#f8e1d0" stroke-width="2" stroke-linecap="round"/>',
 '🎁':'<rect x="6" y="16" width="28" height="23" rx="3" fill="#86b8ad"/><rect x="3" y="12" width="34" height="9" rx="2" fill="#9ac9bd"/><path d="M20 12v27" stroke="#f4d183" stroke-width="6"/><path d="M20 12C-1 11 12-9 20 12c8-21 21-1 0 0" stroke="#e5b86d" stroke-width="4" fill="none"/>',
 '🚂':'<path d="M5 14h19v18H5Z" fill="#7cadb9"/><path d="M23 6h13v26H23Z" fill="#c69175"/><rect x="27" y="10" width="6" height="8" rx="1" fill="#e8eacb"/><path d="M3 13h22M21 5h17" stroke="#526c7b" stroke-width="3"/><circle cx="10" cy="34" r="5" fill="#556f76"/><circle cx="28" cy="34" r="5" fill="#556f76"/><path d="M10 14V7h6v7" fill="#c4a773"/>',
 '🟣':'<circle cx="20" cy="20" r="15" fill="#a99bc8"/><circle cx="20" cy="20" r="11" stroke="#d8ceea" stroke-width="2" fill="none"/>',
 '🔵':'<circle cx="20" cy="20" r="15" fill="#7caebb"/><circle cx="20" cy="20" r="11" stroke="#b6d7dd" stroke-width="2" fill="none"/>',
 '🟡':'<circle cx="20" cy="20" r="15" fill="#dfb85c"/><circle cx="20" cy="20" r="11" stroke="#fae3a6" stroke-width="2" fill="none"/>'
};
export function objectIcon(kind){return `<svg class="count-object" viewBox="0 0 40 42" aria-hidden="true" focusable="false">${symbols[kind]||'<circle cx="20" cy="21" r="13" fill="currentColor"/>'}</svg>`;}
export function objectGroup(n,kind,{removed=0,animate=false}={}){
 return `<span class="objects vector-objects${animate?' counting':''}" role="img" aria-label="${n} предметов${removed?', убираем '+removed:''}">${Array.from({length:n},(_,i)=>`<span class="object-item ${i>=n-removed?'removed':''}" style="--item:${i}">${objectIcon(kind)}</span>`).join('')}</span>`;
}
function frame(total,first,second=0,{remove=0,capacity=10}={}){
 const n=Math.min(20,capacity);return `<div class="number-frame ${n===5?'five-frame':''}" role="img" aria-label="${first} и ${second} предметов; мест ${n}">${Array.from({length:n},(_,i)=>`<span class="frame-cell ${i<first?'filled':i<first+second?'added':''} ${i>=total-remove&&i<total?'removed':''}">${i<first+second?'<i></i>':''}</span>`).join('')}</div>`;
}
const caption=s=>`<p class="visual-caption">${s}</p>`;
export function lessonVisual(q,step){
 const end=step===2;let visual='';
 if(q.kind==='count'||q.kind==='digit')visual=objectGroup(q.a,q.icon,{animate:step===1})+caption(step===1?'Считай по одному, ничего не пропуская':end?`Всего ${q.answer}`:'Каждый предмет считаем один раз');
 else if(q.kind==='compare')visual=`<div class="pair-model"><div>${Array.from({length:q.b},(_,i)=>`<span class="pair-cell">${i<q.a?objectIcon(q.icon):''}</span>`).join('')}</div><div>${Array.from({length:q.b},(_,i)=>`<span class="pair-cell ${step>0&&i>=q.a?'extra-object':''}">${objectIcon(q.icon)}</span>`).join('')}</div></div>`+caption(step===0?'Сравни две группы':step===1?'В каждой колонке — пара. Выделены предметы без пары':`${q.b} > ${q.a}`);
 else if(q.kind==='sequence')visual=`<div class="sequence-model"><b>${q.a}</b><span>→</span><b class="${end?'revealed':'missing'}">${end?q.answer:'?'}</b><span>→</span><b>${q.a+2}</b></div>`+caption(step===1?'Шаг вперёд — это +1':'Числа идут по порядку');
 else if(q.kind==='compose')visual=frame(q.b,q.a,step>0?q.answer:0,{capacity:q.b})+caption(step===0?`Есть ${q.a}. Сколько мест свободно?`:`Добавили ${q.answer}. Теперь ${q.b}.`);
 else if(q.op==='×')visual=`<div class="equal-groups">${Array.from({length:q.b},(_,i)=>`<div class="equal-group ${step===1?'counting-group':''}" style="--item:${i}">${Array.from({length:q.a},()=>'<i></i>').join('')}</div>`).join('')}</div>`+caption(`${q.b} равных групп по ${q.a}${end?' — всего '+q.answer:''}`);
 else if(q.op==='÷')visual=`<div class="equal-groups">${Array.from({length:q.b},()=>`<div class="equal-group ${step===0?'empty-group':''}">${step>0?Array.from({length:q.answer},()=>'<i></i>').join(''):'?'}</div>`).join('')}</div>`+caption(step===0?`Распределим ${q.a} поровну в ${q.b} групп`:`В каждой группе ${q.answer}`);
 else if(q.type==='plus9')visual=`<div class="step-equation">${step===0?`${q.a} + 9`:step===1?`${q.a} + 10 = ${q.a+10}`:`${q.a+10} − 1 = ${q.answer}`}</div>`+caption(step===1?'Взяли одну лишнюю единицу':end?'Вернули лишнюю единицу':'Заменим девять круглой десяткой');
 else if(q.op==='+'&&q.answer<=20){
  if(step===0)visual=`<div class="object-equation">${objectGroup(q.a,q.icon)}<span class="model-sign">+</span>${objectGroup(q.b,q.icon)}</div>`;
  else visual=frame(q.answer,q.a,q.b,{capacity:q.answer>10?20:10});
  visual+=caption(step===1&&q.type==='carry'?`До десяти добавили ${10-q.a}; осталось ${q.b-(10-q.a)}`:step===1?'Собрали две части вместе':end?`Всего ${q.answer}`:'Начни с первой группы');
 }else if(q.op==='−'&&q.a<=20){
  const removed=step===0?0:step===1&&q.type==='borrow'?q.a-10:q.b;
  visual=objectGroup(q.a,q.icon,{removed})+caption(step===0?`Было ${q.a}. Нужно убрать ${q.b}`:end?`Осталось ${q.answer}`:q.type==='borrow'?`Убрали ${removed}, осталось десять`:`Убрали ${q.b}. Посчитай оставшиеся`);
 }else visual=`<div class="step-equation">${end?`${q.a} ${q.op} ${q.b} = ${q.answer}`:`${q.a} ${q.op} ${q.b}`}</div>`;
 return `<div class="lesson-visual" data-step="${step}">${visual}</div>`;
}
