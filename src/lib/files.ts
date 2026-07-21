import api from '@/lib/api';

import { DownloadRequestAttachment } from '@/lib/api.calls';

export function GetFileUrl(key: string): string {
  // TODO legacy: migrate inspection photos to protected attachment downloads.

  return `/api/v1/files/${encodeURIComponent(key)}`;
}

function FilenameFromDisposition(disposition: string | undefined, fallback: string): string {
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];

  return encoded ? decodeURIComponent(encoded) : fallback;
}

export async function FetchRequestAttachmentBlob(request_id: string, attachment_id: string) {
  const response = await DownloadRequestAttachment(request_id, attachment_id);

  return {
    blob: response.data,

    filename: FilenameFromDisposition(response.headers['content-disposition'], 'document'),
  };
}

export async function OpenRequestAttachment(request_id: string, attachment_id: string) {
  const { blob } = await FetchRequestAttachmentBlob(request_id, attachment_id);

  const blob_url = window.URL.createObjectURL(blob);

  window.open(blob_url, '_blank', 'noopener,noreferrer');

  window.setTimeout(() => window.URL.revokeObjectURL(blob_url), 60_000);
}

export async function SaveRequestAttachment(
  request_id: string,

  attachment_id: string,

  fallback_name: string
) {
  const { blob, filename } = await FetchRequestAttachmentBlob(request_id, attachment_id);

  const blob_url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');

  link.href = blob_url;

  link.download = filename || fallback_name;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(blob_url);
}

export async function FetchFileBlob(url: string): Promise<string> {
  const response = await api.get(url, { responseType: 'blob' });

  return window.URL.createObjectURL(
    new Blob([response.data], { type: response.headers['content-type'] as string })
  );
}

export async function OpenFileInNewTab(url: string): Promise<void> {
  try {
    const blob_url = await FetchFileBlob(url);

    window.open(blob_url, '_blank');
  } catch (error) {
    console.error(error);

    throw new Error('Error loading the document', { cause: error });
  }
}

export async function DownloadFile(url: string, filename: string): Promise<void> {
  try {
    const blob_url = await FetchFileBlob(url);

    const link = document.createElement('a');

    link.href = blob_url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  } catch (error) {
    console.error(error);

    throw new Error('Error downloading the document', { cause: error });
  }
}
