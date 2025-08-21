
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';
import Switch from './Switch';

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isLast?: boolean;
};

export const SettingRow = ({
  icon,
  text,
  subtitle,
  value,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  isLast,
}: SettingRowProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity style={[styles.settingRow, isLast && styles.lastSettingRow]} onPress={onPress} disabled={isSwitch}>
      <View style={styles.settingRowLeft}>
        <Ionicons name={icon} size={24} color={theme.colors.text.secondary} style={styles.settingIcon} />
        <View style={styles.textContainer}>
          <Text style={styles.settingText}>{text}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRowRight}>
        {isSwitch ? (
          <Switch
            value={switchValue || false}
            onValueChange={onSwitchChange || (() => {})}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.background.tertiary}
          />
        ) : (
          <>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            {onPress && <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    lastSettingRow: {
      borderBottomWidth: 0,
    },
    settingRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: theme.spacing.md,
    },
    settingIcon: {
      marginRight: theme.spacing.lg,
    },
    textContainer: {
      flex: 1,
    },
    settingText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    settingSubtitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    settingRowRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingValue: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
    },
  });
