import type { ReactNode } from 'react';
import { BaseModal } from '@/components/logic/base.modal';

interface ConfirmModalProps {
  is_open: boolean;
  title: string;
  message: ReactNode;
  confirm_label?: string;
  cancel_label?: string;
  is_loading?: boolean;
  danger?: boolean;
  OnConfirm: () => void;
  OnClose: () => void;
}

export function ConfirmModal({
  is_open,
  title,
  message,
  confirm_label = 'Confirm',
  cancel_label = 'Cancel',
  is_loading = false,
  danger = false,
  OnConfirm,
  OnClose,
}: ConfirmModalProps) {
  return (
    <BaseModal is_open={is_open} OnClose={OnClose} title={title} size="sm" hide_brand_bar>
      <div className="space-y-4 text-left">
        <div className="text-sm text-slate-600 leading-relaxed">{message}</div>
        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={OnClose}
            disabled={is_loading}
            className="btn-secondary disabled:opacity-50"
          >
            {cancel_label}
          </button>
          <button
            type="button"
            onClick={OnConfirm}
            disabled={is_loading}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary-default text-neutral-50 hover:bg-primary-dark'
            }`}
          >
            {is_loading ? 'Processing...' : confirm_label}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
