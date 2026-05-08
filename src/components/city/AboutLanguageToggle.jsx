import { motion } from 'framer-motion';

export default function AboutLanguageToggle({ language, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-black/25 p-1 backdrop-blur-md">
      {[
        { id: 'es', label: 'ES' },
        { id: 'en', label: 'EN' },
      ].map((item) => {
        const active = language === item.id;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(item.id)}
            className={`rounded-full px-4 py-2 font-rajdhani text-xs font-bold uppercase tracking-[0.28em] transition ${active ? 'bg-white text-black' : 'text-white/65 hover:text-white'}`}
          >
            {item.label}
          </motion.button>
        );
      })}
    </div>
  );
}