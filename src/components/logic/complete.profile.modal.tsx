import { useState } from 'react';
import { AlertCircle, HardHat } from 'lucide-react';
import { BaseModal } from '@/components/logic/base.modal';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  OnSuccess?: () => void;
  OnClose?: () => void;
  allow_close?: boolean;
}

export function CompleteProfileModal({ OnSuccess, OnClose, allow_close = false }: Props) {
  const { CompleteProfile, is_loading, error, ClearError, user } = useAuthStore();
  const [form, set_form] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    national_id: user?.national_id ?? '',
    phone: user?.phone ?? '',
    password: '',
    confirm_password: '',
  });
  const [local_error, set_local_error] = useState<string | null>(null);

  const HandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    set_local_error(null);
    ClearError();

    if (form.password !== form.confirm_password) {
      set_local_error('Las contraseñas no coinciden');
      return;
    }

    try {
      await CompleteProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        national_id: form.national_id.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
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
      OnClose={allow_close ? () => OnClose?.() : () => {}}
      title="Completa tu perfil profesional"
      size="md"
    >
      <div className="space-y-4 text-left">
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <HardHat size={18} className="mt-0.5 flex-shrink-0" />
          <p>
            Antes de que la Secretaría valide tu habilitación, completa tus datos personales para
            identificarte en el sistema.
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
                value={form.first_name}
                onChange={(e) => set_form({ ...form, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Apellidos *</label>
              <input
                required
                type="text"
                className="input-field"
                value={form.last_name}
                onChange={(e) => set_form({ ...form, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Cédula *</label>
              <input
                required
                type="text"
                maxLength={10}
                className="input-field"
                value={form.national_id}
                onChange={(e) => set_form({ ...form, national_id: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Teléfono</label>
              <input
                type="text"
                className="input-field"
                value={form.phone}
                onChange={(e) => set_form({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Contraseña *</label>
              <input
                required
                type="password"
                className="input-field"
                value={form.password}
                onChange={(e) => set_form({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Confirmar contraseña *</label>
              <input
                required
                type="password"
                className="input-field"
                value={form.confirm_password}
                onChange={(e) => set_form({ ...form, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {allow_close && (
              <button type="button" onClick={OnClose} className="btn-secondary">
                Cancelar
              </button>
            )}
            <button type="submit" disabled={is_loading} className="btn-primary">
              {is_loading ? 'Guardando...' : 'Guardar perfil'}
            </button>
          </div>
        </form>
      </div>
    </BaseModal>
  );
}
