/* Lesson path: seven methodical steps per topic, stories, grammar rules, speaking and the city-building final. */
(function(global){'use strict';

const STEPS=[
 {title:"Знакомство",hint:"Смотри, слушай и повторяй. Ошибок здесь нет.",keys:["explore","cards","verbcards","read"]},
 {title:"Узнавание",hint:"Слушай и находи нужную картинку.",keys:["listen","pairs","phrasepairs","memory","truefalse","balloons","minimal","syllable","scenelisten"]},
 {title:"Запоминание",hint:"Собери, напиши и запомни.",keys:["letters","search","sentences","race","forms","typeform","scenebuild"]},
 {title:"В ситуации",hint:"Прочитай и послушай историю, ответь на вопросы.",keys:["story","scenechoice","missing","adventure","maze"]},
 {title:"Грамматика",hint:"Сначала правило, потом упражнения от простого к сложному.",keys:["rule","gaps","choice","sort","qa","ladder","verbsort","formcheck","pastpick","pasttype","tictactoe"]},
 {title:"Речь",hint:"Скажи вслух и проверь себя.",keys:["sayit","speaking","scenespeech"]},
 {title:"Финал",hint:"Отвечай правильно и строй свой город.",keys:["city"]}
];
const FUN=new Set(["balloons","race","memory","truefalse","search","adventure","maze","tictactoe","city"]);
function stepOf(key){return STEPS.findIndex(s=>s.keys.includes(key))}
function orderInStep(key){const s=STEPS[stepOf(key)];return s?s.keys.indexOf(key):99}

/* ---------- content ---------- */
const STORIES={
 "t-own1-routines":{title:"Eduardo's day",intro:"Эдуардо рассказывает о своём дне.",frames:[
  ["Eduardo","Hi! I'm Eduardo. I wake up at seven o'clock.","Привет! Я Эдуардо. Я просыпаюсь в семь часов.","⏰"],
  ["Eduardo","I get up and have a shower.","Я встаю и принимаю душ.","🚿"],
  ["Eduardo","Then I get dressed and have breakfast.","Потом я одеваюсь и завтракаю.","🍳"],
  ["Eduardo","I brush my teeth and pack my bag.","Я чищу зубы и собираю рюкзак.","🎒"],
  ["Eduardo","I go to school at eight o'clock.","Я иду в школу в восемь часов.","🏫"],
  ["Eduardo","I go home at three and do my homework.","Я иду домой в три и делаю уроки.","📝"],
  ["Eduardo","I check my phone, and at ten I go to bed.","Я проверяю телефон, а в десять ложусь спать.","🛌"]],
  questions:[["When does Eduardo wake up?",["at seven","at eight","at ten"],0],["What does he do after he gets up?",["He has a shower.","He goes to bed.","He does his homework."],0],["When does he go to school?",["at eight","at three","at seven"],0],["What does he do at home after school?",["He does his homework.","He packs his bag.","He has a shower."],0],["When does he go to bed?",["at ten","at three","at eight"],0]]},
 "t-own1-leisure":{title:"Street interviews",intro:"Репортёр спрашивает подростков, что они делают в свободное время.",frames:[
  ["Reporter","Hi, Lily! What do you do in your free time?","Привет, Лили! Что ты делаешь в свободное время?","🎧"],
  ["Lily","I listen to music and download songs.","Я слушаю музыку и скачиваю песни.","📥"],
  ["Lily","I hang out with friends and we go shopping.","Я гуляю с друзьями, и мы ходим по магазинам.","🛍️"],
  ["Reporter","And you, Max?","А ты, Макс?","🎮"],
  ["Max","I play video games and I make videos.","Я играю в видеоигры и снимаю видео.","🎥"],
  ["Max","At the weekend I go for a bike ride.","По выходным я катаюсь на велосипеде.","🚴"],
  ["Max","I take photos, too!","Ещё я фотографирую!","📷"]],
  questions:[["What does Lily listen to?",["music","the radio","her teacher"],0],["Where does Lily go with her friends?",["shopping","to school","to bed"],0],["What does Max make?",["videos","a cake","his bed"],0],["What does Max do at the weekend?",["He goes for a bike ride.","He goes shopping.","He watches TV."],0]]},
 "t-own1-ps-positive":{title:"Max and his sister",intro:"Макс рассказывает о себе и о сестре. Обрати внимание на he и she.",frames:[
  ["Max","I get up at seven. My sister Lily gets up at six!","Я встаю в семь. Моя сестра Лили встаёт в шесть!","🧍"],
  ["Max","She has a shower and gets dressed.","Она принимает душ и одевается.","🚿"],
  ["Max","Lily has breakfast with Mum.","Лили завтракает с мамой.","🍳"],
  ["Max","She goes to school by bike.","Она ездит в школу на велосипеде.","🏫"],
  ["Max","After school she does her homework.","После школы она делает уроки.","📝"],
  ["Max","In the evening she reads a book and I watch TV.","Вечером она читает книгу, а я смотрю телевизор.","📖"]],
  questions:[["When does Lily get up?",["at six","at seven","at eight"],0],["Who does Lily have breakfast with?",["Mum","Max","her friends"],0],["How does Lily go to school?",["by bike","by bus","on foot"],0],["What does Lily do in the evening?",["She reads a book.","She watches TV.","She goes shopping."],0]]},
 "t-own1-ps-negative":{title:"Not me!",intro:"Друзья спорят, кто что делает. Слушай, кто чего НЕ делает.",frames:[
  ["Mia","Do you watch TV in the morning, Tom?","Ты смотришь телевизор утром, Том?","📺"],
  ["Tom","No! I don't watch TV in the morning. I read a book.","Нет! Я не смотрю телевизор утром. Я читаю книгу.","📖"],
  ["Mia","My brother doesn't have breakfast. He's always late!","Мой брат не завтракает. Он всегда опаздывает!","🍳"],
  ["Tom","My sister doesn't play video games. She plays the guitar.","Моя сестра не играет в видеоигры. Она играет на гитаре.","🎸"],
  ["Mia","We don't go shopping on school days.","Мы не ходим по магазинам в учебные дни.","🛍️"],
  ["Tom","And my friends don't make videos. They take photos.","А мои друзья не снимают видео. Они фотографируют.","📷"]],
  questions:[["Does Tom watch TV in the morning?",["No, he doesn't.","Yes, he does."],0],["What does Tom do in the morning?",["He reads a book.","He plays video games.","He has a shower."],0],["Does Mia's brother have breakfast?",["No, he doesn't.","Yes, he does."],0],["What does Tom's sister play?",["the guitar","video games","football"],0],["What do Tom's friends do?",["They take photos.","They make videos.","They go shopping."],0]]},
 "t-own1-ps-questions":{title:"The class survey",intro:"Лили проводит опрос в классе. Слушай вопросы и ответы.",frames:[
  ["Lily","Hi, Sam! Do you play video games?","Привет, Сэм! Ты играешь в видеоигры?","🎮"],
  ["Sam","Yes, I do. I play every evening.","Да. Я играю каждый вечер.","🎮"],
  ["Lily","Does your sister play video games?","Твоя сестра играет в видеоигры?","🎮"],
  ["Sam","No, she doesn't. She listens to music.","Нет. Она слушает музыку.","🎧"],
  ["Lily","What time do you go to bed?","Во сколько ты ложишься спать?","🛌"],
  ["Sam","I go to bed at ten.","Я ложусь спать в десять.","🛌"],
  ["Lily","Do your friends take photos?","Твои друзья фотографируют?","📷"],
  ["Sam","Yes, they do!","Да!","📷"]],
  questions:[["Does Sam play video games?",["Yes, he does.","No, he doesn't."],0],["Does Sam's sister play video games?",["No, she doesn't.","Yes, she does."],0],["What does Sam's sister do?",["She listens to music.","She takes photos.","She goes shopping."],0],["What time does Sam go to bed?",["at ten","at nine","at eleven"],0]]},
 "t-own1-adverbs":{title:"How often?",intro:"Ребята отвечают, как часто они что-то делают.",frames:[
  ["Lily","I always chat online after school.","Я всегда общаюсь онлайн после школы.","🙋 freq:100 💬"],
  ["Max","I usually have breakfast at home.","Я обычно завтракаю дома.","🙋 freq:80 🍳"],
  ["Mia","I often go shopping with my friends.","Я часто хожу по магазинам с друзьями.","🙋 freq:60 🛍️"],
  ["Tom","I sometimes play video games.","Я иногда играю в видеоигры.","🙋 freq:40 🎮"],
  ["Sam","I never watch TV in the morning.","Я никогда не смотрю телевизор утром.","🙋 freq:0 📺"],
  ["Lily","And Sam is never late for school!","А Сэм никогда не опаздывает в школу!","👦 freq:0 ⏰"]],
  questions:[["How often does Lily chat online?",["always","never","sometimes"],0],["How often does Tom play video games?",["sometimes","always","usually"],0],["Who never watches TV in the morning?",["Sam","Mia","Max"],0],["Where is the adverb? Choose the correct sentence.",["Sam is never late.","Sam never is late.","Never Sam is late."],0]]},
 "t-own1-review":{title:"A day with Mia",intro:"Всё вместе: утверждения, отрицания, вопросы и наречия.",frames:[
  ["Mia","I usually wake up at seven.","Я обычно просыпаюсь в семь.","🙋 freq:80 ⏰"],
  ["Mia","I don't have breakfast at home. I have breakfast at school.","Я не завтракаю дома. Я завтракаю в школе.","🍳"],
  ["Tom","Do you play video games, Mia?","Ты играешь в видеоигры, Миа?","🎮"],
  ["Mia","No, I don't. I play the piano.","Нет. Я играю на пианино.","🎹"],
  ["Tom","My brother never plays the piano. He watches TV.","Мой брат никогда не играет на пианино. Он смотрит телевизор.","📺"],
  ["Mia","Does he always watch TV?","Он всегда смотрит телевизор?","📺"],
  ["Tom","Yes, he does!","Да!","📺"]],
  questions:[["Where does Mia have breakfast?",["at school","at home","in the park"],0],["Does Mia play video games?",["No, she doesn't.","Yes, she does."],0],["What does Mia play?",["the piano","the guitar","video games"],0],["How often does Tom's brother play the piano?",["never","always","usually"],0]]}
};

const RULES={
 "t-own1-routines":{title:"Word partners: go, get, have",points:["Учи слова парами: глагол + слово, которое всегда идёт с ним.","go: go to school, go home, go to bed","get: get up, get dressed","have: have breakfast, have a shower"],examples:[["I **go to** school at eight.","Я иду в школу в восемь.","🏫"],["I **get** dressed.","Я одеваюсь.","👕"],["I **have** breakfast.","Я завтракаю.","🍳"]],check:[["___ to school",["go","get","have"],0],["___ dressed",["get","go","have"],0],["___ a shower",["have","go","get"],0],["___ home",["go","have","get"],0]]},
 "t-own1-leisure":{title:"Word partners: go, play, make, take",points:["go: go shopping, go for a bike ride","play: play video games, play an instrument, play the piano","make videos, take photos, watch TV, read a book"],examples:[["I **go** shopping.","Я хожу по магазинам.","🛍️"],["He **plays** video games.","Он играет в видеоигры.","🎮"],["She **takes** photos.","Она фотографирует.","📷"]],check:[["___ photos",["take","play","go"],0],["___ video games",["play","make","go"],0],["___ shopping",["go","take","play"],0],["___ videos",["make","go","listen"],0]]},
 "t-own1-ps-positive":{title:"Present Simple: утверждения",points:["Present Simple — то, что мы делаем регулярно: каждый день, обычно, по выходным.","I / you / we / they + глагол: I play, they play.","he / she / it + глагол с -s: he plays, she reads.","-es после s, sh, ch, x, o: watches, brushes, goes, does.","have → has: she has breakfast."],examples:[["I **play** video games.","Я играю в видеоигры.","🎮"],["He **plays** video games.","Он играет в видеоигры.","🎮"],["She **watches** TV.","Она смотрит телевизор.","📺"],["Nina **has** breakfast.","Нина завтракает.","🍳"]],check:[["He ___ to school.",["goes","go","going"],0],["They ___ music.",["listen to","listens to","listening to"],0],["She ___ TV.",["watches","watch","watchs"],0],["My brother ___ breakfast.",["has","have","haves"],0]]},
 "t-own1-ps-negative":{title:"Present Simple: отрицания",points:["I / you / we / they + don't + глагол: I don't play.","he / she / it + doesn't + глагол: she doesn't play.","После doesn't у глагола нет -s: she doesn't plays — ошибка.","don't = do not, doesn't = does not."],examples:[["I **don't** watch TV.","Я не смотрю телевизор.","📺"],["She **doesn't** play video games.","Она не играет в видеоигры.","🎮"],["We **don't** go shopping.","Мы не ходим по магазинам.","🛍️"]],check:[["He ___ watch TV.",["doesn't","don't","not"],0],["We ___ make videos.",["don't","doesn't","aren't"],0],["She doesn't ___ breakfast.",["have","has","having"],0],["My friends ___ take photos.",["don't","doesn't","isn't"],0]]},
 "t-own1-ps-questions":{title:"Present Simple: вопросы",points:["Do + I / you / we / they + глагол? Do you play?","Does + he / she / it + глагол? Does she play?","После Does у глагола нет -s.","Краткие ответы: Yes, I do. / No, I don't. Yes, she does. / No, she doesn't.","Вопросительное слово идёт в начало: What time do you get up?"],examples:[["**Do** you play video games? — Yes, I **do**.","Ты играешь в видеоигры? — Да.","🎮"],["**Does** she watch TV? — No, she **doesn't**.","Она смотрит телевизор? — Нет.","📺"],["What time **do** you get up?","Во сколько ты встаёшь?","⏰"]],check:[["___ he play football?",["Does","Do","Is"],0],["___ they take photos?",["Do","Does","Are"],0],["Does she ___ breakfast?",["have","has","having"],0],["Do you like music? — Yes, I ___.",["do","does","am"],0]]},
 "t-own1-adverbs":{title:"Наречия частотности",points:["always 100% · usually 80% · often 60% · sometimes 40% · never 0%","Наречие стоит перед основным глаголом: I always play.","Но после am / is / are: I am never late.","never уже отрицание: I never watch TV (без don't)."],examples:[["I **always** chat online.","Я всегда общаюсь онлайн.","🙋 freq:100 💬"],["She **sometimes** plays video games.","Она иногда играет в видеоигры.","👧 freq:40 🎮"],["He **is never** late.","Он никогда не опаздывает.","👦 freq:0 ⏰"]],check:[["Где наречие? I ___ have breakfast.",["usually","am usually","usually am"],0],["Choose the correct sentence.",["She is always late.","She always is late.","Always she late."],0],["0% = ___",["never","sometimes","often"],0],["Choose the correct sentence.",["I never watch TV.","I don't never watch TV.","I watch never TV."],0]]},
 "t-own1-review":{title:"Present Simple: всё вместе",points:["+ I play. She plays.","− I don't play. She doesn't play.","? Do you play? Does she play?","Наречия: перед глаголом, после am / is / are."],examples:[["She **plays** the piano.","Она играет на пианино.","🎹"],["He **doesn't** watch TV.","Он не смотрит телевизор.","📺"],["**Do** you **usually** get up at seven?","Ты обычно встаёшь в семь?","⏰"]],check:[["She ___ the piano.",["plays","play","playing"],0],["He ___ like milk.",["doesn't","don't","isn't"],0],["___ they go shopping?",["Do","Does","Are"],0],["Choose the correct sentence.",["I usually have breakfast.","I have usually breakfast.","Usually I has breakfast."],0]]},
 verbs:{title:"Неправильные глаголы: три формы",points:["У неправильного глагола три формы: go — went — gone.","1-я форма: настоящее время и инфинитив (I go, to go).","2-я форма — Past Simple: что было вчера, на прошлой неделе (I went).","3-я форма понадобится позже: I have gone (Present Perfect).","Во 2-й форме не нужно -ed: went, а не goed. Форма одна для всех: I / she / they went."],examples:[["Yesterday Tom **broke** his leg.","Вчера Том сломал ногу.","👦 🦵 🩼","сломать"],["Yesterday we **went** to the park.","Вчера мы ходили в парк.","👨‍👩‍👧 🌳","идти, ехать"],["Yesterday I **bought** new shoes.","Вчера я купил новые туфли.","🙋 👟 🛒","покупать"]],check:[["go — ___ — gone",["went","goed","goes"],0],["Yesterday she ___ a cake.",["made","make","maked"],0],["buy — bought — ___",["bought","buyed","buy"],0],["Last week he ___ his phone.",["lost","lose","losed"],0]]},
 "t-reading":{title:"Открытый и закрытый слог",points:["Закрытый слог: после гласной стоит согласная. Гласная читается кратко: cat, pen, sit, dog, cup.","Открытый слог: слово кончается на гласную или на немую e. Гласная читается как в алфавите: cake, he, five, home, cube.","Немая e на конце не читается, но меняет гласную: cap → cape, pin → pine."],examples:[["c**a**t — c**a**ke","кошка — торт","🐱"],["p**i**n — p**i**ne","булавка — сосна","📌"],["n**o**t — n**o**te","не — записка","📝"]],check:[["cat — какой слог?",["закрытый","открытый"],0],["cake — какой слог?",["открытый","закрытый"],0],["five — какой слог?",["открытый","закрытый"],0],["cup — какой слог?",["закрытый","открытый"],0]]},
 "fh2-g1-grammar":{title:"I have got / I can",points:["I have got = у меня есть: I have got a ball.","He / she has got: She has got a bike.","I can = я умею: I can swim.","can одинаковый для всех: he can, she can, they can."],examples:[["I **have got** a ball.","У меня есть мяч.","⚽"],["I **can** swim.","Я умею плавать.","🏊"],["She **can** dance.","Она умеет танцевать.","💃"]],check:[["I ___ got a bike.",["have","has","can"],0],["She ___ got a book.",["has","have","can"],0],["He ___ swim.",["can","cans","has"],0],["Can you jump? — Yes, I ___.",["can","have","do"],0]]},
 "fh2-g1-classroom":{title:"This is my … / I have got a …",points:["This is my book. — Это моя книга.","These are my books. — Это мои книги.","Одна вещь: a pen. Много вещей: two pens (+s)."],examples:[["This **is** my book.","Это моя книга.","📖"],["I have got **a** ruler.","У меня есть линейка.","📏"],["These **are** my books.","Это мои книги.","📚"]],check:[["This ___ my bag.",["is","are"],0],["These ___ my pens.",["are","is"],0],["I have got ___ pencil.",["a","two"],0]]},
 "fh2-g1-animals":{title:"I can see … / It can …",points:["I can see a cat. — Я вижу кошку.","A bird can fly. — Птица умеет летать.","This is a frog. These are ducks."],examples:[["I can **see** a dog.","Я вижу собаку.","🐶"],["The bird **can** fly.","Птица умеет летать.","🐦"],["The fish **can** swim.","Рыба умеет плавать.","🐟"]],check:[["A fish can ___.",["swim","fly"],0],["A bird can ___.",["fly","swim"],0],["These ___ ducks.",["are","is"],0]]},
 "fh2-g1-colours":{title:"It is red.",points:["О цвете говорят: It is red. — Он красный.","Цвет стоит перед словом: a red apple — красное яблоко."],examples:[["It **is** red.","Он красный.","🔴"],["The sky is **blue**.","Небо голубое.","🔵"],["The grass is **green**.","Трава зелёная.","🟢"]],check:[["The sun is ___.",["yellow","blue"],0],["The grass is ___.",["green","red"],0],["It ___ white.",["is","are"],0]]},
 "fh2-g1-numbers":{title:"I have got two pens.",points:["После числа больше одного у слова появляется -s: one pen, two pens.","I have got three books. I can see four cats."],examples:[["I have got two **pens**.","У меня две ручки.","🖊️"],["I can see four **cats**.","Я вижу четыре кошки.","🐱"]],check:[["I have got two ___.",["pens","pen"],0],["I can see one ___.",["cat","cats"],0],["five, six, ___",["seven","eight"],0]]}
};

function storyFor(t){
 if(STORIES[t.id])return STORIES[t.id];
 let rows=[];
 if(t.verbs)rows=t.verbs.filter(v=>v[5]).slice(0,6).map(v=>["",v[5],v[6],v[4],v[3]]);
 else rows=(t.sentences||[]).filter(s=>s[2]).slice(0,6).map((s,i)=>[i%2?"Mia":"Max",s[0],s[1],s[2]]);
 if(rows.length<3)return null;
 return {title:t.verbs?"What happened?":"Max and Mia",intro:t.verbs?"Посмотри, что произошло. Глаголы стоят во 2-й форме, это Past Simple.":"Макс и Мия рассказывают, что они видят и что у них есть.",frames:rows,auto:true};
}
function ruleFor(t){return RULES[t.id]||(t.verbs?RULES.verbs:null)}

/* ---------- small helpers ---------- */
function bold(el,text){return String(text).split("**").map((x,i)=>i%2?el("b",null,x):x)}
function plain(text){return String(text).replace(/\*\*/g,"")}
function pickOptions(h,correct,pool,n){const out=[correct];for(const x of h.shuffle(pool))if(!out.includes(x)&&out.length<n)out.push(x);return h.shuffle(out)}

/* Step 1: explore pictures, then "show me" without penalties. */
function playExplore(t,c,h){
 const {el}=h;
 const items=((t.words||[]).length?t.words:(t.sentences||[])).filter(w=>w[2]).slice(0,12);
 if(!items.length){c.finish(3,"");return}
 const opened=new Set();
 const status=el("p",{class:"small",role:"status"});
 const grid=el("div",{class:"explore-grid"});
 const nextBtn=el("button",{class:"main",type:"button",textContent:"Дальше: покажи на картинке →",disabled:true,on:{click:quiz}});
 items.forEach((w,i)=>{const label=el("span",{class:"explore-label",hidden:true},w[0],t.withText?el("small",null,w[1]):null);
  const b=el("button",{class:"explore-tile",type:"button",on:{click:()=>{h.speak(w[0]);label.hidden=false;b.classList.add("seen");opened.add(i);status.textContent="Открыто "+opened.size+" из "+items.length;c.progress(opened.size,items.length*2);if(opened.size===items.length)nextBtn.disabled=false}}},h.picEl(w[2],w[1]),label);grid.append(b)});
 status.textContent="Нажимай на каждую картинку: послушай и повтори слово вслух.";
 c.stage.replaceChildren(status,grid,el("div",null,nextBtn));
 function quiz(){
  const order=h.shuffle(items.map((_,i)=>i)).slice(0,Math.min(6,items.length));let k=0;
  const ask=el("div",{class:"prompt"});
  grid.querySelectorAll(".explore-label").forEach(x=>x.hidden=true);
  nextBtn.remove();
  grid.querySelectorAll(".explore-tile").forEach((b,i)=>{b.classList.remove("seen");b.onclick=()=>{if(k>=order.length)return;if(i===order[k]){h.tone(true);b.classList.add("seen");k++;c.progress(items.length+k*items.length/order.length,items.length*2);if(k>=order.length)setTimeout(()=>c.finish(3,"Ты узнал(а) все слова на слух."),700);else setTimeout(prompt,500)}else{h.tone(false);h.shake(b)}}});
  function prompt(){const w=items[order[k]];ask.replaceChildren(el("span",{class:"muted"},"Где…"),el("span",{class:"big"},w[0]),h.sayBtn(w[0]));h.speak(w[0])}
  status.textContent="Слушай слово и нажми на его картинку.";
  c.stage.replaceChildren(status,ask,grid);prompt();
 }
}

/* Step 4: comic story with audio, then comprehension. */
function playStory(t,c,h){
 const {el}=h;const s=storyFor(t);if(!s){c.finish(3,"");return}
 let i=0;
 function frame(){
  const f=s.frames[i];
  const ru=el("p",{class:"story-ru",hidden:true},f[2]);
  c.progress(i,s.frames.length*2);
  c.stage.replaceChildren(
   el("p",{class:"muted small"},i===0?s.intro:"Кадр "+(i+1)+" из "+s.frames.length),
   el("div",{class:"story-frame"},
    el("div",{class:"story-pic"},h.picEl(f[3],f[4]||f[2])),
    el("div",{class:"story-bubble"},f[0]?el("b",{class:"story-who"},f[0]):null,el("p",null,f[1]))),
   el("div",{class:"row",style:"justify-content:center"},
    el("button",{type:"button",class:"say",textContent:"▶ Послушать",on:{click:()=>h.speak(f[1])}}),
    el("button",{type:"button",class:"ghost",textContent:"Перевод",on:{click:()=>{ru.hidden=!ru.hidden}}})),
   ru,
   el("div",{class:"row",style:"justify-content:space-between"},
    i>0?el("button",{type:"button",textContent:"← Назад",on:{click:()=>{i--;frame()}}}):el("span"),
    el("button",{class:"main",type:"button",textContent:i<s.frames.length-1?"Дальше →":"К вопросам →",on:{click:()=>{if(i<s.frames.length-1){i++;frame()}else questions()}}})));
  h.speak(f[1]);
 }
 function questions(){
  let qs;
  if(s.auto){const fr=s.frames;qs=h.shuffle(fr.map((f,k)=>k)).slice(0,4).map((k,n)=>{
   if(n%2===0)return{listen:fr[k][1],ask:"Послушай и выбери нужный кадр.",opts:pickOptions(h,k,fr.map((_,j)=>j),3).map(j=>({pic:fr[j],ok:j===k}))};
   const other=h.shuffle(fr.map((_,j)=>j).filter(j=>j!==k))[0];const truth=Math.random()<.5;
   return{pic:fr[k],ask:"Это предложение подходит к картинке?",text:truth?fr[k][1]:fr[other][1],opts:[{label:"✓ Да",ok:truth},{label:"✗ Нет",ok:!truth}]}})}
  else qs=s.questions.map(q=>({ask:q[0],say:q[0],opts:q[1].map((o,j)=>({label:o,ok:j===q[2]}))})).map(q=>Object.assign(q,{opts:h.shuffle(q.opts)}));
  let n=0,mistakes=0;
  function next(){
   if(n>=qs.length){c.finish(h.starsBy(mistakes,qs.length),"Ошибок в вопросах: "+mistakes);return}
   const q=qs[n];let done=false;
   c.progress(s.frames.length+n*s.frames.length/qs.length,s.frames.length*2);
   const opts=el("div",{class:q.opts.some(o=>o.pic)?"pic-opts":"stack"},q.opts.map(o=>{const b=el("button",{class:o.pic?"opt pic-opt":"opt line",type:"button",on:{click:()=>{if(done)return;if(o.ok){done=true;h.tone(true);b.classList.add("ok");n++;setTimeout(next,900)}else{h.tone(false);mistakes++;b.classList.add("no");b.disabled=true;h.shake(b)}}}},o.pic?h.picEl(o.pic[3],o.pic[4]||o.pic[2]):o.label);return b}));
   c.stage.replaceChildren(el("p",{class:"muted small"},"Вопрос "+(n+1)+" из "+qs.length),
    el("div",{class:"prompt"},q.pic?h.picEl(q.pic[3],q.pic[4]||q.pic[2]):null,el("span",{class:"story-q"},q.text||q.ask),q.text?el("span",{class:"muted small"},q.ask):null,q.listen?el("button",{class:"main",type:"button",textContent:"▶ Послушать",on:{click:()=>h.speak(q.listen)}}):q.say?h.sayBtn(q.say):null),opts);
   if(q.listen)h.speak(q.listen);
  }
  next();
 }
 frame();
}

/* Step 5: rule with picture examples, then a short check. */
function playRule(t,c,h){
 const {el}=h;const r=ruleFor(t);if(!r){c.finish(3,"");return}
 c.stage.replaceChildren(
  el("div",{class:"rule-card"},el("h3",null,r.title),el("ul",null,r.points.map(p=>el("li",null,p)))),
  el("div",{class:"rule-examples"},r.examples.map(x=>el("div",{class:"rule-example"},h.picEl(x[2],x[3]||x[1]),el("div",null,el("p",{class:"rule-en"},bold(el,x[0])),el("p",{class:"muted small"},x[1]),h.sayBtn(plain(x[0])))))),
  el("div",null,el("button",{class:"main",type:"button",textContent:"Понятно, проверить себя →",on:{click:check}})));
 function check(){
  const qs=r.check;let n=0,mistakes=0;
  function next(){
   if(n>=qs.length){c.finish(h.starsBy(mistakes,qs.length),"Правило: ошибок "+mistakes);return}
   const q=qs[n];let done=false;c.progress(n,qs.length);
   const opts=h.shuffle(q[1].map((o,j)=>({o,ok:j===q[2]}))).map(x=>{const b=el("button",{class:"opt",type:"button",textContent:x.o,on:{click:()=>{if(done)return;if(x.ok){done=true;h.tone(true);b.classList.add("ok");n++;setTimeout(next,800)}else{h.tone(false);mistakes++;b.classList.add("no");b.disabled=true;h.shake(b)}}}});return b});
   c.stage.replaceChildren(el("p",{class:"muted small"},"Задание "+(n+1)+" из "+qs.length),el("div",{class:"prompt"},el("p",{class:"gapq"},q[0])),el("div",{class:"opts"},opts),el("details",{class:"rule-peek"},el("summary",null,"Подсмотреть правило"),el("ul",null,r.points.map(p=>el("li",null,p)))));
  }
  next();
 }
}

/* Step 6: say it aloud; speech recognition when the browser has it, honest self-check otherwise. */
const norm=s=>String(s||"").toLowerCase().replace(/[’‘]/g,"'").replace(/\bdon't\b/g,"do not").replace(/\bdoesn't\b/g,"does not").replace(/\bi'm\b/g,"i am").replace(/\bit's\b/g,"it is").replace(/\bhe's\b/g,"he is").replace(/\bshe's\b/g,"she is").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();
function speechMatch(heard,target){const a=norm(target).split(" "),b=new Set(norm(heard).split(" "));const hit=a.filter(w=>b.has(w)).length;return a.length?hit/a.length:0}
function sayItems(t){
 if(t.verbs)return t.verbs.filter(v=>v[5]).map(v=>({en:v[5],ru:v[6],pic:v[4],alt:v[3]}));
 const s=(t.sentences||[]).filter(x=>x[2]);if(s.length>=3)return s.map(x=>({en:x[0],ru:x[1],pic:x[2],alt:x[1]}));
 return (t.words||[]).filter(x=>x[2]).map(x=>({en:x[0],ru:x[1],pic:x[2],alt:x[1]}));
}
function playSay(t,c,h){
 const {el}=h;const items=h.shuffle(sayItems(t)).slice(0,5);if(!items.length){c.finish(3,"");return}
 const Rec=global.SpeechRecognition||global.webkitSpeechRecognition;
 let n=0,good=0,rec=null;
 c.onCleanup&&c.onCleanup(()=>{try{rec&&rec.abort()}catch(e){}});
 function next(){
  if(n>=items.length){c.finish(good>=items.length-1?3:good>=Math.ceil(items.length/2)?2:1,"Сказано верно: "+good+" из "+items.length);return}
  const it=items[n];c.progress(n,items.length);
  const model=el("p",{class:"say-model",hidden:true},it.en);
  const status=el("p",{class:"small",role:"status",style:"min-height:1.6em;text-align:center"});
  const done=ok=>{if(ok)good++;n++;setTimeout(next,ok?1100:1600)};
  const hint=el("button",{type:"button",class:"ghost",textContent:"Подсказка",on:{click:()=>{model.hidden=false}}});
  const listen=el("button",{type:"button",class:"say",textContent:"▶ Как сказать",on:{click:()=>{model.hidden=false;h.speak(it.en)}}});
  let actions;
  if(Rec){
   const mic=el("button",{class:"main mic",type:"button",textContent:"🎤 Сказать",on:{click:()=>{
    try{rec=new Rec();rec.lang="en-US";rec.interimResults=false;rec.maxAlternatives=4;}catch(e){status.textContent="Микрофон недоступен. Нажми «Я сказал(а)».";return}
    status.textContent="Говори…";mic.disabled=true;let got=false;
    rec.onresult=e=>{got=true;const alts=[...e.results[0]].map(a=>a.transcript);const best=Math.max(...alts.map(a=>speechMatch(a,it.en)));const heard=alts[0];
     if(best>=.8){h.tone(true);status.textContent="Отлично! Ты сказал(а): «"+heard+"»";model.hidden=false;done(true)}
     else{h.tone(false);model.hidden=false;status.textContent="Я услышал(а): «"+heard+"». Послушай образец и попробуй ещё раз.";mic.disabled=false}};
    rec.onerror=e=>{mic.disabled=false;status.textContent=e.error==="not-allowed"?"Разреши доступ к микрофону или нажми «Я сказал(а)».":"Не расслышал(а). Попробуй ещё раз."};
    rec.onend=()=>{if(!got)mic.disabled=false};
    try{rec.start()}catch(e){mic.disabled=false}}}});
   actions=el("div",{class:"row",style:"justify-content:center"},mic,el("button",{type:"button",textContent:"Я сказал(а)",on:{click:()=>{model.hidden=false;h.speak(it.en);status.textContent="Сравни со образцом.";done(false)}}}));
  }else{
   actions=el("div",{class:"row",style:"justify-content:center"},el("button",{class:"main",type:"button",textContent:"✓ Я сказал(а) так же",on:{click:()=>{model.hidden=false;done(true)}}}),el("button",{type:"button",textContent:"↻ Ещё потренируюсь",on:{click:()=>{model.hidden=false;h.speak(it.en);done(false)}}}));
   status.textContent="Скажи вслух, потом нажми «Как сказать» и сравни.";
  }
  c.stage.replaceChildren(el("p",{class:"muted small"},"Скажи по-английски, что на картинке · "+(n+1)+" из "+items.length),
   el("div",{class:"prompt"},h.picEl(it.pic,it.alt),t.withText?el("span",{class:"muted"},it.ru):null,model,el("div",{class:"row",style:"justify-content:center"},listen,hint)),actions,status);
 }
 next();
}

/* ---------- Step 7: build a city ---------- */
function cityQuestions(t,h){
 const pools=[];const words=(t.words||[]).filter(w=>w[2]);
 words.forEach(w=>{pools.push({type:"pic",w});pools.push({type:"listen",w})});
 (t.gaps||[]).forEach(g=>pools.push({type:"gap",g}));
 (t.choice||[]).forEach(x=>pools.push({type:"choice",x}));
 (t.verbs||[]).forEach(v=>{pools.push({type:"form",v,k:1});pools.push({type:"form",v,k:2});if(v[5])pools.push({type:"past",v})});
 const sents=(t.sentences||[]).filter(s=>s[2]);
 if(sents.length>=3)sents.forEach(s=>pools.push({type:"sent",s}));
 const byType={};pools.forEach(q=>{(byType[q.type]=byType[q.type]||[]).push(q)});
 Object.values(byType).forEach(a=>a.splice(0,a.length,...h.shuffle(a)));
 const out=[];const types=h.shuffle(Object.keys(byType));
 while(out.length<10&&types.some(k=>byType[k].length))for(const k of types)if(byType[k].length&&out.length<10)out.push(byType[k].pop());
 const regular=b=>/e$/.test(b)?b+"d":b+"ed";
 return out.map(q=>{
  if(q.type==="pic")return{prompt:[h.picEl(q.w[2],q.w[1])],ask:"Как это по-английски?",options:pickOptions(h,q.w[0],(t.words||[]).map(w=>w[0]),3),answer:q.w[0],say:q.w[0]};
  if(q.type==="listen")return{ask:"Послушай и выбери картинку.",listen:q.w[0],options:pickOptions(h,q.w,words.filter(w=>w[1]!==q.w[1]),3),answer:q.w,pic:true,say:q.w[0]};
  if(q.type==="gap")return{prompt:[q.g[3]?h.picEl(q.g[3],q.g[0]):null],gap:q.g[0],ask:"Выбери, что пропущено.",options:h.shuffle([q.g[1],...q.g[2]].slice(0,3)),answer:q.g[1],say:q.g[0].replace("___",q.g[1])};
  if(q.type==="choice")return{prompt:[q.x[2]?h.picEl(q.x[2],""):null],ask:"Какое предложение верное?",options:h.shuffle([q.x[0],...q.x[1]]),answer:q.x[0],say:q.x[0],line:true};
  if(q.type==="form"){const v=q.v,ok=v[q.k].split("/")[0];const wrong=[v[q.k===1?2:1].split("/")[0],regular(v[0]),v[0]+"s"].filter(x=>!v[q.k].split("/").includes(x));return{prompt:[h.picEl(v[4],v[3])],gap:q.k===1?v[0]+" — ___ — "+v[2]:v[0]+" — "+v[1]+" — ___",ask:(q.k===1?"2-я":"3-я")+" форма",options:pickOptions(h,ok,wrong,3),answer:ok,say:v[0]+", "+v[1]+", "+v[2]}}
  if(q.type==="past"){const v=q.v,ok=v[1].split("/")[0];return{prompt:[h.picEl(v[4],v[3])],gap:v[5].replace(new RegExp("\\b"+ok+"\\b"),"___")+" ("+v[0]+")",ask:"Past Simple",options:pickOptions(h,ok,[v[0],regular(v[0]),v[2].split("/")[0]].filter(x=>!v[1].split("/").includes(x)),3),answer:ok,say:v[5]}}
  const s=q.s;return{prompt:[h.picEl(s[2],s[1])],ask:"Какая фраза подходит к картинке?",options:pickOptions(h,s[0],sents.map(x=>x[0]),3),answer:s[0],say:s[0],line:true};
 });
}

const BUILDINGS=[
 {id:"house",name:"Дом",cost:0},{id:"tree",name:"Дерево",cost:0},{id:"shop",name:"Магазин",cost:2},
 {id:"school",name:"Школа",cost:4},{id:"fountain",name:"Фонтан",cost:3},{id:"tower",name:"Башня",cost:7}
];
const HOUSE_COLORS=[["#f4a261","#e07a3f","#c0392b"],["#8ecae6","#5fa8c9","#264653"],["#ffd166","#e8b53f","#8d5a2b"],["#c3a6ff","#9d7fe0","#5b3b9a"],["#a8e6a1","#7cc674","#2d6a4f"]];

function playCity(t,c,h){
 const {el}=h;const qs=cityQuestions(t,h);if(!qs.length){c.finish(3,"");return}
 const N=5;let grid=Array(N*N).fill(null),score=0,n=0,pending=null,hover=-1,raf=0,alive=true,coins=0;
 const placed=[],walkers=[];
 const canvas=el("canvas",{class:"city-canvas",ariaLabel:"Твой город"});
 const panel=el("div",{class:"city-panel"});
 const hud=el("div",{class:"city-hud"});
 c.stage.replaceChildren(hud,el("div",{class:"city-wrap"},canvas),panel);
 c.onCleanup&&c.onCleanup(()=>{alive=false;cancelAnimationFrame(raf)});
 let ctx=canvas.getContext("2d");let W=0,H=0,tw=0,th=0,ox=0,oy=0,dpr=1;
 function size(){const w=Math.min(canvas.parentNode.clientWidth||360,640);dpr=Math.min(global.devicePixelRatio||1,2);W=w;H=Math.round(w*.8);canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";tw=W*.9/N;th=tw/2;ox=W/2;oy=H-N*th-th*.4;}
 const iso=(i,j)=>[ox+(i-j)*tw/2,oy+(i+j)*th/2];
 function poly(pts,fill,stroke){ctx.beginPath();pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke()}}
 function box(cx,cy,w,d,hgt,top,left,right){const a=[cx,cy-hgt],b=[cx+w/2,cy+d/2-hgt],cc=[cx,cy+d-hgt],dd=[cx-w/2,cy+d/2-hgt];
  poly([dd,cc,[cc[0],cc[1]+hgt],[dd[0],dd[1]+hgt]],left);poly([cc,b,[b[0],b[1]+hgt],[cc[0],cc[1]+hgt]],right);poly([a,b,cc,dd],top);return{a,b,cc,dd}}
 function windows(cx,cy,w,d,hgt,rows,color){for(let r=0;r<rows;r++)for(const s of [-1,1])for(let k=1;k<=2;k++){const f=k/3,side=s<0;const x0=side?cx-w/2+w/2*f:cx+w/2*(1-f);const y0=side?cy+d/2*f:cy+d/2*(1+f)-d/2;const yy=y0+d/2-hgt+hgt*(r+.35)/(rows+.2);ctx.fillStyle=color;ctx.save();ctx.translate(x0,yy);ctx.transform(1,side?.5:-.5,0,1,0,0);ctx.fillRect(-w*.05,-hgt*.06,w*.1,hgt*.12);ctx.restore()}}
 function drawBuilding(b,cx,cy,scale){
  ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);ctx.translate(-cx,-cy);
  const w=tw*.78,d=th*.78;const base=cy-d/2+th*.06;
  ctx.fillStyle="rgba(0,0,0,.12)";ctx.beginPath();ctx.ellipse(cx,cy+th*.08,w*.55,d*.5,0,0,Math.PI*2);ctx.fill();
  const col=HOUSE_COLORS[b.v%HOUSE_COLORS.length];
  if(b.id==="house"){const hg=tw*.42;box(cx,base,w,d,hg,col[0],col[1],shade(col[1],-.12));windows(cx,base,w,d,hg,1,"#fff8d6");
   const top=base-hg;ctx.beginPath();ctx.moveTo(cx-w/2,top+d/2);ctx.lineTo(cx,top-tw*.3+d/4);ctx.lineTo(cx,top+d);ctx.closePath();ctx.fillStyle=shade(col[2],-.1);ctx.fill();
   ctx.beginPath();ctx.moveTo(cx,top+d);ctx.lineTo(cx,top-tw*.3+d/4);ctx.lineTo(cx+w/2,top+d/2);ctx.closePath();ctx.fillStyle=col[2];ctx.fill();
   ctx.beginPath();ctx.moveTo(cx-w/2,top+d/2);ctx.lineTo(cx,top-tw*.3+d/4);ctx.lineTo(cx+w/2,top+d/2);ctx.lineTo(cx,top);ctx.closePath();ctx.fillStyle=shade(col[2],.15);ctx.fill();
   ctx.fillStyle="#6b4226";ctx.fillRect(cx+w*.12,base+d*.55-hg*.45,w*.1,hg*.45)}
  else if(b.id==="tree"){ctx.fillStyle="#7a4b2a";ctx.fillRect(cx-tw*.035,cy-tw*.28,tw*.07,tw*.28);
   for(const [dx,dy,r,c2] of [[0,-.46,.21,"#3f9d4a"],[-.1,-.36,.16,"#52b45d"],[.1,-.36,.16,"#46a851"],[0,-.6,.14,"#6cc76f"]]){ctx.beginPath();ctx.arc(cx+dx*tw,cy+dy*tw,r*tw,0,Math.PI*2);ctx.fillStyle=c2;ctx.fill()}}
  else if(b.id==="shop"){const hg=tw*.38;box(cx,base,w,d,hg,"#fefae0","#e9c46a","#d4a944");
   for(let k=0;k<6;k++){ctx.fillStyle=k%2?"#fff":"#e63946";ctx.save();ctx.translate(cx,base+d-hg*.55);ctx.transform(1,-.5,0,1,0,0);ctx.fillRect(k*w/12,-hg*.18,w/12,hg*.18);ctx.restore()}
   ctx.fillStyle="#9ad1d4";ctx.save();ctx.translate(cx+w*.06,base+d-hg*.32);ctx.transform(1,-.5,0,1,0,0);ctx.fillRect(0,0,w*.3,hg*.28);ctx.restore()}
  else if(b.id==="school"){const hg=tw*.6;box(cx,base,w*1.05,d*1.05,hg,"#f1faee","#e76f51","#c8553d");windows(cx,base,w*1.05,d*1.05,hg,2,"#fdf0c2");
   const top=base-hg;ctx.strokeStyle="#333";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,top+d*.5);ctx.lineTo(cx,top-tw*.2);ctx.stroke();ctx.fillStyle="#2a9d8f";ctx.beginPath();ctx.moveTo(cx,top-tw*.2);ctx.lineTo(cx+tw*.12,top-tw*.16);ctx.lineTo(cx,top-tw*.12);ctx.fill()}
  else if(b.id==="fountain"){ctx.beginPath();ctx.ellipse(cx,cy-th*.05,w*.48,d*.48,0,0,Math.PI*2);ctx.fillStyle="#adb5bd";ctx.fill();ctx.beginPath();ctx.ellipse(cx,cy-th*.1,w*.4,d*.38,0,0,Math.PI*2);ctx.fillStyle="#48cae4";ctx.fill();
   const tt=performance.now()/300;for(let k=0;k<5;k++){const a=k/5*Math.PI*2+tt;ctx.beginPath();ctx.arc(cx+Math.cos(a)*w*.15,cy-th*.1-tw*.12-Math.abs(Math.sin(tt+k))*tw*.08,tw*.025,0,Math.PI*2);ctx.fillStyle="#caf0f8";ctx.fill()}
   ctx.fillStyle="#6c757d";ctx.fillRect(cx-tw*.02,cy-th*.1-tw*.14,tw*.04,tw*.14)}
  else if(b.id==="tower"){const hg=tw*1.15;box(cx,base,w*.7,d*.7,hg,"#e9ecef","#adb5bd","#868e96");windows(cx,base,w*.7,d*.7,hg,4,"#ffe066");
   const top=base-hg;ctx.fillStyle="#ffd43b";ctx.beginPath();ctx.moveTo(cx-w*.35,top+d*.35);ctx.lineTo(cx,top-tw*.25);ctx.lineTo(cx+w*.35,top+d*.35);ctx.lineTo(cx,top+d*.7);ctx.closePath();ctx.fill();
   ctx.fillStyle="#f03e3e";ctx.beginPath();ctx.arc(cx,top-tw*.27,tw*.035,0,Math.PI*2);ctx.fill()}
  ctx.restore();
 }
 function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=x=>Math.max(0,Math.min(255,Math.round(amt<0?x*(1+amt):x+(255-x)*amt)));return"#"+[f(r),f(g),f(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
 const clouds=[[.15,.12,1],[.6,.07,.8],[.85,.18,1.1]];
 function draw(now){
  if(!alive)return;
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#7ec8f2");sky.addColorStop(.6,"#c9ecff");sky.addColorStop(1,"#e8f7ff");
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  ctx.beginPath();ctx.arc(W*.88,H*.13,W*.05,0,Math.PI*2);ctx.fillStyle="#ffe066";ctx.fill();
  clouds.forEach(cl=>{const x=((cl[0]*W+now*.012*cl[2])%(W+120))-60,y=cl[1]*H;ctx.fillStyle="rgba(255,255,255,.9)";[[0,0,18],[16,-6,14],[30,0,16],[14,6,14]].forEach(p=>{ctx.beginPath();ctx.arc(x+p[0]*cl[2],y+p[1]*cl[2],p[2]*cl[2],0,Math.PI*2);ctx.fill()})});
  const [lx,ly]=iso(0,N),[rx,ry]=iso(N,0),[bx,by]=iso(N,N),[tx,ty]=iso(0,0);
  poly([[tx,ty],[rx,ry],[rx,ry+th*.5],[bx,by+th*.5],[lx,ly+th*.5],[lx,ly]],"#8b5e34");
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const [x,y]=iso(i,j);const k=j*N+i;const pts=[[x,y],[x+tw/2,y+th/2],[x,y+th],[x-tw/2,y+th/2]];
   const free=!grid[k];poly(pts,(i+j)%2?"#7fc96b":"#74bf61","rgba(0,0,0,.06)");
   if(pending&&free){ctx.globalAlpha=.25+.2*Math.sin(now/200);poly(pts,k===hover?"#ffd166":"#ffffff");ctx.globalAlpha=1}}
  placed.slice().sort((a,b)=>(a.i+a.j)-(b.i+b.j)).forEach(p=>{const [x,y]=iso(p.i,p.j);const age=Math.min(1,(now-p.at)/450);const s=age<1?1-Math.pow(1-age,3)*1+Math.sin(age*Math.PI)*.15:1;drawBuilding(p,x,y+th/2,Math.max(.01,s))});
  walkers.forEach(wk=>{wk.t+=.006;if(wk.t>=1){wk.from=wk.to;wk.to=[Math.max(0,Math.min(N-1,wk.from[0]+(Math.random()<.5?1:-1)*(Math.random()<.5?1:0))),Math.max(0,Math.min(N-1,wk.from[1]+(Math.random()<.5?1:-1)*(Math.random()<.5?1:0)))];wk.t=0}
   const i=wk.from[0]+(wk.to[0]-wk.from[0])*wk.t+.5,j=wk.from[1]+(wk.to[1]-wk.from[1])*wk.t+.5;const x=ox+(i-j)*tw/2,y=oy+(i+j)*th/2+th*.25;
   ctx.fillStyle=wk.c;ctx.fillRect(x-2.5,y-9,5,8);ctx.beginPath();ctx.arc(x,y-11,3,0,Math.PI*2);ctx.fillStyle="#f1c27d";ctx.fill()});
  raf=requestAnimationFrame(draw);
 }
 function tileAt(px,py){for(let j=N-1;j>=0;j--)for(let i=N-1;i>=0;i--){const [x,y]=iso(i,j);const dx=Math.abs(px-x)/(tw/2),dy=Math.abs(py-(y+th/2))/(th/2);if(dx+dy<=1)return j*N+i}return -1}
 const pos=e=>{const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]};
 canvas.addEventListener("pointermove",e=>{if(pending)hover=tileAt(...pos(e))});
 canvas.addEventListener("click",e=>{if(!pending)return;const k=tileAt(...pos(e));if(k<0||grid[k])return;place(k)});
 function place(k){if(!pending||k<0||grid[k])return;const b={id:pending.id,v:placed.length,i:k%N,j:Math.floor(k/N),at:performance.now()};grid[k]=b;placed.push(b);h.tone(true);
  if(b.id!=="tree")walkers.push({from:[b.i,b.j],to:[b.i,b.j],t:1,c:["#e63946","#457b9d","#2a9d8f","#f4a261","#9b5de5"][walkers.length%5]});
  coins-=pending.cost;pending=null;hover=-1;paintHud();n++;c.progress(n,qs.length);setTimeout(ask,350)}
 function paintHud(){hud.replaceChildren(el("span",null,"Вопрос "+Math.min(n+1,qs.length)+" из "+qs.length),el("span",null,"🪙 "+coins),el("span",null,"Зданий: "+placed.length))}
 function choose(){
  const free=grid.filter(x=>!x).length;if(!free){n++;setTimeout(ask,200);return}
  const opts=BUILDINGS.filter(b=>b.cost<=coins);
  panel.replaceChildren(el("p",{class:"city-say"},"Верно! Что построим?"),el("div",{class:"city-builds"},BUILDINGS.map(b=>{const can=b.cost<=coins;const icon=el("canvas",{width:120,height:120,class:"city-icon"});drawIcon(icon,b);return el("button",{type:"button",class:"city-build",disabled:!can,on:{click:()=>{pending=b;panel.replaceChildren(el("p",{class:"city-say"},"Нажми на свободную клетку в городе."),el("button",{type:"button",class:"ghost",textContent:"Поставить в любое место",on:{click:()=>{const freeK=grid.map((x,k)=>x?-1:k).filter(k=>k>=0);place(freeK[Math.floor(Math.random()*freeK.length)])}}}))}}},icon,el("span",null,b.name),el("small",null,b.cost?"🪙 "+b.cost:"бесплатно"))})));
  if(!opts.length){n++;setTimeout(ask,200)}
 }
 function drawIcon(cv,b){const g=cv.getContext("2d");const real=ctx,ktw=tw,kth=th;ctx=g;tw=78;th=39;g.clearRect(0,0,120,120);drawBuilding({id:b.id,v:1},60,98,1);ctx=real;tw=ktw;th=kth}
 function ask(){
  if(n>=qs.length){finish();return}
  paintHud();
  const q=qs[n];let done=false;
  const opts=q.options.map(o=>{const label=q.pic?h.picEl(o[2],o[1]):o;const b=el("button",{type:"button",class:q.pic?"opt pic-opt":q.line?"opt line":"opt",on:{click:()=>{if(done)return;done=true;const ok=q.pic?o===q.answer:o===q.answer;
   if(ok){score++;coins+=2;b.classList.add("ok");h.tone(true);h.speak(q.say);setTimeout(choose,600)}
   else{b.classList.add("no");h.tone(false);h.shake(b);[...opts].forEach((x,k)=>{if(q.options[k]===q.answer)x.classList.add("ok")});panel.append(el("p",{class:"city-say"},"Здесь ничего не построим. Правильно: "+(q.pic?q.answer[0]:q.answer)));h.speak(q.say);n++;c.progress(n,qs.length);setTimeout(ask,1800)}
   paintHud()}}},label);return b});
  panel.replaceChildren(el("div",{class:"prompt"},...(q.prompt||[]),q.gap?el("p",{class:"gapq"},q.gap):null,el("span",{class:"muted small"},q.ask),q.listen?el("button",{class:"main",type:"button",textContent:"▶ Послушать",on:{click:()=>h.speak(q.listen)}}):null),el("div",{class:q.pic?"pic-opts":q.line?"stack":"opts"},opts));
  if(q.listen)h.speak(q.listen);
 }
 function finish(){
  pending=null;
  const big=placed.length>=8;if(score===qs.length&&!placed.some(p=>p.id==="tower")){const k=grid.findIndex(x=>!x);if(k>=0){const b={id:"tower",v:9,i:k%N,j:Math.floor(k/N),at:performance.now()};grid[k]=b;placed.push(b)}}
  try{global.localStorage.setItem("ee-city:"+t.id,JSON.stringify(placed.map(p=>[p.id,p.i,p.j])))}catch(e){}
  panel.replaceChildren(el("p",{class:"city-say"},score===qs.length?"Все ответы верны! В городе выросла башня.":big?"Какой большой город!":"Город построен."));
  setTimeout(()=>{if(alive)c.finish(score>=9?3:score>=6?2:1,"Верных ответов: "+score+" из "+qs.length+" · зданий: "+placed.length)},2600);
 }
 size();
 /* restore last city as a starting district so the child sees progress */
 try{const old=JSON.parse(global.localStorage.getItem("ee-city:"+t.id)||"null");if(old&&old.length){old.slice(0,6).forEach((p,k)=>{const idx=p[2]*N+p[1];if(!grid[idx]&&p[0]==="tree"){const b={id:"tree",v:k,i:p[1],j:p[2],at:0};grid[idx]=b;placed.push(b)}})}}catch(e){}
 raf=requestAnimationFrame(draw);
 ask();
}

global.NotebookLesson={STEPS,FUN,stepOf,orderInStep,storyFor,ruleFor,cityQuestions,speechMatch,norm,playExplore,playStory,playRule,playSay,playCity};
if(typeof module!=="undefined"&&module.exports)module.exports=global.NotebookLesson;
})(typeof window!=="undefined"?window:globalThis);
