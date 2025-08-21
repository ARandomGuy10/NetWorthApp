import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';

export type ContentItem = {
  type: 'subheader' | 'paragraph';
  text: string;
};

interface LegalContentPageProps {
  title: string;
  lastUpdated: string;
  content: ContentItem[];
}

const LegalContentPage: React.FC<LegalContentPageProps> = ({ title, lastUpdated, content }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const renderContent = (item: ContentItem, index: number) => {
    switch (item.type) {
      case 'subheader':
        return <Text key={index} style={styles.subheader}>{item.text}</Text>;
      default:
        return <Text key={index} style={styles.paragraph}>{item.text}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: theme.spacing.xl,
          paddingBottom: insets.bottom + theme.spacing.lg,
          paddingHorizontal: theme.spacing.lg,
        }}
      >
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
        <View style={styles.contentContainer}>
          {content.map(renderContent)}
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    pageTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    lastUpdated: {
      fontSize: 14,
      color: theme.colors.text.tertiary,
      marginBottom: theme.spacing.xl,
    },
    contentContainer: {
      gap: theme.spacing.md,
    },
    subheader: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
    },
    paragraph: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      lineHeight: 24,
    },
  });

export default LegalContentPage;