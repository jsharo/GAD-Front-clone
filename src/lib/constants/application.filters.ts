export interface FilterState {
  search: string;
  procedure_type: string;
  status: string;
  date_from: string;
  date_to: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export const DEFAULT_PROCEDURE_TYPES: FilterOption[] = [
  { value: 'BUILDING_LINE', label: 'Building Line' },
  { value: 'PLAN_APPROVAL', label: 'Plan Approval' },
  { value: 'CONSTRUCTION_PERMIT', label: 'Construction Permit' },
];

export const DEFAULT_STATUS_OPTIONS: FilterOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_SECRETARY', label: 'Pending Secretary' },
  { value: 'OBSERVED', label: 'Flagged' },
  { value: 'PENDING_TECHNICIAN', label: 'Technical Review' },
  { value: 'INSPECTION', label: 'Under Inspection' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];
