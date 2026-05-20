export default function WelcomeOverlayDistricts() {
  const districts = [
    ['Avatar XR', 'Metahuman, realtime y presencia digital', 'Cyan'],
    ['Dance Mapping', 'Escena visual, vídeo e impacto inmersivo', 'Magenta'],
    ['Studio 360', 'Producción para contenido XR y 360º', 'Violet'],
    ['Arcade Nexus', 'Interacción lúdica dentro del recorrido', 'Amber'],
  ];

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-orbitron text-[11px] uppercase tracking-[0.3em] text-white/55">Live districts</p>
        <p className="font-rajdhani text-sm text-cyan-300/70">04 zonas activas</p>
      </div>
      <div className="space-y-3">
        {districts.map(([title, desc, tone], index) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-orbitron text-xs uppercase tracking-[0.24em] text-white/88">{title}</p>
                <p className="mt-2 font-rajdhani text-sm text-white/55">{desc}</p>
              </div>
              <div className="flex min-w-[64px] flex-col items-end gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(0,255,255,0.9)]" />
                <span className="font-rajdhani text-xs uppercase tracking-[0.18em] text-white/35">0{index + 1} · {tone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}