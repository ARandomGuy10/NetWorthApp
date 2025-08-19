import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumBannerProps {
  onPress?: () => void;
}

const PremiumBanner: React.FC<PremiumBannerProps> = ({ onPress }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#6D28D9', '#2563EB', '#14B8A6']} // Purple -> Blue -> Teal
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="diamond-outline" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Upgrade Your Plan</Text>
          <Text style={styles.subtitle}>Unlock exclusive insights and advanced analytics.</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="rgba(255, 255, 255, 0.7)" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  iconContainer: {
    marginRight: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: theme.spacing.xxs,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
});

export default PremiumBanner;