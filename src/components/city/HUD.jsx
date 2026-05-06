import { motion } from 'framer-motion';
import { ZONES } from './cityData';

export default function HUD({ isLocked, activeZone, nearStand, onActivateStand }) {
  return (
    <>
      {/* Crosshair */}
      {isLocked && (
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
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="glass-dark px-4 py-2 rounded">
            <span className="font-orbitron text-sm font-black neon-text-cyan tracking-widest">
              AGENCY<span className="neon-text-magenta">360</span>
            </span>
            <span className="text-xs text-gray-500 font-rajdhani ml-2 tracking-widest">CYBERCITY</span>
          </div>

          {/* Status bar */}
          <div className="glass-dark px-4 py-2 rounded flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-orbitron text-cyan-400 tracking-widest">
                {activeZone ? activeZone.label : 'EXPLORANDO'}
              </span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <span className="text-xs font-rajdhani text-gray-500">
              {isLocked ? 'MODO EXPLORACIÓN' : 'CLICK PARA ENTRAR'}
            </span>
          </div>

          {/* Coords display */}
          <div className="glass-dark px-4 py-2 rounded">
            <span className="text-xs font-orbitron text-gray-500 tracking-widest">ZONAS: {ZONES.length}</span>
          </div>
        </div>
      </div>

      {/* Zone indicator bar - bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="glass-dark px-6 py-3 rounded flex items-center gap-6">
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
      {!isLocked && (
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

      {/* Stand proximity key prompt */}
      {nearStand && (
        <motion.div
          key={nearStand.id}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="fixed bottom-36 left-1/2 -translate-x-1/2 z-30"
        >
          <button
            onClick={() => onActivateStand && onActivateStand(nearStand)}
            className="px-8 py-4 rounded-lg text-center flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.88), ${nearStand.color}22)`,
              border: `2px solid ${nearStand.color}`,
              boxShadow: `0 0 40px ${nearStand.color}60, 0 0 80px ${nearStand.color}20, inset 0 0 20px ${nearStand.color}10`,
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{nearStand.icon}</span>
              <div>
                <span className="font-orbitron text-base font-black tracking-widest" style={{ color: nearStand.color, textShadow: `0 0 15px ${nearStand.color}` }}>
                  {nearStand.title}
                </span>
                <p className="font-rajdhani text-xs text-gray-400 mt-0.5">{nearStand.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-orbitron text-xs text-gray-400 tracking-widest">PULSA</span>
              <span
                className="font-orbitron text-2xl font-black px-3 py-1 rounded border-2 animate-pulse"
                style={{ color: nearStand.color, borderColor: nearStand.color, boxShadow: `0 0 20px ${nearStand.color}`, background: `${nearStand.color}15` }}
              >
                {nearStand.key}
              </span>
              <span className="font-orbitron text-xs text-gray-400 tracking-widest">O CLICK AQUÍ</span>
            </div>
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
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
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