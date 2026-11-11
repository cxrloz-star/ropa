import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class ClothesScene {
  constructor(canvas) {
    this.canvas=canvas; this.currentGroup=null; this.autoRotate=false;
    this.scene=new THREE.Scene(); this.scene.background=null;
    this.camera=new THREE.PerspectiveCamera(35,1,.1,100); this.camera.position.set(0,1.1,6.6);
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    this.renderer.shadowMap.enabled=true; this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure=1.25;
    this.controls=new OrbitControls(this.camera,canvas); this.controls.enableDamping=true; this.controls.dampingFactor=.06;
    this.controls.enablePan=false; this.controls.minDistance=4.7; this.controls.maxDistance=8;
    this.controls.minPolarAngle=.75; this.controls.maxPolarAngle=2.15; this.controls.target.set(0,.1,0);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0xaaa69c,2.1));
    const key=new THREE.DirectionalLight(0xffffff,3.1); key.position.set(-3,5,5); key.castShadow=true; this.scene.add(key);
    const fill=new THREE.DirectionalLight(0xe5e8ff,1.6); fill.position.set(4,2,-3); this.scene.add(fill);
    const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,64),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25}));
    floor.rotation.x=-Math.PI/2; floor.position.y=-1.35; this.scene.add(floor);
    this.resizeObserver=new ResizeObserver(()=>this.resize()); this.resizeObserver.observe(canvas.parentElement); this.resize();
    this.animate();
  }
  material(color,roughness=.82){return new THREE.MeshStandardMaterial({color,roughness,metalness:.02});}
  extruded(shape,material,depth=.18){const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.045,bevelThickness:.035,curveSegments:12});geo.computeVertexNormals();return new THREE.Mesh(geo,material);}
  addSleeve(group,mat,x,side){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(.22,.29,.92,24,1),mat);mesh.position.set(x,.36,0);mesh.rotation.z=side===-1?-.62:.62;mesh.castShadow=true;group.add(mesh);}
  makeTop(color,hoodie=false,zip=false){
    const group=new THREE.Group(),mat=this.material(color),dark=this.material(new THREE.Color(color).multiplyScalar(.78));
    const body=new THREE.Shape();body.moveTo(-.62,-.88);body.lineTo(.62,-.88);body.lineTo(.7,.52);body.lineTo(.38,.91);body.lineTo(-.38,.91);body.lineTo(-.7,.52);body.closePath();
    const torso=this.extruded(body,mat,.28);torso.position.y=-.02;torso.castShadow=true;group.add(torso);
    this.addSleeve(group,mat,-.76,-1);this.addSleeve(group,mat,.76,1);
    if(hoodie){const hood=new THREE.Mesh(new THREE.SphereGeometry(.36,24,18,0,Math.PI*2,0,Math.PI*.62),mat);hood.position.set(0,.91,-.02);hood.scale.set(1,.9,.72);hood.castShadow=true;group.add(hood);
      const pocket=new THREE.Mesh(new THREE.BoxGeometry(.72,.24,.035),dark);pocket.position.set(0,-.48,.18);group.add(pocket);
      for(const x of [-.13,.13]){const cord=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.38,8),this.material("#c7c3b8"));cord.position.set(x,.38,.19);group.add(cord);}
    } else {const collar=new THREE.Mesh(new THREE.TorusGeometry(.19,.045,10,32),dark);collar.position.set(0,.86,.17);group.add(collar);}
    if(zip){const zipper=new THREE.Mesh(new THREE.BoxGeometry(.018,1.45,.025),this.material("#c9c6bd",.35));zipper.position.set(0,0,.19);group.add(zipper);}
    return group;
  }
  makePants(color){
    const group=new THREE.Group(),mat=this.material(color),dark=this.material(new THREE.Color(color).multiplyScalar(.78));
    const waist=new THREE.Mesh(new THREE.BoxGeometry(1.12,.28,.32),mat);waist.position.y=.66;waist.castShadow=true;group.add(waist);
    for(const x of [-.31,.31]){const shape=new THREE.Shape();shape.moveTo(-.27,.58);shape.lineTo(.27,.58);shape.lineTo(.3,-1.05);shape.lineTo(-.29,-1.05);shape.closePath();const leg=this.extruded(shape,mat,.3);leg.position.set(x,-.12,0);leg.castShadow=true;group.add(leg);}
    const seam=new THREE.Mesh(new THREE.BoxGeometry(.025,1.5,.02),dark);seam.position.set(0,-.15,.17);group.add(seam);
    for(const x of [-.58,.58]){const pocket=new THREE.Mesh(new THREE.BoxGeometry(.18,.36,.05),dark);pocket.position.set(x,.05,.18);group.add(pocket);}
    return group;
  }
  makeSneaker(color){
    const group=new THREE.Group(),upper=this.material(color),sole=this.material("#e8e5dc"),accent=this.material("#77766f");
    const shoe=new THREE.Mesh(new THREE.BoxGeometry(1.25,.48,.55),upper);shoe.position.set(0,-.35,0);shoe.castShadow=true;group.add(shoe);
    const toe=new THREE.Mesh(new THREE.SphereGeometry(.29,24,16),upper);toe.scale.set(1,.7,1);toe.position.set(.5,-.28,0);group.add(toe);
    const soleMesh=new THREE.Mesh(new THREE.BoxGeometry(1.35,.15,.62),sole);soleMesh.position.set(0,-.62,0);group.add(soleMesh);
    for(let i=0;i<4;i++){const lace=new THREE.Mesh(new THREE.BoxGeometry(.28,.025,.035),accent);lace.position.set(-.12,-.1+i*.075,.29);lace.rotation.z=-.08;group.add(lace);}
    return group;
  }
  build(product,color){
    let model;
    if(product.category==="pants")model=this.makePants(color);
    else if(product.category==="sneakers")model=this.makeSneaker(color);
    else model=this.makeTop(color,product.category==="hoodie",product.id===5);
    model.position.y=product.category==="pants"?-.05:product.category==="sneakers"?-.05:0;
    model.rotation.y=-.18;
    return model;
  }
  setProduct(product,color){
    if(this.currentGroup){this.scene.remove(this.currentGroup);this.currentGroup.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});}
    this.currentGroup=this.build(product,color);this.scene.add(this.currentGroup);
    this.currentGroup.scale.setScalar(product.category==="sneakers"?.9:product.category==="pants"?.95:1);
  }
  setColor(product,color){this.setProduct(product,color);}
  resize(){const w=this.canvas.parentElement.clientWidth,h=this.canvas.parentElement.clientHeight;if(!w||!h)return;this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h,false);}
  animate=()=>{requestAnimationFrame(this.animate);if(this.autoRotate&&this.currentGroup)this.currentGroup.rotation.y+=.006;this.controls.update();this.renderer.render(this.scene,this.camera);};
  toggleRotation(){this.autoRotate=!this.autoRotate;return this.autoRotate;}
}