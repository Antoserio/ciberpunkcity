import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [nearStand, setNearStand] = useState(null);
  const [openStand, setOpenStand] = useState(null);
  const nearStandStateRef = useRef(null);
  const openStandRef = useRef(null);
  const vimeoIframeRef = useRef(null);
  const yt1IframeRef = useRef(null);
  const yt2IframeRef = useRef(null);

  // Keep refs in sync so keydown handler can read the latest values
  useEffect(() => { nearStandStateRef.current = nearStand; }, [nearStand]);
  useEffect(() => { openStandRef.current = openStand; }, [openStand]);

  // Listen for the stand key press
  useEffect(() => {
    if (!started) return;
    const onKey = (e) => {
      const stand = nearStandStateRef.current;
      if (stand && e.key.toUpperCase() === stand.key.toUpperCase()) {
        // Exit pointer lock so cursor is free for the modal
        if (document.pointerLockElement) document.exitPointerLock();
        setOpenStand(stand);
      }
      if (e.key === 'Escape' && openStandRef.current) {
        setOpenStand(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [started]);

  const handleEnterZone = (zone) => setActiveZone(zone);
  const handleExitZone = () => setActiveZone(null);

  // Track pointer lock state
  const handleStart = () => {
    setStarted(true);
    document.addEventListener('pointerlockchange', () => {
      setIsLocked(!!document.pointerLockElement);
    });
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D World */}
      {started && (
        <div className="absolute inset-0">
          <CityWorld
            onEnterZone={handleEnterZone}
            onExitZone={handleExitZone}
            vimeoIframeRef={vimeoIframeRef}
            yt1IframeRef={yt1IframeRef}
            yt2IframeRef={yt2IframeRef}
            onNearStand={setNearStand}
            onLeaveStand={() => setNearStand(null)}
          />
          {/* Vimeo video overlay */}
          <iframe
            ref={vimeoIframeRef}
            src="https://player.vimeo.com/video/641418395?autoplay=1&muted=1&loop=1&background=1"
            style={{ position: 'absolute', display: 'none', border: '2px solid #ff00ff', boxShadow: '0 0 20px #ff00ff80, 0 0 40px #ff00ff40', pointerEvents: 'none', borderRadius: '2px' }}
            allow="autoplay; fullscreen"
            title="Vimeo Screen"
          />
          {/* YouTube 1 overlay */}
          <iframe
            ref={yt1IframeRef}
            src="https://www.youtube.com/embed/h7LhhrhjvAE?autoplay=1&mute=1&loop=1&playlist=h7LhhrhjvAE&controls=0&modestbranding=1"
            style={{ position: 'absolute', display: 'none', border: '2px solid #00ffff', boxShadow: '0 0 20px #00ffff80, 0 0 40px #00ffff40', pointerEvents: 'none', borderRadius: '2px' }}
            allow="autoplay; fullscreen"
            title="YouTube Screen 1"
          />
          {/* YouTube 2 overlay */}
          <iframe
            ref={yt2IframeRef}
            src="https://www.youtube.com/embed/yXmNSxb25DU?autoplay=1&mute=1&loop=1&playlist=yXmNSxb25DU&controls=0&modestbranding=1"
            style={{ position: 'absolute', display: 'none', border: '2px solid #ffff00', boxShadow: '0 0 20px #ffff0080, 0 0 40px #ffff0040', pointerEvents: 'none', borderRadius: '2px' }}
            allow="autoplay; fullscreen"
            title="YouTube Screen 2"
          />
        </div>
      )}

      {/* Splash screen */}
      <AnimatePresence>
        {!started && (
          <SplashScreen onEnter={handleStart} />
        )}
      </AnimatePresence>

      {/* HUD overlay */}
      {started && (
        <HUD isLocked={isLocked} activeZone={activeZone} nearStand={nearStand} />
      )}

      {/* Zone info panel */}
      {started && (
        <AnimatePresence>
          {activeZone && (
            <ZonePanel
              key={activeZone.id}
              zone={activeZone}
              onClose={() => setActiveZone(null)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Mini map */}
      {started && (
        <MiniMap activeZone={activeZone} />
      )}

      {/* Stand modal */}
      {openStand && <StandModal stand={openStand} onClose={() => setOpenStand(null)} />}

      {/* Avatar AI Assistant */}
      {started && <AvatarAssistant />}
    </div>
  );
}