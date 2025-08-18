// app/(tabs)/accounts/[id].tsx
// ────────────────────────────────────────────────────────────────────────────
// Account-detail screen for PocketRackr
// fully adapted for the single dark theme defined in src/styles/colors.ts
// ────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAccountDetails } from '@/hooks/useAccounts';
import { useBalances, useDeleteBalance } from '@/hooks/useBalances';
import { formatCurrency } from '@/utils/utils';
import ActionMenu, { Action } from '@/components/ui/ActionMenu';
import type { Balance } from '@/lib/supabase';
import { useTheme } from '@/src/styles/theme/ThemeContext';
import { Theme } from '@/lib/supabase';


  export default function AccountDetailScreen() {
  /* ───────── nav / params ───────── */
  const { id }       = useLocalSearchParams();
  const insets       = useSafeAreaInsets();
  const router       = useRouter();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  /* ───────── queries ───────── */
  const { data: account,   isLoading: accLoading } = useAccountDetails(id as string);
  const { data: balances,  isLoading: balLoading, refetch, isFetching } = useBalances(id as string);
  const deleteBalance = useDeleteBalance();

  /* ───────── local state ───────── */
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBal, setSelectedBal] = useState<Balance | null>(null);
  const [menuPos,     setMenuPos]     = useState({ x: 0, y: 0 });

  /* ───────── fade-in anim ───────── */
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  /* ───────── utilities ───────── */
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const iconFor = (cat: string): keyof typeof Ionicons.glyphMap => {
    const m: Record<string, keyof typeof Ionicons.glyphMap> = {
      Cash: 'cash-outline',
      Checking: 'card-outline',
      Savings: 'wallet-outline',
      Investment: 'trending-up-outline',
      Retirement: 'shield-outline',
      'Real Estate': 'home-outline',
      Vehicle: 'car-outline',
      'Credit Card': 'card-outline',
      'Personal Loan': 'document-text-outline',
      Mortgage: 'home-outline',
      'Auto Loan': 'car-outline',
      'Student Loan': 'school-outline',
    };
    return m[cat] ?? 'ellipse-outline';
  };

  /* ───────── refresh ───────── */
  const onRefresh = () => refetch();

  /* ───────── menu placement (clamped) ───────── */
  const handleBalanceMenu = (balance: Balance, e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { pageY } = e.nativeEvent;
    setSelectedBal(balance);
    setMenuPos({ x: 0, y: pageY });   // that’s it
    setMenuVisible(true);
  };

  /* ───────── derived data ───────── */
  const currentBal = balances?.[0]?.amount ?? 0;

  /* ───────── loading / error states ───────── */
  if (accLoading || balLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading account…</Text>
      </View>
    );
  }

  if (!account) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Account not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backTxt}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ───────── action-menu actions ───────── */
  const actions: Action[] = [
    {
      title: 'Edit entry',
      icon: 'create-outline',
      onPress: () => {
        if (!selectedBal) return;
        router.push({
          pathname: 'accounts/add-balance',
          params: { accountId: id, balanceId: selectedBal.id, mode: 'edit', balanceData: JSON.stringify(selectedBal) },
        });
        setMenuVisible(false);
      },
    },
    {
      title: 'Delete entry',
      icon: 'trash-outline',
      destructive: true,
      onPress: async () => {
        if (!selectedBal) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await deleteBalance.mutate({ id: selectedBal.id, account_id: id as string });
        setMenuVisible(false);
      },
    },
  ];

  /* ───────── render ───────── */
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ───── Header ───── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hBtn} onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.hTitle} numberOfLines={1}>{account.name}</Text>
        <TouchableOpacity
          style={styles.hBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({
              pathname: 'accounts/add-account',
              params: { accountId: id, mode: 'edit', accountData: JSON.stringify(account) },
            })
          }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="create-outline" size={20} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* ───── Body ───── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(isFetching && !balLoading)}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Summary card */}
        <Animated.View style={[styles.cardWrapper, { opacity: fade }]}>
          <LinearGradient 
            colors={[`${theme.colors.primary}1A`, theme.colors.background.card]} 
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.iconWrap}>
                <Ionicons name={iconFor(account.category)} size={24} color={theme.colors.text.inverse} />
              </View>
              <View style={styles.meta}>
                <Text style={[styles.metaName, { color: theme.colors.text.primary }]}>{account.name}</Text>
                <Text style={[styles.metaSub,  { color: theme.colors.text.secondary  }]}>
                  {account.type === 'asset' ? 'Asset' : 'Liability'} · {account.category}
                </Text>
              </View>
            </View>

            <Text style={[styles.balanceLabel, { color: theme.colors.text.secondary }]}>Current Balance</Text>
            <Text
              style={[
                styles.balanceValue,
                account.type === 'liability'
                  ? { color: theme.colors.liability }
                  : { color: theme.colors.asset },
              ]}
            >
              {account.type === 'liability' ? '-' : ''}
              {formatCurrency(currentBal, account.currency)}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push({ pathname: 'accounts/add-balance', params: { accountId: id } });
          }}
        >
          <Ionicons name="add" size={18} color={theme.colors.text.inverse} />
          <Text style={styles.ctaTxt}>Record New Balance</Text>
        </TouchableOpacity>

        {/* History header */}
        <Text style={[styles.sectionHdr, { color: theme.colors.text.primary }]}>Balance History</Text>

        {/* History list */}
        {(!balances || balances.length === 0) ? (
          <View style={styles.empty}>
            <Ionicons
              name="time-outline"
              size={36}
              color={theme.colors.text.tertiary}
              style={{ marginBottom: theme.spacing.lg }}
            />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySub}>
              Record your first balance to start tracking this account.
            </Text>
          </View>
        ) : (
          balances.map(b => (
            <TouchableOpacity
              key={b.id}
              style={styles.itemCard}
              activeOpacity={0.7}
              onPress={e => handleBalanceMenu(b, e)}
            >
              <View>
                <Text style={styles.itemDate}>{formatDate(b.date)}</Text>
                {b.notes && <Text style={styles.itemNotes}>{b.notes}</Text>}
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemAmt}>{formatCurrency(b.amount, account.currency)}</Text>
                <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.text.secondary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Action-menu */}
      <ActionMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        actions={actions}
        anchorPosition={menuPos}
      />
    </View>
  );
}

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  loadingText: { marginTop: theme.spacing.lg, fontSize: 16, color: theme.colors.text.secondary },
  errorText:   { fontSize: 16, color: theme.colors.error, marginBottom: theme.spacing.lg },

  backBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  backTxt: { color: theme.colors.text.inverse, fontWeight: '600' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  hBtn:   { 
    width: 44, 
    height: 44, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  hTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: theme.colors.text.primary },

  /* ScrollView */
  scrollContent: { paddingBottom: theme.spacing.xxxl },

  /* Summary card */
  cardWrapper: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },

  cardRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  meta:      { flex: 1 },
  metaName:  { fontSize: 18, fontWeight: '600' },
  metaSub:   { fontSize: 13 },
  balanceLabel: { fontSize: 14, textAlign: 'center', marginBottom: theme.spacing.xs },
  balanceValue: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },

  /* CTA */
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  ctaTxt: { color: theme.colors.text.inverse, fontSize: 15, fontWeight: '700', marginLeft: theme.spacing.sm },

  /* Section header */
  sectionHdr: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },

  /* Empty state */
  empty:      { alignItems: 'center', padding: theme.spacing.xxxl, marginTop: theme.spacing.xl },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text.primary, marginTop: theme.spacing.lg },
  emptySub:   { fontSize: 14, color: theme.colors.text.secondary, textAlign: 'center', marginTop: theme.spacing.xs },

  /* History item */
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  itemDate:  { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary },
  itemNotes: { fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemAmt:   { fontSize: 15, fontWeight: 'bold', color: theme.colors.text.primary, marginRight: theme.spacing.sm },
});
