import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  CheckCircle,
  FileSignature,
} from 'lucide-react';

export interface DigitalSignatureSimulatorProps {
  signer_name: string;
  signer_id: string;
  require_pin?: boolean;
  OnSignComplete: (signature_hash: string) => void;
  title?: string;
}

export function DigitalSignatureSimulator({
  signer_name,
  signer_id,
  require_pin = true,
  OnSignComplete,
  title = 'Advanced Electronic Signature Simulator',
}: DigitalSignatureSimulatorProps) {
  const canvas_ref = useRef<HTMLCanvasElement>(null);
  const [is_drawing, set_is_drawing] = useState(false);
  const [pin, set_pin] = useState('');
  const [is_signing, set_is_signing] = useState(false);
  const [signed_hash, set_signed_hash] = useState<string | null>(null);
  const [error, set_error] = useState<string | null>(null);
  const [canvas_has_content, set_canvas_has_content] = useState(false);

  // Generate a mock SHA-256 fingerprint hash on sign-off
  const GenerateSHA256 = () => {
    const chars = '0123456789abcdef';
    let hash = 'sha256:f8ca9b2e';
    for (let i = 0; i < 48; i++) {
      hash += chars[Math.floor(Math.random() * 16)];
    }
    return hash;
  };

  // Draw handlers for HTML5 Canvas
  useEffect(() => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for crisp lines
    ctx.strokeStyle = '#1D4ED8'; // blue-700
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const GetCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvas_ref.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Handle touch vs mouse
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const StartDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ('touches' in e) {
      e.preventDefault();
    }
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = GetCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    set_is_drawing(true);
  };

  const Draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!is_drawing) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = GetCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    set_canvas_has_content(true);
  };

  const StopDrawing = () => {
    set_is_drawing(false);
  };

  const ClearCanvas = () => {
    const canvas = canvas_ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    set_canvas_has_content(false);
    set_error(null);
  };

  const HandleAuthorize = async () => {
    set_error(null);

    if (require_pin && pin.length !== 4) {
      set_error('Please enter a 4-digit PIN code.');
      return;
    }

    if (!canvas_has_content) {
      set_error('You must draw your signature in the box to continue.');
      return;
    }

    set_is_signing(true);

    // Simulate signature processing / cryptographic verification delay
    setTimeout(() => {
      const hash = GenerateSHA256();
      set_signed_hash(hash);
      set_is_signing(false);
      OnSignComplete(hash);
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-lg p-6 space-y-6 text-left">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
          <FileSignature size={20} />
        </div>
        <div>
          <h4 className="font-heading font-black text-slate-800 text-sm tracking-wide">{title}</h4>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">
            GAD Cañar Mobile Signature
          </p>
        </div>
      </div>

      {!signed_hash ? (
        <div className="space-y-5">
          {/* Signer details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/50 text-xs">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Signer</p>
              <p className="text-slate-700 font-bold mt-0.5">{signer_name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Identification (National ID)
              </p>
              <p className="text-slate-700 font-mono font-semibold mt-0.5">{signer_id}</p>
            </div>
            <div className="col-span-2 border-t border-slate-200/50 pt-2">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                Date and Time
              </p>
              <p className="text-slate-600 font-medium mt-0.5">{new Date().toLocaleString()}</p>
            </div>
          </div>

          {/* Signature canvas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <PenTool size={10} /> Digital Signature Stroke *
              </label>
              {canvas_has_content && (
                <button
                  type="button"
                  onClick={ClearCanvas}
                  className="text-[10px] text-red-500 hover:text-red-650 font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw size={10} /> Clear
                </button>
              )}
            </div>
            <div className="relative border border-slate-200 hover:border-slate-350 rounded-2xl overflow-hidden bg-slate-50 cursor-crosshair">
              <canvas
                ref={canvas_ref}
                width={430}
                height={160}
                onMouseDown={StartDrawing}
                onMouseMove={Draw}
                onMouseUp={StopDrawing}
                onMouseLeave={StopDrawing}
                onTouchStart={StartDrawing}
                onTouchMove={Draw}
                onTouchEnd={StopDrawing}
                className="w-full h-40"
              />
              {!canvas_has_content && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs">
                  Draw your signature here (mouse or finger)
                </div>
              )}
            </div>
          </div>

          {/* Optional PIN */}
          {require_pin && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <KeyRound size={10} /> Certificate PIN Code (4 digits) *
              </label>
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => set_pin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="••••"
                className="input-field py-2.5 text-center font-mono text-lg tracking-[0.5em] focus:bg-blue-50/50"
              />
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-500 font-bold bg-red-50 p-2.5 rounded-xl border border-red-100 flex items-center gap-1.5 animate-pulse">
              ⚠️ {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="button"
            onClick={HandleAuthorize}
            disabled={is_signing}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 rounded-xl transition-all font-bold text-xs"
          >
            {is_signing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Encrypting and Signing...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Authorize and Sign Digitally</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Signed state showing certificate */
        <div className="p-6 text-center space-y-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex flex-col items-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle size={36} className="animate-bounce" />
          </div>
          <div>
            <h5 className="font-heading font-black text-slate-800 text-sm">
              Signature Authorized Successfully
            </h5>
            <p className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
              Valid Signature Certificate
            </p>
          </div>
          <div className="w-full text-left space-y-2 border-t border-emerald-200/50 pt-4 text-[10px] font-medium text-slate-600">
            <div>
              <span className="text-slate-400 font-bold">DATE:</span> {new Date().toLocaleString()}
            </div>
            <div>
              <span className="text-slate-400 font-bold">ALGORITHM:</span> SHA-256 with RSA-2048
            </div>
            <div className="break-all">
              <span className="text-slate-400 font-bold">DIGITAL FINGERPRINT:</span>
              <p className="font-mono mt-0.5 text-slate-700">{signed_hash}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
