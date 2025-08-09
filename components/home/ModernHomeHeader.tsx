// components/home/ModernHomeHeader.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { Theme } from '@/lib/supabase';

const ModernHomeHeader: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { data: profile } = useProfile();
  const styles = getStyles(theme);

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  // Get full name from first_name and last_name
  const getFullName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    if (profile?.last_name) {
      return profile.last_name;
    }
    return 'User';
  };

  // Get initials for avatar
  const getInitials = () => {
    const firstName = profile?.first_name?.charAt(0)?.toUpperCase() || '';
    const lastName = profile?.last_name?.charAt(0)?.toUpperCase() || '';
    return firstName + lastName || 'U';
  };

  // TODO: Add avatar_url field to profile schema and update this
  const avatarUrl = profile?.avatar_url; // This will be undefined until you implement it

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Left side - Profile Avatar */}
        <TouchableOpacity 
          style={styles.avatarContainer}
          onPress={() => router.push('/profile')}
        >
          {avatarUrl ? (
            <Image 
              source={{ uri: avatarUrl }} 
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getInitials()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Center - Greeting and Name */}
        <View style={styles.centerContent}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.appTitle}>
            {getFullName()}
            <Text style={styles.emoji}> 👋</Text>
          </Text>
        </View>

        {/* Right side - Notification Bell */}
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => {
            // Handle notification press
            console.log('Notifications pressed');
          }}
        >
          <Ionicons 
            name="notifications-outline" 
            size={24} 
            color={theme.colors.text.primary} 
          />
          {/* Notification badge - optional */}
          <View style={styles.notificationBadge}>
            <View style={styles.badgeDot} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sl,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.secondary,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary || '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '400',
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  emoji: {
    fontSize: 20,
  },
  currency: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
});

export default ModernHomeHeader;
