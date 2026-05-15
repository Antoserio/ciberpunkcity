import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ServiceCard({ service, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 100, rotateX: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ delay: index * 0.15, duration: 0.8 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(4,8,20,0.94),rgba(12,16,34,0.82))] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:border-cyan-400/40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,255,255,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(217,70,239,0.12),transparent_35%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <motion.div whileHover={{ rotate: 360, scale: 1.15 }} transition={{ duration: 0.6 }} className="relative mb-6 text-6xl">
        {service.icon}
      </motion.div>
      <h3 className="relative mb-3 font-orbitron text-3xl font-black text-cyan-300 transition-colors group-hover:text-white">
        {service.title}
      </h3>
      <p className="relative text-lg leading-relaxed text-white/65 transition-colors group-hover:text-white/85">
        {service.desc}
      </p>
      <motion.div initial={{ x: 0, opacity: 0 }} whileHover={{ x: 10, opacity: 1 }} className="absolute bottom-8 right-8 text-2xl text-cyan-300">
        →
      </motion.div>
    </motion.article>
  );
}