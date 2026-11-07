/* Browser recording and transcript practice. No API keys or application uploads. */
(function(global){
'use strict';
const COLOURS=['red','blue','green','yellow','orange','purple','pink','black','white','brown','grey'];
const ANIMALS={cat:['cats','small','grey'],dog:['dogs','small','brown'],bird:['birds','small','blue'],fish:['fish','small','orange'],horse:['horses','big','brown'],cow:['cows','big','white'],sheep:['sheep','small','white'],duck:['ducks','small','green'],frog:['frogs','small','green'],rabbit:['rabbits','small','white'],mouse:['mice','small','grey'],elephant:['elephants','big','grey'],bear:['bears','big','brown'],lion:['lions','big','brown'],tiger:['tigers','big','orange'],zebra:['zebras','big','white'],goat:['goats','small','white'],hippo:['hippos','big','grey'],monkey:['monkeys','small','brown'],penguin:['penguins','small','black'],snake:['snakes','small','green'],whale:['whales','big','blue'],fox:['foxes','small','orange'],kangaroo:['kangaroos','big','brown'],octopus:['octopuses','small','orange'],vulture:['vultures','big','brown']};
function topicKind(t){return /colou?rs/i.test(t.title)?'colours':/animals/i.test(t.title)?'animals':null}
function supportsTopic(t){return !!topicKind(t)}
function modes(kind){return kind==='colours'?[['favorite','Любимый цвет'],['like','Мне нравится'],['dislike','Мне не нравится']]:[['favorite','Любимое животное'],['identify','Что это за животное?'],['size','Большой или маленький'],['color','Какого цвета?'],['like','Мне нравится'],['dislike','Мне не нравится']]}
function model(kind,mode,word,detail){
 const article=/^[aeiou]/i.test(word)?'an ':'a ';const a=ANIMALS[word]||[word+'s','small','brown'];
 if(kind==='colours')return mode==='favorite'?{question:'What is your favorite color?',answer:'My favorite color is '+word+'.'}:mode==='like'?{question:'What color do you like?',answer:'I like '+word+'.'}:{question:"What color don't you like?",answer:"I don't like "+word+'.'};
 if(mode==='favorite')return{question:'What is your favorite animal?',answer:'My favorite animal is '+article+word+'.'};
 if(mode==='identify')return{question:'What animal is it?',answer:'It is '+article+word+'.'};
 if(mode==='size')return{question:'Is this animal big or small?',answer:'This animal is '+(detail||a[1])+'.'};
 if(mode==='color')return{question:'What color is the '+word+'?',answer:'The '+word+' is '+(detail||a[2])+'.'};
 return mode==='like'?{question:'What animals do you like?',answer:'I like '+a[0]+'.'}:{question:"What animals don't you like?",answer:"I don't like "+a[0]+'.'};
}
function normalise(s){return String(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/\bdon'?t\b/g,'do not').replace(/\bit'?s\b/g,'it is').replace(/\bfavourite\b/g,'favorite').replace(/\bcolour\b/g,'color').replace(/\bgray\b/g,'grey').replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim()}
function assess(alternatives,expected){const found=alternatives.find(s=>normalise(s)===normalise(expected));return{ok:found!==undefined,heard:found||alternatives[0]||'',expected}}
function recordingDB(){return new Promise((resolve,reject)=>{if(!global.indexedDB){reject(new Error('unavailable'));return}const req=indexedDB.open('aulita-notebook-speaking',1);req.onupgradeneeded=()=>req.result.createObjectStore('latest',{keyPath:'topic'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function saveRecording(record){const db=await recordingDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction('latest','readwrite');tx.objectStore('latest').put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}}
async function loadRecording(topic){const db=await recordingDB();try{return await new Promise((resolve,reject)=>{const req=db.transaction('latest','readonly').objectStore('latest').get(topic);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}finally{db.close()}}
function play(t,c,h,options={}){
 const {el,speak,canSpeak,picEl,tone}=h,kind=topicKind(t),Recognition=global.SpeechRecognition||global.webkitSpeechRecognition;
 const words=options.fixed?[[options.fixed.word||'scene',options.context||'Ситуация','']]:(t.words||[]).filter(w=>kind==='colours'?COLOURS.includes(w[0]):!!ANIMALS[w[0]]);
 if(!words.length){c.stage.replaceChildren(el('p',null,'Для этой темы пока нет речевых моделей.'));return}
 let closed=false,current=null,url=null,version=0;const completed=new Set();let hinted=!options.hideHint;const goal=options.goal||5;
 const mode=el('select',{ariaLabel:'Модель фразы'},modes(kind).map(([value,label])=>el('option',{value,textContent:label})));
 const word=el('select',{ariaLabel:kind==='colours'?'Выбери цвет':'Выбери животное'},words.map(w=>el('option',{value:w[0],textContent:w[0]+' — '+w[1]})));
 const detail=el('select',{ariaLabel:'Описание'}),detailLabel=el('label',null,'Описание',detail);
 const question=el('p',{class:'speech-question',lang:'en'}),answer=el('p',{class:'speech-answer',lang:'en'}),preview=el('div',{class:'speech-preview'});
 const feedback=el('p',{class:'speech-feedback',role:'status',ariaLive:'polite'},options.picture?'Рассмотри фото. Запиши одну фразу о ситуации, затем останови запись.':'Выбери ответ. Послушай образец и запиши свою фразу.');
 const count=el('p',{class:'speech-count'},'Разных фраз: 0 из 5');
 const player=el('div',{class:'speech-recording',hidden:true}),playerCaption=el('p',{class:'hint'}),audio=el('audio',{controls:true,class:'speech-player',ariaLabel:'Моя последняя запись'}),download=el('a',{class:'btn',textContent:'Скачать запись'});
 player.append(playerCaption,audio,download);
 const storageNote=el('p',{class:'hint'},'Последняя запись этой темы сохраняется в этом браузере.');
 const listen=el('button',{type:'button',textContent:'Послушать вопрос',disabled:!canSpeak(),on:{click:()=>speak(target().question)}});
 const sample=el('button',{type:'button',textContent:'Послушать ответ',disabled:!canSpeak(),on:{click:()=>{hinted=true;speak(target().answer)}}});
 const hint=el('button',{class:'ghost',type:'button',textContent:'Скрыть подсказку',on:{click:()=>{answer.hidden=!answer.hidden;if(!answer.hidden)hinted=true;hint.textContent=answer.hidden?'Показать подсказку':'Скрыть подсказку'}}});
 const mic=el('button',{class:'main speech-mic',type:'button',ariaLabel:'Записать фразу',on:{click:()=>current?stop(current):begin()}});
 const micIcon=el('span',{ariaHidden:'true'});micIcon.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 15a4 4 0 0 0 4-4V5a4 4 0 0 0-8 0v6a4 4 0 0 0 4 4zm7-4h-2a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21H8v2h8v-2h-3v-3.07A7 7 0 0 0 19 11z"/></svg>';
 const micText=el('span',null,'Записать фразу');mic.append(micIcon,micText);
 const mediaAvailable=!!(global.isSecureContext&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&global.MediaRecorder);
 if(!mediaAvailable){mic.disabled=true;feedback.textContent='Запись недоступна в этом браузере. Откройте страницу по HTTPS в браузере с поддержкой микрофона.'}
 const autoNotice=el('p',{class:'hint'},Recognition?'Автопроверка поддерживает простые фразы по условию, без оценки акцента. Для распознавания браузер может передавать речь своей службе.':'В этом браузере автопроверка недоступна. Можно записать и прослушать себя.');
 function target(){return options.fixed||model(kind,mode.value,word.value,detail.value)}
 function setBusy(b){[mode,word,detail,hint].forEach(n=>n.disabled=b);listen.disabled=sample.disabled=b||!canSpeak();mic.disabled=!mediaAvailable;mic.classList.toggle('recording',b);micText.textContent=b?'Остановить запись':'Записать фразу';mic.ariaLabel=micText.textContent}
 function paint(resetDetail=true){
  const m=target();question.textContent=m.question;answer.textContent=m.answer;
  detailLabel.hidden=!(mode.value==='size'||mode.value==='color');
  if(resetDetail){const opts=mode.value==='size'?['big','small']:COLOURS;detail.replaceChildren(...opts.map(v=>el('option',{value:v,textContent:v})));const a=ANIMALS[word.value];if(a)detail.value=mode.value==='size'?a[1]:a[2];question.textContent=target().question;answer.textContent=target().answer}
  const w=options.fixed?words.find(w=>w[0]===options.fixed.word)||words[0]:words.find(w=>w[0]===word.value);preview.replaceChildren(options.picture?options.picture():picEl(w[2],w[0]));
 }
 for(const select of [mode,word])select.addEventListener('change',()=>{version++;paint();feedback.className='speech-feedback';feedback.textContent='Произнеси фразу целиком.'});detail.addEventListener('change',()=>{version++;paint(false)});
 function stopTracks(s){if(s.stream)s.stream.getTracks().forEach(track=>track.stop())}
 function release(){if(url){URL.revokeObjectURL(url);url=null}}
 function showRecording(record,saved){release();url=URL.createObjectURL(record.blob);audio.src=url;download.href=url;download.download='aulita-speaking-'+t.id+(record.blob.type.includes('mp4')?'.m4a':'.webm');playerCaption.textContent='Моя запись'+(record.transcript?' · '+record.transcript:'');player.hidden=false;storageNote.textContent=saved?'Последняя запись этой темы сохранена в этом браузере.':'Запись доступна до выхода из задания. Её можно скачать.'}
 function sayFeedback(text,kind){feedback.textContent=text;feedback.className='speech-feedback'+(kind?' '+kind:'')}
 async function finalise(s){
  if(s.finalised||s.cancelled||!s.blobReady||!s.ended)return;s.finalised=true;clearTimeout(s.timer);clearTimeout(s.endTimer);stopTracks(s);
  if(current!==s||closed||!c.alive())return;current=null;setBusy(false);
  const allowed=options.fixed&&options.fixed.answers||[s.phrase];const checks=allowed.map(expected=>assess(s.alternatives,expected));const result=options.assess?options.assess(s.alternatives):(checks.find(r=>r.ok)||checks[0]);
  if(s.blob&&s.blob.size){const record={topic:t.id,blob:s.blob,phrase:result.expected,transcript:result.heard,created:Date.now()};showRecording(record,false);const v=version;try{await saveRecording(record);if(!closed&&c.alive()&&v===version)storageNote.textContent='Последняя запись этой темы сохранена в этом браузере.'}catch(e){}}
  if(closed||!c.alive()||version!==s.version)return;
  if(!Recognition){sayFeedback('Запись готова. Прослушай себя и сравни с образцом.');return}
  if(s.error){const messages={'not-allowed':'Доступ к микрофону или распознаванию запрещён. Проверь разрешения браузера.','service-not-allowed':'Служба распознавания недоступна в этом браузере.','audio-capture':'Микрофон недоступен. Проверь подключение.','network':'Не удалось связаться со службой распознавания. Запись можно прослушать; попробуй ещё раз.','no-speech':'Речь не распознана. Попробуй ещё раз, чуть ближе к микрофону.','language-not-supported':'Распознавание английского недоступно в этом браузере.'};sayFeedback(messages[s.error]||'Автопроверка сейчас недоступна. Прослушай запись и попробуй ещё раз.');return}
  if(!result.heard){sayFeedback('Не удалось распознать фразу. Попробуй произнести её ещё раз.');return}
  if(!s.blob||!s.blob.size){sayFeedback('Не удалось сохранить звук. Попробуй записать ещё раз.');return}
  if(options.onAttempt)options.onAttempt({ok:result.ok,heard:result.heard,expected:result.expected,assisted:hinted,uncertain:!!result.uncertain});
  if(result.ok&&options.onSuccess){if(options.review){tone(true);sayFeedback('Описание принято! Я услышал: '+result.heard+'\nМожно прослушать свою запись и перейти дальше.','ok');nextPhoto.hidden=false;mic.disabled=true;return}dispose();options.onSuccess();return}
  if(result.ok){completed.add(normalise(s.phrase));tone(true);c.progress(completed.size,goal);count.textContent='Разных фраз: '+completed.size+' из '+goal;sayFeedback('Фраза совпала!\nЯ услышал: '+result.heard,'ok');if(completed.size>=goal){done.hidden=false;mic.disabled=true}}
  else if(result.uncertain)sayFeedback('Я услышал: '+result.heard+'\nНе могу уверенно проверить это описание. Попробуй одну простую фразу по условию или открой образец.','retry');
  else sayFeedback('Я услышал: '+result.heard+'\nОбразец: '+s.phrase+'\nПослушай образец и попробуй ещё раз.','retry');
 }
 function stop(s,cancel=false){
  if(s.cancelled||s.stopping)return;s.stopping=true;s.cancelled=cancel;clearTimeout(s.timer);
  if(s.recorder&&s.recorder.state!=='inactive')try{s.recorder.stop()}catch(e){s.blobReady=true}
  stopTracks(s);
  if(s.recognition){try{cancel?s.recognition.abort():s.recognition.stop()}catch(e){s.ended=true}}else s.ended=true;
  s.endTimer=setTimeout(()=>{s.ended=true;finalise(s)},2500);finalise(s);
 }
 async function begin(){
  if(current||closed||!c.alive())return;version++;const s={version,phrase:target().answer,alternatives:[],chunks:[],stream:null,recorder:null,recognition:null,stopping:false,cancelled:false,ended:!Recognition,blobReady:false,finalised:false};current=s;setBusy(true);mic.disabled=true;
  sayFeedback('Разреши доступ к микрофону, если браузер спросит.');try{if(global.NotebookVoice)global.NotebookVoice.stop();else if(global.speechSynthesis)speechSynthesis.cancel();audio.pause();const stream=await navigator.mediaDevices.getUserMedia({audio:true});s.stream=stream;
   if(closed||!c.alive()||current!==s||s.cancelled){stopTracks(s);return}
   const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(m=>MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported(m));s.recorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
   s.recorder.ondataavailable=e=>{if(e.data&&e.data.size)s.chunks.push(e.data)};
   s.recorder.onstop=()=>{s.blob=new Blob(s.chunks,{type:s.recorder.mimeType||'audio/webm'});s.blobReady=true;finalise(s)};
   s.recorder.onerror=()=>{s.error='audio-capture';s.ended=true;stop(s)};s.recorder.start();
   if(Recognition){s.recognition=new Recognition();s.recognition.lang='en-GB';s.recognition.interimResults=false;s.recognition.maxAlternatives=3;s.recognition.continuous=!!options.continuous;
    s.recognition.onresult=e=>{if(options.continuous){const segments=Array.from(e.results,r=>Array.from(r,a=>a.transcript));let combinations=[''];for(const seg of segments)combinations=combinations.flatMap(a=>seg.map(b=>(a+' '+b).trim())).slice(0,27);s.alternatives=combinations}else for(let i=e.resultIndex||0;i<e.results.length;i++)for(let j=0;j<e.results[i].length;j++)s.alternatives.push(e.results[i][j].transcript)};
    s.recognition.onerror=e=>{s.error=e.error};s.recognition.onend=()=>{s.ended=true;stop(s);finalise(s)};
    try{s.recognition.start()}catch(e){s.error='service-not-allowed';s.ended=true}
   }
   mic.disabled=false;sayFeedback('Микрофон включён. Произнеси фразу.');s.timer=setTimeout(()=>stop(s),options.continuous?30000:15000);
  }catch(e){stopTracks(s);if(current===s){current=null;setBusy(false);sayFeedback(e.name==='NotAllowedError'?'Доступ к микрофону запрещён. Разреши его в настройках сайта.':e.name==='NotFoundError'?'Микрофон не найден. Подключи его и попробуй ещё раз.':'Не удалось включить запись. Попробуй ещё раз.')}}
 }
 const nextPhoto=el('button',{type:'button',class:'main',hidden:true,textContent:'Следующая ситуация',on:{click:()=>{dispose();if(options.onSuccess)options.onSuccess()}}});
 const done=el('button',{class:'main',type:'button',hidden:true,textContent:'Завершить тренировку',on:{click:()=>{dispose();c.finish(3,'Распознаны 5 разных фраз. Продолжай тренироваться!')}}});
 function hidden(){if(document.hidden&&current)stop(current)}
 function dispose(){if(closed)return;closed=true;version++;if(current){const s=current;s.cancelled=true;clearTimeout(s.timer);clearTimeout(s.endTimer);try{if(s.recognition)s.recognition.abort()}catch(e){}try{if(s.recorder&&s.recorder.state!=='inactive')s.recorder.stop()}catch(e){}stopTracks(s);current=null}release();try{audio.pause()}catch(e){}document.removeEventListener('visibilitychange',hidden)}
 c.onCleanup(dispose);document.addEventListener('visibilitychange',hidden);paint();
 const chooser=el('div',{class:'speech-controls'},el('label',null,'Что тренируем',mode),el('label',null,kind==='colours'?'Цвет':'Животное',word),detailLabel);chooser.hidden=!!options.fixed;answer.hidden=!!options.hideHint;hint.textContent=answer.hidden?'Показать подсказку':'Скрыть подсказку';count.hidden=!!options.fixed;storageNote.hidden=!!options.fixed;
 c.stage.replaceChildren(chooser,el('section',{class:'speech-card'+(options.picture?' photo-description':'')},question,options.context?el('p',{class:'scene-context'},options.context):null,preview,el('div',{class:'row'},listen,sample),answer,hint,mic,feedback,count,player,storageNote,autoNotice,nextPhoto,done));
 const restoreVersion=version;if(!options.fixed)loadRecording(t.id).then(record=>{if(record&&!closed&&c.alive()&&version===restoreVersion&&!current)showRecording(record,true)}).catch(()=>{});
}
const api={supportsTopic,topicKind,modes,model,normalise,assess,play};global.NotebookSpeech=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
