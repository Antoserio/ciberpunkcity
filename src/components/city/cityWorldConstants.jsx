import * as THREE from 'three';
import { ZONES } from './cityData';

export const CITY_VIDEO_SOURCES = [
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
];

export const CITY_VIDEO_SCREEN_CONFIGS = [
  { x: -30, y: 10.5, z: -25.4, width: 7.2, height: 4.05, rotationY: 0, frameColor: 0x00ffff, glowColor: 0x00ffff, sourceIndex: 0 },
  { x: 30, y: 11.5, z: -25.4, width: 7.2, height: 4.05, rotationY: 0, frameColor: 0xff00ff, glowColor: 0xff00ff, sourceIndex: 1 },
  { x: -34.2, y: 9.5, z: 18, width: 5.8, height: 3.25, rotationY: Math.PI / 2, frameColor: 0xffff00, glowColor: 0xffff00, sourceIndex: 2 },
  { x: 34.2, y: 9.5, z: 18, width: 5.8, height: 3.25, rotationY: -Math.PI / 2, frameColor: 0x4488ff, glowColor: 0x4488ff, sourceIndex: 3 },
];

export const HERO_COLORS = [0x00ffff, 0xff00ff, 0xffff00, 0x7c3aed, 0x4488ff];

export const WORKS = [
  {
    title: 'CLONEX AVATAR',
    subtitle: 'RTFKT x NIKE - Metahumano Realista',
    description: 'Avatar fotorrealista para experiencias inmersivas',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
    color: '#ff0066'
  },
  {
    title: 'DANCE MAPPING',
    subtitle: 'Video Mapping Interactivo 360°',
    description: 'Proyección arquitectónica sincronizada con música',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/0cbcd588c_Viky-EventoMayo-GoogleChrome2026-05-0811-15-57.mp4',
    color: '#00ffff'
  },
  {
    title: 'METAVERSO XR',
    subtitle: 'Eventos Live en Realidad Extendida',
    description: 'Espacios virtuales para conferencias y eventos',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
    color: '#ffff00'
  },
  {
    title: 'STUDIO 360',
    subtitle: 'Producción Audiovisual Inmersiva',
    description: 'Contenido 360° para experiencias VR',
    videoUrl: 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/0cbcd588c_Viky-EventoMayo-GoogleChrome2026-05-0811-15-57.mp4',
    color: '#ff00ff'
  }
];

export const WORKS_CAMERA_POSITION = new THREE.Vector3(0, 4.5, 15);
export const WORKS_CAMERA_TRANSITION_MS = 1000;

export const ROBOT_NO_FLY_ZONES = [
  ...ZONES.map((zone) => ({
    x: zone.position[0],
    z: zone.position[2],
    radius: (zone.buildingWidth || 8) * 1.4 + 8,
  })),
  { x: -18, z: -30, radius: 8 },
  { x: 18, z: -30, radius: 8 },
  { x: -30, z: 18, radius: 8 },
  { x: 30, z: 18, radius: 8 },
  { x: -34, z: -34, radius: 8 },
  { x: 34, z: -34, radius: 8 },
  { x: -34, z: 34, radius: 8 },
  { x: 34, z: 34, radius: 8 },
  { x: -46, z: -18, radius: 8 },
  { x: 46, z: -18, radius: 8 },
  { x: -46, z: 18, radius: 8 },
  { x: 46, z: 18, radius: 8 },
  { x: -12, z: -44, radius: 8 },
  { x: 12, z: -44, radius: 8 },
  { x: -12, z: 44, radius: 8 },
  { x: 12, z: 44, radius: 8 },
  { x: -58, z: -30, radius: 8 },
  { x: -44, z: -30, radius: 8 },
  { x: -30, z: -30, radius: 8 },
  { x: 30, z: -30, radius: 8 },
  { x: 44, z: -30, radius: 8 },
  { x: 58, z: -30, radius: 8 },
  { x: -58, z: 30, radius: 8 },
  { x: -44, z: 30, radius: 8 },
  { x: -30, z: 30, radius: 8 },
  { x: 30, z: 30, radius: 8 },
  { x: 44, z: 30, radius: 8 },
  { x: 58, z: 30, radius: 8 },
];