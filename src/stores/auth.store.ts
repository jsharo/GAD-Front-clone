import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { auth_api } from '@/lib/api.calls';

export type Role = 'ADMINISTRATOR' | 'SECRETARY' | 'TECHNICIAN' | 'FINANCIAL' | 'USER' | 'CITIZEN';

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
  is_enabled?: boolean;
  title?: string;
  registration_number?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  is_loading: boolean;
  error: string | null;

  Login: (email: string, password: string) => Promise<void>;
  Register: (data: RegisterData) => Promise<void>;
  RequestTrackedAccess: (email: string) => Promise<void>;
  CompleteProfile: (data: CompleteProfileData) => Promise<void>;
  Logout: () => void;
  ClearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  national_id: string;
  phone?: string;
}

export interface CompleteProfileData {
  first_name: string;
  last_name: string;
  national_id: string;
  password: string;
  phone?: string;
}

/** Maps backend user payload to the English frontend User model. */
export const MapUser = (u: any): User | null => {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    first_name: u.name || u.first_name || '',
    last_name: u.lastname || u.last_name || '',
    // Backend wire field for Ecuadorian ID remains `cedula`
    national_id: u.cedula || u.national_id,
    phone: u.phone || null,
    role: NormalizeRole(u.role?.name || u.role),
    zone: u.zone === 'RURAL' ? 'RURAL' : u.zone === 'URBAN' ? 'URBAN' : u.zone || null,
    is_active: u.status ? u.status === 'ACTIVE' : u.is_active !== false,
    is_enabled: u.is_enabled !== undefined ? u.is_enabled : u.status === 'ACTIVE',
    title: u.title,
    registration_number: u.registration_number,
    created_at: u.createdAt || u.created_at,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      is_loading: false,
      error: null,

      Login: async (email, password) => {
        set({ is_loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const data = response.data.data;
          set({
            user: MapUser(data.user),
            is_loading: false,
          });
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
          // Backend user DTO uses name/lastname/cedula
          const payload = {
            email: data.email,
            password: data.password,
            name: data.first_name,
            lastname: data.last_name,
            cedula: data.national_id,
            phone: data.phone,
          };
          const { data: res } = await auth_api.Register(payload);
          set({
            user: MapUser(res.user),
            is_loading: false,
          });
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            is_loading: false,
            error: error.response?.data?.message || 'Error registering',
          });
          throw err;
        }
      },

      RequestTrackedAccess: async (email) => {
        set({ is_loading: true, error: null });
        try {
          const { data: res } = await auth_api.RequestTrackedAccess(email);
          set({
            user: MapUser(res.user),
            is_loading: false,
          });
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } };
          set({
            is_loading: false,
            error: error.response?.data?.message || 'Error requesting access',
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
          // Backend user DTO uses name/lastname/cedula
          const payload = {
            name: data.first_name,
            lastname: data.last_name,
            cedula: data.national_id,
            password: data.password,
            phone: data.phone,
          };
          const { data: res } = await auth_api.CompleteProfile(current_user.id, payload);
          set({
            user: MapUser(res.data || res.user || { ...current_user, ...payload }),
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

      Logout: () => {
        api.post('/auth/logout').catch(() => null);
        set({ user: null, error: null });
      },

      ClearError: () => set({ error: null }),
    }),
    {
      name: 'gad-auth',
      version: 2,
      migrate: (persisted: any) => ({
        ...persisted,
        user: persisted?.user
          ? { ...persisted.user, role: NormalizeRole(persisted.user.role) }
          : null,
      }),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
