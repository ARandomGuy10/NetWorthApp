import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

interface StatusShelfProps {
  outdatedCount: number;
  remindAfterDays: number;
  onView: () => void;
}

const StatusShelf: React.FC<StatusShelfProps> = ({ outdatedCount, remindAfterDays, onView }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (outdatedCount === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="warning-outline" size={20} color={theme.colors.warning} />
      <Text style={styles.text}>
        {outdatedCount} {outdatedCount > 1 ? 'balances' : 'balance'} outdated (&gt;{remindAfterDays}d)
      </Text>
      <TouchableOpacity onPress={onView} activeOpacity={0.7}>
        <Text style={styles.viewText}>View</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
    gap: theme.spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  viewText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});

export default StatusShelf;