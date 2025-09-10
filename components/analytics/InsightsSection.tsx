// components/ui/InsightsSection.tsx - Much better header design

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Animated, {FadeInUp} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '@/src/styles/theme/ThemeContext';

export interface InsightItem {
  icon: string;
  title: string;
  description: string;
  color: string;
  type?: string;
}

interface InsightsSectionProps {
  title: string;
  subtitle: string;
  insights: InsightItem[];
  paddingBottom?: number;
  headerIcon?: keyof typeof Ionicons.glyphMap; // ✅ NEW: Optional header icon
}

const InsightsSection: React.FC<InsightsSectionProps> = ({
  title,
  subtitle,
  insights,
  paddingBottom = 120,
  headerIcon = 'analytics-outline', // ✅ Default icon
}) => {
  const {theme} = useTheme();
  const styles = getStyles(theme, paddingBottom);

  return (
    <View style={styles.container}>
      {/* ✅ ENHANCED: Much better header design */}
      <Animated.View entering={FadeInUp.duration(400)} style={styles.headerContainer}>
        {/* ✅ NEW: Header background with gradient */}
        <LinearGradient
          colors={[`${theme.colors.primary}08`, `${theme.colors.primary}04`, `${theme.colors.primary}02`]}
          style={styles.headerBackground}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          {/* ✅ NEW: Icon and title row */}
          <View style={styles.headerTopRow}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.iconGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <Ionicons name={headerIcon} size={20} color={theme.colors.text.onPrimary} />
              </LinearGradient>
            </View>

            <View style={styles.titleContainer}>
              <Text style={styles.sectionTitle}>{title}</Text>

              {/* ✅ NEW: Decorative line */}
              <View style={styles.decorativeLine}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryLight, 'transparent']}
                  style={styles.lineGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                />
              </View>
            </View>
          </View>

          {/* ✅ NEW: Enhanced subtitle */}
          <View style={styles.subtitleContainer}>
            <Text style={styles.sectionSubtitle}>{subtitle}</Text>

            {/* ✅ NEW: Insights count badge */}
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{insights.length} insights</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Insights Cards - unchanged */}
      <View style={styles.insightsContainer}>
        {insights.map((insight, index) => (
          <Animated.View
            key={`${insight.type}-${index}`}
            entering={FadeInUp.delay(index * 100 + 200)} // ✅ Delay after header
            style={styles.insightCard}>
            <LinearGradient
              colors={[theme.colors.background.card, theme.colors.background.elevated]}
              style={styles.insightGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <View style={styles.insightHeader}>
                <View style={[styles.insightIconContainer, {backgroundColor: `${insight.color}15`}]}>
                  <Text style={styles.insightIcon}>{insight.icon}</Text>
                </View>
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const getStyles = (theme: any, paddingBottom: number) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: paddingBottom,
      //paddingTop: theme.spacing.lg,
    },

    // ✅ ENHANCED: Beautiful header container
    headerContainer: {
      marginBottom: theme.spacing.xl,
    },

    // ✅ NEW: Gradient background for header
    headerBackground: {
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}15`,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    },

    // ✅ NEW: Top row with icon and title
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },

    // ✅ NEW: Gradient icon container
    iconContainer: {
      marginRight: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    iconGradient: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ✅ NEW: Title container with decorative line
    titleContainer: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: theme.fontSizes.heading,
      fontWeight: '800',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      letterSpacing: 0.5,
    },

    // ✅ NEW: Decorative gradient line under title
    decorativeLine: {
      height: 3,
      width: '60%',
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },

    lineGradient: {
      flex: 1,
    },

    // ✅ NEW: Subtitle container with badge
    subtitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },

    sectionSubtitle: {
      flex: 1,
      fontSize: theme.fontSizes.body,
      color: theme.colors.text.secondary,
      lineHeight: theme.fontSizes.body * 1.5,
      letterSpacing: 0.2,
      marginRight: theme.spacing.sm,
    },

    // ✅ NEW: Count badge showing number of insights
    countBadge: {
      backgroundColor: `${theme.colors.primary}20`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: `${theme.colors.primary}30`,
    },

    countText: {
      fontSize: theme.fontSizes.xs,
      fontWeight: '600',
      color: theme.colors.primary,
      letterSpacing: 0.3,
    },

    insightsContainer: {
      gap: theme.spacing.md,
    },

    insightCard: {
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
    },

    insightGradient: {
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
      shadowColor: theme.colors.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },

    insightHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },

    insightIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },

    insightIcon: {
      fontSize: theme.fontSizes.lg,
      lineHeight: theme.fontSizes.lg,
    },

    insightTitle: {
      flex: 1,
      fontSize: theme.fontSizes.subtitle,
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: theme.fontSizes.subtitle * 1.2,
    },

    descriptionContainer: {
      marginLeft: 52,
      marginTop: 0,
    },

    insightDescription: {
      fontSize: theme.fontSizes.body,
      lineHeight: theme.fontSizes.body * 1.5,
      color: theme.colors.text.secondary,
    },
  });

export default InsightsSection;
