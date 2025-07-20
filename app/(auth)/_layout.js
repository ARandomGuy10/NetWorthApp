import { Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, StyleSheet } from 'react-native';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';

export default function AuthLayout() {
  // Warm up the browser for OAuth flows on Android
  useWarmUpBrowser();
  
  return (
    <View style={styles.container}>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'white' },
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
