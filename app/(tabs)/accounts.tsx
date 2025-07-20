import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Settings, ChevronDown, ChevronRight, Building, TrendingUp, Plus } from 'lucide-react-native';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../services/supabase';
import { router } from 'expo-router';

interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability';
  category: string;
  institution: string;
}

export default function Accounts() {
  const { user } = useUser();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assetsExpanded, setAssetsExpanded] = useState(true);
  const [liabilitiesExpanded, setLiabilitiesExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Error', 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const assets = accounts.filter(a => a.type === 'asset');
  const liabilities = accounts.filter(a => a.type === 'liability');

  // Mock data for display - in real app, would fetch latest balance entries
  const totalAssets = 152340.56;
  const totalLiabilities = 28883.78;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cash':
        return <Building size={24} color="#4FD1C7" />;
      case 'investments':
        return <TrendingUp size={24} color="#4FD1C7" />;
      default:
        return <Building size={24} color="#4FD1C7" />;
    }
  };

  const handleAccountPress = (account: Account) => {
    router.push(`/account-detail?id=${account.id}`);
  };

  const handleAddAccount = () => {
    router.push('/add-account');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>PocketRackr</Text>
            <Text style={styles.pageTitle}>My Accounts</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Assets Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setAssetsExpanded(!assetsExpanded)}
          >
            <Text style={styles.sectionTitle}>Assets</Text>
            <View style={styles.sectionRight}>
              <Text style={styles.sectionTotal}>{formatCurrency(totalAssets)}</Text>
              {assetsExpanded ? (
                <ChevronDown size={20} color="#9CA3AF" />
              ) : (
                <ChevronRight size={20} color="#9CA3AF" />
              )}
            </View>
          </TouchableOpacity>

          {assetsExpanded && (
            <View style={styles.accountsList}>
              {/* Cash Summary */}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Cash</Text>
                <Text style={styles.categoryAmount}>{formatCurrency(54340.56)}</Text>
              </View>

              {/* Cash Accounts */}
              <TouchableOpacity style={styles.accountCard} onPress={() => handleAccountPress(assets[0])}>
                <View style={styles.accountLeft}>
                  <View style={styles.accountIcon}>
                    <Building size={20} color="#4FD1C7" />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>Checking Account</Text>
                    <Text style={styles.accountInstitution}>Chase Bank</Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={styles.accountBalance}>{formatCurrency(8450.23)}</Text>
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.accountCard} onPress={() => handleAccountPress(assets[1])}>
                <View style={styles.accountLeft}>
                  <View style={styles.accountIcon}>
                    <Building size={20} color="#4FD1C7" />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>High Yield Savings</Text>
                    <Text style={styles.accountInstitution}>Marcus by Goldman Sachs</Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={styles.accountBalance}>{formatCurrency(45890.33)}</Text>
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              {/* Investments Summary */}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Investments</Text>
                <Text style={styles.categoryAmount}>{formatCurrency(98000.00)}</Text>
              </View>

              {/* Investment Accounts */}
              <TouchableOpacity style={styles.accountCard} onPress={() => handleAccountPress(assets[2])}>
                <View style={styles.accountLeft}>
                  <View style={styles.accountIcon}>
                    <TrendingUp size={20} color="#4FD1C7" />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>Investment Portfolio</Text>
                    <Text style={styles.accountInstitution}>Vanguard</Text>
                  </View>
                </View>
                <View style={styles.accountRight}>
                  <Text style={styles.accountBalance}>{formatCurrency(98000.00)}</Text>
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Liabilities Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setLiabilitiesExpanded(!liabilitiesExpanded)}
          >
            <Text style={styles.sectionTitle}>Liabilities</Text>
            <View style={styles.sectionRight}>
              <Text style={[styles.sectionTotal, styles.liabilityAmount]}>-{formatCurrency(totalLiabilities)}</Text>
              {liabilitiesExpanded ? (
                <ChevronDown size={20} color="#9CA3AF" />
              ) : (
                <ChevronRight size={20} color="#9CA3AF" />
              )}
            </View>
          </TouchableOpacity>

          {liabilitiesExpanded && (
            <View style={styles.accountsList}>
              {/* Credit Cards Summary */}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Credit Cards</Text>
                <Text style={[styles.categoryAmount, styles.liabilityAmount]}>-{formatCurrency(3840.45)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Add Account Button */}
        <TouchableOpacity style={styles.addAccountButton} onPress={handleAddAccount}>
          <Plus size={24} color="#111827" />
          <Text style={styles.addAccountText}>Add New Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  settingsButton: {
    padding: 8,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  liabilityAmount: {
    color: '#EF4444',
  },
  accountsList: {
    gap: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  categoryLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  accountCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  accountInstitution: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  accountRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  addAccountButton: {
    backgroundColor: '#4FD1C7',
    marginHorizontal: 24,
    marginVertical: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addAccountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
});