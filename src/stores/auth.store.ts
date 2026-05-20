import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type Role = 'SUPERADMIN' | 'CIUDADANO' | 'TECNICO' | 'SECRETARIA' | 'FINANCIERO' | 'INVITADO'

export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  cedula?: string
  telefono?: string
  role: Role
  zona?: 'URBANO' | 'RURAL' | null
  activo: boolean
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  loginAsGuest: () => void
  register: (data: RegisterData) => Promise<void>
  registerInvitado: (email: string) => Promise<void>
  completarPerfil: (data: CompletarPerfilData) => Promise<void>
  logout: () => void
  clearError: () => void
}

interface RegisterData {
  email: string
  password: string
  nombre: string
  apellido: string
  cedula: string
  telefono?: string
}

export interface CompletarPerfilData {
  nombre: string
  apellido: string
  cedula: string
  password: string
  telefono?: string
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: conectar con API real — await api.post('/auth/login', { email, password })
          const mockUser: User = {
            id: '1',
            email,
            nombre: 'Usuario',
            apellido: 'Demo',
            role: 'CIUDADANO',
            activo: true,
            createdAt: new Date().toISOString(),
          }
          const mockToken = 'mock-token-' + Date.now()
          localStorage.setItem('gad_access_token', mockToken)
          set({ user: mockUser, accessToken: mockToken, refreshToken: mockToken, isLoading: false })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al iniciar sesión',
          })
          throw err
        }
      },

      register: async (_data) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: conectar con API real
          set({ isLoading: false })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al registrarse',
          })
          throw err
        }
      },

      registerInvitado: async (email) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: conectar con API real — /auth/registro-rapido
          const mockUser: User = {
            id: '2',
            email,
            nombre: 'Invitado',
            apellido: '',
            role: 'INVITADO',
            activo: true,
            createdAt: new Date().toISOString(),
          }
          const mockToken = 'mock-token-invitado-' + Date.now()
          localStorage.setItem('gad_access_token', mockToken)
          set({ user: mockUser, accessToken: mockToken, refreshToken: mockToken, isLoading: false })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al registrarse',
          })
          throw err
        }
      },

      completarPerfil: async (_data) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: conectar con API real — /auth/completar-perfil
          set({ isLoading: false })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { message?: string } } }
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Error al completar perfil',
          })
          throw err
        }
      },

      // Acceso rápido sin credenciales — solo para explorar el portal
      // TODO (backend): puede conectarse a /auth/acceso-anonimo si el backend lo soporta
      loginAsGuest: () => {
        const guestUser: User = {
          id: 'guest-' + Date.now(),
          email: 'invitado@gadcanar.gob.ec',
          nombre: 'Invitado',
          apellido: '',
          role: 'INVITADO',
          activo: true,
          createdAt: new Date().toISOString(),
        }
        const guestToken = 'guest-token-' + Date.now()
        localStorage.setItem('gad_access_token', guestToken)
        set({ user: guestUser, accessToken: guestToken, refreshToken: null, error: null })
      },

      logout: () => {
        localStorage.removeItem('gad_access_token')
        localStorage.removeItem('gad_refresh_token')
        set({ user: null, accessToken: null, refreshToken: null, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'gad-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)
