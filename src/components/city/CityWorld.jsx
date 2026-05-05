import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { ZONES } from './cityData';

const MOVE_SPEED = 8; // units per second (delta-time based)
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
  const flickerObjectsRef = useRef([]); // track flicker objects directly

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
    scene.fog = new THREE.FogExp2(0x000510, 0.022);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 150);
    camera.position.set(0, 1.7, 10);

    // Renderer — no shadows, lower pixel ratio cap
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    mount.appendChild(renderer.domElement);

    // Lighting — minimal
    scene.add(new THREE.AmbientLight(0x112233, 1.2));

    // Ground — flat, no subdivisions
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({ color: 0x050a15 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Grid overlay
    const grid = new THREE.GridHelper(200, 60, 0x00ffff, 0x001a2a);
    grid.material.opacity = 0.12;
    grid.material.transparent = true;
    scene.add(grid);

    // Build city and collect flicker objects
    buildCity(scene, flickerObjectsRef.current);

    // Pointer lock
    const handleClick = () => { if (!isLockedRef.current) mount.requestPointerLock(); };
    const handlePointerLockChange = () => { isLockedRef.current = document.pointerLockElement === mount; };
    const handleMouseMove = (e) => {
      if (!isLockedRef.current) return;
      yawRef.current -= e.movementX * LOOK_SPEED;
      pitchRef.current -= e.movementY * LOOK_SPEED;
      pitchRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 6, pitchRef.current));
    };
    const handleKeyDown = (e) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e) => { keysRef.current[e.code] = false; };

    mount.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    const dir = new THREE.Vector3();
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');

    // Animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clockRef.current.getDelta(), 0.05);

      if (isLockedRef.current) {
        dir.set(0, 0, 0);
        const keys = keysRef.current;
        if (keys['KeyW'] || keys['ArrowUp']) dir.z -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) dir.z += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) dir.x -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) dir.x += 1;

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

      // Flicker — direct array iteration, no traverse
      const t = Date.now() * 0.001;
      for (let i = 0; i < flickerObjectsRef.current.length; i++) {
        const o = flickerObjectsRef.current[i];
        o.material.emissiveIntensity = o.baseIntensity + Math.sin(t * o.flickerSpeed + o.flickerOffset) * 0.15;
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
      mount.removeEventListener('click', handleClick);
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

// ─── Shared materials (reused across objects) ───────────────────────────────
const sharedMats = {};
function getSharedMat(key, factory) {
  if (!sharedMats[key]) sharedMats[key] = factory();
  return sharedMats[key];
}

function buildCity(scene, flickerObjects) {
  // Street lights — reduced count, shared geometry
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 5, 5);
  const poleMat = new THREE.MeshBasicMaterial({ color: 0x112233 });
  const headGeo = new THREE.BoxGeometry(0.3, 0.15, 0.3);

  for (let i = -45; i <= 45; i += 20) {
    addStreetLight(scene, i, 8, 0x00ffff, poleGeo, poleMat, headGeo, flickerObjects);
    addStreetLight(scene, i, -8, 0xff00ff, poleGeo, poleMat, headGeo, flickerObjects);
    addStreetLight(scene, 8, i, 0x00ffff, poleGeo, poleMat, headGeo, flickerObjects);
    addStreetLight(scene, -8, i, 0xff00ff, poleGeo, poleMat, headGeo, flickerObjects);
  }

  // Zone buildings
  ZONES.forEach(zone => createZoneBuilding(scene, zone, flickerObjects));

  // Background buildings — reduced count, MeshBasicMaterial
  const bgPositions = [
    [-30, -30], [30, -30], [-30, 30], [30, 30],
    [-50, 0], [50, 0], [0, -50], [0, 50],
    [-40, -15], [40, 15], [-15, -40], [15, 40],
  ];
  const neonColors = [0x00ffff, 0xff00ff, 0xffff00, 0x0080ff];
  bgPositions.forEach(([x, z], i) => {
    const h = 8 + (i * 3.7 % 18);
    const w = 4 + (i * 1.3 % 5);
    const neonColor = neonColors[i % 4];
    const geo = new THREE.BoxGeometry(w, h, w * 0.85);
    const mat = new THREE.MeshBasicMaterial({ color: 0x020508 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    scene.add(mesh);

    // Single emissive top stripe per building instead of many windows
    const topGeo = new THREE.BoxGeometry(w + 0.1, 0.2, w * 0.85 + 0.1);
    const topMat = new THREE.MeshBasicMaterial({ color: neonColor });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(x, h + 0.1, z);
    scene.add(top);
  });

  // Roads — shared material
  const roadMat = new THREE.MeshBasicMaterial({ color: 0x060a10 });
  const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(200, 10), roadMat);
  hRoad.rotation.x = -Math.PI / 2;
  hRoad.position.y = 0.01;
  scene.add(hRoad);
  const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, 200), roadMat);
  vRoad.rotation.x = -Math.PI / 2;
  vRoad.position.y = 0.01;
  scene.add(vRoad);

  // Road dashes — merged into fewer objects
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xaaaa00 });
  const dashGeo = new THREE.PlaneGeometry(3, 0.12);
  for (let i = -88; i <= 88; i += 10) {
    const dH = new THREE.Mesh(dashGeo, dashMat);
    dH.rotation.x = -Math.PI / 2;
    dH.position.set(i, 0.02, 0);
    scene.add(dH);
    const dV = new THREE.Mesh(dashGeo, dashMat);
    dV.rotation.x = -Math.PI / 2;
    dV.rotation.z = Math.PI / 2;
    dV.position.set(0, 0.02, i);
    scene.add(dV);
  }

  // Backdrop — fewer buildings, no PointLights
  const backdropColors = [0x00ffff, 0xff00ff, 0x0080ff, 0xffff00];
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const dist = 78 + (i % 5) * 6;
    const h = 12 + (i % 8) * 5;
    const w = 4 + (i % 4) * 2;
    const nc = backdropColors[i % 4];
    const geo = new THREE.BoxGeometry(w, h, w);
    const mat = new THREE.MeshBasicMaterial({ color: nc, wireframe: false });
    // Very dark tint
    const darkMat = new THREE.MeshBasicMaterial({ color: 0x010204 });
    const mesh = new THREE.Mesh(geo, darkMat);
    mesh.position.set(Math.cos(angle) * dist, h / 2, Math.sin(angle) * dist);
    scene.add(mesh);
  }

  // Particles
  const count = 300;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 140;
    positions[i * 3 + 1] = Math.random() * 25 + 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 140;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x00ffff, size: 0.07, transparent: true, opacity: 0.5 })));
}

function createZoneBuilding(scene, zone, flickerObjects) {
  const [x, , z] = zone.position;
  const h = zone.buildingHeight || 15;
  const w = zone.buildingWidth || 8;

  // Main building — MeshBasicMaterial, no shadows
  const mat = new THREE.MeshBasicMaterial({ color: zone.darkColor || 0x050a15 });
  const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat);
  building.position.set(x, h / 2, z);
  scene.add(building);

  // Neon vertical strips (2 only, emissive)
  const stripMat = new THREE.MeshStandardMaterial({ color: zone.color, emissive: zone.color, emissiveIntensity: 0.9 });
  [-w / 2, w / 2].forEach(offset => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, 0.12), stripMat.clone());
    strip.position.set(x + offset, h / 2, z);
    scene.add(strip);
    flickerObjects.push({ material: strip.material, baseIntensity: 0.9, flickerSpeed: 0.8 + Math.random(), flickerOffset: Math.random() * Math.PI * 2 });
  });

  // Hologram platform
  const platMat = new THREE.MeshBasicMaterial({ color: zone.color, transparent: true, opacity: 0.5 });
  const platform = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 1.5), platMat);
  platform.position.set(x, h + 1, z);
  scene.add(platform);

  // Ground ring
  const ringMat = new THREE.MeshBasicMaterial({ color: zone.color, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(zone.radius - 0.2, zone.radius, 48), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.05, z);
  scene.add(ring);

  // Single zone point light (keep these — only 5 total)
  const light = new THREE.PointLight(zone.color, 1.5, 20);
  light.position.set(x, h + 2, z);
  scene.add(light);
}

function addStreetLight(scene, x, z, color, poleGeo, poleMat, headGeo, flickerObjects) {
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, 2.5, z);
  scene.add(pole);

  const headMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2 });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(x, 5.1, z);
  scene.add(head);
  flickerObjects.push({ material: headMat, baseIntensity: 1.2, flickerSpeed: 1.5 + Math.random() * 2, flickerOffset: Math.random() * Math.PI * 2 });
}