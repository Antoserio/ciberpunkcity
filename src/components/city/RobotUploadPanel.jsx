import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function RobotUploadPanel({ onUploaded }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploaded(file_url);
    setLoading(false);
  };

  return (
    <div className="fixed top-20 left-3 sm:left-6 z-40 max-w-[90vw] sm:max-w-sm rounded border px-3 py-3 glass-dark">
      <p className="font-orbitron text-[10px] sm:text-xs tracking-widest text-cyan-400 mb-2">ROBOT GLB TEMPORAL</p>
      <p className="font-rajdhani text-xs text-gray-300 mb-3">Sube tu modelo .glb para verlo en la ciudad.</p>
      <input
        ref={inputRef}
        type="file"
        accept=".glb,.gltf,model/gltf-binary"
        className="hidden"
        onChange={handleSelect}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="w-full rounded border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 font-orbitron text-xs tracking-widest text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-60"
      >
        {loading ? 'SUBIENDO...' : 'CARGAR ROBOT'}
      </button>
      {fileName && (
        <p className="mt-2 truncate font-rajdhani text-xs text-gray-400">{fileName}</p>
      )}
    </div>
  );
}