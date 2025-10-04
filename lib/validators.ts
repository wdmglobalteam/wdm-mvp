// --- filename: lib/validators.ts ---
/**
 * Input validation utilities
 * Strict validation for all user inputs
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email format
 * RFC 5322 compliant pattern
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();
  
  if (trimmed.length < 3 || trimmed.length > 254) {
    return { valid: false, error: 'Email must be between 3 and 254 characters' };
  }

  const emailRegex = /^(?:[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~]+)*|"(?:\\[\s\S]|[^"\\])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[A-Za-z]{2,63}|(?:\[(?:[0-9]{1,3}\.){3}[0-9]{1,3}\]))$/;
  
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate password strength
 * Requirements:
 * - Min 6 characters
 * - At least 3 of: uppercase, lowercase, number, symbol
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/.test(password);

  const categoriesMet = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (categoriesMet < 3) {
    return {
      valid: false,
      error: 'Password must contain at least 3 of: uppercase, lowercase, number, symbol',
    };
  }

  return { valid: true };
}

/**
 * Normalize phone number to E.164 format
 * Supports: 0906..., +23490..., 23490...
 */
export function normalizePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, '');

  // Handle Nigerian numbers
  if (digits.startsWith('0')) {
    digits = '234' + digits.slice(1);
  } else if (digits.startsWith('234')) {
    // Already correct format
  } else if (digits.length === 10) {
    // Assume Nigerian number without prefix
    digits = '234' + digits;
  } else {
    return null; // Invalid format
  }

  // Validate length (Nigerian numbers are 13 digits with country code)
  if (digits.length !== 13) {
    return null;
  }

  return '+' + digits;
}

/**
 * Validate matric number format
 * Format: YYYY/FAC/DEPT/NUMBER (e.g., 2024/CP/CSC/022)
 */
export function isValidMatric(matric: string): boolean {
  if (!matric || typeof matric !== 'string') {
    return false;
  }

  const matricRegex = /^\d{4}\/[A-Z]{2,4}\/[A-Z]{2,4}\/\d{3,4}$/i;
  return matricRegex.test(matric.trim());
}

/**
 * Normalize matric number (uppercase, trimmed)
 */
export function normalizeMatric(matric: string): string {
  return matric.trim().toUpperCase();
}

/**
 * Validate full name
 */
export function validateFullName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Full name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Full name must be less than 100 characters' };
  }

  // Allow letters, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Full name contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Validate age
 */
export function validateAge(age: number): ValidationResult {
  if (typeof age !== 'number' || isNaN(age)) {
    return { valid: false, error: 'Age must be a number' };
  }

  if (age < 13 || age > 120) {
    return { valid: false, error: 'Age must be between 13 and 120' };
  }

  return { valid: true };
}

/**
 * Validate gender
 */
export function validateGender(gender: string): ValidationResult {
  const validGenders = ['male', 'female', 'other'];
  
  if (!gender || !validGenders.includes(gender.toLowerCase())) {
    return { valid: false, error: 'Gender must be male, female, or other' };
  }

  return { valid: true };
}