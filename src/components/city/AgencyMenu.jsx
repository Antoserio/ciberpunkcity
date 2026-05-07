import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Headphones, Sparkles, PhoneCall } from 'lucide-react';

const SERVICE_BLOCKS = [
  {
    id: 'software',
    title: 'Software a medida',
    text: 'Apps, plataformas y experiencias digitales listas para vender, automatizar y escalar.',
    accent: '#00ffff',
  },
  {
    id: 'xr',
    title: 'Avatares 3D + XR',
    text: 'Activaciones inmersivas, espacios virtuales y presentaciones memorables para marcas y eventos.',
    accent: '#ff00ff',
  },
  {
    id: 'video',
    title: 'Vídeo y contenidos',
    text: 'Producción audiovisual, visuales en directo y piezas de alto impacto para captar atención.',
    accent: '#ffff00',
  },
];

const HIRING_POINTS = [
  'Entrega creativa + técnica en un solo equipo',
  'Propuestas pensadas para captar clientes y cerrar ventas',
  'Producción rápida para campañas, stands y presentaciones',
  'Acompañamiento estratégico desde idea hasta lanzamiento',
];

export default function AgencyMenu({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 20, stiffness: 180 }}
            className="absolute inset-x-3 top-3 bottom-3 sm:inset-x-6 sm:top-6 sm:bottom-6 overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#050814]/95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at top left, rgba(0,255,255,0.18), transparent 30%), radial-gradient(circle at bottom right, rgba(255,0,255,0.14), transparent 28%)' }} />
            <div className="absolute inset-0 scanlines opacity-20" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
                <div>
                  <p className="font-orbitron text-[10px] tracking-[0.35em] text-cyan-400/80">AGENCY360 / MENU</p>
                  <h2 className="mt-1 font-orbitron text-xl sm:text-2xl text-white">Experiencias que ayudan a contratar</h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-5 sm:grid-cols-[1.2fr_0.9fr] sm:p-8">
                <div className="space-y-5">
                  <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-7">
                    <div className="mb-6 flex items-center gap-3 text-cyan-300">
                      <Sparkles size={18} />
                      <span className="font-orbitron text-[10px] tracking-[0.45em]">AGENCY360</span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-[1.2fr_0.8fr] sm:items-start">
                      <div>
                        <p className="font-rajdhani text-xs uppercase tracking-[0.35em] text-slate-500">Creative systems / immersive sales</p>
                        <h3 className="mt-3 max-w-2xl font-orbitron text-3xl leading-tight text-white sm:text-5xl">
                          Un menú más editorial, limpio y con presencia tipo showcase premium.
                        </h3>
                      </div>
                      <p className="font-rajdhani text-sm leading-relaxed text-slate-300 sm:text-base">
                        Software, vídeo, XR y avatares presentados como una pieza de marca clara, elegante y lista para enseñar.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 sm:grid-cols-3">
                    {SERVICE_BLOCKS.map((item) => (
                      <div
                        key={item.id}
                        className="min-h-[180px] bg-[#060a14] p-5 sm:p-6"
                      >
                        <p className="font-rajdhani text-[11px] uppercase tracking-[0.35em] text-slate-500">0{SERVICE_BLOCKS.findIndex((block) => block.id === item.id) + 1}</p>
                        <p className="mt-4 font-orbitron text-sm tracking-[0.22em]" style={{ color: item.accent }}>
                          {item.title}
                        </p>
                        <p className="mt-4 font-rajdhani text-sm leading-relaxed text-slate-300">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-3xl border border-fuchsia-400/20 bg-white/5 p-5 sm:p-6">
                    <div className="mb-4 flex items-center gap-3 text-fuchsia-300">
                      <PhoneCall size={18} />
                      <span className="font-orbitron text-xs tracking-[0.3em]">CLAVES DE CONTRATACIÓN</span>
                    </div>
                    <div className="space-y-3">
                      {HIRING_POINTS.map((point) => (
                        <div key={point} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 font-rajdhani text-sm text-slate-200">
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-400/10 to-transparent p-5 sm:p-6">
                    <div className="mb-3 flex items-center gap-3 text-yellow-200">
                      <Headphones size={18} />
                      <span className="font-orbitron text-xs tracking-[0.3em]">CONTACTO RÁPIDO</span>
                    </div>
                    <p className="font-rajdhani text-sm text-slate-200">Para presupuestos, activaciones, stands, vídeos o experiencias inmersivas.</p>
                    <div className="mt-5 space-y-3">
                      <a
                        href="mailto:info@agency360.com?subject=Quiero%20contratar%20Agency360"
                        className="flex items-center justify-between rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 font-orbitron text-xs tracking-[0.2em] text-cyan-300 transition hover:bg-cyan-400/20"
                      >
                        ESCRIBIR AHORA <ArrowUpRight size={16} />
                      </a>
                      <a
                        href="mailto:info@agency360.com?subject=Quiero%20una%20propuesta%20creativa"
                        className="flex items-center justify-between rounded-2xl border border-fuchsia-400/30 bg-fuchsia-400/10 px-4 py-3 font-orbitron text-xs tracking-[0.2em] text-fuchsia-300 transition hover:bg-fuchsia-400/20"
                      >
                        PEDIR PROPUESTA <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}