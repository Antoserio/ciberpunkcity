import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ZONES } from './cityData';
import { STANDS } from './standsData';
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

const MOVE_SPEED = 11;
const LOOK_SPEED = 0.0024;
const LOOK_SMOOTH = 0.22;
const MAX_PITCH = Math.PI / 2 - 0.02;
const BUILDING_COLLIDERS = [
  ...ZONES.map((zone) => ({ x: zone.position[0], z: zone.position[2], radius: Math.max(zone.buildingWidth * 0.9, 6) })),
  ...[
    [-18,-30],[18,-30],[-30,18],[30,18],[-34,-34],[34,-34],[-34,34],[34,34],[-46,-18],[46,-18],[-46,18],[46,18],[-12,-44],[12,-44],[-12,44],[12,44],[-58,-30],[-44,-30],[-30,-30],[30,-30],[44,-30],[58,-30],[-58,30],[-44,30],[-30,30],[30,30],[44,30],[58,30],
  ].map(([x, z]) => ({ x, z, radius: 6 }))
];
const HERO_COLORS = [0x00ffff, 0xff00ff, 0xffff00, 0x7c3aed, 0x4488ff];


export default function CityWorld({ onEnterZone, onExitZone, onNearStand, onLeaveStand, onActivateStand, modalOpen, plazaVideoUrl, isMobile = false, robotModelUrl = '', audioEnabled = true, activeView = 'explore' }) {
  const mountRef = useRef(null);
  const heroRobotsRef = useRef([]);
  const audioRef = useRef(null);
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
  const touchStateRef = useRef({ moving: false, looking: false, moveId: null, lookId: null, moveStartX: 0, moveStartY: 0, moveX: 0, moveY: 0 });

  // When modal opens: freeze movement immediately by clearing pressed keys and unlocking
  useEffect(() => {
    modalOpenRef.current = modalOpen;
    if (modalOpen) {
      keysRef.current = {};
      isLockedRef.current = false;
    }
  }, [modalOpen]);

  const checkZoneProximity = useCallback((pos) => {
    if (modalOpenRef.current) return;

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

    let nearestStand = null;
    for (const stand of STANDS) {
      const dx = pos.x - stand.position[0];
      const dz = pos.z - stand.position[2];
      if (dx * dx + dz * dz < 16) {
        nearestStand = stand;
        break;
      }
    }

    if (nearestStand && nearStandRef.current !== nearestStand.id) {
      nearStandRef.current = nearestStand.id;
      onNearStand(nearestStand);
    }

    if (!nearestStand && nearStandRef.current !== null) {
      nearStandRef.current = null;
      onLeaveStand();
    }
  }, [onEnterZone, onExitZone, onNearStand, onLeaveStand]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.ambienceAudio.muted = !audioEnabled;
      audioRef.current.ambienceLayerTwo.muted = !audioEnabled;
      audioRef.current.ambienceAudio.volume = audioEnabled ? 0.5 : 0;
      audioRef.current.ambienceLayerTwo.volume = audioEnabled ? 0.14 : 0;
      if (audioEnabled) {
        audioRef.current.ambienceAudio.play().catch(() => {});
        audioRef.current.ambienceLayerTwo.play().catch(() => {});
      }
    }
  }, [audioEnabled]);

  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030008, 0.02);
    scene.background = new THREE.Color(0x030008);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 180);
    camera.position.set(0, 1.7, 14);

    if (activeView === 'works') {
      camera.position.set(0, 7.2, 14.5);
      targetYawRef.current = 0;
      yawRef.current = 0;
      targetPitchRef.current = -0.08;
      pitchRef.current = -0.08;
    }

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const canvas = renderer.domElement;

    // Luces
    scene.add(new THREE.AmbientLight(0x3a2a68, 2.8));
    scene.add(new THREE.HemisphereLight(0x66ccff, 0x12051f, 1.8));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(24, 30, 14);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xff44cc, 18, 120, 2);
    fillLight.position.set(0, 22, 0);
    scene.add(fillLight);

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
      plazaVideoElement.crossOrigin = 'anonymous';
      plazaVideoElement.muted = true;
      plazaVideoElement.loop = true;
      plazaVideoElement.playsInline = true;
      plazaVideoElement.autoplay = true;
      plazaVideoElement.preload = 'auto';
      plazaVideoElement.setAttribute('muted', '');
      plazaVideoElement.setAttribute('playsinline', '');
      plazaVideoElement.setAttribute('webkit-playsinline', '');
      plazaVideoElement.src = plazaVideoUrl;
      plazaVideoElement.load();

      plazaVideoTexture = new THREE.VideoTexture(plazaVideoElement);
      plazaVideoTexture.colorSpace = THREE.SRGBColorSpace;
      plazaVideoTexture.minFilter = THREE.LinearFilter;
      plazaVideoTexture.magFilter = THREE.LinearFilter;
      plazaVideoTexture.generateMipmaps = false;

      const startVideoPlayback = () => {
        plazaVideoElement.play().catch(() => {});
      };

      plazaVideoElement.addEventListener('canplay', startVideoPlayback);
      plazaVideoElement.addEventListener('loadeddata', startVideoPlayback);

      plazaVideoScreen = addPlazaVideoScreen(scene, plazaVideoTexture);
    }

    const extraCanvases = buildCity(scene, flickerObjectsRef.current, gt, videoScreen.tex);
    extraCanvasesRef.current = extraCanvases;

    const robotSwarm = addFlyingRobots(scene);

    const ambienceAudio = new Audio('https://media.base44.com/files/public/69fa345f1e88257c77c4e49b/b7918b98e_efecto-de-sonido-tecnologia-tecno-sound-effect-128-ytshortssavetubeme.mp3');
    const ambienceLayerTwo = new Audio('https://cdn.pixabay.com/download/audio/2023/02/28/audio_6e7d1e85f0.mp3?filename=futuristic-atmosphere-141082.mp3');
    ambienceAudio.loop = true;
    ambienceLayerTwo.loop = true;
    ambienceAudio.preload = 'auto';
    ambienceLayerTwo.preload = 'auto';
    ambienceAudio.crossOrigin = 'anonymous';
    ambienceLayerTwo.crossOrigin = 'anonymous';
    ambienceAudio.volume = audioEnabled ? 0.5 : 0;
    ambienceLayerTwo.volume = audioEnabled ? 0.14 : 0;
    ambienceAudio.muted = !audioEnabled;
    ambienceLayerTwo.muted = !audioEnabled;
    audioRef.current = { ambienceAudio, ambienceLayerTwo };

    const startAmbientAudio = () => {
      ambienceAudio.currentTime = ambienceAudio.currentTime || 0;
      ambienceLayerTwo.currentTime = ambienceLayerTwo.currentTime || 0;
      ambienceAudio.muted = !audioEnabled;
      ambienceLayerTwo.muted = !audioEnabled;
      ambienceAudio.volume = audioEnabled ? 0.5 : 0;
      ambienceLayerTwo.volume = audioEnabled ? 0.14 : 0;
      const playMain = ambienceAudio.play();
      const playLayer = ambienceLayerTwo.play();
      Promise.allSettled([playMain, playLayer]).then(() => {});
    };
    const heroRobots = [];
    heroRobotsRef.current = heroRobots;

    if (robotModelUrl) {
      const loader = new GLTFLoader();
      const heroAnchors = [
        { x: -10, z: -6 },
        { x: 14, z: -10 },
        { x: -12, z: 14 },
        { x: 12, z: 12 },
      ];

      HERO_COLORS.slice(0, 4).forEach((heroColor, index) => {
        loader.load(robotModelUrl, (gltf) => {
          const heroRobot = gltf.scene;
          const anchor = heroAnchors[index];
          heroRobot.scale.setScalar(2 + index * 0.08);
          heroRobot.position.set(anchor.x, 5 + index * 0.4, anchor.z);

          heroRobot.traverse((child) => {
            if (!child.isMesh) return;
            child.material = child.material.clone();
            if ('color' in child.material) {
              child.material.color = new THREE.Color(heroColor).lerp(new THREE.Color(0xffffff), 0.22);
            }
            if ('emissive' in child.material) {
              child.material.emissive = new THREE.Color(heroColor);
              child.material.emissiveIntensity = 1.6;
            }
            if ('roughness' in child.material) child.material.roughness = 0.28;
            if ('metalness' in child.material) child.material.metalness = 0.72;
          });

          scene.add(heroRobot);
          heroRobots.push({
            mesh: heroRobot,
            anchorX: anchor.x,
            anchorZ: anchor.z,
            speed: 0.08 + index * 0.012,
            driftX: 12 + index * 1.8,
            driftZ: 10 + index * 1.5,
            height: 4.5 + index * 0.45,
            offset: index * 1.7,
          });
        });
      });
    }

    // Controls
    const handleClick = () => {
      if (isMobile) return;
      canvas.requestPointerLock();
      startAmbientAudio();
    };
    const handlePointerLockChange = () => {
      isLockedRef.current = isMobile ? true : document.pointerLockElement === canvas;
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

    const handleTouchStart = (e) => {
      if (!isMobile || modalOpenRef.current) return;
      for (const touch of e.changedTouches) {
        if (touch.clientX < window.innerWidth * 0.45 && touchStateRef.current.moveId === null) {
          touchStateRef.current.moveId = touch.identifier;
          touchStateRef.current.moving = true;
          touchStateRef.current.moveStartX = touch.clientX;
          touchStateRef.current.moveStartY = touch.clientY;
          touchStateRef.current.moveX = 0;
          touchStateRef.current.moveY = 0;
        } else if (touchStateRef.current.lookId === null) {
          touchStateRef.current.lookId = touch.identifier;
          touchStateRef.current.looking = true;
          touchStateRef.current.lookStartX = touch.clientX;
          touchStateRef.current.lookStartY = touch.clientY;
        }
      }
    };

    const handleTouchMove = (e) => {
      if (!isMobile || modalOpenRef.current) return;
      for (const touch of e.changedTouches) {
        if (touch.identifier === touchStateRef.current.moveId) {
          touchStateRef.current.moveX = touch.clientX - touchStateRef.current.moveStartX;
          touchStateRef.current.moveY = touch.clientY - touchStateRef.current.moveStartY;
        }
        if (touch.identifier === touchStateRef.current.lookId) {
          targetYawRef.current -= (touch.clientX - touchStateRef.current.lookStartX) * LOOK_SPEED * 0.7;
          targetPitchRef.current -= (touch.clientY - touchStateRef.current.lookStartY) * LOOK_SPEED * 0.7;
          targetPitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, targetPitchRef.current));
          touchStateRef.current.lookStartX = touch.clientX;
          touchStateRef.current.lookStartY = touch.clientY;
        }
      }
    };

    const handleTouchEnd = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === touchStateRef.current.moveId) {
          touchStateRef.current.moveId = null;
          touchStateRef.current.moving = false;
          touchStateRef.current.moveX = 0;
          touchStateRef.current.moveY = 0;
        }
        if (touch.identifier === touchStateRef.current.lookId) {
          touchStateRef.current.lookId = null;
          touchStateRef.current.looking = false;
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', startAmbientAudio, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });
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
      const moving = activeView === 'explore' && (k['KeyW'] || k['ArrowUp'] || k['KeyS'] || k['ArrowDown'] || k['KeyA'] || k['ArrowLeft'] || k['KeyD'] || k['ArrowRight'] || (isMobile && touchStateRef.current.moving));
      if ((isLockedRef.current || isMobile) && moving) {
        dir.set(0, 0, 0);
        if (isMobile && touchStateRef.current.moving) {
          const moveX = touchStateRef.current.moveX;
          const moveY = touchStateRef.current.moveY;
          const threshold = 12;
          if (moveY < -threshold) dir.z -= Math.min(Math.abs(moveY) / 60, 1);
          if (moveY > threshold) dir.z += Math.min(Math.abs(moveY) / 60, 1);
          if (moveX < -threshold) dir.x -= Math.min(Math.abs(moveX) / 60, 1);
          if (moveX > threshold) dir.x += Math.min(Math.abs(moveX) / 60, 1);
        }
        if (k['KeyW'] || k['ArrowUp']) dir.z -= 1;
        if (k['KeyS'] || k['ArrowDown']) dir.z += 1;
        if (k['KeyA'] || k['ArrowLeft']) dir.x -= 1;
        if (k['KeyD'] || k['ArrowRight']) dir.x += 1;
        if (dir.lengthSq() > 0) {
          dir.normalize();
          euler.set(0, yawRef.current, 0);
          dir.applyEuler(euler);
          camera.position.addScaledVector(dir, (isMobile ? MOVE_SPEED * 0.7 : MOVE_SPEED) * delta);
          const safeCameraPosition = avoidBuildingCollision(camera.position.x, camera.position.z, 2.8);
          camera.position.x = safeCameraPosition.x;
          camera.position.z = safeCameraPosition.z;
          camera.position.y = 1.7;
        }
      }

      euler.set(pitchRef.current, yawRef.current, 0);
      camera.quaternion.setFromEuler(euler);
      if (activeView === 'works') {
        camera.position.x += (0 - camera.position.x) * 0.06;
        camera.position.y += (7.2 - camera.position.y) * 0.06;
        camera.position.z += (14.5 - camera.position.z) * 0.06;
      }

      camera.position.x = Math.max(-72, Math.min(72, camera.position.x));
      camera.position.z = Math.max(-72, Math.min(72, camera.position.z));
      if (activeView === 'explore') {
        checkZoneProximity(camera.position);
      }

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
      if (plazaVideoTexture && plazaVideoElement && plazaVideoElement.readyState >= 2) {
        plazaVideoTexture.needsUpdate = true;
      }
      // Extra canvases update every 4 frames staggered
      if (frameCount % 4 === 0) {
        const t = frameCount * 0.016;
        for (let i = 0; i < extraCanvasesRef.current.length; i++) {
          if (frameCount % 4 === (i % 4)) extraCanvasesRef.current[i].draw(t + i * 1.3);
        }
      }

      const robotTime = frameCount * 0.016;
      updateFlyingRobots(robotSwarm, robotTime);
      heroRobots.forEach((heroRobot, index) => {
        const targetX = heroRobot.anchorX + Math.sin(robotTime * heroRobot.speed + heroRobot.offset) * heroRobot.driftX + Math.sin(robotTime * 0.42 + index) * 8;
        const targetZ = heroRobot.anchorZ + Math.cos(robotTime * (heroRobot.speed * 0.9) + heroRobot.offset) * heroRobot.driftZ + Math.sin(robotTime * 0.33 + index * 1.2) * 6;
        const safeTarget = avoidBuildingCollision(targetX, targetZ, 5.5);
        const prevX = heroRobot.mesh.position.x;
        const prevZ = heroRobot.mesh.position.z;

        heroRobot.mesh.position.x += (safeTarget.x - heroRobot.mesh.position.x) * 0.02;
        heroRobot.mesh.position.z += (safeTarget.z - heroRobot.mesh.position.z) * 0.02;
        heroRobot.mesh.position.y = heroRobot.height + Math.sin(robotTime * 1.3 + heroRobot.offset) * 1.3 + Math.cos(robotTime * 0.6 + index) * 0.5;
        heroRobot.mesh.rotation.y = Math.atan2(heroRobot.mesh.position.x - prevX, heroRobot.mesh.position.z - prevZ);
        heroRobot.mesh.rotation.z = Math.sin(robotTime * 1.15 + heroRobot.offset) * 0.07;
      });

      renderer.render(scene, camera);
      if (document.pointerLockElement && frameCount % 2 === 0) {
        const menuButton = document.querySelector('[data-agency-menu-button="true"]');
        if (menuButton) menuButton.style.opacity = '1';
      }
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
      canvas.removeEventListener('touchstart', startAmbientAudio);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      plazaVideoScreen?.dispose();
      plazaVideoTexture?.dispose();
      robotSwarm.forEach((robot) => scene.remove(robot.group));
      heroRobots.forEach((heroRobot) => scene.remove(heroRobot.mesh));
      if (plazaVideoElement) {
        plazaVideoElement.pause();
        plazaVideoElement.removeAttribute('src');
        plazaVideoElement.load();
      }
      ambienceAudio.pause();
      ambienceLayerTwo.pause();
      ambienceAudio.currentTime = 0;
      ambienceLayerTwo.currentTime = 0;
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [checkZoneProximity, plazaVideoUrl, robotModelUrl, activeView]);

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
  new THREE.PlaneGeometry(220, 220, 80, 80),
  new THREE.MeshStandardMaterial({
    color: 0x090612,
    roughness: 0.12,
    metalness: 0.92,
    transparent: true,
    opacity: 0.92,
  })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const groundSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshBasicMaterial({
      color: 0x7d4dff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    })
  );
  groundSheen.rotation.x = -Math.PI / 2;
  groundSheen.position.y = 0.015;
  scene.add(groundSheen);

  const grid = new THREE.GridHelper(180, 48, 0x7ef9ff, 0xff4dd8);
  grid.position.y = 0.04;
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  scene.add(grid);

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
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w, 2, 4, 2), bodyMats);
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
    new THREE.BoxGeometry(w, h, w * 0.9, 2, 4, 2),
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

function createFlyingRobot(color = 0x00ffff) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 18, 18),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.22, metalness: 0.75 })
  );
  group.add(body);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.6, 0.08, 10, 32),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 0.45, roughness: 0.18, metalness: 0.85 })
  );
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const wingGeo = new THREE.BoxGeometry(1.2, 0.08, 0.18);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x224488, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.55 });
  const wing = new THREE.Mesh(wingGeo, wingMat);
  wing.position.y = 0.05;
  group.add(wing);

  const trail = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.7, 10),
    new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 1.1, transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.1 })
  );
  trail.rotation.x = -Math.PI / 2;
  trail.position.z = 0.55;
  group.add(trail);

  return { group, trail };
}

function addFlyingRobots(scene) {
  const colors = [0x00ffff, 0xff00ff, 0xffff00, 0x7c3aed, 0x4488ff];
  const lanes = [
    { minX: -62, maxX: -36, minZ: -58, maxZ: 58 },
    { minX: 36, maxX: 62, minZ: -58, maxZ: 58 },
    { minX: -58, maxX: 58, minZ: -62, maxZ: -36 },
    { minX: -58, maxX: 58, minZ: 36, maxZ: 62 },
  ];

  return Array.from({ length: 7 }, (_, i) => {
    const robot = createFlyingRobot(colors[i % colors.length]);
    const lane = lanes[i % lanes.length];
    const originX = lane.minX + Math.random() * (lane.maxX - lane.minX);
    const originZ = lane.minZ + Math.random() * (lane.maxZ - lane.minZ);
    const driftX = 8 + Math.random() * Math.min(14, (lane.maxX - lane.minX) * 0.6);
    const driftZ = 8 + Math.random() * Math.min(14, (lane.maxZ - lane.minZ) * 0.6);
    const speed = 0.1 + Math.random() * 0.12;
    const height = 5 + Math.random() * 5;
    const offset = Math.random() * Math.PI * 2;
    const wobble = 0.25 + Math.random() * 0.45;
    const yawOffset = Math.random() * 0.35 - 0.175;
    const bounds = lane;

    robot.group.position.set(originX, height, originZ);
    scene.add(robot.group);

    return { ...robot, originX, originZ, driftX, driftZ, speed, height, offset, wobble, yawOffset, bounds };
  });
}

function updateFlyingRobots(robots, time) {
  robots.forEach((robot, index) => {
    const tx = time * robot.speed + robot.offset;
    const tz = time * (robot.speed * 0.8) + robot.offset * 1.7;
    let x = robot.originX + Math.sin(tx) * robot.driftX + Math.sin(tx * 0.37 + index) * 2.4;
    let z = robot.originZ + Math.cos(tz) * robot.driftZ + Math.cos(tz * 0.43 + index * 1.3) * 2.8;
    const y = robot.height + Math.sin(time * 0.9 + robot.offset) * robot.wobble + Math.cos(time * 0.55 + index) * 0.35;

    x = Math.max(robot.bounds.minX, Math.min(robot.bounds.maxX, x));
    z = Math.max(robot.bounds.minZ, Math.min(robot.bounds.maxZ, z));

    const safeTarget = avoidBuildingCollision(x, z, 3.5);
    const prevX = robot.group.position.x;
    const prevZ = robot.group.position.z;

    robot.group.position.set(safeTarget.x, y, safeTarget.z);
    robot.group.rotation.y = Math.atan2(safeTarget.x - prevX, safeTarget.z - prevZ) + robot.yawOffset;
    robot.group.rotation.z = Math.sin(time * 1.8 + index) * 0.05;
    robot.trail.scale.y = 0.6 + Math.sin(time * 2.2 + index) * 0.08;
  });
}

function avoidBuildingCollision(x, z, padding = 2.5) {
  const safe = { x, z };

  BUILDING_COLLIDERS.forEach((collider) => {
    const dx = safe.x - collider.x;
    const dz = safe.z - collider.z;
    const distance = Math.hypot(dx, dz) || 0.001;
    const minDistance = collider.radius + padding;

    if (distance < minDistance) {
      const push = (minDistance - distance) / distance;
      safe.x += dx * push;
      safe.z += dz * push;
    }
  });

  safe.x = Math.max(-64, Math.min(64, safe.x));
  safe.z = Math.max(-64, Math.min(64, safe.z));
  return safe;
}