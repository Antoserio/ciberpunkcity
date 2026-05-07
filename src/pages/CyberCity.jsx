import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { AnimatePresence } from 'framer-motion';
import CityWorld from '../components/city/CityWorld.jsx';
import HUD from '../components/city/HUD';
import ZonePanel from '../components/city/ZonePanel';
import AvatarAssistant from '../components/city/AvatarAssistant';
import SplashScreen from '../components/city/SplashScreen';
import MiniMap from '../components/city/MiniMap';
import StandModal from '../components/city/StandModal';
import RobotUploadPanel from '../components/city/RobotUploadPanel.jsx';

export default function CyberCity() {
  const [started, setStarted] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hasClickedOnce, setHasClickedOnce] = useState(false);
  const [nearStand, setNearStand] = useState(null);
  const [openStand, setOpenStand] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [robotModelUrl, setRobotModelUrl] = useState('');
  const [robotFileName, setRobotFileName] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    const loadGlobalRobot = async () => {
      const settings = await base44.entities.WorldSettings.filter({ key: 'global_robot_model' }, '-updated_date', 1);
      if (settings.length > 0 && settings[0].robot_model_url) {
        setRobotModelUrl(settings[0].robot_model_url);
        setRobotFileName(settings[0].robot_file_name || '');
      }
    };

    loadGlobalRobot();
  }, []);

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
    if (window.innerWidth < 768) return;
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
          plazaVideoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
          isMobile={isMobile}
          robotModelUrl={robotModelUrl}
          audioEnabled={audioEnabled}
        />
      </div>



      <RobotUploadPanel onUploaded={(fileUrl, fileName) => {
        setRobotModelUrl(fileUrl);
        setRobotFileName(fileName || '');
      }} currentRobotFileName={robotFileName} />

      {/* HUD overlay */}
      <HUD
        isLocked={isMobile ? true : (isLocked || hasClickedOnce)}
        activeZone={activeZone}
        nearStand={nearStand}
        onActivateStand={handleActivateStand}
        isMobile={isMobile}
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
      <MiniMap activeZone={activeZone} isMobile={isMobile} />

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

      <button
        onClick={() => setAudioEnabled((value) => !value)}
        className="fixed bottom-4 right-4 z-40 rounded-full border border-white/10 bg-black/60 px-4 py-2 font-orbitron text-[10px] tracking-[0.25em] text-white backdrop-blur-md transition hover:border-cyan-400/40 hover:text-cyan-300"
      >
        {audioEnabled ? 'SONIDO ON' : 'SONIDO OFF'}
      </button>

      {/* Avatar AI Assistant */}
      <AvatarAssistant />
    </div>
  );
}