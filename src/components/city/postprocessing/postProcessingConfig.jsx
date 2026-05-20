export function createPostProcessingState(performanceConfig) {
  const isHigh = performanceConfig.tier === 'high';
  const isMedium = performanceConfig.tier === 'medium';

  return {
    bloom: true,
    reflections: true,
    chromaticAberration: true,
    filmGrain: true,
    colorGrading: true,
    vignette: true,
    fxaa: true,
    dof: isHigh,
    adaptiveQuality: true,
    parallaxScroll: true,
    qualityStepDownApplied: false,
    selectiveBloomLayer: 1,
    reflectionOpacity: isHigh ? 0.42 : isMedium ? 0.36 : 0.3,
    reflectionBlur: isHigh ? [420, 96] : [280, 72],
    dofStrength: isHigh ? 0.018 : 0.01,
  };
}

export function getAdaptivePostProcessingState(state, fps) {
  if (!state.adaptiveQuality) return state;
  if (fps >= 30 || state.qualityStepDownApplied) return state;

  return {
    ...state,
    dof: false,
    reflections: false,
    filmGrain: false,
    chromaticAberration: false,
    qualityStepDownApplied: true,
  };
}