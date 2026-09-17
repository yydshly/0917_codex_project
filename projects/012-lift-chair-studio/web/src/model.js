export const MIN_HEIGHT=430,MAX_HEIGHT=550,LIFT_RATE=34;
export const initialConfig={lever:false,loaded:false,recline:0,tiltLocked:true,lockAngle:0,armHeight:25,lumbar:20,swivel:0,finish:0,headrest:true,explode:0,view:'full',selectedPart:null,focusRevision:0,inspect:false,demo:false,rideEnabled:false,ridePlaying:false,rideSpeed:.4,rideReset:0,reset:0};
export const finishes=[{name:'苔原绿',en:'MOSS',color:'#567366'},{name:'暖陶棕',en:'CLAY',color:'#b57855'},{name:'石墨灰',en:'GRAPHITE',color:'#424b51'},{name:'燕麦米',en:'OAT',color:'#c5b99f'}];
export const parts=[{id:'seat',name:'承托坐垫',en:'SEAT',description:'带弧度的坐垫、边缘缝线与座下托盘，随气杆升降和椅身旋转。'},
{id:'lift',name:'气杆与拨杆',en:'LIFT',description:'底部套筒保持固定，内杆伸缩托起椅身；抬起拨杆后，承重状态决定上升或下降。'},
{id:'back',name:'靠背与后仰',en:'RECLINE',description:'曲面后壳、开孔、Y 形支撑与腰托滑架组成背部装配。靠背与坐垫按 3 : 1 联动，腰托可沿导轨独立升降。'},
{id:'arms',name:'可调扶手',en:'ARMREST',description:'双侧伸缩立柱、套筒与软质扶手面，随座椅升降，支持 70 mm 调节。'},
{id:'base',name:'五星脚与脚轮',en:'BASE',description:'五条金属支脚、双轮脚轮、转向轴及中央气杆承座。在乘坐滑行模式下，轮叉随移动方向转向，轮胎随位移滚动。'}];
export function createMotion(){return {height:470,recline:0,swivel:0,lever:false,loaded:false,locked:true,time:0,stage:'ready'};}
export function advanceChair(state,config,dt){
  dt=Math.max(0,Math.min(dt,.1));
  let lever=config.lever,loaded=config.loaded,recline=config.tiltLocked?config.lockAngle:config.recline,swivel=config.swivel,locked=config.tiltLocked;
  state.stage='ready';
  if(config.demo){
    state.time=(state.time+dt)%20;const t=state.time;
    if(t<5){lever=true;loaded=false;state.stage='raise';}
    else if(t<10){lever=true;loaded=true;state.stage='lower';}
    else if(t<15){lever=false;recline=22*Math.sin((t-10)/5*Math.PI);locked=false;state.stage='recline';}
    else {lever=false;swivel=(t-15)/5*360;state.stage='swivel';}
  }else state.time=0;
  if(config.explode>0||config.rideEnabled)lever=false;
  if(config.rideEnabled){loaded=true;recline=0;swivel=0;locked=true;}
  if(lever)state.height=Math.max(MIN_HEIGHT,Math.min(MAX_HEIGHT,state.height+(loaded?-1:1)*LIFT_RATE*dt));
  Object.assign(state,{lever,loaded,recline,swivel,locked});
  return state;
}
export function liftStatus(state){
  if(!state.lever)return '拨杆已松开 · 高度保持';
  if(state.height>=MAX_HEIGHT&&!state.loaded)return '已达最高位置';
  if(state.height<=MIN_HEIGHT&&state.loaded)return '已达最低位置';
  return state.loaded?'承重下降中':'空载上升中';
}
