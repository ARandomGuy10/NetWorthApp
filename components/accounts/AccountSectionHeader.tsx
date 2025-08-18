import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

interface AccountSectionHeaderProps {
  title: string;
  count: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAdd: () => void;
}

const AccountSectionHeader: React.FC<AccountSectionHeaderProps> = ({ 
  title, 
  count, 
  isCollapsed, 
  onToggleCollapse, 
  onAdd, 
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.leftSection} onPress={onToggleCollapse} activeOpacity={0.8}>
        <Ionicons 
          name={isCollapsed ? 'chevron-forward' : 'chevron-down'} 
          size={20} 
          color={theme.colors.text.secondary} 
        />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.count}>({count})</Text>
      </TouchableOpacity>
      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.actionButton} onPress={onAdd} activeOpacity={0.7}>
          <Text style={styles.actionText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  count: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

export default AccountSectionHeader;