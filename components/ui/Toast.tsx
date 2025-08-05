import React, { JSX, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  onDismiss?: () => void; // Fixed: was onHide in your usage
  onHide?: () => void; // Added for backward compatibility
  duration?: number;
  position?: 'top' | 'bottom';
  showCloseButton?: boolean;
}

interface ToastStyle {
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  textColor: string;
}

export default function Toast({
  visible,
  message,
  type = 'success',
  onDismiss,
  onHide, // Added for backward compatibility
  duration = 4000,
  position = 'top',
  showCloseButton = true
}: ToastProps): JSX.Element | null {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  // Use onHide if provided for backward compatibility, otherwise use onDismiss
  const dismissHandler = onHide || onDismiss;

  useEffect(() => {
    if (visible) {
      // Haptic feedback on show
      if (type === 'error') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (type === 'success') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [visible, duration, type]);

  const hideToast = (): void => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissHandler && dismissHandler();
    });
  };

  const getToastStyle = (): ToastStyle => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          icon: 'checkmark-circle',
          textColor: theme.colors.text.inverse,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          icon: 'alert-circle',
          textColor: theme.colors.text.inverse,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          icon: 'warning',
          textColor: theme.colors.text.inverse,
        };
      case 'info':
        return {
          backgroundColor: theme.colors.info,
          icon: 'information-circle',
          textColor: theme.colors.text.inverse,
        };
      default:
        return {
          backgroundColor: theme.colors.success,
          icon: 'checkmark-circle',
          textColor: theme.colors.text.inverse,
        };
    }
  };

  if (!visible) return null;

  const toastStyle = getToastStyle();
  const { width: screenWidth } = Dimensions.get('window');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: toastStyle.backgroundColor,
          opacity,
          transform: [
            { translateY },
            { scale }
          ],
          top: position === 'top' ? insets.top + 10 : undefined,
          bottom: position === 'bottom' ? insets.bottom + 10 : undefined,
          maxWidth: screenWidth - (theme.spacing.lg * 2),
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={toastStyle.icon}
          size={24}
          color={toastStyle.textColor}
          style={styles.icon}
        />
        <Text
          style={[styles.message, { color: toastStyle.textColor }]}
          numberOfLines={3}
        >
          {message}
        </Text>
        {showCloseButton && (
          <TouchableOpacity
            onPress={hideToast}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close"
              size={20}
              color={toastStyle.textColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: 12,
    zIndex: 9999,
    ...theme.shadows.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    minHeight: 56,
  },
  icon: {
    marginRight: theme.spacing.md,
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: theme.spacing.md,
    padding: theme.spacing.xs,
    borderRadius: 12,
    flexShrink: 0,
  },
});
