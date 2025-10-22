import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import InternshipMigrationService, {
  FirebaseInternship,
} from "@/services/internshipMigrationService";

// Hook for getting all internships
export const useInternships = () => {
  return useQuery({
    queryKey: ["internships"],
    queryFn: InternshipMigrationService.getAllInternships,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for paginated internships (DEFAULT: Load only 12 at a time)
export const useInternshipsPaginated = (limit: number = 12) => {
  return useInfiniteQuery({
    queryKey: ["internships-paginated", limit],
    queryFn: ({ pageParam }) =>
      InternshipMigrationService.getInternshipsPaginated(limit, pageParam),
    getNextPageParam: (lastPage: any) =>
      lastPage?.hasMore ? lastPage?.lastDoc : undefined,
    initialPageParam: null,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook for searching internships
export const useSearchInternships = (filters: {
  location?: string;
  sector?: string;
  skills?: string[];
  company?: string;
  workMode?: string;
  stipendRange?: { min: number; max: number };
  searchQuery?: string;
}) => {
  return useQuery({
    queryKey: ["search-internships", filters],
    queryFn: () => InternshipMigrationService.searchInternships(filters),
    enabled: Object.keys(filters).some(
      (key) => filters[key as keyof typeof filters]
    ),
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,
  });
};

// Hook for getting a single internship
export const useInternship = (id: string) => {
  return useQuery({
    queryKey: ["internship", id],
    queryFn: () => InternshipMigrationService.getInternshipById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual internships
    gcTime: 15 * 60 * 1000,
  });
};

// Hook for trending internships
export const useTrendingInternships = (limit: number = 10) => {
  return useQuery({
    queryKey: ["trending-internships", limit],
    queryFn: () => InternshipMigrationService.getTrendingInternships(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
};

// Hook for featured internships
export const useFeaturedInternships = () => {
  return useQuery({
    queryKey: ["featured-internships"],
    queryFn: InternshipMigrationService.getFeaturedInternships,
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
        const response = await fetch("/internships.json");
        if (!response.ok) {
          throw new Error("Failed to load local internships");
        }
        const data = await response.json();
        setInternships(data);
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
