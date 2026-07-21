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

  signature_status?: SignatureVerificationStatus | 'PENDING';

  signature_verified_at?: string | null;

  signature_verifier?: string | null;

  created_at: string;
}

export type SignatureVerificationStatus =
  'MATCH' | 'MATCH_WITH_WARNINGS' | 'MISMATCH' | 'UNSIGNED' | 'INVALID' | 'INDETERMINATE' | 'ERROR';

export type SignatureIdentityStatus = 'MATCH' | 'MISMATCH' | 'INDETERMINATE';

export type SignatureTrustStatus =
  'TRUSTED' | 'UNTRUSTED' | 'REVOKED' | 'EXPIRED' | 'NOT_CONFIGURED' | 'UNKNOWN';

export interface ExpectedSigner {
  id: string | null;

  role: 'PROFESSIONAL' | 'CITIZEN' | 'UNKNOWN';

  full_name: string;

  national_id: string | null;
}

export interface VerifiedPdfSignature {
  index: number;

  field_name: string | null;

  common_name: string | null;

  given_name: string | null;

  surname: string | null;

  national_id: string | null;

  issuer_common_name: string | null;

  signing_time: string | null;

  integrity_valid: boolean;

  identity_status: SignatureIdentityStatus;

  identity_message: string;

  trust_status: SignatureTrustStatus;

  certificate_fingerprint_sha256: string;
}

export interface AttachmentSignatureReport {
  attachment_id: string;

  attachment_name: string;

  document_hash: string;

  stored_hash: string | null;

  storage_integrity_valid: boolean;

  verified_at: string;

  verifier: string;

  status: SignatureVerificationStatus;

  signature_count: number;

  has_valid_expected_signature: boolean;

  trust_configured: boolean;

  signatures: VerifiedPdfSignature[];

  warnings: string[];
}

export interface RequestSignatureSummary {
  status: SignatureVerificationStatus;

  has_valid_expected_signature: boolean;

  requires_acknowledgement: boolean;

  expected_signer: ExpectedSigner;

  pdf_count: number;

  signature_count: number;

  verified_at: string;

  attachments: AttachmentSignatureReport[];

  warnings: string[];
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

export interface SecretaryReviewInput {
  approved: boolean;

  acknowledge_signature_warning?: boolean;

  remarks?: string;
}

export interface SecretaryReviewResult {
  id: string;

  status: string;

  signature_validated: boolean;

  signature_status: SignatureVerificationStatus;

  approved: boolean;
}

interface ApiEnvelope<T> {
  success: boolean;

  data: T;
}

/** Normalizes a backend request into English field names for UI consumption. */

function ToApplicationView(request: any) {
  const citizen = request.citizen
    ? {
        id: request.citizen.id,

        first_name: request.citizen.name || request.citizen.first_name || '',

        last_name: request.citizen.lastname || request.citizen.last_name || '',

        national_id: request.citizen.cedula || request.citizen.national_id || null,

        email: request.citizen.email || null,

        phone: request.citizen.phone || null,
      }
    : null;

  const architect = request.architect
    ? {
        id: request.architect.id,

        first_name: request.architect.name || request.architect.first_name || '',

        last_name: request.architect.lastname || request.architect.last_name || '',

        national_id: request.architect.cedula || request.architect.national_id || null,

        email: request.architect.email || null,

        phone: request.architect.phone || null,

        title: request.architect.title || null,

        registration_number: request.architect.registration_number || null,
      }
    : null;

  const property = request.property
    ? {
        address: request.property.address || '',

        location: request.property.zone || '',

        area: request.property.area ?? null,

        description: request.property.coordinates || request.property.description || null,
      }
    : null;

  const schedule = request.inspection
    ? {
        date: request.inspection.date,

        notes: request.inspection.comments,

        is_confirmed: true,
      }
    : null;

  const technician = request.inspection?.technician
    ? {
        first_name:
          typeof request.inspection.technician === 'string'
            ? request.inspection.technician
            : request.inspection.technician.name || request.inspection.technician.first_name || '',

        last_name:
          typeof request.inspection.technician === 'string'
            ? ''
            : request.inspection.technician.lastname ||
              request.inspection.technician.last_name ||
              '',

        email:
          typeof request.inspection.technician === 'string'
            ? ''
            : request.inspection.technician.email || '',
      }
    : null;

  const secretary_decision = request.secretary_decision
    ? {
        is_approved: request.secretary_decision.approved,

        signature_validated: Boolean(request.secretary_decision.signature_validated),

        observations: request.secretary_decision.remarks,

        created_at: request.secretary_decision.created_at,
      }
    : null;

  const attachments = (request.attachments || []).map((attachment: RequestAttachment) => ({
    id: attachment.id,

    name: attachment.name,

    size: attachment.size,

    hash: attachment.hash,

    type: attachment.type,
  }));

  const payments = request.resolution?.payment_amount
    ? [
        {
          id: request.resolution.id,

          amount: request.resolution.payment_amount,

          concept: request.resolution.comments,

          status: request.status === 'PAID' ? 'PAID' : 'PENDING',
        },
      ]
    : [];

  return {
    id: request.id,

    created_at: request.created_at,

    updated_at: request.updated_at,

    status: request.status,

    procedure_type: request.request_type,

    rejection_reason: request.status === 'REJECTED' ? request.resolution?.comments : null,

    observations: request.resolution?.comments ?? request.inspection?.comments ?? null,

    citizen,

    user: citizen,

    architect,

    property,

    schedule,

    technician,

    secretary_decision,

    attachments,

    payments,

    citizen_documents:
      request.citizen_documents ??
      attachments.filter((a: { type?: string }) => a.type !== 'INSPECTION_PHOTO'),

    inspection_photos:
      request.inspection_photos ??
      attachments.filter((a: { type?: string }) => a.type === 'INSPECTION_PHOTO'),
  };
}

export async function GetRequests(params?: object) {
  const response = await api.get<ApiEnvelope<any[]>>('/requests', { params });

  return response.data.data;
}

export async function GetRequestById(request_id: string) {
  const response = await api.get<ApiEnvelope<any>>(`/requests/${request_id}`);
  return response.data.data;
}
export const getRequestById = GetRequestById;

export async function SubmitSecretaryReview(request_id: string, review: SecretaryReviewInput) {
  const response = await api.post<ApiEnvelope<SecretaryReviewResult>>(
    `/requests/${request_id}/secretary-review`,
    review
  );
  return response.data.data;
}
export const submitSecretaryReview = SubmitSecretaryReview;

export async function GetRequestAttachments(request_id: string) {
  const response = await api.get<ApiEnvelope<RequestAttachment[]>>(
    `/requests/${request_id}/attachments`
  );
  return response.data.data;
}
export const getRequestAttachments = GetRequestAttachments;

export async function UploadRequestAttachment(request_id: string, form_data: FormData) {
  const response = await api.post<ApiEnvelope<RequestAttachment>>(
    `/requests/${request_id}/attachments`,
    form_data
  );
  return response.data.data;
}
export const uploadRequestAttachment = UploadRequestAttachment;

export function DownloadRequestAttachment(request_id: string, attachment_id: string) {
  return api.get<Blob>(`/requests/${request_id}/attachments/${attachment_id}/download`, {
    responseType: 'blob',
  });
}
export const downloadRequestAttachment = DownloadRequestAttachment;

export async function VerifyRequestAttachment(request_id: string, attachment_id: string) {
  const response = await api.get<AttachmentIntegrityResult>(
    `/requests/${request_id}/attachments/${attachment_id}/verify`
  );
  return response.data;
}
export const verifyRequestAttachment = VerifyRequestAttachment;

export async function GetRequestSignatureVerification(request_id: string, refresh = false) {
  const response = await api.get<ApiEnvelope<RequestSignatureSummary>>(
    `/requests/${request_id}/signature-verification`,
    { params: refresh ? { refresh: true } : undefined }
  );
  return response.data.data;
}
export const getRequestSignatureVerification = GetRequestSignatureVerification;

export async function GetAttachmentSignatureVerification(
  request_id: string,
  attachment_id: string,
  refresh = false
) {
  const response = await api.get<ApiEnvelope<AttachmentSignatureReport>>(
    `/requests/${request_id}/attachments/${attachment_id}/signatures`,
    { params: refresh ? { refresh: true } : undefined }
  );
  return response.data.data;
}
export const getAttachmentSignatureVerification = GetAttachmentSignatureVerification;

export async function SendAttachmentToIpfs(request_id: string, attachment_id: string) {
  const response = await api.post<AttachmentIpfsResult>(
    `/requests/${request_id}/attachments/${attachment_id}/ipfs`
  );
  return response.data;
}
export const sendAttachmentToIpfs = SendAttachmentToIpfs;

export async function VerifyAuditChain() {
  const response = await api.get<{
    success: boolean;

    valid: boolean;

    message: string;

    checked_logs: number;

    legacy_logs: number;
  }>('/audit/verify');

  return response.data;
}

// ---- Auth / registration (users module) ----

export interface RegisterPayload {
  email: string;
  password: string;
  cedula?: string;
  name?: string;
  lastname?: string;
  direction?: string;
}

export const auth_api = {
  Login: (email: string, password: string) => api.post('/auth/login', { email, password }),

  Register: (data: RegisterPayload) => api.post('/users/register', data),

  /** Architect self-registration (rol USER). Sin UI aún; listo para cablear. */
  RegisterArchitect: (data: RegisterPayload) => api.post('/users/register-architect', data),

  VerifyEmail: (email: string, code: string) =>
    api.post('/verification/verify-email', { email, code }),
  ResendVerificationCode: (email: string) => api.post('/verification/resend-code', { email }),
  ResendVerificationLink: (email: string) => api.post('/verification/resend-link', { email }),
  ConfirmEmailToken: (token: string) =>
    api.post<{ success: boolean; message: string; email: string }>(
      '/verification/confirm-email-token',
      { token }
    ),

  CompleteProfile: (user_id: string, data: object) => api.patch(`/users/${user_id}`, data),

  Refresh: () => api.post('/auth/refresh'),

  Logout: () => api.post('/auth/logout'),

  ForgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),

  ResetPassword: (email: string, code: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, code, newPassword }),
};

// ---- Roles / permissions ----

export const roles_api = {
  List: () => api.get('/roles'),

  ListPermissions: () => api.get('/roles/permissions'),

  Create: (data: { name: string; description?: string }) => api.post('/roles', data),

  Update: (id: string, data: { name?: string; description?: string }) =>
    api.patch(`/roles/${id}`, data),

  Delete: (id: string) => api.delete(`/roles/${id}`),

  SyncPermissions: (role_id: string, permission_ids: string[]) =>
    api.put(`/roles/${role_id}/permissions`, { permissionIds: permission_ids }),

  Assign: (user_id: string, role_name: string) =>
    api.post('/roles/assign', { userId: user_id, roleName: role_name }),

  GetUserPermissionsBreakdown: (user_id: string) =>
    api.get(`/roles/users/${user_id}/permissions/breakdown`),

  SyncUserPermissions: (user_id: string, permission_ids: string[]) =>
    api.put(`/roles/users/${user_id}/permissions`, { permissionIds: permission_ids }),
};

// ---- Applications ----

export const applications_api = {
  Create: (data: object) => api.post('/requests', data),

  List: async (params?: object) => {
    const query = (params ?? {}) as Record<string, string | number>;

    const status = query.status;

    const request_type = query.request_type || query.procedure_type;

    const response = await api.get<ApiEnvelope<any[]>>('/requests', {
      params: status ? { status } : undefined,
    });

    const requests = request_type
      ? response.data.data.filter((request) => request.request_type === request_type)
      : response.data.data;

    return {
      ...response,

      data: {
        ...response.data,

        data: requests.map(ToApplicationView),
      },
    };
  },

  MyApplications: async (params?: object) => {
    const query = (params ?? {}) as Record<string, string | number>;

    const response = await api.get<ApiEnvelope<any[]>>('/requests/my-filings');

    const requests = response.data.data.filter((request) => {
      if (query.status && request.status !== query.status) return false;

      const request_type = query.request_type || query.procedure_type;

      if (request_type && request.request_type !== request_type) return false;

      return true;
    });

    return {
      ...response,

      data: {
        ...response.data,

        data: requests.map(ToApplicationView),
      },
    };
  },

  Stats: () => api.get('/users/dashboard/stats'),

  GetById: async (id: string) => {
    const response = await api.get<ApiEnvelope<any>>(`/requests/${id}`);

    return { ...response, data: ToApplicationView(response.data.data) };
  },

  Send: (id: string) => api.patch(`/requests/${id}/status`, { status: 'PENDING_SECRETARY' }),

  UpdateStatus: (id: string, data: { status: string; comment?: string }) =>
    api.patch(`/requests/${id}/status`, data),

  Schedule: (id: string, data: object) => api.post(`/requests/${id}/schedule`, data),

  Resolve: (
    id: string,
    data: { approved?: boolean; comments?: string; rejection_reason?: string }
  ) =>
    api.post(`/requests/${id}/resolve`, {
      approved: data.approved,

      comments: data.comments || data.rejection_reason || '',
    }),

  Charge: (id: string, data: { amount: number; concept: string; notes?: string }) =>
    api.post(`/requests/${id}/resolve`, {
      approved: true,

      comments: `${data.concept} — ${data.amount}${data.notes ? ` (${data.notes})` : ''}`,
    }),

  Pay: (id: string) => api.patch(`/requests/${id}/status`, { status: 'PAID' }),

  PublicTracking: (params: { email?: string; national_id?: string }) => {
    // Backend wire field for national ID remains `cedula`

    const query_params = {
      email: params.email,

      cedula: params.national_id,
    };

    return api.get('/requests/my-requests', { params: query_params });
  },

  /**

   * Upload technical inspection report (JPEG/PNG photos + comments)

   */

  UploadReport: (id: string, comments: string, photos: File[]) => {
    const form_data = new FormData();

    form_data.append('comments', comments);

    photos.forEach((f) => form_data.append('photos', f));

    return api.post(`/requests/${id}/inspection-report`, form_data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ---- Attachments ----

export const attachments_api = {
  Upload: (
    application_id: string,

    file: File,

    folder: AttachmentFolder = 'OTROS',

    name = file.name
  ) => {
    const form_data = new FormData();

    form_data.append('file', file);

    form_data.append('folder', folder);

    form_data.append('name', name);

    return api.post(`/requests/${application_id}/attachments`, form_data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  List: (application_id: string) => api.get(`/requests/${application_id}/attachments`),

  Delete: (application_id: string, attachment_id: string) =>
    api.delete(`/requests/${application_id}/attachments/${attachment_id}`),

  GetUrl: (application_id: string, attachment_id: string) =>
    `/requests/${encodeURIComponent(application_id)}/attachments/${encodeURIComponent(
      attachment_id
    )}/download`,
};

// ---- Notifications ----

export const notifications_api = {
  List: (only_unread = false) => api.get('/notifications', { params: { only_unread } }),

  Count: () => api.get('/notifications/count'),

  MarkRead: (id: string) => api.patch(`/notifications/${id}/read`),

  MarkAllRead: () => api.patch('/notifications/read-all'),
};

// ---- Users ----

export const users_api = {
  Me: () => api.get('/users/me'),

  MePermissions: () => api.get('/users/me/permissions'),

  UpdateOwnProfile: (data: { name?: string; lastname?: string; cedula?: string }) =>
    api.patch('/users/me', data),

  SubmitProfessionalProfile: (data: {
    name: string;
    lastname: string;
    cedula: string;
    senescytCode: string;
  }) => api.post('/users/me/professional-profile', data),

  PendingProfessionals: () => api.get('/users/professional-verifications/pending'),

  ReviewProfessional: (id: string, approved: boolean) =>
    api.post(`/users/${id}/professional-verify`, { approved }),

  SetRecoveryEmail: (recoveryEmail: string) =>
    api.post('/users/me/recovery-email', { recoveryEmail }),

  VerifyRecoveryEmail: (code: string) => api.post('/users/me/recovery-email/verify', { code }),

  RemoveRecoveryEmail: () => api.delete('/users/me/recovery-email'),

  List: (params?: object) => api.get('/users', { params }),

  Technicians: () => api.get('/users/technicians'),

  CreateStaff: (data: {
    email: string;
    password: string;
    name: string;
    lastname: string;
    roleName: string;
    cedula?: string;
    direction?: string;
    permissionIds?: string[];
  }) => api.post('/users/institutional', data),

  ListPendingInvitations: () => api.get('/users/invitations/pending'),

  ResendInvitation: (email: string) => api.post('/users/invitations/resend', { email }),

  CancelInvitation: (email: string) =>
    api.delete(`/users/invitations/${encodeURIComponent(email)}`),

  Update: (
    id: string,
    data: {
      name?: string;
      lastname?: string;
      cedula?: string;
      direction?: string;
      password?: string;
      zone?: 'URBAN' | 'RURAL' | null;
    }
  ) => api.patch(`/users/${id}`, data),

  UpdateStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
    api.patch(`/users/${id}/status`, { status }),

  ResendVerification: (id: string) => api.post(`/users/${id}/resend-verification`),

  UpdateTechnicianZone: (id: string, zone: 'URBAN' | 'RURAL' | null) =>
    api.patch(`/users/${id}`, { zone }),

  DashboardStats: () => api.get('/users/dashboard/stats'),

  ToggleActive: (id: string, is_active: boolean) =>
    api.patch(`/users/${id}/status`, { status: is_active ? 'ACTIVE' : 'INACTIVE' }),

  PendingArchitects: () => api.get('/users', { params: { role: 'USER' } }),

  ApproveArchitect: (id: string, approved: boolean) =>
    api.patch(`/users/${id}/status`, { status: approved ? 'ACTIVE' : 'INACTIVE' }),
};

// ---- Audit ----

export const audit_api = {
  List: (params?: object) => api.get('/audit', { params }),

  Verify: () => api.get('/audit/verify'),
};
