import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { ZONES } from './cityData';
import AgencyMenu from './AgencyMenu';

export default function HUD({ isLocked, activeZone, nearStand, onActivateStand, isMobile = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
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
        <div className="flex items-start justify-between gap-2 px-3 py-3 sm:px-6">
          {/* Logo */}
          <div className="pointer-events-auto flex items-center gap-2 shrink-0">
            <button
              data-agency-menu-button="true"
              onClick={() => setMenuOpen(true)}
              className="glass-dark flex h-10 w-10 items-center justify-center rounded border border-cyan-400/20 text-cyan-300 transition hover:border-cyan-400/50 hover:text-white"
            >
              <Menu size={18} />
            </button>
            <div className="glass-dark px-3 py-2 rounded max-w-[42vw] sm:max-w-none">
              <span className="font-orbitron text-xs sm:text-sm font-black neon-text-cyan tracking-widest">
                AGENCY<span className="neon-text-magenta">360</span>
              </span>
              <span className="hidden sm:inline text-xs text-gray-500 font-rajdhani ml-2 tracking-widest">CYBERCITY</span>
            </div>
          </div>

          {/* Status bar */}
          <div className="glass-dark hidden sm:flex px-3 py-2 rounded items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-orbitron text-cyan-400 tracking-widest max-w-[24vw] sm:max-w-none truncate">
                {activeZone ? activeZone.label : 'EXPLORANDO'}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-700 hidden sm:block" />
            <span className="hidden sm:inline text-xs font-rajdhani text-gray-500">
              {isLocked ? 'MODO EXPLORACIÓN' : 'CLICK PARA ENTRAR'}
            </span>
          </div>

          {/* Coords display */}
          <div className="glass-dark px-3 py-2 rounded hidden lg:block">
            <span className="text-xs font-orbitron text-gray-500 tracking-widest">ZONAS: {ZONES.length}</span>
          </div>
        </div>
      </div>

      {/* Zone indicator bar - bottom */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-[92vw]">
        <div className="glass-dark px-4 py-2 rounded flex items-center gap-3 sm:gap-6">
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
      {!isLocked && !isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
        >
          <div className="glass-dark px-10 py-6 rounded-lg text-center" style={{ border: '2px solid rgba(0,255,255,0.5)', boxShadow: '0 0 40px rgba(0,255,255,0.3)' }}>
            <p className="font-orbitron text-lg neon-text-cyan tracking-widest mb-3 animate-pulse">
              👆 CLICK EN LA PANTALLA PARA EXPLORAR
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs font-rajdhani text-gray-400">
              <span>🎮 <b className="text-cyan-400">WASD</b> · mover</span>
              <span>🖱️ <b className="text-cyan-400">Mouse</b> · girar</span>
              <span>⌨️ <b className="text-cyan-400">ESC</b> · salir</span>
              <span>🏛️ <b className="text-cyan-400">Acércate</b> a los stands</span>
            </div>
          </div>
        </motion.div>
      )}

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

      <AgencyMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}