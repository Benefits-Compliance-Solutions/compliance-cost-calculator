/**
 * Validation utilities for calculator inputs
 * Addresses P0 issue: input validation and error states
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateAgencyName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: "Agency name is required",
    };
  }
  
  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: "Agency name must be at least 2 characters",
    };
  }
  
  return { isValid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: "Email is required",
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }
  
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      error: "Phone number is required",
    };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      error: "Phone number must be at least 10 digits",
    };
  }
  
  return { isValid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  
  return { isValid: true };
}

export function validateNumericRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a number`,
    };
  }
  
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }
  
  return { isValid: true };
}
