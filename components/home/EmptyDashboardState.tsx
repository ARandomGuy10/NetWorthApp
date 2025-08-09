// components/home/EmptyDashboardState.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import type { Theme } from '@/lib/supabase';

interface EmptyDashboardStateProps {
  onAddFirstAccount: () => void;
}

const EmptyDashboardState: React.FC<EmptyDashboardStateProps> = ({
  onAddFirstAccount,
}) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Illustration placeholder - you can replace with your desired illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationPlaceholder}>
            <Text style={styles.illustrationEmoji}>💰</Text>
          </View>
        </View>

        {/* Welcome message */}
        <View style={styles.textContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Your Financial Dashboard</Text>
          <Text style={styles.welcomeSubtitle}>
            Start tracking your financial journey by adding your first account. 
            Connect your bank accounts, credit cards, or investments to get a complete 
            view of your finances.
          </Text>
        </View>

        {/* Call to Action Button */}
        <TouchableOpacity 
          style={styles.ctaButton} 
          onPress={onAddFirstAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Add Your First Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  illustrationContainer: {
    marginBottom: 32,
  },
  illustrationPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
  },
  illustrationEmoji: {
    fontSize: 48,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: theme.colors.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default EmptyDashboardState;
