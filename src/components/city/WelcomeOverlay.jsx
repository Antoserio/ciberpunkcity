import { motion } from 'framer-motion';

export default function WelcomeOverlay({ onEnter }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      className="fixed inset-0 z-[120] flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)' }}
    >
      {/* Subtle scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 4px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="text-center px-6 pointer-events-auto"
      >
        {/* Brand */}
        <p className="font-orbitron text-[11px] tracking-[0.4em] mb-4"
          style={{ color: 'rgba(255,60,60,0.7)' }}>
          クリエイティブシティ · NEXUS 360
        </p>

        <h1 className="font-orbitron font-black leading-none mb-2"
          style={{
            fontSize: 'clamp(3rem, 10vw, 7rem)',
            color: '#ff2d2d',
            textShadow: '0 0 60px rgba(255,45,45,0.45), 0 0 120px rgba(255,45,45,0.2)',
            letterSpacing: '0.06em',
          }}>
          AGENCY<br />
          <span style={{ color: '#fff', textShadow: '0 0 40px rgba(255,255,255,0.3)' }}>360</span>
        </h1>

        <p className="font-rajdhani text-sm sm:text-base tracking-[0.28em] uppercase mt-6 mb-10"
          style={{ color: 'rgba(255,255,255,0.38)' }}>
          Creative City Experience &nbsp;·&nbsp; Immersive Portfolio
        </p>

        {/* Enter button */}
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(232,0,42,0.6)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnter}
          className="font-orbitron text-[11px] tracking-[0.35em] uppercase text-white px-10 py-4 rounded-full transition-all duration-200"
          style={{
            background: '#e8002a',
            boxShadow: '0 0 28px rgba(232,0,42,0.45)',
          }}
        >
          EXPLORAR
        </motion.button>

        {/* Controls hint */}
        <p className="font-rajdhani text-[11px] tracking-[0.2em] uppercase mt-6"
          style={{ color: 'rgba(255,255,255,0.22)' }}>
          WASD / flechas para mover &nbsp;·&nbsp; ratón para mirar
        </p>
      </motion.div>
    </motion.div>
  );
}
