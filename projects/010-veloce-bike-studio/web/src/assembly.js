import {Vector3, Quaternion} from 'three';
import {seatOffset} from './equipment.js';

export const headPivot = new Vector3(.43,.49,0);
export const steeringAxis = new Vector3(-.05,.17,0).normalize();
export const steeringRotation = degrees => new Quaternion().setFromAxisAngle(steeringAxis,degrees*Math.PI/180);

// The camera translates with the inspected assembly, preserving viewing distance.
export function inspectionOffset(view,explode,steer=0,height=0){
  const e=explode/100,offset=new Vector3();
  if(['drive','chain','crank','cassette'].includes(view))offset.z=e*.32;
  if(['saddle','rearLight'].includes(view))offset.copy(seatOffset(height)).add(new Vector3(0,e*.3,0));
  if(view==='rear')offset.x=-e*.22;
  if(['cockpit','wheels','phone','bell','frontBrake','frontLight'].includes(view)){
    const anchor=({frontLight:new Vector3(.63,.67,-.105),wheels:new Vector3(.58,0,0),cockpit:new Vector3(.46,.4,0),phone:new Vector3(.635,.69,0),bell:new Vector3(.56,.66,.125),frontBrake:new Vector3(.539,.052,-.055)})[view];
    offset.copy(anchor).sub(headPivot).applyQuaternion(steeringRotation(steer)).add(headPivot).sub(anchor);
    if(view==='wheels')offset.x+=e*.35;
    else offset.y+=e*.21;
  }
  return offset;
}

export function isEffectivelyVisible(object){
  for(let node=object;node;node=node.parent)if(!node.visible)return false;
  return true;
}
