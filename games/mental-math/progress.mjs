import {routes,levels} from './engine.mjs';
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
export function emptySave(){return {version:2,routes:{},sound:false,legacy:null};}
function readRecord(route,x){
 if(!object(x)||!integer(x.level,1,levels(route).length))throw Error('Invalid level');
 const n=x.total??levels(route)[x.level-1].count;
 if(!integer(n,1,12))throw Error('Invalid task count');
 if(x.total!==undefined&&x.total!==n)throw Error('Invalid task count');
 if(typeof x.completed!=='boolean'||typeof x.unlocks!=='boolean'||!integer(x.correct,0,n)||!integer(x.score,0,x.correct*10)||x.score%5!==0||!(x.accuracy===null||integer(x.accuracy,0,100)))throw Error('Invalid result');
 const hints=x.hints??0;if(!integer(hints,0,n))throw Error('Invalid help count');
 if(x.unlocks&&(!x.completed||x.correct/n<.8||x.correct<Math.ceil(n/2)))throw Error('Invalid unlock');
 const record={level:x.level,correct:x.correct,total:n,accuracy:x.accuracy,hints,completed:x.completed,unlocks:x.unlocks,score:x.score};
 if(typeof x.date==='string'&&x.date.length<=40&&Number.isFinite(Date.parse(x.date)))record.date=x.date;
 return record;
}
export function retainHistory(history){
 const milestones=new Map();
 for(const h of history)if(h.unlocks&&(!milestones.has(h.level)||milestones.get(h.level).score<h.score))milestones.set(h.level,h);
 return [...new Set([...milestones.values(),...history.slice(-450)])];
}
export function parseSave(v){
 if(!object(v)||typeof v.sound!=='boolean'||!object(v.routes))throw Error('Invalid save');
 if(v.version===1)return {version:2,routes:{},sound:v.sound,legacy:JSON.parse(JSON.stringify(v.routes))};
 if(v.version!==2||Object.keys(v.routes).some(k=>!Object.hasOwn(routes,k)))throw Error('Invalid route');
 const result=emptySave();result.sound=v.sound;
 for(const [route,history] of Object.entries(v.routes)){
  if(!Array.isArray(history)||history.length>500)throw Error('Invalid history');
  result.routes[route]=retainHistory(history.map(x=>readRecord(route,x)));
 }
 if(v.legacy!==null&&v.legacy!==undefined){if(!object(v.legacy))throw Error('Invalid legacy');result.legacy=JSON.parse(JSON.stringify(v.legacy));}
 return result;
}
function recordKey(r){return JSON.stringify([r.level,r.correct,r.total,r.accuracy,r.hints,r.completed,r.unlocks,r.score,r.date??null]);}
export function mergeSave(current,incoming){
 const a=parseSave(current),b=parseSave(incoming),merged=emptySave();merged.sound=a.sound;
 for(const route of Object.keys(routes)){
  const unique=new Map();for(const h of [...(a.routes[route]||[]),...(b.routes[route]||[])])unique.set(recordKey(h),h);
  const rows=[...unique.values()];if(rows.length)merged.routes[route]=retainHistory(rows);
 }
 merged.legacy=a.legacy&&b.legacy?{...b.legacy,...a.legacy}:a.legacy??b.legacy;
 return merged;
}
