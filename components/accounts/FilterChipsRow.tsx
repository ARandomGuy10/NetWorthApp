import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

export type FilterType = 'All' | 'Assets' | 'Liabilities' | 'Archived' | 'Outdated';

const BASE_FILTERS: FilterType[] = ['All', 'Assets', 'Liabilities'];

interface FilterChipsRowProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  outdatedCount: number;
  hiddenCount: number;
}

const FilterChipsRow: React.FC<FilterChipsRowProps> = ({ activeFilter, onFilterChange, outdatedCount, hiddenCount }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handlePress = (filter: FilterType) => {
    onFilterChange(filter);
  };

  const filters = [...BASE_FILTERS];
  if (hiddenCount > 0) {
    filters.push('Archived');
  }
  if (outdatedCount > 0) {
    filters.push('Outdated');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.chip, activeFilter === filter && styles.activeChip]}
            onPress={() => handlePress(filter)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeFilter === filter && styles.activeChipText]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.background.elevated,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  activeChipText: {
    color: theme.colors.text.inverse,
  },
});

export default FilterChipsRow;