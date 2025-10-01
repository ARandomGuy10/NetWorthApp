import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {Theme} from '@/lib/supabase';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionText?: string;
  onActionPress?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({icon, title, message, actionText, onActionPress}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={52} color={theme.colors.text.tertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {actionText && onActionPress && (
        <TouchableOpacity style={styles.actionButton} onPress={onActionPress}>
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
      paddingHorizontal: theme.spacing.xxl,
    },
    iconContainer: {
      marginBottom: theme.spacing.xl,
      opacity: 0.8,
    },
    title: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '700',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: theme.spacing.xxl,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    actionButtonText: {
      color: theme.colors.text.onPrimary,
      fontSize: theme.fontSizes.button,
      fontWeight: '600',
    },
  });

export default EmptyState;
