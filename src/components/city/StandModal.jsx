import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function VideoContent({ stand }) {
  const c = stand.color;
  return (
    <div className="relative z-10">
      <div
        className="relative rounded overflow-hidden mb-4"
        style={{ paddingBottom: '56.25%', background: '#000' }}
      >
        <iframe
          className="absolute inset-0 w-full h-full"
          src={stand.videoUrl}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function ShowcaseContent({ stand }) {
  const [idx, setIdx] = useState(0);
  const items = stand.showcaseItems;
  const c = stand.color;
  const item = items[idx];
  return (
    <div className="relative z-10">
      <div className="relative rounded overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
        <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.8), transparent)` }} />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="font-orbitron text-sm font-bold mb-1" style={{ color: c }}>{item.label}</p>
          <p className="font-rajdhani text-xs text-gray-300">{item.desc}</p>
        </div>
        {/* Nav arrows */}
        <button onClick={() => setIdx((idx - 1 + items.length) % items.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${c}50` }}>
          <ChevronLeft size={16} style={{ color: c }} />
        </button>
        <button onClick={() => setIdx((idx + 1) % items.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${c}50` }}>
          <ChevronRight size={16} style={{ color: c }} />
        </button>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-2">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{ background: i === idx ? c : `${c}40`, boxShadow: i === idx ? `0 0 8px ${c}` : 'none' }}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectsContent({ stand }) {
  const c = stand.color;
  return (
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
      {stand.projects.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded p-3 cursor-pointer transition-all hover:scale-[1.03]"
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.8), ${c}10)`,
            border: `1px solid ${c}40`,
            boxShadow: `0 0 15px ${c}15`,
          }}
        >
          <div className="text-2xl mb-2">{p.icon}</div>
          <p className="font-orbitron text-xs font-bold mb-0.5" style={{ color: c }}>{p.name}</p>
          <p className="font-rajdhani text-[10px] text-gray-500 mb-2">{p.cat}</p>
          <div className="space-y-1">
            {p.stats.map((s, j) => (
              <p key={j} className="font-rajdhani text-[11px]" style={{ color: `${c}cc` }}>{s}</p>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function StandModal({ stand, onClose }) {
  if (!stand) return null;
  const c = stand.color;

  const renderContent = () => {
    if (stand.type === 'video') return <VideoContent stand={stand} />;
    if (stand.type === 'showcase') return <ShowcaseContent stand={stand} />;
    if (stand.type === 'projects') return <ProjectsContent stand={stand} />;
    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        key={stand.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        style={{ background: 'rgba(0,3,15,0.88)', backdropFilter: 'blur(16px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.88, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative w-full rounded border overflow-hidden max-h-[88vh] overflow-y-auto"
          style={{
            maxWidth: stand.type === 'projects' ? '540px' : '600px',
            background: `linear-gradient(135deg, rgba(3,4,20,0.99) 0%, ${c}10 100%)`,
            borderColor: c,
            boxShadow: `0 0 60px ${c}50, 0 0 120px ${c}15`,
          }}
        >
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}
          />



          {/* Header */}
          <div className="relative z-10 px-4 sm:px-6 pt-4 sm:pt-5 pb-4 border-b flex items-start justify-between gap-3"
            style={{ borderColor: `${c}30` }}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{stand.icon}</span>
              <div>
                <p className="font-orbitron text-[10px] tracking-widest mb-0.5" style={{ color: `${c}80` }}>
                  [{stand.key}] · {stand.subtitle}
                </p>
                <h2 className="font-orbitron text-base sm:text-xl font-black tracking-widest"
                  style={{ color: c, textShadow: `0 0 20px ${c}` }}>
                  {stand.title}
                </h2>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors ml-4">
              <X size={20} />
            </button>
          </div>

          {/* Main content */}
          <div className="relative z-10 p-4 sm:p-6">
            {renderContent()}

            {/* Description */}
            <p className="font-rajdhani text-sm text-gray-300 leading-relaxed mt-4 mb-4">
              {stand.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {stand.tags.map(tag => (
                <span key={tag} className="font-orbitron text-[10px] px-2 py-1 rounded tracking-widest"
                  style={{ color: c, border: `1px solid ${c}50`, background: `${c}12` }}>
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open('mailto:info@agency360.com?subject=Interesado en ' + stand.title, '_blank')}
              className="w-full py-3 font-orbitron text-sm font-bold tracking-widest rounded transition-all"
              style={{
                background: `linear-gradient(135deg, ${c}25, ${c}40)`,
                border: `1px solid ${c}70`,
                color: c,
                boxShadow: `0 0 20px ${c}30`,
              }}
            onClick={(e) => e.stopPropagation()}
          >
              CONTACTAR SOBRE ESTE SERVICIO →
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}