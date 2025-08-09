import { Tabs, router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import CustomBottomTabBar from '../../components/ui/CustomBottomTabBar';
import { StackActions } from '@react-navigation/native';
import { useProfile, useCreateProfile } from '../../hooks/useProfile';

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { mutate: createProfile } = useCreateProfile();
  console.log('TabsLayout rendered');

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }

    if (isLoaded && isSignedIn && !isProfileLoading && profile === null) {
      createProfile();
    }
  }, [isSignedIn, isLoaded, isProfileLoading, profile]);

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
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              router.navigate('/(tabs)/accounts');
            },
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
