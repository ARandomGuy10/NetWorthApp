import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryArea, 
  VictoryAxis,
  VictoryContainer,
  VictoryTooltip,
  VictoryScatter
} from 'victory-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { useNetWorthHistory } from '@/hooks/useNetWorthHistory';
import { formatCurrency } from '@/utils/utils';

const { width: screenWidth } = Dimensions.get('window');

const ranges = [
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '12M' },
  { label: 'All', value: 'ALL' },
];

function hexToRgb(hex: string): [number, number, number] {
  const s = hex.replace('#', '');
  const full = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

const makeGradientColors = (theme: any): [string, string, string] => {
  const c1 = theme.colors.background.primary || '#0B1020';
  const c2 = theme.colors.background.secondary || c1;
  const c3 = theme.colors.background.tertiary || c2;
  return [c1, c2, c3];
};

const IntegratedDashboard_Victory: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { data: profile } = useProfile();
  const [range, setRange] = useState<'1M' | '3M' | '6M' | '12M' | 'ALL'>('3M');
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });
  
  const { data, isLoading, error } = useNetWorthHistory({ period: range });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const getInitials = () => {
    const firstName = profile?.first_name?.charAt(0)?.toUpperCase() || '';
    const lastName = profile?.last_name?.charAt(0)?.toUpperCase() || '';
    return firstName + lastName || 'U';
  };

  const prepared = useMemo(() => {
    const empty = { chartData: [], latest: 0, first: 0, delta: 0, pct: 0, currency: 'EUR' };
    if (!data || !data.data || !data.data.length) return empty;

    let raw = [];
    const all = data.data;
    const slice = (n: number) => n === -1 ? all : all.slice(-n);
    
    switch (range) {
      case '1M': raw = slice(30); break;
      case '3M': raw = slice(90); break;
      case '6M': raw = slice(180); break;
      case '12M': raw = slice(365); break;
      case 'ALL': raw = slice(-1); break;
      default: raw = slice(30);
    }

    // Filter consecutive duplicates to avoid flat lines
    const filtered = [];
    for (let i = 0; i < raw.length; i++) {
      if (i === 0 || raw[i].net_worth !== raw[i - 1].net_worth) {
        filtered.push(raw[i]);
      }
    }

    // Enhanced data processing for edge-to-edge coverage
    let dataPoints = filtered.map((d, i) => ({ 
      x: i, 
      y: d.net_worth, 
      label: new Date(d.date).toLocaleDateString('en', { month: 'short' }),
      date: d.date
    }));

    // Ensure smooth edge-to-edge curves with proper padding
    if (dataPoints.length > 0 && dataPoints.length < 8) {
      const first = dataPoints[0];
      const last = dataPoints[dataPoints.length - 1];
      
      // Add smooth interpolation points at edges
      const extendedData = [
        { ...first, x: -2, label: '' },
        { ...first, x: -1, label: '' },
        ...dataPoints,
        { ...last, x: dataPoints.length, label: '' },
        { ...last, x: dataPoints.length + 1, label: '' }
      ];
      
      dataPoints = extendedData;
    }

    const values = dataPoints.map(p => p.y);
    const latestVal = values[values.length - 1];
    const firstVal = values[0];
    const delta = latestVal - firstVal;
    const pct = firstVal !== 0 ? (delta / Math.abs(firstVal)) * 100 : 0;

    return {
      chartData: dataPoints,
      latest: latestVal,
      first: firstVal,
      delta,
      pct,
      currency: data.currency || 'EUR',
    };
  }, [data, range]);

  const lineColor = theme.colors.asset || theme.colors.primary || '#22c55e';
  const [lr, lg, lb] = hexToRgb(lineColor);
  const areaColor = `rgba(${lr}, ${lg}, ${lb}, 0.15)`;

  // Enhanced tick calculation for clean x-axis
  const getTicks = () => {
    const len = prepared.chartData.length;
    if (len <= 6) return prepared.chartData.map(p => p.x);
    
    const numberOfTicks = 5;
    const step = Math.floor(len / (numberOfTicks - 1));
    const ticks = [];
    for (let i = 0; i < len; i += step) {
      ticks.push(i);
    }
    if (ticks[ticks.length - 1] !== len - 1) {
      ticks.push(len - 1);
    }
    return ticks;
  };

  const formatTick = (tick: number) => {
    const point = prepared.chartData[tick];
    return point ? point.label : '';
  };

  // Handle chart interactions
  const handleDataPointPress = useCallback((event: any, data: any) => {
    setTooltipData({
      x: data.x,
      y: data.y,
      visible: true
    });
    
    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setTooltipData(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const styles = getStyles(theme);

  if (isLoading || error || prepared.chartData.length === 0) {
    return (
      <LinearGradient colors={makeGradientColors(theme)} style={styles.loadingContainer}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}> 
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingText, { color: theme.colors.text.secondary }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {profile?.first_name ?? 'User'} 👋
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.notificationButton, { backgroundColor: theme.colors.background.secondary }]} 
            onPress={() => console.log('Notifications pressed')}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.text.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.placeholderText, { color: theme.colors.text.primary }]}>
          {error ? 'Unable to load data' : 'Add assets to start tracking'}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient 
      colors={makeGradientColors(theme)} 
      style={styles.container} 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }}
    >
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarContainer}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}> 
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingText, { color: theme.colors.text.secondary }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            {profile?.first_name ?? 'User'} 👋
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.notificationButton, { backgroundColor: theme.colors.background.secondary }]} 
          onPress={() => console.log('Notifications pressed')}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.colors.text.primary} />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Centered Net Worth Display */}
      <View style={styles.netWorthContainer}>
        <Text style={[styles.netWorthText, { color: theme.colors.text.primary }]}>
          {formatCurrency(prepared.latest, prepared.currency)}
        </Text>
        <View style={[
          styles.netWorthChangeContainer, 
          { backgroundColor: prepared.delta >= 0 ? areaColor : '#ef444425' }
        ]}> 
          <Text style={[
            styles.netWorthChangeText, 
            { color: prepared.delta >= 0 ? lineColor : '#ef4444' }
          ]}> 
            {prepared.delta >= 0 ? '+' : ''}{formatCurrency(prepared.delta, prepared.currency)} ({prepared.pct.toFixed(1)}%)
          </Text>
        </View>
      </View>

      {/* Enhanced Chart Section with Full Width */}
      <View style={styles.chartContainer}>
        <VictoryChart
          width={screenWidth}
          height={220}
          padding={{ top: 20, bottom: 40, left: 0, right: 0 }}
          domainPadding={{ x: 0 }}
          containerComponent={<VictoryContainer responsive={false} />}
        >
          {/* Smooth area fill with gradient effect */}
          <VictoryArea
            interpolation="catmullRom"
            data={prepared.chartData}
            x="x"
            y="y"
            style={{ 
              data: { 
                fill: areaColor,
                fillOpacity: 1,
                stroke: "none"
              } 
            }}
            animate={{
              duration: 1200,
              onLoad: { duration: 800 }
            }}
          />
          
          {/* Smooth main line with enhanced styling */}
          <VictoryLine
            interpolation="catmullRom"
            data={prepared.chartData}
            x="x"
            y="y"
            style={{ 
              data: { 
                stroke: lineColor, 
                strokeWidth: 3,
                strokeLinecap: 'round',
                strokeLinejoin: 'round'
              } 
            }}
            animate={{
              duration: 1200,
              onLoad: { duration: 800 }
            }}
          />
          
          {/* Interactive data points for tooltips */}
          <VictoryScatter
            data={prepared.chartData}
            x="x"
            y="y"
            size={6}
            style={{ 
              data: { 
                fill: lineColor,
                fillOpacity: 0,
                stroke: lineColor,
                strokeWidth: 0
              } 
            }}
            events={[{
              target: "data",
              eventHandlers: {
                onPress: (event, targetProps) => {
                  handleDataPointPress(event, targetProps.datum);
                  return [];
                }
              }
            }]}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ 
                  fill: theme.colors.background.secondary,
                  stroke: lineColor,
                  strokeWidth: 1 
                }}
                style={{ 
                  fill: theme.colors.text.primary,
                  fontSize: 12,
                  fontWeight: '600'
                }}
                constrainToVisibleArea
                pointerLength={5}
              />
            }
            labels={({ datum }) => `${formatCurrency(datum.y, prepared.currency)}`}
          />
          
          {/* Clean X-Axis with proper spacing */}
          <VictoryAxis
            dependentAxis={false}
            tickValues={getTicks()}
            tickFormat={formatTick}
            style={{
              axis: { stroke: "none" },
              tickLabels: { 
                fill: theme.colors.text.primary, 
                fontSize: 12, 
                opacity: 0.7, 
                fontWeight: '500' 
              },
              grid: { stroke: "none" },
              ticks: { stroke: "none" },
            }}
            fixLabelOverlap={true}
          />
          
          {/* Hidden Y-Axis */}
          <VictoryAxis
            dependentAxis
            style={{ 
              axis: { stroke: "none" }, 
              tickLabels: { fill: "none" }, 
              grid: { stroke: "none" }, 
              ticks: { stroke: "none" } 
            }}
          />
        </VictoryChart>
      </View>

      {/* Enhanced Period Selector */}
      <View style={styles.periodSelectorContainer}>
        {ranges.map((option) => {
          const selected = option.value === range;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.periodButton,
                { backgroundColor: theme.colors.background.secondary },
                selected && { 
                  backgroundColor: theme.colors.primary,
                  ...Platform.select({
                    ios: {
                      shadowColor: theme.colors.primary,
                      shadowOpacity: 0.25,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 }
                    },
                    android: { elevation: 6 }
                  })
                }
              ]}
              onPress={() => setRange(option.value as any)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.periodButtonText,
                { color: selected ? theme.colors.background.primary : theme.colors.text.secondary },
                selected && { fontWeight: '700' }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    width: screenWidth,
    paddingTop: 30,
    paddingBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 2,
  },
  userName: {
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF3B30',
  },
  netWorthContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  netWorthText: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
  },
  netWorthChangeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  netWorthChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  periodSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  periodButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { 
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.08, 
        shadowRadius: 6 
      },
      android: { elevation: 2 },
    }),
  },
  periodButtonText: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: -0.2,
  },
  loadingContainer: {
    width: screenWidth,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default IntegratedDashboard_Victory;
