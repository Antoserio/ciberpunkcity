import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { ZONES } from './cityData';
import { addPlazaVideoScreen } from './PlazaVideoScreen.jsx';

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
function makeVideoCanvasTexture(label, accentColor, mode = 'generic') {
  label = label || 'AGENCY360';
  accentColor = accentColor || '#ff00ff';
  const W = 512, H = 288;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);

  function draw(t) {
    ctx.fillStyle = '#050010';
    ctx.fillRect(0, 0, W, H);

    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, `hsla(280,100%,${20 + 10 * Math.sin(t * 0.3)}%,0.9)`);
    grd.addColorStop(0.5, `hsla(200,100%,${15 + 8 * Math.cos(t * 0.5)}%,0.7)`);
    grd.addColorStop(1, `hsla(320,100%,${18 + 6 * Math.sin(t * 0.7)}%,0.8)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 4; i++) {
      const y = (Math.sin(t * 2.1 + i * 1.3) * 0.5 + 0.5) * H;
      const alpha = 0.08 + 0.05 * Math.sin(t * 3 + i);
      ctx.fillStyle = `rgba(0,255,255,${alpha})`;
      ctx.fillRect(0, y, W, 2 + Math.random() * 4);
    }

    ctx.strokeStyle = 'rgba(0,255,255,0.12)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    const pulse = 0.8 + 0.2 * Math.sin(t * 1.5);
    if (mode === 'dance') {
      ctx.save();
      ctx.globalAlpha = 0.32 + 0.08 * Math.sin(t * 1.4);
      ctx.fillStyle = '#ff4db8';
      for (let i = 0; i < 7; i++) {
        const barX = 40 + i * 70 + Math.sin(t * 0.8 + i) * 8;
        ctx.fillRect(barX, 20, 18, H - 40);
      }
      ctx.restore();

      ctx.save();
      ctx.translate(W * 0.32 + Math.sin(t * 1.2) * 14, H * 0.6 + Math.cos(t * 1.5) * 10);
      ctx.rotate(-0.28 + Math.sin(t * 0.9) * 0.05);
      ctx.fillStyle = 'rgba(255, 210, 240, 0.92)';
      ctx.shadowBlur = 35;
      ctx.shadowColor = accentColor;
      ctx.fillRect(-16, -90, 24, 110);
      ctx.fillRect(-42, -20, 80, 22);
      ctx.fillRect(-30, 18, 20, 92);
      ctx.fillRect(2, 18, 20, 92);
      ctx.restore();

      ctx.save();
      ctx.translate(W * 0.58 + Math.sin(t * 1.5 + 1.2) * 16, H * 0.58 + Math.cos(t * 1.1 + 0.4) * 12);
      ctx.rotate(0.22 + Math.sin(t * 1.1) * 0.06);
      ctx.fillStyle = 'rgba(255, 235, 245, 0.95)';
      ctx.shadowBlur = 35;
      ctx.shadowColor = '#ffffff';
      ctx.fillRect(-12, -84, 22, 102);
      ctx.fillRect(-34, -12, 66, 20);
      ctx.fillRect(-24, 18, 18, 84);
      ctx.fillRect(2, 18, 18, 84);
      ctx.restore();

      const tickerOffset = (t * 90) % (W + 900);
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(255,120,210,0.95)';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('◆ STUDIO 360 ◆ DANCE MAPPING ◆ PERFORMANCE VISUAL ◆ AGENCY360 ◆', W - tickerOffset, H - 16);
    } else {
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

      const tickerOffset = (t * 60) % (W + 800);
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(255,255,0,0.9)';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('◆ SOFTWARE  ◆ VIDEO 360°  ◆ AVATARES 3D  ◆ EVENTOS XR  ◆ METAVERSO  ◆ STREAMING  ', W - tickerOffset, H - 14);
    }

    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(0, y, W, 1.5);
    }

    tex.needsUpdate = true;
  }

  return { canvas, tex, draw };
}

// Building wall texture — Cyberpunk style, each face unique (seed-based)
const KANJI = ['声','石','山','テレビ','ゲーム','電子','未来','空間','光','都市','次元','波','夢','速','力'];
const WALL_TEXTS = [
  ['AGENCY360','SOFTWARE','12/20/2021','◆ XR'],
  ['VIRTUAL','CREATIVE','VIDEO 360°','METAVERSE'],
  ['STREAMING','AVATARES','EVENTOS','DIGITAL'],
  ['◉ SPORT','◉ TECH','◉ ART','◉ XR'],
  ['360°','3D','AR/VR','LIVE'],
];
const WALL_PALETTES = [
  ['#ff0044','#ff4488','#ffffff'],
  ['#00ffff','#0088ff','#ffffff'],
  ['#ff00ff','#ff44cc','#ffffff'],
  ['#ffff00','#ffaa00','#ffffff'],
  ['#ff6600','#ff9900','#ffffff'],
  ['#00ff88','#00ffcc','#ffffff'],
];

function makeBuildingWallTexture(accentColor, seed) {
  seed = seed || 0;
  const W = 512, H = 512;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // seeded pseudo-random
  let s = seed * 9301 + 49297;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const palette = WALL_PALETTES[seed % WALL_PALETTES.length];
  const c1 = palette[0], c2 = palette[1], cw = palette[2];

  // Dark base gradient
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#060008');
  grd.addColorStop(0.5, '#0a000f');
  grd.addColorStop(1, '#020005');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // Random colored panels / blocks — like the billboard image
  const panelCount = 4 + Math.floor(rng() * 5);
  for (let i = 0; i < panelCount; i++) {
    const px = Math.floor(rng() * W * 0.8);
    const py = Math.floor(rng() * H * 0.7);
    const pw = 60 + Math.floor(rng() * 180);
    const ph = 40 + Math.floor(rng() * 120);
    const alpha = 0.08 + rng() * 0.18;
    ctx.fillStyle = i % 2 === 0 ? c1 : c2;
    ctx.globalAlpha = alpha;
    ctx.fillRect(px, py, pw, ph);
    ctx.globalAlpha = 1;
    // panel border
    ctx.strokeStyle = i % 2 === 0 ? c1 : c2;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4 + rng() * 0.4;
    ctx.strokeRect(px, py, pw, ph);
    ctx.globalAlpha = 1;
  }

  // Horizontal neon divider lines
  const lineCount = 3 + Math.floor(rng() * 4);
  for (let i = 0; i < lineCount; i++) {
    const ly = Math.floor(rng() * H);
    const lw = rng() > 0.5 ? W : W * (0.3 + rng() * 0.6);
    const lx = rng() > 0.5 ? 0 : Math.floor(rng() * (W - lw));
    ctx.strokeStyle = rng() > 0.5 ? c1 : c2;
    ctx.lineWidth = 1 + Math.floor(rng() * 2);
    ctx.shadowBlur = 8 + rng() * 10;
    ctx.shadowColor = rng() > 0.5 ? c1 : c2;
    ctx.globalAlpha = 0.6 + rng() * 0.4;
    ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + lw, ly); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Vertical neon strips
  for (let i = 0; i < 2; i++) {
    const vx = Math.floor(rng() * W);
    ctx.strokeStyle = rng() > 0.5 ? c1 : c2;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 12;
    ctx.shadowColor = rng() > 0.5 ? c1 : c2;
    ctx.globalAlpha = 0.5 + rng() * 0.4;
    ctx.beginPath(); ctx.moveTo(vx, 0); ctx.lineTo(vx, H); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Big KANJI characters (like the screenshot)
  const kanjiCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < kanjiCount; i++) {
    const kj = KANJI[Math.floor(rng() * KANJI.length)];
    const kx = 40 + Math.floor(rng() * (W - 80));
    const ky = 60 + Math.floor(rng() * (H - 120));
    const ks = 60 + Math.floor(rng() * 80);
    ctx.shadowBlur = 20 + rng() * 20;
    ctx.shadowColor = rng() > 0.5 ? c1 : c2;
    ctx.fillStyle = rng() > 0.3 ? cw : (rng() > 0.5 ? c1 : c2);
    ctx.globalAlpha = 0.7 + rng() * 0.3;
    ctx.font = `bold ${ks}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(kj, kx, ky);
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Main brand text block — varies per seed
  const texts = WALL_TEXTS[seed % WALL_TEXTS.length];
  const mainText = texts[0];
  const subText = texts[1 + (seed % (texts.length - 1))];

  // Big main label
  ctx.shadowBlur = 30;
  ctx.shadowColor = c1;
  ctx.fillStyle = c1;
  ctx.globalAlpha = 0.95;
  ctx.font = `bold ${38 + Math.floor(rng() * 18)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mainText, W / 2, H * 0.38);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  // Sub label
  ctx.shadowBlur = 14;
  ctx.shadowColor = c2;
  ctx.fillStyle = c2;
  ctx.globalAlpha = 0.85;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(subText, W / 2, H * 0.38 + 50);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  // Date / number block (like "12/20/2021" in screenshot)
  if (rng() > 0.4) {
    const dateStr = `${Math.floor(rng()*12+1).toString().padStart(2,'0')}/${Math.floor(rng()*28+1).toString().padStart(2,'0')}/202${Math.floor(rng()*5)}`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = cw;
    ctx.fillStyle = cw;
    ctx.globalAlpha = 0.6;
    ctx.font = 'bold 28px monospace';
    ctx.fillText(dateStr, W / 2, H * 0.62);
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Circle / globe element (like the world map circle in the screenshot)
  if (rng() > 0.5) {
    const cx2 = 60 + Math.floor(rng() * (W - 120));
    const cy2 = H * 0.72 + Math.floor(rng() * 60);
    const cr = 28 + Math.floor(rng() * 30);
    ctx.strokeStyle = rng() > 0.5 ? c1 : c2;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 16;
    ctx.shadowColor = rng() > 0.5 ? c1 : c2;
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(cx2, cy2, cr, 0, Math.PI * 2); ctx.stroke();
    // inner cross
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(cx2 - cr, cy2); ctx.lineTo(cx2 + cr, cy2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx2, cy2 - cr); ctx.lineTo(cx2, cy2 + cr); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  // Bottom ticker text
  const tickerTexts = ['◆ SOFTWARE  ◆ VIDEO 360°  ', '◆ AVATARES 3D  ◆ EVENTOS XR  ', '◆ METAVERSO  ◆ STREAMING  ', '◆ AR/VR  ◆ MAPPING  ◆ XR  '];
  ctx.shadowBlur = 8;
  ctx.shadowColor = c2;
  ctx.fillStyle = c2;
  ctx.globalAlpha = 0.8;
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(tickerTexts[seed % tickerTexts.length], 10, H - 14);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  // Scanlines overlay
  for (let y = 0; y < H; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, y, W, 2);
  }

  return new THREE.CanvasTexture(canvas);
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
const LOOK_SPEED = 0.0032;
const LOOK_SMOOTH = 0.22;
const MAX_PITCH = Math.PI / 2 - 0.02;


export default function CityWorld({ onEnterZone, onExitZone, onNearStand, onLeaveStand, onActivateStand, modalOpen, plazaVideoUrl }) {
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
  const modalOpenRef = useRef(false);

  // When modal opens: freeze movement immediately by clearing pressed keys and unlocking
  useEffect(() => {
    modalOpenRef.current = modalOpen;
    if (modalOpen) {
      keysRef.current = {};
      isLockedRef.current = false;
    }
  }, [modalOpen]);

  const checkZoneProximity = useCallback((pos) => {
    // Don't update proximity state while a modal is open
    if (modalOpenRef.current) return;
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

    // Video screen texture
    const videoScreen = makeVideoCanvasTexture('DANCE XR', '#ff00ff', 'dance');
    videoScreenRef.current = videoScreen;

    let plazaVideoElement = null;
    let plazaVideoTexture = null;
    let plazaVideoScreen = null;

    if (plazaVideoUrl) {
      plazaVideoElement = document.createElement('video');
      plazaVideoElement.src = plazaVideoUrl;
      plazaVideoElement.crossOrigin = 'anonymous';
      plazaVideoElement.muted = true;
      plazaVideoElement.loop = true;
      plazaVideoElement.playsInline = true;
      plazaVideoElement.autoplay = true;
      plazaVideoElement.setAttribute('muted', '');
      plazaVideoElement.setAttribute('playsinline', '');
      plazaVideoElement.play().catch(() => {});

      plazaVideoTexture = new THREE.VideoTexture(plazaVideoElement);
      plazaVideoTexture.colorSpace = THREE.SRGBColorSpace;
      plazaVideoTexture.minFilter = THREE.LinearFilter;
      plazaVideoTexture.magFilter = THREE.LinearFilter;
      plazaVideoTexture.generateMipmaps = false;

      plazaVideoScreen = addPlazaVideoScreen(scene, plazaVideoTexture);
    }

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
      // Block all movement and interaction while modal is open
      if (modalOpenRef.current) return;
      keysRef.current[e.code] = true;
      if (['KeyW','KeyS','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault();
        isLockedRef.current = true;
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
        targetPitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, targetPitchRef.current));
        mouseDeltaRef.current.x = 0;
        mouseDeltaRef.current.y = 0;
      }
      yawRef.current += (targetYawRef.current - yawRef.current) * LOOK_SMOOTH;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * LOOK_SMOOTH;
      pitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchRef.current));

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
      plazaVideoScreen?.dispose();
      plazaVideoTexture?.dispose();
      if (plazaVideoElement) {
        plazaVideoElement.pause();
        plazaVideoElement.src = '';
        plazaVideoElement.load();
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [checkZoneProximity, plazaVideoUrl]);

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
  // Ground — plaza oscura abierta
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshStandardMaterial({
      color: 0x140a2c,
      roughness: 0.1,
      metalness: 0.42,
      transparent: true,
      opacity: 0.52,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const groundSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshBasicMaterial({
      color: 0x5d2a8a,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    })
  );
  groundSheen.rotation.x = -Math.PI / 2;
  groundSheen.position.y = 0.015;
  scene.add(groundSheen);

  // Plaza central abierta, sin cuadrante marcado
  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(32, 64),
    new THREE.MeshBasicMaterial({ color: 0x0b0820, transparent: true, opacity: 0.22 })
  );
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.y = 0.012;
  scene.add(plaza);

  // Zone buildings
  ZONES.forEach(zone => createZoneBuilding(scene, zone, flicker, gt, videoTex));

  // Mid-range buildings — perímetro abierto con fondo más denso
  const midPositions = [
    [-18,-30],[18,-30],[-30,18],[30,18],
    [-34,-34],[34,-34],[-34,34],[34,34],
    [-46,-18],[46,-18],[-46,18],[46,18],
    [-12,-44],[12,-44],[-12,44],[12,44],
    [-58,-30],[-44,-30],[-30,-30],[30,-30],[44,-30],[58,-30],
    [-58,30],[-44,30],[-30,30],[30,30],[44,30],[58,30],
  ];
  const neonPalette = [0x00ffff, 0xff00ff, 0xffff00, 0x4488ff, 0xff44aa];
  midPositions.forEach(([x, z], i) => {
    const h = 10 + (i * 4.1 % 22);
    const w = 4 + (i * 1.7 % 6);
    const nc = neonPalette[i % neonPalette.length];
    createMidBuilding(scene, x, z, w, h, nc, flicker);
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

  // Body — each face gets a unique cyberpunk panel texture
  const baseSeed = Math.abs(Math.round(x * 7 + z * 13)) % 100;
  const makeWall = (s) => new THREE.MeshBasicMaterial({ map: makeBuildingWallTexture(zone.colorHex, s) });
  const bodyMats = [
    makeWall(baseSeed),           // right
    makeWall(baseSeed + 1),       // left
    new THREE.MeshStandardMaterial({ color: 0x0a000f, roughness: 0.2, metalness: 0.95 }), // top
    new THREE.MeshStandardMaterial({ color: 0x0a000f, roughness: 0.2, metalness: 0.95 }), // bottom
    makeWall(baseSeed + 2),       // front
    makeWall(baseSeed + 3),       // back
  ];
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), bodyMats);
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

  // Small window dots — tiny squares only on front face, not floating planes
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

  // No PointLights — use emissive + glow sprites only

  // Glow halos
  const gKey = colorToGlowKey(color);
  addGlowSprite(scene, x, h + 4, z, gt[gKey], 26);
  addGlowSprite(scene, x, h + 1, z, gt[gKey], 12);
}

// ─── Video screen for HQ building ────────────────────────────────────────────

function addVideoScreen(scene, bx, bz, bw, bh, videoTex, flicker) {
  const facadeW = bw;
  const facadeH = bh * 0.82;
  const facadeY = bh * 0.48;

  const screenMat = new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.FrontSide });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(facadeW, facadeH), screenMat);
  screen.position.set(bx, facadeY, bz + bw / 2 + 0.08);
  scene.add(screen);

  const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(facadeW + 0.12, facadeH + 0.12, 0.05));
  const borderLine = new THREE.LineSegments(borderGeo, new THREE.LineBasicMaterial({ color: 0xff00ff }));
  borderLine.position.set(bx, facadeY, bz + bw / 2 + 0.1);
  scene.add(borderLine);
}

// ─── Extra canvas screens on mid buildings ────────────────────────────────────

function addExtraScreen(scene, x, y, z, canvasTex, flicker, rotY = 0) {
  const texW = canvasTex.image?.width || 512;
  const texH = canvasTex.image?.height || 288;
  const aspect = texW / texH;
  const h = 5.2;
  const w = h * aspect;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.5, h + 0.5, 0.18),
    new THREE.MeshBasicMaterial({ color: 0x050008 })
  );
  frame.position.set(x, y, z - 0.02);
  frame.rotation.y = rotY;
  scene.add(frame);

  const mat = new THREE.MeshBasicMaterial({ map: canvasTex, side: THREE.FrontSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.position.set(x, y, z + 0.08);
  mesh.rotation.y = rotY;
  scene.add(mesh);

  const bGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.18, h + 0.18, 0.08));
  const bLine = new THREE.LineSegments(bGeo, new THREE.LineBasicMaterial({ color: 0xff00ff }));
  bLine.position.set(x, y, z + 0.05);
  bLine.rotation.y = rotY;
  scene.add(bLine);

  const sprMat = new THREE.SpriteMaterial({ color: 0xff00ff, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending });
  const spr = new THREE.Sprite(sprMat);
  spr.scale.set(w * 1.12, h * 1.08, 1);
  spr.position.set(x, y, z - 0.08);
  scene.add(spr);
  flicker.push({ material: sprMat, baseIntensity: 0.16, flickerSpeed: 0.6, flickerOffset: Math.random() * Math.PI * 2 });
}

// ─── Mid building ─────────────────────────────────────────────────────────────

function createMidBuilding(scene, x, z, w, h, nc, flicker) {
  // Body — each face gets a unique cyberpunk panel texture
  const baseSeed = Math.abs(Math.round(x * 5 + z * 11)) % 100;
  const hexColor = '#' + nc.toString(16).padStart(6, '0');
  const makeMidWall = (s) => new THREE.MeshBasicMaterial({ map: makeBuildingWallTexture(hexColor, s) });
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, w * 0.9),
    [makeMidWall(baseSeed), makeMidWall(baseSeed+1), new THREE.MeshBasicMaterial({color:0x0a000f}), new THREE.MeshBasicMaterial({color:0x0a000f}), makeMidWall(baseSeed+2), makeMidWall(baseSeed+3)]
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

  // Simple window dots — only front face, small and tight
  const floors = Math.floor(h / 3.5);
  if (floors > 0) {
    const wMat = emissiveMat(nc, 0.45);
    const wInst = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.35, 0.45), wMat, floors * 2);
    const dum = new THREE.Object3D();
    let widx = 0;
    for (let f = 1; f <= floors; f++) {
      for (let c = 0; c < 2; c++) {
        dum.position.set(x + (c - 0.5) * (w * 0.4), f * 3.5, z + w * 0.45 + 0.02);
        dum.updateMatrix();
        wInst.setMatrixAt(widx++, dum.matrix);
      }
    }
    wInst.instanceMatrix.needsUpdate = true;
    scene.add(wInst);
  }

  // No glow sprite for mid buildings — perf
}

// ─── Interactive stand booth ─────────────────────────────────────────────────



// ─── Vimeo screen billboard (legacy helper) ───────────────────────────────────

function addVimeoScreen(scene, x, y, z, w, h, rotY, vimeoUrl, flicker, neonColor) {
  // Dark backing panel
  const backMat = new THREE.MeshStandardMaterial({ color: 0x050005, roughness: 0.3, metalness: 0.9 });
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, h + 0.4, 0.25), backMat);
  back.position.set(x, y, z);
  back.rotation.y = rotY;
  scene.add(back);

  // Placeholder canvas — magenta/orange gradient with "▶ VIDEO" label
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 288;
  const ctx = canvas.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 512, 288);
  const hex = '#' + neonColor.toString(16).padStart(6, '0');
  grd.addColorStop(0, '#050010');
  grd.addColorStop(1, hex + '22');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 288);
  ctx.shadowBlur = 30; ctx.shadowColor = hex;
  ctx.fillStyle = hex;
  ctx.font = 'bold 72px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('▶', 256, 120);
  ctx.font = '22px monospace';
  ctx.fillStyle = '#ffffff99';
  ctx.shadowBlur = 0;
  ctx.fillText('AGENCY360 · VIDEO', 256, 180);
  const tex = new THREE.CanvasTexture(canvas);

  const screenMat = new THREE.MeshBasicMaterial({ map: tex });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), screenMat);
  screen.position.set(x, y, z);
  screen.rotation.y = rotY;
  // offset slightly in front of backing
  const offset = 0.15;
  screen.position.x += Math.sin(rotY) * offset;
  screen.position.z += Math.cos(rotY) * offset;
  scene.add(screen);

  // Neon border
  const bGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.05));
  const bLine = new THREE.LineSegments(bGeo, new THREE.LineBasicMaterial({ color: neonColor }));
  bLine.position.copy(screen.position);
  bLine.rotation.y = rotY;
  scene.add(bLine);

  // Glow
  const glowMat = new THREE.SpriteMaterial({ color: neonColor, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(w * 1.8, h * 1.8, 1);
  glow.position.set(x, y, z);
  scene.add(glow);
  flicker.push({ material: glowMat, baseIntensity: 0.2, flickerSpeed: 0.7, flickerOffset: Math.random() * Math.PI * 2 });

  // Support poles
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x222233 });
  [[-w/2 + 0.3], [w/2 - 0.3]].forEach(([ox]) => {
    const pole = new THREE.Mesh(new THREE.BoxGeometry(0.15, y, 0.15), poleMat);
    pole.position.set(x + ox, y / 2, z);
    scene.add(pole);
  });
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