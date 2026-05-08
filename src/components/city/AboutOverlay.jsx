import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';

export default function AboutOverlay({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="mx-auto mt-8 w-[min(96vw,1200px)] rounded-[2rem] border border-white/8 bg-[rgba(3,6,15,0.14)] p-5 sm:p-8 shadow-[0_0_80px_rgba(0,255,255,0.06)]"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-rajdhani text-[11px] font-semibold tracking-[0.5em] text-cyan-200/70">AGENCY360 / ABOUT</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_25%_20%,rgba(0,255,255,0.08),transparent_28%),radial-gradient(circle_at_75%_30%,rgba(255,0,255,0.08),transparent_28%),rgba(5,8,18,0.12)] p-6 sm:p-10 backdrop-blur-[10px]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />

              <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                <div className="max-w-2xl">
                  <p className="mb-3 font-rajdhani text-sm font-bold uppercase tracking-[0.45em] text-fuchsia-300/85">Immerso + Girasomnis</p>
                  <h2 className="max-w-[8ch] font-rajdhani text-6xl font-bold uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-8xl lg:text-[7rem]">
                    ABOUT
                  </h2>
                  <p className="mt-6 max-w-xl font-rajdhani text-base leading-7 text-cyan-100/88 sm:text-lg sm:leading-8">
                    Diseñamos experiencias inmersivas donde la creatividad, la tecnología y el lenguaje visual se encuentran para crear algo memorable.
                  </p>
                  <p className="mt-4 max-w-xl font-rajdhani text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
                    We build immersive experiences where creative direction, technology and visual storytelling become one clear, powerful language.
                  </p>

                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 font-rajdhani text-xs font-bold uppercase tracking-[0.35em] text-cyan-200">ES</p>
                      <p className="font-rajdhani text-sm leading-6 text-white/82 sm:text-base sm:leading-7">
                        Eventos inmersivos, tecnología audiovisual, entornos digitales, piezas visuales y experiencias híbridas con sensibilidad artística y precisión técnica.
                      </p>
                    </div>
                    <div>
                      <p className="mb-2 font-rajdhani text-xs font-bold uppercase tracking-[0.35em] text-fuchsia-300">EN</p>
                      <p className="font-rajdhani text-sm leading-6 text-white/82 sm:text-base sm:leading-7">
                        Immersive events, audiovisual technology, digital environments, visual pieces and hybrid experiences shaped with artistic sensitivity and technical precision.
                      </p>
                    </div>
                  </div>

                  <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                    <a href="mailto:info@immerso.live" className="flex items-center gap-3 font-rajdhani text-base text-white/90 transition hover:text-cyan-200">
                      <Mail size={18} className="text-cyan-200" />
                      info@immerso.live
                    </a>
                    <a href="mailto:info@girasomnis.com" className="flex items-center gap-3 font-rajdhani text-base text-white/90 transition hover:text-fuchsia-300">
                      <Mail size={18} className="text-fuchsia-300" />
                      info@girasomnis.com
                    </a>
                  </div>
                </div>

                <div className="relative flex min-h-[340px] items-end justify-center lg:min-h-[560px]">
                  <div className="absolute inset-x-[18%] bottom-6 h-24 rounded-full bg-cyan-300/20 blur-3xl" />
                  <img
                    src="https://base44.app/api/apps/69fa345f1e88257c77c4e49b/files/mp/public/69fa345f1e88257c77c4e49b/3afd5ce0c_robotpequeo.glb"
                    alt="Agency360 robot"
                    className="hidden"
                  />
                  <div className="relative flex h-[320px] w-[220px] items-end justify-center sm:h-[420px] sm:w-[280px] lg:h-[520px] lg:w-[340px]">
                    <div className="absolute inset-0 rounded-[999px] border border-cyan-300/15 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.12),rgba(0,255,255,0.06)_32%,transparent_68%)] blur-[2px]" />
                    <div className="absolute top-[12%] h-16 w-16 rounded-full border border-cyan-200/40 bg-cyan-100/10 shadow-[0_0_35px_rgba(0,255,255,0.22)] sm:h-20 sm:w-20 lg:h-24 lg:w-24" />
                    <div className="absolute top-[24%] h-28 w-20 rounded-[999px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(0,255,255,0.05))] shadow-[0_0_40px_rgba(255,255,255,0.08)] sm:h-36 sm:w-24 lg:h-44 lg:w-28" />
                    <div className="absolute top-[30%] left-[8%] h-3 w-20 rounded-full bg-cyan-200/70 shadow-[0_0_24px_rgba(0,255,255,0.45)] sm:w-28 lg:left-[6%] lg:w-32" />
                    <div className="absolute top-[30%] right-[8%] h-3 w-20 rounded-full bg-fuchsia-300/70 shadow-[0_0_24px_rgba(255,0,255,0.4)] sm:w-28 lg:right-[6%] lg:w-32" />
                    <div className="absolute top-[54%] left-[22%] h-28 w-3 rounded-full bg-cyan-100/70 shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:h-36 lg:h-44" />
                    <div className="absolute top-[54%] right-[22%] h-28 w-3 rounded-full bg-cyan-100/70 shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:h-36 lg:h-44" />
                    <div className="absolute bottom-[10%] left-[34%] h-24 w-3 rounded-full bg-white/65 shadow-[0_0_20px_rgba(255,255,255,0.18)] sm:h-28 lg:h-36" />
                    <div className="absolute bottom-[10%] right-[34%] h-24 w-3 rounded-full bg-white/65 shadow-[0_0_20px_rgba(255,255,255,0.18)] sm:h-28 lg:h-36" />
                    <div className="absolute top-[15%] flex gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(0,255,255,0.9)]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-fuchsia-300 shadow-[0_0_14px_rgba(255,0,255,0.85)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}