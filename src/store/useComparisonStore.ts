import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Internship {
  id: string;
  title: string;
  company: string;
  location: string | { city: string };
  stipend: string;
  sector_tags: string[];
  required_skills: string[];
  [key: string]: any;
}

interface ComparisonState {
  selectedInternships: Internship[];
  addToComparison: (internship: Internship) => void;
  removeFromComparison: (id: string) => void;
  isInComparison: (id: string) => boolean;
  clearComparison: () => void;
  maxComparisons: number;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      selectedInternships: [],
      maxComparisons: 3,

      addToComparison: (internship: Internship) => {
        const { selectedInternships, maxComparisons } = get();
        if (selectedInternships.length >= maxComparisons) return;
        if (selectedInternships.some((item) => item.id === internship.id)) return;
        
        set({ selectedInternships: [...selectedInternships, internship] });
      },

      removeFromComparison: (id: string) => {
        const { selectedInternships } = get();
        set({ selectedInternships: selectedInternships.filter((item) => item.id !== id) });
      },

      isInComparison: (id: string) => {
        return get().selectedInternships.some((item) => item.id === id);
      },

      clearComparison: () => set({ selectedInternships: [] }),
    }),
    {
      name: 'comparison-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
