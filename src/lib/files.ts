import api from '@/lib/api';

export function getFileUrl(key: string): string {
  return `/api/v1/files/${encodeURIComponent(key)}`;
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
