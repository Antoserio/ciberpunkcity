import { ZONES } from './cityData';

export default function MiniMap({ activeZone, isMobile = false }) {
  return (
    <div
      className={`fixed z-30 rounded border ${isMobile ? 'top-16 right-3 w-20 h-20' : 'bottom-20 left-6 w-40 h-40'}` }
      style={{
        background: 'rgba(3,6,18,0.9)',
        borderColor: 'rgba(0,255,255,0.3)',
        boxShadow: '0 0 20px rgba(0,255,255,0.1)',
      }}
    >
      {/* Map label */}
      <div
        className={`absolute top-1 left-2 font-orbitron tracking-widest ${isMobile ? 'text-[6px]' : 'text-[8px]'}` }
        style={{ color: 'rgba(0,255,255,0.5)' }}
      >
        MAPA
      </div>

      {/* Grid */}
      <svg width="100%" height="100%" className="absolute inset-0" viewBox="0 0 160 160">
        {/* Grid lines */}
        {[40, 80, 120].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="160" stroke="rgba(0,255,255,0.08)" strokeWidth="0.5" />
            <line x1="0" y1={v} x2="160" y2={v} stroke="rgba(0,255,255,0.08)" strokeWidth="0.5" />
          </g>
        ))}

        {/* Roads */}
        <rect x="72" y="0" width="16" height="160" fill="rgba(0,255,255,0.05)" />
        <rect x="0" y="72" width="160" height="16" fill="rgba(0,255,255,0.05)" />

        {/* Zone dots - map from world coords (-80 to 80) to minimap (0 to 160) */}
        {ZONES.map(zone => {
          const mx = ((zone.position[0] + 80) / 160) * 160;
          const mz = ((zone.position[2] + 80) / 160) * 160;
          const isActive = activeZone?.id === zone.id;
          const colorInt = zone.color;
          const r = (colorInt >> 16) & 255;
          const g = (colorInt >> 8) & 255;
          const b = colorInt & 255;
          const colorStr = `rgb(${r},${g},${b})`;

          return (
            <g key={zone.id}>
              {/* Zone radius circle */}
              <circle
                cx={mx}
                cy={mz}
                r={(zone.radius / 160) * 160}
                fill={`rgba(${r},${g},${b},0.08)`}
                stroke={`rgba(${r},${g},${b},0.3)`}
                strokeWidth="0.5"
              />
              {/* Building dot */}
              <rect
                x={mx - 3}
                y={mz - 3}
                width="6"
                height="6"
                fill={colorStr}
                opacity={isActive ? 1 : 0.5}
                style={{
                  filter: isActive ? `drop-shadow(0 0 4px ${colorStr})` : 'none',
                }}
              />
            </g>
          );
        })}

        {/* Player dot (center start) */}
        <circle cx="80" cy="85" r="3" fill="#ffffff" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}