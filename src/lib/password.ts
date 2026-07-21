import { z } from 'zod';

/** Min 8 + upper + lower + digit + special. */
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_REQUIREMENTS_HINT =
  'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial';

export const PASSWORD_REQUIREMENTS_ERROR =
  'La contraseña debe tener mínimo 8 caracteres e incluir mayúscula, minúscula, número y un carácter especial';

export function IsStrongPasswordValue(password: string): boolean {
  return PASSWORD_COMPLEXITY_REGEX.test(password);
}

export const StrongPasswordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(PASSWORD_COMPLEXITY_REGEX, PASSWORD_REQUIREMENTS_ERROR);
