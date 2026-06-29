import { useState } from 'react';
import { AlertCircle, HardHat } from 'lucide-react';
import { BaseModal } from '@/components/logic/base.modal';
import { useAuthStore } from '@/stores/auth.store';

interface Props {
  onSuccess?: () => void;
  onClose?: () => void;
  allowClose?: boolean;
}

export function CompleteProfileModal({ onSuccess, onClose, allowClose = false }: Props) {
  const { completeProfile, is_loading, error, clearError, user } = useAuthStore();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    national_id: user?.national_id ?? '',
    phone: user?.phone ?? '',
    password: '',
    confirm_password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (form.password !== form.confirm_password) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    try {
      await completeProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        national_id: form.national_id.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      onSuccess?.();
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || error;

  return (
    <BaseModal
      isOpen
      onClose={allowClose ? () => onClose?.() : () => {}}
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

        {displayError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={16} className="flex-shrink-0" />
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Nombres *</label>
              <input
                required
                type="text"
                className="input-field"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Apellidos *</label>
              <input
                required
                type="text"
                className="input-field"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
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
                onChange={(e) => setForm({ ...form, national_id: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Teléfono</label>
              <input
                type="text"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Confirmar contraseña *</label>
              <input
                required
                type="password"
                className="input-field"
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {allowClose && (
              <button type="button" onClick={onClose} className="btn-secondary">
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
