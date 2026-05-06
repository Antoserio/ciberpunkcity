import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CityWorld from '../components/city/CityWorld.jsx';
import HUD from '../components/city/HUD';
import ZonePanel from '../components/city/ZonePanel';
import AvatarAssistant from '../components/city/AvatarAssistant';
import SplashScreen from '../components/city/SplashScreen';
import MiniMap from '../components/city/MiniMap';

export default function CyberCity() {
  const [started, setStarted] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const vimeoIframeRef = useRef(null);

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
          />
          {/* Vimeo video overlay - projected onto 3D screen position */}
          <iframe
            ref={vimeoIframeRef}
            src="https://player.vimeo.com/video/641418395?autoplay=1&muted=1&loop=1&background=1"
            style={{
              position: 'absolute',
              display: 'none',
              border: '2px solid #ff00ff',
              boxShadow: '0 0 20px #ff00ff80, 0 0 40px #ff00ff40',
              pointerEvents: 'none',
              borderRadius: '2px',
            }}
            allow="autoplay; fullscreen"
            title="Vimeo Screen"
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
        <HUD isLocked={isLocked} activeZone={activeZone} />
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

      {/* Avatar AI Assistant */}
      {started && <AvatarAssistant />}
    </div>
  );
}