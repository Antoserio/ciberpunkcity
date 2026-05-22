import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import CityWorld from '../components/city/CityWorld.jsx';
import CinematicLoader from '../components/city/CinematicLoader';
import HUD from '../components/city/HUD';
import ZonePanel from '../components/city/ZonePanel';
import AvatarAssistant from '../components/city/AvatarAssistant';
import MiniMap from '../components/city/MiniMap';
import StandModal from '../components/city/StandModal';
import TopNav from '../components/city/TopNav.jsx';
import WelcomeOverlay from '../components/city/WelcomeOverlay.jsx';
import AboutOverlay from '../components/city/AboutOverlay.jsx';
import VikyModal from '../components/city/VikyModal.jsx';
import ArcadeGamesModal from '../components/city/ArcadeGamesModal.jsx';
import { STANDS } from '../components/city/standsData';
import useAmbientAudio from '../components/city/useAmbientAudio';
import useCityAssetLoader from '../components/city/useCityAssetLoader';
import PostFXOverlay from '../components/city/PostFXOverlay.jsx';
import useArcadeFocusPulse from '../components/city/useArcadeFocusPulse';
import { createPostProcessingState } from '../components/city/postprocessing/postProcessingConfig';

export default function CyberCity() {
  const [started, setStarted] = useState(false);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);
  const [activeZone, setActiveZone] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [hasClickedOnce, setHasClickedOnce] = useState(false);
  const [nearStand, setNearStand] = useState(null);
  const [openStand, setOpenStand] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [robotModelUrl, setRobotModelUrl] = useState('');
  const [robotFileName, setRobotFileName] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeView, setActiveView] = useState('explore');
  const [activeWork, setActiveWork] = useState(() => STANDS.find((stand) => stand.type === 'video' || stand.type === 'showcase') || null);
  const [vikyOpen, setVikyOpen] = useState(false);
  const [arcadeOpen, setArcadeOpen] = useState(false);
  const [worksTransitionToken, setWorksTransitionToken] = useState(0);
  const [cameraTarget, setCameraTarget] = useState({ 
    position: { x: 15, y: 1.7, z: 15 }, 
    rotation: 2.4 
  });
  const [postProcessingSettings, setPostProcessingSettings] = useState(null);

  useAmbientAudio(audioEnabled);
  const { progress, status, ready } = useCityAssetLoader(true);
  const arcadeFocusPulse = useArcadeFocusPulse(arcadeOpen);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener('resize', updateMobile);
    return () => window.removeEventListener('resize', updateMobile);
  }, []);

  useEffect(() => {
    setPostProcessingSettings(createPostProcessingState({ tier: isMobile ? 'mobile' : 'high' }));
  }, [isMobile]);

  useEffect(() => {
    setRobotModelUrl('https://base44.app/api/apps/69fa345f1e88257c77c4e49b/files/mp/public/69fa345f1e88257c77c4e49b/3afd5ce0c_robotpequeo.glb');
    setRobotFileName('robotpequeño.glb');
  }, []);

  // Track pointer lock state
  useEffect(() => {
    const onLockChange = () => setIsLocked(!!document.pointerLockElement);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, []);

  const handleActivateStand = useCallback((stand) => {
    if (document.pointerLockElement) document.exitPointerLock();
    if (stand?.type === 'arcade') {
      setArcadeOpen(true);
      return;
    }
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
    if (view === 'works') {
      setWorksTransitionToken((value) => value + 1);
      // Mover cámara delante del carousel
      setCameraTarget({
        position: { x: 0, y: 4.5, z: 15 },
        rotation: Math.PI
      });
    } else if (view === 'explore') {
      // Volver a posición inicial diagonal
      setCameraTarget({
        position: { x: 15, y: 1.7, z: 15 },
        rotation: 2.4
      });
    }
    
    setActiveView(view);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);


  if (!started) {
    setStarted(true);
    return null;
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
          onOpenViky={() => setVikyOpen(true)}
          modalOpen={!!openStand || vikyOpen || arcadeOpen || showWelcomeOverlay || !ready}
          plazaVideoUrl=""
          isMobile={isMobile}
          robotModelUrl={robotModelUrl}
          activeView={activeView}
          activeWork={activeWork}
          worksTransitionToken={worksTransitionToken}
          cameraTarget={cameraTarget}
          postProcessingSettings={postProcessingSettings}
          arcadeFocusPulse={arcadeFocusPulse}
        />
      </div>

      {!showWelcomeOverlay && <TopNav activeView={activeView} onChangeView={handleChangeView} />}

      {!showWelcomeOverlay && <PostFXOverlay focusPulse={arcadeFocusPulse} />}

      <CinematicLoader visible={!ready} progress={progress} status={status} ready={ready} />

      {showWelcomeOverlay && ready && (
        <WelcomeOverlay
          onEnter={() => {
            setShowWelcomeOverlay(false);
            setActiveView('explore');
            setHasClickedOnce(true);
          }}
        />
      )}

      {/* HUD overlay */}
      {activeView === 'explore' && !showWelcomeOverlay && (
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

      {!showWelcomeOverlay && (
        <>
          <button
            id="sound-toggle"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHasClickedOnce(true);
              setAudioEnabled((value) => !value);
            }}
            className="fixed bottom-28 left-4 z-[60] rounded-full px-4 py-2 font-orbitron text-[10px] tracking-[0.25em] text-white/50 transition hover:text-white/80 sm:bottom-6 sm:left-6"
            style={{ border: '1px solid rgba(255,45,45,0.25)', background: 'rgba(0,0,0,0.4)' }}
          >
            {audioEnabled ? 'SONIDO ON' : 'SONIDO OFF'}
          </button>
        </>
      )}

      <AboutOverlay open={activeView === 'about'} onClose={() => setActiveView('explore')} />

      <VikyModal open={vikyOpen} onClose={() => setVikyOpen(false)} />
      <ArcadeGamesModal open={arcadeOpen} onClose={() => setArcadeOpen(false)} />
      <AvatarAssistant />
    </div>
  );
}