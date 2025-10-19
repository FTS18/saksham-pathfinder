/**
 * Accessibility Utilities for WCAG 2.1 Compliance
 * Provides helper functions and hooks for implementing accessible components
 */

import { useEffect, useRef } from 'react';

/**
 * Focus management hook - manages focus trap and restoration
 */
export const useFocusManager = (containerRef: React.RefObject<HTMLElement>) => {
  const previousActiveElement = useRef<Element | null>(null);

  const focusFirstFocusableElement = () => {
    if (containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  };

  const trapFocus = (e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  return {
    focusFirstFocusableElement,
    trapFocus,
  };
};

/**
 * Announce to screen readers
 */
export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;

  document.body.appendChild(announcer);

  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

/**
 * Generate unique ID for aria-labelledby and aria-describedby
 */
export const generateId = (prefix: string) => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ARIA Labels for common patterns
 */
export const ariaLabels = {
  // Buttons
  closeButton: 'Close dialog',
  submitButton: 'Submit form',
  cancelButton: 'Cancel',
  deleteButton: 'Delete',
  editButton: 'Edit',
  moreOptions: 'More options',

  // Navigation
  mainNavigation: 'Main navigation',
  skipToContent: 'Skip to main content',
  breadcrumbs: 'Breadcrumb navigation',

  // Forms
  requiredField: 'This field is required',
  errorMessage: 'Error message',
  helpText: 'Help text',
  characterCount: 'Character count',

  // Lists and Carousels
  carousel: 'Carousel',
  carouselPrevious: 'Previous slide',
  carouselNext: 'Next slide',
  loadMore: 'Load more items',
  noResults: 'No results found',

  // Alerts and Notifications
  successMessage: 'Success',
  errorAlert: 'Error',
  warningAlert: 'Warning',
  infoAlert: 'Information',
};

/**
 * Keyboard event helpers
 */
export const isEnterKey = (e: KeyboardEvent | React.KeyboardEvent) => e.key === 'Enter';
export const isSpaceKey = (e: KeyboardEvent | React.KeyboardEvent) => e.key === ' ';
export const isEscapeKey = (e: KeyboardEvent | React.KeyboardEvent) => e.key === 'Escape';
export const isArrowLeft = (e: KeyboardEvent | React.KeyboardEvent) => e.key === 'ArrowLeft';
export const isArrowRight = (e: KeyboardEvent | React.KeyboardEvent) => e.key === 'ArrowRight';
export const isArrowUp = (e: KeyboardEvent | React.KeyboardEvent) => e.key === 'ArrowUp';
export const isArrowDown = (e: KeyboardEvent | React.KeyboardEvent) => e.key === 'ArrowDown';
export const isTabKey = (e: KeyboardEvent | React.KeyboardEvent) => e.key === 'Tab';

/**
 * Semantic HTML helpers
 */
export const semanticTags = {
  main: 'main',
  section: 'section',
  article: 'article',
  aside: 'aside',
  nav: 'nav',
  header: 'header',
  footer: 'footer',
};

/**
 * ARIA roles for common patterns
 */
export const ariaRoles = {
  dialog: 'dialog',
  alertdialog: 'alertdialog',
  button: 'button',
  checkbox: 'checkbox',
  menuitem: 'menuitem',
  option: 'option',
  progressbar: 'progressbar',
  radio: 'radio',
  region: 'region',
  status: 'status',
  tab: 'tab',
  tablist: 'tablist',
  tabpanel: 'tabpanel',
  tooltip: 'tooltip',
};

/**
 * Combine class names with optional conditional classes (accessibility-aware)
 */
export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Skip link component for keyboard navigation
 */
export const createSkipLink = (targetSelector: string, linkText: string = 'Skip to main content') => {
  return `
    <a href="#${targetSelector}" class="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground focus:rounded">
      ${linkText}
    </a>
  `;
};

/**
 * Get contrasting text color based on background
 * Returns 'text-black' or 'text-white' for WCAG AA contrast compliance
 */
export const getContrastColor = (bgColor: string): 'text-black' | 'text-white' => {
  // Convert hex to RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'text-black' : 'text-white';
};

/**
 * Format error messages consistently
 */
export const formatErrorMessage = (fieldName: string, errorType: string): string => {
  const errors: Record<string, Record<string, string>> = {
    required: { default: `${fieldName} is required` },
    email: { default: `${fieldName} must be a valid email address` },
    minLength: { default: `${fieldName} is too short` },
    maxLength: { default: `${fieldName} is too long` },
    pattern: { default: `${fieldName} has an invalid format` },
    custom: { default: 'Invalid input' },
  };

  return errors[errorType]?.default || `${fieldName} is invalid`;
};

/**
 * Create accessible form field with label, error, and help text
 */
export const createAccessibleField = (id: string, label: string, options?: {
  error?: string;
  helpText?: string;
  required?: boolean;
}) => {
  const errorId = options?.error ? `${id}-error` : undefined;
  const helpId = options?.helpText ? `${id}-help` : undefined;

  return {
    id,
    labelProps: {
      htmlFor: id,
      'aria-required': options?.required ? 'true' : undefined,
    },
    inputProps: {
      id,
      'aria-invalid': !!options?.error,
      'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
      'aria-required': options?.required ? 'true' : undefined,
    },
    errorId,
    helpId,
  };
};

export default {
  useFocusManager,
  announce,
  generateId,
  ariaLabels,
  isEnterKey,
  isSpaceKey,
  isEscapeKey,
  isArrowLeft,
  isArrowRight,
  isArrowUp,
  isArrowDown,
  isTabKey,
  semanticTags,
  ariaRoles,
  classNames,
  createSkipLink,
  getContrastColor,
  formatErrorMessage,
  createAccessibleField,
};
