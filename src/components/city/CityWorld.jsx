import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { ZONES } from './cityData';

// Sprite texture for glow halos
function makeGlowTexture(color) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, color + 'ff');
  grad.addColorStop(0.2, color + 'aa');
  grad.addColorStop(0.5, color + '44');
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

const MOVE_SPEED = 8;
const LOOK_SPEED = 0.002;

export default function CityWorld({ onEnterZone, onExitZone }) {
  const mountRef = useRef(null);
  const keysRef = useRef({});
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.1);
  const isLockedRef = useRef(false);
  const animFrameRef = useRef(null);
  const activeZoneRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const flickerObjectsRef = useRef([]);

  const checkZoneProximity = useCallback((pos) => {
    for (const zone of ZONES) {
      const dx = pos.x - zone.position[0];
      const dz = pos.z - zone.position[2];
      if (dx * dx + dz * dz < zone.radius * zone.radius) {
        if (activeZoneRef.current !== zone.id) {
          activeZoneRef.current = zone.id;
          onEnterZone(zone);
        }
        return;
      }
    }
    if (activeZoneRef.current !== null) {
      activeZoneRef.current = null;
      onExitZone();
    }
  }, [onEnterZone, onExitZone]);

  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000208, 0.018);
    scene.background = new THREE.Color(0x000208);

    // Camera
    const camera = new THREE.PerspectiveCamera(72, W / H, 0.1, 160);
    camera.position.set(0, 1.7, 12);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const canvas = renderer.domElement;

    // ── Lighting ─────────────────────────────────────────────────────────────
    // Extremely dark ambient so neons dominate
    scene.add(new THREE.AmbientLight(0x040816, 1.5));

    // Soft fill from above — very dim blue moonlight
    const hemi = new THREE.HemisphereLight(0x001830, 0x000408, 0.4);
    scene.add(hemi);

    // One directional "moon" light for subtle shadow volume
    const moon = new THREE.DirectionalLight(0x102040, 0.5);
    moon.position.set(-20, 40, -20);
    moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024);
    moon.shadow.camera.near = 0.5;
    moon.shadow.camera.far = 120;
    moon.shadow.camera.left = moon.shadow.camera.bottom = -60;
    moon.shadow.camera.right = moon.shadow.camera.top = 60;
    moon.shadow.bias = -0.001;
    scene.add(moon);

    // Glow textures
    const glowTextures = {
      cyan: makeGlowTexture('#00ffff'),
      magenta: makeGlowTexture('#ff00ff'),
      yellow: makeGlowTexture('#ffff00'),
      blue: makeGlowTexture('#0088ff'),
      orange: makeGlowTexture('#ff6600'),
      white: makeGlowTexture('#aaccff'),
    };

    // Build city
    buildCity(scene, flickerObjectsRef.current, glowTextures);

    // Pointer lock — request on canvas, also allow movement without lock (arrow keys always work)
    const handleClick = () => { canvas.requestPointerLock(); };
    const handlePointerLockChange = () => {
      isLockedRef.current = !!(document.pointerLockElement === canvas || document.pointerLockElement === mount);
    };
    const handleMouseMove = (e) => {
      if (!isLockedRef.current) return;
      yawRef.current -= e.movementX * LOOK_SPEED;
      pitchRef.current -= e.movementY * LOOK_SPEED;
      pitchRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, pitchRef.current));
    };
    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      // Allow movement even without pointer lock
      if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault();
        isLockedRef.current = true; // allow movement on keypress
      }
    };
    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const dir = new THREE.Vector3();
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clockRef.current.getDelta(), 0.05);

      if (isLockedRef.current) {
        dir.set(0, 0, 0);
        const k = keysRef.current;
        if (k['KeyW'] || k['ArrowUp']) dir.z -= 1;
        if (k['KeyS'] || k['ArrowDown']) dir.z += 1;
        if (k['KeyA'] || k['ArrowLeft']) dir.x -= 1;
        if (k['KeyD'] || k['ArrowRight']) dir.x += 1;
        if (dir.lengthSq() > 0) {
          dir.normalize();
          euler.set(0, yawRef.current, 0);
          dir.applyEuler(euler);
          camera.position.addScaledVector(dir, MOVE_SPEED * delta);
          camera.position.x = Math.max(-80, Math.min(80, camera.position.x));
          camera.position.z = Math.max(-80, Math.min(80, camera.position.z));
          camera.position.y = 1.7;
        }
      }

      euler.set(pitchRef.current, yawRef.current, 0);
      camera.quaternion.setFromEuler(euler);
      checkZoneProximity(camera.position);

      const t = Date.now() * 0.001;
      for (let i = 0; i < flickerObjectsRef.current.length; i++) {
        const o = flickerObjectsRef.current[i];
        o.material.emissiveIntensity = o.baseIntensity + Math.sin(t * o.flickerSpeed + o.flickerOffset) * 0.18;
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

// ─── Material helpers ────────────────────────────────────────────────────────

function stdMat(params) {
  return new THREE.MeshStandardMaterial(params);
}

function addGlowSprite(scene, x, y, z, texture, size = 6) {
  const mat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.setScalar(size);
  sprite.position.set(x, y, z);
  scene.add(sprite);
}

function colorToGlowKey(color) {
  const map = { 0x00ffff: 'cyan', 0xff00ff: 'magenta', 0xffff00: 'yellow', 0x0088ff: 'blue', 0xff6600: 'orange', 0xffffff: 'white' };
  return map[color] || 'cyan';
}

function buildCity(scene, flickerObjects, gt) {
  // ── Ground — dark, slightly reflective wet asphalt ──────────────────────
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    stdMat({ color: 0x020508, roughness: 0.25, metalness: 0.6 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid overlay — subtle
  const grid = new THREE.GridHelper(200, 60, 0x00ffff, 0x001520);
  grid.material.opacity = 0.08;
  grid.material.transparent = true;
  scene.add(grid);

  // ── Roads ────────────────────────────────────────────────────────────────
  const roadMat = stdMat({ color: 0x04080f, roughness: 0.35, metalness: 0.5 });
  const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(200, 10), roadMat);
  hRoad.rotation.x = -Math.PI / 2; hRoad.position.y = 0.01; scene.add(hRoad);
  const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, 200), roadMat);
  vRoad.rotation.x = -Math.PI / 2; vRoad.position.y = 0.01; scene.add(vRoad);

  // Road dashes
  const dashMat = stdMat({ color: 0xcccc00, emissive: 0x888800, emissiveIntensity: 0.4, roughness: 0.8 });
  const dashGeo = new THREE.PlaneGeometry(2.5, 0.1);
  for (let i = -88; i <= 88; i += 10) {
    const dH = new THREE.Mesh(dashGeo, dashMat); dH.rotation.x = -Math.PI / 2; dH.position.set(i, 0.02, 0); scene.add(dH);
    const dV = new THREE.Mesh(dashGeo, dashMat); dV.rotation.x = -Math.PI / 2; dV.rotation.z = Math.PI / 2; dV.position.set(0, 0.02, i); scene.add(dV);
  }

  // ── Street lights — fewer, but proper ───────────────────────────────────
  const poleGeo = new THREE.CylinderGeometry(0.06, 0.06, 6, 6);
  const poleMat = stdMat({ color: 0x1a2a3a, roughness: 0.5, metalness: 0.9 });
  const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6);
  const headGeo = new THREE.SphereGeometry(0.18, 8, 6);

  for (let i = -45; i <= 45; i += 22) {
    addStreetLight(scene, i, 7, 0x00ffff, poleGeo, poleMat, armGeo, headGeo, flickerObjects);
    addStreetLight(scene, i, -7, 0xff00ff, poleGeo, poleMat, armGeo, headGeo, flickerObjects);
    addStreetLight(scene, 7, i, 0x00ffff, poleGeo, poleMat, armGeo, headGeo, flickerObjects);
    addStreetLight(scene, -7, i, 0xff00ff, poleGeo, poleMat, armGeo, headGeo, flickerObjects);
  }

  // ── Zone buildings ───────────────────────────────────────────────────────
  ZONES.forEach(zone => createZoneBuilding(scene, zone, flickerObjects, gt));

  // ── Background buildings ─────────────────────────────────────────────────
  const bgPositions = [
    [-30, -30], [30, -30], [-30, 30], [30, 30],
    [-50, 5], [50, -5], [5, -50], [-5, 50],
    [-40, -15], [40, 15], [-15, -40], [15, 40],
    [-35, 20], [35, -20],
  ];
  const neonColors = [0x00ffff, 0xff00ff, 0xffff00, 0x0088ff];
  bgPositions.forEach(([x, z], i) => {
    const h = 9 + (i * 3.7 % 18);
    const w = 5 + (i * 1.3 % 5);
    const nc = neonColors[i % 4];
    createDetailBuilding(scene, x, z, w, h, nc, flickerObjects, gt);
  });

  // ── Distant backdrop ─────────────────────────────────────────────────────
  for (let i = 0; i < 28; i++) {
    const angle = (i / 28) * Math.PI * 2;
    const dist = 76 + (i % 5) * 7;
    const h = 14 + (i % 8) * 6;
    const w = 5 + (i % 4) * 2;
    const nc = neonColors[i % 4];
    const bx = Math.cos(angle) * dist;
    const bz = Math.sin(angle) * dist;
    const geo = new THREE.BoxGeometry(w, h, w * 0.9);
    const mat = stdMat({ color: 0x010306, emissive: nc, emissiveIntensity: 0.12, roughness: 0.6, metalness: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(bx, h / 2, bz);
    scene.add(mesh);
    // Top beacon
    const beaconMat = stdMat({ color: nc, emissive: nc, emissiveIntensity: 1.2, roughness: 0.3 });
    const beacon = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.35, w * 0.9 + 0.1), beaconMat);
    beacon.position.set(bx, h + 0.17, bz);
    scene.add(beacon);
    // Glow halo on top
    const gKey = colorToGlowKey(nc);
    addGlowSprite(scene, bx, h + 2, bz, gt[gKey], 10 + (i % 4) * 3);
  }

  // ── Particles ─────────────────────────────────────────────────────────────
  const count = 350;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 140;
    pos[i * 3 + 1] = Math.random() * 28 + 3;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 140;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00ffff, size: 0.06, transparent: true, opacity: 0.55 })));
}

// ─── Zone building — detailed with ledges, windows, volumetric light ────────
function createZoneBuilding(scene, zone, flickerObjects, gt) {
  const [x, , z] = zone.position;
  const h = zone.buildingHeight || 15;
  const w = zone.buildingWidth || 8;
  const color = zone.color;

  // Main body
  const bodyMat = stdMat({ color: 0x060c18, roughness: 0.4, metalness: 0.85, envMapIntensity: 1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), bodyMat);
  body.position.set(x, h / 2, z);
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(body);

  // Mid ledge
  const ledge = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.8, 0.35, w + 0.8),
    stdMat({ color: 0x0a1422, roughness: 0.3, metalness: 0.9 })
  );
  ledge.position.set(x, h * 0.5, z);
  ledge.castShadow = true;
  scene.add(ledge);

  // Top ledge / crown
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(w + 1.2, 0.5, w + 1.2),
    stdMat({ color: 0x0a1422, roughness: 0.3, metalness: 0.9 })
  );
  crown.position.set(x, h + 0.25, z);
  crown.castShadow = true;
  scene.add(crown);

  // Neon vertical corner strips (4 corners)
  const stripMat = stdMat({ color, emissive: color, emissiveIntensity: 1.2, roughness: 0.1, metalness: 0.0 });
  [[-w/2, -w/2], [w/2, -w/2], [-w/2, w/2], [w/2, w/2]].forEach(([ox, oz]) => {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, h, 0.15),
      stripMat.clone()
    );
    strip.position.set(x + ox, h / 2, z + oz);
    scene.add(strip);
    flickerObjects.push({ material: strip.material, baseIntensity: 1.2, flickerSpeed: 0.6 + Math.random() * 0.8, flickerOffset: Math.random() * Math.PI * 2 });
  });

  // Horizontal neon bands (3 levels)
  [0.25, 0.5, 1.0].forEach(frac => {
    const bandMat = stdMat({ color, emissive: color, emissiveIntensity: 0.8, roughness: 0.1 });
    const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.12, w + 0.05), bandMat);
    band.position.set(x, h * frac, z);
    scene.add(band);
    flickerObjects.push({ material: bandMat, baseIntensity: 0.8, flickerSpeed: 0.3 + Math.random() * 0.5, flickerOffset: Math.random() * Math.PI * 2 });
  });

  // Emissive window grid (front face)
  const winColors = [color, 0xffffff, 0x88aaff];
  for (let floor = 1; floor < Math.floor(h / 2.5); floor++) {
    for (let col = 0; col < 3; col++) {
      if (Math.random() > 0.35) {
        const wc = winColors[Math.floor(Math.random() * 3)];
        const winMat = stdMat({ color: wc, emissive: wc, emissiveIntensity: 0.6 + Math.random() * 0.6, roughness: 0.5 });
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), winMat);
        win.position.set(x + (col - 1) * 2, floor * 2.5, z + w / 2 + 0.02);
        scene.add(win);
        flickerObjects.push({ material: winMat, baseIntensity: 0.6 + Math.random() * 0.4, flickerSpeed: 0.2 + Math.random() * 2, flickerOffset: Math.random() * Math.PI * 2 });
      }
    }
  }

  // Hologram platform
  const platMat = stdMat({ color, emissive: color, emissiveIntensity: 0.6, transparent: true, opacity: 0.55, roughness: 0.1 });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 1.5), platMat);
  platform.position.set(x, h + 1.2, z);
  scene.add(platform);

  // Light cone under hologram
  const coneGeo = new THREE.CylinderGeometry(0.05, w * 0.6, 4, 8, 1, true);
  const coneMat = stdMat({ color, emissive: color, emissiveIntensity: 0.15, transparent: true, opacity: 0.07, side: THREE.BackSide });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(x, h - 0.8, z);
  scene.add(cone);

  // Ground ring
  const ringMat = stdMat({ color, emissive: color, emissiveIntensity: 0.7, side: THREE.DoubleSide, transparent: true, opacity: 0.4, roughness: 0.1 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(zone.radius - 0.25, zone.radius, 64), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.04, z);
  scene.add(ring);
  flickerObjects.push({ material: ringMat, baseIntensity: 0.7, flickerSpeed: 0.4, flickerOffset: Math.random() * Math.PI * 2 });

  // Volumetric zone light (strong, colored)
  const zoneLight = new THREE.PointLight(color, 3.5, 28);
  zoneLight.position.set(x, h + 3, z);
  scene.add(zoneLight);

  // Ground-level color wash
  const groundLight = new THREE.PointLight(color, 1.2, 14);
  groundLight.position.set(x, 0.5, z);
  scene.add(groundLight);

  // Glow halos — large atmospheric bloom around building top
  if (gt) {
    const gKey = colorToGlowKey(color);
    addGlowSprite(scene, x, h + 4, z, gt[gKey], 22); // big halo
    addGlowSprite(scene, x, h + 1, z, gt[gKey], 10); // tighter core
    addGlowSprite(scene, x, 0.5, z, gt[gKey], 8);    // ground wash
  }
}

// ─── Background building with detail ────────────────────────────────────────
function createDetailBuilding(scene, x, z, w, h, nc, flickerObjects, gt) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, w * 0.9),
    stdMat({ color: 0x050810, roughness: 0.45, metalness: 0.75 })
  );
  body.position.set(x, h / 2, z);
  body.castShadow = true;
  body.receiveShadow = true;
  scene.add(body);

  // Top neon cap
  const capMat = stdMat({ color: nc, emissive: nc, emissiveIntensity: 1.0, roughness: 0.1 });
  const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.25, w * 0.9 + 0.2), capMat);
  cap.position.set(x, h + 0.12, z);
  scene.add(cap);
  flickerObjects.push({ material: capMat, baseIntensity: 1.0, flickerSpeed: 0.5 + Math.random(), flickerOffset: Math.random() * Math.PI * 2 });

  // A couple of windows
  for (let f = 1; f < Math.floor(h / 3); f++) {
    if (Math.random() > 0.5) {
      const wMat = stdMat({ color: nc, emissive: nc, emissiveIntensity: 0.5 + Math.random() * 0.5, roughness: 0.5 });
      const win = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), wMat);
      win.position.set(x + (Math.random() - 0.5) * (w - 1), f * 3, z + w * 0.45 + 0.02);
      scene.add(win);
      flickerObjects.push({ material: wMat, baseIntensity: 0.5 + Math.random() * 0.4, flickerSpeed: 0.3 + Math.random() * 2.5, flickerOffset: Math.random() * Math.PI * 2 });
    }
  }

  // Small rooftop light
  const rLight = new THREE.PointLight(nc, 0.8, 10);
  rLight.position.set(x, h + 1.5, z);
  scene.add(rLight);

  // Glow halo
  if (gt) {
    const gKey = colorToGlowKey(nc);
    addGlowSprite(scene, x, h + 2, z, gt[gKey], 8);
  }
}

// ─── Street light ────────────────────────────────────────────────────────────
function addStreetLight(scene, x, z, color, poleGeo, poleMat, armGeo, headGeo, flickerObjects) {
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, 3, z);
  pole.castShadow = true;
  scene.add(pole);

  // Arm
  const arm = new THREE.Mesh(armGeo, poleMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(x + 0.75, 6.1, z);
  scene.add(arm);

  // Bulb
  const bulbMat = stdMat({ color, emissive: color, emissiveIntensity: 2.0, roughness: 0.0, metalness: 0.0 });
  const bulb = new THREE.Mesh(headGeo, bulbMat);
  bulb.position.set(x + 1.3, 6.1, z);
  scene.add(bulb);
  flickerObjects.push({ material: bulbMat, baseIntensity: 2.0, flickerSpeed: 1.5 + Math.random() * 2, flickerOffset: Math.random() * Math.PI * 2 });

  // Cone of light downward
  const coneGeo = new THREE.CylinderGeometry(0.02, 2.5, 5, 8, 1, true);
  const coneMat = stdMat({ color, emissive: color, emissiveIntensity: 0.12, transparent: true, opacity: 0.06, side: THREE.BackSide });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(x + 1.3, 3.6, z);
  scene.add(cone);

  // Point light
  const light = new THREE.PointLight(color, 1.5, 14);
  light.position.set(x + 1.3, 6, z);
  scene.add(light);
}