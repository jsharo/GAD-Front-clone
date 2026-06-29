import React, { useState } from 'react';
import { BaseModal } from '@/components/logic/base.modal';
import { DigitalSignatureSimulator } from '@/components/logic/digital.signature-simulator';
import { useAuthStore } from '@/stores/auth.store';
import { MapPin, CheckCircle, XCircle, AlertCircle, Camera, CheckSquare } from 'lucide-react';

export interface InspectionReporterProps {
  onSubmitReport: (reportData: {
    status: 'APPROVED' | 'REJECTED';
    dimensionsVerified: number;
    frontSetback: boolean;
    backSetback: boolean;
    leftSetback: boolean;
    rightSetback: boolean;
    observations: string;
    gpsLatitude?: string;
    gpsLongitude?: string;
    attachments: string[];
    signatureHash: string;
    files?: File[];
  }) => void;
}

export function InspectionReporter({ onSubmitReport }: InspectionReporterProps) {
  const { user } = useAuthStore();

  // Form State
  const [status, setStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [dimensions, setDimensions] = useState<string>('');
  const [frontSetback, setFrontSetback] = useState(false);
  const [backSetback, setBackSetback] = useState(false);
  const [leftSetback, setLeftSetback] = useState(false);
  const [rightSetback, setRightSetback] = useState(false);
  const [observations, setObservations] = useState('');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  // Signature Modal state
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // GPS Simulation
  const simulateGPS = () => {
    // Simulated GPS Coordinates for Cañar region
    const randomLat = (-2.6283 + (Math.random() - 0.5) * 0.01).toFixed(6);
    const randomLng = (-78.9372 + (Math.random() - 0.5) * 0.01).toFixed(6);
    setGpsLat(randomLat);
    setGpsLng(randomLng);
  };

  // Photo uploads simulation
  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const names = files.map((f) => f.name);
    setUploadedPhotos((prev) => [...prev, ...names]);
    setPhotoFiles((prev) => [...prev, ...files]);
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!dimensions || parseFloat(dimensions) <= 0) {
      setValidationError('Por favor ingresa una dimensión de predio válida en m².');
      return;
    }

    if (status === 'REJECTED' && !observations.trim()) {
      setValidationError('Debes ingresar observaciones detallando el motivo de rechazo.');
      return;
    }

    // Open digital signature modal
    setIsSignModalOpen(true);
  };

  const handleSignatureComplete = (signatureHash: string) => {
    setTimeout(() => {
      setIsSignModalOpen(false);
      onSubmitReport({
        status,
        dimensionsVerified: parseFloat(dimensions),
        frontSetback,
        backSetback,
        leftSetback,
        rightSetback,
        observations,
        gpsLatitude: gpsLat || undefined,
        gpsLongitude: gpsLng || undefined,
        attachments: uploadedPhotos,
        signatureHash,
        files: photoFiles,
      });
    }, 1500);
  };

  // Defaults if no technician is logged in
  const techName = user ? `${user.first_name} ${user.last_name}` : 'Téc. Municipal Cañar';
  const techId = user?.national_id || '0301234567';

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/75 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-md">
      <form onSubmit={handlePreSubmit} className="space-y-6 text-left">
        <div>
          <h2 className="font-heading font-black text-slate-900 text-xl tracking-wide">
            Ficha de Inspección Técnica
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Registra los resultados y observaciones de la inspección de campo
          </p>
        </div>

        {validationError && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
            <AlertCircle size={14} className="flex-shrink-0 animate-bounce" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* 1. STATUS DECISION */}
        <div className="space-y-2">
          <label className="input-label">Dictamen Técnico *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setStatus('APPROVED')}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm cursor-pointer ${
                status === 'APPROVED'
                  ? 'border-green-500 bg-green-50/70 text-green-800 shadow-md shadow-green-100'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
              }`}
            >
              <CheckSquare size={16} />
              <span>APROBADO</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus('REJECTED')}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm cursor-pointer ${
                status === 'REJECTED'
                  ? 'border-red-500 bg-red-50/70 text-red-800 shadow-md shadow-red-100'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
              }`}
            >
              <XCircle size={16} />
              <span>RECHAZADO</span>
            </button>
          </div>
        </div>

        {/* 2. DIMENSIONS AND GPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="input-label">Área del Terreno Verificada (m²) *</label>
            <input
              type="number"
              step="0.01"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="Ej. 185.50"
              className="input-field rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="input-label">Ubicación GPS (Coordenadas)</label>
            <div className="flex gap-2">
              <div className="grid grid-cols-2 gap-1.5 flex-1">
                <input
                  type="text"
                  placeholder="Latitud"
                  value={gpsLat}
                  onChange={(e) => setGpsLat(e.target.value)}
                  className="input-field py-2 text-xs rounded-xl font-mono"
                />
                <input
                  type="text"
                  placeholder="Longitud"
                  value={gpsLng}
                  onChange={(e) => setGpsLng(e.target.value)}
                  className="input-field py-2 text-xs rounded-xl font-mono"
                />
              </div>
              <button
                type="button"
                onClick={simulateGPS}
                className="btn-secondary px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs"
                title="Simular coordenadas actuales"
              >
                <MapPin size={14} />
                <span className="hidden sm:inline">Capturar</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. SETBACKS CHECKS */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/50">
          <label className="input-label mb-2">Verificación de Retiros Municipales</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={frontSetback}
                onChange={(e) => setFrontSetback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Retiro Frontal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={backSetback}
                onChange={(e) => setBackSetback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Retiro Posterior</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={leftSetback}
                onChange={(e) => setLeftSetback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Retiro Lateral Izq.</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={rightSetback}
                onChange={(e) => setRightSetback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Retiro Lateral Der.</span>
            </label>
          </div>
        </div>

        {/* 4. PHOTO ATTACHMENTS */}
        <div className="space-y-2">
          <label className="input-label">Pruebas Fotográficas de Inspección</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300/80 hover:border-blue-500/80 rounded-2xl p-5 text-center cursor-pointer transition-all bg-white hover:bg-slate-50/20 group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoAdd}
              className="sr-only"
            />
            <Camera
              size={24}
              className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"
            />
            <p className="text-xs font-semibold text-slate-700">Subir fotos de inspección</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Formatos JPEG, PNG — Máximo 10MB</p>
          </label>

          {uploadedPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {uploadedPhotos.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/50 border border-blue-100 text-[10px] font-semibold text-blue-800"
                >
                  <div className="truncate flex-1">{name}</div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== i));
                      setPhotoFiles((prev) => prev.filter((_, idx) => idx !== i));
                    }}
                    className="text-red-500 hover:text-red-655 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. OBSERVATIONS */}
        <div className="space-y-1.5">
          <label className="input-label">
            Observaciones y Conclusiones {status === 'REJECTED' ? '*' : '(Opcional)'}
          </label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={4}
            placeholder={
              status === 'REJECTED'
                ? 'Detalla aquí los motivos específicos del rechazo de la inspección municipal...'
                : 'Detalla observaciones encontradas en campo...'
            }
            className="input-field rounded-xl resize-none"
            required={status === 'REJECTED'}
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 rounded-xl transition-all font-bold text-xs"
        >
          <CheckCircle size={16} />
          <span>Proceder a la Firma del Reporte</span>
        </button>
      </form>

      {/* DIGITAL SIGNATURE MODAL CONTAINER */}
      <BaseModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Firma del Reporte Técnico de Inspección"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 text-left">
            Como inspector técnico del GAD Cañar, debes validar los datos reportados y aplicar tu
            firma digital criptográfica de forma irrevocable sobre este documento técnico.
          </p>
          <DigitalSignatureSimulator
            signerName={techName}
            signerId={techId}
            requirePin={true}
            onSignComplete={handleSignatureComplete}
            title="Firmar Acta de Inspección Técnica"
          />
        </div>
      </BaseModal>
    </div>
  );
}
