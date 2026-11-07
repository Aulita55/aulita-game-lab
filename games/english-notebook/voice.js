/* Recorded British English; verb forms are selected by form ID, not ambiguous spelling. */
(function(global){'use strict';
function normalise(s){return String(s||'').replace(/[’‘]/g,"'").replace(/[—–]/g,',').replace(/\s*([,?!])\s*/g,'$1 ').replace(/\s+/g,' ').trim().replace(/\.+$/,'').toLowerCase().replace(/\bfavorite\b/g,'favourite').replace(/\bcolor\b/g,'colour').replace(/\bgray\b/g,'grey')}
function resolve(m,key,seen=new Set()){key=normalise(key);if(m.clips[key])return[key];if(seen.has(key)||!m.aliases?.[key])return[];seen.add(key);return m.aliases[key].flatMap(k=>resolve(m,k,new Set(seen)))}
function createPlayer({manifest,makeAudio,timers=global,onState=()=>{},onError=()=>{}}){
 let audio,pack=-1,version=0,turn=0,poll,timeout;
 function clear(){timers.clearInterval(poll);timers.clearTimeout(timeout);poll=timeout=null}
 function pause(){clear();if(audio){audio.pause();audio.onloadedmetadata=audio.onplaying=audio.ontimeupdate=audio.onerror=audio.onended=null}}
 function stop(){version++;turn++;pause();onState('stopped')}
 function play(text){stop();const queue=resolve(manifest,text);if(!queue.length)return false;const run=version;let i=0;
  function next(){if(run!==version)return;if(i>=queue.length){stop();return}pause();const token=++turn,[p,start,length]=manifest.clips[queue[i]],end=start+length;let ending=false;audio=audio||makeAudio();const current=()=>run===version&&token===turn;
   function fail(e){if(!current())return;pack=-1;stop();onError(e)}
   function seek(){if(!current()||audio.readyState===0)return;try{audio.currentTime=start}catch(e){if(audio.readyState>=1)fail(e)}}
   function finish(){if(!current()||ending)return;ending=true;pause();i++;timeout=timers.setTimeout(next,90)}
   function watch(){if(current()&&audio.currentTime>=end-.025)finish()}
   audio.onloadedmetadata=seek;audio.onplaying=()=>{if(!current())return;clear();poll=timers.setInterval(watch,30);timeout=timers.setTimeout(watch,Math.max(0,(end-audio.currentTime)*1000));onState('playing',queue[i])};audio.ontimeupdate=watch;audio.onended=finish;audio.onerror=()=>fail(new Error('Audio load failed'));
   if(pack!==p){pack=p;audio.preload='metadata';audio.src='audio/'+manifest.packs[p].file}seek();onState('loading',queue[i]);try{const promise=audio.play();if(promise?.catch)promise.catch(fail)}catch(e){fail(e)}
  }
  next();return true;
 }
 return{play,stop,has:text=>resolve(manifest,text).length>0,get audio(){return audio}};
}
let player;
function available(){return !!global.NotebookVoiceManifest&&typeof global.Audio==='function'}
function stop(){player?.stop();try{global.speechSynthesis?.cancel()}catch(e){}}
function status(text){const n=global.document?.getElementById('voice-status');if(n){n.textContent=text;n.hidden=!text}}
function getPlayer(){if(!player)player=createPlayer({manifest:global.NotebookVoiceManifest,makeAudio:()=>{const a=new global.Audio();a.id='notebook-voice';a.hidden=true;global.document?.body?.append(a);return a},onState:(s,key)=>{if(global.document){global.document.documentElement.dataset.voiceState=s;if(key)global.document.documentElement.dataset.voiceClip=key}if(s==='loading')status('')},onError:()=>status('Не удалось загрузить озвучку. Проверь интернет и нажми на картинку ещё раз.')});return player}
function fallback(text){if(!global.speechSynthesis||!global.SpeechSynthesisUtterance)return false;const voices=global.speechSynthesis.getVoices?.()||[],candidates=voices.filter(v=>String(v.lang).toLowerCase()==='en-gb');const rank=v=>/natural|premium|neural|enhanced/i.test(v.name)?2:/google|microsoft/i.test(v.name)?1:0;candidates.sort((a,b)=>rank(b)-rank(a));const u=new global.SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=.88;if(candidates[0])u.voice=candidates[0];global.speechSynthesis.speak(u);return true}
function speak(text){stop();if(available()&&getPlayer().play(text))return true;status('Для этой новой фразы пока используется голос устройства.');return fallback(text)}
function speakForm(base,index){stop();const id=global.NotebookVoiceManifest?.forms?.[base]?.[index];if(available()&&id)return getPlayer().play(id);status('Запись этой формы сейчас недоступна. Попробуй загрузить страницу ещё раз.');return false}
if(global.document)global.document.addEventListener('visibilitychange',()=>{if(global.document.hidden)stop()});
const api={normalise,resolve,createPlayer,available,speak,speakForm,stop};global.NotebookVoice=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
