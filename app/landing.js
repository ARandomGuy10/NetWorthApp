import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Image,
  Platform 
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../src/styles/colors';

const { width, height } = Dimensions.get('window');

export default function LandingPage() {
  const handleGetStarted = () => {
    router.push('/(auth)/sign-up');
  };

  const handleLogin = () => {
    router.push('/(auth)/sign-in');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Navigation */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
          </View>
          <Text style={styles.logoText}>pocketrackr</Text>
        </View>
        
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Features</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>Pricing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Text style={styles.navText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={handleLogin}>
            <Text style={styles.navText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Track Your Wealth,{'\n'}
            Visualize Your Growth
          </Text>
          
          <Text style={styles.heroSubtitle}>
            The smart way for young professionals to{'\n'}
            monitor their net worth and achieve financial goals
          </Text>
          
          <TouchableOpacity style={styles.downloadButton} onPress={handleGetStarted}>
            <Text style={styles.downloadButtonText}>Download Now</Text>
          </TouchableOpacity>
        </View>

        {/* App Preview Mockup */}
        <View style={styles.appPreview}>
          {/* Placeholder for app screenshot */}
          <View style={styles.phoneMockup}>
            <View style={styles.phoneHeader}>
              <View style={styles.logoIconSmall}>
                <Ionicons name="trending-up" size={16} color={colors.primary} />
              </View>
              <Text style={styles.phoneLogoText}>pocketrackr</Text>
            </View>
            
            <View style={styles.phoneButtons}>
              <View style={styles.phoneButton}>
                <Text style={styles.phoneButtonText}>Add Asset</Text>
              </View>
              <View style={styles.phoneButton}>
                <Text style={styles.phoneButtonText}>Add Liability</Text>
              </View>
              <View style={styles.phoneButton}>
                <Text style={styles.phoneButtonText}>Set Goal</Text>
              </View>
            </View>

            <Text style={styles.phoneNetWorth}>$127,842</Text>
            
            {/* Chart placeholder */}
            <View style={styles.phoneChart}>
              <View style={styles.chartLine} />
              <Text style={styles.chartPlaceholder}>
                [PLACEHOLDER: Net Worth Chart Image]
              </Text>
            </View>

            <View style={styles.phoneBreakdown}>
              <Text style={styles.breakdownTitle}>Assets Breakdown</Text>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Investments</Text>
                <Text style={styles.breakdownValue}>$78,900</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Property</Text>
                <Text style={styles.breakdownValue}>$28,900</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Cash</Text>
                <Text style={styles.breakdownValue}>$12,700</Text>
              </View>

              <Text style={[styles.breakdownTitle, { marginTop: spacing.lg }]}>Liabilities Breakdown</Text>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Mortgage</Text>
                <Text style={styles.breakdownValue}>$88,000</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Loans</Text>
                <Text style={styles.breakdownValue}>$14,500</Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>Credit Cards</Text>
                <Text style={styles.breakdownValue}>$3,300</Text>
              </View>

              <View style={styles.goalSection}>
                <Text style={styles.breakdownTitle}>Goal Tracking</Text>
                <Text style={styles.goalLabel}>House Down Payment</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '68%' }]} />
                </View>
                <Text style={styles.progressText}>68%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="trending-up" size={32} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Real-time{'\n'}Net Worth{'\n'}Tracking</Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="bar-chart" size={32} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Comprehensive{'\n'}Asset/Liability{'\n'}Breakdown</Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="target" size={32} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Goal Tracking{'\n'}& Progress</Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to take control of your financial future?</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={handleGetStarted}>
          <Text style={styles.ctaButtonText}>Start Tracking Today</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 PocketRackr. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingTop: Platform.OS === 'web' ? spacing.xl : spacing.lg,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  navItem: {
    paddingVertical: spacing.sm,
  },
  navText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background.primary,
  },
  heroSection: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.xxxl,
  },
  heroContent: {
    flex: Platform.OS === 'web' ? 1 : 0,
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 48 : 36,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
    marginBottom: spacing.xl,
    lineHeight: Platform.OS === 'web' ? 56 : 44,
  },
  heroSubtitle: {
    fontSize: 18,
    color: colors.text.secondary,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
    marginBottom: spacing.xxxl,
    lineHeight: 26,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  downloadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background.primary,
  },
  appPreview: {
    flex: Platform.OS === 'web' ? 1 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneMockup: {
    width: Platform.OS === 'web' ? 350 : width * 0.8,
    height: Platform.OS === 'web' ? 700 : 600,
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border.primary,
    ...shadows.lg,
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  phoneLogoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  phoneButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  phoneButton: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  phoneButtonText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  phoneNetWorth: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  phoneChart: {
    height: 80,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chartLine: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  chartPlaceholder: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  phoneBreakdown: {
    flex: 1,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  breakdownLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  goalSection: {
    marginTop: spacing.lg,
  },
  goalLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.background.tertiary,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'right',
  },
  featuresSection: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    gap: spacing.xxxl,
    justifyContent: 'center',
  },
  featureItem: {
    alignItems: 'center',
    flex: Platform.OS === 'web' ? 1 : 0,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 24,
  },
  ctaSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});