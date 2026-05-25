import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Zap, Globe, Cpu, Layers } from 'lucide-react';
import AboutLanguageToggle from './AboutLanguageToggle';
import { ABOUT_CONTENT } from './aboutContent';

const SERVICES_ES = [
  { icon: Zap,    label: 'SHOWS EN VIVO',   desc: 'Danza, violín y efectos digitales en directo' },
  { icon: Globe,  label: 'EVENTOS 360°',     desc: 'Producción audiovisual inmersiva completa'    },
  { icon: Cpu,    label: 'TECH INTERACTIVA', desc: 'LiDAR, IA, avatares y xR de última gen.'      },
  { icon: Layers, label: 'VIDEO MAPPING',    desc: 'Escenografía digital de alto impacto'          },
];
const SERVICES_EN = [
  { icon: Zap,    label: 'LIVE SHOWS',       desc: 'Dance, violin and digital FX live on stage'   },
  { icon: Globe,  label: '360° EVENTS',      desc: 'Full immersive audiovisual production'         },
  { icon: Cpu,    label: 'INTERACTIVE TECH', desc: 'LiDAR, AI, avatars and next-gen xR'           },
  { icon: Layers, label: 'VIDEO MAPPING',    desc: 'High-impact digital scenography'               },
];

const STATS = [
  { value: '57',   label: 'IDIOMAS · AI' },
  { value: '360°', label: 'PRODUCCIÓN'   },
  { value: '100+', label: 'EVENTOS'      },
];

export default function AboutOverlay({ open, onClose }) {
  const [language, setLanguage] = useState('es');
  const content  = useMemo(() => ABOUT_CONTENT[language], [language]);
  const services = language === 'es' ? SERVICES_ES : SERVICES_EN;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="about-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          style={{ background: 'rgba(0,3,15,0.92)', backdropFilter: 'blur(20px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.88, y: 32, opacity: 0 }}
            animate={{ scale: 1,    y: 0,  opacity: 1 }}
            exit={{   scale: 0.9,   y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-h-[92vh] overflow-y-auto rounded-[28px] border border-cyan-400/22"
            style={{
              maxWidth: '960px',
              background: 'linear-gradient(140deg, rgba(3,6,22,0.99) 0%, rgba(0,8,20,0.97) 60%, rgba(6,2,22,0.97) 100%)',
              boxShadow: '0 0 80px rgba(0,255,255,0.1), 0 0 160px rgba(0,200,255,0.05)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Scanlines */}
            <div
              className="pointer-events-none absolute inset-0 z-0 opacity-[0.032]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#fff 2px,#fff 4px)' }}
            />
            {/* Top accent line */}
            <div className="absolute left-0 right-0 top-0 h-[2px] rounded-t-[28px]"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(0,255,255,0.6),rgba(200,0,255,0.4),transparent)' }}
            />

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/8 px-6 py-5 sm:px-8">
              <div>
                <p className="font-rajdhani text-[10px] font-bold uppercase tracking-[0.5em] text-cyan-400/70">
                  AGENCY360 · PORTFOLIO
                </p>
                <h1
                  className="font-orbitron text-2xl font-black uppercase tracking-[0.18em] text-white sm:text-3xl"
                  style={{ textShadow: '0 0 24px rgba(0,255,255,0.35)' }}
                >
                  ABOUT
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <AboutLanguageToggle language={language} onChange={setLanguage} />
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">

              {/* Left col — text */}
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <p className="mb-3 font-orbitron text-[10px] font-bold uppercase tracking-[0.45em]"
                    style={{ color: 'rgba(200,80,255,0.9)' }}>
                    {content.eyebrow}
                  </p>
                  <p className="font-rajdhani text-xl font-bold uppercase leading-[1.15] tracking-[0.03em] text-cyan-100/95 sm:text-2xl lg:text-3xl">
                    {content.lead}
                  </p>
                  <p className="mt-5 font-rajdhani text-base font-bold uppercase leading-[1.3] tracking-[0.02em] text-white/65 sm:text-lg">
                    {content.body}
                  </p>
                </div>

                {/* Stats row */}
                <div className="flex flex-wrap gap-4">
                  {STATS.map(s => (
                    <div
                      key={s.value}
                      className="flex-1 min-w-[90px] rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-center backdrop-blur-sm"
                    >
                      <p className="font-orbitron text-2xl font-black text-white" style={{ textShadow: '0 0 16px rgba(0,255,255,0.5)' }}>
                        {s.value}
                      </p>
                      <p className="mt-1 font-rajdhani text-[10px] font-bold uppercase tracking-[0.3em] text-white/45">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Contact button */}
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = language === 'es' ? 'mailto:info@immerso.live' : 'mailto:info@girasomnis.com';
                  }}
                  className="inline-flex w-fit items-center gap-3 rounded-full border border-cyan-400/25 bg-black/30 px-6 py-3.5 font-orbitron text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:border-cyan-300/50 hover:text-cyan-200"
                  style={{ boxShadow: '0 0 20px rgba(0,255,255,0.08)' }}
                >
                  <Mail size={14} className="text-cyan-400" />
                  {content.contact}
                </button>
              </div>

              {/* Right col — services grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {services.map(({ icon: Icon, label, desc }) => (
                  <motion.div
                    key={label}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/4 p-4 backdrop-blur-sm transition-colors hover:border-cyan-400/25"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/8">
                      <Icon size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-orbitron text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                        {label}
                      </p>
                      <p className="mt-1 font-rajdhani text-sm font-bold uppercase leading-[1.3] tracking-[0.02em] text-white/50">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bottom tag line */}
            <div className="relative z-10 border-t border-white/6 px-8 py-4 text-center">
              <p className="font-orbitron text-[9px] tracking-[0.5em] text-white/25 uppercase">
                IMMERSO · GIRASOMNIS · AGENCY360 · CREATIVE CITY EXPERIENCE
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
