// components/ui/CustomBottomTabBar.tsx
import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/styles/colors';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 70; // Height of the tab bar
const ICON_SIZE = 26;

type RouteNames = 'dashboard' | 'accounts' | 'analytics' | 'profile';

// ✅ Fixed: Changed 'home' to 'dashboard' to match your route name
const ICONS: Record<RouteNames, keyof typeof Ionicons.glyphMap> = {
  dashboard: 'home',  // This was the main fix needed
  accounts: 'wallet',
  analytics: 'pie-chart',
  profile: 'person',
};

interface TabBarButtonProps {
  route: { name: string; key: string };
  isFocused: boolean;
  onPress: () => void;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({ route, isFocused, onPress }) => {
  const routeName = route.name as RouteNames;
  const iconName = isFocused ? ICONS[routeName] : `${ICONS[routeName]}-outline` as keyof typeof Ionicons.glyphMap;
  const iconColor = isFocused ? colors.text.primary : colors.text.secondary; // White for active, secondary for inactive
  const scale = React.useRef(new Animated.Value(1)).current; // For subtle scale animation

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isFocused ? 1.1 : 1, // Slightly scale up when focused
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <TouchableOpacity
      key={route.key}
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={1}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={iconName} size={ICON_SIZE} color={iconColor} />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function CustomBottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, height: TAB_HEIGHT + insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TabBarButton
            key={route.key}
            route={route}
            isFocused={isFocused}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

// ✅ Your original styles preserved exactly
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.navBarBackground, // Use new color constant
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});
