import { motion } from 'framer-motion';
import WelcomeOverlayDistricts from './WelcomeOverlayDistricts';
import WelcomeOverlayStats from './WelcomeOverlayStats';

export default function WelcomeOverlay({ onEnter }) {
  return (
    <div className="fixed inset-0 z-[120] overflow-hidden bg-black/55 backdrop-blur-[10px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,0,170,0.16),transparent_30%),linear-gradient(180deg,rgba(3,4,10,0.82)_0%,rgba(6,3,16,0.92)_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />

      <div className="relative z-10 flex h-full items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-6xl rounded-[34px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(8,10,26,0.84),rgba(18,8,35,0.7))] p-4 shadow-[0_0_90px_rgba(0,255,255,0.08)] backdrop-blur-[26px] sm:p-6 lg:p-8"
        >
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 sm:p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 font-orbitron text-[10px] uppercase tracking-[0.32em] text-cyan-200/80">
                  Inmersive Portfolio Experience
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-rajdhani text-xs uppercase tracking-[0.24em] text-white/45">
                  Agency360 · Realtime City
                </div>
              </div>

              <h1 className="mt-6 max-w-3xl bg-gradient-to-r from-cyan-200 via-white to-fuchsia-300 bg-clip-text font-orbitron text-4xl font-black uppercase leading-[0.92] tracking-[0.08em] text-transparent sm:text-6xl lg:text-7xl">
                Nexus 360
              </h1>
              <p className="mt-6 max-w-2xl font-rajdhani text-lg leading-relaxed text-white/72 sm:text-xl">
                Entra en una ciudad interactiva donde cada zona muestra proyectos, motion, avatares, XR y experiencias digitales de Agency360.
              </p>

              <WelcomeOverlayStats />

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4">
                  <p className="font-orbitron text-[11px] uppercase tracking-[0.28em] text-cyan-300">Explore</p>
                  <p className="mt-2 font-rajdhani text-sm text-white/62">Recorre distritos y descubre stands interactivos.</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-300/15 bg-fuchsia-300/5 p-4">
                  <p className="font-orbitron text-[11px] uppercase tracking-[0.28em] text-fuchsia-300">Works</p>
                  <p className="mt-2 font-rajdhani text-sm text-white/62">Activa el modo showcase y enfoca piezas destacadas.</p>
                </div>
                <div className="rounded-2xl border border-violet-300/15 bg-violet-300/5 p-4">
                  <p className="font-orbitron text-[11px] uppercase tracking-[0.28em] text-violet-200">Play</p>
                  <p className="mt-2 font-rajdhani text-sm text-white/62">Interacciona con arcade, vídeo y elementos vivos.</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  onClick={onEnter}
                  className="rounded-full border border-cyan-300/55 bg-[linear-gradient(90deg,rgba(0,246,255,0.22),rgba(255,0,170,0.22))] px-8 py-4 font-orbitron text-xs uppercase tracking-[0.32em] text-white transition-all duration-300 hover:border-cyan-200 hover:shadow-[0_0_36px_rgba(0,255,255,0.18)]"
                >
                  Entrar a la ciudad
                </button>
                <p className="font-rajdhani text-sm text-white/45">Portfolio navegable · visual · inmersivo</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 sm:p-6">
                <p className="font-orbitron text-[11px] uppercase tracking-[0.3em] text-white/55">Controles</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">◉</div>
                    <p className="font-orbitron text-[10px] uppercase tracking-[0.28em] text-cyan-300/85">Mirar</p>
                    <p className="mt-2 font-rajdhani text-sm text-white/60">Usa ratón o dedo para orientar la cámara.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 grid w-fit grid-cols-3 gap-1 text-xs text-white/75">
                      <div />
                      <div className="flex h-7 w-7 items-center justify-center rounded border border-white/35">↑</div>
                      <div />
                      <div className="flex h-7 w-7 items-center justify-center rounded border border-white/35">←</div>
                      <div className="flex h-7 w-7 items-center justify-center rounded border border-white/35">↓</div>
                      <div className="flex h-7 w-7 items-center justify-center rounded border border-white/35">→</div>
                    </div>
                    <p className="font-orbitron text-[10px] uppercase tracking-[0.28em] text-fuchsia-300/85">Mover</p>
                    <p className="mt-2 font-rajdhani text-sm text-white/60">Avanza por la ciudad y entra en cada zona.</p>
                  </div>
                </div>
              </div>

              <WelcomeOverlayDistricts />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}