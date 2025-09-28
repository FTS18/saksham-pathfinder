import { FilterState } from '../types';

const FILTER_STORAGE_KEY = 'saksham_filters';

export const saveFilters = (filters: FilterState): void => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.warn('Failed to save filters:', error);
  }
};

export const loadFilters = (): FilterState | null => {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load filters:', error);
    return null;
  }
};

export const clearFilters = (): void => {
  try {
    localStorage.removeItem(FILTER_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear filters:', error);
  }
};