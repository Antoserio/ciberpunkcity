import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function SplashScreen({ onEnter }) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setReady(true);
          return 100;
        }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #000510 0%, #050008 100%)' }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-20" />

      {/* Scan line animation */}
      <div
        className="absolute left-0 right-0 h-px opacity-30 animate-scan"
        style={{ background: 'linear-gradient(90deg, transparent, #00ffff, transparent)' }}
      />

      <div className="relative z-10 text-center px-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-4 mb-4">
            <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00ffff)' }} />
            <span className="font-orbitron text-5xl font-black neon-text-cyan tracking-widest">
              AGENCY
            </span>
            <span className="font-orbitron text-5xl font-black neon-text-magenta tracking-widest">
              360
            </span>
            <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, #ff00ff, transparent)' }} />
          </div>
          <p className="font-rajdhani text-lg tracking-[0.5em] text-gray-400 uppercase">
            Cybercity · Experience
          </p>
        </motion.div>

        {/* Services tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { label: 'SOFTWARE', color: '#00ffff' },
            { label: 'VIDEO 360°', color: '#ff00ff' },
            { label: 'AVATARES 3D', color: '#ffff00' },
            { label: 'EVENTOS XR', color: '#ff6600' },
          ].map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 font-orbitron text-xs tracking-widest rounded"
              style={{
                color: tag.color,
                border: `1px solid ${tag.color}50`,
                background: `${tag.color}10`,
                boxShadow: `0 0 10px ${tag.color}20`,
              }}
            >
              {tag.label}
            </span>
          ))}
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-80 mx-auto mb-6"
        >
          <div className="flex justify-between mb-2">
            <span className="font-orbitron text-xs text-gray-600 tracking-widest">CARGANDO CIUDAD</span>
            <span className="font-orbitron text-xs text-cyan-400">{progress}%</span>
          </div>
          <div className="h-1 bg-gray-900 rounded overflow-hidden">
            <motion.div
              className="h-full rounded"
              style={{
                background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
                boxShadow: '0 0 10px #00ffff',
                width: `${progress}%`,
              }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>

        {/* Enter button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.button
            onClick={onEnter}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="px-10 py-4 font-orbitron font-black text-sm tracking-widest rounded transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(255,0,255,0.15))',
              border: '1px solid rgba(0,255,255,0.5)',
              color: '#00ffff',
              boxShadow: '0 0 30px rgba(0,255,255,0.3), 0 0 60px rgba(0,255,255,0.1)',
            }}
          >
            ▶ ENTRAR AL MUNDO
          </motion.button>
          <p className="text-xs font-rajdhani text-gray-600 mt-3 tracking-wider">
            Requiere teclado y mouse · Mejor en desktop
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}