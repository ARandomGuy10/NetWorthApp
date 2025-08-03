import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SmartMutationConfig<T> {
  mutationFn: (data: T) => Promise<any>;
  invalidateQueries?: string[]; // Just specify which domains to refresh
  onSuccess?: () => void;
}

export const useSmartMutation = <T>({ 
  mutationFn, 
  invalidateQueries = [], 
  onSuccess 
}: SmartMutationConfig<T>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn,
    onSuccess: () => {
      // Automatically invalidate based on domain names
      invalidateQueries.forEach(domain => {
        switch (domain) {
          case 'accounts':
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            break;
          case 'dashboard':
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            break;
          case 'profile':
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            break;
          case 'analytics':
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
            break;
        }
      });
      
      onSuccess?.();
    },
  });
};
