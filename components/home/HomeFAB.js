import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, borderRadius, shadows, colors } from '../../src/styles/colors';

const HomeFAB = ({ fabVisible, toggleFab, closeFab, handleFabAction, fabRotation, fabScale }) => {
  const insets = useSafeAreaInsets();

  const fabRotationStyle = {
    transform: [
      {
        rotate: fabRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg']
        })
      },
      { scale: fabScale }
    ]
  };

  return (
    <>
      {/* Overlay for FAB */}
      {fabVisible && (
        <TouchableOpacity
          style={styles.fabOverlay}
          activeOpacity={1}
          onPress={closeFab}
        />
      )}

      {/* Enhanced Floating Action Button */}
      <View style={[styles.fabContainer, { bottom: 70 + insets.bottom + spacing.xl }]}>
        {/* FAB Options */}
        {fabVisible && (
          <Animated.View
            style={[
              styles.fabOptions,
              {
                opacity: fabRotation,
                transform: [{
                  translateY: fabRotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })
                }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.fabOption}
              onPress={() => handleFabAction('balance')}
              activeOpacity={0.8}
            >
              <View style={styles.fabOptionIcon}>
                <Ionicons name="add-circle-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={styles.fabOptionText}>Add Balance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fabOption}
              onPress={() => handleFabAction('account')}
              activeOpacity={0.8}
            >
              <View style={styles.fabOptionIcon}>
                <Ionicons name="wallet-outline" size={20} color={colors.text.inverse} />
              </View>
              <Text style={styles.fabOptionText}>Add Account</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={toggleFab}
          activeOpacity={0.8}
        >
          <Animated.View style={fabRotationStyle}>
            <Ionicons name="add" size={28} color={colors.text.inverse} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: spacing.xl,
    alignItems: 'flex-end',
    zIndex: 10, // Ensure it's on top
  },
  fabOptions: {
    marginBottom: spacing.md,
  },
  fabOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.elevated,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.lg,
    minWidth: 140,
  },
  fabOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fabOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
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
  fabOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default HomeFAB;
