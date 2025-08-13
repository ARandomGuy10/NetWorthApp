import React, {JSX, useEffect, useRef, useState} from 'react';
import {View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
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
  onDismiss,
  duration = 4000,
  position = 'top',
  showCloseButton = true,
}: ToastProps): JSX.Element | null {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const insets = useSafeAreaInsets();
  const styles = getStyles();

  const [isVisible, setIsVisible] = useState(visible);

  // Show/hide based on `visible` prop
  useEffect(() => {
    if (visible) {
      setIsVisible(true);

      // Trigger haptics
      const triggerHaptic = async () => {
        if (type === 'error') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else if (type === 'success') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      };
      triggerHaptic();

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

  const hideToast = () => {
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
  const {width: screenWidth} = Dimensions.get('window');

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: toastStyle.backgroundColor,
          opacity,
          transform: [{translateY}, {scale}],
          top: position === 'top' ? insets.top + 10 : undefined,
          bottom: position === 'bottom' ? insets.bottom + 10 : undefined,
          maxWidth: screenWidth - 32,
        },
      ]}>
      <View style={styles.content}>
        <Ionicons name={toastStyle.icon} size={24} color={toastStyle.textColor} style={styles.icon} />
        <Text style={[styles.message, {color: toastStyle.textColor}]} numberOfLines={3}>
          {message}
        </Text>
        {showCloseButton && (
          <TouchableOpacity onPress={hideToast} style={styles.closeButton} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={toastStyle.textColor} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 16,
      right: 16,
      borderRadius: 12,
      zIndex: 9999,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      minHeight: 56,
    },
    icon: {marginRight: 12, flexShrink: 0},
    message: {flex: 1, fontSize: 15, fontWeight: '500', lineHeight: 20},
    closeButton: {marginLeft: 12, padding: 4, borderRadius: 12, flexShrink: 0},
  });
