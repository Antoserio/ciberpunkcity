import { motion } from 'framer-motion';
import { useRef } from 'react';

const NAV_ITEMS = [
  { id: 'explore', label: 'EXPLORE' },
  { id: 'works', label: 'WORKS' },
  { id: 'about', label: 'ABOUT' },
];

export default function TopNav({ activeView, onChangeView }) {
  const pressTimerRef = useRef(null);

  const handleWorksClick = () => {
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => onChangeView('works'), 0);
  };

  return (
    <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 px-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(6,8,20,0.68)] px-2 py-1 shadow-[0_10px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => item.id === 'works' ? handleWorksClick() : onChangeView(item.id)}
              className={`rounded-full px-4 py-2 text-center font-orbitron text-[10px] tracking-[0.3em] transition sm:px-5 ${active ? 'bg-[linear-gradient(90deg,rgba(0,246,255,0.95),rgba(255,255,255,0.92))] text-black shadow-[0_0_28px_rgba(0,255,255,0.22)]' : 'text-white/72 hover:text-white'}`}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}