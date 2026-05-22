import api from '@/lib/api'

// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  registerInvitado: (email: string) =>
    api.post('/auth/registro-rapido', { email }),
  completarPerfil: (data: object) =>
    api.post('/auth/completar-perfil', data),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
}

// ---- Solicitudes ----
export const solicitudesApi = {
  create: (data: object) => api.post('/solicitudes', data),
  list: (params?: object) => api.get('/solicitudes', { params }),
  misSolicitudes: (params?: object) => api.get('/solicitudes/mis-solicitudes', { params }),
  stats: () => api.get('/solicitudes/stats'),
  getById: (id: string) => api.get(`/solicitudes/${id}`),
  enviar: (id: string) => api.post(`/solicitudes/${id}/enviar`),
  cambiarEstado: (id: string, data: object) => api.patch(`/solicitudes/${id}/estado`, data),
  agendar: (id: string, data: object) => api.post(`/solicitudes/${id}/agenda`, data),
  resolver: (id: string, data: object) => api.post(`/solicitudes/${id}/resolver`, data),

  /**
   * Subir reporte de inspección técnica (fotos JPEG/PNG + comentarios)
   * Avanza automáticamente el estado a INSPECCION
   */
  subirReporte: (id: string, comentarios: string, fotos: File[]) => {
    const form = new FormData()
    form.append('comentarios', comentarios)
    fotos.forEach((f) => form.append('fotos', f))
    return api.post(`/solicitudes/${id}/reporte-inspeccion`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ---- Anexos ----
export const anexosApi = {
  upload: (solicitudId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post(`/solicitudes/${solicitudId}/anexos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  list: (solicitudId: string) => api.get(`/solicitudes/${solicitudId}/anexos`),
  delete: (id: string) => api.delete(`/solicitudes/anexos/${id}`),
  getUrl: (key: string) => `/api/v1/files/${encodeURIComponent(key)}`,
}

// ---- Notificaciones ----
export const notifApi = {
  list: (soloNoLeidas = false) =>
    api.get('/notificaciones', { params: { soloNoLeidas } }),
  contador: () => api.get('/notificaciones/contador'),
  marcarLeida: (id: string) => api.patch(`/notificaciones/${id}/leer`),
  marcarTodas: () => api.patch('/notificaciones/leer-todas'),
}

// ---- Users ----
export const usersApi = {
  list: (params?: object) => api.get('/users', { params }),
  tecnicos: () => api.get('/users/tecnicos'),
  createInstitucional: (data: object) => api.post('/users/institucional', data),
  update: (id: string, data: object) => api.patch(`/users/${id}`, data),
  updateZonaTecnico: (id: string, zona: 'URBANO' | 'RURAL' | null) =>
    api.patch(`/users/${id}/zona`, { zona }),
  dashboardStats: () => api.get('/users/dashboard/stats'),
  toggleActivo: (id: string, activo: boolean) =>
    api.patch(`/users/${id}/toggle-activo`, { activo }),
}

// ---- Auditoría ----
export const auditApi = {
  list: (params?: object) => api.get('/audit', { params }),
  verificar: () => api.get('/audit/verificar'),
}
