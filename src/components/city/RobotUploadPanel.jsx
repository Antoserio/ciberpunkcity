import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function RobotUploadPanel({ onUploaded, currentRobotFileName = '' }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const existing = await base44.entities.WorldSettings.filter({ key: 'global_robot_model' }, '-updated_date', 1);

    if (existing.length > 0) {
      await base44.entities.WorldSettings.update(existing[0].id, {
        robot_model_url: file_url,
        robot_file_name: file.name,
      });
    } else {
      await base44.entities.WorldSettings.create({
        key: 'global_robot_model',
        robot_model_url: file_url,
        robot_file_name: file.name,
      });
    }

    onUploaded(file_url, file.name);
    setLoading(false);
  };

  return (
    <div className="fixed top-20 left-3 sm:left-6 z-40 max-w-[90vw] sm:max-w-sm rounded border px-3 py-3 glass-dark">
      <p className="font-orbitron text-[10px] sm:text-xs tracking-widest text-cyan-400 mb-2">ROBOT GLB GLOBAL</p>
      <p className="font-rajdhani text-xs text-gray-300 mb-3">Ya hay un robot precargado en la ciudad. Solo sube otro si quieres reemplazarlo.</p>
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
      <div className="mt-2 space-y-1">
        {(fileName || currentRobotFileName) && (
          <>
            <p className="truncate font-rajdhani text-xs text-gray-400">Guardado: {fileName || currentRobotFileName}</p>
            <p className="font-rajdhani text-[11px] text-gray-300">Si no lo ves, entra en la ciudad: ahora vuela más cerca del centro.</p>
          </>
        )}
        <p className="font-rajdhani text-[11px] text-cyan-300/80">Tu robot actual es: {currentRobotFileName || fileName || 'robotpequeño.glb'}</p>
      </div>
    </div>
  );
}