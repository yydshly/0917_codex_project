import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { finishes, wheels, trims } from './config.js';
import { createDrivetrain } from './drivetrain.js';
import {createEquipment,seatOffset} from './equipment.js';
import { motionDelta } from './mechanics.js';
import {createRide,advanceRide,rideReadout} from './riding.js';
import {createCaliper} from './brakes.js';
import {createFittings,createPhoneScreen} from './fittings.js';
import { steeringRotation, inspectionOffset, isEffectivelyVisible } from './assembly.js';

const V = (x,y,z=0) => new THREE.Vector3(x,y,z);
const TAU = Math.PI * 2;

export function createStudio(host, onSelect, onReady, onRide=()=>{}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .01, 80);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor(0x10141b, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','可拖动旋转、滚轮缩放的三维自行车');
  renderer.domElement.setAttribute('role','img');
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xcadcf5,0x23212c,2));
  const key = new THREE.DirectionalLight(0xffffff,4);
  key.position.set(-2,5,3); key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-3,right:3,top:3,bottom:-3});
  key.shadow.bias=-.001; scene.add(key);
  const rimLight = new THREE.DirectionalLight(0x8fb7e9,3);
  rimLight.position.set(2,3,-2);scene.add(rimLight);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.ShadowMaterial({opacity:.3}));
  floor.rotation.x=-Math.PI/2; floor.position.y=-.355;floor.receiveShadow=true; scene.add(floor);
  const grid = new THREE.GridHelper(16,48,0x343943,0x202630);grid.position.y=-.36;scene.add(grid);
  const root = new THREE.Group();scene.add(root);
  const mat = (color,metalness=.3,roughness=.3)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const paint = new THREE.MeshPhysicalMaterial({color:0x20252d,metalness:.48,roughness:.26,clearcoat:.65});
  const accent = mat(0xff681f,.35,.25), carbon=mat(0x151a22,.65,.3), metal=mat(0x939ca8,.9,.27);
  const rubber=mat(0x13171d,.05,.84), trim=mat(0x242831,.1,.65), sidewall=mat(0xaa8250,.05,.8);
  const groups={};
  for(const id of ['frame','drive','cockpit','frontWheel','rearWheel','saddle']){
    groups[id]=new THREE.Group();groups[id].userData.part=id.includes('Wheel')?'wheels':id;root.add(groups[id]);
  }
  function mesh(parent,geo,material,pos){const m=new THREE.Mesh(geo,material);if(pos)m.position.copy(pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function tube(parent,a,b,r,material,r2=r){
    const delta=b.clone().sub(a),m=mesh(parent,new THREE.CylinderGeometry(r2,r,delta.length(),16),material,a.clone().add(b).multiplyScalar(.5));
    m.quaternion.setFromUnitVectors(V(0,1),delta.normalize());return m;
  }
  function path(parent,points,r,material){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,r,10,false),material);}
  function ring(parent,r,t,material,pos){return mesh(parent,new THREE.TorusGeometry(r,t,10,72),material,pos);}
  function box(parent,size,material,pos){return mesh(parent,new THREE.BoxGeometry(...size),material,pos);}
  const rear=V(-.57,0),front=V(.58,0),bb=V(-.13,-.08),seat=V(-.31,.49),head=V(.43,.49),headLow=V(.48,.32);
  const frame=groups.frame;
  tube(frame,bb,seat,.029,paint,.024); tube(frame,seat,head,.027,paint,.021);
  const down=tube(frame,bb,headLow,.04,paint,.035);down.scale.z=.72;
  tube(frame,headLow,head,.035,paint);
  for(const z of [-.057,.057]){tube(frame,bb.clone().add(V(0,0,z)),rear.clone().add(V(0,0,z)),.014,carbon);tube(frame,seat.clone().add(V(0,0,z*.55)),rear.clone().add(V(0,0,z)),.012,carbon);}
  tube(frame,bb,V(-.02,.03),.042,accent,.041);tube(frame,V(.446,.44),V(.466,.36),.036,accent);
  // A real scene graph: each assembly can be transformed independently.
  groups.cockpit.position.copy(head);groups.frontWheel.position.copy(head);
  for(const z of [-.065,.065]){path(groups.cockpit,[headLow.clone().sub(head),V(.51,.16,z).sub(head),front.clone().add(V(0,0,z)).sub(head)],.018,paint);}
  tube(groups.cockpit,V(0,0),V(-.026,.145),.022,carbon);
  tube(groups.cockpit,V(-.026,.125),V(.13,.13),.023,carbon);
  tube(groups.cockpit,V(.13,.13,-.2),V(.13,.13,.2),.018,carbon);
  const brakeLevers=[];
  for(const z of [-.2,.2]){
    path(groups.cockpit,[V(.13,.13,z),V(.24,.13,z),V(.29,.04,z),V(.25,-.07,z),V(.15,-.07,z)],.018,trim);
    const hood=mesh(groups.cockpit,new THREE.SphereGeometry(1,24,16),rubber,V(.245,.13,z));hood.scale.set(.03,.039,.024);hood.rotation.z=-.4;
    const lever=new THREE.Group();lever.position.set(.255,.12,z);groups.cockpit.add(lever);
    path(lever,[V(0,0),V(.023,-.073),V(-.005,-.12)],.006,metal);
    brakeLevers.push({lever,isFront:z<0});
  }
  const phoneScreen=createPhoneScreen();
  const fittings=createFittings(groups,{carbon,metal,trim,rubber,accent},phoneScreen);
  const equipment=createEquipment(groups,{carbon,metal});
  const wheelsRotating=[],rims=[],wheelDetails=[],calipers=[];
  function makeWheel(parent,center,brakeParent,brakeCenter,isFront){
    const spin=new THREE.Group();spin.position.copy(center);parent.add(spin);wheelsRotating.push(spin);
    ring(spin,.329,.018,rubber,V(0,0));
    for(const z of [-.011,.011])ring(spin,.322,.007,sidewall,V(0,0,z));
    const wheelRim=mesh(spin,new THREE.CylinderGeometry(.312,.312,.028,80,1,true),carbon);wheelRim.rotation.x=Math.PI/2;
    for(const z of [-.014,.014]){const rim=mesh(spin,new THREE.RingGeometry(.272,.312,80),carbon,V(0,0,z));rim.material.side=THREE.DoubleSide;rims.push(rim);}
    tube(spin,V(0,0,-.052),V(0,0,.052),.012,metal);
    for(const z of [-.035,.035])ring(spin,.022,.003,metal,V(0,0,z));
    const details=new THREE.Group();spin.add(details);wheelDetails.push(details);
    for(let i=0;i<3;i++){const a=i*TAU/3;const decal=mesh(spin,new THREE.RingGeometry(.282,.3,10,1,a,.32),accent,V(0,0,.015));decal.material.side=THREE.DoubleSide;}
    // Perforated rotor turns with the wheel; the brake caliper stays on the fork/frame.
    const disc=new THREE.Shape();disc.absarc(0,0,.08,0,TAU,false);
    const hubHole=new THREE.Path();hubHole.absarc(0,0,.051,0,TAU,true);disc.holes.push(hubHole);
    for(let i=0;i<24;i++){const a=i*TAU/24,r=i%2?.066:.072,hole=new THREE.Path();hole.absarc(Math.cos(a)*r,Math.sin(a)*r,.0029,0,TAU,true);disc.holes.push(hole);}
    mesh(spin,new THREE.ExtrudeGeometry(disc,{depth:.0016,bevelEnabled:false,curveSegments:64}),metal,V(0,0,-.055));
    for(let i=0;i<6;i++){const a=i*TAU/6;tube(spin,V(Math.cos(a)*.012,Math.sin(a)*.012,-.055),V(Math.cos(a)*.056,Math.sin(a)*.056,-.055),.0032,metal);}
    const cx=isFront?-.041:.041;
    const caliper=createCaliper(brakeParent,brakeCenter,isFront,{carbon,metal});calipers.push({caliper,isFront});
    for(const y of [.044,.063])tube(brakeParent,brakeCenter.clone().add(V(cx,y,-.056)),brakeCenter.clone().add(V(isFront?-.022:.034,y,-.065)),.004,carbon);
    if(!isFront)tube(spin,V(0,0,.046),V(0,0,.117),.01,metal);
    return spin;
  }
  makeWheel(groups.rearWheel,rear,frame,rear,false);makeWheel(groups.frontWheel,front.clone().sub(head),groups.cockpit,front.clone().sub(head),true);
  function updateWheelDetails(depth){
    const radius=.312-depth/1000;
    for(const group of wheelDetails){
      for(const child of [...group.children]){child.geometry.dispose();group.remove(child);}
      for(let i=0;i<28;i++){
        const a=i/28*TAU;
        tube(group,V(Math.cos(a+.25)*.025,Math.sin(a+.25)*.025,i%2?.035:-.035),V(Math.cos(a)*(radius+.002),Math.sin(a)*(radius+.002),0),.0011,metal);
        tube(group,V(Math.cos(a)*(radius-.004),Math.sin(a)*(radius-.004)),V(Math.cos(a)*(radius+.003),Math.sin(a)*(radius+.003)),.0021,metal);
      }
      tube(group,V(0,radius+.006),V(0,radius-.021),.0023,metal);
      tube(group,V(0,radius-.018),V(0,radius-.026),.003,carbon);
    }
  }
  const drive=groups.drive;drive.position.copy(bb);
  const transmission = createDrivetrain(drive);
  const flowGroup=new THREE.Group();scene.add(flowGroup);const flows=[];
  for(let i=0;i<32;i++){
    const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:i%3?0x639ba6:0xfa742c,transparent:true,opacity:.45}));
    flowGroup.add(line);flows.push({line,y:-.23+(i%8)*.16,z:Math.floor(i/8)*.3-.5,phase:i/32});
  }
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=.18;controls.maxDistance=8;controls.maxPolarAngle=Math.PI*.91;
  let config, lastView='',disposed=false,raf,clock=0,previous=0,lastStep=0,tween=true,bellTime=10,ride=createRide(),lastReadout=0;
  let destination=V(.22,.53,2.35),target=V(0,.2),lastWidth=0,lastHeight=0;
  const presets={frontLight:[V(.92,.83,.34),V(.63,.67,-.105)],rearLight:[V(-.76,.78,.34),V(-.415,.66)],seatClamp:[V(-.54,.68,.27),V(-.32,.505)],full:[V(.22,.53,2.35),V(0,.2)],drive:[V(-.27,.12,1.04),V(-.35,-.08,.08)],chain:[V(-.30,.18,.35),V(-.32,.055,.1)],cassette:[V(-.61,.045,.70),V(-.54,-.10,.1)],crank:[V(-.03,.035,.61),V(-.13,-.08,.1)],cockpit:[V(1,.72,.9),V(.46,.4)],rear:[V(-.9,.24,-.75),rear],aero:[V(.1,3.2,.04),V(0,.15)],frame:[V(.2,.6,1.7),V(0,.25)],wheels:[V(1.15,.32,-.9),front],saddle:[V(-.56,1.01,.43),V(-.34,.73)],phone:[V(.41,1.04,.35),V(.635,.69,0)],bell:[V(.40,.86,.39),V(.56,.66,.125)],bottle:[V(.22,.35,.63),V(.005,.17,0)],brakes:[V(-.22,.12,-.36),V(-.529,.052,-.055)],frontBrake:[V(.20,.12,-.34),V(.539,.052,-.055)]};
  function chooseView(view){const p=presets[view]||presets.full;destination.copy(p[0]);target.copy(p[1]);if(view==='full'){const e=(config?.explode||0)/100;destination.z=Math.max(2.35,3.25/(host.clientWidth/host.clientHeight))+e*.65;target.y+=e*.12;}if(view==='drive'&&host.clientWidth/host.clientHeight<1.3)destination.z=.08+.96*1.3/(host.clientWidth/host.clientHeight);const offset=inspectionOffset(view,config?.explode||0,config?.steer||0,config?.seatHeight||0);destination.add(offset);target.add(offset);tween=true;}
  controls.addEventListener('start',()=>{tween=false;});
  const observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);if(Math.abs(w-lastWidth)>50||Math.abs(h-lastHeight)>50){chooseView(config?.view||'full');lastWidth=w;lastHeight=h;}});observer.observe(host);
  function update(next){
    const old=config;config=next;
    if(!old)ride=createRide(next.cadence);
    if(next.rideReset!==old?.rideReset&&old){ride=createRide(next.cadence);onRide(rideReadout(ride,next));}
    brakeLevers.forEach(({lever,isFront})=>lever.rotation.z=-(isFront?next.frontBrake:next.rearBrake)/100*.32);
    calipers.forEach(({caliper,isFront})=>caliper.update(isFront?next.frontBrake:next.rearBrake,next.brakeCutaway));
    if(!old||old.finish!==next.finish){const f=finishes[next.finish];paint.color.set(f.color);paint.metalness=f.metalness;paint.roughness=f.roughness;paint.clearcoat=f.clearcoat;accent.color.set(f.accent);}
    if(!old||old.trim!==next.trim)trim.color.set(trims[next.trim].color);
    if(!old||old.wheel!==next.wheel){sidewall.color.set(wheels[next.wheel].sidewall);for(const r of rims){r.geometry.dispose();r.geometry=new THREE.RingGeometry(.312-wheels[next.wheel].depth/1000,.312,80);}updateWheelDetails(wheels[next.wheel].depth);}
    if(next.view!==lastView || old?.explode!==next.explode || (['cockpit','wheels','phone','bell','frontBrake','frontLight'].includes(next.view)&&old?.steer!==next.steer) || (['saddle','rearLight'].includes(next.view)&&old?.seatHeight!==next.seatHeight)){chooseView(next.view);lastView=next.view;}
    controls.autoRotate=next.turntable;controls.autoRotateSpeed=1.2;
    flowGroup.visible=next.flow;
    for(const id of ['frame','cockpit','frontWheel','rearWheel','saddle'])groups[id].visible=!next.isolate;
    if(old?.bellStrike!==next.bellStrike&&next.bellStrike>0)bellTime=0;
    if((next.step??0)<lastStep)lastStep=next.step??0;
  }
  const raycaster=new THREE.Raycaster();let pointerStart;
  function downEvent(e){pointerStart=[e.clientX,e.clientY];}
  function upEvent(e){if(!pointerStart||Math.hypot(e.clientX-pointerStart[0],e.clientY-pointerStart[1])>5)return;
    const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
    const hit=raycaster.intersectObject(root,true).find(h=>isEffectivelyVisible(h.object));if(hit){let object=hit.object;while(object&&!object.userData.part)object=object.parent;if(object)onSelect(object.userData.part);}}
  renderer.domElement.addEventListener('pointerdown',downEvent);renderer.domElement.addEventListener('pointerup',upEvent);
  const markers={frontLight:[equipment.frontLight,V(.24,.18,-.105)],rearLight:[equipment.rearLight,V(-.45,.66)],seatClamp:[equipment.clamp,V(-.34,.5,.025)],frame:[groups.frame,V(.06,.32)],drive:[groups.drive,V(0,-.03,.12)],cockpit:[groups.cockpit,V(.18,.17)],wheels:[groups.frontWheel,front.clone().sub(head)],saddle:[groups.saddle,V(-.34,.76)],phone:[fittings.phone,V(.205,.22,0)],bell:[fittings.bell,V(0,.035,0)],bottle:[fittings.bottle,V(0,.10,0)],brakes:[groups.frame,V(-.529,.052,-.055)]};
  function animate(time){if(disposed)return;raf=requestAnimationFrame(animate);const dt=Math.min((time-previous)/1000||0,.05);previous=time;clock+=dt;if(!config)return;
    fittings.update(config,dt);equipment.update(config);bellTime+=dt;fittings.strike(bellTime);
    const e=config.explode/100;
    groups.rearWheel.position.x=THREE.MathUtils.lerp(groups.rearWheel.position.x,-e*.22,.12);
    groups.frontWheel.position.x=THREE.MathUtils.lerp(groups.frontWheel.position.x,head.x+e*.35,.12);
    groups.cockpit.position.y=THREE.MathUtils.lerp(groups.cockpit.position.y,head.y+e*.21,.12);
    const lift=seatOffset(config.seatHeight);groups.saddle.position.lerp(lift.add(V(0,e*.3)),.12);
    groups.drive.position.z=THREE.MathUtils.lerp(groups.drive.position.z,e*.32,.12);
    const steering=steeringRotation(config.steer);groups.cockpit.quaternion.copy(steering);groups.frontWheel.quaternion.copy(steering);
    const step=(config.step??0)-lastStep;lastStep=config.step??0;
    const motion=advanceRide(ride,config,dt),inspection=motionDelta(0,0,{playing:false,steps:step,gear:config.gear});
    for(const key of ['crank','rear','pulley','chain'])motion[key]+=inspection[key];
    transmission.update(motion,config.gear);wheelsRotating.forEach(w=>w.rotation.z-=motion.wheel+inspection.rear);
    if(time-lastReadout>100){onRide(rideReadout(ride,config));lastReadout=time;}
    if(config.flow)for(const f of flows){const pts=[];const start=2.6-((clock*.7+f.phase*5.2)%5.2);for(let j=0;j<10;j++){const x=start-j*.055;pts.push(V(x,f.y+Math.exp(-x*x*3)*.13*Math.sin(f.phase*20),f.z));}f.line.geometry.setFromPoints(pts);}
    if(tween){camera.position.lerp(destination,.085);controls.target.lerp(target,.085);if(camera.position.distanceTo(destination)<.002)tween=false;}controls.update();root.updateMatrixWorld(true);
    for(const [id,[group,point]] of Object.entries(markers)){const pin=host.querySelector(`[data-pin="${id}"]`);if(!pin)continue;const p=group.localToWorld(point.clone()).project(camera);pin.style.left=`${(p.x+1)*.5*host.clientWidth}px`;pin.style.top=`${(-p.y+1)*.5*host.clientHeight}px`;pin.style.visibility=['chain','crank','cassette','phone','bell','bottle','saddle','brakes','frontBrake','seatClamp','frontLight','rearLight'].includes(config.view)||(['phone','bell'].includes(id)&&config.view!=='cockpit')||(id==='cockpit'&&config.view==='cockpit')||!isEffectivelyVisible(group)||(config.isolate&&id!=='drive')||p.z>1||p.z< -1||Math.abs(p.x)>.9||Math.abs(p.y)>.88?'hidden':'visible';}
    renderer.render(scene,camera);
  }
  camera.position.copy(destination);controls.target.copy(target);raf=requestAnimationFrame(animate);onReady();
  return {update,reset(){ride=createRide();transmission.reset();wheelsRotating.forEach(w=>w.rotation.z=0);lastStep=0;chooseView('full');},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',downEvent);renderer.domElement.removeEventListener('pointerup',upEvent);const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment.dispose();phoneScreen.dispose();renderer.dispose();renderer.domElement.remove();}};
}
