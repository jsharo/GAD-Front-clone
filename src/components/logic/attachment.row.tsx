import { useState } from 'react';
import { Database, Download, Eye, FileText, Loader2, ShieldCheck } from 'lucide-react';
import {
  sendAttachmentToIpfs,
  verifyRequestAttachment,
  type AttachmentIntegrityResult,
  type RequestAttachment,
} from '@/lib/api.calls';
import { openRequestAttachment, saveRequestAttachment } from '@/lib/files';
import { getApiError } from '@/lib/errors';

interface AttachmentRowProps {
  requestId: string;
  attachment: RequestAttachment;
  allowedIpfs?: boolean;
  onError?: (message: string) => void;
}

export function AttachmentRow({
  requestId,
  attachment,
  allowedIpfs = false,
  onError,
}: AttachmentRowProps) {
  const [verification, setVerification] = useState<AttachmentIntegrityResult | null>(null);
  const [ipfsStatus, setIpfsStatus] = useState(attachment.ipfs_status || 'PENDING');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const isPdf =
    attachment.type === 'application/pdf' || attachment.name.toLowerCase().endsWith('.pdf');

  const run = async (action: string, callback: () => Promise<void>) => {
    setLoadingAction(action);
    try {
      await callback();
    } catch (error) {
      onError?.(getApiError(error, 'No se pudo completar la operación documental.'));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={
            isPdf ? 'rounded-xl bg-error-light/10 p-2.5' : 'rounded-xl bg-primary-light/10 p-2.5'
          }
        >
          <FileText size={18} className={isPdf ? 'text-error-default' : 'text-primary-default'} />
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
            title="Ver documento"
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
            onClick={() => run('view', () => openRequestAttachment(requestId, attachment.id))}
          >
            {loadingAction === 'view' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Eye size={16} />
            )}
          </button>
          <button
            title="Descargar documento"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            onClick={() =>
              run('download', () =>
                saveRequestAttachment(requestId, attachment.id, attachment.name)
              )
            }
          >
            {loadingAction === 'download' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
          </button>
          <button
            title="Verificar integridad"
            className="rounded-lg p-2 text-green-700 hover:bg-green-50"
            onClick={() =>
              run('verify', async () =>
                setVerification(await verifyRequestAttachment(requestId, attachment.id))
              )
            }
          >
            {loadingAction === 'verify' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShieldCheck size={16} />
            )}
          </button>
          {allowedIpfs && (
            <button
              title="Enviar a IPFS"
              className="rounded-lg p-2 text-violet-700 hover:bg-violet-50"
              onClick={() =>
                run('ipfs', async () =>
                  setIpfsStatus((await sendAttachmentToIpfs(requestId, attachment.id)).ipfs_status)
                )
              }
            >
              {loadingAction === 'ipfs' ? (
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
          IPFS: {ipfsStatus}
        </span>
        {verification && (
          <span
            className={`rounded-full px-2 py-1 ${verification.valid ? 'bg-green-50 text-green-700' : verification.verifiable ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}
          >
            {verification.valid
              ? 'Íntegro'
              : verification.verifiable
                ? 'Alterado'
                : 'No verificable'}
          </span>
        )}
      </div>
    </div>
  );
}
