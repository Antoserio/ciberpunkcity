import { motion } from 'framer-motion';
import HUDTopBar from './HUDTopBar';
import HUDZoneRail from './HUDZoneRail';

export default function HUD({ isLocked, activeZone, nearStand, onActivateStand, isMobile = false }) {
  return (
    <>
      {/* Crosshair */}
      {isLocked && !isMobile && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative w-6 h-6">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-400 opacity-70" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cyan-400 opacity-70" />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      <HUDTopBar activeZone={activeZone} />

      <HUDZoneRail activeZone={activeZone} />

      {/* Controls help - shown when not locked */}


      {isMobile && !nearStand && !activeZone && (
        <div className="fixed bottom-16 left-3 right-3 z-30 pointer-events-none">
          <div className="glass-dark px-4 py-3 rounded text-center">
            <p className="font-orbitron text-[10px] tracking-widest text-cyan-400 mb-1">MÓVIL</p>
            <p className="font-rajdhani text-xs text-gray-300">Izquierda: mover · Derecha: girar</p>
          </div>
        </div>
      )}


      {nearStand?.type === 'arcade' && (
        <motion.div
          key={nearStand.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-16 sm:bottom-24 left-1/2 z-30 -translate-x-1/2 max-w-[92vw]"
        >
          <button
            onClick={() => onActivateStand?.(nearStand)}
            className="rounded-full border border-cyan-300/45 bg-cyan-300/12 px-6 py-3 font-orbitron text-xs uppercase tracking-[0.3em] text-white shadow-[0_0_24px_rgba(0,255,255,0.18)] backdrop-blur-md transition hover:border-cyan-200 hover:bg-cyan-300/18"
          >
            PLAY
          </button>
        </motion.div>
      )}

      {/* Zone proximity hint */}
      {activeZone && (
        <motion.div
          key={activeZone.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[90vw]"
        >
          <div
            className="px-6 py-2 rounded text-center"
            style={{
              background: `${activeZone.colorHex}15`,
              border: `1px solid ${activeZone.colorHex}40`,
              boxShadow: `0 0 20px ${activeZone.colorHex}20`,
            }}
          >
            <p
              className="font-orbitron text-xs font-bold tracking-widest animate-pulse"
              style={{ color: activeZone.colorHex }}
            >
              {activeZone.icon} ZONA DETECTADA: {activeZone.title.toUpperCase()}
            </p>
          </div>
        </motion.div>
      )}

    </>
  );
}