export const routes = {
  preschool: {label:'Дошкольники', skill:'Предметы → числа → первые примеры', name:'Тим и маленькие открытия'},
  school: {label:'Школьники', skill:'От счёта до 10 к умножению и делению', name:'Математические приключения'},
  adult: {label:'Взрослые', skill:'Та же спокойная лестница — с самого начала', name:'Счёт без спешки'}
};
const pre = [
 ['Яблочки для Тима','count',3,'🍎','яблок'],
 ['Мишки в вагончике','count',4,'🧸','мишек'],
 ['Звёздный фонарик','count',5,'⭐','звёзд'],
 ['Цветочная полянка','digit',5,'🌼','цветов'],
 ['Где больше?','compare',5,'🐟','рыбок'],
 ['Пропавшая цифра','sequence',5,'🦋','бабочек'],
 ['Состав числа 5','compose',5,'🍓','ягод'],
 ['Добавь ещё','add',5,'🍐','груш'],
 ['Стало меньше','sub',5,'🎈','шариков'],
 ['Соберём десять','digit',10,'🟠','апельсинов'],
 ['Друзья десятки','compose',10,'🌻','цветов'],
 ['Сложение до 10','add',10,'🍒','вишенок'],
 ['Вычитание до 10','sub',10,'🧁','кексов'],
 ['Парные подарки','double',10,'🎁','подарков'],
 ['Лестница до 20','sequence',20,'🚂','вагончиков'],
 ['Десяток и ещё чуть-чуть','addNoCarry',20,'🟣','фишек'],
 ['Убираем единицы','subNoBorrow',20,'🔵','фишек'],
 ['Мост через десяток','carry',20,'🟡','фишек']
];
const math = [
 ['Первые суммы','add',5,0],['Сложение до 10','add',10,0],
 ['Первые разности','sub',5,0],['Вычитание до 10','sub',10,0],
 ['Плюс и минус до 10','mixed',10,0],['Почтовый спринт до 10','mixed',10,30],
 ['Складываем до 20','addNoCarry',20,0],['Вычитаем до 20','subNoBorrow',20,0],
 ['Собираем десяток','carry',20,40],['Вычитаем через десяток','borrow',20,40],
 ['Оба действия до 20','mixed',20,30],['Быстрее до 20','mixed',20,24],
 ['Разряды: сложение','addNoCarry',100,0],['Разряды: вычитание','subNoBorrow',100,0],
 ['Удобно прибавить 9','plus9',100,35],['Маршрут до 100','mixed',100,35],
 ['Умножаем на 2','multiply',2,0],['Умножаем на 5','multiply',5,0],
 ['Умножаем на 10','multiply',10,0],['Умножаем на 3 и 4','multiply34',4,40],
 ['Вся таблица умножения','multiplyAll',10,40],['Делим на 2, 5 и 10','divideEasy',10,0],
 ['Вся таблица деления','divide',10,40],['Большая доставка','all',100,30]
];
export function levels(route) {
  return (route==='preschool'?pre:math).map((v,i)=>({
    id:(route==='preschool'?'P':route==='school'?'S':'A')+String(i+1).padStart(2,'0'),
    number:i+1, title:v[0], type:v[1], max:v[2],
    icon:route==='preschool'?v[3]:['🌱','🌿','🏘️','⚙️'][Math.min(3,Math.floor(i/6))],
    noun:route==='preschool'?v[4]:'',
    count:route==='preschool'?Math.min(5+Math.floor(i/3),10):i<6?6:i<16?8:10,
    limit:route==='preschool'?0:v[3],
    district:route==='preschool'?['Сад открытий','Площадь чисел','Мост десятки'][Math.floor(i/6)]:['Сад десятки','Мост до 20','Мастерская сотни','Башня действий'][Math.floor(i/6)]
  }));
}
export function shuffle(a,rng=Math.random){const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
const int=(a,b,rng)=>a+Math.floor(rng()*(b-a+1));
function one(l,rng){
  let a,b,op='+',answer,kind='equation';const max=l.max,t=l.type;
  if(['count','digit','compare','sequence','compose'].includes(t)){
    if(t==='count'||t==='digit'){a=int(1,max,rng);answer=a;kind=t;}
    if(t==='compare'){a=int(1,max-1,rng);b=int(a+1,max,rng);answer=b;kind=t;}
    if(t==='sequence'){a=int(1,max-2,rng);answer=a+1;kind=t;}
    if(t==='compose'){a=int(1,max-1,rng);b=max;answer=max-a;kind=t;}
  } else if(['multiply','multiply34','multiplyAll','divideEasy','divide','all'].includes(t)){
    if(t==='all'){return one({...l,type:['mixed','multiplyAll','divide'][int(0,2,rng)]},rng);}
    b=t==='multiply'?max:t==='multiply34'?int(3,4,rng):t==='divideEasy'?[2,5,10][int(0,2,rng)]:int(2,10,rng);
    a=int(1,10,rng);op=t.startsWith('divide')?'÷':'×';
    if(op==='÷'){answer=a;a*=b;}else answer=a*b;
  }else{
    if(t==='mixed')return one({...l,type:rng()<.5?'add':'sub'},rng);
    if(t==='double'){a=int(1,5,rng);b=a;}
    else if(t==='carry'){a=int(2,9,rng);b=int(11-a,9,rng);}
    else if(t==='borrow'){a=int(11,18,rng);b=int(a%10+1,9,rng);op='−';}
    else if(t==='plus9'){a=int(1,8,rng)*10+int(1,9,rng);b=9;}
    else if(t==='addNoCarry'){a=max===20?int(11,17,rng):int(1,7,rng)*10+int(1,7,rng);b=int(1,9-a%10,rng);if(max===100)b+=int(0,Math.floor((99-a-b)/10),rng)*10;}
    else if(t==='subNoBorrow'){a=max===20?int(11,19,rng):int(2,9,rng)*10+int(1,9,rng);b=int(1,a%10,rng);if(max===100)b+=int(0,Math.floor(a/10)-1,rng)*10;op='−';}
    else if(t==='sub'){a=int(2,max,rng);b=int(1,a,rng);op='−';}
    else {a=int(1,max-1,rng);b=int(1,max-a,rng);}
    answer=op==='−'?a-b:a+b;
  }
  const q={a,b,op,answer,kind,icon:l.icon,noun:l.noun,type:t};
  if(kind==='count')q.options=shuffle(Array.from({length:max},(_,i)=>i+1).slice(0,Math.min(max,5)),rng);
  if(kind==='compare')q.options=shuffle([a,b],rng);
  if(['digit','sequence','compose'].includes(kind)){const candidates=new Set([answer]);while(candidates.size<3)candidates.add(int(0,Math.max(max,3),rng));q.options=shuffle([...candidates],rng);}
  return q;
}
export function tasks(route,number=1,rng=Math.random){const l=levels(route)[number-1];if(!l)throw Error('Unknown level');const qs=[];for(let i=0;i<l.count;i++){let q;for(let n=0;n<40;n++){q=one(l,rng);if(!qs.length||JSON.stringify([q.a,q.b,q.op])!==JSON.stringify([qs.at(-1).a,qs.at(-1).b,qs.at(-1).op]))break;}qs.push(q);}return qs;}
export function questionText(q){
  if(q.kind==='count'){const forms={'🍎':['яблоко','яблока','яблок'],'🧸':['мишку','мишки','мишек'],'⭐':['звезду','звезды','звёзд']}[q.icon];const form=q.a===1?0:q.a<5?1:2;return `Найди ${q.a} ${forms?.[form]||q.noun}`;}
  if(q.kind==='digit')return 'Сколько предметов?';
  if(q.kind==='compare')return 'В какой группе больше?';
  if(q.kind==='sequence')return `${q.a}, …, ${q.a+2}`;
  if(q.kind==='compose')return `${q.a} + ? = ${q.b}`;
  return `${q.a} ${q.op} ${q.b}`;
}
export function explanation(route,q){
  if(['count','digit'].includes(q.kind))return ['Коснись каждого предмета по очереди. Считай каждый только один раз.',`Считаем: ${Array.from({length:q.answer},(_,i)=>i+1).join(', ')}.`,`Всего ${q.answer}. Выбери эту группу или число.`];
  if(q.kind==='compare')return [`В одной группе ${q.a}, а в другой ${q.b}.`,'Соедини предметы из двух групп парами.',`Во второй группе остались лишние: ${q.b} больше ${q.a}.`];
  if(q.kind==='sequence')return [`После ${q.a} идёт следующее число.`,`Прибавляем один: ${q.a} + 1.`,`Пропущено число ${q.answer}.`];
  if(q.kind==='compose')return [`Нужно собрать ${q.b}. Уже есть ${q.a}.`,'Добавляй по одному до полного количества.',`${q.b} − ${q.a} = ${q.answer}. Столько нужно добавить.`];
  if(q.op==='×')return [`${q.a} × ${q.b} — это ${q.b} равных групп по ${q.a}.`,q.b===10?`При умножении целого числа на 10 каждый разряд сдвигается: ${q.a} × 10.`:q.b===2?`Удвоим число: ${q.a} + ${q.a}.`:`Разделим на знакомые части: ${q.a} × ${Math.floor(q.b/2)} + ${q.a} × ${q.b-Math.floor(q.b/2)}.`,`Всего ${q.answer}.`];
  if(q.op==='÷')return [`${q.a} делим на ${q.b} равных групп.`,`Ищем число, которое при умножении на ${q.b} даёт ${q.a}.`,`${q.answer} × ${q.b} = ${q.a}, значит ответ ${q.answer}.`];
  if(q.type==='plus9')return [`Заменим +9 на +10.`,`${q.a} + 10 = ${q.a+10}. Прибавили одну лишнюю единицу.`,`${q.a+10} − 1 = ${q.answer}.`];
  if(q.type==='carry'){const d=10-q.a;return [`До десяти не хватает ${d}.`,`Разделим ${q.b} на ${d} и ${q.b-d}.`,`${q.a} + ${d} + ${q.b-d} = ${q.answer}.`];}
  if(q.type==='borrow'){const d=q.a-10;return [`Сначала уберём ${d}, чтобы получить 10.`,`Осталось вычесть ${q.b-d}.`,`10 − ${q.b-d} = ${q.answer}.`];}
  return q.op==='−'?[`Было ${q.a}, убираем ${q.b}.`,'Можно считать назад или убрать десятки, затем единицы.',`${q.a} − ${q.b} = ${q.answer}.`]:[`Начни с ${Math.max(q.a,q.b)}, добавь ${Math.min(q.a,q.b)}.`,'Можно складывать десятки отдельно, а единицы отдельно.',`${q.a} + ${q.b} = ${q.answer}.`];
}
export function createRun(route,practice=false,number=1){const level=levels(route)[number-1];return {route,level,practice,questions:tasks(route,number),index:0,score:0,lives:3,answers:[],locked:false,done:false};}
export function answer(run,value,assisted=false,seconds=0){if(run.done||run.locked)return null;const q=run.questions[run.index],correct=value===q.answer;run.locked=true;if(!run.practice){run.score=Math.max(0,run.score+(correct?10:-5));if(!correct)run.lives--;}const record={...q,value,correct,assisted,seconds};run.answers.push(record);return record;}
export function advance(run){if(!run.locked||run.done)return;run.index++;run.done=run.index===run.questions.length||run.lives===0;run.locked=false;}
export function summary(run){const independent=run.answers.filter(a=>!a.assisted),correct=run.answers.filter(a=>a.correct).length,completed=run.done&&run.lives>0;return {level:run.level.number,correct,total:run.questions.length,accuracy:independent.length?Math.round(independent.filter(a=>a.correct).length/independent.length*100):null,hints:run.answers.filter(a=>a.assisted).length,completed,unlocks:!run.practice&&completed&&correct/run.questions.length>=.8&&independent.filter(a=>a.correct).length>=Math.ceil(run.questions.length/2),score:run.score};}
export function unlocked(route,history=[]){return Math.min(levels(route).length,Math.max(1,...history.filter(x=>x.unlocks&&Number.isInteger(x.level)&&x.level>=1&&x.level<=levels(route).length).map(x=>x.level+1)));}
