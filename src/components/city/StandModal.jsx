import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ProjectsContent, ShowcaseContent, VideoContent } from './StandModalMedia';

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
          className="relative w-full max-h-[88vh] overflow-y-auto rounded-[30px] border"
          style={{
            maxWidth: stand.type === 'projects' ? '880px' : '980px',
            background: `linear-gradient(135deg, rgba(3,4,20,0.99) 0%, ${c}10 100%)`,
            borderColor: `${c}88`,
            boxShadow: `0 0 60px ${c}40, 0 0 120px ${c}12`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)' }}
          />

          <div className="relative z-10 border-b px-5 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-6" style={{ borderColor: `${c}28` }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl">
                  {stand.icon}
                </div>
                <div>
                  <p className="font-orbitron text-[10px] uppercase tracking-[0.28em]" style={{ color: `${c}88` }}>
                    [{stand.key}] · {stand.subtitle}
                  </p>
                  <h2 className="mt-2 font-orbitron text-xl font-black uppercase tracking-[0.16em] sm:text-3xl" style={{ color: c, textShadow: `0 0 20px ${c}` }}>
                    {stand.title}
                  </h2>
                  <p className="mt-3 max-w-2xl font-rajdhani text-sm leading-relaxed text-white/66 sm:text-base">
                    {stand.description}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full border border-white/10 bg-black/20 p-2 text-white/55 transition hover:text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="relative z-10 grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              {renderContent()}
            </div>

            <div className="space-y-5">
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
                <p className="font-orbitron text-[10px] uppercase tracking-[0.28em] text-white/45">Keywords</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {stand.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-2 font-orbitron text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: c, border: `1px solid ${c}50`, background: `${c}14` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
                <p className="font-orbitron text-[10px] uppercase tracking-[0.28em] text-white/45">Project pulse</p>
                <div className="mt-4 space-y-3 font-rajdhani text-sm text-white/70">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Experiencia visual enfocada a impacto, presentación y engagement.</div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Diseño inmersivo con narrativa, motion y presencia escénica.</div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">Formato listo para activaciones, eventos o showroom digital.</div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open('mailto:info@agency360.com?subject=Interesado en ' + stand.title, '_blank');
                }}
                className="w-full rounded-full py-4 font-orbitron text-sm font-bold uppercase tracking-[0.24em] transition-all"
                style={{
                  background: `linear-gradient(135deg, ${c}28, ${c}46)`,
                  border: `1px solid ${c}70`,
                  color: c,
                  boxShadow: `0 0 20px ${c}28`,
                }}
              >
                Contactar sobre este servicio →
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}