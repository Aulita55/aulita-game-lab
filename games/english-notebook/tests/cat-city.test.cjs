const test=require('node:test'),assert=require('node:assert/strict'),C=require('../cat-city.js');
function memory(){const values=new Map();return{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),values}}
test('Every Notebook activity pays its daily best once; replay and improvements cannot duplicate coins',()=>{
 const s=C.createStore(memory(),()=>Date.parse('2026-11-11T10:00:00Z'));assert.equal(s.earn('c:forms',1).amount,5);assert.equal(s.earn('c:forms',1).amount,0);assert.equal(s.earn('c:forms',3).amount,10);assert.equal(s.earn('c:forms',2).amount,0);assert.equal(s.load().coins,15);assert.equal(s.earn('c:dictation',3).amount,15);assert.equal(s.earn('animals:pairs',2).amount,10);assert.equal(s.load().coins,40);
});
test('The next practice day follows Omsk time; yesterday’s wallet and buildings persist',()=>{
 let now=Date.parse('2026-11-11T17:59:00Z');const mem=memory(),s=C.createStore(mem,()=>now);assert.equal(C.day(now),'2026-11-11');s.earn('c:forms',3);s.buy('house',0);now+=120000;assert.equal(C.day(now),'2026-11-12');assert.equal(s.earn('c:forms',3).amount,15);assert.equal(s.load().buildings.length,1);assert.equal(s.load().earned,30);assert.equal(Object.keys(s.load().rewards).length,1);
});
test('Buying, moving and improving a building persists across store instances with exact accounting',()=>{
 const mem=memory(),s=C.createStore(mem);for(let i=0;i<8;i++)s.earn('task:'+i,3);assert.equal(s.load().coins,120);s.buy('house',0);assert.equal(s.load().coins,105);assert.equal(C.residents(s.load()),2);const cost=C.upgradeCost(s.load().buildings[0]);s.upgrade(0);assert.equal(s.load().coins,105-cost);assert.equal(C.residents(s.load()),4);const coins=s.load().coins;s.move(0,1);assert.equal(s.load().coins,coins);assert.deepEqual(C.createStore(mem).load().buildings,[{id:'house',plot:1,level:2}]);
});
test('An occupied lot, road, invalid ID or insufficient balance never spends coins',()=>{
 const mem=memory(),s=C.createStore(mem);s.earn('task',3);s.buy('house',0);const before=mem.getItem(C.KEY);for(const action of [()=>s.buy('house',0),()=>s.buy('park',1),()=>s.buy('park',3),()=>s.buy('missing',1),()=>s.move(0,3),()=>s.upgrade(0)]){assert.throws(action);assert.equal(mem.getItem(C.KEY),before)}
});
test('Moves cannot overwrite a building and upgrades stop at level three',()=>{
 const s=C.createStore(memory());for(let i=0;i<30;i++)s.earn('task:'+i,3);s.buy('house',0);s.buy('school',1);const before=JSON.stringify(s.load());assert.throws(()=>s.move(0,1));assert.equal(JSON.stringify(s.load()),before);s.upgrade(0);s.upgrade(0);const atMax=JSON.stringify(s.load());assert.throws(()=>s.upgrade(0));assert.equal(JSON.stringify(s.load()),atMax);
});
test('Failed persistence changes neither money nor buildings, and the same reward can be retried',()=>{
 const mem=memory(),s=C.createStore(mem);s.earn('task',3);const before=mem.getItem(C.KEY),original=mem.setItem;mem.setItem=()=>{throw new Error('QuotaExceeded')};assert.throws(()=>s.buy('park',0),/Не удалось сохранить/);assert.equal(mem.getItem(C.KEY),before);assert.throws(()=>s.earn('other',3),/Не удалось сохранить/);assert.equal(mem.getItem(C.KEY),before);mem.setItem=original;assert.equal(s.earn('other',3).amount,15);assert.equal(s.load().buildings.length,0);
});
test('Malformed or incompatible saves stay untouched',()=>{
 for(const invalid of ['{','null',JSON.stringify({...C.initial(),coins:-1}),JSON.stringify({...C.initial(),version:2}),JSON.stringify({...C.initial(),buildings:[{id:'house',plot:3,level:1}]})]){const mem=memory();mem.setItem(C.KEY,invalid);const s=C.createStore(mem);assert.throws(()=>s.load());assert.throws(()=>s.earn('task',3));assert.equal(mem.getItem(C.KEY),invalid)}
});
test('Freshest saved state is used for every mutation, preserving another store’s work',()=>{
 const mem=memory(),a=C.createStore(mem),b=C.createStore(mem);a.earn('task',3);b.earn('task',3);assert.equal(a.load().coins,15);a.buy('park',0);assert.equal(b.load().coins,10);b.buy('park',1);assert.equal(a.load().buildings.length,2);assert.equal(a.load().coins,5);
});
test('The 36 buildable lots and catalogue produce valid authored building graphics',()=>{
 assert.equal(Array.from({length:49},(_,i)=>i).filter(C.isLot).length,36);assert.equal(new Set(C.CATALOG.map(b=>b.id)).size,C.CATALOG.length);for(const b of C.CATALOG)for(const level of [1,2,3]){assert.ok(b.cost>0);const svg=C.buildingSvg(b.id,level);assert.ok(svg.includes('<'));assert.ok(!/NaN|undefined/.test(svg))}
});
