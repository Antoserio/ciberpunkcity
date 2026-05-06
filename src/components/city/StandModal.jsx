import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function StandModal({ stand, onClose }) {
  if (!stand) return null;
  const c = stand.color;

  return (
    <AnimatePresence>
      <motion.div
        key={stand.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,3,15,0.82)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative max-w-lg w-full mx-4 rounded border p-8"
          style={{
            background: `linear-gradient(135deg, rgba(3,4,20,0.98) 0%, ${c}12 100%)`,
            borderColor: c,
            boxShadow: `0 0 50px ${c}40, 0 0 100px ${c}15, inset 0 0 30px ${c}08`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* scanlines */}
          <div className="absolute inset-0 pointer-events-none rounded opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)',
            }}
          />

          {/* corner decorations */}
          {[['top-0 left-0','border-t-2 border-l-2'],['top-0 right-0','border-t-2 border-r-2'],['bottom-0 left-0','border-b-2 border-l-2'],['bottom-0 right-0','border-b-2 border-r-2']].map(([pos, cls], i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 ${cls}`} style={{ borderColor: c }} />
          ))}

          {/* close */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10 transition-colors">
            <X size={18} />
          </button>

          {/* header */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{stand.icon}</span>
              <div>
                <p className="font-orbitron text-xs tracking-widest mb-1" style={{ color: `${c}90` }}>
                  [{stand.key}] · PUESTO INTERACTIVO
                </p>
                <h2
                  className="font-orbitron text-2xl font-black tracking-widest"
                  style={{ color: c, textShadow: `0 0 20px ${c}` }}
                >
                  {stand.title}
                </h2>
              </div>
            </div>
            <p className="font-rajdhani text-sm tracking-widest" style={{ color: `${c}80` }}>
              {stand.subtitle}
            </p>
          </div>

          {/* divider */}
          <div className="relative z-10 mb-6 h-px" style={{ background: `linear-gradient(90deg, ${c}60, transparent)` }} />

          {/* description */}
          <p className="relative z-10 font-rajdhani text-lg text-gray-200 leading-relaxed mb-6">
            {stand.description}
          </p>

          {/* tags */}
          <div className="relative z-10 flex flex-wrap gap-2 mb-6">
            {stand.tags.map(tag => (
              <span
                key={tag}
                className="font-orbitron text-xs px-3 py-1 rounded tracking-widest"
                style={{
                  color: c,
                  border: `1px solid ${c}50`,
                  background: `${c}12`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* close hint */}
          <p className="relative z-10 text-center font-orbitron text-xs tracking-widest" style={{ color: `${c}50` }}>
            CLICK O ESC PARA CERRAR
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}