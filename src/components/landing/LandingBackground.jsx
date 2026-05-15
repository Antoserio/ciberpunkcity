import { motion } from 'framer-motion';

export default function LandingBackground() {
  return (
    <>
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 landing-grid" />
      </div>

      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400"
            style={{ left: `${(i * 17) % 100}%`, top: `${(i * 29) % 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3 + (i % 5) * 0.35, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
    </>
  );
}