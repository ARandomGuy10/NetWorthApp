import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

// Group search-related props for better organization
interface SearchProps {
  isVisible: boolean;
  query: string;
  setQuery: (query: string) => void;
  onOpen: () => void;
  onClose: () => void;
}

interface AccountsHeaderProps {
  onAdd: () => void;
  onSort: () => void;
  onMore: () => void;
  search: SearchProps;
}

const AccountsHeader: React.FC<AccountsHeaderProps> = ({
  onAdd,
  onSort,
  onMore,
  search,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      {search.isVisible ? (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search accounts..."
            placeholderTextColor={theme.colors.text.secondary}
            value={search.query}
            onChangeText={search.setQuery}
            autoFocus
          />
        </View>
      ) : (
        <Text style={styles.headerTitle}>Accounts</Text>
      )}
      <View style={styles.actionsContainer}>
        {search.isVisible ? (
          <TouchableOpacity style={styles.actionButton} onPress={search.onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.actionButton} onPress={onAdd} activeOpacity={0.7}>
              <Ionicons name="add" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onSort} activeOpacity={0.7}>
              <Ionicons name="swap-vertical" size={22} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={search.onOpen} activeOpacity={0.7}>
              <Ionicons name="search" size={22} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onMore} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </>
        )}
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: theme.colors.text.primary,
    fontSize: 16,
    marginLeft: theme.spacing.md,
  },
  searchIcon: {
    // Style for search icon inside the text input container
  },
});

export default AccountsHeader;
