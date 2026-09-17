export const partIds=['seat','lift','back','arms','base'];
export function viewSelection(config,view){
  return {...config,view,selectedPart:partIds.includes(view)?view:view==='fabric'?'seat':null,
    focusRevision:(config.focusRevision||0)+1,demo:false,lever:false,rideEnabled:false,ridePlaying:false};
}
const clamp=v=>Math.max(0,Math.min(1,v));
export function explosionOffsets(value){
  const e=clamp(value/100);
  return {seat:clamp(e/.35)*.26,column:clamp(e/.35)*.075,
    back:clamp((e-.35)/.35)*.22,arms:clamp((e-.35)/.35)*.16,head:clamp((e-.7)/.3)*.13};
}
export const assemblySteps=[
  {value:0,name:'完整装配',text:'查看各部件连接后的整椅。'},
  {value:35,name:'抬起上部',text:'座椅上部离开气杆，查看托盘与伸缩柱的连接。'},
  {value:70,name:'展开靠背与扶手',text:'靠背向后、扶手向两侧展开，观察各自固定位置。'},
  {value:100,name:'移开头枕',text:'头枕沿支杆方向移开；虚线箭头表示展开方向。'},
];
