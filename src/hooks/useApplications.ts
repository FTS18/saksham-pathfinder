import { useQuery } from '@tanstack/react-query';
import ApplicationService from '@/services/applicationService';

/**
 * Hook to fetch user applications with caching
 * Caches for 5 minutes to reduce read operations
 * @param userId - User ID to fetch applications for
 * @param enabled - Whether to enable the query (default: true)
 */
export const useApplications = (
  userId: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['applications', userId],
    queryFn: () => {
      if (!userId) throw new Error('No user ID provided');
      return ApplicationService.getUserApplications(userId);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!userId && enabled,
    retry: 2,
  });
};

/**
 * Hook to fetch application count
 */
export const useApplicationCount = (
  userId: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['applications-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const applications = await ApplicationService.getUserApplications(userId);
      return applications.length;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!userId && enabled,
    retry: 2,
  });
};

/**
 * Hook to fetch applications with specific status
 */
export const useApplicationsByStatus = (
  userId: string | null,
  status: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['applications-by-status', userId, status],
    queryFn: async () => {
      if (!userId) return [];
      const applications = await ApplicationService.getUserApplications(userId);
      return applications.filter((app: any) => app.status === status);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!userId && enabled,
    retry: 2,
  });
};

export default useApplications;
