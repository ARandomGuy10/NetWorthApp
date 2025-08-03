import { Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import CustomBottomTabBar from '../../components/ui/CustomBottomTabBar';

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  console.log('TabsLayout rendered');

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded]);

  // Show loading while auth loads
  if (!isLoaded || !isSignedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

   // Don't render tabs if user is not signed in
   if (!isSignedIn) {
    return null; // Redirect is happening
  }

  // Remove the context providers - use TanStack Query instead
  return (
    <Tabs
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
     <Tabs.Screen 
          name="dashboard" 
          options={{
            title: undefined,
          }}
        />
        <Tabs.Screen 
          name="accounts" 
          options={{
            title: undefined,
          }}
        />
        <Tabs.Screen 
          name="analytics" 
          options={{
            title: undefined,
          }}
        />
        <Tabs.Screen 
          name="profile" 
          options={{
            title: undefined,
          }}
        />
    </Tabs>
  );
}
