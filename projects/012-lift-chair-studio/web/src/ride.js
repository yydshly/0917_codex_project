export const RIDE_RANGE=.58;
export function createRideMotion(){return {phase:0,x:0,velocity:0,distance:0,travel:0};}
// A prescribed coasting path, not a force, friction or human propulsion simulation.
export function advanceRide(state,{rideEnabled,ridePlaying,rideSpeed=.4},dt){
  dt=Math.max(0,Math.min(dt,.1));
  if(!rideEnabled){Object.assign(state,createRideMotion());return state;}
  const before=state.x;
  if(ridePlaying)state.phase=(state.phase+dt*Math.max(.1,Math.min(.7,rideSpeed))/RIDE_RANGE)%(2*Math.PI);
  state.x=RIDE_RANGE*Math.sin(state.phase);
  state.travel=state.x-before;
  state.velocity=dt?state.travel/dt:0;
  state.distance+=Math.abs(state.travel);
  return state;
}
export function enterRide(config){return {...config,rideEnabled:true,ridePlaying:false,view:'full',selectedPart:null,inspect:false,
  demo:false,lever:false,loaded:true,explode:0,recline:0,lockAngle:0,tiltLocked:true,swivel:0,armHeight:25,
  focusRevision:(config.focusRevision||0)+1};}
