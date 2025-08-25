import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FontAwesome5 name="wallet" size={80} color="#4CAF50" />
        <Text style={styles.title}>NetWorthTrackr</Text>
        <Text style={styles.subtitle}>Track Your Wealth. See Your Progress.</Text>
        <View style={styles.chart}>
          {/* Placeholder for chart */}
        </View>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={[styles.buttonText, styles.buttonOutlineText]}>Log In</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <FontAwesome5 name="chart-line" size={24} color="#4CAF50" />
          <Text style={styles.footerText}>Track</Text>
        </View>
        <View style={styles.footerItem}>
          <FontAwesome5 name="shield-alt" size={24} color="#4CAF50" />
          <Text style={styles.footerText}>Secure</Text>
        </View>
        <View style={styles.footerItem}>
          <FontAwesome5 name="mobile-alt" size={24} color="#4CAF50" />
          <Text style={styles.footerText}>Simple</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#A9A9A9',
    marginTop: 10,
    marginBottom: 40,
  },
  chart: {
    width: '100%',
    height: 150,
    // backgroundColor: '#1E1E1E', // Placeholder
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 120,
    borderRadius: 30,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  buttonOutlineText: {
    color: '#4CAF50',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerText: {
    color: '#A9A9A9',
    marginTop: 5,
  },
});

export default WelcomeScreen;
