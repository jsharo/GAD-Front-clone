import api from '@/lib/api';

// ---- Auth ----
export const auth_api = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  requestTrackedAccess: (email: string) => api.post('/auth/registro-rapido', { email }),
  completeProfile: (data: object) => api.post('/auth/completar-perfil', data),
  me: () => api.get('/auth/me'),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refreshToken: refresh_token }),
};

// ---- Applications ----
export const applications_api = {
  create: (data: object) => api.post('/solicitudes', data),
  list: (params?: object) => api.get('/solicitudes', { params }),
  myApplications: (params?: object) => api.get('/solicitudes/mis-solicitudes', { params }),
  stats: () => api.get('/solicitudes/stats'),
  getById: (id: string) => api.get(`/solicitudes/${id}`),
  send: (id: string) => api.post(`/solicitudes/${id}/enviar`),
  updateStatus: (id: string, data: object) => api.patch(`/solicitudes/${id}/estado`, data),
  schedule: (id: string, data: object) => api.post(`/solicitudes/${id}/agenda`, data),
  resolve: (id: string, data: object) => api.post(`/solicitudes/${id}/resolver`, data),
  charge: (id: string, data: { amount: number; concept: string; notes?: string }) =>
    api.post(`/solicitudes/${id}/cobrar`, {
      monto: data.amount,
      concepto: data.concept,
      notas: data.notes,
    }),
  pay: (id: string) => api.patch(`/solicitudes/${id}/cobros/pagar`),
  publicTracking: (params: { email?: string; national_id?: string }) => {
    const query_params = {
      email: params.email,
      cedula: params.national_id,
    };
    return api.get('/solicitudes/seguimiento-publico', { params: query_params });
  },

  /**
   * Upload technical inspection report (JPEG/PNG photos + comments)
   */
  uploadReport: (id: string, comments: string, photos: File[]) => {
    const form_data = new FormData();
    form_data.append('comentarios', comments);
    photos.forEach((f) => form_data.append('fotos', f));
    return api.post(`/solicitudes/${id}/reporte-inspeccion`, form_data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ---- Attachments ----
export const attachments_api = {
  upload: (application_id: string, file: File) => {
    const form_data = new FormData();
    form_data.append('file', file);
    return api.post(`/solicitudes/${application_id}/anexos`, form_data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (application_id: string) => api.get(`/solicitudes/${application_id}/anexos`),
  delete: (id: string) => api.delete(`/solicitudes/anexos/${id}`),
  getUrl: (key: string) => `/api/v1/files/${encodeURIComponent(key)}`,
};

// ---- Notifications ----
export const notifications_api = {
  list: (only_unread = false) =>
    api.get('/notificaciones', { params: { soloNoLeidas: only_unread } }),
  count: () => api.get('/notificaciones/contador'),
  markRead: (id: string) => api.patch(`/notificaciones/${id}/leer`),
  markAllRead: () => api.patch('/notificaciones/leer-todas'),
};

// ---- Users ----
export const users_api = {
  list: (params?: object) => api.get('/users', { params }),
  technicians: () => api.get('/users/tecnicos'),
  createStaff: (data: object) => api.post('/users/institucional', data),
  update: (id: string, data: object) => api.patch(`/users/${id}`, data),
  updateTechnicianZone: (id: string, zone: 'URBAN' | 'RURAL' | null) => {
    const zona = zone === 'URBAN' ? 'URBANO' : zone === 'RURAL' ? 'RURAL' : null;
    return api.patch(`/users/${id}/zona`, { zona });
  },
  dashboardStats: () => api.get('/users/dashboard/stats'),
  toggleActive: (id: string, is_active: boolean) =>
    api.patch(`/users/${id}/toggle-activo`, { activo: is_active }),
  pendingArchitects: () => api.get('/users/arquitectos/pendientes'),
  approveArchitect: (id: string, approved: boolean) =>
    api.patch(`/users/${id}/habilitar-arquitecto`, { habilitado: approved }),
};

// ---- Audit ----
export const audit_api = {
  list: (params?: object) => api.get('/audit', { params }),
  verify: () => api.get('/audit/verificar'),
};
