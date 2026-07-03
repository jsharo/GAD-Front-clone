import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ---- Interceptor: Attach JWT Token in headers ----
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gad_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Interceptor: Refresh JWT token on expiration ----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original_request = error.config;
    const request_url = String(original_request?.url ?? '');
    const is_authentication_request =
      request_url.includes('/auth/login') || request_url.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      original_request &&
      !original_request._retry &&
      !is_authentication_request
    ) {
      original_request._retry = true;
      const refresh_token = localStorage.getItem('gad_refresh_token');
      if (refresh_token) {
        try {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken: refresh_token,
          });
          const data = response.data.data;
          localStorage.setItem('gad_access_token', data.accessToken);
          localStorage.setItem('gad_refresh_token', data.refreshToken);
          original_request.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original_request);
        } catch {
          localStorage.clear();
          window.location.href = '/auth/signin';
        }
      } else {
        localStorage.clear();
        window.location.href = '/auth/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
