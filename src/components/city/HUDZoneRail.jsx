import { ZONES } from './cityData';

export default function HUDZoneRail({ activeZone }) {
  return (
    <div className="fixed bottom-4 left-1/2 z-30 w-[min(92vw,920px)] -translate-x-1/2 pointer-events-none">
      <div className="rounded-[22px] border border-white/10 bg-[rgba(5,8,20,0.72)] px-3 py-3 backdrop-blur-xl sm:px-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-orbitron text-[10px] uppercase tracking-[0.3em] text-white/45">District rail</p>
          <p className="font-rajdhani text-sm uppercase tracking-[0.16em] text-cyan-300/70">{activeZone ? activeZone.title : 'Ciudad activa'}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ZONES.map((zone) => {
            const isActive = activeZone?.id === zone.id;
            return (
              <div
                key={zone.id}
                className="rounded-2xl border px-3 py-2 transition-all duration-300"
                style={{
                  borderColor: isActive ? `${zone.colorHex}55` : 'rgba(255,255,255,0.08)',
                  background: isActive ? `${zone.colorHex}18` : 'rgba(255,255,255,0.03)',
                  boxShadow: isActive ? `0 0 22px ${zone.colorHex}22` : 'none',
                  opacity: isActive ? 1 : 0.72,
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor: zone.colorHex,
                      boxShadow: isActive ? `0 0 12px ${zone.colorHex}` : 'none',
                    }}
                  />
                  <span className="font-orbitron text-[10px] uppercase tracking-[0.16em] text-white/85">{zone.id}</span>
                </div>
                <p className="mt-2 font-rajdhani text-xs text-white/48">{zone.title}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}