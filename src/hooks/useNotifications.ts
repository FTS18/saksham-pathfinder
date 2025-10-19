import { useQuery } from "@tanstack/react-query";
import { NotificationService } from "@/services/notificationService";

/**
 * Hook to fetch user notifications with caching
 * Caches for 2 minutes to reduce read operations
 * @param userId - User ID to fetch notifications for
 * @param limitCount - Maximum number of notifications to fetch (default: 50)
 * @param enabled - Whether to enable the query (default: true)
 */
export const useNotifications = (
  userId: string | null,
  limitCount: number = 50,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => {
      if (!userId) throw new Error("No user ID provided");
      return NotificationService.getUserNotifications(userId, limitCount);
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in memory for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!userId && enabled,
    retry: 1, // Only retry once for notifications
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch and track unread notifications
 * Only fetches when user has notifications enabled
 */
export const useUnreadNotificationCount = (
  userId: string | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["unread-notifications-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const notifications = await NotificationService.getUserNotifications(
        userId,
        100
      );
      return notifications.filter((n: any) => !n.read).length;
    },
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 3 * 60 * 1000, // Refetch every 3 minutes
    enabled: !!userId && enabled,
    retry: 1,
  });
};

export default useNotifications;
