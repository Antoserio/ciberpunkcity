export default function PostProcessingStatus({ settings }) {
  const items = [
    ['Bloom', settings?.bloom],
    ['Reflect', settings?.reflections],
    ['CA', settings?.chromaticAberration],
    ['Grain', settings?.filmGrain],
    ['Grade', settings?.colorGrading],
    ['FXAA', settings?.fxaa],
    ['DOF', settings?.dof],
  ];

  return (
    <div className="fixed bottom-28 right-4 z-[65] hidden rounded-2xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md sm:block">
      <div className="flex flex-wrap gap-2">
        {items.map(([label, enabled]) => (
          <div
            key={label}
            className={`rounded-full px-2 py-1 font-orbitron text-[9px] uppercase tracking-[0.2em] ${enabled ? 'border border-cyan-300/40 bg-cyan-300/10 text-cyan-200' : 'border border-white/10 bg-white/5 text-white/35'}`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}