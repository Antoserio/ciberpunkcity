import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function VideoContent({ stand }) {
  return (
    <div className="relative z-10">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/70 shadow-[0_20px_80px_rgba(0,0,0,0.45)]" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={stand.videoUrl}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function ShowcaseContent({ stand }) {
  const [idx, setIdx] = useState(0);
  const items = stand.showcaseItems;
  const item = items[idx];

  return (
    <div className="relative z-10 space-y-4">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-black/70" style={{ aspectRatio: '16/9' }}>
        <img src={item.img} alt={item.label} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <p className="font-orbitron text-lg font-bold tracking-[0.18em]" style={{ color: stand.color }}>{item.label}</p>
          <p className="mt-2 max-w-2xl font-rajdhani text-sm text-white/72 sm:text-base">{item.desc}</p>
        </div>
        <button
          onClick={() => setIdx((idx - 1 + items.length) % items.length)}
          className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/80 backdrop-blur-md transition hover:scale-110"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setIdx((idx + 1) % items.length)}
          className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/80 backdrop-blur-md transition hover:scale-110"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: i === idx ? '2.5rem' : '0.7rem',
              background: i === idx ? stand.color : `${stand.color}35`,
              boxShadow: i === idx ? `0 0 16px ${stand.color}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProjectsContent({ stand }) {
  return (
    <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {stand.projects.map((project) => (
        <div
          key={project.name}
          className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-orbitron text-xs font-bold uppercase tracking-[0.18em]" style={{ color: stand.color }}>
                {project.name}
              </p>
              <p className="mt-1 font-rajdhani text-xs uppercase tracking-[0.14em] text-white/40">{project.cat}</p>
            </div>
            <div className="text-2xl">{project.icon}</div>
          </div>
          <div className="space-y-2">
            {project.stats.map((stat) => (
              <div key={stat} className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2 font-rajdhani text-sm text-white/72">
                {stat}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}