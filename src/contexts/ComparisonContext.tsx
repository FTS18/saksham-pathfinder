import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface ComparisonContextType {
  selectedInternships: Internship[];
  addToComparison: (internship: Internship) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;
  maxComparisons: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

interface ComparisonProviderProps {
  children: ReactNode;
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const [selectedInternships, setSelectedInternships] = useState<Internship[]>([]);
  const maxComparisons = 3;

  const addToComparison = (internship: Internship) => {
    setSelectedInternships(prev => {
      if (prev.length >= maxComparisons) return prev;
      if (prev.some(item => item.id === internship.id)) return prev;
      return [...prev, internship];
    });
  };

  const removeFromComparison = (id: string) => {
    setSelectedInternships(prev => prev.filter(item => item.id !== id));
  };

  const clearComparison = () => {
    setSelectedInternships([]);
  };

  const isInComparison = (id: string) => {
    return selectedInternships.some(item => item.id === id);
  };

  return (
    <ComparisonContext.Provider value={{
      selectedInternships,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      maxComparisons
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};