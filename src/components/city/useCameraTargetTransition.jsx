import { useEffect } from 'react';
import * as THREE from 'three';

export default function useCameraTargetTransition({ cameraTarget, worksTransitionRef, yawRef, pitchRef, cameraRef }) {
  useEffect(() => {
    if (!cameraTarget) return;

    const currentCameraPosition = cameraRef?.current?.position;

    worksTransitionRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 1000,
      startPos: currentCameraPosition
        ? currentCameraPosition.clone()
        : new THREE.Vector3(0, 1.7, 20),
      targetPos: new THREE.Vector3(cameraTarget.position.x, cameraTarget.position.y, cameraTarget.position.z),
      startYaw: yawRef.current,
      targetYaw: cameraTarget.rotation,
      startPitch: pitchRef.current,
      targetPitch: -0.1,
      token: Math.random(),
    };
  }, [cameraTarget, worksTransitionRef, yawRef, pitchRef, cameraRef]);
}