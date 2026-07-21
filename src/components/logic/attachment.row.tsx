import { useState } from 'react';

import { Database, Download, Eye, FileText, Loader2, ShieldCheck } from 'lucide-react';

import {
  SendAttachmentToIpfs,
  VerifyRequestAttachment,
  type AttachmentIntegrityResult,
  type RequestAttachment,
} from '@/lib/api.calls';

import { OpenRequestAttachment, SaveRequestAttachment } from '@/lib/files';

import { GetApiError } from '@/lib/errors';

interface AttachmentRowProps {
  request_id: string;

  attachment: RequestAttachment;

  allowed_ipfs?: boolean;

  OnError?: (message: string) => void;
}

export function AttachmentRow({
  request_id,

  attachment,

  allowed_ipfs = false,

  OnError,
}: AttachmentRowProps) {
  const [verification, set_verification] = useState<AttachmentIntegrityResult | null>(null);

  const [ipfs_status, set_ipfs_status] = useState(attachment.ipfs_status || 'PENDING');

  const [loading_action, set_loading_action] = useState<string | null>(null);

  const is_pdf =
    attachment.type === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf');

  const Run = async (action: string, callback: () => Promise<void>) => {
    set_loading_action(action);

    try {
      await callback();
    } catch (error) {
      OnError?.(GetApiError(error, 'The document operation could not be completed.'));
    } finally {
      set_loading_action(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={
            is_pdf ? 'rounded-xl bg-error-light/10 p-2.5' : 'rounded-xl bg-primary-light/10 p-2.5'
          }
        >
          <FileText size={18} className={is_pdf ? 'text-error-default' : 'text-primary-default'} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-blue-955">{attachment.name}</p>

          <p className="mt-0.5 text-xs text-slate-400">
            {attachment.folder} · {((attachment.size || 0) / 1024).toFixed(1)} KB
          </p>

          {attachment.hash && (
            <p className="mt-1 truncate font-mono text-[10px] text-slate-400">
              SHA-256: {attachment.hash}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            title="View document"
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
            onClick={() => Run('view', () => OpenRequestAttachment(request_id, attachment.id))}
          >
            {loading_action === 'view' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Eye size={16} />
            )}
          </button>

          <button
            title="Download document"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            onClick={() =>
              Run('download', () =>
                SaveRequestAttachment(request_id, attachment.id, attachment.name)
              )
            }
          >
            {loading_action === 'download' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </button>

          <button
            title="Verify integrity"
            className="rounded-lg p-2 text-green-700 hover:bg-green-50"
            onClick={() =>
              Run('verify', async () =>
                set_verification(await VerifyRequestAttachment(request_id, attachment.id))
              )
            }
          >
            {loading_action === 'verify' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
          </button>

          {allowed_ipfs && (
            <button
              title="Send to IPFS"
              className="rounded-lg p-2 text-violet-700 hover:bg-violet-50"
              onClick={() =>
                Run('ipfs', async () =>
                  set_ipfs_status(
                    (await SendAttachmentToIpfs(request_id, attachment.id)).ipfs_status
                  )
                )
              }
            >
              {loading_action === 'ipfs' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Database size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
          IPFS: {ipfs_status}
        </span>

        {verification && (
          <span
            className={`rounded-full px-2 py-1 ${verification.valid ? 'bg-green-50 text-green-700' : verification.verifiable ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}
          >
            {verification.valid ? 'Intact' : verification.verifiable ? 'Altered' : 'Not verifiable'}
          </span>
        )}
      </div>
    </div>
  );
}
