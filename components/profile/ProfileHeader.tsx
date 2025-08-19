import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfileHeaderProps {
  onSettingsPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onSettingsPress }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.sm, paddingBottom: theme.spacing.md }]}>
      <View style={styles.placeholder} />
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Settings</Text>
      </View>
      <TouchableOpacity style={styles.iconContainer} onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={24} color={theme.colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.primary,
  },
  placeholder: {
    width: 32, // to balance the right icon container
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  iconContainer: {
    width: 32,
    alignItems: 'flex-end',
  },
});

export default ProfileHeader;