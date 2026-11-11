/* One local wallet and one persistent cat city for all Notebook topics. */
(function(global){'use strict';
const KEY='ee-cat-city-v1',SIZE=7,MAX_LEVEL=3;
const CATALOG=[
 {id:'park',name:'Сад с фонтаном',cost:5,people:0,category:'rest',colour:'#77b685',detail:'Зелёное место для прогулок и встреч.'},
 {id:'house',name:'Уютный дом',cost:15,people:2,category:'home',colour:'#f4b16f',detail:'Первые жители переедут в твой город.'},
 {id:'cafe',name:'Кошачья пекарня',cost:30,people:1,category:'rest',colour:'#df927d',detail:'Пончик открывает пекарню для друзей.'},
 {id:'school',name:'Школа Оскара',cost:45,people:2,category:'learn',colour:'#83b8c4',detail:'У котиков появится собственная школа.'},
 {id:'library',name:'Библиотека',cost:60,people:1,category:'learn',colour:'#a5b78a',detail:'Истории и книги для маленьких исследователей.'},
 {id:'gym',name:'Спортклуб Рокки',cost:75,people:2,category:'rest',colour:'#e8bc69',detail:'Место для тренировок и весёлых матчей.'},
 {id:'theatre',name:'Театр Лики',cost:90,people:2,category:'rest',colour:'#b3a0c3',detail:'Здесь котики устраивают свои спектакли.'},
 {id:'observatory',name:'Обсерватория',cost:120,people:2,category:'learn',colour:'#89a5c8',detail:'Смотри на звёзды вместе с Максом.'},
 {id:'palace',name:'Кошачий дворец',cost:180,people:4,category:'home',colour:'#d9b967',detail:'Большая цель для твоей кошачьей империи.'}
];
const byId=id=>CATALOG.find(b=>b.id===id),isLot=p=>Number.isInteger(p)&&p>=0&&p<SIZE*SIZE&&p%SIZE!==3&&Math.floor(p/SIZE)!==3;
const integer=n=>Number.isSafeInteger(n)&&n>=0;
function day(now=Date.now()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Omsk',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now))}
function initial(){return{version:1,coins:0,earned:0,buildings:[],rewards:{}}}
function validate(d){
 if(!d||d.version!==1||!integer(d.coins)||!integer(d.earned)||d.coins>d.earned||!Array.isArray(d.buildings)||!d.rewards||typeof d.rewards!=='object'||Array.isArray(d.rewards))throw new Error('Не удалось прочитать город. Сохранение оставлено без изменений.');
 const seen=new Set();for(const b of d.buildings){if(!byId(b.id)||!isLot(b.plot)||seen.has(b.plot)||!Number.isInteger(b.level)||b.level<1||b.level>MAX_LEVEL)throw new Error('Не удалось прочитать здания. Сохранение оставлено без изменений.');seen.add(b.plot)}
 for(const v of Object.values(d.rewards))if(!integer(v)||v>15)throw new Error('Не удалось прочитать награды. Сохранение оставлено без изменений.');
 return d;
}
function createStore(storage,now=()=>Date.now()){
 function load(){try{const raw=storage.getItem(KEY);return raw===null?initial():validate(JSON.parse(raw))}catch(e){throw new Error(e instanceof SyntaxError?'Не удалось прочитать город. Сохранение оставлено без изменений.':e.message||'Не удалось открыть сохранение города.')}}
 function save(d){validate(d);try{storage.setItem(KEY,JSON.stringify(d))}catch(e){throw new Error('Не удалось сохранить город. Покупка и награда не записаны. Проверь настройки хранения в браузере.')}return d}
 function earn(activity,stars){const d=load(),date=day(now()),id=date+'|'+activity,target=Math.max(1,Math.min(3,Math.trunc(stars)||1))*5,previous=d.rewards[id]||0,amount=Math.max(0,target-previous);
  if(!amount)return {amount:0,state:d};d.rewards[id]=target;d.coins+=amount;d.earned+=amount;
  // Old daily caps can expire; the wallet and buildings never do.
  Object.keys(d.rewards).forEach(k=>{if(k.slice(0,10)<date)d.rewards[k]=undefined});
  for(const k of Object.keys(d.rewards))if(d.rewards[k]===undefined)delete d.rewards[k];
  return {amount,state:save(d)};
 }
 function buy(id,plot){const d=load(),item=byId(id);if(!item||!isLot(plot)||d.buildings.some(b=>b.plot===plot))throw new Error('Выбери свободный участок.');if(d.coins<item.cost)throw new Error('Пока не хватает монет. Заверши ещё одно задание.');d.coins-=item.cost;d.buildings.push({id,plot,level:1});return save(d)}
 function move(from,to){const d=load(),b=d.buildings.find(b=>b.plot===from);if(!b||!isLot(to)||d.buildings.some(b=>b.plot===to))throw new Error('Выбери свободный участок.');b.plot=to;return save(d)}
 function upgrade(plot){const d=load(),b=d.buildings.find(b=>b.plot===plot);if(!b||b.level>=MAX_LEVEL)throw new Error('У здания уже максимальный уровень.');const cost=upgradeCost(b);if(d.coins<cost)throw new Error('Не хватает '+(cost-d.coins)+' монет для улучшения.');d.coins-=cost;b.level++;return save(d)}
 return {load,earn,buy,move,upgrade};
}
function upgradeCost(b){return Math.ceil(byId(b.id).cost*b.level*.75)}
function residents(d){return d.buildings.reduce((n,b)=>n+byId(b.id).people*b.level,0)}
function level(d){const n=d.buildings.length;return n>=20?'Кошачья империя':n>=10?'Большой город':n>=4?'Кошачий город':'Первый квартал'}
function buildingSvg(id,level=1){
 const item=byId(id),col=item.colour,roof=id==='palace'?'#be9447':'#527e70',height=28+level*8;
 if(id==='park')return '<ellipse cx="0" cy="3" rx="29" ry="14" fill="#60936b"/><ellipse cx="6" cy="0" rx="17" ry="9" fill="#e4dac3"/><ellipse cx="6" cy="-2" rx="13" ry="6" fill="#9ed8df"/><path d="M6 -3v-19m0 6q-10 -18-12 2m12-2q10-18 12 2" stroke="#e7ffff" stroke-width="3" fill="none"/><path d="M-20 0v-23" stroke="#8c6950" stroke-width="5"/><circle cx="-20" cy="-28" r="13" fill="#82b77a"/><circle cx="-24" cy="-32" r="8" fill="#b1d79b"/>';
 let out='<ellipse cx="0" cy="5" rx="31" ry="14" fill="#274b3b" opacity=".13"/>';
 out+='<path d="M-27 -'+height+' L0 -'+(height-13)+' V13L-27 0Z" fill="'+col+'"/><path d="M0 -'+(height-13)+' L27 -'+height+' V0L0 13Z" fill="'+roof+'"/><path d="M-27 -'+height+' L0 -'+(height+13)+' L27 -'+height+' L0 -'+(height-13)+'Z" fill="#fcf2d8"/>';
 if(['house','school','library','cafe'].includes(id))out+='<path d="M-31 -'+(height-1)+'L-4 -'+(height+26)+'L30 -'+(height+10)+'L3 -'+(height-12)+'Z" fill="'+(id==='cafe'?'#c87559':'#dc9365')+'"/><path d="M3 -'+(height-12)+'L-4 -'+(height+26)+'L30 -'+(height+10)+'Z" fill="#eeb28c"/>';
 for(let row=0;row<level;row++)for(const x of [-20,-9,7,18])out+='<rect x="'+x+'" y="'+(-height+16+row*9+(x>0?0:-1))+'" width="5" height="7" rx="1.5" fill="#fff2ba"/>';
 out+='<path d="M-12 5V-9l7 3V8Z" fill="#82634a"/>';
 if(id==='cafe')out+='<path d="M1 -17l27-13v10L1-7Z" fill="#fff3dc"/><path d="M6-19v9m9-13v9m8-13v9" stroke="#ce7159" stroke-width="5"/>';
 if(id==='school'||id==='library')out+='<path d="M-18 -'+(height+9)+'v-12l7 3 7-3v12l-7 3Z" fill="#fff5dd" stroke="#51775c" stroke-width="1.5"/><path d="M-11 -'+(height+18)+'v11" stroke="#51775c"/>';
 if(id==='observatory')out+='<ellipse cx="0" cy="-'+(height+3)+'" rx="25" ry="12" fill="#bad6e3"/><path d="M-25 -'+(height+3)+'a25 25 0 0 1 50 0" fill="#91bbd2"/><path d="M0 -'+(height+27)+'v27" stroke="#e8f4f1" stroke-width="5"/><path d="M6 -'+(height+15)+'l22-14 4 7-22 13Z" fill="#f4d898"/>';
 if(id==='palace'){for(const x of [-25,22])out+='<path d="M'+x+' -'+(height-6)+'v-29l10 5v29Z" fill="#e9c987"/><path d="M'+(x-3)+' -'+(height+23)+'l8-19 9 24Z" fill="#b88f53"/>';out+='<path d="M0 -'+(height+12)+'v-28l13 6-13 6" fill="#e5ad65" stroke="#8e7651" stroke-width="1.5"/>'}
 if(id==='gym')out+='<circle cx="-13" cy="-'+(height-6)+'" r="7" fill="#fff6db" stroke="#5f7e66" stroke-width="2"/>';
 if(id==='theatre')out+='<path d="M-23 -'+(height+3)+'q10 9 20 0v14q-10-7-20 0Z" fill="#b88599"/><path d="M0 -'+(height+13)+'v-20l17 6-17 7" fill="#e8b86c"/>';
 if(level>1)out+='<circle cx="20" cy="-'+(height+7)+'" r="8" fill="#fff8db" stroke="#b99a5b"/><text x="20" y="-'+(height+3)+'" text-anchor="middle" fill="#705c36" font-size="10" font-family="sans-serif" font-weight="bold">'+level+'</text>';
 return out;
}
function icon(item,el){const box=el('span',{class:'town-building-icon',ariaHidden:'true'});box.innerHTML='<svg viewBox="-45 -94 90 118" xmlns="http://www.w3.org/2000/svg">'+buildingSvg(item.id)+'</svg>';return box}
function wallet(){return createStore(global.localStorage)}
function link(el,returnTo){let coins='—';try{coins=wallet().load().coins}catch(e){}
 return el('button',{class:'town-shop-link',type:'button',on:{click:()=>{try{global.localStorage.setItem('ee-city-return',returnTo||global.location.hash.slice(1))}catch(e){}global.location.hash='cat-city'}}},el('span',{class:'game-coin',ariaHidden:'true'},'А'),el('span',null,'Магазин и мой город'),el('b',{'data-town-balance':''},String(coins)));
}
function view(el){
 const root=el('section',{class:'town-page'}),hud=el('div',{class:'town-stats'}),map=el('div',{class:'town-map'}),shop=el('div',{class:'town-shop'}),details=el('div',{class:'town-details'}),status=el('p',{class:'town-status',role:'status',ariaLive:'polite'});
 let store,data,pending=null,moveFrom=null,chosen=null,category='all';
 let returnTo='';try{store=wallet();returnTo=global.localStorage.getItem('ee-city-return')||'';data=store.load()}catch(e){root.append(el('a',{href:'#',textContent:'← К заданиям'}),el('p',{role:'alert'},'Не удалось открыть сохранённый город. '+e.message));return root}
 const back=el('a',{class:'btn ghost',href:'#'+(returnTo==='cat-city'?'':returnTo),textContent:'← Вернуться к заданиям'});
 const about=el('details',{class:'town-help'},el('summary',null,'Как заработать монеты'),el('p',null,'Заверши любое задание тетради: 1 звезда — 5, 2 звезды — 10, 3 звезды — 15 игровых монет. За улучшение сегодняшнего результата получишь разницу. Завтра за это задание снова можно заработать до 15 монет.'),el('p',null,'Монеты и город сохраняются в этом браузере. Это игровые монеты для зданий.'));
 root.append(back,el('div',{class:'town-heading'},el('div',null,el('p',{class:'eyebrow'},'ТВОЯ КОШАЧЬЯ ИМПЕРИЯ'),el('h1',null,'Котополис'),el('p',{class:'muted'},'Учись, зарабатывай монеты и строй город для котиков.')),el('img',{class:'town-mascot',src:'../../assets/max-3d.png',alt:'Макс АюлитА',width:100,height:125})),hud,map,status,details,el('h2',null,'Магазин зданий'),shop,about);
 const onStorage=e=>{if(e.key===KEY){try{data=store.load();paint()}catch(err){status.textContent=err.message}}};global.addEventListener?.('storage',onStorage);
 root.townCleanup=()=>global.removeEventListener?.('storage',onStorage);
 function transact(fn,message){try{data=fn();pending=null;moveFrom=null;chosen=null;status.textContent=message;status.classList.remove('error');paint()}catch(e){status.textContent=e.message;status.classList.add('error')}}
 function choosePlot(plot){const b=data.buildings.find(b=>b.plot===plot);
  if(moveFrom!==null){if(b){status.textContent='Для переноса нужен свободный участок.';return}transact(()=>store.move(moveFrom,plot),'Здание перенесено.');return}
  if(pending){if(b){status.textContent='Этот участок уже занят. Выбери свободный.';return}transact(()=>store.buy(pending,plot),'Новое здание уже в твоём городе!');return}
  chosen=b?plot:null;if(!b)status.textContent='Сначала выбери здание в магазине под картой.';drawMap();paintDetails();
 }
 function paint(){
  hud.replaceChildren(el('span',null,el('span',{class:'game-coin',ariaHidden:'true'},'А'),el('b',null,String(data.coins)),el('small',null,'монет')),el('span',null,el('b',null,String(data.buildings.length)),el('small',null,'зданий')),el('span',null,el('b',null,String(residents(data))),el('small',null,'жителей')),el('span',null,el('b',null,level(data)),el('small',null,'твой город')));
  drawMap();paintShop();paintDetails();
 }
 function drawMap(){
  let svg='<svg class="town-scene" viewBox="0 0 760 510" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Карта города: выбери участок"><defs><linearGradient id="town-sky" x2="0" y2="1"><stop stop-color="#e6f3f3"/><stop offset="1" stop-color="#f7f5e9"/></linearGradient></defs><rect width="760" height="510" rx="22" fill="url(#town-sky)"/><circle cx="645" cy="65" r="28" fill="#f7dda1"/><g fill="#fff" opacity=".9"><ellipse cx="144" cy="65" rx="50" ry="13"/><ellipse cx="165" cy="55" rx="24" ry="16"/><ellipse cx="533" cy="43" rx="40" ry="10"/></g><path d="M79 276L380 126 681 276 681 300 380 452 79 300Z" fill="#aec5a1"/>';
  const iso=(x,y)=>[380+(x-y)*43,126+(x+y)*21.5];
  for(let sum=0;sum<13;sum++)for(let y=0;y<SIZE;y++){const x=sum-y;if(x<0||x>=SIZE)continue;const plot=y*SIZE+x,[cx,cy]=iso(x,y),b=data.buildings.find(z=>z.plot===plot),road=!isLot(plot),active=!!pending||moveFrom!==null;
   svg+='<g transform="translate('+cx+' '+cy+')"'+(!road?' data-lot="'+plot+'" tabindex="0" role="button" aria-label="'+(b?byId(b.id).name+', уровень '+b.level:'Свободный участок '+(y+1)+', '+(x+1))+'"':'')+'>';
   svg+='<path class="town-lot'+(!b&&!road&&active?' available':'')+'" d="M0 0l43 21.5-43 21.5-43-21.5Z" fill="'+(road?'#e8deca':(x+y)%2?'#b7d2a4':'#c3dbae')+'" stroke="'+(b&&chosen===plot?'#c8853e':'#a8c39b')+'" stroke-width="'+(b&&chosen===plot?3:1)+'"/>';
   if(road)svg+='<path d="M-20 12l40 20M-20 30l40-20" stroke="#d4c9b4" stroke-width="1"/>';
   if(b)svg+='<g transform="translate(0 24)">'+buildingSvg(b.id,b.level)+'</g>';
   if(!road&&!b&&active)svg+='<path d="M-7 21h14m-7-7v14" stroke="#67926a" stroke-width="2" pointer-events="none"/>';
   svg+='</g>';
  }
  svg+='<g transform="translate(380 271)"><ellipse rx="35" ry="17" fill="#b9d2a1"/><path d="M-15 0l15-20 15 20-15 8Z" fill="#f4dbaa"/><path d="M0-20v-27l18 6-18 7" fill="#e4a469" stroke="#ab8155" stroke-width="2"/></g>';
  const cats=[['max-3d.png',337,270,'Макс'],['mia-3d.png',430,265,'Мия'],['oscar-3d-teacher.png',257,320,'Оскар']];
  cats.slice(0,Math.min(3,1+Math.floor(data.buildings.length/3))).forEach(([file,x,y,name],n)=>{svg+='<g transform="translate('+x+' '+y+')"><g class="town-resident resident-'+n+'"><ellipse cx="20" cy="54" rx="17" ry="6" fill="#45644b" opacity=".15"/><image href="../../assets/'+file+'" x="0" y="0" width="40" height="56" aria-label="'+name+'"/></g></g>'});
  svg+='<text x="380" y="485" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#5c755b">'+(data.buildings.length?'Нажми на здание, чтобы улучшить или перенести его':'Здесь появится твой первый кошачий квартал')+'</text></svg>';
  map.innerHTML=svg;map.querySelectorAll('[data-lot]').forEach(n=>{const act=()=>choosePlot(Number(n.dataset.lot));n.addEventListener('click',act);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act()}})});
 }
 function paintDetails(){
  details.replaceChildren();
  if(pending||moveFrom!==null){details.append(el('p',null,pending?'Выбрано: '+byId(pending).name+' · '+byId(pending).cost+' монет. Нажми на свободный участок.':'Нажми на свободный участок, чтобы перенести здание.'),el('div',{class:'row'},el('button',{type:'button',class:'main',textContent:'Поставить на свободный участок',on:{click:()=>{const plot=Array.from({length:SIZE*SIZE},(_,i)=>i).find(p=>isLot(p)&&!data.buildings.some(b=>b.plot===p));if(plot!==undefined)choosePlot(plot)}}}),el('button',{type:'button',class:'ghost',textContent:'Отменить выбор',on:{click:()=>{pending=null;moveFrom=null;paint()}}})));return}
  const b=data.buildings.find(z=>z.plot===chosen);if(!b)return;
  const price=upgradeCost(b);
  details.append(el('h3',null,byId(b.id).name+' · уровень '+b.level),el('p',null,byId(b.id).detail),el('div',{class:'row'},b.level<MAX_LEVEL?el('button',{type:'button',class:'main',disabled:data.coins<price,textContent:'Улучшить · '+price+' монет',on:{click:()=>transact(()=>store.upgrade(b.plot),'Здание улучшено!')}}):el('b',null,'Максимальный уровень'),el('button',{type:'button',textContent:'Перенести бесплатно',on:{click:()=>{moveFrom=b.plot;chosen=null;paint()}}})),b.level<MAX_LEVEL&&data.coins<price?el('p',{class:'muted small'},'Для улучшения нужно ещё '+(price-data.coins)+' монет.'):null);
 }
 function paintShop(){
  const tabs=el('div',{class:'town-filters',role:'group',ariaLabel:'Категория зданий'},[['all','Все здания'],['home','Для жизни'],['learn','Для учёбы'],['rest','Для отдыха']].map(([id,name])=>el('button',{class:'chip',type:'button',ariaPressed:String(category===id),textContent:name,on:{click:()=>{category=id;paintShop()}}})));
  const full=data.buildings.length>=36;
  const cards=el('div',{class:'town-catalog'},CATALOG.filter(b=>category==='all'||category===b.category).map(b=>{
   const enough=data.coins>=b.cost;
   return el('article',{class:'town-item'+(pending===b.id?' selected':'')},icon(b,el),el('h3',null,b.name),el('p',null,b.detail),el('b',{class:'town-price'},b.cost+' монет'),el('button',{type:'button',class:enough?'main':'',disabled:!enough||full,textContent:full?'Все участки заняты':enough?'Выбрать участок':'Ещё '+(b.cost-data.coins)+' монет',on:{click:()=>{pending=b.id;moveFrom=null;chosen=null;status.textContent='Монеты спишутся, когда выберешь свободный участок.';paint();map.scrollIntoView?.({block:'start',behavior:'smooth'})}}}));
  }));shop.replaceChildren(tabs,cards);
 }
 paint();return root;
}
const api={KEY,SIZE,MAX_LEVEL,CATALOG,day,initial,validate,isLot,createStore,upgradeCost,residents,level,buildingSvg,link,view,wallet};
global.NotebookTown=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
