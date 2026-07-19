/** Código de titulación SENESCYT (sin código IES): ej. 650211A01 */
export const SENESCYT_TITLE_CODE_REGEX = /^\d{6}[A-Za-z]\d{2}$/;

export const SENESCYT_TITLE_CODE_EXAMPLE = '650211A01';

export function NormalizeSenescytTitleCode(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase();
}

export function IsValidSenescytTitleCode(value: string): boolean {
  return SENESCYT_TITLE_CODE_REGEX.test(NormalizeSenescytTitleCode(value));
}

export function ProfileModalDismissKey(user_id: string): string {
  return `gad_profile_modal_dismissed:${user_id}`;
}
