import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import FaqItem from '@/components/ui/FaqItem';

const HelpScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{
          paddingTop: theme.spacing.xl,
          paddingBottom: insets.bottom + theme.spacing.lg,
        }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <FaqItem
            question="How is my net worth calculated?"
            answer="Your net worth is the total value of your assets minus the total value of your liabilities. We use the latest balance entry for each account to perform this calculation."
          />
          <FaqItem
            question="Is my data secure?"
            answer="Absolutely. All your data is encrypted and stored securely. We use industry-standard security practices to ensure your information is always protected. You are the only one who can access your financial data."
          />
          <FaqItem
            question="How do I add a new account?"
            answer="Navigate to the 'Accounts' tab and tap the '+' button in the top right corner. You can then specify the account type (Asset or Liability) and fill in the details."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              If you can't find the answer here, please don't hesitate to reach out to our support team.
            </Text>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={() => {
                const mailtoUrl = 'mailto:networthtrackr.app@gmail.com?subject=Support Request';
                Linking.canOpenURL(mailtoUrl).then(supported => {
                  if (supported) {
                    Linking.openURL(mailtoUrl);
                  } else {
                    Alert.alert('Cannot Open Email', 'No email client is available on this device.');
                  }
                });
              }}
            >
              <Text style={styles.emailButtonText}>networthtrackr.app@gmail.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContainer: {
      paddingHorizontal: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xxl,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
    },
    contactCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    contactText: {
      fontSize: 15,
      color: theme.colors.text.secondary,
      lineHeight: 22,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    emailButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
    },
    emailButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.inverse,
    },
  });

export default HelpScreen;