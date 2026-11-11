const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const V=require('../verb-practice.js'),data=JSON.parse(fs.readFileSync(path.join(__dirname,'../topics.json'),'utf8'));
const verbs=data.topics.flatMap(t=>t.rows||[]),row=base=>verbs.find(v=>v[0]===base);
const memory=()=>{const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)}};
test('All 262 taught past forms have four distinct options and exactly one accepted answer',()=>{
 for(const v of verbs)for(const k of [1,2]){const opts=V.options(v,k);assert.equal(opts.length,4,v[0]);assert.equal(new Set(opts).size,4);assert.equal(opts.filter(x=>V.isCorrect(v,k,x)).length,1,v[0]+' '+k);for(const alt of V.accepted(v,k))assert.ok(!V.wrongForms(v,k,10).includes(alt))}
});
test('Catch uses close spelling traps and contrasts au/ou with a correct explanatory model',()=>{
 assert.deepEqual(V.options(row('catch'),1),['caught','cought','caugt','catched']);assert.match(V.explanation(row('catch'),1,'cought'),/caught пишем au/);
 assert.ok(V.options(row('teach'),1).includes('tought'));assert.ok(V.options(row('think'),1).includes('thaught'));
});
test('Legitimate alternatives are accepted, and positional errors remain errors',()=>{
 for(const base of ['learn','burn','dream','spell','light','kneel'])for(const k of [1,2])for(const alt of row(base)[k].split('/'))assert.ok(V.isCorrect(row(base),k,' '+alt.toUpperCase()+' '));
 assert.ok(V.isCorrect(row('be'),1,'were'));assert.ok(V.isCorrect(row('get'),2,'gotten'));assert.ok(V.isCorrect(row('wake'),1,'waked'));assert.ok(!V.isCorrect(row('drink'),1,'drunk'));assert.ok(!V.isCorrect(row('drink'),2,'drank'));assert.ok(!V.isCorrect(row('catch'),1,'cought'));
});
test('A seven-step verb path separates recognition, assembly, editing, context and independent retrieval',()=>{
 assert.equal(V.STEPS.length,7);const all=V.STEPS.flatMap(s=>s.keys);assert.equal(new Set(all).size,all.length);assert.deepEqual(V.STEPS[0].keys,['verbcards']);assert.equal(V.STEPS[1].keys[0],'verbcontrast');assert.ok(V.STEPS[3].keys.includes('verbedit'));assert.ok(V.STEPS[5].keys.includes('verbdictation'));assert.ok(V.STEPS[5].keys.includes('verbrecall'));assert.deepEqual(V.STEPS[6].keys,['city']);
});
test('Errors return immediately, independent retrieval spaces review, and hints do not retire an error',()=>{
 let now=1000;const storage=memory(),r=V.createReview(storage,()=>now),v=row('catch');r.record(v,1,false);assert.equal(r.due([v]).length,1);r.record(v,1,true,true);assert.equal(r.due([v]).length,1);r.record(v,1,true,false);assert.equal(r.due([v]).length,0);now+=600001;assert.equal(r.due([v]).length,1);r.record(v,1,true,false);assert.equal(r.due([v]).length,0);now+=86400001;assert.equal(r.due([v]).length,1);assert.equal(r.load()['catch:1'].errors,1);assert.equal(V.createReview(storage,()=>now).due([v]).length,1);
});
test('Review prioritises the actual difficult form and each small topic has both form targets',()=>{
 const review=V.createReview(memory()),v=row('catch');review.record(v,2,false);const q=V.deck({verbs:verbs},'verbreview',a=>a,review);assert.equal(q.length,1);assert.equal(q[0].v[0],'catch');assert.equal(q[0].k,2);
 for(const base of ['eat','overcome','quit']){const rounds=V.deck({verbs:[row(base)]},'verbcontrast',a=>a,review);assert.deepEqual(rounds.map(q=>q.k),[1,2])}
});
