export function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(src);
    image.onerror = () => resolve(src);
    image.src = src;
  });
}

export function preloadVideo(src) {
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

export function loadAsset(src) {
  return src.endsWith('.mp4') ? preloadVideo(src) : preloadImage(src);
}