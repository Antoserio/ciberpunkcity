import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Minimize2 } from 'lucide-react';

const AVATAR_MESSAGES = [
  "Hola, soy VIKY. Estoy aquí para hablar contigo sobre Agency360 y ayudarte a explorar la experiencia. ¿Qué te gustaría ver?",
];

const SYSTEM_PROMPT = `Eres VIKY, el avatar conversacional de Agency360.
Hablas en español, con tono cercano, creativo y seguro.
Ayudas a los visitantes a entender los servicios de Agency360: software, producción audiovisual, avatares 3D, XR y eventos inmersivos.
Tus respuestas deben ser cortas, claras y naturales, con máximo 3 oraciones.
Cuando tenga sentido, invita a seguir conversando o a contactar con el equipo.`;

export default function AvatarAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: AVATAR_MESSAGES[0] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'El chat no está configurado aún. Puedes contactarnos en info@agency360.com o visitar vikydj.netlify.app.'
        }]);
        setLoading(false);
        return;
      }

      const allMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          system: SYSTEM_PROMPT,
          messages: allMessages,
        }),
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || 'No pude procesar tu mensaje.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Inténtalo de nuevo.' }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, #0a0a1f, #001a2a)',
              border: '2px solid #00ffff',
              boxShadow: '0 0 20px #00ffff60, 0 0 40px #00ffff20',
            }}
            title="Hablar con VIKY"
          >
            👩🏻‍🎤
            <span
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
              style={{ background: '#00ffff', boxShadow: '0 0 8px #00ffff' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && !minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 z-40 w-80 h-96 flex flex-col rounded border overflow-hidden"
            style={{
              background: 'rgba(3,6,18,0.97)',
              borderColor: '#00ffff',
              boxShadow: '0 0 30px #00ffff30',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: '#00ffff30', background: 'rgba(0,255,255,0.05)' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👩🏻‍🎤</span>
                <div>
                  <p className="font-orbitron text-xs font-bold text-cyan-400">VIKY</p>
                  <p className="text-xs text-gray-500 font-rajdhani">Avatar conversacional · Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://vikydj.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-orbitron tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  VER VIKY
                </a>
                <button onClick={() => setMinimized(true)} className="text-gray-600 hover:text-gray-400 transition-colors">
                  <Minimize2 size={14} />
                </button>
                <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <span className="text-sm mr-1 mt-1">👩🏻‍🎤</span>
                  )}
                  <div
                    className="max-w-[85%] px-3 py-2 rounded text-xs font-rajdhani leading-relaxed"
                    style={msg.role === 'assistant' ? {
                      background: 'rgba(0,255,255,0.08)',
                      border: '1px solid rgba(0,255,255,0.2)',
                      color: '#cce8ff',
                    } : {
                      background: 'rgba(255,0,255,0.15)',
                      border: '1px solid rgba(255,0,255,0.3)',
                      color: '#ffccff',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <span className="text-sm mr-1 mt-1">👩🏻‍🎤</span>
                  <div
                    className="px-3 py-2 rounded"
                    style={{ background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.2)' }}
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              className="flex items-center gap-2 px-3 py-2 border-t"
              style={{ borderColor: '#00ffff30' }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent text-xs font-rajdhani text-white placeholder-gray-600 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="text-cyan-400 hover:text-cyan-300 disabled:text-gray-700 transition-colors"
              >
                <Send size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && minimized && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setMinimized(false)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 rounded-full border"
            style={{
              background: 'rgba(3,6,18,0.97)',
              borderColor: '#00ffff',
              boxShadow: '0 0 15px #00ffff40',
            }}
          >
            <span>👩🏻‍🎤</span>
            <span className="font-orbitron text-xs text-cyan-400">VIKY</span>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
