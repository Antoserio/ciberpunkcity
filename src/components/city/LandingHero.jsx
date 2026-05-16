import { motion } from 'framer-motion';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

const HERO_VIDEO_URL = 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/aff483f82_e_a_e_b_ca_d_e_fmp_.mp4';

export default function LandingHero({ onEnter }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={HERO_VIDEO_URL}
        autoPlay
        muted
        loop
        playsInline
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.18),transparent_32%),linear-gradient(180deg,rgba(2,6,16,0.28),rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.96))]" />
      <div className="absolute inset-0 scanlines opacity-20" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-orbitron text-xs tracking-[0.45em] text-cyan-300/80">AGENCY360</p>
            <p className="mt-2 font-rajdhani text-sm uppercase tracking-[0.28em] text-white/60">Immersive experiences · cyber city</p>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md md:flex md:items-center md:gap-2">
            <Sparkles className="h-4 w-4 text-fuchsia-300" />
            <span className="font-rajdhani text-sm uppercase tracking-[0.24em] text-white/75">Live 3D showcase</span>
          </div>
        </div>

        <div className="grid items-end gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 font-rajdhani text-sm font-bold uppercase tracking-[0.45em] text-cyan-300/80"
            >
              Creative technology · XR · Video · Avatars
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="max-w-4xl font-orbitron text-4xl font-light uppercase leading-[0.95] tracking-[0.08em] text-white sm:text-6xl lg:text-7xl"
            >
              Entrar en una
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 bg-clip-text text-transparent">
                ciudad inmersiva
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mt-6 max-w-2xl font-rajdhani text-lg font-medium leading-relaxed text-white/76 sm:text-2xl"
            >
              Explora una experiencia 3D donde conviven branding, tecnología audiovisual, avatares y entornos digitales con una estética cyberpunk cinematográfica.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <button
                onClick={onEnter}
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-cyan-300/40 bg-cyan-300/12 px-7 py-4 font-orbitron text-xs uppercase tracking-[0.28em] text-white backdrop-blur-md transition-all duration-300 hover:border-cyan-200/80 hover:bg-cyan-300/18"
              >
                Entrar al mundo
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <a
                href="#landing-preview"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/12 bg-white/6 px-7 py-4 font-orbitron text-xs uppercase tracking-[0.28em] text-white/82 backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:text-white"
              >
                <Play className="h-4 w-4" />
                Ver preview
              </a>
            </motion.div>
          </div>

          <motion.div
            id="landing-preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.22 }}
            className="justify-self-end"
          >
            <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/6 p-3 shadow-[0_0_80px_rgba(0,255,255,0.12)] backdrop-blur-xl">
              <div className="absolute inset-x-10 top-0 h-24 rounded-full bg-cyan-300/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/50">
                <video
                  className="aspect-[4/5] w-full object-cover md:aspect-[16/10]"
                  src={HERO_VIDEO_URL}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="font-orbitron text-[10px] uppercase tracking-[0.38em] text-cyan-300/80">Nexus Access</p>
                  <p className="mt-2 max-w-sm font-rajdhani text-base font-medium text-white/80 sm:text-lg">
                    Un acceso visual al universo Agency360 antes de entrar al recorrido interactivo.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-5 text-left sm:grid-cols-3 sm:gap-6">
          {[
            ['Experiencia', 'Landing cinematográfica con video y acceso directo al mundo'],
            ['Estilo', 'Cristal, neón y profundidad visual con enfoque editorial'],
            ['Destino', 'Transición limpia hacia CyberCity sin tocar el entorno 3D'],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-white/8 bg-white/5 p-4 backdrop-blur-md">
              <p className="font-orbitron text-[10px] uppercase tracking-[0.32em] text-cyan-300/75">{title}</p>
              <p className="mt-2 font-rajdhani text-sm leading-relaxed text-white/68 sm:text-base">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}