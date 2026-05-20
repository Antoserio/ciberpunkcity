import { getProject, types } from '@theatre/core';

let theatreStudioModulePromise = null;
let theatreStudio = null;
let theatreStudioInitialized = false;
let theatreProject = null;
let theatreSheet = null;
let theatreCameraObject = null;
let theatreCameraUnsubscribe = null;

const cameraConfig = {
  position: types.compound({
    x: types.number(15, { range: [-120, 120] }),
    y: types.number(1.7, { range: [0, 120] }),
    z: types.number(15, { range: [-120, 120] }),
  }),
  rotation: types.compound({
    x: types.number(-0.1, { range: [-Math.PI, Math.PI] }),
    y: types.number(2.4, { range: [-Math.PI, Math.PI] }),
    z: types.number(0, { range: [-Math.PI, Math.PI] }),
  }),
  fov: types.number(75, { range: [20, 100] }),
};

export function initializeTheatreStudio() {
  const studioAvailable = typeof window !== 'undefined' && import.meta.env.DEV;

  if (!studioAvailable || theatreStudioInitialized) {
    return theatreStudioModulePromise;
  }

  theatreStudioModulePromise ??= import('@theatre/studio').then(({ default: studio }) => {
    theatreStudio = studio;
    theatreStudio.initialize();
    theatreStudioInitialized = true;
    return theatreStudio;
  });

  return theatreStudioModulePromise;
}

export function getTheatreSheet() {
  const studioAvailable = typeof window !== 'undefined' && import.meta.env.DEV;

  if (!studioAvailable) {
    return null;
  }

  if (!theatreProject) {
    theatreProject = getProject('CyberpunkCity');
    theatreSheet = theatreProject.sheet('MainSequence');
  }

  return theatreSheet;
}

export function createEditableCamera(sheet, camera) {
  if (!sheet) {
    camera.position.set(15, 1.7, 15);
    camera.rotation.set(-0.1, 2.4, 0);
    camera.fov = 75;
    camera.updateProjectionMatrix();
    return null;
  }

  if (!theatreCameraObject) {
    theatreCameraObject = sheet.object('MainCamera', cameraConfig);
  }

  theatreCameraUnsubscribe?.();
  theatreCameraUnsubscribe = theatreCameraObject.onValuesChange((values) => {
    camera.position.set(values.position.x, values.position.y, values.position.z);
    camera.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z);
    camera.fov = values.fov;
    camera.updateProjectionMatrix();
  });

  return theatreCameraObject;
}