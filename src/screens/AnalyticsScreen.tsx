import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const G = {
  primary: '#1A7A35',
  surface: '#F2FAF5',
  border: '#C8E6C9',
  text: '#0D1B0F',
  sub: '#7A9E80',
  white: '#fff',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  error: '#F44336',
};

// Mock data
const monthlyGrowth = [
  { month: 'Jan', farmers: 120, merchants: 45, transactions: 850 },
  { month: 'Feb', farmers: 180, merchants: 68, transactions: 1200 },
  { month: 'Mar', farmers: 250, merchants: 95, transactions: 1800 },
  { month: 'Apr', farmers: 340, merchants: 128, transactions: 2400 },
  { month: 'May', farmers: 480, merchants: 175, transactions: 3200 },
  { month: 'Jun', farmers: 650, merchants: 235, transactions: 4500 },
];

const categoryDistribution = [
  { category: 'Grains', percentage: 35, value: 15000, color: '#FF9800' },
  { category: 'Vegetables', percentage: 28, value: 12000, color: '#4CAF50' },
  { category: 'Fruits', percentage: 18, value: 7800, color: '#F44336' },
  { category: 'Legumes', percentage: 12, value: 5200, color: '#2196F3' },
  { category: 'Oilseeds', percentage: 7, value: 3000, color: '#9C27B0' },
];

const regionalData = [
  { region: 'Oromia', farmers: 850, volume: 12500, growth: '+24%' },
  { region: 'Amhara', farmers: 620, volume: 9800, growth: '+18%' },
  { region: 'SNNPR', farmers: 480, volume: 7200, growth: '+32%' },
  { region: 'Tigray', farmers: 290, volume: 4100, growth: '+15%' },
  { region: 'Somali', farmers: 180, volume: 2400, growth: '+28%' },
];

const stats = [
  { label: 'Total Farmers', value: '2,500+', change: '+24%', icon: 'people', color: '#2196F3' },
  { label: 'Active Merchants', value: '680+', change: '+18%', icon: 'storefront', color: '#4CAF50' },
  { label: 'Monthly Transactions', value: '4,500+', change: '+32%', icon: 'swap-horizontal', color: '#9C27B0' },
  { label: 'Total Volume', value: '50M+', change: '+28%', icon: 'cash', color: '#FF9800' },
];

const insights = [
  {
    title: 'Rapid Growth',
    description: 'Platform adoption increasing 30% month-over-month',
    icon: 'trending-up',
    iconColor: '#2196F3',
  },
  {
    title: 'Diverse Categories',
    description: 'Balanced mix across all agricultural product types',
    icon: 'grid',
    iconColor: '#4CAF50',
  },
  {
    title: 'High Activity',
    description: 'Strong engagement from all user segments',
    icon: 'pulse',
    iconColor: '#9C27B0',
  },
];

export default function AnalyticsScreen() {
  const maxValue = Math.max(...monthlyGrowth.map(d => Math.max(d.farmers, d.merchants, d.transactions / 10)));

  const renderStatCard = (stat: typeof stats[0]) => (
    <View key={stat.label} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
        <Ionicons name={stat.icon as any} size={24} color={stat.color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
      </View>
      <View style={styles.changeBadge}>
        <Text style={styles.changeText}>{stat.change}</Text>
      </View>
    </View>
  );

  const renderGrowthChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Growth Trends</Text>
      <Text style={styles.chartSubtitle}>User acquisition and transaction volume</Text>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Farmers</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Merchants</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
          <Text style={styles.legendText}>Transactions (÷10)</Text>
        </View>
      </View>

      <View style={styles.chartBars}>
        {monthlyGrowth.map((data) => (
          <View key={data.month} style={styles.chartColumn}>
            <View style={styles.chartBarsGroup}>
              <View
                style={[
                  styles.chartBar,
                  { backgroundColor: '#2196F3' },
                  { height: `${(data.farmers / maxValue) * 100}%` }
                ]}
              />
              <View
                style={[
                  styles.chartBar,
                  { backgroundColor: '#4CAF50' },
                  { height: `${(data.merchants / maxValue) * 100}%` }
                ]}
              />
              <View
                style={[
                  styles.chartBar,
                  { backgroundColor: '#9C27B0' },
                  { height: `${(data.transactions / 10 / maxValue) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.chartLabel}>{data.month}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCategoryDistribution = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Category Distribution</Text>
      <Text style={styles.chartSubtitle}>Product mix across marketplace</Text>
      
      <View style={styles.categoryList}>
        {categoryDistribution.map((category) => (
          <View key={category.category} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{category.category}</Text>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
            <View style={styles.categoryProgress}>
              <View
                style={[
                  styles.categoryProgressFill,
                  { backgroundColor: category.color, width: `${category.percentage}%` }
                ]}
              />
            </View>
            <Text style={styles.categoryValue}>{category.value.toLocaleString()} ETB</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRegionalData = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Regional Performance</Text>
      <Text style={styles.chartSubtitle}>Distribution across Ethiopian regions</Text>
      
      <View style={styles.regionalList}>
        {regionalData.map((region, index) => (
          <View key={region.region} style={styles.regionalItem}>
            <View style={styles.regionalRank}>
              <Text style={styles.regionalRankText}>{index + 1}</Text>
            </View>
            <View style={styles.regionalContent}>
              <View style={styles.regionalHeader}>
                <Text style={styles.regionName}>{region.region}</Text>
                <Text style={styles.regionalGrowth}>{region.growth}</Text>
              </View>
              <View style={styles.regionalStats}>
                <Text style={styles.regionalStat}>
                  {region.farmers} farmers
                </Text>
                <Text style={styles.regionalStat}>•</Text>
                <Text style={styles.regionalStat}>
                  {region.volume.toLocaleString()} volume
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.insightsContainer}>
      <Text style={styles.sectionTitle}>Key Insights</Text>
      <View style={styles.insightsList}>
        {insights.map((insight) => (
          <View key={insight.title} style={styles.insightCard}>
            <View style={[styles.insightIcon, { backgroundColor: insight.iconColor + '20' }]}>
              <Ionicons name={insight.icon as any} size={24} color={insight.iconColor} />
            </View>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="bar-chart" size={32} color={G.success} />
            <Text style={styles.title}>Analytics</Text>
          </View>
          <Text style={styles.subtitle}>
            Real-time insights into FarmConnect performance
          </Text>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          {stats.map(renderStatCard)}
        </View>

        {/* Growth Chart */}
        {renderGrowthChart()}

        {/* Category Distribution */}
        {renderCategoryDistribution()}

        {/* Regional Data */}
        {renderRegionalData()}

        {/* Insights */}
        {renderInsights()}
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: G.text,
  },
  subtitle: {
    fontSize: 14,
    color: G.sub,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    width: (width - 52) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statContent: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: G.text,
  },
  statLabel: {
    fontSize: 12,
    color: G.sub,
    marginTop: 2,
  },
  changeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  chartContainer: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 20,
    margin: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: G.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: G.sub,
    marginBottom: 20,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: G.sub,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarsGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
    height: '100%',
    width: '100%',
  },
  chartBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 11,
    color: G.sub,
    marginTop: 8,
    textAlign: 'center',
  },
  categoryList: {
    gap: 16,
  },
  categoryItem: {
    gap: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: G.text,
  },
  categoryProgress: {
    height: 6,
    backgroundColor: G.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryValue: {
    fontSize: 12,
    color: G.sub,
    marginTop: 4,
  },
  regionalList: {
    gap: 12,
  },
  regionalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regionalRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: G.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regionalRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: G.white,
  },
  regionalContent: {
    flex: 1,
  },
  regionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  regionName: {
    fontSize: 14,
    fontWeight: '600',
    color: G.text,
  },
  regionalGrowth: {
    fontSize: 12,
    fontWeight: '700',
    color: G.success,
  },
  regionalStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  regionalStat: {
    fontSize: 12,
    color: G.sub,
  },
  insightsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: G.text,
    marginBottom: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    backgroundColor: G.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: G.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 13,
    color: G.sub,
    lineHeight: 18,
    flex: 1,
  },
});
