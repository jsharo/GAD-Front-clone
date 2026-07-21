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
        return 'Unable to sign in. Contact your administrator if the problem continues.';
      }
      if (message === 'User is inactive') {
        return 'User account is inactive.';
      }
      if (message === 'Invalid email or password') {
        return 'Invalid credentials.';
      }
      return 'Your session has expired. Please sign in again.';
    }
    if (response?.status === 403) return 'You do not have permission to perform this action.';
    if (response?.status === 404) return 'The file or document was not found.';
    if (response?.status === 409) {
      if (
        message === 'This ID number is already registered in the system.' ||
        message === 'Esta cédula ya está registrada en el sistema.'
      ) {
        return 'This national ID number is already registered in the system.';
      }
      if (message === 'Email is already registered') {
        return 'This email is already registered in the system.';
      }
    }
    if (typeof message === 'string') {
      if (
        message.includes('cedula must be a valid Ecuadorian national ID number') ||
        message.includes('The ID number is not valid') ||
        message.includes('La cédula no es válida')
      ) {
        return 'The national ID number is not valid. It must be a valid Ecuadorian national ID number.';
      }
      if (
        message.includes('This ID number is already registered') ||
        message.includes('Esta cédula ya está registrada')
      ) {
        return 'This national ID number is already registered in the system.';
      }
      return message;
    }
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return fallback;
}
