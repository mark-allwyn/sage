/**
 * useFormValidation Hook
 * Provides real-time form validation with error messages
 */

import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule<T = any> {
  field: string;
  validate: (value: T, formData?: any) => boolean;
  message: string;
}

export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Hook for form validation
 * @param rules - Array of validation rules
 * @returns Validation state and methods
 */
export const useFormValidation = <T extends Record<string, any>>(rules: ValidationRule[]) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  /**
   * Validate a specific field
   */
  const validateField = useCallback((field: string, value: any, formData?: T): string | null => {
    const fieldRules = rules.filter(rule => rule.field === field);

    for (const rule of fieldRules) {
      if (!rule.validate(value, formData)) {
        return rule.message;
      }
    }

    return null;
  }, [rules]);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((formData: T): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    rules.forEach(rule => {
      const value = formData[rule.field];
      if (!rule.validate(value, formData)) {
        newErrors[rule.field] = rule.message;
      }
    });

    setErrors(newErrors);
    return newErrors;
  }, [rules]);

  /**
   * Mark field as touched (for showing errors only after user interaction)
   */
  const touchField = useCallback((field: string) => {
    setTouched(prev => new Set(prev).add(field));
  }, []);

  /**
   * Check if form is valid
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Get error for a specific field (only if touched)
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    return touched.has(field) ? errors[field] : undefined;
  }, [errors, touched]);

  /**
   * Reset validation state
   */
  const reset = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  /**
   * Update errors for a specific field
   */
  const setFieldError = useCallback((field: string, error: string | null) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, []);

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateForm,
    touchField,
    getFieldError,
    setFieldError,
    reset,
  };
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    field: '',
    validate: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return value != null && value !== '';
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    field: '',
    validate: (value) => {
      if (typeof value === 'string') return value.length >= min;
      if (Array.isArray(value)) return value.length >= min;
      return true;
    },
    message: message || `Minimum length is ${min}`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    field: '',
    validate: (value) => {
      if (typeof value === 'string') return value.length <= max;
      if (Array.isArray(value)) return value.length <= max;
      return true;
    },
    message: message || `Maximum length is ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    field: '',
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return regex.test(value);
    },
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    field: '',
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min;
    },
    message: message || `Minimum value is ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    field: '',
    validate: (value) => {
      const num = Number(value);
      return !isNaN(num) && num <= max;
    },
    message: message || `Maximum value is ${max}`,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    field: '',
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    field: '',
    validate: (value) => {
      if (typeof value !== 'string') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),
};
