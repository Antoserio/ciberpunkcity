import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function VikyModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
            >
              <X size={20} />
            </button>

            <iframe
              src="https://vikydj.netlify.app/"
              title="Viky"
              className="h-full w-full border-0"
              allow="camera; microphone; autoplay; fullscreen"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}