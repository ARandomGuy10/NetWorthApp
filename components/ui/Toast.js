import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../../src/styles/colors';

export default function Toast({ 
  visible, 
  message, 
  type = 'success', // 'success', 'error', 'warning', 'info'
  onDismiss,
  duration = 4000 
}) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss && onDismiss();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success,
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: colors.error,
          icon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: colors.warning,
          icon: 'warning',
        };
      case 'info':
        return {
          backgroundColor: colors.info,
          icon: 'information-circle',
        };
      default:
        return {
          backgroundColor: colors.success,
          icon: 'checkmark-circle',
        };
    }
  };

  if (!visible) return null;

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: toastStyle.backgroundColor,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={toastStyle.icon}
          size={20}
          color={colors.text.inverse}
          style={styles.icon}
        />
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="close"
            size={18}
            color={colors.text.inverse}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below status bar
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.md,
    zIndex: 9999,
    ...shadows.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  icon: {
    marginRight: spacing.md,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.inverse,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});