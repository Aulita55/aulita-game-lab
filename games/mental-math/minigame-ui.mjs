import {expr,orderChoice,answerLabel} from './minigames.mjs';
export function miniModel(q,route,objects){
 if(q.kind==='relation')return `<div class="relation-board"><div>${route==='preschool'?objects(q.left,q.icon):q.leftText}</div><span>?</span><div>${route==='preschool'?objects(q.right,q.icon):q.rightText}</div></div>`;
 if(q.kind==='pattern')return `<div class="pattern-track">${q.tiles.map(t=>`<span>${t}</span>`).join('')}<span class="missing-tile">?</span></div>`;return null;
}
export function miniControls(q,objects,route){
 if(q.kind==='collect')return `<div class="collector"><div class="collection-zone" id="collected" aria-live="polite">Корзинка пуста</div><div class="collector-buttons"><button data-collect="-1" aria-label="Убрать один">−1</button><button data-collect="1" class="orange" aria-label="Добавить один">+1</button>${q.mathAnswer>=10?'<button data-collect="10">+10</button>':''}<button id="send-collection" class="primary">Отправить</button></div></div>`;
 if(q.kind==='memory')return `<div class="memory-board">${q.cards.map((v,i)=>`<button data-memory="${i}" disabled aria-label="Окошко ${i+1}"><small>${i+1}</small><strong>${v}</strong></button>`).join('')}</div><button id="cover-memory" class="primary">Я запомнил — спрятать</button><p class="small" id="memory-status">Запомни расположение. На этом шаге время не идёт.</p>`;
 if(q.kind==='order')return `<div class="order-slots" id="order-slots" aria-live="polite">${q.items.map(()=>'<span>?</span>').join('')}</div><div class="order-board">${q.items.map((v,i)=>`<button data-order="${i}">${v.label}</button>`).join('')}</div><p class="small">Начни с наименьшего значения. Нажми все карточки по порядку.</p>`;
 if(q.kind==='odd')return `<div class="odd-board">${q.items.map((v,i)=>`<button data-answer="${i}" aria-label="Картинка ${i+1}: ${v}">${v}</button>`).join('')}</div>`;
 if(q.kind==='detective')return `<div class="detective-board">${q.items.map((v,i)=>`<button data-answer="${i}"><small>Карточка ${i+1}</small><strong>${expr(v)} = ${v.shown}</strong></button>`).join('')}</div>`;
 if(q.kind==='relation')return `<div class="relation-buttons">${[-1,0,1].map((v,i)=>`<button data-answer="${v}" aria-label="${['Меньше','Равно','Больше'][i]}"><strong>${['&lt;','=','&gt;'][i]}</strong><small>${['меньше','равно','больше'][i]}</small></button>`).join('')}</div>`;
 if(q.kind==='pattern')return `<div class="pattern-options">${q.patternOptions.map((v,i)=>`<button data-answer="${i}" aria-label="Продолжить: ${v}">${v}</button>`).join('')}</div>`;return null;
}
export function miniLesson(q,step,route,objects){
 if(!['collect','memory','odd','order','detective','relation','pattern'].includes(q.kind))return null;
 if(step===2)return `<div class="step-equation">${answerLabel(q)}</div>`;
 return miniModel(q,route,objects)|| (q.kind==='collect'&&q.mathAnswer<=20?objects(step===0?Math.min(q.mathAnswer,1):q.mathAnswer,q.icon):`<div class="visual-caption">${q.kind==='collect'?`Нужно собрать: ${q.mathAnswer}`:q.kind==='memory'?q.cards.map((v,i)=>`${i+1}: ${v}`).join(' · '):q.kind==='odd'?q.items.join(' '):q.kind==='order'?q.items.map(v=>v.label).join(' · '):q.items.map(v=>`${expr(v)} = ${v.shown}`).join(' · ')}</div>`);
}
export function bindMini(q,{document,blocked,submit,objects,route,assisted,memory}){
 let collected=0,ordered=[],open=q.kind==='memory';
 document.querySelectorAll('[data-collect]').forEach(b=>b.onclick=()=>{if(blocked())return;collected=Math.max(0,Math.min(q.mathAnswer+10,collected+Number(b.dataset.collect)));document.querySelector('#collected').innerHTML=route==='preschool'?objects(collected,q.icon):`<strong>${collected}</strong><span>единиц в заказе</span>`;});
 const send=document.querySelector('#send-collection');if(send)send.onclick=()=>{if(!blocked())submit(collected);};
 document.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>{if(blocked())return;const i=Number(b.dataset.order);if(!orderChoice(q,i,ordered)){submit(-999);return;}ordered.push(i);b.disabled=true;document.querySelector('#order-slots').innerHTML=q.items.map((_,j)=>`<span>${ordered[j]===undefined?'?':q.items[ordered[j]].label}</span>`).join('');if(ordered.length===q.items.length)submit(q.answer);});
 const cover=document.querySelector('#cover-memory');if(cover)cover.onclick=()=>{if(blocked())return;if(!open)assisted();open=!open;memory(open);document.querySelectorAll('[data-memory]').forEach(b=>{const i=Number(b.dataset.memory);b.disabled=open;b.innerHTML=`<small>${i+1}</small><strong>${open?q.cards[i]:'?'}</strong>`;});cover.textContent=open?'Я запомнил — спрятать':'Посмотреть ещё раз (с помощью)';document.querySelector('#memory-status').textContent=open?'Запоминай без спешки.':q.baseKind==='equation'?`Где ответ на ${expr(q)}?`:`Где было число ${q.mathAnswer}?`;};
 document.querySelectorAll('[data-memory]').forEach(b=>b.onclick=()=>{if(!open&&!blocked())submit(Number(b.dataset.memory));});
}
