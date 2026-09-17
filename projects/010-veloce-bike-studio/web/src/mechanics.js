// Geometry units are metres. This is a kinematic teaching model, not a contact solver.
export const CHAIN_PITCH = .0127;
export const FRONT_TEETH = 54;
export const REAR_TEETH = 16;
export const CASSETTE_TEETH = [11,12,13,14,15,16,17,19,21,24,28,32];
export const rearTeeth = (gear=5) => CASSETTE_TEETH[Math.max(0,Math.min(11,Math.round(gear)))];
export const PULLEY_TEETH = 11;
export const TAU = Math.PI * 2;
export const pitchRadius = teeth => CHAIN_PITCH / (2 * Math.sin(Math.PI / teeth));
const modulo = (value, length) => ((value % length) + length) % length;

/** Closed route built from common tangents and oriented circular wraps.
 * Unlike a smoothing spline, the loaded spans are straight and touch the sprockets.
 * dir=-1 is clockwise when viewed from the drivetrain side.
 */
export function chainRoute(circles) {
  const tangents = circles.map((a,i) => {
    const b=circles[(i+1)%circles.length],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
    const angle=Math.atan2(dy,dx)-Math.asin((b.dir*b.r-a.dir*a.r)/d);
    const nx=-Math.sin(angle),ny=Math.cos(angle);
    return {a:{x:a.x-a.dir*nx*a.r,y:a.y-a.dir*ny*a.r},b:{x:b.x-b.dir*nx*b.r,y:b.y-b.dir*ny*b.r}};
  });
  const segments=[];
  circles.forEach((c,i)=>{
    const incoming=tangents[(i+circles.length-1)%circles.length].b,outgoing=tangents[i].a;
    const start=Math.atan2(incoming.y-c.y,incoming.x-c.x),end=Math.atan2(outgoing.y-c.y,outgoing.x-c.x);
    const sweep=c.dir*modulo(c.dir*(end-start),TAU);
    segments.push({kind:'arc',c,start,sweep,length:Math.abs(sweep)*c.r});
    const {a,b}=tangents[i];segments.push({kind:'line',a,b,length:Math.hypot(b.x-a.x,b.y-a.y)});
  });
  const length=segments.reduce((sum,s)=>sum+s.length,0);
  function sample(distance){
    let rest=modulo(distance,length);
    for(const segment of segments){
      if(rest<=segment.length){
        const u=segment.length?rest/segment.length:0;
        if(segment.kind==='line')return {x:segment.a.x+(segment.b.x-segment.a.x)*u,y:segment.a.y+(segment.b.y-segment.a.y)*u};
        const a=segment.start+segment.sweep*u;return {x:segment.c.x+Math.cos(a)*segment.c.r,y:segment.c.y+Math.sin(a)*segment.c.r};
      }
      rest-=segment.length;
    }
    return {...segments[0].c};
  }
  return {length,segments,sample};
}

const baseCircles = [
  {id:'chainring',x:0,y:0,r:pitchRadius(FRONT_TEETH),dir:-1},
  {id:'tension',x:-.405,y:-.13,r:pitchRadius(PULLEY_TEETH),dir:-1},
  {id:'guide',x:-.46,y:-.048,r:pitchRadius(PULLEY_TEETH),dir:1},
  {id:'cassette',x:-.44,y:.08,r:pitchRadius(REAR_TEETH),dir:-1},
];
// Adjust the tension pulley slightly so the closed route fits an even number of
// nominal pitches. This avoids a shortened final link at the loop seam.
function fitChainLength(circles){
  const fitted=circles.map(c=>({...c}));
  const target=Math.round(chainRoute(fitted).length/CHAIN_PITCH/2)*2*CHAIN_PITCH;
  let low=-.18,high=-.09;
  for(let i=0;i<48;i++){
    fitted[1].y=(low+high)/2;
    if(chainRoute(fitted).length>target)low=fitted[1].y;
    else high=fitted[1].y;
  }
  return fitted;
}
export const drivetrainCircles = fitChainLength(baseCircles);
export function motionDelta(cadence,dt,{playing=true,slow=false,steps=0,gear=5}={}) {
  const revolutions=(playing?cadence/60*dt*(slow?.15:1):0)+steps/FRONT_TEETH;
  return {crank:revolutions*TAU,rear:revolutions*TAU*FRONT_TEETH/rearTeeth(gear),
    pulley:revolutions*TAU*FRONT_TEETH/PULLEY_TEETH,chain:revolutions*FRONT_TEETH*CHAIN_PITCH};
}

// Pins advance by chord distance, not by arc length. The lower jockey wheel
// takes up the small polygonal variation so all 122 rigid links close the loop.
export const LINK_COUNT=122;
export function solveChain(gear=5,phase=0){
  const rearZ=.1+(5-gear)*.0044;
  const circles=baseCircles.map(c=>({...c,z:c.id==='chainring'?.1:rearZ}));
  circles[3].r=pitchRadius(rearTeeth(gear));
  // Guide center stays clear of the largest cog; the rigid cage pivots below it.
  function evaluate(y,collect=false){
    circles[1].x=circles[2].x+Math.cos(y)*.13;
    circles[1].y=circles[2].y+Math.sin(y)*.13;
    const route=chainRoute(circles);
    const starts=[];let total=0;
    route.segments.forEach(s=>{starts.push(total);total+=s.length;});
    function sample(d){
      d=modulo(d,route.length);
      let i=0;while(i<7&&d>starts[i]+route.segments[i].length)i++;
      const s=route.segments[i],u=(d-starts[i])/s.length,c=circles[Math.floor(i/2)],next=circles[(Math.floor(i/2)+1)%4];
      if(s.kind==='line')return {x:s.a.x+(s.b.x-s.a.x)*u,y:s.a.y+(s.b.y-s.a.y)*u,z:c.z+(next.z-c.z)*u};
      const angle=s.start+s.sweep*u;return {x:c.x+Math.cos(angle)*c.r,y:c.y+Math.sin(angle)*c.r,z:c.z};
    }
    let d=modulo(phase,route.length),start=d;const points=[];
    for(let i=0;i<LINK_COUNT;i++){
      const a=sample(d);if(collect)points.push(a);
      let step=CHAIN_PITCH;
      for(let j=0;j<7;j++){
        const b=sample(d+step),length=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z);
        step+=CHAIN_PITCH-length;
      }
      d+=step;
    }
    return {error:d-start-route.length,points,route};
  }
  let low=-1.55,high=-.65,result;
  for(let i=0;i<23;i++){
    const y=(low+high)/2;result=evaluate(y);
    if(result.error<0)low=y;else high=y;
  }
  result=evaluate((low+high)/2,true);
  return {...result,circles};
}
