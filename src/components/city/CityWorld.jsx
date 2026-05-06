import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { ZONES } from './cityData';
import { STANDS } from './standsData';

// Radial glow sprite texture
function makeGlowTexture(hex) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, hex + 'ff');
  grad.addColorStop(0.25, hex + 'bb');
  grad.addColorStop(0.6, hex + '44');
  grad.addColorStop(1, hex + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

// Animated canvas texture for the "video screen" billboard
function makeVideoCanvasTexture(label, accentColor) {
  label = label || 'AGENCY360';
  accentColor = accentColor || '#ff00ff';
  const W = 512, H = 288;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);

  // Scanline noise
  function draw(t) {
    // Dark base
    ctx.fillStyle = '#050010';
    ctx.fillRect(0, 0, W, H);

    // Magenta/cyan gradient wash
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, `hsla(280,100%,${20 + 10 * Math.sin(t * 0.3)}%,0.9)`);
    grd.addColorStop(0.5, `hsla(200,100%,${15 + 8 * Math.cos(t * 0.5)}%,0.7)`);
    grd.addColorStop(1, `hsla(320,100%,${18 + 6 * Math.sin(t * 0.7)}%,0.8)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    // Glitch horizontal bars
    for (let i = 0; i < 4; i++) {
      const y = (Math.sin(t * 2.1 + i * 1.3) * 0.5 + 0.5) * H;
      const alpha = 0.08 + 0.05 * Math.sin(t * 3 + i);
      ctx.fillStyle = `rgba(0,255,255,${alpha})`;
      ctx.fillRect(0, y, W, 2 + Math.random() * 4);
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(0,255,255,0.12)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Main text
    const pulse = 0.8 + 0.2 * Math.sin(t * 1.5);
    ctx.shadowBlur = 30;
    ctx.shadowColor = accentColor;
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = pulse;
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, W / 2, H / 2 - 18);
    ctx.globalAlpha = 1;

    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgba(0,255,255,${0.6 + 0.3 * Math.sin(t * 2)})`;
    ctx.font = '18px monospace';
    ctx.fillText('AGENCY360 · CREATIVE · XR', W / 2, H / 2 + 18);

    // Bottom ticker
    const tickerOffset = (t * 60) % (W + 800);
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255,255,0,0.9)';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('◆ SOFTWARE  ◆ VIDEO 360°  ◆ AVATARES 3D  ◆ EVENTOS XR  ◆ METAVERSO  ◆ STREAMING  ', W - tickerOffset, H - 14);

    // Corner brackets
    ctx.strokeStyle = 'rgba(0,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    const bsize = 18;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([cx, cy]) => {
      const sx = cx === 0 ? 1 : -1, sy = cy === 0 ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(cx + sx * bsize, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + sy * bsize); ctx.stroke();
    });

    // Scanlines
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, y, W, 1.5);
    }

    tex.needsUpdate = true;
  }

  return { canvas, tex, draw };
}

// Neon sign canvas texture
function makeNeonSignTexture(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#020008';
  ctx.fillRect(0, 0, 256, 64);
  ctx.shadowBlur = 18;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);
  return new THREE.CanvasTexture(canvas);
}

const MOVE_SPEED = 16;
const LOOK_SPEED = 0.0018;
const LOOK_SMOOTH = 0.10;

const STAND_RADIUS = 9;

export default function CityWorld({ onEnterZone, onExitZone, onNearStand, onLeaveStand, onActivateStand }) {
  const mountRef = useRef(null);
  const keysRef = useRef({});
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.1);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(-0.1);
  const mouseDeltaRef = useRef({ x: 0, y: 0 });
  const isLockedRef = useRef(false);
  const animFrameRef = useRef(null);
  const activeZoneRef = useRef(null);
  const nearStandRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const flickerObjectsRef = useRef([]);
  const videoScreenRef = useRef(null);
  const extraCanvasesRef = useRef([]);

  const checkZoneProximity = useCallback((pos) => {
    // Zone check
    let inZone = false;
    for (const zone of ZONES) {
      const dx = pos.x - zone.position[0];
      const dz = pos.z - zone.position[2];
      if (dx * dx + dz * dz < zone.radius * zone.radius) {
        inZone = true;
        if (activeZoneRef.current !== zone.id) {
          activeZoneRef.current = zone.id;
          onEnterZone(zone);
        }
        break;
      }
    }
    if (!inZone && activeZoneRef.current !== null) {
      activeZoneRef.current = null;
      onExitZone();
    }

    // Stand proximity — always check, independent of zones
    let foundStand = null;
    for (const stand of STANDS) {
      const dx = pos.x - stand.position[0];
      const dz = pos.z - stand.position[2];
      if (dx * dx + dz * dz < STAND_RADIUS * STAND_RADIUS) {
        foundStand = stand;
        break;
      }
    }
    if (foundStand) {
      if (nearStandRef.current?.id !== foundStand.id) {
        nearStandRef.current = foundStand;
        onNearStand && onNearStand(foundStand);
      }
    } else {
      if (nearStandRef.current !== null) {
        nearStandRef.current = null;
        onLeaveStand && onLeaveStand();
      }
    }
  }, [onEnterZone, onExitZone, onNearStand, onLeaveStand]);

  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06000f, 0.016);
    scene.background = new THREE.Color(0x06000f);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 180);
    camera.position.set(0, 1.7, 14);

    // Renderer — NO shadows, minimal settings for max performance
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance', precision: 'lowp' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const canvas = renderer.domElement;

    // ── Single ambient light only — no dynamic lights at all for max perf ──
    scene.add(new THREE.AmbientLight(0x1a0535, 3.5));

    // Glow textures
    const gt = {
      cyan: makeGlowTexture('#00ffff'),
      magenta: makeGlowTexture('#ff00ff'),
      yellow: makeGlowTexture('#ffff00'),
      blue: makeGlowTexture('#4488ff'),
      orange: makeGlowTexture('#ff6600'),
      pink: makeGlowTexture('#ff44aa'),
    };

    // Video screen animated canvas
    const videoScreen = makeVideoCanvasTexture();
    videoScreenRef.current = videoScreen;

    const extraCanvases = buildCity(scene, flickerObjectsRef.current, gt, videoScreen.tex);
    extraCanvasesRef.current = extraCanvases;

    // Controls
    const handleClick = () => { canvas.requestPointerLock(); };
    const handlePointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === canvas;
    };
    const handleMouseMove = (e) => {
      if (!isLockedRef.current) return;
      mouseDeltaRef.current.x += e.movementX;
      mouseDeltaRef.current.y += e.movementY;
    };
    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      if (['KeyW','KeyS','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault();
        isLockedRef.current = true;
      }
      // Stand interaction — works regardless of pointer lock state
      if (nearStandRef.current && e.key.toUpperCase() === nearStandRef.current.key.toUpperCase()) {
        if (document.pointerLockElement) document.exitPointerLock();
        onActivateStand && onActivateStand(nearStandRef.current);
      }
    };
    const handleKeyUp = (e) => { keysRef.current[e.code] = false; };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const dir = new THREE.Vector3();
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    let frameCount = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clockRef.current.getDelta(), 0.05);
      frameCount++;

      // Smooth mouse look — accumulate deltas then lerp
      if (isLockedRef.current && (mouseDeltaRef.current.x !== 0 || mouseDeltaRef.current.y !== 0)) {
        targetYawRef.current -= mouseDeltaRef.current.x * LOOK_SPEED;
        targetPitchRef.current -= mouseDeltaRef.current.y * LOOK_SPEED;
        targetPitchRef.current = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, targetPitchRef.current));
        mouseDeltaRef.current.x = 0;
        mouseDeltaRef.current.y = 0;
      }
      yawRef.current += (targetYawRef.current - yawRef.current) * LOOK_SMOOTH;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * LOOK_SMOOTH;

      // Movement
      const k = keysRef.current;
      const moving = k['KeyW'] || k['ArrowUp'] || k['KeyS'] || k['ArrowDown'] || k['KeyA'] || k['ArrowLeft'] || k['KeyD'] || k['ArrowRight'];
      if (isLockedRef.current && moving) {
        dir.set(0, 0, 0);
        if (k['KeyW'] || k['ArrowUp']) dir.z -= 1;
        if (k['KeyS'] || k['ArrowDown']) dir.z += 1;
        if (k['KeyA'] || k['ArrowLeft']) dir.x -= 1;
        if (k['KeyD'] || k['ArrowRight']) dir.x += 1;
        dir.normalize();
        euler.set(0, yawRef.current, 0);
        dir.applyEuler(euler);
        camera.position.addScaledVector(dir, MOVE_SPEED * delta);
        // Clamp position — stop at boundary, never teleport back
        camera.position.x = Math.max(-85, Math.min(85, camera.position.x));
        camera.position.z = Math.max(-85, Math.min(85, camera.position.z));
        camera.position.y = 1.7;
      }

      euler.set(pitchRef.current, yawRef.current, 0);
      camera.quaternion.setFromEuler(euler);
      checkZoneProximity(camera.position);

      // Flicker — update every 6th frame for perf
      if (frameCount % 6 === 0) {
        const t = frameCount * 0.016;
        for (let i = 0; i < flickerObjectsRef.current.length; i++) {
          const o = flickerObjectsRef.current[i];
          o.material.emissiveIntensity = o.baseIntensity + Math.sin(t * o.flickerSpeed + o.flickerOffset) * 0.2;
        }
      }
      // Video canvas update every 2 frames
      if (frameCount % 2 === 0 && videoScreenRef.current) {
        videoScreenRef.current.draw(frameCount * 0.016);
      }
      // Extra canvases update every 4 frames staggered
      if (frameCount % 4 === 0) {
        const t = frameCount * 0.016;
        for (let i = 0; i < extraCanvasesRef.current.length; i++) {
          if (frameCount % 4 === (i % 4)) extraCanvasesRef.current[i].draw(t + i * 1.3);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [checkZoneProximity]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function basicMat(params) {
  return new THREE.MeshBasicMaterial(params);
}

function emissiveMat(color, intensity = 1.0) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.1, metalness: 0 });
}

function addGlowSprite(scene, x, y, z, texture, size = 6) {
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(size);
  sprite.position.set(x, y, z);
  scene.add(sprite);
  return sprite;
}

function colorToGlowKey(color) {
  const map = { 0x00ffff: 'cyan', 0xff00ff: 'magenta', 0xffff00: 'yellow', 0x4488ff: 'blue', 0x0088ff: 'blue', 0xff6600: 'orange', 0xff44aa: 'pink' };
  return map[color] || 'magenta';
}

// ─── Main city builder ────────────────────────────────────────────────────────

function buildCity(scene, flicker, gt, videoTex) {
  const extraCanvases = [];
  // Ground — wet purple-dark asphalt
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshStandardMaterial({ color: 0x03000a, roughness: 0.15, metalness: 0.7 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(220, 80, 0xff00ff, 0x0a0020);
  grid.material.opacity = 0.1;
  grid.material.transparent = true;
  scene.add(grid);

  // Roads
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x04010a, roughness: 0.3, metalness: 0.6 });
  const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(220, 12), roadMat);
  hRoad.rotation.x = -Math.PI / 2; hRoad.position.y = 0.01; scene.add(hRoad);
  const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(12, 220), roadMat);
  vRoad.rotation.x = -Math.PI / 2; vRoad.position.y = 0.01; scene.add(vRoad);

  // Neon road edge strips — single emissive plane each
  [[7, 0, 220, 0.3], [-7, 0, 220, 0.3], [0, 7, 0.3, 220], [0, -7, 0.3, 220]].forEach(([x, z, w, d]) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: 0xff00ff }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, 0.015, z);
    scene.add(mesh);
  });

  // Zone buildings
  ZONES.forEach(zone => createZoneBuilding(scene, zone, flicker, gt, videoTex));

  // Mid-range buildings — reduced to 10, no glow sprites
  const midPositions = [
    [-18,-22],[18,-22],[-22,18],[22,18],
    [-28,-28],[28,-28],[-28,28],[28,28],
    [-38,0],[38,0],
  ];
  const neonPalette = [0x00ffff, 0xff00ff, 0xffff00, 0x4488ff, 0xff44aa];
  midPositions.forEach(([x, z], i) => {
    const h = 10 + (i * 4.1 % 22);
    const w = 4 + (i * 1.7 % 6);
    const nc = neonPalette[i % neonPalette.length];
    createMidBuilding(scene, x, z, w, h, nc, flicker);
  });

  // Billboard signs — 2 only
  addBillboard(scene, 14, 5, -3, '◆ SOFTWARE', '#00ffff');
  addBillboard(scene, -14, 5, 3, '◆ VIDEO 360', '#ff00ff');

  // Interactive stands
  STANDS.forEach(stand => addStandBooth(scene, stand));

  // Extra animated canvas screens on zone buildings
  const screenDefs = [
    // [x, y, z, w, h, rotY, label, color]
    [20 + 4.1, 10, -20, 6, 3.4, -Math.PI/2, 'TECH HUB', '#00ffff'],
    [-20, 12, -20 - 4.6, 7, 3.9, Math.PI, 'STUDIO 360', '#ff00ff'],
    [20 - 4.1, 8, 20, 5.5, 3.1, Math.PI/2, 'AVATAR LAB', '#ffff00'],
    [-20 + 4.6, 9, 20, 5, 2.8, 0, 'EVENT DOME', '#ff6600'],
    // Extra floating screens near center
    [8, 7, -2, 4.5, 2.5, -Math.PI/6, 'LIVE XR', '#ff44aa'],
    [-8, 6, -2, 4, 2.2, Math.PI/6, 'METAVERSE', '#4488ff'],
    [0, 14, -10, 5.5, 3.1, 0, 'NEXUS FEED', '#00ffff'],
  ];
  screenDefs.forEach(([x, y, z, w, h, rotY, label, color]) => {
    const cv = makeVideoCanvasTexture(label, color);
    extraCanvases.push(cv);
    addExtraScreen(scene, x, y, z, w, h, cv.tex, flicker, rotY);
  });

  // Distant skyline — 16 simple boxes, no glow sprites
  const skyMat = new THREE.MeshBasicMaterial({ color: 0x04010e });
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 75 + (i % 4) * 8;
    const h = 14 + (i % 8) * 6;
    const w = 5 + (i % 4) * 2;
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), skyMat);
    body.position.set(bx, h / 2, bz);
    scene.add(body);
    // Colored cap
    const nc = neonPalette[i % neonPalette.length];
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, w), new THREE.MeshBasicMaterial({ color: nc }));
    cap.position.set(bx, h + 0.2, bz);
    scene.add(cap);
  }

  // Floating particles — reduced count
  const count = 200;
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const particleColors = [[0,1,1],[1,0,1],[1,0.8,0],[0.3,0.5,1]];
  for (let i = 0; i < count; i++) {
    pos[i*3] = (Math.random() - 0.5) * 160;
    pos[i*3+1] = Math.random() * 35 + 1;
    pos[i*3+2] = (Math.random() - 0.5) * 160;
    const c = particleColors[i % 4];
    colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true, transparent: true, opacity: 0.7 })));

  return extraCanvases;
}

// ─── Zone building ────────────────────────────────────────────────────────────

function createZoneBuilding(scene, zone, flicker, gt, videoTex) {
  const [x, , z] = zone.position;
  const h = zone.buildingHeight || 16;
  const w = zone.buildingWidth || 8;
  const color = zone.color;
  const isHQ = zone.isHQ;

  // Body — dark
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, w),
    new THREE.MeshStandardMaterial({ color: 0x04010c, roughness: 0.35, metalness: 0.9 })
  );
  body.position.set(x, h / 2, z);
  scene.add(body);

  // Ledges
  [0.4, 0.7, 1.0].forEach(frac => {
    const lMat = emissiveMat(color, frac === 1.0 ? 0.9 : 0.5);
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.18, w + 0.6), lMat);
    ledge.position.set(x, h * frac, z);
    scene.add(ledge);
    flicker.push({ material: lMat, baseIntensity: frac === 1.0 ? 0.9 : 0.5, flickerSpeed: 0.3 + Math.random() * 0.6, flickerOffset: Math.random() * Math.PI * 2 });
  });

  // Corner strips
  [[-w/2,-w/2],[w/2,-w/2],[-w/2,w/2],[w/2,w/2]].forEach(([ox, oz]) => {
    const mat = emissiveMat(color, 1.3);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, 0.12), mat);
    strip.position.set(x + ox, h/2, z + oz);
    scene.add(strip);
    flicker.push({ material: mat, baseIntensity: 1.3, flickerSpeed: 0.5 + Math.random(), flickerOffset: Math.random() * Math.PI * 2 });
  });

  // Window grid — instanced for performance
  const winGeo = new THREE.PlaneGeometry(0.6, 0.8);
  const winColors = [color, 0xaaaaff, 0xff88ff];
  const offsets4 = [
    [0,  w/2+0.02, 0],
    [0, -w/2-0.02, Math.PI],
    [-w/2-0.02, 0, Math.PI/2],
    [w/2+0.02,  0, -Math.PI/2],
  ];
  offsets4.forEach(([ox, oz, ry]) => {
    const wc = winColors[Math.floor(Math.random() * winColors.length)];
    const mat = emissiveMat(wc, 0.7);
    flicker.push({ material: mat, baseIntensity: 0.7, flickerSpeed: 0.3 + Math.random(), flickerOffset: Math.random() * Math.PI * 2 });
    const floors = Math.floor(h / 2.2);
    const count = floors * 3;
    const inst = new THREE.InstancedMesh(winGeo, mat, count);
    inst.frustumCulled = true;
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let floor = 1; floor <= floors; floor++) {
      for (let col = 0; col < 3; col++) {
        dummy.position.set(x + ox + (col - 1) * 2, floor * 2.2, z + oz);
        dummy.rotation.y = ry;
        dummy.updateMatrix();
        inst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    inst.instanceMatrix.needsUpdate = true;
    scene.add(inst);
  });

  // HQ gets the big video screen billboard
  if (isHQ && videoTex) {
    addVideoScreen(scene, x, z, w, h, videoTex, flicker);
  }

  // Zone billboard name above building
  const signTex = makeNeonSignTexture(zone.label || zone.id.toUpperCase(), zone.colorHex);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.2, w * 0.3), signMat);
  sign.position.set(x, h + 1.8, z + w / 2 + 0.05);
  scene.add(sign);

  // Ground zone ring
  const ringMat = emissiveMat(color, 0.7);
  ringMat.transparent = true; ringMat.opacity = 0.45; ringMat.side = THREE.DoubleSide;
  const ring = new THREE.Mesh(new THREE.RingGeometry(zone.radius - 0.3, zone.radius, 64), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.04, z);
  scene.add(ring);
  flicker.push({ material: ringMat, baseIntensity: 0.7, flickerSpeed: 0.4, flickerOffset: Math.random() * Math.PI * 2 });

  // No PointLights — use emissive + glow sprites only

  // Glow halos
  const gKey = colorToGlowKey(color);
  addGlowSprite(scene, x, h + 4, z, gt[gKey], 26);
  addGlowSprite(scene, x, h + 1, z, gt[gKey], 12);
  addGlowSprite(scene, x, 0.6, z, gt[gKey], 10);
}

// ─── Video screen for HQ building ────────────────────────────────────────────

function addVideoScreen(scene, bx, bz, bw, bh, videoTex, flicker) {
  // Big screen on front face
  const screenW = bw * 1.6;
  const screenH = screenW * (9 / 16);
  const screenMat = new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.FrontSide });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMat);
  screen.position.set(bx, bh * 0.55, bz + bw / 2 + 0.08);
  scene.add(screen);

  // Neon border around screen
  const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(screenW + 0.2, screenH + 0.2, 0.05));
  const borderLine = new THREE.LineSegments(borderGeo, new THREE.LineBasicMaterial({ color: 0xff00ff }));
  borderLine.position.set(bx, bh * 0.55, bz + bw / 2 + 0.1);
  scene.add(borderLine);

  // Glow around screen
  const sprMat = new THREE.SpriteMaterial({ color: 0xff00ff, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });
  const spr = new THREE.Sprite(sprMat);
  spr.scale.set(screenW * 1.5, screenH * 1.5, 1);
  spr.position.set(bx, bh * 0.55, bz + bw / 2 + 0.5);
  scene.add(spr);
  flicker.push({ material: spr.material, baseIntensity: 0.25, flickerSpeed: 0.8, flickerOffset: 0 });

  // Side panel screen (smaller)
  const sideMat = new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.FrontSide });
  const side = new THREE.Mesh(new THREE.PlaneGeometry(screenW * 0.6, screenH * 0.6), sideMat);
  side.rotation.y = -Math.PI / 2;
  side.position.set(bx + bw / 2 + 0.08, bh * 0.6, bz);
  scene.add(side);
}

// ─── Extra canvas screens on mid buildings ────────────────────────────────────

function addExtraScreen(scene, x, y, z, w, h, canvasTex, flicker, rotY = 0) {
  const mat = new THREE.MeshBasicMaterial({ map: canvasTex, side: THREE.FrontSide, transparent: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotY;
  scene.add(mesh);

  // neon border
  const bGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.15, h + 0.15, 0.04));
  const bLine = new THREE.LineSegments(bGeo, new THREE.LineBasicMaterial({ color: 0x00ffff }));
  bLine.position.set(x, y, z);
  bLine.rotation.y = rotY;
  scene.add(bLine);

  // glow sprite
  const sprMat = new THREE.SpriteMaterial({ color: 0x00ffff, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending });
  const spr = new THREE.Sprite(sprMat);
  spr.scale.set(w * 1.6, h * 1.6, 1);
  spr.position.set(x, y, z);
  scene.add(spr);
  flicker.push({ material: sprMat, baseIntensity: 0.18, flickerSpeed: 0.6, flickerOffset: Math.random() * Math.PI * 2 });
}

// ─── Mid building ─────────────────────────────────────────────────────────────

function createMidBuilding(scene, x, z, w, h, nc, flicker) {
  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, w * 0.9),
    new THREE.MeshBasicMaterial({ color: 0x04010c })
  );
  body.position.set(x, h / 2, z);
  scene.add(body);

  // Top cap
  const capMat = emissiveMat(nc, 1.0);
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.2, w * 0.9 + 0.2), capMat);
  cap.position.set(x, h + 0.1, z);
  scene.add(cap);
  flicker.push({ material: capMat, baseIntensity: 1.0, flickerSpeed: 0.5 + Math.random(), flickerOffset: Math.random() * Math.PI * 2 });

  // Side neon strip
  const stripMat = emissiveMat(nc, 0.8);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.6, 0.1), stripMat);
  strip.position.set(x + w/2, h * 0.5, z + w * 0.45);
  scene.add(strip);
  flicker.push({ material: stripMat, baseIntensity: 0.8, flickerSpeed: 0.6 + Math.random() * 0.8, flickerOffset: Math.random() * Math.PI * 2 });

  // Windows — single instanced mesh for perf
  const floors = Math.floor(h / 3.5);
  if (floors > 0) {
    const wMat = emissiveMat(nc, 0.6);
    const wInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.7, 0.9), wMat, floors);
    const dum = new THREE.Object3D();
    for (let f = 1; f <= floors; f++) {
      dum.position.set(x, f * 3.5, z + w * 0.45 + 0.02);
      dum.updateMatrix();
      wInst.setMatrixAt(f - 1, dum.matrix);
    }
    wInst.instanceMatrix.needsUpdate = true;
    scene.add(wInst);
  }

  // No glow sprite for mid buildings — perf
}

// ─── Interactive stand booth ─────────────────────────────────────────────────

function makeKeyPromptTexture(key, color) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  // transparent bg
  ctx.clearRect(0, 0, size, size);
  // outer glow circle
  const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 60);
  grad.addColorStop(0, color + 'cc');
  grad.addColorStop(0.5, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  // letter
  ctx.shadowBlur = 24;
  ctx.shadowColor = color;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(key, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function addStandBooth(scene, stand) {
  const [x, , z] = stand.position;
  const c = stand.colorInt;
  const ch = stand.color;

  // Base platform
  const platMat = new THREE.MeshStandardMaterial({ color: 0x06020e, roughness: 0.3, metalness: 0.8 });
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.25, 16), platMat);
  plat.position.set(x, 0.12, z);
  scene.add(plat);

  // Neon ring on platform
  const ringMat = new THREE.MeshBasicMaterial({ color: c });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.07, 8, 32), ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, 0.28, z);
  scene.add(ring);

  // Kiosk column
  const colMat = new THREE.MeshStandardMaterial({ color: 0x08021a, roughness: 0.2, metalness: 0.9 });
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 2.8, 8), colMat);
  col.position.set(x, 1.65, z);
  scene.add(col);

  // Column neon strip
  const stripMat = new THREE.MeshBasicMaterial({ color: c });
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.8, 0.05), stripMat);
  strip.position.set(x + 0.32, 1.65, z);
  scene.add(strip);

  // Top cap disc
  const capMat = emissiveMat(c, 1.2);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.3, 0.18, 8), capMat);
  cap.position.set(x, 3.15, z);
  scene.add(cap);

  // Floating key prompt sprite (above booth)
  const keyTex = makeKeyPromptTexture(stand.key, ch);
  const keyMat = new THREE.SpriteMaterial({ map: keyTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const keySprite = new THREE.Sprite(keyMat);
  keySprite.scale.setScalar(2.0);
  keySprite.position.set(x, 4.4, z);
  scene.add(keySprite);

  // Glow halo
  const glowMat = new THREE.SpriteMaterial({ color: c, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.setScalar(6);
  glow.position.set(x, 2.0, z);
  scene.add(glow);

  // Small title sign
  const signTex = makeNeonSignTexture(stand.id === 'back_to_life' ? 'BACK TO LIFE' : stand.title.substring(0, 12), ch);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.8), signMat);
  sign.position.set(x, 3.7, z + 0.4);
  scene.add(sign);
}

// ─── Billboard sign ───────────────────────────────────────────────────────────

function addBillboard(scene, x, y, z, text, colorHex) {
  const tex = makeNeonSignTexture(text, colorHex);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.3), mat);
  mesh.position.set(x, y, z);
  scene.add(mesh);

  // Support pole
  const pole = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, y, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x111122 })
  );
  pole.position.set(x, y / 2, z);
  scene.add(pole);
}