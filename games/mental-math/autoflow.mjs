// A tick-driven queue: a pause stops the remaining delay rather than resetting it.
export function createAutoAdvance(){
 let pending=null;
 return {
  schedule(delay,action){pending={remaining:Math.max(0,delay),action};},
  clear(){pending=null;},
  tick(delta,blocked=false){if(!pending||blocked)return;pending.remaining-=Math.max(0,delta);if(pending.remaining<=0){const action=pending.action;pending=null;action();}},
  get pending(){return pending!==null;}
 };
}
export const INPUT_IDLE_MS=1000;
export function missionContinuation({lives,practice,number,total,unlocks}){
 if(lives===0)return 'over';
 if(number===total)return 'complete';
 if(practice)return 'practice';
 return unlocks?'next':'repeat';
}
