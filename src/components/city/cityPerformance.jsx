import * as THREE from 'three';

export function detectQualityTier() {
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const pixelRatio = window.devicePixelRatio || 1;

  if (memory <= 2 || cores <= 4) {
    return 'low';
  }

  if (memory <= 4 || cores <= 6 || pixelRatio > 2) {
    return 'medium';
  }

  return 'high';
}

export function getPerformanceConfig(isMobile = false) {
  const tier = detectQualityTier();

  if (isMobile) {
    return {
      tier: 'mobile',
      pixelRatio: 1,
      videoScreens: 1,
      bloomStrength: 0.42,
      bloomRadius: 0.32,
      bloomThreshold: 0.9,
      enableHeavyAtmospherics: false,
      farBuildings: 8,
      reflections: 'basic',
      postProcessingQuality: 'medium',
      targetFps: 30,
    };
  }

  if (tier === 'low') {
    return {
      tier,
      pixelRatio: 0.9,
      videoScreens: 1,
      bloomStrength: 0.55,
      bloomRadius: 0.35,
      bloomThreshold: 0.88,
      enableHeavyAtmospherics: false,
      farBuildings: 10,
      reflections: 'basic',
      postProcessingQuality: 'medium',
      targetFps: 30,
    };
  }

  if (tier === 'medium') {
    return {
      tier,
      pixelRatio: 1,
      videoScreens: 4,
      bloomStrength: 1.15,
      bloomRadius: 0.38,
      bloomThreshold: 0.86,
      enableHeavyAtmospherics: false,
      farBuildings: 12,
      reflections: 'blurred',
      postProcessingQuality: 'high',
      targetFps: 45,
    };
  }

  return {
    tier,
    pixelRatio: 1.25,
    videoScreens: 6,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.85,
    enableHeavyAtmospherics: true,
    farBuildings: 16,
    reflections: 'blurred',
    postProcessingQuality: 'ultra',
    targetFps: 60,
  };
}

export function createSimpleBuildingLOD(width, height, depth, materials) {
  const lod = new THREE.LOD();

  const high = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 2, 4, 2), materials);
  const medium = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth, 1, 2, 1), materials);
  const low = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshBasicMaterial({ color: 0x16081f })
  );

  high.frustumCulled = true;
  medium.frustumCulled = true;
  low.frustumCulled = true;

  lod.addLevel(high, 0);
  lod.addLevel(medium, 38);
  lod.addLevel(low, 82);

  return lod;
}