import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { AlertCircle, Info, Mail, Plus, Settings, Trash2, User } from 'lucide-react';
import { users_api } from '@/lib/api.calls';
import { GetApiError } from '@/lib/errors';
import { PageHeader } from '@/components/ui/page.header';
import { AlertBanner } from '@/components/ui/alert.banner';
import { BaseModal } from '@/components/logic/base.modal';
import { ConfirmModal } from '@/components/logic/confirm.modal';
import { LoadingSkeleton } from '@/components/ui/loading.skeleton';
import { useToastStore } from '@/stores/toast.store';
import { MapUser, useAuthStore } from '@/stores/auth.store';
import { CedulaValidationMessage } from '@/lib/cedula';

const CODE_LENGTH = 6;

type SettingsTab = 'profile' | 'secondary-email';

interface MeProfile {
  id: string;
  email: string;
  name: string | null;
  lastname: string | null;
  cedula: string | null;
  senescytCode: string | null;
  professionalStatus: string | null;
  recoveryEmail: string | null;
  recoveryEmailVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  signatureCertFingerprint?: string | null;
  signatureCertCommonName?: string | null;
  signatureCertNationalId?: string | null;
  signatureCertIssuerCn?: string | null;
  signatureCertValidFrom?: string | null;
  signatureCertValidTo?: string | null;
  signatureProfileCapturedAt?: string | null;
}

type ModalStep = 'email' | 'code';

const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'secondary-email', label: 'Secondary email', icon: Mail },
];

const STATUS_LABELS: Record<string, string> = {
  UNVERIFIED: 'Unverified',
  PENDING: 'Under review',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-bold text-neutral-500 tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-neutral-800">{value?.trim() || '—'}</p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  inputMode,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-neutral-500 tracking-wide mb-1 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        disabled={disabled}
        readOnly={disabled}
        className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border ${
          disabled
            ? 'bg-neutral-100 border-neutral-200 text-neutral-600 cursor-not-allowed'
            : 'bg-white border-neutral-300 focus:border-primary-default focus:ring-2 focus:ring-primary-light'
        }`}
      />
    </div>
  );
}

export function SettingsPage() {
  const AddToast = useToastStore((s) => s.AddToast);
  const auth_user = useAuthStore((s) => s.user);
  const SetAuthUser = useAuthStore.setState;
  const [active_tab, set_active_tab] = useState<SettingsTab>('profile');
  const [profile, set_profile] = useState<MeProfile | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [profile_form, set_profile_form] = useState({
    name: '',
    lastname: '',
    cedula: '',
  });
  const [profile_saving, set_profile_saving] = useState(false);
  const [profile_error, set_profile_error] = useState<string | null>(null);

  const [modal_open, set_modal_open] = useState(false);
  const [modal_step, set_modal_step] = useState<ModalStep>('email');
  const [recovery_input, set_recovery_input] = useState('');
  const [digits, set_digits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [modal_error, set_modal_error] = useState<string | null>(null);
  const [modal_loading, set_modal_loading] = useState(false);
  const [remove_modal_open, set_remove_modal_open] = useState(false);
  const [remove_loading, set_remove_loading] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const LoadProfile = useCallback(async () => {
    set_is_loading(true);
    set_error(null);
    try {
      const { data: body } = await users_api.Me();
      const data = (body as { success: boolean; data: MeProfile }).data;
      set_profile(data);
      set_profile_form({
        name: data.name ?? '',
        lastname: data.lastname ?? '',
        cedula: data.cedula ?? '',
      });
    } catch (err) {
      set_error(GetApiError(err, 'Could not load settings'));
    } finally {
      set_is_loading(false);
    }
  }, []);

  useEffect(() => {
    void LoadProfile();
  }, [LoadProfile]);

  const profile_dirty =
    Boolean(profile) &&
    (profile_form.name.trim() !== (profile?.name ?? '').trim() ||
      profile_form.lastname.trim() !== (profile?.lastname ?? '').trim() ||
      profile_form.cedula.trim() !== (profile?.cedula ?? '').trim());

  const is_configured = Boolean(profile?.recoveryEmail && profile.recoveryEmailVerified);
  const is_architect = auth_user?.role === 'USER';
  const can_edit_profile = !is_architect || profile?.professionalStatus === 'VERIFIED';

  const SaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can_edit_profile) return;
    set_profile_error(null);

    if (!profile_form.name.trim() || !profile_form.lastname.trim()) {
      set_profile_error('First and last name are required.');
      return;
    }
    const cedula_error = CedulaValidationMessage(profile_form.cedula);
    if (cedula_error) {
      set_profile_error(cedula_error);
      return;
    }

    set_profile_saving(true);
    try {
      const { data: body } = await users_api.UpdateOwnProfile({
        name: profile_form.name.trim(),
        lastname: profile_form.lastname.trim(),
        cedula: profile_form.cedula.trim() || undefined,
      });
      const updated = (body as { data?: MeProfile }).data;
      if (updated) {
        set_profile((prev) => (prev ? { ...prev, ...updated } : prev));
        set_profile_form({
          name: updated.name ?? '',
          lastname: updated.lastname ?? '',
          cedula: updated.cedula ?? '',
        });
      }
      const mapped = MapUser(updated);
      if (mapped && auth_user) {
        SetAuthUser({
          user: {
            ...auth_user,
            first_name: mapped.first_name,
            last_name: mapped.last_name,
            national_id: mapped.national_id,
          },
        });
      }
      AddToast({ type: 'success', message: 'Profile updated' });
      await LoadProfile();
    } catch (err) {
      set_profile_error(GetApiError(err, 'Could not save profile'));
    } finally {
      set_profile_saving(false);
    }
  };

  const OpenAddModal = () => {
    set_modal_step('email');
    set_recovery_input(
      profile?.recoveryEmail && !profile.recoveryEmailVerified ? profile.recoveryEmail : ''
    );
    set_digits(Array(CODE_LENGTH).fill(''));
    set_modal_error(null);
    set_modal_open(true);
  };

  const CloseModal = () => {
    set_modal_open(false);
    set_modal_error(null);
    set_modal_loading(false);
  };

  const SubmitRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    set_modal_error(null);
    set_modal_loading(true);
    try {
      await users_api.SetRecoveryEmail(recovery_input.trim());
      set_modal_step('code');
      set_digits(Array(CODE_LENGTH).fill(''));
      AddToast({ type: 'success', message: 'Code sent to secondary email' });
    } catch (err) {
      set_modal_error(GetApiError(err, 'Could not send code'));
    } finally {
      set_modal_loading(false);
    }
  };

  const FocusAt = (index: number) => inputs.current[index]?.focus();

  const HandleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    set_digits(next);
    if (digit && index < CODE_LENGTH - 1) FocusAt(index + 1);
  };

  const HandleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) FocusAt(index - 1);
  };

  const HandlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    const next = [...digits];
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });
    set_digits(next);
    FocusAt(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  const SubmitVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < CODE_LENGTH) {
      set_modal_error('Enter the full 6-digit code.');
      return;
    }
    set_modal_error(null);
    set_modal_loading(true);
    try {
      await users_api.VerifyRecoveryEmail(code);
      AddToast({ type: 'success', message: 'Secondary email verified' });
      CloseModal();
      await LoadProfile();
    } catch (err) {
      set_modal_error(GetApiError(err, 'Invalid or expired code'));
    } finally {
      set_modal_loading(false);
    }
  };

  const HandleRemove = () => {
    set_remove_modal_open(true);
  };

  const ConfirmRemoveSecondaryEmail = async () => {
    set_remove_loading(true);
    try {
      await users_api.RemoveRecoveryEmail();
      AddToast({ type: 'success', message: 'Secondary email removed' });
      set_remove_modal_open(false);
      await LoadProfile();
    } catch (err) {
      AddToast({ type: 'error', message: GetApiError(err, 'Could not remove') });
    } finally {
      set_remove_loading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="View your profile and manage account options"
        icon={Settings}
      />

      {error && <AlertBanner message={error} OnDismiss={() => set_error(null)} />}

      {is_loading ? (
        <LoadingSkeleton count={1} variant="card" />
      ) : (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <nav
            className="md:w-52 flex-shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible"
            aria-label="Settings sections"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const is_active = active_tab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => set_active_tab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                    is_active
                      ? 'bg-primary-default text-neutral-50'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-1 min-w-0 max-w-xl">
            {active_tab === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading font-bold text-xl text-neutral-900">Profile</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {can_edit_profile
                      ? 'You can edit first name, last name, and ID number. The rest is read-only.'
                      : 'Profile data is submitted through the licensing form. You will be able to edit it here once the Secretary approves your account.'}
                  </p>
                </div>

                {!can_edit_profile && is_architect && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    {profile?.professionalStatus === 'PENDING'
                      ? 'Your application is under review. The profile is read-only in the meantime.'
                      : profile?.professionalStatus === 'REJECTED'
                        ? 'Your application was rejected. Correct and resubmit your details from the Home banner.'
                        : 'You have not completed your professional profile yet. Use the Home form to submit it to the Secretary.'}
                  </div>
                )}

                <form
                  onSubmit={SaveProfile}
                  className="rounded-2xl bg-neutral-50 border border-neutral-200 p-5 shadow-sm space-y-5"
                >
                  {profile_error && (
                    <AlertBanner
                      message={profile_error}
                      OnDismiss={() => set_profile_error(null)}
                    />
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {can_edit_profile ? (
                      <>
                        <EditableField
                          label="First name *"
                          value={profile_form.name}
                          onChange={(name) => set_profile_form((f) => ({ ...f, name }))}
                          placeholder="e.g. Juan Carlos"
                        />
                        <EditableField
                          label="Last name *"
                          value={profile_form.lastname}
                          onChange={(lastname) => set_profile_form((f) => ({ ...f, lastname }))}
                          placeholder="e.g. Guaman Suscal"
                        />
                        <div>
                          <EditableField
                            label="ID number"
                            value={profile_form.cedula}
                            onChange={(cedula) =>
                              set_profile_form((f) => ({
                                ...f,
                                cedula: cedula.replace(/\D/g, '').slice(0, 10),
                              }))
                            }
                            placeholder="10 digits"
                            maxLength={10}
                            inputMode="numeric"
                          />
                          <p className="mt-1 text-[11px] text-neutral-400">
                            Validated as a real Ecuadorian ID number (check digit).
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ProfileField label="First name" value={profile?.name} />
                        <ProfileField label="Last name" value={profile?.lastname} />
                        <ProfileField label="ID number" value={profile?.cedula} />
                      </>
                    )}
                    <ProfileField label="Primary email" value={profile?.email} />
                    <ProfileField label="SENESCYT code" value={profile?.senescytCode} />
                    <ProfileField
                      label="Professional status"
                      value={
                        profile?.professionalStatus
                          ? (STATUS_LABELS[profile.professionalStatus] ??
                            profile.professionalStatus)
                          : null
                      }
                    />
                  </div>

                  <div className="pt-2 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-end gap-3">
                    {can_edit_profile && (
                      <button
                        type="submit"
                        disabled={!profile_dirty || profile_saving}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-50 ${
                          !profile_dirty || profile_saving
                            ? 'bg-neutral-400/50'
                            : 'bg-primary-default hover:bg-primary-dark'
                        }`}
                      >
                        {profile_saving ? 'Saving...' : 'Save changes'}
                      </button>
                    )}
                  </div>
                </form>

                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-5 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-bold text-neutral-900">Electronic signature</h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Captured automatically when you upload a signed PDF in an application and the
                      certificate ID matches your profile.
                    </p>
                  </div>
                  {profile?.signatureCertFingerprint ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <ProfileField
                        label="Certificate holder"
                        value={profile.signatureCertCommonName}
                      />
                      <ProfileField
                        label="Certificate ID number"
                        value={profile.signatureCertNationalId}
                      />
                      <ProfileField label="Issuer" value={profile.signatureCertIssuerCn} />
                      <ProfileField
                        label="Captured"
                        value={
                          profile.signatureProfileCapturedAt
                            ? new Date(profile.signatureProfileCapturedAt).toLocaleString('en-US')
                            : null
                        }
                      />
                      <div className="sm:col-span-2">
                        <ProfileField
                          label="Certificate fingerprint (SHA-256)"
                          value={profile.signatureCertFingerprint}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-neutral-400">
                      No signature registered yet. Upload an electronically signed PDF document in
                      an application to capture it.
                    </p>
                  )}
                </div>
              </div>
            )}

            {active_tab === 'secondary-email' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading font-bold text-xl text-neutral-900">
                    Secondary email
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Optional backup email for your account
                  </p>
                </div>

                <div className="rounded-2xl border border-secondary-default/40 bg-secondary-default/10 p-4 flex gap-3">
                  <Info size={18} className="text-primary-default flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-neutral-800">What is it for?</p>
                    <p className="mt-1 text-sm text-neutral-600 leading-relaxed">
                      Optional backup email. When resetting your password, you can use your primary
                      email or this secondary one (if verified); the code is sent to whichever
                      address you provide at that time.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-neutral-50 border border-neutral-200 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <h3 className="font-bold text-neutral-900">Current status</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        is_configured ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      <AlertCircle size={12} />
                      {is_configured ? 'Configured' : 'Not configured'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <ProfileField label="Primary email" value={profile?.email} />
                    <div>
                      <p className="text-xs font-bold text-neutral-500 tracking-wide mb-1">
                        Secondary email
                      </p>
                      {is_configured ? (
                        <p className="text-sm font-medium text-neutral-800">
                          {profile?.recoveryEmail}
                        </p>
                      ) : profile?.recoveryEmail && !profile.recoveryEmailVerified ? (
                        <p className="text-sm italic text-amber-700">
                          Pending verification: {profile.recoveryEmail}
                        </p>
                      ) : (
                        <p className="text-sm italic text-neutral-400">Not configured</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={OpenAddModal}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-neutral-50 bg-primary-default hover:bg-primary-dark"
                    >
                      <Plus size={16} />
                      {is_configured || profile?.recoveryEmail ? 'Edit email' : 'Add email'}
                    </button>
                    {(is_configured || profile?.recoveryEmail) && (
                      <button
                        type="button"
                        onClick={() => void HandleRemove()}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-error-default border border-neutral-200 hover:bg-neutral-100"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <BaseModal
        is_open={modal_open}
        OnClose={CloseModal}
        title={modal_step === 'email' ? 'Add secondary email' : 'Verify code'}
        hide_brand_bar
      >
        {modal_error && (
          <AlertBanner
            message={modal_error}
            OnDismiss={() => set_modal_error(null)}
            className="mb-4"
          />
        )}

        {modal_step === 'email' ? (
          <form onSubmit={SubmitRecoveryEmail} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 tracking-widest mb-2">
                Secondary email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                />
                <input
                  type="email"
                  required
                  value={recovery_input}
                  onChange={(e) => set_recovery_input(e.target.value)}
                  placeholder="backup@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none bg-neutral-50 border border-neutral-300 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
                />
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Must be different from your primary email. We will send you a verification code.
              </p>
            </div>
            <button
              type="submit"
              disabled={modal_loading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-neutral-50 ${
                modal_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
              }`}
            >
              {modal_loading ? 'Sending...' : 'Send code'}
            </button>
          </form>
        ) : (
          <form onSubmit={SubmitVerifyCode} className="space-y-4">
            <p className="text-sm text-neutral-600">
              Enter the 6-digit code sent to{' '}
              <span className="font-medium text-neutral-800">{recovery_input}</span>.
            </p>
            <div className="flex gap-2 justify-between">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  onChange={(e) => HandleChange(i, e.target.value)}
                  onKeyDown={(e) => HandleKeyDown(i, e)}
                  onPaste={HandlePaste}
                  className="w-full aspect-square text-center text-lg font-bold outline-none rounded-xl bg-neutral-50 border border-neutral-300 focus:border-primary-default focus:ring-2 focus:ring-primary-light"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={modal_loading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-neutral-50 ${
                modal_loading ? 'bg-neutral-400/50' : 'bg-primary-default hover:bg-primary-dark'
              }`}
            >
              {modal_loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}
      </BaseModal>

      <ConfirmModal
        is_open={remove_modal_open}
        title="Remove secondary email"
        message={
          <p>
            Are you sure you want to remove the secondary email{' '}
            <span className="font-semibold text-slate-800">{profile?.recoveryEmail ?? ''}</span>?
            You can set it up again later.
          </p>
        }
        confirm_label="Remove"
        cancel_label="Cancel"
        danger
        is_loading={remove_loading}
        OnConfirm={() => void ConfirmRemoveSecondaryEmail()}
        OnClose={() => {
          if (!remove_loading) set_remove_modal_open(false);
        }}
      />
    </div>
  );
}
