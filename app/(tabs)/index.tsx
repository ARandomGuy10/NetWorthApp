import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';

export default function HomeTab() {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Pocketrackr</Text>
      {user && (
        <Text style={styles.subtitle}>Hello, {user.emailAddresses[0]?.emailAddress}!</Text>
      )}
      <Text style={styles.description}>
        Your personal finance tracker is ready to use.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
});