import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDatabaseTest } from '../../lib/database-test';
import { useState } from 'react';

export default function HomeScreen() {
  const { runTest } = useDatabaseTest();
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleTestDatabase = async () => {
    setTesting(true);
    try {
      const results = await runTest();
      setTestResults(results);
      
      const allPassed = Object.values(results).filter(v => typeof v === 'boolean').every(result => result === true);
      Alert.alert(
        'Database Test Complete',
        allPassed ? 'All tests passed! ✅' : 'Some tests failed. Check console for details. ❌'
      );
    } catch (error) {
      Alert.alert('Test Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Pocketrackr</Text>
        <Text style={styles.subtitle}>Track your expenses and manage your budget</Text>
        
        <TouchableOpacity 
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={handleTestDatabase}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>
            {testing ? 'Testing Database...' : 'Test Database Schema'}
          </Text>
        </TouchableOpacity>

        {testResults && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results:</Text>
            <Text style={[styles.resultItem, testResults.exchange_rates && styles.resultSuccess]}>
              Exchange Rates: {testResults.exchange_rates ? '✅' : '❌'}
            </Text>
            <Text style={[styles.resultItem, testResults.accounts && styles.resultSuccess]}>
              Accounts: {testResults.accounts ? '✅' : '❌'}
            </Text>
            <Text style={[styles.resultItem, testResults.balance_entries && styles.resultSuccess]}>
              Balance Entries: {testResults.balance_entries ? '✅' : '❌'}
            </Text>
            <Text style={[styles.resultItem, testResults.user_preferences && styles.resultSuccess]}>
              User Preferences: {testResults.user_preferences ? '✅' : '❌'}
            </Text>
            <Text style={[styles.resultItem, testResults.auth && styles.resultSuccess]}>
              Authentication: {testResults.auth ? '✅' : '❌'}
            </Text>
            {testResults.error && (
              <Text style={styles.errorText}>Error: {testResults.error}</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  testButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultItem: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  resultSuccess: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
