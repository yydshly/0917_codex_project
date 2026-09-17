import * as THREE from 'three';
import {fabricData,FABRIC_REPEAT} from './fabric-data.js';
const signed=(x,p)=>Math.sign(x)*Math.abs(x)**p;
const bell=(x,width)=>Math.exp(-((x/width)**2));
// Small, static gathering near upholstered edges; these are not load simulation.
const edgeGather=(u,v)=>.0013*Math.sin(39*u+8*v)*bell(Math.abs(v)-.88,.085)*bell(Math.abs(u)-.70,.22)
  +.0009*Math.sin(45*v+5*u)*bell(Math.abs(u)-.91,.065)*bell(v-.25,.65);
export const backSeamX=v=>.115+.008*Math.sin((.23-v*.275)/.455*Math.PI);
export const seatForm={width:.49,length:.46,thickness:.075,corner:4.5,taper:v=>.96+.04*v,
  warp:(u,v)=>-.012*Math.exp(-3*(u*u+v*v))+.008*u*u-.022*Math.max(0,v)**4,relief:edgeGather};
export const backForm={width:.425,length:.55,thickness:.037,corner:4.2,taper:v=>.93-.055*v,
  warp:(u,v)=>.028*u*u+.023*Math.exp(-(((v-.35)/.47)**2))-.013*Math.exp(-(((v+.5)/.45)**2)),
  relief:(u,v)=>edgeGather(u,v)-.0018*bell(Math.abs(u)*.425/2*(.93-.055*v)-backSeamX(v),.004)};
export const headForm={width:.275,length:.14,thickness:.05,corner:3.7,warp:(u,v)=>.018*u*u-.005*v*v};
export const lumbarForm={width:.32,length:.115,thickness:.035,corner:3.2,warp:(u,v)=>.018*u*u-.008*v*v};
export function surfacePoint(form,theta,phi){
  const radial=Math.max(0,Math.cos(phi))**.32;
  const u=signed(Math.cos(theta),2/(form.corner||4))*radial,v=signed(Math.sin(theta),2/(form.corner||4))*radial;
  const face=Math.max(0,Math.sin(phi))**.70;
  return new THREE.Vector3(u*form.width/2*(form.taper?.(v)??1),signed(Math.sin(phi),.70)*form.thickness/2+(form.warp?.(u,v)||0)+(form.relief?.(u,v)||0)*face,v*form.length/2);
}
export function cushionFront(form,x,z){
  const v=z/(form.length/2),u=x/(form.width/2*(form.taper?.(v)??1)),n=form.corner||4;
  const r=Math.min(.99999,(Math.abs(u)**n+Math.abs(v)**n)**(1/n));
  const face=Math.max(0,1-r**(2/.32))**.35;
  return (form.thickness/2+(form.relief?.(u,v)||0))*face+(form.warp?.(u,v)||0);
}
// Closed upholstered body, including curved top, rounded waterfall edge and underside.
export function cushionGeometry(form,segments=160,rings=80){
  const positions=[],uvs=[],indices=[];
  function add(p){positions.push(p.x,p.y,p.z);uvs.push(p.x,p.z);}
  add(surfacePoint(form,0,-Math.PI/2));
  // Uniform footprint spacing avoids a large triangle fan over the cushion centre.
  for(let j=1;j<rings;j++){
    const t=j/rings*2-1,phi=Math.sign(t)*Math.acos((1-Math.abs(t))**(1/.32));
    for(let i=0;i<segments;i++)add(surfacePoint(form,i/segments*Math.PI*2,phi));
  }
  const north=positions.length/3;add(surfacePoint(form,0,Math.PI/2));
  const at=(j,i)=>1+(j-1)*segments+(i+segments)%segments;
  for(let i=0;i<segments;i++){
    indices.push(0,at(1,i),at(1,i+1));
    for(let j=1;j<rings-1;j++){const a=at(j,i),b=at(j,i+1),c=at(j+1,i),d=at(j+1,i+1);indices.push(a,c,b,b,c,d);}
    indices.push(north,at(rings-1,i+1),at(rings-1,i));
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
export function castLegGeometry(){
  const sections=[[.023,.130,.032,.027],[.073,.126,.032,.023],[.16,.108,.025,.018],[.265,.082,.018,.014],[.338,.066,.014,.016]],positions=[],indices=[],n=16;
  for(const [z,y,w,h] of sections)for(let i=0;i<n;i++){const a=i/n*Math.PI*2;positions.push(signed(Math.cos(a),.60)*w,y+signed(Math.sin(a),.65)*h,z);}
  for(let j=0;j<sections.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;indices.push(a,b,c,b,d,c);}
  positions.push(0,sections[0][1],sections[0][0],0,sections.at(-1)[1],sections.at(-1)[0]);const c=sections.length*n;
  for(let i=0;i<n;i++){indices.push(c,(i+1)%n,i);indices.push(c+1,(sections.length-1)*n+i,(sections.length-1)*n+(i+1)%n);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function fabricTextures(){
  const {size,albedo,height,roughness}=fabricData();
  const textures=[albedo,height,roughness].map(data=>{const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(FABRIC_REPEAT,FABRIC_REPEAT);t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=8;t.needsUpdate=true;return t;});
  textures[0].colorSpace=THREE.SRGBColorSpace;return textures;
}

// Project in object space on three planes: the sidewall gets the same weave scale
// as the face, and the weave moves with each cushion during chair articulation.
export function applyFabricMapping(material){
  material.onBeforeCompile=shader=>{
    const varyings='varying vec3 vFabricPosition; varying vec3 vFabricNormal;\n';
    shader.vertexShader=varyings+shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nvFabricPosition = position; vFabricNormal = normal;');
    shader.fragmentShader=varyings+`
      vec4 fabricSample(sampler2D tex, vec3 p) {
        vec3 w=pow(abs(normalize(vFabricNormal)),vec3(8.0));
        w/=max(w.x+w.y+w.z,0.0001);
        return texture2D(tex,p.zy*${FABRIC_REPEAT})*w.x+texture2D(tex,p.xz*${FABRIC_REPEAT})*w.y+texture2D(tex,p.xy*${FABRIC_REPEAT})*w.z;
      }
    `+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader
      .replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replace('texture2D( map, vMapUv )','fabricSample(map, vFabricPosition)'))
      .replace('#include <roughnessmap_fragment>',THREE.ShaderChunk.roughnessmap_fragment.replace('texture2D( roughnessMap, vRoughnessMapUv )','fabricSample(roughnessMap, vFabricPosition)'))
      .replace('#include <bumpmap_pars_fragment>',THREE.ShaderChunk.bumpmap_pars_fragment.replace(/vec2 dHdxy_fwd\(\) \{[\s\S]*?return vec2\( dBx, dBy \);\s*\}/,`
        vec2 dHdxy_fwd() {
          float h=fabricSample(bumpMap,vFabricPosition).x;
          return bumpScale*vec2(
            fabricSample(bumpMap,vFabricPosition+dFdx(vFabricPosition)).x-h,
            fabricSample(bumpMap,vFabricPosition+dFdy(vFabricPosition)).x-h);
        }`));
  };
  material.customProgramCacheKey=()=> 'chair-triplanar-fabric-v2';
}
