import * as THREE from 'three';

export const LOOK_SPEED = 0.0024;
export const LOOK_SMOOTH = 0.22;
export const MAX_PITCH = Math.PI / 2 - 0.02;

export function applyCameraRotation(camera, yawRef, pitchRef, targetYawRef, targetPitchRef) {
  yawRef.current += (targetYawRef.current - yawRef.current) * LOOK_SMOOTH;
  pitchRef.current += (targetPitchRef.current - pitchRef.current) * LOOK_SMOOTH;
  pitchRef.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitchRef.current));
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yawRef.current;
  camera.rotation.x = pitchRef.current;
}

export function updateWorksCameraTransition(camera, worksTransitionRef, yawRef, pitchRef, targetYawRef, targetPitchRef) {
  const worksTransition = worksTransitionRef.current;
  if (!worksTransition.active || !worksTransition.startPos || !worksTransition.targetPos) return;

  const elapsed = performance.now() - worksTransition.startTime;
  const progress = Math.min(elapsed / worksTransition.duration, 1);
  const eased = 1 - Math.pow(1 - progress, 3);

  camera.position.lerpVectors(worksTransition.startPos, worksTransition.targetPos, eased);
  yawRef.current = worksTransition.startYaw + (worksTransition.targetYaw - worksTransition.startYaw) * eased;
  pitchRef.current = worksTransition.startPitch + (worksTransition.targetPitch - worksTransition.startPitch) * eased;
  targetYawRef.current = yawRef.current;
  targetPitchRef.current = pitchRef.current;

  if (progress >= 1) {
    worksTransition.active = false;
    camera.position.copy(worksTransition.targetPos);
    yawRef.current = worksTransition.targetYaw;
    pitchRef.current = worksTransition.targetPitch;
    targetYawRef.current = worksTransition.targetYaw;
    targetPitchRef.current = worksTransition.targetPitch;
  }
}

export function updateCameraMovement({ camera, dir, keys, mobileMovement, isMobileDevice, activeView, worksTransitionRef, delta }) {
  const moving = activeView === 'explore' && (
    keys['KeyW'] || keys['KeyS'] || keys['KeyA'] || keys['KeyD'] || keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'] ||
    (isMobileDevice && (Math.abs(mobileMovement.x) > 0.1 || Math.abs(mobileMovement.z) > 0.1))
  );

  if (moving && !worksTransitionRef.current.active) {
    dir.set(0, 0, 0);

    if (keys['KeyW'] || keys['ArrowUp']) dir.z = -1;
    if (keys['KeyS'] || keys['ArrowDown']) dir.z = 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dir.x = -1;
    if (keys['KeyD'] || keys['ArrowRight']) dir.x = 1;

    if (isMobileDevice && (Math.abs(mobileMovement.x) > 0.1 || Math.abs(mobileMovement.z) > 0.1)) {
      dir.x = mobileMovement.x;
      dir.z = mobileMovement.z * -1;
    }

    if (dir.lengthSq() > 0) {
      dir.normalize();
      dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.rotation.y);
      camera.position.addScaledVector(dir, 15 * delta);
      camera.position.y = 1.7;
    }
  }

  return moving;
}

export function clampCameraPosition(camera) {
  camera.position.x = Math.max(-70, Math.min(70, camera.position.x));
  camera.position.z = Math.max(-70, Math.min(70, camera.position.z));
}