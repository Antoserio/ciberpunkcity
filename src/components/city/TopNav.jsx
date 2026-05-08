import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'explore', label: 'EXPLORE' },
  { id: 'works', label: 'WORKS' },
  { id: 'about', label: 'ABOUT' },
];

export default function TopNav({ activeView, onChangeView }) {
  return (
    <div className="fixed top-5 left-1/2 z-50 -translate-x-1/2 px-3">
      <div className="flex items-center gap-2 rounded-full bg-black/35 px-2 py-1 shadow-[0_10px_35px_rgba(0,0,0,0.2)] backdrop-blur-md">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChangeView(item.id)}
              className={`rounded-full px-4 py-2 text-center font-orbitron text-[10px] tracking-[0.3em] transition sm:px-5 ${active ? 'bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.18)]' : 'text-white/72 hover:text-white'}`}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}