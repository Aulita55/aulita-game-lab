export const routes = {
 preschool:{label:'Дошкольники',hero:'tima-3d.png',name:'Корзинки Тима',skill:'Количество от 1 до 3',id:'P01',limit:0,count:5,example:3},
 school:{label:'Школьники',hero:'felix-3d.png',name:'Мастерская Феликса',skill:'Прибавляем 9 через десяток',id:'S04',limit:20,count:8,example:46},
 adult:{label:'Взрослые',hero:'lily-3d.png',name:'Покупки с Лили',skill:'Округляем и возвращаем лишнее',id:'A02',limit:15,count:10,example:198}
};
export function shuffle(a,rng=Math.random){return a.map(v=>({v,r:rng()})).sort((a,b)=>a.r-b.r).map(x=>x.v)}
export function tasks(route,repeat=false){
 if(route==='preschool')return (repeat?shuffle([1,2,2,3,3]):[2,1,3,2,3]).map(a=>({a,b:0,answer:a,options:shuffle([1,2,3])}));
 if(route==='school')return (repeat?shuffle([24,36,48,57,65,73,81,18]):[26,34,47,58,63,75,82,16]).map(a=>({a,b:9,answer:a+9}));
 return (repeat?shuffle([[99,32],[198,56],[299,44],[397,28],[498,65],[199,63],[297,72],[398,85],[599,34],[698,43]]):[[98,36],[199,54],[297,45],[398,27],[499,63],[197,68],[298,74],[399,86],[598,35],[697,42]]).map(([a,b])=>({a,b,answer:a+b}));
}
export function explanation(route,q){
 if(route==='preschool')return ['Коснись каждого яблока и посчитай по порядку.','Один. Два. Три. Каждое яблоко считаем один раз.','Теперь найди корзинку с нужным количеством.'];
 const round=route==='school'?q.a+10:Math.ceil(q.a/100)*100;
 const extra=route==='school'?1:round-q.a;
 return route==='school'?[`${q.a} + 9: заменим 9 удобным числом 10.`,`${q.a} + 10 = ${round}. Мы добавили одну лишнюю единицу.`,`${round} − 1 = ${q.answer}. Убираем лишнее — получаем точный ответ.`]:[`${q.a} + ${q.b}: округлим ${q.a} до ${round}. Временно добавим ${extra}.`,`${round} + ${q.b} = ${round+q.b}. Теперь вернём лишние ${extra}.`,`${round+q.b} − ${extra} = ${q.answer}. Это точная сумма покупок.`];
}
export function createRun(route,practice=false,repeat=false){return {route,practice,questions:tasks(route,repeat),index:0,score:0,lives:3,answers:[],locked:false,done:false};}
export function answer(run,value,assisted=false,seconds=0){
 if(run.done||run.locked)return null;
 const q=run.questions[run.index],correct=value===q.answer;
 run.locked=true;
 if(!run.practice){run.score=Math.max(0,run.score+(correct?10:-5));if(!correct)run.lives--;}
 const record={...q,value,correct,assisted,seconds};run.answers.push(record);return record;
}
export function advance(run){if(!run.locked||run.done)return;run.index++;run.done=run.index===run.questions.length||run.lives===0;run.locked=false;}
export function summary(run){const independent=run.answers.filter(a=>!a.assisted);return {correct:run.answers.filter(a=>a.correct).length,total:run.questions.length,accuracy:independent.length?Math.round(independent.filter(a=>a.correct).length/independent.length*100):null,hints:run.answers.filter(a=>a.assisted).length,completed:run.done&&run.lives>0,score:run.score};}
