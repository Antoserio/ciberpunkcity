import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function ContactModal({ isOpen, onClose, zone }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', service: zone?.title || '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const color = zone?.colorHex || '#00ffff';
  const borderStyle = { borderColor: color, boxShadow: `0 0 40px ${color}30` };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const subject = encodeURIComponent(`[Agency360 CyberCity] Nuevo contacto - ${zone?.title}`);
    const body = encodeURIComponent(`Nombre: ${form.name}\nEmail: ${form.email}\nServicio: ${form.service}\nMensaje: ${form.message}`);
    window.open(`mailto:info@agency360.com?subject=${subject}&body=${body}`, '_blank');
    setSent(true);
    setLoading(false);
  };

  const handleClose = () => {
    setSent(false);
    setForm({ name: '', email: '', message: '', service: zone?.title || '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,5,15,0.85)', backdropFilter: 'blur(10px)' }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative w-full max-w-md rounded border p-4 sm:p-6 max-h-[88vh] overflow-y-auto"
            style={{
              background: 'rgba(3,6,18,0.98)',
              ...borderStyle,
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute inset-0 scanlines pointer-events-none rounded opacity-20" />

            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: color }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: color }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: color }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: color }} />

            <button onClick={handleClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-10">
              <X size={18} />
            </button>

            {!sent ? (
              <>
                <div className="mb-6">
                  <p className="text-xs font-orbitron tracking-widest mb-1" style={{ color: `${color}80` }}>
                    INICIAR PROYECTO
                  </p>
                  <h2 className="font-orbitron text-xl font-bold" style={{ color, textShadow: `0 0 15px ${color}` }}>
                    {zone?.title}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  <div>
                    <label className="text-xs font-orbitron tracking-wider text-gray-500 block mb-1">NOMBRE</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border rounded px-3 py-2 text-sm font-rajdhani text-white focus:outline-none transition-all"
                      style={{ borderColor: `${color}30`, }}
                      onFocus={e => e.target.style.borderColor = color}
                      onBlur={e => e.target.style.borderColor = `${color}30`}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-orbitron tracking-wider text-gray-500 block mb-1">EMAIL</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-transparent border rounded px-3 py-2 text-sm font-rajdhani text-white focus:outline-none transition-all"
                      style={{ borderColor: `${color}30` }}
                      onFocus={e => e.target.style.borderColor = color}
                      onBlur={e => e.target.style.borderColor = `${color}30`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-orbitron tracking-wider text-gray-500 block mb-1">MENSAJE</label>
                    <textarea
                      required
                      rows={3}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-transparent border rounded px-3 py-2 text-sm font-rajdhani text-white focus:outline-none transition-all resize-none"
                      style={{ borderColor: `${color}30` }}
                      onFocus={e => e.target.style.borderColor = color}
                      onBlur={e => e.target.style.borderColor = `${color}30`}
                      placeholder="Cuéntanos sobre tu proyecto..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded font-orbitron text-sm font-bold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${color}20, ${color}40)`,
                      border: `1px solid ${color}`,
                      color: color,
                      boxShadow: `0 0 20px ${color}40`,
                    }}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={14} />
                        TRANSMITIR MENSAJE
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8 relative z-10"
              >
                <CheckCircle size={48} className="mx-auto mb-4" style={{ color }} />
                <h3 className="font-orbitron text-lg font-bold mb-2" style={{ color }}>
                  TRANSMISIÓN EXITOSA
                </h3>
                <p className="text-gray-400 font-rajdhani text-sm mb-6">
                  Mensaje recibido. Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas.
                </p>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 rounded font-orbitron text-xs font-bold transition-all hover:scale-105"
                  style={{
                    border: `1px solid ${color}60`,
                    color: color,
                    background: `${color}15`,
                  }}
                >
                  CERRAR
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}