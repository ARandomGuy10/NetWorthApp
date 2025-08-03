import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Button, 
  ActivityIndicator, 
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { useProfile } from '../../../hooks/useProfile';
import { formatDate } from '@/utils/utils';

export default function ProfileScreen() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  
  console.log('Inside ProfileScreen');
  
  const { data: profile, isLoading, error } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={[styles.scrollContainer, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ScrollView>
    );
  }

  // Error state
  if (error) {
    return (
      <ScrollView contentContainerStyle={[styles.scrollContainer, styles.center]}>
        <Text style={styles.errorText}>Error loading profile</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.email}>
          {user?.emailAddresses?.[0]?.emailAddress}
        </Text>

        {profile ? (
          <View style={styles.profileCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>
                {profile.first_name || 'Not set'} {profile.last_name || ''}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Preferred Currency:</Text>
              <Text style={styles.value}>
                {profile.preferred_currency || 'EUR'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Theme:</Text>
              <Text style={styles.value}>
                {profile.theme || 'DARK'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Member Since:</Text>
              <Text style={styles.value}>
                {formatDate(profile.created_at)}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noProfile}>
            No profile information available
          </Text>
        )}

        {/* Edit Profile Button */}
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/(tabs)/profile/edit')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            color="#FF3B30"
          />
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            title="Back"
            onPress={() => router.back()}
            color="#007AFF"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f6fa',
    paddingVertical: 30,
  },
  container: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#f0f4f8',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  value: {
    fontSize: 16,
    color: '#666',
  },
  noProfile: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#777',
    marginBottom: 25,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  spacer: {
    height: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
