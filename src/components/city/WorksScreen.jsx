import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { STANDS } from './standsData';

const WORK_ITEMS = STANDS.filter((stand) => stand.type === 'video' || stand.type === 'showcase');

export default function WorksScreen() {
  const [activeId, setActiveId] = useState(WORK_ITEMS[0]?.id || '');
  const activeWork = useMemo(() => WORK_ITEMS.find((item) => item.id === activeId) || WORK_ITEMS[0], [activeId]);

  if (!activeWork) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center px-4 pt-24 pb-20 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="pointer-events-auto w-full max-w-5xl"
      >
        <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2rem] border border-red-500/20 bg-black/35 shadow-[0_0_80px_rgba(255,0,80,0.18)] backdrop-blur-sm">
          <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[380px] bg-black md:min-h-[520px]">
              {activeWork.type === 'video' ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={activeWork.videoUrl}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={activeWork.title}
                />
              ) : (
                <img
                  src={activeWork.showcaseItems?.[0]?.img}
                  alt={activeWork.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/15 to-transparent" />
              <div className="absolute left-6 bottom-6 max-w-md">
                <p className="font-rajdhani text-xs uppercase tracking-[0.35em] text-white/70">Featured work</p>
                <h2 className="mt-3 font-orbitron text-4xl text-[#ff315f] sm:text-6xl">{activeWork.title}</h2>
                <p className="mt-3 font-rajdhani text-sm text-white/80 sm:text-base">{activeWork.description}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[linear-gradient(180deg,rgba(10,8,18,0.9),rgba(20,8,14,0.95))] p-6">
              <div>
                <p className="font-orbitron text-[10px] tracking-[0.35em] text-cyan-300/80">WORKS / SCREEN</p>
                <p className="mt-4 font-orbitron text-2xl text-white">{activeWork.subtitle}</p>
                <div className="mt-6 space-y-3">
                  {activeWork.tags?.map((tag) => (
                    <div key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-orbitron text-[10px] tracking-[0.25em] text-white/80">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="font-rajdhani text-xs uppercase tracking-[0.35em] text-white/50">Display</p>
                <p className="mt-2 font-rajdhani text-sm leading-relaxed text-white/80">Usa la barra inferior para cambiar el trabajo que aparece en la gran pantalla central.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-auto fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-black/60 px-3 py-3 backdrop-blur-xl">
          {WORK_ITEMS.map((item) => {
            const active = item.id === activeWork.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`rounded-full px-4 py-2 font-orbitron text-[10px] tracking-[0.22em] transition ${active ? 'bg-[#ff315f] text-white' : 'bg-white/5 text-white/65 hover:bg-white/10'}`}
              >
                {item.key} {item.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}