import { useCallback, useEffect, useState } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import {
  getRequestAttachments,
  uploadRequestAttachment,
  type AttachmentFolder,
  type RequestAttachment,
} from '@/lib/api.calls';
import { getApiError } from '@/lib/errors';
import { AttachmentRow } from '@/components/logic/attachment.row';
import { AlertBanner } from '@/components/ui/alert.banner';
import { DetailSection } from '@/components/ui/detail.section';

const FOLDERS: Array<{ value: AttachmentFolder; label: string }> = [
  { value: 'PLANOS', label: 'Planos' },
  { value: 'DOCUMENTOS_LEGALES', label: 'Documentos legales' },
  { value: 'INFORMES', label: 'Informes' },
  { value: 'OTROS', label: 'Otros' },
];

interface DocumentPanelProps {
  requestId: string;
  allowedUpload?: boolean;
  allowedIpfs?: boolean;
}

export function DocumentPanel({
  requestId,
  allowedUpload = false,
  allowedIpfs = false,
}: DocumentPanelProps) {
  const [attachments, setAttachments] = useState<RequestAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttachments = useCallback(async () => {
    setLoading(true);
    try {
      setAttachments(await getRequestAttachments(requestId));
    } catch (err) {
      setError(getApiError(err, 'No se pudieron cargar los documentos.'));
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    void loadAttachments();
  }, [loadAttachments]);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!(data.get('file') instanceof File) || !(data.get('file') as File).size) return;
    setUploading(true);
    setError(null);
    try {
      await uploadRequestAttachment(requestId, data);
      form.reset();
      await loadAttachments();
    } catch (err) {
      setError(getApiError(err, 'No se pudo subir el documento.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <DetailSection title={`Documentos (${attachments.length})`} icon={FileText}>
      {error && <AlertBanner message={error} onDismiss={() => setError(null)} className="mb-4" />}
      {allowedUpload && (
        <form
          onSubmit={handleUpload}
          className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_180px_auto]"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <input required name="file" type="file" className="input-field text-xs" />
            <input name="name" placeholder="Nombre opcional" className="input-field text-xs" />
          </div>
          <select required name="folder" defaultValue="OTROS" className="input-field text-xs">
            {FOLDERS.map((folder) => (
              <option key={folder.value} value={folder.value}>
                {folder.label}
              </option>
            ))}
          </select>
          <button disabled={uploading} className="btn-primary justify-center text-xs">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}{' '}
            Subir
          </button>
        </form>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : attachments.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">No hay documentos adjuntos.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <AttachmentRow
              key={attachment.id}
              requestId={requestId}
              attachment={attachment}
              allowedIpfs={allowedIpfs}
              onError={setError}
            />
          ))}
        </div>
      )}
    </DetailSection>
  );
}
