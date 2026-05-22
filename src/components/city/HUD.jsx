import { motion } from 'framer-motion';

export default function HUD({ isLocked, activeZone, nearStand, onActivateStand, isMobile = false }) {
  return (
    <>
      {/* Crosshair — only when pointer locked on desktop */}
      {isLocked && !isMobile && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-20">
          <div className="relative w-5 h-5" style={{ opacity: 0.55 }}>
            <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.8)' }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.8)' }} />
          </div>
        </div>
      )}

      {/* Mobile hint */}
      {isMobile && !nearStand && !activeZone && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <p className="font-orbitron text-[9px] tracking-[0.25em] text-white/30 uppercase">
            Izquierda: mover · Derecha: girar
          </p>
        </div>
      )}

      {/* Arcade stand proximity */}
      {nearStand?.type === 'arcade' && (
        <motion.div
          key={nearStand.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-20 sm:bottom-28 left-1/2 z-30 -translate-x-1/2"
        >
          <button
            onClick={() => onActivateStand?.(nearStand)}
            className="rounded-full border px-6 py-2.5 font-orbitron text-[10px] uppercase tracking-[0.3em] text-white transition-all"
            style={{
              border: '1px solid rgba(255,45,45,0.5)',
              background: 'rgba(255,45,45,0.12)',
              boxShadow: '0 0 20px rgba(255,45,45,0.2)',
            }}
          >
            PLAY
          </button>
        </motion.div>
      )}

      {/* Zone proximity — minimal text, no heavy panel */}
      {activeZone && (
        <motion.div
          key={activeZone.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-20 sm:bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <p
            className="font-orbitron text-[10px] tracking-[0.32em] uppercase animate-pulse"
            style={{ color: activeZone.colorHex, textShadow: `0 0 12px ${activeZone.colorHex}` }}
          >
            {activeZone.icon} {activeZone.title}
          </p>
        </motion.div>
      )}
    </>
  );
}
