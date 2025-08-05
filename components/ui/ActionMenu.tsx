import React, { JSX, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, borderRadius, shadows } from '@/src/styles/colors';

export interface Action {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

export interface Position { x: number; y: number; }

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: Action[];
  /** raw finger / anchor coordinates from the caller */
  anchorPosition?: Position;
}

/* ───────────────── component ───────────────── */
export default function ActionMenu({
  visible,
  onClose,
  actions = [],
  anchorPosition = { x: 0, y: 0 },
}: ActionMenuProps): JSX.Element | null {
  /* simple fade/scale anim */
  const fade  = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring (scale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.8, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  /* ────────────── positioning ────────────── */
  const { width: WIN_W, height: WIN_H } = Dimensions.get('window');
  const MENU_W  = 200;
  const MENU_H  = actions.length * 56 + 16;   // 56-row + 8 padding top/bot
  const MARGIN  = 16;                         // horizontal “safe” margin

  /* right-align the menu by default */
  let left = anchorPosition.x === 0
    ? WIN_W - MENU_W - MARGIN              // caller passed x = 0 → assume row-left
    : anchorPosition.x + MENU_W > WIN_W - MARGIN
        ? anchorPosition.x - MENU_W - 10   // too little space on the right → flip left
        : anchorPosition.x + 10;           // open to the right

  /* vertical placement: below anchor unless it would clip */
  let top  = anchorPosition.y + MENU_H > WIN_H - insets.bottom - MARGIN
    ? anchorPosition.y - MENU_H - 10
    : anchorPosition.y;

  /* final clamping to safe-area */
  left = Math.max(MARGIN, Math.min(left, WIN_W - MENU_W - MARGIN));
  top  = Math.max(insets.top + MARGIN, Math.min(top, WIN_H - MENU_H - insets.bottom - MARGIN));

  /* ────────────── render ────────────── */
  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[
            styles.menu,
            {
              left, top,
              opacity: fade,
              transform: [{ scale }],
            },
          ]}
        >
          {actions.map((a, i) => {
            const last = i === actions.length - 1;
            return (
              <TouchableOpacity
                key={a.title}
                style={[
                  styles.menuItem,
                  last && styles.lastMenuItem,
                  a.destructive && styles.destructiveMenuItem,
                ]}
                activeOpacity={0.6}
                onPress={() => {
                  onClose();
                  a.onPress();
                }}
              >
                {a.icon && (
                  <Ionicons
                    name={a.icon}
                    size={18}
                    color={a.destructive ? colors.error : colors.text.primary}
                    style={styles.menuIcon}
                  />
                )}
                <Text
                  style={[
                    styles.menuText,
                    a.destructive && styles.destructiveText,
                  ]}
                >
                  {a.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

/* ───────────────── styles ───────────────── */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    minWidth: 200,
    ...shadows.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
    minHeight: 56,
  },
  lastMenuItem: { borderBottomWidth: 0 },
  destructiveMenuItem: { backgroundColor: 'rgba(255,59,48,0.06)' },
  menuIcon: { marginRight: spacing.md },
  menuText: { fontSize: 15, color: colors.text.primary, fontWeight: '500', flex: 1 },
  destructiveText: { color: colors.error },
});
