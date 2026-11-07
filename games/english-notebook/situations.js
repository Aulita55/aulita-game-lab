/* Photo activities use lesson language. Speech checks supported sentence models, not accent. */
(function(global){
'use strict';
const norm=s=>String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/\b(he|she|it)'s\b/g,'$1 is').replace(/\bthey're\b/g,'they are').replace(/\bwe're\b/g,'we are').replace(/\bdon't\b/g,'do not').replace(/\bdoesn't\b/g,'does not').replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();
function supports(t){return t&&['b-own-it-1','b-irregular-verbs'].includes(t.bookId)}
function catalog(){return global.NotebookPhotos||{verbs:[],own:[]}}
function resolve(data,t,em,alt){
 if(!supports(t))return null;const cats=catalog(),a=String(alt||''),cue=String(em||'');
 if(t.bookId==='b-irregular-verbs')return cats.verbs.find(v=>[v.base,v.ru,v.en,v.context].includes(a))||cats.verbs.find(v=>v.cue===cue)||null;
 if(/^freq:\d+$/.test(cue))return null;
 const exact=(t.words||[]).concat(t.sentences||[],t.spell||[]).find(w=>w[0]===a||w[1]===a);const e=exact?exact[2]:cue;
 if(e.includes('🎵')||e.includes('🎶'))return cats.own.find(v=>v.cue==='🎧');
 if(e.includes('🚲'))return cats.own.find(v=>v.cue==='🚴');
 if(/Where.*(?:you go|ты ид)/i.test(a))return cats.own.find(v=>v.cue==='🏠');
 if(e.includes('🛏'))return cats.own.find(v=>v.cue==='🛌');
 if(e.includes('🦷'))return cats.own.find(v=>v.cue==='teeth');
 if(/late|опазд/i.test(a))return cats.own.find(v=>v.cue==='late');
 if(/watch videos|смотрим видео/.test(a))return cats.own.find(v=>v.cue==='videos');
 if(/👥|👫/.test(e)&&/🎧/.test(e))return cats.own.find(v=>v.cue==='music-two');
 if(/👥|👫/.test(e)&&/🍳/.test(e))return cats.own.find(v=>v.cue==='breakfast-two');
 return cats.own.find(v=>e.includes(v.cue))||null;
}
function photo(v,el,alt){return el('span',{class:'pic realistic-photo',role:'img',ariaLabel:alt||v.context,style:'--photo:url("photos/'+v.sheet+'.webp");--cols:'+v.cols+';--rows:'+v.rows+';--x:'+(v.cell%v.cols)*100/(v.cols-1)+'%;--y:'+Math.floor(v.cell/v.cols)*100/(v.rows-1)+'%'})}
function picture(data,t,em,alt,el){const v=resolve(data,t,em,alt);if(!v)return null;const image=photo(v,el,alt);const cue=String(em||'');const badges=[];if(cue.includes('🚫'))badges.push('НЕ');if(cue.includes('❓'))badges.push('?');const f=cue.match(/freq:(\d+)/);if(f)badges.push(f[1]+'%');return badges.length?el('span',{class:'photo-with-badge'},image,el('span',{class:'photo-badge'},badges.join(' · '))):image}
function records(t){
 const cats=catalog();if(t.bookId==='b-irregular-verbs')return(t.verbs||[]).map(v=>cats.verbs.find(r=>r.base===v[0])).filter(Boolean);
 // Keep exact tense, polarity and frequency from the selected lesson.
 const seen=new Set();return(t.sentences||[]).map(s=>{const v=resolve(null,t,s[2],s[0]);return v?{...v,en:s[0],context:s[1]}:null}).filter(v=>{if(!v||seen.has(v.en))return false;seen.add(v.en);return true});
}
function answers(r){
 const list=[r.en];let s=r.en;const simple=s.replace(/\bis brushing\b/,'brushes').replace(/\bis checking\b/,'checks').replace(/\bis doing\b/,'does').replace(/\bis getting\b/,'gets').replace(/\bis going\b/,'goes').replace(/\bare going\b/,'go').replace(/\bis having\b/,'has').replace(/\bare having\b/,'have').replace(/\bis packing\b/,'packs').replace(/\bis waking\b/,'wakes').replace(/\bis chatting\b/,'chats').replace(/\bis downloading\b/,'downloads').replace(/\bis riding\b/,'rides').replace(/\bare hanging\b/,'hang').replace(/\bis listening\b/,'listens').replace(/\bare listening\b/,'listen').replace(/\bis making\b/,'makes').replace(/\bis playing\b/,'plays').replace(/\bare playing\b/,'play').replace(/\bis reading\b/,'reads').replace(/\bis taking\b/,'takes').replace(/\bis watching\b/,'watches').replace(/\bare watching\b/,'watch');list.push(simple);
 // Optional time adverbials do not alter the central action.
 list.push(s.replace(/^(Yesterday|Last week|Last night|This morning),?\s+/i,'').replace(/\s+(yesterday|last week|last night|this morning)[.!]?$/i,'.'));
 // Names in lesson situations may be described using a pronoun.
 if(/^(Nina|Laura|Evie|Anna|She|The girl|The woman)\b/.test(s))list.push(s.replace(/^(Nina|Laura|Evie|Anna|She|The girl|The woman)\b/,'She'),s.replace(/^(Nina|Laura|Evie|Anna|She|The girl|The woman)\b/,'The woman'));
 if(/^(Alex|Anton|Victor|He|The man|The boy|My brother)\b/.test(s))list.push(s.replace(/^(Alex|Anton|Victor|He|The man|The boy|My brother)\b/,'He'),s.replace(/^(Alex|Anton|Victor|He|The man|The boy|My brother)\b/,'The man'));
 return [...new Set(list.map(norm))].filter(Boolean);
}
function assess(alts,r){const allowed=answers(r),heard=alts.find(a=>allowed.includes(norm(a)));return{ok:heard!==undefined,heard:heard||alts[0]||'',expected:r.en,uncertain:heard===undefined}}
function evidence(t,key,ok,assisted=false){try{const k='ee-contexts-v1:'+t.id;const all=JSON.parse(localStorage.getItem(k)||'{}');const a=all[key]||{attempts:0,correct:0,assisted:0};a.attempts++;if(ok)a.correct++;if(assisted)a.assisted++;all[key]=a;localStorage.setItem(k,JSON.stringify(all))}catch(e){}}
function play(key,t,c,h){
 const {el,speak,canSpeak,tone,shuffle,assemble}=h,src=records(t);if(!src.length){c.stage.replaceChildren(el('p',null,'Для этой темы пока нет ситуаций.'));return}
 const voiceSrc=key==='scenespeech'&&t.bookId==='b-own-it-1'?src.map(r=>catalog().own.find(p=>p.sheet===r.sheet&&p.cell===r.cell)||r):src;
 const unique=[...new Map(voiceSrc.map(r=>[key==='scenespeech'?r.sheet+':'+r.cell:r.en,r])).values()];
 const rounds=shuffle(unique).slice(0,5);let i=0,errors=0;
 if(key==='scenebuild'){assemble(c,rounds,r=>({tokens:r.en.split(/\s+/),ask:el('span',{class:'scene-prompt'},photo(r,el),el('span',{class:'scene-context'},r.context)),say:r.en,audio:false}),'Опиши ситуацию по условию');return}
 function next(){
  if(!c.alive())return;if(i>=rounds.length){c.finish(errors?2:3,'Ситуаций: '+rounds.length+'. Ошибочных проверок: '+errors);return}const r=rounds[i];
  if(key==='scenespeech'){
   global.NotebookSpeech.play(t,c,h,{fixed:{word:r.base||r.en,question:'Describe the situation in one sentence.',answer:r.en},picture:()=>photo(r,el),context:r.context,continuous:true,review:true,hideHint:true,goal:1,assess:alts=>assess(alts,r),onAttempt:a=>{evidence(t,key,a.ok,a.assisted);if(!a.ok&&!a.uncertain)errors++},onSuccess:()=>{i++;c.progress(i,rounds.length);next()}});return;
  }
  const pool=t.verbs?catalog().verbs:catalog().own;
  const others=shuffle(pool.filter(v=>v.sheet!==r.sheet||v.cell!==r.cell)).filter((v,j,a)=>a.findIndex(w=>w.sheet===v.sheet&&w.cell===v.cell)===j).slice(0,3);
  const options=shuffle([r,...others]);let selected=null,locked=false;const tried=new Set();
  const feedback=el('p',{role:'status',ariaLive:'polite',class:'assembly-feedback'},'Выбери ответ, затем нажми «Проверить».');
  const check=el('button',{type:'button',class:'main',disabled:true,textContent:'Проверить',on:{click:()=>{if(locked||!selected)return;const ok=selected===r;if(!ok){if(!tried.has(selected)){errors++;evidence(t,key,false);tried.add(selected)}tone(false);feedback.textContent='Пока не совпало. Сравни с условием и выбери другой ответ.';return}locked=true;tone(true);evidence(t,key,true);feedback.textContent='Верно! '+r.en;buttons.forEach(b=>b.disabled=true);check.disabled=true;i++;c.progress(i,rounds.length);setTimeout(()=>{if(c.alive())next()},1400)}}});
  const buttons=options.map(o=>el('button',{type:'button',class:'scene-option',on:{click:e=>{if(locked)return;selected=o;buttons.forEach(b=>b.classList.remove('selected'));e.currentTarget.classList.add('selected');check.disabled=false;feedback.textContent='Нажми «Проверить», когда будешь готов.'}}},key==='scenelisten'?photo(o,el,'Вариант '+(options.indexOf(o)+1)):el('span',{lang:'en'},o.en)));
  const listen=el('button',{type:'button',class:'main',disabled:!canSpeak(),textContent:'Послушать описание',on:{click:()=>speak(r.en)}});
  c.stage.replaceChildren(el('p',{class:'hint'},(i+1)+' из '+rounds.length),key==='scenelisten'?el('div',{class:'stack'},el('p',null,'Послушай фразу и найди действие, о котором говорится.'),listen):el('div',{class:'scene-prompt'},photo(r,el),el('p',{class:'scene-context'},r.context)),el('div',{class:'scene-options '+(key==='scenelisten'?'photo-options':'')},buttons),check,feedback);
 }
 next();
}
const api={supports,resolve,picture,records,answers,assess,play};global.NotebookSituations=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
