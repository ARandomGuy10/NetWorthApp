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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { useAccountDetails } from '@/hooks/useAccounts';
import { useBalances, useDeleteBalance } from '@/hooks/useBalances';
import { formatCurrency } from '@/utils/utils';
import { colors, spacing, borderRadius, shadows } from '@/src/styles/colors';
import ActionMenu, { Action } from '@/components/ui/ActionMenu';
import type { Balance } from '@/lib/supabase';

/* ───────────────── helper colour decisions ───────────────── */
const cardBG  = colors.background.elevated;   // lifted a shade above page BG
const txtMain = colors.text.primary;          // white
const txtSub  = colors.text.secondary;        // light-grey

export default function AccountDetailScreen() {
  /* ───────── nav / params ───────── */
  const { id }       = useLocalSearchParams();
  const insets       = useSafeAreaInsets();
  const router       = useRouter();

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
        <ActivityIndicator size="large" color={colors.primary} />
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
          params: { accountId: id, balanceId: selectedBal.id, mode: 'edit' },
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
        <TouchableOpacity style={styles.hBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={txtMain} />
        </TouchableOpacity>
        <Text style={styles.hTitle} numberOfLines={1}>{account.name}</Text>
        <TouchableOpacity
          style={styles.hBtn}
          onPress={() =>
            router.push({
              pathname: 'accounts/add-account',
              params: { accountId: id, mode: 'edit', accountData: JSON.stringify(account) },
            })
          }
        >
          <Ionicons name="create-outline" size={20} color={txtMain} />
        </TouchableOpacity>
      </View>

      {/* ───── Body ───── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scContent}
        refreshControl={
          <RefreshControl
            refreshing={Boolean(isFetching && !balLoading)}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Summary card */}
        <Animated.View style={[styles.card, { opacity: fade, backgroundColor: cardBG }]}>
          <View style={styles.cardRow}>
            <View style={styles.iconWrap}>
              <Ionicons name={iconFor(account.category)} size={24} color={colors.text.inverse} />
            </View>
            <View style={styles.meta}>
              <Text style={[styles.metaName, { color: txtMain }]}>{account.name}</Text>
              <Text style={[styles.metaSub,  { color: txtSub  }]}>
                {account.type === 'asset' ? 'Asset' : 'Liability'} · {account.category}
              </Text>
            </View>
          </View>

          <Text style={[styles.balanceLabel, { color: txtSub }]}>Current Balance</Text>
          <Text
            style={[
              styles.balanceValue,
              account.type === 'liability'
                ? { color: colors.liability }
                : { color: colors.asset },
            ]}
          >
            {account.type === 'liability' ? '-' : ''}
            {formatCurrency(currentBal, account.currency)}
          </Text>
        </Animated.View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={() =>
            router.push({ pathname: 'accounts/add-balance', params: { accountId: id } })
          }
        >
          <Ionicons name="add" size={18} color={colors.text.inverse} />
          <Text style={styles.ctaTxt}>Record New Balance</Text>
        </TouchableOpacity>

        {/* History header */}
        <Text style={[styles.sectionHdr, { color: txtMain }]}>Balance History</Text>

        {/* History list */}
        {(!balances || balances.length === 0) ? (
          <View style={styles.empty}>
            <Ionicons
              name="time-outline"
              size={36}
              color={colors.text.tertiary}
              style={{ marginBottom: spacing.lg }}
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
              style={styles.item}
              activeOpacity={0.7}
              onPress={e => handleBalanceMenu(b, e)}
            >
              <View>
                <Text style={styles.itemDate}>{formatDate(b.date)}</Text>
                {b.notes && <Text style={styles.itemNotes}>{b.notes}</Text>}
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemAmt}>{formatCurrency(b.amount, account.currency)}</Text>
                <Ionicons name="ellipsis-horizontal" size={18} color={colors.text.secondary} />
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

/* ─────────────────────────── Styles ─────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  loadingText: { marginTop: spacing.lg, fontSize: 16, color: colors.text.secondary },
  errorText:   { fontSize: 16, color: colors.error, marginBottom: spacing.lg },

  backBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backTxt: { color: colors.text.inverse, fontWeight: '600' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  hBtn:   { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: txtMain },

  /* ScrollView */
  scContent: { paddingBottom: spacing.xxxl },

  /* Summary card */
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    ...shadows.md,
  },
  cardRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: spacing.lg,
  },
  meta:      { flex: 1 },
  metaName:  { fontSize: 18, fontWeight: '600' },
  metaSub:   { fontSize: 13 },
  balanceLabel: { fontSize: 14, textAlign: 'center', marginBottom: spacing.xs },
  balanceValue: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },

  /* CTA */
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  ctaTxt: { color: colors.text.inverse, fontSize: 15, fontWeight: '700', marginLeft: spacing.sm },

  /* Section header */
  sectionHdr: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  /* Empty state */
  empty:      { alignItems: 'center', padding: spacing.xxl },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: txtMain, marginTop: spacing.lg },
  emptySub:   { fontSize: 14, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs },

  /* History item */
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  itemDate:  { fontSize: 15, fontWeight: '600', color: colors.text.primary },
  itemNotes: { fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemAmt:   { fontSize: 15, fontWeight: 'bold', color: colors.text.primary, marginRight: spacing.sm },
});
