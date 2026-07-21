export function GetApiError(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (
      err as {
        response?: { status?: number; data?: { message?: string | string[] } };
      }
    ).response;
    const data = response?.data;
    const msg = data?.message;
    const message = Array.isArray(msg) ? msg.join(', ') : msg;

    if (response?.status === 401) {
      if (message === 'Email not verified') {
        return 'Debes verificar tu correo antes de iniciar sesión.';
      }
      if (message === 'User is inactive') {
        return 'Usuario inactivado.';
      }
      if (message === 'Invalid email or password') {
        return 'Credenciales incorrectas.';
      }
      return 'La sesión expiró. Inicie sesión nuevamente.';
    }
    if (response?.status === 403) return 'No tiene permisos para realizar esta acción.';
    if (response?.status === 404) return 'El expediente o documento no fue encontrado.';
    if (response?.status === 409) {
      if (message === 'Esta cédula ya está registrada en el sistema.') {
        return message;
      }
      if (message === 'Email is already registered') {
        return 'Este correo ya está registrado en el sistema.';
      }
    }
    if (typeof message === 'string') {
      if (message.includes('cedula must be a valid Ecuadorian national ID number')) {
        return 'La cédula no es válida. Debe ser un número de identidad ecuatoriano real.';
      }
      if (message.includes('La cédula no es válida')) {
        return message;
      }
      if (message.includes('Esta cédula ya está registrada')) {
        return message;
      }
      return message;
    }
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return fallback;
}
