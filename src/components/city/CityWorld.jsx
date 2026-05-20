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
import { initializeTheatreStudio, getTheatreSheet, createEditableCamera } from './theatreConfig';
import { cyberPostFragmentShader, cyberPostVertexShader, createCyberPostUniforms } from './postprocessing/cyberPostShaders';
import { createPostProcessingState, getAdaptivePostProcessingState } from './postprocessing/postProcessingConfig';
import { makeGlowTexture, makeVideoCanvasTexture, makeBuildingWallTexture, makeNeonSignTexture } from './textureGenerator';
import { buildCityScene, makeWorksCarouselScreen } from './buildingGenerator';
import { applyCameraRotation, clampCameraPosition, LOOK_SPEED, MAX_PITCH, updateCameraMovement, updateWorksCameraTransition } from './cameraController';

const CITY_VIDEO_SOURCES = [
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
];

const CITY_VIDEO_SCREEN_CONFIGS = [
  { x: -30, y: 10.5, z: -25.4, width: 7.2, height: 4.05, rotationY: 0, frameColor: 0x00ffff, glowColor: 0x00ffff, sourceIndex: 0 },
  { x: 30, y: 11.5, z: -25.4, width: 7.2, height: 4.05, rotationY: 0, frameColor: 0xff00ff, glowColor: 0xff00ff, sourceIndex: 1 },
  { x: -34.2, y: 9.5, z: 18, width: 5.8, height: 3.25, rotationY: Math.PI / 2, frameColor: 0xffff00, glowColor: 0xffff00, sourceIndex: 2 },
  { x: 34.2, y: 9.5, z: 18, width: 5.8, height: 3.25, rotationY: -Math.PI / 2, frameColor: 0x4488ff, glowColor: 0x4488ff, sourceIndex: 3 },
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


const MOVE_SPEED = 11;
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
  const videoScreenRef = useRef(null);
  const extraCanvasesRef = useRef([]);
  const modalOpenRef = useRef(false);
  const touchStateRef = useRef({ moving: false, looking: false, moveId: null, lookId: null, moveStartX: 0, moveStartY: 0, moveX: 0, moveY: 0 });
  const mobileMovementRef = useRef({ x: 0, z: 0 });
  const cameraRef = useRef(null);
  const [theatreReady, setTheatreReady] = useState(() => !import.meta.env.DEV);
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

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    initializeTheatreStudio().then(() => {
      setTheatreReady(true);
    });
  }, []);

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
    const fogColor = new THREE.Color(0x1a0530);
    scene.fog = new THREE.FogExp2(0x1a0530, 0.025);
    scene.background = fogColor;

    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 180);
    const theatreSheet = getTheatreSheet();
    const editableCamera = createEditableCamera(theatreSheet, camera);
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
    renderer.toneMappingExposure = 0.6;
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
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(W, H), performanceConfig.bloomStrength, 0.45, 0.75);
    composer.addPass(bloomPass);

    const cyberPostPass = new ShaderPass({
      uniforms: createCyberPostUniforms(),
      vertexShader: cyberPostVertexShader,
      fragmentShader: cyberPostFragmentShader,
    });
    cyberPostPass.uniforms.uResolution.value.set(W, H);
    composer.addPass(cyberPostPass);

    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms.resolution.value.set(1 / W, 1 / H);
    composer.addPass(fxaaPass);

    postFxStateRef.current = getAdaptivePostProcessingState(postProcessingSettings || createPostProcessingState({ tier: isMobile ? 'mobile' : 'high' }), 60);

    scene.add(new THREE.AmbientLight(0x3a2a68, 3.2));
    scene.add(new THREE.HemisphereLight(0x66ccff, 0x12051f, 1.0));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3);
    keyLight.position.set(24, 30, 14);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0xff44cc, 8, 120, 2);
    fillLight.position.set(0, 22, 0);
    scene.add(fillLight);
    const cyanWash = new THREE.PointLight(0x00e5ff, 4, 90, 2);
    cyanWash.position.set(-24, 14, -8);
    scene.add(cyanWash);
    const magentaWash = new THREE.PointLight(0xff00c8, 4.5, 100, 2);
    magentaWash.position.set(24, 16, 6);
    scene.add(magentaWash);
    const violetWash = new THREE.PointLight(0x7c3aed, 4, 80, 2);
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

      updateWorksCameraTransition(camera, worksTransitionRef, yawRef, pitchRef, targetYawRef, targetPitchRef);

      const k = keysRef.current;
      const mobileMovement = mobileMovementRef.current;
      const moving = updateCameraMovement({
        camera,
        dir,
        keys: k,
        mobileMovement,
        isMobileDevice,
        activeView,
        worksTransitionRef,
        delta,
      });

      applyCameraRotation(camera, yawRef, pitchRef, targetYawRef, targetPitchRef);
      clampCameraPosition(camera);
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

      if (postFxStateRef.current) {
        cyberPostPass.enabled = postFxStateRef.current.chromaticAberration || postFxStateRef.current.filmGrain || postFxStateRef.current.colorGrading;
        fxaaPass.enabled = !!postFxStateRef.current.fxaa;
        bloomPass.strength = postFxStateRef.current.bloom ? performanceConfig.bloomStrength : 0;
        cyberPostPass.uniforms.uTime.value = frameCount * 0.016;
        cyberPostPass.uniforms.uArcadePulse.value = arcadeFocusPulse;
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
      cyberPostPass.uniforms.uResolution.value.set(mount.clientWidth, mount.clientHeight);
      fxaaPass.material.uniforms.resolution.value.set(1 / mount.clientWidth, 1 / mount.clientHeight);
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
      editableCamera?.unsubscribe?.();
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

function buildCity(scene, flicker, gt, videoTex, worksTex, vikyTex, onOpenViky, worksCarousel, farBuildingLimit = 16) {
  buildCityScene({ scene, flicker, gt, videoTex, worksCarousel, farBuildingLimit });

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

  return [];
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

function createArcadeMachine(scene, stand, gt) {
  const [x, , z] = stand.position;
  const body = new THREE.Group();
  const textureLoader = new THREE.TextureLoader();

  const cabinetBlack = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.62, metalness: 0.18 });
  const cabinetDark = new THREE.MeshStandardMaterial({ color: 0x0e0e12, roughness: 0.54, metalness: 0.14 });
  const metalPanel = new THREE.MeshStandardMaterial({ color: 0x707886, roughness: 0.38, metalness: 0.82 });
  const marqueeShell = new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.44, metalness: 0.3 });

  const sideArtTexture = textureLoader.load('https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/87b366af2__Burnt_U.jpg');
  const marqueeTexture = textureLoader.load('https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/6fe794235_image.png');
  const bezelTexture = textureLoader.load('https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/15ddba126_0119_Ros.jpg');

  sideArtTexture.colorSpace = THREE.SRGBColorSpace;
  sideArtTexture.wrapS = THREE.ClampToEdgeWrapping;
  sideArtTexture.wrapT = THREE.ClampToEdgeWrapping;
  sideArtTexture.offset.set(0, 0);
  sideArtTexture.repeat.set(1, 1);

  [marqueeTexture, bezelTexture].forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
  });

  const sideArtMaterial = new THREE.MeshBasicMaterial({ map: sideArtTexture, toneMapped: false, side: THREE.FrontSide, transparent: true, alphaTest: 0.15, color: 0xffffff });
  const marqueeMaterial = new THREE.MeshBasicMaterial({ map: marqueeTexture, toneMapped: false });
  const bezelMaterial = new THREE.MeshBasicMaterial({ map: bezelTexture, toneMapped: false });

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.55, 2.4, 1.55),
    [cabinetBlack, cabinetBlack, cabinetDark, cabinetDark, cabinetBlack, cabinetBlack]
  );
  base.position.set(0, 1.2, 0);
  body.add(base);

  const lowerFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.88, 0.1),
    metalPanel
  );
  lowerFront.position.set(0, 0.78, 0.83);
  body.add(lowerFront);

  const coinDoorLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.34), new THREE.MeshBasicMaterial({ color: 0x2c3138 }));
  coinDoorLeft.position.set(-0.11, 0.8, 0.885);
  body.add(coinDoorLeft);
  const coinDoorRight = coinDoorLeft.clone();
  coinDoorRight.position.x = 0.11;
  body.add(coinDoorRight);

  const controlDeck = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.16, 0.86),
    cabinetBlack
  );
  controlDeck.position.set(0, 2.08, 0.42);
  controlDeck.rotation.x = -0.28;
  body.add(controlDeck);

  const controlDeckFront = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.62, 0.08),
    cabinetBlack
  );
  controlDeckFront.position.set(0, 1.82, 0.76);
  controlDeckFront.rotation.x = 0.42;
  body.add(controlDeckFront);

  const monitorCabinet = new THREE.Mesh(
    new THREE.BoxGeometry(1.36, 1.78, 1.12),
    [cabinetBlack, cabinetBlack, cabinetDark, cabinetDark, cabinetBlack, cabinetBlack]
  );
  monitorCabinet.position.set(0, 3.14, -0.02);
  body.add(monitorCabinet);

  const marqueeTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.44, 0.62),
    marqueeShell
  );
  marqueeTop.position.set(0, 4.35, 0.1);
  body.add(marqueeTop);

  const marqueeFront = new THREE.Mesh(
    new THREE.PlaneGeometry(1.34, 0.32),
    marqueeMaterial
  );
  marqueeFront.position.set(0, 4.35, 0.42);
  body.add(marqueeFront);

  const leftSideShape = new THREE.Shape();
  leftSideShape.moveTo(-0.78, 0);
  leftSideShape.lineTo(0.78, 0);
  leftSideShape.lineTo(0.78, 1.4);
  leftSideShape.lineTo(0.42, 2.1);
  leftSideShape.lineTo(0.28, 3.12);
  leftSideShape.lineTo(0.12, 3.95);
  leftSideShape.lineTo(-0.18, 4.55);
  leftSideShape.lineTo(-0.78, 4.55);
  leftSideShape.lineTo(-0.78, 0);

  const sideGeometry = new THREE.ShapeGeometry(leftSideShape);
  sideGeometry.computeBoundingBox();
  const sideBounds = sideGeometry.boundingBox;
  const sideSizeX = sideBounds.max.x - sideBounds.min.x;
  const sideSizeY = sideBounds.max.y - sideBounds.min.y;
  const sideUv = sideGeometry.attributes.uv;
  for (let i = 0; i < sideUv.count; i++) {
    const x = sideGeometry.attributes.position.getX(i);
    const y = sideGeometry.attributes.position.getY(i);
    sideUv.setXY(i, (x - sideBounds.min.x) / sideSizeX, (y - sideBounds.min.y) / sideSizeY);
  }
  sideUv.needsUpdate = true;
  const leftArt = new THREE.Mesh(sideGeometry, sideArtMaterial);
  leftArt.position.set(-0.79, 0, 0);
  leftArt.rotation.y = Math.PI / 2;
  body.add(leftArt);

  const rightArt = new THREE.Mesh(sideGeometry, sideArtMaterial);
  rightArt.position.set(0.79, 0, 0);
  rightArt.rotation.y = -Math.PI / 2;
  body.add(rightArt);

  const leftSideBorder = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.78, 0, 0),
      new THREE.Vector3(0.78, 0, 0),
      new THREE.Vector3(0.78, 1.4, 0),
      new THREE.Vector3(0.42, 2.1, 0),
      new THREE.Vector3(0.28, 3.12, 0),
      new THREE.Vector3(0.12, 3.95, 0),
      new THREE.Vector3(-0.18, 4.55, 0),
      new THREE.Vector3(-0.78, 4.55, 0),
      new THREE.Vector3(-0.78, 0, 0),
    ]),
    new THREE.LineBasicMaterial({ color: 0x050505 })
  );
  leftSideBorder.position.set(-0.795, 0, 0);
  leftSideBorder.rotation.y = Math.PI / 2;
  body.add(leftSideBorder);

  const rightSideBorder = leftSideBorder.clone();
  rightSideBorder.position.x = 0.795;
  rightSideBorder.rotation.y = -Math.PI / 2;
  body.add(rightSideBorder);

  const screenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(1.08, 1.18, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x06070a })
  );
  screenFrame.position.set(0, 3.18, 0.55);
  screenFrame.rotation.x = -0.22;
  body.add(screenFrame);

  const bezel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.98, 1.08),
    bezelMaterial
  );
  bezel.position.set(0, 3.18, 0.595);
  bezel.rotation.x = -0.22;
  body.add(bezel);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.72, 0.82),
    new THREE.MeshBasicMaterial({ color: 0x080b10, side: THREE.DoubleSide })
  );
  screen.position.set(0, 3.18, 0.605);
  screen.rotation.x = -0.22;
  body.add(screen);

  const buttonColors = [0xff4f9a, 0x52d9ff, 0xffb400, 0xf4f7ff];
  buttonColors.forEach((color, index) => {
    const button = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.065, 24),
      new THREE.MeshBasicMaterial({ color })
    );
    button.rotation.x = Math.PI / 2;
    button.position.set(-0.22 + index * 0.16, 2.13, 0.76);
    body.add(button);
  });

  const joystickBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.22, 16),
    new THREE.MeshBasicMaterial({ color: 0xd9dbe2 })
  );
  joystickBase.position.set(-0.45, 2.16, 0.68);
  body.add(joystickBase);

  const joystickBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff3b3b })
  );
  joystickBall.position.set(-0.45, 2.29, 0.72);
  body.add(joystickBall);

  const marqueeGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 0.36),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  marqueeGlow.position.set(0, 4.35, 0.44);
  body.add(marqueeGlow);

  body.position.set(x, 0, z);
  body.rotation.y = -2.3;
  body.scale.setScalar(1.08);

  const glowKey = colorToGlowKey(stand.colorInt || 0x00ffff);
  addGlowSprite(scene, x, 3.7, z + 0.8, gt[glowKey], 5.8);
  addGlowSprite(scene, x, 2.3, z + 0.9, gt[glowKey], 3.8);

  scene.add(body);
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