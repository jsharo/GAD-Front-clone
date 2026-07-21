/**
 * Valida cédula de identidad ecuatoriana (10 dígitos, algoritmo módulo 10).
 * No consulta el Registro Civil: comprueba que el número sea estructuralmente válido.
 */
export function IsValidEcuadorianCedula(value: string): boolean {
  const cedula = value.trim();
  if (!/^\d{10}$/.test(cedula)) return false;

  const province = Number(cedula.slice(0, 2));
  // 01–24 provincias; 30 = extranjeros registrados en Ecuador
  if ((province < 1 || province > 24) && province !== 30) return false;

  // Personas naturales: tercer dígito 0–5
  const third = Number(cedula[2]);
  if (third < 0 || third > 5) return false;

  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let product = Number(cedula[i]) * coefficients[i];
    if (product >= 10) product -= 9;
    sum += product;
  }

  const check = (10 - (sum % 10)) % 10;
  return check === Number(cedula[9]);
}

export function CedulaValidationMessage(value: string): string | null {
  const cedula = value.trim();
  if (!cedula) return null;
  if (!/^\d{10}$/.test(cedula)) {
    return 'The national ID must be exactly 10 digits.';
  }
  if (!IsValidEcuadorianCedula(cedula)) {
    return 'The national ID is not valid. Please verify it is a valid Ecuadorian national ID number.';
  }
  return null;
}
