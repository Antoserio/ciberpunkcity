import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { STANDS } from './standsData';

const WORK_ITEMS = STANDS.filter((stand) => stand.type === 'video' || stand.type === 'showcase');

export default function WorksScreen() {
  const [activeId, setActiveId] = useState(WORK_ITEMS[0]?.id || '');
  const activeWork = useMemo(() => WORK_ITEMS.find((item) => item.id === activeId) || WORK_ITEMS[0], [activeId]);

  if (!activeWork) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-1/2 top-[22%] w-[min(56vw,620px)] -translate-x-1/2 pointer-events-auto"
      >
        <div className="overflow-hidden rounded-[1.6rem] border border-red-500/30 bg-black/30 shadow-[0_0_80px_rgba(255,0,90,0.16)] backdrop-blur-sm">
          <div className="grid md:grid-cols-[1.2fr_0.8fr]">
            <div className="relative min-h-[220px] bg-black md:min-h-[300px]">
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
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />
              <div className="absolute left-5 bottom-5 max-w-[70%]">
                <p className="font-rajdhani text-[11px] uppercase tracking-[0.35em] text-white/65">Works showcase</p>
                <h2 className="mt-2 font-orbitron text-3xl text-[#ff315f] sm:text-5xl">{activeWork.title}</h2>
                <p className="mt-2 font-rajdhani text-xs text-white/80 sm:text-sm">{activeWork.description}</p>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-[linear-gradient(180deg,rgba(9,8,16,0.9),rgba(20,8,14,0.96))] p-5">
              <div>
                <p className="font-orbitron text-[10px] tracking-[0.35em] text-cyan-300/80">WORKS / DISPLAY</p>
                <p className="mt-3 font-orbitron text-xl text-white sm:text-2xl">{activeWork.subtitle}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {activeWork.tags?.map((tag) => (
                    <div key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-orbitron text-[10px] tracking-[0.22em] text-white/75">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="font-rajdhani text-[11px] uppercase tracking-[0.35em] text-white/50">Orden visual</p>
                <p className="mt-2 font-rajdhani text-sm leading-relaxed text-white/80">Las obras se muestran centradas en la gran pantalla y puedes recorrerlas desde la barra inferior.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-auto fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[min(90vw,980px)]">
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-red-500/20 bg-black/60 px-3 py-3 backdrop-blur-xl">
          {WORK_ITEMS.map((item, index) => {
            const active = item.id === activeWork.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`rounded-full px-4 py-2 font-orbitron text-[10px] tracking-[0.22em] transition ${active ? 'bg-[#ff315f] text-white shadow-[0_0_18px_rgba(255,49,95,0.45)]' : 'bg-white/5 text-white/65 hover:bg-white/10'}`}
              >
                {String(index + 1).padStart(2, '0')} · {item.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}