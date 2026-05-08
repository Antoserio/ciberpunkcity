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
import TopNav from '../components/city/TopNav.jsx';
import WorksScreen from '../components/city/WorksScreen.jsx';
import AboutOverlay from '../components/city/AboutOverlay.jsx';
import { STANDS } from '../components/city/standsData';

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
  const [activeView, setActiveView] = useState('explore');
  const [activeWork, setActiveWork] = useState(() => STANDS.find((stand) => stand.type === 'video' || stand.type === 'showcase') || null);

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
        return;
      }

      const defaultRobotUrl = 'https://base44.app/api/apps/69fa345f1e88257c77c4e49b/files/mp/public/69fa345f1e88257c77c4e49b/3afd5ce0c_robotpequeo.glb';
      const defaultRobotFileName = 'robotpequeño.glb';

      await base44.entities.WorldSettings.create({
        key: 'global_robot_model',
        robot_model_url: defaultRobotUrl,
        robot_file_name: defaultRobotFileName,
      });

      setRobotModelUrl(defaultRobotUrl);
      setRobotFileName(defaultRobotFileName);
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
    if (window.innerWidth < 768 || activeView !== 'explore') return;
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) canvas.requestPointerLock();
    }, 150);
  }, [activeView]);

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

  const handleChangeView = useCallback((view) => {
    setActiveView(view);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  useEffect(() => {
    if (!started || !audioEnabled) return;
    const unlockAudio = () => {
      const canvas = document.querySelector('canvas');
      canvas?.dispatchEvent(new Event('click'));
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, [started, audioEnabled]);

  if (!started) {
    return <SplashScreen onEnter={() => setStarted(true)} />;
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
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
          activeView={activeView}
          activeWork={activeWork}
        />
      </div>

      <TopNav activeView={activeView} onChangeView={handleChangeView} />

      {/* HUD overlay */}
      {activeView === 'explore' && (
        <HUD
          isLocked={isMobile ? true : (isLocked || hasClickedOnce)}
          activeZone={activeZone}
          nearStand={nearStand}
          onActivateStand={handleActivateStand}
          isMobile={isMobile}
        />
      )}

      <AnimatePresence>
        {activeView === 'explore' && activeZone && !openStand && (
          <ZonePanel
            key={activeZone.id}
            zone={activeZone}
            onClose={() => setActiveZone(null)}
          />
        )}

        {activeView === 'explore' && openStand && (
          <StandModal
            key={openStand.id}
            stand={openStand}
            onClose={handleCloseStand}
          />
        )}
      </AnimatePresence>

      {activeView === 'explore' && !isMobile && <MiniMap activeZone={activeZone} isMobile={isMobile} />}

      <button
        onClick={() => {
          setAudioEnabled((value) => !value);
        }}
        className="fixed bottom-28 left-4 z-[60] rounded-full border border-white/10 bg-black/60 px-4 py-2 font-orbitron text-[10px] tracking-[0.25em] text-white backdrop-blur-md transition hover:border-cyan-400/40 hover:text-cyan-300 sm:bottom-6 sm:left-6"
      >
        {audioEnabled ? 'SONIDO ON' : 'SONIDO OFF'}
      </button>

      {activeView === 'works' && <WorksScreen onChangeActiveWork={setActiveWork} />}
      <AboutOverlay open={activeView === 'about'} onClose={() => setActiveView('explore')} />
      <AvatarAssistant />
    </div>
  );
}