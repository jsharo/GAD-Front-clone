import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

export type Role = 'ADMINISTRATOR' | 'SECRETARY' | 'TECHNICIAN' | 'FINANCIAL' | 'USER' | 'CITIZEN';

const SUPPORTED_ROLE_MAP: Record<string, Role> = {
  ADMINISTRATOR: 'ADMINISTRATOR',
  USER: 'USER',
  TECHNICIAN: 'TECHNICIAN',
  SECRETARY: 'SECRETARY',
  FINANCIAL: 'FINANCIAL',
  CITIZEN: 'CITIZEN',
};

export function normalizeRole(role: unknown): Role {
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

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  requestTrackedAccess: (email: string) => Promise<void>;
  completeProfile: (data: CompleteProfileData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
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

export const mapUser = (u: any): User | null => {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    first_name: u.nombre || u.first_name || '',
    last_name: u.apellido || u.last_name || '',
    national_id: u.cedula || u.national_id,
    phone: u.telefono || u.phone,
    role: normalizeRole(u.role),
    zone: u.zona === 'RURAL' ? 'RURAL' : u.zona === 'URBANO' ? 'URBAN' : u.zone || null,
    is_active: u.activo !== undefined ? u.activo : u.is_active,
    is_enabled: u.habilitado !== undefined ? u.habilitado : u.is_enabled,
    title: u.titulo || u.title,
    registration_number: u.numeroRegistro || u.registration_number,
    created_at: u.createdAt || u.created_at,
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      is_loading: false,
      error: null,

      login: async (email, password) => {
        set({ is_loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const data = response.data.data;
          set({
            user: mapUser(data.user),
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

      register: async (data) => {
        set({ is_loading: true, error: null });
        try {
          const payload = {
            email: data.email,
            password: data.password,
            nombre: data.first_name,
            apellido: data.last_name,
            cedula: data.national_id,
            telefono: data.phone,
          };
          const { data: res } = await api.post('/auth/register', payload);
          set({
            user: mapUser(res.user),
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

      requestTrackedAccess: async (email) => {
        set({ is_loading: true, error: null });
        try {
          const { data: res } = await api.post('/auth/registro-rapido', { email });
          set({
            user: mapUser(res.user),
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

      completeProfile: async (data) => {
        set({ is_loading: true, error: null });
        try {
          const payload = {
            nombre: data.first_name,
            apellido: data.last_name,
            cedula: data.national_id,
            password: data.password,
            telefono: data.phone,
          };
          const { data: res } = await api.post('/auth/completar-perfil', payload);
          set({
            user: mapUser(res.user),
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

      logout: () => {
        api.post('/auth/logout').catch(() => null);
        set({ user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'gad-auth',
      version: 2,
      migrate: (persisted: any) => ({
        ...persisted,
        user: persisted?.user
          ? { ...persisted.user, role: normalizeRole(persisted.user.role) }
          : null,
      }),
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
