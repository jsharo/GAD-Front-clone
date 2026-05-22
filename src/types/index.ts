export type Role = 'INVITADO' | 'CIUDADANO' | 'SECRETARIA' | 'TECNICO' | 'FINANCIERO' | 'ADMIN';

export type User = {
  id: string;
  name: string;
  role: Role;
};

export type EstadoTramite = 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'PAGO_PENDIENTE' | 'CERRADO' | 'RECHAZADO';
