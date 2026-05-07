import * as THREE from 'three';

export function createPlazaVideoBuilding(scene, videoTexture) {
  const group = new THREE.Group();
  group.position.set(-7.5, 0, 8);

  const bodyMaterials = [
    new THREE.MeshStandardMaterial({ color: 0x12051f, roughness: 0.35, metalness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x12051f, roughness: 0.35, metalness: 0.85 }),
    new THREE.MeshStandardMaterial({ color: 0x09030f, roughness: 0.4, metalness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0x09030f, roughness: 0.4, metalness: 0.95 }),
    new THREE.MeshStandardMaterial({ color: 0x180622, roughness: 0.3, metalness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x180622, roughness: 0.3, metalness: 0.9 }),
  ];

  const body = new THREE.Mesh(new THREE.BoxGeometry(7, 14, 6), bodyMaterials);
  body.position.set(0, 7, 0);
  group.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 0.22, 6.4),
    new THREE.MeshStandardMaterial({ color: 0xff00ff, emissive: 0xff00ff, emissiveIntensity: 0.85, roughness: 0.15, metalness: 0.2 })
  );
  roof.position.set(0, 14.15, 0);
  group.add(roof);

  const sideStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 11.5, 0.14),
    new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 0.75, roughness: 0.1, metalness: 0.1 })
  );
  sideStrip.position.set(3.58, 7.1, 2.9);
  group.add(sideStrip);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(5.9, 8.2, 0.22),
    new THREE.MeshBasicMaterial({ color: 0x050008 })
  );
  frame.position.set(0, 8.1, 3.06);
  group.add(frame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(5.4, 7.7),
    new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.FrontSide })
  );
  screen.position.set(0, 8.1, 3.19);
  group.add(screen);

  const border = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(5.55, 7.85, 0.06)),
    new THREE.LineBasicMaterial({ color: 0xff44cc })
  );
  border.position.set(0, 8.1, 3.16);
  group.add(border);

  scene.add(group);

  return {
    dispose() {
      scene.remove(group);
    },
  };
}