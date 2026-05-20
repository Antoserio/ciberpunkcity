import { useEffect, useMemo, useState } from 'react';
import { CRITICAL_ASSETS, SECONDARY_ASSETS } from './cityAssetManifest';
import { loadAsset } from './cityPreloadUtils';
import { CRITICAL_LOAD_MESSAGES, SECONDARY_LOAD_MESSAGES } from './loaderMessages';

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
      setStatus(CRITICAL_LOAD_MESSAGES[2]);

      for (const asset of CRITICAL_ASSETS) {
        await loadAsset(asset);
        if (cancelled) return;
        loaded += 1;
        setStatus(CRITICAL_LOAD_MESSAGES[Math.min(loaded + 1, CRITICAL_LOAD_MESSAGES.length - 2)]);
        setProgress((loaded / totalCritical) * 100);
      }

      if (cancelled) return;
      setStatus('Sincronizando escena principal');
      setProgress(100);

      window.setTimeout(() => {
        if (cancelled) return;
        setReady(true);
        setStatus(CRITICAL_LOAD_MESSAGES[CRITICAL_LOAD_MESSAGES.length - 1]);
      }, 450);
    };

    const loadSecondary = async () => {
      for (let index = 0; index < SECONDARY_ASSETS.length; index += 1) {
        await loadAsset(SECONDARY_ASSETS[index]);
        if (cancelled) return;
        if (ready) {
          setStatus(SECONDARY_LOAD_MESSAGES[index % SECONDARY_LOAD_MESSAGES.length]);
        }
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