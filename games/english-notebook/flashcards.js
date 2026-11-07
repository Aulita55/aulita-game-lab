/* One ordered introduction card at a time; self-rating is separate from a knowledge check. */
(function(global){'use strict';
function source(t){return t.verbs?.length?t.verbs:(t.words?.length?t.words:t.sentences?.length?t.sentences:(t.reading||[]).map(w=>[w[0],w[1],w[3]]))}
function queueFor(cards){const pending=cards.map((card,i)=>({card,id:i}));return{pending,total:pending.length,done:0,repeats:0,answer(known){if(!pending.length)return;if(known){pending.shift();this.done++}else{pending.push(pending.shift());this.repeats++}}}}
function play(t,c,h){const {el,picEl,speak,canSpeak}=h,verbs=!!t.verbs?.length,q=queueFor(source(t));
 function picture(w){let cue=verbs?w[4]:w[2],label=verbs?w[3]:w[0];if(!verbs&&/^freq:\d+$/.test(cue||'')){const example=(t.sentences||[]).find(s=>String(s[2]).includes(cue));if(example){cue=example[2];label=example[0]}}return picEl(cue||t.cover||'',label,t)}
 function next(){if(!c.alive())return;if(!q.pending.length){c.finish(3,'Знакомство завершено: '+q.total+' карточек. Отметок «Повторить»: '+q.repeats+'. Теперь потренируйся в других заданиях.');return}
  const w=q.pending[0].card,text=verbs?w.slice(0,3).join(' , ')+'. '+w[5]:w[0],ru=verbs?w[3]:w[1];
  const p=el('button',{type:'button',class:'learning-picture',ariaLabel:'Послушать: '+w[0],disabled:!canSpeak(),on:{click:()=>speak(text)}},picture(w));
  const body=[p,el('strong',{class:'learning-word',lang:'en'},w[0]),el('p',{class:'learning-translation'},ru)];
  if(verbs){const ipa=global.NotebookVerbPronunciations?.[w[0]]||[];body.push(el('p',{class:'learning-forms',lang:'en'},w.slice(0,3).join(' — ')),el('p',{class:'learning-ipa'},ipa.map(s=>'/'+s.replaceAll('/','/ или /')+'/').join(' · ')),el('div',{class:'form-speakers'},[0,1,2].map(i=>el('button',{type:'button',ariaLabel:'Послушать форму '+(i+1)+': '+w[i],disabled:!global.NotebookVoice?.available(),on:{click:()=>global.NotebookVoice?.speakForm(w[0],i)}},el('small',null,(i+1)+' форма'),el('span',{lang:'en'},w[i].replaceAll('/',' / '))))),el('p',{class:'verb-example',lang:'en'},w[5]),el('p',{class:'hint'},w[6]))}
  function choice(known){q.answer(known);c.progress(q.done,q.total);next()}
  const controls=el('div',{class:'learning-choices'},[[true,'Запомнил','happy'],[false,'Повторить','repeat']].map(([known,label,kind])=>el('button',{type:'button',class:'learning-choice '+kind,ariaLabel:label,on:{click:()=>choice(known)}},el('span',{class:'learning-cat '+kind,ariaHidden:'true'}),el('strong',null,label))));
  c.stage.replaceChildren(el('p',{class:'hint learning-count',ariaLive:'polite'},'Запомнил: '+q.done+' из '+q.total+' · осталось карточек: '+q.pending.length),el('section',{class:'learning-card'},body),controls,el('p',{class:'hint'},'Нажми на картинку, чтобы послушать ещё раз. Отмеченные карточки появятся снова.'));if(canSpeak())speak(text);
 }
 next();
}
const api={source,queueFor,play};global.NotebookFlashcards=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
