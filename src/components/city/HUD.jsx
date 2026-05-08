import { motion } from 'framer-motion';
import { ZONES } from './cityData';

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

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
        <div className="flex items-start justify-between gap-3 px-3 py-3 sm:px-6">
          {/* Logo */}
          <div className="pointer-events-none min-w-0 flex-1 px-1 py-1">
            <div className="max-w-[200px] sm:max-w-[280px]">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="font-orbitron text-[15px] sm:text-xl font-black neon-text-cyan tracking-[0.18em] sm:tracking-[0.24em] leading-none">
                  AGENCY<span className="neon-text-magenta">360</span>
                </span>
                <span className="text-[9px] sm:text-xs font-orbitron tracking-[0.18em] sm:tracking-[0.24em] text-white/50 leading-none">CYBERCITY</span>
              </div>
              <p className="mt-1 max-w-[180px] sm:max-w-none font-rajdhani text-[10px] sm:text-[13px] font-bold uppercase leading-[1.1] sm:leading-[1.15] tracking-[0.08em] sm:tracking-[0.12em] text-white/88">
                Agencia creativa digital
              </p>
            </div>
          </div>

          {/* Status bar */}

          {/* Coords display */}
          <div className="hidden lg:flex items-center gap-4 px-1 py-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-orbitron text-cyan-400 tracking-[0.24em]">
                {activeZone ? activeZone.label : 'EXPLORANDO'}
              </span>
            </div>
            <span className="text-[10px] font-orbitron text-white/45 tracking-[0.24em]">ZONAS {ZONES.length}</span>
          </div>
        </div>
      </div>

      {/* Zone indicator bar - bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[92vw] sm:max-w-[92vw]">
        <div className="glass-dark px-3 sm:px-4 py-2 rounded flex items-center gap-2 sm:gap-6 overflow-x-hidden">
          {ZONES.map(zone => (
            <div
              key={zone.id}
              className="flex items-center gap-2 transition-all duration-300"
              style={{ opacity: activeZone?.id === zone.id ? 1 : 0.4 }}
            >
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: zone.colorHex,
                  boxShadow: activeZone?.id === zone.id ? `0 0 8px ${zone.colorHex}` : 'none',
                }}
              />
              <span
                className="text-xs font-orbitron tracking-wider hidden sm:block"
                style={{ color: activeZone?.id === zone.id ? zone.colorHex : '#444' }}
              >
                {zone.id.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls help - shown when not locked */}


      {isMobile && !nearStand && !activeZone && (
        <div className="fixed bottom-16 left-3 right-3 z-30 pointer-events-none">
          <div className="glass-dark px-4 py-3 rounded text-center">
            <p className="font-orbitron text-[10px] tracking-widest text-cyan-400 mb-1">MÓVIL</p>
            <p className="font-rajdhani text-xs text-gray-300">Izquierda: mover · Derecha: girar</p>
          </div>
        </div>
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