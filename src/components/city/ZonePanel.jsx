import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Zap } from 'lucide-react';
import { useState } from 'react';
import ContactModal from './ContactModal';

export default function ZonePanel({ zone, onClose }) {
  const [showContact, setShowContact] = useState(false);

  if (!zone) return null;

  const borderStyle = { borderColor: zone.colorHex, boxShadow: `0 0 30px ${zone.colorHex}40, inset 0 0 20px ${zone.colorHex}10` };
  const textStyle = { color: zone.colorHex, textShadow: `0 0 10px ${zone.colorHex}` };
  const bgStyle = { background: `linear-gradient(135deg, rgba(5,8,20,0.95) 0%, ${zone.colorHex}15 100%)` };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key={zone.id}
          initial={{ opacity: 0, x: 60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed left-3 right-3 bottom-24 sm:top-1/2 sm:left-auto sm:right-6 sm:bottom-auto sm:-translate-y-1/2 w-auto sm:w-80 z-40 rounded border max-h-[60vh] overflow-y-auto"
          style={{ ...borderStyle, ...bgStyle }}
        >
          {/* Scanlines overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none rounded opacity-30" />

          {/* Header */}
          <div className="relative p-5 border-b" style={{ borderColor: `${zone.colorHex}30` }}>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{zone.icon}</span>
              <div>
                <p className="text-xs font-rajdhani tracking-widest mb-1" style={{ color: `${zone.colorHex}80` }}>
                  ZONA ACTIVA
                </p>
                <h2 className="font-orbitron text-sm font-bold" style={textStyle}>
                  {zone.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-5">
            <p className="text-sm font-rajdhani text-gray-300 leading-relaxed mb-5">
              {zone.description}
            </p>

            {/* Services */}
            <div className="mb-5">
              <p className="text-xs font-orbitron tracking-widest mb-3" style={{ color: `${zone.colorHex}80` }}>
                SERVICIOS
              </p>
              <div className="space-y-2">
                {zone.services.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Zap size={10} style={{ color: zone.colorHex }} />
                    <span className="text-xs font-rajdhani text-gray-300">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setShowContact(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded text-sm font-orbitron font-bold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, ${zone.colorHex}20, ${zone.colorHex}40)`,
                border: `1px solid ${zone.colorHex}60`,
                color: zone.colorHex,
                boxShadow: `0 0 15px ${zone.colorHex}30`,
              }}
            >
              {zone.cta}
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl" style={{ borderColor: zone.colorHex }} />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr" style={{ borderColor: zone.colorHex }} />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl" style={{ borderColor: zone.colorHex }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br" style={{ borderColor: zone.colorHex }} />
        </motion.div>
      </AnimatePresence>

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        zone={zone}
      />
    </>
  );
}