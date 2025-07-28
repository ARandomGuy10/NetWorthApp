import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

const ModernFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const toggleFAB = () => {
    const toValue = isOpen ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
    
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    toggleFAB();
    Animated.spring(animation, {
      toValue: 0,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();

    if (action === 'account') {
      router.push('/add-account');
    } else if (action === 'balance') {
      router.push('/add-balance');
    }
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  // Animation values for translating the account and balance buttons
  // They are hidden (at Y=0) when the FAB is closed, and translated up
  // when the FAB is open.
  const accountTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60], // move up by 60px
  });

  const balanceTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -130], // move up by 130px
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      <View style={[styles.container, { bottom: 90 + insets.bottom }]}>
        {/* Overlay for closing FAB when tapping outside */}
        {isOpen && (
          <TouchableOpacity 
            style={styles.overlay} 
            activeOpacity={1} 
            onPress={toggleFAB} 
          />
        )}
        
        {/* Add Balance Option */}
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: balanceTranslateY }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={() => handleAction('balance')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
            </View>
            <Text style={styles.actionText}>Add Balance</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Add Account Option */}
        <Animated.View
          style={[
            styles.actionButton,
            {
              transform: [{ translateY: accountTranslateY }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={() => handleAction('account')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="wallet-outline" size={20} color={colors.text.inverse} />
            </View>
            <Text style={styles.actionText}>Add Account</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Main FAB */}
        <TouchableOpacity style={styles.fab} onPress={toggleFAB}>
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={28} color={colors.background.primary} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.xl,
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    alignItems: 'flex-end',
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.md,
    minWidth: 160,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
  },
});

export default ModernFAB;