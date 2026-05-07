import { useMemo, useState } from 'react';
import { STANDS } from './standsData';

const WORK_ITEMS = STANDS.filter((stand) => stand.type === 'video' || stand.type === 'showcase');

export default function WorksScreen() {
  const [activeId, setActiveId] = useState(WORK_ITEMS[0]?.id || '');
  const activeWork = useMemo(() => WORK_ITEMS.find((item) => item.id === activeId) || WORK_ITEMS[0], [activeId]);

  if (!activeWork) return null;

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-[28%] z-40 w-[min(38vw,420px)] -translate-x-1/2">
        <div className="relative aspect-[16/9] overflow-hidden border border-cyan-400/20 bg-black shadow-[0_0_40px_rgba(0,255,255,0.18)]">
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
        </div>
      </div>

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
    </>
  );
}