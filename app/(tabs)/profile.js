import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView } from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useSupabase } from '../../hooks/useSupabase';
import { getCurrentUserProfile, createInitialProfile } from '../../src/services/profileService';

export default function ProfileScreen() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const supabase = useSupabase();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isUserLoaded) return;

    if (!supabase) {
      setError('Failed to initialize database connection');
      setLoading(false);
      return;
    }
    if (!isSignedIn || !user) {
      setError('User not found or not signed in');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const userProfile = await getCurrentUserProfile(supabase, user.id);

        if (userProfile) {
          console.log("Profile already exists");
          setProfile(userProfile);
        } else {
          console.log("Profile does not exist, creating new profile");
          const newProfile = await createInitialProfile(
            supabase,
            user.id,
            user.emailAddresses[0].emailAddress,
            user.firstName,
            user.lastName
          );
          setProfile(newProfile);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isUserLoaded, supabase, isSignedIn, user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.email}>{user?.emailAddresses?.[0]?.emailAddress}</Text>

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
              <Text style={styles.value}>{profile.preferred_currency || 'EUR'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Member Since:</Text>
              <Text style={styles.value}>
                {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noProfile}>No profile information available</Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Go Back to Home"
            onPress={() => router.back()}
            color="#007AFF"
          />

          <View style={styles.spacer} />

          <Button
            title="Sign Out"
            onPress={handleSignOut}
            color="#FF3B30"
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
