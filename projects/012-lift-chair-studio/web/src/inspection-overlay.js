import * as THREE from 'three';
const names={seat:'01 坐垫',lift:'02 气杆',back:'03 靠背',arms:'04 扶手',base:'05 底座'};
const slots={seat:[false,.37],lift:[false,.65],back:[true,.24],arms:[true,.49],base:[true,.73]};
export function inspectionOverlay(host,camera,onSelect){
  const layer=document.createElement('div');layer.className='part-annotations';layer.setAttribute('aria-label','图中部件编号');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');layer.appendChild(svg);
  const entries=Object.entries(names).map(([id,name])=>{
    const line=document.createElementNS(svg.namespaceURI,'line');svg.appendChild(line);
    const button=document.createElement('button');button.textContent=name;button.setAttribute('aria-label',`查看${name}`);button.onclick=()=>onSelect(id);layer.appendChild(button);return {id,line,button};
  });host.appendChild(layer);
  return {update(points,visible){
    layer.hidden=!visible;if(!visible)return;
    const w=host.clientWidth,h=host.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
    for(const {id,line,button} of entries){
      const p=points[id].clone().project(camera),[right,row]=slots[id],x=right?w-88:10,y=h*row;
      button.style.left=`${x}px`;button.style.top=`${y}px`;
      line.setAttribute('x1',`${x+(right?0:76)}`);line.setAttribute('y1',`${y+15}`);
      line.setAttribute('x2',`${(p.x+1)*w/2}`);line.setAttribute('y2',`${(1-p.y)*h/2}`);
    }
  },dispose(){layer.remove();}};
}

export function assemblyGuide(parent){
  const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);
  const line=new THREE.Line(geometry,new THREE.LineDashedMaterial({color:0xb98c4c,dashSize:.012,gapSize:.008,transparent:true,opacity:.85}));
  const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,1,0),new THREE.Vector3(),.1,0xb98c4c,.014,.010);arrow.line.visible=false;
  line.material.depthTest=false;line.material.depthWrite=false;line.renderOrder=5;
  arrow.cone.material.depthTest=false;arrow.cone.material.depthWrite=false;arrow.cone.renderOrder=5;
  parent.add(line,arrow);
  return {update(a,b,visible){
    const d=b.clone().sub(a),length=d.length();line.visible=arrow.visible=visible&&length>.015;
    if(!line.visible)return;
    const p=geometry.attributes.position;p.setXYZ(0,a.x,a.y,a.z);p.setXYZ(1,b.x,b.y,b.z);p.needsUpdate=true;geometry.computeBoundingSphere();line.computeLineDistances();
    arrow.position.copy(a);arrow.setDirection(d.normalize());arrow.setLength(length,.014,.010);
  }};
}
