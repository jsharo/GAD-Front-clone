export function getApiError(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (
      err as {
        response?: { status?: number; data?: { message?: string | string[] } };
      }
    ).response;
    if (response?.status === 401) return 'La sesión expiró. Inicie sesión nuevamente.';
    if (response?.status === 403) return 'No tiene permisos para realizar esta acción.';
    if (response?.status === 404) return 'El expediente o documento no fue encontrado.';
    const data = response?.data;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}
