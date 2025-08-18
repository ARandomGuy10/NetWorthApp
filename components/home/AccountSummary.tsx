// components/home/AccountSummary.tsx
import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ScrollView, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useRouter} from 'expo-router';
import {LinearGradient} from 'expo-linear-gradient';
import {getGradientColors} from '@/utils/utils';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {Theme, DashboardAccount} from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

const {width: screenWidth} = Dimensions.get('window');

interface AccountSummaryProps {
  accounts?: DashboardAccount[];
  remindAfterDays: number; // New prop
}

const AccountSummary: React.FC<AccountSummaryProps> = ({accounts = [], remindAfterDays}) => {
  const router = useRouter();
  const {theme} = useTheme();
  const styles = getStyles(theme);

  // Animation state
  const [scaleAnim] = useState(new Animated.Value(1));
  const [showAllOutdated, setShowAllOutdated] = useState(false);

  // Haptic feedback
  const invokeHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Filter out archived accounts (soft deleted)
  const activeAccounts = accounts.filter(acc => acc.is_archived !== true);

  // Calculate summary stats
  const totalAccounts = activeAccounts.length;
  const assetsCount = activeAccounts.filter(acc => acc.account_type === 'asset').length;
  const liabilitiesCount = activeAccounts.filter(acc => acc.account_type === 'liability').length;

  // Get outdated accounts (older than 30 days)
  const outdatedAccounts = activeAccounts.filter(acc => {
    if (!acc.latest_balance_date) return true;
    const lastUpdate = new Date(acc.latest_balance_date);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > remindAfterDays;
  });

  const outdatedCount = outdatedAccounts.length;

  // Show only 3 accounts by default, horizontal scrollable
  const OUTDATED_LIMIT = 3;
  const displayedOutdated = showAllOutdated ? outdatedAccounts : outdatedAccounts.slice(0, OUTDATED_LIMIT);
  const hasMoreOutdated = outdatedAccounts.length > OUTDATED_LIMIT;

  // Get account icon
  const getAccountIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      Cash: 'card',
      Checking: 'card',
      Savings: 'wallet',
      Investment: 'trending-up',
      Retirement: 'shield',
      'Real Estate': 'home',
      Vehicle: 'car',
      'Credit Card': 'card',
      'Personal Loan': 'document-text',
      Mortgage: 'home',
      'Auto Loan': 'car',
      'Student Loan': 'school',
      Brokerage: 'stats-chart',
    };
    return iconMap[category] || 'ellipse';
  };

  // Format time since last update
  const getTimeSinceUpdate = (date: string | null): string => {
    if (!date) return 'Never updated';
    // By appending T00:00:00, we ensure the date is parsed in the user's local timezone, not UTC.
    const lastUpdate = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastUpdate.getTime();
    const daysSince = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (daysSince <= 0) return 'Updated today';
    if (daysSince === 1) return '1 day ago';
    if (daysSince < 30) return `${daysSince} days ago`;
    if (daysSince < 60) return '1 month ago';
    return `${Math.floor(daysSince / 30)} months ago`;
  };

  // Handle main summary press
  const handleSummaryPress = useCallback(() => {
    invokeHaptic();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push('/accounts' as any);
  }, [invokeHaptic, scaleAnim, router]);

  // Handle outdated account press - navigate to add balance
  const handleOutdatedAccountPress = useCallback(
    (accountId: string) => {
      invokeHaptic();
      router.push({ pathname: `accounts/add-balance`, params: { accountId } });
    },
    [invokeHaptic, router]
  );

  // Handle show more/less toggle
  const handleToggleOutdated = useCallback(() => {
    invokeHaptic();
    setShowAllOutdated(!showAllOutdated);
  }, [invokeHaptic, showAllOutdated]);

  if (totalAccounts === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.emptyCard} 
          onPress={() => {
            invokeHaptic();
            router.push('/accounts/add-account' as any);
          }}
          activeOpacity={0.8}>
          <LinearGradient colors={getGradientColors(theme, 'accent')} style={styles.emptyCardGradient}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="wallet-outline" size={48} color={theme.colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>Connect Your Accounts</Text>
              <Text style={styles.emptySubtitle}>Add your first account to start tracking your net worth</Text>
              <View style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Get Started</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Render outdated account card with beautiful shiny yellow gradient
  const renderOutdatedAccountHorizontal = (item: DashboardAccount, index: number) => (
    <TouchableOpacity
      key={item.account_id}
      style={styles.horizontalOutdatedCard}
      onPress={() => handleOutdatedAccountPress(item.account_id)}
      activeOpacity={0.8}>
      {/* ✅ Beautiful shiny yellow gradient - not too bright */}
      <LinearGradient
        colors={['#F5F2E8', '#E8D5A3', '#D4B86A', '#B8860B']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.horizontalCardGradient}>
        <View style={styles.horizontalCardContent}>
          <View style={[styles.horizontalIconContainer, {backgroundColor: 'rgba(180, 134, 11, 0.20)'}]}>
            <Ionicons
              name={getAccountIcon(item.category)}
              size={22}
              color="#8B4513" // Dark golden rod for better contrast
            />
          </View>
          <View style={styles.horizontalTextContainer}>
            <Text style={styles.horizontalAccountName} numberOfLines={1}>
              {item.account_name}
            </Text>
            <Text style={[styles.horizontalTime, {color: '#8B7355'}]}>
              {getTimeSinceUpdate(item.latest_balance_date)}
            </Text>
          </View>
          <View style={[styles.horizontalActionIndicator, {backgroundColor: 'rgba(180, 134, 11, 0.18)'}]}>
            <Ionicons name="chevron-forward" size={16} color="#8B4513" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Main Summary Card - Full Width */}
      <Animated.View style={[styles.summaryCardWrapper, {transform: [{scale: scaleAnim}]}]}>
        <TouchableOpacity style={styles.summaryCard} onPress={handleSummaryPress} activeOpacity={0.9}>
          <LinearGradient colors={getGradientColors(theme, 'card')} style={styles.cardGradient}>
            <View style={styles.cardOverlay}>
              {/* Main Content */}
              <View style={styles.mainContent}>
                <View style={styles.leftSection}>
                  <View style={styles.iconContainer}>
                    <LinearGradient
                      colors={[`${theme.colors.primary}25`, `${theme.colors.primary}15`]}
                      style={styles.iconGradient}>
                      <Ionicons name="wallet" size={32} color={theme.colors.primary} />
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.centerSection}>
                  <Text style={styles.mainTitle}>Your Accounts</Text>
                  <Text style={styles.accountCount}>
                    {totalAccounts} {totalAccounts === 1 ? 'account' : 'accounts'} connected
                  </Text>
                </View>

                <View style={styles.rightSection}>
                  <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
                  </View>
                </View>
              </View>

              {/* Account Breakdown */}
              <View style={styles.breakdownSection}>
                <View style={styles.breakdownGrid}>
                  <View style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, {backgroundColor: theme.colors.asset}]} />
                    <Text style={styles.breakdownText}>
                      {assetsCount} Asset{assetsCount !== 1 ? 's' : ''}
                    </Text>
                  </View>

                  <View style={styles.breakdownItem}>
                    <View style={[styles.breakdownDot, {backgroundColor: theme.colors.liability}]} />
                    <Text style={styles.breakdownText}>
                      {liabilitiesCount} Liabilit{liabilitiesCount !== 1 ? 'ies' : 'y'}
                    </Text>
                  </View>

                  {outdatedCount > 0 && (
                    <View style={styles.breakdownItem}>
                      <View style={[styles.breakdownDot, {backgroundColor: theme.colors.warning}]} />
                      <Text style={[styles.breakdownText, {color: theme.colors.warning}]}>
                        {outdatedCount} outdated
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Horizontal Scrollable Outdated Accounts Section */}
      {outdatedCount > 0 && (
        <View style={styles.outdatedSection}>
          <View style={styles.outdatedHeader}>
            <Text style={styles.outdatedSectionTitle}>Accounts need updating</Text>
            {hasMoreOutdated && (
              <TouchableOpacity onPress={handleToggleOutdated} style={styles.toggleButton} activeOpacity={0.7}>
                <Text style={[styles.toggleButtonText, {color: theme.colors.primary}]}>
                  {showAllOutdated ? 'Show less' : `Show all ${outdatedCount}`}
                </Text>
                <Ionicons
                  name={showAllOutdated ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Horizontal Scrollable Cards */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            style={styles.horizontalScrollContainer}>
            {displayedOutdated.map((item, index) => renderOutdatedAccountHorizontal(item, index))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    // Full width using screenWidth
    container: {
      width: screenWidth,
      marginBottom: theme.spacing.xl,
    },

    // Summary card - full width
    summaryCardWrapper: {
      width: screenWidth,
    },
    summaryCard: {
      overflow: 'hidden',
      width: screenWidth,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.text.primary,
          shadowOffset: {width: 0, height: 8},
          shadowOpacity: 0.1,
          shadowRadius: 16,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    cardGradient: {
      width: '100%',
    },
    cardOverlay: {
      backgroundColor: `${theme.colors.background.card}70`,
      borderWidth: 1,
      borderColor: `${theme.colors.text.primary}08`,
      padding: theme.spacing.xl,
      minHeight: 140,
      width: '100%',
    },
    mainContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    leftSection: {
      marginRight: theme.spacing.lg,
    },
    iconContainer: {
      borderRadius: 30,
      overflow: 'hidden',
    },
    iconGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${theme.colors.primary}20`,
    },
    centerSection: {
      flex: 1,
    },
    mainTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 4,
      letterSpacing: -0.4,
    },
    accountCount: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      letterSpacing: -0.2,
    },
    rightSection: {
      justifyContent: 'center',
    },
    chevronContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.text.primary}06`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    breakdownSection: {
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: `${theme.colors.text.primary}08`,
    },
    breakdownGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.lg,
    },
    breakdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    breakdownDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: theme.spacing.sm,
    },
    breakdownText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      letterSpacing: -0.1,
    },

    // Horizontal outdated accounts section
    outdatedSection: {
      width: screenWidth,
      marginTop: theme.spacing.lg,
    },
    outdatedHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    outdatedSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
      letterSpacing: -0.2,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    toggleButtonText: {
      fontSize: 14,
      fontWeight: '600',
      marginRight: theme.spacing.xs,
    },

    // Horizontal scroll container
    horizontalScrollContainer: {
      width: screenWidth,
    },
    horizontalScrollContent: {
      paddingLeft: theme.spacing.lg,
      paddingRight: theme.spacing.lg,
      gap: theme.spacing.md,
    },

    // Longer and smaller proportions for account names
    horizontalOutdatedCard: {
      width: screenWidth * 0.65, // 65% width (longer)
      minHeight: 85, // Smaller height
    },

    // ✅ Beautiful shiny yellow gradient styling
    horizontalCardGradient: {
      borderRadius: theme.borderRadius.lg,
      width: '100%',
      minHeight: 85,
      borderWidth: 1,
      borderColor: 'rgba(218, 165, 32, 0.30)', // Soft golden border
      ...Platform.select({
        ios: {
          shadowColor: '#DAA520', // Golden shadow
          shadowOffset: {width: 0, height: 3},
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        android: {
          elevation: 4,
        },
      }),
    },

    horizontalCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      minHeight: 85,
    },

    horizontalIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },

    horizontalTextContainer: {
      flex: 1,
      marginRight: theme.spacing.sm,
      justifyContent: 'center',
    },

    horizontalAccountName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#3D2914', // Deep brown for excellent contrast on mustard
      marginBottom: 4,
      letterSpacing: -0.2,
    },

    horizontalTime: {
      fontSize: 13,
      fontWeight: '600',
      color: '#5D4037', // Warm dark brown
      letterSpacing: -0.1,
    },

    horizontalActionIndicator: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Empty state styles
    emptyCard: {
      width: screenWidth,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyCardGradient: {
      borderRadius: theme.borderRadius.xl,
      borderWidth: 2,
      borderColor: `${theme.colors.primary}20`,
      borderStyle: 'dashed',
      width: screenWidth - theme.spacing.lg * 2,
    },
    emptyContent: {
      padding: theme.spacing.xl * 1.5,
      alignItems: 'center',
      minHeight: 160,
      justifyContent: 'center',
    },
    emptyIconContainer: {
      marginBottom: theme.spacing.lg,
      opacity: 0.8,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      letterSpacing: -0.3,
    },
    emptySubtitle: {
      fontSize: 15,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '500',
      marginBottom: theme.spacing.lg,
    },
    emptyButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    emptyButtonText: {
      color: theme.colors.text.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
  });

export default AccountSummary;
