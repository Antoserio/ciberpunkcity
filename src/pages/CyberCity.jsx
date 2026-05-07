import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import CityWorld from '../components/city/CityWorld.jsx';
import HUD from '../components/city/HUD';
import ZonePanel from '../components/city/ZonePanel';
import AvatarAssistant from '../components/city/AvatarAssistant';
import SplashScreen from '../components/city/SplashScreen';
import MiniMap from '../components/city/MiniMap';
import StandModal from '../components/city/StandModal';

export default function CyberCity() {
  const [started, setStarted] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hasClickedOnce, setHasClickedOnce] = useState(false);
  const [nearStand, setNearStand] = useState(null);
  const [openStand, setOpenStand] = useState(null);

  // Track pointer lock state
  useEffect(() => {
    const onLockChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, []);

  const handleActivateStand = useCallback((stand) => {
    // Exit pointer lock so modal can receive input
    if (document.pointerLockElement) document.exitPointerLock();
    setOpenStand(stand);
  }, []);

  const handleCloseStand = useCallback(() => {
    setOpenStand(null);
    // Re-request pointer lock after modal closes
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.requestPointerLock();
    }, 150);
  }, []);

  // Escape key closes modal
  useEffect(() => {
    if (!started) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && openStand) {
        e.stopImmediatePropagation();
        handleCloseStand();
      }
    };
    document.addEventListener('keydown', onKey, true); // capture phase — runs before CityWorld handler
    return () => document.removeEventListener('keydown', onKey, true);
  }, [started, openStand, handleCloseStand]);

  if (!started) {
    return <SplashScreen onEnter={() => setStarted(true)} />;
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D World */}
      <div className="absolute inset-0" onClick={() => setHasClickedOnce(true)}>
        <CityWorld
          onEnterZone={setActiveZone}
          onExitZone={() => setActiveZone(null)}
          onNearStand={setNearStand}
          onLeaveStand={() => setNearStand(null)}
          onActivateStand={handleActivateStand}
          modalOpen={!!openStand}
        />
      </div>


      <iframe
        title="vimeo-player"
        src="https://player.vimeo.com/video/641418395?h=6352849e2c&autoplay=1&muted=1&loop=1&autopause=0&background=1"
        className="absolute z-10 pointer-events-none border-0"
        style={{
          left: '26.8%',
          top: '36.2%',
          width: '12.6%',
          height: '18.4%',
          filter: 'saturate(1.05) brightness(0.95)',
        }}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
      />

      <iframe
        title="vimeo-player"
        src="https://player.vimeo.com/video/641418395?h=6352849e2c&autoplay=1&muted=1&loop=1&autopause=0&background=1"
        className="absolute z-10 pointer-events-none border-0"
        style={{
          left: '26.8%',
          top: '36.2%',
          width: '12.6%',
          height: '18.4%',
          filter: 'saturate(1.05) brightness(0.95)',
        }}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
      />

      {/* HUD overlay */}
      <HUD
        isLocked={isLocked || hasClickedOnce}
        activeZone={activeZone}
        nearStand={null}
        onActivateStand={handleActivateStand}
      />

      {/* Zone info panel */}
      <AnimatePresence>
        {activeZone && !openStand && (
          <ZonePanel
            key={activeZone.id}
            zone={activeZone}
            onClose={() => setActiveZone(null)}
          />
        )}
      </AnimatePresence>

      {/* Mini map */}
      <MiniMap activeZone={activeZone} />

      {/* Stand modal */}
      <AnimatePresence>
        {openStand && (
          <StandModal
            key={openStand.id}
            stand={openStand}
            onClose={handleCloseStand}
          />
        )}
      </AnimatePresence>

      {/* Avatar AI Assistant */}
      <AvatarAssistant />
    </div>
  );
}