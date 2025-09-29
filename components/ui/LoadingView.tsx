// components/ui/LoadingView.tsx
import React from 'react';
import {View, ActivityIndicator, StyleSheet, Text} from 'react-native';
import {useTheme} from '@/src/styles/theme/ThemeContext';

interface LoadingViewProps {
  message?: string;
}

const LoadingView: React.FC<LoadingViewProps> = ({message}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={styles.messageText}>{message}</Text>}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    messageText: {
      marginTop: theme.spacing.lg,
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
    },
  });

export default LoadingView;
