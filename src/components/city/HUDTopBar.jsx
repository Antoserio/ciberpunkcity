export default function HUDTopBar({ activeZone }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex items-start justify-between gap-3 px-3 py-3 sm:px-6">
        <div className="pointer-events-none min-w-0 flex-1 px-1 py-1">
          <div className="max-w-[200px] sm:max-w-[320px] rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-orbitron text-[15px] font-black tracking-[0.18em] text-cyan-300 sm:text-xl sm:tracking-[0.24em]">
                AGENCY<span className="text-fuchsia-400">360</span>
              </span>
              <span className="text-[9px] font-orbitron leading-none tracking-[0.18em] text-white/45 sm:text-xs sm:tracking-[0.24em]">CYBERCITY</span>
            </div>
            <p className="mt-1 font-rajdhani text-[10px] font-bold uppercase leading-[1.1] tracking-[0.12em] text-white/82 sm:text-[13px]">
              Agencia creativa digital
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(0,255,255,0.9)]" />
            <span className="font-orbitron text-[10px] tracking-[0.24em] text-cyan-300">
              {activeZone ? activeZone.label : 'EXPLORANDO'}
            </span>
          </div>
          <div className="h-5 w-px bg-white/10" />
          <span className="font-rajdhani text-sm uppercase tracking-[0.18em] text-white/50">Live navigation</span>
        </div>
      </div>
    </div>
  );
}