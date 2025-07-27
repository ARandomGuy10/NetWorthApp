import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
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
    setIsOpen(false);
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

  const accountTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -70],
  });

  const balanceTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -130],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <Modal
          transparent
          visible={isOpen}
          onRequestClose={() => handleAction(null)}
          animationType="none"
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => handleAction(null)}
          />
        </Modal>
      )}

      <View style={[styles.container, { bottom: 80 + insets.bottom }]}>
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
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.text.primary} />
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
          >
            <Ionicons name="wallet-outline" size={24} color={colors.text.primary} />
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
    right: spacing.lg,
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
    minWidth: 150,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
});

export default ModernFAB;