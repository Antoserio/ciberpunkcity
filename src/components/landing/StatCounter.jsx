import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export default function StatCounter({ stat, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const target = parseFloat(stat.value);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, stat.value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ delay: index * 0.1, type: 'spring' }}
      className="text-center"
    >
      <div className="bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 bg-clip-text text-5xl font-black text-transparent md:text-6xl">
        {Number.isInteger(parseFloat(stat.value)) ? Math.floor(count) : count.toFixed(1)}{stat.suffix}
      </div>
      <div className="mt-2 text-sm uppercase tracking-[0.22em] text-white/45">
        {stat.label}
      </div>
    </motion.div>
  );
}