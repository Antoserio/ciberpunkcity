export default function WelcomeOverlayStats() {
  const stats = [
    ['04', 'distritos activos'],
    ['360°', 'showcase inmersivo'],
    ['XR', 'capas visuales y avatares'],
  ];

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3">
      {stats.map(([value, label]) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md">
          <p className="font-orbitron text-2xl font-black tracking-[0.14em] text-white">{value}</p>
          <p className="mt-1 font-rajdhani text-sm uppercase tracking-[0.2em] text-white/45">{label}</p>
        </div>
      ))}
    </div>
  );
}