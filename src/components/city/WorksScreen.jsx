import { useEffect, useMemo, useState } from 'react';
import { STANDS } from './standsData';

const WORK_ITEMS = STANDS.filter((stand) => stand.type === 'video' || stand.type === 'showcase');

export default function WorksScreen({ onChangeActiveWork }) {
  const [activeId, setActiveId] = useState(WORK_ITEMS[0]?.id || '');
  const activeWork = useMemo(() => WORK_ITEMS.find((item) => item.id === activeId) || WORK_ITEMS[0], [activeId]);

  useEffect(() => {
    onChangeActiveWork?.(activeWork || null);
  }, [activeWork, onChangeActiveWork]);

  if (!activeWork) return null;

  return (
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
  );
}