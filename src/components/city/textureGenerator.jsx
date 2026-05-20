import * as THREE from 'three';

const KANJI = ['声','石','山','テレビ','ゲーム','电子','未来','空間','光','都市','次元','波','夢','速','力'];
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

export function makeGlowTexture(hex) {
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

export function makeVideoCanvasTexture(label = 'AGENCY360', accentColor = '#ff00ff', mode = 'generic') {
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

export function makeBuildingWallTexture(accentColor, seed = 0) {
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

export function makeNeonSignTexture(text, color) {
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