import { getProject, types } from '@theatre/core';
import studio from '@theatre/studio';

let theatreStudioInitialized = false;
let theatreProject = null;
let theatreSheet = null;

export function getTheatreSheet() {
  if (typeof window !== 'undefined' && import.meta.env.DEV && !theatreStudioInitialized) {
    studio.initialize();
    theatreStudioInitialized = true;
  }

  if (!theatreProject) {
    theatreProject = getProject('CyberpunkCity');
    theatreSheet = theatreProject.sheet('MainSequence');
  }

  return theatreSheet;
}

export function createEditableCamera(sheet, camera) {
  const cameraObject = sheet.object('MainCamera', {
    position: types.compound({
      x: types.number(camera.position.x, { range: [-120, 120] }),
      y: types.number(camera.position.y, { range: [0, 120] }),
      z: types.number(camera.position.z, { range: [-120, 120] }),
    }),
    rotation: types.compound({
      x: types.number(camera.rotation.x, { range: [-Math.PI, Math.PI] }),
      y: types.number(camera.rotation.y, { range: [-Math.PI, Math.PI] }),
      z: types.number(camera.rotation.z, { range: [-Math.PI, Math.PI] }),
    }),
    fov: types.number(camera.fov, { range: [20, 100] }),
  });

  cameraObject.onValuesChange((values) => {
    camera.position.set(values.position.x, values.position.y, values.position.z);
    camera.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z);
    camera.fov = values.fov;
    camera.updateProjectionMatrix();
  });

  return cameraObject;
}