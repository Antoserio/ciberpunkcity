import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import { STANDS } from './standsData';

const workItems = STANDS.filter((stand) => stand.type === 'video' || stand.type === 'showcase');

export default function WorksOverlay({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"
        >
          <div className="absolute inset-0 scanlines opacity-20" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="relative mx-auto flex h-full max-w-6xl flex-col px-4 py-6 sm:px-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="font-orbitron text-[10px] tracking-[0.35em] text-cyan-300/80">AGENCY360 / WORKS</p>
                <h2 className="mt-2 font-orbitron text-2xl text-white sm:text-4xl">Obras y vídeos</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid flex-1 gap-4 overflow-y-auto pb-4 md:grid-cols-2 xl:grid-cols-3">
              {workItems.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#070b15]/95"
                >
                  <div className="relative aspect-video bg-black">
                    {item.type === 'video' ? (
                      <iframe
                        className="h-full w-full"
                        src={item.videoUrl}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={item.title}
                      />
                    ) : (
                      <img src={item.showcaseItems?.[0]?.img} alt={item.title} className="h-full w-full object-cover" />
                    )}
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 font-orbitron text-[10px] tracking-[0.25em] text-white">
                      <Play size={12} /> {item.key}
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    <h3 className="font-orbitron text-sm tracking-[0.2em]" style={{ color: item.color }}>
                      {item.title}
                    </h3>
                    <p className="font-rajdhani text-sm leading-relaxed text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}