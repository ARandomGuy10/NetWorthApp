import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,           // Data never becomes stale automatically
      gcTime: 1000 * 60 * 10,       // Keep cache for 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,   // No refetch when app comes to foreground
      refetchOnMount: false,         // No refetch when component mounts
      refetchOnReconnect: false,     // No refetch when internet reconnects
      refetchInterval: false,        // No periodic refetching
    },
  },
});
