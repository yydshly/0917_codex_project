import * as THREE from 'three';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);

// Stylized clothed seated figure. Coordinates are relative to the seat assembly.
export function createRider(parent){
  const person=new THREE.Group();parent.add(person);person.visible=false;
  const skin=new THREE.MeshStandardMaterial({color:0xb98565,roughness:.78});
  const shirt=new THREE.MeshStandardMaterial({color:0xd5c6aa,roughness:.94});
  const trousers=new THREE.MeshStandardMaterial({color:0x344858,roughness:.91});
  const shoes=new THREE.MeshStandardMaterial({color:0xe8e5d9,roughness:.74});
  const sole=new THREE.MeshStandardMaterial({color:0x78837d,roughness:.86});
  const hair=new THREE.MeshStandardMaterial({color:0x292e2c,roughness:.91});
  const sphere=new THREE.SphereGeometry(1,24,16);
  function oval(p,size,material){const m=new THREE.Mesh(sphere,material);m.position.copy(p);m.scale.set(...size);m.castShadow=true;m.receiveShadow=true;person.add(m);return m;}
  function limb(a,b,r,material,r2=r){
    const d=b.clone().sub(a),m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r,d.length(),20),material);
    m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());m.castShadow=true;m.receiveShadow=true;person.add(m);
    oval(a,[r,r,r],material);oval(b,[r2,r2,r2],material);
  }
  oval(V(0,.141,.024),[.151,.075,.122],trousers);
  // Continuous tailored torso with a wider shoulder ring and a soft hem.
  const rings=[[.205,.13,.091,.015],[.24,.135,.096,.008],[.35,.15,.096,-.006],[.45,.178,.084,-.015],[.495,.15,.072,-.014],[.515,.07,.057,-.005]];
  const positions=[],indices=[],n=40;
  for(const [y,rx,rz,z] of rings)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;positions.push(Math.cos(a)*rx,y,z+Math.sin(a)*rz);}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,c,b,b,c,d);}
  // Close the neck and hem, keeping the silhouette smooth.
  for(const j of [0,rings.length-1]){const center=positions.length/3;positions.push(0,rings[j][0],rings[j][3]);for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n;indices.push(...(j?[center,b,a]:[center,a,b]));}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
  const torso=new THREE.Mesh(geo,shirt);torso.castShadow=true;torso.receiveShadow=true;person.add(torso);
  limb(V(0,.51,0),V(0,.58,0),.039,skin);
  oval(V(0,.66,.012),[.083,.107,.084],skin);
  oval(V(0,.68,-.021),[.085,.098,.066],hair);
  const crown=new THREE.Mesh(new THREE.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI/2),hair);crown.position.set(0,.696,.008);crown.scale.set(.084,.075,.084);crown.castShadow=true;person.add(crown);
  oval(V(0,.649,.091),[.014,.021,.018],skin);
  for(const sign of [-1,1]){
    oval(V(sign*.081,.655,.011),[.014,.024,.015],skin);
    oval(V(sign*.030,.679,.088),[.010,.0035,.0025],hair);
    const shoulder=V(sign*.169,.464,.006),sleeve=V(sign*.210,.365,.041),elbow=V(sign*.232,.299,.074),wrist=V(sign*.23,.288,.196);
    limb(shoulder,sleeve,.060,shirt,.049);limb(sleeve,elbow,.041,skin,.034);limb(elbow,wrist,.034,skin,.026);
    oval(V(sign*.23,.285,.223),[.033,.023,.046],skin);
    const hip=V(sign*.090,.139,.041),knee=V(sign*.109,.111,.348),ankle=V(sign*.117,-.260,.427);
    limb(hip,knee,.075,trousers,.060);limb(knee,ankle,.057,trousers,.035);
    oval(V(sign*.117,-.294,.460),[.050,.035,.096],sole);
    oval(V(sign*.117,-.281,.460),[.049,.043,.091],shoes);
    for(let i=0;i<3;i++)limb(V(sign*.117-.028,-.247,.440+i*.018),V(sign*.117+.028,-.247,.440+i*.018),.0025,sole);
  }
  // Picking passes through the person to the chair so inspection still addresses chair parts.
  person.traverse(o=>{if(o.isMesh)o.raycast=()=>{};});
  return person;
}

export function createRideFloor(scene){
  const group=new THREE.Group();scene.add(group);group.visible=false;
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(3.7,2.7),new THREE.MeshStandardMaterial({color:0xd9dccf,roughness:.96}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.004;ground.receiveShadow=true;group.add(ground);
  const points=[];
  for(let x=-1.75;x<=1.76;x+=.25)points.push(x,0,-1.25,x,0,1.25);
  for(let z=-1.25;z<=1.26;z+=.25)points.push(-1.75,0,z,1.75,0,z);
  const grid=new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(points,3)),new THREE.LineBasicMaterial({color:0xbac4b2,transparent:true,opacity:.40}));group.add(grid);
  const path=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-.7,.003,-.47),V(.7,.003,-.47)]),new THREE.LineDashedMaterial({color:0x557363,dashSize:.045,gapSize:.04}));path.computeLineDistances();group.add(path);
  for(const x of [-.58,0,.58]){const marker=new THREE.Mesh(new THREE.RingGeometry(.017,.023,32),new THREE.MeshBasicMaterial({color:0x69836a,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.set(x,.004,-.47);group.add(marker);}
  return group;
}
