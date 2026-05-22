import { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { ZONES } from './cityData';
import { STANDS } from './standsData';
import { addPlazaVideoScreen } from './PlazaVideoScreen.jsx';
import useCameraTargetTransition from './useCameraTargetTransition';
import { createSimpleBuildingLOD, getPerformanceConfig } from './cityPerformance';
import { cyberPostFragmentShader, cyberPostVertexShader, createCyberPostUniforms } from './postprocessing/cyberPostShaders';
import { createPostProcessingState, getAdaptivePostProcessingState } from './postprocessing/postProcessingConfig';

const CITY_VIDEO_SOURCES = [
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  // Video mapping showcase
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
];

const CITY_VIDEO_SCREEN_CONFIGS = [
  // — Front north wall screens (visible looking forward from start) —
  { x: -30, y: 10.5, z: -25.4, width: 7.2,  height: 4.05, rotationY: 0,              frameColor: 0x00ffff, glowColor: 0x00ffff, sourceIndex: 0 },
  { x: 30,  y: 11.5, z: -25.4, width: 7.2,  height: 4.05, rotationY: 0,              frameColor: 0xff00ff, glowColor: 0xff00ff, sourceIndex: 1 },
  // — Side walls —
  { x: -34.2, y: 9.5,  z: 18,  width: 5.8,  height: 3.25, rotationY: Math.PI / 2,    frameColor: 0xffff00, glowColor: 0xffff00, sourceIndex: 2 },
  { x: 34.2,  y: 9.5,  z: 18,  width: 5.8,  height: 3.25, rotationY: -Math.PI / 2,   frameColor: 0x4488ff, glowColor: 0x4488ff, sourceIndex: 3 },
  // — Extra: high center-front megascreen —
  { x: 0,    y: 18,   z: -28,  width: 10.5, height: 5.9,  rotationY: 0,              frameColor: 0x00ff88, glowColor: 0x00ff88, sourceIndex: 0 },
  // — Extra: right diagonal building facade —
  { x: 28,   y: 13,   z: -8,   width: 7.5,  height: 4.2,  rotationY: -Math.PI / 2,   frameColor: 0xff8800, glowColor: 0xff8800, sourceIndex: 1 },
  // — Video mapping / immersive web — 4 extra screens —
  { x: -34.2, y: 13,  z: -5,   width: 6.4,  height: 3.6,  rotationY: Math.PI / 2,    frameColor: 0xff00aa, glowColor: 0xff00aa, sourceIndex: 0 },
  { x: 34.2,  y: 14,  z: 5,    width: 6.4,  height: 3.6,  rotationY: -Math.PI / 2,   frameColor: 0x00aaff, glowColor: 0x00aaff, sourceIndex: 1 },
  { x: -18,  y: 12.5, z: 28,   width: 7.0,  height: 3.9,  rotationY: Math.PI,        frameColor: 0xaaff00, glowColor: 0xaaff00, sourceIndex: 2 },
  { x: 18,   y: 12.5, z: 28,   width: 7.0,  height: 3.9,  rotationY: Math.PI,        frameColor: 0xff6600, glowColor: 0xff6600, sourceIndex: 3 },
];

function createCityVideoElement(src) {
  const video = document.createElement('video');
  video.src = src;
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = false;
  video.preload = 'metadata';
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.setAttribute('muted', '');
  video.load();

  video.addEventListener('loadeddata', () => {
    if (video.paused) video.play().catch(() => {});
  });

  video.addEventListener('canplay', () => {
    if (video.paused) video.play().catch(() => {});
  });

  return video;
}

function createCityVideoScreen(scene, config, texture) {
  const group = new THREE.Group();
  const depth = 0.22;
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(config.width + 0.42, config.height + 0.42, depth),
    new THREE.MeshBasicMaterial({ color: 0x04040a })
  );
  group.add(frame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(config.width, config.height),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false, color: 0xffffff })
  );
  screen.position.z = depth * 0.55;
  group.add(screen);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(config.width + 0.12, config.height + 0.12, 0.06)),
    new THREE.LineBasicMaterial({ color: config.frameColor })
  );
  border.position.z = depth * 0.42;
  group.add(border);

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(config.width + 0.8, config.height + 0.8),
    new THREE.MeshBasicMaterial({ color: config.glowColor, transparent: true, opacity: 0.09, side: THREE.DoubleSide })
  );
  glow.position.z = 0.02;
  group.add(glow);


  group.position.set(config.x, config.y, config.z);
  group.rotation.y = config.rotationY || 0;
  group.userData.screen = screen;
  scene.add(group);
  return group;
}

function syncCityVideos(cityVideos, camera) {
  const nearestVideos = cityVideos
    .map((item) => ({ item, distance: camera.position.distanceTo(item.group.position) }))
    .sort((a, b) => a.distance - b.distance);

  nearestVideos.forEach(({ item, distance }, index) => {
    const shouldShow = distance < 62;
    const shouldPlay = shouldShow && index < 2;
    item.group.visible = shouldShow;

    if (shouldPlay && item.video.paused) {
      item.video.play().catch(() => {});
    } else if (!shouldPlay && !item.video.paused) {
      item.video.pause();
    }

    if (shouldPlay && item.video.readyState >= item.video.HAVE_CURRENT_DATA) {
      item.texture.needsUpdate = true;
      const screenMesh = item.group.userData.screen;
      if (screenMesh && screenMesh.material) {
        screenMesh.material.map = item.texture;
        screenMesh.material.needsUpdate = true;
      }
    }
  });
}

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

  let s = seed * 9301 + 49297;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };

  const palette = WALL_PALETTES[seed % WALL_PALETTES.length];
  const c1 = palette[0], c2 = palette[1], cw = palette[2];

  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#060008');
  grd.addColorStop(0.5, '#0a000f');
  grd.addColorStop(1, '#020005');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

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
    ctx.strokeStyle = i % 2 === 0 ? c1 : c2;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4 + rng() * 0.4;
    ctx.strokeRect(px, py, pw, ph);
    ctx.globalAlpha = 1;
  }

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

  const texts = WALL_TEXTS[seed % WALL_TEXTS.length];
  const mainText = texts[0];
  const subText = texts[1 + (seed % (texts.length - 1))];

  ctx.shadowBlur = 30;
  ctx.shadowColor = c1;
  ctx.fillStyle = c1;
  ctx.globalAlpha = 0.95;
  ctx.font = `bold ${38 + Math.floor(rng() * 18)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mainText, W / 2, H * 0.38);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  ctx.shadowBlur = 14;
  ctx.shadowColor = c2;
  ctx.fillStyle = c2;
  ctx.globalAlpha = 0.85;
  ctx.font = 'bold 22px monospace';
  ctx.fillText(subText, W / 2, H * 0.38 + 50);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

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
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.moveTo(cx2 - cr, cy2); ctx.lineTo(cx2 + cr, cy2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx2, cy2 - cr); ctx.lineTo(cx2, cy2 + cr); ctx.stroke();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  }

  const tickerTexts = ['◆ SOFTWARE  ◆ VIDEO 360°  ', '◆ AVATARES 3D  ◆ EVENTOS XR  ', '◆ METAVERSO  ◆ STREAMING  ', '◆ AR/VR  ◆ MAPPING  ◆ XR  '];
  ctx.shadowBlur = 8;
  ctx.shadowColor = c2;
  ctx.fillStyle = c2;
  ctx.globalAlpha = 0.8;
  ctx.font = '14px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(tickerTexts[seed % tickerTexts.length], 10, H - 14);
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;

  for (let y = 0; y < H; y += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0, y, W, 2);
  }

  return new THREE.CanvasTexture(canvas);
}

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
const HERO_COLORS = [0x00ffff, 0xff00ff, 0xffff00, 0x7c3aed, 0x4488ff];
const WORKS = [
  {
    title: 'CLONEX AVATAR',
    subtitle: 'RTFKT x NIKE - Metahumano Realista',
    description: 'Avatar fotorrealista para experiencias inmersivas',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
    color: '#ff0066'
  },
  {
    title: 'DANCE MAPPING',
    subtitle: 'Video Mapping Interactivo 360°',
    description: 'Proyección arquitectónica sincronizada con música',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/0cbcd588c_Viky-EventoMayo-GoogleChrome2026-05-0811-15-57.mp4',
    color: '#00ffff'
  },
  {
    title: 'METAVERSO XR',
    subtitle: 'Eventos Live en Realidad Extendida',
    description: 'Espacios virtuales para conferencias y eventos',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
    color: '#ffff00'
  },
  {
    title: 'STUDIO 360',
    subtitle: 'Producción Audiovisual Inmersiva',
    description: 'Contenido 360° para experiencias VR',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/0cbcd588c_Viky-EventoMayo-GoogleChrome2026-05-0811-15-57.mp4',
    color: '#ff00ff'
  }
];

const WORKS_CAMERA_POSITION = new THREE.Vector3(0, 4.5, 15);
const WORKS_CAMERA_TRANSITION_MS = 1000;
const ROBOT_NO_FLY_ZONES = [
  ...ZONES.map((zone) => ({
    x: zone.position[0],
    z: zone.position[2],
    radius: (zone.buildingWidth || 8) * 1.4 + 8,
  })),
  { x: -18, z: -30, radius: 8 },
  { x: 18, z: -30, radius: 8 },
  { x: -30, z: 18, radius: 8 },
  { x: 30, z: 18, radius: 8 },
  { x: -34, z: -34, radius: 8 },
  { x: 34, z: -34, radius: 8 },
  { x: -34, z: 34, radius: 8 },
  { x: 34, z: 34, radius: 8 },
  { x: -46, z: -18, radius: 8 },
  { x: 46, z: -18, radius: 8 },
  { x: -46, z: 18, radius: 8 },
  { x: 46, z: 18, radius: 8 },
  { x: -12, z: -44, radius: 8 },
  { x: 12, z: -44, radius: 8 },
  { x: -12, z: 44, radius: 8 },
  { x: 12, z: 44, radius: 8 },
  { x: -58, z: -30, radius: 8 },
  { x: -44, z: -30, radius: 8 },
  { x: -30, z: -30, radius: 8 },
  { x: 30, z: -30, radius: 8 },
  { x: 44, z: -30, radius: 8 },
  { x: 58, z: -30, radius: 8 },
  { x: -58, z: 30, radius: 8 },
  { x: -44, z: 30, radius: 8 },
  { x: -30, z: 30, radius: 8 },
  { x: 30, z: 30, radius: 8 },
  { x: 44, z: 30, radius: 8 },
  { x: 58, z: 30, radius: 8 },
];

export default function CityWorld({ onEnterZone, onExitZone, onNearStand, onLeaveStand, onActivateStand, onOpenViky, modalOpen, plazaVideoUrl, isMobile = false, robotModelUrl = '', activeView = 'explore', activeWork = null, worksTransitionToken = 0, cameraTarget = null, postProcessingSettings = null, arcadeFocusPulse = 0 }) {
  const mountRef = useRef(null);
  const heroRobotsRef = useRef([]);
  const keysRef = useRef({});
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.1);
  const targetYawRef = useRef(0);
  const targetPitchRef = useRef(-0.1);
  const isLockedRef = useRef(false);
  const dragStateRef = useRef({ isDragging: false, lastMouseX: 0, lastMouseY: 0 });
  const animFrameRef = useRef(null);
  const activeZoneRef = useRef(null);
  const nearStandRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const flickerObjectsRef = useRef([]);
  const glitchMaterialsRef = useRef([]);
  const videoScreenRef = useRef(null);
  const extraCanvasesRef = useRef([]);
  const modalOpenRef = useRef(false);
  const touchStateRef = useRef({ moving: false, looking: false, moveId: null, lookId: null, moveStartX: 0, moveStartY: 0, moveX: 0, moveY: 0 });
  const mobileMovementRef = useRef({ x: 0, z: 0 });
  const cameraRef = useRef(null);
  const [theatreReady, setTheatreReady] = useState(true);
  const postFxStateRef = useRef(null);
  const worksTransitionRef = useRef({ active: activeView === 'works', startTime: performance.now(), duration: WORKS_CAMERA_TRANSITION_MS, startPos: new THREE.Vector3(15, 1.7, 15), targetPos: activeView === 'works' ? WORKS_CAMERA_POSITION.clone() : null, startYaw: 2.4, targetYaw: Math.PI, startPitch: -0.1, targetPitch: -0.03, token: worksTransitionToken });

  useCameraTargetTransition({ cameraTarget, worksTransitionRef, yawRef, pitchRef, cameraRef });

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
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const savedCameraPos = null;
    const savedYaw = yawRef.current;
    const savedPitch = pitchRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1830, 0.020);  // lighter density so skyline model shows
    // Sky handled by sky sphere in buildCity — no flat background

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 180);
    camera.position.set(15, 1.7, 15);
    camera.rotation.set(-0.1, 2.4, 0);
    camera.updateProjectionMatrix();
    cameraRef.current = camera;
    if (savedCameraPos) {
      camera.position.copy(savedCameraPos);
      targetYawRef.current = savedYaw;
      yawRef.current = savedYaw;
      targetPitchRef.current = savedPitch;
      pitchRef.current = savedPitch;
    } else {
      camera.position.set(15, 1.7, 15);
      targetYawRef.current = 2.4;
      yawRef.current = 2.4;
      targetPitchRef.current = -0.1;
      pitchRef.current = -0.1;
    }

    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const performanceConfig = getPerformanceConfig(isMobile);
    const farBuildingLimit = performanceConfig.farBuildings || 12;
    const handleJoystickTouchMove = () => {};
    const handleJoystickTouchEnd = () => {};
    const joystickContainer = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceConfig.pixelRatio));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const canvas = renderer.domElement;

    const vignette = document.createElement('div');
    vignette.style.cssText = `position: fixed; inset: 0; pointer-events: none; box-shadow: inset 0 0 150px 50px rgba(0,0,0,0.3); z-index: 100;`;
    document.body.appendChild(vignette);

    const composer = new EffectComposer(renderer);
    composer.setSize(W, H);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), performanceConfig.bloomStrength * 0.22, 0.55, 0.72);
    composer.addPass(bloomPass);

    scene.add(new THREE.AmbientLight(0x6655dd, 8.0));
    scene.add(new THREE.HemisphereLight(0x9977ff, 0x352060, 3.5));
    const warmOverhead = new THREE.HemisphereLight(0xffcc77, 0x1a0d40, 2.8);
    scene.add(warmOverhead);
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 3.0);
    keyLight.position.set(24, 30, 14);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xff44cc, 7, 140, 1.8);
    fillLight.position.set(0, 22, 0);
    scene.add(fillLight);
    const cyanWash = new THREE.PointLight(0x00e5ff, 6, 110, 1.8);
    cyanWash.position.set(-24, 14, -8);
    scene.add(cyanWash);
    const magentaWash = new THREE.PointLight(0xff00c8, 6, 120, 1.8);
    magentaWash.position.set(24, 16, 6);
    scene.add(magentaWash);
    const violetWash = new THREE.PointLight(0x7c3aed, 5, 100, 1.8);
    violetWash.position.set(0, 18, -24);
    scene.add(violetWash);

    const gt = {
      cyan: makeGlowTexture('#00ffff'),
      magenta: makeGlowTexture('#ff00ff'),
      yellow: makeGlowTexture('#ffff00'),
      blue: makeGlowTexture('#4488ff'),
      orange: makeGlowTexture('#ff6600'),
      pink: makeGlowTexture('#ff44aa'),
    };

    const videoScreen = makeVideoCanvasTexture('DANCE XR', '#ff00ff', 'dance');
    videoScreenRef.current = videoScreen;

    let plazaVideoElement = null;
    let plazaVideoTexture = null;
    let plazaVideoScreen = null;
    let worksMediaElement = null;
    let worksMediaTexture = null;
    const cityVideos = [];
    const worksCarousel = makeWorksCarouselScreen();

    if (plazaVideoUrl) {
      plazaVideoElement = createCityVideoElement(plazaVideoUrl);
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
      cityVideos.push({ video: plazaVideoElement, texture: plazaVideoTexture, group: plazaVideoScreen?.group || { position: new THREE.Vector3(-6.2, 4.9, -11.15), visible: true } });
    }

    CITY_VIDEO_SCREEN_CONFIGS.slice(0, performanceConfig.videoScreens).forEach((config) => {
      const video = createCityVideoElement(CITY_VIDEO_SOURCES[config.sourceIndex]);
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const group = createCityVideoScreen(scene, config, texture);
      cityVideos.push({ video, texture, group });
    });

    if (activeWork) {
      const worksImageUrl = activeWork.type === 'showcase' ? activeWork.showcaseItems?.[0]?.img : null;

      if (worksImageUrl) {
        worksMediaTexture = new THREE.TextureLoader().load(worksImageUrl);
        worksMediaTexture.colorSpace = THREE.SRGBColorSpace;
      } else if (worksMediaElement) {
        worksMediaTexture = new THREE.VideoTexture(worksMediaElement);
        worksMediaTexture.colorSpace = THREE.SRGBColorSpace;
        worksMediaTexture.minFilter = THREE.LinearFilter;
        worksMediaTexture.magFilter = THREE.LinearFilter;
        worksMediaTexture.generateMipmaps = false;
        worksMediaElement.play().catch(() => {});
      }
    }

    const vikyVideoElement = createCityVideoElement('https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/0cbcd588c_Viky-EventoMayo-GoogleChrome2026-05-0811-15-57.mp4');
    const vikyTexture = new THREE.VideoTexture(vikyVideoElement);
    vikyTexture.colorSpace = THREE.SRGBColorSpace;
    vikyTexture.minFilter = THREE.LinearFilter;
    vikyTexture.magFilter = THREE.LinearFilter;
    vikyTexture.generateMipmaps = false;

    const extraCanvases = buildCity(scene, flickerObjectsRef.current, gt, videoScreen.tex, worksMediaTexture, vikyTexture, onOpenViky, worksCarousel, farBuildingLimit);
    extraCanvasesRef.current = extraCanvases;

    // Tri-Colonial Sector — DISABLED: the model geometry creates a large opaque arch
    // that blocks the scene. Removed until a better placement strategy is found.
    // To re-enable: uncomment and set targetSize ≤ 40, z ≤ -120.

    // Populate glitch candidates — building facade meshes with canvas textures
    {
      const candidates = [];
      scene.traverse((obj) => {
        if (!obj.isMesh || !obj.material || !obj.material.map) return;
        if (obj.userData?.noGlitch) return;
        // Only take MeshBasicMaterial (building walls) not special surfaces
        if (obj.material.type !== 'MeshBasicMaterial' && obj.material.type !== 'MeshStandardMaterial') return;
        candidates.push(obj.material);
      });
      const glitchList = [];
      const seenMaterials = new Set();
      for (const mat of candidates) {
        if (seenMaterials.has(mat)) continue;
        seenMaterials.add(mat);
        if (Math.random() < 0.28) {
          glitchList.push({
            material: mat,
            origOffX: mat.map.offset.x,
            origOffY: mat.map.offset.y,
            origColor: mat.color ? mat.color.getHex() : 0xffffff,
            glitching: false,
            glitchEndTime: 0,
            nextGlitchTime: Math.random() * 12,
          });
        }
      }
      glitchMaterialsRef.current = glitchList;
    }

    placeBillboards(scene);

    const robotSwarm = addFlyingRobots(scene);

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
          heroRobot.scale.setScalar(0.8 + index * 0.05);
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


    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      const interactiveHit = intersects.find((hit) => hit.object?.userData?.onClick);
      interactiveHit?.object?.userData?.onClick?.(interactiveHit);
    };
    const handleMouseDown = (e) => {
      if (modalOpenRef.current || activeView !== 'explore' || isMobile) return;
      dragStateRef.current.isDragging = true;
      dragStateRef.current.lastMouseX = e.clientX;
      dragStateRef.current.lastMouseY = e.clientY;
      isLockedRef.current = true;
      canvas.style.cursor = 'grabbing';
    };
    const handleMouseUp = () => {
      dragStateRef.current.isDragging = false;
      canvas.style.cursor = activeView === 'explore' && !isMobile ? 'grab' : 'default';
    };
    const handleMouseMove = (e) => {
      if (!dragStateRef.current.isDragging || activeView !== 'explore') return;

      const deltaX = e.clientX - dragStateRef.current.lastMouseX;
      const deltaY = e.clientY - dragStateRef.current.lastMouseY;

      yawRef.current -= deltaX * 0.003;
      pitchRef.current -= deltaY * 0.003;
      targetYawRef.current = yawRef.current;
      targetPitchRef.current = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitchRef.current));
      pitchRef.current = targetPitchRef.current;

      dragStateRef.current.lastMouseX = e.clientX;
      dragStateRef.current.lastMouseY = e.clientY;
    };
    const handleKeyDown = (e) => {
      if (modalOpenRef.current) return;

      const isNearCarousel = camera.position.distanceTo(new THREE.Vector3(0, 4.2, 35)) < 18;
      if (isNearCarousel && e.code === 'ArrowLeft') {
        e.preventDefault();
        worksCarousel.prev();
        return;
      }
      if (isNearCarousel && e.code === 'ArrowRight') {
        e.preventDefault();
        worksCarousel.next();
        return;
      }

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
        if (touch.clientX < window.innerWidth * 0.5 && touchStateRef.current.moveId === null) {
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
          mobileMovementRef.current.x = Math.max(-1, Math.min(1, touchStateRef.current.moveX / 70));
          mobileMovementRef.current.z = Math.max(-1, Math.min(1, touchStateRef.current.moveY / 70));
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
          mobileMovementRef.current.x = 0;
          mobileMovementRef.current.z = 0;
        }
        if (touch.identifier === touchStateRef.current.lookId) {
          touchStateRef.current.lookId = null;
          touchStateRef.current.looking = false;
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    const forcePlayAllVideos = () => {
      cityVideos.slice(0, 2).forEach((item) => {
        item.video.muted = true;
        item.video.play().catch(() => {});
      });
      if (plazaVideoElement) {
        plazaVideoElement.play().catch(() => {});
      }
    };

    canvas.addEventListener('click', forcePlayAllVideos, { once: true });
    canvas.addEventListener('touchstart', forcePlayAllVideos, { once: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.style.cursor = activeView === 'explore' && !isMobile ? 'grab' : 'default';

    const dir = new THREE.Vector3();
    let frameCount = 0;

    const animate = () => {
      const posInicial = camera.position.clone();
      const debugPosStart = camera.position.clone();
      animFrameRef.current = requestAnimationFrame(animate);
      const debugPos = camera.position.clone();
      const delta = Math.min(clockRef.current.getDelta(), 0.05);
      const prevPos = camera.position.clone();
      frameCount++;

      yawRef.current += (targetYawRef.current - yawRef.current) * LOOK_SMOOTH;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * LOOK_SMOOTH;
      pitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchRef.current));

      const worksTransition = worksTransitionRef.current;
      if (worksTransition.active && worksTransition.startPos && worksTransition.targetPos) {
        const elapsed = performance.now() - worksTransition.startTime;
        const progress = Math.min(elapsed / worksTransition.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(worksTransition.startPos, worksTransition.targetPos, eased);
        yawRef.current = worksTransition.startYaw + (worksTransition.targetYaw - worksTransition.startYaw) * eased;
        pitchRef.current = worksTransition.startPitch + (worksTransition.targetPitch - worksTransition.startPitch) * eased;
        targetYawRef.current = yawRef.current;
        targetPitchRef.current = pitchRef.current;

        if (progress >= 1) {
          worksTransition.active = false;
          camera.position.copy(worksTransition.targetPos);
          yawRef.current = worksTransition.targetYaw;
          pitchRef.current = worksTransition.targetPitch;
          targetYawRef.current = worksTransition.targetYaw;
          targetPitchRef.current = worksTransition.targetPitch;
        }
      }

      const k = keysRef.current;
      const mobileMovement = mobileMovementRef.current;
      const moving = activeView === 'explore' && (
        k['KeyW'] || k['KeyS'] || k['KeyA'] || k['KeyD'] || k['ArrowUp'] || k['ArrowDown'] || k['ArrowLeft'] || k['ArrowRight'] ||
        (isMobileDevice && (Math.abs(mobileMovement.x) > 0.1 || Math.abs(mobileMovement.z) > 0.1))
      );

      if (moving && !worksTransitionRef.current.active) {
        dir.set(0, 0, 0);

        if (k['KeyW'] || k['ArrowUp']) dir.z = -1;
        if (k['KeyS'] || k['ArrowDown']) dir.z = 1;
        if (k['KeyA'] || k['ArrowLeft']) dir.x = -1;
        if (k['KeyD'] || k['ArrowRight']) dir.x = 1;

        if (isMobileDevice && (Math.abs(mobileMovement.x) > 0.1 || Math.abs(mobileMovement.z) > 0.1)) {
          dir.x = mobileMovement.x;
          dir.z = mobileMovement.z * -1;
        }

        if (dir.lengthSq() > 0) {
          dir.normalize();
          dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), yawRef.current);
          camera.position.addScaledVector(dir, 15 * delta);
          camera.position.y = 1.7;
        }
      }

      camera.rotation.order = 'YXZ';
      camera.rotation.y = yawRef.current;
      camera.rotation.x = pitchRef.current;

      camera.position.x = Math.max(-70, Math.min(70, camera.position.x));
      camera.position.z = Math.max(-70, Math.min(70, camera.position.z));
      if (activeView === 'explore') {
        checkZoneProximity(camera.position);
      }

      if (frameCount % 10 === 0) {
        const t = frameCount * 0.016;
        for (let i = 0; i < flickerObjectsRef.current.length; i++) {
          const o = flickerObjectsRef.current[i];
          o.material.emissiveIntensity = o.baseIntensity + Math.sin(t * o.flickerSpeed + o.flickerOffset) * 0.2;
        }
      }

      // Building screen glitch/spasm effect
      {
        const gt = frameCount * 0.016;
        const GLITCH_COLORS = [0x00ffff, 0xff0033, 0x00ff99, 0xff00cc, 0xffffff];
        for (let i = 0; i < glitchMaterialsRef.current.length; i++) {
          const g = glitchMaterialsRef.current[i];
          if (g.glitching) {
            if (gt >= g.glitchEndTime) {
              // Reset back to original
              g.glitching = false;
              g.material.map.offset.set(g.origOffX, g.origOffY);
              g.material.map.needsUpdate = true;
              if (g.material.color) g.material.color.setHex(g.origColor);
              g.nextGlitchTime = gt + 2.5 + Math.random() * 9;
            } else if (frameCount % 2 === 0) {
              // Mid-spasm: random horizontal slice shift + color flash
              const sliceShift = (Math.random() - 0.5) * 0.4;
              g.material.map.offset.set(g.origOffX + sliceShift, g.origOffY + (Math.random() - 0.5) * 0.12);
              g.material.map.needsUpdate = true;
              if (g.material.color && frameCount % 3 === 0) {
                g.material.color.setHex(GLITCH_COLORS[Math.floor(Math.random() * GLITCH_COLORS.length)]);
              }
            }
          } else if (gt >= g.nextGlitchTime) {
            g.glitching = true;
            g.glitchEndTime = gt + 0.06 + Math.random() * 0.22;
          }
        }
      }

      if (frameCount % 4 === 0 && videoScreenRef.current) {
        videoScreenRef.current.draw(frameCount * 0.016);
      }
      syncCityVideos(cityVideos, camera);
      if (plazaVideoTexture && plazaVideoElement && plazaVideoElement.readyState >= 2) {
        plazaVideoTexture.needsUpdate = true;
      }
      if (vikyVideoElement && vikyVideoElement.readyState >= 2) {
        vikyTexture.needsUpdate = true;
      }
      if (frameCount % 8 === 0) {
        const t = frameCount * 0.016;
        for (let i = 0; i < extraCanvasesRef.current.length; i++) {
          if (i % 2 === frameCount % 2) extraCanvasesRef.current[i].draw(t + i * 1.3);
        }
      }

      const isNearCarousel = camera.position.distanceTo(new THREE.Vector3(0, 4.2, 28)) < 18;
      worksCarousel.setProximity(isNearCarousel);
      worksCarousel.update(frameCount * 0.016);

      const particles = scene.children.find((child) => child.isPoints);
      if (particles) {
        particles.rotation.y += 0.00035;
      }

      const robotTime = frameCount * 0.016;
      updateFlyingRobots(robotSwarm, robotTime);
      heroRobots.forEach((heroRobot, index) => {
        const targetX = heroRobot.anchorX + Math.sin(robotTime * heroRobot.speed + heroRobot.offset) * heroRobot.driftX + Math.sin(robotTime * 0.42 + index) * 8;
        const targetZ = heroRobot.anchorZ + Math.cos(robotTime * (heroRobot.speed * 0.9) + heroRobot.offset) * heroRobot.driftZ + Math.sin(robotTime * 0.33 + index * 1.2) * 6;
        const prevX = heroRobot.mesh.position.x;
        const prevZ = heroRobot.mesh.position.z;
        const clampedTargetX = Math.max(-64, Math.min(64, targetX));
        const clampedTargetZ = Math.max(-64, Math.min(64, targetZ));

        heroRobot.mesh.position.x += (clampedTargetX - heroRobot.mesh.position.x) * 0.02;
        heroRobot.mesh.position.z += (clampedTargetZ - heroRobot.mesh.position.z) * 0.02;
        heroRobot.mesh.position.y = heroRobot.height + Math.sin(robotTime * 1.3 + heroRobot.offset) * 1.3 + Math.cos(robotTime * 0.6 + index) * 0.5;
        heroRobot.mesh.rotation.y = Math.atan2(heroRobot.mesh.position.x - prevX, heroRobot.mesh.position.z - prevZ);
        heroRobot.mesh.rotation.z = Math.sin(robotTime * 1.15 + heroRobot.offset) * 0.07;
      });

      const movimiento = camera.position.distanceTo(posInicial);
      if (movimiento > 10 && !moving && !worksTransitionRef.current.active) {
        camera.position.copy(posInicial);
      }

      composer.render();
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
      composer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('touchcancel', handleTouchEnd);
      document.removeEventListener('touchmove', handleJoystickTouchMove);
      document.removeEventListener('touchend', handleJoystickTouchEnd);
      document.removeEventListener('touchcancel', handleJoystickTouchEnd);
      if (joystickContainer && document.body.contains(joystickContainer)) document.body.removeChild(joystickContainer);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      plazaVideoScreen?.dispose();
      plazaVideoTexture?.dispose();
      worksMediaTexture?.dispose?.();
      cityVideos.forEach((item) => {
        item.texture?.dispose?.();
        item.video?.pause?.();
        item.video?.removeAttribute?.('src');
        item.video?.load?.();
        if (item.group && item.group !== plazaVideoScreen?.group) {
          scene.remove(item.group);
        }
      });
      robotSwarm.forEach((robot) => scene.remove(robot.group));
      heroRobots.forEach((heroRobot) => scene.remove(heroRobot.mesh));
      if (plazaVideoElement) {
        plazaVideoElement.pause();
        plazaVideoElement.removeAttribute('src');
        plazaVideoElement.load();
      }
      if (worksMediaElement) {
        worksMediaElement.pause();
        worksMediaElement.removeAttribute('src');
        worksMediaElement.load();
      }
      if (vikyVideoElement) {
        vikyVideoElement.pause();
        vikyVideoElement.removeAttribute('src');
        vikyVideoElement.load();
      }
      vikyTexture?.dispose?.();
      worksCarousel.dispose();
      composer.dispose();
      vignette.remove();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      cameraRef.current = null;
    };
  }, [plazaVideoUrl, robotModelUrl, isMobile, theatreReady]);

  return <div ref={mountRef} data-city-world="true" className="w-full h-full cursor-crosshair" />;
}

function basicMat(params) {
  return new THREE.MeshBasicMaterial(params);
}

function emissiveMat(color, intensity = 1.0) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity * 0.8, roughness: 0.08, metalness: 0.15 });
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

function makeWorksCarouselScreen() {
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
    const work = WORKS[activeIndex];
    if (!work.videoUrl) return;
    if (video.src !== work.videoUrl) {
      video.src = work.videoUrl;
      video.load();
      video.play().catch(() => {});
    }
  };

  const draw = (time = 0) => {
    const work = WORKS[activeIndex];
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
    ctx.fillText(`PROYECTO ${activeIndex + 1} / ${WORKS.length}`, canvas.width / 2, canvas.height - 120);
    for (let i = 0; i < WORKS.length; i++) {
      ctx.fillStyle = i === activeIndex ? WORKS[i].color : '#ffffff33';
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
    if (video.readyState >= 2) {
      videoTexture.needsUpdate = true;
    }
  };

  const next = () => {
    activeIndex = (activeIndex + 1) % WORKS.length;
    lastAdvance = performance.now();
    loadVideo();
    draw(performance.now() * 0.001);
  };

  const prev = () => {
    activeIndex = (activeIndex - 1 + WORKS.length) % WORKS.length;
    lastAdvance = performance.now();
    loadVideo();
    draw(performance.now() * 0.001);
  };

  const update = (time) => {
    if (performance.now() - lastAdvance > 8000) {
      next();
    } else {
      draw(time);
    }
  };

  const setProximity = (value) => {
    controlsVisible = value;
  };

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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
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

function buildCity(scene, flicker, gt, videoTex, worksTex, vikyTex, onOpenViky, worksCarousel, farBuildingLimit = 16) {
  const extraCanvases = [];

  // ── Sky sphere — matches reference: deep blue zenith → golden horizon ──────
  {
    const sw = 2048, sh = 1024;
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = sw; skyCanvas.height = sh;
    const sk = skyCanvas.getContext('2d');

    // Base gradient: deep blue top → steel blue mid → golden orange horizon
    const grad = sk.createLinearGradient(0, 0, 0, sh);
    grad.addColorStop(0,    '#050e22');   // deep midnight blue (zenith)
    grad.addColorStop(0.30, '#0d1e42');   // dark blue
    grad.addColorStop(0.55, '#1a3266');   // steel blue (mid sky)
    grad.addColorStop(0.72, '#2a4a80');   // lighter blue
    grad.addColorStop(0.84, '#5a6e8a');   // blue-grey near horizon
    grad.addColorStop(0.92, '#a07040');   // warm golden band
    grad.addColorStop(0.97, '#c8842a');   // orange horizon glow
    grad.addColorStop(1.00, '#8a4a10');   // dark amber at very bottom
    sk.fillStyle = grad;
    sk.fillRect(0, 0, sw, sh);

    // Horizontal cloud streaks — bright white/grey like reference
    const cloudRows = [
      // [y_center, count, opacity]
      [sh * 0.30, 6, 0.18],
      [sh * 0.40, 5, 0.22],
      [sh * 0.50, 7, 0.28],
      [sh * 0.60, 4, 0.20],
    ];
    cloudRows.forEach(([cy, count, alpha]) => {
      for (let i = 0; i < count; i++) {
        const cx = (sw / count) * i + sw / (count * 2) + (Math.random() - 0.5) * 120;
        const rx = 180 + Math.random() * 160;
        const ry = 28 + Math.random() * 22;
        const cg = sk.createRadialGradient(cx, cy, 0, cx, cy, rx);
        cg.addColorStop(0, `rgba(200,220,255,${alpha})`);
        cg.addColorStop(0.5, `rgba(180,200,240,${alpha * 0.5})`);
        cg.addColorStop(1,   'rgba(180,200,240,0)');
        sk.fillStyle = cg;
        sk.beginPath(); sk.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); sk.fill();
      }
    });

    // Warm golden glow bloom at horizon centre
    const sunGlow = sk.createRadialGradient(sw * 0.55, sh * 0.90, 0, sw * 0.55, sh * 0.90, sw * 0.35);
    sunGlow.addColorStop(0,    'rgba(255,180,60,0.30)');
    sunGlow.addColorStop(0.35, 'rgba(220,140,40,0.14)');
    sunGlow.addColorStop(1,    'rgba(220,140,40,0)');
    sk.fillStyle = sunGlow;
    sk.fillRect(0, sh * 0.55, sw, sh * 0.45);

    const skyTex = new THREE.CanvasTexture(skyCanvas);
    const skySphere = new THREE.Mesh(
      new THREE.SphereGeometry(195, 32, 16),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide })
    );
    skySphere.userData.noGlitch = true;
    scene.add(skySphere);
  }

  // Soft moonlight-style overhead to illuminate the floor
  const moonLight = new THREE.PointLight(0x3355cc, 20, 220, 1.3);
  moonLight.position.set(0, 90, 0);
  scene.add(moonLight);

  // ── Ground ───────────────────────────────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220, 80, 80),
    new THREE.MeshStandardMaterial({
      color: 0x182050,
      emissive: new THREE.Color(0x121e48),
      emissiveIntensity: 1.6,
      roughness: 0.35,
      metalness: 0.3,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Cyan grid overlay — makes floor clearly readable as a surface
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = 512; gridCanvas.height = 512;
  const gcx = gridCanvas.getContext('2d');
  gcx.clearRect(0, 0, 512, 512);
  gcx.strokeStyle = 'rgba(0,200,255,0.55)';
  gcx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    gcx.beginPath(); gcx.moveTo(i, 0); gcx.lineTo(i, 512); gcx.stroke();
    gcx.beginPath(); gcx.moveTo(0, i); gcx.lineTo(512, i); gcx.stroke();
  }
  gcx.strokeStyle = 'rgba(0,255,210,0.85)';
  gcx.lineWidth = 3;
  for (let i = 0; i <= 512; i += 256) {
    gcx.beginPath(); gcx.moveTo(i, 0); gcx.lineTo(i, 512); gcx.stroke();
    gcx.beginPath(); gcx.moveTo(0, i); gcx.lineTo(512, i); gcx.stroke();
  }
  const gridTex = new THREE.CanvasTexture(gridCanvas);
  gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
  gridTex.repeat.set(10, 10);
  const groundGridMat = new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
  const groundGrid = new THREE.Mesh(new THREE.PlaneGeometry(220, 220), groundGridMat);
  groundGrid.rotation.x = -Math.PI / 2;
  groundGrid.position.y = 0.02;
  groundGrid.userData.noGlitch = true;
  scene.add(groundGrid);

  // Thin blue additive sheen across the whole floor
  const groundSheen = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220),
    new THREE.MeshBasicMaterial({
      color: 0x1144ff,
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
    })
  );
  groundSheen.rotation.x = -Math.PI / 2;
  groundSheen.position.y = 0.015;
  scene.add(groundSheen);

  // ── Wet reflective floor — Reflector (real mirror) + tinted overlay ────────
  // The Reflector becomes dark when the reflected scene is dark.
  // Fix: layer a semi-transparent blue plane ON TOP to tint it blue always.
  // The overlay blocks ~60% → the remaining 40% is actual live reflection.
  const reflector = new Reflector(new THREE.CircleGeometry(30, 64), {
    clipBias: 0.003,
    textureWidth: 512,
    textureHeight: 512,
    color: new THREE.Color(0x1a3a88),   // blue tint baked into reflection
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.y = 0.02;
  scene.add(reflector);

  // Blue overlay — tints the reflection blue and softens any dark areas
  const reflOverlay = new THREE.Mesh(
    new THREE.CircleGeometry(30, 64),
    new THREE.MeshBasicMaterial({
      color: 0x08183c,
      transparent: true,
      opacity: 0.62,
    })
  );
  reflOverlay.rotation.x = -Math.PI / 2;
  reflOverlay.position.y = 0.03;
  scene.add(reflOverlay);

  // Faint additive neon sheen on top of the reflector (gives colour to the mirror)
  const reflSheen = new THREE.Mesh(
    new THREE.CircleGeometry(30, 64),
    new THREE.MeshBasicMaterial({
      color: 0x2244ff,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    })
  );
  reflSheen.rotation.x = -Math.PI / 2;
  reflSheen.position.y = 0.04;
  scene.add(reflSheen);

  // Two neon fills that bounce into the reflective surface
  const floorGlowA = new THREE.PointLight(0x0055ff, 10, 80, 1.6);
  floorGlowA.position.set(-8, 0.4, -5);
  scene.add(floorGlowA);
  const floorGlowB = new THREE.PointLight(0xff00cc, 8, 70, 1.6);
  floorGlowB.position.set(8, 0.4, 5);
  scene.add(floorGlowB);

  const carouselRotation = Math.PI;

  const carouselFrame = new THREE.Mesh(
    new THREE.BoxGeometry(13.6, 8, 0.62),
    new THREE.MeshBasicMaterial({ color: 0x04040a })
  );
  carouselFrame.position.set(0, 4.25, 28);
  carouselFrame.rotation.y = Math.PI;
  scene.add(carouselFrame);

  const carouselScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(12.7, 7.2),
    new THREE.MeshBasicMaterial({ map: worksCarousel.texture, toneMapped: false, side: THREE.DoubleSide })
  );
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

  const carouselGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(14.2, 7.9),
    new THREE.MeshBasicMaterial({ color: 0xff00ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
  );
  carouselGlow.position.set(0, 4.25, 27.42);
  carouselGlow.rotation.y = Math.PI;
  scene.add(carouselGlow);

  ZONES.forEach(zone => createZoneBuilding(scene, zone, flicker, gt, videoTex, worksTex, vikyTex, onOpenViky));
  STANDS.filter((stand) => stand.type === 'arcade').forEach((stand) => createArcadeMachine(scene, stand, gt));

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

  // Far buildings — dark indigo silhouettes, NOT pure black
  const farBodyMats = [
    new THREE.MeshStandardMaterial({ color: 0x0b0820, emissive: 0x0b0a22, emissiveIntensity: 0.9, roughness: 0.75, metalness: 0.25 }),
    new THREE.MeshStandardMaterial({ color: 0x080d1e, emissive: 0x080c20, emissiveIntensity: 0.8, roughness: 0.75, metalness: 0.25 }),
    new THREE.MeshStandardMaterial({ color: 0x0d0a1a, emissive: 0x0d0a22, emissiveIntensity: 0.85, roughness: 0.75, metalness: 0.25 }),
  ];
  for (let i = 0; i < farBuildingLimit; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 75 + (i % 4) * 8;
    const h = 14 + (i % 8) * 6;
    const w = 5 + (i % 4) * 2;
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), farBodyMats[i % farBodyMats.length]);
    body.position.set(bx, h / 2, bz);
    scene.add(body);
    const nc = neonPalette[i % neonPalette.length];
    // Glowing neon cap + vertical emissive strip for each distant tower
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w, 0.5, w), new THREE.MeshBasicMaterial({ color: nc }));
    cap.position.set(bx, h + 0.25, bz);
    scene.add(cap);
    // Small neon window strip on the building face
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.4, h * 0.55),
      new THREE.MeshBasicMaterial({ color: nc, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending })
    );
    strip.position.set(bx, h * 0.5, bz + w * 0.51);
    scene.add(strip);
  }

  const count = 220;
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const particleColors = [[0,1,1],[1,0,1],[1,0.8,0],[0.3,0.5,1]];
  for (let i = 0; i < count; i++) {
    pos[i*3] = (Math.random() - 0.5) * 170;
    pos[i*3+1] = Math.random() * 38 + 0.5;
    pos[i*3+2] = (Math.random() - 0.5) * 170;
    const c = particleColors[i % 4];
    colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ size: 0.25, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  scene.add(particles);

  // Arcade side-panel textures spread through the city
  addArcadePanels(scene);

  return extraCanvases;
}

// ── Arcade panel textures ─────────────────────────────────────────────────────
function makeArcadePanelTex(neonColor) {
  const W = 512, H = 512;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Dark base — like the arcade machine sides
  ctx.fillStyle = '#04020c';
  ctx.fillRect(0, 0, W, H);

  // Horizontal scanlines
  for (let y = 0; y < H; y += 6) {
    ctx.fillStyle = 'rgba(20,10,40,0.55)';
    ctx.fillRect(0, y, W, 3);
  }

  // Circuit board traces (random L-paths in neon)
  ctx.strokeStyle = neonColor;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 8; ctx.shadowColor = neonColor;
  const traceSeeds = [
    [40,80,160,80,160,200],[100,40,100,140,300,140],
    [320,60,320,180,450,180],[200,260,340,260,340,380],
    [60,320,60,440,220,440],[380,300,380,460,480,460],
    [240,120,240,300,420,300],[140,380,280,380,280,480],
  ];
  traceSeeds.forEach(([x1,y1,x2,y2,x3,y3]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
    // Junction dots
    [[x1,y1],[x2,y2],[x3,y3]].forEach(([px,py]) => {
      ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI*2); ctx.fillStyle = neonColor; ctx.fill();
    });
  });

  // Pixel-art sprite — random 8×8 pixel block near centre
  ctx.shadowBlur = 0;
  const spriteX = 180, spriteY = 180, px = 16;
  const pattern = [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,0,1,1,0,1,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,0,0,0,0,0,0,1],
  ];
  pattern.forEach((row, ry) =>
    row.forEach((on, rx) => {
      if (!on) return;
      ctx.fillStyle = on ? neonColor : 'transparent';
      ctx.shadowBlur = 6; ctx.shadowColor = neonColor;
      ctx.fillRect(spriteX + rx * px, spriteY + ry * px, px - 1, px - 1);
    })
  );

  // Neon border
  ctx.shadowBlur = 16; ctx.shadowColor = neonColor;
  ctx.strokeStyle = neonColor; ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  // Corner accent squares
  [[0,0],[W-20,0],[0,H-20],[W-20,H-20]].forEach(([bx,by]) => {
    ctx.fillStyle = neonColor; ctx.fillRect(bx + 8, by + 8, 12, 12);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.userData = { noGlitch: true };
  return tex;
}

function addArcadePanels(scene) {
  const palette = ['#00ffcc', '#ff00cc', '#ffdd00', '#00bbff', '#ff4488', '#88ff00'];

  // Each entry: building [bx, bz] + face direction.
  // facing = which face of the building the panel goes on (toward city center).
  // halfW = half-width of that building face (to push panel flush to surface).
  // panels at two heights: low (y≈5) and mid (y≈10).
  const buildingFaces = [
    // Inner ring buildings — face pointing toward center
    { bx: -18, bz: -30, halfW: 3.5, faceAngle: Math.atan2( 18,  30) }, // NW → SE face
    { bx:  18, bz: -30, halfW: 3.5, faceAngle: Math.atan2(-18,  30) }, // NE → SW face
    { bx: -30, bz:  18, halfW: 3.5, faceAngle: Math.atan2( 30, -18) }, // W  → E face
    { bx:  30, bz:  18, halfW: 3.5, faceAngle: Math.atan2(-30, -18) }, // E  → W face
    { bx: -34, bz: -34, halfW: 4.0, faceAngle: Math.atan2( 34,  34) },
    { bx:  34, bz: -34, halfW: 4.0, faceAngle: Math.atan2(-34,  34) },
    { bx: -34, bz:  34, halfW: 4.0, faceAngle: Math.atan2( 34, -34) },
    { bx:  34, bz:  34, halfW: 4.0, faceAngle: Math.atan2(-34, -34) },
    // Outer ring
    { bx: -46, bz: -18, halfW: 4.5, faceAngle: Math.atan2( 46,  18) },
    { bx:  46, bz: -18, halfW: 4.5, faceAngle: Math.atan2(-46,  18) },
    { bx: -46, bz:  18, halfW: 4.5, faceAngle: Math.atan2( 46, -18) },
    { bx:  46, bz:  18, halfW: 4.5, faceAngle: Math.atan2(-46, -18) },
  ];

  const HEIGHTS = [5.5, 10.5];   // two panels per building: low and mid
  const PW = 4.2, PH = 4.2;       // panel face size

  let idx = 0;
  buildingFaces.forEach(({ bx, bz, halfW, faceAngle }) => {
    // Direction vector from building center toward city center (0,0)
    const len = Math.sqrt(bx * bx + bz * bz);
    const dx = -bx / len, dz = -bz / len;

    HEIGHTS.forEach((py) => {
      const col = palette[(idx++) % palette.length];
      const tex = makeArcadePanelTex(col);

      // Panel surface sits flush on building face + tiny gap (0.06)
      const px = bx + dx * (halfW + 0.06);
      const pz = bz + dz * (halfW + 0.06);

      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(PW, PH),
        new THREE.MeshStandardMaterial({
          map: tex, emissiveMap: tex,
          emissive: new THREE.Color(col),
          emissiveIntensity: 1.8,
          roughness: 0.22, metalness: 0.35,
        })
      );
      panel.position.set(px, py, pz);
      // Rotate to face inward (toward city center)
      panel.rotation.y = Math.atan2(dx, dz);
      panel.userData.noGlitch = true;
      scene.add(panel);
      // No individual PointLight per panel — emissive handles the glow;
      // per-light cost is too high with 24+ panels
    });
  });
}

function createZoneBuilding(scene, zone, flicker, gt, videoTex, worksTex, vikyTex, onOpenViky) {
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

  if (isHQ && videoTex) {
    addVideoScreen(scene, x, z, w, h, videoTex, flicker, worksTex, vikyTex, onOpenViky);
  }

  const signTex = makeNeonSignTexture(zone.label || zone.id.toUpperCase(), zone.colorHex);
  const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true, depthWrite: false });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.2, w * 0.3), signMat);
  sign.position.set(x, h + 1.8, z + w / 2 + 0.05);
  scene.add(sign);

  const gKey = colorToGlowKey(color);
  addGlowSprite(scene, x, h + 4, z, gt[gKey], 26);
  addGlowSprite(scene, x, h + 1, z, gt[gKey], 12);
}

function addVideoScreen(scene, bx, bz, bw, bh, videoTex, flicker, worksTex, vikyTex, onOpenViky) {
  const facadeW = bw;
  const facadeH = bh * 0.82;
  const facadeY = bh * 0.48;

  const frontMat = new THREE.MeshBasicMaterial({ map: videoTex, side: THREE.FrontSide });
  const frontScreen = new THREE.Mesh(new THREE.PlaneGeometry(facadeW, facadeH), frontMat);
  frontScreen.position.set(bx, facadeY, bz + bw / 2 + 0.08);
  scene.add(frontScreen);

  const vikyVideo = document.createElement('video');
  vikyVideo.src = 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/0cbcd588c_Viky-EventoMayo-GoogleChrome2026-05-0811-15-57.mp4';
  vikyVideo.crossOrigin = 'anonymous';
  vikyVideo.loop = true;
  vikyVideo.muted = true;
  vikyVideo.playsInline = true;
  vikyVideo.autoplay = true;
  vikyVideo.setAttribute('playsinline', '');
  vikyVideo.setAttribute('webkit-playsinline', '');
  vikyVideo.setAttribute('muted', '');
  vikyVideo.load();

  const rearVideoTexture = new THREE.VideoTexture(vikyVideo);
  rearVideoTexture.colorSpace = THREE.SRGBColorSpace;
  rearVideoTexture.minFilter = THREE.LinearFilter;
  rearVideoTexture.magFilter = THREE.LinearFilter;
  rearVideoTexture.generateMipmaps = false;
  rearVideoTexture.offset.set(0, 0.08);
  rearVideoTexture.repeat.set(1, 0.85);

  const rearMaterial = new THREE.MeshBasicMaterial({
    map: rearVideoTexture,
    color: 0xffffff,
    side: THREE.FrontSide,
    toneMapped: false,
    transparent: true,
    opacity: 0.92,
  });

  const rearScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(facadeW * 1.3, facadeH * 0.95),
    rearMaterial
  );
  rearScreen.position.set(bx, facadeY, bz - bw / 2 - 0.18);
  rearScreen.rotation.y = Math.PI;
  rearScreen.userData.vikyVideo = vikyVideo;
  scene.add(rearScreen);

  const frontBorderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(facadeW + 0.12, facadeH + 0.12, 0.05));
  const frontBorderLine = new THREE.LineSegments(frontBorderGeo, new THREE.LineBasicMaterial({ color: 0xff00ff }));
  frontBorderLine.position.set(bx, facadeY, bz + bw / 2 + 0.1);
  scene.add(frontBorderLine);

  const rearBorderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(facadeW * 1.3 + 0.12, facadeH * 0.95 + 0.12, 0.08));
  const rearBorderLine = new THREE.LineSegments(rearBorderGeo, new THREE.LineBasicMaterial({ color: 0x8aefff }));
  rearBorderLine.position.copy(rearScreen.position);
  rearBorderLine.rotation.y = Math.PI;
  scene.add(rearBorderLine);

  const rearGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(facadeW * 1.4, facadeH),
    new THREE.MeshBasicMaterial({ color: 0xb8f7ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  rearGlow.position.set(bx, facadeY, bz - bw / 2 - 0.22);
  rearGlow.rotation.y = Math.PI;
  scene.add(rearGlow);

  vikyVideo.addEventListener('loadeddata', () => {
    console.log('✓ Viky video loaded');
    vikyVideo.play().catch((e) => console.error('Viky play error:', e));
  });

  setTimeout(() => vikyVideo.play().catch(() => {}), 200);
}

// ── Billboard helper ───────────────────────────────────────────────────────
function makeBillboardTexture(line1, line2, color1, color2) {
  const W = 512, H = 256;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  // Dark panel base — like arcade machine side
  ctx.fillStyle = '#06030f';
  ctx.fillRect(0, 0, W, H);
  // Outer neon border
  ctx.strokeStyle = color1;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 18; ctx.shadowColor = color1;
  ctx.strokeRect(4, 4, W - 8, H - 8);
  // Inner accent line
  ctx.strokeStyle = color2;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10; ctx.shadowColor = color2;
  ctx.strokeRect(14, 14, W - 28, H - 28);
  // Horizontal divider
  ctx.beginPath(); ctx.moveTo(14, H / 2); ctx.lineTo(W - 14, H / 2);
  ctx.strokeStyle = color1; ctx.lineWidth = 1; ctx.shadowBlur = 6;
  ctx.stroke();
  // Main text
  ctx.shadowBlur = 20; ctx.shadowColor = color1;
  ctx.fillStyle = color1;
  ctx.font = 'bold 52px monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(line1, W / 2, H * 0.32);
  // Sub text
  ctx.shadowColor = color2; ctx.fillStyle = color2;
  ctx.font = '28px monospace';
  ctx.fillText(line2, W / 2, H * 0.72);
  // Corner pixels (arcade machine aesthetic)
  [color1, color2].forEach((col, ci) => {
    ctx.fillStyle = col; ctx.shadowBlur = 0;
    const corners = [[8,8],[W-16,8],[8,H-16],[W-16,H-16]];
    corners.forEach(([cx,cy]) => ctx.fillRect(cx + ci*4, cy + ci*4, 6, 6));
  });
  const tex = new THREE.CanvasTexture(c);
  tex.userData = { noGlitch: true };
  return tex;
}

function placeBillboards(scene) {
  // Build billboards directly in Three.js — vertical plane + pole.
  // No GLB dependency so orientation is always correct.
  const configs = [
    { pos: [-22, 0, -18], ry: 0.5,        l1: 'GIRASOMNIS',  l2: 'IMMERSIVE SHOWS',  c1: '#00ffcc', c2: '#ff00aa' },
    { pos: [22,  0, -18], ry: -0.5,       l1: 'AGENCY°360',  l2: 'CREATIVE CITY',    c1: '#ff2d2d', c2: '#ffaa00' },
    { pos: [-28, 0,  8],  ry: Math.PI/2,  l1: 'HORIZONS',    l2: 'DANCE & VISUALS',  c1: '#00c8ff', c2: '#ff00ff' },
    { pos: [28,  0,  8],  ry: -Math.PI/2, l1: 'GENESIS LUX', l2: 'VIOLIN · LUZ',     c1: '#ffaa00', c2: '#ff4444' },
    { pos: [-10, 0, -30], ry: 0.2,        l1: 'LUMINA',      l2: 'LUZ · EFECTOS',    c1: '#ff00ff', c2: '#00ffff' },
    { pos: [10,  0, -30], ry: -0.2,       l1: 'LIDAR TECH',  l2: 'INTERACTIVE ART',  c1: '#00ff88', c2: '#0088ff' },
  ];

  const BW = 6.0, BH = 3.4;

  configs.forEach(({ pos, ry, l1, l2, c1, c2 }) => {
    const tex = makeBillboardTexture(l1, l2, c1, c2);
    const group = new THREE.Group();

    // Dark outer frame
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(BW + 0.3, BH + 0.3, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x050010, metalness: 0.85, roughness: 0.25 })
    );
    frame.userData.noGlitch = true;
    group.add(frame);

    // Neon edge glow plane
    const borderGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(BW + 0.15, BH + 0.15),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(c1),
        transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending,
      })
    );
    borderGlow.position.z = 0.14;
    borderGlow.userData.noGlitch = true;
    group.add(borderGlow);

    // Screen front
    const screenFront = new THREE.Mesh(
      new THREE.PlaneGeometry(BW, BH),
      new THREE.MeshStandardMaterial({
        map: tex, emissiveMap: tex,
        emissive: new THREE.Color(c1),
        emissiveIntensity: 2.2,
        roughness: 0.2, metalness: 0.3,
      })
    );
    screenFront.position.z = 0.145;
    screenFront.userData.noGlitch = true;
    group.add(screenFront);

    // Screen back
    const screenBack = new THREE.Mesh(
      new THREE.PlaneGeometry(BW, BH),
      new THREE.MeshStandardMaterial({
        map: tex, emissiveMap: tex,
        emissive: new THREE.Color(c2),
        emissiveIntensity: 1.8,
        roughness: 0.2, metalness: 0.3,
      })
    );
    screenBack.rotation.y = Math.PI;
    screenBack.position.z = -0.145;
    screenBack.userData.noGlitch = true;
    group.add(screenBack);

    // Support pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.10, 5.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a1a2e, metalness: 0.9, roughness: 0.2 })
    );
    pole.position.y = -(BH / 2 + 5.5 / 2);
    pole.userData.noGlitch = true;
    group.add(pole);

    // Centre of face at y = 4 + BH/2, bottom of pole at y ≈ 0
    group.position.set(pos[0], 4 + BH / 2, pos[2]);
    group.rotation.y = ry;
    group.userData.noGlitch = true;
    scene.add(group);
    // No per-billboard PointLights — emissiveIntensity 2.2 handles glow
    // 4 shared neon fills are added once after the loop (see below)
  });

  // 4 shared neon fills cover the whole billboard zone — cheap + effective
  const sharedFills = [
    { col: 0x00ffcc, x: -16, z: -22 },
    { col: 0xff2d2d, x:  16, z: -22 },
    { col: 0x00c8ff, x: -24, z:   4 },
    { col: 0xffaa00, x:  24, z:   4 },
  ];
  sharedFills.forEach(({ col, x, z }) => {
    const l = new THREE.PointLight(col, 6, 28, 1.8);
    l.position.set(x, 6, z);
    scene.add(l);
  });
}

function createArcadeMachine(scene, stand, gt) {
  const [x, , z] = stand.position;

  const loader = new GLTFLoader();
  loader.load(
    '/arcade_machine.glb',
    (gltf) => {
      const model = gltf.scene;

      // Measure raw size before any transform
      const rawBox = new THREE.Box3().setFromObject(model);
      const rawHeight = rawBox.max.y - rawBox.min.y;
      const scale = rawHeight > 0 ? 4.5 / rawHeight : 1;

      model.scale.setScalar(scale);
      // Face roughly toward plaza center [0,0,0] from current position
      model.rotation.y = Math.atan2(-x, -z);
      model.position.set(x, 0, z);

      // Force matrix update so bounding box is accurate after scale
      model.updateMatrixWorld(true);
      const scaledBox = new THREE.Box3().setFromObject(model);
      // Lift model so its lowest point is at y=0
      model.position.y = -scaledBox.min.y;

      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          if (child.material) {
            const mat = child.material.clone();
            mat.envMapIntensity = 1.5;
            if (mat.emissive !== undefined) {
              if (mat.emissiveIntensity === 0 || mat.emissiveIntensity === undefined) {
                mat.emissive = new THREE.Color(0xff4400);
                mat.emissiveIntensity = 0.35;
              } else {
                mat.emissiveIntensity = Math.max(mat.emissiveIntensity * 2.5, 0.5);
              }
            }
            // Ensure arcade mesh materials are marked for no glitch
            mat.userData = mat.userData || {};
            mat.userData.noGlitch = true;
            child.material = mat;
          }
        }
      });

      scene.add(model);
    },
    undefined,
    (err) => {
      console.warn('arcade_machine.glb not found, using fallback box', err);
      const fallback = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 4.5, 1.5),
        new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.5, metalness: 0.4 })
      );
      fallback.position.set(x, 2.25, z);
      scene.add(fallback);
    }
  );

  // Dedicated lights to illuminate the arcade GLB
  const arcadeFront = new THREE.PointLight(0xff2266, 18, 14, 1.8);
  arcadeFront.position.set(x, 2.5, z + 2.8);
  scene.add(arcadeFront);

  const arcadeBack = new THREE.PointLight(0x9900ff, 10, 10, 1.8);
  arcadeBack.position.set(x - 1.5, 3, z - 1.5);
  scene.add(arcadeBack);

  const arcadeFill = new THREE.PointLight(0xffffff, 8, 10, 2);
  arcadeFill.position.set(x + 1.5, 1.5, z + 1.5);
  scene.add(arcadeFill);
}

function createMidBuilding(scene, x, z, w, h, nc, flicker) {
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

  const stripMat = emissiveMat(nc, 0.8);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.1, h * 0.6, 0.1), stripMat);
  strip.position.set(x + w/2, h * 0.5, z + w * 0.45);
  scene.add(strip);
  flicker.push({ material: stripMat, baseIntensity: 0.8, flickerSpeed: 0.6 + Math.random() * 0.8, flickerOffset: Math.random() * Math.PI * 2 });

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
    { minX: -65, maxX: -25, minZ: -65, maxZ: 65 },
    { minX: 25, maxX: 65, minZ: -65, maxZ: 65 },
    { minX: -65, maxX: 65, minZ: -65, maxZ: -25 },
    { minX: -65, maxX: 65, minZ: 25, maxZ: 65 },
    { minX: -45, maxX: 45, minZ: -45, maxZ: 45 },
    { minX: -60, maxX: -20, minZ: -20, maxZ: 20 },
    { minX: 20, maxX: 60, minZ: -20, maxZ: 20 },
  ];

  return Array.from({ length: 15 }, (_, i) => {
    const robot = createFlyingRobot(colors[i % colors.length]);
    const lane = lanes[i % lanes.length];
    const originX = lane.minX + Math.random() * (lane.maxX - lane.minX);
    const originZ = lane.minZ + Math.random() * (lane.maxZ - lane.minZ);
    const driftX = 8 + Math.random() * Math.min(14, (lane.maxX - lane.minX) * 0.6);
    const driftZ = 8 + Math.random() * Math.min(14, (lane.maxZ - lane.minZ) * 0.6);
    const speed = 0.1 + Math.random() * 0.12;
    const height = 3 + Math.random() * 12;
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

    ROBOT_NO_FLY_ZONES.forEach((zone) => {
      const dx = x - zone.x;
      const dz = z - zone.z;
      const distance = Math.hypot(dx, dz) || 0.001;

      if (distance < zone.radius) {
        const safeDistance = zone.radius + 1.5;
        x = zone.x + (dx / distance) * safeDistance;
        z = zone.z + (dz / distance) * safeDistance;
      }
    });

    x = Math.max(robot.bounds.minX, Math.min(robot.bounds.maxX, x));
    z = Math.max(robot.bounds.minZ, Math.min(robot.bounds.maxZ, z));

    const prevX = robot.group.position.x;
    const prevZ = robot.group.position.z;

    robot.group.position.set(x, y, z);
    robot.group.rotation.y = Math.atan2(x - prevX, z - prevZ) + robot.yawOffset;
    robot.group.rotation.z = Math.sin(time * 1.8 + index) * 0.05;
    robot.trail.scale.y = 0.6 + Math.sin(time * 2.2 + index) * 0.08;
  });
}