import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicLoader({ visible, progress = 0, status = 'Inicializando sistema', ready = false }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[140] overflow-hidden bg-black text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.12),transparent_45%),radial-gradient(circle_at_top,rgba(255,0,255,0.12),transparent_35%),linear-gradient(180deg,#02030a_0%,#05020f_45%,#000_100%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.15)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full animate-scan bg-[linear-gradient(180deg,transparent_0%,rgba(0,255,255,0.14)_48%,transparent_100%)]" />
          </div>

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="mb-3 font-rajdhani text-xs uppercase tracking-[0.5em] text-cyan-300/80">CyberpunkCity Boot Sequence</p>
            <h1 className="bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-violet-300 bg-clip-text font-orbitron text-4xl font-black tracking-[0.18em] text-transparent sm:text-6xl">
              NEXUS 360
            </h1>
            <p className="mt-4 font-rajdhani text-lg text-white/70">{status}</p>

            <div className="mt-10 w-full max-w-xl rounded-full border border-cyan-400/30 bg-white/5 p-2 backdrop-blur-md">
              <div className="h-4 overflow-hidden rounded-full bg-black/50">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#00f6ff_0%,#7c3aed_45%,#ff00aa_100%)] shadow-[0_0_24px_rgba(0,255,255,0.55)]"
                  animate={{ width: `${Math.max(progress, 4)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.35 }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 font-orbitron text-sm tracking-[0.3em] text-cyan-200/90">
              <span>{Math.round(progress)}%</span>
              <span className="text-white/35">|</span>
              <span>{ready ? 'READY' : 'LOADING'}</span>
            </div>

            <div className="mt-10 grid w-full max-w-2xl gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-left font-mono text-[11px] text-cyan-200/75 backdrop-blur-md sm:text-xs">
              <p>&gt; boot.sequence --env=city.render</p>
              <p>&gt; preload critical textures...</p>
              <p>&gt; initialize theatre timeline...</p>
              <p>&gt; decrypt neon district sectors...</p>
              <p>&gt; streaming district assets...</p>
              <p>&gt; syncing cinematic camera rig...</p>
              <p className="text-fuchsia-300/80">&gt; status: {status.toLowerCase()}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}