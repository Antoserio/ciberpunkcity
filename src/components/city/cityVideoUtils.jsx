import * as THREE from 'three';

export function createCityVideoElement(src) {
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

export function createCityVideoScreen(scene, config, texture) {
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

export function syncCityVideos(cityVideos, camera) {
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