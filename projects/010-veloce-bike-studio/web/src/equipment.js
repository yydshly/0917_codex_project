import * as THREE from 'three';
export const seatOffset=height=>new THREE.Vector3(-.045/.207*height/1000,height/1000,0);
export const equipmentState=config=>({
  frontOn:!!config.frontLight&&config.lightMode!=='off',
  rearOn:!!config.rearLight&&config.lightMode!=='off',
  height:Math.max(0,Math.min(80,config.seatHeight||0)),
});

export function createEquipment({frame,cockpit,saddle},{carbon,metal}){
  const V=(x,y,z=0)=>new THREE.Vector3(x,y,z);
  function mesh(parent,geo,mat,p){const m=new THREE.Mesh(geo,mat);m.position.copy(p);m.castShadow=true;parent.add(m);return m;}
  function rod(parent,a,b,r,mat){const d=b.clone().sub(a),m=mesh(parent,new THREE.CylinderGeometry(r,r,d.length(),16),mat,a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(V(0,1),d.normalize());return m;}
  function collar(parent,p,r=.022){const m=mesh(parent,new THREE.TorusGeometry(r,.0035,10,48),metal,p);m.quaternion.setFromUnitVectors(V(0,0,1),V(-.045,.207).normalize());return m;}
  const clamp=new THREE.Group();clamp.userData.part='seatClamp';frame.add(clamp);
  collar(clamp,V(-.3104,.492),.025);
  rod(clamp,V(-.33,.493,.028),V(-.292,.493,.028),.004,metal);
  for(const x of [-.333,-.289])mesh(clamp,new THREE.SphereGeometry(.006,16,12),metal,V(x,.493,.028));
  const lever=new THREE.Group();lever.position.set(-.333,.493,.029);clamp.add(lever);
  rod(lever,V(0,0),V(-.043,.018,.004),.005,carbon);
  const grip=mesh(lever,new THREE.SphereGeometry(1,16,12),metal,V(-.044,.019,.004));grip.scale.set(.014,.005,.007);

  const frontLight=new THREE.Group();frontLight.userData.part='frontLight';cockpit.add(frontLight);
  const band=mesh(frontLight,new THREE.TorusGeometry(.021,.0035,10,40),carbon,V(.13,.13,-.105));
  rod(frontLight,V(.13,.152,-.105),V(.18,.171,-.105),.006,metal);
  const rearLight=new THREE.Group();rearLight.userData.part='rearLight';saddle.add(rearLight);
  collar(rearLight,V(-.347,.66),.021);
  rod(rearLight,V(-.35,.66),V(-.39,.66),.006,metal);
  function lamp(parent,center,direction,color){
    const body=mesh(parent,new THREE.CylinderGeometry(.020,.020,.065,32),carbon,center);
    body.rotation.z=Math.PI/2;
    const glass=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0,toneMapped:false,roughness:.2,metalness:.2});
    const lens=mesh(parent,new THREE.CylinderGeometry(.017,.017,.005,32),glass,center.clone().add(V(direction*.035,0)));lens.rotation.z=Math.PI/2;
    for(let i=-1;i<=1;i++){const led=mesh(parent,new THREE.SphereGeometry(.004,12,8),glass,center.clone().add(V(direction*.039,i*.009)));led.scale.x=.25;}
    const button=mesh(parent,new THREE.SphereGeometry(.005,12,8),metal,center.clone().add(V(0,.020)));button.scale.y=.35;
    return glass;
  }
  const frontLens=lamp(frontLight,V(.201,.18,-.105),1,0xe4f8ff);
  const rearLens=lamp(rearLight,V(-.414,.66),-1,0xff202b);
  const spot=new THREE.SpotLight(0xe5f4ff,0,3.5,.32,.6,2);spot.position.set(.241,.18,-.105);spot.target.position.set(1.8,-.35,-.105);frontLight.add(spot,spot.target);
  // A translucent beam makes the headlight direction legible in the bright studio.
  const beamMat=new THREE.MeshBasicMaterial({color:0xb6e6ff,transparent:true,opacity:.045,depthWrite:false,side:THREE.DoubleSide});
  const beam=mesh(frontLight,new THREE.ConeGeometry(.24,1.3,32,1,true),beamMat,V(.89,-.005,-.105));beam.castShadow=false;beam.raycast=()=>{};beam.quaternion.setFromUnitVectors(V(0,1),V(-1,.28).normalize());
  return {frontLight,rearLight,clamp,update(config){
    const s=equipmentState(config);frontLight.visible=config.frontLight;rearLight.visible=config.rearLight;
    frontLens.emissiveIntensity=s.frontOn?3:0;rearLens.emissiveIntensity=s.rearOn?.8:0;spot.intensity=s.frontOn?4:0;beam.visible=s.frontOn;
    lever.rotation.y=config.seatClampOpen?-1.3:0;
  }};
}
