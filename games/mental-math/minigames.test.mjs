import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bindMini,miniControls,miniLesson} from './minigame-ui.mjs';
import {parseSave,mergeSave} from './progress.mjs';
function node(dataset={}){return {dataset,disabled:false,innerHTML:'',textContent:'',onclick:null};}
function documentFixture(groups={},ids={}){return {querySelectorAll:s=>groups[s]||[],querySelector:s=>ids[s]||null};}
const objects=(n,icon)=>`${n}:${icon}`;
test('Collector changes amount, removes extras and submits only on confirmation',()=>{
 const inc=node({collect:'1'}),dec=node({collect:'-1'}),send=node(),zone=node();let locked=false;const answers=[];
 bindMini({kind:'collect',mathAnswer:3,icon:'🧸'},{document:documentFixture({'[data-collect]':[inc,dec]},{'#send-collection':send,'#collected':zone}),blocked:()=>locked,submit:v=>answers.push(v),objects,route:'preschool',assisted:()=>{},memory:()=>{}});
 dec.onclick();assert.equal(zone.innerHTML,'0:🧸');for(let i=0;i<4;i++)inc.onclick();dec.onclick();assert.equal(zone.innerHTML,'3:🧸');assert.equal(answers.length,0);send.onclick();assert.deepEqual(answers,[3]);locked=true;inc.onclick();send.onclick();assert.equal(zone.innerHTML,'3:🧸');assert.equal(answers.length,1);
});
test('Memory hides all values, allows recall and marks a second look as assistance',()=>{
 const cards=[0,1,2,3].map(i=>node({memory:String(i)})),cover=node(),status=node(),paused=[];let helped=0;const answers=[];
 const q={kind:'memory',cards:[2,5,1,3],mathAnswer:5,answer:1,baseKind:'digit'};
 bindMini(q,{document:documentFixture({'[data-memory]':cards},{'#cover-memory':cover,'#memory-status':status}),blocked:()=>false,submit:v=>answers.push(v),objects,route:'preschool',assisted:()=>helped++,memory:v=>paused.push(v)});
 cards[1].onclick();assert.equal(answers.length,0);cover.onclick();assert.ok(cards.every(c=>c.innerHTML.includes('<strong>?</strong>')&&!c.disabled));assert.equal(helped,0);cover.onclick();assert.equal(helped,1);assert.ok(cards.every(c=>c.disabled));cover.onclick();cards[1].onclick();assert.deepEqual(answers,[1]);assert.deepEqual(paused,[false,true,false]);
});
test('Order requires every item; a wrong next item sends a single failure',()=>{
 const q={kind:'order',answer:8,items:[{label:'8',value:8},{label:'2',value:2},{label:'5',value:5}]};
 function setup(){const buttons=q.items.map((_,i)=>node({order:String(i)})),slot=node(),answers=[];let locked=false;bindMini(q,{document:documentFixture({'[data-order]':buttons},{'#order-slots':slot}),blocked:()=>locked,submit:v=>{answers.push(v);locked=true;},objects,route:'school',assisted:()=>{},memory:()=>{}});return {buttons,slot,answers};}
 const good=setup();good.buttons[1].onclick();good.buttons[2].onclick();assert.equal(good.answers.length,0);good.buttons[0].onclick();assert.deepEqual(good.answers,[8]);const wrong=setup();wrong.buttons[0].onclick();wrong.buttons[0].onclick();assert.deepEqual(wrong.answers,[-999]);
});
test('Mini-game UI includes real equality and card-based controls',()=>{
 const q={kind:'relation',answer:0,left:3,right:3,leftText:'1 + 2',rightText:'3 + 0'};const html=miniControls(q,objects,'school');assert.ok(html.includes('data-answer="0"'));assert.ok(html.includes('Меньше'));assert.ok(html.includes('Равно'));assert.ok(miniLesson(q,2,'school',objects).includes('Поровну'));
});
test('Earlier mission lengths remain importable and merging retains unlocked progress',()=>{
 const old={version:2,sound:false,routes:{preschool:[{level:1,correct:5,total:5,accuracy:100,hints:0,completed:true,unlocks:true,score:50}]}};
 const recent={version:2,sound:true,routes:{preschool:[{level:2,correct:6,total:6,accuracy:100,hints:0,completed:true,unlocks:true,score:60}]}};
 assert.equal(parseSave(old).routes.preschool[0].total,5);assert.equal(mergeSave(old,recent).routes.preschool.length,2);
 assert.throws(()=>parseSave({...old,routes:{preschool:[{...old.routes.preschool[0],total:100}]}}));
});
