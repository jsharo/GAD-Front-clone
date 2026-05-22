/**
 * mockDb.ts — Base de datos simulada y persistente en LocalStorage.
 * Proporciona datos de prueba robustos y flujos 100% interactivos cuando el backend no está disponible.
 */

export interface Solicitud {
  id: string
  tipoTramite: 'PERMISO_CONSTRUCCION' | 'LINEA_FABRICAS' | 'APROBACION_PLANOS'
  estado: 'PENDIENTE_SECRETARIA' | 'OBSERVADO' | 'PENDIENTE_TECNICO' | 'INSPECCION' | 'PAGO_PENDIENTE' | 'APROBADO' | 'NEGADO'
  createdAt: string
  ciudadano: {
    id: string
    nombre: string
    apellido: string
    cedula: string
    email: string
    telefono?: string
  }
  predio: {
    claveCatastral: string
    direccion: string
    area: number
    zona: 'URBANO' | 'RURAL'
  }
  anexos: Array<{
    id: string
    nombre: string
    tipo: string
    url: string
    createdAt: string
  }>
  historial: Array<{
    id: string
    estadoAnterior: string
    estadoNuevo: string
    comentario: string
    responsable: string
    createdAt: string
  }>
  inspeccion?: {
    fecha: string
    tecnico: string
    fotos: string[]
    comentarios: string
  }
  resolucion?: {
    comentarios: string
    montoPago?: number
    rubros?: string[]
    fechaResolucion: string
  }
}

const SOLICITUDES_INICIALES: Solicitud[] = [
  {
    id: 'sol-9f7a8b2d',
    tipoTramite: 'PERMISO_CONSTRUCCION',
    estado: 'PENDIENTE_SECRETARIA',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // Hace 4 horas
    ciudadano: {
      id: 'cit-1',
      nombre: 'Juan Carlos',
      apellido: 'Guamán Suscal',
      cedula: '0302145896',
      email: 'ciudadano@cañar.gob.ec',
      telefono: '0984758123',
    },
    predio: {
      claveCatastral: '03-01-50-024-001',
      direccion: 'Av. 24 de Mayo y Paseo de las Flores, Cantón Cañar',
      area: 250,
      zona: 'URBANO',
    },
    anexos: [
      { id: 'anx-1', nombre: 'Escritura_Propiedad.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() },
      { id: 'anx-2', nombre: 'Cedula_Identidad.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() },
      { id: 'anx-3', nombre: 'Certificado_No_Adeudar.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() },
    ],
    historial: [
      {
        id: 'h-1',
        estadoAnterior: 'BORRADOR',
        estadoNuevo: 'PENDIENTE_SECRETARIA',
        comentario: 'Solicitud ingresada de forma digital por el ciudadano.',
        responsable: 'Juan Carlos Guamán Suscal',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    ]
  },
  {
    id: 'sol-3a4b5c6d',
    tipoTramite: 'LINEA_FABRICAS',
    estado: 'OBSERVADO',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // Hace 2 días
    ciudadano: {
      id: 'cit-2',
      nombre: 'María Estela',
      apellido: 'Chuma Carchi',
      cedula: '0301897452',
      email: 'ciudadano@cañar.gob.ec',
      telefono: '0995874125',
    },
    predio: {
      claveCatastral: '03-02-12-005-012',
      direccion: 'Parroquia Honorato Vásquez, Vía a Ingapirca',
      area: 850,
      zona: 'RURAL',
    },
    anexos: [
      { id: 'anx-4', nombre: 'Plano_Predio.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() }
    ],
    historial: [
      {
        id: 'h-2',
        estadoAnterior: 'BORRADOR',
        estadoNuevo: 'PENDIENTE_SECRETARIA',
        comentario: 'Ingreso inicial.',
        responsable: 'María Estela Chuma Carchi',
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
      {
        id: 'h-3',
        estadoAnterior: 'PENDIENTE_SECRETARIA',
        estadoNuevo: 'OBSERVADO',
        comentario: 'Falta adjuntar el Certificado del Registro de la Propiedad actualizado.',
        responsable: 'Lcda. Mariana Vélez (Secretaría)',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      }
    ]
  },
  {
    id: 'sol-8e9f0a1b',
    tipoTramite: 'APROBACION_PLANOS',
    estado: 'PENDIENTE_TECNICO',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(), // Hace 12 horas
    ciudadano: {
      id: 'cit-3',
      nombre: 'Segundo Manuel',
      apellido: 'Quizhpe Pomavilla',
      cedula: '0301478523',
      email: 'segundo.quizhpe@gmail.com',
      telefono: '0981452369',
    },
    predio: {
      claveCatastral: '03-01-08-012-008',
      direccion: 'Sector Suscal, Barrio Central, Cañar',
      area: 410,
      zona: 'RURAL',
    },
    anexos: [
      { id: 'anx-5', nombre: 'Diseno_Estructural_Completo.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() },
      { id: 'anx-6', nombre: 'Certificado_Catastral.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() }
    ],
    historial: [
      {
        id: 'h-4',
        estadoAnterior: 'PENDIENTE_SECRETARIA',
        estadoNuevo: 'PENDIENTE_TECNICO',
        comentario: 'Expediente físico verificado. Pasa a asignación de inspección técnica en zona rural.',
        responsable: 'Lcda. Mariana Vélez (Secretaría)',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      }
    ]
  },
  {
    id: 'sol-2c3d4e5f',
    tipoTramite: 'PERMISO_CONSTRUCCION',
    estado: 'INSPECCION',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    ciudadano: {
      id: 'cit-4',
      nombre: 'Martha Elena',
      apellido: 'Castro Verdugo',
      cedula: '0301548796',
      email: 'martha.castro@gmail.com',
      telefono: '0985471254',
    },
    predio: {
      claveCatastral: '03-01-50-011-002',
      direccion: 'Calle Bolívar y Pichincha, Centro Histórico de Cañar',
      area: 180,
      zona: 'URBANO',
    },
    anexos: [
      { id: 'anx-7', nombre: 'Escritura_Notariada.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() },
      { id: 'anx-8', nombre: 'Informe_Suelo.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() }
    ],
    inspeccion: {
      fecha: new Date(Date.now() + 3600000 * 24).toISOString(), // Planificado para mañana
      tecnico: 'Ing. Carlos Altamirano',
      fotos: [],
      comentarios: 'Inspección en sitio programada para verificar linderos y afectación a vías públicas.',
    },
    historial: [
      {
        id: 'h-5',
        estadoAnterior: 'PENDIENTE_TECNICO',
        estadoNuevo: 'INSPECCION',
        comentario: 'Inspección técnica programada para el técnico de la zona urbana.',
        responsable: 'Ing. Carlos Altamirano (Técnico)',
        createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      }
    ]
  },
  {
    id: 'sol-4f5g6h7i',
    tipoTramite: 'PERMISO_CONSTRUCCION',
    estado: 'PAGO_PENDIENTE',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
    ciudadano: {
      id: 'cit-5',
      nombre: 'Luis Alberto',
      apellido: 'Solano Tenesaca',
      cedula: '0301124578',
      email: 'luis.solano@hotmail.com',
      telefono: '0978541236',
    },
    predio: {
      claveCatastral: '03-01-44-010-005',
      direccion: 'Av. El Condor y Juan de Velasco, Cañar',
      area: 320,
      zona: 'URBANO',
    },
    anexos: [
      { id: 'anx-9', nombre: 'Formulario_Unico_GAD.pdf', tipo: 'application/pdf', url: '#', createdAt: new Date().toISOString() }
    ],
    inspeccion: {
      fecha: new Date(Date.now() - 3600000 * 48).toISOString(),
      tecnico: 'Ing. Carlos Altamirano',
      fotos: ['/placeholder-site-1.jpg'],
      comentarios: 'Terreno verificado de forma idónea. Apto para construcción sismorresistente residencial.',
    },
    resolucion: {
      comentarios: 'Informe técnico favorable emitido. Se determina cobro de tasa municipal por edificación.',
      montoPago: 185.50,
      rubros: ['Tasa de Permiso de Construcción', 'Uso de Suelo Cantonal', 'Tasa Administrativa de Servicios'],
      fechaResolucion: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    historial: [
      {
        id: 'h-6',
        estadoAnterior: 'INSPECCION',
        estadoNuevo: 'PAGO_PENDIENTE',
        comentario: 'Se aprueba informe técnico y se genera orden de cobro municipal por un total de $185.50.',
        responsable: 'Ing. Carlos Altamirano (Técnico)',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      }
    ]
  }
]

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  details: string
  ipAddress: string
  createdAt: string
}

const AUDIT_INICIALES: AuditLog[] = [
  { id: 'a-1', userId: 'usr-admin', userEmail: 'admin@gadcanar.gob.ec', action: 'LOGIN', details: 'Inicio de sesión exitoso', ipAddress: '192.168.100.12', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'a-2', userId: 'usr-tec1', userEmail: 'carlos.altamirano@gadcanar.gob.ec', action: 'UPDATE_SOLICITUD_ESTADO', details: 'Solicitud #sol-4f5g6h7i cambio a PAGO_PENDIENTE', ipAddress: '192.168.100.32', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'a-3', userId: 'usr-sec1', userEmail: 'mariana.velez@gadcanar.gob.ec', action: 'UPDATE_SOLICITUD_ESTADO', details: 'Solicitud #sol-8e9f0a1b cambio a PENDIENTE_TECNICO', ipAddress: '192.168.100.45', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() }
]

export interface MockUser {
  id: string
  email: string
  nombre: string
  apellido: string
  cedula: string
  role: 'SUPERADMIN' | 'CIUDADANO' | 'TECNICO' | 'SECRETARIA' | 'FINANCIERO' | 'INVITADO'
  activo: boolean
  zona?: 'URBANO' | 'RURAL' | null
  createdAt: string
}

const USERS_INICIALES: MockUser[] = [
  { id: 'usr-admin', email: 'admin@gadcanar.gob.ec', nombre: 'Administrador', apellido: 'General', cedula: '0300124578', role: 'SUPERADMIN', activo: true, createdAt: new Date().toISOString() },
  { id: 'usr-sec1', email: 'secretaria@gadcanar.gob.ec', nombre: 'Mariana', apellido: 'Vélez', cedula: '0301478529', role: 'SECRETARIA', activo: true, createdAt: new Date().toISOString() },
  { id: 'usr-tec1', email: 'tecnico@gadcanar.gob.ec', nombre: 'Carlos', apellido: 'Altamirano', cedula: '0301548721', role: 'TECNICO', activo: true, zona: 'URBANO', createdAt: new Date().toISOString() },
  { id: 'usr-tec2', email: 'tecnico.rural@gadcanar.gob.ec', nombre: 'Sofía', apellido: 'Mendieta', cedula: '0301985472', role: 'TECNICO', activo: true, zona: 'RURAL', createdAt: new Date().toISOString() },
  { id: 'usr-fin1', email: 'financiero@gadcanar.gob.ec', nombre: 'Fernando', apellido: 'Ordóñez', cedula: '0302145879', role: 'FINANCIERO', activo: true, createdAt: new Date().toISOString() },
]

export class MockDb {
  static getSolicitudes(): Solicitud[] {
    const db = localStorage.getItem('gad_mock_solicitudes')
    if (!db) {
      localStorage.setItem('gad_mock_solicitudes', JSON.stringify(SOLICITUDES_INICIALES))
      return SOLICITUDES_INICIALES
    }
    const list = JSON.parse(db)
    // Verificación inteligente para corregir localStorage viejo en el navegador
    const hasDemo = list.some((s: any) => s.ciudadano?.email === 'ciudadano@cañar.gob.ec')
    if (!hasDemo) {
      const merged = [...SOLICITUDES_INICIALES, ...list.filter((s: any) => s.ciudadano?.email !== 'ciudadano@cañar.gob.ec')]
      localStorage.setItem('gad_mock_solicitudes', JSON.stringify(merged))
      return merged
    }
    return list
  }

  static saveSolicitudes(list: Solicitud[]) {
    localStorage.setItem('gad_mock_solicitudes', JSON.stringify(list))
  }

  static getAudits(): AuditLog[] {
    const db = localStorage.getItem('gad_mock_audits')
    if (!db) {
      localStorage.setItem('gad_mock_audits', JSON.stringify(AUDIT_INICIALES))
      return AUDIT_INICIALES
    }
    return JSON.parse(db)
  }

  static saveAudits(list: AuditLog[]) {
    localStorage.setItem('gad_mock_audits', JSON.stringify(list))
  }

  static getUsers(): MockUser[] {
    const db = localStorage.getItem('gad_mock_users')
    if (!db) {
      localStorage.setItem('gad_mock_users', JSON.stringify(USERS_INICIALES))
      return USERS_INICIALES
    }
    return JSON.parse(db)
  }

  static saveUsers(list: MockUser[]) {
    localStorage.setItem('gad_mock_users', JSON.stringify(list))
  }

  static reset() {
    localStorage.setItem('gad_mock_solicitudes', JSON.stringify(SOLICITUDES_INICIALES))
    localStorage.setItem('gad_mock_users', JSON.stringify(USERS_INICIALES))
    localStorage.setItem('gad_mock_audits', JSON.stringify(AUDIT_INICIALES))
  }
}
