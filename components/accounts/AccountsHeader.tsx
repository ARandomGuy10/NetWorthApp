import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

interface AccountsHeaderProps {
  onAdd: () => void;
  onSort: () => void;
  onFilter: () => void;
  onMore: () => void;
}

const AccountsHeader: React.FC<AccountsHeaderProps> = ({ onAdd, onSort, onFilter, onMore }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Accounts</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onAdd} activeOpacity={0.7}>
          <Ionicons name="add" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onSort} activeOpacity={0.7}>
          <Ionicons name="swap-vertical" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onFilter} activeOpacity={0.7}>
          <Ionicons name="search" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onMore} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
});

export default AccountsHeader;