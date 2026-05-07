import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'explore', label: 'EXPLORE' },
  { id: 'works', label: 'WORKS' },
  { id: 'about', label: 'ABOUT' },
];

export default function TopNav({ activeView, onChangeView }) {
  return (
    <div className="fixed top-4 left-1/2 z-40 -translate-x-1/2 px-3">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChangeView(item.id)}
              className={`rounded-full px-4 py-2 font-orbitron text-[10px] tracking-[0.28em] transition sm:px-5 ${active ? 'bg-[#ff225f] text-white' : 'text-cyan-200 hover:bg-white/10'}`}
            >
              {item.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}