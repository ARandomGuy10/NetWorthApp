import {Stack} from 'expo-router';
import {useTheme} from '@/src/styles/theme/ThemeContext';

export default function ProfileLayout() {
  const {theme} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Screens manage their own headers
        contentStyle: {backgroundColor: 'transparent'},
        headerBackTitle: 'Profile',
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          title: 'Help & Support',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: 'About',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          title: 'Privacy Policy',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          title: 'Terms of Use',
        }}
      />
    </Stack>
  );
}
