import { z } from 'zod';

/** Min 8 + upper + lower + digit + special. */
export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_REQUIREMENTS_HINT =
  'At least 8 characters, including uppercase, lowercase, number, and special character';

export const PASSWORD_REQUIREMENTS_ERROR =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and a special character';

export function IsStrongPasswordValue(password: string): boolean {
  return PASSWORD_COMPLEXITY_REGEX.test(password);
}

export const StrongPasswordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(PASSWORD_COMPLEXITY_REGEX, PASSWORD_REQUIREMENTS_ERROR);
