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
import VikyModal from '../components/city/VikyModal.jsx';
import { STANDS } from '../components/city/standsData';
import useAmbientAudio from '../components/city/useAmbientAudio';

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
  const [worksTransitionToken, setWorksTransitionToken] = useState(0);
  const [cameraTarget, setCameraTarget] = useState({ 
    position: { x: 15, y: 1.7, z: 15 }, 
    rotation: 2.4 
  });

  useAmbientAudio(audioEnabled);

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
          onOpenViky={() => setVikyOpen(true)}
          modalOpen={!!openStand || vikyOpen || showWelcomeOverlay}
          plazaVideoUrl=""
          isMobile={isMobile}
          robotModelUrl={robotModelUrl}
          activeView={activeView}
          activeWork={activeWork}
          worksTransitionToken={worksTransitionToken}
          cameraTarget={cameraTarget}
        />
      </div>

      <TopNav activeView={activeView} onChangeView={handleChangeView} />

      {showWelcomeOverlay && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4 text-white backdrop-blur-[8px]">
          <div className="w-full max-w-[500px] rounded-[30px] border border-cyan-400/20 bg-[rgba(10,10,30,0.4)] p-10 text-center backdrop-blur-[20px]">
            <h1 className="mb-14 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text font-orbitron text-4xl font-light tracking-[0.5em] text-transparent sm:text-5xl">
              AGENCY360
            </h1>

            <div className="mb-14 flex justify-center gap-10 sm:gap-16">
              <div className="text-center">
                <div className="mx-auto mb-4 h-[60px] w-[40px] rounded-[20px] border-2 border-white/60">
                  <div className="mx-auto mt-2 h-3 w-1 animate-bounce rounded-full bg-cyan-300" />
                </div>
                <p className="m-0 font-rajdhani text-sm tracking-[0.2em] text-white/70">MIRAR</p>
              </div>

              <div className="text-center">
                <div className="mb-4 grid grid-cols-3 gap-1">
                  <div />
                  <div className="flex h-7 w-7 items-center justify-center rounded border-2 border-white/60 text-xs text-white/60">↑</div>
                  <div />
                  <div className="flex h-7 w-7 items-center justify-center rounded border-2 border-white/60 text-xs text-white/60">←</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded border-2 border-white/60 text-xs text-white/60">↓</div>
                  <div className="flex h-7 w-7 items-center justify-center rounded border-2 border-white/60 text-xs text-white/60">→</div>
                </div>
                <p className="m-0 font-rajdhani text-sm tracking-[0.2em] text-white/70">MOVER</p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWelcomeOverlay(false);
                setActiveView('explore');
                setHasClickedOnce(true);
              }}
              className="rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-400/20 to-fuchsia-500/20 px-10 py-4 font-orbitron text-sm font-light uppercase tracking-[0.3em] text-white backdrop-blur-[10px] transition-all duration-300 hover:border-cyan-300/80 hover:from-cyan-400/40 hover:to-fuchsia-500/40"
            >
              Explorar
            </button>
          </div>
        </div>
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

      <button
        id="sound-toggle"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setHasClickedOnce(true);
          setAudioEnabled((value) => !value);
        }}
        className="fixed bottom-28 left-4 z-[60] rounded-full border border-white/10 bg-black/60 px-4 py-2 font-orbitron text-[10px] tracking-[0.25em] text-white backdrop-blur-md transition hover:border-cyan-400/40 hover:text-cyan-300 sm:bottom-6 sm:left-6"
      >
        {audioEnabled ? 'SONIDO ON' : 'SONIDO OFF'}
      </button>

      <AboutOverlay open={activeView === 'about'} onClose={() => setActiveView('explore')} />
      <VikyModal open={vikyOpen} onClose={() => setVikyOpen(false)} />
      <AvatarAssistant />
    </div>
  );
}