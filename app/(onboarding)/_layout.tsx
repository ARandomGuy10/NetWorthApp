import {Stack} from 'expo-router';

export default function OnboardingLayout() {
  // This layout is protected by the root layout's auth boundary.
  // It renders its children without any additional UI (like a tab bar).
  return <Stack screenOptions={{headerShown: false}} />;
}
