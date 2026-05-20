import { useEffect, useMemo, useState } from 'react';

const CRITICAL_ASSETS = [
  'https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/87b366af2__Burnt_U.jpg',
  'https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/6fe794235_image.png',
  'https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/15ddba126_0119_Ros.jpg',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/d7be97890_294244748911.mp4',
  'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/0cbcd588c_Viky-EventoMayo-GoogleChrome2026-05-0811-15-57.mp4',
];

const SECONDARY_ASSETS = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
  'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(src);
    image.onerror = () => resolve(src);
    image.src = src;
  });
}

function preloadVideo(src) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => resolve(src);
    video.onerror = () => resolve(src);
    video.src = src;
    video.load();
  });
}

function loadAsset(src) {
  return src.endsWith('.mp4') ? preloadVideo(src) : preloadImage(src);
}

export default function useCityAssetLoader(enabled = true) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Inicializando sistema');
  const [ready, setReady] = useState(false);
  const [secondaryReady, setSecondaryReady] = useState(false);

  const totalCritical = useMemo(() => CRITICAL_ASSETS.length, []);

  useEffect(() => {
    if (!enabled) {
      setProgress(100);
      setReady(true);
      return;
    }

    let cancelled = false;
    let loaded = 0;

    const loadCritical = async () => {
      setStatus('Precargando assets críticos');

      for (const asset of CRITICAL_ASSETS) {
        await loadAsset(asset);
        if (cancelled) return;
        loaded += 1;
        setProgress((loaded / totalCritical) * 100);
      }

      if (cancelled) return;
      setStatus('Sincronizando escena principal');
      setProgress(100);

      window.setTimeout(() => {
        if (cancelled) return;
        setReady(true);
        setStatus('Sistema listo');
      }, 450);
    };

    const loadSecondary = async () => {
      for (const asset of SECONDARY_ASSETS) {
        await loadAsset(asset);
        if (cancelled) return;
      }
      if (!cancelled) setSecondaryReady(true);
    };

    loadCritical();
    loadSecondary();

    return () => {
      cancelled = true;
    };
  }, [enabled, totalCritical]);

  return { progress, status, ready, secondaryReady };
}