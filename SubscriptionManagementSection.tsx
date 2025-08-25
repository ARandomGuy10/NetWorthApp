import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { useSubscription } from '@/hooks/providers/SubscriptionProvider';
import { Ionicons } from '@expo/vector-icons';

const SubscriptionManagementSection = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { proEntitlement } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      await Purchases.showManageSubscriptions();
    } catch (e: any) {
      console.error('Error opening subscription management:', e);
      Alert.alert('Error', 'Could not open subscription management page. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getFormattedDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusLabel = () => {
    if (proEntitlement?.willRenew) {
      return 'Renews on:';
    }
    if (proEntitlement?.expirationDate) {
      return 'Expires on:';
    }
    return 'Status:';
  };

  const getStatusValue = () => {
    if (proEntitlement?.expirationDate) {
      return getFormattedDate(proEntitlement.expirationDate);
    }
    return 'Lifetime';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="diamond" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>You are a Pro Member</Text>
      </View>
      <Text style={styles.subtitle}>
        Thank you for supporting NetWorthTrackr! You have access to all premium features.
      </Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{getStatusLabel()}</Text>
        <Text style={styles.infoValue}>{getStatusValue()}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleManageSubscription}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.text.onPrimary} />
        ) : (
          <Text style={styles.buttonText}>Manage Subscription</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border.primary,
      marginBottom: theme.spacing.lg,
    },
    infoLabel: {
      fontSize: 15,
      color: theme.colors.text.secondary,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text.onPrimary,
    },
  });

export default SubscriptionManagementSection;