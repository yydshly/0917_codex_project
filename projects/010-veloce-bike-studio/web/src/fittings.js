import * as THREE from 'three';
const V=(x,y,z=0)=>new THREE.Vector3(x,y,z);
const TAU=Math.PI*2;

// All dimensions are illustrative metres; accessories are children of their mounts.
export function createFittings({frame,cockpit,saddle},{carbon,metal,trim,rubber,accent},screenTexture){
  const mesh=(parent,geo,mat,p)=>{const m=new THREE.Mesh(geo,mat);if(p)m.position.copy(p);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  function rod(parent,a,b,r,mat){const d=b.clone().sub(a),m=mesh(parent,new THREE.CylinderGeometry(r,r,d.length(),12),mat,a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1),d.normalize());return m;}
  function path(parent,points,r,mat){return mesh(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(64,points.length*2),r,8,false),mat);}
  function ring(parent,r,t,mat,p){return mesh(parent,new THREE.TorusGeometry(r,t,8,48),mat,p);}
  function bolt(parent,p){const b=mesh(parent,new THREE.CylinderGeometry(.003,.003,.004,6),metal,p);return b;}
  function roundedPlate(parent,length,width,depth,radius,mat,p){
    const x=length/2,y=width/2,r=radius,s=new THREE.Shape();
    s.moveTo(-x+r,-y);s.lineTo(x-r,-y);s.quadraticCurveTo(x,-y,x,-y+r);s.lineTo(x,y-r);s.quadraticCurveTo(x,y,x-r,y);s.lineTo(-x+r,y);s.quadraticCurveTo(-x,y,-x,y-r);s.lineTo(-x,-y+r);s.quadraticCurveTo(-x,-y,-x+r,-y);
    const g=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.001,bevelThickness:.001,bevelSegments:2,curveSegments:8});g.rotateX(-Math.PI/2);return mesh(parent,g,mat,p);
  }

  // Physical wrap seams, end plugs, stem clamp and steering cap.
  const seam=new THREE.MeshStandardMaterial({color:0x76808a,roughness:.85,metalness:.05});
  for(const z of [-.2,.2]){
    const curve=new THREE.CatmullRomCurve3([V(.13,.13,z),V(.24,.13,z),V(.29,.04,z),V(.25,-.07,z),V(.15,-.07,z)]),points=[];
    for(let i=0;i<=420;i++){
      const t=i/420,point=curve.getPointAt(t),tangent=curve.getTangentAt(t),normal=V(-tangent.y,tangent.x),phase=t*TAU*24;
      points.push(point.addScaledVector(normal,.0185*Math.cos(phase)).add(V(0,0,.0185*Math.sin(phase))));
    }
    path(cockpit,points,.00065,seam);
    const plug=mesh(cockpit,new THREE.CylinderGeometry(.017,.017,.005,24),carbon,V(.147,-.07,z));plug.rotation.z=Math.PI/2;
    const badge=mesh(cockpit,new THREE.CylinderGeometry(.006,.006,.006,6),metal,V(.144,-.07,z));badge.rotation.z=Math.PI/2;
    for(const side of [-1,1])bolt(cockpit,V(.13,.153,z*.16+side*.012));
  }
  ring(cockpit,.024,.004,metal,V(.13,.13));
  bolt(cockpit,V(-.026,.15));

  // Saddle shell with a real central cut-out, twin padding panels and rail clamp.
  const seatShell=new THREE.Shape();
  seatShell.moveTo(-.13,0);seatShell.bezierCurveTo(-.14,.047,-.1,.073,-.064,.071);
  seatShell.bezierCurveTo(-.015,.066,.012,.024,.11,.021);seatShell.quadraticCurveTo(.143,.019,.143,0);
  seatShell.quadraticCurveTo(.143,-.019,.11,-.021);seatShell.bezierCurveTo(.012,-.024,-.015,-.066,-.064,-.071);seatShell.bezierCurveTo(-.1,-.073,-.14,-.047,-.13,0);
  const opening=new THREE.Path();opening.moveTo(-.066,-.017);opening.lineTo(.061,-.014);opening.quadraticCurveTo(.081,0,.061,.014);opening.lineTo(-.066,.017);opening.quadraticCurveTo(-.086,0,-.066,-.017);seatShell.holes.push(opening);
  const shellGeo=new THREE.ExtrudeGeometry(seatShell,{depth:.006,bevelEnabled:true,bevelSize:.003,bevelThickness:.003,bevelSegments:3,curveSegments:24});shellGeo.rotateX(-Math.PI/2);
  mesh(saddle,shellGeo,carbon,V(-.345,.728));
  const pads=new THREE.ExtrudeGeometry(seatShell,{depth:.008,bevelEnabled:true,bevelSize:.005,bevelThickness:.004,bevelSegments:4,curveSegments:24});pads.rotateX(-Math.PI/2);
  mesh(saddle,pads,trim,V(-.345,.74));
  for(const z of [-.025,.025])path(saddle,[V(-.45,.721,z),V(-.40,.691,z),V(-.325,.691,z),V(-.25,.723,z)],.0035,metal);
  roundedPlate(saddle,.052,.062,.011,.005,carbon,V(-.365,.695));
  for(const x of [-.385,-.345])bolt(saddle,V(x,.712));
  rod(saddle,V(-.2774,.34),V(-.355,.697),.018,carbon);
  // Insertion scale moves with the post; the quick-release collar stays on frame.
  for(let i=0;i<9;i++)rod(saddle,V(-.30-i*.00217,.45+i*.01,.0185),V(-.293-i*.00217,.45+i*.01,.0185),.00065,metal);
  rod(saddle,V(-.462,.743,-.043),V(-.462,.743,.043),.0015,seam);

  const phone=new THREE.Group();phone.name='phone';phone.userData.part='phone';cockpit.add(phone);
  const phoneClamp=ring(phone,.021,.004,metal,V(.13,.13,0));
  rod(phone,V(.13,.153,0),V(.205,.182,0),.008,carbon);
  const joint=mesh(phone,new THREE.SphereGeometry(.011,16,12),metal,V(.205,.183,0));
  const cradle=new THREE.Group();cradle.position.set(.205,.20,0);cradle.rotation.z=.20;phone.add(cradle);
  roundedPlate(cradle,.125,.067,.009,.006,carbon,V(0,-.012,0));
  roundedPlate(cradle,.157,.075,.009,.009,rubber,V(0,0,0));
  const glass=new THREE.MeshBasicMaterial({map:screenTexture||null,color:screenTexture?0xffffff:0x70bdbc,toneMapped:false});
  // Plane's long texture dimension follows the phone's forward axis.
  const displayGeo=new THREE.PlaneGeometry(.064,.14);displayGeo.rotateX(-Math.PI/2);displayGeo.rotateY(-Math.PI/2);
  mesh(cradle,displayGeo,glass,V(0,.0105,0));
  for(const x of [-.059,.059])for(const z of [-.042,.042])roundedPlate(cradle,.022,.014,.014,.003,carbon,V(x,-.003,z));
  const lens=mesh(cradle,new THREE.CylinderGeometry(.002,.002,.0008,12),carbon,V(.071,.011,0));
  rod(phone,V(.18,.18,.035),V(.18,.18,.05),.003,metal);
  bolt(phone,V(.13,.155,0));

  const bell=new THREE.Group();bell.name='bell';bell.userData.part='bell';bell.position.set(.13,.154,.125);cockpit.add(bell);
  ring(bell,.02,.003,carbon,V(0,-.024,0));
  mesh(bell,new THREE.CylinderGeometry(.022,.022,.006,32),carbon,V(0,.005));
  mesh(bell,new THREE.SphereGeometry(.022,32,16,0,TAU,0,Math.PI/2),metal,V(0,.008));
  bolt(bell,V(0,.032));
  const striker=new THREE.Group();striker.position.set(-.021,.008,.016);bell.add(striker);
  rod(striker,V(0,0,0),V(-.019,0,.004),.004,carbon);
  mesh(striker,new THREE.SphereGeometry(.005,12,8),accent,V(.009,.006,0));

  const bottle=new THREE.Group();bottle.name='bottle';bottle.userData.part='bottle';frame.add(bottle);
  // Axis parallel to the down tube; offset into the main triangle.
  bottle.position.set(-.065,.075,0);bottle.rotation.z=-Math.atan2(.61,.40);
  const bottleBody=new THREE.Group();bottle.add(bottleBody);
  const white=new THREE.MeshStandardMaterial({color:0xd8e5e8,roughness:.48,metalness:.12});
  const profile=[[0,0],[.028,0],[.035,.01],[.035,.112],[.031,.119],[.031,.135],[.035,.14],[.031,.153],[.024,.165],[.024,.174]].map(([r,y])=>new THREE.Vector2(r,y));
  mesh(bottleBody,new THREE.LatheGeometry(profile,48),white);
  mesh(bottleBody,new THREE.CylinderGeometry(.024,.024,.014,32),carbon,V(0,.176));
  mesh(bottleBody,new THREE.CylinderGeometry(.010,.012,.009,24),accent,V(0,.187));
  mesh(bottleBody,new THREE.CylinderGeometry(.004,.007,.008,16),rubber,V(0,.195));
  const stripe=mesh(bottleBody,new THREE.CylinderGeometry(.0355,.0355,.022,48),accent,V(0,.086));
  // Rear mounting spine, two bosses, twin cage arms and a bottom retaining lip.
  rod(bottle,V(.041,.015),V(.041,.13),.006,carbon);
  for(const y of [.037,.102]){
    rod(bottle,V(.041,y,0),V(.062,y,0),.004,metal);
    const screw=bolt(bottle,V(.039,y,0));screw.rotation.z=Math.PI/2;
  }
  for(const z of [-1,1])path(bottle,[V(.043,.02,z*.012),V(.013,-.005,z*.032),V(-.026,.02,z*.026),V(-.031,.075,z*.019),V(-.016,.132,z*.025),V(.02,.14,z*.029)],.004,carbon);
  rod(bottle,V(-.02,-.005,-.029),V(-.02,-.005,.029),.004,carbon);
  return {phone,bell,bottle,striker,bottleBody,
    update(config,dt){phone.visible=config.phone;bell.visible=config.bell;bottle.visible=config.bottle;const lift=config.bottleOut?.14:0;bottleBody.position.y=THREE.MathUtils.damp(bottleBody.position.y,lift,12,dt);},
    strike(time){striker.rotation.y=Math.sin(time*30)*Math.exp(-time*9)*.5;}
  };
}

export function createPhoneScreen(){
  const canvas=document.createElement('canvas');canvas.width=320;canvas.height=640;const c=canvas.getContext('2d');
  c.fillStyle='#14212b';c.fillRect(0,0,320,640);c.strokeStyle='#263b45';c.lineWidth=7;
  for(let i=-200;i<700;i+=65){c.beginPath();c.moveTo(0,i);c.lineTo(320,i+120);c.stroke();c.beginPath();c.moveTo(i,120);c.lineTo(i-120,530);c.stroke();}
  c.strokeStyle='#f78343';c.lineWidth=15;c.lineJoin='round';c.beginPath();c.moveTo(160,465);c.lineTo(160,350);c.lineTo(235,305);c.lineTo(235,190);c.lineTo(120,190);c.stroke();
  c.fillStyle='#e8f1ed';c.beginPath();c.moveTo(160,420);c.lineTo(137,466);c.lineTo(183,466);c.closePath();c.fill();
  c.fillStyle='#101c24';c.fillRect(0,0,320,116);c.fillRect(0,525,320,115);c.fillStyle='#f4f5ee';c.font='bold 30px sans-serif';c.fillText('RIDE / DEMO',22,49);c.font='24px sans-serif';c.fillText('↑  280 m',22,90);c.font='bold 47px sans-serif';c.fillText('12.8',22,582);c.font='21px sans-serif';c.fillText('km',133,582);c.fillStyle='#92b5b7';c.font='19px sans-serif';c.fillText('LOCAL ROUTE PREVIEW',22,619);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
