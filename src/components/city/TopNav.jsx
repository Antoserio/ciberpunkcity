import { motion } from 'framer-motion';

export default function TopNav({ activeView, onChangeView }) {
  return (
    <>
      {/* Brand panel — top left, samsy style */}
      <motion.div
        initial={{ opacity: 0, x: -18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="fixed top-0 left-0 z-50 p-5 sm:p-7 pointer-events-none select-none"
      >
        <h1 className="font-orbitron text-2xl sm:text-[28px] font-black tracking-wider leading-none"
          style={{ color: '#ff2d2d', textShadow: '0 0 24px rgba(255,45,45,0.5)' }}>
          AGENCY<span style={{ color: '#ff6060' }}>°</span>360
        </h1>
        <p className="font-orbitron text-[9px] tracking-[0.22em] mt-1"
          style={{ color: 'rgba(255,80,80,0.65)' }}>
          クリエイティブシティ · ネクサス
        </p>
        <p className="font-rajdhani text-[11px] tracking-[0.18em] uppercase mt-1"
          style={{ color: 'rgba(255,255,255,0.82)' }}>
          Creative City Experience
        </p>
        <p className="font-rajdhani text-[10px] tracking-[0.12em] uppercase"
          style={{ color: 'rgba(255,255,255,0.62)' }}>
          Nexus 360 · Immersive Portfolio
        </p>

        {/* WASD control indicator — samsy style */}
        <div className="mt-7 flex flex-col gap-1.5">
          <div className="flex gap-1.5 items-center">
            {/* top dot (W) — centered */}
            <div className="w-4" />
            <div className="w-4 h-4 rounded-sm flex items-center justify-center"
              style={{ background: 'rgba(255,45,45,0.85)', boxShadow: '0 0 8px rgba(255,45,45,0.6)' }} />
            <span className="font-orbitron text-[9px] tracking-[0.25em] ml-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}>CONTROL</span>
          </div>
          <div className="flex gap-1.5 items-center">
            {/* ASD row */}
            {[0, 1, 2].map(i => (
              <div key={i} className="w-4 h-4 rounded-sm"
                style={{ background: 'rgba(255,45,45,0.85)', boxShadow: '0 0 8px rgba(255,45,45,0.6)' }} />
            ))}
          </div>

          {/* E — interact */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center font-orbitron text-[8px]"
              style={{
                border: '1px solid rgba(255,45,45,0.7)',
                color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,45,45,0.15)'
              }}>
              E
            </div>
            <span className="font-orbitron text-[9px] tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.55)' }}>INTERACT</span>
          </div>
        </div>
      </motion.div>

      {/* Center nav — EXPLORE pill + text links */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="fixed top-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-6"
      >
        <button
          onClick={() => onChangeView('explore')}
          className="px-6 py-2 rounded-full font-orbitron text-[10px] tracking-[0.28em] text-white transition-all duration-200"
          style={activeView === 'explore' ? {
            background: '#e8002a',
            boxShadow: '0 0 22px rgba(232,0,42,0.55)',
          } : {
            background: 'rgba(232,0,42,0.75)',
            boxShadow: '0 0 12px rgba(232,0,42,0.3)',
          }}
        >
          EXPLORE
        </button>

        <button
          onClick={() => onChangeView('works')}
          className="font-orbitron text-[10px] tracking-[0.28em] transition-colors duration-200"
          style={{ color: activeView === 'works' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)' }}
        >
          WORKS
        </button>

        <button
          onClick={() => onChangeView('about')}
          className="font-orbitron text-[10px] tracking-[0.28em] transition-colors duration-200"
          style={{ color: activeView === 'about' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.55)' }}
        >
          ABOUT
        </button>
      </motion.div>
    </>
  );
}
