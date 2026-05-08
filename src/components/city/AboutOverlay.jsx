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
            className="mx-auto mt-20 max-w-3xl rounded-[2rem] border border-white/10 bg-[rgba(6,10,20,0.18)] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,255,255,0.08)]"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="font-rajdhani text-[11px] font-semibold tracking-[0.45em] text-cyan-200/80">AGENCY360 / ABOUT</p>
                <h2 className="mt-2 bg-gradient-to-r from-cyan-200 via-white to-fuchsia-300 bg-clip-text font-rajdhani text-3xl font-bold uppercase tracking-[0.18em] text-transparent sm:text-5xl">About</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-[30px] border border-cyan-300/20 bg-[rgba(7,12,24,0.14)] p-8 sm:p-12 backdrop-blur-[14px]">
              <h3 className="mb-6 bg-gradient-to-r from-cyan-200 via-white to-fuchsia-300 bg-clip-text font-rajdhani text-3xl font-bold uppercase tracking-[0.24em] text-transparent sm:text-4xl">
                Agency 360
              </h3>

              <div className="space-y-7 font-rajdhani text-lg leading-8 text-white/90 sm:text-[1.35rem] sm:leading-9">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">ES</p>
                  <p>
                    <strong className="text-cyan-200">LA UNIÓN PERFECTA:</strong><br />
                    Creativos + técnicos = experiencias inmersivas únicas.
                  </p>
                  <p className="mt-4">
                    <strong className="text-fuchsia-300">IMMERSO + GIRASOMNIS</strong><br />
                    Dos agencias creativas unidas para crear eventos inmersivos, tecnología audiovisual y experiencias digitales con una visión artística y técnica.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">EN</p>
                  <p>
                    <strong className="text-cyan-200">THE PERFECT UNION:</strong><br />
                    Creatives + technologists = unique immersive experiences.
                  </p>
                  <p className="mt-4">
                    <strong className="text-fuchsia-300">IMMERSO + GIRASOMNIS</strong><br />
                    Two creative studios working together to build immersive events, audiovisual technology and digital experiences with both artistic and technical direction.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="mb-3 text-sm font-bold uppercase tracking-[0.28em] text-cyan-200">Contact</p>
                  <div className="space-y-3 text-base sm:text-lg">
                    <a href="mailto:info@immerso.live" className="flex items-center gap-3 text-white/90 transition hover:text-cyan-200">
                      <Mail size={18} className="text-cyan-200" />
                      info@immerso.live
                    </a>
                    <a href="mailto:info@girasomnis.com" className="flex items-center gap-3 text-white/90 transition hover:text-fuchsia-300">
                      <Mail size={18} className="text-fuchsia-300" />
                      info@girasomnis.com
                    </a>
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