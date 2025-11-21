/**
 * useUnsavedChanges Hook
 * Tracks form state changes and warns users before navigation if there are unsaved changes
 */

import { useEffect, useState, useCallback } from 'react';

interface UseUnsavedChangesOptions {
  when: boolean;
  message?: string;
}

/**
 * Hook to track and warn about unsaved changes
 * @param when - Boolean indicating if there are unsaved changes
 * @param message - Custom warning message (optional)
 * @returns Object with hasUnsavedChanges and resetUnsavedChanges function
 */
export const useUnsavedChanges = ({ when, message }: UseUnsavedChangesOptions) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(when);

  // Update state when 'when' prop changes
  useEffect(() => {
    setHasUnsavedChanges(when);
  }, [when]);

  // Warn on page refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message || 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, message]);

  // Note: useBlocker from react-router-dom requires a data router setup
  // For now, we're only using beforeunload which covers browser navigation
  // In-app navigation can be handled by wrapping navigation functions

  const resetUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  return {
    hasUnsavedChanges,
    resetUnsavedChanges,
  };
};

/**
 * Helper function to compare form data with original data
 * @param original - Original data object
 * @param current - Current form data object
 * @returns True if there are differences, false otherwise
 */
export const hasFormChanges = <T extends Record<string, any>>(
  original: T | null | undefined,
  current: T | null | undefined
): boolean => {
  if (!original && !current) return false;
  if (!original || !current) return true;

  return JSON.stringify(original) !== JSON.stringify(current);
};
