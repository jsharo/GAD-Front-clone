import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // envía cookies httpOnly automáticamente
});

// ---- Interceptor: Refresh silencioso al recibir 401 ----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original_request = error.config;
    const request_url = String(original_request?.url ?? '');
    const is_auth_request =
      request_url.includes('/auth/login') || request_url.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      original_request &&
      !original_request._retry &&
      !is_auth_request
    ) {
      original_request._retry = true;
      try {
        // Las cookies se envían automáticamente — no hace falta pasar nada en el body
        await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, { withCredentials: true });
        return api(original_request);
      } catch {
        // El refresh falló: limpiar estado y redirigir
        const { useAuthStore } = await import('@/stores/auth.store');
        useAuthStore.getState().logout();
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
