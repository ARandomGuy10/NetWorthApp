import { Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, Text } from 'react-native';
import CustomBottomTabBar from '../../components/ui/CustomBottomTabBar'; // Import the new CustomBottomTabBar

/**
 * Tabs layout component that shows the main app navigation.
 * This is a protected route - only accessible to authenticated users.
 */
export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  console.log('Inside TabsLayout - IsSignedIn', isSignedIn);
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      console.log('User not signed in, redirecting to /(auth)/sign-in');
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded]);

  // Show loading state while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Render the tab navigator for authenticated users
  return (
    <Tabs 
      tabBar={(props) => <CustomBottomTabBar {...props} />} // Use the custom CustomBottomTabBar
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Explicitly hide all tab bar labels
      }}
    >
      <Tabs.Screen 
        name="home" 
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
