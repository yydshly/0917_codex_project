import {motionDelta,TAU,FRONT_TEETH,rearTeeth} from './mechanics.js';
export const CIRCUMFERENCE=2.133;
export const cadenceSpeed=(rpm,gear=5)=>rpm/60*FRONT_TEETH/rearTeeth(gear)*CIRCUMFERENCE;
const clamp=value=>Math.max(0,Math.min(1,(value||0)/100));
export function createRide(cadence=78){
  return {speed:cadenceSpeed(cadence),distance:0,brakeDistance:0,wasBraking:false,actualCadence:cadence,mode:'pedaling'};
}
// Deliberately simple, level-ground teaching model. No tire slip or stopping-distance prediction.
export function advanceRide(state,config,seconds){
  const front=clamp(config.frontBrake),rear=clamp(config.rearBrake),braking=front+rear>0;
  if(braking&&!state.wasBraking)state.brakeDistance=0;
  state.wasBraking=braking;
  const motion={crank:0,rear:0,pulley:0,chain:0,wheel:0};
  const driveEnabled=config.pedaling!==false&&!braking&&config.cadence>0;
  if(config.playing&&!config.seatClampOpen){
    let remaining=Math.max(0,Math.min(seconds,.25))*(config.slow?.15:1);
    while(remaining>1e-10){
      const dt=Math.min(remaining,1/120),before=state.speed,target=cadenceSpeed(config.cadence,config.gear);
      const resistance=.025+.003*before*before;
      const acceleration=driveEnabled&&before<=target?Math.min(1.8,(target-before)*2+resistance):0;
      state.speed=Math.max(0,before+(acceleration-resistance-front*4-rear*2.5)*dt);
      if(state.speed<.015&&(!driveEnabled||braking))state.speed=0;
      const distance=(before+state.speed)*.5*dt;
      state.distance+=distance;if(braking)state.brakeDistance+=distance;
      motion.wheel+=distance/CIRCUMFERENCE*TAU;
      const rpm=driveEnabled?Math.min(config.cadence,(before+state.speed)*.5/CIRCUMFERENCE*60*rearTeeth(config.gear)/FRONT_TEETH):0;
      const drive=motionDelta(rpm,dt,{gear:config.gear});
      for(const key of ['crank','rear','pulley','chain'])motion[key]+=drive[key];
      remaining-=dt;
    }
  }
  state.actualCadence=driveEnabled?Math.min(config.cadence,state.speed/CIRCUMFERENCE*60*rearTeeth(config.gear)/FRONT_TEETH):0;
  state.mode=braking?(state.speed===0?'held':'braking'):state.speed===0?'stopped':driveEnabled?'pedaling':'coasting';
  return motion;
}
export function rideReadout(state,config){
  const speed=state.speed*3.6;
  return {speed,actualCadence:state.actualCadence,mode:state.mode,brakeDistance:state.brakeDistance,
    power:config.pedaling!==false&&!(config.frontBrake||config.rearBrake)?(.025+.003*state.speed**2)*83*state.speed:0};
}
