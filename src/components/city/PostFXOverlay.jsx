import { motion } from 'framer-motion';

export default function PostFXOverlay({ focusPulse = 0 }) {
  return (
    <>
      {/* Vignette — strong, dark edges like samsy */}
      <div
        className="pointer-events-none fixed inset-0 z-[58]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.35) 65%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* Scanlines — subtle but visible */}
      <div
        className="pointer-events-none fixed inset-0 z-[59]"
        style={{
          opacity: 0.07,
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.55) 0px, rgba(255,255,255,0.55) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Chromatic aberration fringe — top and bottom edges */}
      <div
        className="pointer-events-none fixed inset-0 z-[60]"
        style={{
          background: [
            'linear-gradient(to bottom, rgba(255,0,60,0.06) 0%, transparent 6%)',
            'linear-gradient(to top, rgba(0,200,255,0.06) 0%, transparent 6%)',
            'linear-gradient(to right, rgba(255,0,80,0.04) 0%, transparent 4%)',
            'linear-gradient(to left, rgba(0,180,255,0.04) 0%, transparent 4%)',
          ].join(', '),
        }}
      />

      {/* Bloom pulse on arcade focus */}
      <motion.div
        animate={{ opacity: 0.06 + focusPulse * 0.14 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="pointer-events-none fixed inset-0 z-[61]"
        style={{
          background: 'radial-gradient(circle at center, rgba(100,200,255,0.25) 0%, rgba(100,200,255,0.06) 18%, transparent 45%)',
        }}
      />

      {/* Film grain — animated noise overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[62] animate-[grain_0.18s_steps(1)_infinite]"
        style={{
          opacity: 0.055,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Top edge dark bar */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[63]"
        style={{
          height: '3rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        }}
      />
    </>
  );
}
