import { useEffect, useState } from 'react';

export default function useArcadeFocusPulse(active) {
  const [focusPulse, setFocusPulse] = useState(0);

  useEffect(() => {
    if (!active) {
      setFocusPulse(0);
      return;
    }

    const start = performance.now();
    let frameId = null;

    const animate = () => {
      const progress = Math.min((performance.now() - start) / 1000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setFocusPulse(eased);
      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [active]);

  return focusPulse;
}