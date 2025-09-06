import {Stack} from 'expo-router';
import {useTheme} from '@/src/styles/theme/ThemeContext';

export default function AnalyticsLayout() {
  const {theme} = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.background.primary,
        },
        headerTintColor: theme.colors.text.primary,
        headerTitleStyle: {
          color: theme.colors.text.primary,
          fontWeight: '600',
        },
      }}>
      <Stack.Screen name="index" options={{title: 'Analytics'}} />
      <Stack.Screen name="performance" options={{title: 'Performance Overview'}} />
      <Stack.Screen name="monthly-changes" options={{title: 'Monthly Changes'}} />
      <Stack.Screen name="accounts" options={{title: 'Account Analysis'}} />
      <Stack.Screen name="categories" options={{title: 'Category Breakdown'}} />
      <Stack.Screen name="currency" options={{title: 'Currency Exposure'}} />
      <Stack.Screen name="achievements" options={{title: 'Achievements'}} />
    </Stack>
  );
}
