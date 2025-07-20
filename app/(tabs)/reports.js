import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const expenseData = [
  { id: '1', category: 'Food', amount: 215, date: 'Today' },
  { id: '2', category: 'Shopping', amount: 180, date: 'Yesterday' },
  { id: '3', category: 'Transport', amount: 120, date: 'Jul 17' },
  { id: '4', category: 'Bills', amount: 210, date: 'Jul 17' },
  { id: '5', category: 'Entertainment', amount: 95, date: 'Jul 16' },
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  
  const totalSpent = expenseData.reduce((sum, item) => sum + item.amount, 0);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spending Report</Text>
        <Text style={styles.headerSubtitle}>July 2023</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Spent</Text>
        <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
        <Text style={styles.summarySubtitle}>across {expenseData.length} transactions</Text>
      </View>
      
      <ScrollView style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        {expenseData.map((item) => (
          <View key={item.id} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <Text style={styles.expenseCategory}>{item.category}</Text>
              <Text style={styles.expenseDate}>{item.date}</Text>
            </View>
            <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  summaryTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summarySubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000000',
  },
  expenseItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
