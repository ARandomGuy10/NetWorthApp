import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  PACKAGE_TYPE,
  PRODUCT_CATEGORY,
  PRODUCT_TYPE,
  PresentedOfferingContext,
  PurchasesStoreProduct,
} from 'react-native-purchases';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '@/hooks/providers/ToastProvider';
import { useSubscription } from '@/hooks/providers/SubscriptionProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaywallFeature {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string; // Optional color for specific features
}

const AnimatedEntrance = ({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};

const MOCK_PRESENTED_OFFERING_CONTEXT: PresentedOfferingContext = {
  offeringIdentifier: 'current',
  placementIdentifier: null,
  targetingContext: null,
};

// --- Mock Data for Development ---
// This allows UI development without a live RevenueCat connection.
const MOCK_PRODUCTS: { [key: string]: PurchasesStoreProduct } = {
  monthly: {
    identifier: 'pro_monthly_mock',
    description: 'Unlock all premium features',
    title: 'Pro Monthly',
    price: 9.99,
    priceString: '$9.99',
    currencyCode: 'USD',
    discounts: [],
    introPrice: null,
    subscriptionPeriod: 'P1M',
    productCategory: PRODUCT_CATEGORY.SUBSCRIPTION,
    productType: PRODUCT_TYPE.AUTO_RENEWABLE_SUBSCRIPTION,
    pricePerWeek: null,
    pricePerMonth: null,
    pricePerYear: null,
    pricePerWeekString: null,
    pricePerMonthString: null,
    pricePerYearString: null,
    defaultOption: null,
    subscriptionOptions: [],
    presentedOfferingIdentifier: 'current',
    presentedOfferingContext: MOCK_PRESENTED_OFFERING_CONTEXT,
  },
  annual: {
    identifier: 'pro_annual_mock',
    description: 'Unlock all features for a year',
    title: 'Pro Annual',
    price: 69.99,
    priceString: '$69.99',
    currencyCode: 'USD',
    discounts: [],
    introPrice: null,
    subscriptionPeriod: 'P1Y',
    productCategory: PRODUCT_CATEGORY.SUBSCRIPTION,
    productType: PRODUCT_TYPE.AUTO_RENEWABLE_SUBSCRIPTION,
    pricePerWeek: null,
    pricePerMonth: null,
    pricePerYear: null,
    pricePerWeekString: null,
    pricePerMonthString: null,
    pricePerYearString: null,
    defaultOption: null,
    subscriptionOptions: [],
    presentedOfferingIdentifier: 'current',
    presentedOfferingContext: MOCK_PRESENTED_OFFERING_CONTEXT,
  },
};

const DEFAULT_FEATURES: PaywallFeature[] = [
  { icon: 'analytics-outline', text: 'Advanced Analytics & Reports' },
  { icon: 'cloud-upload-outline', text: 'CSV Data Import & Export' },
  { icon: 'color-palette-outline', text: 'Exclusive App Themes' },
  { icon: 'infinite-outline', text: 'Unlimited Accounts' },
];

const monthlyMockPackage: PurchasesPackage = {
  identifier: 'monthly',
  packageType: PACKAGE_TYPE.MONTHLY,
  product: MOCK_PRODUCTS.monthly,
  offeringIdentifier: 'current',
  presentedOfferingContext: MOCK_PRESENTED_OFFERING_CONTEXT,
};

const annualMockPackage: PurchasesPackage = {
  identifier: 'annual',
  packageType: PACKAGE_TYPE.ANNUAL,
  product: MOCK_PRODUCTS.annual,
  offeringIdentifier: 'current',
  presentedOfferingContext: MOCK_PRESENTED_OFFERING_CONTEXT,
};

const MOCK_OFFERING: PurchasesOffering = {
  identifier: 'current',
  serverDescription: 'Default Mock Offering',
  availablePackages: [monthlyMockPackage, annualMockPackage],
  monthly: monthlyMockPackage,
  annual: annualMockPackage,
  lifetime: null,
  sixMonth: null,
  threeMonth: null,
  twoMonth: null,
  weekly: null,
  metadata: {
    title: 'Unlock Pro (Mock)',
    features: DEFAULT_FEATURES, // You can also mock features from metadata
  },
};
const PaywallScreen = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { showToast } = useToast();
  const { isPro } = useSubscription();
  const insets = useSafeAreaInsets();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [features, setFeatures] = useState<PaywallFeature[]>(DEFAULT_FEATURES);
  const [bestValuePackage, setBestValuePackage] = useState<PurchasesPackage | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [savings, setSavings] = useState<number | null>(null);
  const [paywallTitle, setPaywallTitle] = useState('Unlock Pro');
  const [paywallSubtitle, setPaywallSubtitle] = useState(
    'Upgrade to NetWorthTrackr Pro to take full control of your finances.'
  );

  useEffect(() => {
    const getOfferings = async () => {
      setIsLoading(true);
      let currentOffering: PurchasesOffering | null = null;

      try {
        const offerings = await Purchases.getOfferings();
        currentOffering = offerings.current;
      } catch (e) {
        console.error('Error fetching offerings:', e);
        // Don't alert here; let the fallback logic below handle it.
      }

      // If no offering is found or an error occurred, and we're in dev mode, use mock data.
      if (!currentOffering || currentOffering.availablePackages.length === 0) {
        if (__DEV__) {
          console.log('[Paywall] No offerings found or fetch failed. Using mock data for development.');
          currentOffering = MOCK_OFFERING;
        } else {
          Alert.alert('Error', 'Could not fetch subscription plans. Please try again later.');
          setIsLoading(false);
          return; // Exit if in production and no offerings are available.
        }
      }

      if (currentOffering) {
        setOffering(currentOffering);

        // Process metadata
        const { metadata } = currentOffering;
        if (metadata.title && typeof metadata.title === 'string') setPaywallTitle(metadata.title);
        if (metadata.subtitle && typeof metadata.subtitle === 'string') setPaywallSubtitle(metadata.subtitle);
        if (metadata.features && Array.isArray(metadata.features)) setFeatures(metadata.features);

        // Calculate savings and find best value
        const annual = currentOffering.availablePackages.find((p) => p.packageType === PACKAGE_TYPE.ANNUAL);
        const monthly = currentOffering.availablePackages.find((p) => p.packageType === PACKAGE_TYPE.MONTHLY);

        if (annual?.product && monthly?.product) {
          setBestValuePackage(annual);
          setSelectedPackage(annual);
          const annualPrice = annual.product.price;
          const monthlyPrice = monthly.product.price;
          if (monthlyPrice > 0) { const savingsPercentage = Math.round((1 - annualPrice / 12 / monthlyPrice) * 100); setSavings(savingsPercentage); }
        } else if (annual) {
          setBestValuePackage(annual);
          setSelectedPackage(annual);
        } else if (monthly) {
          // Fallback to selecting monthly if no annual package is available
          setSelectedPackage(monthly);
        }
      }
      setIsLoading(false);
    };
    getOfferings();
  }, []);

  useEffect(() => {
    // If user becomes pro while on this screen, navigate back.
    if (isPro) {
      showToast('Upgrade Successful!', 'success', { text: 'Welcome to Pro!' });
      router.back();
    }
  }, [isPro, router, showToast]);

  const handlePurchase = async (pack: PurchasesPackage) => {
    setIsPurchasing(true);
    Keyboard.dismiss();

    // In dev mode with mock data, we can't make a real purchase.
    // Simulate a successful purchase for UI testing.
    if (__DEV__ && pack.product.identifier.includes('_mock')) {
      Alert.alert(
        'Dev Mode Purchase',
        `This would initiate a real purchase for package: ${pack.identifier}`
      );
      setTimeout(() => {
        setIsPurchasing(false);
        router.back();
      }, 1500);
      return;
    }

    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      // The `isPro` state from our SubscriptionProvider will update automatically
      // via the listener, and the useEffect above will handle navigation.
      console.log('Purchase successful for user:', customerInfo.originalAppUserId);
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('Purchase error:', e);
        Alert.alert('Purchase Error', e.message);
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsPurchasing(true);
    Keyboard.dismiss();
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.activeSubscriptions.length > 0) {
        showToast('Purchases Restored', 'success');
      } else {
        showToast('No Active Subscriptions Found', 'info');
      }
      router.back();
    } catch (e) {
      console.error('Restore error:', e);
      Alert.alert('Restore Error', 'Could not restore purchases. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const renderPackage = (pack: PurchasesPackage) => {
    const isBestValue = pack.identifier === bestValuePackage?.identifier;
    const isSelected = pack.identifier === selectedPackage?.identifier;

    return (
      <TouchableOpacity
        key={pack.identifier}
        style={[styles.packageButton, isBestValue && styles.bestValuePackageButton, isSelected && styles.selectedPackageButton]}
        onPress={() => setSelectedPackage(pack)}
        disabled={isPurchasing || isLoading}
      >
        {isBestValue && (
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueBadgeText}>BEST VALUE</Text>
          </View>
        )}
        <View style={styles.packageDetails}>
          <Text style={[styles.packageTitle, isBestValue && styles.bestValuePackageTitle]}>
            {pack.product.title}
          </Text>
          <Text style={[styles.packagePrice, isBestValue && styles.bestValuePackagePrice]}>
            {pack.product.priceString}
          </Text>
        </View>
        <View style={styles.radioCircle}>
          {isSelected && <View style={styles.radioDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={theme.colors.gradient.primary}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <AnimatedEntrance delay={100}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[`${theme.colors.primary}40`, `${theme.colors.primary}10`]}
                style={styles.iconGradient}
              >
                <Ionicons name="diamond-outline" size={40} color={theme.colors.primary} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>{paywallTitle}</Text>
            <Text style={styles.subtitle}>{paywallSubtitle}</Text>
          </View>
        </AnimatedEntrance>

        <AnimatedEntrance delay={250}>
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <View style={styles.featureItem} key={index}>
                <Ionicons
                  name={feature.icon}
                  size={24}
                  color={feature.color || theme.colors.primary}
                />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </AnimatedEntrance>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 40 }} />
        ) : (
          <AnimatedEntrance delay={400}>
            <View style={styles.packagesContainer}>
              {offering?.availablePackages.map(renderPackage)}
            </View>
          </AnimatedEntrance>
        )}

        {isPurchasing && (
          <View style={styles.purchasingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.text.inverse} />
            <Text style={styles.purchasingText}>Processing...</Text>
          </View>
        )}
      </ScrollView>

      <AnimatedEntrance delay={550}>
        <View style={[styles.footer, { paddingBottom: insets.bottom ? insets.bottom + theme.spacing.sm : theme.spacing.xl }]}>
          <TouchableOpacity
            style={[styles.upgradeButton, (!selectedPackage || isPurchasing) && styles.upgradeButtonDisabled]}
            onPress={() => selectedPackage && handlePurchase(selectedPackage)}
            disabled={!selectedPackage || isPurchasing}
            activeOpacity={0.8}
          >
            {isPurchasing ? (
              <ActivityIndicator color={theme.colors.text.inverse} />
            ) : (
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestorePurchases} disabled={isPurchasing} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>
          <Text style={styles.legalText}>
            By upgrading, you agree to our{' '}
            <Text style={styles.linkText} onPress={() => router.push('/(tabs)/profile/terms')}>Terms of Use</Text> and{' '}
            <Text style={styles.linkText} onPress={() => router.push('/(tabs)/profile/privacy')}>Privacy Policy</Text>.
          </Text>
        </View>
      </AnimatedEntrance>
    </LinearGradient>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalHeader: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingTop: theme.spacing.sm,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.border.secondary,
  },
  scrollContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 120, // Space for the footer
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md, // A bit more shadow
    backgroundColor: theme.colors.background.secondary, // A base color
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    maxWidth: '90%',
  },
  featuresList: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.xl, // Increased gap for better spacing
    paddingHorizontal: theme.spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  featureText: {
    fontSize: 17,
    color: theme.colors.text.primary,
    flex: 1,
    lineHeight: 24, // Improved readability
  },
  packagesContainer: {
    gap: theme.spacing.md,
  },
  packageButton: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bestValuePackageButton: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  selectedPackageButton: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  bestValueBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  packageDetails: {
    // container for title and price
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  bestValuePackageTitle: {
    color: theme.colors.primary,
  },
  packagePrice: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  bestValuePackagePrice: {
    color: theme.colors.text.primary,
  },
  purchasingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    ...theme.shadows.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
  },
  purchasingText: {
    color: theme.colors.text.inverse,
    marginTop: theme.spacing.md,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.lg,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderColor: `${theme.colors.border.primary}80`,
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...theme.shadows.md,
  },
  upgradeButtonDisabled: {
    opacity: 0.5,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.onPrimary,
  },
  restoreButton: {
    padding: theme.spacing.sm,
  },
  restoreText: {
    fontSize: 15,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  legalText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
});

export default PaywallScreen;