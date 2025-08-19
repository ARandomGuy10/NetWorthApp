
import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '@/lib/supabase';

type SettingRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  value?: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  theme: Theme;
};

export const SettingRow = ({
  icon,
  text,
  value,
  onPress,
  isSwitch,
  switchValue,
  onSwitchChange,
  theme,
}: SettingRowProps) => {
  const styles = getStyles(theme);

  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={isSwitch}>
      <View style={styles.settingRowLeft}>
        <Ionicons name={icon} size={24} color={theme.colors.text.secondary} style={styles.settingIcon} />
        <Text style={styles.settingText}>{text}</Text>
      </View>
      <View style={styles.settingRowRight}>
        {isSwitch ? (
          <Switch value={switchValue} onValueChange={onSwitchChange} />
        ) : (
          <>
            {value && <Text style={styles.settingValue}>{value}</Text>}
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
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
    settingRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: theme.spacing.lg,
    },
    settingText: {
      fontSize: 16,
      color: theme.colors.text.primary,
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
