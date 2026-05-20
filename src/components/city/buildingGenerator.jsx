import * as THREE from 'three';
import { createSimpleBuildingLOD } from './cityPerformance';
import { ZONES } from './cityData';
import { STANDS } from './standsData';
import { makeBuildingWallTexture, makeNeonSignTexture } from './textureGenerator';

export function basicMat(params) {
  return new THREE.MeshBasicMaterial(params);
}

export function emissiveMat(color, intensity = 1.0) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity * 0.8, roughness: 0.08, metalness: 0.15 });
}

export function addGlowSprite(scene, x, y, z, texture, size = 6) {
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(size);
  sprite.position.set(x, y, z);
  scene.add(sprite);
  return sprite;
}

export function colorToGlowKey(color) {
  const map = { 0x00ffff: 'cyan', 0xff00ff: 'magenta', 0xffff00: 'yellow', 0x4488ff: 'blue', 0x0088ff: 'blue', 0xff6600: 'orange', 0xff44aa: 'pink' };
  return map[color] || 'magenta';
}

export function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  words.forEach((word) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) {
    ctx.fillText(line.trim(), x, currentY);
  }
}

export function makeWorksCarouselScreen(WORKS = []) {
  const safeWorks = Array.isArray(WORKS) && WORKS.length > 0 ? WORKS : [
    {
      title: 'NEXUS 360',
      subtitle: 'Interactive showcase',
      description: 'Recorrido visual de proyectos y experiencias destacadas.',
      color: '#00ffff',
      videoUrl: '',
    },
  ];
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('muted', '');
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.generateMipmaps = false;
  let activeIndex = 0;
  let controlsVisible = true;
  let lastAdvance = performance.now();

  const loadVideo = () => {
    const work = safeWorks[activeIndex];
    if (!work?.videoUrl) return;
    if (video.src !== work.videoUrl) {
      video.src = work.videoUrl;
      video.load();
      video.play().catch(() => {});
    }
  };

  const draw = (time = 0) => {
    const work = safeWorks[activeIndex];
    const accent = work.color;
    const pulse = 0.82 + Math.sin(time * 1.6) * 0.08;

    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, '#03030a');
    bg.addColorStop(0.5, '#12051f');
    bg.addColorStop(1, '#020008');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = `${accent}22`;
    ctx.fillRect(70, 90, 1080, 690);
    ctx.strokeStyle = `${accent}dd`;
    ctx.lineWidth = 6;
    ctx.strokeRect(70, 90, 1080, 690);

    if (video.readyState >= 2) {
      ctx.drawImage(video, 110, 130, 1000, 610);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(110, 130, 1000, 610);
    } else {
      const mediaGradient = ctx.createLinearGradient(70, 90, 1150, 780);
      mediaGradient.addColorStop(0, `${accent}66`);
      mediaGradient.addColorStop(1, '#ffffff12');
      ctx.fillStyle = mediaGradient;
      ctx.fillRect(110, 130, 1000, 610);
    }

    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 34;
    ctx.strokeRect(110, 130, 1000, 610);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 44px Orbitron, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SHOWCASE WORKS', canvas.width - 200, 100);

    ctx.fillStyle = accent;
    ctx.shadowColor = accent;
    ctx.shadowBlur = 26;
    ctx.font = work.title.length > 12 ? '900 66px Orbitron, monospace' : '900 76px Orbitron, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(work.title, 1230, canvas.height / 2 - 150);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#f7f3ff';
    ctx.font = 'bold 24px monospace';
    wrapText(ctx, work.description, 1230, canvas.height / 2 - 50, 560, 34);
    ctx.fillStyle = '#d7cfff';
    ctx.font = 'bold 24px monospace';
    wrapText(ctx, work.subtitle, 1230, canvas.height / 2 + 36, 560, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = '800 52px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PROYECTO ${activeIndex + 1} / ${safeWorks.length}`, canvas.width / 2, canvas.height - 120);
    for (let i = 0; i < safeWorks.length; i++) {
      ctx.fillStyle = i === activeIndex ? safeWorks[i].color : '#ffffff33';
      ctx.beginPath();
      ctx.arc(canvas.width / 2 - 63 + i * 42, 910, i === activeIndex ? 12 : 8, 0, Math.PI * 2);
      ctx.fill();
    }

    const controlOpacity = controlsVisible ? 1 : 0.98;
    ctx.globalAlpha = controlOpacity;
    ctx.fillStyle = '#02020a';
    ctx.fillRect(90, 860, 520, 120);
    ctx.fillRect(1310, 860, 520, 120);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(90, 860, 520, 120);
    ctx.strokeRect(1310, 860, 520, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 72px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◄ ANTERIOR', 350, 940);
    ctx.fillText('SIGUIENTE ►', 1570, 940);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#d9d9ff';
    ctx.font = '700 24px Rajdhani, sans-serif';
    ctx.fillText('USA ← → PARA CAMBIAR', canvas.width / 2, 990);
    ctx.textAlign = 'left';

    ctx.strokeStyle = `rgba(255,255,255,${0.08 + pulse * 0.08})`;
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    texture.needsUpdate = true;
    if (video.readyState >= 2) videoTexture.needsUpdate = true;
  };

  const next = () => {
    activeIndex = (activeIndex + 1) % safeWorks.length;
    lastAdvance = performance.now();
    loadVideo();
    draw(performance.now() * 0.001);
  };

  const prev = () => {
    activeIndex = (activeIndex - 1 + safeWorks.length) % safeWorks.length;
    lastAdvance = performance.now();
    loadVideo();
    draw(performance.now() * 0.001);
  };

  const update = (time) => {
    if (performance.now() - lastAdvance > 8000) next();
    else draw(time);
  };

  const setProximity = (value) => { controlsVisible = value; };

  loadVideo();
  draw(0);

  return { texture, next, prev, update, setProximity, dispose: () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
    videoTexture.dispose();
    texture.dispose();
  } };
}

export function addVideoScreen(scene, bx, bz, bw, bh, videoTex) {
  const facadeW = bw;
  const facadeH = bh * 0.82;
  const facadeY = bh * 0.48;

  const frontMat = new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.FrontSide });
  const frontScreen = new THREE.Mesh(new THREE.PlaneGeometry(facadeW, facadeH), frontMat);
  frontScreen.position.set(bx, facadeY, bz + bw / 2 + 0.08);
  scene.add(frontScreen);
}

export function createZoneBuilding(scene, zone, flicker, gt, videoTex) {
  const [x, , z] = zone.position;
  const h = zone.buildingHeight || 16;
  const w = zone.buildingWidth || 8;
  const color = zone.color;
  const isHQ = zone.isHQ;

  const baseSeed = Math.abs(Math.round(x * 7 + z * 13)) % 100;
  const makeWall = (s) => new THREE.MeshBasicMaterial({ map: makeBuildingWallTexture(zone.colorHex, s) });
  const bodyMats = [
    makeWall(baseSeed),
    makeWall(baseSeed + 1),
    new THREE.MeshStandardMaterial({ color: 0x0a000f, roughness: 0.2, metalness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0x0a000f, roughness: 0.2, metalness: 0.95 }),
    makeWall(baseSeed + 2),
    makeWall(baseSeed + 3),
  ];
  const body = createSimpleBuildingLOD(w, h, w, bodyMats);
  body.position.set(x, h / 2, z);
  scene.add(body);

  [0.4, 0.7, 1.0].forEach(frac => {
    const lMat = emissiveMat(color, frac === 1.0 ? 0.9 : 0.5);
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.18, w + 0.6), lMat);
    ledge.position.set(x, h * frac, z);
    scene.add(ledge);
    flicker.push({ material: lMat, baseIntensity: frac === 1.0 ? 0.9 : 0.5, flickerSpeed: 0.3 + Math.random() * 0.6, flickerOffset: Math.random() * Math.PI * 2 });
  });

  const winGeo = new THREE.PlaneGeometry(0.4, 0.55);
  const winMat = emissiveMat(color, 0.5);
  flicker.push({ material: winMat, baseIntensity: 0.5, flickerSpeed: 0.4 + Math.random() * 0.4, flickerOffset: Math.random() * Math.PI * 2 });
  const floors = Math.floor(h / 2.5);
  const cols = 3;
  const winCount = floors * cols;
  if (winCount > 0) {
    const inst = new THREE.InstancedMesh(winGeo, winMat, winCount);
    inst.frustumCulled = true;
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let floor = 1; floor <= floors; floor++) {
      for (let col = 0; col < cols; col++) {
        dummy.position.set(x + (col - 1) * (w / 3.5), floor * 2.5, z + w / 2 + 0.02);
        dummy.rotation.y = 0;
        dummy.updateMatrix();
        inst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    scene.add(inst);
  }

  if (isHQ && videoTex) addVideoScreen(scene, x, z, w, h, videoTex);

  const signTex = makeNeonSignTexture(zone.label || zone.id.toUpperCase(), zone.colorHex);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.2, w * 0.3), signMat);
  sign.position.set(x, h + 1.8, z + w / 2 + 0.05);
  scene.add(sign);

  const gKey = colorToGlowKey(color);
  addGlowSprite(scene, x, h + 4, z, gt[gKey], 26);
  addGlowSprite(scene, x, h + 1, z, gt[gKey], 12);
}

export function createArcadeMachine(scene, stand, gt) {
  const [x, , z] = stand.position;
  const body = new THREE.Group();
  const cabinetBlack = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.62, metalness: 0.18 });
  const cabinetDark = new THREE.MeshStandardMaterial({ color: 0x0e0e12, roughness: 0.54, metalness: 0.14 });
  const metalPanel = new THREE.MeshStandardMaterial({ color: 0x707886, roughness: 0.38, metalness: 0.82 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.55, 2.4, 1.55), [cabinetBlack, cabinetBlack, cabinetDark, cabinetDark, cabinetBlack, cabinetBlack]);
  base.position.set(0, 1.2, 0);
  body.add(base);

  const controlDeck = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.16, 0.86), cabinetBlack);
  controlDeck.position.set(0, 2.08, 0.42);
  controlDeck.rotation.x = -0.28;
  body.add(controlDeck);

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.82), new THREE.MeshBasicMaterial({ color: 0x080b10, side: THREE.DoubleSide }));
  screen.position.set(0, 3.18, 0.605);
  screen.rotation.x = -0.22;
  body.add(screen);

  const buttonColors = [0xff4f9a, 0x52d9ff, 0xffb400, 0xf4f7ff];
  buttonColors.forEach((color, index) => {
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.065, 24), new THREE.MeshBasicMaterial({ color }));
    button.rotation.x = Math.PI / 2;
    button.position.set(-0.22 + index * 0.16, 2.13, 0.76);
    body.add(button);
  });

  body.position.set(x, 0, z);
  body.rotation.y = -2.3;
  body.scale.setScalar(1.08);

  const glowKey = colorToGlowKey(stand.colorInt || 0x00ffff);
  addGlowSprite(scene, x, 3.7, z + 0.8, gt[glowKey], 5.8);
  addGlowSprite(scene, x, 2.3, z + 0.9, gt[glowKey], 3.8);
  scene.add(body);
}

export function createMidBuilding(scene, x, z, w, h, nc, flicker) {
  const baseSeed = Math.abs(Math.round(x * 5 + z * 11)) % 100;
  const hexColor = '#' + nc.toString(16).padStart(6, '0');
  const makeMidWall = (s) => new THREE.MeshBasicMaterial({ map: makeBuildingWallTexture(hexColor, s) });
  const body = createSimpleBuildingLOD(
    w,
    h,
    w * 0.9,
    [makeMidWall(baseSeed), makeMidWall(baseSeed+1), new THREE.MeshBasicMaterial({color:0x0a000f}), new THREE.MeshBasicMaterial({color:0x0a000f}), makeMidWall(baseSeed+2), makeMidWall(baseSeed+3)]
  );
  body.position.set(x, h / 2, z);
  scene.add(body);

  const capMat = emissiveMat(nc, 1.0);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.2, w * 0.9 + 0.2), capMat);
  cap.position.set(x, h + 0.1, z);
  scene.add(cap);
  flicker.push({ material: capMat, baseIntensity: 1.0, flickerSpeed: 0.5 + Math.random(), flickerOffset: Math.random() * Math.PI * 2 });
}

export function buildCityScene({ scene, flicker, gt, videoTex, worksCarousel, farBuildingLimit = 16 }) {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220, 80, 80),
    new THREE.MeshStandardMaterial({ color: 0x080610, roughness: 0.06, metalness: 0.96, transparent: true, opacity: 0.94, envMapIntensity: 1.35 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const carouselFrame = new THREE.Mesh(new THREE.BoxGeometry(13.6, 8, 0.62), new THREE.MeshBasicMaterial({ color: 0x04040a }));
  carouselFrame.position.set(0, 4.25, 28);
  carouselFrame.rotation.y = Math.PI;
  scene.add(carouselFrame);

  const carouselScreen = new THREE.Mesh(new THREE.PlaneGeometry(12.7, 7.2), new THREE.MeshBasicMaterial({ map: worksCarousel.texture, toneMapped: false, side: THREE.DoubleSide }));
  carouselScreen.position.set(0, 4.25, 27.67);
  carouselScreen.rotation.y = Math.PI;
  carouselScreen.userData.onClick = (event) => {
    const point = event?.point;
    if (!point) return;
    const localPoint = carouselScreen.worldToLocal(point.clone());
    if (localPoint.x < -1.2) worksCarousel.prev();
    if (localPoint.x > 1.2) worksCarousel.next();
  };
  scene.add(carouselScreen);

  ZONES.forEach(zone => createZoneBuilding(scene, zone, flicker, gt, videoTex));
  STANDS.filter((stand) => stand.type === 'arcade').forEach((stand) => createArcadeMachine(scene, stand, gt));

  const midPositions = [[-18,-30],[18,-30],[-30,18],[30,18],[-34,-34],[34,-34],[-34,34],[34,34],[-46,-18],[46,-18],[-46,18],[46,18],[-12,-44],[12,-44],[-12,44],[12,44],[-58,-30],[-44,-30],[-30,-30],[30,-30],[44,-30],[58,-30],[-58,30],[-44,30],[-30,30],[30,30],[44,30],[58,30]];
  const neonPalette = [0x00ffff, 0xff00ff, 0xffff00, 0x4488ff, 0xff44aa];
  midPositions.forEach(([mx, mz], i) => {
    const mh = 10 + (i * 4.1 % 22);
    const mw = 4 + (i * 1.7 % 6);
    const nc = neonPalette[i % neonPalette.length];
    createMidBuilding(scene, mx, mz, mw, mh, nc, flicker);
  });

  const skyMat = new THREE.MeshBasicMaterial({ color: 0x04010e });
  for (let i = 0; i < farBuildingLimit; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 75 + (i % 4) * 8;
    const h = 14 + (i % 8) * 6;
    const w = 5 + (i % 4) * 2;
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), skyMat);
    body.position.set(bx, h / 2, bz);
    scene.add(body);
  }
}