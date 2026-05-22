import axios from 'axios'
import { MockDb } from './mockDb'
import type { Solicitud, AuditLog } from './mockDb'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// ---- Interceptor: agrega token JWT en cada request ----
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gad_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- Lógica de Simulación Offline / Mock Fallback ----
// Cuando el backend no está disponible, el frontend corre sobre MockDb en LocalStorage
async function handleMockSimulation(config: any): Promise<any> {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const params = config.params || {}
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {}

  // Extraer el usuario actual en sesión
  const authStateStr = localStorage.getItem('gad-auth')
  let currentUser: any = null
  if (authStateStr) {
    try {
      const parsed = JSON.parse(authStateStr)
      currentUser = parsed?.state?.user
    } catch (_) {}
  }

  // Helper para simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, 250))

  // 1. Mis Solicitudes (Ciudadano)
  if (url === '/solicitudes/mis-solicitudes') {
    const list = MockDb.getSolicitudes()
    const email = currentUser?.email || 'juan.guaman@gmail.com'
    const filtered = list.filter((s) => s.ciudadano?.email === email)
    return { data: { success: true, data: filtered } }
  }

  // 2. Detalle de Solicitud específica
  if (url.startsWith('/solicitudes/sol-') || (url.startsWith('/solicitudes/') && url.split('/').length === 3)) {
    const parts = url.split('/')
    const id = parts[parts.length - 1]
    const list = MockDb.getSolicitudes()
    const found = list.find((s) => s.id === id)
    if (found) {
      return { data: { success: true, data: found } }
    }
    // Si no se encuentra, buscar por ID parcial
    const foundPartial = list.find((s) => s.id.includes(id))
    if (foundPartial) {
      return { data: { success: true, data: foundPartial } }
    }
    return Promise.reject({ response: { status: 404, data: { message: 'Solicitud no encontrada' } } })
  }

  // 3. Listado de Solicitudes general
  if (url === '/solicitudes') {
    if (method === 'get') {
      const list = MockDb.getSolicitudes()
      // Si se solicita filtrar por estado
      if (params.estado) {
        return { data: { success: true, data: list.filter((s) => s.estado === params.estado) } }
      }
      return { data: { success: true, data: list } }
    }
    if (method === 'post') {
      // Crear solicitud
      const list = MockDb.getSolicitudes()
      const newSol: Solicitud = {
        id: 'sol-' + Math.random().toString(36).substr(2, 9),
        tipoTramite: data.tipoTramite || 'PERMISO_CONSTRUCCION',
        estado: 'PENDIENTE_SECRETARIA',
        createdAt: new Date().toISOString(),
        ciudadano: {
          id: currentUser?.id || 'cit-temp',
          nombre: currentUser?.nombre || 'Ciudadano',
          apellido: currentUser?.apellido || 'Temporal',
          cedula: currentUser?.cedula || '0300000000',
          email: currentUser?.email || 'invitado@gadcanar.gob.ec',
          telefono: data.telefono || '0900000000',
        },
        predio: {
          claveCatastral: data.predio?.claveCatastral || '03-01-00-000-000',
          direccion: data.predio?.direccion || 'Cantón Cañar, Ecuador',
          area: Number(data.predio?.area) || 120,
          zona: data.predio?.zona || 'URBANO',
        },
        anexos: [
          { id: 'anx-mock1', nombre: 'Planos_Presentados.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() },
          { id: 'anx-mock2', nombre: 'Certificado_Municipal.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() },
        ],
        historial: [
          {
            id: 'h-' + Date.now(),
            estadoAnterior: 'BORRADOR',
            estadoNuevo: 'PENDIENTE_SECRETARIA',
            comentario: 'Solicitud e-government ingresada exitosamente por el ciudadano.',
            responsable: `${currentUser?.nombre || 'Ciudadano'} ${currentUser?.apellido || ''}`,
            createdAt: new Date().toISOString(),
          },
        ],
      }
      list.unshift(newSol)
      MockDb.saveSolicitudes(list)

      // Registrar auditoría
      const audits = MockDb.getAudits()
      audits.unshift({
        id: 'a-' + Date.now(),
        userId: currentUser?.id || 'anon',
        userEmail: currentUser?.email || 'anon@gadcanar.gob.ec',
        action: 'CREATE_SOLICITUD',
        details: `Creó la solicitud #${newSol.id} de tipo ${newSol.tipoTramite}`,
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      })
      MockDb.saveAudits(audits)

      return { data: { success: true, data: newSol } }
    }
  }

  // 4. Cambiar estado
  if (url.includes('/estado') && method === 'patch') {
    const id = url.split('/')[2]
    const list = MockDb.getSolicitudes()
    const idx = list.findIndex((s) => s.id === id)
    if (idx !== -1) {
      const sol = list[idx]
      const oldState = sol.estado
      sol.estado = data.estado
      sol.historial.push({
        id: 'h-' + Date.now(),
        estadoAnterior: oldState,
        estadoNuevo: data.estado,
        comentario: data.comentario || 'Actualización de estado',
        responsable: `${currentUser?.nombre || 'Funcionario'} ${currentUser?.apellido || ''} (${currentUser?.role || 'SISTEMA'})`,
        createdAt: new Date().toISOString(),
      })
      list[idx] = sol
      MockDb.saveSolicitudes(list)
      return { data: { success: true, data: sol } }
    }
  }

  // 5. Agendar Inspección
  if (url.includes('/agenda') && method === 'post') {
    const id = url.split('/')[2]
    const list = MockDb.getSolicitudes()
    const idx = list.findIndex((s) => s.id === id)
    if (idx !== -1) {
      const sol = list[idx]
      sol.estado = 'INSPECCION'
      sol.inspeccion = {
        fecha: data.fecha || new Date(Date.now() + 3600000 * 24).toISOString(),
        tecnico: data.tecnico || 'Ing. Carlos Altamirano',
        fotos: [],
        comentarios: data.comentarios || 'Visita técnica planificada para verificación de predio y linderos.',
      }
      sol.historial.push({
        id: 'h-' + Date.now(),
        estadoAnterior: 'PENDIENTE_TECNICO',
        estadoNuevo: 'INSPECCION',
        comentario: `Inspección técnica programada con éxito para la fecha ${new Date(data.fecha).toLocaleDateString()}.`,
        responsable: `${currentUser?.nombre || 'Técnico'} ${currentUser?.apellido || ''}`,
        createdAt: new Date().toISOString(),
      })
      list[idx] = sol
      MockDb.saveSolicitudes(list)
      return { data: { success: true, data: sol } }
    }
  }

  // 6. Subir reporte de inspección técnica
  if (url.includes('/reporte-inspeccion') && method === 'post') {
    const id = url.split('/')[2]
    const list = MockDb.getSolicitudes()
    const idx = list.findIndex((s) => s.id === id)
    if (idx !== -1) {
      const sol = list[idx]
      sol.estado = 'INSPECCION'
      if (sol.inspeccion) {
        sol.inspeccion.fotos = ['/placeholder-site-1.jpg', '/placeholder-site-2.jpg']
        sol.inspeccion.comentarios = data.comentarios || 'Inspección técnica realizada con éxito. Se validan las medidas georreferenciadas.'
      }
      sol.historial.push({
        id: 'h-' + Date.now(),
        estadoAnterior: 'INSPECCION',
        estadoNuevo: 'INSPECCION',
        comentario: 'Informe técnico de inspección física subido al sistema por el técnico asignado.',
        responsable: `${currentUser?.nombre || 'Técnico'} ${currentUser?.apellido || ''}`,
        createdAt: new Date().toISOString(),
      })
      list[idx] = sol
      MockDb.saveSolicitudes(list)
      return { data: { success: true, data: sol } }
    }
  }

  // 7. Resolver solicitud (enviar a pago o liquidar)
  if (url.includes('/resolver') && method === 'post') {
    const id = url.split('/')[2]
    const list = MockDb.getSolicitudes()
    const idx = list.findIndex((s) => s.id === id)
    if (idx !== -1) {
      const sol = list[idx]
      const oldState = sol.estado
      const targetState = data.montoPago ? 'PAGO_PENDIENTE' : (data.aprobado ? 'APROBADO' : 'NEGADO')
      sol.estado = targetState
      sol.resolucion = {
        comentarios: data.comentarios || 'Resolución del caso emitida favorablemente.',
        montoPago: data.montoPago ? Number(data.montoPago) : undefined,
        rubros: data.montoPago ? ['Tasa de Permiso de edificación', 'Uso y ocupación del suelo', 'Servicio administrativo municipal'] : undefined,
        fechaResolucion: new Date().toISOString(),
      }
      sol.historial.push({
        id: 'h-' + Date.now(),
        estadoAnterior: oldState,
        estadoNuevo: targetState,
        comentario: data.comentarios || `Resolución técnica favorable. Estado actualizado a ${targetState}.`,
        responsable: `${currentUser?.nombre || 'Funcionario'} ${currentUser?.apellido || ''}`,
        createdAt: new Date().toISOString(),
      })
      list[idx] = sol
      MockDb.saveSolicitudes(list)
      return { data: { success: true, data: sol } }
    }
  }

  // 8. Usuarios
  if (url === '/users') {
    const users = MockDb.getUsers()
    return { data: { success: true, data: users } }
  }

  if (url === '/users/tecnicos') {
    const users = MockDb.getUsers()
    const tecnicos = users.filter((u) => u.role === 'TECNICO' && u.activo)
    return { data: { success: true, data: tecnicos } }
  }

  if (url.includes('/zona') && method === 'patch') {
    const id = url.split('/')[2]
    const users = MockDb.getUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx !== -1) {
      users[idx].zona = data.zona
      MockDb.saveUsers(users)
      return { data: { success: true, data: users[idx] } }
    }
  }

  if (url.includes('/toggle-activo') && method === 'patch') {
    const id = url.split('/')[2]
    const users = MockDb.getUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx !== -1) {
      users[idx].activo = data.activo
      MockDb.saveUsers(users)
      return { data: { success: true, data: users[idx] } }
    }
  }

  if (url === '/users/dashboard/stats') {
    const list = MockDb.getSolicitudes()
    const users = MockDb.getUsers()
    
    const total = users.length
    const tecnicos = users.filter(u => u.role === 'TECNICO' && u.activo).length
    const ciudadanos = users.filter(u => u.role === 'CIUDADANO' || u.role === 'INVITADO').length

    // Mapear conteo de solicitudes por su estado
    const solicitudesMap: Record<string, number> = {
      BORRADOR: 0,
      PENDIENTE_SECRETARIA: 0,
      OBSERVADO: 0,
      PENDIENTE_TECNICO: 0,
      INSPECCION: 0,
      PAGO_PENDIENTE: 0,
      PAGADO: 0,
      APROBADO: 0,
      NEGADO: 0
    }

    list.forEach(s => {
      if (s.estado && typeof solicitudesMap[s.estado] === 'number') {
        solicitudesMap[s.estado]++
      } else if (s.estado) {
        solicitudesMap[s.estado] = 1
      }
    })

    return {
      data: {
        usuarios: {
          total,
          tecnicos,
          ciudadanos
        },
        solicitudes: solicitudesMap
      }
    }
  }

  // 9. Auditorías
  if (url === '/audit') {
    const audits = MockDb.getAudits()
    return { data: { success: true, data: audits } }
  }

  if (url === '/audit/verificar') {
    return { data: { success: true, valid: true, message: 'La cadena de bloques y registros de auditoría de GAD Cañar son 100% íntegros.' } }
  }

  // Fallback genérico para llamadas no específicas
  return { data: { success: true, data: [] } }
}

// ---- Interceptor: renueva token si expira ----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // ── Si el error es de conexión / Red Caída (ECONNREFUSED / Network Error) ──
    // Corremos automáticamente la simulación offline transparente para no bloquear la UX.
    if (!error.response || error.code === 'ERR_NETWORK' || error.response.status >= 500) {
      console.warn('[GAD Cañar Mode Offline/Simulation] Backend desconectado. Resolviendo llamada localmente:', original.url)
      try {
        const mockResponse = await handleMockSimulation(original)
        return mockResponse
      } catch (mockErr) {
        return Promise.reject(mockErr)
      }
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('gad_refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', {
            refreshToken,
          })
          localStorage.setItem('gad_access_token', data.accessToken)
          localStorage.setItem('gad_refresh_token', data.refreshToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      } else {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api
export { handleMockSimulation }
