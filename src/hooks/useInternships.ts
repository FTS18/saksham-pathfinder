import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import * as internshipService from "@/services/internshipService";

// Hook for fetching all internships
export const useInternships = () => {
  return useQuery({
    queryKey: ["internships"],
    queryFn: internshipService.getAllInternships,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for paginated internships
export const usePaginatedInternships = (limit = 12) => {
  return useInfiniteQuery({
    queryKey: ["internships-paginated", limit],
    queryFn: ({ pageParam }) =>
      internshipService.getInternshipsPaginated(pageParam, limit),
    getNextPageParam: (lastPage: any) =>
      lastPage?.hasMore ? lastPage?.lastDoc : undefined,
    initialPageParam: undefined,
  });
};

// Hook for searching and filtering internships
export const useSearchInternships = (filters: any) => {
  // Simplified for now - just fetch all and let component filter, or use search method
  return useQuery({
    queryKey: ["search-internships", filters],
    queryFn: () => internshipService.getAllInternships(), 
    enabled: Object.keys(filters).some(
      (key) => filters[key as keyof typeof filters]
    ),
  });
};

// Hook for fetching a single internship by ID
export const useInternship = (id: string | undefined) => {
  return useQuery({
    queryKey: ["internship", id],
    queryFn: () => internshipService.getInternshipById(id as string),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual internships
  });
};

// Hook for trending internships
export const useTrendingInternships = (limit = 6) => {
  return useQuery({
    queryKey: ["trending-internships", limit],
    queryFn: () => internshipService.getTrendingInternships(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
};

// Hook for featured internships
export const useFeaturedInternships = () => {
  return useQuery({
    queryKey: ["featured-internships"],
    queryFn: internshipService.getFeaturedInternships,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for local internship data (fallback)
export const useLocalInternships = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/internships");
        if (!response.ok) {
          throw new Error("Failed to load live internships");
        }
        const jsonResponse = await response.json();
        setInternships(jsonResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadLocalData();
  }, []);

  return { internships, loading, error };
};

// Hook that tries Firebase first, falls back to local data
export const useInternshipsWithFallback = () => {
  const firebaseQuery = useInternships();
  const localQuery = useLocalInternships();

  // If Firebase is loading, show loading
  if (firebaseQuery.isLoading) {
    return {
      data: [],
      isLoading: true,
      error: null,
      source: "firebase",
    };
  }

  // If Firebase has data, use it
  if (firebaseQuery.data && firebaseQuery.data.length > 0) {
    return {
      data: firebaseQuery.data,
      isLoading: false,
      error: firebaseQuery.error,
      source: "firebase",
    };
  }

  // If Firebase failed or has no data, use local data
  return {
    data: localQuery.internships,
    isLoading: localQuery.loading,
    error: localQuery.error || firebaseQuery.error,
    source: "local",
  };
};

// Hooks for FirestoreService queries (with caching)
// These are for advanced filtering queries

export const useInternshipsByCity = (city: string, pageSize: number = 50) => {
  return useQuery({
    queryKey: ["internships-by-city", city],
    queryFn: async () => {
      const { FirestoreService } = await import("@/services/firestoreService");
      return FirestoreService.getInternshipsByCity(city, pageSize);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!city,
    retry: 2,
  });
};

export const useInternshipsBySector = (
  sector: string,
  pageSize: number = 50
) => {
  return useQuery({
    queryKey: ["internships-by-sector", sector],
    queryFn: async () => {
      const { FirestoreService } = await import("@/services/firestoreService");
      return FirestoreService.getInternshipsBySector(sector, pageSize);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!sector,
    retry: 2,
  });
};

export const useInternshipsByCompany = (
  company: string,
  pageSize: number = 50
) => {
  return useQuery({
    queryKey: ["internships-by-company", company],
    queryFn: async () => {
      const { FirestoreService } = await import("@/services/firestoreService");
      return FirestoreService.getInternshipsByCompany(company, pageSize);
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!company,
    retry: 2,
  });
};

export const useInternshipsBySkill = (skill: string, pageSize: number = 50) => {
  return useQuery({
    queryKey: ["internships-by-skill", skill],
    queryFn: async () => {
      const { FirestoreService } = await import("@/services/firestoreService");
      return FirestoreService.getInternshipsBySkill(skill, pageSize);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!skill,
    retry: 2,
  });
};

export const useInternshipsByTitle = (title: string, pageSize: number = 50) => {
  return useQuery({
    queryKey: ["internships-by-title", title],
    queryFn: async () => {
      const { FirestoreService } = await import("@/services/firestoreService");
      return FirestoreService.getInternshipsByTitle(title, pageSize);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!title,
    retry: 2,
  });
};

export default useInternships;
