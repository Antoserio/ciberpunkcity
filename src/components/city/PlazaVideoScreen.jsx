import * as THREE from 'three';

export function addPlazaVideoScreen(scene, videoTexture) {
  if (!videoTexture) return null;

  const group = new THREE.Group();

  const width = 8.4;
  const height = 4.725;
  const x = -6.2;
  const y = 4.9;
  const z = -11.15;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.45, height + 0.45, 0.28),
    new THREE.MeshBasicMaterial({ color: 0x050008 })
  );
  frame.position.set(x, y, z);
  group.add(frame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide, toneMapped: false, color: 0xffffff })
  );
  screen.position.set(x, y, z + 0.16);
  group.add(screen);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 0.14, height + 0.14, 0.06)),
    new THREE.LineBasicMaterial({ color: 0x00ffff })
  );

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(width + 0.8, height + 0.8),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
  );
  glow.position.set(x, y, z + 0.02);
  group.add(glow);

  border.position.set(x, y, z + 0.12);
  group.add(border);

  scene.add(group);

  return {
    dispose() {
      scene.remove(group);
    },
  };
}