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
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(14px)',
            padding: '16px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              width: 'min(96vw, 1100px)',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: 28,
              border: '1px solid rgba(255,45,45,0.22)',
              background: 'rgba(4,2,14,0.88)',
              boxShadow: '0 0 80px rgba(255,45,45,0.12), 0 0 200px rgba(232,0,42,0.06)',
              padding: '32px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <p style={{
                  fontFamily: 'Orbitron, sans-serif', fontSize: 10,
                  letterSpacing: '0.45em', fontWeight: 700,
                  color: 'rgba(255,45,45,0.8)', textTransform: 'uppercase',
                }}>
                  AGENCY°360 / ABOUT
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <AboutLanguageToggle language={language} onChange={setLanguage} />
                <button
                  onClick={onClose}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '1px solid rgba(255,45,45,0.3)',
                    background: 'rgba(255,45,45,0.08)',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,45,45,0.7)'; e.currentTarget.style.color = '#ff2d2d'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,45,45,0.3)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Main card */}
            <div style={{
              borderRadius: 24,
              border: '1px solid rgba(255,45,45,0.14)',
              background: 'radial-gradient(circle at 20% 20%, rgba(255,45,45,0.07), transparent 35%), radial-gradient(circle at 80% 70%, rgba(255,100,0,0.06), transparent 35%), rgba(6,3,16,0.6)',
              padding: '40px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Scan-line overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, rgba(255,45,45,0.015) 0px, rgba(255,45,45,0.015) 1px, transparent 1px, transparent 4px)',
              }} />

              <div style={{ display: 'grid', gap: 40, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'end', position: 'relative' }}>

                {/* Text block */}
                <div>
                  <p style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: 12, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.45em',
                    color: 'rgba(255,100,40,0.9)', marginBottom: 12,
                  }}>
                    {content.eyebrow}
                  </p>
                  <h2 style={{
                    fontFamily: 'Rajdhani, sans-serif', fontSize: 'clamp(52px, 8vw, 96px)',
                    fontWeight: 700, textTransform: 'uppercase',
                    lineHeight: 0.88, letterSpacing: '-0.04em',
                    color: '#fff',
                    textShadow: '0 0 40px rgba(255,45,45,0.35)',
                  }}>
                    {content.title}
                  </h2>
                  <p style={{
                    marginTop: 24, fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 700,
                    textTransform: 'uppercase', lineHeight: 1.1,
                    color: 'rgba(255,180,80,0.95)',
                  }}>
                    {content.lead}
                  </p>
                  <p style={{
                    marginTop: 20, fontFamily: 'Rajdhani, sans-serif',
                    fontSize: 'clamp(15px, 1.8vw, 20px)', fontWeight: 600,
                    textTransform: 'uppercase', lineHeight: 1.3,
                    color: 'rgba(255,255,255,0.78)',
                  }}>
                    {content.body}
                  </p>
                </div>

                {/* Animated visual — neon ring in red/orange palette */}
                <div style={{ position: 'relative', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Glow base */}
                  <div style={{
                    position: 'absolute', bottom: 20, left: '18%', right: '18%',
                    height: 80, borderRadius: '50%',
                    background: 'rgba(255,45,45,0.18)', filter: 'blur(28px)',
                  }} />

                  <motion.div
                    animate={{ y: [0, -16, 0], x: [0, 5, 0, -5, 0], rotateZ: [0, 1.5, 0, -1.5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'relative', width: 280, height: 280 }}
                  >
                    {/* Core sphere */}
                    <div style={{
                      position: 'absolute', left: '50%', top: '50%',
                      width: 100, height: 100,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,45,45,0.5)',
                      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), rgba(255,80,20,0.3) 45%, rgba(6,2,16,0.95) 70%)',
                      boxShadow: '0 0 35px rgba(255,45,45,0.35)',
                    }} />
                    {/* Inner dark ring */}
                    <div style={{
                      position: 'absolute', left: '50%', top: '50%',
                      width: 46, height: 46,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      border: '1px solid rgba(255,45,45,0.25)',
                      background: 'rgba(0,0,0,0.5)',
                    }} />
                    {/* Centre dot */}
                    <div style={{
                      position: 'absolute', left: '50%', top: '50%',
                      width: 10, height: 10,
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      background: '#ff4422',
                      boxShadow: '0 0 14px rgba(255,68,34,0.9)',
                    }} />
                    {/* Cross arms */}
                    {[
                      { left:'8%', top:'50%', width:'32%', height:10, transform:'translateY(-50%)', bg:'rgba(255,45,45,0.8)', shadow:'0 0 20px rgba(255,45,45,0.5)' },
                      { right:'8%', top:'50%', width:'32%', height:10, transform:'translateY(-50%)', bg:'rgba(255,120,40,0.8)', shadow:'0 0 20px rgba(255,100,0,0.5)' },
                      { left:'50%', top:'10%', height:'32%', width:10, transform:'translateX(-50%)', bg:'rgba(255,45,45,0.75)', shadow:'0 0 18px rgba(255,45,45,0.4)' },
                      { left:'50%', bottom:'10%', height:'32%', width:10, transform:'translateX(-50%)', bg:'rgba(255,45,45,0.75)', shadow:'0 0 18px rgba(255,45,45,0.4)' },
                    ].map((s, i) => (
                      <div key={i} style={{ position:'absolute', borderRadius:9999, ...s, background:s.bg, boxShadow:s.shadow }} />
                    ))}
                    {/* Orbiting ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute', inset: '12%',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,45,45,0.2)',
                      }}
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute', inset: '4%',
                        borderRadius: '50%',
                        border: '1px dashed rgba(255,100,40,0.15)',
                      }}
                    />
                    {/* Corner orbs */}
                    {[
                      { left:'6%', top:'50%', transform:'translateY(-50%)', color:'rgba(255,45,45,0.4)', glow:'rgba(255,45,45,0.25)' },
                      { right:'6%', top:'50%', transform:'translateY(-50%)', color:'rgba(255,120,40,0.4)', glow:'rgba(255,100,0,0.22)' },
                      { left:'50%', top:'6%', transform:'translateX(-50%)', color:'rgba(255,45,45,0.35)', glow:'rgba(255,45,45,0.2)' },
                      { left:'50%', bottom:'6%', transform:'translateX(-50%)', color:'rgba(255,80,20,0.3)', glow:'rgba(255,60,0,0.18)' },
                    ].map(({ color, glow, ...pos }, i) => (
                      <div key={i} style={{
                        position:'absolute', width:48, height:48, borderRadius:'50%',
                        border:`1px solid ${color}`,
                        background: `radial-gradient(circle, ${glow}, transparent 70%)`,
                        ...pos,
                      }} />
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: 48 }}>
                <button
                  onClick={() => { window.location.href = language === 'es' ? 'mailto:info@immerso.live' : 'mailto:info@girasomnis.com'; }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    borderRadius: 9999,
                    border: '1px solid rgba(255,45,45,0.35)',
                    background: 'rgba(255,45,45,0.1)',
                    padding: '14px 28px',
                    fontFamily: 'Rajdhani, sans-serif', fontSize: 13,
                    fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.28em', color: '#fff',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,45,45,0.22)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255,45,45,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,45,45,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <Mail size={15} style={{ color: '#ff4422' }} />
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
