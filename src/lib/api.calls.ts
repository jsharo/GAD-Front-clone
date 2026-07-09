import api from '@/lib/api';

export type AttachmentFolder = 'PLANOS' | 'DOCUMENTOS_LEGALES' | 'INFORMES' | 'OTROS';

export interface RequestAttachment {
  id: string;
  name: string;
  type: string;
  size: number | null;
  hash: string | null;
  folder: string;
  ipfs_cid: string | null;
  ipfs_status: string | null;
  ipfs_uploaded_at: string | null;
  ipfs_provider: string | null;
  created_at: string;
}

export interface AttachmentIntegrityResult {
  success: boolean;
  valid: boolean;
  verifiable: boolean;
  attachment_id: string;
  stored_hash: string | null;
  current_hash: string;
  message: string;
}

export interface AttachmentIpfsResult {
  success: boolean;
  enabled: boolean;
  uploaded: boolean;
  ipfs_status: string;
  message: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

function toLegacyRequestShape(request: any) {
  return {
    ...request,
    createdAt: request.created_at,
    estado: request.status,
    tipoTramite: request.request_type,
    motivoRechazo: request.status === 'REJECTED' ? request.resolution?.comments : null,
    observaciones: request.resolution?.comments ?? request.inspection?.comments ?? null,
    ciudadano: request.citizen
      ? { ...request.citizen, nombre: request.citizen.name, apellido: request.citizen.lastname }
      : null,
    usuario: request.citizen
      ? { ...request.citizen, nombre: request.citizen.name, apellido: request.citizen.lastname }
      : null,
    arquitecto: request.architect
      ? {
          ...request.architect,
          nombre: request.architect.name,
          apellido: request.architect.lastname,
        }
      : null,
    predio: request.property
      ? {
          direccion: request.property.address,
          ubicacion: request.property.zone,
          area: request.property.area,
          descripcion: request.property.coordinates,
        }
      : null,
    agenda: request.inspection
      ? {
          fecha: request.inspection.date,
          notas: request.inspection.comments,
          confirmada: true,
        }
      : null,
    tecnico: request.inspection?.technician
      ? { nombre: request.inspection.technician, apellido: '', email: '' }
      : null,
    dictamenSecretaria: request.secretary_decision
      ? {
          aprobada: request.secretary_decision.approved,
          observaciones: request.secretary_decision.remarks,
          creadoEn: request.secretary_decision.created_at,
        }
      : null,
    anexos: (request.attachments || []).map((attachment: RequestAttachment) => ({
      id: attachment.id,
      nombre: attachment.name,
      tamano: attachment.size,
      hash: attachment.hash,
      tipoMime: attachment.type,
    })),
    pagos: request.resolution?.payment_amount
      ? [
          {
            id: request.resolution.id,
            monto: request.resolution.payment_amount,
            concepto: request.resolution.comments,
            estado: request.status === 'PAID' ? 'PAGADO' : 'PENDIENTE',
          },
        ]
      : [],
  };
}

export async function getRequests(params?: object) {
  const response = await api.get<ApiEnvelope<any[]>>('/requests', { params });
  return response.data.data;
}

export async function getRequestById(requestId: string) {
  const response = await api.get<ApiEnvelope<any>>(`/requests/${requestId}`);
  return response.data.data;
}

export async function getRequestAttachments(requestId: string) {
  const response = await api.get<ApiEnvelope<RequestAttachment[]>>(
    `/requests/${requestId}/attachments`
  );
  return response.data.data;
}

export async function uploadRequestAttachment(requestId: string, formData: FormData) {
  const response = await api.post<ApiEnvelope<RequestAttachment>>(
    `/requests/${requestId}/attachments`,
    formData
  );
  return response.data.data;
}

export function downloadRequestAttachment(requestId: string, attachmentId: string) {
  return api.get<Blob>(`/requests/${requestId}/attachments/${attachmentId}/download`, {
    responseType: 'blob',
  });
}

export async function verifyRequestAttachment(requestId: string, attachmentId: string) {
  const response = await api.get<AttachmentIntegrityResult>(
    `/requests/${requestId}/attachments/${attachmentId}/verify`
  );
  return response.data;
}

export async function sendAttachmentToIpfs(requestId: string, attachmentId: string) {
  const response = await api.post<AttachmentIpfsResult>(
    `/requests/${requestId}/attachments/${attachmentId}/ipfs`
  );
  return response.data;
}

export async function verifyAuditChain() {
  const response = await api.get<{
    success: boolean;
    valid: boolean;
    message: string;
    checked_logs: number;
    legacy_logs: number;
  }>('/audit/verify');
  return response.data;
}

// ---- Auth ----
export const auth_api = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  requestTrackedAccess: (email: string) => api.post('/auth/registro-rapido', { email }),
  completeProfile: (data: object) => api.post('/auth/completar-perfil', data),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// ---- Applications ----
export const applications_api = {
  // TODO legacy: migrate remaining screens to /requests backend contract
  create: (data: object) => api.post('/solicitudes', data),
  list: async (params?: object) => {
    const legacy_params = (params ?? {}) as Record<string, string | number>;
    const response = await api.get<ApiEnvelope<any[]>>('/requests', {
      params: legacy_params.estado ? { status: legacy_params.estado } : undefined,
    });
    const request_type = legacy_params.tipoTramite;
    const requests = request_type
      ? response.data.data.filter((request) => request.request_type === request_type)
      : response.data.data;

    return {
      ...response,
      data: {
        ...response.data,
        data: requests.map(toLegacyRequestShape),
      },
    };
  },
  myApplications: (params?: object) => api.get('/solicitudes/mis-solicitudes', { params }),
  stats: () => api.get('/solicitudes/stats'),
  getById: async (id: string) => {
    const response = await api.get<ApiEnvelope<any>>(`/requests/${id}`);
    return { ...response, data: toLegacyRequestShape(response.data.data) };
  },
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
  // TODO legacy: migrate to /requests backend contract
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
  verify: () => api.get('/audit/verify'),
};
