export const gameNames={count:'Найди группу',collect:'Собери заказ',odd:'Найди лишнее',memory:'Секретные окошки',relation:'Больше, меньше, равно',order:'Числовая дорожка',pattern:'Продолжи узор',detective:'Математический сыщик',equation:'Счётная мастерская',compose:'Состав числа',mix:'Карусель игр'};
const preGames=['count','collect','odd','memory','relation','order','compose','collect','equation','collect','compose','relation','equation','order','pattern','equation','memory','equation'];
const mathGames=['equation','relation','detective','memory','order','equation','collect','detective','equation','relation','order','equation','collect','detective','equation','relation','equation','memory','order','detective','relation','equation','memory','mix'];
export function gameFor(route,i){return (route==='preschool'?preGames:mathGames)[i];}
export const expr=q=>`${q.a} ${q.op} ${q.b}`;
const integer=(a,b,rng)=>a+Math.floor(rng()*(b-a+1));
function shuffle(a,rng){const r=[...a];for(let i=r.length-1;i>0;i--){const j=integer(0,i,rng);[r[i],r[j]]=[r[j],r[i]];}return r;}
function variants(target,max,rng,n=4){const options=new Set([target]);while(options.size<n)options.add(integer(0,Math.max(max,n),rng));return shuffle([...options],rng);}
export function decorate(base,l,route,rng,index,make){
 const game=l.game==='mix'?['relation','detective','memory','order','equation'][index%5]:l.game;
 const q={...base,mathAnswer:base.answer,baseKind:base.kind};
 if(game==='collect'){q.kind='collect';delete q.options;}
 if(game==='odd'){q.kind='odd';q.items=Array(6).fill(q.icon);q.answer=integer(0,5,rng);q.items[q.answer]='🌙';q.options=[0,1,2,3,4,5];}
 if(game==='relation'){
  q.kind='relation';
  if(route==='preschool'){q.left=integer(1,l.max,rng);q.right=integer(1,l.max,rng);q.leftText=String(q.left);q.rightText=String(q.right);}
  else{const rhs=rng()<.34?base:make();q.left=base.answer;q.right=rhs.answer;q.leftText=expr(base);q.rightText=expr(rhs);}
  q.answer=Math.sign(q.left-q.right);q.options=[-1,0,1];
 }
 if(game==='memory'){q.kind='memory';const max=route==='preschool'?l.max:q.op==='×'?Math.max(l.max*10,q.mathAnswer):Math.max(3,l.max);q.cards=variants(q.mathAnswer,max,rng);q.answer=q.cards.indexOf(q.mathAnswer);delete q.options;}
 if(game==='order'){
  q.kind='order';delete q.options;const items=[],seen=new Set();
  for(let tries=0;items.length<3&&tries<200;tries++){const p=route==='preschool'?{answer:integer(1,l.max,rng)}:make();if(seen.has(p.answer))continue;seen.add(p.answer);items.push({value:p.answer,label:route==='preschool'?String(p.answer):expr(p)});}
  if(items.length!==3)throw Error('Not enough distinct order values');q.items=shuffle(items,rng);q.answer=Math.max(...items.map(x=>x.value));
 }
 if(game==='detective'){q.kind='detective';q.items=Array.from({length:3},()=>{const p=make();return {...p,shown:p.answer};});q.answer=integer(0,2,rng);q.items[q.answer].shown++;q.options=[0,1,2];}
 if(game==='pattern'){
  q.kind='pattern';const icons=shuffle(['🔴','🟦','⭐','🟢'],rng),p=integer(0,2,rng);q.tiles=p===0?[icons[0],icons[1],icons[0],icons[1],icons[0]]:p===1?[icons[0],icons[0],icons[1],icons[0],icons[0]]:[icons[0],icons[1],icons[2],icons[0],icons[1]];const target=p<2?icons[1]:icons[2];q.patternOptions=shuffle(icons,rng);q.answer=q.patternOptions.indexOf(target);q.options=[0,1,2,3];
 }
 return q;
}
export function orderChoice(q,index,selected=[]){const sorted=[...q.items].sort((a,b)=>a.value-b.value);return Number.isInteger(index)&&!selected.includes(index)&&q.items[index]?.value===sorted[selected.length]?.value;}
export function gameQuestion(q){
 if(q.kind==='collect')return q.baseKind==='equation'?`Собери ответ: ${expr(q)}`:`Собери предметы: ${q.mathAnswer}`;
 if(q.kind==='odd')return 'Кто здесь лишний?';if(q.kind==='relation')return 'Сравни две стороны';
 if(q.kind==='memory')return q.baseKind==='equation'?`Где будет ответ: ${expr(q)}?`:`Запомни, где число ${q.mathAnswer}`;
 if(q.kind==='order')return 'Нажимай от меньшего к большему';if(q.kind==='detective')return 'Найди пример с ошибкой';if(q.kind==='pattern')return 'Что будет дальше?';return null;
}
export function gameExplanation(q){
 if(q.kind==='collect')return ['Кнопка +1 добавляет один предмет. Лишний можно убрать.',q.baseKind==='equation'?`${expr(q)} = ${q.mathAnswer}.`:`Нужно собрать ровно ${q.mathAnswer}.`,'Когда всё собрано, нажми «Отправить».'];
 if(q.kind==='odd')return ['Посмотри на все картинки.','Пять картинок одинаковые, одна отличается.',`Лишняя картинка — ${q.items[q.answer]}.`];
 if(q.kind==='relation')return [`Слева ${q.left}, справа ${q.right}.`,'Знак < означает меньше, > — больше, = — поровну.',`${q.left} ${q.answer<0?'<':q.answer>0?'>':'='} ${q.right}.`];
 if(q.kind==='memory')return ['Сначала посмотри на числа в окошках.',`Найди и запомни место числа ${q.mathAnswer}.`,`Оно в окошке ${q.answer+1}. Спрячь карточки и выбери это место.`];
 if(q.kind==='order')return ['Вычисли значения карточек, если на них примеры.','Начни с наименьшего, затем выбери следующее.',`Верный порядок: ${[...q.items].sort((a,b)=>a.value-b.value).map(x=>x.label).join(' → ')}.`];
 if(q.kind==='detective'){const p=q.items[q.answer];return ['Вычисли каждый пример и проверь ответ.','Две карточки верные, в одной ошибка.',`${expr(p)} = ${p.answer}, а не ${p.shown}. Ошибка в карточке ${q.answer+1}.`];}
 if(q.kind==='pattern')return ['Найди повторяющийся фрагмент дорожки.','Продолжи тот же порядок цветов и фигур.',`Следующий знак: ${q.patternOptions[q.answer]}.`];return null;
}
export function answerLabel(q){if(q.kind==='relation')return q.answer<0?'Меньше <':q.answer>0?'Больше >':'Поровну =';if(['memory','odd','detective'].includes(q.kind))return `Карточка ${q.answer+1}`;if(q.kind==='pattern')return q.patternOptions[q.answer];if(q.kind==='order')return [...q.items].sort((a,b)=>a.value-b.value).map(x=>x.label).join(' → ');return `= ${q.answer}`;}
