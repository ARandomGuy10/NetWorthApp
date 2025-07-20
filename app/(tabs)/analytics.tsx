import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Settings } from 'lucide-react-native';

export default function Analytics() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>PocketRackr</Text>
            <Text style={styles.pageTitle}>Analytics</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>Analytics Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Advanced analytics and insights will be available in the next update.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  settingsButton: {
    padding: 8,
    marginTop: 8,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});