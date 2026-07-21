import React, { useState } from 'react';
import { BaseModal } from '@/components/logic/base.modal';
import { DigitalSignatureSimulator } from '@/components/logic/digital.signature.simulator';
import { useAuthStore } from '@/stores/auth.store';
import { MapPin, CheckCircle, XCircle, AlertCircle, Camera, CheckSquare } from 'lucide-react';

export interface InspectionReporterProps {
  OnSubmitReport: (report_data: {
    status: 'APPROVED' | 'REJECTED';
    dimensions_verified: number;
    front_setback: boolean;
    back_setback: boolean;
    left_setback: boolean;
    right_setback: boolean;
    observations: string;
    gps_latitude?: string;
    gps_longitude?: string;
    attachments: string[];
    signature_hash: string;
    files?: File[];
  }) => void;
}

export function InspectionReporter({ OnSubmitReport }: InspectionReporterProps) {
  const { user } = useAuthStore();

  // Form State
  const [status, set_status] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [dimensions, set_dimensions] = useState<string>('');
  const [front_setback, set_front_setback] = useState(false);
  const [back_setback, set_back_setback] = useState(false);
  const [left_setback, set_left_setback] = useState(false);
  const [right_setback, set_right_setback] = useState(false);
  const [observations, set_observations] = useState('');
  const [gps_lat, set_gps_lat] = useState('');
  const [gps_lng, set_gps_lng] = useState('');
  const [uploaded_photos, set_uploaded_photos] = useState<string[]>([]);
  const [photo_files, set_photo_files] = useState<File[]>([]);

  // Signature Modal state
  const [is_sign_modal_open, set_is_sign_modal_open] = useState(false);
  const [validation_error, set_validation_error] = useState<string | null>(null);

  // GPS Simulation
  const SimulateGPS = () => {
    // Simulated GPS Coordinates for Cañar region
    const random_lat = (-2.6283 + (Math.random() - 0.5) * 0.01).toFixed(6);
    const random_lng = (-78.9372 + (Math.random() - 0.5) * 0.01).toFixed(6);
    set_gps_lat(random_lat);
    set_gps_lng(random_lng);
  };

  // Photo uploads simulation
  const HandlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const names = files.map((f) => f.name);
    set_uploaded_photos((prev) => [...prev, ...names]);
    set_photo_files((prev) => [...prev, ...files]);
  };

  const HandlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    set_validation_error(null);

    if (!dimensions || parseFloat(dimensions) <= 0) {
      set_validation_error('Please enter a valid property area in m².');
      return;
    }

    if (status === 'REJECTED' && !observations.trim()) {
      set_validation_error('You must enter observations detailing the reason for rejection.');
      return;
    }

    // Open digital signature modal
    set_is_sign_modal_open(true);
  };

  const HandleSignatureComplete = (signature_hash: string) => {
    setTimeout(() => {
      set_is_sign_modal_open(false);
      OnSubmitReport({
        status,
        dimensions_verified: parseFloat(dimensions),
        front_setback,
        back_setback,
        left_setback,
        right_setback,
        observations,
        gps_latitude: gps_lat || undefined,
        gps_longitude: gps_lng || undefined,
        attachments: uploaded_photos,
        signature_hash,
        files: photo_files,
      });
    }, 1500);
  };

  // Defaults if no technician is logged in
  const tech_name = user ? `${user.first_name} ${user.last_name}` : 'Municipal Tech. Cañar';
  const tech_id = user?.national_id || '0301234567';

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/75 backdrop-blur-md border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-md">
      <form onSubmit={HandlePreSubmit} className="space-y-6 text-left">
        <div>
          <h2 className="font-heading font-black text-slate-900 text-xl tracking-wide">
            Technical Inspection Form
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Record the results and observations from the field inspection
          </p>
        </div>

        {validation_error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
            <AlertCircle size={14} className="flex-shrink-0 animate-bounce" />
            <span className="font-semibold">{validation_error}</span>
          </div>
        )}

        {/* 1. STATUS DECISION */}
        <div className="space-y-2">
          <label className="input-label">Technical Ruling *</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => set_status('APPROVED')}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm cursor-pointer ${
                status === 'APPROVED'
                  ? 'border-green-500 bg-green-50/70 text-green-800 shadow-md shadow-green-100'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
              }`}
            >
              <CheckSquare size={16} />
              <span>APPROVED</span>
            </button>
            <button
              type="button"
              onClick={() => set_status('REJECTED')}
              className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm cursor-pointer ${
                status === 'REJECTED'
                  ? 'border-red-500 bg-red-50/70 text-red-800 shadow-md shadow-red-100'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-350'
              }`}
            >
              <XCircle size={16} />
              <span>REJECTED</span>
            </button>
          </div>
        </div>

        {/* 2. DIMENSIONS AND GPS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="input-label">Verified Land Area (m²) *</label>
            <input
              type="number"
              step="0.01"
              value={dimensions}
              onChange={(e) => set_dimensions(e.target.value)}
              placeholder="e.g. 185.50"
              className="input-field rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="input-label">GPS Location (Coordinates)</label>
            <div className="flex gap-2">
              <div className="grid grid-cols-2 gap-1.5 flex-1">
                <input
                  type="text"
                  placeholder="Latitude"
                  value={gps_lat}
                  onChange={(e) => set_gps_lat(e.target.value)}
                  className="input-field py-2 text-xs rounded-xl font-mono"
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={gps_lng}
                  onChange={(e) => set_gps_lng(e.target.value)}
                  className="input-field py-2 text-xs rounded-xl font-mono"
                />
              </div>
              <button
                type="button"
                onClick={SimulateGPS}
                className="btn-secondary px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs"
                title="Simulate current coordinates"
              >
                <MapPin size={14} />
                <span className="hidden sm:inline">Capture</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. SETBACKS CHECKS */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/50">
          <label className="input-label mb-2">Municipal Setback Verification</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={front_setback}
                onChange={(e) => set_front_setback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Front Setback</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={back_setback}
                onChange={(e) => set_back_setback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Rear Setback</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={left_setback}
                onChange={(e) => set_left_setback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Left Side Setback</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-xl border border-slate-200/40 hover:bg-slate-50 transition-all select-none">
              <input
                type="checkbox"
                checked={right_setback}
                onChange={(e) => set_right_setback(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
              />
              <span>Right Side Setback</span>
            </label>
          </div>
        </div>

        {/* 4. PHOTO ATTACHMENTS */}
        <div className="space-y-2">
          <label className="input-label">Inspection Photo Evidence</label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300/80 hover:border-blue-500/80 rounded-2xl p-5 text-center cursor-pointer transition-all bg-white hover:bg-slate-50/20 group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={HandlePhotoAdd}
              className="sr-only"
            />
            <Camera
              size={24}
              className="text-slate-400 group-hover:text-blue-500 mb-2 transition-colors"
            />
            <p className="text-xs font-semibold text-slate-700">Upload inspection photos</p>
            <p className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG formats — Max 10MB</p>
          </label>

          {uploaded_photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {uploaded_photos.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50/50 border border-blue-100 text-[10px] font-semibold text-blue-800"
                >
                  <div className="truncate flex-1">{name}</div>
                  <button
                    type="button"
                    onClick={() => {
                      set_uploaded_photos((prev) => prev.filter((_, idx) => idx !== i));
                      set_photo_files((prev) => prev.filter((_, idx) => idx !== i));
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
            Observations and Conclusions {status === 'REJECTED' ? '*' : '(Optional)'}
          </label>
          <textarea
            value={observations}
            onChange={(e) => set_observations(e.target.value)}
            rows={4}
            placeholder={
              status === 'REJECTED'
                ? 'Detail the specific reasons for rejecting the municipal inspection here...'
                : 'Detail observations found in the field...'
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
          <span>Proceed to Sign Report</span>
        </button>
      </form>

      {/* DIGITAL SIGNATURE MODAL CONTAINER */}
      <BaseModal
        is_open={is_sign_modal_open}
        OnClose={() => set_is_sign_modal_open(false)}
        title="Technical Inspection Report Signature"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 text-left">
            As a technical inspector for GAD Cañar, you must validate the reported data and apply
            your cryptographic digital signature irrevocably to this technical document.
          </p>
          <DigitalSignatureSimulator
            signer_name={tech_name}
            signer_id={tech_id}
            require_pin={true}
            OnSignComplete={HandleSignatureComplete}
            title="Sign Technical Inspection Report"
          />
        </div>
      </BaseModal>
    </div>
  );
}
