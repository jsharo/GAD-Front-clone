import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth_api, users_api, type RegisterPayload } from '@/lib/api.calls';
import { HasAnyPermission, HasPermission } from '@/lib/permissions';

export type Role = 'ADMINISTRATOR' | 'SECRETARY' | 'TECHNICIAN' | 'FINANCIAL' | 'USER' | 'CITIZEN';

export type ProfessionalStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

const SUPPORTED_ROLE_MAP: Record<string, Role> = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  USER: 'USER',
  TECHNICIAN: 'TECHNICIAN',
  SECRETARY: 'SECRETARY',
  FINANCIAL: 'FINANCIAL',
  CITIZEN: 'CITIZEN',
};

export function NormalizeRole(role: unknown): Role {
  if (typeof role !== 'string') return 'USER';
  return SUPPORTED_ROLE_MAP[role] ?? 'USER';
}

export const ROLE_MAP_TO_BE: Record<Role, string> = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  TECHNICIAN: 'TECHNICIAN',
  SECRETARY: 'SECRETARY',
  FINANCIAL: 'FINANCIAL',
  USER: 'USER',
  CITIZEN: 'CITIZEN',
};

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  national_id?: string;
  phone?: string;
  role: Role;
  zone?: 'URBAN' | 'RURAL' | null;
  is_active: boolean;
  /** true solo si professionalStatus === VERIFIED (arquitecto habilitado) */
  is_enabled?: boolean;
  professional_status?: ProfessionalStatus;
  title?: string;
  registration_number?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  permissions: string[];
  is_loading: boolean;
  error: string | null;

  Login: (email: string, password: string) => Promise<Role>;
  Register: (data: RegisterData) => Promise<void>;
  VerifyEmail: (email: string, code: string) => Promise<void>;
  CompleteProfile: (data: CompleteProfileData) => Promise<void>;
  RefreshPermissions: () => Promise<void>;
  Logout: () => void;
  ClearError: () => void;
  HasPermission: (permission: string) => boolean;
  HasAnyPermission: (...permissions: string[]) => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  national_id?: string;
  direction?: string;
}

export interface CompleteProfileData {
  first_name: string;
  last_name: string;
  national_id: string;
  senescyt_code: string;
}

function NormalizePermissions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((p): p is string => typeof p === 'string');
}

/** Maps backend user payload to the English frontend User model. */
export const MapUser = (u: any): User | null => {
  if (!u) return null;
  const professional_status = (u.professionalStatus ||
    u.professional_status ||
    'UNVERIFIED') as ProfessionalStatus;
  return {
    id: u.id,
    email: u.email,
    first_name: u.name || u.first_name || '',
    last_name: u.lastname || u.last_name || '',
    national_id: u.cedula || u.national_id,
    phone: u.phone || null,
    role: NormalizeRole(u.role?.name || u.role),
    zone: u.zone === 'RURAL' ? 'RURAL' : u.zone === 'URBAN' ? 'URBAN' : u.zone || null,
    is_active: u.status ? u.status === 'ACTIVE' : u.is_active !== false,
    professional_status,
    is_enabled: professional_status === 'VERIFIED',
    title: u.title,
    registration_number: u.senescytCode || u.registration_number || u.senescyt_code,
    created_at: u.createdAt || u.created_at,
  };
};

function ToRegisterPayload(data: RegisterData): RegisterPayload {
  const payload: RegisterPayload = {
    email: data.email,
    password: data.password,
  };
  if (data.first_name) payload.name = data.first_name;
  if (data.last_name) payload.lastname = data.last_name;
  if (data.national_id) payload.cedula = data.national_id;
  if (data.direction) payload.direction = data.direction;
  return payload;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      permissions: [],
      is_loading: false,
      error: null,

      Login: async (email, password) => {
        set({ is_loading: true, error: null });
        try {
          const { data: body } = await auth_api.Login(email, password);
          const mapped = MapUser(body.data.user);
          const role = mapped?.role ?? NormalizeRole(body.data.user?.role);
          const permissions = NormalizePermissions(body.data.user?.permissions);
          set({
            user: mapped,
            permissions,
            is_loading: false,
          });
          return role;
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            is_loading: false,
            error: error.response?.data?.message || 'Error logging in',
          });
          throw err;
        }
      },

      Register: async (data) => {
        set({ is_loading: true, error: null });
        try {
          await auth_api.RegisterArchitect(ToRegisterPayload(data));
          set({ is_loading: false });
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            is_loading: false,
            error: error.response?.data?.message || 'Error registering',
          });
          throw err;
        }
      },

      VerifyEmail: async (email, code) => {
        set({ is_loading: true, error: null });
        try {
          await auth_api.VerifyEmail(email, code);
          set({ is_loading: false });
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            is_loading: false,
            error: error.response?.data?.message || 'Invalid or expired code',
          });
          throw err;
        }
      },

      CompleteProfile: async (data) => {
        set({ is_loading: true, error: null });
        try {
          const current_user = get().user;
          if (!current_user?.id) {
            throw new Error('No authenticated user');
          }
          const { data: res } = await users_api.SubmitProfessionalProfile({
            name: data.first_name,
            lastname: data.last_name,
            cedula: data.national_id,
            senescytCode: data.senescyt_code,
          });
          const updated = MapUser(res.user || res.data);
          set({
            user: updated
              ? { ...updated, role: current_user.role, email: current_user.email || updated.email }
              : {
                  ...current_user,
                  first_name: data.first_name,
                  last_name: data.last_name,
                  national_id: data.national_id,
                  registration_number: data.senescyt_code,
                  professional_status: 'PENDING',
                  is_enabled: false,
                },
            is_loading: false,
          });
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            is_loading: false,
            error: error.response?.data?.message || 'Error completing profile',
          });
          throw err;
        }
      },

      RefreshPermissions: async () => {
        if (!get().user) return;
        try {
          const { data: body } = await users_api.MePermissions();
          const permissions = NormalizePermissions(body?.data?.permissions ?? body?.permissions);
          set({ permissions });
        } catch {
          // Keep previous permissions if refresh fails (e.g. network blip).
        }
      },

      Logout: () => {
        auth_api.Logout().catch(() => null);
        set({ user: null, permissions: [], error: null });
      },

      ClearError: () => set({ error: null }),

      HasPermission: (permission) => HasPermission(get().permissions, permission),

      HasAnyPermission: (...needed) => HasAnyPermission(get().permissions, ...needed),
    }),
    {
      name: 'gad-auth',
      version: 4,
      migrate: (persisted: any) => ({
        ...persisted,
        permissions: NormalizePermissions(persisted?.permissions),
        user: persisted?.user
          ? {
              ...persisted.user,
              role: NormalizeRole(persisted.user.role),
              professional_status: persisted.user.professional_status ?? 'UNVERIFIED',
              is_enabled: persisted.user.professional_status === 'VERIFIED',
            }
          : null,
      }),
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
      }),
    }
  )
);
