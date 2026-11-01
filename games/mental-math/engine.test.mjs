import {test} from 'node:test';
import assert from 'node:assert/strict';
import {routes,tasks,createRun,answer,advance,summary,explanation} from './engine.mjs';
test('All authored and repeat missions have correct arithmetic and nonduplicated choices',()=>{
 for(const route of Object.keys(routes))for(const repeat of [false,true]){
 const qs=tasks(route,repeat);assert.equal(qs.length,routes[route].count);
 for(const q of qs){assert.equal(q.answer,q.a+q.b);assert.equal(explanation(route,q).length,3);if(q.options){assert.equal(new Set(q.options).size,3);assert.equal(q.options.filter(n=>n===q.answer).length,1);}}
 }
});
test('One submitted error costs one heart, duplicate clicks do nothing; third error ends mission',()=>{
 const r=createRun('school');for(let i=0;i<3;i++){answer(r,-1);answer(r,-1);assert.equal(r.lives,2-i);assert.equal(r.score,0);advance(r);}assert.equal(r.done,true);assert.equal(summary(r).completed,false);assert.equal(answer(r,1),null);
});
test('Score is +10/-5, never negative; support is excluded from independent accuracy',()=>{
 const r=createRun('preschool');answer(r,2,true);advance(r);assert.equal(r.score,10);answer(r,0);advance(r);assert.equal(r.score,5);answer(r,3);advance(r);assert.equal(summary(r).accuracy,50);assert.equal(summary(r).hints,1);
});
test('Practice never loses lives or gains score',()=>{const r=createRun('adult',true);for(const q of r.questions){answer(r,-1);advance(r);}assert.equal(r.lives,3);assert.equal(r.score,0);assert.equal(r.done,true);});
test('Perfect missions complete once and have the expected score',()=>{for(const route of Object.keys(routes)){const r=createRun(route);for(const q of r.questions){answer(r,q.answer);advance(r);}assert.equal(summary(r).accuracy,100);assert.equal(summary(r).completed,true);assert.equal(r.score,r.questions.length*10);const before=JSON.stringify(r);answer(r,1);advance(r);assert.equal(JSON.stringify(r),before);}});
