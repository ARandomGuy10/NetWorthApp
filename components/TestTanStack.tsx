// components/TestTanStack.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '../hooks/useSupabase';
import { useUser } from '@clerk/clerk-expo';

export default function TestTanStack() {
    console.log('TestTanStack rendered');
  const { user, isLoaded } = useUser();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  
  // Test query
  const { data, isLoading, error } = useQuery({
    queryKey: ['test-connection'],
    queryFn: async () => {
      console.log('🔥 Testing TanStack + Supabase connection');
      const { data, error } = await supabase.from('accounts').select('count');
      if (error) throw error;
      return data;
    },
    enabled: isLoaded && !!user,
  });
  
  // Test mutation
  const testMutation = useMutation({
    mutationFn: async () => {
      console.log('🔥 Testing mutation');
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ Mutation successful - invalidating cache');
      queryClient.invalidateQueries({ queryKey: ['test-connection'] });
    },
  });
  
  if (!isLoaded) return <Text>Loading Clerk...</Text>;
  if (!user) return <Text>Please sign in</Text>;
  
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>TanStack Test</Text>
      
      <Text>Status: {isLoading ? 'Loading...' : 'Ready'}</Text>
      <Text>Error: {error ? error.message : 'None'}</Text>
      <Text>Data: {data ? 'Connected ✅' : 'No data'}</Text>
      
      <TouchableOpacity
        onPress={() => testMutation.mutate()}
        disabled={testMutation.isPending}
        style={{ 
          backgroundColor: 'green', 
          padding: 15, 
          borderRadius: 8,
          marginTop: 20 
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {testMutation.isPending ? 'Testing...' : 'Test Mutation'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
