import { motion } from 'framer-motion';

export default function TopNav({ activeView, onChangeView }) {
  return (
    <>
      {/* Brand — top left */}
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

        {/* Controls */}
        <div className="mt-7 flex flex-col gap-1.5">
          <div className="flex gap-1.5 items-center">
            <div className="w-4" />
            <div className="w-4 h-4 rounded-sm flex items-center justify-center"
              style={{ background: 'rgba(255,45,45,0.85)', boxShadow: '0 0 8px rgba(255,45,45,0.6)' }} />
            <span className="font-orbitron text-[9px] tracking-[0.25em] ml-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}>CONTROL</span>
          </div>
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-4 h-4 rounded-sm"
                style={{ background: 'rgba(255,45,45,0.85)', boxShadow: '0 0 8px rgba(255,45,45,0.6)' }} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center font-orbitron text-[8px]"
              style={{ border: '1px solid rgba(255,45,45,0.7)', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,45,45,0.15)' }}>
              E
            </div>
            <span className="font-orbitron text-[9px] tracking-[0.2em]"
              style={{ color: 'rgba(255,255,255,0.55)' }}>INTERACT</span>
          </div>
        </div>
      </motion.div>

      {/* ── Centered nav bar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}
      >
        <div
          className="flex items-center gap-1 rounded-full px-2 py-1.5"
          style={{
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,45,45,0.22)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 0 24px rgba(232,0,42,0.18)',
          }}
        >
          {[
            { id: 'explore', label: 'EXPLORE' },
            { id: 'works',   label: 'WORKS'   },
            { id: 'about',   label: 'ABOUT'   },
          ].map(({ id, label }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onChangeView(id)}
                className="px-5 py-1.5 rounded-full font-orbitron text-[10px] tracking-[0.26em] transition-all duration-200"
                style={active ? {
                  background: '#e8002a',
                  color: '#fff',
                  boxShadow: '0 0 18px rgba(232,0,42,0.6)',
                } : {
                  color: 'rgba(255,255,255,0.55)',
                  background: 'transparent',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
