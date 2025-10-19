/**
 * Accessibility enhancements for RecruiterDashboard
 * Provides screen reader optimization, keyboard navigation, and WCAG 2.1 compliance
 */

import React from 'react';
import { 
  announce,
  createAccessibleField,
  isEscapeKey,
  ariaLabels,
} from '@/utils/accessibilityHelpers';

/**
 * Hook for managing form validation with accessibility
 */
export const useAccessibleForm = () => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const setFieldError = (fieldName: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    // Announce error to screen readers
    if (error) {
      announce(`${fieldName}: ${error}`, 'assertive');
    }
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const markFieldTouched = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRequired = (value: string, fieldName: string): boolean => {
    if (!value || value.trim() === '') {
      setFieldError(fieldName, ariaLabels.requiredField);
      return false;
    }
    clearFieldError(fieldName);
    return true;
  };

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    markFieldTouched,
    validateEmail,
    validateRequired,
  };
};

/**
 * Accessible Dialog for forms with keyboard navigation
 */
interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  role?: 'dialog' | 'alertdialog';
}

export const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  role = 'dialog',
}) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEscapeKey(e)) {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Focus dialog when opened
      if (dialogRef.current) {
        dialogRef.current.focus();
      }
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
        className="bg-background rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
        tabIndex={-1}
      >
        <h2 id="dialog-title" className="text-lg font-semibold mb-4">
          {title}
        </h2>
        {description && (
          <p id="dialog-description" className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

/**
 * Accessible form field with label, error message, and help text
 */
interface AccessibleFormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helpText?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  maxLength?: number;
  rows?: number;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  helpText,
  required,
  placeholder,
  type = 'text',
  disabled = false,
  multiline = false,
  maxLength,
  rows = 3,
}) => {
  const fieldConfig = createAccessibleField(id, label, { error, helpText, required });
  const characterCount = maxLength ? value.length : 0;
  const showCharacterCount = maxLength && multiline;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground disabled:opacity-50"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground disabled:opacity-50"
        />
      )}

      {showCharacterCount && (
        <div className="text-xs text-muted-foreground mt-1">
          {characterCount} / {maxLength} characters
        </div>
      )}

      {helpText && (
        <p id={fieldConfig.helpId} className="text-xs text-muted-foreground mt-1">
          {helpText}
        </p>
      )}

      {error && (
        <p
          id={fieldConfig.errorId}
          className="text-xs text-red-500 mt-1"
          role="alert"
        >
          ⚠️ {error}
        </p>
      )}
    </div>
  );
};

/**
 * Accessible table wrapper with screen reader support
 */
interface AccessibleTableProps {
  caption: string;
  children: React.ReactNode;
}

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  caption,
  children,
}) => {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-sm"
        role="table"
        aria-label={caption}
      >
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
};

/**
 * Accessible table header cell
 */
interface AccessibleTableHeaderCellProps {
  children: React.ReactNode;
  sortable?: boolean;
  onSort?: () => void;
  sortDirection?: 'asc' | 'desc' | 'none';
}

export const AccessibleTableHeaderCell: React.FC<AccessibleTableHeaderCellProps> = ({
  children,
  sortable = false,
  onSort,
  sortDirection = 'none',
}) => {
  return (
    <th
      className="text-left font-semibold p-2 bg-muted"
      scope="col"
      onClick={sortable ? onSort : undefined}
      role={sortable ? 'button' : 'columnheader'}
      tabIndex={sortable ? 0 : -1}
      aria-sort={sortDirection !== 'none' ? `${sortDirection}ending` : 'none'}
      onKeyDown={(e) => {
        if (sortable && e.key === 'Enter') {
          onSort?.();
        }
      }}
    >
      {children}
      {sortable && (
        <span aria-hidden="true" className="ml-2">
          {sortDirection === 'asc' && '↑'}
          {sortDirection === 'desc' && '↓'}
          {sortDirection === 'none' && '⇅'}
        </span>
      )}
    </th>
  );
};

/**
 * Accessible status badge
 */
interface AccessibleStatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export const AccessibleStatusBadge: React.FC<AccessibleStatusBadgeProps> = ({
  status,
  variant = 'info',
}) => {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const statusTexts: Record<string, string> = {
    active: 'Active',
    closed: 'Closed',
    pending: 'Pending review',
    reviewed: 'Reviewed',
    shortlisted: 'Shortlisted',
    rejected: 'Rejected',
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${variantClasses[variant]}`}
      role="status"
      aria-label={statusTexts[status] || status}
    >
      {status}
    </span>
  );
};

/**
 * Accessible skip navigation link
 */
export const AccessibleSkipLink: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded"
    >
      Skip to main content
    </a>
  );
};

export default {
  useAccessibleForm,
  AccessibleDialog,
  AccessibleFormField,
  AccessibleTable,
  AccessibleTableHeaderCell,
  AccessibleStatusBadge,
  AccessibleSkipLink,
};
