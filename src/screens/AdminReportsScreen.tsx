import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Mock data
const balanceSheetData = [
  { month: 'January', opening: 150000, closing: 180000, transactions: 45 },
  { month: 'February', opening: 180000, closing: 220000, transactions: 52 },
  { month: 'March', opening: 220000, closing: 195000, transactions: 38 },
];

const profitLossData = [
  { month: 'January', revenue: 45000, expenses: 32000, profit: 13000 },
  { month: 'February', revenue: 52000, expenses: 28000, profit: 24000 },
  { month: 'March', revenue: 38000, expenses: 35000, profit: 3000 },
];

const cashFlowData = [
  { week: 'Week 1', inflow: 85000, outflow: 62000, net: 23000 },
  { week: 'Week 2', inflow: 92000, outflow: 71000, net: 21000 },
  { week: 'Week 3', inflow: 78000, outflow: 58000, net: 20000 },
  { week: 'Week 4', inflow: 88000, outflow: 65000, net: 23000 },
];

export default function AdminReportsScreen() {
  const [selectedTab, setSelectedTab] = useState<'balance' | 'profit' | 'cashflow'>('balance');

  const renderBalanceSheet = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Balance Sheet</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Month</Text>
          <Text style={styles.headerCell}>Opening</Text>
          <Text style={styles.headerCell}>Closing</Text>
          <Text style={styles.headerCell}>Transactions</Text>
        </View>
        
        {balanceSheetData.map((item, index) => (
          <View key={item.month} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
            <Text style={styles.cell}>{item.month}</Text>
            <Text style={styles.cell}>ETB {item.opening.toLocaleString()}</Text>
            <Text style={styles.cell}>ETB {item.closing.toLocaleString()}</Text>
            <Text style={styles.cell}>{item.transactions}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderProfitLoss = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profit & Loss Statement</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Month</Text>
          <Text style={styles.headerCell}>Revenue</Text>
          <Text style={styles.headerCell}>Expenses</Text>
          <Text style={styles.headerCell}>Profit</Text>
        </View>
        
        {profitLossData.map((item, index) => (
          <View key={item.month} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
            <Text style={styles.cell}>{item.month}</Text>
            <Text style={[styles.cell, item.profit >= 0 ? styles.positive : styles.negative]}>
              ETB {item.revenue.toLocaleString()}
            </Text>
            <Text style={[styles.cell, item.profit >= 0 ? styles.positive : styles.negative]}>
              ETB {item.expenses.toLocaleString()}
            </Text>
            <Text style={[styles.cell, styles.profit]}>
              ETB {item.profit.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCashFlow = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cash Flow Analysis</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.headerCell}>Period</Text>
          <Text style={styles.headerCell}>Inflow</Text>
          <Text style={styles.headerCell}>Outflow</Text>
          <Text style={styles.headerCell}>Net</Text>
        </View>
        
        {cashFlowData.map((item, index) => (
          <View key={item.week} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
            <Text style={styles.cell}>{item.week}</Text>
            <Text style={[styles.cell, styles.positive]}>
              ETB {item.inflow.toLocaleString()}
            </Text>
            <Text style={[styles.cell, styles.negative]}>
              ETB {item.outflow.toLocaleString()}
            </Text>
            <Text style={[styles.cell, item.net >= 0 ? styles.positive : styles.negative]}>
              ETB {item.net.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: G.success }]}>
          <Ionicons name="trending-up" size={24} color={G.white} />
        </View>
        <Text style={styles.summaryValue}>ETB 2.5M+</Text>
        <Text style={styles.summaryLabel}>Total Revenue</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: G.warning }]}>
          <Ionicons name="swap-horizontal" size={24} color={G.white} />
        </View>
        <Text style={styles.summaryValue}>18,500+</Text>
        <Text style={styles.summaryLabel}>Monthly Transactions</Text>
      </View>
      
      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: G.info }]}>
          <Ionicons name="people" size={24} color={G.white} />
        </View>
        <Text style={styles.summaryValue}>2,500+</Text>
        <Text style={styles.summaryLabel}>Active Users</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Reports</Text>
          <Text style={styles.subtitle}>
            Financial and operational insights for FarmConnect
          </Text>
        </View>

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {['balance', 'profit', 'cashflow'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === tab && styles.tabButtonActive
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[
                styles.tabButtonText,
                selectedTab === tab && styles.tabButtonTextActive
              ]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Report Content */}
        {selectedTab === 'balance' && renderBalanceSheet()}
        {selectedTab === 'profit' && renderProfitLoss()}
        {selectedTab === 'cashflow' && renderCashFlow()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: G.surface,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: G.text,
  },
  summaryLabel: {
    fontSize: 12,
    color: G.sub,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: G.white,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: G.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: G.sub,
  },
  tabButtonTextActive: {
    color: G.white,
  },
  section: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: G.text,
    marginBottom: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: G.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: G.surface,
    borderBottomWidth: 1,
    borderBottomColor: G.border,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: G.border,
  },
  tableRowEven: {
    backgroundColor: '#F8F9FA',
  },
  headerCell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
    borderRightWidth: 1,
    borderRightColor: G.border,
  },
  cell: {
    flex: 1,
    padding: 12,
    fontSize: 13,
    color: G.text,
    borderRightWidth: 1,
    borderRightColor: G.border,
  },
  positive: {
    color: G.success,
    fontWeight: '600',
  },
  negative: {
    color: G.error,
    fontWeight: '600',
  },
});
