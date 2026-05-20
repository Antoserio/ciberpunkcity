import * as THREE from 'three';

export const cyberPostVertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const cyberPostFragmentShader = `
uniform sampler2D tDiffuse;
uniform vec2 resolution;
uniform float time;
uniform float chromaticStrength;
uniform float grainOpacity;
uniform float vignetteDarkness;
uniform float vignetteSmoothness;
uniform float contrast;
uniform float saturation;
uniform vec3 shadowTint;
uniform float highlightBoost;

varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec3 applySaturation(vec3 color, float sat) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(luma), color, sat);
}

vec3 applyContrast(vec3 color, float amount) {
  return (color - 0.5) * amount + 0.5;
}

void main() {
  vec2 centered = vUv - 0.5;
  float dist = length(centered);
  float edgeMask = smoothstep(0.18, 0.82, dist);
  vec2 aberrationOffset = centered * chromaticStrength * edgeMask;

  float r = texture2D(tDiffuse, vUv + aberrationOffset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - aberrationOffset).b;
  vec3 color = vec3(r, g, b);

  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  vec3 tintedShadows = mix(shadowTint * color, color, smoothstep(0.0, 0.42, luminance));
  color = mix(tintedShadows, color * (1.0 + highlightBoost), smoothstep(0.58, 1.0, luminance));

  color = applySaturation(color, saturation);
  color = applyContrast(color, contrast);

  float grain = random(vUv * resolution.xy + vec2(time * 17.13, time * 9.71)) - 0.5;
  color += grain * grainOpacity;

  float vignette = smoothstep(0.85, vignetteSmoothness, dist * (1.0 + vignetteDarkness));
  color *= vignette;

  gl_FragColor = vec4(color, 1.0);
}
`;

export function createCyberPostUniforms() {
  return {
    tDiffuse: { value: null },
    resolution: { value: new THREE.Vector2(1, 1) },
    time: { value: 0 },
    chromaticStrength: { value: 0.002 },
    grainOpacity: { value: 0.05 },
    vignetteDarkness: { value: 0.3 },
    vignetteSmoothness: { value: 1.35 },
    contrast: { value: 1.1 },
    saturation: { value: 1.2 },
    shadowTint: { value: new THREE.Color('#5fa8ff') },
    highlightBoost: { value: 0.2 },
  };
}