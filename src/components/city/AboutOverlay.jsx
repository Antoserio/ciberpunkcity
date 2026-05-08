import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import AboutLanguageToggle from './AboutLanguageToggle';
import { ABOUT_CONTENT } from './aboutContent';

export default function AboutOverlay({ open, onClose }) {
  const [language, setLanguage] = useState('es');
  const content = useMemo(() => ABOUT_CONTENT[language], [language]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="mx-auto mt-8 w-[min(96vw,1200px)] rounded-[2rem] border border-white/8 bg-[rgba(3,6,15,0.14)] p-5 sm:p-8 shadow-[0_0_80px_rgba(0,255,255,0.06)]"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-rajdhani text-[11px] font-bold uppercase tracking-[0.5em] text-cyan-200/70">AGENCY360 / ABOUT</p>
              </div>
              <div className="flex items-center gap-3">
                <AboutLanguageToggle language={language} onChange={setLanguage} />
                <button
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white transition hover:border-cyan-400/50 hover:text-cyan-300"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_25%_20%,rgba(0,255,255,0.08),transparent_28%),radial-gradient(circle_at_75%_30%,rgba(255,0,255,0.08),transparent_28%),rgba(5,8,18,0.12)] p-6 sm:p-10 backdrop-blur-[10px]">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_18%,transparent_82%,rgba(255,255,255,0.03))]" />

              <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
                <div className="max-w-2xl">
                  <p className="mb-3 font-rajdhani text-sm font-bold uppercase tracking-[0.45em] text-fuchsia-300/85">{content.eyebrow}</p>
                  <h2 className="max-w-[8ch] font-rajdhani text-6xl font-bold uppercase leading-[0.88] tracking-[-0.04em] text-white sm:text-8xl lg:text-[7rem]">
                    {content.title}
                  </h2>
                  <p className="mt-6 max-w-xl font-rajdhani text-2xl font-bold uppercase leading-[1.05] tracking-[-0.03em] text-cyan-100/92 sm:text-3xl lg:text-4xl">
                    {content.lead}
                  </p>
                  <p className="mt-6 max-w-xl font-rajdhani text-lg font-bold uppercase leading-[1.25] tracking-[0.02em] text-white/78 sm:text-xl lg:text-2xl">
                    {content.body}
                  </p>
                </div>

                <div className="relative flex min-h-[340px] items-center justify-center lg:min-h-[560px]">
                  <div className="absolute inset-x-[18%] bottom-10 h-24 rounded-full bg-cyan-300/20 blur-3xl" />
                  <motion.div
                    animate={{ y: [0, -18, 0], x: [0, 6, 0, -6, 0], rotateZ: [0, 2, 0, -2, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative h-[260px] w-[260px] sm:h-[320px] sm:w-[320px] lg:h-[380px] lg:w-[380px]"
                  >
                    <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/40 bg-[radial-gradient(circle_at_35%_35%,rgba(255,255,255,0.9),rgba(0,255,255,0.2)_45%,rgba(3,8,20,0.9)_70%)] shadow-[0_0_35px_rgba(0,255,255,0.24)] sm:h-28 sm:w-28 lg:h-32 lg:w-32" />
                    <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 shadow-[0_0_20px_rgba(255,255,255,0.12)]" />
                    <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(0,255,255,0.9)]" />

                    <div className="absolute left-[8%] top-1/2 h-2.5 w-[32%] -translate-y-1/2 rounded-full bg-cyan-200/75 shadow-[0_0_24px_rgba(0,255,255,0.45)]" />
                    <div className="absolute right-[8%] top-1/2 h-2.5 w-[32%] -translate-y-1/2 rounded-full bg-fuchsia-300/75 shadow-[0_0_24px_rgba(255,0,255,0.4)]" />
                    <div className="absolute left-1/2 top-[10%] h-[32%] w-2.5 -translate-x-1/2 rounded-full bg-cyan-100/75 shadow-[0_0_20px_rgba(255,255,255,0.18)]" />
                    <div className="absolute left-1/2 bottom-[10%] h-[32%] w-2.5 -translate-x-1/2 rounded-full bg-cyan-100/75 shadow-[0_0_20px_rgba(255,255,255,0.18)]" />

                    <div className="absolute left-[6%] top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-cyan-200/40 bg-cyan-100/10 shadow-[0_0_30px_rgba(0,255,255,0.24)] sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
                    <div className="absolute right-[6%] top-1/2 h-12 w-12 -translate-y-1/2 rounded-full border border-fuchsia-300/40 bg-fuchsia-200/10 shadow-[0_0_30px_rgba(255,0,255,0.22)] sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
                    <div className="absolute left-1/2 top-[6%] h-12 w-12 -translate-x-1/2 rounded-full border border-cyan-200/35 bg-cyan-100/10 shadow-[0_0_30px_rgba(0,255,255,0.18)] sm:h-14 sm:w-14 lg:h-16 lg:w-16" />
                    <div className="absolute bottom-[6%] left-1/2 h-12 w-12 -translate-x-1/2 rounded-full border border-white/20 bg-white/5 shadow-[0_0_28px_rgba(255,255,255,0.14)] sm:h-14 sm:w-14 lg:h-16 lg:w-16" />

                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-[13%] rounded-full border border-cyan-300/15"
                    />
                  </motion.div>
                </div>
              </div>

              <div className="relative mt-14 flex justify-start pb-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = language === 'es' ? 'mailto:info@immerso.live' : 'mailto:info@girasomnis.com';
                  }}
                  className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-black/35 px-6 py-4 font-rajdhani text-sm font-bold uppercase tracking-[0.28em] text-white transition hover:border-cyan-300/50 hover:text-cyan-200"
                >
                  <Mail size={16} className="text-cyan-200" />
                  {content.contact}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}