import { useState } from 'react';
import { AlertCircle, HardHat } from 'lucide-react';
import { BaseModal } from '@/components/logic/base.modal';
import { useAuthStore } from '@/stores/auth.store';
import {
  IsValidSenescytTitleCode,
  NormalizeSenescytTitleCode,
  SENESCYT_TITLE_CODE_EXAMPLE,
} from '@/lib/senescyt';
import { CedulaValidationMessage } from '@/lib/cedula';

interface Props {
  OnSuccess?: () => void;
  OnClose?: () => void;
  allow_close?: boolean;
}

export function CompleteProfileModal({ OnSuccess, OnClose, allow_close = true }: Props) {
  const { CompleteProfile, is_loading, error, ClearError, user } = useAuthStore();
  const [form, set_form] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    national_id: user?.national_id ?? '',
    senescyt_code: user?.registration_number ?? '',
  });
  const [local_error, set_local_error] = useState<string | null>(null);

  const HandleClose = () => {
    if (!allow_close) return;
    OnClose?.();
  };

  const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_local_error(null);
    ClearError();

    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.national_id.trim() ||
      !form.senescyt_code.trim()
    ) {
      set_local_error('Completa nombres, apellidos, cédula y el código SENESCYT.');
      return;
    }

    const cedula_error = CedulaValidationMessage(form.national_id);
    if (cedula_error) {
      set_local_error(cedula_error);
      return;
    }

    const senescyt_code = NormalizeSenescytTitleCode(form.senescyt_code);
    if (!IsValidSenescytTitleCode(senescyt_code)) {
      set_local_error(
        `El código del título no es válido. Debe seguir el formato ${SENESCYT_TITLE_CODE_EXAMPLE} (nivel + campo + carrera).`
      );
      return;
    }

    try {
      await CompleteProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        national_id: form.national_id.trim(),
        senescyt_code,
      });
      OnSuccess?.();
    } catch {
      // Error handled by store
    }
  };

  const display_error = local_error || error;

  return (
    <BaseModal
      is_open
      OnClose={HandleClose}
      title="Completa tu perfil profesional"
      size="md"
      hide_brand_bar
    >
      <div className="space-y-4 text-left">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <HardHat size={18} className="mt-0.5 flex-shrink-0" />
          <p>
            Ingresa tus datos, cédula y código SENESCYT. La Secretaría los verificará y habilitará
            tu cuenta para tramitar. La cédula también se usa para validar tus firmas electrónicas.
          </p>
        </div>

        {display_error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={16} className="flex-shrink-0" />
            {display_error}
          </div>
        )}

        <form onSubmit={HandleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Nombres *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="Ej. Juan Carlos"
                value={form.first_name}
                onChange={(e) => set_form({ ...form, first_name: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-neutral-400">Puedes escribir uno o dos nombres</p>
            </div>
            <div>
              <label className="input-label">Apellidos *</label>
              <input
                required
                type="text"
                className="input-field"
                placeholder="Ej. Guaman Suscal"
                value={form.last_name}
                onChange={(e) => set_form({ ...form, last_name: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-neutral-400">
                Puedes escribir uno o dos apellidos
              </p>
            </div>
          </div>

          <div>
            <label className="input-label">Cédula *</label>
            <input
              required
              type="text"
              inputMode="numeric"
              className="input-field font-mono tracking-wide"
              placeholder="10 dígitos"
              maxLength={10}
              value={form.national_id}
              onChange={(e) =>
                set_form({
                  ...form,
                  national_id: e.target.value.replace(/\D/g, '').slice(0, 10),
                })
              }
            />
            <p className="mt-1 text-[11px] text-neutral-400">
              Debe ser una cédula ecuatoriana válida (dígito verificador).
            </p>
          </div>

          <div>
            <label className="input-label">Código SENESCYT del título *</label>
            <input
              required
              type="text"
              className="input-field font-mono uppercase tracking-wide"
              placeholder={`Ej. ${SENESCYT_TITLE_CODE_EXAMPLE}`}
              maxLength={9}
              value={form.senescyt_code}
              onChange={(e) =>
                set_form({
                  ...form,
                  senescyt_code: NormalizeSenescytTitleCode(e.target.value).slice(0, 9),
                })
              }
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={is_loading}
              className={`btn-primary px-6 py-2.5 rounded-xl text-sm font-bold ${
                is_loading ? 'opacity-50' : ''
              }`}
            >
              {is_loading ? 'Enviando...' : 'Enviar a Secretaría'}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
