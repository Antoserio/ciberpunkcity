import * as THREE from 'three';

export function detectQualityTier() {
  const memory = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const pixelRatio = window.devicePixelRatio || 1;

  if (memory <= 4 || cores <= 4 || pixelRatio > 2) {
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
      videoScreens: 2,
      bloomStrength: 0.42,
      enableHeavyAtmospherics: false,
    };
  }

  if (tier === 'medium') {
    return {
      tier,
      pixelRatio: 1,
      videoScreens: 3,
      bloomStrength: 0.5,
      enableHeavyAtmospherics: false,
    };
  }

  return {
    tier,
    pixelRatio: 1.25,
    videoScreens: 4,
    bloomStrength: 0.6,
    enableHeavyAtmospherics: true,
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