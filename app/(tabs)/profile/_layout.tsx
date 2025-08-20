import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Profile',
          headerShown: false,
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="edit"
        options={{ 
          presentation: 'modal',
          headerShown: false,
          title: 'Edit Profile' 
        }} 
      />
    </Stack>
  );
}
