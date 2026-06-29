import api from '@/lib/api';
import { downloadRequestAttachment } from '@/lib/api.calls';

export function getFileUrl(key: string): string {
  // TODO legacy: migrate inspection photos to protected attachment downloads.
  return `/api/v1/files/${encodeURIComponent(key)}`;
}

function filenameFromDisposition(disposition: string | undefined, fallback: string): string {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  return encoded ? decodeURIComponent(encoded) : fallback;
}

export async function fetchRequestAttachmentBlob(requestId: string, attachmentId: string) {
  const response = await downloadRequestAttachment(requestId, attachmentId);
  return {
    blob: response.data,
    filename: filenameFromDisposition(response.headers['content-disposition'], 'documento'),
  };
}

export async function openRequestAttachment(requestId: string, attachmentId: string) {
  const { blob } = await fetchRequestAttachmentBlob(requestId, attachmentId);
  const blobUrl = window.URL.createObjectURL(blob);
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
}

export async function saveRequestAttachment(
  requestId: string,
  attachmentId: string,
  fallbackName: string
) {
  const { blob, filename } = await fetchRequestAttachmentBlob(requestId, attachmentId);
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename || fallbackName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export async function fetchFileBlob(url: string): Promise<string> {
  const response = await api.get(url, { responseType: 'blob' });
  return window.URL.createObjectURL(
    new Blob([response.data], { type: response.headers['content-type'] as string })
  );
}

export async function openFileInNewTab(url: string): Promise<void> {
  try {
    const blobUrl = await fetchFileBlob(url);
    window.open(blobUrl, '_blank');
  } catch (error) {
    console.error(error);
    throw new Error('Error al cargar el documento', { cause: error });
  }
}

export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const blobUrl = await fetchFileBlob(url);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
    throw new Error('Error al descargar el documento', { cause: error });
  }
}
