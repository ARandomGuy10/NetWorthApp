import { Platform, StyleSheet, View, Text, Image, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { colors, spacing, borderRadius, shadows } from '../src/styles/colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const handleDownload = () => {
    const appStoreLink = Platform.select({
      ios: 'https://apps.apple.com/app/your-app-id',
      android: 'https://play.google.com/store/apps/details?id=your.package.name',
      default: 'https://your-website.com/download'
    });
    Linking.openURL(appStoreLink);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>NetWorth</Text>
        <Link href="/(auth)/sign-in" style={styles.signInButton}>
          <Text style={styles.signInText}>Sign In</Text>
        </Link>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Track Your Net Worth</Text>
        <Text style={styles.heroSubtitle}>Monitor your financial health with our powerful net worth tracker</Text>
        
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Ionicons name="download-outline" size={20} color="white" style={styles.downloadIcon} />
          <Text style={styles.downloadText}>Download the App</Text>
        </TouchableOpacity>
        
        <View style={styles.appPreview}>
          {/* Placeholder for app screenshot */}
          <View style={styles.phoneMockup}>
            <View style={styles.phoneScreen}>
              {/* App preview content */}
              <View style={styles.chartPlaceholder} />
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$0</Text>
                  <Text style={styles.statLabel}>Net Worth</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$0</Text>
                  <Text style={styles.statLabel}>Assets</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>$0</Text>
                  <Text style={styles.statLabel}>Liabilities</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.features}>
        <Text style={styles.sectionTitle}>Why Choose NetWorth?</Text>
        
        <View style={styles.featureGrid}>
          {[
            { icon: 'trending-up', title: 'Track Progress', desc: 'Monitor your net worth over time' },
            { icon: 'shield-checkmark', title: 'Secure', desc: 'Your data is always private and encrypted' },
            { icon: 'sync', title: 'Sync Across Devices', desc: 'Access your data anywhere, anytime' },
            { icon: 'bar-chart', title: 'Detailed Insights', desc: 'Understand your financial health' },
          ].map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDesc}>{feature.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to take control of your finances?</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.ctaButtonText}>Get Started for Free</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} NetWorth App. All rights reserved.</Text>
        <View style={styles.footerLinks}>
          <Link href="/privacy" style={styles.footerLink}>Privacy Policy</Link>
          <Text style={styles.footerDivider}>•</Text>
          <Link href="/terms" style={styles.footerLink}>Terms of Service</Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  signInButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  signInText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  hero: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.text.primary,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    maxWidth: 500,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
    ...shadows.sm,
  },
  downloadIcon: {
    marginRight: spacing.sm,
  },
  downloadText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  appPreview: {
    width: '100%',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  phoneMockup: {
    width: 300,
    height: 600,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    padding: 10,
    ...shadows.lg,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 30,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  features: {
    padding: spacing.xxl,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.text.primary,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  featureCard: {
    width: (width - spacing.xxl * 2 - spacing.lg) / 2,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 150, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  ctaSection: {
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.xl,
    maxWidth: 600,
  },
  ctaButton: {
    backgroundColor: '#ffffff',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.md,
  },
  ctaButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
  },
  footerText: {
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLink: {
    color: colors.primary,
    marginHorizontal: spacing.sm,
  },
  footerDivider: {
    color: colors.text.secondary,
  },
});
