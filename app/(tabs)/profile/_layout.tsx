import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Profile',
          headerShown: true,
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          presentation: 'modal',
          title: 'Edit Profile' 
        }} 
      />
      {/* <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerBackTitle: 'Profile'
        }} 
      /> */}
    </Stack>
  );
}
