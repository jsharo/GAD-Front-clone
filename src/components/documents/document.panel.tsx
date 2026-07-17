import { useCallback, useEffect, useState } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import {
  GetRequestAttachments,
  UploadRequestAttachment,
  type AttachmentFolder,
  type RequestAttachment,
} from '@/lib/api.calls';
import { GetApiError } from '@/lib/errors';
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
  request_id: string;
  allowed_upload?: boolean;
  allowed_ipfs?: boolean;
  OnAttachmentsChanged?: () => void;
}

export function DocumentPanel({
  request_id,
  allowed_upload = false,
  allowed_ipfs = false,
  OnAttachmentsChanged,
}: DocumentPanelProps) {
  const [attachments, set_attachments] = useState<RequestAttachment[]>([]);
  const [loading, set_loading] = useState(true);
  const [uploading, set_uploading] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const LoadAttachments = useCallback(async () => {
    set_loading(true);
    try {
      set_attachments(await GetRequestAttachments(request_id));
    } catch (err) {
      set_error(GetApiError(err, 'No se pudieron cargar los documentos.'));
    } finally {
      set_loading(false);
    }
  }, [request_id]);

  useEffect(() => {
    void LoadAttachments();
  }, [LoadAttachments]);

  const HandleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!(data.get('file') instanceof File) || !(data.get('file') as File).size) return;
    set_uploading(true);
    set_error(null);
    try {
      await UploadRequestAttachment(request_id, data);
      form.reset();
      await LoadAttachments();
      OnAttachmentsChanged?.();
    } catch (err) {
      set_error(GetApiError(err, 'No se pudo subir el documento.'));
    } finally {
      set_uploading(false);
    }
  };

  return (
    <DetailSection title={`Documentos (${attachments.length})`} icon={FileText}>
      {error && <AlertBanner message={error} OnDismiss={() => set_error(null)} className="mb-4" />}
      {allowed_upload && (
        <form
          onSubmit={HandleUpload}
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
              request_id={request_id}
              attachment={attachment}
              allowed_ipfs={allowed_ipfs}
              OnError={set_error}
            />
          ))}
        </div>
      )}
    </DetailSection>
  );
}
