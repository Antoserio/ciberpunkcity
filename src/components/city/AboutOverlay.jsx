import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AboutOverlay({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="mx-auto mt-20 max-w-3xl rounded-[2rem] border border-white/10 bg-[#070b15]/95 p-6 sm:p-8"
          >
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="font-orbitron text-[10px] tracking-[0.35em] text-cyan-300/80">AGENCY360 / ABOUT</p>
                <h2 className="mt-2 font-orbitron text-2xl text-white sm:text-4xl">About</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-[30px] border border-cyan-400/30 bg-[rgba(10,10,30,0.6)] p-8 sm:p-12 backdrop-blur-[20px]">
              <h3 className="mb-6 bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text font-orbitron text-3xl font-light tracking-[0.2em] text-transparent sm:text-4xl">
                AGENCY 360
              </h3>

              <div className="space-y-6 font-mono text-base leading-8 text-white/90 sm:text-lg">
                <p>
                  <strong className="text-cyan-300">LA UNIÓN PERFECTA:</strong><br />
                  Creativos + Técnicos = Experiencias Inmersivas Únicas
                </p>

                <p>
                  <strong className="text-fuchsia-400">IMMERSO + GIRASOMNIS</strong><br />
                  Dos agencias creativas líderes se han unido para crear el top absoluto en eventos inmersivos, tecnología audiovisual y experiencias digitales.
                </p>

                <p>
                  <strong className="text-yellow-300">NUESTRO ADN:</strong><br />
                  🎵 Música • 🎪 Eventos Inmersivos • 💻 Tecnología de Vanguardia<br />
                  🎨 Creatividad Visual • ⚡ Innovación Técnica
                </p>

                <p className="text-base text-white/70">
                  Transformamos ideas en experiencias inolvidables que fusionan el mundo físico y digital.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}