import React, { memo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme, AccountWithBalance } from '@/lib/supabase';
import { formatCurrency } from '@/utils/utils';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient'; // Add this import
import { getGradientColors } from '@/utils/utils'; // Add this import

interface AccountRowProps {
  account: AccountWithBalance;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void; // New prop for delete
  onArchive: () => void;
  isIncludedInNetWorth: boolean; // New prop for net worth inclusion
}

const AccountRow: React.FC<AccountRowProps> = ({ account, onPress, onEdit, onDelete, onArchive, isIncludedInNetWorth }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const translateX = useSharedValue(0);
  const timeoutRef = useRef<number | null>(null);

  const clearAutoCloseTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startAutoCloseTimer = () => {
    clearAutoCloseTimer(); // Clear any existing timer
    timeoutRef.current = setTimeout(() => {
      // Check if the row is still open before closing
      if (translateX.value !== 0) {
        translateX.value = withTiming(0); // Close the row
      }
      timeoutRef.current = null;
    }, 1500); // 1.5 seconds
  };

  const SWIPE_THRESHOLD = 75; // Minimum swipe distance to trigger action
  const QUICK_EDIT_WIDTH = 80;
  const HIDE_ARCHIVE_WIDTH = 160; // 80 for hide, 80 for archive

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // Only allow horizontal pan
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        // Clamp translationX to prevent over-swiping
        if (e.translationX > 0) { // Swiping right
          translateX.value = Math.min(e.translationX, QUICK_EDIT_WIDTH);
        } else { // Swiping left
          translateX.value = Math.max(e.translationX, -HIDE_ARCHIVE_WIDTH);
        }
      }
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) { // Swiped right enough
        translateX.value = withTiming(QUICK_EDIT_WIDTH, { duration: 150 });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(startAutoCloseTimer)();
      } else if (e.translationX < -SWIPE_THRESHOLD) { // Swiped left enough
        translateX.value = withTiming(-HIDE_ARCHIVE_WIDTH, { duration: 150 });
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(startAutoCloseTimer)();
      } else {
        translateX.value = withTiming(0, { duration: 150 }); // Snap back
        runOnJS(clearAutoCloseTimer)();
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    if (translateX.value !== 0) {
      translateX.value = withTiming(0, { duration: 150 }); // Close swipe actions on tap outside
      runOnJS(clearAutoCloseTimer)();
    } else {
      runOnJS(onPress)(); // Only call onPress if not closing swipe actions
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const getAccountIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Cash': 'cash-outline',
      'Checking': 'card-outline',
      'Savings': 'wallet-outline',
      'Investment': 'trending-up-outline',
      'Retirement': 'shield-outline',
      'Real Estate': 'home-outline',
      'Vehicle': 'car-outline',
      'Credit Card': 'card-outline',
      'Personal Loan': 'document-text-outline',
      'Mortgage': 'home-outline',
      'Auto Loan': 'car-outline',
      'Student Loan': 'school-outline',
      'Other Asset': 'ellipse-outline',
      'Other Liability': 'ellipse-outline'
    };
    return iconMap[category] || 'ellipse-outline';
  };

  const timeSinceUpdate = (date: string | null): string => {
    if (!date) return 'Never updated';
    const lastUpdate = new Date(date);
    const daysSince = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) return 'Updated today';
    if (daysSince === 1) return '1 day ago';
    return `${daysSince} days ago`;
  };

  return (
    <View style={styles.outerContainer}> 
      {/* Actions Container - positioned absolutely behind the row */}
      <View style={styles.actionsContainer}>
        {/* Quick Edit Button (Swipe Right) */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.quickEditButton]} 
          onPress={() => { runOnJS(onEdit)(); translateX.value = withTiming(0, { duration: 150 }); runOnJS(clearAutoCloseTimer)(); }}
        >
          <Ionicons name="pencil-outline" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>

        {/* Hide and Archive Buttons (Swipe Left) */}
        <View style={styles.rightActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.error, width: 80 }]} 
            onPress={() => { runOnJS(onDelete)(); translateX.value = withTiming(0, { duration: 150 }); runOnJS(clearAutoCloseTimer)(); }}
          >
            <Ionicons name="trash-outline" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.archiveButton]} 
            onPress={() => { runOnJS(onArchive)(); translateX.value = withTiming(0, { duration: 150 }); runOnJS(clearAutoCloseTimer)(); }}
          >
            <Ionicons name={account.is_archived ? "arrow-undo-outline" : "archive-outline"} size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </View>
      <GestureDetector gesture={Gesture.Exclusive(panGesture, tapGesture)}>
        <View pointerEvents="box-none"> 
          <Animated.View style={[styles.animatedContainer, animatedStyle]}>
          <LinearGradient
            colors={getGradientColors(theme, 'card')}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rowContent}
          >
            <View style={styles.leftSection}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.interactive.hover }]}>
                <Ionicons 
                  name={getAccountIcon(account.category)} 
                  size={22} 
                  color={account.account_type === 'asset' ? theme.colors.asset : theme.colors.liability} 
                />
              </View>
              {/* New Net Worth Inclusion Indicator */}
              <Ionicons
                name={isIncludedInNetWorth ? "checkmark-circle-outline" : "close-circle-outline"}
                size={18}
                color={theme.colors.text.tertiary} // Muted color
                style={styles.netWorthIndicatorIcon} // New style for spacing
              />
              <View>
                <Text style={styles.accountName}>{account.account_name}</Text>
                <Text style={styles.subtitle}>{account.institution || account.category}</Text>
              </View>
            </View>
            <View style={styles.rightSection}>
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceAmount}>
                  {formatCurrency(account.latest_balance || 0, account.currency)}
                </Text>
                <Text style={styles.balanceDate}>{timeSinceUpdate(account.latest_balance_date)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
            </View>
          </LinearGradient>
        </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  outerContainer: {
    width: Dimensions.get('window').width, // Ensure it takes full width
    justifyContent: 'center',
    backgroundColor: theme.colors.background.card, // Background for the whole row, including actions
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickEditButton: {
    backgroundColor: theme.colors.primary,
    width: 80,
  },
  rightActions: {
    flexDirection: 'row',
    height: '100%',
  },
  archiveButton: {
    backgroundColor: theme.colors.warning,
    width: 80,
  },
  animatedContainer: {
    // Add shadow/border if needed to match original row style
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    width: Dimensions.get('window').width, // Ensure it covers the full width
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  netWorthIndicatorIcon: {
    marginRight: theme.spacing.sm, // Adjust spacing as needed
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  balanceDate: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
});

export default memo(AccountRow);