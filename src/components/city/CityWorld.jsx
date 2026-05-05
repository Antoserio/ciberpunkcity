import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { ZONES } from './cityData';

const MOVE_SPEED = 0.15;
const LOOK_SPEED = 0.002;
const COLLISION_RADIUS = 1.5;

export default function CityWorld({ onEnterZone, onExitZone }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const keysRef = useRef({});
  const yawRef = useRef(0);
  const pitchRef = useRef(-0.1);
  const isLockedRef = useRef(false);
  const animFrameRef = useRef(null);
  const buildingsRef = useRef([]);
  const activeZoneRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  const checkZoneProximity = useCallback((pos) => {
    for (const zone of ZONES) {
      const dx = pos.x - zone.position[0];
      const dz = pos.z - zone.position[2];
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < zone.radius) {
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
    scene.fog = new THREE.FogExp2(0x000510, 0.025);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 200);
    camera.position.set(0, 1.7, 10);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(0x001020, 0.5));
    const dirLight = new THREE.DirectionalLight(0x002244, 0.3);
    dirLight.position.set(10, 30, 10);
    scene.add(dirLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200, 50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050a15,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid overlay
    const gridHelper = new THREE.GridHelper(200, 80, 0x00ffff, 0x001a2a);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Build city
    buildCity(scene);

    // Pointer lock
    const handleClick = () => {
      if (!isLockedRef.current) {
        mount.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      isLockedRef.current = document.pointerLockElement === mount;
    };

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

    // Animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();

      if (isLockedRef.current) {
        const direction = new THREE.Vector3();
        const keys = keysRef.current;
        if (keys['KeyW'] || keys['ArrowUp']) direction.z -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) direction.z += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) direction.x -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) direction.x += 1;
        direction.normalize();

        const euler = new THREE.Euler(0, yawRef.current, 0, 'YXZ');
        const moveDir = direction.clone().applyEuler(euler);
        const newPos = camera.position.clone().add(moveDir.multiplyScalar(MOVE_SPEED));

        // Simple collision with bounds
        newPos.x = Math.max(-80, Math.min(80, newPos.x));
        newPos.z = Math.max(-80, Math.min(80, newPos.z));
        newPos.y = 1.7;
        camera.position.copy(newPos);
      }

      // Apply rotation
      const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);

      checkZoneProximity(camera.position);

      // Animate neon lights flicker
      const t = Date.now() * 0.001;
      scene.traverse((obj) => {
        if (obj.userData.neonFlicker && obj.material) {
          obj.material.emissiveIntensity = 0.8 + Math.sin(t * obj.userData.flickerSpeed + obj.userData.flickerOffset) * 0.2;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [checkZoneProximity]);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
}

function buildCity(scene) {
  // Street lights along main avenue
  for (let i = -60; i <= 60; i += 15) {
    createStreetLight(scene, i, 0, 8, 0x00ffff);
    createStreetLight(scene, i, 0, -8, 0xff00ff);
  }
  for (let i = -60; i <= 60; i += 15) {
    createStreetLight(scene, 8, 0, i, 0x00ffff);
    createStreetLight(scene, -8, 0, i, 0xff00ff);
  }

  // Zone buildings
  ZONES.forEach(zone => {
    createZoneBuilding(scene, zone);
  });

  // Generic background buildings
  const positions = [
    [-30, 0, -30], [30, 0, -30], [-30, 0, 30], [30, 0, 30],
    [-50, 0, 0], [50, 0, 0], [0, 0, -50], [0, 0, 50],
    [-40, 0, -15], [40, 0, -15], [-40, 0, 15], [40, 0, 15],
    [-15, 0, -40], [15, 0, -40], [-15, 0, 40], [15, 0, 40],
  ];
  positions.forEach(([x, y, z], i) => {
    const h = 8 + Math.random() * 20;
    const w = 4 + Math.random() * 6;
    const color = [0x001a2a, 0x0a0015, 0x000d1a, 0x0f000a][i % 4];
    const neonColor = [0x00ffff, 0xff00ff, 0xffff00, 0x0080ff][i % 4];
    createBuilding(scene, x, h, z, w, w * 0.8, h, color, neonColor);
  });

  // Road markings
  createRoads(scene);

  // Distant city backdrop
  createCityBackdrop(scene);

  // Particle stars
  createParticles(scene);
}

function createZoneBuilding(scene, zone) {
  const [x, y, z] = zone.position;
  const h = zone.buildingHeight || 15;
  const w = zone.buildingWidth || 8;

  // Main building
  const geo = new THREE.BoxGeometry(w, h, w);
  const mat = new THREE.MeshStandardMaterial({
    color: zone.darkColor || 0x050a15,
    emissive: zone.color,
    emissiveIntensity: 0.05,
    roughness: 0.3,
    metalness: 0.8,
  });
  const building = new THREE.Mesh(geo, mat);
  building.position.set(x, h / 2, z);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);

  // Neon trim on building edges
  createNeonTrim(scene, x, h, z, w, zone.color);

  // Holographic sign above building
  createHologramSign(scene, x, h + 2, z, zone.label, zone.color);

  // Ground ring indicator
  createGroundRing(scene, x, z, zone.radius, zone.color);

  // Point light for zone
  const light = new THREE.PointLight(zone.color, 2, 25);
  light.position.set(x, h + 3, z);
  scene.add(light);
}

function createBuilding(scene, x, h, z, w, d, height, color, neonColor) {
  const geo = new THREE.BoxGeometry(w, height, d);
  const mat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: neonColor,
    emissiveIntensity: 0.02,
    roughness: 0.4,
    metalness: 0.7,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, height / 2, z);
  mesh.castShadow = true;
  scene.add(mesh);

  // Window lights
  for (let floor = 1; floor < Math.floor(height / 3); floor++) {
    for (let side = 0; side < 3; side++) {
      if (Math.random() > 0.4) {
        const wGeo = new THREE.PlaneGeometry(0.6, 0.8);
        const wMat = new THREE.MeshStandardMaterial({
          color: neonColor,
          emissive: neonColor,
          emissiveIntensity: 0.5 + Math.random() * 0.5,
        });
        wMat.userData = { neonFlicker: true };
        const window = new THREE.Mesh(wGeo, wMat);
        window.userData.neonFlicker = true;
        window.userData.flickerSpeed = 1 + Math.random() * 3;
        window.userData.flickerOffset = Math.random() * Math.PI * 2;
        window.position.set(
          x + (Math.random() - 0.5) * (w - 1),
          floor * 3,
          z + d / 2 + 0.01
        );
        scene.add(window);
      }
    }
  }
}

function createNeonTrim(scene, x, h, z, w, color) {
  const positions = [
    [x, h, z - w / 2], [x, h, z + w / 2],
    [x - w / 2, h, z], [x + w / 2, h, z],
    [x, 2, z - w / 2], [x, 2, z + w / 2],
  ];
  positions.forEach(([px, py, pz]) => {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1.5,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    scene.add(mesh);
  });

  // Vertical neon strips
  [-w / 2, w / 2].forEach(offset => {
    const geo = new THREE.BoxGeometry(0.08, h, 0.08);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 1,
    });
    mat.userData = { neonFlicker: true };
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.neonFlicker = true;
    mesh.userData.flickerSpeed = 0.5 + Math.random();
    mesh.userData.flickerOffset = Math.random() * Math.PI * 2;
    mesh.position.set(x + offset, h / 2, z);
    scene.add(mesh);
  });
}

function createHologramSign(scene, x, y, z, text, color) {
  // Floating platform
  const platGeo = new THREE.BoxGeometry(6, 0.1, 1.5);
  const platMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.6,
  });
  const platform = new THREE.Mesh(platGeo, platMat);
  platform.position.set(x, y, z);
  scene.add(platform);

  // Light beam from sign
  const beamGeo = new THREE.CylinderGeometry(0.05, 2, 3, 8);
  const beamMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.15,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(x, y - 1.5, z);
  scene.add(beam);
}

function createGroundRing(scene, x, z, radius, color) {
  const segments = 64;
  const ringGeo = new THREE.RingGeometry(radius - 0.2, radius, segments);
  const ringMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.05, z);
  scene.add(ring);
}

function createStreetLight(scene, x, y, z, color) {
  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 5, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x112233, metalness: 0.9, roughness: 0.2 });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.set(x, 2.5, z);
  scene.add(pole);

  // Light head
  const headGeo = new THREE.BoxGeometry(0.3, 0.15, 0.3);
  const headMat = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 1.5,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.userData.neonFlicker = true;
  head.userData.flickerSpeed = 2 + Math.random();
  head.userData.flickerOffset = Math.random() * Math.PI * 2;
  head.position.set(x, 5.1, z);
  scene.add(head);

  // Point light
  const light = new THREE.PointLight(color, 0.8, 12);
  light.position.set(x, 5, z);
  scene.add(light);
}

function createRoads(scene) {
  // Main cross roads
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x080c14,
    roughness: 0.9,
    metalness: 0.1,
  });

  // Horizontal road
  const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(200, 10), roadMat);
  hRoad.rotation.x = -Math.PI / 2;
  hRoad.position.set(0, 0.01, 0);
  scene.add(hRoad);

  // Vertical road
  const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(10, 200), roadMat);
  vRoad.rotation.x = -Math.PI / 2;
  vRoad.position.set(0, 0.01, 0);
  scene.add(vRoad);

  // Road center lines
  for (let i = -90; i <= 90; i += 8) {
    const lineGeo = new THREE.PlaneGeometry(3, 0.15);
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.3,
    });
    const lineH = new THREE.Mesh(lineGeo, lineMat);
    lineH.rotation.x = -Math.PI / 2;
    lineH.position.set(i, 0.02, 0);
    scene.add(lineH);

    const lineV = new THREE.Mesh(lineGeo.clone(), lineMat.clone());
    lineV.rotation.x = -Math.PI / 2;
    lineV.rotation.z = Math.PI / 2;
    lineV.position.set(0, 0.02, i);
    scene.add(lineV);
  }
}

function createCityBackdrop(scene) {
  // Distant skyscrapers silhouette
  const angles = Array.from({ length: 40 }, (_, i) => (i / 40) * Math.PI * 2);
  angles.forEach(angle => {
    const dist = 75 + Math.random() * 20;
    const h = 15 + Math.random() * 40;
    const w = 3 + Math.random() * 8;
    const x = Math.cos(angle) * dist;
    const z = Math.sin(angle) * dist;
    const colors = [0x00ffff, 0xff00ff, 0x0080ff, 0xffff00];
    const neonColor = colors[Math.floor(Math.random() * colors.length)];
    const geo = new THREE.BoxGeometry(w, h, w);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x020508,
      emissive: neonColor,
      emissiveIntensity: 0.03,
      roughness: 0.5,
      metalness: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    scene.add(mesh);

    // Top light
    const topLight = new THREE.PointLight(neonColor, 0.5, 15);
    topLight.position.set(x, h + 1, z);
    scene.add(topLight);
  });
}

function createParticles(scene) {
  const count = 500;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 150;
    positions[i * 3 + 1] = Math.random() * 30 + 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
  });
  scene.add(new THREE.Points(geo, mat));
}