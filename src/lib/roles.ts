/** Roles currently allowed for institutional assignment in the product UI. */
export const ASSIGNABLE_ROLES = ['ADMINISTRATOR', 'TECHNICIAN', 'USER', 'SECRETARY'] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  ADMINISTRATOR: 'Administrator',
  TECHNICIAN: 'Technician',
  USER: 'Architect',
  SECRETARY: 'Secretary',
  // Legacy labels (display only; not assignable)
  FINANCIAL: 'Financial',
  CITIZEN: 'Citizen',
};

export function IsAssignableRole(roleName: string): boolean {
  return (ASSIGNABLE_ROLES as readonly string[]).includes(roleName);
}

export function FormatRoleDisplayName(name: string): string {
  const labeled = ROLE_LABELS[name];
  if (labeled) return labeled;
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}
