import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {finishes,createMotion,advanceChair,initialConfig} from './model.js';
import {backShellGeometry,backSpineGeometry,shellOutline,shellRear} from './back-shell.js';
import {explosionOffsets} from './inspection.js';
import {inspectionOverlay,assemblyGuide} from './inspection-overlay.js';
import {createRideMotion,advanceRide} from './ride.js';
import {createRider,createRideFloor} from './rider.js';
import {seatForm,backForm,headForm,lumbarForm,backSeamX,surfacePoint,cushionFront,cushionGeometry,castLegGeometry,fabricTextures,applyFabricMapping} from './surfaces.js';
const V=(x,y,z=0)=>new THREE.Vector3(x,y,z);
const TAU=Math.PI*2;

export function createChair(host,onReadout,onSelect){
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.01,30);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.VSMShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.90;
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','可旋转缩放的升降椅三维模型');host.appendChild(renderer.domElement);
  const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
  scene.environmentIntensity=.48;
  scene.add(new THREE.HemisphereLight(0xfff9ec,0x62685e,.65));
  const light=new THREE.DirectionalLight(0xfff4dc,2.8);light.position.set(-2.4,5,2.8);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-1.35,right:1.35,top:1.7,bottom:-1.2});light.shadow.normalBias=.001;light.shadow.bias=-.00015;light.shadow.radius=12;light.shadow.blurSamples=12;scene.add(light);
  const rim=new THREE.DirectionalLight(0xe2eeff,1.35);rim.position.set(2,2,-2);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.14}));floor.rotation.x=-Math.PI/2;floor.position.y=.002;floor.receiveShadow=true;scene.add(floor);
  const plinth=new THREE.Mesh(new THREE.CylinderGeometry(.56,.57,.014,100),new THREE.MeshStandardMaterial({color:0xc4c5b9,roughness:.94}));plinth.position.y=-.008;plinth.receiveShadow=true;scene.add(plinth);
  const rideFloor=createRideFloor(scene);
  const mat=(color,metalness=0,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const dark=mat(0x222a28,.08,.55),metal=mat(0x8b9591,.88,.31),chrome=mat(0xbfc7c4,1,.18),rubber=mat(0x171d1b,0,.92),seam=mat(0x34473d,0,.93),thread=mat(0x839182,0,.88);
  const textiles=fabricTextures();
  // Bump strength here is a shading parameter, not a displacement in metres.
  const fabric=new THREE.MeshPhysicalMaterial({color:finishes[0].color,map:textiles[0],roughness:1,roughnessMap:textiles[2],bumpMap:textiles[1],bumpScale:.32,sheen:.38,sheenRoughness:1,specularIntensity:.22});
  applyFabricMapping(fabric);
  function setFinish(index){
    fabric.color.set(finishes[index].color);
    seam.color.copy(fabric.color).multiplyScalar(.74);
    thread.color.copy(fabric.color).lerp(new THREE.Color(0xe4e1c9),.28);
    fabric.sheenColor.copy(fabric.color).lerp(new THREE.Color(0xffffff),.20);
  }
  setFinish(0);
  const root=new THREE.Group();scene.add(root);
  const group=(parent,id)=>{const g=new THREE.Group();g.userData.part=id;parent.add(g);return g;};
  const mesh=(parent,geometry,material,p=V(0,0))=>{const m=new THREE.Mesh(geometry,material);m.position.copy(p);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  function rod(parent,a,b,r,material,r2=r){const d=b.clone().sub(a),m=mesh(parent,new THREE.CylinderGeometry(r2,r,d.length(),20),material,a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1),d.normalize());return m;}
  function curve(parent,points,r,material){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),64,r,10,false),material);}
  function roundShape(w,h,r){const s=new THREE.Shape(),x=w/2,y=h/2;s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);s.lineTo(-x+r,y);s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);return s;}
  function pad(parent,w,d,h,r,material,p){const geo=new THREE.ExtrudeGeometry(roundShape(w,d,r),{depth:h,bevelEnabled:true,bevelSize:.007,bevelThickness:.006,bevelSegments:3,curveSegments:16});geo.rotateX(-Math.PI/2);return mesh(parent,geo,material,p);}
  function bolt(parent,p,axis='y'){const b=mesh(parent,new THREE.CylinderGeometry(.006,.006,.004,6),metal,p);if(axis==='z')b.rotation.x=Math.PI/2;if(axis==='x')b.rotation.z=Math.PI/2;return b;}
  function upholstery(parent,form,p,vertical=false){
    const g=new THREE.Group();g.position.copy(p);if(vertical)g.rotation.x=Math.PI/2;parent.add(g);
    mesh(g,cushionGeometry(form),fabric);
    const points=Array.from({length:257},(_,i)=>surfacePoint(form,i/256*TAU,.07));curve(g,points,.0013,seam);
    const stitchPath=new THREE.CatmullRomCurve3(Array.from({length:256},(_,i)=>surfacePoint(form,i/256*TAU,.30)),true);
    stitchPath.arcLengthDivisions=1200;
    const count=Math.ceil(stitchPath.getLength()/.0045);
    const stitches=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0003,.0003,.0024,5),thread,count),dummy=new THREE.Object3D();
    for(let i=0;i<count;i++){dummy.position.copy(stitchPath.getPointAt(i/count));dummy.position.y+=.0003;dummy.quaternion.setFromUnitVectors(V(0,1),stitchPath.getTangentAt(i/count));dummy.updateMatrix();stitches.setMatrixAt(i,dummy.matrix);}g.add(stitches);
    return g;
  }
  const base=group(root,'base');
  const casters=[];
  mesh(base,new THREE.CylinderGeometry(.047,.065,.09,40),dark,V(0,.116));
  for(let i=0;i<5;i++){
    const angle=i*TAU/5+.25,leg=group(base,'base');leg.rotation.y=angle;
    mesh(leg,castLegGeometry(),metal);
    rod(leg,V(0,.074,.32),V(0,.05,.32),.01,chrome);
    const caster=group(leg,'base');caster.position.set(0,.036,.325);caster.rotation.y=.4;
    const wheels=[];
    for(const x of [-.022,.022]){const wheel=group(caster,'base');wheel.position.x=x;wheels.push(wheel);
      const w=mesh(wheel,new THREE.CylinderGeometry(.033,.033,.019,40),rubber);w.rotation.z=Math.PI/2;
      const hub=mesh(wheel,new THREE.CylinderGeometry(.022,.022,.020,32),dark);hub.rotation.z=Math.PI/2;
      const cap=mesh(wheel,new THREE.CylinderGeometry(.010,.010,.021,24),metal);cap.rotation.z=Math.PI/2;
      for(const side of [-1,1]){const bead=mesh(wheel,new THREE.TorusGeometry(.027,.0025,8,32),rubber,V(side*.008,0));bead.rotation.y=Math.PI/2;
        for(let k=0;k<3;k++){const a=k*TAU/3;rod(wheel,V(side*.011,Math.cos(a)*.012,Math.sin(a)*.012),V(side*.011,Math.cos(a)*.020,Math.sin(a)*.020),.0013,metal);}}
    }
    casters.push({caster,wheels,angle});
    rod(caster,V(-.025,.002),V(.025,.002),.006,metal);pad(caster,.035,.044,.021,.009,dark,V(0,.012));
  }
  const column=group(root,'lift');
  mesh(column,new THREE.CylinderGeometry(.028,.031,.19,40),dark,V(0,.208));
  mesh(column,new THREE.CylinderGeometry(.032,.032,.012,40),metal,V(0,.309));
  for(const y of [.157,.178,.295])mesh(column,new THREE.CylinderGeometry(.0315,.0315,.003,40),rubber,V(0,y));
  const piston=mesh(column,new THREE.CylinderGeometry(.014,.014,1,32),chrome);
  const collar=mesh(column,new THREE.CylinderGeometry(.023,.023,.012,40),dark);
  const upper=group(root,'seat'),pan=group(upper,'seat');
  mesh(pan,cushionGeometry({...seatForm,width:.465,length:.43,thickness:.026,relief:undefined}),dark,V(0,-.012,.02));
  upholstery(pan,seatForm,V(0,.035,.025));
  for(const x of [-.175,.175]){rod(pan,V(x,-.034,-.14),V(x,-.034,.14),.006,metal);for(const z of [-.13,.12])bolt(pan,V(x,-.043,z));}
  const chassis=group(upper,'lift');pad(chassis,.18,.21,.025,.023,dark,V(0,-.077));
  // Visible teaching linkage: fixed chassis, seat axle, two-link articulation and sliding lock pin.
  for(const x of [-.109,.109])mesh(chassis,cushionGeometry({width:.017,length:.13,thickness:.065,corner:4},48,20),dark,V(x,-.038,.015));
  rod(chassis,V(-.147,0,0),V(.147,0,0),.012,metal);
  for(const x of [-.14,.14]){const cap=mesh(chassis,new THREE.CylinderGeometry(.021,.021,.012,32),metal,V(x,0,0));cap.rotation.z=Math.PI/2;bolt(chassis,V(x+(x>0?.008:-.008),0,0),'x');}
  const lockMaterial=mat(0xb68a48,.5,.35);
  const lockPin=mesh(chassis,new THREE.CylinderGeometry(.0065,.0065,.041,24),lockMaterial,V(-.139,0,0));lockPin.rotation.z=Math.PI/2;
  const lockHandle=group(chassis,'lift');lockHandle.position.set(-.10,-.045,-.038);
  rod(lockHandle,V(0,0),V(-.095,-.012,0),.005,metal);pad(lockHandle,.049,.033,.012,.008,dark,V(-.097,-.018,0));
  const linkage=[];
  for(const x of [-.123,.123]){
    const a=V(x,-.065,.042),b=V(x,-.026,.137);
    const links=[mesh(chassis,new THREE.CylinderGeometry(.0045,.0045,1,16),metal),mesh(chassis,new THREE.CylinderGeometry(.0045,.0045,1,16),metal)];
    const joints=[a,b,V(0,0)].map(()=>{const m=mesh(chassis,new THREE.CylinderGeometry(.008,.008,.012,20),dark);m.rotation.z=Math.PI/2;return m;});
    linkage.push({a,b,links,joints});
  }
  for(const x of [-.062,.062])for(const z of [-.065,.065])bolt(chassis,V(x,-.079,z));
  const spring=mesh(chassis,new THREE.CylinderGeometry(.032,.032,.065,32),dark,V(0,-.085,.098));spring.rotation.x=Math.PI/2;
  for(let i=0;i<16;i++){const a=i*TAU/16;rod(chassis,V(Math.cos(a)*.033,-.085+Math.sin(a)*.033,.095),V(Math.cos(a)*.033,-.085+Math.sin(a)*.033,.128),.002,rubber);}
  const lever=group(chassis,'lift');lever.position.set(.08,-.048,.04);rod(lever,V(0,0),V(.178,-.008,.035),.006,metal);pad(lever,.061,.044,.014,.012,dark,V(.18,-.013,.035));
  const leverAccent=mat(0xd5a461,.5,.3);rod(lever,V(.169,.005,.03),V(.191,.005,.03),.002,leverAccent);
  bolt(chassis,V(.08,-.048,.044),'z');
  for(let i=0;i<5;i++)rod(lever,V(.162+i*.008,.003,.020),V(.162+i*.008,.003,.049),.0009,rubber);
  const backPivot=group(pan,'back');backPivot.position.set(0,.015,-.175);
  const back=group(backPivot,'back');
  const shellMaterial=mat(0x343e3a,.06,.68),spineMaterial=mat(0x66726b,.54,.43);
  curve(back,[V(0,-.045,.02),V(0,.035,-.074),V(0,.10,-.082),V(0,.19,shellRear(0,.19)-.016)],.022,dark);
  mesh(back,backShellGeometry(),shellMaterial);
  mesh(back,backSpineGeometry(),spineMaterial);
  const edge=shellOutline().getPoints(160).map(p=>V(p.x,p.y,shellRear(p.x,p.y)+.007));curve(back,edge,.0017,rubber);
  function rearFastener(x,y){
    const z=shellRear(x,y)-.025;
    const washer=mesh(back,new THREE.CylinderGeometry(.012,.012,.004,32),dark,V(x,y,z));washer.rotation.x=Math.PI/2;
    const screw=mesh(back,new THREE.CylinderGeometry(.006,.006,.005,6),metal,V(x,y,z-.003));screw.rotation.x=Math.PI/2;
    rod(back,V(x-.0025,y,z-.006),V(x+.0025,y,z-.006),.00075,rubber);
  }
  for(const sign of [-1,1])rearFastener(sign*.128,.538);
  rearFastener(0,.126);
  upholstery(back,backForm,V(0,.35,-.008),true);
  for(const sign of [-1,1]){
    const points=Array.from({length:120},(_,i)=>{const y=.12+i/119*.455,x=sign*backSeamX((.35-y)/.275);return V(x,y,-.0075+cushionFront(backForm,x,.35-y));});
    curve(back,points,.00045,seam);
    const stitchPath=new THREE.CatmullRomCurve3(points),count=Math.floor(stitchPath.getLength()/.005);
    const stitches=new THREE.InstancedMesh(new THREE.CylinderGeometry(.00025,.00025,.0026,5),thread,count),dummy=new THREE.Object3D();
    for(let i=0;i<count;i++){dummy.position.copy(stitchPath.getPointAt(i/count));dummy.position.z+=.0004;dummy.quaternion.setFromUnitVectors(V(0,1),stitchPath.getTangentAt(i/count));dummy.updateMatrix();stitches.setMatrixAt(i,dummy.matrix);}back.add(stitches);
  }

  const lumbar=group(back,'back');
  for(const x of [-.095,.095]){
    rod(back,V(x,.145,-.082),V(x,.305,-.082),.0055,metal);
    for(const y of [.143,.307]){const cap=mesh(back,new THREE.CylinderGeometry(.011,.011,.017,24),dark,V(x,y,-.081));rod(back,V(x,y,-.076),V(x,y,shellRear(x,y)+.003),.006,dark);}
    pad(lumbar,.027,.033,.031,.007,dark,V(x,-.016,-.084));
  }
  const carriage=mesh(lumbar,cushionGeometry({width:.247,length:.043,thickness:.023,corner:4.5}),dark,V(0,0,-.099));carriage.rotation.x=Math.PI/2;
  for(let i=0;i<3;i++)rod(lumbar,V(-.041,-.008+i*.008,-.111),V(.041,-.008+i*.008,-.111),.0013,rubber);
  curve(lumbar,[V(.095,0,-.089),V(.173,0,-.081),V(.218,0,-.058),V(.23,0,-.018)],.008,dark);
  for(let i=0;i<6;i++)rod(back,V(.114,.163+i*.024,-.065),V(.122,.163+i*.024,-.065),.0009,metal);
  upholstery(lumbar,lumbarForm,V(0,0,.029),true);
  const lumbarDial=mesh(lumbar,new THREE.CylinderGeometry(.024,.024,.023,24),dark,V(.23,0,-.018));lumbarDial.rotation.z=Math.PI/2;bolt(lumbar,V(.245,0,-.018),'x');
  for(let i=0;i<20;i++){const a=i/20*TAU;rod(lumbar,V(.22,Math.cos(a)*.024,-.018+Math.sin(a)*.024),V(.239,Math.cos(a)*.024,-.018+Math.sin(a)*.024),.001,rubber);}
  const head=group(back,'back');
  for(const x of [-.075,.075]){
    const mount=mesh(back,cushionGeometry({width:.038,length:.045,thickness:.020,corner:4}),dark,V(x,.605,-.038));mount.rotation.x=Math.PI/2;
    rod(back,V(x,.610,-.026),V(x,.64,-.026),.012,dark);
    rod(head,V(x,.602,-.026),V(x,.695,-.026),.008,chrome);
    for(let i=0;i<3;i++)rod(head,V(x-.004,.65+i*.012,-.034),V(x+.004,.65+i*.012,-.034),.0007,dark);
  }
  upholstery(head,headForm,V(0,.739,-.015),true);
  for(const x of [-.075,.075]){const hinge=mesh(head,new THREE.CylinderGeometry(.015,.015,.022,24),dark,V(x,.69,-.026));hinge.rotation.z=Math.PI/2;bolt(head,V(x+.012,.69,-.026),'x');}
  const armAssemblies=[];
  for(const sign of [-1,1]){
    const arm=group(pan,'arms');arm.position.x=sign*.274;
    curve(arm,[V(-sign*.09,-.014,-.018),V(0,-.025,-.018),V(0,.07,-.018),V(0,.16,-.018)],.018,dark);
    const adjustable=group(arm,'arms');rod(adjustable,V(0,.08,-.018),V(0,.216,-.018),.010,chrome);
    pad(adjustable,.078,.255,.018,.032,dark,V(0,.21,.02));
    upholstery(adjustable,{width:.077,length:.253,thickness:.025,corner:4,warp:(u,v)=>-.006*v*v},V(0,.237,.02));
    for(let i=0;i<6;i++)rod(adjustable,V(sign*.010,.10+i*.012,-.016),V(sign*.010,.10+i*.012,-.021),.0006,dark);
    bolt(arm,V(sign*.02,.12,-.018),'x');armAssemblies.push({arm,adjustable,sign});
  }
  const selectable=[],highlightMaterials=new Map();
  root.traverse(o=>{if(!o.isMesh)return;let p=o;while(p&&!p.userData.part)p=p.parent;if(p)selectable.push({mesh:o,part:p.userData.part,original:o.material});});
  function highlight(){
    highlightMaterials.forEach((m,original)=>{m.color.copy(original.color);if(m.sheenColor)m.sheenColor.copy(original.sheenColor);});
    for(const item of selectable){
      const active=config.inspect&&item.part===config.selectedPart;
      if(active&&!highlightMaterials.has(item.original)){
        const m=item.original.clone();m.onBeforeCompile=item.original.onBeforeCompile;m.customProgramCacheKey=item.original.customProgramCacheKey;
        m.emissive?.setHex(0x73975f);m.emissiveIntensity=.15;highlightMaterials.set(item.original,m);
      }
      item.mesh.material=active?highlightMaterials.get(item.original):item.original;
    }
  }
  const overlay=inspectionOverlay(host,camera,onSelect);
  const rider=createRider(upper);
  const guides=Array.from({length:4},()=>assemblyGuide(scene));
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=.35;controls.maxDistance=4.5;controls.maxPolarAngle=Math.PI*.49;
  const presets={fabric:[V(.57,.77,.69),V(.025,.48,.055)],full:[V(1.50,1.20,2.05),V(0,.66)],lift:[V(-.66,.29,.76),V(0,.37,.018)],seat:[V(.95,1.07,1.04),V(0,.54,.01)],back:[V(-1.05,1.04,-1.14),V(0,.82,-.2)],arms:[V(1.05,.98,.86),V(.19,.63)],base:[V(.86,.51,.92),V(0,.12)]};
  let config={...initialConfig},motion=createMotion(),ride=createRideMotion(),disposed=false,raf,previous=0,lastReadout=0,lastReadoutKey='',lastReset=0,tween=true;
  let destination=presets.full[0].clone(),target=presets.full[1].clone();camera.position.copy(destination);controls.target.copy(target);
  function focus(view){
    controls.maxDistance=config.rideEnabled?8:4.5;
    controls.maxPolarAngle=Math.PI*(view==='lift'?.54:.49);
    const p=presets[view]||presets.full;destination.copy(p[0]);target.copy(p[1]);
    const aspect=host.clientWidth/host.clientHeight;
    if(['seat','back','arms','fabric','lift'].includes(view)){
      const offsets=explosionOffsets(config.explode);
      const offset=V(view==='arms'?offsets.arms:0,0,view==='back'?-offsets.back:0);
      const angle=(config.demo?motion.swivel:config.swivel)*Math.PI/180;
      for(const point of [target,destination]){
        point.add(offset).applyAxisAngle(V(0,1),angle);
        point.y+=(motion.height-470)/1000+offsets.seat;
      }
      // Keep the detail within the narrower mobile canvas.
      if(aspect<1)destination.sub(target).multiplyScalar(Math.min(1.45,1/aspect)).add(target);
    }
    if(view==='full'){
      const e=config.explode/100,tan=Math.tan(camera.fov*Math.PI/360);
      const distance=Math.max((.70+e*.21)/tan,(.49+e*.16)/(tan*aspect))*1.13;
      const direction=destination.clone().sub(target).normalize();target.y=.66+e*.17;destination.copy(target).addScaledVector(direction,distance);
      if(config.rideEnabled){const rideDistance=Math.max(.84/tan,1.10/(tan*aspect))*1.06;target.set(0,.64,.08);destination.copy(target).addScaledVector(V(.5,.34,1).normalize(),rideDistance);}
    }
    tween=true;
  }
  controls.addEventListener('start',()=>tween=false);
  const resize=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);focus(config.view);});resize.observe(host);
  const raycaster=new THREE.Raycaster();let start;
  const down=e=>start=[e.clientX,e.clientY];
  const up=e=>{if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const hit=raycaster.intersectObject(root,true).find(({object})=>{for(let n=object;n;n=n.parent)if(!n.visible)return false;return true;});if(hit){let o=hit.object;while(o&&!o.userData.part)o=o.parent;if(o)onSelect(o.userData.part);}};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);
  function update(next){const old=config;config=next;if(config.reset!==lastReset){motion=createMotion();ride=createRideMotion();lastReset=config.reset;focus(config.view);onReadout({...motion});}if(old.rideReset!==next.rideReset||old.rideEnabled!==next.rideEnabled){ride=createRideMotion();lastReadoutKey='';}if(old.finish!==next.finish)setFinish(next.finish);if(old.view!==next.view||old.explode!==next.explode||old.focusRevision!==next.focusRevision||old.rideEnabled!==next.rideEnabled)focus(next.view);if(old.inspect!==next.inspect||old.selectedPart!==next.selectedPart||old.finish!==next.finish)highlight();head.visible=config.headrest;}
  function animate(time){if(disposed)return;raf=requestAnimationFrame(animate);const dt=Math.min((time-previous)/1000||0,.05);previous=time;advanceChair(motion,config,dt);const e=config.explode/100;
    advanceRide(ride,config,dt);root.position.x=ride.x;rider.visible=rideFloor.visible=config.rideEnabled;plinth.visible=!config.rideEnabled;
    for(const {caster,wheels,angle} of casters){
      if(config.rideEnabled){
        if(Math.abs(ride.velocity)>.001){const heading=(ride.velocity>0?Math.PI/2:-Math.PI/2)-angle,delta=heading-caster.rotation.y;caster.rotation.y+=Math.atan2(Math.sin(delta),Math.cos(delta))*(1-Math.exp(-18*dt));}
        const alignment=Math.sin(angle+caster.rotation.y);for(const wheel of wheels)wheel.rotation.x+=ride.travel*alignment/.033;
      }else{caster.rotation.y=.4;for(const wheel of wheels)wheel.rotation.x=0;}
    }
    const offsets=explosionOffsets(config.explode);
    upper.position.y=motion.height/1000-.06+offsets.seat;const turn=motion.swivel*Math.PI/180-upper.rotation.y;upper.rotation.y+=Math.atan2(Math.sin(turn),Math.cos(turn))*(1-Math.exp(-9*dt));
    pan.rotation.x=THREE.MathUtils.damp(pan.rotation.x,-motion.recline/3*Math.PI/180,10,dt);backPivot.rotation.x=THREE.MathUtils.damp(backPivot.rotation.x,-motion.recline*2/3*Math.PI/180,10,dt);
    back.position.z=-offsets.back;head.position.y=offsets.head;column.position.y=offsets.column;
    const top=motion.height/1000-.135;piston.position.y=(.23+top)/2;piston.scale.y=Math.max(.01,top-.23);collar.position.y=top;
    lever.rotation.z=THREE.MathUtils.damp(lever.rotation.z,motion.lever?.30:0,16,dt);
    lumbar.position.y=.19+config.lumbar/1000;armAssemblies.forEach(({arm,adjustable,sign})=>{arm.position.x=sign*(.274+offsets.arms);adjustable.position.y=config.armHeight/1000;});
    lockPin.position.x=THREE.MathUtils.damp(lockPin.position.x,motion.locked?-.139:-.183,16,dt);
    lockPin.material.color.setHex(motion.locked?0x759775:0xc8974d);
    lockHandle.rotation.z=THREE.MathUtils.damp(lockHandle.rotation.z,motion.locked?0:-.45,12,dt);
    for(const {a,b,links,joints} of linkage){
      const end=b.clone().applyQuaternion(pan.quaternion),d=end.clone().sub(a),length=d.length();
      const elbow=a.clone().add(end).multiplyScalar(.5).addScaledVector(V(0,-d.z,d.y).normalize(),Math.sqrt(Math.max(0,.070**2-length**2/4)));
      const points=[a,elbow,end];for(let i=0;i<2;i++){const delta=points[i+1].clone().sub(points[i]);links[i].position.copy(points[i]).add(points[i+1]).multiplyScalar(.5);links[i].scale.y=delta.length();links[i].quaternion.setFromUnitVectors(V(0,1),delta.normalize());}
      joints[0].position.copy(a);joints[1].position.copy(end);joints[2].position.copy(elbow);
    }
    if(tween){camera.position.lerp(destination,.08);controls.target.lerp(target,.08);if(camera.position.distanceTo(destination)<.001)tween=false;}controls.update();
    root.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const showing=config.inspect&&config.explode>0;
    const upperAnchor=upper.localToWorld(V(0,0,.09));
    guides[0].update(upperAnchor.clone().add(V(0,-offsets.seat,0)),upperAnchor,showing);
    guides[1].update(backPivot.localToWorld(V(0,.4,0)),back.localToWorld(V(0,.4,0)),showing);
    guides[2].update(pan.localToWorld(V(.274,.21,.02)),armAssemblies[1].arm.localToWorld(V(0,.21,.02)),showing);
    guides[3].update(back.localToWorld(V(0,.739,-.015)),head.localToWorld(V(0,.739,-.015)),showing&&config.headrest);
    overlay.update({seat:pan.localToWorld(V(-.17,.04,.11)),lift:column.localToWorld(V(0,.26,0)),back:back.localToWorld(V(.16,.43,0)),arms:armAssemblies[1].adjustable.localToWorld(V(0,.237,.02)),base:base.localToWorld(V(.22,.08,.1))},showing&&config.view==='full');
    renderer.render(scene,camera);
    if(time-lastReadout>80){const key=[Math.round(motion.height),Math.round(motion.recline),Math.round(motion.swivel),motion.lever,motion.loaded,motion.locked,motion.stage,config.rideEnabled,ride.distance.toFixed(1),Math.abs(ride.velocity).toFixed(2),ride.x.toFixed(2)].join('|');if(key!==lastReadoutKey){onReadout({...motion,rideDistance:ride.distance,rideVelocity:ride.velocity,rideX:ride.x});lastReadoutKey=key;}lastReadout=time;}
  }
  raf=requestAnimationFrame(animate);
  return {update,dispose(){disposed=true;cancelAnimationFrame(raf);resize.disconnect();controls.dispose();overlay.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)mats.add(o.material);});highlightMaterials.forEach((m,original)=>{mats.add(m);mats.add(original);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textiles.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove();}};
}
