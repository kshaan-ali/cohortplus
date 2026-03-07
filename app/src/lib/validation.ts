// ─── Auth Validation Utilities ───────────────────────────────────────────────
// Shared, strict validators for Sign In & Sign Up forms.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/\\`~]/;

// ─── Email ───────────────────────────────────────────────────────────────────

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) return { valid: false, error: 'Email is required' };
  if (trimmed.length > 254) return { valid: false, error: 'Email is too long' };
  if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: 'Please enter a valid email address' };
  return { valid: true };
}

// ─── Login Password (lightweight) ────────────────────────────────────────────

export function validateLoginPassword(password: string): { valid: boolean; error?: string } {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < 6) return { valid: false, error: 'Password must be at least 6 characters' };
  return { valid: true };
}

// ─── Signup Password (strict) ────────────────────────────────────────────────

export interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecialChar: boolean;
  maxLength: boolean;
}

export function getPasswordStrength(password: string): PasswordStrength {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecialChar: SPECIAL_CHAR_REGEX.test(password),
    maxLength: password.length <= 128,
  };
}

export const PASSWORD_RULES: { key: keyof PasswordStrength; label: string }[] = [
  { key: 'minLength', label: 'At least 8 characters' },
  { key: 'hasUppercase', label: 'One uppercase letter' },
  { key: 'hasLowercase', label: 'One lowercase letter' },
  { key: 'hasDigit', label: 'One number' },
  { key: 'hasSpecialChar', label: 'One special character (!@#$%…)' },
];

export function validateSignupPassword(password: string): { valid: boolean; errors: string[] } {
  const strength = getPasswordStrength(password);
  const errors: string[] = [];

  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }
  if (!strength.maxLength) errors.push('Password must not exceed 128 characters');
  for (const rule of PASSWORD_RULES) {
    if (!strength[rule.key]) errors.push(rule.label);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Confirm Password ───────────────────────────────────────────────────────

export function validateConfirmPassword(password: string, confirmPassword: string): { valid: boolean; error?: string } {
  if (!confirmPassword) return { valid: false, error: 'Please confirm your password' };
  if (password !== confirmPassword) return { valid: false, error: 'Passwords do not match' };
  return { valid: true };
}

// ─── Role ────────────────────────────────────────────────────────────────────

export function validateRole(role: string): { valid: boolean; error?: string } {
  if (role !== 'student' && role !== 'tutor') {
    return { valid: false, error: 'Please select a valid role' };
  }
  return { valid: true };
}
