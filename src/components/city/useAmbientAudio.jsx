import { useEffect, useMemo } from 'react';

const AMBIENCE_AUDIO_URL = 'https://media.base44.com/files/public/69fa345f1e88257c77c4e49b/b7918b98e_efecto-de-sonido-tecnologia-tecno-sound-effect-128-ytshortssavetubeme.mp3';

export default function useAmbientAudio(enabled) {
  const audio = useMemo(() => {
    const element = new Audio(AMBIENCE_AUDIO_URL);
    element.loop = true;
    element.preload = 'metadata';
    element.crossOrigin = 'anonymous';
    return element;
  }, []);

  useEffect(() => {
    audio.volume = enabled ? 0.5 : 0;
    audio.muted = !enabled;

    if (enabled) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [audio, enabled]);

  useEffect(() => {
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);
}