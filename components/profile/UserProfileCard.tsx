import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import ProfileCompletionRing from './ProfileCompletionRing';

interface UserProfileCardProps {
  onPress?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ onPress }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { data: profile, isLoading } = useProfile();

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    let score = 0;
    const totalPoints = 3; // Focus on core, non-preference fields

    if (profile.first_name && profile.first_name.trim() !== '') score++;
    if (profile.last_name && profile.last_name.trim() !== '') score++;
    if (profile.avatar_url) score++;

    return score / totalPoints;
  }, [profile]);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return `${f}${l}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return null; // Or show an error/empty state
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[theme.colors.background.secondary, theme.colors.background.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ProfileCompletionRing
          size={84} // Outer size of the ring
          strokeWidth={5}
          progress={profileCompletion}
        >
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarInitials}>
                <Text style={styles.initialsText}>{getInitials(profile.first_name, profile.last_name)}</Text>
              </View>
            )}
          </View>
        </ProfileCompletionRing>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{fullName || 'Anonymous User'}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <Text style={styles.actionText}>View & Edit Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={theme.colors.text.tertiary} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  loadingContainer: {
    justifyContent: 'center',
    height: 104, // Approximate height of the card
  },
  avatarContainer: {
    // marginRight is now handled by the parent container's padding
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarInitials: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: theme.colors.text.secondary,
    fontSize: 24,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  actionText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '500',
  },
});

export default UserProfileCard;