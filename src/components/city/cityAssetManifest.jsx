// Critical assets are preloaded before the scene renders — keep this list SMALL and fast.
// Only images, no videos (videos load lazily via HTMLVideoElement).
export const CRITICAL_ASSETS = [
  'https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/87b366af2__Burnt_U.jpg',
  'https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/6fe794235_image.png',
  'https://media.base44.com/images/public/69fa345f1e88257c77c4e49b/15ddba126_0119_Ros.jpg',
];

// Secondary assets load in the background after the scene is ready — non-blocking.
export const SECONDARY_ASSETS = [
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
  'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600&q=80',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80',
  'https://img.youtube.com/vi/slzh4Z0k1qw/maxresdefault.jpg',
  'https://img.youtube.com/vi/vFhWqC72e9k/maxresdefault.jpg',
  'https://img.youtube.com/vi/h7LhhrhjvAE/maxresdefault.jpg',
  'https://img.youtube.com/vi/W0EKcrfuCL8/maxresdefault.jpg',
];
