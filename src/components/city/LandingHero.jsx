import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';

const HERO_VIDEO_URL = 'https://media.base44.com/videos/public/69fa345f1e88257c77c4e49b/aff483f82_e_a_e_b_ca_d_e_fmp_.mp4';

const SECTIONS = [
  {
    id: 'nexus',
    eyebrow: 'NEXUS 360',
    title: 'Tecnología inmersiva para marcas, eventos y experiencias visuales.',
    copy: 'Creamos piezas donde el motion, el espacio y la narrativa digital conviven con una puesta en escena de alto impacto.',
  },
  {
    id: 'services',
    eyebrow: 'CAPACIDADES',
    title: 'Dance mapping, contenido AV inmersivo e interacción visual en tiempo real.',
    copy: 'Diseñamos sistemas visuales que mezclan performance, escenarios digitales, avatarización y despliegue tecnológico con estética premium.',
  },
  {
    id: 'future',
    eyebrow: 'EXPERIENCIA',
    title: 'Una entrada editorial y cinematográfica antes de entrar al universo 3D.',
    copy: 'No es la recomposición 3D exacta, pero sí una landing mucho más potente y cercana al tono visual que querías conseguir.',
  },
];

export default function LandingHero({ onEnter }) {
  return (
    <div className="relative h-screen overflow-y-auto overflow-x-hidden bg-black text-white snap-y snap-mandatory">
      <div className="fixed inset-0">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.18),transparent_24%),linear-gradient(180deg,rgba(2,6,16,0.32),rgba(0,0,0,0.56)_32%,rgba(0,0,0,0.82)_68%,rgba(0,0,0,0.96))]" />
        <div className="absolute inset-0 scanlines opacity-20" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.03),transparent_12%,transparent_88%,rgba(255,255,255,0.02))]" />
      </div>

      <div className="relative z-10">
        <section className="min-h-screen snap-start">
          <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-orbitron text-xs tracking-[0.45em] text-cyan-300/80">AGENCY360</p>
                <p className="mt-2 font-rajdhani text-sm uppercase tracking-[0.28em] text-white/60">Immersive experiences · cyber city</p>
              </div>

              <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md md:flex md:items-center md:gap-2">
                <Sparkles className="h-4 w-4 text-fuchsia-300" />
                <span className="font-rajdhani text-sm uppercase tracking-[0.24em] text-white/75">Cinematic landing</span>
              </div>
            </div>

            <div className="grid items-end gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
              <div className="max-w-3xl">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-5 font-rajdhani text-sm font-bold uppercase tracking-[0.45em] text-cyan-300/80"
                >
                  Nexus 360 · AV · XR · Mapping · Avatars
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.08 }}
                  className="max-w-5xl font-orbitron text-4xl font-light uppercase leading-[0.95] tracking-[0.06em] text-white sm:text-6xl lg:text-7xl"
                >
                  Una entrada
                  <span className="block bg-gradient-to-r from-cyan-300 via-white to-fuchsia-400 bg-clip-text text-transparent">
                    visual e inmersiva
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.16 }}
                  className="mt-6 max-w-2xl font-rajdhani text-lg font-medium leading-relaxed text-white/76 sm:text-2xl"
                >
                  He montado una versión viable con scroll cinemático, capas editoriales y narrativa de marca sobre el video, para acercarnos lo máximo posible al efecto que buscabas dentro de este entorno.
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
                    href="#nexus-sections"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/12 bg-white/6 px-7 py-4 font-orbitron text-xs uppercase tracking-[0.28em] text-white/82 backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:text-white"
                  >
                    Explorar scroll
                    <ArrowDown className="h-4 w-4" />
                  </a>
                </motion.div>
              </div>

              <motion.div
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
                        Dirección visual, atmósfera futurista y narrativa premium antes de entrar en CyberCity.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
              <p className="font-rajdhani text-sm uppercase tracking-[0.3em] text-white/55">Scroll para descubrir la propuesta</p>
              <ArrowDown className="h-5 w-5 animate-bounce text-cyan-300/80" />
            </div>
          </div>
        </section>

        <div id="nexus-sections" className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pb-20 sm:px-10 lg:px-16">
          {SECTIONS.map((section) => (
            <section
              key={section.id}
              className="min-h-[88vh] snap-start rounded-[2rem] border border-white/10 bg-[rgba(4,8,18,0.38)] p-8 backdrop-blur-xl sm:p-10 lg:grid lg:grid-cols-[0.42fr_0.58fr] lg:items-end lg:gap-10"
            >
              <div>
                <p className="font-orbitron text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">{section.eyebrow}</p>
              </div>
              <div>
                <h2 className="max-w-3xl font-orbitron text-3xl font-light uppercase leading-[1.02] tracking-[0.05em] text-white sm:text-5xl">
                  {section.title}
                </h2>
                <p className="mt-6 max-w-2xl font-rajdhani text-xl leading-relaxed text-white/74 sm:text-2xl">
                  {section.copy}
                </p>
              </div>
            </section>
          ))}

          <section className="min-h-[88vh] snap-start rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(0,255,255,0.1),rgba(255,0,255,0.08),rgba(0,0,0,0.46))] p-8 backdrop-blur-xl sm:p-10 lg:flex lg:items-end lg:justify-between lg:gap-10">
            <div className="max-w-3xl">
              <p className="font-orbitron text-[11px] uppercase tracking-[0.45em] text-cyan-300/80">READY</p>
              <h2 className="mt-4 font-orbitron text-3xl font-light uppercase leading-[1.02] tracking-[0.05em] text-white sm:text-5xl">
                Cuando quieras, entramos al entorno interactivo.
              </h2>
              <p className="mt-6 font-rajdhani text-xl leading-relaxed text-white/76 sm:text-2xl">
                Esta propuesta mejora la primera impresión y deja la entrada mucho más premium sin romper lo que ya funciona dentro de la app.
              </p>
            </div>

            <div className="mt-8 lg:mt-0">
              <button
                onClick={onEnter}
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-cyan-300/50 bg-cyan-300/14 px-8 py-4 font-orbitron text-xs uppercase tracking-[0.28em] text-white backdrop-blur-md transition-all duration-300 hover:border-cyan-200 hover:bg-cyan-300/22"
              >
                Entrar ahora
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}