import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import LandingBackground from '@/components/landing/LandingBackground';
import ServiceCard from '@/components/landing/ServiceCard';
import StatCounter from '@/components/landing/StatCounter';
import { services, stats } from '@/components/landing/landingData';

export default function LandingPage() {
  const [isEntering, setIsEntering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const servicesY = useTransform(scrollYProgress, [0.2, 0.5], [100, 0]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleEnter = () => {
    setIsEntering(true);
    setTimeout(() => {
      window.location.href = '/world';
    }, 1500);
  };

  return (
    <>
      <main ref={containerRef} className="relative overflow-hidden bg-black text-white">
        <LandingBackground />

        <motion.section className="relative flex min-h-screen items-center justify-center px-6" style={{ y: heroY, opacity: heroOpacity }}>
          <div className="w-full max-w-6xl text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="relative mb-8">
              <motion.h1
                className="relative mb-4 text-7xl font-black tracking-tighter sm:text-8xl md:text-9xl"
                style={{ x: mousePosition.x * 0.5, y: mousePosition.y * 0.5 }}
              >
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">AGENCY</span>{' '}
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent">360</span>
              </motion.h1>

              <motion.h1
                aria-hidden="true"
                className="absolute inset-0 text-7xl font-black tracking-tighter text-cyan-400 opacity-30 mix-blend-screen sm:text-8xl md:text-9xl"
                animate={{ x: [0, -2, 2, -2, 0], opacity: [0.3, 0.5, 0.3, 0.6, 0.3] }}
                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
              >
                AGENCY 360
              </motion.h1>
            </motion.div>

            <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="space-y-6">
              <h2 className="text-3xl font-light tracking-[0.3em] text-white/75 md:text-5xl">CYBERCITY · EXPERIENCE</h2>
              <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/60 md:text-2xl">
                Explora nuestro ecosistema digital navegando por una <span className="font-semibold text-cyan-400">ciudad cyberpunk en 3D</span>. Cada edificio es un proyecto, cada avatar un servicio.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {services.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                    className="rounded-full border border-cyan-400/40 bg-black/45 px-6 py-2 backdrop-blur-sm transition-all hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.18)]"
                  >
                    <span className="font-orbitron text-sm tracking-[0.25em] text-cyan-300">{service.title}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex h-10 w-6 justify-center rounded-full border-2 border-cyan-400/50 p-2">
                <motion.div className="h-3 w-1 rounded-full bg-cyan-400" />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.section className="relative min-h-screen px-6 py-32" style={{ y: servicesY }}>
          <div className="mx-auto max-w-7xl">
            <motion.h2 initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="mb-20 text-center font-orbitron text-5xl font-black md:text-7xl">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">NUESTROS MUNDOS</span>
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-2">
              {services.map((service, i) => <ServiceCard key={service.id} service={service} index={i} />)}
            </div>
          </div>
        </motion.section>

        <section className="relative bg-gradient-to-b from-black via-fuchsia-950/10 to-black px-6 py-32">
          <div className="mx-auto max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, i) => <StatCounter key={stat.label} stat={stat} index={i} />)}
            </motion.div>
          </div>
        </section>

        <section className="relative flex min-h-screen items-center justify-center px-6 pb-20">
          <div className="text-center">
            <motion.h2 initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mb-8 font-orbitron text-5xl font-black md:text-7xl">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">ENTRA AL NEXUS</span>
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="mx-auto mb-12 max-w-2xl text-xl text-white/55">
              Usa <span className="font-mono text-cyan-400">WASD</span> para moverte, <span className="font-mono text-purple-400">MOUSE</span> para mirar, <span className="font-mono text-pink-400">CLICK</span> para interactuar.
            </motion.p>

            <motion.button
              aria-label="Entrar al mundo"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: 'spring' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnter}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-12 py-6 text-2xl font-black tracking-[0.18em] text-white shadow-2xl transition-all duration-300 hover:shadow-cyan-500/40"
            >
              <span className="relative z-10 flex items-center gap-3"><span>▶</span> ENTRAR AL MUNDO</span>
              <motion.div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" initial={{ x: '-100%' }} whileHover={{ x: '0%' }} transition={{ duration: 0.4 }} />
            </motion.button>

            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }} className="mt-6 text-sm text-white/35">
              Mejor experiencia en desktop · Requiere WebGL
            </motion.p>

            <div className="mt-8">
              <Link to="/world" className="text-sm uppercase tracking-[0.22em] text-cyan-300/80 transition hover:text-cyan-200">
                Ir directo al mundo 3D
              </Link>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isEntering && (
          <motion.div
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500"
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
              className="h-32 w-32 rounded-full border-8 border-white/30 border-t-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}