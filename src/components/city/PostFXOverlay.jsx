import { motion } from 'framer-motion';

export default function PostFXOverlay({ focusPulse = 0 }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[58] bg-[radial-gradient(circle_at_center,transparent_0%,transparent_45%,rgba(0,0,0,0.18)_100%)] opacity-80" />
      <div className="pointer-events-none fixed inset-0 z-[59] opacity-[0.05] mix-blend-screen [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.5)_0px,rgba(255,255,255,0.5)_1px,transparent_1px,transparent_4px)]" />
      <motion.div
        animate={{ opacity: 0.08 + focusPulse * 0.12 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="pointer-events-none fixed inset-0 z-[60] bg-[radial-gradient(circle_at_center,rgba(120,220,255,0.22)_0%,rgba(120,220,255,0.08)_16%,transparent_42%)]"
      />
      <div className="pointer-events-none fixed inset-0 z-[61] bg-[radial-gradient(circle_at_top,rgba(40,110,255,0.10),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,0,170,0.08),transparent_30%)]" />
    </>
  );
}