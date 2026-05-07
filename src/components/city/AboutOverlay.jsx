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

            <div className="rounded-3xl border border-dashed border-cyan-400/20 bg-cyan-400/5 p-8 text-center">
              <p className="font-orbitron text-sm tracking-[0.25em] text-cyan-300">SECCIÓN EN PREPARACIÓN</p>
              <p className="mt-3 font-rajdhani text-base text-slate-300">Aquí dejaremos el contenido de About cuando queráis completarlo.</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}