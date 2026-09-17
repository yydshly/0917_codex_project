import * as THREE from 'three';
const V=(x,y,z=0)=>new THREE.Vector3(x,y,z);
export function createCaliper(parent,center,isFront,{carbon,metal}){
  const group=new THREE.Group();group.position.copy(center).add(V(isFront?-.041:.041,.052,-.0542));group.rotation.z=isFront?Math.atan2(.041,.052):-Math.atan2(.041,.052);parent.add(group);
  function box(size,mat,p){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);m.position.copy(p);m.castShadow=true;group.add(m);return m;}
  // Two housing halves and a bridge leave the rotor channel physically open.
  for(const side of [-1,1])box([.034,.027,.008],carbon,V(0,0,side*.013));
  box([.034,.006,.026],carbon,V(0,.016,0));
  const padMaterial=new THREE.MeshStandardMaterial({color:0xbd7950,metalness:.3,roughness:.65});
  const pads=[-1,1].map(side=>({side,mesh:box([.024,.018,.0024],padMaterial,V(0,0,side*.006))}));
  for(const x of [-.011,.011]){
    const screw=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.035,8),metal);screw.rotation.x=Math.PI/2;screw.position.set(x,.012,0);group.add(screw);
  }
  return {group,pads,update(percent,cutaway){
    const pressure=Math.max(0,Math.min(1,percent/100));
    pads.forEach(({side,mesh})=>mesh.position.z=side*(.006-pressure*.004));
    // Remove the outward housing half for inspection, leaving pads and rotor visible.
    group.children[0].visible=!cutaway;
    padMaterial.color.set(pressure>0?0xff8a3a:0xbd7950);
  }};
}
