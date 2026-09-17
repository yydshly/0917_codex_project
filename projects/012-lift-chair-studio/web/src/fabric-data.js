// One seamless 64 mm tile, shared by the 3D material and the UI weave samples.
export const FABRIC_REPEAT=1/.064;
let cached;
const hash=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v);};
const wrap=n=>(n%32+32)%32;
export function fabricData(){
  if(cached)return cached;
  const size=512,albedo=new Uint8Array(size*size*4),height=new Uint8Array(size*size*4),roughness=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4,cx=Math.floor(x/16),cy=Math.floor(y/16),over=(cx+cy)%2;
    const across=(over?x:y)%16,along=over?y:x;
    const yarn=hash(over?cx:cy,over?7:19),crossYarn=hash(over?cy:cx,over?13:3);
    const width=.83+.13*yarn,offset=(yarn-.5)*.9;
    const crown=Math.max(0,Math.cos(((across-7.5+offset)/8)/width*Math.PI/2))**.65;
    const filaments=Math.sin(across*2.6+Math.sin(along*Math.PI/32)*.6);
    const slub=Math.sin(along/size*Math.PI*8+yarn*6.28)*Math.sin(along/size*Math.PI*2+crossYarn*6.28);
    const grain=hash(x,y),mottle=(hash(wrap(cx),wrap(cy))-.5);
    const shade=144+65*crown+23*(yarn-.5)+12*slub+7*filaments+10*(grain-.5)+8*mottle;
    const h=32+177*crown+15*slub+9*filaments+9*(grain-.5);
    const rough=237+12*(1-crown)+5*grain;
    for(let c=0;c<3;c++){albedo[i+c]=Math.max(0,Math.min(255,shade));height[i+c]=Math.max(0,Math.min(255,h));roughness[i+c]=rough;}
    albedo[i+3]=height[i+3]=roughness[i+3]=255;
  }
  cached={size,albedo,height,roughness};return cached;
}

let sampleUrl;
export function fabricSampleUrl(){
  if(sampleUrl)return sampleUrl;
  const {size,albedo}=fabricData(),canvas=document.createElement('canvas');canvas.width=canvas.height=size;
  canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(albedo),size,size),0,0);
  sampleUrl=canvas.toDataURL('image/png');return sampleUrl;
}
