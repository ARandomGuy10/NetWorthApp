import React, {JSX, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useHaptics } from '@/hooks/useHaptics';
import { useSounds } from '@/hooks/useSounds';

const getGradientColorsForType = (type: ToastType): [string, string] => {
  switch (type) {
    case 'success':
      return ['#218838', '#28a745']; // Darker green to original green
    case 'error':
      return ['#c82333', '#dc3545']; // Darker red to original red
    case 'warning':
      return ['#e0a800', '#ffc107']; // Darker yellow to original yellow
    case 'info':
      return ['#0062cc', '#17a2b8']; // Darker blue to original blue
    default:
      return ['#218838', '#28a745'];
  }
};

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  details?: string;
  onDismiss?: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
  showCloseButton?: boolean;
}

interface ToastStyle {
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  textColor: string;
}

const staticColors = {
  success: '#28a745',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  textInverse: '#ffffff',
};

export default function Toast({
  visible,
  message,
  type = 'success',
  details,
  onDismiss,
  duration = 2500,
  position = 'top',
  showCloseButton = true,
}: ToastProps): JSX.Element | null {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const insets = useSafeAreaInsets();
  const { notificationAsync, impactAsync } = useHaptics();
  const { playSound } = useSounds();

  const [isVisible, setIsVisible] = useState(visible);

  // Show/hide based on `visible` prop
  useEffect(() => {
    if (visible) {
      // Set visibility directly to trigger the render and animation.
      setIsVisible(true);

      // Trigger haptics. The useHaptics hook respects the user's global setting.
      const triggerHaptic = async () => {
        if (type === 'error') await notificationAsync(Haptics.NotificationFeedbackType.Error);
        else if (type === 'success') await notificationAsync(Haptics.NotificationFeedbackType.Success);
        else await impactAsync(Haptics.ImpactFeedbackStyle.Light);
      };
      triggerHaptic();

      // Play sounds based on the global sound setting (handled by the useSounds hook)
      if (type === 'success') playSound('success');
      else if (type === 'error') playSound('error');

      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {toValue: 0, tension: 100, friction: 8, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.spring(scale, {toValue: 1, tension: 100, friction: 8, useNativeDriver: true}),
      ]).start();

      // Auto hide
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {toValue: position === 'top' ? -100 : 100, duration: 250, useNativeDriver: true}),
      Animated.timing(opacity, {toValue: 0, duration: 250, useNativeDriver: true}),
      Animated.timing(scale, {toValue: 0.9, duration: 250, useNativeDriver: true}),
    ]).start(() => {
      setIsVisible(false);
      onDismiss && onDismiss();
    });
  };

  const getToastStyle = (): ToastStyle => {
    switch (type) {
      case 'success':
        return {backgroundColor: staticColors.success, icon: 'checkmark-circle', textColor: staticColors.textInverse};
      case 'error':
        return {backgroundColor: staticColors.error, icon: 'alert-circle', textColor: staticColors.textInverse};
      case 'warning':
        return {backgroundColor: staticColors.warning, icon: 'warning', textColor: staticColors.textInverse};
      case 'info':
        return {backgroundColor: staticColors.info, icon: 'information-circle', textColor: staticColors.textInverse};
      default:
        return {backgroundColor: staticColors.success, icon: 'checkmark-circle', textColor: staticColors.textInverse};
    }
  };

  if (!isVisible) return null;

  const toastStyle = getToastStyle();
  const styles = getStyles();

  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        { opacity, transform: [{ translateY }, { scale }],
          top: position === 'top' ? insets.top : undefined, // Adjusted
          bottom: position === 'bottom' ? insets.bottom : undefined, // Adjusted
        },
      ]}
    >
      <LinearGradient
        colors={getGradientColorsForType(type)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientContainer}
      >
        <View style={styles.content}>
          <Ionicons name={toastStyle.icon} size={24} color={staticColors.textInverse} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: staticColors.textInverse }]} numberOfLines={2}>
              {message}
            </Text>
            {details && (
              <Text style={[styles.details, { color: staticColors.textInverse }]} numberOfLines={2}>
                {details}
              </Text>
            )}
          </View>
          {showCloseButton && (
            <TouchableOpacity onPress={hideToast} style={styles.closeButton} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={staticColors.textInverse} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    animatedContainer: {
      position: 'absolute',
      width: '100%',
      zIndex: 9999,
    },
    gradientContainer: {
      borderRadius: 0, // Make it a bar
      paddingVertical: 16,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16, // Use paddingHorizontal for full width
      minHeight: 56,
    },
    icon: {marginRight: 12, flexShrink: 0},
    textContainer: {
      flex: 1,
    },
    message: {
      fontSize: 15,
      fontWeight: 'bold',
      lineHeight: 22,
    },
    details: {
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.8,
      marginTop: 2,
    },
    closeButton: {marginLeft: 12, padding: 4, borderRadius: 12, flexShrink: 0},
  });
