import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export function createBookWall(container, books, options) {
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  const canvas=renderer.domElement;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,1,.1,70);
  const root=new THREE.Group();scene.add(root);
  const radius=9.8,columns=24,rowCount=5,rowSpacing=3.95;
  const cardWidth=2.24,cardHeight=3.72;
  const tiles=[],materials=[],textures=[];
  let disposed=false,loaded=0,rotation=0,targetRotation=0,vertical=0,targetVertical=0;
  let dragging=null,velocity=0,hovered=null;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cardGeometry=new RoundedBoxGeometry(cardWidth,cardHeight,.09,2,.1);
  const imageGeometry=new THREE.PlaneGeometry(cardWidth-.045,cardHeight-.045);
  function ellipsis(ctx,text,max) {
    if(ctx.measureText(text).width<=max)return text;
    while(text.length&&ctx.measureText(text+'…').width>max)text=text.slice(0,-1);
    return text+'…';
  }
  function makeTexture(book) {
    const c=document.createElement('canvas');c.width=512;c.height=850;
    const ctx=c.getContext('2d');
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(texture);
    function paint(image) {
      ctx.clearRect(0,0,512,850);
      ctx.fillStyle='#211c27';ctx.fillRect(0,0,512,850);
      const glow=ctx.createLinearGradient(0,0,512,850);glow.addColorStop(0,book.color+'88');glow.addColorStop(1,'#151119');ctx.fillStyle=glow;ctx.fillRect(0,0,512,850);
      ctx.save();ctx.beginPath();ctx.roundRect(18,18,476,635,10);ctx.clip();
      ctx.fillStyle=book.color;ctx.fillRect(18,18,476,635);
      if(image) {
        const ratio=Math.min(476/image.width,635/image.height);
        const w=image.width*ratio,h=image.height*ratio;
        ctx.drawImage(image,18+(476-w)/2,18+(635-h)/2,w,h);
      } else {
        ctx.fillStyle='#e7ddda';ctx.font='42px Georgia';ctx.textAlign='center';
        book.title.split(' ').forEach((word,i)=>ctx.fillText(word,256,170+i*55,430));ctx.textAlign='left';
      }
      ctx.restore();
      ctx.fillStyle='#eee9f2';ctx.font='600 23px Arial';ctx.fillText(ellipsis(ctx,book.title,468),22,696);
      ctx.fillStyle='#b1a7bc';ctx.font='19px Arial';ctx.fillText(ellipsis(ctx,book.author,460),22,729);
      ctx.fillStyle='#ffffff20';ctx.fillRect(22,757,468,1);
      ctx.fillStyle='#b8adc3';ctx.font='17px Arial';ctx.fillText(book.genre,22,794);
      ctx.fillStyle='#8c7b9b';ctx.font='16px Arial';ctx.fillText(book.year,22,825);
      ctx.strokeStyle='#e5d9ef';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(454,812);ctx.lineTo(474,792);ctx.moveTo(455,792);ctx.lineTo(474,792);ctx.lineTo(474,811);ctx.stroke();
      texture.needsUpdate=true;
    }
    paint();
    const image=new Image();image.onload=()=>{if(disposed)return;paint(image);if(++loaded===books.length)options.onReady();};
    image.onerror=()=>{if(!disposed&&++loaded===books.length)options.onReady();};
    image.src=book.cover;
    const material=new THREE.MeshBasicMaterial({map:texture,color:0xffffff});materials.push(material);return material;
  }
  const covers=books.map(makeTexture);
  const edgeMaterial=new THREE.MeshBasicMaterial({color:0x34303b});materials.push(edgeMaterial);
  for(let column=0;column<columns;column++) {
    const angle=column/columns*Math.PI*2;
    const stagger=Math.sin(column*2.7)*.9;
    for(let row=0;row<rowCount;row++) {
      const book=books[(column*7+row*11)%books.length];
      const tile=new THREE.Group();
      const card=new THREE.Mesh(cardGeometry,edgeMaterial);
      const face=new THREE.Mesh(imageGeometry,covers[book.id]);face.position.z=.052;
      tile.add(card,face);tile.userData={book,angle,baseY:(row-2)*rowSpacing+stagger,face};
      card.userData.tile=tile;face.userData.tile=tile;root.add(tile);tiles.push(tile);
    }
  }
  function resize() {
    const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;
    camera.aspect=w/h;
    camera.fov=w<600?67:60;
    camera.position.set(0,0,w<600?18.2:18.7);camera.lookAt(0,0,0);camera.updateProjectionMatrix();renderer.setSize(w,h);
  }
  const observer=new ResizeObserver(resize);observer.observe(container);resize();
  function positionTiles(dt) {
    const totalHeight=rowCount*rowSpacing;
    tiles.forEach(tile=>{
      const angle=tile.userData.angle+rotation;
      const y=THREE.MathUtils.euclideanModulo(tile.userData.baseY+vertical+totalHeight/2,totalHeight)-totalHeight/2;
      const lift=tile===hovered?.10:0;
      tile.position.set(Math.sin(angle)*radius,y,Math.cos(angle)*radius-y*y*.012);
      tile.rotation.set(-y*.012,angle,0,'YXZ');
      tile.visible=Math.cos(angle)>.05;
      const scale=THREE.MathUtils.damp(tile.scale.x,1+lift*.22,15,dt);tile.scale.setScalar(scale);
    });
  }
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function pick(x,y) {
    const r=canvas.getBoundingClientRect();pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);
    raycaster.setFromCamera(pointer,camera);scene.updateMatrixWorld(true);
    return raycaster.intersectObjects(tiles.filter(t=>t.visible),true)[0]?.object.userData.tile||null;
  }
  const listeners=[];
  function listen(type,fn,opts){canvas.addEventListener(type,fn,opts);listeners.push([type,fn,opts]);}
  listen('pointerdown',e=>{
    if(e.button!==0||dragging)return;
    dragging={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,moved:false};velocity=0;
    canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
  });
  listen('pointermove',e=>{
    if(dragging&&dragging.id===e.pointerId){
      if(Math.hypot(e.clientX-dragging.startX,e.clientY-dragging.startY)>5)dragging.moved=true;
      const dx=e.clientX-dragging.x,dy=e.clientY-dragging.y;
      targetRotation+=dx*.0028;targetVertical-=dy*.014;velocity=dx*.001;
      dragging.x=e.clientX;dragging.y=e.clientY;hovered=null;options.onHover(null,0,0);
    }else{
      hovered=pick(e.clientX,e.clientY);canvas.style.cursor=hovered?'pointer':'grab';
      options.onHover(hovered?.userData.book,e.clientX,e.clientY);
    }
  });
  listen('pointerup',e=>{
    if(!dragging||dragging.id!==e.pointerId)return;
    const clicked=!dragging.moved;dragging=null;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    canvas.style.cursor='grab';
    if(clicked){velocity=0;const tile=pick(e.clientX,e.clientY);if(tile){options.onHover(null,0,0);options.onSelect(tile.userData.book);}}
  });
  const cancel=()=>{dragging=null;canvas.style.cursor='grab';};
  listen('pointercancel',()=>{velocity=0;cancel();});listen('lostpointercapture',cancel);
  listen('pointerleave',()=>{hovered=null;options.onHover(null,0,0);});
  listen('wheel',e=>{e.preventDefault();targetVertical+=e.deltaY*.006;targetRotation-=e.deltaX*.001;},{passive:false});
  let previous=performance.now();
  renderer.setAnimationLoop(now=>{
    const dt=Math.min((now-previous)/1000,.05);previous=now;if(document.hidden)return;
    if(!dragging&&!reducedMotion){targetRotation+=velocity*dt*30;velocity*=Math.exp(-8*dt);}
    rotation=dragging||reducedMotion?targetRotation:THREE.MathUtils.damp(rotation,targetRotation,12,dt);
    vertical=dragging||reducedMotion?targetVertical:THREE.MathUtils.damp(vertical,targetVertical,12,dt);
    positionTiles(dt);renderer.render(scene,camera);
  });
  return {
    move:(x,y)=>{targetRotation+=x;targetVertical+=y;velocity=0;},
    reset:()=>{targetRotation=0;targetVertical=0;velocity=0;},
    openCenter:()=>{const r=canvas.getBoundingClientRect();const tile=pick(r.left+r.width/2,r.top+r.height/2);if(tile)options.onSelect(tile.userData.book);},
    dispose:()=>{disposed=true;observer.disconnect();renderer.setAnimationLoop(null);listeners.forEach(([t,fn,o])=>canvas.removeEventListener(t,fn,o));cardGeometry.dispose();imageGeometry.dispose();materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();},
  };
}
