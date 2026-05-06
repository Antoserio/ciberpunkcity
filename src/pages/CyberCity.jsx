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
  const [hasClickedOnce, setHasClickedOnce] = useState(false);
  const [nearStand, setNearStand] = useState(null);
  const [openStand, setOpenStand] = useState(null);
  const nearStandStateRef = useRef(null);
  const openStandRef = useRef(null);

  // Keep refs in sync so keydown handler can read the latest values
  useEffect(() => { nearStandStateRef.current = nearStand; }, [nearStand]);
  useEffect(() => { openStandRef.current = openStand; }, [openStand]);

  // Escape closes the stand modal only (browser also fires Escape to exit pointer lock)
  useEffect(() => {
    if (!started) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && openStandRef.current) {
        // Let the modal close, then re-request pointer lock after a brief delay
        // so the browser's built-in pointer lock exit completes first
        setTimeout(() => {
          setOpenStand(null);
          setTimeout(() => {
            const canvas = document.querySelector('canvas');
            if (canvas) canvas.requestPointerLock();
          }, 300);
        }, 50);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [started]);

  const handleEnterZone = (zone) => setActiveZone(zone);
  const handleExitZone = () => setActiveZone(null);

  // Track pointer lock state
  useEffect(() => {
    const onLockChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, []);

  const handleStart = () => setStarted(true);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* 3D World */}
      {started && (
        <div className="absolute inset-0">
          <div onClick={() => setHasClickedOnce(true)} className="absolute inset-0">
          <CityWorld
            onEnterZone={handleEnterZone}
            onExitZone={handleExitZone}
            onNearStand={setNearStand}
            onLeaveStand={() => setNearStand(null)}
            onActivateStand={(stand) => setOpenStand(stand)}
            modalOpen={!!openStand}
          />
          </div>
        </div>
      )}

      {/* Splash screen */}
      <AnimatePresence>
        {!started && (
          <SplashScreen onEnter={handleStart} />
        )}
      </AnimatePresence>

      {/* HUD overlay — hide nearStand popup when modal is open */}
      {started && (
        <HUD isLocked={isLocked || hasClickedOnce} activeZone={activeZone} nearStand={openStand ? null : nearStand} onActivateStand={(stand) => setOpenStand(stand)} />
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

      {/* Stand modal — re-lock pointer when closed so movement resumes */}
      {openStand && (
        <StandModal
          stand={openStand}
          onClose={() => {
            setOpenStand(null);
            setTimeout(() => {
              const canvas = document.querySelector('canvas');
              if (canvas) canvas.requestPointerLock();
            }, 200);
          }}
        />
      )}

      {/* Avatar AI Assistant */}
      {started && <AvatarAssistant />}
    </div>
  );
}