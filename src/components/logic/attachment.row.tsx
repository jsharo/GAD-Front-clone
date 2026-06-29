import { FileText, Eye, Download } from 'lucide-react';
import { downloadFile, getFileUrl, openFileInNewTab } from '@/lib/files';

export interface FileAttachment {
  id: string;
  key: string;
  name: string;
  size: number;
  hash?: string;
  mime_type?: string;
}

interface AttachmentRowProps {
  attachment: FileAttachment;
  showDownload?: boolean;
  onError?: (message: string) => void;
}

export function AttachmentRow({ attachment, showDownload = true, onError }: AttachmentRowProps) {
  const url = getFileUrl(attachment.key);
  const isPdf = attachment.mime_type === 'application/pdf' || attachment.name?.endsWith('.pdf');

  const handleView = async () => {
    try {
      await openFileInNewTab(url);
    } catch {
      onError?.('Error al cargar el documento');
      alert('Error al cargar el documento');
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(url, attachment.name);
    } catch {
      onError?.('Error al descargar el documento');
      alert('Error al descargar el documento');
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 hover:bg-slate-50">
      <div
        className={
          isPdf
            ? 'rounded-xl bg-error-light/10 p-2.5 flex-shrink-0'
            : 'rounded-xl bg-primary-light/10 p-2.5 flex-shrink-0'
        }
      >
        <FileText size={18} className={isPdf ? 'text-error-default' : 'text-primary-default'} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-blue-955 text-sm font-semibold truncate">{attachment.name}</p>
        <p className="text-slate-400 text-xs mt-0.5">
          {isPdf ? 'PDF' : 'Documento'} • {(attachment.size / 1024).toFixed(1)} KB
          {attachment.hash && (
            <>
              {' '}
              • <span className="font-mono">SHA: {attachment.hash.slice(0, 12)}…</span>
            </>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={handleView}
          title="Ver documento"
          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
        >
          <Eye size={16} />
        </button>
        {showDownload && (
          <button
            onClick={handleDownload}
            title="Descargar documento"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <Download size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
