import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, TextInputProps} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useTheme} from '@/src/styles/theme/ThemeContext';
import {Theme} from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import {useHaptics} from '@/hooks/useHaptics';

interface CategoryInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onFocus'> {
  value: string;
  onChangeText: (text: string) => void;
  suggestions: string[];
  disabled?: boolean;
  soundEffectsEnabled?: boolean;
  accountType: 'asset' | 'liability';
  error?: string;
  onFocus?: () => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({
  value,
  onChangeText,
  suggestions,
  disabled,
  accountType,
  error,
  onFocus,
  ...props
}) => {
  const {theme} = useTheme();
  const {impactAsync} = useHaptics();
  const styles = getStyles(theme);
  const [isFocused, setIsFocused] = useState(false);
  const [showGradient, setShowGradient] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const layoutWidthRef = useRef(0);

  const selectedColor = accountType === 'asset' ? theme.colors.asset : theme.colors.liability;
  const placeholderText =
    accountType === 'asset' ? 'e.g., Savings, or type your own' : 'e.g., Credit Card, or type your own';

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleScroll = (event: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isScrolledToEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 20; // 20px buffer
    if (showGradient === isScrolledToEnd) {
      setShowGradient(!isScrolledToEnd);
    }
  };

  useEffect(() => {
    // Animate a small scroll to hint that the area is scrollable
    const timer = setTimeout(() => {
      if (showGradient && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({x: 50, animated: true});
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({x: 0, animated: true});
        }, 300);
      }
    }, 800); // Delay to allow screen transition to finish

    return () => clearTimeout(timer);
  }, [showGradient]);

  return (
    <View>
      <TextInput
        style={[
          styles.textInput,
          disabled && styles.textInputDisabled,
          !!error && styles.errorBorder,
          isFocused && styles.focusedBorder,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholderText}
        placeholderTextColor={theme.colors.text.secondary}
        editable={!disabled}
        autoCapitalize="words"
        returnKeyType="next"
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.suggestionsContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onLayout={event => {
            layoutWidthRef.current = event.nativeEvent.layout.width;
          }}
          onContentSizeChange={contentWidth => {
            setShowGradient(contentWidth > layoutWidthRef.current);
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {suggestions.map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={[
                styles.suggestionChip,
                value === suggestion && {backgroundColor: selectedColor, borderColor: selectedColor},
              ]}
              onPress={() => {
                impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChangeText(suggestion);
              }}
              disabled={disabled}>
              <Text style={[styles.suggestionText, value === suggestion && styles.suggestionTextSelected]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {showGradient && (
          <LinearGradient
            colors={['rgba(0,0,0,0)', theme.colors.background.primary]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradient}
            pointerEvents="none"
          />
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    textInput: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      minHeight: 52,
      ...theme.shadows.sm,
    },
    textInputDisabled: {opacity: 0.6},
    focusedBorder: {
      borderColor: theme.colors.primary,
    },
    errorBorder: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 13,
      marginTop: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
      fontWeight: '500',
    },
    suggestionsContainer: {
      marginTop: theme.spacing.md,
      position: 'relative',
    },
    suggestionChip: {
      backgroundColor: theme.colors.background.elevated,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border.secondary,
    },
    suggestionText: {color: theme.colors.text.secondary, fontSize: 14, fontWeight: '500'},
    suggestionTextSelected: {color: theme.colors.text.inverse, fontWeight: '600'},
    gradient: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: 50,
    },
  });

export default CategoryInput;
