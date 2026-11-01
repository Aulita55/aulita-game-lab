import {test} from 'node:test';
import assert from 'node:assert/strict';
import {levels,tasks,createRun,answer,advance,summary,explanation,unlocked} from './engine.mjs';
let seed=123456;const rng=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
test('18 preschool and 24 school/adult steps; both numeric routes start easy',()=>{
 assert.equal(levels('preschool').length,18);assert.equal(levels('school').length,24);assert.equal(levels('adult').length,24);
 for(const r of ['school','adult']){assert.equal(levels(r)[0].max,5);assert.equal(levels(r)[0].limit,0);assert.equal(levels(r)[1].max,10);assert.equal(levels(r).findIndex(l=>l.type==='multiply'),16);assert.equal(levels(r)[5].limit,30);assert.equal(levels(r)[11].limit,24);}
 assert.equal(levels('preschool').every(l=>l.limit===0),true);
});
test('6600 generated missions: exact answers, unique choices, required ranges and constraints',()=>{
 for(const r of ['preschool','school','adult'])for(const l of levels(r))for(let n=0;n<100;n++){
   const qs=tasks(r,l.number,rng);assert.equal(qs.length,l.count);
   for(const q of qs){
     assert.ok(Number.isInteger(q.answer)&&q.answer>=0);assert.equal(explanation(r,q).length,3);
     if(q.kind==='equation'){assert.equal(q.answer,q.op==='+'?q.a+q.b:q.op==='−'?q.a-q.b:q.op==='×'?q.a*q.b:q.a/q.b);if(q.op==='÷')assert.ok(q.b>0);if(['+','−'].includes(q.op)){assert.ok(q.a<=l.max);assert.ok(q.b<=l.max);assert.ok(q.answer<=l.max);}}
     if(q.kind==='sequence')assert.ok(q.a+2<=l.max);
     if(q.options){assert.equal(new Set(q.options).size,q.options.length);assert.equal(q.options.filter(n=>n===q.answer).length,1);}
     if(q.type==='addNoCarry')assert.ok(q.a%10+q.b%10<10);
     if(q.type==='subNoBorrow')assert.ok(q.a%10>=q.b%10);
     if(q.type==='carry')assert.ok(q.a<10&&q.b<10&&q.answer>10);
     if(q.type==='borrow')assert.ok(q.a>10&&q.answer<10);
   }
 }
});
test('One error costs one heart; duplicate clicks do nothing; third error ends mission',()=>{const r=createRun('school');for(let i=0;i<3;i++){answer(r,-1);answer(r,-1);assert.equal(r.lives,2-i);assert.equal(r.score,0);advance(r);}assert.equal(r.done,true);assert.equal(summary(r).completed,false);assert.equal(answer(r,1),null);});
test('Scores +10/-5 and help excluded from independent accuracy',()=>{const r=createRun('preschool');answer(r,r.questions[0].answer,true);advance(r);assert.equal(r.score,10);answer(r,-1);advance(r);assert.equal(r.score,5);answer(r,r.questions[2].answer);advance(r);assert.equal(summary(r).accuracy,50);assert.equal(summary(r).hints,1);});
test('Practice never loses lives, gains score or unlocks levels',()=>{const r=createRun('adult',true);for(const q of r.questions){answer(r,q.answer);advance(r);}assert.equal(r.lives,3);assert.equal(r.score,0);assert.equal(r.done,true);assert.equal(summary(r).unlocks,false);});
test('Every level completes once; passing unlocks only the next step',()=>{for(const route of ['preschool','school','adult']){const history=[];assert.equal(unlocked(route,history),1);for(const l of levels(route)){const r=createRun(route,false,l.number);for(const q of r.questions){answer(r,q.answer);advance(r);}const s=summary(r);assert.equal(s.accuracy,100);assert.equal(s.unlocks,true);assert.equal(r.score,r.questions.length*10);history.push(s);assert.equal(unlocked(route,history),Math.min(l.number+1,levels(route).length));const before=JSON.stringify(r);answer(r,1);advance(r);assert.equal(JSON.stringify(r),before);}}});
test('All-assisted completion does not unlock; a failed mission does not unlock',()=>{const r=createRun('school');for(const q of r.questions){answer(r,q.answer,true);advance(r);}assert.equal(summary(r).completed,true);assert.equal(summary(r).unlocks,false);const fail=createRun('school');for(let i=0;i<3;i++){answer(fail,null);advance(fail);}assert.equal(summary(fail).unlocks,false);});
