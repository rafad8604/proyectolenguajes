export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  code: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationResult {
  id: string;
  label: string;
  passed: boolean;
  issues: ValidationIssue[];
}

export interface FormalDefinition {
  Q: string[];
  sigma: string[];
  delta: string[];
  q0: string | null;
  F: string[];
}
