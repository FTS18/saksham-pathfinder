import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onEscape,
  onTab,
  enabled = true
}: KeyboardNavigationOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
      case 'Enter':
        onEnter?.();
        break;
      case 'Escape':
        onEscape?.();
        break;
      case 'Tab':
        onTab?.();
        break;
    }
  }, [enabled, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onTab]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
};