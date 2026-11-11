/* Deliberate form discrimination, retrieval and short, spaced error review. */
(function(global){'use strict';
const STEPS=[
 {title:'Знакомство',hint:'Сначала картинка, значение и звучание трёх форм.',keys:['verbcards']},
 {title:'Заметь разницу',hint:'Близкие написания: внимательно выбери нужную форму.',keys:['verbcontrast']},
 {title:'Собери и запомни',hint:'Собери формы, затем попробуй написать одну самостоятельно.',keys:['forms','typeform']},
 {title:'Стань редактором',hint:'Найди ошибку, исправь её и сравни группы глаголов.',keys:['verbedit','formcheck','verbsort']},
 {title:'Используй в ситуации',hint:'Правило, история и действия в прошлом: от выбора к своему ответу.',keys:['rule','pastpick','pasttype','choice','sentences','story','scenechoice','scenelisten','scenebuild']},
 {title:'Вспомни без вариантов',hint:'Запиши на слух, восстанови обе формы и опиши ситуацию.',keys:['verbdictation','verbrecall','scenespeech','sayit']},
 {title:'Финал',hint:'Смешанная практика в городском квесте. Награда пригодится в магазине.',keys:['city']}
];
/* Deliberately wrong spellings, never used as speech models. */
const CONFUSIONS={
 caught:['cought','caugt','catched'],taught:['tought','taugt','teached'],thought:['thaught','thougt','thinked'],bought:['baught','bougt','buyed'],brought:['braught','brougt','bringed'],fought:['faught','fougt','fighted'],sought:['saught','sougt','seeked'],
 chose:['choosed','choze','choose'],chosen:['choosen','chossen','chose'],came:['come','caim','comed'],come:['came','commed','comen'],cost:['costed','coust','cast'],crept:['creeped','creapt','creppt'],cut:['cutted','caut','cutt'],
 began:['begun','beggan','begined'],begun:['began','beggun','beginned'],drank:['drunk','dra nk','drinked'],drunk:['drank','drunck','drinked'],sang:['sung','seng','singed'],sung:['sang','sunged','sungn'],swam:['swum','swa m','swimmed'],swum:['swam','swumm','swimmed'],rang:['rung','reng','ringed'],rung:['rang','runged','runn g'],ran:['run','rann','runned'],run:['ran','runn','runned'],
 went:['wend','wented','goed'],gone:['goan','gonn','goed'],did:['ded','didd','doed'],done:['dun','do ne','doed'],ate:['eated','ait','atte'],eaten:['eatten','eatened','eated'],
 wrote:['writed','wro te','written'],written:['writen','writton','wrote'],rode:['rided','roade','ridden'],ridden:['riden','riddon','rode'],broke:['broak','breaked','broken'],broken:['brocken','broaken','broke'],spoke:['speaked','spo ke','spoken'],spoken:['spocken','speaken','spoke'],took:['taked','toock','taken'],taken:['tacken','taiken','took'],
 knew:['knowed','knewn','knuw'],known:['knowen','kno wn','knew'],grew:['growed','gruw','grown'],grown:['growen','gro wn','grew'],flew:['fluw','flied','flown'],flown:['flowen','flo wn','flew'],threw:['throwed','thruw','thrown'],thrown:['throwen','thro wn','threw'],blew:['bluw','blowed','blown'],blown:['blowen','blo wn','blew'],
 saw:['seed','sauw','seen'],seen:['sean','seeen','saw'],gave:['gived','gaive','given'],given:['givven','givan','gave'],got:['getted','gott','gat'],made:['maked','maide','maded'],paid:['paied','paide','payed'],said:['sayed','saide','sed'],laid:['layed','laide','layd'],read:['red','reed','readed'],led:['lead','ledd','leaded'],
 was:['wos','wass','beed'],been:['bean','bin','beed'],bore:['bared','boar','borned'],borne:['bourn','bor ne','bored'],beat:['beet','beated','bett'],beaten:['beeten','beatten','beated'],became:['become','becaim','becomed'],become:['became','becomen','becomed'],
 fell:['falled','feel','fel'],fallen:['falen','fallan','felled'],forgot:['forgetted','forgat','forgott'],forgotten:['forgoten','forgottan','forgot'],forgave:['forgived','forgaive','forgiven'],forgiven:['forgivven','forgivan','forgave'],forbade:['forbaded','forbaid','forbid'],forbidden:['forbiden','forbiddan','forbade'],froze:['freezed','frose','frozen'],frozen:['frosen','frooz en','froze'],
 hid:['hidd','hided','had'],hidden:['hiden','hiddan','hid'],bit:['bited','bitt','bet'],bitten:['biten','bittan','bit'],shook:['shaked','shouk','shaken'],shaken:['shaiken','shacken','shook'],stole:['stealed','stoal','stolen'],stolen:['stollen','stealen','stole'],
 wore:['weared','woar','worn'],worn:['woren','wourn','wore'],tore:['teared','toar','torn'],torn:['toren','tourn','tore'],swore:['sweared','swoar','sworn'],sworn:['sworen','swourn','swore'],woke:['waked','woak','woken'],woken:['wocken','woaken','woke'],
 found:['faund','foun d','finded'],bound:['baund','boun d','binded'],wound:['waund','woun d','winded'],hung:['hanged','hang ed','hungg'],held:['holded','heald','helld'],heard:['heared','herd','heerd'],stood:['standed','stoud','stooded'],understood:['understanded','understoud','understooded'],
 lost:['losed','loost','losted'],left:['leaved','leaft','lefft'],kept:['keeped','keapt','keppt'],slept:['sleeped','sleapt','sleppt'],felt:['feeled','fealt','fellt'],met:['meeted','mett','meat'],fed:['feeded','fedd','fead'],built:['builded','bult','buil t'],sent:['sended','sennt','seant'],lent:['lended','lennt','leant'],spent:['spended','spennt','speant'],
 sat:['sitted','satt','set'],set:['setted','sett','sat'],put:['putted','putt','pat'],hurt:['hurted','hurtt','hert'],hit:['hitted','hitt','het'],shut:['shutted','shutt','shat'],quit:['quited','quitt','quet'],let:['letted','lett','lat']
};
// These legitimate variants must never become spelling traps.
const EXTRA={awake:{1:['awaked'],2:['awaked']},wake:{1:['waked'],2:['waked']},get:{2:['gotten']},quit:{1:['quitted'],2:['quitted']},shine:{1:['shined'],2:['shined']},spit:{1:['spit'],2:['spit']},strike:{2:['stricken']}};
const NEVER_TRAPS=new Set(['born','hanged','winded','payed']);
const normal=s=>String(s||'').trim().toLowerCase().replace(/[’‘]/g,"'");
function accepted(v,k){return [...new Set([...String(v[k]).split('/').map(normal),...(EXTRA[v[0]]?.[k]||[])])]}
function isCorrect(v,k,value){return accepted(v,k).includes(normal(value))}
function regular(b){return /e$/.test(b)?b+'d':/[^aeiou]y$/.test(b)?b.slice(0,-1)+'ied':b+'ed'}
function wrongForms(v,k,n=3){
 const word=String(v[k]).split('/')[0],out=[],valid=new Set(accepted(v,k));
 const add=x=>{x=normal(x).replace(/\s/g,'');if(x&&/^[a-z]+$/.test(x)&&!valid.has(x)&&!NEVER_TRAPS.has(x)&&!out.includes(x))out.push(x)};
 (CONFUSIONS[word]||[]).forEach(add);
 for(const [a,b] of [['au','ou'],['ou','au'],['ee','ea'],['ea','ee'],['ie','ei'],['ei','ie'],['en','an'],['oo','ou']])if(word.includes(a))add(word.replace(a,b));
 for(const x of v.slice(0,3).flatMap(s=>s.split('/')))add(x);
 add(regular(v[0]));
 const at=word.search(/[aeiou]/);if(at>=0)for(const ch of 'aeiou')add(word.slice(0,at)+ch+word.slice(at+1));
 add(word.replace(/([b-df-hj-np-tv-z])\1/,'$1'));add(word+'n');add(word+'ed');
 return out.slice(0,n);
}
function options(v,k,shuffle=a=>a.slice(),n=4){return shuffle([v[k].split('/')[0],...wrongForms(v,k,n-1)])}
function formLabel(k){return k===1?'2-я форма · Past Simple':'3-я форма · Past Participle'}
function explanation(v,k,wrong){
 const right=v[k].split('/')[0];
 if((right.includes('aught')||right.includes('ought'))&&normal(wrong)!==right)return 'В '+right+' пишем '+(right.includes('aught')?'au':'ou')+'. '+formLabel(k)+': '+v[k]+'.';
 const other=[0,1,2].find(i=>i!==k&&String(v[i]).split('/').includes(normal(wrong)));
 if(other!==undefined&&!isCorrect(v,k,wrong))return wrong+' — '+(other+1)+'-я форма. Здесь нужна '+(k+1)+'-я: '+v[k]+'.';
 return 'Запомни правильное написание: '+v[k]+'. Вся цепочка: '+v.slice(0,3).join(' — ')+'.';
}
function createReview(storage,now=()=>Date.now()){
 const key='ee-verb-review-v1';
 function load(){try{const x=JSON.parse((storage||global.localStorage).getItem(key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(e){return {}}}
 function record(v,k,ok,assisted=false){const d=load(),id=v[0]+':'+k,old=d[id]||{},streak=ok&&!assisted?Math.min(3,(Number(old.streak)||0)+1):0;
  d[id]={errors:(Number(old.errors)||0)+(ok?0:1),streak,due:now()+(streak>=2?86400000:streak?600000:0)};
  try{(storage||global.localStorage).setItem(key,JSON.stringify(d))}catch(e){}return d[id];
 }
 function due(verbs){const d=load();return verbs.flatMap(v=>[1,2].filter(k=>{const r=d[v[0]+':'+k];return r&&r.errors>0&&r.due<=now()}).map(k=>({v,k})))}
 return {load,record,due};
}
function deck(t,kind,shuffle,review){
 if(kind==='verbreview'){const due=review.due(t.verbs);const picked=shuffle(due.length?due:t.verbs.flatMap(v=>[1,2].map(k=>({v,k})))).slice(0,8);return picked.map((q,i)=>({...q,mode:['verbcontrast','verbedit','verbrecall'][i%3]}))}
 if(kind==='verbrecall')return shuffle(t.verbs).slice(0,8).map(v=>({v,k:1,mode:kind}));
 const rows=shuffle(t.verbs);return [1,2].flatMap(k=>rows.map(v=>({v,k,mode:kind}))).slice(0,Math.max(4,Math.min(10,rows.length*2)));
}
function play(kind,t,c,h){
 const {el}=h,review=createReview(),rounds=deck(t,kind,h.shuffle,review),total=rounds.length;
 let i=0,mistakes=0,assists=0,correct=0,cancelled=false;
 c.onCleanup?.(()=>{cancelled=true});
 const alive=()=>!cancelled&&c.alive();
 function next(){
  if(!alive())return;
  if(i>=rounds.length){c.finish(h.starsBy(mistakes+assists,total),'Без подсказок с первой попытки: '+correct+' из '+total+'. Повторные вопросы: '+(rounds.length-total)+'.');return}
  const q=rounds[i],{v,k,mode}=q;let done=false,assisted=false,selected=null,graded=false,corrected=false,queued=false;const tried=new Set();
  const note=el('p',{class:'verb-feedback',role:'status',ariaLive:'polite'}),area=el('div',{class:'verb-work'});
  const chain=v.slice(0,3).join(' — '),prompt=el('div',{class:'verb-prompt'},h.picEl(v[4],v[3]),el('div',{class:'stack'},el('span',{class:'eyebrow'},q.retry?'ВОЗВРАЩАЕМСЯ К СЛОЖНОМУ':'МАСТЕРСКАЯ ГЛАГОЛОВ'),mode==='verbdictation'?null:el('strong',{class:'verb-base',lang:'en'},v[0]),el('span',null,v[3])));
  const nextBtn=el('button',{type:'button',class:'main',textContent:'Следующее задание →',hidden:true,on:{click:()=>{if(!done)return;i++;c.progress(i,rounds.length);next()}}});
  const hint=el('button',{type:'button',class:'ghost',textContent:'Напомнить формы',on:{click:()=>{if(done||assisted)return;assisted=true;hint.disabled=true;note.textContent=chain+' · Это подсказка. Позже попробуем без неё.'}}});
  function result(values){
   if(done||!alive())return;
   const ks=mode==='verbrecall'?[1,2]:[k],checks=ks.map((kk,j)=>isCorrect(v,kk,values[j])),ok=checks.every(Boolean);
   const attempt=values.map(normal).join('|');if(!tried.has(attempt)){ks.forEach((kk,j)=>review.record(v,kk,checks[j],assisted||corrected));tried.add(attempt)}
   if(!graded&&!q.retry){if(!ok)mistakes++;else if(assisted)assists++;else correct++}graded=true;
   if((!ok||assisted)&&!q.retry&&!queued){rounds.splice(Math.min(rounds.length,i+3),0,{...q,retry:true});queued=true}
   h.tone(ok);hint.disabled=true;note.classList.remove('positive','correction');note.classList.add(ok?'positive':'correction');
   note.replaceChildren(el('b',null,ok?(assisted||corrected?'Верно после разбора.':'Верно!'):'Разберём и исправим.'),el('span',{lang:'en',class:'verb-chain'},chain),el('span',null,ok?'Сравни формы и произнеси их вслух.':explanation(v,ks[checks.indexOf(false)],values[checks.indexOf(false)])+' Исправь свой ответ и проверь ещё раз.'));
   if(!ok){corrected=true;return}
   done=true;area.querySelectorAll('button,input').forEach(n=>n.disabled=true);
   h.speak(chain.replace(/ — /g,', '));nextBtn.hidden=false;nextBtn.focus();
  }
  if(mode==='verbcontrast'){
   area.append(el('p',{class:'verb-task'},'Выбери: '+formLabel(k)),el('div',{class:'verb-options'},options(v,k,h.shuffle).map(text=>el('button',{type:'button',class:'verb-option',lang:'en',textContent:text,on:{click:e=>{if(done)return;selected=text;area.querySelectorAll('.verb-option').forEach(b=>b.setAttribute('aria-pressed',String(b===e.currentTarget)));submit.disabled=false}}}))));
   const submit=el('button',{type:'button',class:'main',textContent:'Проверить',disabled:true,on:{click:()=>{if(selected!==null)result([selected])}}});area.append(submit);
  }else if(mode==='verbedit'){
   const shown=v.slice(0,3).map(s=>s.split('/')[0]);shown[k]=wrongForms(v,k,1)[0];let chosen=-1;
   const input=el('input',{ariaLabel:'Исправленная форма',autocomplete:'off',autocapitalize:'none',spellcheck:false,disabled:true});
   const submit=el('button',{type:'submit',class:'main',textContent:'Проверить исправление',disabled:true});
   area.append(el('p',{class:'verb-task'},'В цепочке одна ошибка. Выбери неверную форму и исправь её.'),el('div',{class:'verb-edit-chain'},shown.map((s,j)=>el('button',{class:'verb-edit-token',type:'button',lang:'en',textContent:s,on:{click:e=>{if(done)return;chosen=j;area.querySelectorAll('.verb-edit-token').forEach(b=>b.setAttribute('aria-pressed',String(b===e.currentTarget)));input.disabled=false;input.value=s;submit.disabled=false;input.focus();input.select()}}}))),el('form',{class:'verb-inputs',on:{submit:e=>{e.preventDefault();if(done||!normal(input.value))return;if(chosen!==k){result([shown[k]]);return}result([input.value])}}},el('label',null,'Исправленный вариант',input),submit));
  }else if(mode==='verbrecall'){
   const inputs=[1,2].map(kk=>el('input',{ariaLabel:formLabel(kk),autocomplete:'off',autocapitalize:'none',spellcheck:false,placeholder:kk===1?'Вторая форма':'Третья форма'}));
   const submit=el('button',{type:'submit',class:'main',textContent:'Проверить обе формы',disabled:true});inputs.forEach(n=>n.addEventListener('input',()=>submit.disabled=inputs.some(x=>!normal(x.value))));
   area.append(el('p',{class:'verb-task'},'Вспомни обе формы без вариантов ответа.'),el('form',{class:'verb-inputs',on:{submit:e=>{e.preventDefault();if(inputs.every(n=>normal(n.value)))result(inputs.map(n=>n.value))}}},inputs.map((n,j)=>el('label',null,formLabel(j+1),n)),submit));
  }else if(mode==='verbdictation'){
   let heard=false;
   const input=el('input',{ariaLabel:'Услышанная форма',autocomplete:'off',autocapitalize:'none',spellcheck:false,placeholder:'Запиши услышанную форму'});
   const submit=el('button',{type:'submit',class:'main',textContent:'Проверить',disabled:true});
   const listen=el('button',{type:'button',class:'say',textContent:'Послушать форму',on:{click:()=>{if(done)return;if(h.speakForm(v[0],k)!==false){heard=true;submit.disabled=!normal(input.value);input.focus()}else note.textContent='Запись недоступна. Попробуй послушать ещё раз.'}}});
   input.addEventListener('input',()=>submit.disabled=!heard||!normal(input.value));
   area.append(el('p',{class:'verb-task'},'Мини-диктант: '+formLabel(k)),listen,el('p',{class:'muted small'},'Запиши одну из услышанных форм. Здесь нет таймера.'),el('form',{class:'verb-inputs',on:{submit:e=>{e.preventDefault();if(heard&&normal(input.value))result([input.value])}}},input,submit));
  }
  c.stage.replaceChildren(el('p',{class:'muted small'},'Вопрос '+(i+1)+' из '+rounds.length),prompt,area,hint,note,nextBtn);
 }
 next();
}
const api={STEPS,CONFUSIONS,accepted,isCorrect,wrongForms,options,explanation,createReview,deck,play};
global.NotebookVerbs=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
