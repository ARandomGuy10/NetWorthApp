import {Stack} from 'expo-router';
import {useTheme} from '@/src/styles/theme/ThemeContext';

export default function ProfileLayout() {
  const {theme} = useTheme();

  return (
    <Stack
      screenOptions={{
        // Default to showing the header. Screens that manage their own can opt-out.
        headerShown: true,
        contentStyle: {backgroundColor: theme.colors.background.primary},
        headerBackTitle: 'Profile',
        headerStyle: {backgroundColor: theme.colors.background.primary},
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {fontWeight: '600'},
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
          headerShown: true,
          title: 'Help & Support',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          headerShown: true,
          title: 'About',
        }}
      />
      <Stack.Screen
        name="privacy"
        options={{
          headerShown: true,
          title: 'Privacy Policy',
        }}
      />
      <Stack.Screen
        name="terms"
        options={{
          headerShown: true,
          title: 'Terms of Use',
        }}
      />
    </Stack>
  );
}
