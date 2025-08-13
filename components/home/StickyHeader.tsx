import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { useProfile } from '@/hooks/useProfile';

interface StickyHeaderProps {
  onNotificationPress?: () => void;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ 
  onNotificationPress = () => console.log('Notifications pressed') 
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { data: profile } = useProfile();
  const insets = useSafeAreaInsets();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const getInitials = () => {
    const firstName = profile?.first_name?.charAt(0)?.toUpperCase() || '';
    const lastName = profile?.last_name?.charAt(0)?.toUpperCase() || '';
    return firstName + lastName || 'U';
  };

  const styles = getStyles(theme, insets);

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => router.push('/profile')} 
          style={styles.avatarContainer}
        >
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingText, { color: theme.colors.text.secondary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            {profile?.first_name ?? 'User'} 👋
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: theme.colors.background.secondary }]}
          onPress={onNotificationPress}
        >
          <Ionicons 
            name="notifications-outline" 
            size={20} 
            color={theme.colors.text.primary} 
          />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: any, insets: any) => StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.primary,
    paddingTop: insets.top,
    paddingBottom: 16,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  userName: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  sectionsContainer: {
    paddingHorizontal: 16,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
  },
});

export default StickyHeader;
